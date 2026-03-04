"""
Pydantic Schemas
All request/response models for API validation
"""

from .user import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
    TokenResponse,
    TokenRequest,
)
from .word import (
    WordResponse,
    WordSearchRequest,
    WordSearchResponse,
    ConjugateRequest,
    ConjugationResponse,
    TranslateRequest,
    TranslateResponse,
    WordRelationsResponse,
    RandomWordRequest,
)
from .grammar import (
    GrammarResponse,
    GrammarSectionResponse,
    GrammarSearchRequest,
    GrammarAnalysisRequest,
    SentenceAnalysisResponse,
    GrammarSectionListResponse,
)
from .forum import (
    ForumPostCreate,
    ForumPostUpdate,
    ForumPostResponse,
    ForumPostListResponse,
    ForumReplyCreate,
    VoteRequest,
)
from .chat import (
    ChatContext,
    ChatMessage,
    ChatRequest,
    ChatEvent,
    WikiSearchRequest,
    WikiSearchResponse,
)

__all__ = [
    # User schemas
    "UserCreate",
    "UserLogin",
    "UserUpdate",
    "UserResponse",
    "TokenResponse",
    "TokenRequest",
    # Word schemas
    "WordResponse",
    "WordSearchRequest",
    "WordSearchResponse",
    "ConjugateRequest",
    "ConjugationResponse",
    "TranslateRequest",
    "TranslateResponse",
    "WordRelationsResponse",
    "RandomWordRequest",
    # Grammar schemas
    "GrammarResponse",
    "GrammarSectionResponse",
    "GrammarSearchRequest",
    "GrammarAnalysisRequest",
    "SentenceAnalysisResponse",
    "GrammarSectionListResponse",
    # Forum schemas
    "ForumPostCreate",
    "ForumPostUpdate",
    "ForumPostResponse",
    "ForumPostListResponse",
    "ForumReplyCreate",
    "VoteRequest",
    # Chat schemas
    "ChatContext",
    "ChatMessage",
    "ChatRequest",
    "ChatEvent",
    "WikiSearchRequest",
    "WikiSearchResponse",
]
