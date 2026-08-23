import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
        secret: webhookSecret,
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload?.payment?.entity;
      const orderId = payment?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = payment?.id;

      if (orderId) {
        const pendingBid = await prisma.bid.findFirst({
          where: { razorpay_order_id: orderId },
        });

        if (pendingBid && pendingBid.status !== "PAID") {
          await prisma.$transaction([
            prisma.bid.updateMany({
              where: {
                listing_id: pendingBid.listing_id,
                is_current: true,
              },
              data: { is_current: false },
            }),
            prisma.bid.update({
              where: { id: pendingBid.id },
              data: {
                status: "PAID",
                is_current: true,
                razorpay_payment_id: paymentId,
              },
            }),
            prisma.listing.update({
              where: { id: pendingBid.listing_id },
              data: { is_active: true },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
