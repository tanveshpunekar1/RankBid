import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    const expectedPin = process.env.ADMIN_PIN || "8888";

    if (!pin || pin.toString().trim() !== expectedPin.toString().trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid Admin PIN / Password" },
        { status: 401 }
      );
    }

    const secretToken = process.env.ADMIN_SECRET_TOKEN || "rankbid_super_secret_admin_session_key_2026";
    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      token: secretToken,
    });

    response.cookies.set("rankbid_admin_session", secretToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
