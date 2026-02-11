# Simplingua Project Development Setup

## Prerequisites Check

Before starting development, ensure you have the following installed:

### System Requirements
- **Python 3.10.2+** (for RAG server)
- **Node.js 20+** (for Brain server and Frontend)
- **Docker & Docker Compose** (for database services)
- **Git** (for version control)

### Python Environment Setup
```bash
# Check Python version
python --version  # Should be 3.10.2+

# Create virtual environment for RAG server
cd rag/
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Node.js Environment Setup
```bash
# Check Node version
node --version  # Should be 20+

# Install Brain server dependencies
cd brain/
npm install

# Install Frontend dependencies  
cd ../frontend/
npm install
```

### Database Services
```bash
# Start MongoDB and ChromaDB with Docker
docker-compose up -d mongodb chromadb
```

## Development Workflow

### 1. Start Database Services
```bash
docker-compose up -d mongodb chromadb
```

### 2. Start RAG Server (Terminal 1)
```bash
cd rag/
source venv/bin/activate
python -m uvicorn main:app --host 127.0.0.1 --port 5000 --reload
```

### 3. Start Brain Server (Terminal 2)
```bash
cd brain/
npm run dev
```

### 4. Start Frontend (Terminal 3)
```bash
cd frontend/
npm run dev
```

## Modern Development Tools

This project uses cutting-edge, modern tooling:

### Python (RAG Server)
- **Ruff**: Modern, fast linter and formatter (replaces flake8 + isort)
- **python-jwt**: Lightweight JWT library (replaces python-jose)
- **passlib**: Modern password hashing (instead of raw bcrypt)
- **ChromaDB 0.6.x**: Latest vector database features

### Node.js (Brain & Frontend)
- **jose**: Modern JWT library (replaces jsonwebtoken)
- **Hono 4.7.x**: Latest fast web framework
- **Next.js 15.x**: Latest with App Router
- **React 19**: Latest stable with concurrent features

## Configuration

Copy environment files and update with your values:
```bash
cp .env.example .env
cp rag/.env.example rag/.env
cp brain/.env.example brain/.env  
cp frontend/.env.example frontend/.env
```

## Testing Dependencies

Run these commands to verify all dependencies are available:

### Python Dependencies
```bash
cd rag/
python -c "import fastapi, uvicorn, chromadb, motor, pydantic; print('All Python deps OK')"
# Check for modern tools
python -c "import ruff; print('Ruff linter available')" 2>/dev/null || echo "Install ruff for modern linting"
```

### Node.js Dependencies (Brain)
```bash
cd brain/
node -e "console.log('Hono:', require('hono/package.json').version)"
node -e "console.log('JOSE:', require('jose/package.json').version)"
```

### Node.js Dependencies (Frontend)  
```bash
cd frontend/
node -e "console.log('Next.js:', require('next/package.json').version)"
```

## Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 5000, 8000, 27017 are available
2. **Python version**: RAG server requires Python 3.10.2+
3. **Node version**: Brain/Frontend require Node.js 20+
4. **Docker**: Database services need Docker running

## Next Steps

Once all dependencies are installed and services are running:
1. Access Frontend: http://localhost:3000
2. Test Brain API: http://localhost:3001/health  
3. Check RAG internal API: http://127.0.0.1:5000/health (localhost only)

Review the project prompts for implementation details:
- [rag-prompt.md](rag-prompt.md) - RAG Server implementation
- [brain-prompt.md](brain-prompt.md) - Brain Server implementation  
- [frontend-prompt.md](frontend-prompt.md) - Frontend implementation