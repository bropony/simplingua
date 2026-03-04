#!/usr/bin/env python3
"""
Simplingua Backend Entry Point
Run the FastAPI application server
"""

import uvicorn
from app import app
from app.config import get_settings

settings = get_settings()

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
