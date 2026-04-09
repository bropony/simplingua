import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, verifyPassword, signToken, parseAdminAccounts } from "@/lib/auth";
import { registerSchema, formatZodError } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    let parsed;
    try {
      parsed = registerSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) return formatZodError(err);
      throw err;
    }
    const { username, email, password } = parsed;

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "邮箱" : "用户名";
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE", message: `该${field}已被注册` } },
        { status: 409 }
      );
    }

    // Determine role: check if this matches an admin account
    const adminAccounts = parseAdminAccounts();
    let role: "user" | "admin" = "user";
    if (adminAccounts.has(username)) {
      const storedPassword = adminAccounts.get(username)!;
      // Support both bcrypt hashes and plaintext (legacy) in ADMIN_ACCOUNTS
      const isBcryptHash = storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$");
      const isAdmin = isBcryptHash
        ? await verifyPassword(password, storedPassword)
        : storedPassword === password;

      if (isAdmin) {
        role = "admin";
      }
      if (!isBcryptHash) {
        console.warn(
          `[WARN] Admin account "${username}" uses a plaintext password in ADMIN_ACCOUNTS. ` +
          "Please migrate to a bcrypt hash for better security."
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    const token = await signToken({ userId: user._id.toString(), role });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器错误" } },
      { status: 500 }
    );
  }
}
