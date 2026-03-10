import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.models.schemas import UploadResponse

router = APIRouter()

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
UPLOAD_DIR = DATA_DIR / "uploads"


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile) -> UploadResponse:
    """Upload a file to the hub and return its assigned id and original filename."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    original_name = file.filename or "unnamed"
    dest = UPLOAD_DIR / f"{file_id}__{original_name}"

    contents = await file.read()
    dest.write_bytes(contents)

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
