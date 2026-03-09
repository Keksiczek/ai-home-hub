"""Optional API key authentication for sensitive endpoints.

When ``api_key`` is set in application settings any request to a protected
endpoint must include a matching ``X-API-Key`` header.  If the setting is
absent or empty, authentication is disabled and all requests are allowed
(localhost / trusted-network mode).
"""
from fastapi import Header, HTTPException

from app.services.settings_service import get_settings_service


def verify_api_key(x_api_key: str = Header(None)) -> bool:
    """FastAPI dependency that enforces the configured API key.

    Returns ``True`` immediately when no key is configured (open mode).
    Raises HTTP 403 when a key is configured but the header is missing or
    does not match.
    """
    settings = get_settings_service().load()
    configured_key = settings.get("api_key")
    if configured_key and x_api_key != configured_key:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")
    return True
