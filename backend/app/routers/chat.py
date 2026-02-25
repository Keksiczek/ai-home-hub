from fastapi import APIRouter, Depends

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import LLMService, get_llm_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    llm_service: LLMService = Depends(get_llm_service),
) -> ChatResponse:
    """Send a message to the LLM (stub) with optional file context."""
    reply, meta = llm_service.generate(
        message=request.message,
        mode=request.mode,
        context_file_ids=request.context_file_ids,
    )
    return ChatResponse(reply=reply, meta=meta)
