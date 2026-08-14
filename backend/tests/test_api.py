"""Tests for application startup, health, docs and API basics."""

from fastapi.testclient import TestClient

from app.main import app


def test_application_startup():
    """The application must start and serve requests without errors."""
    with TestClient(app) as test_client:
        response = test_client.get("/health")
        assert response.status_code == 200


def test_health_endpoint():
    """GET /health must return the status payload."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_swagger_docs_available():
    """Interactive Swagger documentation must be served at /docs."""
    client = TestClient(app)
    response = client.get("/docs")
    assert response.status_code == 200


def test_redoc_available():
    """ReDoc documentation must be served at /redoc."""
    client = TestClient(app)
    response = client.get("/redoc")
    assert response.status_code == 200


def test_openapi_schema():
    """The OpenAPI schema must describe every todo endpoint."""
    client = TestClient(app)
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert data["info"]["title"] == "Todo App API"
    paths = data["paths"]
    assert "/api/todos" in paths
    assert "/api/todos/{todo_id}" in paths
    assert "/api/todos/{todo_id}/complete" in paths
    assert "/api/todos/stats" in paths
    assert "/health" in paths


def test_get_todos_returns_empty_list():
    """A fresh database must return an empty todo list."""
    client = TestClient(app)
    response = client.get("/api/todos")
    assert response.status_code == 200
    assert response.json() == []


def test_get_stats_returns_zeroes():
    """Statistics for an empty database must all be zero."""
    client = TestClient(app)
    response = client.get("/api/todos/stats")
    assert response.status_code == 200
    assert response.json() == {
        "total_tasks": 0,
        "pending_tasks": 0,
        "completed_tasks": 0,
        "high_priority_tasks": 0,
    }