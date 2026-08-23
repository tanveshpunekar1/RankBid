import { NextRequest, NextResponse } from "next/server";
import { classifyCategory } from "@/lib/classifier";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url_or_handle, title, description } = body;

    if (!url_or_handle && !title) {
      return NextResponse.json(
        { success: false, error: "URL, handle, or title is required" },
        { status: 400 }
      );
    }

    const result = classifyCategory(url_or_handle || "", title || "", description || "");

    return NextResponse.json({
      success: true,
      category_slug: result.slug,
      category_name: result.name,
      confidence: result.confidence,
    });
  } catch (err: unknown) {
    console.error("POST /api/classify error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to classify category" },
      { status: 500 }
    );
  }
}
