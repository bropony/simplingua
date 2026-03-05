"""
Forum Models
Database models for Valva forum system
"""

from datetime import datetime
from typing import List

from sqlalchemy import Column, String, Text, DateTime, Integer, JSON, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
import uuid

from app.core.database import Base


class ForumPost(Base):
    """Forum post model"""

    __tablename__ = "forum_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    tags = Column(ARRAY(String), nullable=True)
    language = Column(String(10), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=True, index=True)
    status = Column(
        String(20),
        default="active",
        nullable=False,
    )
    view_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    flag_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    last_modified = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", back_populates="forum_posts")
    replies = relationship("ForumPost", backref="parent_post", remote_side=[id])
    votes = relationship("ForumVote", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ForumPost(id={self.id}, title='{self.title}', author_id='{self.author_id}')>"


class ForumVote(Base):
    """Forum vote model"""

    __tablename__ = "forum_votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vote_type = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="votes")
    post = relationship("ForumPost", back_populates="votes")

    def __repr__(self):
        return f"<ForumVote(id={self.id}, post_id='{self.post_id}', vote_type='{self.vote_type}')>"
