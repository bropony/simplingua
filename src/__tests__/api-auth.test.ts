/**
 * @jest-environment node
 *
 * API route tests for auth endpoints (register & login).
 * Database models are mocked — these test input validation and control flow.
 */

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => {
  const original = jest.requireActual("@/lib/auth");
  return {
    ...original,
    hashPassword: jest.fn().mockResolvedValue("$2a$12$hashedpassword"),
    verifyPassword: jest.fn().mockResolvedValue(true),
    parseAdminAccounts: jest.fn().mockReturnValue(new Map()),
  };
});

import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import User from "@/models/User";
import { hashPassword, verifyPassword, parseAdminAccounts } from "@/lib/auth";

const mockFindOne = User.findOne as jest.Mock;
const mockCreate = User.create as jest.Mock;

function mockRequest(url: string, body: Record<string, unknown>): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (parseAdminAccounts as jest.Mock).mockReturnValue(new Map());
  });

  it("should reject missing fields", async () => {
    const res = await register(mockRequest("http://localhost/api/auth/register", {}) as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("MISSING_FIELDS");
  });

  it("should reject short username", async () => {
    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "ab", email: "a@b.com", password: "password123" }) as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_USERNAME");
  });

  it("should reject long username (>30 chars)", async () => {
    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "a".repeat(31), email: "a@b.com", password: "password123" }) as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_USERNAME");
  });

  it("should reject invalid email", async () => {
    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "testuser", email: "notanemail", password: "password123" }) as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_EMAIL");
  });

  it("should reject short password (<8 chars)", async () => {
    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "testuser", email: "a@b.com", password: "short" }) as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PASSWORD");
  });

  it("should reject duplicate user", async () => {
    mockFindOne.mockResolvedValue({ email: "a@b.com", username: "testuser" });
    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "testuser", email: "a@b.com", password: "password123" }) as any);
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error.code).toBe("DUPLICATE");
  });

  it("should register a new user successfully", async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: "user123",
      username: "testuser",
      email: "a@b.com",
      displayName: null,
      role: "user",
      settings: { language: "zh", theme: "light" },
      createdAt: new Date(),
    });

    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "testuser", email: "a@b.com", password: "password123" }) as any);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe("testuser");
    expect(data.data.token).toBeDefined();
    expect(hashPassword).toHaveBeenCalledWith("password123");
  });

  it("should assign admin role when credentials match admin accounts", async () => {
    mockFindOne.mockResolvedValue(null);
    (parseAdminAccounts as jest.Mock).mockReturnValue(new Map([["admin", "admin123"]]));
    mockCreate.mockResolvedValue({
      _id: "admin123",
      username: "admin",
      email: "admin@b.com",
      displayName: null,
      role: "admin",
      settings: { language: "zh", theme: "light" },
      createdAt: new Date(),
    });

    const res = await register(mockRequest("http://localhost/api/auth/register", { username: "admin", email: "admin@b.com", password: "admin123" }) as any);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data.user.role).toBe("admin");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject missing fields", async () => {
    const res = await login(mockRequest("http://localhost/api/auth/login", { email: "a@b.com" }) as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("MISSING_FIELDS");
  });

  it("should reject non-existent user", async () => {
    mockFindOne.mockResolvedValue(null);
    const res = await login(mockRequest("http://localhost/api/auth/login", { email: "nobody@b.com", password: "password123" }) as any);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should reject wrong password", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user123",
      email: "a@b.com",
      passwordHash: "$2a$12$hash",
      role: "user",
    });
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    const res = await login(mockRequest("http://localhost/api/auth/login", { email: "a@b.com", password: "wrongpass" }) as any);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should login successfully with correct credentials", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user123",
      username: "testuser",
      email: "a@b.com",
      displayName: "Test",
      role: "user",
      settings: { language: "zh", theme: "light" },
      createdAt: new Date(),
      passwordHash: "$2a$12$hash",
    });
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const res = await login(mockRequest("http://localhost/api/auth/login", { email: "a@b.com", password: "password123" }) as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.username).toBe("testuser");
    expect(data.data.token).toBeDefined();
  });
});
