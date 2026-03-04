"""
Admin Schemas
Pydantic models for admin-related requests and responses
"""

from typing import List, Optional
from pydantic import BaseModel


class AdminUserInfo(BaseModel):
    """Admin user info (simplified)"""
    id: str
    username: str
    email: str
    role: str
    status: str
    join_date: str


class UserListResponse(BaseModel):
    """User list response for admin"""
    users: List[AdminUserInfo]
    total: int


class RoleChangeResponse(BaseModel):
    """Role change response"""
    success: bool = True
    message: str


class StatusChangeResponse(BaseModel):
    """Status change response"""
    success: bool = True
    message: str


class ContentManageResponse(BaseModel):
    """Content management response"""
    success: bool = True
    added: int


class ContentDeleteResponse(BaseModel):
    """Content delete response"""
    success: bool = True
    message: str


class ContentModerationResponse(BaseModel):
    """Content moderation response"""
    success: bool = True
    message: str


class AnalyticsResponse(BaseModel):
    """Analytics response"""
    total_users: int
    total_words: int
    total_posts: int
    recent_registrations: int
    active_today: int


class BackupResponse(BaseModel):
    """Backup response"""
    success: bool = True
    message: str
    backup_id: str
