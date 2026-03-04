"""
Intent Analysis Agent
Analyzes user intent from chat messages
"""

from typing import Dict, Any
from app.agents.state import IntentAnalysisState, ChatState


async def analyze_intent(state: IntentAnalysisState) -> IntentAnalysisState:
    """
    Analyze user intent from message.

    Determines what the user wants to do:
    - translation: Wants to translate text
    - explanation: Wants grammar/vocabulary explanation
    - example: Wants example sentences
    - practice: Wants practice exercises
    - general: General chat or other
    """
    user_message = state["user_message"]
    conversation_context = state.get("conversation_context", [])

    # Simple keyword-based intent classification
    # In production, use AI for more sophisticated analysis

    message_lower = user_message.lower()

    intent_keywords = {
        "translation": ["translate", "translation", "翻译", "怎么说"],
        "explanation": ["explain", "what does", "meaning", "meaning of", "意思是", "解释", "什么意思"],
        "example": ["example", "show me", "give me an example", "例子", "举例", "给我一个例子"],
        "practice": ["practice", "exercise", "quiz", "test me", "练习", "习题", "考我", "测验"],
    }

    detected_intent = {
        "type": "general",
        "keywords": [],
        "confidence": 0.5
    }

    # Check for intent keywords
    for intent_type, keywords in intent_keywords.items():
        for keyword in keywords:
            if keyword in message_lower:
                detected_intent["type"] = intent_type
                detected_intent["keywords"].append(keyword)
                detected_intent["confidence"] = 0.8
                break

    # If translation is requested, extract source/target from message
    if detected_intent["type"] == "translation":
        # Simple pattern matching
        if "to" in message_lower or "翻译成" in message_lower:
            parts = message_lower.split("to") if "to" in message_lower else message_lower.split("翻译成")
            if len(parts) > 1:
                detected_intent["target_language"] = parts[-1].strip()

    state["intent_result"] = detected_intent

    return state


def create_intent_node():
    """Create LangGraph node for intent analysis"""
    from langgraph.graph import StateGraph
    from app.agents.state import IntentAnalysisState

    graph = StateGraph(IntentAnalysisState)
    graph.add_node("analyze_intent", analyze_intent)
    graph.set_entry_point("analyze_intent")
    graph.set_finish_point("analyze_intent")

    return graph
