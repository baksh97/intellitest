#!/usr/bin/env python3
"""
Database initialization script
Run this script to create the database and populate it with demo data
"""

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models import Base
from app.utils.demo_data import init_demo_data

def init_database():
    """Initialize database with tables and demo data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Creating demo data...")
    db = SessionLocal()
    try:
        init_demo_data(db)
    finally:
        db.close()
    
    print("Database initialization completed!")

if __name__ == "__main__":
    init_database()
