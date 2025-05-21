from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..schemas.economic import (
    SupplierCostInput,
    EconomicScoreOutput,
    OptimizationResult
)
from ..services.calculation_service import CalculationService
from ..dependencies import get_calculation_service

router = APIRouter(
    prefix="/economic",
    tags=["economic"]
)

@router.get("/")
async def root():
    return {"message": "Economic Calculator Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/calculate-score", response_model=EconomicScoreOutput)
async def calculate_economic_score(
    data: SupplierCostInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.calculate_economic_score(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/optimize", response_model=OptimizationResult)
async def optimize_sourcing(
    data: List[SupplierCostInput],
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.optimize_sourcing(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 