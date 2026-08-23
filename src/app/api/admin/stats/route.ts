import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAdminAuth(request: NextRequest): boolean {
  const secretToken = process.env.ADMIN_SECRET_TOKEN || "rankbid_super_secret_admin_session_key_2026";
  const cookie = request.cookies.get("rankbid_admin_session")?.value;
  const headerToken = request.headers.get("x-admin-token");

  return cookie === secretToken || headerToken === secretToken;
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalListingsCount,
      activeListingsCount,
      totalClicksCount,
      allPaidBids,
      recentBids,
      topClickedListings,
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { is_active: true } }),
      prisma.clickEvent.count(),
      prisma.bid.findMany({
        where: { status: "PAID" },
        select: {
          amount_paise: true,
          listing: {
            select: { category_slug: true },
          },
        },
      }),
      prisma.bid.findMany({
        where: { status: "PAID" },
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          listing: {
            select: { title: true, url_or_handle: true, category_slug: true },
          },
        },
      }),
      prisma.listing.findMany({
        take: 10,
        where: { is_active: true },
        select: {
          id: true,
          title: true,
          url_or_handle: true,
          category_slug: true,
          _count: {
            select: { clicks: true },
          },
          bids: {
            where: { is_current: true, status: "PAID" },
            take: 1,
            select: { amount_paise: true },
          },
        },
      }),
    ]);

    // Calculate total gross revenue in INR
    const totalRevenuePaise = allPaidBids.reduce((sum, b) => sum + b.amount_paise, 0);
    const totalRevenueINR = Math.floor(totalRevenuePaise / 100);

    // Revenue by category breakdown
    const categoryRevenueMap: Record<string, number> = {};
    for (const bid of allPaidBids) {
      const cat = bid.listing?.category_slug || "other";
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + Math.floor(bid.amount_paise / 100);
    }

    const categoryBreakdown = Object.entries(categoryRevenueMap)
      .map(([category, revenueINR]) => ({
        category,
        revenueINR,
      }))
      .sort((a, b) => b.revenueINR - a.revenueINR);

    // Sort top clicked
    const formattedTopClicked = topClickedListings
      .map((l) => ({
        id: l.id,
        title: l.title,
        url_or_handle: l.url_or_handle,
        category: l.category_slug,
        clicks: l._count.clicks,
        bidINR: l.bids[0] ? Math.floor(l.bids[0].amount_paise / 100) : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenueINR,
        totalListingsCount,
        activeListingsCount,
        totalClicksCount,
        totalPaidBidsCount: allPaidBids.length,
      },
      categoryBreakdown,
      topClickedListings: formattedTopClicked,
      recentTransactions: recentBids.map((b) => ({
        id: b.id,
        title: b.listing?.title,
        url_or_handle: b.listing?.url_or_handle,
        amountINR: Math.floor(b.amount_paise / 100),
        category: b.listing?.category_slug,
        paymentId: b.razorpay_payment_id,
        createdAt: b.created_at,
      })),
    });
  } catch (err: unknown) {
    console.error("Admin GET stats error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
