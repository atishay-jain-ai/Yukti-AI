"""
=========================================================
Yukti AI — Brain Orchestrator
=========================================================
"""

import logging
from collections.abc import Iterator

from backend.brain.brain_errors import SearchToolError
from backend.brain.fallback_manager import FallbackManager
from backend.brain.provider_registry import provider_registry
from backend.brain.research_context import ResearchContext
from backend.brain.routing_plan import RoutingPlan
from backend.brain.system_prompt import add_system_prompt
from backend.brain.task_router import TaskRouter
from backend.brain.task_types import TaskType
from backend.providers import ChatMessage
from backend.tools.web_search import WebSearchTool


# ================= Logger =================

logger = logging.getLogger("yukti.brain")


# ================= Brain Orchestrator =================

class BrainOrchestrator:
    def __init__(self) -> None:
        self.task_router = TaskRouter()
        self.routing_plan = RoutingPlan()

        self.web_search = WebSearchTool()
        self.research_context = ResearchContext(
            web_search=self.web_search,
        )

        self.fallback_manager = FallbackManager(
            registry=provider_registry,
        )

    # ================= Search Failure Context =================

    def _add_search_failure_context(
        self,
        messages: list[ChatMessage],
    ) -> list[ChatMessage]:
        return [
            {
                "role": "system",
                "content": (
                    "Live web search is currently unavailable. "
                    "Do not present time-sensitive information as "
                    "verified or current. Clearly tell the user "
                    "that live information could not be checked."
                ),
            },
            *messages,
        ]

    # ================= Message Preparation =================

    def _prepare_messages(
        self,
        messages: list[ChatMessage],
        task_type: TaskType,
    ) -> list[ChatMessage]:
        prepared_messages = add_system_prompt(messages)

        if task_type not in {
            TaskType.WEB_SEARCH,
            TaskType.DEEP_RESEARCH,
        }:
            return prepared_messages

        try:
            return self.research_context.enrich(
                messages=prepared_messages,
                task_type=task_type,
            )

        except SearchToolError as error:
            logger.warning(
                "Web search failed error=%s",
                error.__class__.__name__,
            )

            return self._add_search_failure_context(
                prepared_messages
            )

    # ================= Response Stream =================

    def stream_chat(
        self,
        messages: list[ChatMessage],
    ) -> Iterator[str]:
        task_type = self.task_router.route(messages)

        logger.info(
            "Detected task=%s",
            task_type.value,
        )

        prepared_messages = self._prepare_messages(
            messages=messages,
            task_type=task_type,
        )

        attempts = self.routing_plan.build(task_type)

        yield from self.fallback_manager.stream(
            messages=prepared_messages,
            attempts=attempts,
        )


# ================= Global Brain =================

brain = BrainOrchestrator()