import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile

from app.models.schemas import UploadResponse

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "data" / "uploads"


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
