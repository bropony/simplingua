# Ralph Fix Plan

## Phase 1: Project Scaffolding
- [x] Initialize Next.js project with TypeScript and Tailwind CSS
- [x] Set up project directory structure (see architecture spec)
- [x] Configure MongoDB connection with Mongoose
- [x] Set up JWT authentication utilities
- [x] Create .env.example with required environment variables
- [x] Verify build compiles successfully
- [x] Split jwt.ts out of auth.ts to fix Edge Runtime warnings in middleware

## Phase 2: Data Layer
- [x] Implement Mongoose models (users, vocabulary, grammar, discussions, comments, likes)
- [x] Create database indexes per data models spec
- [x] Implement seed script for development data

## Phase 3: Tools — Data Converters (implements two tools first)
- [x] Implement `tools/lexi` — vocabulary text → JSON converter
- [x] Implement `tools/regla` — grammar text → JSON converter
- [x] Test converters with actual source data files
- [x] Implement `tools/resource` — SVG alphabet chart + OG image generator (audio deferred: requires external TTS)

## Phase 4: Authentication API
- [x] POST /api/auth/register — user registration
- [x] POST /api/auth/login — user login with JWT
- [x] GET /api/auth/me — get current user
- [x] PUT /api/auth/me — update profile
- [x] PUT /api/auth/password — change password
- [x] Auth middleware for protected routes

## Phase 5: Vocabulary API & Frontend
- [x] CRUD API endpoints for vocabulary (including admin import/bulk)
- [x] Vocabulary browser page with alphabet navigation
- [x] Word search and part-of-speech filtering
- [x] Word detail page/view
- [x] Resolved: `[word]` directory no longer exists (was cleaned up)

## Phase 6: Grammar API & Frontend
- [x] CRUD API endpoints for grammar (including admin import/bulk)
- [x] Grammar browser with table of contents sidebar
- [x] Chapter view with sections and examples
- [x] Grammar content search

## Phase 7: Discussion System
- [x] Discussion CRUD API endpoints
- [x] Comment CRUD API with nested replies
- [x] Like toggle API
- [x] Discussion list page with sorting and filtering
- [x] Discussion thread page with comment tree
- [x] Markdown rendering for content (via react-markdown)
- [x] New discussion creation page (/discussions/create)
- [x] Edit discussion page (/discussions/[id]/edit)

## Phase 8: Admin Interface
- [x] Admin dashboard with stats
- [x] Admin vocabulary management (list, add, edit, delete, import)
- [x] Admin grammar management (list, add, edit, delete, import)
- [x] Admin discussion management (pin, lock, delete)

## Phase 9: User Settings & Polish
- [x] User settings page
- [x] Login page (/login)
- [x] Register page (/register)
- [x] Word detail page (/vocabulary/[word]) — uses search API to find word by name
- [x] Mobile hamburger menu in Header
- [x] Landing page with hero and feature cards
- [x] Responsive design pass (remaining edge cases)
- [x] Loading states and error handling
- [x] SEO meta tags

## Phase 10: Deployment
- [x] Dockerfile and docker-compose.yml
- [x] Standalone VPS deployment documentation
- [x] Resource tool: alphabet chart + OG images (audio deferred)

## Phase 11: Polish & Cleanup
- [x] Custom 404 not-found page
- [x] Remove unused Placeholder.ts component
- [x] Dark mode implementation (Tailwind `darkMode: "class"`)
  - ThemeProvider component manages `dark` class on `<html>`, persists to localStorage
  - Settings page theme toggle now functional (removed "coming soon" text)
  - globals.css dark mode defaults for form elements and prose
  - All pages updated with `dark:` Tailwind variants

## Phase 12: Security & Production Readiness
- [x] Fix admin password comparison to use bcrypt instead of plaintext (`src/app/api/auth/register/route.ts`)
- [x] Escape regex special characters in search queries to prevent ReDoS (`src/app/api/vocabulary/route.ts`, `src/app/api/discussions/route.ts`)
- [x] Add rate limiting to registration, login, and public API endpoints
- [x] Configure CORS headers for API routes
- [x] Throw error at startup if JWT_SECRET is missing in production (`src/lib/jwt.ts`)
- [x] Disable raw HTML in react-markdown to prevent XSS (add `rehype-sanitize`)
- [x] Create `next.config.js` with `output: 'standalone'` for Docker builds
- [x] Create deployment documentation (env vars, MongoDB, Docker, Nginx, VPS)
- [x] Fix like toggle race condition with atomic operation (`src/app/api/like/route.ts`)
- [x] Add `$inc: { commentCount: ±1 }` when creating/deleting comments
- [x] Add `/api/health` endpoint for load balancer probes
- [x] Fetch live stats from API for home page (`src/app/page.tsx`)
- [x] Resolve underlying route conflict and remove prebuild hack in `package.json`
- [x] Add API route tests and model validation tests
- [x] Fix `parseAdminAccounts` to handle colons in passwords (`src/lib/auth.ts`)
- [x] Consolidate admin auth checks (middleware vs route handler)
- [x] Add input length limits on discussion/comment content
- [x] Increment `viewCount` when viewing a discussion
- [x] Add schema validation (zod) for API input — replace manual validation with zod schemas on all endpoints
- [x] Create README.md — project overview, setup instructions, usage guide

