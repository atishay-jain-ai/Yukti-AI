"""
=========================================================
Yukti AI — Application Settings
=========================================================
"""

import os
from dataclasses import dataclass

from dotenv import load_dotenv


# ================= Environment =================

load_dotenv()


# ================= Helpers =================

def get_env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {
        "true",
        "1",
        "yes",
        "on",
    }


# ================= Settings =================

@dataclass(frozen=True)
class Settings:
    gemini_api_key: str
    groq_api_key: str
    openrouter_api_key: str
    tavily_api_key: str

    openai_api_key: str
    enable_openai_fallback: bool

    app_name: str
    app_environment: str
    debug: bool


# ================= Settings Loader =================

def load_settings() -> Settings:
    return Settings(
        gemini_api_key=os.getenv("GEMINI_API_KEY", "").strip(),
        groq_api_key=os.getenv("GROQ_API_KEY", "").strip(),
        openrouter_api_key=os.getenv(
            "OPENROUTER_API_KEY",
            "",
        ).strip(),
        tavily_api_key=os.getenv("TAVILY_API_KEY", "").strip(),

        openai_api_key=os.getenv("OPENAI_API_KEY", "").strip(),
        enable_openai_fallback=get_env_bool(
            "ENABLE_OPENAI_FALLBACK",
            False,
        ),

        app_name=os.getenv("APP_NAME", "Yukti AI").strip(),
        app_environment=os.getenv(
            "APP_ENVIRONMENT",
            "development",
        ).strip(),
        debug=get_env_bool("DEBUG", True),
    )


# ================= Global Settings =================

settings = load_settings()