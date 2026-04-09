# Simplingua (简语)

简语学习与讨论平台 — Language learning and discussion platform for the constructed language [Simplingua](https://en.wikipedia.org/wiki/Simplingua), created by Louis Rosa. Built for Chinese constructed language enthusiasts.

## Features

- **Vocabulary Browser** — Searchable, browsable dictionary with alphabet navigation, part-of-speech filtering, and detailed word entries
- **Grammar Reference** — Full grammar book rendered as a navigable reference with table of contents, section hierarchy, and in-page search
- **Discussion Forum** — Threaded discussions with nested comments, likes, markdown support, pin/lock moderation
- **Admin Dashboard** — Manage vocabulary, grammar, and discussions; bulk import via JSON; user stats
- **User System** — Registration, login, profile settings, dark mode
- **Dark Mode** — Full dark theme support with system preference detection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB 6+ (Mongoose ODM) |
| Auth | JWT (jose, Edge-compatible) + bcrypt |
| Styling | Tailwind CSS 3 |
| Testing | Jest + Testing Library |
| Deployment | Docker or standalone VPS |

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB >= 6 (local or remote)

### Setup

```bash
# Clone the repository
git clone <repo-url> && cd simplingua

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI, JWT secret, and admin accounts
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Random secret for signing JWTs (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `ADMIN_ACCOUNTS` | Yes | Comma-separated admin accounts in `username:password` format. Supports bcrypt hashes (recommended). |
| `NEXT_PUBLIC_APP_URL` | No | Public URL for CORS in production (default: `http://localhost:3000`) |

### Development

```bash
# Start dev server
npm run dev

# Seed the database with sample data
npm run seed
# Default credentials: admin/admin123, testuser/user123
```

### Data Tools

Convert source text files into importable JSON:

```bash
# Vocabulary: docs/lexilibro_de_simplingua.txt → data/vocabulary.json
npm run tools:lexi

# Grammar: docs/lingua_regla_de_simplingua.txt → data/grammar.json
npm run tools:regla

# Generate static resources (alphabet chart, OG images)
npm run tools:resource
```

### Build & Production

```bash
# Build
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Docker

```bash
# Build and run
docker compose up -d

# Or build manually
docker build -t simplingua .
docker run -p 3000:3000 --env-file .env.local simplingua
```

## Project Structure

```
simplingua/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API route handlers
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── discussions/        # Discussion forum pages
│   │   ├── grammar/            # Grammar reference pages
│   │   ├── vocabulary/         # Vocabulary browser pages
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   └── settings/           # User settings page
│   ├── components/             # Shared React components
│   ├── lib/                    # Utilities (auth, db, CORS, rate limiting)
│   └── models/                 # Mongoose schemas
├── tools/
│   ├── lexi/                   # Vocabulary text → JSON converter
│   ├── regla/                  # Grammar text → JSON converter
│   └── resource/               # Static resource generator
├── docs/                       # Source data and deployment docs
├── scripts/                    # Seed scripts
├── data/                       # Generated JSON (from tools)
└── public/                     # Static assets
```

## API Overview

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET, PUT | Current user profile |
| `/api/auth/password` | PUT | Change password |
| `/api/vocabulary` | GET, POST | List/create vocabulary entries |
| `/api/vocabulary/[id]` | GET, PUT, DELETE | Single vocabulary CRUD |
| `/api/vocabulary/import` | POST | Bulk import vocabulary (admin) |
| `/api/grammar` | GET, POST | List/create grammar chapters |
| `/api/grammar/[id]` | GET, PUT, DELETE | Single grammar CRUD |
| `/api/grammar/import` | POST | Bulk import grammar (admin) |
| `/api/discussions` | GET, POST | List/create discussions |
| `/api/discussions/[id]` | GET, PUT, DELETE | Single discussion CRUD |
| `/api/discussions/[id]/comments` | GET, POST | List/create comments |
| `/api/comments/[id]` | PUT, DELETE | Update/delete comment |
| `/api/like` | POST | Toggle like on discussion/comment |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/stats` | GET | Public site stats |
| `/api/health` | GET | Health check for load balancers |

## Deployment

See [docs/deploy.md](docs/deploy.md) for detailed instructions on:
- Standalone VPS deployment (Node.js + MongoDB + Nginx)
- Docker deployment (Dockerfile + docker-compose)

## Notes

- All UI text is in Chinese (Simplified)
- External resources use China-friendly CDNs (no Google Fonts, no Cloudflare JS)
- Admin accounts are configured via environment variables and cannot be created dynamically
- Rate limiting: 5 req/min for auth endpoints, 60 req/min for general API
