"""System router – OS-level utilities (screenshot, etc.)."""
import base64
import os
import platform
import subprocess
import tempfile

from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/system/screenshot", tags=["system"])
async def take_screenshot() -> dict:
    """Capture a screenshot via macOS screencapture.

    Returns base64-encoded PNG. Only supported on macOS (Darwin).
    """
    if platform.system() != "Darwin":
        raise HTTPException(
            status_code=501,
            detail="Screenshot přes backend je podporován pouze na macOS",
        )

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        path = f.name
    try:
        subprocess.run(
            ["screencapture", "-x", "-t", "png", path],
            check=True,
            timeout=10,
        )
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode()
        return {"image": data, "mime": "image/png"}
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=500, detail=f"screencapture selhal: {exc}")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="screencapture timeout")
    finally:
        if os.path.exists(path):
            os.unlink(path)
