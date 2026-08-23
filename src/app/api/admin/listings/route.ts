import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAdminAuth(request: NextRequest): boolean {
  const secretToken = process.env.ADMIN_SECRET_TOKEN || "rankbid_super_secret_admin_session_key_2026";
  const cookie = request.cookies.get("rankbid_admin_session")?.value;
  const headerToken = request.headers.get("x-admin-token");

  return cookie === secretToken || headerToken === secretToken;
}

// GET all listings with all bids and clicks for admin
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const listings = await prisma.listing.findMany({
      orderBy: { created_at: "desc" },
      include: {
        bids: {
          orderBy: { created_at: "desc" },
        },
        category: true,
        _count: {
          select: { clicks: true },
        },
      },
    });

    const formatted = listings.map((l) => {
      const activeBid = l.bids.find((b) => b.is_current && b.status === "PAID");
      return {
        id: l.id,
        title: l.title,
        url_or_handle: l.url_or_handle,
        normalized_key: l.normalized_key,
        description: l.description,
        category_slug: l.category_slug,
        category_name: l.category?.name || "Other",
        submitter_phone: l.submitter_phone,
        is_active: l.is_active,
        flagged_reason: l.flagged_reason,
        created_at: l.created_at,
        current_bid_inr: activeBid ? Math.floor(activeBid.amount_paise / 100) : 0,
        total_bids_count: l.bids.length,
        total_paid_bids_count: l.bids.filter((b) => b.status === "PAID").length,
        clicks_count: l._count.clicks,
      };
    });

    return NextResponse.json({ success: true, listings: formatted });
  } catch (err: unknown) {
    console.error("Admin GET listings error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch listings" }, { status: 500 });
  }
}

// PATCH to update category override, toggle active status, or flag
export async function PATCH(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, is_active, category_slug, flagged_reason, title, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Listing ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof is_active === "boolean") updateData.is_active = is_active;
    if (category_slug) updateData.category_slug = category_slug;
    if (flagged_reason !== undefined) updateData.flagged_reason = flagged_reason;
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (err: unknown) {
    console.error("Admin PATCH listing error:", err);
    return NextResponse.json({ success: false, error: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE to remove listing completely
export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Listing ID is required" }, { status: 400 });
    }

    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Listing deleted successfully" });
  } catch (err: unknown) {
    console.error("Admin DELETE listing error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete listing" }, { status: 500 });
  }
}
