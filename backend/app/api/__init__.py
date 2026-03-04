"""
API Routers
All FastAPI route handlers
"""

from .wiki import router as wiki_router
from .chat import router as chat_router
from .auth import router as auth_router
from .users import router as users_router
from .valva import router as valva_router
from .admin import router as admin_router
from .phonetics import router as phonetics_router
from .morphology import router as morphology_router
from .etymology import router as etymology_router

__all__ = [
    "wiki_router",
    "chat_router",
    "auth_router",
    "users_router",
    "valva_router",
    "admin_router",
    "phonetics_router",
    "morphology_router",
    "etymology_router",
]
