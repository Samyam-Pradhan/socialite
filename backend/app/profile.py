from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
from typing import Optional
from . import schemas, crud, database
from .auth import get_current_user
from .models import User

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)

@router.get("/", response_model=schemas.UserProfile)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get current user's profile"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    # Get fresh user data from database
    user = crud.get_user_by_id(db, current_user.id)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "bio": user.bio or "",
        "location": user.location or "",
        "website": user.website or "",
        "avatar": user.avatar or f"https://ui-avatars.com/api/?name={user.name}&background=6366f1&color=fff&size=150",
        "username": user.email.split('@')[0],
        "created_at": user.created_at
    }

@router.put("/", response_model=schemas.UserProfile)
def update_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update user profile"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    # Convert to dict, removing None values
    update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
    
    updated_user = crud.update_user_profile(db, current_user.id, update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return {
        "id": updated_user.id,
        "name": updated_user.name,
        "email": updated_user.email,
        "bio": updated_user.bio or "",
        "location": updated_user.location or "",
        "website": updated_user.website or "",
        "avatar": updated_user.avatar or f"https://ui-avatars.com/api/?name={updated_user.name}&background=6366f1&color=fff&size=150",
        "username": updated_user.email.split('@')[0],
        "created_at": updated_user.created_at
    }

@router.post("/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Upload profile avatar"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    # Validate file type
    if not avatar.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    # Create filename with timestamp to avoid caching
    file_extension = os.path.splitext(avatar.filename)[1]
    filename = f"avatar_{current_user.id}_{datetime.now().timestamp()}{file_extension}"
    file_path = f"uploads/avatars/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {str(e)}"
        )
    
    # Create URL for the file
    avatar_url = f"http://localhost:8000/uploads/avatars/{filename}"
    
    # Update user in database
    updated_user = crud.update_user_avatar(db, current_user.id, avatar_url)
    
    if not updated_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return {"avatarUrl": avatar_url}