import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSmsProvider } from "@/lib/sms-provider";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    // Rate limiting: check recent OTP sessions for this phone in last 2 minutes
    const recentOtp = await prisma.otpSession.findFirst({
      where: {
        phone: formattedPhone,
        created_at: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { success: false, error: "Please wait 60 seconds before requesting another OTP" },
        { status: 429 }
      );
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await prisma.otpSession.create({
      data: {
        phone: formattedPhone,
        otp_code: otpCode,
        expires_at: expiresAt,
        verified: false,
      },
    });

    // Send OTP via SMS provider
    const sms = getSmsProvider();
    const sendResult = await sms.sendOtp(formattedPhone, otpCode);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${formattedPhone}`,
      phone: formattedPhone,
      devCode: sendResult.devCode, // populated in mock mode
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/send-otp error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch verification OTP" },
      { status: 500 }
    );
  }
}
