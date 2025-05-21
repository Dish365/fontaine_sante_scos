# app/config.py

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Fontaine SCOS"
    DJANGO_URL: str = "http://localhost:8000"
    
    # Calculation Parameters
    MAX_OPTIMIZATION_ITERATIONS: int = 1000
    DEFAULT_TOLERANCE: float = 0.0001
    
    # Caching
    CACHE_TTL: int = 3600  # 1 hour
    
    # API Settings
    API_KEY: str = "your-secret-api-key"  # Change this in production!
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: str = "http://localhost:8000,http://localhost:3000"
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = 'utf-8'

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()