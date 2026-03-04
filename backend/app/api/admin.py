"""
Admin API Router
Content management, user administration
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.word import Word
from app.models.grammar import Grammar
from app.models.textbook import Textbook
from app.models.forum import ForumPost
from app.schemas.user import UserResponse
from app.schemas.admin import (
    UserListResponse,
    RoleChangeResponse,
    StatusChangeResponse,
    ContentManageResponse,
    ContentDeleteResponse,
    ContentModerationResponse,
    AnalyticsResponse,
    BackupResponse,
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin or super role"""
    if current_user.role not in ["admin", "super"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_super(current_user: User = Depends(get_current_user)) -> User:
    """Require super role"""
    if current_user.role != "super":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user


# =============================================================================
# User Administration
# =============================================================================

@router.get("/users", response_model=UserListResponse)
async def list_users(
    current_user: User = Depends(require_admin),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List users with filtering"""
    users = db.query(User).limit(limit).offset(offset).all()

    return {
        "users": [
            {
                "id": str(u.id),
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "status": u.status,
                "join_date": u.join_date
            }
            for u in users
        ],
        "total": db.query(User).count()
    }


@router.put("/users/{user_id}/role", response_model=RoleChangeResponse)
async def change_user_role(
    user_id: str,
    new_role: str,
    current_user: User = Depends(require_super),
    db: Session = Depends(get_db)
):
    """Change user role (super only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = new_role
    db.commit()

    return {"success": True, "message": f"User role changed to {new_role}"}


@router.put("/users/{user_id}/status", response_model=StatusChangeResponse)
async def update_user_status(
    user_id: str,
    new_status: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = new_status
    db.commit()

    return {"success": True, "message": f"User status changed to {new_status}"}


# =============================================================================
# Content Management
# =============================================================================

@router.post("/words", response_model=ContentManageResponse)
async def add_words(
    entries: List[dict],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add/update word entries"""
    added_count = 0

    for entry in entries:
        # Check if word exists
        existing_word = db.query(Word).filter(Word.word == entry.get("word")).first()

        if existing_word:
            # Update existing
            for field, value in entry.items():
                setattr(existing_word, field, value)
            existing_word.approved_by = current_user.id
            existing_word.last_modified = None
        else:
            # Create new
            new_word = Word(**entry, approved_by=current_user.id)
            db.add(new_word)
            added_count += 1

    db.commit()
    return {"success": True, "added": added_count}


@router.delete("/words/{word_id}", response_model=ContentDeleteResponse)
async def delete_word(
    word_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete word entry"""
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    db.delete(word)
    db.commit()

    return {"success": True, "message": "Word deleted"}


@router.post("/grammar", response_model=ContentManageResponse)
async def add_grammar(
    entries: List[dict],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add/update grammar entries"""
    added_count = 0

    for entry in entries:
        existing_grammar = db.query(Grammar).filter(
            Grammar.name == entry.get("name"),
            Grammar.section_id == entry.get("section_id")
        ).first()

        if existing_grammar:
            # Update existing
            for field, value in entry.items():
                setattr(existing_grammar, field, value)
            existing_grammar.approved_by = current_user.id
            existing_grammar.last_modified = None
        else:
            # Create new
            new_grammar = Grammar(**entry, approved_by=current_user.id)
            db.add(new_grammar)
            added_count += 1

    db.commit()
    return {"success": True, "added": added_count}


@router.delete("/grammar/{grammar_id}", response_model=ContentDeleteResponse)
async def delete_grammar(
    grammar_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete grammar entry"""
    grammar = db.query(Grammar).filter(Grammar.id == grammar_id).first()
    if not grammar:
        raise HTTPException(status_code=404, detail="Grammar not found")

    db.delete(grammar)
    db.commit()

    return {"success": True, "message": "Grammar deleted"}


@router.post("/textbooks", response_model=ContentManageResponse)
async def add_textbooks(
    entries: List[dict],
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add/update textbooks"""
    added_count = 0

    for entry in entries:
        existing_textbook = db.query(Textbook).filter(Textbook.title == entry.get("title")).first()

        if existing_textbook:
            # Update existing
            for field, value in entry.items():
                setattr(existing_textbook, field, value)
            existing_textbook.approved_by = current_user.id
            existing_textbook.last_modified = None
        else:
            # Create new
            new_textbook = Textbook(**entry, approved_by=current_user.id)
            db.add(new_textbook)
            added_count += 1

    db.commit()
    return {"success": True, "added": added_count}


@router.delete("/textbooks/{textbook_id}", response_model=ContentDeleteResponse)
async def delete_textbook(
    textbook_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete textbook"""
    textbook = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not textbook:
        raise HTTPException(status_code=404, detail="Textbook not found")

    db.delete(textbook)
    db.commit()

    return {"success": True, "message": "Textbook deleted"}


@router.post("/content/approve", response_model=ContentModerationResponse)
async def approve_content(
    content_type: str,
    content_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Approve pending content"""
    # Find and approve based on content type
    if content_type == "word":
        content = db.query(Word).filter(Word.id == content_id).first()
    elif content_type == "grammar":
        content = db.query(Grammar).filter(Grammar.id == content_id).first()
    elif content_type == "textbook":
        content = db.query(Textbook).filter(Textbook.id == content_id).first()
    elif content_type == "post":
        content = db.query(ForumPost).filter(ForumPost.id == content_id).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid content type")

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = "active"
    content.approved_by = current_user.id
    db.commit()

    return {"success": True, "message": "Content approved"}


@router.post("/content/reject", response_model=ContentModerationResponse)
async def reject_content(
    content_type: str,
    content_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Reject pending content"""
    if content_type == "word":
        content = db.query(Word).filter(Word.id == content_id).first()
    elif content_type == "grammar":
        content = db.query(Grammar).filter(Grammar.id == content_id).first()
    elif content_type == "textbook":
        content = db.query(Textbook).filter(Textbook.id == content_id).first()
    elif content_type == "post":
        content = db.query(ForumPost).filter(ForumPost.id == content_id).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid content type")

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = "rejected"
    db.commit()

    return {"success": True, "message": "Content rejected"}


# =============================================================================
# Analytics & System
# =============================================================================

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """System usage analytics"""
    # Placeholder for analytics data
    return {
        "total_users": db.query(User).count(),
        "total_words": db.query(Word).filter(Word.status == "active").count(),
        "total_posts": db.query(ForumPost).filter(ForumPost.status == "active").count(),
        "recent_registrations": 0,
        "active_today": 0
    }


@router.post("/backup", response_model=BackupResponse)
async def create_backup(
    current_user: User = Depends(require_super),
    db: Session = Depends(get_db)
):
    """Create system backup"""
    # Placeholder - in production, implement actual backup
    return {"success": True, "message": "Backup initiated", "backup_id": "pending"}
