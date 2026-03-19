"""KB Stats caching service – background refresh of knowledge base statistics (4D)."""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from app.services.metrics_service import kb_chunks_total
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
CACHE_FILE = DATA_DIR / "kb_stats_cache.json"

# Default refresh interval in minutes (overridden by settings)
DEFAULT_REFRESH_INTERVAL_MINUTES = 5

# Cache is considered stale after this many seconds
STALE_THRESHOLD_SECONDS = 600  # 10 minutes


def _read_cache() -> Optional[Dict[str, Any]]:
    """Read cached stats from disk, or return None if missing/corrupt."""
    try:
        if CACHE_FILE.exists():
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as exc:
        logger.warning("Failed to read KB stats cache: %s", exc)
    return None


def _write_cache(data: Dict[str, Any]) -> None:
    """Write stats cache to disk."""
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.error("Failed to write KB stats cache: %s", exc, exc_info=True)


def compute_stats() -> Dict[str, Any]:
    """Compute fresh KB stats from VectorStoreService."""
    from app.services.vector_store_service import get_vector_store_service, CHROMA_DIR
    vs = get_vector_store_service()
    stats = vs.get_stats(detailed=True)

    # Calculate storage size
    storage_mb = 0.0
    last_indexed = None
    if CHROMA_DIR.exists():
        total_size = 0
        latest_mtime = 0.0
        for f in CHROMA_DIR.rglob("*"):
            if f.is_file():
                st = f.stat()
                total_size += st.st_size
                if f.suffix in (".bin", ".parquet") and st.st_mtime > latest_mtime:
                    latest_mtime = st.st_mtime
        storage_mb = round(total_size / (1024 * 1024), 1)
        if latest_mtime > 0:
            last_indexed = datetime.fromtimestamp(latest_mtime, tz=timezone.utc).isoformat()

    return {
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "total_documents": stats.get("total_documents", 0),
        "total_chunks": stats.get("total_chunks", 0),
        "storage_size_mb": storage_mb,
        "file_types": stats.get("file_types", {}),
        "top_sources": stats.get("top_sources", []),
        "last_indexed": last_indexed,
    }


def refresh_cache() -> Dict[str, Any]:
    """Compute fresh stats and write to cache. Returns the new cache data."""
    data = compute_stats()
    _write_cache(data)
    logger.info("KB stats cache refreshed: %d chunks", data["total_chunks"])
    # Update Prometheus metric for default collection
    kb_chunks_total.labels(collection="knowledge_base").set(data["total_chunks"])
    return data


def get_cached_stats() -> Dict[str, Any]:
    """Read stats from cache. If stale or missing, triggers async refresh.

    Returns the cached data with added ``cache_age_seconds`` and ``cache_stale`` fields.
    """
    cached = _read_cache()
    now = time.time()

    if cached is None:
        # No cache – compute synchronously
        cached = refresh_cache()

    # Compute age
    try:
        computed_at = datetime.fromisoformat(cached["computed_at"])
        age_seconds = int(now - computed_at.timestamp())
    except (KeyError, ValueError):
        age_seconds = STALE_THRESHOLD_SECONDS + 1

    stale = age_seconds > STALE_THRESHOLD_SECONDS

    # If stale, schedule a background refresh
    if stale:
        try:
            loop = asyncio.get_running_loop()
            loop.call_soon(lambda: asyncio.ensure_future(_async_refresh()))
        except RuntimeError:
            pass

    cached["cache_age_seconds"] = age_seconds
    cached["cache_stale"] = stale
    return cached


async def _async_refresh() -> None:
    """Async wrapper to run refresh in background."""
    try:
        await asyncio.get_event_loop().run_in_executor(None, refresh_cache)
    except Exception as exc:
        logger.error("Background KB stats refresh failed: %s", exc, exc_info=True)


async def start_kb_stats_refresh_loop() -> None:
    """Background loop that periodically refreshes KB stats cache.

    Reads ``kb_stats_refresh_interval_minutes`` from settings.json.
    """
    try:
        settings = get_settings_service().load()
        interval_min = settings.get("kb_stats_refresh_interval_minutes", DEFAULT_REFRESH_INTERVAL_MINUTES)
        interval_sec = max(60, interval_min * 60)

        logger.info("KB stats refresh loop started (interval: %d min)", interval_min)

        while True:
            try:
                await asyncio.get_event_loop().run_in_executor(None, refresh_cache)
            except Exception as exc:
                logger.error("KB stats refresh error: %s", exc, exc_info=True)
            await asyncio.sleep(interval_sec)
    except asyncio.CancelledError:
        logger.info("KB stats refresh loop cancelled")
