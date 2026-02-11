# Simplingua Project Blueprint

## Overview

Simplingua is a constructed language (conlang) platform that provides comprehensive tools for language learning, documentation, and community interaction. The system follows a secure three-tier architecture with clear separation of concerns and trust boundaries.

## Architecture Overview

```
Frontend (Next.js) 
    ↓ [HTTP/HTTPS with Authentication]
Brain Server (Hono + Voltagent) 
    ↓ [Local/Internal Communication - Trusted]
RAG Server (FastAPI + ChromaDB + MongoDB)
```

### Trust Model
- **Frontend → Brain**: Untrusted boundary - requires authentication, authorization, rate limiting, and input validation
- **Brain → RAG**: Trusted boundary - internal communication with direct API calls
- **RAG**: Local-only APIs for internal use, not exposed to external networks

## Architecture Components

### 1. RAG Server (Internal Data Layer)
**Purpose**: Local knowledge management and data storage service

**Technology Stack**:
- **ChromaDB**: Local vector database for linguistic content (words, grammar, textbooks, articles)
- **MongoDB**: Local document database for user data and forum posts
- **FastAPI**: Internal API framework for local communication only

**Network Access**: 
- **Local Only**: Binds to localhost/127.0.0.1
- **No External Access**: Not exposed to internet or external networks
- **Internal Port**: Default 8001 (configurable)

**Internal API Endpoints** (Base URL: `http://localhost:8001/internal/v1`):

#### Content Management (ChromaDB)
- **POST** `/words/upload`: Store/update word entries
- **POST** `/words/query`: Retrieve word entries
- **POST** `/words/delete`: Remove word entries
- **POST** `/grammar/upload`: Store/update grammar entries
- **POST** `/grammar/query`: Retrieve grammar entries
- **POST** `/grammar/delete`: Remove grammar entries
- **POST** `/textbooks/upload`: Store/update textbook content
- **POST** `/textbooks/query`: Retrieve textbook content
- **POST** `/textbooks/delete`: Remove textbook content
- **POST** `/search/semantic`: Perform semantic search across all content
- **POST** `/search/vector`: Vector similarity search

#### User & Forum Data (MongoDB)
- **POST** `/users/create`: Create user record
- **POST** `/users/update`: Update user information
- **POST** `/users/query`: Retrieve user data
- **POST** `/users/delete`: Remove user account
- **POST** `/forums/create`: Store forum post
- **POST** `/forums/update**: Update forum post
- **POST** `/forums/query**: Retrieve forum posts
- **POST** `/forums/delete**: Remove forum post
- **POST** `/analytics/record`: Store usage analytics
- **POST** `/analytics/query**: Retrieve analytics data

### 2. Brain Server (Application Logic Layer)
**Purpose**: Business logic, authentication, and API gateway

**Technology Stack**:
- **Hono**: Fast web framework for API endpoints
- **Voltagent**: AI orchestration for intelligent responses
- **DeepSeek**: AI service integration
- **JWT**: Token-based authentication
- **Bcrypt**: Password hashing and validation

**Network Access**:
- **External API**: Exposed to frontend (HTTPS)
- **Internal Client**: Connects to RAG server locally
- **Port**: 8000 (configurable)

#### Public APIs (No Authentication Required)

##### Information Retrieval
- **GET** `/api/v1/wiki/search`: Search knowledge base
  
  Query Parameters:
  ```
  ?query=<search_term>&type=<word|grammar|textbook>&lang=<language>&limit=<number>
  ```
  
  Response:
  ```json
  {
    "success": true,
    "results": [
      {
        "type": "word|grammar|textbook",
        "title": "string",
        "content": "string",
        "relevance": "number",
        "language": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number"
    }
  }
  ```

- **GET** `/api/v1/words/translate`: Word translation lookup
  
  Query Parameters:
  ```
  ?word=<word>&from=<lang>&to=<lang>
  ```

- **GET** `/api/v1/grammar/rules`: Grammar rule lookup
  
  Query Parameters:
  ```
  ?rule=<rule_name>&lang=<documentation_language>
  ```

