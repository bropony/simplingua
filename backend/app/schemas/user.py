"""
User Schemas
Pydantic models for user-related requests and responses
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


def validate_password_length(value: str) -> str:
    """Validate password length for bcrypt compatibility"""
    if len(value.encode('utf-8')) > 72:
        raise ValueError("Password cannot exceed 72 bytes (≈72 ASCII characters)")
    return value


class UserBase(BaseModel):
    """Base user model"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """User registration model"""
    password: str = Field(..., min_length=8, max_length=72)
    preferred_language: str = "en"


class UserLogin(BaseModel):
    """User login model"""
    username: str
    password: str = Field(..., max_length=72)


class UserUpdate(BaseModel):
    """User profile update model"""
    email: Optional[EmailStr] = None
    preferred_language: Optional[str] = None
    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    bio: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """User response model"""
    id: str
    username: str
    email: str
    role: str
    preferred_language: str
    theme: str
    bio: Optional[str]
    website: Optional[str]
    avatar_url: Optional[str]
    join_date: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response"""
    accessToken: str
    refreshToken: str
    tokenType: str = "Bearer"
    expiresIn: int


class TokenRequest(BaseModel):
    """Token refresh request"""
    refreshToken: str
