"""Document Analysis router – create analysis jobs and list available files."""

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

from app.models.document_analysis_models import DocumentAnalysisInput
from app.services.job_service import get_job_service
from app.services.settings_service import get_settings_service

logger = logging.getLogger(__name__)
router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
UPLOADS_DIR = DATA_DIR / "uploads"

# File types supported by document analysis
DOC_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".txt", ".md"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp"}
ALL_SUPPORTED = DOC_EXTENSIONS | IMAGE_EXTENSIONS


@router.post("/jobs", tags=["document-analysis"])
async def create_analysis_job(input_data: DocumentAnalysisInput) -> Dict[str, Any]:
    """Create a new document analysis job."""
    title = input_data.task_description[:60].strip()
    if len(input_data.task_description) > 60:
        title += "..."

    svc = get_job_service()
    job = svc.create_job(
        type="document_analysis",
        title=title,
        input_summary=input_data.task_description,
        payload=input_data.model_dump(),
        priority="normal",
    )

    logger.info(
        "Document analysis job created: %s (%d files)",
        job.id,
        len(input_data.file_paths),
    )

    return {
        "job_id": job.id,
        "status": job.status,
        "title": job.title,
        "estimated_files": len(input_data.file_paths),
    }


@router.get("/available-files", tags=["document-analysis"])
async def get_available_files() -> Dict[str, Any]:
    """List files available for document analysis from uploads and KB."""

    # 1. Scan uploads directory
    uploads = []
    if UPLOADS_DIR.exists():
        for f in _walk_files(UPLOADS_DIR):
            if f.suffix.lower() in ALL_SUPPORTED:
                stat = f.stat()
                uploads.append(
                    {
                        "file_path": str(f.relative_to(DATA_DIR)),
                        "filename": f.name,
                        "size_mb": round(stat.st_size / (1024 * 1024), 2),
                        "type": f.suffix.lower().lstrip("."),
                    }
                )

    # 2. Get KB indexed documents
    kb_documents = []
    try:
        from app.services.vector_store_service import get_vector_store_service

        vs = get_vector_store_service()
        collection = vs.collection
        if collection:
            # Get unique source files from the collection metadata
            result = collection.get(include=["metadatas"])
            seen_paths = set()
            for meta in result.get("metadatas") or []:
                if not meta:
                    continue
                source = meta.get("source") or meta.get("file_path", "")
                if source and source not in seen_paths:
                    seen_paths.add(source)
                    kb_documents.append(
                        {
                            "file_path": source,
                            "filename": Path(source).name,
                            "type": Path(source).suffix.lower().lstrip("."),
                            "indexed_at": meta.get("indexed_at", ""),
                        }
                    )
    except Exception as exc:
        logger.warning("Failed to query KB for available files: %s", exc)

    return {
        "uploads": uploads,
        "kb_documents": kb_documents,
    }


def _walk_files(directory: Path) -> List[Path]:
    """Recursively walk a directory and return all files."""
    files = []
    try:
        for item in directory.iterdir():
            if item.is_file():
                files.append(item)
            elif item.is_dir() and not item.name.startswith("."):
                files.extend(_walk_files(item))
    except PermissionError:
        pass
    return files
