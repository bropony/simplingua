"""
Tests for wiki API endpoints
"""

import pytest


# ---------------------------------------------------------------------------
# Wiki search (unified)
# ---------------------------------------------------------------------------

def test_wiki_search_missing_query(client):
    """GET /api/v1/wiki/search without 'query' param should return 422"""
    response = client.get("/api/v1/wiki/search")
    assert response.status_code == 422


def test_wiki_search_empty_results(client):
    """Search on an empty database should return an empty results list"""
    response = client.get("/api/v1/wiki/search", params={"query": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)


def test_wiki_search_invalid_type(client):
    """GET /api/v1/wiki/search with an invalid type filter should return 422"""
    response = client.get("/api/v1/wiki/search", params={"query": "test", "type": "invalid"})
    assert response.status_code == 422


def test_wiki_search_type_word_filter(client):
    """GET /api/v1/wiki/search with type=word should return 200"""
    response = client.get("/api/v1/wiki/search", params={"query": "test", "type": "word"})
    assert response.status_code == 200


def test_wiki_search_type_grammar_filter(client):
    """GET /api/v1/wiki/search with type=grammar should return 200"""
    response = client.get("/api/v1/wiki/search", params={"query": "test", "type": "grammar"})
    assert response.status_code == 200


def test_wiki_search_limit_validation(client):
    """Limit value out of range should return 422"""
    response = client.get("/api/v1/wiki/search", params={"query": "test", "limit": 0})
    assert response.status_code == 422

    response = client.get("/api/v1/wiki/search", params={"query": "test", "limit": 101})
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Word search
# ---------------------------------------------------------------------------

def test_word_search_missing_q(client):
    """GET /api/v1/wiki/words/search without 'q' param should return 422"""
    response = client.get("/api/v1/wiki/words/search")
    assert response.status_code == 422


def test_word_search_returns_structure(client):
    """Word search on empty DB should return success and results list"""
    response = client.get("/api/v1/wiki/words/search", params={"q": "test"})
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
    assert "results" in data
    assert isinstance(data["results"], list)
    assert "pagination" in data


# ---------------------------------------------------------------------------
# Word by ID
# ---------------------------------------------------------------------------

def test_get_word_not_found(client):
    """GET /api/v1/wiki/words/<id> for a non-existent word should return 404"""
    response = client.get("/api/v1/wiki/words/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Grammar sections
# ---------------------------------------------------------------------------

def test_grammar_sections_returns_structure(client):
    """GET /api/v1/wiki/grammar/sections should return a sections key with a list"""
    response = client.get("/api/v1/wiki/grammar/sections")
    assert response.status_code == 200
    data = response.json()
    assert "sections" in data
    assert isinstance(data["sections"], list)


# ---------------------------------------------------------------------------
# Grammar rules
# ---------------------------------------------------------------------------

def test_grammar_rules_no_filter_returns_200(client):
    """GET /api/v1/wiki/grammar/rules with no filters should return 200"""
    response = client.get("/api/v1/wiki/grammar/rules")
    assert response.status_code == 200


def test_grammar_rules_returns_structure(client):
    """Grammar rules endpoint should return results list and metadata"""
    response = client.get("/api/v1/wiki/grammar/rules", params={"section": "nouns"})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)
