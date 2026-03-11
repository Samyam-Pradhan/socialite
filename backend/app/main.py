from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import init_db
from .auth import router as auth_router
from .posts import router as posts_router
from .profile import router as profile_router

app = FastAPI(
    title="Socialite API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/avatars", exist_ok=True)

# Mount static files directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize database
init_db()

# Routers
app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(profile_router)

@app.get("/")
def root():
    return {"message": "Welcome to Socialite API"}