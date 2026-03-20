"""System router – OS-level utilities (screenshot, boost-priority, file picker, etc.)."""
import base64
import os
import platform
import subprocess
import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class PickPathRequest(BaseModel):
    type: str = "folder"  # "file" or "folder"
    extensions: Optional[List[str]] = None  # e.g. ["py", "md"]

# Absolute path to the scripts/ directory (two levels up from this file)
_SCRIPTS_DIR = Path(__file__).parent.parent.parent.parent / "scripts"


@router.post("/system/pick-path", tags=["system"])
async def pick_path(request: PickPathRequest) -> dict:
    """Open a native macOS file/folder picker and return the selected path.

    Falls back to a simple path validation on non-macOS systems.
    """
    if platform.system() != "Darwin":
        raise HTTPException(
            status_code=501,
            detail="Nativní file picker je podporován pouze na macOS",
        )

    if request.type == "folder":
        script = 'choose folder with prompt "Vyber složku"'
    else:
        if request.extensions:
            ext_list = ", ".join(f'"{e}"' for e in request.extensions)
            script = f'choose file with prompt "Vyber soubor" of type {{{ext_list}}}'
        else:
            script = 'choose file with prompt "Vyber soubor"'

    try:
        result = subprocess.run(
            ["osascript", "-e", f"POSIX path of ({script})"],
            capture_output=True,
            text=True,
            timeout=30,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Výběr souboru vypršel (timeout)")

    if result.returncode != 0:
        raise HTTPException(status_code=400, detail="Výběr zrušen nebo selhal")

    path = result.stdout.strip().rstrip("/")
    return {"path": path}


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


def _run_priority_script(script_name: str) -> dict:
    """Helper: run a priority-management shell script and return its output.

    NOTE: renice requires sudo and the effect lasts only until the process
    restarts. vm.swapfilesize is a hint to macOS dynamic_pager, not a hard
    limit – macOS swap is always managed dynamically by the kernel.
    """
    script_path = _SCRIPTS_DIR / script_name
    if not script_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Skript {script_name} nenalezen v scripts/",
        )
    result = subprocess.run(
        ["sudo", "bash", str(script_path)],
        capture_output=True,
        text=True,
        timeout=15,
    )
    return {
        "output": result.stdout,
        "error": result.stderr,
        "returncode": result.returncode,
    }


@router.post("/system/boost", tags=["system"])
async def boost_priority() -> dict:
    """Zvýšit nice prioritu procesů backendu a Ollamy a nastavit swap hint.

    Spouští scripts/boost_priority.sh s sudo.
    Vyžaduje, aby server běžel s oprávněními pro sudo bez hesla
    (nebo sudo bylo povoleno pro daného uživatele).
    """
    return _run_priority_script("boost_priority.sh")


@router.post("/system/reset-boost", tags=["system"])
async def reset_boost_priority() -> dict:
    """Resetovat nice priority procesů a swap hint na výchozí hodnoty.

    Spouští scripts/reset_priority.sh s sudo.
    """
    return _run_priority_script("reset_priority.sh")
