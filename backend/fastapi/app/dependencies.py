from fastapi import Header, HTTPException, Depends
from typing import Optional
from .services.calculation_service import CalculationService
from .config import settings

async def verify_token(x_token: str = Header(...)):
    if not x_token:
        raise HTTPException(status_code=400, detail="X-Token header missing")
    # Add token verification logic
    return x_token

def get_calculation_service():
    return CalculationService()
