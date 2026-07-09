import os
from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv
import google.generativeai as genai

# Force load .env from project root
env_path = Path(__file__).parent.parent / ".env"

loaded = load_dotenv(dotenv_path=env_path)

print("Dotenv loaded:", loaded)
print("Env path:", env_path)

API_KEY = os.getenv("GEMINI_API_KEY")
print("API KEY:", repr(API_KEY))

# Configure Gemini
genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI(
    title="Yukti AI",
    description="Indian AI Voice Assistant",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Yukti AI 🚀"
    }

@app.get("/ask")
def ask_ai(prompt: str):
    response = model.generate_content(prompt)
    return {
        "question": prompt,
        "answer": response.text
    }