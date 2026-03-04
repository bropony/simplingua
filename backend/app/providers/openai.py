"""
OpenAI Provider
Implementation for OpenAI API (GPT-4, GPT-4o, etc.)
"""

from typing import AsyncIterator, List, Dict, Any, Optional
from openai import AsyncOpenAI

from app.providers.base import AIProvider


class OpenAIProvider(AIProvider):
    """OpenAI provider implementation"""

    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url or "https://api.openai.com/v1"
        )
        self._default_model = "gpt-4o"
        self._default_embedding_model = "text-embedding-ada-002"

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
        Generate streaming response from OpenAI.

        Args:
            messages: List of message dicts
            model: Model to use (default: gpt-4o)
            temperature: Sampling temperature
            max_tokens: Max tokens to generate
            **kwargs: Additional parameters
        """
        model_to_use = model or self._default_model

        try:
            stream = await self.client.chat.completions.create(
                model=model_to_use,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {str(e)}")

    async def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        """
        Generate embedding vector using OpenAI.

        Args:
            text: Text to embed
            model: Embedding model (default: text-embedding-ada-002)

        Returns:
            List[float]: Embedding vector
        """
        model_to_use = model or self._default_embedding_model

        try:
            response = await self.client.embeddings.create(
                model=model_to_use,
                input=text
            )
            return response.data[0].embedding

        except Exception as e:
            raise RuntimeError(f"OpenAI embedding error: {str(e)}")
