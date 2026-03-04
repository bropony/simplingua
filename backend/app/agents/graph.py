"""
LangGraph Chat Workflow
Main graph that orchestrates the chat agents
"""

from typing import TypedDict
from langgraph.graph import StateGraph, END

from app.agents.state import ChatState
from app.agents import (
    intent_agent,
    retrieval_agent,
    generation_agent,
    validation_agent
)


def create_chat_graph():
    """
    Create the main chat workflow graph.

    Flow:
    User Input → Intent Analysis → Knowledge Retrieval → Response Generation → Response Validation → User
    """
    graph = StateGraph(ChatState)

    # Add nodes (using imported functions directly)
    graph.add_node("analyze_intent", intent_agent.analyze_intent)
    graph.add_node("retrieve_knowledge", retrieval_agent.retrieve_knowledge)
    graph.add_node("generate_response", generation_agent.generate_response)
    graph.add_node("validate_response", validation_agent.validate_response)

    # Define edges (workflow)
    graph.add_edge("analyze_intent", "retrieve_knowledge")
    graph.add_edge("retrieve_knowledge", "generate_response")
    graph.add_edge("generate_response", "validate_response")

    # Set entry point
    graph.set_entry_point("analyze_intent")

    # Set conditional edge for validation
    def should_retry(state: ChatState) -> str:
        """Check if validation failed and we should retry"""
        validation_result = state.get("validation_result", {})
        return "generate_response" if not validation_result.get("is_valid", True) else END

    graph.add_conditional_edges(
        "validate_response",
        {
            "generate_response": "generate_response",
            END: END
        },
        should_retry
    )

    return graph
