# check_db.py
from app.database import SessionLocal, engine
from app import models
from sqlalchemy import inspect, text

try:
    # Test connection
    with engine.connect() as conn:
        print("✅ Connected to database!")
        
        # Check which database we're connected to
        result = conn.execute(text("SELECT current_database()"))
        db_name = result.scalar()
        print(f"📊 Connected to database: {db_name}")
        
        # List all tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"📋 Existing tables: {tables}")
        
        # Check users table columns
        if 'users' in tables:
            columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"👤 Users table columns: {columns}")
        
        # Check posts table columns
        if 'posts' in tables:
            columns = [col['name'] for col in inspector.get_columns('posts')]
            print(f"📝 Posts table columns: {columns}")
            
except Exception as e:
    print(f"❌ Error: {e}")