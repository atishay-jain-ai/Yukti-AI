"""
=========================================================
Yukti AI — Provider Errors
=========================================================
"""

from typing import Optional


# ================= Base Error =================

class ProviderError(Exception):
    def __init__(
        self,
        message: str,
        provider: str,
        status_code: Optional[int] = None,
    ) -> None:
        super().__init__(message)

        self.provider = provider
        self.status_code = status_code


# ================= Temporary Error =================

class ProviderTemporaryError(ProviderError):
    pass


# ================= Configuration Error =================

class ProviderConfigurationError(ProviderError):
    pass


# ================= Authentication Error =================

class ProviderAuthenticationError(ProviderError):
    pass


# ================= Response Error =================

class ProviderResponseError(ProviderError):
    pass