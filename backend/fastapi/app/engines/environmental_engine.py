import logging
from typing import Dict, Any, List
from ..schemas.environmental import EnvironmentalInput, EnvironmentalAssessment
from ..exceptions import ValidationError, CalculationError

logger = logging.getLogger(__name__)

class EnvironmentalEngine:
    """Environmental analysis engine for supplier sustainability assessment"""
    
    def __init__(self):
        self.logger = logger
    
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate environmental metrics for supplier analysis
        
        Args:
            data: Dictionary containing environmental parameters
            
        Returns:
            Dictionary with calculated environmental results
        """
        try:
            # Extract environmental parameters
            energy_consumption = data.get('energy_consumption', 0)
            water_usage = data.get('water_usage', 0)
            waste_generated = data.get('waste_generated', 0)
            carbon_emissions = data.get('carbon_emissions', 0)
            recycling_rate = data.get('recycling_rate', 0)
            renewable_energy_usage = data.get('renewable_energy_usage', 0)
            certifications = data.get('environmental_certifications', [])
            
            # Calculate carbon footprint (in metric tons CO2e)
            carbon_footprint = (
                energy_consumption * 0.5 +  # kg CO2e per kWh
                water_usage * 0.298 +       # kg CO2e per m3
                waste_generated * 2.53 +    # kg CO2e per kg
                carbon_emissions            # direct emissions
            ) / 1000  # Convert to metric tons
            
            # Calculate sustainability score (0-100)
            sustainability_score = self._calculate_sustainability_score(
                energy_consumption, water_usage, waste_generated, 
                carbon_emissions, recycling_rate, renewable_energy_usage
            )
            
            # Determine sustainability level
            sustainability_level = self._determine_sustainability_level(sustainability_score)
            
            # Calculate impact breakdown
            impact_breakdown = {
                "energy": {
                    "consumption": energy_consumption,
                    "renewable_percentage": renewable_energy_usage,
                    "impact_score": self._normalize_impact(energy_consumption, 1000)
                },
                "water": {
                    "usage": water_usage,
                    "impact_score": self._normalize_impact(water_usage, 100)
                },
                "waste": {
                    "generated": waste_generated,
                    "recycling_rate": recycling_rate,
                    "impact_score": self._normalize_impact(waste_generated, 50)
                },
                "emissions": {
                    "direct_emissions": carbon_emissions,
                    "impact_score": self._normalize_impact(carbon_emissions, 100)
                }
            }
            
            # Generate recommendations
            recommendations = self._generate_environmental_recommendations(impact_breakdown)
            
            return {
                'environmental_score': sustainability_score,
                'carbon_footprint': carbon_footprint,
                'sustainability_level': sustainability_level,
                'impact_breakdown': impact_breakdown,
                'certification_count': len(certifications),
                'recommendations': recommendations
            }
            
        except Exception as e:
            self.logger.error(f"Error in environmental calculation: {e}")
            raise Exception(f"Environmental calculation failed: {str(e)}")
    
    def _calculate_sustainability_score(
        self,
        energy_consumption: float,
        water_usage: float,
        waste_generated: float,
        carbon_emissions: float,
        recycling_rate: float,
        renewable_energy_usage: float
    ) -> float:
        """Calculate overall sustainability score"""
        
        # Normalize each factor to 0-100 scale
        energy_score = 100 * (1 - self._normalize_impact(energy_consumption, 1000))
        water_score = 100 * (1 - self._normalize_impact(water_usage, 100))
        waste_score = 100 * (1 - self._normalize_impact(waste_generated, 50))
        emissions_score = 100 * (1 - self._normalize_impact(carbon_emissions, 100))
        
        # Calculate weighted average
        return (
            energy_score * 0.25 +
            water_score * 0.2 +
            waste_score * 0.2 +
            emissions_score * 0.2 +
            recycling_rate * 0.1 +
            renewable_energy_usage * 0.05
        )
    
    def _determine_sustainability_level(self, score: float) -> str:
        """Determine sustainability level based on score"""
        if score >= 80:
            return "High"
        elif score >= 60:
            return "Medium"
        else:
            return "Low"
    
    def _normalize_impact(self, value: float, baseline: float) -> float:
        """Normalize impact value to 0-1 scale"""
        return min(1.0, value / baseline)
    
    def _generate_environmental_recommendations(
        self,
        impact_breakdown: Dict[str, Dict[str, float]]
    ) -> List[str]:
        """Generate environmental improvement recommendations"""
        
        recommendations = []
        
        if impact_breakdown["energy"]["impact_score"] > 0.7:
            recommendations.append("Implement energy efficiency measures")
        if impact_breakdown["water"]["impact_score"] > 0.7:
            recommendations.append("Optimize water usage and implement recycling")
        if impact_breakdown["waste"]["impact_score"] > 0.7:
            recommendations.append("Enhance waste reduction and recycling programs")
        if impact_breakdown["emissions"]["impact_score"] > 0.7:
            recommendations.append("Develop carbon reduction strategies")
        
        if not recommendations:
            recommendations.append("Continue monitoring environmental performance")
        
        return recommendations 