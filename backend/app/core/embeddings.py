"""
Vector Embeddings Generation
Generate embeddings for semantic search using various AI providers
"""

import asyncio
from typing import List, Optional, Union
from abc import ABC, abstractmethod

from openai import AsyncOpenAI
import httpx

try:
    from sentence_transformers import SentenceTransformer as STModel
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

import numpy as np

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

    @abstractmethod
    def get_dimension(self) -> int:
        """Return the dimension of the embedding vectors"""
        pass


class DeepSeekEmbeddingProvider(EmbeddingProvider):
    """DeepSeek embedding provider"""

    def __init__(self, api_key: str, base_url: str = None, model: str = None, dimension: int = None):
        if base_url is None:
            base_url = settings.AI_DEEPSEEK_BASE_URL
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = model or settings.EMBEDDING_DEEPSEEK_MODEL
        self.dimension = dimension or settings.EMBEDDING_DEEPSEEK_DIMENSION

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

    def get_dimension(self) -> int:
        return self.dimension


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """OpenAI embedding provider"""

    def __init__(self, api_key: str, base_url: str = None, model: str = None, dimension: int = None):
        if base_url is None:
            base_url = settings.AI_OPENAI_BASE_URL
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        self.model = model or settings.EMBEDDING_OPENAI_MODEL
        self.dimension = dimension or settings.EMBEDDING_OPENAI_DIMENSION

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

    def get_dimension(self) -> int:
        return self.dimension


class SentenceTransformerEmbeddingProvider(EmbeddingProvider):
    """SentenceTransformer embedding provider (local models)"""

    def __init__(self, model: str = None, dimension: int = None):
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError(
                "sentence-transformers package not installed. "
                "Install it with: pip install sentence-transformers"
            )
        self.model_name = model or settings.EMBEDDING_SENTENCETRANSFORMER_MODEL
        self.dimension = dimension or settings.EMBEDDING_SENTENCETRANSFORMER_DIMENSION
        # Lazy load the model on first use
        self._model = None

    def _load_model(self):
        """Load the model lazily"""
        if self._model is None:
            self._model = STModel(self.model_name)
        return self._model

    async def embed(self, text: str) -> List[float]:
        """Generate embedding for a single text (runs in thread pool)"""
        model = self._load_model()
        # Run in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(None, model.encode, text)
        return embedding.tolist()

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts (runs in thread pool)"""
        model = self._load_model()
        # Run in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(None, model.encode, texts)
        return embeddings.tolist()

    def get_dimension(self) -> int:
        return self.dimension


class LocalEmbeddingProvider(EmbeddingProvider):
    """Local embedding provider using Ollama or similar service"""

    def __init__(self, base_url: str, model: str = None, dimension: int = None):
        self.base_url = base_url
        self.model = model or settings.EMBEDDING_LOCAL_MODEL
        self.dimension = dimension or settings.EMBEDDING_LOCAL_DIMENSION

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

    def get_dimension(self) -> int:
        return self.dimension


def get_embedding_provider(provider_name: str = None) -> EmbeddingProvider:
    """Factory function to get embedding provider instance"""

    if provider_name is None:
        provider_name = settings.EMBEDDING_AI_DEFAULT_PROVIDER

    providers = {
        "deepseek": lambda: DeepSeekEmbeddingProvider(
            api_key=settings.AI_DEEPSEEK_API_KEY,
            base_url=settings.AI_DEEPSEEK_BASE_URL
        ),
        "openai": lambda: OpenAIEmbeddingProvider(
            api_key=settings.AI_OPENAI_API_KEY,
            base_url=settings.AI_OPENAI_BASE_URL
        ),
        "sentencetransformer": lambda: SentenceTransformerEmbeddingProvider(),
        "local": lambda: LocalEmbeddingProvider(base_url=settings.AI_LOCAL_BASE_URL),
    }

    if provider_name not in providers:
        raise ValueError(
            f"Unknown embedding provider: {provider_name}. "
            f"Available: {list(providers.keys())}"
        )

    return providers[provider_name]()


async def generate_embedding(text: str, provider: str = None) -> List[float]:
    """Generate embedding for a single text"""
    embedding_provider = get_embedding_provider(provider)
    return await embedding_provider.embed(text)


async def generate_embeddings_batch(texts: List[str], provider: str = None) -> List[List[float]]:
    """Generate embeddings for multiple texts"""
    embedding_provider = get_embedding_provider(provider)
    return await embedding_provider.embed_batch(texts)


def get_embedding_dimension(provider_name: str = None) -> int:
    """Get the dimension of embedding vectors for a provider"""
    if provider_name is None:
        provider_name = settings.EMBEDDING_AI_DEFAULT_PROVIDER

    dimensions = {
        "deepseek": settings.EMBEDDING_DEEPSEEK_DIMENSION,
        "openai": settings.EMBEDDING_OPENAI_DIMENSION,
        "sentencetransformer": settings.EMBEDDING_SENTENCETRANSFORMER_DIMENSION,
        "local": settings.EMBEDDING_LOCAL_DIMENSION,
    }

    if provider_name not in dimensions:
        raise ValueError(
            f"Unknown embedding provider: {provider_name}. "
            f"Available: {list(dimensions.keys())}"
        )

    return dimensions[provider_name]
