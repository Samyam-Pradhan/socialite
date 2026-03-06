# app/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

# -------- User Schemas --------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

# -------- Post Schemas --------
class PostCreate(BaseModel):
    content: str
    tag: str = "General"

class PostResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    content: str
    tag: str
    likes: int
    comments: int
    shares: int
    created_at: datetime

    class Config:
        from_attributes = True