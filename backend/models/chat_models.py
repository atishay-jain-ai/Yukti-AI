"""Yukti AI chat request models."""

from typing import List, Literal

from pydantic import BaseModel, Field, validator


# ================= Chat Message =================

class ChatMessage(BaseModel):

    role: Literal["user", "assistant"]

    content: str = Field(
        ...,
        min_length=1
    )

    @validator("content")
    def clean_message_content(
        cls,
        value: str
    ) -> str:

        clean_value = value.strip()

        if not clean_value:
            raise ValueError(
                "Message content empty nahi ho sakta."
            )

        return clean_value


# ================= Chat Request =================

class ChatRequest(BaseModel):

    messages: List[ChatMessage] = Field(
        ...,
        min_items=1
    )