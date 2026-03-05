# Simplingua Backend API

FastAPI backend for the Simplingua conlang learning platform.

## Features

- **Knowledge Base**: Comprehensive wiki for words, grammar, textbooks
- **AI Chat**: LangGraph-powered AI tutoring with streaming responses
- **Multi-Provider AI**: Support for DeepSeek, OpenAI, Anthropic, Local models
- **User System**: JWT authentication, profile management
- **Forum (Valva)**: Community discussion platform
- **Admin Panel**: Content management and user administration

## Technology Stack

- **FastAPI**: Modern async web framework
- **PostgreSQL**: Relational database with pgvector extension
- **LangGraph**: AI agent workflow orchestration
- **SQLAlchemy**: Python ORM
- **Pydantic**: Data validation
- **JWT**: Token-based authentication

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from app.core.database import init_db; init_db()"
```

## Running

```bash
# Development
python main.py

# Or with uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# With Docker
docker build -t simplingua-backend .
docker run -p 8000:8000 --env-file .env simplingua-backend
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Public (No Auth)
- `GET /api/v1/wiki/*` - Knowledge base search
- `GET /api/v1/wiki/words/search` - Word search
- `GET /api/v1/wiki/translate` - Translation
- `GET /api/v1/wiki/grammar/*` - Grammar rules
- `POST /api/v1/chat/message` - AI chat (SSE streaming)
- `GET /api/v1/phonetics/*` - Pronunciation rules
- `GET /api/v1/morphology/*` - Affixes, word formation
- `GET /api/v1/etymology/words/{id}/etymology` - Word derivation

### Authenticated (JWT Required)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET/PUT /api/v1/users/profile` - User profile
- `DELETE /api/v1/users/account` - Delete account
- `GET/POST/PUT/DELETE /api/v1/valva/posts` - Forum operations

### Admin (Admin/Super Required)
- `GET /api/v1/admin/*` - Content and user management

## Project Structure

```
backend/
├── app/
│   ├── __init__.py         # FastAPI app
│   ├── config.py            # Configuration
│   ├── core/               # Core functionality
│   │   ├── database.py     # DB connection
│   │   ├── security.py      # JWT, password hashing
│   │   └── embeddings.py   # Vector embeddings
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic models
│   ├── api/                # API routers
│   ├── agents/             # LangGraph agents
│   └── providers/          # AI providers
├── main.py                # Entry point
├── requirements.txt
├── Dockerfile
└── tests/
```

## Environment Variables

See `.env.example` for all available variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for token signing
- `CHAT_AI_DEFAULT_PROVIDER` - Default chat AI provider (deepseek|openai|anthropic|local)
- `EMBEDDING_AI_DEFAULT_PROVIDER` - Default embedding AI provider (deepseek|openai|sentencetransformer|local)
- `AI_DEEPSEEK_API_KEY` - DeepSeek API key (required)

## AI Provider Support

The backend supports multiple AI providers:

1. **DeepSeek** (default) - Cost-effective Chinese AI
2. **OpenAI** - GPT-4, GPT-4o
3. **Anthropic** - Claude models
4. **Local** - Ollama, LM Studio for offline inference

Configure provider via environment variables or per-request in the chat context.

## Development

### Adding New API Endpoints

1. Create schema in `app/schemas/`
2. Create route handler in `app/api/`
3. Include router in `app/__init__.py`

### Running Tests

```bash
pytest tests/
```

## Deployment

See `docs/DEPLOY.md` for production deployment guide.
