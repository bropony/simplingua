/**
 * @jest-environment node
 *
 * API route tests for vocabulary and discussion endpoints.
 * Tests input validation, auth checks, and response format.
 */

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/Vocabulary", () => {
  const lean = jest.fn().mockResolvedValue([]);
  return {
    __esModule: true,
    default: {
      _lean: lean,
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean,
            }),
          }),
        }),
      }),
      countDocuments: jest.fn().mockResolvedValue(0),
      findOne: jest.fn(),
      create: jest.fn(),
    },
  };
});

jest.mock("@/models/Discussion", () => {
  const lean = jest.fn().mockResolvedValue([]);
  return {
    __esModule: true,
    default: {
      _lean: lean,
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean,
              }),
            }),
          }),
        }),
      }),
      countDocuments: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation((data) => {
        const doc = {
          ...data,
          _id: "disc123",
          populate: jest.fn().mockReturnThis(),
          toJSON: jest.fn().mockReturnValue({ ...data, _id: "disc123" }),
        };
        return Promise.resolve(doc);
      }),
    },
  };
});

jest.mock("@/lib/api", () => ({
  getAuthUser: jest.fn(),
  requireAdmin: jest.fn(),
}));

jest.mock("@/lib/auth", () => {
  const original = jest.requireActual("@/lib/auth");
  return {
    ...original,
    parseAdminAccounts: jest.fn().mockReturnValue(new Map()),
  };
});

import { GET as getVocabulary, POST as createVocabulary } from "@/app/api/vocabulary/route";
import { GET as getDiscussions, POST as createDiscussion } from "@/app/api/discussions/route";
import Vocabulary from "@/models/Vocabulary";
import Discussion from "@/models/Discussion";
import { requireAdmin, getAuthUser } from "@/lib/api";

// Retrieve mock references from the mocked modules
const mockVocabLean = (Vocabulary as any)._lean as jest.Mock;
const mockVocabCount = Vocabulary.countDocuments as jest.Mock;
const mockVocabFindOne = Vocabulary.findOne as jest.Mock;
const mockVocabCreate = Vocabulary.create as jest.Mock;

const mockDiscLean = (Discussion as any)._lean as jest.Mock;
const mockDiscCount = Discussion.countDocuments as jest.Mock;

function mockGetRequest(url: string): Request {
  return new Request(url, { method: "GET" });
}

function mockPostRequest(url: string, body: Record<string, unknown>): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Vocabulary ──────────────────────────────────────────────────

describe("GET /api/vocabulary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated vocabulary list", async () => {
    mockVocabCount.mockResolvedValue(2);
    mockVocabLean.mockResolvedValue([
      { word: "aba", partOfSpeech: "noun", letter: "A" },
      { word: "abe", partOfSpeech: "verb", letter: "A" },
    ]);

    const res = await getVocabulary(mockGetRequest("http://localhost/api/vocabulary?page=1&limit=50") as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(2);
    expect(data.data.items).toHaveLength(2);
  });
});

describe("POST /api/vocabulary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue(null);

    const res = await createVocabulary(mockPostRequest("http://localhost/api/vocabulary", { word: "test", partOfSpeech: "noun" }) as any);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("should reject missing required fields", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({ userId: "admin1", role: "admin" });

    const res = await createVocabulary(mockPostRequest("http://localhost/api/vocabulary", { word: "test" }) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("MISSING_FIELDS");
  });

  it("should reject duplicate vocabulary entry", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({ userId: "admin1", role: "admin" });
    mockVocabFindOne.mockResolvedValue({ word: "test" });

    const res = await createVocabulary(mockPostRequest("http://localhost/api/vocabulary", { word: "test", partOfSpeech: "noun" }) as any);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error.code).toBe("DUPLICATE");
  });

  it("should create vocabulary entry as admin", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({ userId: "admin1", role: "admin" });
    mockVocabFindOne.mockResolvedValue(null);
    mockVocabCreate.mockResolvedValue({ _id: "vocab1", word: "test", partOfSpeech: "noun", letter: "T" });

    const res = await createVocabulary(mockPostRequest("http://localhost/api/vocabulary", { word: "test", partOfSpeech: "noun" }) as any);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.word).toBe("test");
  });

  it("should auto-set letter from word when not provided", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({ userId: "admin1", role: "admin" });
    mockVocabFindOne.mockResolvedValue(null);
    mockVocabCreate.mockResolvedValue({ _id: "vocab1", word: "someword", partOfSpeech: "noun", letter: "S" });

    await createVocabulary(mockPostRequest("http://localhost/api/vocabulary", { word: "someword", partOfSpeech: "noun" }) as any);

    expect(mockVocabCreate).toHaveBeenCalledWith(
      expect.objectContaining({ letter: "S" })
    );
  });
});

// ─── Discussions ──────────────────────────────────────────────────

describe("GET /api/discussions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated discussion list", async () => {
    mockDiscCount.mockResolvedValue(1);
    mockDiscLean.mockResolvedValue([
      { _id: "d1", title: "Test Discussion", content: "Hello", viewCount: 5 },
    ]);

    const res = await getDiscussions(mockGetRequest("http://localhost/api/discussions?page=1&limit=20") as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(1);
  });
});

describe("POST /api/discussions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject unauthenticated requests", async () => {
    (getAuthUser as jest.Mock).mockResolvedValue(null);

    const res = await createDiscussion(mockPostRequest("http://localhost/api/discussions", { title: "Test", content: "body" }) as any);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should reject missing title and content", async () => {
    (getAuthUser as jest.Mock).mockResolvedValue({ userId: "user1", role: "user" });

    const res = await createDiscussion(mockPostRequest("http://localhost/api/discussions", { title: "Only title" }) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("MISSING_FIELDS");
  });

  it("should reject title shorter than 2 chars", async () => {
    (getAuthUser as jest.Mock).mockResolvedValue({ userId: "user1", role: "user" });

    const res = await createDiscussion(mockPostRequest("http://localhost/api/discussions", { title: "T", content: "Some content" }) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_TITLE");
  });

  it("should reject title longer than 200 chars", async () => {
    (getAuthUser as jest.Mock).mockResolvedValue({ userId: "user1", role: "user" });

    const res = await createDiscussion(mockPostRequest("http://localhost/api/discussions", { title: "T".repeat(201), content: "Some content" }) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_TITLE");
  });

  it("should reject content longer than 50000 chars", async () => {
    (getAuthUser as jest.Mock).mockResolvedValue({ userId: "user1", role: "user" });

    const res = await createDiscussion(mockPostRequest("http://localhost/api/discussions", { title: "Valid title", content: "C".repeat(50001) }) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_CONTENT");
  });

  it("should reject more than 10 tags", async () => {
    (getAuthUser as jest.Mock).mockResolvedValue({ userId: "user1", role: "user" });

    const res = await createDiscussion(mockPostRequest("http://localhost/api/discussions", {
      title: "Valid title",
      content: "Valid content",
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    }) as any);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("INVALID_TAGS");
  });
});
