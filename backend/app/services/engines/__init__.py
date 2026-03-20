"""engines package – re-exports all job engines for backward compatibility."""
from app.services.engines.coding_engine import (
    run_dummy_long_task,
    run_long_llm_task,
    ProgressCallback,
)
from app.services.engines.research_engine import run_document_analysis
from app.services.engines.media_engine import run_media_ingest
from app.services.engines.report_engine import run_report_generation, _build_markdown_from_result
from app.services.engines.overnight_engine import (
    run_kb_reindex,
    run_git_sweep,
    run_nightly_summary,
)
from app.services.engines.resident_engine import run_resident_task, run_resident_mission

__all__ = [
    "ProgressCallback",
    "run_dummy_long_task",
    "run_long_llm_task",
    "run_document_analysis",
    "run_media_ingest",
    "run_report_generation",
    "_build_markdown_from_result",
    "run_kb_reindex",
    "run_git_sweep",
    "run_nightly_summary",
    "run_resident_task",
    "run_resident_mission",
]
