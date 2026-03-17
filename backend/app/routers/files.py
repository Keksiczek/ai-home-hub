import logging
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse

from app.models.schemas import UploadResponse
from app.services.metrics_service import upload_bytes_total, upload_files_total

logger = logging.getLogger(__name__)
router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
UPLOAD_DIR = DATA_DIR / "uploads"

# Max file size for preview (1 MB)
_MAX_PREVIEW_BYTES = 1 * 1024 * 1024

# Image extensions for thumbnail previews
_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile) -> UploadResponse:
    """Upload a file to the hub and return its assigned id and original filename."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    original_name = file.filename or "unnamed"
    dest = UPLOAD_DIR / f"{file_id}__{original_name}"

    contents = await file.read()
    dest.write_bytes(contents)

    upload_files_total.labels(type="document").inc()
    upload_bytes_total.labels(type="document").inc(len(contents))

    return UploadResponse(id=file_id, filename=original_name)


@router.get("/files/artifact", tags=["files"])
async def get_artifact(path: str):
    """Serve an artifact file from the data/ directory."""
    # Security: resolve and ensure it stays within data/
    resolved = (DATA_DIR / path).resolve()
    if not str(resolved).startswith(str(DATA_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Access denied")
    if not resolved.exists() or not resolved.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    # Determine media type
    suffix = resolved.suffix.lower()
    media_types = {
        ".html": "text/html",
        ".pdf": "application/pdf",
        ".json": "application/json",
        ".txt": "text/plain; charset=utf-8",
        ".md": "text/plain; charset=utf-8",
    }
    media_type = media_types.get(suffix, "application/octet-stream")

    return FileResponse(str(resolved), media_type=media_type)


# ── File Manager endpoints ──────────────────────────────────


def _build_tree_entry(p: Path) -> Dict[str, Any]:
    """Build a single file/directory entry for the tree response."""
    stat = p.stat()
    return {
        "name": p.name,
        "path": str(p),
        "is_dir": p.is_dir(),
        "size": stat.st_size if p.is_file() else 0,
        "modified": stat.st_mtime,
        "extension": p.suffix.lower() if p.is_file() else "",
        "is_image": p.suffix.lower() in _IMAGE_EXTENSIONS if p.is_file() else False,
    }


@router.get("/files/tree", tags=["files"])
async def file_tree(
    path: str = Query(..., description="Root directory path"),
    max_depth: int = Query(default=3, ge=1, le=10),
) -> Dict[str, Any]:
    """Return a recursive directory tree for the file manager UI.

    Security: delegates path validation to the filesystem service whitelist.
    """
    from app.services.filesystem_service import get_filesystem_service

    fs_svc = get_filesystem_service()

    # Validate path is within allowed directories
    try:
        resolved = fs_svc._assert_allowed(path)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    if not resolved.exists():
        raise HTTPException(status_code=404, detail=f"Path not found: {path}")
    if not resolved.is_dir():
        raise HTTPException(status_code=400, detail=f"Not a directory: {path}")

    def _walk(dir_path: Path, depth: int) -> List[Dict[str, Any]]:
        if depth > max_depth:
            return []
        entries = []
        try:
            for child in sorted(dir_path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                if child.name.startswith("."):
                    continue
                entry = _build_tree_entry(child)
                if child.is_dir() and depth < max_depth:
                    entry["children"] = _walk(child, depth + 1)
                entries.append(entry)
        except PermissionError:
            pass
        return entries

    children = _walk(resolved, 1)
    return {
        "path": str(resolved),
        "entries": children,
        "count": len(children),
    }


@router.get("/files/preview", tags=["files"])
async def file_preview(
    path: str = Query(..., description="Absolute file path"),
    max_size: int = Query(default=_MAX_PREVIEW_BYTES, le=5 * 1024 * 1024),
) -> Dict[str, Any]:
    """Preview a file's content (text files) or metadata (binary files).

    Returns up to max_size bytes for text files. For images, returns
    metadata and a flag indicating the file can be served via /files/artifact.
    """
    from app.services.filesystem_service import get_filesystem_service

    fs_svc = get_filesystem_service()
    try:
        resolved = fs_svc._assert_allowed(path)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    if not resolved.exists() or not resolved.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    stat = resolved.stat()
    ext = resolved.suffix.lower()

    result: Dict[str, Any] = {
        "path": str(resolved),
        "name": resolved.name,
        "size": stat.st_size,
        "extension": ext,
        "modified": stat.st_mtime,
    }

    # Images – return metadata, frontend can display via direct URL
    if ext in _IMAGE_EXTENSIONS:
        result["type"] = "image"
        result["preview_available"] = True
        return result

    # Text files – return content preview
    text_extensions = {
        ".txt", ".md", ".py", ".js", ".ts", ".json", ".yaml", ".yml",
        ".csv", ".html", ".css", ".xml", ".sh", ".bash", ".toml", ".ini",
        ".cfg", ".log", ".env.example", ".gitignore", ".dockerfile",
    }
    if ext in text_extensions or stat.st_size < max_size:
        try:
            content = resolved.read_text(encoding="utf-8", errors="replace")
            if len(content) > max_size:
                content = content[:max_size] + "\n... (truncated)"
            result["type"] = "text"
            result["content"] = content
            return result
        except Exception:
            pass

    result["type"] = "binary"
    result["preview_available"] = False
    return result


@router.post("/files/upload-to-kb", tags=["files"])
async def upload_file_to_kb(
    path: str = Query(..., description="Absolute file path to index into KB"),
) -> Dict[str, Any]:
    """Index an existing file into the Knowledge Base.

    The file must be within allowed directories. It is copied to the KB
    upload directory and then processed by the KB ingest pipeline.
    """
    import shutil

    from app.services.filesystem_service import get_filesystem_service

    fs_svc = get_filesystem_service()
    try:
        resolved = fs_svc._assert_allowed(path)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    if not resolved.exists() or not resolved.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    # Copy to KB uploads and trigger ingest
    kb_upload_dir = DATA_DIR / "uploads"
    kb_upload_dir.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    dest = kb_upload_dir / f"{file_id}__{resolved.name}"
    shutil.copy2(str(resolved), str(dest))

    # Enqueue KB reindex job
    from app.services.job_service import get_job_service

    job_svc = get_job_service()
    job = job_svc.create_job(
        type="kb_reindex",
        title=f"Index file: {resolved.name}",
        payload={"file_path": str(dest), "source_path": str(resolved)},
        priority="high",
    )

    return {
        "status": "queued",
        "file": resolved.name,
        "job_id": job.id,
        "message": f"File '{resolved.name}' queued for KB indexing",
    }


@router.post("/files/action", tags=["files"])
async def file_action(
    type: str = Query(..., description="Action type: delete, open_vscode"),
    path: str = Query(..., description="Absolute file path"),
) -> Dict[str, Any]:
    """Perform an action on a file (delete, open in VSCode)."""
    from app.services.filesystem_service import get_filesystem_service

    fs_svc = get_filesystem_service()

    try:
        resolved = fs_svc._assert_allowed(path)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    if type == "delete":
        if not resolved.exists():
            raise HTTPException(status_code=404, detail="File not found")
        if resolved.is_dir():
            raise HTTPException(status_code=400, detail="Cannot delete directories via this endpoint")
        resolved.unlink()
        return {"status": "deleted", "path": str(resolved)}

    elif type == "open_vscode":
        from app.services.vscode_service import get_vscode_service

        vscode_svc = get_vscode_service()
        result = await vscode_svc.open_file(str(resolved))
        return {"status": "opened", "path": str(resolved), "detail": result}

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action type: {type}")
