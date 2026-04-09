import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import Discussion from "@/models/Discussion";
import Comment from "@/models/Comment";
import { getAuthUser } from "@/lib/api";
import { escapeRegex } from "@/lib/utils";
import { createDiscussionSchema, formatZodError } from "@/lib/validators";

// GET /api/discussions — List discussions with pagination, sorting, filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "recent";
    let author = searchParams.get("author");
    const commentedBy = searchParams.get("commented_by");
    const search = searchParams.get("search");

    // Resolve "me" to the current user's ID
    if (author === "me" || commentedBy === "me") {
      const authUser = await getAuthUser(request);
      if (!authUser) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
          { status: 401 }
        );
      }
      if (author === "me") author = authUser.userId;
    }

    const filter: Record<string, unknown> = {};
    if (tag) filter.tags = tag;
    if (author) filter.authorId = author;
    if (commentedBy) {
      const userId = commentedBy === "me" ? (await getAuthUser(request))!.userId : commentedBy;
      const commentedDiscussionIds = await Comment.distinct("discussionId", { authorId: userId });
      filter._id = { $in: commentedDiscussionIds };
    }
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { content: { $regex: escaped, $options: "i" } },
      ];
    }

    const total = await Discussion.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let sortOption: Record<string, 1 | -1>;
    switch (sort) {
      case "popular":
        sortOption = { likeCount: -1, createdAt: -1 };
        break;
      case "commented":
        sortOption = { commentCount: -1, createdAt: -1 };
        break;
      case "recent":
      default:
        sortOption = { isPinned: -1, createdAt: -1 };
        break;
    }

    const items = await Discussion.find(filter)
      .populate("authorId", "username displayName")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { items, total, page, totalPages },
    });
  } catch (error) {
    console.error("Discussion list error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}

// POST /api/discussions — Create discussion (authenticated)
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
      parsed = createDiscussionSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }

    const discussion = await Discussion.create({
      ...parsed,
      authorId: user.userId,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    });

    await discussion.populate("authorId", "username displayName");

    return NextResponse.json(
      { success: true, data: discussion },
      { status: 201 }
    );
  } catch (error) {
    console.error("Discussion create error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
