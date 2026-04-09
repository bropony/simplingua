import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import { requireAdmin } from "@/lib/api";
import { importVocabularySchema, formatZodError } from "@/lib/validators";

// POST /api/vocabulary/import — Bulk import vocabulary from JSON (admin only)
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
      parsed = importVocabularySchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const data = parsed.data;

    let imported = 0;
    let skipped = 0;
    const errors: { index: number; word: string; error: string }[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as Record<string, any>;
      try {
        if (!item.word || !item.partOfSpeech) {
          // Skip structural entries (letter headers, numbering, etc.)
          skipped++;
          continue;
        }

        item.letter = item.letter || item.word.charAt(0).toUpperCase();
        item.word = item.word.trim();

        await Vocabulary.findOneAndUpdate(
          { word: item.word },
          { $set: item },
          { upsert: true, runValidators: true }
        );
        imported++;
      } catch (err) {
        errors.push({
          index: i,
          word: item.word || "",
          error: err instanceof Error ? err.message : "未知错误",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { imported, skipped, errors, total: data.length },
    });
  } catch (error) {
    console.error("Vocabulary import error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
