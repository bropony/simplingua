import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import { requireAdmin } from "@/lib/api";
import { escapeRegex } from "@/lib/utils";
import { createVocabularySchema, formatZodError } from "@/lib/validators";

// GET /api/vocabulary — List vocabulary entries with pagination and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const letter = searchParams.get("letter");
    const search = searchParams.get("search");
    const pos = searchParams.get("pos");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const filter: Record<string, unknown> = {};

    if (letter) {
      filter.letter = letter.toUpperCase();
    }

    if (pos) {
      filter.partOfSpeech = pos;
    }

    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { word: { $regex: escaped, $options: "i" } },
        { "definitions.meaning": { $regex: escaped, $options: "i" } },
      ];
    }

    const total = await Vocabulary.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const items = await Vocabulary.find(filter)
      .sort({ word: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { items, total, page, totalPages },
    });
  } catch (error) {
    console.error("Vocabulary list error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// POST /api/vocabulary — Create vocabulary entry (admin only)
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
      parsed = createVocabularySchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const { word, partOfSpeech, letter } = parsed;

    // Auto-set letter from word if not provided
    const entryLetter = letter || word.charAt(0).toUpperCase();

    const existing = await Vocabulary.findOne({ word: word.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE", message: "该词汇已存在" } },
        { status: 409 }
      );
    }

    const entry = await Vocabulary.create({
      ...body,
      word: word.trim(),
      letter: entryLetter,
    });

    return NextResponse.json(
      { success: true, data: entry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vocabulary create error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
