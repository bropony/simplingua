"""
Tests for root and health check endpoints
"""


def test_root_returns_200(client):
    """GET / should return HTTP 200"""
    response = client.get("/")
    assert response.status_code == 200


def test_root_contains_app_name(client):
    """Root response should include the app name"""
    response = client.get("/")
    data = response.json()
    assert "name" in data
    assert data["name"] == "Simplingua API"


def test_root_contains_version(client):
    """Root response should include a version string"""
    response = client.get("/")
    data = response.json()
    assert "version" in data
    assert isinstance(data["version"], str)


def test_root_status_running(client):
    """Root response should report status 'running'"""
    response = client.get("/")
    data = response.json()
    assert data.get("status") == "running"


def test_root_contains_endpoints(client):
    """Root response should list key API endpoints"""
    response = client.get("/")
    data = response.json()
    endpoints = data.get("endpoints", {})
    assert "wiki" in endpoints
    assert "auth" in endpoints
    assert "chat" in endpoints


def test_health_returns_200(client):
    """GET /health should return HTTP 200"""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_status_healthy(client):
    """Health endpoint should return status 'healthy'"""
    response = client.get("/health")
    data = response.json()
    assert data.get("status") == "healthy"


def test_health_contains_service_name(client):
    """Health endpoint should include the service name"""
    response = client.get("/health")
    data = response.json()
    assert "service" in data
