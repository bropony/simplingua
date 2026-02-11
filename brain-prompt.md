# Brain Server Implementation Prompt

## Project Overview
You are tasked with creating the **Brain Server** for the Simplingua project - the central application logic layer that handles authentication, AI orchestration, and provides user-friendly APIs. This server acts as a secure gateway between the Frontend and the RAG server.

**Reference Document**: See [shared-specs.md](shared-specs.md) for complete data models, security requirements, and shared configuration.

## Project Requirements

### Core Purpose
- **Authentication Gateway**: Secure JWT-based user authentication and authorization
- **API Layer**: User-friendly endpoints that wrap RAG server functionality
- **AI Orchestration**: Integrate Voltagent and DeepSeek for intelligent responses
- **Security Boundary**: Validate, sanitize, and rate-limit all Frontend requests

### Technology Stack
- **Framework**: Hono (fast web framework) with TypeScript
- **AI Orchestration**: Voltagent for flexible AI request handling  
- **AI Service**: DeepSeek for language processing capabilities
- **Authentication**: JWT with refresh tokens, bcrypt for passwords
- **Validation**: Zod for request/response validation
- **Rate Limiting**: Custom middleware for abuse prevention

### Project Structure
```
brain/
├── src/
│   ├── index.ts                # Main application entry
│   ├── config/
│   │   ├── index.ts           # Configuration management
│   │   ├── database.ts        # RAG server connection
│   │   └── auth.ts            # Authentication config
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   ├── rateLimit.ts       # Rate limiting middleware
│   │   ├── validation.ts      # Request validation middleware
│   │   ├── cors.ts            # CORS configuration
│   │   └── logger.ts          # Logging middleware
│   ├── routes/
│   │   ├── index.ts           # Route registration
│   │   ├── auth.ts            # Authentication routes
│   │   ├── wiki.ts            # Wiki/search routes
│   │   ├── chat.ts            # AI chat routes
│   │   ├── valva.ts           # Forum routes
│   │   ├── admin.ts           # Admin routes
│   │   └── users.ts           # User management routes
│   ├── services/
│   │   ├── ragClient.ts       # RAG server communication
│   │   ├── authService.ts     # Authentication logic
│   │   ├── aiService.ts       # Voltagent/DeepSeek integration
│   │   ├── userService.ts     # User management
│   │   ├── contentService.ts  # Content management
│   │   └── forumService.ts    # Forum operations
│   ├── types/
│   │   ├── api.ts             # API request/response types
│   │   ├── auth.ts            # Authentication types
│   │   ├── content.ts         # Content types
│   │   └── user.ts            # User types
│   ├── utils/
│   │   ├── logger.ts          # Logging utilities
│   │   ├── validation.ts      # Validation helpers
│   │   ├── crypto.ts          # Cryptographic utilities
│   │   └── errors.ts          # Error handling
│   └── websocket/
│       ├── chatHandler.ts     # WebSocket chat handling
│       └── events.ts          # WebSocket event types
├── tests/
│   ├── auth.test.ts
│   ├── wiki.test.ts
│   ├── chat.test.ts
│   ├── valva.test.ts
│   └── integration.test.ts
├── scripts/
│   ├── setup.ts              # Initial setup script
│   └── migrate.ts            # Migration utilities
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## API Implementation

### Base Configuration
- **Host**: 0.0.0.0 (external access allowed)
- **Port**: 3001 (configurable via environment)
- **Base URL**: `http://localhost:3001/api/v1`
- **Security**: JWT authentication for protected routes

### Public APIs (No Authentication Required)

#### Information Retrieval
```typescript
// GET /api/v1/wiki/search
app.get('/api/v1/wiki/search', async (c) => {
  const { query, type, lang, limit } = c.req.query()
  // Validate input, call RAG server, format response
})

// GET /api/v1/words/translate  
app.get('/api/v1/words/translate', async (c) => {
  const { word, from, to } = c.req.query()
  // Validate input, query RAG for translation
})

// GET /api/v1/grammar/rules
app.get('/api/v1/grammar/rules', async (c) => {
  const { rule, lang } = c.req.query()
  // Query RAG for grammar information
})
```

#### AI Chat Interface
```typescript
// POST /api/v1/chat/message
app.post('/api/v1/chat/message', async (c) => {
  // Handle both authenticated and anonymous chat
  // Use Voltagent for AI orchestration
  // Stream responses via Server-Sent Events
})

// WebSocket /api/v1/chat/ws
// Real-time chat interface for better UX
```

