import logging
from typing import Dict, Any, List
from ..schemas.quality import QualityInput, QualityAssessment
from ..exceptions import ValidationError, CalculationError

logger = logging.getLogger(__name__)

class QualityEngine:
    """Quality analysis engine for supplier quality assessment"""
    
    def __init__(self):
        self.logger = logger
    
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate quality metrics for supplier analysis
        
        Args:
            data: Dictionary containing quality parameters
            
        Returns:
            Dictionary with calculated quality results
        """
        try:
            # Extract quality parameters
            defect_rate = data.get('defect_rate', 0)
            customer_satisfaction = data.get('customer_satisfaction', 85)
            compliance_score = data.get('compliance_score', 90)
            process_efficiency = data.get('process_efficiency', 80)
            certifications = data.get('certifications', [])
            audit_history = data.get('audit_history', [])
            
            # Calculate overall quality score
            quality_components = {
                'defect_control': max(0, 100 - defect_rate * 10),  # Lower defect rate = higher score
                'customer_satisfaction': customer_satisfaction,
                'compliance': compliance_score,
                'process_efficiency': process_efficiency
            }
            
            # Weighted average of quality components
            weights = {
                'defect_control': 0.3,
                'customer_satisfaction': 0.25,
                'compliance': 0.25,
                'process_efficiency': 0.2
            }
            
            quality_score = sum(
                quality_components[component] * weights[component]
                for component in quality_components
            )
            
            # Certification bonus
            cert_bonus = len(certifications) * 2  # 2 points per certification
            quality_score = min(100, quality_score + cert_bonus)
            
            # Risk assessment
            risk_level = self._assess_risk_level(
                defect_rate, customer_satisfaction, compliance_score, process_efficiency
            )
            
            # Generate improvement recommendations
            recommendations = self._generate_quality_recommendations(
                defect_rate, customer_satisfaction, compliance_score, process_efficiency
            )
            
            return {
                'quality_score': quality_score,
                'quality_components': quality_components,
                'risk_level': risk_level,
                'certification_count': len(certifications),
                'recommendations': recommendations,
                'metrics': {
                    'defect_rate': defect_rate,
                    'customer_satisfaction': customer_satisfaction,
                    'compliance_score': compliance_score,
                    'process_efficiency': process_efficiency,
                    'certification_bonus': cert_bonus
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in quality calculation: {e}")
            raise Exception(f"Quality calculation failed: {str(e)}")
    
    def _assess_risk_level(
        self,
        defect_rate: float,
        customer_satisfaction: float,
        compliance_score: float,
        process_efficiency: float
    ) -> str:
        """Assess overall risk level based on quality metrics"""
        
        risk_factors = 0
        
        if defect_rate > 5:
            risk_factors += 1
        if customer_satisfaction < 70:
            risk_factors += 1
        if compliance_score < 80:
            risk_factors += 1
        if process_efficiency < 70:
            risk_factors += 1
        
        if risk_factors >= 3:
            return "High"
        elif risk_factors >= 2:
            return "Medium"
        else:
            return "Low"
    
    def _generate_quality_recommendations(
        self,
        defect_rate: float,
        customer_satisfaction: float,
        compliance_score: float,
        process_efficiency: float
    ) -> List[str]:
        """Generate quality improvement recommendations"""
        
        recommendations = []
        
        if defect_rate > 3:
            recommendations.append("Implement stricter quality control measures to reduce defect rate")
        if customer_satisfaction < 80:
            recommendations.append("Focus on customer service training and feedback systems")
        if compliance_score < 90:
            recommendations.append("Review and enhance compliance procedures")
        if process_efficiency < 85:
            recommendations.append("Optimize manufacturing processes for better efficiency")
        
        if not recommendations:
            recommendations.append("Maintain current quality standards and continue monitoring")
        
        return recommendations 