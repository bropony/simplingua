"""
Word Schemas
Pydantic models for word-related requests and responses
"""

from typing import List, Optional, Any, Dict

from pydantic import BaseModel, Field


class WordDefinition(BaseModel):
    """Word definition model"""
    meaning: str
    language: str
    examples: Optional[List[str]] = []


class WordDerivative(BaseModel):
    """Word derivative model"""
    derivative_word: str
    derivative_type: str
    gender_variants: Optional[List[str]] = None
    meaning: Optional[str] = None
    examples: Optional[Dict[str, str]] = None


class WordResponse(BaseModel):
    """Word entry response model"""
    id: str
    word: str
    pos: str
    verb_type: Optional[str] = None
    pronunciation: Optional[str] = None
    definitions: List[WordDefinition]
    examples: List[str]
    derivatives: Optional[List[WordDerivative]] = []
    natural_prefix_derivatives: Optional[List[WordDerivative]] = []
    synonyms: List[str]
    antonyms: List[str]
    frequency: str
    compound_marker: bool
    gender_pair: Optional[Dict[str, str]] = None


class WordSearchRequest(BaseModel):
    """Word search request"""
    q: str = Field(..., min_length=1)
    pos: Optional[str] = None
    verb_type: Optional[str] = Field(None, pattern="^(他|自|系|情态|无)?$")
    language: str = "en"
    has_derivatives: Optional[bool] = None
    has_pronunciation: Optional[bool] = None
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class WordSearchResponse(BaseModel):
    """Word search response"""
    success: bool = True
    results: List[WordResponse]
    pagination: Dict[str, int]


class ConjugateRequest(BaseModel):
    """Verb conjugation request"""
    word: str
    forms: List[str] = Field(..., min_items=1)


class ConjugationResponse(BaseModel):
    """Verb conjugation response"""
    word: str
    conjugations: Dict[str, Optional[str]]
    examples: Optional[Dict[str, str]] = None


class TranslateRequest(BaseModel):
    """Translation request"""
    text: str
    from: str = "en"
    to: str = "sim"
    pos: Optional[str] = None
    context: Optional[str] = None


class Translation(BaseModel):
    """Single translation"""
    word: str
    pos: str
    verb_type: Optional[str] = None
    meaning: str
    aspect: Optional[str] = None
    context: Optional[str] = None


class TranslateResponse(BaseModel):
    """Translation response"""
    text: str
    from: str
    to: str
    translations: List[Translation]
    examples: List[str]


class WordRelationsResponse(BaseModel):
    """Word relations (synonyms/antonyms) response"""
    synonyms: List[Dict[str, str]]
    antonyms: List[Dict[str, str]]
    semantic_field: Optional[str] = None


class RandomWordRequest(BaseModel):
    """Random word request"""
    pos: Optional[str] = None
    difficulty: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)?$")
