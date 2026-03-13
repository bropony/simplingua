"""
Test Configuration and Fixtures
Provides shared fixtures for all test modules.

The models use PostgreSQL-specific types (JSONB, ARRAY, UUID) that are
incompatible with SQLite, so the fixtures mock the database layer rather
than spinning up a real database.  Integration tests that need a live
PostgreSQL instance can be added with the ``@pytest.mark.integration``
marker and run only in CI where a database service is available.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app import app
from app.core.database import get_db


# ---------------------------------------------------------------------------
# Database mock
# ---------------------------------------------------------------------------

def _make_db_session():
    """Build a MagicMock database session whose query chain returns empty results."""
    db = MagicMock()
    # A chainable query stub that always returns empty by default.
    query_stub = MagicMock()
    query_stub.filter.return_value = query_stub
    query_stub.first.return_value = None
    query_stub.all.return_value = []
    query_stub.count.return_value = 0
    query_stub.limit.return_value = query_stub
    query_stub.offset.return_value = query_stub
    query_stub.order_by.return_value = query_stub
    db.query.return_value = query_stub
    return db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def mock_db():
    """A fresh mock database session for each test."""
    return _make_db_session()


@pytest.fixture()
def client(mock_db):
    """
    HTTP test client that:
    - overrides the ``get_db`` dependency with a mock session
    - patches ``init_db`` so the startup event does not try to connect
      to a real PostgreSQL instance
    """

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db

    with patch("app.init_db"):
        with TestClient(app, raise_server_exceptions=False) as test_client:
            yield test_client

    app.dependency_overrides.clear()
