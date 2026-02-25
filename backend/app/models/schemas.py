from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class UploadResponse(BaseModel):
    id: str
    filename: str


class ChatRequest(BaseModel):
    message: str
    mode: str = "general"
    context_file_ids: List[str] = []


class ChatResponse(BaseModel):
    reply: str
    meta: Dict[str, Any] = {}


class OpenClawActionRequest(BaseModel):
    action: str
    params: Dict[str, Any] = {}


class OpenClawActionResponse(BaseModel):
    status: str
    detail: Optional[str] = None
    data: Dict[str, Any] = {}
