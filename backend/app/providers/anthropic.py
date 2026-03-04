"""
Anthropic Provider
Implementation for Anthropic Claude API
"""

from typing import AsyncIterator, List, Dict, Any, Optional

try:
    from anthropic import AsyncAnthropic
except ImportError:
    raise ImportError("anthropic package not installed. Run: pip install anthropic")

from app.providers.base import AIProvider


class AnthropicProvider(AIProvider):
    """Anthropic Claude provider implementation"""

    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.client = AsyncAnthropic(
            api_key=api_key,
            base_url=base_url or "https://api.anthropic.com"
        )
        self._default_model = "claude-3-5-sonnet-20241022"

    def get_default_model(self) -> str:
        return self._default_model

    def get_default_chat_model(self) -> str:
        return self._default_model

    async def generate(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Generate streaming response from Anthropic Claude.

        Args:
            messages: List of message dicts
            model: Model to use (default: claude-3-5-sonnet-20241022)
            temperature: Sampling temperature
            max_tokens: Max tokens to generate
            **kwargs: Additional parameters
        """
        model_to_use = model or self._default_model

        # Convert OpenAI-style messages to Anthropic format
        system_message = None
        anthropic_messages = []

        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                role = msg["role"]
                if role == "user":
                    anthropic_messages.append({"role": "user", "content": msg["content"]})
                elif role == "assistant":
                    anthropic_messages.append({"role": "assistant", "content": msg["content"]})

        try:
            stream = await self.client.messages.create(
                model=model_to_use,
                system=system_message,
                messages=anthropic_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs
            )

            async for event in stream:
                if event.type == "content_block_delta":
                    if event.delta.text:
                        yield event.delta.text

        except Exception as e:
            raise RuntimeError(f"Anthropic API error: {str(e)}")

    async def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        """
        Generate embedding vector using Anthropic.

        Note: Anthropic doesn't have native embeddings API yet.
        This is a placeholder that would use an alternative method.

        Args:
            text: Text to embed
            model: Embedding model

        Returns:
            List[float]: Embedding vector
        """
        # Placeholder - Anthropic doesn't support embeddings directly
        # In production, use OpenAI embeddings or local model
        raise NotImplementedError("Anthropic embeddings not directly supported - use alternative provider")
