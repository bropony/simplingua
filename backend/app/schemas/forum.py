"""
Forum Schemas
Pydantic models for Valva forum requests and responses
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class ForumPostCreate(BaseModel):
    """Create forum post model"""
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    category: str = Field(..., max_length=50)
    tags: List[str] = []
    language: str = "en"


class ForumPostUpdate(BaseModel):
    """Update forum post model"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None


class ForumPostResponse(BaseModel):
    """Forum post response model"""
    id: str
    title: Optional[str]
    content: str
    author_id: str
    author_username: Optional[str]
    category: str
    tags: List[str]
    language: str
    parent_id: Optional[str]
    status: str
    view_count: int
    reply_count: int
    vote_score: int
    user_vote: Optional[str]
    created_at: datetime
    last_modified: Optional[datetime]

    class Config:
        from_attributes = True


class ForumPostListResponse(BaseModel):
    """Forum post list response"""
    success: bool = True
    results: List[ForumPostResponse]
    pagination: Dict[str, int]


class ForumReplyCreate(BaseModel):
    """Create forum reply model"""
    content: str = Field(..., min_length=1)


class VoteRequest(BaseModel):
    """Vote request model"""
    vote_type: str = Field(..., pattern="^(up|down)$")
