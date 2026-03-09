"""
Chat API Router
AI chat interface with Server-Sent Events streaming
"""

import json
import json
from datetime import datetime
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatContext, ChatEvent
from app.agents.graph import create_chat_graph, ChatState

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


async def generate_chat_response(
    message: str,
    context: ChatContext,
    db: Session
) -> AsyncGenerator[str, None]:
    """Generate streaming chat response using LangGraph"""

    # Create chat graph
    graph = create_chat_graph()

    # Initialize state
    state = ChatState(
        messages=[],
        conversation_id=context.conversation_id or f"conv_{datetime.now().timestamp()}",
        language=context.language,
        ai_provider=context.ai_provider
    )

    # Add user message
    state.messages.append({
        "role": "user",
        "content": message,
        "timestamp": datetime.utcnow().isoformat()
    })

    try:
        # Send thinking event
        thinking_event = ChatEvent(
            type="thinking",
            content="Analyzing your message...",
            timestamp=datetime.utcnow().isoformat()
        )
        yield f"data: {thinking_event.model_dump_json()}\n\n"

        # Run the graph
        async for event in graph.astream(state):
            # Process graph events
            if "intent" in event:
                # Intent analysis complete
                pass
            elif "retrieved_context" in event:
                # Knowledge retrieval complete
                pass
            elif "assistant_message" in event:
                # Generate message event
                msg_event = ChatEvent(
                    type="message",
                    content=event["assistant_message"],
                    conversation_id=state.conversation_id,
                    timestamp=datetime.utcnow().isoformat()
                )
                yield f"data: {msg_event.model_dump_json()}\n\n"

        # Send done event
        done_event = ChatEvent(
            type="done",
            content="",
            conversation_id=state.conversation_id,
            timestamp=datetime.utcnow().isoformat()
        )
        yield f"data: {done_event.model_dump_json()}\n\n"

    except Exception as e:
        # Send error event
        error_event = ChatEvent(
            type="error",
            content=f"An error occurred: {str(e)}",
            conversation_id=state.conversation_id,
            timestamp=datetime.utcnow().isoformat()
        )
        yield f"data: {error_event.model_dump_json()}\n\n"


@router.get("/message")
async def chat_message_get(
    message: str = Query(..., min_length=1),
    context: str = Query(default="{}"),
    db: Session = Depends(get_db)
):
    """SSE streaming endpoint for EventSource compatibility - GET with message as query param"""
    try:
        context_dict = json.loads(context) if context else {}
    except:
        context_dict = {}

    async def event_generator():
        async for chunk in generate_chat_response(
            message,
            ChatContext(**context_dict),
            db
        ):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Allow": "POST, GET",
        }
    )


@router.post("/message")
async def chat_message(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Send message to chatbot with SSE streaming"""

    async def event_generator():
        async for chunk in generate_chat_response(
            request.message,
            request.context,
            db
        ):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
