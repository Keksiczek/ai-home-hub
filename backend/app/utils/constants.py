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

# ── Text chunking ────────────────────────────────────────────────────────────

#: Default target chunk size (in characters) used when splitting documents
#: before generating embeddings.
DEFAULT_CHUNK_SIZE: int = 500

#: Default character overlap between adjacent chunks.  Overlap preserves
#: context at chunk boundaries and improves retrieval quality.
DEFAULT_CHUNK_OVERLAP: int = 50
