# Simplingua Project Progress

**Last Updated**: 2025-03-02
**Status**: Core Implementation Complete
**Phase**: Ready for Testing & Deployment

---

## Overview

Simplingua is a conlang learning platform with FastAPI backend, Next.js frontend, PostgreSQL database, and multi-provider AI support.

**Architecture**: Full-stack web application with:
- Backend: FastAPI + LangGraph + PostgreSQL/pgvector
- Frontend: Next.js 14 + TypeScript + TailwindCSS
- AI: Multi-provider (DeepSeek, OpenAI, Anthropic, Local/Ollama)
- Deployment: Docker Compose

---

## What Was Built

### 1. Toolkit (`toolkit/`)
**Purpose**: Parse and import Simplingua language documentation

- **parse_dictionary.py**: Parses `docs/dictionary-in-cn.txt` with support for:
  - Part-of-speech tags [名], [动], etc.
  - Verb types {他}, {不及}, etc.
  - Pronunciation /ipa/
  - Multi-language definitions
  - Derivatives |, -, #, ⟨⟩, <>
  - Examples and usage notes

- **parse_grammar.py**: Parses `docs/grammar-in-cn.txt` with:
  - 28 grammar sections mapped by Chinese titles
  - Subsections and rules
  - Examples and exceptions
  - Level indicators (beginner/intermediate/advanced)

- **upload.py**: Uploads parsed JSON to PostgreSQL database
  - Creates tables if needed
  - Handles word derivatives
  - Populates grammar with sections reference

### 2. Backend (`backend/`)
**Purpose**: RESTful API with AI chat capabilities

**Core Infrastructure:**
- `app/config.py` - Environment configuration (Settings class)
- `app/core/database.py` - SQLAlchemy engine and session management
- `app/core/security.py` - JWT tokens, password hashing (bcrypt)
- `app/core/embeddings.py` - Multi-provider embedding generation

**Database Models (`app/models/`):**
- `user.py` - User accounts with timestamps
- `word.py` - Words with linguistic data (10+ fields including verb_type, pronunciation, derivatives)
- `word_derivative.py` - Word derivatives and relationships
- `grammar.py` - Grammar rules with hierarchical structure
- `grammar_section.py` - Grammar section reference table
- `textbook.py` - Textbook chapters and lessons
- `forum_post.py` - Forum posts, replies, votes
- `analytics_event.py` - Usage analytics

**API Routers (`app/api/`):**
- `wiki.py` - 12 endpoints for knowledge base:
  - Search (words, grammar, context-aware)
  - Word details, conjugation, translation
  - Grammar sections, rules, sentence analysis
  - Word relations, derivatives
- `chat.py` - SSE streaming chat endpoint
- `auth.py` - Register, login, logout, token refresh
- `users.py` - Profile management
- `valva.py` - Forum posts, replies, votes, flags
- `admin.py` - Content moderation, user management
- `phonetics.py` - Pronunciation rules
- `morphology.py` - Affixes, word formation
- `etymology.py` - Word derivation chains

**LangGraph Agents (`app/agents/`):**
4-agent workflow for chat:
1. **Intent Agent** - Analyze user intent and context
2. **Retrieval Agent** - Retrieve knowledge from database with vector search
3. **Generation Agent** - Generate response using selected AI provider
4. **Validation Agent** - Validate response quality and accuracy

- `graph.py` - Main workflow with conditional retry logic
- `state.py` - Shared state between agents

**AI Providers (`app/providers/`):**
Abstract interface with concrete implementations:
- `base.py` - AIProvider ABC
- `deepseek.py` - DeepSeek implementation (default)
- `openai.py` - OpenAI implementation
- `anthropic.py` - Anthropic implementation
- `local.py` - Ollama/LM Studio implementation

Factory pattern: `get_provider(provider_name, **kwargs)`

### 3. Frontend (`frontend/`)
**Purpose**: Modern React web interface

**Configuration:**
- `package.json` - Dependencies (React 18, Next.js 14, TailwindCSS, etc.)
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Custom theme with Simplingua colors
- `next.config.js` - API rewrites and build configuration

**Components (`src/components/ui/`):**
- `Header.tsx` - Navigation with auth state
- `Footer.tsx` - Footer with links
- `Button.tsx` - Reusable button component
- `Card.tsx` - Card container component
- `Input.tsx` - Form input component

