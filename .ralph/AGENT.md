# Ralph Agent Configuration

## Project Overview
Simplingua (简语) — Language learning and discussion web platform for the constructed language Simplingua.
- **Stack**: Next.js (App Router) + MongoDB + JWT + Tailwind CSS
- **Audience**: Chinese constructed language enthusiasts
- **See specs**: `.ralph/specs/` for detailed architecture, data models, API, frontend, and tools specs

## Environment Setup
```bash
# Prerequisites
node >= 18.x
npm >= 9.x
mongodb >= 6.x (local or remote)

# Install dependencies (once package.json exists)
npm install

# Environment variables (create .env.local)
MONGODB_URI=mongodb://localhost:27017/simplingua
JWT_SECRET=<generate-random-secret>
ADMIN_ACCOUNTS=admin:password123,admin2:password456
```

## Build Instructions
```bash
# Build the project
npm run build
```

## Test Instructions
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Run Instructions
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Tools
```bash
# Convert vocabulary to JSON
node tools/lexi/index.js --pretty -o data/vocabulary.json

# Convert grammar to JSON
node tools/regla/index.js --pretty -o data/grammar.json

# Generate static resources (alphabet chart + OG images)
node tools/resource/index.js --type all -o public/resources
```

## Notes
- Check if commands are valid before running (improperly quoted args, unexpected spaces in arg strings, etc.)
- All external resources must be accessible from mainland China (no Google Fonts, etc.)
- Admin accounts are configured via environment variables, not dynamically created
- UI language is Chinese (Simplified)
