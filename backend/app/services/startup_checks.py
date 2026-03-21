"""Startup validation checks for Ollama and ChromaDB.

Runs during FastAPI lifespan and returns a component health dict instead of
raising on non-critical failures (e.g. Ollama unavailable).
"""

import logging
from typing import Any, Dict, List

import httpx

logger = logging.getLogger(__name__)

RECOMMENDED_MODELS = ["llama3.2"]


async def check_ollama(ollama_url: str, timeout: float = 5.0) -> List[str]:
    """Verify Ollama is running and return list of available model names.

    Returns empty list and logs a warning instead of raising on connectivity
    issues, so the app can start in degraded mode.
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(f"{ollama_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
        models = [m["name"] for m in data.get("models", [])]
        return models
    except httpx.ConnectError:
        logger.warning(
            "Ollama is not running at %s. "
            "Start it with 'ollama serve'. App will run in degraded mode.",
            ollama_url,
        )
        return []
    except httpx.TimeoutException:
        logger.warning(
            "Ollama at %s did not respond within %.1fs. "
            "App will run in degraded mode.",
            ollama_url, timeout,
        )
        return []
    except httpx.HTTPStatusError as exc:
        logger.warning(
            "Ollama returned HTTP %s on /api/tags. App will run in degraded mode.",
            exc.response.status_code,
        )
        return []
    except Exception as exc:
        logger.warning("Ollama check failed unexpectedly: %s. Degraded mode.", exc)
        return []


def validate_models(available: List[str]) -> None:
    """Log model availability vs recommended list. Never fails — only warns."""
    # Strip tag suffixes for comparison (e.g. "llama3.2:latest" → "llama3.2")
    available_base = {m.split(":")[0] for m in available}

    present = [m for m in RECOMMENDED_MODELS if m in available_base]
    missing = [m for m in RECOMMENDED_MODELS if m not in available_base]

    logger.info(
        "startup_check",
        extra={
            "check": "ollama_models",
            "available": available,
            "recommended": RECOMMENDED_MODELS,
            "recommended_present": present,
            "recommended_missing": missing,
        },
    )

    if not available:
        logger.warning(
            "No Ollama models installed. "
            "Download at least one model via UI or 'ollama pull llama3.2'."
        )
    elif missing:
        logger.warning(
            "Recommended models missing: %s. "
            "Available: %s. You can download them via the Model Manager in UI.",
            missing, available,
        )
    else:
        logger.info(
            "All recommended models present: %s (available: %s)",
            present, available,
        )


async def check_chromadb() -> str:
    """Verify ChromaDB is writable by doing a dummy write + read + cleanup.

    Returns "ok" or "error". Never raises.
    """
    try:
        from app.services.vector_store_service import get_vector_store_service
        vs = get_vector_store_service()
        client = vs.client  # access underlying chromadb PersistentClient

        test_col = client.get_or_create_collection("__startup_test__")
        test_col.add(
            ids=["startup_probe"],
            documents=["startup validation probe"],
        )
        results = test_col.get(ids=["startup_probe"])
        if not results or not results.get("ids"):
            raise RuntimeError("ChromaDB read-back returned empty result")
        client.delete_collection("__startup_test__")
        logger.info(
            "startup_check",
            extra={"check": "chromadb", "status": "ok", "writable": True},
        )
        return "ok"
    except Exception as exc:
        logger.error(
            "ChromaDB check failed: %s. Check disk space and file permissions.",
            exc,
        )
        return "error"


async def run_startup_checks(ollama_url: str) -> Dict[str, Any]:
    """Run all startup checks. Returns component health dict.

    Never raises – returns health status for each component so the app can
    start in degraded mode when optional services are unavailable.

    Returns::

        {
            "ollama": "ok" | "degraded" | "unavailable",
            "kb": "ok" | "degraded",
            "jobs_db": "ok" | "error",
            "overall": "healthy" | "degraded" | "critical",
        }
    """
    result: Dict[str, Any] = {}

    # 1. Ollama connectivity
    logger.info("startup_check", extra={"check": "ollama_connectivity", "url": ollama_url})
    available_models = await check_ollama(ollama_url)

    if available_models:
        validate_models(available_models)
        result["ollama"] = "ok"
        result["ollama_models"] = available_models
    else:
        result["ollama"] = "unavailable"
        result["ollama_models"] = []
        logger.warning("Ollama unavailable – LLM features will be degraded")

    # 2. ChromaDB / KB
    logger.info("startup_check", extra={"check": "chromadb_write_test"})
    chromadb_status = await check_chromadb()
    result["kb"] = "ok" if chromadb_status == "ok" else "degraded"

    # 3. Jobs DB (SQLite)
    try:
        from app.db.jobs_db import get_jobs_db
        get_jobs_db()
        result["jobs_db"] = "ok"
    except Exception as exc:
        logger.error("Jobs DB init failed: %s", exc)
        result["jobs_db"] = "error"

    # 4. Compute overall health
    if result["jobs_db"] == "error" or result["kb"] == "degraded":
        result["overall"] = "critical"
    elif result["ollama"] == "unavailable":
        result["overall"] = "degraded"
    else:
        result["overall"] = "healthy"

    logger.info(
        "startup_check",
        extra={"check": "complete", "summary": result},
    )
    return result
