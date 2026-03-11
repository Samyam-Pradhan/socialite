from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

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

class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    avatar: Optional[str] = None
    username: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None

# -------- Post Schemas --------
class PostCreate(BaseModel):
    content: str
    tag: str = "General"

class PostResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    content: str
    tag: str
    likes: int
    comments: int
    shares: int
    created_at: datetime
    is_liked: Optional[bool] = False

    class Config:
        from_attributes = True

# -------- Comment Schemas --------
class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    user_name: str
    post_id: int
    created_at: datetime

    class Config:
        from_attributes = True