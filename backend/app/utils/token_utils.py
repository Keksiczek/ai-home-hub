"""Token estimation and context window management utilities."""

from typing import Dict, List, Tuple


def estimate_tokens(text: str) -> int:
    """Conservative estimate: 1 token ≈ 3.5 characters for Czech/English mix."""
    return max(1, len(text) // 3)


def estimate_messages_tokens(messages: List[Dict[str, str]]) -> int:
    """Estimate total tokens for a messages array."""
    return sum(estimate_tokens(m.get("content", "")) for m in messages)


# Known context limits for common Ollama models
_MODEL_CONTEXT_LIMITS: Dict[str, int] = {
    "llama3.2": 8192,
    "llama3.2:1b": 8192,
    "llama3.2:3b": 8192,
    "llama3.1": 131072,
    "llama3.1:8b": 131072,
    "llama3.1:70b": 131072,
    "mistral": 8192,
    "phi3": 4096,
    "phi3.5": 4096,
    "gemma2": 8192,
    "qwen2.5": 32768,
    "llava": 4096,
    "llava:7b": 4096,
    "deepseek-coder": 16384,
    "codellama": 16384,
}


def get_model_context_limit(model_name: str) -> int:
    """Return known context limit for a model. Falls back to 4096."""
    name = model_name.lower()
    for key, limit in _MODEL_CONTEXT_LIMITS.items():
        if name.startswith(key):
            return limit
    return 4096  # conservative default


def trim_messages_to_fit(
    messages: List[Dict[str, str]],
    max_tokens: int,
    preserve_system: bool = True,
    preserve_last_n: int = 4,
) -> Tuple[List[Dict[str, str]], bool]:
    """Trim messages to fit within max_tokens.

    Always preserves: system messages (if preserve_system) + last N messages.
    Removes oldest non-system messages first.

    Returns (trimmed_messages, was_trimmed).
    """
    current_tokens = estimate_messages_tokens(messages)
    if current_tokens <= max_tokens:
        return messages, False

    # Separate system messages and conversation messages
    system_msgs: List[Dict[str, str]] = []
    conv_msgs: List[Dict[str, str]] = []

    for m in messages:
        if preserve_system and m.get("role") == "system":
            system_msgs.append(m)
        else:
            conv_msgs.append(m)

    # Always keep the last N conversation messages
    if len(conv_msgs) <= preserve_last_n:
        # Can't trim further – return as is
        return messages, False

    preserved_tail = conv_msgs[-preserve_last_n:]
    trimmable = conv_msgs[:-preserve_last_n]

    # Remove oldest messages one by one until we fit
    result = system_msgs + trimmable + preserved_tail
    while estimate_messages_tokens(result) > max_tokens and trimmable:
        trimmable.pop(0)
        result = system_msgs + trimmable + preserved_tail

    return result, True
