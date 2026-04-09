"""Configuration validation utilities – URL normalization, schema checks.

Validates LLM/embeddings URLs at:
1. Startup (via startup_checks)
2. Settings save (via settings router)
3. Runtime config reload

Error codes:
- URL_MISSING_SCHEMA: URL has no http/https schema
- URL_INVALID_FORMAT: URL is malformed
- URL_EMPTY: URL field is empty
- URL_LOCALHOST_NORMALIZED: localhost URL auto-normalized (warning, not error)
"""

import logging
import re
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Known URL fields in LLM config
LLM_URL_FIELDS = ["ollama_url", "base_url", "llamacpp_url"]

# Localhost-like patterns that get auto-normalized with http://
_LOCALHOST_PATTERNS = re.compile(
    r"^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(/.*)?$", re.IGNORECASE
)


class ConfigValidationError:
    """A single validation error/warning."""

    def __init__(
        self, field: str, code: str, message: str, level: str = "error"
    ) -> None:
        self.field = field
        self.code = code
        self.message = message
        self.level = level  # "error" or "warning"

    def to_dict(self) -> dict:
        return {
            "field": self.field,
            "code": self.code,
            "message": self.message,
            "level": self.level,
        }


def validate_url(
    url: str,
    field_name: str = "url",
    allow_empty: bool = False,
) -> tuple[str, list[ConfigValidationError]]:
    """Validate and normalize a URL.

    Returns (normalized_url, errors).
    - If the URL has no schema but looks like localhost, auto-prefixes http://
    - If the URL is malformed, returns an error
    - Strips trailing slashes
    """
    errors: list[ConfigValidationError] = []

    if not url or not url.strip():
        if allow_empty:
            return "", []
        errors.append(
            ConfigValidationError(
                field=field_name,
                code="URL_EMPTY",
                message=f"{field_name} is empty",
            )
        )
        return url, errors

    url = url.strip()

    # Check if URL has a proper http/https schema
    has_schema = url.startswith("http://") or url.startswith("https://")

    if not has_schema:
        # No schema — check if it looks like localhost
        if _LOCALHOST_PATTERNS.match(url):
            normalized = f"http://{url}"
            errors.append(
                ConfigValidationError(
                    field=field_name,
                    code="URL_LOCALHOST_NORMALIZED",
                    message=f"{field_name} missing http:// schema, auto-normalized: {url} -> {normalized}",
                    level="warning",
                )
            )
            logger.warning(
                "Config: %s missing schema, auto-normalized: %s -> %s",
                field_name,
                url,
                normalized,
            )
            url = normalized
        else:
            # Check if they used a different scheme like ftp://
            parsed_check = urlparse(url)
            if parsed_check.scheme and parsed_check.scheme not in ("http", "https"):
                errors.append(
                    ConfigValidationError(
                        field=field_name,
                        code="URL_INVALID_SCHEMA",
                        message=f"{field_name} must use http or https schema (got: {parsed_check.scheme})",
                    )
                )
                return url, errors
            errors.append(
                ConfigValidationError(
                    field=field_name,
                    code="URL_MISSING_SCHEMA",
                    message=f"{field_name} must start with http:// or https:// (got: {url})",
                )
            )
            return url, errors

    # Parse with schema present
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        errors.append(
            ConfigValidationError(
                field=field_name,
                code="URL_INVALID_SCHEMA",
                message=f"{field_name} must use http or https schema (got: {parsed.scheme})",
            )
        )
        return url, errors

    if not parsed.hostname:
        errors.append(
            ConfigValidationError(
                field=field_name,
                code="URL_INVALID_FORMAT",
                message=f"{field_name} has no hostname",
            )
        )
        return url, errors

    # Strip trailing slash
    url = url.rstrip("/")

    return url, errors


def validate_llm_config(llm_config: dict) -> tuple[dict, list[ConfigValidationError]]:
    """Validate and normalize all URL fields in LLM config.

    Returns (normalized_config, all_errors).
    Normalizes URLs in-place.
    """
    all_errors: list[ConfigValidationError] = []

    for field in LLM_URL_FIELDS:
        if field in llm_config:
            value = llm_config[field]
            if isinstance(value, str) and value:
                normalized, errors = validate_url(value, field_name=f"llm.{field}")
                llm_config[field] = normalized
                all_errors.extend(errors)

    return llm_config, all_errors


def validate_settings_on_save(settings: dict) -> list[ConfigValidationError]:
    """Validate settings before saving. Returns list of errors.

    Only returns hard errors (not warnings).
    Normalizes URLs in-place in the settings dict.
    """
    all_errors: list[ConfigValidationError] = []

    # Validate LLM URLs
    llm_cfg = settings.get("llm", {})
    if llm_cfg:
        _, errors = validate_llm_config(llm_cfg)
        all_errors.extend(errors)
        settings["llm"] = llm_cfg  # write back normalized values

    # Validate ntfy URL
    notif_cfg = settings.get("notifications", {})
    if notif_cfg.get("ntfy_url"):
        normalized, errors = validate_url(
            notif_cfg["ntfy_url"],
            field_name="notifications.ntfy_url",
            allow_empty=True,
        )
        notif_cfg["ntfy_url"] = normalized
        all_errors.extend(errors)

    # Validate Groq settings
    groq_cfg = settings.get("groq", {})
    if groq_cfg.get("api_endpoint"):
        normalized, errors = validate_url(
            groq_cfg["api_endpoint"],
            field_name="groq.api_endpoint",
            allow_empty=True,
        )
        groq_cfg["api_endpoint"] = normalized
        all_errors.extend(errors)

    return all_errors