##### AI Chat Interface
- **POST** `/api/v1/chat/message`: Send message to chatbot
  
  Request:
  ```json
  {
    "message": "string",
    "context": {
      "language": "string",
      "conversationId": "string"
    }
  }
  ```
  
  Response (Server-Sent Events):
  ```json
  {
    "type": "message|thinking|done",
    "content": "string",
    "conversationId": "string",
    "timestamp": "string"
  }
  ```

#### Authenticated APIs (JWT Required)

##### Authentication & User Management
- **POST** `/api/v1/auth/register`: User registration
  
  Request:
  ```json
  {
    "username": "string",
    "email": "string", 
    "password": "string",
    "preferredLanguage": "string"
  }
  ```
  
  Response:
  ```json
  {
    "success": true,
    "user": {
      "id": "string",
      "username": "string",
      "role": "user"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": "number"
    }
  }
  ```

- **POST** `/api/v1/auth/login`: User authentication
- **POST** `/api/v1/auth/logout`: User logout
- **POST** `/api/v1/auth/refresh`: Refresh access token
- **GET** `/api/v1/users/profile`: Get user profile
- **PUT** `/api/v1/users/profile`: Update user profile
- **DELETE** `/api/v1/users/account`: Delete user account

##### Forum (Valva) - Authenticated Operations
- **GET** `/api/v1/valva/posts`: List forum posts with filtering
  
  Query Parameters:
  ```
  ?category=<category>&author=<username>&tags=<tag1,tag2>&limit=<number>&offset=<number>
  ```

- **POST** `/api/v1/valva/posts`: Create new forum post
  
  Request:
  ```json
  {
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "language": "string"
  }
  ```

- **GET** `/api/v1/valva/posts/{id}`: Get specific post with replies
- **PUT** `/api/v1/valva/posts/{id}`: Update post (author/moderator only)
- **DELETE** `/api/v1/valva/posts/{id}`: Delete post (author/moderator only)
- **POST** `/api/v1/valva/posts/{id}/replies`: Reply to post
- **POST** `/api/v1/valva/posts/{id}/vote`: Vote on post
- **POST** `/api/v1/valva/posts/{id}/flag`: Flag inappropriate content

#### Administrative APIs (Admin/Super Roles)

##### Content Management
- **POST** `/api/v1/admin/words`: Add/update word entries
  
  Request:
  ```json
  {
    "entries": [
      {
        "word": "string",
        "pos": "string",
        "direction": "string", 
        "description": "string",
        "examples": ["string"]
      }
    ]
  }
  ```

- **DELETE** `/api/v1/admin/words/{id}`: Delete word entry
- **POST** `/api/v1/admin/grammar`: Add/update grammar entries
- **DELETE** `/api/v1/admin/grammar/{id}`: Delete grammar entry
- **POST** `/api/v1/admin/textbooks`: Add/update textbooks
- **DELETE** `/api/v1/admin/textbooks/{id}`: Delete textbook
- **POST** `/api/v1/admin/content/approve`: Approve pending content
- **POST** `/api/v1/admin/content/reject`: Reject pending content

##### User Administration
- **GET** `/api/v1/admin/users`: List users with filtering
- **PUT** `/api/v1/admin/users/{id}/role`: Change user role (super only)
- **PUT** `/api/v1/admin/users/{id}/status`: Update user status
- **GET** `/api/v1/admin/analytics`: System usage analytics
- **POST** `/api/v1/admin/backup`: Create system backup

### 3. Frontend (Presentation Layer)
**Purpose**: User interface and client-side application

**Technology Stack**:
- **Next.js**: React framework with SSR/SSG
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **WebSockets**: Real-time chat interface

**Security Features**:
- **JWT Token Management**: Automatic token refresh and storage
- **Input Validation**: Client-side validation before API calls
- **XSS Protection**: Content sanitization and CSP headers
- **Rate Limiting Display**: User feedback for rate-limited requests

## Security Implementation

### Authentication Flow
1. **User Registration/Login** → Brain validates credentials → JWT tokens issued
2. **API Requests** → Brain validates JWT → Authorized requests forwarded to RAG
3. **Token Refresh** → Automatic renewal before expiration

### Input Validation & Sanitization
- **Frontend**: Client-side validation for UX
- **Brain Server**: Server-side validation and sanitization
- **RAG Server**: Type validation for internal API contracts

