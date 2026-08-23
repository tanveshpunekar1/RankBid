import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, url_or_handle: true, is_active: true },
    });

    if (!listing || !listing.is_active) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Hash client IP for privacy-friendly analytics
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim() || "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const referrer = request.headers.get("referer") || "direct";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Asynchronously log click event
    try {
      await prisma.clickEvent.create({
        data: {
          listing_id: listing.id,
          referrer,
          user_agent: userAgent.slice(0, 255),
          ip_hash: ipHash,
        },
      });
    } catch (e) {
      console.error("Click log error:", e);
    }

    // Determine target URL
    let target = listing.url_or_handle;
    if (target.startsWith("@")) {
      target = `https://x.com/${target.slice(1)}`;
    } else if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    return NextResponse.redirect(target, { status: 302 });
  } catch (err: unknown) {
    console.error("GET /api/listings/[id]/click error:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
