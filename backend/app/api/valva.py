"""
Valva (Forum) API Router
Forum posts, replies, votes
"""

from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.forum import ForumPost, ForumVote
from app.schemas.forum import (
    ForumPostCreate,
    ForumPostUpdate,
    ForumPostResponse,
    ForumPostListResponse,
    ForumReplyCreate,
    VoteRequest,
)

router = APIRouter(prefix="/api/v1/valva", tags=["valva"])


@router.get("/posts", response_model=ForumPostListResponse)
async def get_posts(
    category: Optional[str] = None,
    author: Optional[str] = None,
    tags: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List forum posts with filtering"""
    query = db.query(ForumPost).filter(ForumPost.status == "active")

    # Filters
    if category:
        query = query.filter(ForumPost.category == category)
    if author:
        query = query.join(User).filter(User.username == author)
    if tags:
        tag_list = tags.split(",")
        query = query.filter(ForumPost.tags.overlap(tag_list))

    results = query.order_by(ForumPost.created_at.desc()).limit(limit).offset(offset).all()

    post_responses = []
    for post in results:
        # Get author username
        author = db.query(User).filter(User.id == post.author_id).first()

        # Get vote score
        vote_score = db.query(func.sum(
            func.case((ForumVote.vote_type == "up", 1), else_=-1)
        )).filter(ForumVote.post_id == post.id).scalar() or 0

        post_responses.append({
            "id": str(post.id),
            "title": post.title,
            "content": post.content,
            "author_id": str(post.author_id),
            "author_username": author.username if author else None,
            "category": post.category,
            "tags": post.tags or [],
            "language": post.language,
            "parent_id": str(post.parent_id) if post.parent_id else None,
            "status": post.status,
            "view_count": post.view_count,
            "reply_count": post.reply_count,
            "vote_score": vote_score or 0,
            "user_vote": None,
            "created_at": post.created_at,
            "last_modified": post.last_modified
        })

    return {
        "success": True,
        "results": post_responses,
        "pagination": {
            "total": query.count(),
            "limit": limit,
            "offset": offset
        }
    }


@router.post("/posts", response_model=ForumPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new forum post"""
    new_post = ForumPost(
        title=post.title,
        content=post.content,
        author_id=current_user.id,
        category=post.category,
        tags=post.tags,
        language=post.language,
        status="active"
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "id": str(new_post.id),
        "title": new_post.title,
        "content": new_post.content,
        "author_id": str(new_post.author_id),
        "author_username": current_user.username,
        "category": new_post.category,
        "tags": new_post.tags,
        "language": new_post.language,
        "parent_id": None,
        "status": new_post.status,
        "view_count": 0,
        "reply_count": 0,
        "vote_score": 0,
        "user_vote": None,
        "created_at": new_post.created_at,
        "last_modified": new_post.last_modified
    }


@router.get("/posts/{post_id}", response_model=ForumPostResponse)
async def get_post(
    post_id: str,
    db: Session = Depends(get_db)
):
    """Get specific post with replies"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Increment view count
    post.view_count += 1
    db.commit()

    # Get author
    author = db.query(User).filter(User.id == post.author_id).first()

    # Get replies
    replies = db.query(ForumPost).filter(ForumPost.parent_id == post_id).all()

    return {
        "id": str(post.id),
        "title": post.title,
        "content": post.content,
        "author_id": str(post.author_id),
        "author_username": author.username if author else None,
        "category": post.category,
        "tags": post.tags or [],
        "language": post.language,
        "parent_id": str(post.parent_id) if post.parent_id else None,
        "status": post.status,
        "view_count": post.view_count,
        "reply_count": len(replies),
        "vote_score": 0,
        "user_vote": None,
        "created_at": post.created_at,
        "last_modified": post.last_modified
    }


@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    post_update: ForumPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update post (author/moderator only)"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check authorization
    if post.author_id != current_user.id and current_user.role not in ["admin", "super", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    update_data = post_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    post.last_modified = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Post updated successfully"}


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete post (author/moderator only)"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check authorization
    if post.author_id != current_user.id and current_user.role not in ["admin", "super", "moderator"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()

    return {"success": True, "message": "Post deleted successfully"}


@router.post("/posts/{post_id}/replies", status_code=status.HTTP_201_CREATED)
async def reply_to_post(
    post_id: str,
    reply: ForumReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reply to post"""
    parent_post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not parent_post:
        raise HTTPException(status_code=404, detail="Parent post not found")

    new_reply = ForumPost(
        content=reply.content,
        author_id=current_user.id,
        category=parent_post.category,
        language=parent_post.language,
        parent_id=post_id,
        status="active"
    )

    db.add(new_reply)
    db.commit()

    # Update reply count
    parent_post.reply_count += 1
    db.commit()

    return {"success": True, "message": "Reply created successfully"}


@router.post("/posts/{post_id}/vote")
async def vote_on_post(
    post_id: str,
    vote: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vote on post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if already voted
    existing_vote = db.query(ForumVote).filter(
        ForumVote.post_id == post_id,
        ForumVote.user_id == current_user.id
    ).first()

    if existing_vote:
        # Update vote
        existing_vote.vote_type = vote.vote_type
        db.commit()
    else:
        # Create new vote
        new_vote = ForumVote(
            post_id=post_id,
            user_id=current_user.id,
            vote_type=vote.vote_type
        )
        db.add(new_vote)
        db.commit()

    return {"success": True, "message": "Vote recorded"}


@router.post("/posts/{post_id}/flag")
async def flag_post(post_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Flag inappropriate content"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.flag_count += 1
    db.commit()

    return {"success": True, "message": "Post flagged for moderation"}
