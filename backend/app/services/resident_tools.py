"""Resident Tool Registry + Tool Calling Engine.

Provides 6 idempotent, timeout-safe tools (web search, page browse, KB search,
system stats, job listing, weather) plus an async execute_tool_call dispatcher.

All tools are capped at a 10-second timeout and return a uniform dict:
  {"tool": str, "ok": bool, "data": ..., "error": str|None}
"""
import json
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

_TOOL_TIMEOUT = 10.0  # seconds – hard cap on every external call

# ── Pydantic models ──────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import Literal


class ToolParameter(BaseModel):
    name: str
    type: Literal["string", "number", "boolean", "array"]
    description: str
    required: bool = False


class ResidentTool(BaseModel):
    name: str
    description: str
    parameters: Dict[str, ToolParameter]


# ── Tool registry ────────────────────────────────────────────────────────────

TOOLS_REGISTRY: List[ResidentTool] = [
    ResidentTool(
        name="search_web",
        description="Vyhledat informace na internetu pomocí DuckDuckGo",
        parameters={
            "query": ToolParameter(
                name="query",
                type="string",
                description="Hledaný výraz",
                required=True,
            )
        },
    ),
    ResidentTool(
        name="browse_page",
        description="Prohlédnout konkrétní webovou stránku",
        parameters={
            "url": ToolParameter(
                name="url",
                type="string",
                description="URL stránky k prohlédnutí",
                required=True,
            )
        },
    ),
    ResidentTool(
        name="kb_search",
        description="Vyhledat v Knowledge Base",
        parameters={
            "query": ToolParameter(
                name="query",
                type="string",
                description="Hledaný dotaz",
                required=True,
            ),
            "collection": ToolParameter(
                name="collection",
                type="string",
                description="Název kolekce (výchozí: knowledge_base)",
                required=False,
            ),
        },
    ),
    ResidentTool(
        name="get_system_stats",
        description="Získat aktuální systémové metriky (fronta jobů, KB, RAM, chyby Ollamy)",
        parameters={},
    ),
    ResidentTool(
        name="list_jobs",
        description="Seznam aktuálních jobů v systému",
        parameters={
            "status": ToolParameter(
                name="status",
                type="string",
                description="Filtr stavu: queued, running, succeeded, failed",
                required=False,
            ),
            "type": ToolParameter(
                name="type",
                type="string",
                description="Filtr typu jobu",
                required=False,
            ),
            "limit": ToolParameter(
                name="limit",
                type="number",
                description="Maximální počet jobů (výchozí: 10)",
                required=False,
            ),
        },
    ),
    ResidentTool(
        name="get_weather",
        description="Získat aktuální počasí pro zadané místo",
        parameters={
            "location": ToolParameter(
                name="location",
                type="string",
                description="Město nebo místo (výchozí: Praha)",
                required=False,
            )
        },
    ),
]

# Map name → definition for O(1) lookup
_TOOL_MAP: Dict[str, ResidentTool] = {t.name: t for t in TOOLS_REGISTRY}


def get_tools_registry() -> List[ResidentTool]:
    """Return the list of all registered tools."""
    return TOOLS_REGISTRY


def render_tools_for_prompt() -> str:
    """Render tool registry as a JSON string suitable for embedding in an LLM prompt."""
    tools_list = []
    for tool in TOOLS_REGISTRY:
        tools_list.append(
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": {
                    k: {
                        "type": v.type,
                        "description": v.description,
                        "required": v.required,
                    }
                    for k, v in tool.parameters.items()
                },
            }
        )
    return json.dumps(tools_list, ensure_ascii=False, indent=2)


# ── Tool implementations ─────────────────────────────────────────────────────


