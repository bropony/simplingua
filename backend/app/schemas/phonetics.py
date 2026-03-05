"""
Phonetics Schemas
Pydantic models for phonetics-related requests and responses
"""

from typing import List, Optional
from pydantic import BaseModel


class PhoneticsRuleExample(BaseModel):
    """Example for a phonetic rule"""
    from_consonant: str
    to_sound: str
    condition: Optional[str] = None


class PhoneticsRule(BaseModel):
    """Phonological rule"""
    type: str
    description: Optional[str] = None
    rule: Optional[str] = None
    examples: List[PhoneticsRuleExample]
    exceptions: Optional[List[str]] = []
    exception_rule: Optional[str] = None


class PhoneticsRulesResponse(BaseModel):
    """Phonetics rules response"""
    rules: List[PhoneticsRule]


class PronunciationResponse(BaseModel):
    """Word pronunciation response"""
    word: str
    ipa: str
    stress_marked: Optional[str] = None
    syllables: List[str]
    stress_pattern: str


class PhoneticsAnalysisRequest(BaseModel):
    """Phonetic analysis request"""
    text: str


class PhoneticsAnalysisResponse(BaseModel):
    """Phonetic analysis response"""
    text: str
    syllables: List[List[str]]
    stress_marks: List[int]  # Index of stressed syllables
    ipa_transcription: str
