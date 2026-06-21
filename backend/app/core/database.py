from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import redis
import json

from app.core.config import settings

# PostgreSQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Redis cache
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Cache helper
def cache_get(key: str):
    """Get value from cache"""
    value = redis_client.get(key)
    if value:
        return json.loads(value)
    return None

def cache_set(key: str, value, expire: int = 300):
    """Set value in cache with expiration"""
    redis_client.setex(key, expire, json.dumps(value))

def cache_delete(key: str):
    """Delete key from cache"""
    redis_client.delete(key)

def cache_clear_pattern(pattern: str):
    """Clear all keys matching pattern"""
    keys = redis_client.keys(pattern)
    if keys:
        redis_client.delete(*keys)