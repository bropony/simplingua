"""
Word Model
Database model for lexicon entries with linguistic features
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, Text, ARRAY, Boolean, JSONB, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class Word(Base):
    """Word entry model with full linguistic data"""

    __tablename__ = "words"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    word = Column(String(200), nullable=False, index=True)
    pos = Column(String(50), nullable=False, index=True)  # Part of speech
    verb_type = Column(String(20), nullable=True)  # 他|自|系|情态|无
    pronunciation = Column(String(200), nullable=True, index=True)
    direction = Column(String(20), nullable=False, index=True)  # cn2sim, en2sim, sim2cn, etc.
    description = Column(Text, nullable=False)
    definitions = Column(JSONB, nullable=True)
    examples = Column(ARRAY(Text), nullable=True)
    synonyms = Column(ARRAY(Text), nullable=True)
    antonyms = Column(ARRAY(Text), nullable=True)
    frequency = Column(String(20), default="medium", index=True)  # high|medium|low
    compound_marker = Column(Boolean, default=False)  # Marked with <> in dictionary
    gender_pair = Column(JSONB, nullable=True)  # ⟨vilana, vilano⟩ format

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

    # Vector embedding for semantic search (pgvector)
    # embedding = Column(Vector(settings.EMBEDDING_DIMENSION), nullable=True)

    def __repr__(self):
        return f"<Word(id={self.id}, word='{self.word}', pos='{self.pos}')>"
