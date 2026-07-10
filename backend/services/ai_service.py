from .openrouter_service import generate_response


def ask_ai(system_prompt: str, user_prompt: str):

    return generate_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt
    )