import logging
from typing import Dict, Any
from decimal import Decimal

logger = logging.getLogger(__name__)

class EconomicEngine:
    """Economic analysis engine for supplier cost calculations"""
    
    def __init__(self):
        self.logger = logger
    
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate economic metrics for supplier analysis
        
        Args:
            data: Dictionary containing economic parameters
            
        Returns:
            Dictionary with calculated economic results
        """
        try:
            # Extract parameters
            material_cost = data.get('material_cost', 0)
            transportation_cost = data.get('transportation_cost', 0)
            labor_cost = data.get('labor_cost', 0)
            overhead_cost = data.get('overhead_cost', 0)
            tax_rate = data.get('tax_rate', 0.15)
            volume = data.get('volume', 1000)
            capacity = data.get('capacity', 10000)
            
            # Calculate total costs
            subtotal = material_cost + transportation_cost + labor_cost + overhead_cost
            tax_amount = subtotal * tax_rate
            total_cost = subtotal + tax_amount
            
            # Calculate derived metrics
            cost_per_unit = total_cost / volume if volume > 0 else 0
            capacity_utilization = volume / capacity if capacity > 0 else 0
            
            # Calculate economic score (0-100)
            # Higher efficiency (lower cost per unit) = higher score
            baseline_cost_per_unit = 10.0  # Baseline for scoring
            efficiency_score = max(0, min(100, (baseline_cost_per_unit - cost_per_unit) / baseline_cost_per_unit * 100))
            
            # Adjust score based on capacity utilization
            utilization_bonus = capacity_utilization * 20  # Up to 20 points for good utilization
            economic_score = min(100, efficiency_score + utilization_bonus)
            
            # Calculate ROI estimate
            revenue_estimate = total_cost * 1.2  # 20% markup assumption
            roi = ((revenue_estimate - total_cost) / total_cost * 100) if total_cost > 0 else 0
            
            return {
                'total_cost': total_cost,
                'cost_per_unit': cost_per_unit,
                'economic_score': economic_score,
                'score': economic_score,  # Add explicit score field for frontend compatibility
                'roi': roi,
                'capacity_utilization': capacity_utilization * 100,
                'cost_breakdown': {
                    'material': material_cost,
                    'transportation': transportation_cost,
                    'labor': labor_cost,
                    'overhead': overhead_cost,
                    'tax': tax_amount
                },
                'metrics': {
                    'efficiency_score': efficiency_score,
                    'utilization_bonus': utilization_bonus,
                    'baseline_cost_per_unit': baseline_cost_per_unit
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in economic calculation: {e}")
            raise Exception(f"Economic calculation failed: {str(e)}")
    
    def calculate_cost_optimization_score(
        self,
        current_cost: float,
        benchmark_cost: float,
        volume_efficiency: float = 1.0
    ) -> float:
        """
        Calculate cost optimization score compared to benchmark
        
        Args:
            current_cost: Current supplier cost
            benchmark_cost: Benchmark/market average cost
            volume_efficiency: Volume-based efficiency factor
            
        Returns:
            Optimization score (0-100)
        """
        if benchmark_cost <= 0:
            return 50  # Neutral score if no benchmark
            
        cost_ratio = current_cost / benchmark_cost
        base_score = max(0, min(100, (2 - cost_ratio) * 50))  # Inverted cost ratio
        
        # Apply volume efficiency factor
        final_score = base_score * volume_efficiency
        
        return min(100, max(0, final_score)) 