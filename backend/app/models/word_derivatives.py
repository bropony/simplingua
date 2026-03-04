"""
Word Derivatives Model
Database model for morphological relationships between words
"""

from datetime import datetime
from typing import List

from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Index, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class WordDerivative(Base):
    """Word derivative model for morphological relationships"""

    __tablename__ = "word_derivatives"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    word_id = Column(UUID(as_uuid=True), ForeignKey("words.id", ondelete="CASCADE"), nullable=False, index=True)
    derivative_word = Column(String(200), nullable=False)
    derivative_type = Column(String(50), nullable=False, index=True)  # active_participle|passive_participle|...
    gender_variants = Column(String(200), nullable=True)  # "amanta, amanto" format
    meaning = Column(Text, nullable=True)
    examples = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<WordDerivative(id={self.id}, derivative='{self.derivative_word}', type='{self.derivative_type}')>"
