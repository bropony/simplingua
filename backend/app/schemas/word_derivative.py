"""
Word Derivative Schemas
Pydantic models for word derivative requests and responses
"""

from typing import Optional, List
from pydantic import BaseModel


class WordDerivativeResponse(BaseModel):
    """Word derivative response"""
    id: str
    word_id: str
    derivative_word: str
    derivative_type: str
    gender_variants: Optional[str] = None
    meaning: Optional[str] = None
    examples: Optional[str] = None
    created_at: str


class WordDerivativeCreate(BaseModel):
    """Create word derivative request"""
    word_id: str
    derivative_word: str
    derivative_type: str
    gender_variants: Optional[str] = None
    meaning: Optional[str] = None
    examples: Optional[str] = None