### Rate Limiting
- **Per-User Limits**: Authenticated users get higher limits
- **Per-IP Limits**: Anonymous users have stricter limits
- **API Endpoint Limits**: Different limits per endpoint type

### Authorization Levels
1. **Anonymous**: Wiki browsing, chat (limited), public forum reading
2. **User**: Full forum access, profile management, unlimited chat
3. **Moderator**: Content moderation, user warnings
4. **Admin**: Content management, user management
5. **Super**: System administration, backup/restore

## Data Models

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

## Deployment Architecture

### Development Environment
```yaml
# docker-compose.dev.yml
services:
  rag:
    build: ./rag
    ports:
      - "8001:8001"
    environment:
      - ENV=development
      - CHROMA_HOST=localhost
      - MONGO_URI=mongodb://localhost:27017/simplingua_dev
    networks:
      - internal

  brain:
    build: ./brain  
    ports:
      - "8000:8000"
    environment:
      - ENV=development
      - RAG_URL=http://rag:8001
      - JWT_SECRET=dev_secret
    depends_on:
      - rag
    networks:
      - internal
      - external

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    networks:
      - external

networks:
  internal:
    driver: bridge
  external:
    driver: bridge
```

### Production Environment
- **RAG Server**: Internal network only, no external exposure
- **Brain Server**: Reverse proxy (nginx/caddy) with SSL termination
- **Frontend**: CDN deployment (Vercel/Netlify) or static hosting
- **Databases**: Local volumes with automated backups
- **Monitoring**: Prometheus + Grafana for metrics collection

## Security Considerations

### Network Security
- **RAG Isolation**: No external network access, localhost binding only
- **Firewall Rules**: Only Brain server can access RAG ports
- **SSL/TLS**: All external communication encrypted

### Data Protection
- **Local Storage**: All data remains on local infrastructure
- **Backup Encryption**: Encrypted backups with key rotation
- **Privacy Controls**: GDPR-compliant data export/deletion

### Application Security
- **Input Validation**: Multi-layer validation (frontend, brain, RAG)
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: Prevent abuse and DoS attacks

### Monitoring & Alerting
- **Failed Authentication Attempts**: Monitor and alert on suspicious activity
- **API Rate Limiting**: Track and alert on unusual usage patterns
- **Error Logging**: Comprehensive error tracking and alerting
- **Performance Monitoring**: Response time and resource usage tracking

### Backend Services

#### 1. RAG Server
**Purpose**: Retrieval-Augmented Generation service for knowledge management

**Technology Stack**:
- **ChromaDB**: Local vector database for storing and retrieving linguistic data
- **FastAPI**: Internal API framework for backend communication

**API Endpoints** (Base URL: `/api/v0`):

##### Word Management
- **POST** `/upload/words`: Upload or update word entries
  
  Request Body:
  ```json
  [
    {
      "id": "string",           // Format: ${word}_${part_of_speech}
      "document": "string",     // Format: "${word}: ${description}"
      "metadata": {
        "word": "string",       // The word in original language
        "pos": "string",        // Part of speech (verb, noun, adjective, etc.)
        "direction": "string",  // Translation direction (cn2sim, en2sim, sim2cn, etc.)
        "description": "string", // Definition in target language
        "examples": ["string"], // Example sentences
        "date": "string"        // Last update timestamp (ISO 8601)
      }
    }
  ]
  ```

- **POST** `/query/words`: Query word entries
  
  Request:
  ```json
  {
    "words": ["string"],      // List of words to look up
    "lang": "string",         // Source language code
    "limit": "number"         // Maximum entries per word
  }
  ```
  
  Response:
  ```json
  [
    {
      "word": "string",       // The queried word
      "entries": [            // Array of WordEntry objects
        // ... WordEntry objects as defined above
      ]
    }
  ]
  ```

##### Grammar Management
- **POST** `/upload/grammars`: Upload or update grammar entries
  
  Request Body:
  ```json
  [
    {
      "id": "string",           // Format: ${name}:${lang}
      "document": "string",     // Grammar description/content
      "metadata": {
        "name": "string",       // Grammar rule name or identifier
        "lang": "string",       // Language of documentation
        "date": "string"        // Last update timestamp (ISO 8601)
      }
    }
  ]
  ```

