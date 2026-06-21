from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App
    APP_NAME: str = "SmartAppraisal"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://appraiser:secure_password_here@localhost:5432/appraisal"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:8000"
    ).split(",")
    
    # AI/ML
    ML_MODEL_PATH: str = os.getenv("ML_MODEL_PATH", "models/pricing_model.h5")
    USE_AI_MODEL: bool = os.getenv("USE_AI_MODEL", "False").lower() == "true"
    
    # Export
    EXPORT_MAX_ROWS: int = 10000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()