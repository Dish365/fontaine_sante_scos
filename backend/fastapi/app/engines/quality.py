from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class QualityMetrics(BaseModel):
    value: float
    score: float
    weight: float

class QualityMetricsBreakdown(BaseModel):
    defect_rate: QualityMetrics
    customer_satisfaction: QualityMetrics
    compliance: QualityMetrics
    process_efficiency: QualityMetrics

class QualityResponse(BaseModel):
    quality_score: float
    risk_level: str
    quality_metrics: Dict[str, Dict[str, float]]
    certifications: List[str]
    recommendations: List[str]
    improvement_areas: List[str]

class QualityEngine:
    """Quality analysis engine for supplier assessment"""
    
    def __init__(self):
        self.logger = logger

    def validate_input(self, data: Dict[str, Any]) -> None:
        """Validate input data"""
        required_fields = ['defect_rate', 'customer_satisfaction', 'compliance_score', 'process_efficiency']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise Exception(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate value ranges
        if not 0 <= data['defect_rate'] <= 100:
            raise Exception("Defect rate must be between 0 and 100")
        if not 0 <= data['customer_satisfaction'] <= 100:
            raise Exception("Customer satisfaction must be between 0 and 100")
        if not 0 <= data['compliance_score'] <= 100:
            raise Exception("Compliance score must be between 0 and 100")
        if not 0 <= data['process_efficiency'] <= 100:
            raise Exception("Process efficiency must be between 0 and 100")

    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate quality metrics for supplier analysis
        
        Args:
            data: Dictionary containing quality parameters
            
        Returns:
            Dictionary with calculated quality results
        """
        try:
            # Validate input
            self.validate_input(data)
            
            # Extract quality parameters
            defect_rate = data.get('defect_rate', 0)  # percentage
            customer_satisfaction = data.get('customer_satisfaction', 0)  # 0-100
            compliance_score = data.get('compliance_score', 0)  # 0-100
            process_efficiency = data.get('process_efficiency', 0)  # percentage
            certifications = data.get('quality_certifications', [])
            
            # Calculate quality score (0-100)
            defect_score = max(0, min(100, (1 - defect_rate / 100) * 100))
            satisfaction_score = customer_satisfaction
            compliance_impact = compliance_score
            efficiency_score = process_efficiency
            
            # Add bonus for certifications
            cert_bonus = min(10, len(certifications) * 2)  # Max 10 points bonus
            
            # Calculate overall quality score
            quality_score = (
                defect_score * 0.3 +
                satisfaction_score * 0.3 +
                compliance_impact * 0.2 +
                efficiency_score * 0.2 +
                cert_bonus
            )
            
            # Determine risk level
            if quality_score >= 80:
                risk_level = "Low"
            elif quality_score >= 60:
                risk_level = "Medium"
            else:
                risk_level = "High"
            
            # Generate quality metrics breakdown
            quality_metrics = {
                'defect_rate': {
                    'value': defect_rate,
                    'score': defect_score,
                    'weight': 0.3
                },
                'customer_satisfaction': {
                    'value': customer_satisfaction,
                    'score': satisfaction_score,
                    'weight': 0.3
                },
                'compliance': {
                    'value': compliance_score,
                    'score': compliance_impact,
                    'weight': 0.2
                },
                'process_efficiency': {
                    'value': process_efficiency,
                    'score': efficiency_score,
                    'weight': 0.2
                }
            }
            
            # Generate recommendations and improvement areas
            recommendations = []
            improvement_areas = []
            
            if defect_rate > 5:
                recommendations.append("Implement stricter quality control measures")
                improvement_areas.append("High defect rate")
            if customer_satisfaction < 80:
                recommendations.append("Review customer feedback and improve satisfaction")
                improvement_areas.append("Customer satisfaction below target")
            if compliance_score < 90:
                recommendations.append("Address compliance gaps")
                improvement_areas.append("Compliance issues")
            if process_efficiency < 70:
                recommendations.append("Optimize production processes")
                improvement_areas.append("Low process efficiency")
            if len(certifications) < 2:
                recommendations.append("Consider obtaining additional quality certifications")
                improvement_areas.append("Limited quality certifications")
            
            if not recommendations:
                recommendations.append("Maintain current quality standards")
            if not improvement_areas:
                improvement_areas.append("No critical areas for improvement")
            
            return {
                'quality_score': quality_score,
                'risk_level': risk_level,
                'quality_metrics': quality_metrics,
                'certifications': certifications,
                'recommendations': recommendations,
                'improvement_areas': improvement_areas
            }
            
        except Exception as e:
            self.logger.error(f"Error in quality calculation: {e}")
            raise Exception(f"Quality calculation failed: {str(e)}")

# Create router instance
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
async def assess_quality(data: Dict[str, Any]):
    engine = QualityEngine()
    try:
        result = await engine.calculate(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 