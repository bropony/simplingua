import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Discussion from "@/models/Discussion";
import { getAuthUser } from "@/lib/api";
import { updateDiscussionSchema, formatZodError } from "@/lib/validators";

// GET /api/discussions/:discussionId — Get single discussion with author info, increment view count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    await connectDB();
    const { discussionId } = await params;

    const discussion = await Discussion.findByIdAndUpdate(
      discussionId,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate("authorId", "username displayName")
      .lean();

    if (!discussion) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "讨论不存在" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: discussion });
  } catch (error) {
    console.error("Discussion get error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// PUT /api/discussions/:discussionId — Update discussion (author or admin)
export async function PUT(
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

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "讨论不存在" } },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (discussion.authorId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "无权编辑此讨论" } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = updateDiscussionSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }

    const { title, content, tags, isPinned, isLocked } = parsed;

    if (title !== undefined) discussion.title = title;
    if (content !== undefined) discussion.content = content;
    if (tags !== undefined) discussion.tags = tags;

    // Only admin can pin/lock
    if (user.role === "admin") {
      if (isPinned !== undefined) discussion.isPinned = isPinned;
      if (isLocked !== undefined) discussion.isLocked = isLocked;
    }

    await discussion.save();
    await discussion.populate("authorId", "username displayName");

    return NextResponse.json({ success: true, data: discussion });
  } catch (error) {
    console.error("Discussion update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// DELETE /api/discussions/:discussionId — Delete discussion (author or admin)
export async function DELETE(
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

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "讨论不存在" } },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (discussion.authorId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "无权删除此讨论" } },
        { status: 403 }
      );
    }

    // Delete discussion and all associated comments and likes
    const Comment = (await import("@/models/Comment")).default;
    const Like = (await import("@/models/Like")).default;

    await Comment.deleteMany({ discussionId });
    await Like.deleteMany({ targetType: "discussion", targetId: discussionId });
    await discussion.deleteOne();

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Discussion delete error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
