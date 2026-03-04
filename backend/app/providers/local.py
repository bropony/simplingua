"""
Local AI Provider
Implementation for local models (Ollama, LM Studio)
"""

from typing import AsyncIterator, List, Dict, Any, Optional

import httpx

from app.providers.base import AIProvider


class LocalProvider(AIProvider):
    """Local model provider implementation (Ollama, LM Studio)"""

    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url.rstrip("/")
        self._default_model = "llama3.2"
        self.client = httpx.AsyncClient(timeout=120.0)

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
        Generate streaming response from local model (Ollama-compatible).

        Args:
            messages: List of message dicts
            model: Model to use (default: llama3.2)
            temperature: Sampling temperature
            max_tokens: Max tokens to generate
            **kwargs: Additional parameters
        """
        model_to_use = model or self._default_model

        try:
            response = await self.client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model_to_use,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens
                    },
                    **kwargs
                },
                timeout=120.0
            )
            response.raise_for_status()

            async for line in response.aiter_lines():
                line = line.strip()
                if line.startswith("data:"):
                    try:
                        import json
                        data = json.loads(line[5:])
                        if "message" in data and "content" in data["message"]:
                            yield data["message"]["content"]
                    except json.JSONDecodeError:
                        continue

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Local model API error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise RuntimeError(f"Local model error: {str(e)}")

    async def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        """
        Generate embedding vector using local model.

        Args:
            text: Text to embed
            model: Embedding model

        Returns:
            List[float]: Embedding vector
        """
        model_to_use = model or self._default_model

        try:
            response = await self.client.post(
                f"{self.base_url}/api/embed",
                json={
                    "model": model_to_use,
                    "input": text
                },
                timeout=30.0
            )
            response.raise_for_status()

            data = response.json()
            return data.get("embedding", [])

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Local embedding API error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            raise RuntimeError(f"Local embedding error: {str(e)}")

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
