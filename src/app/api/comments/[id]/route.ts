import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import { getAuthUser } from "@/lib/api";
import { updateCommentSchema, formatZodError } from "@/lib/validators";

// PUT /api/comments/:id — Update comment (author or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (comment.authorId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "无权编辑此评论" } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = updateCommentSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }

    comment.content = parsed.content;
    await comment.save();
    await comment.populate("authorId", "username displayName");

    return NextResponse.json({ success: true, data: comment });
  } catch (error) {
    console.error("Comment update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/:id — Delete comment (author or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "评论不存在" } },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (comment.authorId.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "无权删除此评论" } },
        { status: 403 }
      );
    }

    const Discussion = (await import("@/models/Discussion")).default;
    const Like = (await import("@/models/Like")).default;

    // Delete this comment, its replies, and associated likes
    // Count all comments being deleted (this one + all descendants)
    const idsToDelete = [id];
    const findDescendants = async (parentId: string) => {
      const children = await Comment.find({ parentId }).lean();
      for (const child of children) {
        const childId = (child._id as Types.ObjectId).toString();
        idsToDelete.push(childId);
        await findDescendants(childId);
      }
    };
    await findDescendants(id);

    await Like.deleteMany({
      targetType: "comment",
      targetId: { $in: idsToDelete },
    });
    await Comment.deleteMany({ _id: { $in: idsToDelete } });

    // Decrement discussion comment count
    await Discussion.findByIdAndUpdate(comment.discussionId, {
      $inc: { commentCount: -idsToDelete.length },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Comment delete error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
