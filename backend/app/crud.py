# app/crud.py

from sqlalchemy.orm import Session
import bcrypt  # Change this line
from . import models


def create_user(db: Session, name: str, email: str, password: str):

    # Hash password using bcrypt directly
    # Convert password to bytes, hash it, then decode back to string
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

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