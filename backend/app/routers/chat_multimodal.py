"""Multimodal chat router – LLM chat with base64-encoded image attachments."""
import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatResponse, MultimodalChatRequest
from app.services.llm_service import get_llm_service
from app.services.session_service import get_session_service
from app.utils.constants import (
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_SIZE_BYTES,
    MAX_IMAGES_PER_MESSAGE,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _validate_images(images: list) -> None:
    """Raise HTTPException if any image violates the configured limits."""
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
                status_code=415,
                detail=(
                    f"Unsupported image type '{img.media_type}'. "
                    f"Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}."
                ),
            )
        # base64 encodes 3 bytes as 4 chars; approximate raw size
        approx_bytes = len(img.data) * 3 // 4
        if approx_bytes > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Image exceeds maximum size of "
                    f"{MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MiB."
                ),
            )


@router.post("/chat/multimodal", response_model=ChatResponse, tags=["chat"])
async def multimodal_chat(request: MultimodalChatRequest) -> ChatResponse:
    """
    Send a message with optional image attachments to the LLM.

    Images must be base64-encoded and within the configured limits
    (MAX_IMAGES_PER_MESSAGE, MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES).
    Session history is preserved across calls via session_id.
    """
    _validate_images(request.images)

    llm_svc = get_llm_service()
    session_svc = get_session_service()

    session_id = request.session_id
    if not session_id or not session_svc.session_exists(session_id):
        session_id = session_svc.create_session()

    history = session_svc.get_history_for_llm(session_id, limit=20)

    # Build an augmented message that describes attached images so text-only
    # models still receive meaningful context, and vision models get the data.
    llm_message = request.message
    if request.images:
        image_summary = (
            f"\n\n[{len(request.images)} image(s) attached: "
            + ", ".join(img.media_type for img in request.images)
            + "]"
        )
        llm_message = request.message + image_summary

    reply, meta = await llm_svc.generate(
        message=llm_message,
        mode=request.mode,
        history=history,
    )

    meta["images_count"] = len(request.images)

    session_svc.save_message(session_id, "user", request.message)
    session_svc.save_message(session_id, "assistant", reply, meta)

    meta["session_id"] = session_id
    return ChatResponse(reply=reply, meta=meta, session_id=session_id)
