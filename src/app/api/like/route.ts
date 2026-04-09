import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Like from "@/models/Like";
import Discussion from "@/models/Discussion";
import Comment from "@/models/Comment";
import { getAuthUser } from "@/lib/api";
import { likeSchema, formatZodError } from "@/lib/validators";

// POST /api/like — Toggle like on a discussion or comment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = likeSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const { targetType, targetId } = parsed;

    // Verify target exists
    if (targetType === "discussion") {
      const target = await Discussion.findById(targetId);
      if (!target) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "讨论不存在" } },
          { status: 404 }
        );
      }
    } else {
      const target = await Comment.findById(targetId);
      if (!target) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
          { status: 404 }
        );
      }
    }

    // Check if already liked — atomic unlike via findOneAndDelete
    const existing = await Like.findOneAndDelete({
      userId: user.userId,
      targetType,
      targetId,
    });

    let liked: boolean;
    const Model = targetType === "discussion" ? Discussion : Comment;

    if (existing) {
      // Successfully removed like (atomic)
      await Model.findByIdAndUpdate(targetId, { $inc: { likeCount: -1 } });
      liked = false;
    } else {
      // No existing like — try to create one
      try {
        await Like.create({ userId: user.userId, targetType, targetId });
        await Model.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } });
        liked = true;
      } catch (err: unknown) {
        // Duplicate key error — another concurrent request already liked it
        if (err instanceof Error && "code" in err && (err as { code: number }).code === 11000) {
          liked = true;
        } else {
          throw err;
        }
      }
    }

    const target = await Model.findById(targetId).lean<{ likeCount: number }>();
    const likeCount = target?.likeCount ?? 0;

    return NextResponse.json({
      success: true,
      data: { liked, likeCount },
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
