# Simplingua Platform

> A comprehensive platform for learning and interacting with the Simplingua constructed language

## Overview

Simplingua is a modern, full-featured platform designed to support learners and enthusiasts of the Simplingua constructed language. The platform combines AI-powered assistance, comprehensive documentation, community features, and interactive learning tools in a secure, scalable architecture.

## Features

### 🤖 Intelligent AI Assistant
- **Multi-language Chat**: Converse with an AI that understands both Simplingua and natural languages
- **Translation Services**: Real-time translation between Simplingua and other languages
- **Grammar Assistance**: Get explanations of grammar rules and linguistic concepts
- **Learning Support**: Personalized learning assistance and progress tracking

### 📚 Comprehensive Knowledge Base
- **Dictionary System**: Multi-directional dictionaries with detailed word entries
- **Grammar Reference**: Complete grammar documentation with examples
- **Textbook Library**: Learning materials and educational content
- **Search Integration**: Semantic search across all content types

### 🗣️ Community Forum (Valva)
- **Discussion Categories**: Organized forums for different topics
- **User Contributions**: Community-driven content and discussions
- **Moderation System**: Content quality control and community guidelines
- **Voting & Reputation**: Community-based content ranking

### 🎛️ Administration Tools
- **Content Management**: Tools for managing dictionary, grammar, and textbook content
- **User Administration**: User management with role-based access control
- **Analytics Dashboard**: Usage statistics and platform insights
- **Backup & Maintenance**: System maintenance and data protection tools

### 🎵 Multimedia Support
- **Audio Pronunciation**: Pronunciation guides and audio examples
- **Visual Learning**: Images and illustrations for vocabulary and concepts
- **Interactive Exercises**: Engaging learning activities and assessments
- **Progress Tracking**: Learning progress monitoring and achievements

## Architecture

The platform follows a secure three-tier architecture with clear separation of concerns:

```
┌─────────────────┐    HTTPS/WSS     ┌─────────────────┐    Internal     ┌─────────────────┐
│                 │◄─────────────────►│                 │◄───────────────►│                 │
│    Frontend     │   (Untrusted)    │  Brain Server   │   (Trusted)     │   RAG Server    │
│    (Next.js)    │                  │ (Hono/Voltagent)│                 │ (FastAPI/ChromaDB)│
│                 │                  │                 │                 │                 │
└─────────────────┘                  └─────────────────┘                 └─────────────────┘
```

### Components

- **Frontend**: Modern Next.js application with responsive UI and real-time features
- **Brain Server**: Authentication gateway and API layer with AI orchestration
- **RAG Server**: Local data layer with vector search and document storage

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Forms**: React Hook Form + Zod

### Brain Server
- **Framework**: Hono (TypeScript)
- **AI**: Voltagent + DeepSeek
- **Authentication**: JWT with refresh tokens
- **Security**: Rate limiting, input validation, CORS

### RAG Server
- **Framework**: FastAPI (Python)
- **Vector DB**: ChromaDB
- **Document DB**: MongoDB
- **Search**: Semantic search with embeddings

## Project Structure

```
simplingua/
├── rag/                    # RAG Server (Internal Data Layer)
├── brain/                  # Brain Server (Application Logic)
├── frontend/               # Frontend Application (User Interface)
├── docs/                   # Documentation
│   ├── blueprint-revised.md
│   ├── shared-specs.md
│   ├── rag-prompt.md
│   ├── brain-prompt.md
│   └── frontend-prompt.md
├── docker-compose.yml      # Multi-service deployment
└── README.md              # This file
```

## Quick Start

### Prerequisites

