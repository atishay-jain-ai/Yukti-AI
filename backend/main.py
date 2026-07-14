"""
=========================================================
Yukti AI — FastAPI Application
=========================================================
"""

import logging
from collections.abc import Iterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.brain import AllProvidersFailedError, brain
from backend.models.chat_models import ChatRequest
from backend.providers import ProviderError


# ================= Logging =================

logging.basicConfig(
    level=logging.INFO,
    format=(
        "%(asctime)s | %(levelname)s | "
        "%(name)s | %(message)s"
    ),
)

logger = logging.getLogger("yukti.api")


# ================= FastAPI App =================

app = FastAPI(
    title="Yukti AI",
    description="Intelligent Indian AI Assistant",
    version="3.0.0",
)


# ================= CORS =================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= Health Route =================

@app.get("/")
def home() -> dict[str, str]:
    return {
        "message": "Welcome to Yukti AI 🚀",
        "status": "running",
        "version": "3.0.0",
    }


# ================= Stream Generator =================

def generate_response(
    conversation: list[dict],
) -> Iterator[str]:
    try:
        yield from brain.stream_chat(conversation)

    except AllProvidersFailedError as error:
        logger.error(
            "All providers failed attempts=%s",
            error.attempted_providers,
        )

        yield (
            "Yukti AI is temporarily unavailable. "
            "Please try again shortly."
        )

    except ProviderError as error:
        logger.error(
            "Provider stream failed provider=%s "
            "status=%s error=%s",
            error.provider,
            error.status_code,
            error.__class__.__name__,
        )

        yield (
            "The response was interrupted. "
            "Please send your message again."
        )

    except Exception:
        logger.exception(
            "Unexpected chat stream failure"
        )

        yield (
            "Something went wrong while generating "
            "the response. Please try again."
        )


# ================= Stream Chat =================

@app.post("/stream")
def stream_chat(
    request: ChatRequest,
) -> StreamingResponse:
    conversation = [
        message.model_dump()
        for message in request.messages
    ]

    return StreamingResponse(
        generate_response(conversation),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )