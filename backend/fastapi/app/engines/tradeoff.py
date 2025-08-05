from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class TradeoffMetrics(BaseModel):
    score: float
    weight: float
    weighted_score: float

class TradeoffMatrix(BaseModel):
    economic: TradeoffMetrics
    quality: TradeoffMetrics
    environmental: TradeoffMetrics

class TradeoffResponse(BaseModel):
    overall_score: float
    balanced_score: float
    risk_level: str
    risk_assessment: str
    tradeoff_matrix: Dict[str, Dict[str, float]]
    recommendations: List[str]

class TradeoffEngine:
    """Trade-off analysis engine for multi-criteria supplier assessment"""
    
    def __init__(self):
        self.logger = logger

    def validate_input(self, data: Dict[str, Any]) -> None:
        """Validate input data"""
        required_fields = ['economic_score', 'quality_score', 'environmental_score']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise Exception(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate score ranges
        for field in required_fields:
            score = data.get(field, 0)
            if not 0 <= score <= 100:
                raise Exception(f"{field.replace('_', ' ').title()} must be between 0 and 100")
        
        # Validate weights if provided
        if 'weights' in data:
            weights = data['weights']
            required_weights = ['economic', 'quality', 'environmental']
            for weight in required_weights:
                if weight not in weights:
                    raise Exception(f"Missing weight for {weight}")
                if not 0 <= weights[weight] <= 1:
                    raise Exception(f"Weight for {weight} must be between 0 and 1")
            total_weight = sum(weights.values())
            if abs(total_weight - 1) > 0.001:  # Allow small floating point differences
                raise Exception(f"Weights must sum to 1, got {total_weight}")

    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate trade-off metrics for supplier analysis
        
        Args:
            data: Dictionary containing trade-off parameters
            
        Returns:
            Dictionary with calculated trade-off results
        """
        try:
            # Validate input
            self.validate_input(data)
            
            # Extract scores
            economic_score = data.get('economic_score', 0)
            quality_score = data.get('quality_score', 0)
            environmental_score = data.get('environmental_score', 0)
            
            # Extract weights (default to equal weights)
            weights = data.get('weights', {
                'economic': 0.4,
                'quality': 0.3,
                'environmental': 0.3
            })
            
            # Calculate weighted scores
            weighted_economic = economic_score * weights['economic']
            weighted_quality = quality_score * weights['quality']
            weighted_environmental = environmental_score * weights['environmental']
            
            # Calculate overall score
            overall_score = weighted_economic + weighted_quality + weighted_environmental
            
            # Calculate balanced score (penalize large variations)
            scores = [economic_score, quality_score, environmental_score]
            mean_score = sum(scores) / len(scores)
            variations = [(s - mean_score) ** 2 for s in scores]
            penalty = sum(variations) / len(variations)
            balanced_score = overall_score * (1 - penalty / 10000)  # Small penalty for variations
            
            # Generate trade-off matrix
            tradeoff_matrix = {
                'economic': {
                    'score': economic_score,
                    'weight': weights['economic'],
                    'weighted_score': weighted_economic
                },
                'quality': {
                    'score': quality_score,
                    'weight': weights['quality'],
                    'weighted_score': weighted_quality
                },
                'environmental': {
                    'score': environmental_score,
                    'weight': weights['environmental'],
                    'weighted_score': weighted_environmental
                }
            }
            
            # Determine risk level
            if overall_score >= 80:
                risk_level = "Low"
                risk_assessment = "Low risk with strong performance across all criteria"
            elif overall_score >= 60:
                risk_level = "Medium" 
                risk_assessment = "Medium risk with acceptable performance, some improvement needed"
            else:
                risk_level = "High"
                risk_assessment = "High risk with significant performance gaps requiring immediate attention"
            
            # Generate optimization recommendations
            recommendations = []
            
            # Check for significant imbalances
            avg_score = (economic_score + quality_score + environmental_score) / 3
            threshold = 15  # Significant deviation threshold
            
            if abs(economic_score - avg_score) > threshold:
                if economic_score < avg_score:
                    recommendations.append("Focus on improving economic performance")
                else:
                    recommendations.append("Maintain strong economic performance")
                    
            if abs(quality_score - avg_score) > threshold:
                if quality_score < avg_score:
                    recommendations.append("Prioritize quality improvements")
                else:
                    recommendations.append("Maintain high quality standards")
                    
            if abs(environmental_score - avg_score) > threshold:
                if environmental_score < avg_score:
                    recommendations.append("Enhance environmental sustainability")
                else:
                    recommendations.append("Continue strong environmental practices")
            
            # Add general recommendations
            if overall_score < 70:
                recommendations.append("Develop comprehensive improvement strategy")
            elif overall_score < 85:
                recommendations.append("Focus on balanced performance optimization")
            else:
                recommendations.append("Maintain balanced excellence across all criteria")
            
            return {
                'overall_score': overall_score,
                'balanced_score': balanced_score,
                'risk_level': risk_level,
                'risk_assessment': risk_assessment,
                'tradeoff_matrix': tradeoff_matrix,
                'recommendations': recommendations
            }
            
        except Exception as e:
            self.logger.error(f"Error in trade-off calculation: {e}")
            raise Exception(f"Trade-off calculation failed: {str(e)}")

# Create router instance
router = APIRouter(
    prefix="/tradeoff",
    tags=["tradeoff"]
)

@router.get("/")
async def root():
    return {"message": "Trade-off Assessment Service"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/assess", response_model=TradeoffResponse)
async def assess_tradeoff(data: Dict[str, Any]):
    engine = TradeoffEngine()
    try:
        result = await engine.calculate(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 