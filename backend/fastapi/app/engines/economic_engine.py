from typing import Dict, Any, List
from ..schemas.economic import SupplierCostInput, EconomicScoreOutput, OptimizationResult
from ..exceptions import ValidationError, CalculationError

class EconomicEngine:
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert dict to SupplierCostInput
            input_data = SupplierCostInput(**data)
            return await self.calculate_economic_score(input_data)
        except Exception as e:
            raise CalculationError(f"Error in economic calculation: {str(e)}")

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
                recommendations=self._generate_recommendations(score),
                total_cost=total_cost,
                cost_per_unit=cost_per_unit,
                roi=roi
            )
        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error calculating economic score: {str(e)}")

    def _generate_recommendations(self, score: float) -> List[str]:
        recommendations = []
        if score < 30:
            recommendations.extend([
                "Consider renegotiating supplier contracts",
                "Look for alternative suppliers with better pricing",
                "Optimize transportation routes to reduce costs"
            ])
        elif score < 60:
            recommendations.extend([
                "Review and optimize inventory management",
                "Consider bulk purchasing for better rates",
                "Evaluate automation opportunities to reduce labor costs"
            ])
        else:
            recommendations.extend([
                "Maintain current cost structure",
                "Focus on quality and service improvements",
                "Consider long-term contracts for price stability"
            ])
        return recommendations 