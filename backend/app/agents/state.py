"""
LangGraph State Definitions
State management for AI chat workflow
"""

from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import add_edge, StateGraph, END
from operator import itemgetter


class ChatState(TypedDict):
    """State for the chat workflow"""

    # Messages in the conversation
    messages: List[dict]

    # Conversation metadata
    conversation_id: str
    language: str
    ai_provider: str

    # Intent analysis result
    intent: Optional[dict] = None

    # Knowledge retrieval result
    retrieved_context: Optional[List[dict]] = None

    # AI response
    assistant_message: Optional[str] = None

    # Whether clarification is needed
    needs_clarification: bool = False


class IntentAnalysisState(TypedDict):
    """State for intent analysis agent"""

    user_message: str
    conversation_context: List[dict]
    intent_result: Optional[dict] = None


class KnowledgeRetrievalState(TypedDict):
    """State for knowledge retrieval agent"""

    intent: dict
    language: str
    knowledge_results: Optional[List[dict]] = None


class ResponseGenerationState(TypedDict):
    """State for response generation agent"""

    user_message: str
    retrieved_context: List[dict]
    intent: dict
    language: str
    ai_provider: str
    generated_response: Optional[str] = None


class ResponseValidationState(TypedDict):
    """State for response validation agent"""

    user_message: str
    generated_response: str
    validation_result: Optional[dict] = None
    assistant_message: Optional[str] = None
