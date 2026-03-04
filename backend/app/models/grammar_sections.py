"""
Grammar Sections Model
Reference table for grammar section hierarchy
"""

from sqlalchemy import Column, String, Integer, PrimaryKeyConstraint

from app.core.database import Base


class GrammarSection(Base):
    """Grammar section reference table"""

    __tablename__ = "grammar_sections"

    id = Column(String(100), primary_key=True)
    name = Column(String(200), nullable=False)
    order_num = Column(Integer, nullable=False)

    def __repr__(self):
        return f"<GrammarSection(id='{self.id}', name='{self.name}', order={self.order_num})>"
