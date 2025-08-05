from fastapi import HTTPException, Header
from typing import Optional
import httpx
import os

DJANGO_BASE_URL = os.getenv('DJANGO_BASE_URL', 'http://localhost:8000')

async def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify JWT token with Django backend - required auth
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
        
    if not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format. Must be 'Bearer {token}'"
        )
        
    token = authorization.split(' ')[1]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DJANGO_BASE_URL}/api/users/verify-token/",
                json={"token": token}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid credentials"
                )
                
            return token
            
    except httpx.RequestError:
        raise HTTPException(
            status_code=500,
            detail="Failed to verify token with authentication service"
        )

async def optional_verify_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Verify JWT token with Django backend - optional auth
    Returns None if no token or invalid token
    """
    if not authorization or not authorization.startswith('Bearer '):
        return None
        
    token = authorization.split(' ')[1]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DJANGO_BASE_URL}/api/users/verify-token/",
                json={"token": token}
            )
            
            if response.status_code != 200:
                return None
                
            return token
            
    except httpx.RequestError:
        return None 