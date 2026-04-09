import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Grammar from "@/models/Grammar";
import { requireAdmin } from "@/lib/api";
import { importGrammarSchema, formatZodError } from "@/lib/validators";

// POST /api/grammar/import — Bulk import grammar from JSON (admin only)
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
      parsed = importGrammarSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const data = parsed.data;

    let imported = 0;
    const errors: { index: number; chapter: string; error: string }[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as Record<string, any>;
      try {
        if (!item.chapterTitle || item.order === undefined) {
          errors.push({ index: i, chapter: item.chapterTitle || "", error: "缺少必填字段" });
          continue;
        }

        await Grammar.findOneAndUpdate(
          { order: item.order },
          { $set: item },
          { upsert: true, runValidators: true }
        );
        imported++;
      } catch (err) {
        errors.push({
          index: i,
          chapter: item.chapterTitle || "",
          error: err instanceof Error ? err.message : "未知错误",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { imported, errors, total: data.length },
    });
  } catch (error) {
    console.error("Grammar import error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