**Pages (`src/app/`):**
- `page.tsx` - Homepage with features overview
- `wiki/search/page.tsx` - Knowledge base search with tabs
- `wiki/words/[id]/page.tsx` - Word details page
- `grammar/page.tsx` - Grammar reference page
- `chat/page.tsx` - AI chat with SSE streaming
- `auth/login/page.tsx` - Login form
- `auth/register/page.tsx` - Registration form
- `valva/posts/page.tsx` - Forum posts list

**Libraries (`src/lib/`):**
- `api.ts` - Complete API client with typed functions:
  - `authApi` - Authentication endpoints
  - `wikiApi` - Knowledge base endpoints
  - `chatApi` - Chat endpoints (with SSE)
  - `userApi` - User management
  - `forumApi` - Forum endpoints
- `auth.ts` - JWT token management (localStorage, getAuthHeader)

**Types (`src/types/index.ts`):**
- TypeScript interfaces for all API responses

### 4. Infrastructure
**Docker Configuration:**
- `docker-compose.yml` - 3-service stack:
  - `postgres` - PostgreSQL 16 with pgvector
  - `backend` - FastAPI application
  - `frontend` - Next.js application
- Networks: `internal` (postgres + backend), `external` (frontend + backend)
- Volumes: `postgres_data` for persistence

**Environment:**
- `.env.example` - Template with all required variables
- Minimum required: `AI_DEEPSEEK_API_KEY`

---

## Key Technical Decisions

### Backend Decisions

1. **Multi-Provider AI**: Abstract interface allows switching AI providers without code changes. DeepSeek is default (cost-effective, fast).

2. **LangGraph for Chat**: 4-agent workflow provides:
   - Intent understanding
   - Context-aware retrieval with vector search
   - Multi-step generation with validation
   - Conditional retry for quality assurance

3. **JWT with Refresh Tokens**: Access tokens (30 min) + refresh tokens (7 days) for security without frequent re-login.

4. **PostgreSQL + pgvector**: Relational database with vector similarity search for semantic word matching.

5. **SSE for Chat**: Server-Sent Events provide real-time streaming without WebSocket complexity.

6. **SQLAlchemy ORM**: Type-safe database operations with automatic migrations (Alembic included).

### Frontend Decisions

1. **Next.js 14 App Router**: File-based routing, automatic code splitting, server components.

2. **TypeScript**: Full type safety across components and API calls.

3. **TailwindCSS**: Utility-first CSS with custom Simplingua color theme.

4. **EventSource for SSE**: Native browser API for chat streaming.

5. **LocalStorage for Tokens**: Client-side token storage with automatic header injection.

### Database Schema Decisions

1. **JSONB for Complex Data**: Used for definitions, examples, rules (supports multi-language, structured data).

2. **UUID Primary Keys**: Distributed-system friendly, no ID collision issues.

3. **Hierarchical Grammar**: Grammar rules reference `grammar_section` for organized retrieval.

4. **Word Derivatives Table**: Separate table allows tracking multiple relationships.

---

## Current Status

### Completed ✓
- [x] All backend API endpoints (12 wiki endpoints, chat, auth, users, forum, admin, phonetics, morphology, etymology)
- [x] LangGraph 4-agent chat workflow
- [x] Multi-provider AI abstraction
- [x] Frontend core pages (home, wiki search, word details, grammar, chat, auth, forum)
- [x] UI component library (Header, Footer, Button, Card, Input)
- [x] API client with full typing
- [x] Docker Compose configuration
- [x] Toolkit for parsing dictionary and grammar
- [x] Deployment documentation (production and dev)
- [x] Environment configuration templates

### Not Implemented (Future Work)
- [ ] Profile settings page (`/profile/settings`)
- [ ] Admin dashboard pages (`/admin/*`)
- [ ] Forum post creation and reply pages
- [ ] Vocabulary management (add to vocabulary, practice)
- [ ] Analytics dashboard
- [ ] Textbook reader
- [ ] Audio pronunciation
- [ ] Spaced repetition flashcards
- [ ] Progress tracking
- [ ] Achievements/badges system

### Testing
- [ ] Backend tests (pytest)
- [ ] Frontend tests (Jest, React Testing Library)
- [ ] E2E tests (Playwright)

---

## Recent Fixes (2025-03-02)

All consistency issues have been resolved:

