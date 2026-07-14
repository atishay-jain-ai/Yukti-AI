"""
=========================================================
Yukti AI — Fallback Manager
=========================================================
"""

import logging
import time
from collections.abc import Iterator

from backend.brain.brain_errors import AllProvidersFailedError
from backend.brain.provider_registry import ProviderRegistry
from backend.brain.routing_plan import ProviderAttempt
from backend.providers import ChatMessage, ProviderError


# ================= Logger =================

logger = logging.getLogger("yukti.brain")


# ================= Cooldown =================

RATE_LIMIT_COOLDOWN = 300
SERVER_ERROR_COOLDOWN = 30


# ================= Fallback Manager =================

class FallbackManager:
    def __init__(
        self,
        registry: ProviderRegistry,
    ) -> None:
        self.registry = registry
        self.cooldowns: dict[str, float] = {}

    # ================= Cooldown Key =================

    def _get_attempt_key(
        self,
        attempt: ProviderAttempt,
    ) -> str:
        return f"{attempt.provider}:{attempt.model}"

    # ================= Cooldown Check =================

    def _get_cooldown_remaining(
        self,
        attempt: ProviderAttempt,
    ) -> int:
        attempt_key = self._get_attempt_key(attempt)
        cooldown_until = self.cooldowns.get(attempt_key, 0)
        remaining = cooldown_until - time.monotonic()

        if remaining <= 0:
            self.cooldowns.pop(attempt_key, None)
            return 0

        return int(remaining) + 1

    # ================= Cooldown Start =================

    def _start_cooldown(
        self,
        attempt: ProviderAttempt,
        seconds: int,
    ) -> None:
        attempt_key = self._get_attempt_key(attempt)

        self.cooldowns[attempt_key] = (
            time.monotonic() + seconds
        )

        logger.info(
            "Cooldown started provider=%s model=%s "
            "seconds=%s",
            attempt.provider,
            attempt.model,
            seconds,
        )

    # ================= Failure Cooldown =================

    def _handle_failure_cooldown(
        self,
        attempt: ProviderAttempt,
        error: ProviderError,
    ) -> None:
        if error.status_code == 429:
            self._start_cooldown(
                attempt,
                RATE_LIMIT_COOLDOWN,
            )
            return

        if (
            error.status_code is not None
            and error.status_code >= 500
        ):
            self._start_cooldown(
                attempt,
                SERVER_ERROR_COOLDOWN,
            )

    # ================= Response Stream =================

    def stream(
        self,
        messages: list[ChatMessage],
        attempts: list[ProviderAttempt],
    ) -> Iterator[str]:
        attempted_providers: list[str] = []

        for attempt in attempts:
            provider = self.registry.get(attempt.provider)

            if not provider or not provider.is_available:
                logger.info(
                    "Skipping unavailable provider: %s",
                    attempt.provider,
                )
                continue

            cooldown_remaining = (
                self._get_cooldown_remaining(attempt)
            )

            if cooldown_remaining:
                logger.info(
                    "Skipping cooldown provider=%s "
                    "model=%s remaining=%ss",
                    attempt.provider,
                    attempt.model,
                    cooldown_remaining,
                )
                continue

            attempt_name = self._get_attempt_key(attempt)
            attempted_providers.append(attempt_name)

            logger.info(
                "Trying provider=%s model=%s",
                attempt.provider,
                attempt.model,
            )

            stream_started = False

            try:
                response_stream = provider.stream_chat(
                    messages=messages,
                    model=attempt.model,
                )

                first_chunk = next(response_stream)
                stream_started = True

                logger.info(
                    "Selected provider=%s model=%s",
                    attempt.provider,
                    attempt.model,
                )

                yield first_chunk

                for chunk in response_stream:
                    yield chunk

                return

            except StopIteration:
                logger.warning(
                    "Empty response provider=%s model=%s",
                    attempt.provider,
                    attempt.model,
                )

            except ProviderError as error:
                self._handle_failure_cooldown(
                    attempt,
                    error,
                )

                logger.warning(
                    "Provider failed provider=%s model=%s "
                    "status=%s error=%s",
                    attempt.provider,
                    attempt.model,
                    error.status_code,
                    error.__class__.__name__,
                )

                if stream_started:
                    raise

            except Exception:
                logger.exception(
                    "Unexpected provider failure "
                    "provider=%s model=%s",
                    attempt.provider,
                    attempt.model,
                )

                if stream_started:
                    raise

        raise AllProvidersFailedError(
            attempted_providers=attempted_providers,
        )