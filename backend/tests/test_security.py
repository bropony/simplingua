"""
Tests for security utilities (JWT tokens and password hashing)
"""

import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_tokens_for_user,
)


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

def test_password_hash_is_not_plaintext():
    """Hashed password should not equal the original"""
    plain = "securepassword123"
    hashed = get_password_hash(plain)
    assert hashed != plain


def test_verify_correct_password():
    """verify_password should return True for matching password"""
    plain = "correcthorsebatterystaple"
    hashed = get_password_hash(plain)
    assert verify_password(plain, hashed) is True


def test_verify_wrong_password():
    """verify_password should return False for non-matching password"""
    hashed = get_password_hash("rightpassword")
    assert verify_password("wrongpassword", hashed) is False


def test_same_password_different_hashes():
    """Same password hashed twice should produce different hashes (bcrypt salt)"""
    plain = "password123"
    hash1 = get_password_hash(plain)
    hash2 = get_password_hash(plain)
    assert hash1 != hash2


# ---------------------------------------------------------------------------
# Access token
# ---------------------------------------------------------------------------

def test_create_access_token_returns_string():
    """create_access_token should return a non-empty string"""
    token = create_access_token({"sub": "user-1", "role": "user"})
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token_type():
    """Decoded access token should have type='access'"""
    token = create_access_token({"sub": "user-1"})
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("type") == "access"


def test_decode_access_token_subject():
    """Decoded token should contain the original subject"""
    token = create_access_token({"sub": "user-42"})
    payload = decode_token(token)
    assert payload["sub"] == "user-42"


# ---------------------------------------------------------------------------
# Refresh token
# ---------------------------------------------------------------------------

def test_create_refresh_token_returns_string():
    """create_refresh_token should return a non-empty string"""
    token = create_refresh_token({"sub": "user-1"})
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_refresh_token_type():
    """Decoded refresh token should have type='refresh'"""
    token = create_refresh_token({"sub": "user-1"})
    payload = decode_token(token)
    assert payload is not None
    assert payload.get("type") == "refresh"


# ---------------------------------------------------------------------------
# Invalid tokens
# ---------------------------------------------------------------------------

def test_decode_invalid_token_returns_none():
    """decode_token should return None for a garbage string"""
    result = decode_token("not.a.valid.token")
    assert result is None


def test_decode_empty_string_returns_none():
    """decode_token should return None for an empty string"""
    result = decode_token("")
    assert result is None


# ---------------------------------------------------------------------------
# create_tokens_for_user helper
# ---------------------------------------------------------------------------

def test_create_tokens_for_user_returns_both_tokens():
    """create_tokens_for_user should include accessToken and refreshToken"""
    tokens = create_tokens_for_user("uid-1", "alice", "user")
    assert "accessToken" in tokens
    assert "refreshToken" in tokens
    assert "tokenType" in tokens
    assert tokens["tokenType"] == "Bearer"


def test_create_tokens_for_user_expires_in_seconds():
    """expiresIn should be a positive integer (seconds)"""
    tokens = create_tokens_for_user("uid-1", "alice", "user")
    assert tokens["expiresIn"] > 0
