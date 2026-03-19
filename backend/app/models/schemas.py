from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


# ── Base response wrapper ──────────────────────────────────


class BaseResponse(BaseModel):
    data: Any
    meta: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None


# ── File upload ─────────────────────────────────────────────

class UploadResponse(BaseModel):
    id: str
    filename: str


# ── Chat ────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    mode: str = "general"
    profile: Optional[str] = None  # LLM profile: chat | powerbi | lean | vision
    model: Optional[str] = None  # Override model for this request
    context_file_ids: List[str] = []
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    meta: Dict[str, Any] = {}
    session_id: str


# ── OpenClaw ────────────────────────────────────────────────

class OpenClawActionRequest(BaseModel):
    action: str
    params: Dict[str, Any] = {}


class OpenClawActionResponse(BaseModel):
    status: str
    detail: Optional[str] = None
    data: Dict[str, Any] = {}


# ── Agents ──────────────────────────────────────────────────

class SpawnAgentRequest(BaseModel):
    agent_type: str  # code | research | testing | devops | general
    task: Dict[str, Any]
    workspace: Optional[str] = None
    skill_ids: List[str] = []
    skill_names: List[str] = []  # filesystem-based agent skills (SKILL.md)


class AgentStatusResponse(BaseModel):
    agent_id: str
    agent_type: str
    status: str  # pending | running | completed | failed | interrupted
    progress: int = 0  # 0-100
    message: Optional[str] = None
    artifacts: List[str] = []
    created_at: str
    updated_at: str


class ArtifactResponse(BaseModel):
    artifact_id: str
    artifact_type: str  # plan | task_breakdown | test_results | screenshot
    content: Any
    created_at: str


# ── Tasks ───────────────────────────────────────────────────

class CreateTaskRequest(BaseModel):
    name: str
    task_type: str
    params: Dict[str, Any] = {}


class TaskStatusResponse(BaseModel):
    task_id: str
    name: str
    task_type: str
    status: str  # pending | running | completed | failed | cancelled
    progress: int = 0
    message: Optional[str] = None
    result: Optional[Any] = None
    created_at: str
    updated_at: str


# ── Settings ────────────────────────────────────────────────

class SettingsResponse(BaseModel):
    settings: Dict[str, Any]


class UpdateSettingsRequest(BaseModel):
    settings: Dict[str, Any]


# ── Integrations ─────────────────────────────────────────────

class MCPCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = {}


class VSCodeOpenProjectRequest(BaseModel):
    project_key: str


class VSCodeOpenFileRequest(BaseModel):
    file_path: str
    line: Optional[int] = None


class VSCodeRunTaskRequest(BaseModel):
    project_key: str
    task_name: str


class GitOperationRequest(BaseModel):
    repo_path: str
    message: Optional[str] = None
    branch: Optional[str] = None


class MacOSActionRequest(BaseModel):
    action: str  # safari_open | mail_send | volume_set | sleep_display | finder_open | quit_app
    params: Dict[str, Any] = {}


class AntigravityAgentRequest(BaseModel):
    prompt: str
    workspace: Optional[str] = None


# ── Filesystem ──────────────────────────────────────────────

class WriteFileRequest(BaseModel):
    content: str
    encoding: str = "utf-8"


class SearchRequest(BaseModel):
    path: str
    pattern: str
    file_pattern: Optional[str] = None


# ── Quick Actions ────────────────────────────────────────────

class QuickActionStep(BaseModel):
    service: str  # vscode | git | safari | llm | macos | openclaw
    action: str
    params: Dict[str, Any] = {}


class QuickAction(BaseModel):
    id: str
    name: str
    icon: str = "⚡"
    steps: List[QuickActionStep] = []


class ExecuteActionRequest(BaseModel):
    action_id: str


# ── Sessions ─────────────────────────────────────────────────

class SessionListItem(BaseModel):
    session_id: str
    created_at: str
    message_count: int
    last_message: Optional[str] = None


# ── Notifications ────────────────────────────────────────────

class NotificationRequest(BaseModel):
    title: str
    message: str
    priority: str = "default"  # low | default | high | urgent


# ── Multimodal chat ──────────────────────────────────────────

class MultimodalImageData(BaseModel):
    data: str        # base64-encoded image bytes
    media_type: str  # e.g. "image/jpeg"


class MultimodalChatRequest(BaseModel):
    message: str
    images: List[MultimodalImageData] = []
    mode: str = "general"
    profile: Optional[str] = None  # LLM profile override; defaults to "vision" when images present
    session_id: Optional[str] = None


