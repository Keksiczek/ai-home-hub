"""Knowledge Base retention service – clean up old/oversized indexed data."""
import logging
import time
from pathlib import Path
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


async def run_kb_retention() -> Dict[str, Any]:
    """Run retention cleanup: remove files older than retention_days, then by size.

    Returns summary of what was cleaned up.
    """
    from app.services.settings_service import get_settings_service
    from app.services.vector_store_service import get_vector_store_service

    settings = get_settings_service().load()
    kb_cfg = settings.get("knowledge_base", {})
    retention_days = kb_cfg.get("retention_days", 30)
    max_size_gb = kb_cfg.get("max_size_gb", 10)

    vector_store = get_vector_store_service()
    now = time.time()
    cutoff = now - (retention_days * 86400)

    deleted_old = 0
    deleted_size = 0
    errors: List[str] = []

    try:
        # 1. Get all file metadata
        import asyncio
        raw = await asyncio.to_thread(
            vector_store.collection.get,
            limit=50_000,
            include=["metadatas"],
        )
        metadatas = raw.get("metadatas") or []
        ids = raw.get("ids") or []

        # Group by file_path
        file_chunks: Dict[str, Dict[str, Any]] = {}
        for chunk_id, meta in zip(ids, metadatas):
            fp = meta.get("file_path", "")
            if not fp:
                continue
            if fp not in file_chunks:
                file_chunks[fp] = {"mtime": meta.get("mtime", 0), "chunk_ids": [], "chunks": 0}
            file_chunks[fp]["chunk_ids"].append(chunk_id)
            file_chunks[fp]["chunks"] += 1

        # 2. Delete files older than retention_days
        old_files = [fp for fp, info in file_chunks.items()
                     if info["mtime"] and float(info["mtime"]) < cutoff]

        for fp in old_files:
            try:
                chunk_ids = file_chunks[fp]["chunk_ids"]
                await vector_store._safe_write(vector_store.collection.delete, ids=chunk_ids)
                deleted_old += 1
                del file_chunks[fp]
                logger.info("Retention: deleted %d chunks for old file %s", len(chunk_ids), fp)
            except Exception as exc:
                errors.append(f"{fp}: {exc}")

        # 3. Check total size and delete least-recently-modified if over limit
        chroma_dir = Path(vector_store.client._persist_directory) if hasattr(vector_store.client, '_persist_directory') else None
        total_size_bytes = 0
        if chroma_dir and chroma_dir.exists():
            total_size_bytes = sum(f.stat().st_size for f in chroma_dir.rglob("*") if f.is_file())

        max_size_bytes = max_size_gb * 1024 * 1024 * 1024

        if total_size_bytes > max_size_bytes and file_chunks:
            # Sort by mtime ascending (oldest first)
            sorted_files = sorted(file_chunks.items(), key=lambda x: float(x[1].get("mtime", 0)))

            for fp, info in sorted_files:
                if total_size_bytes <= max_size_bytes:
                    break
                try:
                    chunk_ids = info["chunk_ids"]
                    estimated_chunk_size = total_size_bytes / max(len(metadatas), 1) * len(chunk_ids)
                    await vector_store._safe_write(vector_store.collection.delete, ids=chunk_ids)
                    deleted_size += 1
                    total_size_bytes -= estimated_chunk_size
                    logger.info("Retention (size): deleted %d chunks for %s", len(chunk_ids), fp)
                except Exception as exc:
                    errors.append(f"{fp}: {exc}")

    except Exception as exc:
        logger.error("Retention job failed: %s", exc)
        errors.append(str(exc))

    return {
        "deleted_old": deleted_old,
        "deleted_size": deleted_size,
        "errors": errors,
        "retention_days": retention_days,
        "max_size_gb": max_size_gb,
    }
