import { getAllowedOrigin, buildCorsHeaders } from "@/lib/cors";

describe("getAllowedOrigin", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns empty string when no origin header", () => {
    expect(getAllowedOrigin({ origin: null })).toBe("");
  });

  it("returns the matching origin when appUrl is configured and matches", () => {
    expect(
      getAllowedOrigin({
        origin: "https://simplingua.example.com",
        appUrl: "https://simplingua.example.com",
      })
    ).toBe("https://simplingua.example.com");
  });

  it("returns empty string when appUrl is configured but origin does not match", () => {
    expect(
      getAllowedOrigin({
        origin: "https://evil.example.com",
        appUrl: "https://simplingua.example.com",
      })
    ).toBe("");
  });

  it("allows localhost origins in development mode without appUrl", () => {
    expect(
      getAllowedOrigin({
        origin: "http://localhost:3000",
        nodeEnv: "development",
      })
    ).toBe("http://localhost:3000");
  });

  it("allows 127.0.0.1 origins in development mode without appUrl", () => {
    expect(
      getAllowedOrigin({
        origin: "http://127.0.0.1:3000",
        nodeEnv: "development",
      })
    ).toBe("http://127.0.0.1:3000");
  });

  it("rejects non-localhost origins in development mode without appUrl", () => {
    expect(
      getAllowedOrigin({
        origin: "https://evil.example.com",
        nodeEnv: "development",
      })
    ).toBe("");
  });

  it("rejects localhost origins in production mode without appUrl", () => {
    expect(
      getAllowedOrigin({
        origin: "http://localhost:3000",
        nodeEnv: "production",
      })
    ).toBe("");
  });

  it("handles invalid origin URLs gracefully", () => {
    expect(
      getAllowedOrigin({
        origin: "not-a-valid-url",
        nodeEnv: "development",
      })
    ).toBe("");
  });

  it("prefers appUrl over development mode", () => {
    expect(
      getAllowedOrigin({
        origin: "http://localhost:3000",
        appUrl: "https://simplingua.example.com",
        nodeEnv: "development",
      })
    ).toBe("");
  });
});

describe("buildCorsHeaders", () => {
  it("returns empty headers when origin is empty", () => {
    const headers = buildCorsHeaders("");
    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(headers.get("Access-Control-Allow-Credentials")).toBeNull();
  });

  it("sets all CORS headers when origin is provided", () => {
    const headers = buildCorsHeaders("https://simplingua.example.com");
    expect(headers.get("Access-Control-Allow-Origin")).toBe("https://simplingua.example.com");
    expect(headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, PUT, DELETE, OPTIONS");
    expect(headers.get("Access-Control-Allow-Headers")).toBe("Content-Type, Authorization");
  });
});