### Backend Fixes
1. **Word Search Filter Bug** (`backend/app/api/wiki.py:130`)
   - Fixed: `Word.pos == f"[{pos}]"` → `Word.pos == pos`
   - Issue: Brackets were being added to filter, causing no matches

2. **Word Derivatives Not Populated** (`backend/app/api/wiki.py:150-151`)
   - Fixed: Now queries `WordDerivative` table and populates `derivatives` and `natural_prefix_derivatives`
   - Added import for `WordDerivative` model

3. **Grammar Section Naming** (`backend/app/schemas/grammar.py:29`)
   - Fixed: `section` → `section_id`, `subsection` → `subsection_id`
   - Updated API responses to match model naming

4. **Phonetics Bug** (`backend/app/api/phonetics.py:149`)
   - Fixed: `syllable_count` → `len(syllables)`
   - Variable was undefined, causing error

5. **Missing Response Schemas**
   - Created: `backend/app/schemas/admin.py` - Admin endpoint schemas
   - Created: `backend/app/schemas/phonetics.py` - Phonetics schemas
   - Created: `backend/app/schemas/morphology.py` - Morphology schemas
   - Created: `backend/app/schemas/etymology.py` - Etymology schemas
   - Created: `backend/app/schemas/word_derivative.py` - WordDerivative schema
   - Created: `backend/app/schemas/textbook.py` - Textbook schema
   - Created: `backend/app/schemas/analytics.py` - Analytics schema
   - Updated all admin/phonetics/morphology/etymology endpoints to use `response_model`

6. **Missing Endpoints**
   - Added: `morphology/analyze/{word}` endpoint for word morphological analysis
   - Added: `etymology/word` endpoint (by word name)
   - Added: `etymology/related/{word_id}` endpoint
   - Added: `phonetics/analyze` endpoint for pronunciation analysis

### Frontend Fixes
1. **Vote API Parameter Mismatch** (`frontend/src/lib/api.ts:192`)
   - Fixed: `vote_type` now correctly maps to `voteType` parameter
   - Body: `{ vote_type: voteType }`

2. **Translate API Parameter**
   - Fixed: Changed from generic params object to named parameters
   - Signature: `translate(text, from, to, pos?, context?, token?)`

3. **Register API Parameter**
   - Fixed: `preferredLanguage` → `preferred_language: preferredLanguage`
   - Proper snake_case conversion for backend

4. **Missing API Methods**
   - Added: `wikiApi.getRandomWord()` - Get random word
   - Added: `wikiApi.conjugateVerb()` - Verb conjugation
   - Added: `wikiApi.getWordRelations()` - Word relations
   - Added: `phoneticsApi` - Complete phonetics API (pronounce, rules, analyze)
   - Added: `morphologyApi` - Complete morphology API (affixes, generate, analyze)
   - Added: `etymologyApi` - Complete etymology API (word, chain, related)

5. **TypeScript Interface Updates**
   - Fixed: `GrammarRule` uses `section_id` and `subsection_id`
   - Added: New interfaces for phonetics, morphology, etymology responses
   - Added: `WikiSearchResult`, `WikiSearchResults` for search

---

## How to Run

### Quick Start (Docker Compose)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your DeepSeek API key to .env
# AI_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# 3. Start services
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

### Import Dictionary and Grammar

```bash
cd toolkit
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python parse_dictionary.py ../docs/dictionary-in-cn.txt > dictionary.json
python parse_grammar.py ../docs/grammar-in-cn.txt > grammar.json
python upload.py
```

---

## Known Issues

1. **Fixed**: Malformed directory `{src` - Removed, files are in correct `frontend/src/`

2. **Not Tested**: Chat streaming SSE needs testing with real AI provider

3. **Frontend Build**: Production build not yet tested

4. **Database Migration**: Alembic configured but migrations not created/ran

---

## Next Steps

### Immediate (Before First Deploy)

1. **Set up AI Provider**:
   - Get DeepSeek API key from https://platform.deepseek.com/
   - Add to `.env` file
   - Test with: `curl https://api.deepseek.com/v1/models`

2. **Test Database Connection**:
   - Ensure PostgreSQL is running
   - Test: `psql $DATABASE_URL -c "SELECT 1;"`

3. **Import Initial Data**:
   - Run toolkit parsers
   - Upload dictionary and grammar to database
   - Verify import: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM words;"`

