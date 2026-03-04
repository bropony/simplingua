# Simplingua Development Deployment Guide

This guide covers setting up Simplingua for local development.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Compose (Recommended)](#docker-compose-recommended)
5. [Manual Setup (Advanced)](#manual-setup-advanced)
6. [Running Development Servers](#running-development-servers)
7. [Database Management](#database-management)
8. [Testing](#testing)
9. [Common Development Tasks](#common-development-tasks)
10. [Debugging](#debugging)
11. [Hot Reloading](#hot-reloading)

---

## Quick Start

The fastest way to get started is using Docker Compose:

```bash
# 1. Clone the repository
git clone <repository-url>
cd simplingua

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env and add your AI API keys
# Minimum required: AI_DEEPSEEK_API_KEY

# 4. Start all services
docker-compose up -d

# 5. Check services are running
docker-compose ps

# 6. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Prerequisites

### Required Software

#### Option A: Docker (Recommended)

- **Docker Desktop** 4.0+ (Windows/Mac) or Docker Engine 20.10+ (Linux)
- **Docker Compose** 2.0+

#### Option B: Native Development

**For Backend:**
- **Python** 3.11 or 3.12
- **pip** (Python package manager)
- **PostgreSQL** 16+ with pgvector extension
- **git**

**For Frontend:**
- **Node.js** 18.x or 20.x (use nvm for version management)
- **npm** 9+ or **yarn** 1.22+
- **git**

### Optional Tools

- **pgAdmin** - PostgreSQL GUI client
- **DBeaver** - Universal database tool
- **Postman** - API testing
- **VS Code** - Recommended IDE with extensions:
  - Python
  - Pylance
  - ESLint
  - Tailwind CSS IntelliSense
  - Docker

### Required Accounts/Services

- **DeepSeek API Key** (default AI provider, free tier available)
  - Sign up at: https://platform.deepseek.com/
  - Get API key from settings

- Optional: OpenAI API Key, Anthropic API Key, or Ollama (local AI)

---

## Environment Setup

### 1. Environment Variables

Copy the environment template and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# =============================================================================
# Backend Configuration
# =============================================================================

# Application
ENV=development
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Database (Docker Compose - use default values)
DATABASE_URL=postgresql://simplingua:dev_password@postgres:5432/simplingua_dev

# JWT Authentication (Development values are OK)
JWT_SECRET=dev_secret_change_in_production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# AI Provider
AI_DEFAULT_PROVIDER=deepseek

# DeepSeek (Required - Add your key here!)
AI_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI (Optional)
# AI_OPENAI_API_KEY=sk-...

# Anthropic (Optional)
# AI_ANTHROPIC_API_KEY=sk-ant-...

# =============================================================================
# Frontend Configuration
# =============================================================================

# Development API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Get DeepSeek API Key

```bash
# 1. Sign up at https://platform.deepseek.com/
# 2. Go to API Keys in settings
# 3. Create new API key
# 4. Copy and paste into .env file
```

### 3. Verify Environment

```bash
# On Linux/Mac
echo $AI_DEEPSEEK_API_KEY

# On Windows PowerShell
$env:AI_DEEPSEEK_API_KEY

# On Windows CMD
echo %AI_DEEPSEEK_API_KEY%
```

---

## Docker Compose (Recommended)

### Starting All Services

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Service Status

You should see all three services running:

```
NAME                      STATUS              PORTS
simplingua-postgres       Up (healthy)        0.0.0.0:5432->5432/tcp
simplingua-backend        Up                  0.0.0.0:8000->8000/tcp
simplingua-frontend       Up                  0.0.0.0:3000->3000/tcp
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **PostgreSQL**: localhost:5432

### Stopping Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, volumes, and images (clean slate)
docker-compose down -v --rmi all
```

### Rebuilding After Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

---

## Manual Setup (Advanced)

### Backend Setup

#### 1. Set Up PostgreSQL with pgvector

**Ubuntu/Debian:**
```bash
# Install PostgreSQL 16
sudo apt update
sudo apt install postgresql-16 postgresql-16-pgvector

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER simplingua WITH PASSWORD 'dev_password';
CREATE DATABASE simplingua_dev OWNER simplingua;
GRANT ALL PRIVILEGES ON DATABASE simplingua_dev TO simplingua;

# Connect to database
\c simplingua_dev

# Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

**macOS (Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@16

# Install pgvector
brew install pgvector

# Start PostgreSQL
brew services start postgresql@16

# Follow same SQL commands as above
```

**Windows:**
- Download PostgreSQL installer from: https://www.postgresql.org/download/windows/
- Select PostgreSQL 16
- During installation, enable pgvector extension
- Use pgAdmin to create database and user

#### 2. Create Python Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Verify activation (prompt should show (venv))
```

#### 3. Install Dependencies

```bash
# Ensure venv is activated
cd backend

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

#### 4. Database Connection Test

```bash
# From backend directory with venv activated
python -c "from app.core.database import engine; print('Database connected:', engine.url)"
```

#### 5. Run Backend Server

```bash
# With venv activated
cd backend

# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

#### 1. Install Node.js and npm

**Using nvm (Recommended):**

```bash
# Install nvm (Linux/Mac)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

**Windows:**
- Download Node.js 18 LTS from: https://nodejs.org/
- Use the Windows installer

#### 2. Install Dependencies

```bash
cd frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

#### 3. Create Environment File

```bash
cd frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

#### 4. Run Development Server

```bash
# Development mode with hot-reload
npm run dev

# Or using yarn
yarn dev
```

The frontend will be available at http://localhost:3000

---

## Running Development Servers

### Backend Development Server

#### With Docker Compose

```bash
# Backend runs automatically with docker-compose up
# View logs
docker-compose logs -f backend

# To restart backend
docker-compose restart backend
```

#### Manual (No Docker)

```bash
# Activate venv
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# With more verbose logging
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### Frontend Development Server

#### With Docker Compose

```bash
# Frontend runs automatically with docker-compose up
# View logs
docker-compose logs -f frontend

# To restart frontend
docker-compose restart frontend
```

#### Manual (No Docker)

```bash
cd frontend

# Start Next.js development server
npm run dev

# With specific port
PORT=3001 npm run dev
```

---

## Database Management

### Connect to PostgreSQL

#### Using psql

```bash
# Connect to database
psql postgresql://simplingua:dev_password@localhost:5432/simplingua_dev

# Or using Docker Compose
docker-compose exec postgres psql -U simplingua -d simplingua_dev
```

#### Using pgAdmin

1. Open pgAdmin
2. Create new server connection:
   - Host: localhost
   - Port: 5432
   - Database: simplingua_dev
   - Username: simplingua
   - Password: dev_password

### Common SQL Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d words

-- Count rows
SELECT COUNT(*) FROM words;
SELECT COUNT(*) FROM grammar;

-- Sample queries
SELECT word, part_of_speech FROM words LIMIT 10;
SELECT section_id, COUNT(*) FROM grammar GROUP BY section_id;

-- Exit
\q
```

### Database Reset

```bash
# Using Docker Compose
docker-compose down -v  # Removes all data
docker-compose up -d    # Fresh start

# Or manual reset
psql postgresql://simplingua:dev_password@localhost:5432/simplingua_dev \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql postgresql://simplingua:dev_password@localhost:5432/simplingua_dev \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

---

## Testing

### Backend Testing

```bash
# Activate venv
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### API Testing

Using the interactive API docs at http://localhost:8000/docs:

1. Open http://localhost:8000/docs in browser
2. Try different endpoints
3. View request/response schemas
4. Test authentication endpoints

Or use curl:

```bash
# Health check
curl http://localhost:8000/health

# Search words
curl "http://localhost:8000/api/v1/wiki/search?q=hello"

# Get word details
curl http://localhost:8000/api/v1/wiki/words/1
```

---

## Common Development Tasks

### Import Dictionary and Grammar Data

```bash
cd toolkit

# Create and activate venv
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Parse documents
python parse_dictionary.py ../docs/dictionary-in-cn.txt > dictionary.json
python parse_grammar.py ../docs/grammar-in-cn.txt > grammar.json

# Upload to database
python upload.py --database-url postgresql://simplingua:dev_password@localhost:5432/simplingua_dev

# Verify import
psql postgresql://simplingua:dev_password@localhost:5432/simplingua_dev \
  -c "SELECT COUNT(*) FROM words;"
```

### Add New API Endpoint

#### Backend

1. Define Pydantic schema in `app/schemas/`
2. Add route in `app/api/` router file
3. Test endpoint at `/docs`

Example:
```python
# app/schemas/example.py
from pydantic import BaseModel
from typing import Optional

class ExampleResponse(BaseModel):
    message: str
    status: str

# app/api/example.py
from fastapi import APIRouter
from app.schemas.example import ExampleResponse

router = APIRouter(prefix="/api/v1/example", tags=["example"])

@router.get("/", response_model=ExampleResponse)
async def get_example():
    return {"message": "Hello", "status": "success"}

# app/main.py - add router
from app.api.example import router as example_router
app.include_router(example_router)
```

### Add New Frontend Page

```bash
# Create new page
mkdir -p frontend/src/app/new-page
touch frontend/src/app/new-page/page.tsx
```

```tsx
// frontend/src/app/new-page/page.tsx
export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">New Page</h1>
      <p>This is a new page</p>
    </div>
  );
}
```

### Update Tailwind CSS Theme

Edit `frontend/tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        'custom-color': '#hexvalue',
      },
    },
  },
};
```

---

## Debugging

### Backend Debugging

#### Using VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8000"
      ],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

#### Logging

```python
# In your code
import logging
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

#### Docker Logs

```bash
# Backend logs
docker-compose logs -f backend

# Follow with timestamps
docker-compose logs -f --timestamps backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Frontend Debugging

#### Browser DevTools

- Press `F12` or `Ctrl+Shift+I` to open DevTools
- Check Console tab for errors
- Check Network tab for API calls
- Check React DevTools for component state

#### VS Code Debugging

Install "Debugger for Chrome" extension and create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/frontend"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Hot Reloading

### Backend Hot Reload

#### With Docker Compose

Backend is configured with volume mount for hot reload:

```yaml
volumes:
  - ./backend:/app
```

Changes to Python files automatically trigger rebuild.

#### Manual

Using `--reload` flag with uvicorn:

```bash
uvicorn app.main:app --reload
```

### Frontend Hot Reload

Next.js development server provides hot reload by default:

```bash
npm run dev
```

Changes to React components, styles, and pages automatically refresh in browser.

---

## Troubleshooting

### Common Issues

**Issue: Docker Compose won't start**

```bash
# Check for port conflicts
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Linux/Mac

# Kill conflicting process or change PORT in .env

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Issue: Database connection refused**

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify DATABASE_URL in .env
# Ensure host is 'postgres' when using docker-compose
# Ensure host is 'localhost' when running manually
```

**Issue: pgvector extension not found**

```bash
# Install extension
docker-compose exec postgres psql -U simplingua -d simplingua_dev \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Issue: "Module not found" errors**

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue: AI API key not working**

```bash
# Verify API key is set
echo $AI_DEEPSEEK_API_KEY

# Test with curl
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $AI_DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hello"}]}'

# Check .env file has correct key format
# Restart services after changing .env
docker-compose restart backend
```

**Issue: Frontend API calls failing**

```bash
# Check backend is running
curl http://localhost:8000/health

# Check NEXT_PUBLIC_API_URL in frontend/.env.local
# Should be http://localhost:8000 for local dev

# Check browser console for CORS errors
# Verify CORS configuration in backend/app/main.py
```

**Issue: Memory issues with Docker**

```bash
# Increase Docker memory limit (Docker Desktop settings)
# Restart Docker

# Or reduce worker count in backend
# Add to backend/app/config.py:
# WORKERS = 2  # Reduce from default
```

### Clearing Docker Cache

```bash
# Stop and remove all containers
docker-compose down -v

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Fresh build
docker-compose build --no-cache
docker-compose up -d
```

---

## Development Workflow

### Typical Day Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. View logs
docker-compose logs -f

# 4. Make code changes

# 5. Backend changes auto-reload (volume mount)
# Frontend changes auto-reload (Next.js dev server)

# 6. Test changes
# - Backend: http://localhost:8000/docs
# - Frontend: http://localhost:3000

# 7. Run tests
cd backend && pytest
cd ../frontend && npm test

# 8. Commit changes
git add .
git commit -m "Description of changes"

# 9. Stop services when done
docker-compose stop
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub/GitLab
```

---

## Performance Tips for Development

### Backend

- Use `--reload` only when making changes
- Reduce worker count for development
- Use DEBUG=False for more accurate performance testing

### Frontend

- Use `npm run build` to test production build
- Check bundle size with `npm run analyze`
- Enable React DevTools Profiler for performance debugging

---

## Useful Commands Reference

```bash
# Docker Compose
docker-compose up -d              # Start services
docker-compose down                # Stop services
docker-compose ps                  # List services
docker-compose logs -f             # Follow logs
docker-compose restart <service>   # Restart specific service
docker-compose exec <service> sh   # Enter container shell

# Backend (Manual)
source venv/bin/activate           # Activate venv
uvicorn app.main:app --reload      # Start dev server
pytest                             # Run tests

# Frontend (Manual)
npm install                        # Install dependencies
npm run dev                        # Start dev server
npm run build                      # Build for production
npm test                           # Run tests
npm run lint                       # Run linter

# Database
psql $DATABASE_URL                 # Connect to database
pg_dump $DATABASE_URL > backup.sql # Backup database
```

---

## Getting Help

- Check this documentation first
- Review logs for error messages
- Consult the project README files
- Check the main deployment guide for production issues
- Open an issue in the project repository

---

**Last Updated**: 2025
**Version**: 1.0.0
