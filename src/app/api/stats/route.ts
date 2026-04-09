import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Vocabulary from "@/models/Vocabulary";
import Grammar from "@/models/Grammar";
import Discussion from "@/models/Discussion";

export const dynamic = "force-dynamic";

// GET /api/stats — Public site stats for home page
export async function GET() {
  try {
    await connectDB();

    const [userCount, vocabularyCount, grammarCount, discussionCount] =
      await Promise.all([
        User.countDocuments(),
        Vocabulary.countDocuments(),
        Grammar.countDocuments(),
        Discussion.countDocuments(),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        vocabulary: vocabularyCount,
        grammar: grammarCount,
        discussions: discussionCount,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json(
      {
        success: true,
        data: { users: 0, vocabulary: 0, grammar: 0, discussions: 0 },
      },
      { status: 200 }
    );
  }
}
