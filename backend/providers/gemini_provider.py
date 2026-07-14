"""
=========================================================
Yukti AI — Gemini Provider
=========================================================
"""

from collections.abc import Iterator
from typing import Any

from google import genai
from google.genai import errors, types

from backend.config import settings
from backend.providers.base_provider import BaseProvider, ChatMessage
from backend.providers.provider_errors import (
    ProviderAuthenticationError,
    ProviderConfigurationError,
    ProviderResponseError,
    ProviderTemporaryError,
)


# ================= Gemini Provider =================

class GeminiProvider(BaseProvider):
    provider_name = "gemini"

    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key
        self.client = None

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    # ================= Availability =================

    @property
    def is_available(self) -> bool:
        return self.client is not None

    # ================= Message Conversion =================

    def _prepare_messages(
        self,
        messages: list[ChatMessage],
    ) -> tuple[list[types.Content], str]:
        contents: list[types.Content] = []
        system_parts: list[str] = []

        for message in messages:
            role = str(message.get("role", "user"))
            content = str(message.get("content", "")).strip()

            if not content:
                continue

            if role == "system":
                system_parts.append(content)
                continue

            gemini_role = "model" if role == "assistant" else "user"

            contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[
                        types.Part.from_text(text=content),
                    ],
                )
            )

        return contents, "\n\n".join(system_parts)

    # ================= Error Handler =================

    def _raise_provider_error(self, error: Exception) -> None:
        status_code = getattr(error, "code", None)
       
        if status_code in {401, 403}:
            raise ProviderAuthenticationError(
                message="Gemini authentication failed.",
                provider=self.provider_name,
                status_code=status_code,
            ) from error

        if status_code in {408, 429, 500, 502, 503, 504}:
            raise ProviderTemporaryError(
                message="Gemini is temporarily unavailable.",
                provider=self.provider_name,
                status_code=status_code,
            ) from error

        raise ProviderResponseError(
            message="Gemini could not generate a response.",
            provider=self.provider_name,
            status_code=status_code,
        ) from error

    # ================= Stream Chat =================

    def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
    ) -> Iterator[str]:
        if not self.client:
            raise ProviderConfigurationError(
                message="Gemini API key is missing.",
                provider=self.provider_name,
            )

        contents, system_instruction = self._prepare_messages(messages)

        if not contents:
            raise ProviderResponseError(
                message="Gemini received no valid messages.",
                provider=self.provider_name,
            )

        config: dict[str, Any] = {
            "temperature": 0.7,
            "max_output_tokens": 8192,
        }

        if system_instruction:
            config["system_instruction"] = system_instruction

        try:
            stream = self.client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(**config),
            )

            generated_text = False

            for chunk in stream:
                text = chunk.text

                if not text:
                    continue

                generated_text = True
                yield text

            if not generated_text:
                raise ProviderResponseError(
                    message="Gemini returned an empty response.",
                    provider=self.provider_name,
                )

        except ProviderResponseError:
            raise

        except (errors.ClientError, errors.ServerError) as error:
            self._raise_provider_error(error)

        except Exception as error:
            raise ProviderResponseError(
                message="Unexpected Gemini provider error.",
                provider=self.provider_name,
            ) from error