### Authenticated APIs (JWT Required)

#### Authentication & User Management
```typescript
// POST /api/v1/auth/register
app.post('/api/v1/auth/register', async (c) => {
  // Validate input, hash password, create user via RAG
  // Return JWT tokens
})

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (c) => {
  // Validate credentials, generate JWT tokens
})

// POST /api/v1/auth/logout
app.post('/api/v1/auth/logout', authMiddleware, async (c) => {
  // Invalidate tokens
})

// POST /api/v1/auth/refresh
app.post('/api/v1/auth/refresh', async (c) => {
  // Refresh access token using refresh token
})

// GET /api/v1/users/profile
app.get('/api/v1/users/profile', authMiddleware, async (c) => {
  // Get current user profile from RAG
})

// PUT /api/v1/users/profile
app.put('/api/v1/users/profile', authMiddleware, async (c) => {
  // Update user profile via RAG
})
```

#### Forum (Valva) Operations
```typescript
// GET /api/v1/valva/posts
app.get('/api/v1/valva/posts', rateLimitMiddleware, async (c) => {
  // Query forum posts from RAG with filtering
})

// POST /api/v1/valva/posts
app.post('/api/v1/valva/posts', authMiddleware, async (c) => {
  // Create new forum post, store via RAG
})

// GET /api/v1/valva/posts/:id
app.get('/api/v1/valva/posts/:id', rateLimitMiddleware, async (c) => {
  // Get specific post with replies
})

// PUT /api/v1/valva/posts/:id
app.put('/api/v1/valva/posts/:id', authMiddleware, async (c) => {
  // Update post (author/moderator only)
})

// DELETE /api/v1/valva/posts/:id
app.delete('/api/v1/valva/posts/:id', authMiddleware, async (c) => {
  // Delete post (author/moderator only)
})

// POST /api/v1/valva/posts/:id/replies
app.post('/api/v1/valva/posts/:id/replies', authMiddleware, async (c) => {
  // Reply to post
})

// POST /api/v1/valva/posts/:id/vote
app.post('/api/v1/valva/posts/:id/vote', authMiddleware, async (c) => {
  // Vote on post
})

// POST /api/v1/valva/posts/:id/flag
app.post('/api/v1/valva/posts/:id/flag', authMiddleware, async (c) => {
  // Flag inappropriate content
})
```

### Administrative APIs (Admin/Super Roles)

#### Content Management
```typescript
// POST /api/v1/admin/words
app.post('/api/v1/admin/words', adminMiddleware, async (c) => {
  // Add/update word entries via RAG
})

// DELETE /api/v1/admin/words/:id
app.delete('/api/v1/admin/words/:id', adminMiddleware, async (c) => {
  // Delete word entry via RAG
})

// POST /api/v1/admin/grammar
app.post('/api/v1/admin/grammar', adminMiddleware, async (c) => {
  // Add/update grammar entries
})

// POST /api/v1/admin/textbooks
app.post('/api/v1/admin/textbooks', adminMiddleware, async (c) => {
  // Add/update textbooks
})
```

#### User Administration
```typescript
// GET /api/v1/admin/users
app.get('/api/v1/admin/users', adminMiddleware, async (c) => {
  // List users with filtering
})

// PUT /api/v1/admin/users/:id/role
app.put('/api/v1/admin/users/:id/role', superMiddleware, async (c) => {
  // Change user role (super only)
})

// PUT /api/v1/admin/users/:id/status
app.put('/api/v1/admin/users/:id/status', adminMiddleware, async (c) => {
  // Update user status
})

// GET /api/v1/admin/analytics
app.get('/api/v1/admin/analytics', adminMiddleware, async (c) => {
  // Get system analytics
})

// POST /api/v1/admin/backup
app.post('/api/v1/admin/backup', superMiddleware, async (c) => {
  // Create system backup via RAG
})
```

## Implementation Details

### Configuration Management
```typescript
// src/config/index.ts
interface Config {
  server: {
    host: string
    port: number
    env: 'development' | 'production'
  }
  rag: {
    baseUrl: string
    timeout: number
  }
  auth: {
    jwtSecret: string
    jwtExpiresIn: string
    refreshExpiresIn: string
  }
  ai: {
    deepseekApiKey: string
    voltagentConfig: any
  }
  rateLimit: {
    windowMs: number
    maxRequests: number
    maxRequestsAuth: number
  }
}

export const config: Config = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3001'),
    env: (process.env.NODE_ENV as any) || 'development'
  },
  rag: {
    baseUrl: process.env.RAG_BASE_URL || 'http://localhost:8001',
    timeout: parseInt(process.env.RAG_TIMEOUT || '30000')
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d'
  },
  ai: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
    voltagentConfig: JSON.parse(process.env.VOLTAGENT_CONFIG || '{}')
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    maxRequestsAuth: parseInt(process.env.RATE_LIMIT_MAX_AUTH || '1000')
  }
}
```

