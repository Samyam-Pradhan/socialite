from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List
from sqlalchemy.orm import Session
from . import schemas, crud, database
from .auth import get_current_user
from .models import User

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

@router.get("/", response_model=List[schemas.PostResponse])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get all posts with like status for current user"""
    current_user_id = current_user.id if current_user else None
    posts = crud.get_posts(db, skip=skip, limit=limit, current_user_id=current_user_id)
    return posts

@router.get("/user", response_model=List[schemas.PostResponse])
def get_user_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get posts for the current user"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    posts = crud.get_user_posts(db, current_user.id)
    return posts

@router.post("/", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post: schemas.PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a new post"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    db_post = crud.create_post(
        db, 
        user_id=current_user.id, 
        content=post.content, 
        tag=post.tag
    )
    
    return {
        "id": db_post.id,
        "user_id": db_post.user_id,
        "user_name": current_user.name,
        "user_email": current_user.email,
        "content": db_post.content,
        "tag": db_post.tag,
        "likes": db_post.likes,
        "comments": db_post.comments,
        "shares": db_post.shares,
        "created_at": db_post.created_at,
        "is_liked": False
    }

@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Toggle like on a post (like/unlike)"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    likes_count, liked = crud.toggle_like(db, current_user.id, post_id)
    
    if likes_count is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Post not found"
        )
    
    return {
        "likes": likes_count,
        "liked": liked
    }

@router.post("/{post_id}/share")
def share_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Share a post"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    updated_post = crud.share_post(db, post_id)
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Post not found"
        )
    
    return {"shares": updated_post.shares}

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete a post (only by the owner)"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    result, message = crud.delete_post(db, post_id, current_user.id)
    
    if not result:
        if message == "Post not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=message
            )
    
    return {"message": message}

@router.get("/{post_id}/comments", response_model=List[schemas.CommentResponse])
def get_comments(
    post_id: int,
    db: Session = Depends(database.get_db)
):
    """Get all comments for a post"""
    comments = crud.get_post_comments(db, post_id)
    return comments

@router.post("/{post_id}/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a comment on a post"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated"
        )
    
    db_comment = crud.create_comment(db, current_user.id, post_id, comment.content)
    return db_comment