- **POST** `/query/grammars`: Query grammar entries
  
  Request:
  ```json
  {
    "names": ["string"],      // List of grammar rule names
    "lang": "string"          // Documentation language
  }
  ```
  
  Response:
  ```json
  [
    {
      "name": "string",       // Grammar rule name
      "entry": {              // GrammarEntry object
        // ... GrammarEntry structure as defined above
      }
    }
  ]
  ```

##### Textbook Management
- **POST** `/upload/textbook`: Upload or update textbook content
  
  Request Body:
  ```json
  {
    "id": "string",           // Unique textbook identifier
    "document": "string",     // Textbook description
    "metadata": {
      "name": "string",       // Textbook title
      "author": "string",     // Author name
      "dateOfPublish": "string", // Original publication date
      "date": "string",       // Last update timestamp (ISO 8601)
      "contents": "string"    // Full textbook content
    }
  }
  ```

- **POST** `/query/textbooks`: Query textbook entries
  
  Request:
  ```json
  {
    "names": ["string"],      // List of textbook names/IDs
    "author": "string",       // Optional: filter by author
    "limit": "number"         // Maximum entries to return
  }
  ```
  
  Response:
  ```json
  [
    {
      "name": "string",       // Textbook name
      "entry": {              // TextbookEntry object
        // ... TextbookEntry structure as defined above
      }
    }
  ]
  ```

- **DELETE** `/textbooks/{id}`: Delete a specific textbook

##### Forum (Valva) APIs
- **POST** `/upload/forums`: Create or update forum posts
  
  Request Body:
  ```json
  [
    {
      "id": "string",         // Unique post identifier
      "document": "string",   // Post content for search indexing
      "metadata": {
        "title": "string",    // Post title
        "author": "string",   // Author username
        "category": "string", // Forum category (general, grammar, vocabulary, etc.)
        "content": "string",  // Full post content (markdown)
        "parentId": "string", // Optional: parent post ID for replies
        "tags": ["string"],   // Post tags for categorization
        "language": "string", // Primary language of the post
        "date": "string",     // Post creation timestamp (ISO 8601)
        "lastModified": "string", // Last edit timestamp (ISO 8601)
        "status": "string"    // Post status (active, locked, deleted, pending)
      }
    }
  ]
  ```

- **POST** `/query/forums`: Query forum posts
  
  Request:
  ```json
  {
    "category": "string",     // Optional: filter by category
    "author": "string",       // Optional: filter by author
    "tags": ["string"],       // Optional: filter by tags
    "keywords": ["string"],   // Search keywords in content
    "parentId": "string",     // Optional: get replies to specific post
    "limit": "number",        // Maximum posts to return
    "offset": "number"        // Pagination offset
  }
  ```
  
  Response:
  ```json
  {
    "posts": [               // Array of forum posts
      {
        "id": "string",
        "title": "string",
        "author": "string",
        "category": "string",
        "excerpt": "string",  // First 200 chars of content
        "tags": ["string"],
        "date": "string",
        "replyCount": "number",
        "lastActivity": "string"
      }
    ],
    "totalCount": "number",   // Total matching posts
    "hasMore": "boolean"      // Whether more results exist
  }
  ```

- **GET** `/forums/{id}`: Get full forum post details
- **PUT** `/forums/{id}`: Update existing forum post (author/admin only)
- **DELETE** `/forums/{id}`: Delete forum post (author/admin only)
- **POST** `/forums/{id}/replies`: Add reply to existing post

##### User Management APIs
- **POST** `/auth/login`: User authentication
  
  Request:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  
  Response:
  ```json
  {
    "token": "string",        // JWT authentication token
    "user": {
      "id": "string",
      "username": "string",
      "role": "string",       // user, admin, super
      "preferences": {
        "language": "string",
        "theme": "string"
      }
    }
  }
  ```

