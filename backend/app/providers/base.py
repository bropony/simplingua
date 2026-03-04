"""
AI Provider Base Interface
Abstract base class for AI provider implementations
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Dict, Any, Optional


class AIProvider(ABC):
    """Abstract base class for AI providers"""

    @abstractmethod
    async def generate(
        self,
        messages: List[Dict[str, Any]],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Generate streaming response from AI model.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            **kwargs: Additional provider-specific parameters

        Yields:
            str: Chunks of generated text
        """
        pass

    @abstractmethod
    async def embed(self, text: str, model: str) -> List[float]:
        """
        Generate embedding vector for text.

        Args:
            text: Text to embed
            model: Embedding model identifier

        Returns:
            List[float]: Embedding vector
        """
        pass

    @abstractmethod
    def get_default_model(self) -> str:
        """Get default model for this provider"""
        pass

    @abstractmethod
    def get_default_chat_model(self) -> str:
        """Get default chat model for this provider"""
        pass
