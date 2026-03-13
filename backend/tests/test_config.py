"""
Tests for application configuration
"""

from app.config import get_settings, Settings


def test_settings_defaults():
    """Settings should have sensible defaults"""
    settings = get_settings()
    assert settings.APP_NAME == "Simplingua API"
    assert settings.APP_VERSION == "1.0.0"
    assert isinstance(settings.PORT, int)
    assert settings.PORT == 8000


def test_settings_jwt_algorithm():
    """JWT algorithm should be HS256"""
    settings = get_settings()
    assert settings.JWT_ALGORITHM == "HS256"


def test_settings_cors_origins_is_list():
    """CORS origins should be a list"""
    settings = get_settings()
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) > 0


def test_settings_rate_limits_positive():
    """Rate limits should be positive integers"""
    settings = get_settings()
    assert settings.RATE_LIMIT_ANONYMOUS > 0
    assert settings.RATE_LIMIT_USER > 0
    assert settings.RATE_LIMIT_PERIOD_SECONDS > 0


def test_settings_token_expiry_positive():
    """Token expiry durations should be positive"""
    settings = get_settings()
    assert settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES > 0
    assert settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS > 0


def test_get_settings_returns_same_instance():
    """get_settings should return a cached singleton"""
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2
