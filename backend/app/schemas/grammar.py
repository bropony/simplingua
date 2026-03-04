"""
Grammar Schemas
Pydantic models for grammar-related requests and responses
"""

from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class GrammarRule(BaseModel):
    """Grammar rule pattern model"""
    pattern: Optional[str] = None
    example_from: Optional[str] = None
    example_to: Optional[str] = None
    condition: Optional[str] = None


class GrammarException(BaseModel):
    """Grammar exception model"""
    word: Optional[str] = None
    plural: Optional[str] = None
    note: Optional[str] = None


class GrammarResponse(BaseModel):
    """Grammar rule response model"""
    id: str
    section_id: str
    subsection_id: Optional[str] = None
    name: str
    rule_type: Optional[str] = None
    level: str
    summary: Optional[str] = None
    content: str
    rules: Optional[List[Dict[str, Any]]] = []
    exceptions: Optional[List[GrammarException]] = []
    cross_references: Optional[List[Dict[str, Any]]] = []
    examples: List[str]


class GrammarSectionResponse(BaseModel):
    """Grammar section list response"""
    id: str
    name: str
    order: int


class GrammarSearchRequest(BaseModel):
    """Grammar search request"""
    section: Optional[str] = None
    subsection: Optional[str] = None
    rule_type: Optional[str] = Field(None, pattern="^(inflectional|syntactic|morphological|phonological)?$")
    language: str = "en"
    level: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)?$")


class GrammarAnalysisRequest(BaseModel):
    """Sentence grammatical analysis request"""
    sentence: str
    language: str = "zh"


class TokenAnalysis(BaseModel):
    """Single token analysis"""
    word: str
    pos: str
    type: Optional[str] = None
    case: Optional[str] = None
    person: Optional[str] = None
    number: Optional[str] = None
    function: Optional[str] = None


class SentenceAnalysisResponse(BaseModel):
    """Sentence analysis response"""
    sentence: str
    analysis: List[TokenAnalysis]
    word_order: str
    translation: str


class GrammarSectionListResponse(BaseModel):
    """Grammar sections list response"""
    sections: List[GrammarSectionResponse]
