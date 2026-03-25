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
