import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "./jwt";
export type { JWTPayload } from "./jwt";
export { signToken, verifyToken };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function parseAdminAccounts(): Map<string, string> {
  const accounts = new Map<string, string>();
  const env = process.env.ADMIN_ACCOUNTS;
  if (!env) return accounts;

  env.split(",").forEach((entry) => {
    const colonIndex = entry.trim().indexOf(":");
    if (colonIndex > 0) {
      const username = entry.trim().slice(0, colonIndex);
      const password = entry.trim().slice(colonIndex + 1);
      accounts.set(username, password);
    }
  });

  return accounts;
}
