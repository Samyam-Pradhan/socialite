# app/posts.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from . import schemas, crud, database, models  # ← Add models here
from .auth import get_current_user
from .models import User

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

# ── Routes ───────────────────────────────────────────────────────
@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(database.get_db)
):
    """Get all posts from database"""
    posts = crud.get_posts(db, skip=skip, limit=limit)
    
    # Convert to response format with user_name
    result = []
    for post in posts:
        post_dict = {
            "id": post.id,
            "user_id": post.user_id,
            "user_name": post.user.name if post.user else "Unknown User",
            "content": post.content,
            "tag": post.tag,
            "likes": post.likes,
            "comments": post.comments,
            "shares": post.shares,
            "created_at": post.created_at
        }
        result.append(post_dict)
    
    return result

@router.post("/", response_model=schemas.PostResponse)
def create_post(
    post: schemas.PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a new post"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db_post = crud.create_post(
        db, 
        user_id=current_user.id, 
        content=post.content, 
        tag=post.tag
    )
    
    # Return in the expected format
    return {
        "id": db_post.id,
        "user_id": db_post.user_id,
        "user_name": current_user.name,
        "content": db_post.content,
        "tag": db_post.tag,
        "likes": db_post.likes,
        "comments": db_post.comments,
        "shares": db_post.shares,
        "created_at": db_post.created_at
    }

@router.put("/{post_id}/like")
def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Like a post"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    updated_post = crud.like_post(db, post_id)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {"likes": updated_post.likes}

@router.post("/{post_id}/comment")
def comment_on_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Add a comment to a post"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    updated_post = crud.comment_on_post(db, post_id)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {"comments": updated_post.comments}

@router.post("/{post_id}/share")
def share_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Share a post"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    updated_post = crud.share_post(db, post_id)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {"shares": updated_post.shares}

# Optional: Get posts by user
@router.get("/user/{user_id}", response_model=List[schemas.PostResponse])
def get_user_posts(
    user_id: int,
    db: Session = Depends(database.get_db)
):
    """Get all posts by a specific user"""
    posts = db.query(models.Post)\
              .filter(models.Post.user_id == user_id)\
              .order_by(models.Post.created_at.desc())\
              .all()
    
    result = []
    for post in posts:
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "user_name": post.user.name if post.user else "Unknown User",
            "content": post.content,
            "tag": post.tag,
            "likes": post.likes,
            "comments": post.comments,
            "shares": post.shares,
            "created_at": post.created_at
        })
    
    return result