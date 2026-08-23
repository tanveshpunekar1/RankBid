import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUrlOrHandle, resolveUrlRedirect } from "@/lib/url-normalizer";
import { validateListingSafety } from "@/lib/moderation";
import { createPaymentOrder, isRazorpayConfigured } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url_or_handle,
      title,
      description,
      category_slug,
      phone,
      bid_amount_inr,
    } = body;

    // 1. Basic field presence
    if (!url_or_handle || !title || !phone || !bid_amount_inr) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (URL/handle, title, phone, or bid amount)" },
        { status: 400 }
      );
    }

    // 2. Validate phone number
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number" },
        { status: 400 }
      );
    }
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    // 3. Validate Safety & Disallowed content
    const safety = validateListingSafety(url_or_handle, title, description);
    if (!safety.allowed) {
      return NextResponse.json(
        { success: false, moderationBlocked: true, error: safety.reason },
        { status: 422 }
      );
    }

    // 4. Normalize URL / Handle
    const resolved = await resolveUrlRedirect(url_or_handle);
    const normalized = normalizeUrlOrHandle(resolved);

    // 5. Parse and validate desired total bid amount (in whole rupees)
    const desiredTotalINR = Math.floor(Number(bid_amount_inr));
    if (isNaN(desiredTotalINR) || desiredTotalINR <= 0) {
      return NextResponse.json(
        { success: false, error: "Bid amount must be a positive whole number" },
        { status: 400 }
      );
    }

    if (desiredTotalINR > 1000000) {
      return NextResponse.json(
        { success: false, error: "Maximum bid limit is ₹10,00,000 (10 Lakhs INR)" },
        { status: 400 }
      );
    }

    // 6. Check existing listing in DB by normalized_key
    let existingListing = await prisma.listing.findUnique({
      where: { normalized_key: normalized.normalizedKey },
      include: {
        bids: {
          where: { is_current: true, status: "PAID" },
          take: 1,
        },
      },
    });

    let isRebid = false;
    let amountToChargeINR = desiredTotalINR;
    let currentBidINR = 0;

    if (existingListing && existingListing.bids.length > 0) {
      isRebid = true;
      const currentBidPaise = existingListing.bids[0].amount_paise;
      currentBidINR = Math.floor(currentBidPaise / 100);

      // Re-bid Rule: must be at least ₹1 higher than current bid
      if (desiredTotalINR <= currentBidINR) {
        return NextResponse.json(
          {
            success: false,
            error: `Your new total bid (₹${desiredTotalINR}) must be higher than your current bid (₹${currentBidINR}) by at least ₹1.`,
          },
          { status: 400 }
        );
      }

      // Re-bid Rule: User ONLY pays the difference!
      amountToChargeINR = desiredTotalINR - currentBidINR;
    } else {
      // New Listing Rule: minimum ₹100
      if (desiredTotalINR < 100) {
        return NextResponse.json(
          { success: false, error: "Minimum bid for new listings is ₹100" },
          { status: 400 }
        );
      }
      amountToChargeINR = desiredTotalINR;
    }

    const amountToChargePaise = amountToChargeINR * 100;
    const desiredTotalPaise = desiredTotalINR * 100;

    // 7. Create or update pending listing record
    let listingId: string;
    if (!existingListing) {
      const created = await prisma.listing.create({
        data: {
          url_or_handle: normalized.canonicalUrl,
          normalized_key: normalized.normalizedKey,
          title: title.trim(),
          description: (description || "").trim(),
          category_slug: category_slug || "other",
          submitter_phone: formattedPhone,
          is_active: false, // will be activated upon payment verification
        },
      });
      listingId = created.id;
    } else {
      listingId = existingListing.id;
      // Update listing details if edited
      await prisma.listing.update({
        where: { id: existingListing.id },
        data: {
          title: title.trim(),
          description: (description || "").trim(),
          category_slug: category_slug || existingListing.category_slug,
          submitter_phone: formattedPhone,
        },
      });
    }

    // 8. Create Razorpay Payment Order
    const receiptId = `rcpt_${listingId.slice(-8)}_${Date.now()}`;
    const order = await createPaymentOrder({
      amountPaise: amountToChargePaise,
      receipt: receiptId,
      notes: {
        listing_id: listingId,
        normalized_key: normalized.normalizedKey,
        is_rebid: isRebid ? "true" : "false",
        desired_total_paise: desiredTotalPaise.toString(),
      },
    });

    // 9. Store pending Bid in DB
    const pendingBid = await prisma.bid.create({
      data: {
        listing_id: listingId,
        amount_paise: desiredTotalPaise, // The total standing rank value
        is_current: false, // Activated only after payment
        status: "PENDING",
        razorpay_order_id: order.id,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount_paise: amountToChargePaise,
        amount_inr: amountToChargeINR,
        currency: "INR",
        is_mock: order.isMock,
      },
      bidding_info: {
        listing_id: listingId,
        bid_id: pendingBid.id,
        is_rebid: isRebid,
        previous_bid_inr: currentBidINR,
        new_total_bid_inr: desiredTotalINR,
        amount_charged_inr: amountToChargeINR,
      },
      razorpay_key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
      is_live_gateway: isRazorpayConfigured,
    });
  } catch (err: unknown) {
    console.error("POST /api/bids/create-order error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create bid payment order" },
      { status: 500 }
    );
  }
}
