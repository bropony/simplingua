"""
Users API Router
User profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "preferred_language": current_user.preferred_language,
        "theme": current_user.theme,
        "bio": current_user.bio,
        "website": current_user.website,
        "avatar_url": current_user.avatar_url,
        "join_date": current_user.join_date,
        "last_login": current_user.last_login
    }


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    update_data = user_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "preferred_language": current_user.preferred_language,
        "theme": current_user.theme,
        "bio": current_user.bio,
        "website": current_user.website,
        "avatar_url": current_user.avatar_url,
        "join_date": current_user.join_date,
        "last_login": current_user.last_login
    }


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account"""
    # In production, verify password or use confirmation token
    db.delete(current_user)
    db.commit()

    return {"success": True, "message": "Account deleted successfully"}
