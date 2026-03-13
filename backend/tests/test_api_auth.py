"""
Tests for authentication API endpoints

The ``mock_db`` fixture provides a fresh MagicMock database session per test.
Because ``client`` depends on ``mock_db``, any configuration applied to
``mock_db`` in the test body takes effect for that test's HTTP requests.
"""

import uuid
from unittest.mock import MagicMock

import pytest

from app.core.security import get_password_hash


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _existing_user(username="existing", email="existing@example.com",
                   password="ExistingPass123", role="user"):
    """Build a user-like mock that looks like a DB row."""
    user = MagicMock()
    user.id = uuid.uuid4()
    user.username = username
    user.email = email
    user.password_hash = get_password_hash(password)
    user.role = role
    user.preferred_language = "en"
    user.last_login = None
    return user


# ---------------------------------------------------------------------------
# Registration – validation errors (no DB state needed)
# ---------------------------------------------------------------------------

def test_register_missing_fields(client):
    """Registration with missing required fields should fail with 422"""
    response = client.post("/api/v1/auth/register", json={"username": "onlyname"})
    assert response.status_code == 422


def test_register_short_password(client):
    """Password shorter than 8 characters should fail validation"""
    payload = {
        "username": "shortpwduser",
        "email": "shortpwd@example.com",
        "password": "abc",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_too_long_password(client):
    """Password exceeding 72 bytes should fail validation"""
    payload = {
        "username": "longpwduser",
        "email": "longpwd@example.com",
        "password": "a" * 73,
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_short_username(client):
    """Username shorter than 3 characters should fail validation"""
    payload = {
        "username": "ab",
        "email": "ab@example.com",
        "password": "SecurePass123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_invalid_email(client):
    """Invalid email address should fail validation"""
    payload = {
        "username": "invalidemail",
        "email": "not-an-email",
        "password": "SecurePass123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Registration – success path (mock DB returns no duplicates)
# ---------------------------------------------------------------------------

def test_register_success(client):
    """POST /api/v1/auth/register should create a new user"""
    # Default mock_db.query().filter().first() returns None → no duplicate
    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "SecurePass123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
    assert "tokens" in data
    assert "user" in data
    assert data["user"]["username"] == "newuser"
    assert data["user"]["role"] == "user"


def test_register_returns_both_tokens(client):
    """Successful registration should include both access and refresh tokens"""
    payload = {
        "username": "tokenuser",
        "email": "tokenuser@example.com",
        "password": "SecurePass123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    tokens = response.json()["tokens"]
    assert "accessToken" in tokens
    assert "refreshToken" in tokens
    assert tokens["tokenType"] == "Bearer"


# ---------------------------------------------------------------------------
# Registration – duplicate detection (mock DB returns existing user)
# ---------------------------------------------------------------------------

def test_register_duplicate_username(client, mock_db):
    """Registering with an existing username should fail with 400"""
    # Make the DB say the username already exists
    mock_db.query.return_value.filter.return_value.first.return_value = _existing_user()

    response = client.post("/api/v1/auth/register", json={
        "username": "dupuser",
        "email": "newdup@example.com",
        "password": "SecurePass123",
    })
    assert response.status_code == 400


def test_register_duplicate_email(client, mock_db):
    """Registering when email already exists should fail with 400"""
    # First call (username check) → None; second call (email check) → existing user
    call_count = {"n": 0}
    existing = _existing_user()

    def first_side_effect():
        call_count["n"] += 1
        return existing if call_count["n"] >= 2 else None

    mock_db.query.return_value.filter.return_value.first.side_effect = first_side_effect

    response = client.post("/api/v1/auth/register", json={
        "username": "uniqueuser",
        "email": "dup@example.com",
        "password": "SecurePass123",
    })
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_success(client, mock_db):
    """POST /api/v1/auth/login should return tokens for valid credentials"""
    user = _existing_user(username="loginuser", email="login@example.com",
                          password="LoginPass123")
    mock_db.query.return_value.filter.return_value.first.return_value = user

    response = client.post("/api/v1/auth/login", json={
        "username": "loginuser",
        "password": "LoginPass123",
    })
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True
    tokens = data["tokens"]
    assert "accessToken" in tokens
    assert "refreshToken" in tokens


def test_login_with_email(client, mock_db):
    """Login using email address instead of username should succeed"""
    user = _existing_user(username="emaillogin", email="emaillogin@example.com",
                          password="LoginPass123")
    mock_db.query.return_value.filter.return_value.first.return_value = user

    response = client.post("/api/v1/auth/login", json={
        "username": "emaillogin@example.com",
        "password": "LoginPass123",
    })
    assert response.status_code == 200


def test_login_wrong_password(client, mock_db):
    """Login with wrong password should return 401"""
    user = _existing_user(password="CorrectPassword1")
    mock_db.query.return_value.filter.return_value.first.return_value = user

    response = client.post("/api/v1/auth/login", json={
        "username": user.username,
        "password": "WrongPassword!",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Login for an unknown username should return 401"""
    # Default mock returns None → user not found
    response = client.post("/api/v1/auth/login", json={
        "username": "nosuchuser",
        "password": "whatever123",
    })
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

def test_logout_success(client):
    """POST /api/v1/auth/logout should succeed"""
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    data = response.json()
    assert data.get("success") is True


# ---------------------------------------------------------------------------
# Token refresh
# ---------------------------------------------------------------------------

def test_refresh_token_success(client, mock_db):
    """POST /api/v1/auth/refresh with valid refresh token should return new tokens"""
    from app.core.security import create_refresh_token

    user = _existing_user()
    # The refresh endpoint looks up user by ID from token payload
    mock_db.query.return_value.filter.return_value.first.return_value = user

    refresh_token = create_refresh_token({"sub": str(user.id)})
    response = client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "accessToken" in data
    assert "refreshToken" in data


def test_refresh_token_invalid(client):
    """POST /api/v1/auth/refresh with invalid token should return 401"""
    response = client.post("/api/v1/auth/refresh", json={"refreshToken": "not.a.valid.token"})
    assert response.status_code == 401


def test_refresh_token_with_access_token_fails(client, mock_db):
    """Using an access token as a refresh token should be rejected"""
    from app.core.security import create_access_token

    user = _existing_user()
    mock_db.query.return_value.filter.return_value.first.return_value = user

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    response = client.post("/api/v1/auth/refresh", json={"refreshToken": access_token})
    assert response.status_code == 401

