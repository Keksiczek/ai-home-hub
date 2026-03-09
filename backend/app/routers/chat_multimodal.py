"""Multimodal chat router – LLM chat with base64-encoded image attachments."""
import logging
from typing import Any, Dict, List

import httpx
from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatResponse, MultimodalChatRequest, MultimodalImageData
from app.services.llm_service import get_llm_service
from app.services.session_service import get_session_service
from app.services.settings_service import get_settings_service
from app.utils.constants import (
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_SIZE_BYTES,
    MAX_IMAGES_PER_MESSAGE,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _validate_images(images: list) -> None:
    """Raise HTTPException(400) if any image violates the configured limits."""
    if len(images) > MAX_IMAGES_PER_MESSAGE:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Too many images: {len(images)} provided, "
                f"maximum is {MAX_IMAGES_PER_MESSAGE}."
            ),
        )
    for img in images:
        if img.media_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image type '{img.media_type}'. "
                    f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}."
                ),
            )
        # base64 encodes 3 bytes as 4 chars; approximate raw size
        approx_bytes = len(img.data) * 3 // 4
        if approx_bytes > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Image exceeds maximum size of "
                    f"{MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MiB."
                ),
            )


async def _call_ollama_generate(
    message: str,
    images: List[MultimodalImageData],
    cfg: Dict[str, Any],
) -> tuple:
    """Call Ollama /api/generate with base64 image data for vision models."""
    ollama_url = cfg.get("ollama_url", "http://localhost:11434").rstrip("/")
    model = cfg.get("model", "llava")
    timeout = float(cfg.get("timeout_seconds", 180))

    payload = {
        "model": model,
        "prompt": message,
        "images": [img.data for img in images],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(f"{ollama_url}/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", ""), {"provider": "ollama", "model": model}
    except httpx.ConnectError:
        logger.warning("Ollama not available for vision, falling back to stub")
        return f"[Stub] {message}", {
            "provider": "stub",
            "model": "stub",
            "fallback_reason": "Ollama not reachable",
        }
    except Exception as exc:
        logger.error("Ollama generate error: %s", exc)
        return f"[Error: {exc}]", {"provider": "error", "model": model, "error": str(exc)}


@router.post("/chat/multimodal", response_model=ChatResponse, tags=["chat"])
async def multimodal_chat(request: MultimodalChatRequest) -> ChatResponse:
    """
    Send a message with optional image attachments to the LLM.

    Routing:
    - No images  → POST /api/chat  (conversation history preserved)
    - With images → POST /api/generate (Ollama vision model path)

    All images must satisfy MAX_IMAGES_PER_MESSAGE, MAX_IMAGE_SIZE_BYTES,
    and ALLOWED_IMAGE_TYPES; violations return HTTP 400.
    """
    _validate_images(request.images)

    session_svc = get_session_service()
    session_id = request.session_id
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    if request.images:
        cfg = get_settings_service().get_llm_config()
        reply, meta = await _call_ollama_generate(request.message, request.images, cfg)
    else:
        history = session_svc.get_history_for_llm(session_id, limit=20)
        reply, meta = await get_llm_service().generate(
            message=request.message,
            mode=request.mode,
            history=history,
        )

    meta["images_count"] = len(request.images)
    session_svc.save_message(session_id, "user", request.message)
    session_svc.save_message(session_id, "assistant", reply, meta)

    meta["session_id"] = session_id
    return ChatResponse(reply=reply, meta=meta, session_id=session_id)
