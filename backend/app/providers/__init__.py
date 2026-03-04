"""
AI Providers
Provider implementations for various AI services
"""

from .base import AIProvider
from .deepseek import DeepSeekProvider
from .openai import OpenAIProvider
from .anthropic import AnthropicProvider
from .local import LocalProvider

__all__ = [
    "AIProvider",
    "DeepSeekProvider",
    "OpenAIProvider",
    "AnthropicProvider",
    "LocalProvider",
]


def get_provider(provider_name: str, **kwargs) -> AIProvider:
    """
    Factory function to get AI provider instance.

    Args:
        provider_name: Name of provider (deepseek|openai|anthropic|local)
        **kwargs: Provider-specific arguments (api_key, base_url, etc.)

    Returns:
        AIProvider: Provider instance
    """
    providers = {
        "deepseek": lambda: DeepSeekProvider(
            api_key=kwargs.get("api_key"),
            base_url=kwargs.get("base_url")
        ),
        "openai": lambda: OpenAIProvider(
            api_key=kwargs.get("api_key"),
            base_url=kwargs.get("base_url")
        ),
        "anthropic": lambda: AnthropicProvider(
            api_key=kwargs.get("api_key"),
            base_url=kwargs.get("base_url")
        ),
        "local": lambda: LocalProvider(
            base_url=kwargs.get("base_url")
        ),
    }

    if provider_name not in providers:
        raise ValueError(f"Unknown provider: {provider_name}. Available: {list(providers.keys())}")

    return providers[provider_name]()
