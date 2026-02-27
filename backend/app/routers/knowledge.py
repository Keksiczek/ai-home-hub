"""Knowledge base router – external storage scan."""
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/knowledge/scan", tags=["knowledge"])
async def scan_external_storage(
    paths: Optional[List[str]] = None,
    recursive: bool = True,
) -> Dict[str, Any]:
    """
    Scan external storage paths for files.

    Args:
        paths: Optional list of paths to scan. If None, uses configured paths.
        recursive: Whether to scan subdirectories.

    Returns:
        {discovered_files: [...], total_count: N, errors: [...]}
    """
    settings = get_settings_service().load()
    kb_config = settings.get("knowledge_base", {})

    scan_paths = paths if paths else kb_config.get("external_paths", [])
    if not scan_paths:
        raise HTTPException(
            status_code=400,
            detail="No external paths configured. Add paths in Settings → Knowledge Base.",
        )

    allowed_exts = set(kb_config.get("allowed_extensions", []))
    discovered: List[Dict[str, Any]] = []
    errors: List[str] = []

    for path_str in scan_paths:
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
                    discovered.append({
                        "path": str(file),
                        "name": file.name,
                        "size_bytes": file.stat().st_size,
                        "extension": file.suffix.lower(),
                        "modified": file.stat().st_mtime,
                    })
        except Exception as exc:
            errors.append(f"Scan error in {path_str}: {exc}")
            logger.error("Scan error: %s", exc)

    return {
        "discovered_files": discovered,
        "total_count": len(discovered),
        "errors": errors,
        "scanned_paths": scan_paths,
    }


@router.get("/knowledge/config", tags=["knowledge"])
async def get_knowledge_config() -> Dict[str, Any]:
    """Get current knowledge base configuration."""
    settings = get_settings_service().load()
    return settings.get("knowledge_base", {})
