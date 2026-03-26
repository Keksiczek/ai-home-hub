"""Web Search Tool for the Resident Agent.

Uses DuckDuckGo (duckduckgo-search package) for free, no-API-key web search.
Includes rate limiting, sensitive query filtering, and timeout handling.
"""

import logging
import os
import time
from collections import deque
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# ── Rate limiting ─────────────────────────────────────────────────────────────

WEB_SEARCH_PER_HOUR: int = int(os.environ.get("WEB_SEARCH_PER_HOUR", "10"))

# Timestamps of recent searches (sliding window)
_search_timestamps: deque = deque()

# ── Sensitive query patterns ──────────────────────────────────────────────────

_SENSITIVE_WORDS = frozenset(
    {
        "password",
        "heslo",
        "secret",
        "token",
        "api_key",
        "apikey",
        "private_key",
        "ssh_key",
        "credentials",
        "tajné",
    }
)


def _is_sensitive_query(query: str) -> bool:
    """Check if a query contains sensitive keywords."""
    query_lower = query.lower()
    return any(word in query_lower for word in _SENSITIVE_WORDS)


def _check_rate_limit() -> bool:
    """Return True if rate limit is NOT exceeded."""
    now = time.time()
    # Remove entries older than 1 hour
    while _search_timestamps and _search_timestamps[0] < now - 3600:
        _search_timestamps.popleft()
    return len(_search_timestamps) < WEB_SEARCH_PER_HOUR


def _record_search() -> None:
    """Record a search timestamp."""
    _search_timestamps.append(time.time())


async def tool_web_search(query: str, max_results: int = 3) -> Dict[str, Any]:
    """Search the web via DuckDuckGo.

    Returns::

        {
            "query": "...",
            "results": [{"title": "...", "url": "...", "snippet": "..."}, ...],
            "source": "duckduckgo"
        }
    """
    if not query or not query.strip():
        return {"query": query, "results": [], "error": "empty query"}

    # Safety: refuse sensitive queries
    if _is_sensitive_query(query):
        logger.warning("web_search refused: sensitive query '%s'", query[:50])
        return {
            "query": query,
            "results": [],
            "error": "web_search refused: sensitive query",
        }

    # Rate limit check
    if not _check_rate_limit():
        logger.warning(
            "web_search rate limited: %d/%d searches in the last hour",
            len(_search_timestamps),
            WEB_SEARCH_PER_HOUR,
        )
        return {
            "query": query,
            "results": [],
            "error": f"web_search rate limited: max {WEB_SEARCH_PER_HOUR}/hour",
        }

    try:
        from duckduckgo_search import DDGS

        results: List[Dict[str, str]] = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append(
                    {
                        "title": r.get("title", ""),
                        "url": r.get("href", r.get("link", "")),
                        "snippet": r.get("body", r.get("snippet", "")),
                    }
                )

        _record_search()
        logger.info("web_search OK: query='%s', results=%d", query[:50], len(results))

        return {
            "query": query,
            "results": results,
            "source": "duckduckgo",
        }

    except ImportError:
        logger.error("duckduckgo-search package not installed")
        return {
            "query": query,
            "results": [],
            "error": "web_search unavailable: duckduckgo-search not installed",
        }
    except Exception as exc:
        logger.error("web_search failed: %s", exc)
        return {
            "query": query,
            "results": [],
            "error": f"web_search unavailable: {exc}",
        }
