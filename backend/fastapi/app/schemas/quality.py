from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class QualityInput(BaseModel):
    material_id: int = Field(..., description="Unique identifier for the material")
    measurements: Dict[str, float] = Field(..., description="Quality measurements")
    standards: Dict[str, float] = Field(..., description="Quality standards")
    supplier_id: str = Field(..., description="Unique identifier for the supplier")
    defect_rate: float = Field(..., ge=0, le=100, description="Defect rate percentage")
    customer_satisfaction: float = Field(..., ge=0, le=100, description="Customer satisfaction score")
    compliance_score: float = Field(..., ge=0, le=100, description="Compliance score")
    process_efficiency: float = Field(..., ge=0, le=100, description="Process efficiency score")
    certification_status: List[str] = Field(..., description="List of quality certifications")
    audit_history: List[Dict[str, Any]] = Field(..., description="History of quality audits")
    
class QualityAssessment(BaseModel):
    material_id: int = Field(..., description="Unique identifier for the material")
    quality_score: float = Field(..., description="Overall quality score")
    compliance_details: Dict[str, bool] = Field(..., description="Compliance status for each standard")
    recommendations: List[str] = Field(..., description="Quality improvement recommendations")
    overall_score: float = Field(..., description="Overall quality score")
    risk_level: str = Field(..., description="Risk level assessment")
    improvement_areas: List[str] = Field(..., description="Areas needing improvement")
    certification_status: Dict[str, bool] = Field(..., description="Status of required certifications")
    audit_summary: Dict[str, Any] = Field(..., description="Summary of audit findings")

class QualityOutput(BaseModel):
    quality_score: float = Field(..., description="Overall quality score")
    risk_level: str = Field(..., description="Risk level assessment")
    improvement_areas: List[str] = Field(..., description="Areas needing improvement")
    
class QualityResponse(BaseModel):
    success: bool = Field(..., description="Whether the calculation was successful")
    data: Optional[QualityOutput] = Field(None, description="Quality calculation results")
    error: Optional[str] = Field(None, description="Error message if calculation failed") 