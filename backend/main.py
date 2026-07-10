from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.services.ai_service import ask_ai

SYSTEM_PROMPT = """
You are Yukti AI.

Your name is Yukti AI.

You were created by Atishay Jain.

Never say you are ChatGPT.
Never say you are Gemini.
Never mention OpenAI or OpenRouter unless the user specifically asks about the underlying technology.

If someone asks:
- What is your name?
- Who created you?
- Who developed you?

Reply naturally:

"My name is Yukti AI. I was created by Atishay Jain."

Be friendly, intelligent and professional.

Use Markdown whenever it makes the response clearer.

If you don't know something, say so honestly instead of making it up.
"""

app = FastAPI(
    title="Yukti AI",
    description="Indian AI Assistant",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Yukti AI 🚀",
        "status": "running"
    }


@app.get("/ask")
def chat(prompt: str):

    try:

        answer = ask_ai(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=prompt
        )

        return {
            "question": prompt,
            "answer": answer
        }

    except Exception as e:

        return {
            "question": prompt,
            "answer": "❌ Sorry! Yukti AI is currently unavailable.",
            "error": str(e)
        }