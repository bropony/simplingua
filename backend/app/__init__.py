"""
Simplingua Backend Application
Main FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.database import init_db
from app.api import (
    wiki_router,
    chat_router,
    auth_router,
    users_router,
    valva_router,
    admin_router,
    phonetics_router,
    morphology_router,
    etymology_router
)

# Create FastAPI app
settings = get_settings()
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Simplingua API - Constructed Language Learning Platform",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(wiki_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(valva_router)
app.include_router(admin_router)
app.include_router(phonetics_router)
app.include_router(morphology_router)
app.include_router(etymology_router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "wiki": "/api/v1/wiki",
            "chat": "/api/v1/chat",
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "valva": "/api/v1/valva",
            "admin": "/api/v1/admin",
            "phonetics": "/api/v1/phonetics",
            "morphology": "/api/v1/morphology",
            "etymology": "/api/v1/etymology"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
