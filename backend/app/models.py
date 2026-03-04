from sqlalchemy import Column, Integer, String
from .database import Base  # Base comes from database.py

class User(Base):
    __tablename__ = "users"  # Table name in the database
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)