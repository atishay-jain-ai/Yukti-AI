"""
=========================================================
Yukti AI — Base AI Provider
=========================================================
"""

from abc import ABC, abstractmethod
from collections.abc import Iterator
from typing import Any


# ================= Message Type =================

ChatMessage = dict[str, Any]


# ================= Provider Contract =================

class BaseProvider(ABC):
    provider_name: str = "unknown"

    @property
    @abstractmethod
    def is_available(self) -> bool:
        pass

    @abstractmethod
    def stream_chat(
        self,
        messages: list[ChatMessage],
        model: str,
    ) -> Iterator[str]:
        pass