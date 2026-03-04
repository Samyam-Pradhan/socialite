from fastapi import APIRouter, Depends, HTTPException, status, Security
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.hash import bcrypt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from . import crud, database
from .security import create_access_token, verify_token

router = APIRouter()

# OAuth2 scheme for Swagger
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


# Custom wrapper to show "email" in Swagger instead of "username"
class OAuth2PasswordRequestFormEmail:
    """
    Maps username -> email for OAuth2PasswordRequestForm
    """
    def __init__(self, form_data: OAuth2PasswordRequestForm = Depends()):
        self.email = form_data.username
        self.password = form_data.password


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = crud.create_user(db, user.name, user.email, user.password)
    return {"id": new_user.id, "name": new_user.name, "email": new_user.email}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestFormEmail = Depends(),
    db: Session = Depends(database.get_db)
):
    db_user = crud.get_user_by_email(db, form_data.email)
    if not db_user or not bcrypt.verify(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_current_user(
    current_user_email: str = Security(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    payload = verify_token(current_user_email)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    email = payload.get("sub")
    user = crud.get_user_by_email(db, email)
    return {"id": user.id, "name": user.name, "email": user.email}