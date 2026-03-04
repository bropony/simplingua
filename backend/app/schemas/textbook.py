"""
Textbook Schemas
Pydantic models for textbook-related requests and responses
"""

from typing import Optional, List
from pydantic import BaseModel


class Lesson(BaseModel):
    """Textbook lesson"""
    id: str
    chapter_id: str
    title: str
    order: int
    content: str
    examples: List[str]
    exercises: Optional[List[str]] = None


class Chapter(BaseModel):
    """Textbook chapter"""
    id: str
    textbook_id: str
    title: str
    order: int
    summary: Optional[str] = None


class TextbookResponse(BaseModel):
    """Textbook response"""
    id: str
    title: str
    description: Optional[str] = None
    author: Optional[str] = None
    language: str
    level: str
    chapters: List[Chapter]
    created_at: str
    last_modified: Optional[str] = None


class TextbookListResponse(BaseModel):
    """Textbook list response"""
    textbooks: List[TextbookResponse]
    total: int


class TextbookCreate(BaseModel):
    """Create textbook request"""
    title: str
    description: Optional[str] = None
    author: Optional[str] = None
    language: str
    level: str