async def _search_web(query: str) -> Dict[str, Any]:
    """DuckDuckGo instant-answer API – returns abstract + top 3 topics."""
    async with httpx.AsyncClient(timeout=_TOOL_TIMEOUT) as client:
        resp = await client.get(
            "https://api.duckduckgo.com/",
            params={
                "q": query,
                "format": "json",
                "no_html": 1,
                "skip_disambig": 1,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    abstract = data.get("AbstractText", "")
    raw_topics = data.get("RelatedTopics", [])

    snippets = []
    for topic in raw_topics[:3]:
        if isinstance(topic, dict) and topic.get("Text"):
            snippets.append(
                {
                    "text": topic["Text"][:300],
                    "url": topic.get("FirstURL", ""),
                }
            )

    return {
        "query": query,
        "abstract": abstract[:500],
        "results": snippets,
    }


async def _browse_page(url: str) -> Dict[str, Any]:
    """Fetch a page and return title + first 2000 chars of text content."""
    # Basic URL safety – only allow http/https
    if not url.startswith(("http://", "https://")):
        raise ValueError(f"Unsupported URL scheme: {url!r}")

    async with httpx.AsyncClient(
        timeout=_TOOL_TIMEOUT,
        follow_redirects=True,
        headers={"User-Agent": "Mozilla/5.0 (compatible; ResidentAgent/1.0)"},
    ) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        raw = resp.text

    # Very lightweight HTML → text extraction (no external deps)
    import re

    # Remove script/style blocks
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw, flags=re.DOTALL | re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Extract <title>
    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL)
    title = re.sub(r"\s+", " ", title_match.group(1)).strip() if title_match else ""

    return {
        "url": url,
        "title": title[:200],
        "text_summary": text[:2000],
        "content_length": len(raw),
    }


async def _kb_search(query: str, collection: Optional[str] = None) -> Dict[str, Any]:
    """Search the ChromaDB knowledge base using embeddings."""
    import asyncio

    try:
        from app.services.embeddings_service import get_embeddings_service
        from app.services.vector_store_service import get_vector_store_service

        embeddings_svc = get_embeddings_service()
        vs = get_vector_store_service()

        embedding = await embeddings_svc.embed(query)
        # search() is sync – run in thread to avoid blocking the event loop
        results = await asyncio.to_thread(vs.search, query_embedding=embedding, top_k=5)

        documents = []
        for doc, meta, dist in zip(
            results.get("documents", []),
            results.get("metadatas", []),
            results.get("distances", []),
        ):
            documents.append(
                {
                    "title": str(meta.get("title", meta.get("file_path", "No title")))[:100],
                    "content": str(doc)[:300],
                    "score": round(1.0 - float(dist), 3),
                }
            )

        return {
            "query": query,
            "collection": collection or "knowledge_base",
            "documents": documents,
            "count": len(documents),
        }
    except Exception as exc:
        logger.warning("KB search failed: %s", exc)
        return {"query": query, "collection": collection or "knowledge_base", "documents": [], "count": 0, "error": str(exc)}


async def _get_system_stats() -> Dict[str, Any]:
    """Collect system stats from local services (no external call needed)."""
    stats: Dict[str, Any] = {}

    # Job stats
    try:
        from app.services.job_service import get_job_service
        from datetime import datetime, timedelta, timezone

        job_svc = get_job_service()
        since_24h = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        job_stats = job_svc.get_stats_since(since_24h)
        stats["job_queue_depth"] = len(job_svc.list_jobs(status="queued", limit=100))
        stats["jobs_total_24h"] = job_stats.get("tasks_total", 0)
        stats["job_success_rate"] = round(job_stats.get("success_rate", 0) * 100, 1)
        stats["failed_jobs_24h"] = job_svc.count_jobs(status="failed", since=since_24h)
    except Exception as exc:
        logger.debug("Stats: job info failed: %s", exc)
        stats["job_queue_depth"] = -1

    # KB stats
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        kb = vs.get_stats(detailed=False)
        stats["kb_size"] = kb.get("total_chunks", 0)
    except Exception as exc:
        logger.debug("Stats: KB stats failed: %s", exc)
        stats["kb_size"] = -1

    # Resource monitor
    try:
        from app.services.resource_monitor import get_resource_monitor

        monitor = get_resource_monitor()
        snap = monitor.to_dict()
        stats["ram_usage"] = snap.get("ram_used_percent", -1)
        stats["cpu_percent"] = snap.get("cpu_percent", -1)
        stats["throttled"] = snap.get("throttle", False)
    except Exception as exc:
        logger.debug("Stats: resource monitor failed: %s", exc)

    # Ollama error rate (best-effort via circuit breaker state)
    try:
        from app.utils.circuit_breaker import get_ollama_circuit_breaker

        cb = get_ollama_circuit_breaker()
        stats["ollama_circuit_open"] = not await cb.can_execute()
    except Exception as exc:
        logger.debug("Stats: circuit breaker failed: %s", exc)
        stats["ollama_circuit_open"] = False

    return stats


async def _list_jobs(
    status: Optional[str] = None,
    job_type: Optional[str] = None,
    limit: int = 10,
) -> Dict[str, Any]:
    """List jobs from the job service."""
    try:
        from app.services.job_service import get_job_service

        job_svc = get_job_service()
        limit = max(1, min(int(limit), 50))  # clamp 1-50

        kwargs: Dict[str, Any] = {"limit": limit}
        if status:
            kwargs["status"] = status
        if job_type:
            kwargs["type"] = job_type

        jobs = job_svc.list_jobs(**kwargs)
        return {
            "jobs": [
                {
                    "id": j.id,
                    "type": j.type,
                    "title": j.title[:80],
                    "status": j.status,
                    "progress": j.progress,
                    "created_at": j.created_at,
                }
                for j in jobs
            ],
            "count": len(jobs),
            "filters": {"status": status, "type": job_type, "limit": limit},
        }
    except Exception as exc:
        logger.warning("list_jobs failed: %s", exc)
        return {"jobs": [], "count": 0, "error": str(exc)}


async def _get_weather(location: str = "Praha") -> Dict[str, Any]:
    """Get current weather via wttr.in (free, no API key required)."""
    # Sanitize location – strip special chars, max 50 chars
    import re
    location = re.sub(r"[^\w\s,.-]", "", location)[:50].strip() or "Praha"

    async with httpx.AsyncClient(timeout=_TOOL_TIMEOUT) as client:
        resp = await client.get(
            f"https://wttr.in/{location}",
            params={"format": "j1"},
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current_condition", [{}])[0]
    weather_desc = current.get("weatherDesc", [{}])[0].get("value", "N/A")

    return {
        "location": location,
        "temp_c": current.get("temp_C", "?"),
        "feels_like_c": current.get("FeelsLikeC", "?"),
        "humidity_pct": current.get("humidity", "?"),
        "description": weather_desc,
        "wind_kmph": current.get("windspeedKmph", "?"),
    }


# ── Tool dispatch ────────────────────────────────────────────────────────────


async def execute_tool_call(tool_call: Dict[str, Any], context: Dict[str, Any] = {}) -> Dict[str, Any]:
    """Dispatch a tool call dict and return a uniform result.

    Args:
        tool_call: OpenAI-style function call dict:
          ``{"type": "function", "function": {"name": str, "arguments": dict|str}}``
        context: Optional extra context (e.g. current system state).

    Returns:
        ``{"tool": str, "ok": bool, "data": Any, "error": str|None, "duration_ms": int}``
    """
    t0 = time.monotonic()

    fn = tool_call.get("function", {})
    tool_name = fn.get("name", "")
    raw_args = fn.get("arguments", {})

    # Parse JSON string arguments if needed
    if isinstance(raw_args, str):
        try:
            args: Dict[str, Any] = json.loads(raw_args)
        except json.JSONDecodeError:
            args = {}
    else:
        args = raw_args or {}

    # Validate tool exists
    if tool_name not in _TOOL_MAP:
        return {
            "tool": tool_name,
            "ok": False,
            "data": None,
            "error": f"Unknown tool: {tool_name!r}",
            "duration_ms": 0,
        }

    try:
        if tool_name == "search_web":
            data = await _search_web(args["query"])
        elif tool_name == "browse_page":
            data = await _browse_page(args["url"])
        elif tool_name == "kb_search":
            data = await _kb_search(args["query"], args.get("collection"))
        elif tool_name == "get_system_stats":
            data = await _get_system_stats()
        elif tool_name == "list_jobs":
            data = await _list_jobs(
                status=args.get("status"),
                job_type=args.get("type"),
                limit=int(args.get("limit", 10)),
            )
        elif tool_name == "get_weather":
            data = await _get_weather(args.get("location", "Praha"))
        else:
            # Should never reach here given the check above, but be safe
            raise ValueError(f"Unhandled tool: {tool_name}")

        duration_ms = int((time.monotonic() - t0) * 1000)
        return {
            "tool": tool_name,
            "ok": True,
            "data": data,
            "error": None,
            "duration_ms": duration_ms,
        }

    except Exception as exc:
        duration_ms = int((time.monotonic() - t0) * 1000)
        logger.warning("Tool %s failed: %s", tool_name, exc)
        return {
            "tool": tool_name,
            "ok": False,
            "data": None,
            "error": str(exc)[:500],
            "duration_ms": duration_ms,
        }
