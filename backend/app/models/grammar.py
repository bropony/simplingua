"""
Grammar Model
Database model for grammar rules and linguistic documentation
"""

from datetime import datetime
from typing import List

from sqlalchemy import Column, String, Text, DateTime, JSONB, ARRAY, Index, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.core.database import Base


class Grammar(Base):
    """Grammar rule model with hierarchical structure"""

    __tablename__ = "grammar"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(String(100), nullable=False, index=True)  # nouns|verbs|...
    subsection_id = Column(String(100), nullable=True, index=True)  # number|gender|aspects|...
    name = Column(String(200), nullable=False)
    rule_type = Column(String(50), nullable=True, index=True)  # inflectional|syntactic|...
    level = Column(String(20), default="beginner", index=True)  # beginner|intermediate|advanced
    language = Column(String(10), nullable=False, default="zh", index=True)
    category = Column(String(100), nullable=True)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    rules = Column(JSONB, nullable=True)  # Pattern-based rules with examples
    exceptions = Column(JSONB, nullable=True)  # Irregular forms
    cross_references = Column(JSONB, nullable=True)  # Related grammar concepts
    examples = Column(ARRAY(Text), nullable=True)
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
        return f"<Grammar(id={self.id}, name='{self.name}', section='{self.section_id}')>"
