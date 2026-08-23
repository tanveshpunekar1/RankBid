import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      is_active: true,
    };

    if (category && category !== "all") {
      where.category_slug = category;
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { url_or_handle: { contains: q } },
        { description: { contains: q } },
      ];
    }

    // Fetch listings with their current active paid bid and click count
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          bids: {
            where: { is_current: true, status: "PAID" },
            take: 1,
          },
          category: true,
          _count: {
            select: { clicks: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Stable sort:
    // 1. Amount paise desc (highest bid first)
    // 2. Created at asc (earlier bid keeps rank on ties)
    const sortedListings = listings
      .filter((l) => l.bids.length > 0)
      .sort((a, b) => {
        const bidA = a.bids[0];
        const bidB = b.bids[0];
        if (bidA.amount_paise !== bidB.amount_paise) {
          return bidB.amount_paise - bidA.amount_paise;
        }
        return new Date(bidA.created_at).getTime() - new Date(bidB.created_at).getTime();
      });

    // Compute global ranks
    const rankedListings = sortedListings.map((item, index) => ({
      rank: skip + index + 1,
      id: item.id,
      title: item.title,
      url_or_handle: item.url_or_handle,
      normalized_key: item.normalized_key,
      description: item.description,
      category_slug: item.category_slug,
      category_name: item.category?.name || "General",
      category_icon: item.category?.icon || "Tag",
      current_bid_paise: item.bids[0].amount_paise,
      current_bid_inr: Math.floor(item.bids[0].amount_paise / 100),
      bid_created_at: item.bids[0].created_at,
      clicks_count: item._count.clicks,
      created_at: item.created_at,
    }));

    // Paginate sorted result
    const paginatedItems = rankedListings.slice(skip, skip + limit);
    const topBidPaise = rankedListings.length > 0 ? rankedListings[0].current_bid_paise : 0;
    const minBidForRank1INR = topBidPaise > 0 ? Math.floor(topBidPaise / 100) + 100 : 100;

    return NextResponse.json({
      success: true,
      listings: paginatedItems,
      pagination: {
        total: rankedListings.length,
        page,
        limit,
        totalPages: Math.ceil(rankedListings.length / limit),
      },
      stats: {
        totalListings: rankedListings.length,
        topBidINR: Math.floor(topBidPaise / 100),
        minBidForRank1INR,
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
