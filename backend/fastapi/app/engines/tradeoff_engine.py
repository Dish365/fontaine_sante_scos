import logging
from typing import Dict, Any, List
from ..schemas.tradeoff import TradeoffInput, TradeoffAnalysis, OptimizationPreferences
from ..exceptions import ValidationError, CalculationError

logger = logging.getLogger(__name__)

class TradeoffEngine:
    """Trade-off analysis engine for multi-criteria supplier assessment"""
    
    def __init__(self):
        self.logger = logger
    
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate trade-off analysis for supplier evaluation
        
        Args:
            data: Dictionary containing trade-off parameters
            
        Returns:
            Dictionary with calculated trade-off results
        """
        try:
            # Extract parameters
            economic_score = data.get('economic_score', 0)
            quality_score = data.get('quality_score', 0)
            environmental_score = data.get('environmental_score', 0)
            
            # Get weights (default to equal weighting)
            economic_weight = data.get('economic_weight', 0.33)
            quality_weight = data.get('quality_weight', 0.33)
            environmental_weight = data.get('environmental_weight', 0.34)
            
            # Normalize weights to ensure they sum to 1
            total_weight = economic_weight + quality_weight + environmental_weight
            if total_weight > 0:
                economic_weight /= total_weight
                quality_weight /= total_weight
                environmental_weight /= total_weight
            
            # Calculate balanced score
            balanced_score = (
                economic_score * economic_weight +
                quality_score * quality_weight +
                environmental_score * environmental_weight
            )
            
            # Calculate trade-off matrix
            tradeoff_matrix = self._generate_tradeoff_matrix(
                economic_score, quality_score, environmental_score
            )
            
            # Assess risk level
            risk_assessment = self._calculate_risk_assessment(
                economic_score, quality_score, environmental_score
            )
            
            # Generate recommendations
            recommendations = self._generate_tradeoff_recommendations(
                tradeoff_matrix, economic_score, quality_score, environmental_score
            )
            
            return {
                'overall_score': balanced_score,
                'balanced_score': balanced_score,
                'component_scores': {
                    'economic': economic_score,
                    'quality': quality_score,
                    'environmental': environmental_score
                },
                'weights': {
                    'economic': economic_weight,
                    'quality': quality_weight,
                    'environmental': environmental_weight
                },
                'tradeoff_matrix': tradeoff_matrix,
                'risk_assessment': risk_assessment,
                'recommendations': recommendations
            }
            
        except Exception as e:
            self.logger.error(f"Error in trade-off calculation: {e}")
            raise Exception(f"Trade-off calculation failed: {str(e)}")
    
    def _generate_tradeoff_matrix(
        self,
        economic_score: float,
        quality_score: float,
        environmental_score: float
    ) -> Dict[str, Dict[str, float]]:
        """Generate trade-off analysis matrix"""
        
        return {
            "economic_vs_quality": {
                "economic_impact": economic_score,
                "quality_impact": quality_score,
                "tradeoff_score": abs(economic_score - quality_score),
                "balance_assessment": "balanced" if abs(economic_score - quality_score) < 10 else "imbalanced"
            },
            "economic_vs_environmental": {
                "economic_impact": economic_score,
                "environmental_impact": environmental_score,
                "tradeoff_score": abs(economic_score - environmental_score),
                "balance_assessment": "balanced" if abs(economic_score - environmental_score) < 10 else "imbalanced"
            },
            "quality_vs_environmental": {
                "quality_impact": quality_score,
                "environmental_impact": environmental_score,
                "tradeoff_score": abs(quality_score - environmental_score),
                "balance_assessment": "balanced" if abs(quality_score - environmental_score) < 10 else "imbalanced"
            }
        }
    
    def _calculate_risk_assessment(
        self,
        economic_score: float,
        quality_score: float,
        environmental_score: float
    ) -> Dict[str, Any]:
        """Calculate overall risk assessment"""
        
        scores = [economic_score, quality_score, environmental_score]
        min_score = min(scores)
        max_score = max(scores)
        score_variance = max_score - min_score
        
        # Determine risk level
        if min_score < 40:
            risk_level = "High"
        elif min_score < 60 or score_variance > 30:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        return {
            "risk_level": risk_level,
            "risk_score": 100 - min_score,
            "score_variance": score_variance,
            "weakest_dimension": "economic" if economic_score == min_score else 
                               "quality" if quality_score == min_score else "environmental",
            "strongest_dimension": "economic" if economic_score == max_score else 
                                 "quality" if quality_score == max_score else "environmental"
        }
    
    def _generate_tradeoff_recommendations(
        self,
        tradeoff_matrix: Dict[str, Dict[str, float]],
        economic_score: float,
        quality_score: float,
        environmental_score: float
    ) -> List[str]:
        """Generate trade-off optimization recommendations"""
        
        recommendations = []
        
        # Check for significant imbalances
        for pair, analysis in tradeoff_matrix.items():
            if analysis["tradeoff_score"] > 25:  # Significant imbalance
                if "economic_vs_quality" in pair:
                    if economic_score > quality_score:
                        recommendations.append("Consider investing some cost savings into quality improvements")
                    else:
                        recommendations.append("Balance quality investments with cost optimization")
                elif "economic_vs_environmental" in pair:
                    if economic_score > environmental_score:
                        recommendations.append("Invest in environmental sustainability initiatives")
                    else:
                        recommendations.append("Optimize costs while maintaining environmental standards")
                elif "quality_vs_environmental" in pair:
                    if quality_score > environmental_score:
                        recommendations.append("Enhance environmental practices while maintaining quality")
                    else:
                        recommendations.append("Align quality standards with environmental goals")
        
        # Check for overall weak performance
        if min(economic_score, quality_score, environmental_score) < 50:
            recommendations.append("Focus on improving the weakest performance dimension")
        
        if not recommendations:
            recommendations.append("Maintain balanced performance across all dimensions")
        
        return recommendations 