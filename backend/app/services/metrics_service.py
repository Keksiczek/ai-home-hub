"""Prometheus metrics service – centralized metric definitions for AI Home Hub."""
import platform

from prometheus_client import Counter, Gauge, Histogram, Info

# ── LLM / Ollama metrics ──────────────────────────────────────
ollama_requests_total = Counter(
    "ollama_requests_total",
    "Total Ollama API calls",
    ["model", "status"],
)

ollama_latency_seconds = Histogram(
    "ollama_latency_seconds",
    "Ollama response time",
    ["model"],
    buckets=[0.5, 1, 2, 5, 10, 30, 60],
)

# ── ChromaDB metrics ──────────────────────────────────────────
chromadb_query_duration = Histogram(
    "chromadb_query_duration_seconds",
    "ChromaDB operation duration",
    ["operation"],
    buckets=[0.01, 0.05, 0.1, 0.5, 1, 2],
)

chromadb_documents_total = Gauge(
    "chromadb_documents_total",
    "Total documents in ChromaDB",
    ["collection"],
)

# ── Job metrics ───────────────────────────────────────────────
job_queue_depth = Gauge(
    "job_queue_depth",
    "Number of jobs in queue",
    ["status"],
)

job_duration_seconds = Histogram(
    "job_duration_seconds",
    "Job processing time",
    ["type"],
    buckets=[1, 5, 10, 30, 60, 120, 300, 600],
)

# ── WebSocket metrics ─────────────────────────────────────────
ws_connected_clients = Gauge(
    "ws_connected_clients",
    "Number of active WebSocket connections",
)

ws_messages_total = Counter(
    "ws_messages_total",
    "Total WebSocket messages sent",
    ["type"],
)

# ── Model metrics ─────────────────────────────────────────────
installed_models_total = Gauge(
    "installed_models_total",
    "Number of installed Ollama models",
)

model_pull_duration = Histogram(
    "model_pull_duration_seconds",
    "Model download time",
    ["model"],
    buckets=[10, 30, 60, 120, 300, 600, 1800, 3600],
)

# ── Upload / document metrics ────────────────────────────────
upload_files_total = Counter(
    "upload_files_total",
    "Total file uploads",
    ["type"],  # "document" or "media"
)

upload_bytes_total = Counter(
    "upload_bytes_total",
    "Total bytes uploaded",
    ["type"],
)

document_analysis_duration_seconds = Histogram(
    "document_analysis_duration_seconds",
    "Document analysis pipeline duration",
    ["phase"],  # "parsing", "summarizing", "synthesis", "report", "total"
    buckets=[1, 5, 10, 30, 60, 120, 300, 600, 1800],
)

documents_parsed_total = Counter(
    "documents_parsed_total",
    "Total documents parsed",
    ["status"],  # "success" or "error"
)

# ── Chat metrics ──────────────────────────────────────────────
chat_requests_total = Counter(
    "chat_requests_total",
    "Total chat requests",
    ["profile", "model"],
)

chat_latency_seconds = Histogram(
    "chat_latency_seconds",
    "Chat response latency",
    ["model"],
    buckets=[0.5, 1, 2, 5, 10, 30, 60],
)

# ── Active jobs gauge ─────────────────────────────────────────
active_jobs = Gauge(
    "active_jobs",
    "Currently running jobs",
)

# ── KB chunks per collection ──────────────────────────────────
kb_chunks_total = Gauge(
    "kb_chunks_total",
    "Total KB chunks",
    ["collection"],
)

# ── Resident agent cycles ─────────────────────────────────────
agent_cycles_total = Counter(
    "agent_cycles_total",
    "Resident agent cycles",
    ["status"],
)

# ── Agent spawn blocking ───────────────────────────────────────
agent_spawn_blocked_total = Counter(
    "agent_spawn_blocked_total",
    "Agent spawn attempts blocked by guardrails",
    ["reason"],  # "resource" | "concurrent_limit" | "experimental"
)

# ── Resident agent cycle counters (detailed) ──────────────────
resident_cycles_total = Counter(
    "resident_cycles_total",
    "Resident agent cycle outcomes",
    ["status"],  # "success" | "fail" | "aborted"
)

# ── KB reindex job counter ────────────────────────────────────
kb_reindex_jobs_total = Counter(
    "kb_reindex_jobs_total",
    "KB reindex jobs by status",
    ["status"],  # "queued" | "success" | "fail"
)

# ── Resident queue depth ──────────────────────────────────────
resident_queue_depth = Gauge(
    "resident_queue_depth",
    "Number of tasks in the resident agent queue",
)

# ── Ollama memory ─────────────────────────────────────────────
ollama_memory_bytes = Gauge(
    "ollama_memory_bytes",
    "Ollama RSS memory usage in bytes",
)

# ── Application info (static) ─────────────────────────────────
app_info = Info("ai_home_hub", "Application version and config")


# ── Guardrail / Safe-Mode metrics (Hardening v2) ──────────────────────────────

resident_action_budget_daily = Gauge(
    "resident_action_budget_daily",
    "Resident agent daily action usage count",
    ["action"],
)

resident_action_budget_remaining = Gauge(
    "resident_action_budget_remaining",
    "Resident agent remaining daily action budget",
    ["action"],
)

agent_memory_usage_bytes = Gauge(
    "agent_memory_usage_bytes",
    "Resident agent approximate in-memory state size in bytes",
)

concurrent_agent_limit = Gauge(
    "concurrent_agent_limit",
    "Current vs max concurrent agents (label: current|max)",
    ["kind"],  # "current" or "max"
)

safe_mode_enabled = Gauge(
    "safe_mode_enabled",
    "1 when Safe Mode is active, 0 otherwise",
)


def init_app_info(version: str = "0.5.0") -> None:
    """Set static application info labels."""
    app_info.info({
        "version": version,
        "environment": "development",
        "python_version": platform.python_version(),
    })


def update_job_queue_metrics_from_list(jobs: list) -> None:
    """Update job queue depth gauges from a list of job dicts/objects."""
    counts: dict[str, int] = {}
    for j in jobs:
        status = j.get("status") if isinstance(j, dict) else getattr(j, "status", "unknown")
        counts[status] = counts.get(status, 0) + 1
    for status in ("queued", "running", "succeeded", "failed", "cancelled"):
        job_queue_depth.labels(status=status).set(counts.get(status, 0))
