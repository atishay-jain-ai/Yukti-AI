from openai import OpenAI

from backend.config.settings import settings

API_KEY = settings.OPENROUTER_API_KEY

if not API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in .env")

client = OpenAI(
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1"
)


def generate_response(system_prompt: str, user_prompt: str):

    completion = client.chat.completions.create(

        model="openrouter/free",

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]

    )

    return completion.choices[0].message.content