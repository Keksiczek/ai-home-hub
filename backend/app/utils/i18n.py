"""Minimal i18n helper.

UI-facing messages are in Czech; API error details (HTTPException) stay in
English so they are machine-readable and consistent for API consumers.
"""

MESSAGES_CS: dict[str, str] = {
    # Ollama / LLM
    "ollama_not_available": (
        "Ollama není dostupná. Spusťte 'ollama serve' a zkuste znovu."
    ),
    # Knowledge base
    "kb_file_not_found": "Soubor nenalezen v Knowledge Base",
    # Agents
    "agent_not_found": "Agent nenalezen",
    # Generic
    "error_generic": "Nastala chyba. Zkuste to znovu.",
}


def get_message(key: str, lang: str = "cs") -> str:
    """Return a localised message string for *key*.

    Falls back to *key* itself when the key is unknown, so callers never
    receive an empty string.
    """
    if lang == "cs":
        return MESSAGES_CS.get(key, key)
    return key
