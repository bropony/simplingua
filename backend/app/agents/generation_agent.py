"""
Response Generation Agent
Generates AI responses using the selected provider
"""

from typing import AsyncIterator, Dict, Any, Optional

from app.providers import get_provider
from app.agents.state import ResponseGenerationState
from app.config import get_settings


async def generate_response(state: ResponseGenerationState) -> ResponseGenerationState:
    """
    Generate AI response using the selected provider.

    Combines user message, retrieved context, and intent
    to generate a helpful response.
    """
    settings = get_settings()
    ai_provider_name = state.get("ai_provider", settings.CHAT_AI_DEFAULT_PROVIDER)

    # Get provider instance
    provider = get_provider(
        ai_provider_name,
        api_key=settings.AI_DEEPSEEK_API_KEY if ai_provider_name == "deepseek" else None,
        api_key=settings.AI_OPENAI_API_KEY if ai_provider_name == "openai" else None,
        api_key=settings.AI_ANTHROPIC_API_KEY if ai_provider_name == "anthropic" else None
    )

    # Build messages for the AI
    messages = [
        {
            "role": "system",
            "content": """You are SimplinguaBot, a helpful AI assistant for learning the Simplingua constructed language.

Your role is to:
- Help users learn Simplingua vocabulary and grammar
- Provide translations and explanations
- Give example sentences
- Create practice exercises when requested
- Be encouraging and patient with language learners

When responding:
- If the user asks for a translation, provide the Simplingua word and explain its usage
- If asked about grammar, explain clearly with examples
- Use the retrieved knowledge base information when relevant
- Keep responses concise but thorough
- Respond in the same language as the user's question

Language reference: Simplingua is a constructed language with 7 basic rules:
1. Basic SVO word order
2. Modifiers precede nouns, multi-word modifiers follow
3. Nouns have singular/plural (add -s, or -es for consonant endings)
4. Indefinite article "un", definite "le", zero article for categories
5. Verbs use "va" (future) and "ja" (completed) markers
6. Two participle forms: -nte (active) and -te (passive)
7. Adjectives/adverbs use "mai" (comparative) and "max" (superlative)"""
        }
    ]

    # Add conversation context
    for msg in state.get("conversation_context", []):
        messages.append({
            "role": msg.get("role"),
            "content": msg.get("content")
        })

    # Add knowledge context
    if state.get("retrieved_context"):
        context_text = "Relevant information from knowledge base:\n"
        for item in state["retrieved_context"][:3]:  # Limit context
            if item["type"] == "word":
                context_text += f"- Word: {item['word']} ({item['pos']}) - {item['content']}\n"
            elif item["type"] == "grammar":
                context_text += f"- Grammar: {item['name']} - {item['content']}\n"

        messages.append({
            "role": "system",
            "content": context_text
        })

    # Add user message
    messages.append({
        "role": "user",
        "content": state["user_message"]
    })

    # Generate response
    generated_text = ""
    try:
        async for chunk in provider.generate(
            messages=messages,
            model=provider.get_default_chat_model(),
            temperature=0.7
        ):
            generated_text += chunk
            # Emit event through state for streaming
            state["generated_response"] = generated_text

    except Exception as e:
        state["generated_response"] = f"I apologize, but I encountered an error: {str(e)}"

    return state


def create_generation_node():
    """Create LangGraph node for response generation"""
    from langgraph.graph import StateGraph
    from app.agents.state import ResponseGenerationState

    graph = StateGraph(ResponseGenerationState)
    graph.add_node("generate_response", generate_response)
    graph.set_entry_point("generate_response")
    graph.set_finish_point("generate_response")

    return graph
