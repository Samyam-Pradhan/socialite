from .database import engine
try:
    conn = engine.connect()
    print("Database connected successfully!")
except Exception as e:
    print("Connection failed:", e)