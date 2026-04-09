# Issues to Fix Before Production

## Critical — Security

### 1. Admin password compared in plaintext
- **File**: `src/app/api/auth/register/route.ts:59`
- **Problem**: `ADMIN_ACCOUNTS` env var stores plaintext passwords. During registration, the raw request password is compared directly against it. Anyone who knows the admin credentials can register as admin.
- **Fix**: Store admin password hashes in env (or a separate config). Compare using `bcrypt.compare()` instead of `===`.

### 2. Regex injection / NoSQL injection in search
- **Files**: `src/app/api/vocabulary/route.ts:29-32`, and any other endpoint using user input in `$regex`
- **Problem**: User input is passed directly into MongoDB `$regex` without escaping. Crafted search terms can cause ReDoS or excessively slow queries.
- **Fix**: Escape regex special characters before using in queries, or use `$text` index with `$search` instead.

### 3. No rate limiting
- **Problem**: Registration, login, and all public API endpoints have no rate limiting. Vulnerable to brute-force attacks and abuse.
- **Fix**: Add rate limiting middleware (e.g., `next-rate-limit`, or a reverse-proxy level solution via Nginx).

### 4. No CORS configuration
- **Problem**: Spec requires CORS; not implemented. API is accessible from any origin.
- **Fix**: Configure CORS headers in Next.js config or middleware for API routes.

### 5. JWT secret fallback
- **File**: `src/lib/jwt.ts:4`
- **Problem**: Falls back to hardcoded `"dev-secret-change-me"` if `JWT_SECRET` env is missing. Production would silently use a known secret.
- **Fix**: Throw an error at startup if `JWT_SECRET` is not set in production (`if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') throw ...`).

### 6. XSS risk in Markdown content
- **Problem**: Discussion and comment content is rendered as Markdown via `react-markdown`. By default this allows raw HTML, enabling stored XSS.
- **Fix**: Disable HTML in `react-markdown` (use `rehype-sanitize` or set `disallowedElements`), or sanitize HTML before rendering.

---

## Critical — Build & Deployment

### 7. Missing `next.config.js` / `next.config.ts`
- **Problem**: No Next.js config file exists. The Dockerfile (`Dockerfile:35`) copies `.next/standalone`, but without `output: 'standalone'` in config, the build won't produce that output. Docker build will fail.
- **Fix**: Create `next.config.js` with `output: 'standalone'` and any other needed settings.

### 8. Not a git repository
- **Problem**: Project has no `.git` directory and no `.gitignore`. Version control is essential for production workflows.
- **Fix**: `git init`, create `.gitignore` (node_modules, .env*, .next, data/, etc.), make initial commit.

### 9. No deployment documentation
- **Problem**: `docs/design.md` explicitly requires deployment docs for both standalone VPS and Docker. None exist.
- **Fix**: Create deployment guide covering: env var setup, MongoDB setup, Docker instructions, Nginx reverse proxy config, VPS standalone setup.

---

## High — Data Integrity

### 10. Like toggle race condition
- **File**: `src/app/api/like/route.ts:67-77`
- **Problem**: `findOne` → `deleteOne/create` → `$inc` is not atomic. Concurrent like requests can create duplicate likes or cause `likeCount` to drift.
- **Fix**: Use a MongoDB transaction, or use `findOneAndUpdate` with upsert + `$setOnInsert` for atomic toggle. Alternatively, use the unique compound index to catch duplicates and handle the error.

### 11. `commentCount` not updated on Discussion
- **Problem**: When comments are created or deleted, the `commentCount` field on the parent Discussion document is not incremented/decremented.
- **Fix**: Add `$inc: { commentCount: 1 }` when creating a comment, and `$inc: { commentCount: -1 }` when deleting one.

---

## Medium — Missing Features

### 12. No health check endpoint
- **Problem**: No `/api/health` or similar endpoint for load balancer probes or monitoring.
- **Fix**: Add a simple health check route that verifies DB connectivity.

### 13. `resource` tool not implemented
- **Problem**: `tools/resource/` directory does not exist. Spec defines it for generating alphabet charts, pronunciation audio, and OG images.
- **Fix**: Implement or defer with a documented plan. Spec notes this is lower priority.

### 14. Home page statistics are static
- **File**: `src/app/page.tsx`
- **Problem**: Spec requires live stats (word count, grammar chapters, discussion count). Currently shows only static text.
- **Fix**: Fetch counts from API (`/api/admin/stats` or new public endpoint) and render them.

### 15. Prebuild hack masks routing conflict
- **File**: `package.json` line 7
- **Problem**: `prebuild` script deletes a conflicting `[id]` directory. This hides a real routing conflict rather than fixing it.
- **Fix**: Resolve the underlying route conflict (likely between `/api/discussions/[discussionId]` and a stale `/api/discussions/[id]` route). Remove the prebuild hack.

---

## Medium — Testing

### 16. Insufficient test coverage
- **Problem**: Only `src/__tests__/auth.test.ts` exists (~7 test cases for JWT/password utilities). No tests for:
  - API routes (vocabulary, grammar, discussions, comments, likes)
  - MongoDB models
  - Frontend components
  - Integration / E2E flows
- **Fix**: Add at minimum:
  - API route tests for auth, vocabulary, and discussion flows
  - Model validation tests
  - Key component render tests

---

## Low — Code Quality

### 17. `parseAdminAccounts` edge case with colons in passwords
- **File**: `src/lib/auth.ts:22-27`
- **Problem**: `split(":")` on `admin:pass:word` gives `["admin", "pass", "word"]`, takes `[0]` and `[1]` — so password becomes `"pass"` silently. Colons in passwords break parsing.
- **Fix**: Use `split(":", 2)` or `indexOf(":")` to only split on the first colon, so the rest becomes the password.

### 18. Admin auth checked twice (middleware + route handler)
- **Problem**: Admin API routes are protected both by `middleware.ts` and by `requireAdmin()` inside each route handler. This is redundant but not harmful. However, the middleware only checks `/api/admin/*`, while individual routes under `/api/vocabulary`, `/api/grammar` etc. also have admin-only POST/PUT/DELETE that middleware doesn't cover.
- **Fix**: Either extend middleware to cover all admin mutations, or rely solely on route-level checks. Be consistent.

### 19. No input length limits on discussion/comment content
- **Problem**: No maximum length validation on `content` field for discussions and comments. Users could submit extremely large payloads.
- **Fix**: Add reasonable max length (e.g., 10000 chars for discussion content, 2000 for comments).

### 20. `viewCount` on Discussion never incremented
- **Problem**: `discussions` model has a `viewCount` field but no code increments it when a discussion is viewed.
- **Fix**: Add `$inc: { viewCount: 1 }` in the GET `/api/discussions/:id` handler.
