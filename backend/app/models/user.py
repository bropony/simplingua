"""
User Model
Database model for user accounts and authentication
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import Column, String, DateTime, Text, CheckConstraint, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class User(Base):
    """User account model"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        String(20),
        default="user",
        nullable=False,
        CheckConstraint("role IN ('user', 'moderator', 'admin', 'super')"),
        index=True
    )
    status = Column(
        String(20),
        default="active",
        nullable=False,
        CheckConstraint("status IN ('active', 'suspended', 'banned')")
    )
    preferred_language = Column(String(10), default="en")
    theme = Column(String(20), default="light")
    bio = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    join_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_login = Column(DateTime(timezone=True), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    forum_posts = relationship("ForumPost", back_populates="author", cascade="all, delete-orphan")
    votes = relationship("ForumVote", back_populates="user", cascade="all, delete-orphan")
    analytics_events = relationship("AnalyticsEvent", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
