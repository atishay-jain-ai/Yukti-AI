"""
=========================================================
Yukti AI — OpenAI Provider
=========================================================
"""

from collections.abc import Iterator

from openai import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

from backend.config import settings
from backend.providers.base_provider import BaseProvider, ChatMessage
from backend.providers.provider_errors import (
    ProviderAuthenticationError,
    ProviderConfigurationError,
    ProviderResponseError,
    ProviderTemporaryError,
)


# ================= OpenAI Provider =================

class OpenAIProvider(BaseProvider):
    provider_name = "openai"

    def __init__(self) -> None:
        self.api_key = settings.openai_api_key
        self.enabled = settings.enable_openai_fallback
        self.client = None

        if self.api_key and self.enabled:
            self.client = OpenAI(api_key=self.api_key)

    # ================= Availability =================

    @property
    def is_available(self) -> bool:
        return self.client is not None

    # ================= Message Conversion =================

    def _prepare_messages(
        self,
        messages: list[ChatMessage],
    ) -> list[dict[str, str]]:
        prepared_messages: list[dict[str, str]] = []

        for message in messages:
            role = str(message.get("role", "user"))
            content = str(message.get("content", "")).strip()

            if not content:
                continue

            if role not in {"system", "user", "assistant"}:
                role = "user"

            prepared_messages.append(
                {
                    "role": role,
                    "content": content,
                }
            )

        return prepared_messages

    # ================= Stream Chat =================

    def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
    ) -> Iterator[str]:
        if not self.enabled:
            raise ProviderConfigurationError(
                message="OpenAI fallback is disabled.",
                provider=self.provider_name,
            )

        if not self.client:
            raise ProviderConfigurationError(
                message="OpenAI API key is missing.",
                provider=self.provider_name,
            )

        prepared_messages = self._prepare_messages(messages)

        if not prepared_messages:
            raise ProviderResponseError(
                message="OpenAI received no valid messages.",
                provider=self.provider_name,
            )

        try:
            stream = self.client.chat.completions.create(
                model=model,
                messages=prepared_messages,
                temperature=0.7,
                max_tokens=8192,
                stream=True,
            )

            generated_text = False

            for chunk in stream:
                text = chunk.choices[0].delta.content

                if not text:
                    continue

                generated_text = True
                yield text

            if not generated_text:
                raise ProviderResponseError(
                    message="OpenAI returned an empty response.",
                    provider=self.provider_name,
                )

        except ProviderResponseError:
            raise

        except AuthenticationError as error:
            raise ProviderAuthenticationError(
                message="OpenAI authentication failed.",
                provider=self.provider_name,
                status_code=401,
            ) from error

        except RateLimitError as error:
            raise ProviderTemporaryError(
                message="OpenAI quota or rate limit reached.",
                provider=self.provider_name,
                status_code=429,
            ) from error

        except APIConnectionError as error:
            raise ProviderTemporaryError(
                message="OpenAI connection failed.",
                provider=self.provider_name,
            ) from error

        except APIStatusError as error:
            status_code = error.status_code

            if status_code >= 500:
                raise ProviderTemporaryError(
                    message="OpenAI is temporarily unavailable.",
                    provider=self.provider_name,
                    status_code=status_code,
                ) from error

            raise ProviderResponseError(
                message="OpenAI could not generate a response.",
                provider=self.provider_name,
                status_code=status_code,
            ) from error

        except Exception as error:
            raise ProviderResponseError(
                message="Unexpected OpenAI provider error.",
                provider=self.provider_name,
            ) from error