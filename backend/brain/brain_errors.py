"""
=========================================================
Yukti AI — Brain Errors
=========================================================
"""


# ================= Brain Error =================

class BrainError(Exception):
    pass


# ================= Provider Failure =================

class AllProvidersFailedError(BrainError):
    def __init__(
        self,
        attempted_providers: list[str],
    ) -> None:
        self.attempted_providers = attempted_providers

        super().__init__(
            "All available AI providers failed."
        )


# ================= Search Failure =================

class SearchToolError(BrainError):
    pass