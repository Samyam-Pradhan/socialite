from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
from fastapi.security import OAuth2PasswordBearer

from . import crud, database, schemas
from .security import create_access_token, verify_token
from .models import User

router = APIRouter(tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    new_user = crud.create_user(
        db,
        name=user.name,
        email=user.email,
        password=user.password
    )

    return new_user

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, user.email)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid credentials"
        )

    # Verify password
    password_bytes = user.password.encode('utf-8')
    hashed_bytes = db_user.password.encode('utf-8')
    
    if not bcrypt.checkpw(password_bytes, hashed_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    if not token:
        return None
    
    payload = verify_token(token)

    if payload is None:
        return None

    email = payload.get("sub")
    
    if not email:
        return None

    user = crud.get_user_by_email(db, email)
    return user

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }