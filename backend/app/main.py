# app/main.py

from fastapi import FastAPI
from .database import init_db
from .auth import router as auth_router

app = FastAPI(
    title="Socialite API",
    version="1.0.0"
)

# Create tables
init_db()

# Register routes
app.include_router(auth_router)