- **POST** `/auth/register`: User registration
  
  Request:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "preferredLanguage": "string"
  }
  ```

- **POST** `/auth/logout`: User logout
- **GET** `/users/{id}`: Get user profile
- **PUT** `/users/{id}`: Update user profile
- **GET** `/users/{id}/activity`: Get user activity history

##### Administrative APIs
- **GET** `/admin/users`: List all users (admin/super only)
  
  Response:
  ```json
  {
    "users": [
      {
        "id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "status": "string",     // active, suspended, pending
        "createdAt": "string",
        "lastLogin": "string",
        "postCount": "number",
        "contributionScore": "number"
      }
    ],
    "totalCount": "number"
  }
  ```

- **PUT** `/admin/users/{id}/role`: Change user role (super only)
- **PUT** `/admin/users/{id}/status`: Change user status (admin/super)
- **GET** `/admin/content/pending`: Get pending content for moderation
- **PUT** `/admin/content/{id}/approve`: Approve pending content
- **PUT** `/admin/content/{id}/reject`: Reject pending content
- **GET** `/admin/analytics`: Get system analytics and usage statistics
- **POST** `/admin/backup`: Create system backup
- **GET** `/admin/logs`: Access system logs (super only)

#### 2. Brain Server
**Purpose**: Central orchestration service handling client requests and AI interactions

**Technology Stack**:
- **Voltagent**: AI orchestration framework for flexible request handling
- **Hono**: Lightweight web framework for API endpoints
- **DeepSeek**: AI service provider for language processing capabilities

**Core Capabilities**:

##### Public APIs
- **POST** `/chat`: Real-time streaming chatbot interface
  - Supports conversation in multiple languages
  - Provides context-aware responses
  - Integrates with RAG server for accurate information retrieval
  - WebSocket support for real-time messaging

- **GET** `/wiki`: Comprehensive knowledge base access
  - Simplingua language overview and introduction
  - Searchable word entries with detailed definitions
  - Grammar rules and linguistic explanations
  - Textbook content and learning materials

- **GET** `/wiki/search`: Advanced wiki search
  
  Query Parameters:
  ```
  ?q=<search_term>&type=<content_type>&lang=<language>&limit=<number>
  ```
  
  Response:
  ```json
  {
    "results": [
      {
        "type": "word|grammar|textbook|article",
        "title": "string",
        "excerpt": "string",
        "relevanceScore": "number",
        "url": "string"
      }
    ],
    "totalCount": "number",
    "searchTime": "number"
  }
  ```

##### Forum APIs (Valva)
- **GET** `/valva/categories`: Get forum categories
- **GET** `/valva/posts`: List forum posts with filtering
- **GET** `/valva/posts/{id}`: Get specific post with replies
- **POST** `/valva/posts`: Create new forum post (authenticated)
- **PUT** `/valva/posts/{id}`: Edit existing post (authenticated)
- **DELETE** `/valva/posts/{id}`: Delete post (authenticated)
- **POST** `/valva/posts/{id}/replies`: Reply to post (authenticated)
- **POST** `/valva/posts/{id}/vote`: Vote on post (authenticated)
- **POST** `/valva/posts/{id}/flag`: Flag inappropriate content (authenticated)

##### User Management APIs
- **POST** `/auth/login`: User authentication
- **POST** `/auth/register`: User registration
- **POST** `/auth/logout`: User logout
- **POST** `/auth/refresh`: Refresh authentication token
- **POST** `/auth/forgot-password`: Password reset request
- **POST** `/auth/reset-password`: Complete password reset
- **GET** `/users/profile`: Get current user profile (authenticated)
- **PUT** `/users/profile`: Update user profile (authenticated)
- **GET** `/users/{username}`: Get public user profile
- **GET** `/users/{username}/posts`: Get user's forum posts
- **GET** `/users/{username}/contributions`: Get user's content contributions

##### Administrative APIs (Authentication Required)
- **GET** `/admin/dashboard`: Administrative dashboard data
  
  Response:
  ```json
  {
    "statistics": {
      "totalUsers": "number",
      "activeUsers": "number",
      "totalPosts": "number",
      "pendingContent": "number",
      "databaseSize": "string"
    },
    "recentActivity": [
      {
        "type": "user_registration|post_created|content_flagged",
        "timestamp": "string",
        "details": "object"
      }
    ],
    "systemHealth": {
      "ragServerStatus": "healthy|degraded|down",
      "databaseStatus": "healthy|degraded|down",
      "aiServiceStatus": "healthy|degraded|down"
    }
  }
  ```

- **GET** `/admin/users`: List all users with filtering
- **PUT** `/admin/users/{id}/role`: Change user role (super only)
- **PUT** `/admin/users/{id}/status`: Update user status
- **GET** `/admin/content/flagged`: Get flagged content for review
- **PUT** `/admin/content/{id}/moderate`: Moderate content (approve/reject/edit)
- **GET** `/admin/analytics`: Detailed system analytics
- **POST** `/admin/announcements`: Create system announcements
- **GET** `/admin/backup/status`: Check backup status
- **POST** `/admin/backup/create`: Initiate system backup

##### Content Management APIs (Admin/Super only)
- **POST** `/admin/words`: Create/edit word entries
- **DELETE** `/admin/words/{id}`: Delete word entries
- **POST** `/admin/grammar`: Create/edit grammar entries  
- **DELETE** `/admin/grammar/{id}`: Delete grammar entries
- **POST** `/admin/textbooks`: Create/edit textbooks
- **DELETE** `/admin/textbooks/{id}`: Delete textbooks
- **POST** `/admin/articles`: Create/edit articles
- **GET** `/admin/content/pending`: List pending content approvals
- **POST** `/admin/content/bulk-import`: Bulk content import
- **POST** `/admin/content/export`: Export content for backup

### Frontend Application

#### Technology Stack
- **Next.js**: React-based framework for server-side rendering and static generation
- **Serverless Architecture**: Optimized for scalable deployment

#### User Interface Components
- **Chat Interface**: Interactive chatbot with real-time messaging
- **Wiki Browser**: Searchable knowledge base with categorized content
- **Admin Dashboard**: Content management interface for authorized users
- **Community Forum**: Discussion platform for user interaction

## Data Models

### WordEntry Schema
```typescript
interface WordEntry {
  id: string;              // Unique identifier: ${word}_${pos}
  document: string;        // Formatted content for display
  metadata: {
    word: string;          // Original word
    pos: PartOfSpeech;     // Grammatical category
    direction: TranslationDirection; // Language pair
    description: string;   // Definition or translation
    examples: string[];    // Usage examples
    date: string;          // Last modified (ISO 8601)
  };
}
```

### GrammarEntry Schema
```typescript
interface GrammarEntry {
  id: string;              // Unique identifier: ${name}:${lang}
  document: string;        // Grammar explanation content
  metadata: {
    name: string;          // Grammar rule identifier
    lang: string;          // Documentation language
    date: string;          // Last modified (ISO 8601)
  };
}
```

### TextbookEntry Schema
```typescript
interface TextbookEntry {
  id: string;              // Unique textbook identifier
  document: string;        // Book description
  metadata: {
    name: string;          // Book title
    author: string;        // Author name
    dateOfPublish: string; // Original publication date
    date: string;          // Last modified (ISO 8601)
    contents: string;      // Full book content
  };
}
```

### ForumPost Schema
```typescript
interface ForumPost {
  id: string;              // Unique post identifier
  document: string;        // Post content for search indexing
  metadata: {
    title: string;         // Post title
    author: string;        // Author username
    category: ForumCategory; // Forum category
    content: string;       // Full post content (markdown)
    parentId?: string;     // Optional parent post ID for replies
    tags: string[];        // Post tags
    language: string;      // Primary language
    date: string;          // Creation timestamp (ISO 8601)
    lastModified: string;  // Last edit timestamp (ISO 8601)
    status: PostStatus;    // Post status
    replyCount: number;    // Number of replies
    viewCount: number;     // Number of views
    upvotes: number;       // Community upvotes
    downvotes: number;     // Community downvotes
  };
}

