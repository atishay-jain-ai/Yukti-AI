"""
=========================================================
Yukti AI — Provider Registry
=========================================================
"""

from backend.providers import (
    BaseProvider,
    GeminiProvider,
    GroqProvider,
    OpenAIProvider,
    OpenRouterProvider,
)


# ================= Provider Registry =================

class ProviderRegistry:
    def __init__(self) -> None:
        self._providers: dict[str, BaseProvider] = {
            "gemini": GeminiProvider(),
            "groq": GroqProvider(),
            "openrouter": OpenRouterProvider(),
            "openai": OpenAIProvider(),
        }

    # ================= Provider Access =================

    def get(self, provider_name: str) -> BaseProvider | None:
        return self._providers.get(provider_name)

    def is_available(self, provider_name: str) -> bool:
        provider = self.get(provider_name)

        return bool(provider and provider.is_available)

    def available_names(self) -> list[str]:
        return [
            name
            for name, provider in self._providers.items()
            if provider.is_available
        ]


# ================= Global Registry =================

provider_registry = ProviderRegistry()