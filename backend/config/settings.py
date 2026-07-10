import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:

    PROJECT_NAME = "Yukti AI"

    VERSION = "2.0.0"

    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")


settings = Settings()