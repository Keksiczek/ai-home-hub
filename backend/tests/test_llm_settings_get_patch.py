"""Tests for GET/PATCH /api/llm/settings – LLM configuration endpoints."""
from unittest.mock import patch

import pytest


def test_get_llm_settings(client):
    """GET /api/llm/settings returns active models and parameters."""
    resp = client.get("/api/llm/settings")
    assert resp.status_code == 200
    data = resp.json()

    assert "active_models" in data
    assert "parameters" in data
    assert "ollama_url" in data

    models = data["active_models"]
    assert "chat" in models
    assert "vision" in models
    assert "code" in models
    assert "agent" in models

    params = data["parameters"]
    assert "temperature" in params
    assert "max_tokens" in params
    assert "top_p" in params


def test_patch_llm_settings_parameters(client):
    """PATCH /api/llm/settings updates parameters."""
    resp = client.patch("/api/llm/settings", json={
        "parameters": {"temperature": 0.8, "max_tokens": 4096},
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["reloaded"] is True


def test_patch_llm_settings_active_models(client):
    """PATCH /api/llm/settings updates active model assignments."""
    resp = client.patch("/api/llm/settings", json={
        "active_models": {"chat": "mistral:7b"},
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

    # Verify the model was updated
    from app.services.llm_service import MODEL_ROUTING
    assert MODEL_ROUTING["general"] == "mistral:7b"

    # Restore original
    MODEL_ROUTING["general"] = "llama3.2"


def test_patch_llm_settings_ollama_url(client):
    """PATCH /api/llm/settings updates Ollama URL."""
    resp = client.patch("/api/llm/settings", json={
        "ollama_url": "http://192.168.1.100:11434",
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
