"""Startup validation checks for Ollama and ChromaDB.

Runs during FastAPI lifespan and returns a component health dict instead of
raising on non-critical failures (e.g. Ollama unavailable).
"""

import logging
import os
from typing import Any, Dict, List

import httpx

logger = logging.getLogger(__name__)

RECOMMENDED_MODELS = ["llama3.2"]
EMBEDDING_MODEL = "nomic-embed-text"
EMBEDDING_FALLBACK = "llama3.2"


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
            ollama_url,
            timeout,
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
            missing,
            available,
        )
    else:
        logger.info(
            "All recommended models present: %s (available: %s)",
            present,
            available,
        )


async def check_chromadb() -> str:
    """Verify ChromaDB is writable by doing a dummy write + read + cleanup.

    Returns "ok" or "error". Never raises.
    """
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        client = vs.client  # access underlying chromadb PersistentClient

        test_col = client.get_or_create_collection("startup-test")
        test_col.add(
            ids=["startup_probe"],
            documents=["startup validation probe"],
        )
        results = test_col.get(ids=["startup_probe"])
        if not results or not results.get("ids"):
            raise RuntimeError("ChromaDB read-back returned empty result")
        client.delete_collection("startup-test")
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


async def _check_embedding_dim(
    ollama_url: str, model: str, result: Dict[str, Any]
) -> None:
    """Probe the embedding dimension and check Chroma collection compatibility."""
    detected_dim = None
    # Try both endpoint variants for Ollama compatibility
    for ep_path in ("/api/embed", "/api/embeddings"):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Cap context to model training limit (nomic-embed-text: 2048)
                embed_ctx = 2048 if "nomic" in model.lower() else 2048
                resp = await client.post(
                    f"{ollama_url}{ep_path}",
                    json={
                        "model": model,
                        "input": "startup dim probe",
                        "options": {"num_ctx": embed_ctx},
                    },
                )
                if resp.status_code == 404:
                    continue
                resp.raise_for_status()
                data = resp.json()
                emb = data.get("embeddings", [None])[0] or data.get("embedding")
                if not emb:
                    continue
                detected_dim = len(emb)
                break
        except Exception as exc:
            logger.debug("Embedding dim probe on %s failed: %s", ep_path, exc)
            continue

    if detected_dim is None:
        logger.warning("Could not probe embedding dim on any endpoint")
        result["embedding_dim"] = "unknown"
        result["chroma_collection_match"] = "unknown"
        return

    result["embedding_dim"] = detected_dim

    # Compare against the stored Chroma collection dim (if any)
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        col_meta = vs.collection.metadata or {}
        stored_dim = col_meta.get("embedding_dim")
        if stored_dim is None:
            # Legacy collection: no dim metadata – assume match until mismatch at runtime
            chroma_match = "YES (no dim stored)"
        elif int(stored_dim) == detected_dim:
            chroma_match = "YES"
        else:
            chroma_match = f"NO (stored={stored_dim}, detected={detected_dim})"
            logger.warning(
                "Embedding dim mismatch at startup: Chroma has %s, model produces %d. "
                "Auto-rebuilding KB collection now.",
                stored_dim,
                detected_dim,
            )
            # Auto-rebuild: drop and recreate collection with correct dimension
            try:
                col_name = vs.COLLECTION_NAME
                import asyncio

                await asyncio.to_thread(vs.client.delete_collection, col_name)
                vs.collection = await asyncio.to_thread(
                    vs.client.get_or_create_collection,
                    col_name,
                    metadata={
                        "hnsw:space": "cosine",
                        "embedding_dim": detected_dim,
                    },
                )
                logger.warning(
                    "KB collection '%s' auto-rebuilt at startup: "
                    "old_dim=%s → new_dim=%d",
                    col_name,
                    stored_dim,
                    detected_dim,
                )
                result["kb_auto_rebuilt"] = True
                result["kb_old_dim"] = int(stored_dim)
                result["kb_new_dim"] = detected_dim
                chroma_match = f"REBUILT ({stored_dim} → {detected_dim})"
            except Exception as rebuild_exc:
                logger.error(
                    "Auto-rebuild of KB collection failed: %s", rebuild_exc
                )
                result["kb_auto_rebuild_error"] = str(rebuild_exc)
    except Exception as exc:
        logger.warning("Could not check Chroma collection dim: %s", exc)
        chroma_match = "unknown"

    result["chroma_collection_match"] = chroma_match
    logger.info(
        "Embedding model OK, dim: %d, Chroma collection match: %s",
        detected_dim,
        chroma_match,
    )


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
    logger.info(
        "startup_check", extra={"check": "ollama_connectivity", "url": ollama_url}
    )
    available_models = await check_ollama(ollama_url)

    if available_models:
        validate_models(available_models)
        result["ollama"] = "ok"
        result["ollama_models"] = available_models

        # Warn about abliterated/uncensored models
        from app.utils.constants import ABLITERATED_MODEL_TAGS, BLOCKED_MODEL_NAMES

        abliterated_models = [
            m
            for m in available_models
            if any(tag in m.lower() for tag in ABLITERATED_MODEL_TAGS)
            or any(m.lower().startswith(b) for b in BLOCKED_MODEL_NAMES)
        ]
        if abliterated_models:
            logger.warning(
                "Abliterated/uncensored modely nalezeny: %s — tyto modely nebudou "
                "použity jako reasoner/primary model (automaticky přeskočeny na fallback)",
                abliterated_models,
            )
            result["abliterated_models"] = abliterated_models
    else:
        result["ollama"] = "unavailable"
        result["ollama_models"] = []
        logger.warning("Ollama unavailable – LLM features will be degraded")

    # Check embedding model availability and detect dimension
    available_base = {m.split(":")[0] for m in available_models}
    if EMBEDDING_MODEL in available_base:
        result["embeddings"] = "ok"
        active_embed_model = EMBEDDING_MODEL
    elif EMBEDDING_FALLBACK in available_base:
        result["embeddings"] = f"degraded: missing model {EMBEDDING_MODEL}"
        active_embed_model = EMBEDDING_FALLBACK
        logger.warning(
            "KB nefunkční: spusť `ollama pull %s` a restartuj app. "
            "Using fallback model '%s'.",
            EMBEDDING_MODEL,
            EMBEDDING_FALLBACK,
        )
    elif available_models:
        result["embeddings"] = "unavailable"
        active_embed_model = None
        logger.error(
            "KB nefunkční: spusť `ollama pull %s` a restartuj app",
            EMBEDDING_MODEL,
        )
    else:
        result["embeddings"] = "unavailable"
        active_embed_model = None

    # Probe embedding dimension and verify Chroma collection compatibility
    if active_embed_model:
        await _check_embedding_dim(ollama_url, active_embed_model, result)

    # Run embeddings service health check to resolve endpoint and detect dim
    try:
        from app.services.embeddings_service import get_embeddings_service

        emb_svc = get_embeddings_service()
        emb_ok = await emb_svc.check_health()
        if not emb_ok:
            result["embeddings"] = "unavailable"
            logger.warning("Embeddings service disabled after health check")
    except Exception as exc:
        logger.warning("Embeddings health check failed: %s", exc)

    # 1b. Ollama performance hints (KROK 3.1)
    perf_hints: List[str] = []
    if not os.environ.get("OLLAMA_FLASH_ATTENTION"):
        perf_hints.append("OLLAMA_FLASH_ATTENTION not set")
    if not os.environ.get("OLLAMA_KEEP_ALIVE"):
        perf_hints.append("OLLAMA_KEEP_ALIVE not set")
    if perf_hints:
        logger.warning(
            "Ollama performance tip: set OLLAMA_FLASH_ATTENTION=1 and "
            "OLLAMA_KEEP_ALIVE=30m for better performance"
        )
    result["ollama_perf_hints"] = perf_hints

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
