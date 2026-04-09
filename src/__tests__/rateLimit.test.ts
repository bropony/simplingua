import { rateLimit } from "@/lib/rateLimit";

// Mock a minimal Request-like object with headers
function mockRequest(ip?: string): { headers: { get: (name: string) => string | null } } {
  return {
    headers: {
      get: (name: string) => {
        if (name === "x-forwarded-for") return ip ?? null;
        return null;
      },
    },
  };
}

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const result = rateLimit(mockRequest("1.2.3.4") as unknown as Request, { windowMs: 60_000, max: 3 });
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests exceeding the limit", () => {
    const req = mockRequest("5.6.7.8") as unknown as Request;
    rateLimit(req, { windowMs: 60_000, max: 2 });
    rateLimit(req, { windowMs: 60_000, max: 2 });
    const result = rateLimit(req, { windowMs: 60_000, max: 2 });
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("sets rate limit headers", () => {
    const result = rateLimit(mockRequest("9.10.11.12") as unknown as Request, { windowMs: 60_000, max: 10 });
    expect(result.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(result.headers.get("X-RateLimit-Remaining")).toBe("9");
  });

  it("tracks different IPs independently", () => {
    rateLimit(mockRequest("a") as unknown as Request, { windowMs: 60_000, max: 1 });
    rateLimit(mockRequest("a") as unknown as Request, { windowMs: 60_000, max: 1 });

    const resultB = rateLimit(mockRequest("b") as unknown as Request, { windowMs: 60_000, max: 1 });
    expect(resultB.limited).toBe(false);

    const resultA = rateLimit(mockRequest("a") as unknown as Request, { windowMs: 60_000, max: 1 });
    expect(resultA.limited).toBe(true);
  });
});
