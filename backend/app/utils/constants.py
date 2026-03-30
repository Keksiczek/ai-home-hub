"""
Application-wide constants.

This module centralises magic values that would otherwise be scattered across
multiple service and router modules.  Keeping them here makes it easy to:

- audit limits at a glance,
- change a value in one place instead of hunting through the codebase, and
- document the *why* behind each number.
"""

# ── Image / multimodal limits ────────────────────────────────────────────────

#: Maximum number of images a single chat message may contain.
MAX_IMAGES_PER_MESSAGE: int = 5

#: Hard ceiling on the size of an uploaded image (10 MiB).
MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024

#: MIME types accepted for image uploads.
ALLOWED_IMAGE_TYPES: tuple = (
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
)

# ── Knowledge-base search ────────────────────────────────────────────────────

#: Minimum cosine-similarity score (1 – distance) required to include a chunk
#: in search results.  Results below this threshold are considered noise.
MIN_KB_SEARCH_SCORE: float = 0.3

# ── Agent orchestration ──────────────────────────────────────────────────────

#: Maximum recursion depth when an agent spawns sub-agents.  Prevents runaway
#: agent trees that would exhaust resources.
MAX_SUB_AGENT_DEPTH: int = 2

# ── LLM concurrency ─────────────────────────────────────────────────────────

#: Maximum number of concurrent LLM (Ollama) requests across the whole
#: application.  Ollama on a single GPU can rarely serve >1 request at a
#: time without OOM or severe slowdown, so the default is 1.
#: Override via LLM_MAX_CONCURRENT_REQUESTS env var.
LLM_MAX_CONCURRENT_REQUESTS: int = int(
    __import__("os").environ.get("LLM_MAX_CONCURRENT_REQUESTS", "1")
)

#: Timeout (seconds) that a caller will wait to acquire the LLM semaphore
#: before raising LLMOverloadedError.  Keeps queues from growing unboundedly.
LLM_SEMAPHORE_TIMEOUT: float = float(
    __import__("os").environ.get("LLM_SEMAPHORE_TIMEOUT", "120")
)

# ── LLM CPU-backend optimisation ─────────────────────────────────────────────

#: Number of CPU threads Ollama should use for inference.
#: Defaults to half the available logical CPUs (good balance on Mac/Linux).
#: Override via LLM_NUM_THREADS env var.
LLM_NUM_THREADS: int = int(
    __import__("os").environ.get(
        "LLM_NUM_THREADS",
        str(min(4, max(1, (__import__("os").cpu_count() or 4) // 2))),
    )
)

#: Maximum tokens to predict per non-streaming request.  Smaller values
#: yield faster first-token latency on CPU at the cost of truncated replies.
#: Override via LLM_NUM_PREDICT env var.
LLM_NUM_PREDICT: int = int(__import__("os").environ.get("LLM_NUM_PREDICT", "512"))

#: When True, CPU-optimisation parameters (num_thread, num_predict, low
#: temperature) are injected into every Ollama payload.  Auto-detected from
#: the absence of CUDA_VISIBLE_DEVICES / OLLAMA_NUM_GPU; can be forced with
#: LLM_CPU_BACKEND=true.
_cpu_backend_env = __import__("os").environ.get("LLM_CPU_BACKEND", "").lower()
_cuda_visible = __import__("os").environ.get("CUDA_VISIBLE_DEVICES", "")
_ollama_num_gpu = __import__("os").environ.get("OLLAMA_NUM_GPU", "")
LLM_CPU_BACKEND: bool = _cpu_backend_env == "true" or (
    _cpu_backend_env != "false" and not _cuda_visible and not _ollama_num_gpu
)

# ── Per-model circuit breaker / fallback ─────────────────────────────────────

#: Consecutive failures per model before it is disabled for MODEL_CB_DISABLE_TTL.
MODEL_CB_FAILURE_THRESHOLD: int = 3

#: Seconds a model stays disabled after hitting MODEL_CB_FAILURE_THRESHOLD.
MODEL_CB_DISABLE_TTL: float = 300.0  # 5 minutes

#: Fallback model used when the requested model is circuit-broken.
#: Override via LLM_FALLBACK_MODEL env var.
LLM_FALLBACK_MODEL: str = __import__("os").environ.get(
    "LLM_FALLBACK_MODEL", "llama3.2:3b"
)

# ── Request-type timeouts ─────────────────────────────────────────────────────

#: Timeouts (seconds) per logical request type.  Overridable per-type via
#: LLM_TIMEOUT_CHAT_STREAM / LLM_TIMEOUT_AGENT_STEP / LLM_TIMEOUT_BACKGROUND_JOB.
LLM_TIMEOUT_CHAT_STREAM: float = float(
    __import__("os").environ.get("LLM_TIMEOUT_CHAT_STREAM", "90")
)
LLM_TIMEOUT_AGENT_STEP: float = float(
    __import__("os").environ.get("LLM_TIMEOUT_AGENT_STEP", "90")
)
LLM_TIMEOUT_BACKGROUND_JOB: float = float(
    __import__("os").environ.get("LLM_TIMEOUT_BACKGROUND_JOB", "180")
)

#: Timeout (seconds) for embedding HTTP requests.  Embedding on CPU with a
#: model that needs loading can take 30+ seconds; default allows headroom.
#: Override via LLM_TIMEOUT_EMBEDDING env var.
LLM_TIMEOUT_EMBEDDING: float = float(
    __import__("os").environ.get("LLM_TIMEOUT_EMBEDDING", "60")
)

# ── Agent orchestration (structured output) ─────────────────────────────────

#: Maximum number of steps an agent orchestrator loop may execute before
#: aborting with ABORTED_LOOPING.  Prevents runaway tool-call loops.
AGENT_MAX_STEPS: int = 10

#: Maximum number of JSON-parse retries when the LLM returns invalid output
#: before marking the task as FAILED_INVALID_OUTPUT.
AGENT_MAX_PARSE_RETRIES: int = 3

# ── Text chunking ────────────────────────────────────────────────────────────

#: Default target chunk size (in characters) used when splitting documents
#: before generating embeddings.
DEFAULT_CHUNK_SIZE: int = 500

#: Default character overlap between adjacent chunks.  Overlap preserves
#: context at chunk boundaries and improves retrieval quality.
DEFAULT_CHUNK_OVERLAP: int = 50
