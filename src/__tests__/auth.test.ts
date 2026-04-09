/**
 * @jest-environment node
 */

import { signToken, verifyToken } from "@/lib/jwt";
import { hashPassword, verifyPassword, parseAdminAccounts } from "@/lib/auth";

describe("JWT utilities", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-for-jest";
  });

  it("should sign and verify a token", async () => {
    const payload = { userId: "abc123", role: "user" as const };
    const token = await signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe("abc123");
    expect(decoded!.role).toBe("user");
  });

  it("should return null for invalid token", async () => {
    const result = await verifyToken("invalid-token");
    expect(result).toBeNull();
  });

  it("should include admin role in token", async () => {
    const payload = { userId: "admin1", role: "admin" as const };
    const token = await signToken(payload);
    const decoded = await verifyToken(token);
    expect(decoded!.role).toBe("admin");
  });
});

describe("Password utilities", () => {
  it("should hash a password", async () => {
    const hash = await hashPassword("mypassword123");
    expect(hash).toBeDefined();
    expect(hash).not.toBe("mypassword123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("should verify correct password", async () => {
    const hash = await hashPassword("testpass123");
    const isValid = await verifyPassword("testpass123", hash);
    expect(isValid).toBe(true);
  });

  it("should reject wrong password", async () => {
    const hash = await hashPassword("correctpass");
    const isValid = await verifyPassword("wrongpass", hash);
    expect(isValid).toBe(false);
  });
});

describe("parseAdminAccounts", () => {
  it("should parse admin accounts from env", () => {
    process.env.ADMIN_ACCOUNTS = "admin:pass123,moderator:mod456";
    const accounts = parseAdminAccounts();
    expect(accounts.size).toBe(2);
    expect(accounts.get("admin")).toBe("pass123");
    expect(accounts.get("moderator")).toBe("mod456");
  });

  it("should return empty map when no env set", () => {
    delete process.env.ADMIN_ACCOUNTS;
    const accounts = parseAdminAccounts();
    expect(accounts.size).toBe(0);
  });

  it("should skip malformed entries", () => {
    process.env.ADMIN_ACCOUNTS = "admin:pass,invalid,bad:pass:extra";
    const accounts = parseAdminAccounts();
    // "invalid" has no colon — skipped
    // "admin:pass" is valid
    // "bad:pass:extra" — only splits on first colon, password is "pass:extra"
    expect(accounts.get("admin")).toBe("pass");
    expect(accounts.get("bad")).toBe("pass:extra");
  });
});
