from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TradeoffInput(BaseModel):
    supplier_id: str = Field(..., description="Unique identifier for the supplier")
    economic_score: float = Field(..., ge=0, le=100, description="Economic performance score")
    quality_score: float = Field(..., ge=0, le=100, description="Quality performance score")
    environmental_score: float = Field(..., ge=0, le=100, description="Environmental performance score")
    historical_performance: Dict[str, float] = Field(..., description="Historical performance metrics")
    risk_factors: Dict[str, float] = Field(..., description="Risk factors and their scores")
    
class OptimizationPreferences(BaseModel):
    economic_weight: float = Field(..., ge=0, le=1, description="Weight for economic factors")
    quality_weight: float = Field(..., ge=0, le=1, description="Weight for quality factors")
    environmental_weight: float = Field(..., ge=0, le=1, description="Weight for environmental factors")
    risk_tolerance: float = Field(..., ge=0, le=1, description="Risk tolerance threshold")
    optimization_goals: List[str] = Field(..., description="List of optimization goals")
    
class TradeoffAnalysis(BaseModel):
    overall_score: float = Field(..., description="Overall balanced score")
    balanced_score: float = Field(..., description="Weighted balanced score")
    risk_assessment: Dict[str, Any] = Field(..., description="Risk assessment details")
    tradeoff_matrix: Dict[str, Dict[str, float]] = Field(..., description="Matrix of tradeoffs between dimensions")
    recommendations: List[str] = Field(..., description="List of recommendations")
    optimization_suggestions: List[Dict[str, Any]] = Field(..., description="Detailed optimization suggestions")

class TradeoffOutput(BaseModel):
    overall_score: float = Field(..., description="Overall weighted score")
    balanced_score: Dict[str, float] = Field(..., description="Scores for each dimension")
    recommendations: List[str] = Field(..., description="Recommendations for improvement")
    risk_assessment: str = Field(..., description="Overall risk assessment")
    
class TradeoffResponse(BaseModel):
    success: bool = Field(..., description="Whether the calculation was successful")
    data: Optional[TradeoffOutput] = Field(None, description="Tradeoff calculation results")
    error: Optional[str] = Field(None, description="Error message if calculation failed") 