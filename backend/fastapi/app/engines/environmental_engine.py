from typing import Dict, Any, List
from ..schemas.environmental import EnvironmentalInput, EnvironmentalAssessment
from ..exceptions import ValidationError, CalculationError

class EnvironmentalEngine:
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert dict to EnvironmentalInput
            input_data = EnvironmentalInput(**data)
            return await self.assess_environmental_impact(input_data)
        except Exception as e:
            raise CalculationError(f"Error in environmental calculation: {str(e)}")

    async def assess_environmental_impact(
        self,
        data: EnvironmentalInput
    ) -> EnvironmentalAssessment:
        try:
            # Validate input data
            if data.energy_consumption < 0:
                raise ValidationError("Energy consumption cannot be negative")
            if data.water_usage < 0:
                raise ValidationError("Water usage cannot be negative")
            if data.waste_generated < 0:
                raise ValidationError("Waste generated cannot be negative")
            if data.carbon_emissions < 0:
                raise ValidationError("Carbon emissions cannot be negative")
            if not 0 <= data.recycling_rate <= 100:
                raise ValidationError("Recycling rate must be between 0 and 100")
            if not 0 <= data.renewable_energy_usage <= 100:
                raise ValidationError("Renewable energy usage must be between 0 and 100")
            
            # Calculate carbon footprint (in metric tons CO2e)
            carbon_footprint = (
                data.energy_consumption * 0.5 +  # kg CO2e per kWh
                data.water_usage * 0.298 +       # kg CO2e per m3
                data.waste_generated * 2.53 +    # kg CO2e per kg
                data.carbon_emissions            # direct emissions
            ) / 1000  # Convert to metric tons
            
            # Calculate sustainability score (0-100)
            sustainability_score = self._calculate_sustainability_score(
                data.energy_consumption,
                data.water_usage,
                data.waste_generated,
                data.carbon_emissions,
                data.recycling_rate,
                data.renewable_energy_usage
            )
            
            # Determine sustainability level
            sustainability_level = self._determine_sustainability_level(sustainability_score)
            
            # Calculate impact breakdown
            impact_breakdown = {
                "energy": {
                    "consumption": data.energy_consumption,
                    "renewable_percentage": data.renewable_energy_usage,
                    "impact_score": self._normalize_impact(data.energy_consumption, 1000)
                },
                "water": {
                    "usage": data.water_usage,
                    "impact_score": self._normalize_impact(data.water_usage, 100)
                },
                "waste": {
                    "generated": data.waste_generated,
                    "recycling_rate": data.recycling_rate,
                    "impact_score": self._normalize_impact(data.waste_generated, 50)
                },
                "emissions": {
                    "direct_emissions": data.carbon_emissions,
                    "impact_score": self._normalize_impact(data.carbon_emissions, 100)
                }
            }
            
            return EnvironmentalAssessment(
                environmental_score=sustainability_score,
                carbon_footprint=carbon_footprint,
                sustainability_level=sustainability_level,
                impact_breakdown=impact_breakdown,
                certification_status=self._check_environmental_certifications(data.environmental_certifications),
                recommendations=self._generate_environmental_recommendations(impact_breakdown),
                compliance_status=self._check_environmental_compliance(impact_breakdown)
            )
        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error assessing environmental impact: {str(e)}")

    def _calculate_sustainability_score(
        self,
        energy_consumption: float,
        water_usage: float,
        waste_generated: float,
        carbon_emissions: float,
        recycling_rate: float,
        renewable_energy_usage: float
    ) -> float:
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
        if score >= 80:
            return "High"
        elif score >= 60:
            return "Medium"
        else:
            return "Low"

    def _normalize_impact(self, value: float, baseline: float) -> float:
        return min(1.0, value / baseline)

    def _check_environmental_certifications(
        self,
        certifications: List[str]
    ) -> Dict[str, bool]:
        required_certs = {
            "ISO14001": False,
            "ISO50001": False,
            "LEED": False
        }
        for cert in certifications:
            if cert in required_certs:
                required_certs[cert] = True
        return required_certs

    def _generate_environmental_recommendations(
        self,
        impact_breakdown: Dict[str, Dict[str, float]]
    ) -> List[str]:
        recommendations = []
        
        if impact_breakdown["energy"]["impact_score"] > 0.7:
            recommendations.append("Implement energy efficiency measures")
        if impact_breakdown["water"]["impact_score"] > 0.7:
            recommendations.append("Optimize water usage and implement recycling")
        if impact_breakdown["waste"]["impact_score"] > 0.7:
            recommendations.append("Enhance waste reduction and recycling programs")
        if impact_breakdown["emissions"]["impact_score"] > 0.7:
            recommendations.append("Develop carbon reduction strategies")
            
        return recommendations

    def _check_environmental_compliance(
        self,
        impact_breakdown: Dict[str, Dict[str, float]]
    ) -> Dict[str, bool]:
        return {
            "energy_compliance": impact_breakdown["energy"]["impact_score"] <= 0.8,
            "water_compliance": impact_breakdown["water"]["impact_score"] <= 0.8,
            "waste_compliance": impact_breakdown["waste"]["impact_score"] <= 0.8,
            "emissions_compliance": impact_breakdown["emissions"]["impact_score"] <= 0.8
        } 