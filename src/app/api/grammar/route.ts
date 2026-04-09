import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Grammar from "@/models/Grammar";
import { requireAdmin } from "@/lib/api";
import { createGrammarSchema, formatZodError } from "@/lib/validators";

// GET /api/grammar — List all grammar chapters in order
export async function GET() {
  try {
    await connectDB();

    const chapters = await Grammar.find({})
      .select("chapterTitle chapterTitleSimp order sections.title createdAt updatedAt")
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { chapters },
    });
  } catch (error) {
    console.error("Grammar list error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// POST /api/grammar — Create grammar chapter (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = createGrammarSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }

    const chapter = await Grammar.create(parsed);

    return NextResponse.json(
      { success: true, data: chapter },
      { status: 201 }
    );
  } catch (error) {
    console.error("Grammar create error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
