"""
Vector Embeddings Generation
Generate embeddings for semantic search using various AI providers
"""

import asyncio
from typing import List, Optional, Union
from abc import ABC, abstractmethod

from openai import AsyncOpenAI
import httpx

from app.config import get_settings

settings = get_settings()


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers"""

    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        pass

    @abstractmethod
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        pass


class DeepSeekEmbeddingProvider(EmbeddingProvider):
    """DeepSeek embedding provider"""

    def __init__(self, api_key: str, base_url: str = None):
        if base_url is None:
            base_url = settings.AI_DEEPSEEK_BASE_URL
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = "deepseek-embeddings"

    async def embed(self, text: str) -> List[float]:
        response = await self.client.embeddings.create(
            model=self.model,
            input=text
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """DeepSeek doesn't support batch, so process sequentially"""
        embeddings = []
        for text in texts:
            embedding = await self.embed(text)
            embeddings.append(embedding)
        return embeddings


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """OpenAI embedding provider"""

    def __init__(self, api_key: str, base_url: str = None):
        if base_url is None:
            base_url = settings.AI_OPENAI_BASE_URL
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = settings.EMBEDDING_MODEL

    async def embed(self, text: str) -> List[float]:
        response = await self.client.embeddings.create(
            model=self.model,
            input=text
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        response = await self.client.embeddings.create(
            model=self.model,
            input=texts
        )
        return [item.embedding for item in response.data]


class LocalEmbeddingProvider(EmbeddingProvider):
    """Local embedding provider using sentence-transformers or similar"""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.model = settings.AI_LOCAL_MODEL

    async def embed(self, text: str) -> List[float]:
        """Call local embedding service"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/embed",
                json={"model": self.model, "text": text},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()["embedding"]

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Batch embeddings for local provider"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/embed/batch",
                json={"model": self.model, "texts": texts},
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()["embeddings"]


def get_embedding_provider(provider_name: str = None) -> EmbeddingProvider:
    """Factory function to get embedding provider instance"""

    if provider_name is None:
        provider_name = settings.AI_DEFAULT_PROVIDER

    providers = {
        "deepseek": lambda: DeepSeekEmbeddingProvider(
            api_key=settings.AI_DEEPSEEK_API_KEY,
            base_url=settings.AI_DEEPSEEK_BASE_URL
        ),
        "openai": lambda: OpenAIEmbeddingProvider(
            api_key=settings.AI_OPENAI_API_KEY,
            base_url=settings.AI_OPENAI_BASE_URL
        ),
        "local": lambda: LocalEmbeddingProvider(base_url=settings.AI_LOCAL_BASE_URL),
    }

    if provider_name not in providers:
        raise ValueError(f"Unknown embedding provider: {provider_name}")

    return providers[provider_name]()


async def generate_embedding(text: str, provider: str = None) -> List[float]:
    """Generate embedding for a single text"""
    embedding_provider = get_embedding_provider(provider)
    return await embedding_provider.embed(text)


async def generate_embeddings_batch(texts: List[str], provider: str = None) -> List[List[float]]:
    """Generate embeddings for multiple texts"""
    embedding_provider = get_embedding_provider(provider)
    return await embedding_provider.embed_batch(texts)
