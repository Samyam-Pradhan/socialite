from fastapi import FastAPI
from .database import init_db

app = FastAPI()

init_db() # Automatically create tables on startup

@app.get("/")
def root():
    return {"message": "Socialite API running"}