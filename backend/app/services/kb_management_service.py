"""KB Management Service – stats, file listing, overview, scan, deletion.

Extracted from routers/knowledge.py to separate management logic from HTTP handlers.
"""

import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.services.settings_service import get_settings_service
from app.services.vector_store_service import get_vector_store_service

logger = logging.getLogger(__name__)


async def scan_external_storage(
    paths: Optional[List[str]] = None,
    recursive: bool = True,
) -> Dict[str, Any]:
    """Scan external storage paths for files.

    Returns {discovered_files, total_count, errors, scanned_paths}.
    """
    settings = get_settings_service().load()
    kb_config = settings.get("knowledge_base", {})

    scan_paths = paths if paths else kb_config.get("external_paths", [])
    if not scan_paths:
        return {
            "discovered_files": [],
            "total_count": 0,
            "errors": [
                "No external paths configured. Add paths in Settings → Knowledge Base."
            ],
            "scanned_paths": [],
        }

    MAX_FILES = 10000

    allowed_exts = set(kb_config.get("allowed_extensions", []))
    discovered: List[Dict[str, Any]] = []
    errors: List[str] = []
    limit_reached = False

    for path_str in scan_paths:
        if limit_reached:
            break

        path = Path(path_str).expanduser()

        if not path.exists():
            errors.append(f"Path not found: {path_str}")
            continue

        if not path.is_dir():
            errors.append(f"Not a directory: {path_str}")
            continue

        try:
            pattern = "**/*" if recursive else "*"
            for file in path.glob(pattern):
                if file.is_file() and file.suffix.lower() in allowed_exts:
                    if len(discovered) >= MAX_FILES:
                        errors.append(
                            f"Limit reached: stopped at {MAX_FILES} files in {path_str}. "
                            "Consider narrowing external paths or use batch scan (coming soon)."
                        )
                        limit_reached = True
                        break
                    discovered.append(
                        {
                            "path": str(file),
                            "name": file.name,
                            "size_bytes": file.stat().st_size,
                            "extension": file.suffix.lower(),
                            "modified": file.stat().st_mtime,
                        }
                    )
        except Exception as exc:
            errors.append(f"Scan error in {path_str}: {exc}")
            logger.error("Scan error: %s", exc)

    return {
        "discovered_files": discovered,
        "total_count": len(discovered),
        "errors": errors,
        "scanned_paths": scan_paths,
        "warning": f"Results limited to {MAX_FILES:,} files" if limit_reached else None,
    }


async def get_kb_stats() -> Dict[str, Any]:
    """Quick KB stats: total chunks, collections, last updated."""
    vector_store = get_vector_store_service()
    stats = vector_store.get_stats(detailed=True)
    collections = await vector_store.list_collections()

    return {
        "chunks": stats.get("total_chunks", 0),
        "documents": stats.get("total_documents", 0),
        "collections": len(collections),
        "collection_names": [c["name"] for c in collections],
        "file_types": stats.get("file_types", {}),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


async def list_kb_files(
    collection: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List indexed files with metadata, preview, and chunk counts."""
    from app.services.file_parser_service import FileParserService

    vector_store = get_vector_store_service()

    where_filter = {"collection": collection} if collection else None
    try:
        raw = await asyncio.to_thread(
            vector_store.collection.get,
            limit=50_000,
            include=["metadatas", "documents"],
            where=where_filter,
        )
    except Exception as exc:
        logger.warning("Failed to list KB files: %s", exc)
        return {"files": [], "total": 0}

    metadatas = raw.get("metadatas") or []
    documents = raw.get("documents") or []

    file_map: Dict[str, Dict[str, Any]] = {}
    for idx, meta in enumerate(metadatas):
        fp = meta.get("file_path", "")
        if not fp:
            continue
        if fp not in file_map:
            ext = Path(fp).suffix.lower()
            file_map[fp] = {
                "id": fp,
                "file_path": fp,
                "file_name": meta.get("file_name", Path(fp).name),
                "collection": meta.get("collection", "default"),
                "chunk_count": 0,
                "page_count": meta.get("page_count", 1),
                "media_type": FileParserService.MEDIA_TYPES.get(ext, "text"),
                "filetype": FileParserService.MIME_TYPES.get(
                    ext, "application/octet-stream"
                ),
                "mtime": meta.get("mtime"),
                "preview": "",
                "size_bytes": 0,
            }
            try:
                file_map[fp]["size_bytes"] = Path(fp).stat().st_size
            except OSError:
                pass
        file_map[fp]["chunk_count"] += 1
        if not file_map[fp]["preview"] and idx < len(documents):
            file_map[fp]["preview"] = (documents[idx] or "")[:500]

    all_files = sorted(
        file_map.values(), key=lambda f: f.get("mtime") or 0, reverse=True
    )
    total = len(all_files)
    paginated = all_files[offset : offset + limit]

    return {"files": paginated, "total": total}


async def kb_overview() -> Dict[str, Any]:
    """Return a structured overview of the Knowledge Base."""
    from app.services.kb_stats_cache import get_cached_stats

    stats = get_cached_stats()
    vector_store = get_vector_store_service()
    collections: Dict[str, Dict[str, Any]] = {}

    try:
        raw = await asyncio.to_thread(
            vector_store.collection.get,
            limit=50_000,
            include=["metadatas"],
        )
        metadatas: List[Dict[str, Any]] = raw.get("metadatas") or []

        for meta in metadatas:
            coll_name = str(meta.get("collection") or "default")
            file_path = meta.get("file_path", "")
            ext = Path(file_path).suffix.lower() if file_path else "unknown"

            if coll_name not in collections:
                collections[coll_name] = {
                    "name": coll_name,
                    "files": set(),
                    "chunk_count": 0,
                    "file_types": {},
                }
            c = collections[coll_name]
            c["chunk_count"] += 1
            c["files"].add(file_path)
            c["file_types"][ext] = c["file_types"].get(ext, 0) + 1

    except Exception as exc:
        logger.warning("Overview metadata scan failed: %s", exc)

    coll_list = [
        {
            "name": c["name"],
            "document_count": len(c["files"]),
            "chunk_count": c["chunk_count"],
            "file_types": c["file_types"],
        }
        for c in sorted(collections.values(), key=lambda x: x["name"])
    ]

    return {
        "total_documents": stats.get("total_documents", 0),
        "total_chunks": stats.get("total_chunks", 0),
        "storage_size_mb": stats.get("storage_size_mb", 0.0),
        "last_indexed": stats.get("last_indexed"),
        "cache_age_seconds": stats.get("cache_age_seconds"),
        "collections": coll_list,
    }
