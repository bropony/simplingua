import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimit";
import { getAllowedOrigin, buildCorsHeaders } from "@/lib/cors";

/** Add CORS headers to a response. */
function withCors(response: NextResponse, allowedOrigin: string): NextResponse {
  if (allowedOrigin) {
    const corsHeaders = buildCorsHeaders(allowedOrigin);
    corsHeaders.forEach((value, key) => response.headers.set(key, value));
  }
  return response;
}

/** Resolve the allowed origin for this request. */
function resolveAllowedOrigin(request: NextRequest): string {
  return getAllowedOrigin({
    origin: request.headers.get("origin"),
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}

/** Determine if a route+method combination requires admin authentication. */
function requiresAdminAuth(pathname: string, method: string): boolean {
  // All routes under /api/admin
  if (pathname.startsWith("/api/admin")) return true;

  // Write operations on vocabulary/grammar routes are admin-only
  if (method !== "GET") {
    if (pathname.startsWith("/api/vocabulary") || pathname.startsWith("/api/grammar")) {
      return true;
    }
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedOrigin = resolveAllowedOrigin(request);

  // Handle CORS preflight (OPTIONS) requests
  if (request.method === "OPTIONS") {
    if (!allowedOrigin) {
      return new NextResponse(null, { status: 403 });
    }
    const response = new NextResponse(null, { status: 204 });
    return withCors(response, allowedOrigin);
  }

  // Rate limiting
  const rateResult = applyRateLimit(request, pathname);
  if (rateResult) {
    return withCors(rateResult, allowedOrigin);
  }

  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  // Protect admin-only routes
  if (requiresAdminAuth(pathname, request.method)) {
    if (!token) {
      const resp = NextResponse.json({ error: "未授权" }, { status: 401 });
      return withCors(resp, allowedOrigin);
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      const resp = NextResponse.json({ error: "权限不足" }, { status: 403 });
      return withCors(resp, allowedOrigin);
    }
  }

  // Protect authenticated API routes (any logged-in user)
  if (
    pathname.startsWith("/api/auth/me") ||
    pathname.startsWith("/api/auth/password")
  ) {
    if (!token) {
      const resp = NextResponse.json({ error: "未授权" }, { status: 401 });
      return withCors(resp, allowedOrigin);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const resp = NextResponse.json({ error: "无效的令牌" }, { status: 401 });
      return withCors(resp, allowedOrigin);
    }
  }

  const response = NextResponse.next();
  return withCors(response, allowedOrigin);
}

/** Apply per-route rate limits. Returns a 429 response if limited, or null. */
function applyRateLimit(request: NextRequest, pathname: string): NextResponse | null {
  // Strict limits on auth endpoints (brute-force protection)
  if (pathname === "/api/auth/login" || pathname === "/api/auth/register") {
    const result = rateLimit(request, { windowMs: 60_000, max: 5 });
    if (result.limited) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429, headers: result.headers }
      );
    }
  }

  // General limit on all other API routes
  if (pathname.startsWith("/api/")) {
    const result = rateLimit(request, { windowMs: 60_000, max: 60 });
    if (result.limited) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429, headers: result.headers }
      );
    }
  }

  return null;
}

export const config = {
  matcher: ["/api/:path*"],
};
