import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Grammar from "@/models/Grammar";
import { requireAdmin } from "@/lib/api";
import { Types } from "mongoose";

// GET /api/grammar/:id — Get a single grammar chapter
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Try by order number if id is numeric, otherwise by ObjectId
    let chapter;
    if (/^\d+$/.test(id)) {
      chapter = await Grammar.findOne({ order: parseInt(id) }).lean();
    } else if (Types.ObjectId.isValid(id)) {
      chapter = await Grammar.findById(id).lean();
    }

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "章节未找到" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { chapter },
    });
  } catch (error) {
    console.error("Grammar get error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// PUT /api/grammar/:id — Update grammar chapter (admin only)
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
        { success: false, error: { code: "INVALID_ID", message: "无效的章节ID" } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const chapter = await Grammar.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "章节未找到" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error("Grammar update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// DELETE /api/grammar/:id — Delete grammar chapter (admin only)
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
        { success: false, error: { code: "INVALID_ID", message: "无效的章节ID" } },
        { status: 400 }
      );
    }

    const chapter = await Grammar.findByIdAndDelete(id);

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "章节未找到" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error("Grammar delete error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
