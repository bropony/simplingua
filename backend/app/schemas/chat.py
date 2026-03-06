"""
Chat Schemas
Pydantic models for AI chat requests and responses
"""

from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field


class ChatContext(BaseModel):
    """Chat context model"""
    language: str = "en"
    conversation_id: Optional[str] = None
    ai_provider: str = Field("deepseek", pattern="^(deepseek|openai|anthropic|local)$")


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    context: ChatContext


class ChatEvent(BaseModel):
    """SSE chat event model"""
    type: str = Field(..., pattern="^(message|thinking|done|error)$")
    content: str
    conversation_id: Optional[str] = None
    timestamp: Optional[str] = None


class WikiSearchRequest(BaseModel):
    """Wiki/knowledge base search request"""
    query: str = Field(..., min_length=1)
    type: Optional[str] = Field(None, pattern="^(word|grammar|textbook)?$")
    lang: str = "en"
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class WikiSearchResult(BaseModel):
    """Wiki search result model"""
    type: str
    title: str
    content: str
    relevance: float
    language: str


class WikiSearchResponse(BaseModel):
    """Wiki search response"""
    success: bool = True
    results: List[WikiSearchResult]
    pagination: Dict[str, int]
