import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    const session = await prisma.otpSession.findFirst({
      where: {
        phone: formattedPhone,
        otp_code: otp.trim(),
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: "desc" },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    await prisma.otpSession.update({
      where: { id: session.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      phone: formattedPhone,
      message: "Phone verified successfully",
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/verify-otp error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
