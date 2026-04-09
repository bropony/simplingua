import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Grammar from "@/models/Grammar";

// GET /api/grammar/search?q=searchterm
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_QUERY", message: "请提供搜索关键词" } },
        { status: 400 }
      );
    }

    const results = await Grammar.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .select("chapterTitle chapterTitleSimp order sections.title")
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error("Grammar search error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
