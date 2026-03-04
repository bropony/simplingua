"""
Authentication API Router
User registration, login, logout, token refresh
"""

from datetime import timedelta, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    decode_token,
    create_tokens_for_user,
)
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRequest,
)

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


@router.post("/register", response_model=dict)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """User registration"""
    # Check if username exists
    if db.query(User).filter(User.username == user_create.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email exists
    if db.query(User).filter(User.email == user_create.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = User(
        username=user_create.username,
        email=user_create.email,
        password_hash=get_password_hash(user_create.password),
        preferred_language=user_create.preferred_language,
        role="user",
        status="active"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate tokens
    tokens = create_tokens_for_user(
        user_id=str(user.id),
        username=user.username,
        role=user.role
    )

    return {
        "success": True,
        "user": {
            "id": str(user.id),
            "username": user.username,
            "role": user.role
        },
        "tokens": tokens
    }


@router.post("/login", response_model=dict)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """User authentication"""
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == user_login.username) | (User.email == user_login.username)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not verify_password(user_login.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Generate tokens
    tokens = create_tokens_for_user(
        user_id=str(user.id),
        username=user.username,
        role=user.role
    )

    return {
        "success": True,
        "user": {
            "id": str(user.id),
            "username": user.username,
            "role": user.role
        },
        "tokens": tokens
    }


@router.post("/logout")
async def logout():
    """User logout (client-side token removal)"""
    return {"success": True, "message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: TokenRequest, db: Session = Depends(get_db)):
    """Refresh access token"""
    payload = decode_token(request.refreshToken)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Generate new tokens
    tokens = create_tokens_for_user(
        user_id=str(user.id),
        username=user.username,
        role=user.role
    )

    return tokens
