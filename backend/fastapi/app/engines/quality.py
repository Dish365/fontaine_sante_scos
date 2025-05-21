from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..schemas.quality import (
    QualityInput,
    QualityAssessment,
    QualityOutput,
    QualityResponse
)
from ..services.calculation_service import CalculationService
from ..dependencies import get_calculation_service

router = APIRouter(
    prefix="/quality",
    tags=["quality"]
)

@router.get("/")
async def root():
    return {"message": "Quality Assessment Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/assess", response_model=QualityResponse)
async def assess_quality(
    data: QualityInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.assess_quality(data)
        return QualityResponse(
            success=True,
            data=QualityOutput(
                quality_score=result.quality_score,
                risk_level=result.risk_level,
                improvement_areas=result.improvement_areas
            )
        )
    except Exception as e:
        return QualityResponse(
            success=False,
            error=str(e)
        ) 