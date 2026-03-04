"""
Etymology Schemas
Pydantic models for etymology-related requests and responses
"""

from typing import List, Optional
from pydantic import BaseModel


class DerivationStep(BaseModel):
    """Step in word derivation chain"""
    form: str
    type: str
    meaning: Optional[str] = None


class EtymologyResponse(BaseModel):
    """Word etymology response"""
    word: str
    root: str
    derivation_chain: List[DerivationStep]
    related_words: List[str]


class RelatedWordsResponse(BaseModel):
    """Related words response"""
    word: str
    related: List[str]
    count: int
