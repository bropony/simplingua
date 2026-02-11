# RAG Server Implementation Prompt

## Project Overview
You are tasked with creating the **RAG Server** for the Simplingua project - a local-only data layer that manages linguistic content and user data. This server provides internal APIs for the Brain server and must never be exposed to external networks.

**Reference Document**: See [shared-specs.md](shared-specs.md) for complete data models, security requirements, and shared configuration.

## Project Requirements

### Core Purpose
- **Internal Data Layer**: Manage ChromaDB (linguistic content) and MongoDB (user/forum data)
- **Local-Only Access**: Bind to localhost (127.0.0.1:5000) - NO external exposure
- **Trusted Communication**: Direct API calls from Brain server (no authentication needed)
- **High Performance**: Fast retrieval for real-time applications

### Technology Stack
- **Framework**: FastAPI with async/await support
- **Vector Database**: ChromaDB for semantic search of linguistic content
- **Document Database**: MongoDB for user data and forum posts
- **Validation**: Pydantic models for request/response validation
- **Logging**: Structured logging with configurable levels

### Project Structure
```
rag/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── content.py         # ChromaDB models
│   │   ├── user.py           # MongoDB user models
│   │   └── forum.py          # MongoDB forum models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chroma_service.py  # ChromaDB operations
│   │   ├── mongo_service.py   # MongoDB operations
│   │   └── search_service.py  # Cross-database search
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── content.py         # Content management endpoints
│   │   ├── users.py          # User management endpoints
│   │   ├── forums.py         # Forum management endpoints
│   │   └── search.py         # Search endpoints
│   └── utils/
│       ├── __init__.py
│       ├── logger.py         # Logging configuration
│       └── exceptions.py     # Custom exceptions
├── tests/
│   ├── __init__.py
│   ├── test_content.py
│   ├── test_users.py
│   ├── test_forums.py
│   └── test_search.py
├── data/                     # Local data directory
│   ├── chroma/              # ChromaDB storage
│   └── backups/             # Backup storage
├── scripts/
│   ├── init_db.py           # Database initialization
│   ├── backup.py            # Backup utilities
│   └── migrate.py           # Migration scripts
├── requirements.txt
├── pyproject.toml           # Poetry configuration
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## API Implementation

### Base Configuration
- **Host**: 127.0.0.1 (localhost only)
- **Port**: 5000 (configurable via environment)
- **Base URL**: `http://localhost:5000/internal/v1`
- **No Authentication**: Trusted internal communication only

### Required Endpoints

#### Content Management (ChromaDB)
```python
# POST /internal/v1/words/upload
async def upload_words(words: List[WordEntryRequest]) -> UploadResponse

# POST /internal/v1/words/query  
async def query_words(query: WordQueryRequest) -> WordQueryResponse

# POST /internal/v1/words/delete
async def delete_words(ids: List[str]) -> DeleteResponse

# POST /internal/v1/grammar/upload
async def upload_grammar(entries: List[GrammarEntryRequest]) -> UploadResponse

# POST /internal/v1/grammar/query
async def query_grammar(query: GrammarQueryRequest) -> GrammarQueryResponse

# POST /internal/v1/grammar/delete
async def delete_grammar(ids: List[str]) -> DeleteResponse

# POST /internal/v1/textbooks/upload
async def upload_textbooks(books: List[TextbookEntryRequest]) -> UploadResponse

# POST /internal/v1/textbooks/query
async def query_textbooks(query: TextbookQueryRequest) -> TextbookQueryResponse

# POST /internal/v1/textbooks/delete
async def delete_textbooks(ids: List[str]) -> DeleteResponse

# POST /internal/v1/search/semantic
async def semantic_search(query: SemanticSearchRequest) -> SemanticSearchResponse

# POST /internal/v1/search/vector
async def vector_search(query: VectorSearchRequest) -> VectorSearchResponse
```

