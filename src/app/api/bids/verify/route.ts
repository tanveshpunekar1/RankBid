import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bid_id,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing Razorpay order or payment ID" },
        { status: 400 }
      );
    }

    // 1. Verify HMAC Signature
    const isValidSignature = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || "dev_sig_mock",
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // 2. Find pending bid
    const pendingBid = await prisma.bid.findFirst({
      where: {
        OR: [
          { id: bid_id || "" },
          { razorpay_order_id },
        ],
      },
      include: { listing: true },
    });

    if (!pendingBid) {
      return NextResponse.json(
        { success: false, error: "Associated pending bid not found" },
        { status: 404 }
      );
    }

    // Idempotency check: already marked paid
    if (pendingBid.status === "PAID" && pendingBid.is_current) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        listing: pendingBid.listing,
      });
    }

    // 3. Database Transaction: Deactivate previous bids, mark current bid as PAID, activate listing
    const [_, updatedBid, updatedListing] = await prisma.$transaction([
      // Step A: Retire existing active bids for this listing
      prisma.bid.updateMany({
        where: {
          listing_id: pendingBid.listing_id,
          is_current: true,
        },
        data: {
          is_current: false,
        },
      }),

      // Step B: Mark this new bid as current and PAID
      prisma.bid.update({
        where: { id: pendingBid.id },
        data: {
          status: "PAID",
          is_current: true,
          razorpay_payment_id,
          razorpay_signature: razorpay_signature || "dev_verified",
        },
      }),

      // Step C: Ensure listing is active
      prisma.listing.update({
        where: { id: pendingBid.listing_id },
        data: { is_active: true },
      }),
    ]);

    // 4. Calculate new global rank
    const allActiveBids = await prisma.bid.findMany({
      where: { is_current: true, status: "PAID" },
      orderBy: [{ amount_paise: "desc" }, { created_at: "asc" }],
    });

    const newRank = allActiveBids.findIndex((b) => b.listing_id === pendingBid.listing_id) + 1;

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and rank updated!",
      rank: newRank,
      listing: updatedListing,
      bid: updatedBid,
      amount_inr: Math.floor(updatedBid.amount_paise / 100),
    });
  } catch (err: unknown) {
    console.error("POST /api/bids/verify error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