enum ForumCategory {
  GENERAL = "general",
  GRAMMAR = "grammar", 
  VOCABULARY = "vocabulary",
  TRANSLATION = "translation",
  LEARNING = "learning",
  CULTURE = "culture",
  ANNOUNCEMENTS = "announcements"
}

enum PostStatus {
  ACTIVE = "active",
  LOCKED = "locked",
  DELETED = "deleted",
  PENDING = "pending",
  FLAGGED = "flagged"
}
```

### User Schema
```typescript
interface User {
  id: string;              // Unique user identifier
  username: string;        // Display name
  email: string;           // Email address
  passwordHash: string;    // Hashed password
  role: UserRole;          // User permissions level
  status: UserStatus;      // Account status
  preferences: {
    language: string;      // Preferred interface language
    theme: string;         // UI theme preference
    notifications: {
      email: boolean;      // Email notifications enabled
      forum: boolean;      // Forum notifications enabled
      mentions: boolean;   // Mention notifications enabled
    };
  };
  profile: {
    bio?: string;          // Optional user biography
    location?: string;     // Optional location
    website?: string;      // Optional personal website
    joinDate: string;      // Account creation date (ISO 8601)
    lastLogin: string;     // Last login timestamp (ISO 8601)
    avatar?: string;       // Optional avatar image URL
  };
  statistics: {
    postCount: number;     // Total forum posts
    replyCount: number;    // Total forum replies
    contributionScore: number; // Community contribution score
    wordsContributed: number;  // Dictionary entries contributed
    grammarContributed: number; // Grammar entries contributed
  };
}

enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin", 
  SUPER = "super"
}

enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING = "pending",
  BANNED = "banned"
}
```

### Authentication Schema
```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;           // JWT authentication token
  refreshToken: string;    // Refresh token for token renewal
  user: {
    id: string;
    username: string;
    role: UserRole;
    preferences: UserPreferences;
  };
  expiresIn: number;       // Token expiration time in seconds
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  preferredLanguage: string;
  inviteCode?: string;     // Optional invite code for registration
}
```

## Security & Access Control

### Authentication System
- **JWT-based Authentication**: Secure token-based authentication with refresh tokens
- **Password Security**: Bcrypt hashing with salt rounds for password storage
- **Session Management**: Automatic token expiration and refresh mechanisms
- **Rate Limiting**: API rate limiting to prevent abuse

### Authorization Levels
1. **Public Access**: 
   - Chat interface and wiki browsing
   - Forum reading (without posting)
   - User registration and password reset

2. **Authenticated User Access**:
   - Forum posting and commenting
   - Profile management
   - Content voting and flagging
   - Personal dashboard and activity tracking

3. **Moderator Access**:
   - Content moderation (approve/reject/edit posts)
   - User warning and temporary suspension
   - Forum category management
   - Community guideline enforcement

4. **Admin Access**: 
   - Full content management (words, grammar, textbooks)
   - User management (role changes, permanent bans)
   - System configuration
   - Analytics and reporting access

5. **Super User Access**: 
   - System administration and maintenance
   - Admin account management
   - Database backup and restore
   - System-wide configuration changes

### Content Moderation
- **Automated Filtering**: AI-powered content screening for inappropriate material
- **Community Moderation**: User reporting and flagging system
- **Approval Workflows**: New content approval process for quality control
- **Version Control**: Track all content changes with rollback capabilities

### Data Protection & Privacy
- **Local Data Storage**: ChromaDB for data sovereignty and GDPR compliance
- **Data Encryption**: Encrypted storage for sensitive user information
- **Privacy Controls**: User data export and deletion capabilities
- **Audit Logging**: Comprehensive logging for security and compliance
- **Input Sanitization**: XSS and injection attack prevention
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Development Roadmap

### Phase 1: Core Infrastructure ✅
- RAG server with ChromaDB integration
- Basic API endpoints for content management
- Brain server with AI orchestration

### Phase 2: User Interface 🚧
- Next.js frontend implementation
- Chat interface development
- Wiki browsing functionality

### Phase 3: Community Features 📋
- Forum implementation (Valva)
- User authentication system
- Advanced content moderation

### Phase 4: Enhancements 📋
- Mobile application support
- Advanced search capabilities
- Analytics and usage reporting
- Multi-modal content support (audio, images)

## Deployment Architecture

### Development Environment
- Local ChromaDB instance
- FastAPI development server
- Next.js development server with hot reload

### Production Environment
- Containerized microservices
- Load balancing for brain server
- CDN integration for static assets
- Automated backup systems for ChromaDB data

## Monitoring & Maintenance

### Logging
- Comprehensive API request logging
- AI interaction tracking
- Error monitoring and alerting

### Performance Metrics
- Response time monitoring
- Database query optimization
- User engagement analytics

### Content Quality Assurance
- Automated content validation
- Community moderation tools
- Regular linguistic accuracy reviews