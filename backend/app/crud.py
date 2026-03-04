from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from . import models


def create_user(db: Session, name: str, email: str, password: str):
    hashed_password = bcrypt.hash(password)

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