- **Node.js** 20+ (for Frontend and Brain server)
- **Python** 3.11+ (for RAG server)
- **Docker & Docker Compose** (recommended for deployment)
- **MongoDB** (for user and forum data)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd simplingua
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp rag/.env.example rag/.env
   cp brain/.env.example brain/.env
   cp frontend/.env.local.example frontend/.env.local
   
   # Edit configuration files with your settings
   ```

3. **Start with Docker Compose (Recommended)**
   ```bash
   docker-compose up --build
   ```

4. **Or start services individually:**

   **RAG Server:**
   ```bash
   cd rag
   poetry install
   poetry run uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```

   **Brain Server:**
   ```bash
   cd brain
   npm install
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Brain API**: http://localhost:8000
- **RAG API**: http://127.0.0.1:8001 (internal only)

## Configuration

### Environment Variables

**RAG Server (.env)**
```bash
HOST=127.0.0.1
PORT=8001
CHROMA_DB_PATH=./data/chroma
MONGO_URI=mongodb://localhost:27017/simplingua
LOG_LEVEL=INFO
```

**Brain Server (.env)**
```bash
HOST=0.0.0.0
PORT=8000
RAG_BASE_URL=http://localhost:8001
JWT_SECRET=your-secret-key
DEEPSEEK_API_KEY=your-deepseek-key
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=Simplingua
```

## Security

### Network Security
- **RAG Server**: Localhost-only binding (127.0.0.1) - never exposed externally
- **Brain Server**: External API with HTTPS in production
- **Frontend**: Static hosting with CSP headers

### Authentication
- **JWT-based**: Secure token authentication with refresh capability
- **Role-based Access**: User, Moderator, Admin, Super user roles
- **Rate Limiting**: Request throttling to prevent abuse

### Data Protection
- **Local Storage**: All data stored locally for privacy and sovereignty
- **Input Validation**: Multi-layer validation and sanitization
- **Backup Systems**: Automated backup and recovery procedures

## API Documentation

### Public APIs (Brain Server)

**Chat Interface**
```
POST /api/v1/chat/message
GET  /api/v1/wiki/search
GET  /api/v1/words/translate
```

**Authentication**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

**Forum (Authenticated)**
```
GET    /api/v1/valva/posts
POST   /api/v1/valva/posts
GET    /api/v1/valva/posts/:id
PUT    /api/v1/valva/posts/:id
DELETE /api/v1/valva/posts/:id
```

**Admin (Admin/Super only)**
```
POST   /api/v1/admin/words
DELETE /api/v1/admin/words/:id
GET    /api/v1/admin/users
PUT    /api/v1/admin/users/:id/role
```

Full API documentation available in the individual prompt files.

## Development

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Testing**: Unit and integration tests
- **Documentation**: Comprehensive inline documentation

### Development Guidelines
- Follow the established project structure
- Implement proper error handling and logging
- Add loading states for async operations
- Write tests for new features
- Document multimedia placeholder integration points

### Multimedia Resources
The platform includes placeholder infrastructure for:
- **Audio**: Pronunciation guides and UI sounds
- **Images**: Illustrations, icons, and educational visuals
- **Interactive Content**: Exercises and learning activities

Replace placeholders with actual content as resources become available.

## Deployment

### Docker Deployment (Recommended)
```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build -d

# Development environment
docker-compose up --build
```

### Manual Deployment
1. Build each service according to its specific requirements
2. Configure reverse proxy (nginx/caddy) for Brain server
3. Set up SSL certificates for HTTPS
4. Configure firewall to block external access to RAG server
5. Set up automated backups for data directories

## Contributing

### Setup for Contributors
1. Read the project documentation in `/docs`
2. Follow the coding standards and guidelines
3. Test your changes thoroughly
4. Submit pull requests with clear descriptions

### Project Structure Guidelines
- Each service has its own prompt file for complete implementation guidance
- Shared specifications in `shared-specs.md`
- Follow the established architecture patterns
- Maintain security boundaries between services

## License

[Add your license information here]

## Support

For issues, questions, or contributions:
- Check the documentation in `/docs`
- Review the implementation prompts for detailed guidance
- Follow the established patterns for consistency

## Roadmap

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

---

**Built with ❤️ for the Simplingua community**
