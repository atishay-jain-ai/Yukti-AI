"""
=========================================================
Yukti AI — Task Router
=========================================================
"""

from backend.brain.task_types import TaskType
from backend.providers.base_provider import ChatMessage


# ================= Keywords =================

WEB_KEYWORDS = {
    "latest",
    "today",
    "current",
    "currently",
    "news",
    "weather",
    "price",
    "stock",
    "score",
    "election",
    "aaj",
    "abhi",
    "mausam",
    "khabar",
    "samachar",
    "rate",
}

RESEARCH_KEYWORDS = {
    "deep research",
    "detailed research",
    "research report",
    "sources ke sath",
    "sources with",
    "compare in detail",
    "complete analysis",
}

CODING_KEYWORDS = {
    "code",
    "coding",
    "program",
    "function",
    "class",
    "api",
    "bug",
    "error",
    "debug",
    "javascript",
    "python",
    "html",
    "css",
    "react",
    "backend",
    "frontend",
}

REASONING_KEYWORDS = {
    "analyse",
    "analyze",
    "reason",
    "solve",
    "explain deeply",
    "step by step",
    "strategy",
    "architecture",
    "plan",
    "compare",
    "kyun",
    "kaise prove",
}

FAST_KEYWORDS = {
    "hello",
    "hi",
    "hey",
    "thanks",
    "thank you",
    "good morning",
    "good night",
    "namaste",
}


# ================= Task Router =================

class TaskRouter:
    def get_last_user_message(
        self,
        messages: list[ChatMessage],
    ) -> str:
        for message in reversed(messages):
            if message.get("role") == "user":
                return str(message.get("content", "")).strip().lower()

        return ""

    def contains_keyword(
        self,
        text: str,
        keywords: set[str],
    ) -> bool:
        return any(keyword in text for keyword in keywords)

    def route(
        self,
        messages: list[ChatMessage],
    ) -> TaskType:
        user_message = self.get_last_user_message(messages)

        if not user_message:
            return TaskType.GENERAL_CHAT

        if self.contains_keyword(user_message, RESEARCH_KEYWORDS):
            return TaskType.DEEP_RESEARCH

        if self.contains_keyword(user_message, WEB_KEYWORDS):
            return TaskType.WEB_SEARCH

        if self.contains_keyword(user_message, CODING_KEYWORDS):
            return TaskType.CODING

        if self.contains_keyword(user_message, REASONING_KEYWORDS):
            return TaskType.REASONING

        if (
            len(user_message) <= 40
            and self.contains_keyword(user_message, FAST_KEYWORDS)
        ):
            return TaskType.FAST_CHAT

        return TaskType.GENERAL_CHAT