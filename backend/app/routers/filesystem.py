"""Filesystem router – secure file and directory operations."""
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Path, Query

from app.models.schemas import SearchRequest, WriteFileRequest
from app.services.filesystem_service import get_filesystem_service

router = APIRouter()


@router.get("/filesystem/config", tags=["filesystem"])
async def get_filesystem_config() -> Dict[str, Any]:
    """Return current filesystem security configuration."""
    svc = get_filesystem_service()
    return svc.get_config()


@router.get("/filesystem/read", tags=["filesystem"])
async def read_file(path: str = Query(..., description="Absolute file path")) -> Dict[str, Any]:
    """Read a text file. Path must be within an allowed directory."""
    svc = get_filesystem_service()
    try:
        content = await svc.read_file(path)
        return {"path": path, "content": content, "length": len(content)}
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/filesystem/list", tags=["filesystem"])
async def list_directory(path: str = Query(..., description="Absolute directory path")) -> Dict[str, Any]:
    """List directory contents. Path must be within an allowed directory."""
    svc = get_filesystem_service()
    try:
        entries = await svc.list_directory(path)
        return {"path": path, "entries": entries, "count": len(entries)}
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/filesystem/write", tags=["filesystem"])
async def write_file(
    path: str = Query(..., description="Absolute file path"),
    body: WriteFileRequest = ...,
) -> Dict[str, Any]:
    """Write content to a file. Path must be within an allowed directory."""
    svc = get_filesystem_service()
    try:
        result = await svc.write_file(path, body.content, body.encoding)
        return {"status": "ok", "detail": result}
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/filesystem/delete", tags=["filesystem"])
async def delete_file(path: str = Query(..., description="Absolute file path")) -> Dict[str, Any]:
    """Delete a file. Path must be within an allowed directory."""
    svc = get_filesystem_service()
    try:
        result = await svc.delete_file(path)
        return {"status": "ok", "detail": result}
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except (FileNotFoundError, IsADirectoryError) as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/filesystem/search", tags=["filesystem"])
async def search_files(body: SearchRequest) -> Dict[str, Any]:
    """Search file contents using ripgrep or Python fallback."""
    svc = get_filesystem_service()
    try:
        results = await svc.search_content(body.path, body.pattern, body.file_pattern)
        return {"results": results, "count": len(results)}
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/filesystem/mkdir", tags=["filesystem"])
async def create_directory(path: str = Query(..., description="Absolute directory path")) -> Dict[str, Any]:
    """Create a directory (and parents). Path must be within an allowed directory."""
    svc = get_filesystem_service()
    try:
        result = await svc.create_directory(path)
        return {"status": "ok", "detail": result}
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
