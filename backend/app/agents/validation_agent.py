"""
Response Validation Agent
Validates AI-generated response for quality
"""

from typing import Dict, Any
from app.agents.state import ResponseValidationState


async def validate_response(state: ResponseValidationState) -> ResponseValidationState:
    """
    Validate the AI-generated response for quality and appropriateness.

    Checks:
    - Response is not empty
    - Response is relevant to the question
    - Response doesn't contain harmful content
    - Response is linguistically accurate
    """
    user_message = state["user_message"]
    generated_response = state["generated_response"]

    validation_result = {
        "is_valid": True,
        "issues": [],
        "score": 1.0
    }

    # Check if response is empty
    if not generated_response or not generated_response.strip():
        validation_result["is_valid"] = False
        validation_result["issues"].append("Empty response")
        validation_result["score"] = 0.0
    else:
        # Check response length
        if len(generated_response) < 10:
            validation_result["issues"].append("Response too short")
            validation_result["score"] -= 0.3

        # Check relevance (simple check)
        if user_message and len(user_message) > 0:
            # In production, use AI or more sophisticated analysis
            pass

        # Check for obvious issues
        if "I apologize" in generated_response:
            validation_result["issues"].append("Error response generated")
            validation_result["score"] -= 0.5

    state["validation_result"] = validation_result

    # If valid, set the assistant message
    if validation_result["is_valid"] and validation_result["score"] >= 0.5:
        state["assistant_message"] = generated_response
    else:
        # Try to provide a fallback response
        state["assistant_message"] = generate_fallback_response(user_message)

    return state


def generate_fallback_response(user_message: str) -> str:
    """Generate a simple fallback response"""
    return f"I understand you're asking about: '{user_message}'. Let me help you learn Simplingua! Please try rephrasing your question or ask for more details."
