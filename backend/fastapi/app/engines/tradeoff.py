from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..schemas.tradeoff import (
    TradeoffInput,
    TradeoffAnalysis,
    TradeoffOutput,
    TradeoffResponse,
    OptimizationPreferences
)
from ..services.calculation_service import CalculationService
from ..dependencies import get_calculation_service

router = APIRouter(
    prefix="/tradeoff",
    tags=["tradeoff"]
)

@router.get("/")
async def root():
    return {"message": "Tradeoff Analysis Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/analyze", response_model=TradeoffResponse)
async def analyze_tradeoffs(
    data: TradeoffInput,
    preferences: OptimizationPreferences,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.analyze_tradeoffs(data, preferences)
        return TradeoffResponse(
            success=True,
            data=TradeoffOutput(
                overall_score=result.overall_score,
                balanced_score=result.balanced_score,
                recommendations=result.recommendations,
                risk_assessment=str(result.risk_assessment)
            )
        )
    except Exception as e:
        return TradeoffResponse(
            success=False,
            error=str(e)
        ) 