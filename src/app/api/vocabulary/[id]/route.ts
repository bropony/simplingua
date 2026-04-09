import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import { requireAdmin } from "@/lib/api";
import { Types } from "mongoose";

// GET /api/vocabulary/:id — Get a single vocabulary entry
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "无效的词汇ID" } },
        { status: 400 }
      );
    }

    const entry = await Vocabulary.findById(id).lean();

    if (!entry) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "词汇未找到" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Vocabulary get error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// PUT /api/vocabulary/:id — Update vocabulary entry (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "无效的词汇ID" } },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Auto-set letter from word if word is being updated
    if (body.word) {
      body.letter = body.letter || body.word.charAt(0).toUpperCase();
      body.word = body.word.trim();
    }

    const entry = await Vocabulary.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "词汇未找到" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Vocabulary update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// DELETE /api/vocabulary/:id — Delete vocabulary entry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "无效的词汇ID" } },
        { status: 400 }
      );
    }

    const entry = await Vocabulary.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "词汇未找到" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error("Vocabulary delete error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
