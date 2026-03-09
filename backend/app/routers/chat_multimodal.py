"""Multimodal chat router – LLM chat with image support via vision models."""
import base64
import logging
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.session_service import get_session_service
from app.services.settings_service import get_settings_service
from app.services.ws_manager import get_ws_manager

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_IMAGES_PER_MESSAGE = 5
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}


class ImageData(BaseModel):
    filename: str
    data: str  # base64-encoded
    mime_type: str


class MultimodalChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    images: List[ImageData] = []
    model: Optional[str] = None  # optional override, default from settings


class MultimodalChatResponse(BaseModel):
    response: str
    model_used: str
    session_id: str
    kb_context_used: bool = False
    images_processed: int = 0


def _validate_images(images: List[ImageData]) -> None:
    """Validate image count, size, and MIME type."""
    if len(images) > MAX_IMAGES_PER_MESSAGE:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_IMAGES_PER_MESSAGE} images per message allowed",
        )
    for img in images:
        if img.mime_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image type: {img.mime_type}. Allowed: {', '.join(ALLOWED_MIME_TYPES)}",
            )
        try:
            decoded = base64.b64decode(img.data)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid base64 data for {img.filename}")
        if len(decoded) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"Image {img.filename} exceeds {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB limit",
            )


@router.post("/chat/multimodal", response_model=MultimodalChatResponse, tags=["chat"])
async def multimodal_chat(request: MultimodalChatRequest) -> MultimodalChatResponse:
    """
    Send a message with optional images to a vision-capable LLM.

    Images are sent as base64-encoded data. The endpoint uses Ollama's
    vision model (e.g., llava) to process both text and images.
    """
    import httpx

    session_svc = get_session_service()
    settings_svc = get_settings_service()
    ws_manager = get_ws_manager()

    # Validate images
    if request.images:
        _validate_images(request.images)

    # Session management
    session_id = request.session_id
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    # Get model configuration
    settings = settings_svc.load()
    llm_config = settings.get("llm", {})
    ollama_url = llm_config.get("ollama_url", "http://localhost:11434").rstrip("/")

    # Use vision model: prefer request override, then vision profile, then default
    if request.model:
        model = request.model
    else:
        vision_profile = settings.get("profiles", {}).get("vision", {})
        model = vision_profile.get("model", "llava:7b")

    # Get KB context if available
    kb_context = ""
    try:
        from app.routers.chat import _get_kb_context
        kb_context = await _get_kb_context(request.message)
    except Exception as exc:
        logger.debug("KB context fetch failed: %s", exc)

    # Build prompt with KB context
    prompt = request.message
    if kb_context:
        prompt = f"{request.message}\n\n# Relevant Context from Knowledge Base:\n{kb_context}"

    # Prepare Ollama request
    if request.images:
        # Use /api/generate with images for vision models
        image_b64_list = [img.data for img in request.images]

        payload = {
            "model": model,
            "prompt": prompt,
            "images": image_b64_list,
            "stream": False,
        }
        endpoint = f"{ollama_url}/api/generate"
    else:
        # No images: use /api/chat for text-only
        system_prompt = settings_svc.get_system_prompt("general")
        history = session_svc.get_history_for_llm(session_id, limit=20)

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
        }
        endpoint = f"{ollama_url}/api/chat"

    # Call Ollama
    timeout = float(llm_config.get("timeout_seconds", 180))
    try:
        async with httpx.AsyncClient(timeout=max(10, min(3600, timeout))) as client:
            resp = await client.post(endpoint, json=payload)
            resp.raise_for_status()
            data = resp.json()

            if request.images:
                reply = data.get("response", "")
            else:
                reply = data.get("message", {}).get("content", "")

    except httpx.ConnectError:
        reply = "[Chyba: Ollama neni dostupna. Spustte 'ollama serve' a zkuste znovu.]"
        model = "error"
    except Exception as exc:
        logger.error("Multimodal chat error: %s", exc)
        reply = f"[Chyba LLM: {exc}]"
        model = "error"

    # Save to session
    meta = {
        "provider": "ollama",
        "model": model,
        "kb_context_used": bool(kb_context),
        "images_count": len(request.images),
        "multimodal": True,
    }
    session_svc.save_message(
        session_id, "user", request.message,
        {"images": [{"filename": img.filename, "mime_type": img.mime_type} for img in request.images]},
    )
    session_svc.save_message(session_id, "assistant", reply, meta)

    # Broadcast via WebSocket
    await ws_manager.broadcast({
        "type": "chat_message",
        "has_images": bool(request.images),
        "session_id": session_id,
    })

    return MultimodalChatResponse(
        response=reply,
        model_used=model,
        session_id=session_id,
        kb_context_used=bool(kb_context),
        images_processed=len(request.images),
    )
