"""Tests for GET /api/models/search/ollama – Ollama library search."""
import pytest


def test_search_ollama_returns_filtered_results(client):
    """GET /api/models/search/ollama?q=llama returns matching curated models."""
    resp = client.get("/api/models/search/ollama?q=llama")
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert data["query"] == "llama"
    # All results should contain 'llama' in name
    for model in data["results"]:
        assert "llama" in model["name"].lower()


def test_search_ollama_type_filter(client):
    """GET /api/models/search/ollama?q=code returns code models."""
    resp = client.get("/api/models/search/ollama?q=code")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) > 0


def test_search_ollama_no_match(client):
    """GET /api/models/search/ollama?q=nonexistent returns empty list."""
    resp = client.get("/api/models/search/ollama?q=zzzznonexistent")
    assert resp.status_code == 200
    data = resp.json()
    assert data["results"] == []


def test_search_ollama_requires_query(client):
    """GET /api/models/search/ollama without q returns 422."""
    resp = client.get("/api/models/search/ollama")
    assert resp.status_code == 422
