"""
Knowledge Retrieval Agent
Queries knowledge base for relevant context
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session

from fastapi import Depends

from app.core.database import get_db
from app.models.word import Word
from app.models.grammar import Grammar
from app.agents.state import KnowledgeRetrievalState


async def retrieve_knowledge(state: KnowledgeRetrievalState, db: Session = Depends(get_db)) -> KnowledgeRetrievalState:
    """
    Retrieve relevant knowledge from database.

    Searches for words, grammar rules, and related content
    based on user intent and message.
    """
    intent = state["intent"]
    language = state["language"]
    user_message = intent.get("keywords", [])[0] if intent.get("keywords") else ""

    retrieved_context = []

    # Search for matching words
    if user_message:
        words = db.query(Word).filter(
            Word.status == "active"
        ).filter(
            Word.word.ilike(f"%{user_message}%")
        ).limit(5).all()

        for word in words:
            retrieved_context.append({
                "type": "word",
                "id": str(word.id),
                "word": word.word,
                "pos": word.pos,
                "content": word.description,
                "examples": word.examples[:2] if word.examples else []
            })

    # Search for grammar rules if intent is explanation
    if intent["type"] == "explanation":
        grammar_rules = db.query(Grammar).filter(
            Grammar.status == "active"
        ).filter(
            Grammar.content.ilike(f"%{user_message}%")
        ).limit(3).all()

        for rule in grammar_rules:
            retrieved_context.append({
                "type": "grammar",
                "id": str(rule.id),
                "name": rule.name,
                "content": rule.summary[:200] if rule.summary else rule.content[:200],
                "section": rule.section_id
            })

    state["knowledge_results"] = retrieved_context

    return state


def create_retrieval_node():
    """Create LangGraph node for knowledge retrieval"""
    from langgraph.graph import StateGraph
    from app.agents.state import KnowledgeRetrievalState

    graph = StateGraph(KnowledgeRetrievalState)
    graph.add_node("retrieve_knowledge", retrieve_knowledge)
    graph.set_entry_point("retrieve_knowledge")
    graph.set_finish_point("retrieve_knowledge")

    return graph