## Completed
- [x] Project enabled for Ralph
- [x] Read design.md and understand project purpose
- [x] Generate comprehensive specs in .ralph/specs/
- [x] Update AGENT.md with build/run instructions

## Notes
- Specs are in `.ralph/specs/` — read them before implementing each phase
- Tools (lexi, regla) should be built early so data can be imported for testing
- Admin accounts via env vars: `ADMIN_ACCOUNTS=user:pass,user2:pass2`
- All UI text in Chinese (Simplified)
- Use China-friendly CDNs only (no Google Fonts, no Cloudflare JS)
- Focus on one phase at a time, one task per loop
- Using `jose` (not `jsonwebtoken`) for JWT — Edge runtime compatible
- Split JWT into `lib/jwt.ts` (edge-safe) and `lib/auth.ts` (bcrypt, node-only) to fix middleware warnings
- Seed script: `npm run seed` (uses tsx to run scripts/seed.ts)
- Admin credentials for seed: admin/admin123, test user: testuser/user123
- Tool scripts: `npm run tools:lexi` and `npm run tools:regla` generate data/vocabulary.json and data/grammar.json
- lexi parses 2062 entries from 23 letters with 0 errors
- regla parses 23 chapters with 69 sections
- 10 tests for both converters, all passing
- Fixed jest.config.js (removed invalid setupFilesAfterSetup option)
- Phase 4 auth API complete: register, login, me (GET/PUT), password change endpoints
- Fixed db.ts: moved MONGODB_URI check from module scope to connectDB() to allow build without .env.local
- Fixed middleware matcher for exact route matching (/api/auth/me not /api/auth/me/:path*)
- Added jest.polyfills.ts for TextEncoder/TextDecoder (needed by jose in jsdom env)
- jest.config.js: uses async wrapper to set transformIgnorePatterns for jose ESM
- 9 auth unit tests passing (JWT sign/verify, password hash/verify, admin account parsing)
- Phase 5 vocabulary API already existed (CRUD, import, bulk delete) — fully functional
- Phase 5 frontend: vocabulary browser page with alphabet nav, search, POS filter, pagination
- Phase 5 frontend: word detail page with definitions, pronunciation, gender forms, related words
- Shared layout: Header component with nav links and auth state, Footer component
- BUILD BLOCKED: resolved — `[word]` directory no longer exists
- Fixed lib/api.ts: made getAuthUser/requireAdmin async (verifyToken returns Promise)
- Phase 6 frontend complete: grammar browser page with TOC sidebar, chapter view (sections/subsections/examples), in-page search, prev/next navigation, mobile responsive sidebar
- Phase 7 API complete: Discussion CRUD (list/create/get/update/delete), Comment CRUD (list/create/update/delete with nested replies), Like toggle
- API routes use `[discussionId]` slug (not `[id]`) under `/api/discussions/` to avoid conflicts
- prebuild script in package.json removes any leftover `[id]` directory before build
- Comment delete recursively removes child replies and their likes
- Like toggle creates/removes like record and increments/decrements likeCount on target
- Sandbox cannot delete directories with `[bracket]` names — use prebuild hook or manual cleanup
- Cleanup temp files: `cleanup.sh`, `_cleanup.cjs` still exist (safe to delete manually)
- Phase 7 frontend complete: discussion list page (sort/filter/search/pagination), discussion thread page (markdown content, comment tree with nested replies, like button), create discussion page, edit discussion page
- Added react-markdown dependency for markdown rendering in discussions
- Phase 8 admin dashboard: GET /api/admin/stats endpoint (counts for users/vocab/grammar/discussions/comments + 5 recent discussions)
- Admin layout with sidebar nav (仪表盘/词汇管理/语法管理/讨论管理), auth guard redirects non-admins
- Admin dashboard page: stat cards, quick action links, recent discussions list
- Header already has admin link for admin users (管理后台)
- Phase 8 admin vocabulary: list page with search/letter filter/pagination, import JSON (file upload), delete all (with confirmation modal), inline delete per entry, add/edit forms with dynamic definitions and examples
- Created API route /api/vocabulary/[id] for GET/PUT/DELETE individual vocabulary entries (was missing)
- Phase 8 admin grammar: list page (order/title/section count table, import JSON, delete all, inline delete), new chapter page (nested sections/subsections/examples form), edit chapter page (loads existing data, same nested form)
- Phase 8 admin discussions: list page (title/author/comments/views/status columns, search, pagination), toggle pin/unpin, toggle lock/unlock, delete with confirmation modal
- Phase 9 user settings page: profile view (username/email/role/registration date), display name editing, password change form (with confirmation), theme preference (light/dark toggle, dark coming soon), auth guard redirects to /login if not authenticated
- Login page (/login): email + password form, links to register, stores JWT token in localStorage
- Register page (/register): username + email + password + confirm password, client-side validation (username 3-30 chars, password 8+ chars), links to login, auto-login after registration
- Word detail page (/vocabulary/[word]): breadcrumb, word header with POS badge, definitions with examples, gender forms, related words with links. Fetches via search API
- Header mobile menu: hamburger button (visible on sm: breakpoint), dropdown nav with overlay, closes on link click or outside tap
- Home page: hero section with site description and CTA buttons, 3 feature cards (vocabulary/grammar/discussions) linking to respective pages
- Loading states: reusable LoadingSpinner (animated spinner) and ErrorMessage (error icon + retry button) components
- Added loading.tsx route files for vocabulary, grammar, discussions, settings, admin — provides instant navigation feedback
- Added error.tsx route files for vocabulary, grammar, discussions, settings, admin — route-level error boundaries with retry
- Updated inline loading/error states in vocabulary, grammar, discussions list, discussion detail, and word detail pages — errors now user-visible with retry buttons instead of console.error only
- SEO metadata: root layout has title template (%s | 简语 Simplingua), Open Graph tags, keywords; per-route layouts for vocabulary, grammar, discussions, settings, login, register with unique titles and descriptions
- Responsive design pass: increased alphabet button touch targets (w-9→w-10, 40px), header hamburger padding (p-1→p-2), discussion stat icons (w-4→w-5), added flex-wrap for discussion tags and home CTA buttons, admin tables now scroll horizontally on mobile (overflow-x-auto + min-width) instead of hiding columns, admin sidebar uses horizontal nav on mobile, vocabulary definitions use break-words, cleaned up temp files (cleanup.sh, _cleanup.cjs, _cleanup.py, cleanup.js, -p/, mkdir/)
- Dark mode: enabled `darkMode: "class"` in tailwind.config.ts, created ThemeProvider component (reads localStorage + system preference, applies dark class to html), updated root layout with dark body bg + ThemeProvider wrapper, globals.css dark defaults for form elements/prose, settings page theme toggle now functional with immediate DOM update + server sync, all 20+ page components updated with dark: variants
- Admin bcrypt fix: register route now supports bcrypt hashes in ADMIN_ACCOUNTS env var (detected by `$2a$`/`$2b$` prefix), falls back to plaintext comparison with a warning for legacy configs. Updated .env.example with bcrypt guidance
- Rate limiting: in-memory sliding window rate limiter in `src/lib/rateLimit.ts`, applied in middleware. Auth endpoints (login/register): 5 req/min per IP. General API: 60 req/min per IP. Returns 429 with X-RateLimit-* headers. 4 unit tests
- commentCount was already implemented in comment create ($inc +1) and delete ($inc -N including descendants). Marked as done.
- Health endpoint: GET /api/health returns { status, timestamp, db } — 200 if MongoDB connected, 503 otherwise. No DB connect call — just reads mongoose.connection.readyState.
- Input length limits: discussion content max 50000 chars, comment content max 10000 chars, tags max 10. Applied on create and update routes for both discussions and comments.
- viewCount: already implemented via `$inc: { viewCount: 1 }` in GET /api/discussions/:discussionId
- next.config.js: already has `output: 'standalone'`
- docs/deploy.md: already has full deployment docs (Docker + standalone VPS)
- CORS: extracted to `src/lib/cors.ts` (getAllowedOrigin + buildCorsHeaders), used by middleware. Production: allows only NEXT_PUBLIC_APP_URL origin. Development: allows localhost/127.0.0.1. Same-origin requests (no Origin header) skip CORS entirely. Preflight OPTIONS returns 204 with CORS headers, or 403 if origin not allowed. 11 unit tests
- Prebuild hack removed: the conflicting `[id]` directory under discussions no longer exists (renamed to `[discussionId]` in earlier phase), so the prebuild script in package.json was a no-op and has been removed
- Admin auth consolidation: middleware now protects ALL admin-only routes — `/api/admin/*` (all methods) + `/api/vocabulary/*` and `/api/grammar/*` (non-GET methods). Handler-level `requireAdmin()` kept as defense-in-depth. Public `/api/stats` endpoint (GET) added for home page with no auth required.
- API route tests: `src/__tests__/api-auth.test.ts` (11 tests — register validation, login validation, success flows, admin role assignment), `src/__tests__/api-vocabulary-discussions.test.ts` (14 tests — vocab CRUD validation, discussion CRUD validation, auth checks, input limits), `src/__tests__/utils.test.ts` (5 tests — escapeRegex special char escaping). Total: 64 tests across 8 suites, all passing.
