import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/api";
import User from "@/models/User";
import Vocabulary from "@/models/Vocabulary";
import Grammar from "@/models/Grammar";
import Discussion from "@/models/Discussion";
import Comment from "@/models/Comment";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
        { status: 403 }
      );
    }

    await connectDB();

    const [
      userCount,
      adminCount,
      vocabularyCount,
      grammarCount,
      discussionCount,
      commentCount,
      recentDiscussions,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Vocabulary.countDocuments(),
      Grammar.countDocuments(),
      Discussion.countDocuments(),
      Comment.countDocuments(),
      Discussion.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title commentCount viewCount likeCount createdAt")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        admins: adminCount,
        vocabulary: vocabularyCount,
        grammar: grammarCount,
        discussions: discussionCount,
        comments: commentCount,
        recentDiscussions,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
