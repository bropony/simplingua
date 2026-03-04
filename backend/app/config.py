"""
Application Configuration
Environment-based configuration management
"""

import os
from functools import lru_cache
from typing import Optional


class Settings:
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "Simplingua API"
    APP_VERSION: str = "1.0.0"
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV == "development"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://simplingua:dev_password@localhost:5432/simplingua_dev"
    )
    POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20"))
    MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))

    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET", "dev_secret_change_in_production")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # AI Provider Configuration
    AI_DEFAULT_PROVIDER: str = os.getenv("AI_DEFAULT_PROVIDER", "deepseek")

    # DeepSeek
    AI_DEEPSEEK_API_KEY: Optional[str] = os.getenv("AI_DEEPSEEK_API_KEY")
    AI_DEEPSEEK_MODEL: str = os.getenv("AI_DEEPSEEK_MODEL", "deepseek-chat")
    AI_DEEPSEEK_BASE_URL: str = os.getenv("AI_DEEPSEEK_BASE_URL", "https://api.deepseek.com")

    # OpenAI
    AI_OPENAI_API_KEY: Optional[str] = os.getenv("AI_OPENAI_API_KEY")
    AI_OPENAI_MODEL: str = os.getenv("AI_OPENAI_MODEL", "gpt-4o")
    AI_OPENAI_BASE_URL: str = os.getenv("AI_OPENAI_BASE_URL", "https://api.openai.com/v1")

    # Anthropic
    AI_ANTHROPIC_API_KEY: Optional[str] = os.getenv("AI_ANTHROPIC_API_KEY")
    AI_ANTHROPIC_MODEL: str = os.getenv("AI_ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    AI_ANTHROPIC_BASE_URL: str = os.getenv("AI_ANTHROPIC_BASE_URL", "https://api.anthropic.com")

    # Local (Ollama)
    AI_LOCAL_BASE_URL: str = os.getenv("AI_LOCAL_BASE_URL", "http://localhost:11434")
    AI_LOCAL_MODEL: str = os.getenv("AI_LOCAL_MODEL", "llama3.2")

    # Vector Embedding
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    EMBEDDING_DIMENSION: int = 1536

    # Rate Limiting
    RATE_LIMIT_ANONYMOUS: int = int(os.getenv("RATE_LIMIT_ANONYMOUS", "30"))
    RATE_LIMIT_USER: int = int(os.getenv("RATE_LIMIT_USER", "100"))
    RATE_LIMIT_PERIOD_SECONDS: int = int(os.getenv("RATE_LIMIT_PERIOD_SECONDS", "60"))

    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    class Config:
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