4. **Test Core Functionality**:
   - Backend: `curl http://localhost:8000/health`
   - Wiki search: Visit `/wiki/search`
   - Chat: Visit `/chat` and send a message
   - Auth: Test register/login flow

### Short Term (Week 1)

1. **Add Missing Pages**:
   - Profile settings page
   - Admin dashboard
   - Forum post creation/reply

2. **Fix Issues Found**:
   - Any bugs discovered during testing
   - Edge cases in chat workflow
   - UI/UX improvements

3. **Add Tests**:
   - Backend API tests
   - Frontend component tests

### Medium Term (Month 1)

1. **Advanced Features**:
   - Vocabulary management
   - Spaced repetition system
   - Progress tracking
   - Audio pronunciation

2. **Performance Optimization**:
   - Database query optimization
   - Frontend bundle optimization
   - Caching layer (Redis)

3. **Production Hardening**:
   - SSL/TLS setup
   - Rate limiting
   - Security audit
   - Monitoring setup

### Long Term

1. **Community Features**:
   - User-generated content
   - Social features
   - Leaderboards

2. **Advanced AI**:
   - Custom model fine-tuning
   - Voice chat
   - Multimodal learning

3. **Mobile App**:
   - React Native or Flutter
   - Offline mode

---

## File Structure Reference

```
simplingua/
├── toolkit/                      # Parsing and upload utilities
│   ├── parse_dictionary.py
│   ├── parse_grammar.py
│   ├── upload.py
│   └── requirements.txt
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── __init__.py          # Main FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── core/                # Database, security, embeddings
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # Route handlers
│   │   ├── agents/              # LangGraph agents
│   │   └── providers/           # AI provider implementations
│   ├── alembic/                 # Database migrations
│   ├── tests/                   # Backend tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
├── frontend/                     # Next.js application
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/ui/       # UI components
│   │   ├── lib/                 # API client, auth utilities
│   │   ├── styles/              # Global styles
│   │   └── types/               # TypeScript types
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── docs/                        # Documentation
│   ├── blueprint.md             # API specifications
│   ├── grammar-in-cn.txt        # Grammar reference (Chinese)
│   ├── dictionary-in-cn.txt     # Dictionary (Chinese)
│   ├── DEPLOY.md                # Production deployment guide
│   ├── DEPLOY-dev.md            # Development setup guide
│   └── PROGRESS.md              # This file
├── data/                        # Parsed JSON output
├── .env.example                  # Environment template
├── docker-compose.yml            # Docker services
└── README.md                     # Project overview
```

---

## Important Notes for Future Work

### When Modifying Backend

1. **Always update schemas** in `app/schemas/` when changing models
2. **Add API tests** for new endpoints
3. **Update API documentation** at `/docs` (auto-generated from schemas)
4. **Database changes**: Create Alembic migration: `alembic revision --autogenerate -m "description"`

### When Modifying Frontend

1. **Use existing components** from `components/ui/` when possible
2. **Follow typing conventions** from `types/index.ts`
3. **Use API client** from `lib/api.ts` - don't make direct fetch calls
4. **Test on mobile** - use Tailwind responsive classes

### When Adding AI Features

1. **Use provider abstraction** - don't hardcode DeepSeek calls
2. **Update LangGraph workflow** if adding new agent capabilities
3. **Consider caching** for expensive AI operations
4. **Add fallback logic** when AI provider fails

### Database Queries

1. **Use pgvector for similarity search**: `model.embedding <=> query_embedding`
2. **Index vector columns**: `CREATE INDEX ON words USING ivfflat (embedding vector_cosine_ops)`
3. **Use JSONB operators**: `definitions->>'en'` for specific language
4. **Consider query limits** for performance: always use `.limit()` or `LIMIT` clause

---

## Contact & Support

For questions or issues:
1. Check `docs/DEPLOY-dev.md` for setup issues
2. Check `docs/DEPLOY.md` for production issues
3. Review logs: `docker-compose logs -f <service>`
4. API documentation: http://localhost:8000/docs

---

## Summary

The core Simplingua platform is fully implemented and ready for testing. The backend provides comprehensive APIs for language learning features, the frontend has a modern React interface, and the entire stack can be deployed via Docker Compose.

Key areas for immediate attention:
1. Configure AI API key (DeepSeek)
2. Import dictionary and grammar data
3. Test core functionality
4. Add missing pages (profile, admin, forum creation)

The project is in a good state for iterative development - start with testing what exists, then add features as needed.
