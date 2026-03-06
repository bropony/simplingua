"""
Morphology Schemas
Pydantic models for morphology-related requests and responses
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class AffixExample(BaseModel):
    """Example of affix usage"""
    base: str
    derived: str
    meaning: Optional[str] = None


class Affix(BaseModel):
    """Morphological affix"""
    id: Optional[str] = None
    affix: str
    type: str = Field(..., pattern="^(prefix|suffix|infix)$")
    category: Optional[str] = None
    meaning: Optional[str] = None
    produces_pos: Optional[str] = None
    position: Optional[str] = None
    examples: List[AffixExample] = []


class AffixesResponse(BaseModel):
    """Affixes response"""
    affixes: List[Affix]


class WordGenerateRequest(BaseModel):
    """Word generation from affixes request"""
    root: str = Field(..., min_length=1)
    affixes: List[str] = Field(..., min_items=1)
    type: Optional[str] = None


class WordGenerationResponse(BaseModel):
    """Word generation response"""
    result: str
    valid: bool
    meaning: str
    rule_applied: Optional[str] = None
    alternatives: List[str] = []


class WordAnalysisResponse(BaseModel):
    """Word morphological analysis response"""
    word: str
    root: Optional[str] = None
    affixes: List[Affix]
    meaning: Optional[str] = None
