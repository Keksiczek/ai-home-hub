"""Tests for config URL validation and normalization."""

import pytest
from app.utils.config_validation import (
    validate_url,
    validate_llm_config,
    validate_settings_on_save,
    ConfigValidationError,
)


class TestValidateUrl:
    def test_valid_http_url(self):
        url, errors = validate_url("http://localhost:11434", "test")
        assert url == "http://localhost:11434"
        assert not errors

    def test_valid_https_url(self):
        url, errors = validate_url("https://api.example.com/v1", "test")
        assert url == "https://api.example.com/v1"
        assert not errors

    def test_strips_trailing_slash(self):
        url, errors = validate_url("http://localhost:11434/", "test")
        assert url == "http://localhost:11434"

    def test_auto_normalize_localhost(self):
        url, errors = validate_url("localhost:11434", "test")
        assert url == "http://localhost:11434"
        assert len(errors) == 1
        assert errors[0].code == "URL_LOCALHOST_NORMALIZED"
        assert errors[0].level == "warning"

    def test_auto_normalize_127(self):
        url, errors = validate_url("127.0.0.1:8080", "test")
        assert url == "http://127.0.0.1:8080"
        assert errors[0].level == "warning"

    def test_missing_schema_non_localhost(self):
        url, errors = validate_url("example.com:11434", "test")
        assert len(errors) == 1
        assert errors[0].code in ("URL_MISSING_SCHEMA", "URL_INVALID_SCHEMA")
        assert errors[0].level == "error"

    def test_empty_url_error(self):
        url, errors = validate_url("", "test")
        assert len(errors) == 1
        assert errors[0].code == "URL_EMPTY"

    def test_empty_url_allowed(self):
        url, errors = validate_url("", "test", allow_empty=True)
        assert url == ""
        assert not errors

    def test_invalid_schema(self):
        url, errors = validate_url("ftp://localhost:11434", "test")
        assert len(errors) == 1
        assert errors[0].code == "URL_INVALID_SCHEMA"

    def test_whitespace_stripped(self):
        url, errors = validate_url("  http://localhost:11434  ", "test")
        assert url == "http://localhost:11434"
        assert not errors

    def test_no_hostname(self):
        url, errors = validate_url("http://", "test")
        # urlparse may give empty hostname
        hard_errors = [e for e in errors if e.level == "error"]
        assert len(hard_errors) >= 1


class TestValidateLlmConfig:
    def test_normalizes_urls(self):
        cfg = {
            "ollama_url": "localhost:11434",
            "llamacpp_url": "http://localhost:8080/",
        }
        normalized, errors = validate_llm_config(cfg)
        assert normalized["ollama_url"] == "http://localhost:11434"
        assert normalized["llamacpp_url"] == "http://localhost:8080"

    def test_error_on_bad_url(self):
        cfg = {"ollama_url": "not-a-url"}
        _, errors = validate_llm_config(cfg)
        hard_errors = [e for e in errors if e.level == "error"]
        assert len(hard_errors) == 1


class TestValidateSettingsOnSave:
    def test_full_settings_validation(self):
        settings = {
            "llm": {
                "ollama_url": "localhost:11434",
                "provider": "ollama",
            },
            "notifications": {
                "ntfy_url": "https://ntfy.sh",
            },
        }
        errors = validate_settings_on_save(settings)
        # ollama_url should be auto-normalized (warning, not error)
        assert settings["llm"]["ollama_url"] == "http://localhost:11434"
        hard_errors = [e for e in errors if e.level == "error"]
        assert len(hard_errors) == 0
