import logging
from typing import Dict, Any, List
import math

logger = logging.getLogger(__name__)

class TransportationEngine:
    """Transportation analysis engine for logistics and emissions calculations"""
    
    # Emission factors (kg CO2e per ton-km) for different transport modes
    EMISSION_FACTORS = {
        "truck": 0.162,
        "train": 0.041,
        "ship": 0.017,
        "airplane": 0.602,
        "rail": 0.041,
        "road": 0.162,
        "air": 0.602,
        "sea": 0.017,
        "mixed": 0.120  # Average for mixed modes
    }
    
    # Cost factors ($ per ton-km) for different transport modes
    COST_FACTORS = {
        "truck": 2.50,
        "train": 1.20,
        "ship": 0.80,
        "airplane": 8.00,
        "rail": 1.20,
        "road": 2.50,
        "air": 8.00,
        "sea": 0.80,
        "mixed": 2.00
    }
    
    def __init__(self):
        self.logger = logger
    
    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate transportation metrics including costs and emissions
        
        Args:
            data: Dictionary containing transportation parameters
            
        Returns:
            Dictionary with calculated transportation results
        """
        try:
            # Extract parameters
            transport_mode = data.get('transport_mode', 'truck').lower()
            distance_km = data.get('distance_km', 0)
            weight_tons = data.get('weight_tons', 1)
            volume_m3 = data.get('volume_m3', weight_tons)  # Default: 1 ton per m3
            
            # Calculate emissions
            emissions = self._calculate_emissions(transport_mode, distance_km, weight_tons)
            
            # Calculate costs
            transport_cost = self._calculate_transport_cost(transport_mode, distance_km, weight_tons)
            
            # Calculate efficiency metrics
            efficiency_score = self._calculate_efficiency_score(
                transport_mode, distance_km, weight_tons, emissions, transport_cost
            )
            
            # Generate recommendations
            recommendations = self._generate_transport_recommendations(
                transport_mode, distance_km, emissions, transport_cost
            )
            
            return {
                'transport_mode': transport_mode,
                'distance_km': distance_km,
                'weight_tons': weight_tons,
                'emissions_kg_co2e': emissions,
                'transport_cost': transport_cost,
                'cost_per_km': transport_cost / distance_km if distance_km > 0 else 0,
                'emissions_per_km': emissions / distance_km if distance_km > 0 else 0,
                'efficiency_score': efficiency_score,
                'recommendations': recommendations,
                'metrics': {
                    'emission_factor': self.EMISSION_FACTORS.get(transport_mode, self.EMISSION_FACTORS["truck"]),
                    'cost_factor': self.COST_FACTORS.get(transport_mode, self.COST_FACTORS["truck"]),
                    'cost_per_ton_km': transport_cost / (weight_tons * distance_km) if weight_tons > 0 and distance_km > 0 else 0
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in transportation calculation: {e}")
            raise Exception(f"Transportation calculation failed: {str(e)}")
    
    def _calculate_emissions(self, transport_mode: str, distance_km: float, weight_tons: float) -> float:
        """Calculate carbon emissions for transportation"""
        
        emission_factor = self.EMISSION_FACTORS.get(transport_mode, self.EMISSION_FACTORS["truck"])
        emissions = distance_km * weight_tons * emission_factor
        return emissions
    
    def _calculate_transport_cost(self, transport_mode: str, distance_km: float, weight_tons: float) -> float:
        """Calculate transportation cost"""
        
        cost_factor = self.COST_FACTORS.get(transport_mode, self.COST_FACTORS["truck"])
        cost = distance_km * weight_tons * cost_factor
        
        # Add base handling fee
        handling_fee = weight_tons * 50  # $50 per ton handling
        
        return cost + handling_fee
    
    def _calculate_efficiency_score(
        self,
        transport_mode: str,
        distance_km: float,
        weight_tons: float,
        emissions: float,
        cost: float
    ) -> float:
        """Calculate transportation efficiency score (0-100)"""
        
        # Benchmark values for scoring
        benchmark_emission_factor = 0.162  # truck baseline
        benchmark_cost_factor = 2.50  # truck baseline
        
        current_emission_factor = self.EMISSION_FACTORS.get(transport_mode, benchmark_emission_factor)
        current_cost_factor = self.COST_FACTORS.get(transport_mode, benchmark_cost_factor)
        
        # Calculate efficiency relative to benchmarks
        emission_efficiency = (benchmark_emission_factor / current_emission_factor) * 50
        cost_efficiency = (benchmark_cost_factor / current_cost_factor) * 50
        
        # Combine scores
        efficiency_score = min(100, max(0, emission_efficiency + cost_efficiency))
        
        return efficiency_score
    
    def _generate_transport_recommendations(
        self,
        transport_mode: str,
        distance_km: float,
        emissions: float,
        cost: float
    ) -> List[str]:
        """Generate transportation optimization recommendations"""
        
        recommendations = []
        
        # Distance-based recommendations
        if distance_km > 1000:
            if transport_mode in ["truck", "road"]:
                recommendations.append("Consider rail or sea transport for long distances to reduce costs and emissions")
        elif distance_km < 100:
            if transport_mode not in ["truck", "road"]:
                recommendations.append("Road transport may be more efficient for short distances")
        
        # Emission-based recommendations
        emission_per_km = emissions / distance_km if distance_km > 0 else 0
        if emission_per_km > 0.2:  # High emission rate
            recommendations.append("Consider lower-emission transport modes like rail or sea")
        
        # Cost-based recommendations
        cost_per_km = cost / distance_km if distance_km > 0 else 0
        if cost_per_km > 5:  # High cost rate
            recommendations.append("Evaluate alternative transport modes for cost optimization")
        
        # Mode-specific recommendations
        if transport_mode == "airplane":
            recommendations.append("Air transport has high emissions - consider for urgent deliveries only")
        elif transport_mode == "ship":
            recommendations.append("Sea transport is cost-effective but plan for longer lead times")
        elif transport_mode == "train":
            recommendations.append("Rail transport offers good balance of cost and environmental impact")
        
        if not recommendations:
            recommendations.append("Current transportation mode appears optimal for this route")
        
        return recommendations
    
    def calculate_distance_coordinates(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate distance between two coordinates using Haversine formula
        
        Args:
            lat1, lon1: Latitude and longitude of first point
            lat2, lon2: Latitude and longitude of second point
            
        Returns:
            Distance in kilometers
        """
        try:
            # Convert to radians
            lat1_r = math.radians(lat1)
            lon1_r = math.radians(lon1)
            lat2_r = math.radians(lat2)
            lon2_r = math.radians(lon2)
            
            # Haversine formula
            dlat = lat2_r - lat1_r
            dlon = lon2_r - lon1_r
            a = math.sin(dlat/2)**2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance_km = 6371 * c  # Earth's radius in kilometers
            
            return distance_km
            
        except Exception as e:
            self.logger.error(f"Error calculating distance: {e}")
            return 0.0 