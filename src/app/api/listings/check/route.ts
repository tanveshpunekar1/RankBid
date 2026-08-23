import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUrlOrHandle, resolveUrlRedirect } from "@/lib/url-normalizer";
import { validateListingSafety } from "@/lib/moderation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input");

    if (!input || !input.trim()) {
      return NextResponse.json({ success: false, error: "Input is required" }, { status: 400 });
    }

    // Safety check first
    const safety = validateListingSafety(input);
    if (!safety.allowed) {
      return NextResponse.json(
        {
          success: false,
          moderationBlocked: true,
          error: safety.reason,
        },
        { status: 422 }
      );
    }

    // Resolve redirect if shortlink
    const resolved = await resolveUrlRedirect(input);
    const normalized = normalizeUrlOrHandle(resolved);

    // Look for existing listing by normalized_key
    const existing = await prisma.listing.findUnique({
      where: { normalized_key: normalized.normalizedKey },
      include: {
        bids: {
          where: { is_current: true, status: "PAID" },
          take: 1,
        },
        category: true,
      },
    });

    if (existing && existing.bids.length > 0) {
      const currentBidPaise = existing.bids[0].amount_paise;
      const currentBidINR = Math.floor(currentBidPaise / 100);

      // Find current rank of this listing
      const allActiveBids = await prisma.bid.findMany({
        where: { is_current: true, status: "PAID" },
        orderBy: [{ amount_paise: "desc" }, { created_at: "asc" }],
      });

      const currentRank = allActiveBids.findIndex((b) => b.listing_id === existing.id) + 1;

      return NextResponse.json({
        success: true,
        exists: true,
        normalized,
        listing: {
          id: existing.id,
          title: existing.title,
          url_or_handle: existing.url_or_handle,
          description: existing.description,
          category_slug: existing.category_slug,
          category_name: existing.category?.name,
          submitter_phone: existing.submitter_phone,
          current_bid_paise: currentBidPaise,
          current_bid_inr: currentBidINR,
          current_rank: currentRank > 0 ? currentRank : null,
          min_new_bid_inr: currentBidINR + 1, // Must be at least ₹1 higher
        },
      });
    }

    // New listing
    return NextResponse.json({
      success: true,
      exists: false,
      normalized,
      min_bid_inr: 100, // Minimum ₹100 for new listing
    });
  } catch (err: unknown) {
    console.error("GET /api/listings/check error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to check listing" },
      { status: 500 }
    );
  }
}
