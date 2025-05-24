from typing import Dict, Any, List
from ..schemas.tradeoff import TradeoffInput, TradeoffAnalysis, OptimizationPreferences
from ..exceptions import ValidationError, CalculationError

class TradeoffEngine:
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Convert dict to TradeoffInput
            input_data = TradeoffInput(**data)
            preferences = OptimizationPreferences(**data.get("preferences", {}))
            return await self.analyze_tradeoffs(input_data, preferences)
        except Exception as e:
            raise CalculationError(f"Error in tradeoff calculation: {str(e)}")

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
        volatility = sum((x - sum(values)/len(values))**2 for x in values) / len(values)
        
        return {
            "trend": trend,
            "volatility": volatility,
            "latest_value": values[-1],
            "average": sum(values) / len(values)
        } 