import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import { requireAdmin } from "@/lib/api";

// DELETE /api/vocabulary/all — Delete all vocabulary entries (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
        { status: 403 }
      );
    }

    await connectDB();

    const result = await Vocabulary.deleteMany({});

    return NextResponse.json({
      success: true,
      data: { deleted: result.deletedCount },
    });
  } catch (error) {
    console.error("Vocabulary delete all error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