#### User & Forum Data (MongoDB)
```python
# POST /internal/v1/users/create
async def create_user(user: UserCreateRequest) -> UserResponse

# POST /internal/v1/users/update
async def update_user(user_id: str, updates: UserUpdateRequest) -> UserResponse

# POST /internal/v1/users/query
async def query_users(query: UserQueryRequest) -> UserQueryResponse

# POST /internal/v1/users/delete
async def delete_user(user_id: str) -> DeleteResponse

# POST /internal/v1/forums/create
async def create_forum_post(post: ForumPostCreateRequest) -> ForumPostResponse

# POST /internal/v1/forums/update
async def update_forum_post(post_id: str, updates: ForumPostUpdateRequest) -> ForumPostResponse

# POST /internal/v1/forums/query
async def query_forum_posts(query: ForumQueryRequest) -> ForumQueryResponse

# POST /internal/v1/forums/delete
async def delete_forum_post(post_id: str) -> DeleteResponse

# POST /internal/v1/analytics/record
async def record_analytics(event: AnalyticsEvent) -> RecordResponse

# POST /internal/v1/analytics/query
async def query_analytics(query: AnalyticsQuery) -> AnalyticsResponse
```

### Health and Monitoring
```python
# GET /internal/v1/health
async def health_check() -> HealthResponse

# GET /internal/v1/metrics
async def get_metrics() -> MetricsResponse

# POST /internal/v1/backup/create
async def create_backup() -> BackupResponse

# GET /internal/v1/backup/status
async def backup_status() -> BackupStatusResponse
```

## Implementation Details

### Configuration Management
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Server Configuration
    host: str = "127.0.0.1"  # MUST be localhost only
    port: int = 5000
    
    # Database Configuration
    chroma_db_path: str = "./data/chroma"
    mongo_uri: str = "mongodb://localhost:27017/simplingua"
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/rag.log"
    
    # Performance
    max_workers: int = 4
    connection_timeout: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### ChromaDB Service Implementation
```python
# app/services/chroma_service.py
import chromadb
from chromadb.config import Settings as ChromaSettings

class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=settings.chroma_db_path,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collections = {
            "words": self.client.get_or_create_collection("words"),
            "grammar": self.client.get_or_create_collection("grammar"),
            "textbooks": self.client.get_or_create_collection("textbooks")
        }
    
    async def store_words(self, entries: List[WordEntry]) -> bool:
        """Store word entries in ChromaDB"""
        # Implementation here
        
    async def query_words(self, query: str, filters: dict = None, limit: int = 10):
        """Query word entries with semantic search"""
        # Implementation here
        
    # Additional methods for grammar, textbooks, etc.
```

### MongoDB Service Implementation
```python
# app/services/mongo_service.py
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError

class MongoService:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.mongo_uri)
        self.db = self.client.simplingua
        self.users = self.db.users
        self.forums = self.db.forums
        self.analytics = self.db.analytics
    
    async def create_user(self, user_data: dict) -> dict:
        """Create a new user"""
        # Implementation with proper error handling
        
    async def query_users(self, filters: dict, limit: int = 50):
        """Query users with filtering"""
        # Implementation here
        
    # Additional methods for forums, analytics, etc.
```

### Error Handling
```python
# app/utils/exceptions.py
class RAGException(Exception):
    """Base RAG exception"""
    pass

class DatabaseException(RAGException):
    """Database operation failed"""
    pass

class ValidationException(RAGException):
    """Input validation failed"""
    pass

class NotFoundException(RAGException):
    """Resource not found"""
    pass
```

### Logging Configuration
```python
# app/utils/logger.py
import logging
import sys
from pathlib import Path

def setup_logging():
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(log_format))
    
    # File handler
    log_file = Path(settings.log_file)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(logging.Formatter(log_format))
    
    # Root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.log_level.upper()))
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger
```

## Configuration Files

