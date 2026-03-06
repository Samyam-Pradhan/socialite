# app/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import and_
import bcrypt
from . import models, schemas

# -------- User CRUD --------
def create_user(db: Session, name: str, email: str, password: str):
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt).decode("utf-8")

    db_user = models.User(
        name=name,
        email=email,
        password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# -------- Post CRUD --------
def create_post(db: Session, user_id: int, content: str, tag: str = "General"):
    db_post = models.Post(
        user_id=user_id,
        content=content,
        tag=tag
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 50, current_user_id: int = None):
    posts = db.query(models.Post)\
             .order_by(models.Post.created_at.desc())\
             .offset(skip)\
             .limit(limit)\
             .all()
    
    result = []
    for post in posts:
        # Check if current user liked this post
        is_liked = False
        if current_user_id:
            like = db.query(models.Like).filter(
                and_(
                    models.Like.user_id == current_user_id,
                    models.Like.post_id == post.id
                )
            ).first()
            is_liked = like is not None
        
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "user_name": post.user.name if post.user else "Unknown User",
            "user_email": post.user.email if post.user else "",
            "content": post.content,
            "tag": post.tag,
            "likes": post.likes,
            "comments": post.comments,
            "shares": post.shares,
            "created_at": post.created_at,
            "is_liked": is_liked
        })
    
    return result

def get_post_by_id(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def toggle_like(db: Session, user_id: int, post_id: int):
    """Toggle like on a post. Returns updated like count and liked status."""
    # Check if like exists
    existing_like = db.query(models.Like).filter(
        and_(
            models.Like.user_id == user_id,
            models.Like.post_id == post_id
        )
    ).first()
    
    post = get_post_by_id(db, post_id)
    if not post:
        return None, None
    
    if existing_like:
        # Unlike - remove like
        db.delete(existing_like)
        post.likes -= 1
        liked = False
    else:
        # Like - add like
        new_like = models.Like(user_id=user_id, post_id=post_id)
        db.add(new_like)
        post.likes += 1
        liked = True
    
    db.commit()
    db.refresh(post)
    
    return post.likes, liked

def share_post(db: Session, post_id: int):
    db_post = get_post_by_id(db, post_id)
    if db_post:
        db_post.shares += 1
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int, user_id: int):
    """Delete a post only if the user is the owner"""
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    
    if not post:
        return None, "Post not found"
    
    # Check if user is the owner
    if post.user_id != user_id:
        return None, "You can only delete your own posts"
    
    # Delete the post (cascade will delete associated comments and likes)
    db.delete(post)
    db.commit()
    
    return True, "Post deleted successfully"

# -------- Comment CRUD --------
def create_comment(db: Session, user_id: int, post_id: int, content: str):
    db_comment = models.Comment(
        user_id=user_id,
        post_id=post_id,
        content=content
    )
    db.add(db_comment)
    
    # Increment comments count on post
    post = get_post_by_id(db, post_id)
    if post:
        post.comments += 1
    
    db.commit()
    db.refresh(db_comment)
    
    return {
        "id": db_comment.id,
        "content": db_comment.content,
        "user_id": db_comment.user_id,
        "user_name": db_comment.user.name if db_comment.user else "Unknown User",
        "post_id": db_comment.post_id,
        "created_at": db_comment.created_at
    }

def get_post_comments(db: Session, post_id: int):
    comments = db.query(models.Comment)\
                 .filter(models.Comment.post_id == post_id)\
                 .order_by(models.Comment.created_at.desc())\
                 .all()
    
    result = []
    for comment in comments:
        result.append({
            "id": comment.id,
            "content": comment.content,
            "user_id": comment.user_id,
            "user_name": comment.user.name if comment.user else "Unknown User",
            "post_id": comment.post_id,
            "created_at": comment.created_at
        })
    
    return result