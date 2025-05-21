from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..schemas.environmental import (
    EnvironmentalInput,
    EnvironmentalAssessment,
    EnvironmentalOutput,
    EnvironmentalResponse
)
from ..services.calculation_service import CalculationService
from ..dependencies import get_calculation_service

router = APIRouter(
    prefix="/environmental",
    tags=["environmental"]
)

@router.get("/")
async def root():
    return {"message": "Environmental Assessment Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/assess", response_model=EnvironmentalResponse)
async def assess_environmental_impact(
    data: EnvironmentalInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.assess_environmental_impact(data)
        return EnvironmentalResponse(
            success=True,
            data=EnvironmentalOutput(
                environmental_score=result.environmental_score,
                carbon_footprint=result.carbon_footprint,
                sustainability_level=result.sustainability_level,
                recommendations=result.recommendations
            )
        )
    except Exception as e:
        return EnvironmentalResponse(
            success=False,
            error=str(e)
        ) 