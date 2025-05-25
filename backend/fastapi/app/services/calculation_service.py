from typing import Dict, Any, List
import numpy as np
from ..engines.economic_engine import EconomicEngine
from ..engines.quality_engine import QualityEngine
from ..engines.environmental_engine import EnvironmentalEngine
from ..engines.tradeoff_engine import TradeoffEngine
from ..schemas.economic import SupplierCostInput, EconomicScoreOutput, OptimizationResult
from ..schemas.quality import QualityInput, QualityAssessment
from ..schemas.environmental import EnvironmentalInput, EnvironmentalAssessment
from ..schemas.tradeoff import TradeoffInput, TradeoffAnalysis, OptimizationPreferences
from ..exceptions import CalculationError, ValidationError, ServiceError

class CalculationService:
    def __init__(self):
        self.economic_engine = EconomicEngine()
        self.quality_engine = QualityEngine()
        self.environmental_engine = EnvironmentalEngine()
        self.tradeoff_engine = TradeoffEngine()
    
    async def calculate_economic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = await self.economic_engine.calculate(data)
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def calculate_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = await self.quality_engine.calculate(data)
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def calculate_environmental(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = await self.environmental_engine.calculate(data)
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def calculate_tradeoff(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = await self.tradeoff_engine.calculate(data)
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def calculate_economic_score(
        self,
        data: SupplierCostInput
    ) -> EconomicScoreOutput:
        try:
            # Validate input data
            if data.volume <= 0:
                raise ValidationError("Volume must be greater than zero")
            if data.capacity <= 0:
                raise ValidationError("Capacity must be greater than zero")
            
            # Calculate total costs
            total_cost = (
                data.material_cost + 
                data.transportation_cost + 
                data.labor_cost + 
                data.overhead_cost
            )
            tax_amount = total_cost * data.tax_rate
            
            # Calculate cost per unit
            cost_per_unit = total_cost / data.volume
            
            # Calculate ROI (simplified example)
            roi = ((data.capacity * cost_per_unit) - total_cost) / total_cost * 100
            
            # Calculate score (normalized to 0-100)
            score = 100 * (1 - (total_cost / (data.capacity * cost_per_unit)))
            
            return EconomicScoreOutput(
                supplier_id=data.supplier_id,
                score=max(0, min(100, score)),
                cost_breakdown={
                    "material": data.material_cost,
                    "transportation": data.transportation_cost,
                    "labor": data.labor_cost,
                    "overhead": data.overhead_cost,
                    "tax": tax_amount
                },
                recommendations=self._generate_economic_recommendations(score),
                total_cost=total_cost,
                cost_per_unit=cost_per_unit,
                roi=roi
            )
        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error calculating economic score: {str(e)}")

    async def optimize_sourcing(
        self,
        data: List[SupplierCostInput]
    ) -> OptimizationResult:
        try:
            if not data:
                raise ValidationError("No supplier data provided")
            
            # Validate each supplier's data
            for supplier in data:
                if supplier.volume <= 0:
                    raise ValidationError(f"Invalid volume for supplier {supplier.supplier_id}")
                if supplier.capacity <= 0:
                    raise ValidationError(f"Invalid capacity for supplier {supplier.supplier_id}")
            
            # Simple optimization example
            optimal_allocation = {}
            total_cost = 0
            current_capacity = 0
            
            # Sort suppliers by cost efficiency
            sorted_suppliers = sorted(
                data,
                key=lambda x: (x.material_cost + x.transportation_cost) / x.capacity
            )
            
            for supplier in sorted_suppliers:
                if current_capacity < supplier.capacity:
                    allocation = min(
                        supplier.capacity - current_capacity,
                        supplier.volume
                    )
                    optimal_allocation[supplier.supplier_id] = allocation
                    total_cost += allocation * (
                        supplier.material_cost + 
                        supplier.transportation_cost
                    )
                    current_capacity += allocation
            
            # Calculate potential savings
            current_cost = sum(
                s.volume * (s.material_cost + s.transportation_cost)
                for s in data
            )
            savings_potential = current_cost - total_cost
            
            return OptimizationResult(
                optimal_allocation=optimal_allocation,
                total_cost=total_cost,
                savings_potential=savings_potential,
                optimal_suppliers=[
                    {
                        "supplier_id": s.supplier_id,
                        "allocation": optimal_allocation.get(s.supplier_id, 0),
                        "cost_efficiency": (s.material_cost + s.transportation_cost) / s.capacity
                    }
                    for s in sorted_suppliers
                ],
                optimization_details={
                    "total_capacity_utilized": current_capacity,
                    "number_of_suppliers": len(optimal_allocation),
                    "average_cost_per_unit": total_cost / current_capacity if current_capacity > 0 else 0
                }
            )
        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error optimizing sourcing: {str(e)}")

    async def assess_quality(
        self,
        data: QualityInput
    ) -> QualityAssessment:
        # Calculate compliance for each metric
        compliance = {}
        for metric, value in data.measurements.items():
            standard = data.standards.get(metric)
            if standard:
                compliance[metric] = value >= standard
        
        # Calculate overall quality score
        quality_score = sum(compliance.values()) / len(compliance) * 100 if compliance else 0
        
        # Calculate risk level
        risk_level = self._calculate_risk_level(
            data.defect_rate,
            data.customer_satisfaction,
            data.compliance_score,
            data.process_efficiency
        )
        
        return QualityAssessment(
            material_id=data.material_id,
            quality_score=quality_score,
            compliance_details=compliance,
            recommendations=self._generate_quality_recommendations(compliance),
            overall_score=quality_score,
            risk_level=risk_level,
            improvement_areas=self._identify_improvement_areas(data),
            certification_status=self._check_certifications(data.certification_status),
            audit_summary=self._summarize_audits(data.audit_history)
        )

    def _calculate_risk_level(
        self,
        defect_rate: float,
        customer_satisfaction: float,
        compliance_score: float,
        process_efficiency: float
    ) -> str:
        # Simple risk calculation
        risk_score = (
            (100 - defect_rate) * 0.3 +
            customer_satisfaction * 0.3 +
            compliance_score * 0.2 +
            process_efficiency * 0.2
        )
        
        if risk_score >= 80:
            return "Low"
        elif risk_score >= 60:
            return "Medium"
        else:
            return "High"

    def _identify_improvement_areas(self, data: QualityInput) -> List[str]:
        areas = []
        if data.defect_rate > 5:
            areas.append("Defect rate reduction")
        if data.customer_satisfaction < 80:
            areas.append("Customer satisfaction improvement")
        if data.compliance_score < 90:
            areas.append("Compliance enhancement")
        if data.process_efficiency < 85:
            areas.append("Process efficiency optimization")
        return areas

    def _check_certifications(self, certifications: List[str]) -> Dict[str, bool]:
        required_certs = {
            "ISO9001": False,
            "ISO14001": False,
            "ISO45001": False
        }
        for cert in certifications:
            if cert in required_certs:
                required_certs[cert] = True
        return required_certs

    def _summarize_audits(self, audit_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not audit_history:
            return {"status": "No audit history available"}
            
        return {
            "total_audits": len(audit_history),
            "last_audit_date": audit_history[-1].get("date"),
            "average_score": sum(a.get("score", 0) for a in audit_history) / len(audit_history),
            "major_findings": [
                finding for audit in audit_history
                for finding in audit.get("findings", [])
                if finding.get("severity") == "major"
            ]
        }

    def _generate_economic_recommendations(self, score: float) -> List[str]:
        recommendations = []
        if score < 60:
            recommendations.append("Consider negotiating better rates with suppliers")
        if score < 40:
            recommendations.append("Evaluate alternative transportation methods")
        if score < 30:
            recommendations.append("Review labor and overhead costs")
        return recommendations

    def _generate_quality_recommendations(
        self,
        compliance: Dict[str, bool]
    ) -> List[str]:
        recommendations = []
        for metric, compliant in compliance.items():
            if not compliant:
                recommendations.append(f"Improve {metric} to meet standards")
        return recommendations

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

    async def analyze_tradeoffs(
        self,
        data: TradeoffInput,
        preferences: OptimizationPreferences
    ) -> TradeoffAnalysis:
        try:
            # Validate input data
            if not 0 <= data.economic_score <= 100:
                raise ValidationError("Economic score must be between 0 and 100")
            if not 0 <= data.quality_score <= 100:
                raise ValidationError("Quality score must be between 0 and 100")
            if not 0 <= data.environmental_score <= 100:
                raise ValidationError("Environmental score must be between 0 and 100")
            
            # Validate preferences
            total_weight = (
                preferences.economic_weight +
                preferences.quality_weight +
                preferences.environmental_weight
            )
            if not 0.99 <= total_weight <= 1.01:  # Allow for small floating-point errors
                raise ValidationError("Weights must sum to 1")
            
            # Calculate balanced score using weighted average
            balanced_score = (
                data.economic_score * preferences.economic_weight +
                data.quality_score * preferences.quality_weight +
                data.environmental_score * preferences.environmental_weight
            ) / total_weight
            
            # Calculate risk assessment
            risk_assessment = self._calculate_risk_assessment(
                data.historical_performance,
                data.risk_factors,
                preferences.risk_tolerance
            )
            
            # Generate tradeoff matrix
            tradeoff_matrix = self._generate_tradeoff_matrix(
                data.economic_score,
                data.quality_score,
                data.environmental_score,
                preferences
            )
            
            return TradeoffAnalysis(
                overall_score=balanced_score,
                balanced_score=balanced_score,
                risk_assessment=risk_assessment,
                tradeoff_matrix=tradeoff_matrix,
                recommendations=self._generate_tradeoff_recommendations(
                    tradeoff_matrix,
                    preferences.optimization_goals
                ),
                optimization_suggestions=self._generate_optimization_suggestions(
                    data,
                    preferences,
                    tradeoff_matrix
                )
            )
        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error analyzing tradeoffs: {str(e)}")

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

    def _calculate_risk_assessment(
        self,
        historical_performance: Dict[str, float],
        risk_factors: Dict[str, float],
        risk_tolerance: float
    ) -> Dict[str, Any]:
        # Calculate overall risk score
        risk_score = sum(risk_factors.values()) / len(risk_factors)
        
        # Determine risk level based on tolerance
        risk_level = "High" if risk_score > risk_tolerance else "Low"
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "key_risk_factors": [
                factor for factor, score in risk_factors.items()
                if score > risk_tolerance
            ],
            "historical_trend": self._analyze_historical_trend(historical_performance)
        }

    def _generate_tradeoff_matrix(
        self,
        economic_score: float,
        quality_score: float,
        environmental_score: float,
        preferences: OptimizationPreferences
    ) -> Dict[str, Dict[str, float]]:
        return {
            "economic_vs_quality": {
                "economic_impact": economic_score * preferences.economic_weight,
                "quality_impact": quality_score * preferences.quality_weight,
                "tradeoff_score": abs(economic_score - quality_score)
            },
            "economic_vs_environmental": {
                "economic_impact": economic_score * preferences.economic_weight,
                "environmental_impact": environmental_score * preferences.environmental_weight,
                "tradeoff_score": abs(economic_score - environmental_score)
            },
            "quality_vs_environmental": {
                "quality_impact": quality_score * preferences.quality_weight,
                "environmental_impact": environmental_score * preferences.environmental_weight,
                "tradeoff_score": abs(quality_score - environmental_score)
            }
        }

    def _generate_tradeoff_recommendations(
        self,
        tradeoff_matrix: Dict[str, Dict[str, float]],
        optimization_goals: List[str]
    ) -> List[str]:
        recommendations = []
        
        for pair, scores in tradeoff_matrix.items():
            if scores["tradeoff_score"] > 20:  # Significant tradeoff
                if "economic" in pair and "quality" in pair:
                    recommendations.append("Balance cost optimization with quality requirements")
                elif "economic" in pair and "environmental" in pair:
                    recommendations.append("Consider environmental impact in cost optimization")
                elif "quality" in pair and "environmental" in pair:
                    recommendations.append("Align quality standards with environmental goals")
                    
        return recommendations

    def _generate_optimization_suggestions(
        self,
        data: TradeoffInput,
        preferences: OptimizationPreferences,
        tradeoff_matrix: Dict[str, Dict[str, float]]
    ) -> List[Dict[str, Any]]:
        suggestions = []
        
        # Analyze each dimension
        if data.economic_score < 70:
            suggestions.append({
                "dimension": "economic",
                "priority": "high" if preferences.economic_weight > 0.4 else "medium",
                "suggestion": "Optimize cost structure and supplier relationships"
            })
            
        if data.quality_score < 70:
            suggestions.append({
                "dimension": "quality",
                "priority": "high" if preferences.quality_weight > 0.4 else "medium",
                "suggestion": "Enhance quality control measures and supplier standards"
            })
            
        if data.environmental_score < 70:
            suggestions.append({
                "dimension": "environmental",
                "priority": "high" if preferences.environmental_weight > 0.4 else "medium",
                "suggestion": "Implement sustainable practices and reduce environmental impact"
            })
            
        return suggestions

    def _analyze_historical_trend(
        self,
        historical_performance: Dict[str, float]
    ) -> Dict[str, Any]:
        if not historical_performance:
            return {"trend": "insufficient_data"}
            
        values = list(historical_performance.values())
        if len(values) < 2:
            return {"trend": "insufficient_data"}
            
        # Calculate trend
        trend = "improving" if values[-1] > values[0] else "declining"
        volatility = np.std(values) if len(values) > 1 else 0
        
        return {
            "trend": trend,
            "volatility": volatility,
            "latest_value": values[-1],
            "average": sum(values) / len(values)
        }

    def _calculate_transportation_emissions(
        self,
        transport_mode: str,
        distance: float,
        volume: float
    ) -> float:
        """
        Calculate carbon emissions from transportation based on mode, distance, and volume.
        
        Args:
            transport_mode: The mode of transportation (truck, train, ship, airplane)
            distance: Distance in kilometers
            volume: Volume of goods in cubic meters
            
        Returns:
            float: Carbon emissions in kg CO2e
        """
        # Emission factors (kg CO2e per ton-km) for different transport modes
        # These are approximate values and should be updated with actual data
        EMISSION_FACTORS = {
            "truck": 0.162,  # kg CO2e per ton-km
            "train": 0.041,  # kg CO2e per ton-km
            "ship": 0.017,   # kg CO2e per ton-km
            "airplane": 0.602  # kg CO2e per ton-km
        }
        
        # Convert volume to weight (assuming average density of 1 ton per cubic meter)
        # This is a simplification - in practice, you would use actual weight
        weight = volume  # in tons
        
        # Get emission factor for the transport mode
        emission_factor = EMISSION_FACTORS.get(transport_mode.lower(), EMISSION_FACTORS["truck"])
        
        # Calculate emissions
        emissions = distance * weight * emission_factor
        
        return emissions 