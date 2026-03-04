"""
Textbook Model
Database model for textbook entries
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, Text, Date, JSONB, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class Textbook(Base):
    """Textbook entry model"""

    __tablename__ = "textbooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    author = Column(String(200), nullable=True)
    language = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    chapters = Column(JSONB, nullable=True)
    date_published = Column(Date, nullable=True)
    status = Column(
        String(20),
        default="active",
        nullable=False,
        CheckConstraint("status IN ('active', 'pending', 'rejected')")
    )
    approved_by = Column(UUID(as_uuid=True), nullable=True)
    date_added = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_modified = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<Textbook(id={self.id}, title='{self.title}')>"
