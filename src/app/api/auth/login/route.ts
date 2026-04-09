import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema, formatZodError } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = loginSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const { email, password } = parsed;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "邮箱或密码不正确" } },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "邮箱或密码不正确" } },
        { status: 401 }
      );
    }

    const token = await signToken({ userId: user._id.toString(), role: user.role });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          settings: user.settings,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
