# Simplingua Project Shared Specifications

## Project Overview
Simplingua is a constructed language (conlang) platform with a secure three-tier architecture:
- **RAG Server**: Internal data layer (localhost only)
- **Brain Server**: Application logic with authentication 
- **Frontend**: User interface with Next.js

## Architecture Principles

### Trust Model
- **Frontend → Brain**: Untrusted boundary - requires authentication, authorization, rate limiting
- **Brain → RAG**: Trusted boundary - internal communication with direct API calls
- **RAG**: Local-only APIs, never exposed externally

### Technology Stack
- **RAG**: FastAPI + ChromaDB + MongoDB (localhost:5000)
- **Brain**: Hono + Voltagent + DeepSeek + JWT (port 3001)
- **Frontend**: Next.js + TypeScript + TailwindCSS (port 3000)

## Shared Data Models

### User Schema (MongoDB)
```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'moderator' | 'admin' | 'super';
  status: 'active' | 'suspended' | 'banned';
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      forum: boolean;
    };
  };
  profile: {
    bio?: string;
    joinDate: Date;
    lastLogin: Date;
    avatar?: string;
  };
  statistics: {
    postsCount: number;
    repliesCount: number;
    contributionScore: number;
  };
}
```

### Content Schemas (ChromaDB)
```typescript
interface WordEntry {
  id: string;              // word_pos_direction
  document: string;        // searchable content
  metadata: {
    word: string;
    pos: string;
    direction: string;
    description: string;
    examples: string[];
    dateAdded: string;
    lastModified: string;
    approvedBy?: string;
  };
}

interface GrammarEntry {
  id: string;              // rule_language
  document: string;        // searchable content  
  metadata: {
    name: string;
    language: string;
    category: string;
    content: string;
    examples: string[];
    dateAdded: string;
    lastModified: string;
    approvedBy?: string;
  };
}

interface TextbookEntry {
  id: string;              // textbook_id
  document: string;        // searchable content
  metadata: {
    title: string;
    author: string;
    language: string;
    content: string;
    chapters: Chapter[];
    datePublished: string;
    lastModified: string;
    approvedBy?: string;
  };
}
```

### Forum Schema (MongoDB)
```typescript
interface ForumPost {
  _id: ObjectId;
  title: string;
  content: string;
  author: ObjectId;        // Reference to User
  category: string;
  tags: string[];
  language: string;
  parentId?: ObjectId;     // For replies
  status: 'active' | 'locked' | 'deleted' | 'flagged';
  votes: {
    up: number;
    down: number;
    userVotes: Map<ObjectId, 'up' | 'down'>;
  };
  metadata: {
    createdAt: Date;
    lastModified: Date;
    viewCount: number;
    replyCount: number;
    flagCount: number;
  };
}
```

## Security Requirements

### Authentication
- JWT-based authentication with refresh tokens
- Bcrypt password hashing with salt rounds
- Role-based access control (user/moderator/admin/super)

### Input Validation
- Multi-layer validation: Frontend → Brain → RAG
- Server-side sanitization for XSS prevention
- Type validation for all API contracts

### Network Security
- RAG server: localhost binding only (127.0.0.1:8001)
- Brain server: external API with HTTPS (port 8000)
- Frontend: CDN deployment or static hosting

### Rate Limiting
- Per-user and per-IP rate limiting
- Different limits for authenticated vs anonymous users
- API endpoint-specific limits

## Development Standards

### Code Quality
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Comprehensive error handling and logging
- Unit and integration tests

### API Standards
- RESTful API design
- Consistent response formats
- Proper HTTP status codes
- Comprehensive error messages

### Documentation
- OpenAPI/Swagger documentation for all APIs
- Code comments for complex business logic
- README files with setup instructions
- Environment configuration examples

## Deployment Configuration

### Development Environment
```yaml
services:
  rag:
    ports: ["8001:8001"]
    environment:
      - ENV=development
      - CHROMA_HOST=localhost
      - MONGO_URI=mongodb://localhost:27017/simplingua_dev
    networks: [internal]

  brain:
    ports: ["8000:8000"]
    environment:
      - ENV=development
      - RAG_URL=http://rag:8001
      - JWT_SECRET=dev_secret
    networks: [internal, external]

  frontend:
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    networks: [external]
```

### Environment Variables
```bash
# RAG Server
CHROMA_DB_PATH=/data/chroma
MONGO_URI=mongodb://localhost:27017/simplingua
LOG_LEVEL=info
HOST=127.0.0.1
PORT=8001

# Brain Server
RAG_BASE_URL=http://localhost:8001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
DEEPSEEK_API_KEY=your-deepseek-key
LOG_LEVEL=info
HOST=0.0.0.0
PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=Simplingua
```

## Common Dependencies

### Python (RAG & Brain)
```toml
[tool.poetry.dependencies]
python = "^3.10.2"
fastapi = "^0.115.0"
uvicorn = "^0.33.0"
pydantic = "^2.10.0"
python-multipart = "^0.0.18"
python-jwt = "^4.1.0"
passlib = "^1.7.4"
motor = "^3.7.0"  # Async MongoDB
chromadb = "^0.6.0"
pytest = "^8.3.0"
pytest-asyncio = "^0.25.0"
ruff = "^0.8.0"  # Modern linter/formatter replacing flake8+isort
black = "^24.10.0"
mypy = "^1.14.0"
```

### Node.js (Frontend & Brain if using Hono)
```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "typescript": "^5.8.4",
    "tailwindcss": "^3.4.16",
    "@types/node": "^22.10.0",
    "hono": "^4.7.8",
    "jose": "^5.9.6",
    "axios": "^1.7.9",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "eslint": "^9.17.0",
    "@typescript-eslint/eslint-plugin": "^8.17.0",
    "prettier": "^3.4.2",
    "jest": "^29.7.0",
    "@testing-library/react": "^16.1.0"
  }
}
```