from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from ..schemas.transportation import (
    TransportationInput,
    TransportationAssessment,
    TransportationResponse
)
from ..services.calculation_service import CalculationService
from ..dependencies import get_calculation_service

router = APIRouter(
    prefix="/transportation",
    tags=["transportation"]
)

@router.get("/")
async def root():
    return {"message": "Transportation Emission Calculation Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/calculate", response_model=TransportationResponse)
async def calculate_transportation_emissions(
    data: TransportationInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.calculate_transportation_emissions(data)
        return TransportationResponse(
            success=True,
            data=result
        )
    except Exception as e:
        return TransportationResponse(
            success=False,
            error=str(e)
        )

@router.post("/optimize")
async def optimize_transportation(
    data: Dict[str, Any],
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.calculate_transportation(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 