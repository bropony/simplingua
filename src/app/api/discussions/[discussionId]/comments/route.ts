import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Discussion from "@/models/Discussion";
import Comment from "@/models/Comment";
import { getAuthUser } from "@/lib/api";
import { createCommentSchema, formatZodError } from "@/lib/validators";

// GET /api/discussions/:discussionId/comments — List comments for a discussion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    await connectDB();
    const { discussionId } = await params;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    // Verify discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "讨论不存在" } },
        { status: 404 }
      );
    }

    const filter = { discussionId };
    const total = await Comment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const items = await Comment.find(filter)
      .populate("authorId", "username displayName")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { items, total, page, totalPages },
    });
  } catch (error) {
    console.error("Comment list error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// POST /api/discussions/:discussionId/comments — Create comment (authenticated)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
        { status: 401 }
      );
    }

    await connectDB();
    const { discussionId } = await params;

    // Verify discussion exists and is not locked
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "讨论不存在" } },
        { status: 404 }
      );
    }

    if (discussion.isLocked && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "LOCKED", message: "该讨论已锁定，无法评论" } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = createCommentSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const { content, parentId } = parsed;

    // If parentId provided, verify parent comment belongs to same discussion
    if (parentId) {
      const parentComment = await Comment.findOne({ _id: parentId, discussionId });
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PARENT", message: "父评论不存在" } },
          { status: 400 }
        );
      }
    }

    const comment = await Comment.create({
      discussionId,
      parentId: parentId || undefined,
      content: content.trim(),
      authorId: user.userId,
    });

    // Increment discussion comment count
    await Discussion.findByIdAndUpdate(discussionId, { $inc: { commentCount: 1 } });

    await comment.populate("authorId", "username displayName");

    return NextResponse.json(
      { success: true, data: comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment create error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
