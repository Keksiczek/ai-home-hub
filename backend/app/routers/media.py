"""Media router – upload and list audio/video files for transcription."""
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, UploadFile

from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)
router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
MEDIA_DIR = DATA_DIR / "uploads" / "media"

ALLOWED_EXTENSIONS = {".mp3", ".mp4", ".wav", ".m4a", ".ogg", ".webm", ".mov"}


def _sanitize_filename(name: str) -> str:
    """Sanitize filename: keep only safe characters."""
    name = re.sub(r'[^\w\s\-.]', '', name)
    name = re.sub(r'\s+', '_', name)
    return name or "unnamed"


@router.post("/media/upload", tags=["media"])
async def upload_media(file: UploadFile) -> Dict[str, Any]:
    """Upload a media file for transcription."""
    original_name = file.filename or "unnamed"
    suffix = Path(original_name).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {suffix}. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Check max upload size
    settings = get_settings_service().load()
    max_mb = settings.get("media_settings", {}).get("max_upload_mb", 500)

    MEDIA_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = _sanitize_filename(original_name)
    dest = MEDIA_DIR / safe_name

    # Avoid overwriting existing files
    if dest.exists():
        stem = dest.stem
        for i in range(1, 1000):
            dest = MEDIA_DIR / f"{stem}_{i}{suffix}"
            if not dest.exists():
                break

    # Read and check size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)

    if size_mb > max_mb:
        raise HTTPException(
            status_code=413,
            detail=f"File too large: {size_mb:.1f} MB (max {max_mb} MB)",
        )

    dest.write_bytes(contents)

    rel_path = str(dest.relative_to(DATA_DIR))
    logger.info("Media uploaded: %s (%.1f MB)", rel_path, size_mb)

    return {
        "file_path": rel_path,
        "filename": safe_name,
        "size_mb": round(size_mb, 2),
        "format": suffix.lstrip("."),
        "duration_hint": None,
    }


@router.get("/media/files", tags=["media"])
async def list_media_files() -> List[Dict[str, Any]]:
    """List all uploaded media files."""
    if not MEDIA_DIR.exists():
        return []

    files = []
    for f in sorted(MEDIA_DIR.iterdir()):
        if f.is_file() and f.suffix.lower() in ALLOWED_EXTENSIONS:
            stat = f.stat()
            files.append({
                "file_path": str(f.relative_to(DATA_DIR)),
                "filename": f.name,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "format": f.suffix.lower().lstrip("."),
                "created_at": datetime.fromtimestamp(stat.st_ctime, tz=timezone.utc).isoformat(),
            })

    return files
