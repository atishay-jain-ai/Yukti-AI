"""
=========================================================
Yukti AI — Model Configuration
=========================================================
"""

import os
from dataclasses import dataclass


# ================= Model Helpers =================

def get_model(name: str, default: str) -> str:
    return os.getenv(name, default).strip()


# ================= Model Configuration =================

@dataclass(frozen=True)
class ModelConfig:
    gemini_primary: str
    gemini_reasoning: str

    groq_fast: str
    groq_reasoning: str
    groq_whisper: str

    openrouter_primary: str
    openrouter_fallback: str

    openai_fallback: str


# ================= Model Loader =================

def load_model_config() -> ModelConfig:
    return ModelConfig(
        gemini_primary=get_model(
            "GEMINI_PRIMARY_MODEL",
            "gemini-2.5-flash",
        ),
        gemini_reasoning=get_model(
            "GEMINI_REASONING_MODEL",
            "gemini-2.5-pro",
        ),

        groq_fast=get_model(
            "GROQ_FAST_MODEL",
            "llama-3.1-8b-instant",
        ),
        groq_reasoning=get_model(
            "GROQ_REASONING_MODEL",
            "openai/gpt-oss-120b",
        ),
        groq_whisper=get_model(
            "GROQ_WHISPER_MODEL",
            "whisper-large-v3-turbo",
        ),

        openrouter_primary=get_model(
            "OPENROUTER_PRIMARY_MODEL",
            "openai/gpt-oss-20b:free",
        ),
        openrouter_fallback=get_model(
            "OPENROUTER_FALLBACK_MODEL",
            "nvidia/nemotron-3-nano-30b-a3b:free",
        ),

        openai_fallback=get_model(
            "OPENAI_FALLBACK_MODEL",
            "gpt-4.1-mini",
        ),
    )


# ================= Global Models =================

models = load_model_config()