### Authentication Middleware
```typescript
// src/middleware/auth.ts
import { verify } from 'hono/jwt'
import { Context, Next } from 'hono'

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authorization = c.req.header('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authorization.substring(7)
    const payload = await verify(token, config.auth.jwtSecret)
    
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (!user || !['admin', 'super'].includes(user.role)) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  await next()
}

export const superMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user')
  if (!user || user.role !== 'super') {
    return c.json({ error: 'Super user access required' }, 403)
  }
  await next()
}
```

### Rate Limiting Middleware
```typescript
// src/middleware/rateLimit.ts
import { Context, Next } from 'hono'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown'
  const user = c.get('user')
  const key = user ? `user_${user.id}` : `ip_${ip}`
  
  const now = Date.now()
  const windowMs = config.rateLimit.windowMs
  const maxRequests = user ? config.rateLimit.maxRequestsAuth : config.rateLimit.maxRequests
  
  if (!store[key] || now > store[key].resetTime) {
    store[key] = { count: 1, resetTime: now + windowMs }
  } else {
    store[key].count++
  }
  
  if (store[key].count > maxRequests) {
    return c.json({ error: 'Rate limit exceeded' }, 429)
  }
  
  await next()
}
```

### RAG Client Service
```typescript
// src/services/ragClient.ts
class RAGClient {
  private baseUrl: string
  private timeout: number

  constructor() {
    this.baseUrl = config.rag.baseUrl
    this.timeout = config.rag.timeout
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/internal/v1${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`RAG request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`RAG client error for ${endpoint}:`, error)
      throw new Error('Internal service unavailable')
    }
  }

  // Content operations
  async uploadWords(words: any[]) {
    return this.post('/words/upload', words)
  }

  async queryWords(query: any) {
    return this.post('/words/query', query)
  }

  // User operations  
  async createUser(user: any) {
    return this.post('/users/create', user)
  }

  async queryUsers(query: any) {
    return this.post('/users/query', query)
  }

  // Forum operations
  async createForumPost(post: any) {
    return this.post('/forums/create', post)
  }

  async queryForumPosts(query: any) {
    return this.post('/forums/query', query)
  }

  // Search operations
  async semanticSearch(query: any) {
    return this.post('/search/semantic', query)
  }
}

export const ragClient = new RAGClient()
```

### AI Service Integration
```typescript
// src/services/aiService.ts
import { Voltagent } from 'voltagent'

class AIService {
  private voltagent: Voltagent

  constructor() {
    this.voltagent = new Voltagent({
      deepseekApiKey: config.ai.deepseekApiKey,
      ...config.ai.voltagentConfig
    })
  }

  async processChat(message: string, context: any) {
    try {
      // Use Voltagent to orchestrate AI response
      const response = await this.voltagent.process({
        message,
        context,
        tools: [
          // Define tools for RAG integration
          {
            name: 'search_dictionary',
            description: 'Search for word definitions',
            handler: async (params: any) => {
              return await ragClient.queryWords({
                words: [params.word],
                lang: params.lang || 'en'
              })
            }
          },
          {
            name: 'search_grammar',
            description: 'Search for grammar rules',
            handler: async (params: any) => {
              return await ragClient.post('/grammar/query', {
                names: [params.rule],
                lang: params.lang || 'en'
              })
            }
          }
        ]
      })

      return response
    } catch (error) {
      console.error('AI service error:', error)
      throw new Error('AI service temporarily unavailable')
    }
  }

  async *streamChat(message: string, context: any) {
    // Stream AI responses for real-time chat
    const stream = await this.voltagent.processStream({
      message,
      context
    })

    for await (const chunk of stream) {
      yield chunk
    }
  }
}

export const aiService = new AIService()
```

### WebSocket Chat Handler
```typescript
// src/websocket/chatHandler.ts
import { WSContext } from 'hono/ws'

interface ChatSession {
  userId?: string
  conversationId: string
  language: string
}

export class ChatHandler {
  private sessions = new Map<string, ChatSession>()

  async handleConnection(ws: WSContext) {
    const sessionId = this.generateSessionId()
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data.toString())
        await this.handleMessage(ws, sessionId, data)
      } catch (error) {
        console.error('WebSocket message error:', error)
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }))
      }
    }

    ws.onclose = () => {
      this.sessions.delete(sessionId)
    }
  }

  private async handleMessage(ws: WSContext, sessionId: string, data: any) {
    const session = this.sessions.get(sessionId) || {
      conversationId: this.generateConversationId(),
      language: data.language || 'en'
    }

    // Process message with AI service
    const responseStream = aiService.streamChat(data.message, {
      conversationId: session.conversationId,
      language: session.language,
      userId: session.userId
    })

    // Stream response back to client
    for await (const chunk of responseStream) {
      ws.send(JSON.stringify({
        type: 'message',
        content: chunk.content,
        conversationId: session.conversationId
      }))
    }

    ws.send(JSON.stringify({
      type: 'done',
      conversationId: session.conversationId
    }))

    this.sessions.set(sessionId, session)
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
```

## Configuration Files

### package.json
```json
{
  "name": "simplingua-brain",
  "version": "0.1.0",
  "description": "Brain Server for Simplingua Platform",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "hono": "^4.7.8",
    "@hono/node-server": "^1.13.7",
    "voltagent": "^1.0.0",
    "bcrypt": "^5.1.1",
    "jose": "^5.9.6",
    "zod": "^3.24.1",
    "ws": "^8.18.0",
    "node-cron": "^3.0.3",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/bcrypt": "^5.0.2",
    "@types/ws": "^8.5.13",
    "typescript": "^5.8.4",
    "tsx": "^4.19.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.14",
    "eslint": "^9.17.0",
    "@typescript-eslint/eslint-plugin": "^8.17.0",
    "prettier": "^3.4.2"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "Node16",
    "moduleResolution": "Node16",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Dockerfile
```dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN useradd -r -u 1001 -g daemon brain
RUN chown -R brain:daemon /app
USER brain

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
```

### .env.example
```bash
# Server Configuration
HOST=0.0.0.0
PORT=3001
NODE_ENV=development

# RAG Server Configuration
RAG_BASE_URL=http://localhost:5000
RAG_TIMEOUT=30000

# Authentication Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_EXPIRES_IN=7d

# AI Configuration
DEEPSEEK_API_KEY=your-deepseek-api-key
VOLTAGENT_CONFIG={}

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_MAX_AUTH=1000

# Logging Configuration
LOG_LEVEL=info
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  brain-server:
    build: .
    container_name: simplingua-brain
    ports:
      - "3001:3001"
    environment:
      - HOST=0.0.0.0
      - PORT=3001
      - RAG_BASE_URL=http://rag-server:5000
      - JWT_SECRET=${JWT_SECRET}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - NODE_ENV=development
    networks:
      - internal
      - external
    depends_on:
      - rag-server

networks:
  internal:
    external: true
  external:
    driver: bridge
```

## Security Implementation

### Input Validation
```typescript
// src/utils/validation.ts
import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  preferredLanguage: z.string().length(2)
})

export const forumPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(30)).max(10),
  language: z.string().length(2)
})

export const validateInput = <T>(schema: z.ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const validated = schema.parse(body)
      c.set('validatedInput', validated)
      await next()
    } catch (error) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
  }
}
```

### Security Headers Middleware
```typescript
// src/middleware/security.ts
export const securityHeaders = async (c: Context, next: Next) => {
  await next()
  
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'")
}
```

## Testing Requirements

### Example Tests
```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  test('should register new user', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        preferredLanguage: 'en'
      }),
      headers: { 'Content-Type': 'application/json' }
    })
    
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.tokens.accessToken).toBeDefined()
  })

  test('should login existing user', async () => {
    // Test login functionality
  })

  test('should reject invalid credentials', async () => {
    // Test authentication failure
  })
})
```

## Development Guidelines

### Error Handling
- Always wrap RAG calls in try-catch blocks
- Return user-friendly error messages
- Log detailed errors for debugging
- Use appropriate HTTP status codes

### Performance
- Implement response caching where appropriate
- Use streaming for large responses
- Monitor RAG server response times
- Implement circuit breaker pattern for RAG failures

### Monitoring
- Log all authentication attempts
- Track API usage metrics
- Monitor rate limiting effectiveness
- Alert on RAG server connectivity issues

Remember: This server is the critical security boundary. All Frontend requests must be properly validated, authenticated, and rate-limited before forwarding to the RAG server.