"""
=========================================================
Yukti AI — Web Search Tool
=========================================================
"""

from dataclasses import dataclass

import httpx

from backend.brain.brain_errors import SearchToolError
from backend.config import settings


# ================= Search Result =================

@dataclass(frozen=True)
class SearchResult:
    title: str
    url: str
    content: str


# ================= Web Search Tool =================

class WebSearchTool:
    api_url = "https://api.tavily.com/search"

    def __init__(self) -> None:
        self.api_key = settings.tavily_api_key

    # ================= Availability =================

    @property
    def is_available(self) -> bool:
        return bool(self.api_key)

    # ================= Search =================

    def search(
        self,
        query: str,
        max_results: int = 5,
    ) -> list[SearchResult]:
        if not self.api_key:
            raise SearchToolError(
                "Tavily API key is missing."
            )

        clean_query = query.strip()

        if not clean_query:
            raise SearchToolError(
                "Search query is empty."
            )

        try:
            response = httpx.post(
                self.api_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "query": clean_query,
                    "search_depth": "basic",
                    "max_results": max_results,
                    "include_answer": False,
                    "include_raw_content": False,
                },
                timeout=20.0,
            )

            response.raise_for_status()
            payload = response.json()

        except (
            httpx.HTTPError,
            ValueError,
        ) as error:
            raise SearchToolError(
                "Web search is temporarily unavailable."
            ) from error

        results: list[SearchResult] = []

        for item in payload.get("results", []):
            title = str(item.get("title", "")).strip()
            url = str(item.get("url", "")).strip()
            content = str(item.get("content", "")).strip()

            if not url or not content:
                continue

            results.append(
                SearchResult(
                    title=title or "Untitled source",
                    url=url,
                    content=content,
                )
            )

        if not results:
            raise SearchToolError(
                "Web search returned no useful results."
            )

        return results

    # ================= Search Context =================

    def build_context(
        self,
        query: str,
        max_results: int = 5,
    ) -> str:
        results = self.search(
            query=query,
            max_results=max_results,
        )

        context_parts: list[str] = []

        for index, result in enumerate(results, start=1):
            context_parts.append(
                "\n".join(
                    [
                        f"Source {index}: {result.title}",
                        f"URL: {result.url}",
                        f"Content: {result.content}",
                    ]
                )
            )

        return "\n\n".join(context_parts)