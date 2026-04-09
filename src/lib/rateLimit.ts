/**
 * In-memory sliding window rate limiter.
 *
 * Edge-runtime compatible — no Node.js APIs used.
 *
 * Usage:
 *   const { limited, headers } = rateLimit(request, { windowMs: 60_000, max: 10 });
 *   if (limited) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers });
 */

interface RateLimitOptions {
  /** Time window in milliseconds (default 60_000 = 1 min) */
  windowMs?: number;
  /** Max requests per window (default 10) */
  max?: number;
  /** Optional key override — defaults to client IP */
  key?: string;
}

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
  headers: Headers;
}

interface HitEntry {
  timestamps: number[];
}

// Global store persisted across requests in the same runtime instance.
const globalForStore = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, HitEntry>;
};
if (!globalForStore.__rateLimitStore) {
  globalForStore.__rateLimitStore = new Map<string, HitEntry>();
}
const store: Map<string, HitEntry> = globalForStore.__rateLimitStore;

// Periodically purge expired entries to avoid memory leaks.
let lastCleanup = 0;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const keysToDelete: string[] = [];
  store.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60 * 60 * 1000);
    if (entry.timestamps.length === 0) keysToDelete.push(key);
  });
  keysToDelete.forEach((key) => store.delete(key));
}

function getClientIp(request: Request): string {
  // Try common proxy headers first
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 10;
  const key = options.key ?? `ip:${getClientIp(request)}`;

  const now = Date.now();
  const windowStart = now - windowMs;

  cleanup(now);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window (sliding window)
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  const limited = entry.timestamps.length >= max;

  if (!limited) {
    entry.timestamps.push(now);
  }

  const remaining = Math.max(0, max - entry.timestamps.length);

  const resetAt = entry.timestamps.length > 0
    ? entry.timestamps[0] + windowMs
    : now + windowMs;

  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(max));
  headers.set("X-RateLimit-Remaining", String(remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

  return { limited, remaining, resetAt, headers };
}
