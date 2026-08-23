import crypto from "crypto";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyIdHere";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";

export const isRazorpayConfigured =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  process.env.RAZORPAY_KEY_ID !== "rzp_test_YourTestKeyIdHere" &&
  Boolean(process.env.RAZORPAY_KEY_SECRET) &&
  process.env.RAZORPAY_KEY_SECRET !== "your_razorpay_key_secret_here";

export const razorpay = isRazorpayConfigured
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

export interface CreateOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  isMock?: boolean;
}

export async function createPaymentOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
  if (razorpay && isRazorpayConfigured) {
    try {
      const order = await razorpay.orders.create({
        amount: params.amountPaise,
        currency: params.currency || "INR",
        receipt: params.receipt,
        notes: params.notes || {},
      });
      return {
        id: order.id,
        amount: typeof order.amount === "number" ? order.amount : parseInt(order.amount.toString(), 10),
        currency: order.currency,
        receipt: order.receipt || params.receipt,
        status: order.status,
        isMock: false,
      };
    } catch (err: unknown) {
      console.error("Razorpay order creation error:", err);
      throw new Error(err instanceof Error ? err.message : "Failed to create Razorpay order");
    }
  }

  // Dev Mock Order fallback
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: mockOrderId,
    amount: params.amountPaise,
    currency: "INR",
    receipt: params.receipt,
    status: "created",
    isMock: true,
  };
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  // If it's a mock dev order
  if (params.orderId.startsWith("order_mock_")) {
    const expectedMockSig = crypto
      .createHmac("sha256", "mock_secret")
      .update(`${params.orderId}|${params.paymentId}`)
      .digest("hex");
    return params.signature === expectedMockSig || params.signature.startsWith("dev_sig_");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return generatedSignature === params.signature;
}

export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  secret: string;
}): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", params.secret)
      .update(params.rawBody)
      .digest("hex");
    return expectedSignature === params.signature;
  } catch {
    return false;
  }
}
