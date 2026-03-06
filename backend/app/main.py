# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .auth import router as auth_router
from .posts import router as posts_router

app = FastAPI(
    title="Socialite API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# Routers
app.include_router(auth_router)
app.include_router(posts_router)

@app.get("/")
def root():
    return {"message": "Welcome to Socialite API"}