import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(request: NextRequest): Promise<JWTPayload | null> {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") return null;
  return user;
}
