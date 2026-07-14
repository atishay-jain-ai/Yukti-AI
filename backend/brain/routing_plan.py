"""
=========================================================
Yukti AI — Routing Plans
=========================================================
"""

from dataclasses import dataclass

from backend.brain.task_types import TaskType
from backend.config import models


# ================= Provider Attempt =================

@dataclass(frozen=True)
class ProviderAttempt:
    provider: str
    model: str


# ================= Routing Plan =================

class RoutingPlan:
    def build(self, task_type: TaskType) -> list[ProviderAttempt]:
        if task_type == TaskType.FAST_CHAT:
            return self._fast_plan()

        if task_type in {
            TaskType.REASONING,
            TaskType.CODING,
            TaskType.DOCUMENT_ANALYSIS,
        }:
            return self._reasoning_plan()

        if task_type in {
            TaskType.WEB_SEARCH,
            TaskType.DEEP_RESEARCH,
        }:
            return self._research_plan()

        if task_type == TaskType.IMAGE_ANALYSIS:
            return self._image_plan()

        return self._general_plan()

    # ================= General =================

    def _general_plan(self) -> list[ProviderAttempt]:
        return [
            ProviderAttempt("gemini", models.gemini_primary),
            ProviderAttempt("groq", models.groq_fast),
            ProviderAttempt(
                "openrouter",
                models.openrouter_primary,
            ),
            ProviderAttempt(
                "openrouter",
                models.openrouter_fallback,
            ),
            ProviderAttempt("openai", models.openai_fallback),
        ]

    # ================= Fast =================

    def _fast_plan(self) -> list[ProviderAttempt]:
        return [
            ProviderAttempt("groq", models.groq_fast),
            ProviderAttempt("gemini", models.gemini_primary),
            ProviderAttempt(
                "openrouter",
                models.openrouter_primary,
            ),
            ProviderAttempt("openai", models.openai_fallback),
        ]

    # ================= Reasoning =================

    def _reasoning_plan(self) -> list[ProviderAttempt]:
        return [
            ProviderAttempt("gemini", models.gemini_reasoning),
            ProviderAttempt("groq", models.groq_reasoning),
            ProviderAttempt("gemini", models.gemini_primary),
            ProviderAttempt(
                "openrouter",
                models.openrouter_primary,
            ),
            ProviderAttempt(
                "openrouter",
                models.openrouter_fallback,
            ),
            ProviderAttempt("openai", models.openai_fallback),
        ]

    # ================= Research =================

    def _research_plan(self) -> list[ProviderAttempt]:
        return [
            ProviderAttempt("gemini", models.gemini_reasoning),
            ProviderAttempt("groq", models.groq_reasoning),
            ProviderAttempt("gemini", models.gemini_primary),
            ProviderAttempt(
                "openrouter",
                models.openrouter_primary,
            ),
            ProviderAttempt("openai", models.openai_fallback),
        ]

    # ================= Image =================

    def _image_plan(self) -> list[ProviderAttempt]:
        return [
            ProviderAttempt("gemini", models.gemini_primary),
            ProviderAttempt("gemini", models.gemini_reasoning),
            ProviderAttempt("openai", models.openai_fallback),
        ]