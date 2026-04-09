# Simplingua Architecture Specification

## Overview
Simplingua (简语) is a language learning and discussion web platform for the constructed language Simplingua, created by Louis Rosa. The primary audience is Chinese constructed language enthusiasts.

## Tech Stack
- **Backend**: Next.js (App Router) + MongoDB + JWT authentication
- **Frontend**: React (within Next.js) + Tailwind CSS
- **Database**: MongoDB
- **Tools**: Node.js CLI tools for data conversion

## Project Structure
```
simplingua/
├── docs/                          # Source data files
│   ├── design.md                  # Requirements document
│   ├── lexilibro_de_simplingua.txt # Vocabulary source
│   └── lingua_regla_de_simplingua.txt # Grammar source
├── tools/                         # CLI tools
│   ├── lexi/                      # Vocabulary converter
│   ├── regla/                     # Grammar converter
│   └── resource/                  # Resource generator
├── src/                           # Main application
│   ├── app/                       # Next.js App Router pages
│   │   ├── api/                   # API routes
│   │   ├── (public)/              # Public pages
│   │   └── (auth)/                # Authenticated pages
│   ├── components/                # React components
│   ├── lib/                       # Shared utilities
│   ├── models/                    # MongoDB models
│   └── middleware.ts              # Auth middleware
├── public/                        # Static assets
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Monorepo Approach
Single Next.js application serving both frontend and backend. Tools are separate Node.js scripts in `/tools`.

## Data Flow
1. Source `.txt` files → Tools convert to JSON → Admin uploads via API → Stored in MongoDB
2. Public pages fetch from API → Rendered with React
3. Discussion data created/updated directly via API

## Key Architectural Decisions
- **Next.js App Router** for unified frontend/backend with server components
- **MongoDB** for flexible document storage (vocabulary/grammar are semi-structured)
- **JWT** for stateless authentication (no server-side sessions)
- **Admin accounts via config** — no dynamic admin creation, credentials set in environment variables
- **China-friendly resources** — all CDNs and external resources must be accessible from mainland China

## Deployment Options
1. **Standalone VPS**: Node.js process + MongoDB + Nginx reverse proxy
2. **Docker**: docker-compose with app + MongoDB containers

## Security Considerations
- JWT tokens with reasonable expiry
- Admin routes protected by middleware
- Input validation on all API endpoints
- Rate limiting on public endpoints
- CORS configuration for API routes
