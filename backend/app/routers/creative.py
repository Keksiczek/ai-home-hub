"""Creative Studio router – game, OpenSCAD, and ASCII art generation."""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models.creative import (
    AsciiGenerateRequest,
    AsciiGenerateResponse,
    CreativeGenerateRequest,
    CreativeHistoryDetail,
    CreativeHistoryResponse,
    GameGenerateResponse,
    ScadGenerateResponse,
)
from app.services import creative_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/creative")


@router.post("/game", response_model=GameGenerateResponse)
async def generate_game(req: CreativeGenerateRequest):
    """Generate an HTML5 browser game from a text prompt."""
    try:
        result = await creative_service.generate_game(
            prompt=req.prompt, model=req.model
        )
        return GameGenerateResponse(**result)
    except RuntimeError as exc:
        logger.error("Game generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in game generation")
        raise HTTPException(status_code=500, detail=f"Neočekávaná chyba: {exc}")


@router.post("/scad", response_model=ScadGenerateResponse)
async def generate_scad(req: CreativeGenerateRequest):
    """Generate OpenSCAD code for a 3D object from a text prompt."""
    try:
        result = await creative_service.generate_scad(
            prompt=req.prompt, model=req.model
        )
        return ScadGenerateResponse(**result)
    except RuntimeError as exc:
        logger.error("SCAD generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in SCAD generation")
        raise HTTPException(status_code=500, detail=f"Neočekávaná chyba: {exc}")


@router.post("/ascii", response_model=AsciiGenerateResponse)
async def generate_ascii(req: AsciiGenerateRequest):
    """Generate ASCII art from a text prompt."""
    try:
        result = await creative_service.generate_ascii(
            prompt=req.prompt, model=req.model, width=req.width
        )
        return AsciiGenerateResponse(**result)
    except RuntimeError as exc:
        logger.error("ASCII generation failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in ASCII generation")
        raise HTTPException(status_code=500, detail=f"Neočekávaná chyba: {exc}")


@router.get("/history", response_model=CreativeHistoryResponse)
async def get_history(limit: int = Query(default=20, ge=1, le=100)):
    """Return recent creative generation history."""
    items = await creative_service.list_history(limit=limit)
    return CreativeHistoryResponse(items=items)


@router.get("/history/{item_id}", response_model=CreativeHistoryDetail)
async def get_history_detail(item_id: str):
    """Return full payload of a creative history item."""
    item = await creative_service.get_history_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Položka nenalezena")
    return CreativeHistoryDetail(**item)