### pyproject.toml
```toml
[tool.poetry]
name = "simplingua-rag"
version = "0.1.0"
description = "RAG Server for Simplingua Platform"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.115.0"
uvicorn = {extras = ["standard"], version = "^0.32.0"}
pydantic = "^2.9.0"
pydantic-settings = "^2.7.0"
motor = "^3.6.0"
chromadb = "^0.6.0"
python-multipart = "^0.0.12"
asyncio = "^3.4.3"
aiofiles = "^24.1.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.3.0"
pytest-asyncio = "^0.24.0"
black = "^24.10.0"
ruff = "^0.8.0"
mypy = "^1.13.0"
httpx = "^0.28.1"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p /app/data/chroma /app/logs

# Expose internal port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/internal/v1/health')"

# Start server
CMD ["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "5000"]
```

### .env.example
```bash
# Server Configuration
HOST=127.0.0.1
PORT=5000

# Database Configuration
CHROMA_DB_PATH=./data/chroma
MONGO_URI=mongodb://localhost:27017/simplingua

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=./logs/rag.log

# Performance Configuration
MAX_WORKERS=4
CONNECTION_TIMEOUT=30

# Development/Production Flag
ENV=development
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  rag-server:
    build: .
    container_name: simplingua-rag
    ports:
      - "127.0.0.1:5000:5000"  # Bind to localhost only
    environment:
      - HOST=0.0.0.0  # Inside container, bind to all interfaces
      - PORT=5000
      - CHROMA_DB_PATH=/app/data/chroma
      - MONGO_URI=mongodb://mongodb:27017/simplingua
      - LOG_LEVEL=INFO
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    networks:
      - internal
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    container_name: simplingua-mongo
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - internal

volumes:
  mongo_data:

networks:
  internal:
    driver: bridge
```

## Testing Requirements

### Test Structure
- **Unit Tests**: Individual service methods
- **Integration Tests**: Database operations
- **API Tests**: Endpoint functionality
- **Performance Tests**: Load testing for search operations

### Example Test
```python
# tests/test_content.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_upload_words():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/internal/v1/words/upload", json=[
            {
                "word": "salu",
                "pos": "verb",
                "direction": "sim2en",
                "description": "to greet, to say hello",
                "examples": ["Mi salu vin. (I greet you.)"]
            }
        ])
    assert response.status_code == 200
    assert response.json()["success"] is True
```

## Security Considerations

### Network Security
- **CRITICAL**: MUST bind to 127.0.0.1 only - never 0.0.0.0 in production
- **Firewall**: Configure host firewall to block external access to port 8001
- **Container Security**: Use internal Docker networks only

### Data Protection
- **Input Validation**: Validate all incoming data with Pydantic
- **SQL Injection**: Use parameterized queries for MongoDB operations
- **Data Backup**: Implement automated backup mechanisms
- **Logging**: Log all operations for audit trail

### Error Handling
- **Never expose internal paths** in error messages
- **Sanitize error responses** before returning to Brain server
- **Rate limiting**: Implement internal rate limiting for resource protection

## Development Guidelines

### Code Quality
- Use type hints for all function signatures
- Implement comprehensive error handling
- Add docstrings for all public methods
- Follow PEP 8 style guidelines

### Performance Optimization
- Use async/await for all I/O operations
- Implement connection pooling for databases
- Add caching for frequently accessed data
- Monitor query performance and optimize slow operations

### Documentation
- Generate OpenAPI documentation with FastAPI
- Include usage examples in docstrings
- Document configuration options
- Provide troubleshooting guide

## Deployment Checklist

### Pre-deployment
- [ ] Verify localhost-only binding
- [ ] Test all API endpoints
- [ ] Run performance tests
- [ ] Backup existing data
- [ ] Configure logging
- [ ] Set up monitoring

### Post-deployment
- [ ] Verify Brain server connectivity
- [ ] Monitor resource usage
- [ ] Check error logs
- [ ] Test backup/restore procedures
- [ ] Validate data integrity

Remember: This server must NEVER be accessible from external networks. It serves as the trusted data layer for the Brain server only.