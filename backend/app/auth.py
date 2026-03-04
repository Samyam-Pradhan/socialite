from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.hash import bcrypt

from . import crud, database

router = APIRouter()


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = crud.create_user(db, user.name, user.email, user.password)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, user.email)

    if not db_user or not bcrypt.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {"message": f"Welcome back, {db_user.name}!"}