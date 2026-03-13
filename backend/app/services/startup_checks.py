"""Startup validation checks for Ollama and ChromaDB.

Runs during FastAPI lifespan to fail-fast on critical issues
and warn about missing recommended models.
"""

import logging
from typing import Any, Dict, List

import httpx

logger = logging.getLogger(__name__)

RECOMMENDED_MODELS = ["llama3.2"]


async def check_ollama(ollama_url: str, timeout: float = 5.0) -> List[str]:
    """Verify Ollama is running and return list of available model names.

    Raises RuntimeError if Ollama is unreachable or returns non-200.
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(f"{ollama_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
    except httpx.ConnectError:
        raise RuntimeError(
            f"Ollama is not running at {ollama_url}. "
            "Start it with 'ollama serve' and restart AI Home Hub."
        )
    except httpx.TimeoutException:
        raise RuntimeError(
            f"Ollama at {ollama_url} did not respond within {timeout}s. "
            "Check if Ollama is overloaded or restart it."
        )
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(
            f"Ollama returned HTTP {exc.response.status_code} on /api/tags. "
            "Ensure Ollama is healthy and restart AI Home Hub."
        )

    models = [m["name"] for m in data.get("models", [])]
    return models


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


async def check_chromadb() -> None:
    """Verify ChromaDB is writable by doing a dummy write + read + cleanup.

    Raises RuntimeError if ChromaDB is not operational.
    """
    import chromadb

    try:
        from app.services.vector_store_service import get_vector_store_service
        vs = get_vector_store_service()
        client = vs.client  # access underlying chromadb PersistentClient

        # Use a test collection
        test_col = client.get_or_create_collection("__startup_test__")
        test_col.add(
            ids=["startup_probe"],
            documents=["startup validation probe"],
        )
        results = test_col.get(ids=["startup_probe"])
        if not results or not results.get("ids"):
            raise RuntimeError("ChromaDB read-back returned empty result")
        # Cleanup
        client.delete_collection("__startup_test__")
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(
            f"ChromaDB is not writable: {exc}. "
            "Check disk space and file permissions on the data directory."
        ) from exc

    logger.info(
        "startup_check",
        extra={"check": "chromadb", "status": "ok", "writable": True},
    )


async def run_startup_checks(ollama_url: str) -> Dict[str, Any]:
    """Run all startup checks. Returns summary dict.

    Raises RuntimeError on critical failures (Ollama unreachable, ChromaDB broken).
    Model availability is only a warning — never blocks startup.
    """
    result: Dict[str, Any] = {}

    # 1. Ollama connectivity (fail-fast)
    logger.info("startup_check", extra={"check": "ollama_connectivity", "url": ollama_url})
    available_models = await check_ollama(ollama_url)
    result["ollama"] = {"status": "ok", "models": available_models}

    # 2. Model validation (warn only)
    validate_models(available_models)
    result["models"] = {"available": available_models, "recommended": RECOMMENDED_MODELS}

    # 3. ChromaDB write test (fail-fast)
    logger.info("startup_check", extra={"check": "chromadb_write_test"})
    await check_chromadb()
    result["chromadb"] = {"status": "ok"}

    logger.info(
        "startup_check",
        extra={"check": "all_passed", "summary": result},
    )
    return result
