import time
from typing import Any, Dict, List, Tuple

# Placeholder system prompt descriptions per mode.
# Replace these with real prompts when integrating an actual LLM.
SYSTEM_PROMPTS: Dict[str, str] = {
    "general": "You are a helpful general-purpose assistant.",
    "powerbi": "You are a Power BI and DAX expert assistant.",
    "lean": "You are a Lean / Continuous Improvement expert assistant.",
}


class LLMService:
    def __init__(self) -> None:
        pass

    def generate(
        self,
        message: str,
        mode: str,
        context_file_ids: List[str],
    ) -> Tuple[str, Dict[str, Any]]:
        """Return (reply, meta_dict). Currently a stub – no real LLM call."""
        start = time.monotonic()

        # Stub reply that echoes back key request information.
        reply = (
            f"MODE={mode}, "
            f"CONTEXT_FILES={len(context_file_ids)}, "
            f"MESSAGE={message}"
        )

        elapsed_ms = int((time.monotonic() - start) * 1000)

        meta: Dict[str, Any] = {
            "mode": mode,
            "provider": "stub",
            "latency_ms": elapsed_ms,
        }

        return reply, meta


def get_llm_service() -> LLMService:
    """FastAPI dependency that returns a shared LLMService instance."""
    return LLMService()