# ── File metadata ──────────────────────────────────────────────

class FileMetadata(BaseModel):
    """Unified metadata schema for all file formats in the Knowledge Base."""
    filename: str
    filetype: str  # MIME-like: "text/plain", "application/pdf", "audio/mpeg"
    size_bytes: int = 0
    indexed_at: Optional[datetime] = None
    collection: str = "default"
    pages_or_duration: Optional[float] = None  # pages for docs, seconds for audio/video
    language: Optional[str] = None
    chunk_count: int = 0
    media_type: Literal["text", "image", "audio", "video", "office", "archive"] = "text"
    preview_url: Optional[str] = None


# ── Knowledge base management ────────────────────────────────

class ReindexFileRequest(BaseModel):
    file_path: str


class KBSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    top_k: int = Field(default=5, ge=1, le=50)


# ── Memory ──────────────────────────────────────────────────

class AddMemoryRequest(BaseModel):
    text: str = Field(..., min_length=1)
    tags: List[str] = []
    source: str = ""
    importance: int = Field(default=5, ge=1, le=10)


class AddMemoryResponse(BaseModel):
    memory_id: str


class SearchMemoryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)
    filters: Dict[str, Any] = {}


class MemoryItem(BaseModel):
    id: str
    text: str
    tags: List[str]
    source: str
    importance: int
    timestamp: str
    distance: Optional[float] = None


class UpdateMemoryRequest(BaseModel):
    text: Optional[str] = None
    tags: Optional[List[str]] = None
    importance: Optional[int] = Field(default=None, ge=1, le=10)


class SummarizeSessionRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    max_messages: int = Field(default=50, ge=1, le=200)


# ── Agent sub-tasks ──────────────────────────────────────────

class AgentSearchKBRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    top_k: int = Field(default=3, ge=1, le=20)


class AgentSearchKBResult(BaseModel):
    text: str
    file_name: str
    file_path: str
    score: float


class AgentSearchKBResponse(BaseModel):
    results: List[AgentSearchKBResult]
    query: str
    count: int


class SpawnSubAgentRequest(BaseModel):
    task: str = Field(..., min_length=1, max_length=2000)
    agent_type: str = Field(
        default="general",
        pattern=r"^(general|code|research|testing|devops)$",
    )


class SpawnSubAgentResponse(BaseModel):
    agent_id: str
    agent_type: str
    status: str
    message: str


# ── Setup / first-run ────────────────────────────────────────

class SetupCheckItem(BaseModel):
    ok: bool
    message: str
    missing: Optional[List[str]] = None


class SetupChecks(BaseModel):
    ollama_running: SetupCheckItem
    required_models: SetupCheckItem
    chromadb_writable: SetupCheckItem
    filesystem_dirs: SetupCheckItem


class SetupStatusResponse(BaseModel):
    completed: bool
    first_run: bool
    checks: SetupChecks


# ── AI Prompt Generator ──────────────────────────────────────

class PromptGeneratorRequest(BaseModel):
    task_type: Literal["chat", "kb_search", "resident_mission", "file_analysis"] = "chat"
    context: str = Field(default="", max_length=500)
    tone: Literal["professional", "casual", "technical"] = "professional"


class PromptGeneratorResponse(BaseModel):
    generated_prompt: str
    example_usage: str


# ── Model Manager ─────────────────────────────────────────────

class ModelPullRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)


class ModelDeleteRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)


class ModelSearchRequest(BaseModel):
    q: str = Field(..., min_length=1, max_length=200)


class LLMSettingsUpdate(BaseModel):
    active_models: Optional[Dict[str, str]] = None
    parameters: Optional[Dict[str, Any]] = None
    ollama_url: Optional[str] = None


class OllamaPerformanceUpdate(BaseModel):
    context_length: Optional[int] = None        # OLLAMA_CONTEXT_LENGTH
    kv_cache_type: Optional[str] = None         # OLLAMA_KV_CACHE_TYPE: f16 | q8_0 | q4_0
    flash_attention: Optional[bool] = None      # OLLAMA_FLASH_ATTENTION
    num_parallel: Optional[int] = None          # OLLAMA_NUM_PARALLEL 1–4
    keep_alive: Optional[str] = None            # OLLAMA_KEEP_ALIVE: 0 | 5m | 30m | -1
    restart_ollama: bool = False                # restart Ollama after save
