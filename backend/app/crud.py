# app/crud.py
from sqlalchemy.orm import Session
import bcrypt
from . import models, schemas

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

def get_posts(db: Session, skip: int = 0, limit: int = 50):
    return db.query(models.Post)\
             .order_by(models.Post.created_at.desc())\
             .offset(skip)\
             .limit(limit)\
             .all()

def get_post_by_id(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def like_post(db: Session, post_id: int):
    db_post = get_post_by_id(db, post_id)
    if db_post:
        db_post.likes += 1
        db.commit()
        db.refresh(db_post)
    return db_post

def comment_on_post(db: Session, post_id: int):
    db_post = get_post_by_id(db, post_id)
    if db_post:
        db_post.comments += 1
        db.commit()
        db.refresh(db_post)
    return db_post

def share_post(db: Session, post_id: int):
    db_post = get_post_by_id(db, post_id)
    if db_post:
        db_post.shares += 1
        db.commit()
        db.refresh(db_post)
    return db_post