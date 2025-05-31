from typing import Dict, Any, List
from ..schemas.transportation import (
    TransportationInput,
    TransportationAssessment,
    TransportationEmissionFactors,
    TransportMode,
    VehicleType,
    FuelType
)
from ..exceptions import ValidationError, CalculationError

class TransportationEngine:
    def __init__(self):
        # Initialize emission factors database
        self.emission_factors = self._initialize_emission_factors()

    def _initialize_emission_factors(self) -> Dict[str, Dict[str, float]]:
        """Initialize the database of emission factors for different transport modes and vehicles."""
        return {
            "base_factors": {
                TransportMode.TRUCK: 0.15,  # kg CO2e per km per ton
                TransportMode.TRAIN: 0.03,
                TransportMode.SHIP: 0.02,
                TransportMode.PLANE: 0.25
            },
            "vehicle_factors": {
                VehicleType.SMALL_TRUCK: 1.0,
                VehicleType.MEDIUM_TRUCK: 1.5,
                VehicleType.LARGE_TRUCK: 2.0,
                VehicleType.ELECTRIC_VEHICLE: 0.3,
                VehicleType.HYBRID_VEHICLE: 0.6
            },
            "fuel_factors": {
                FuelType.DIESEL: 1.0,
                FuelType.PETROL: 1.1,
                FuelType.ELECTRIC: 0.2,
                FuelType.HYBRID: 0.5,
                FuelType.BIODIESEL: 0.7,
                FuelType.CNG: 0.8
            }
        }

    async def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate transportation emissions based on input data."""
        try:
            input_data = TransportationInput(**data)
            return await self.calculate_transportation_emissions(input_data)
        except Exception as e:
            raise CalculationError(f"Error in transportation calculation: {str(e)}")

    async def calculate_transportation_emissions(
        self,
        data: TransportationInput
    ) -> TransportationAssessment:
        """Calculate detailed transportation emissions."""
        try:
            # Validate input data
            if data.distance <= 0:
                raise ValidationError("Distance must be greater than zero")
            if data.volume <= 0:
                raise ValidationError("Volume must be greater than zero")
            if data.load_factor <= 0 or data.load_factor > 1:
                raise ValidationError("Load factor must be between 0 and 1")

            # Get base emission factor for transport mode
            base_factor = self.emission_factors["base_factors"][data.transport_mode]

            # Calculate vehicle and fuel multipliers
            vehicle_multiplier = 1.0
            fuel_multiplier = 1.0

            if data.transport_mode == TransportMode.TRUCK:
                if not data.vehicle_type:
                    raise ValidationError("Vehicle type is required for road transport")
                if not data.fuel_type:
                    raise ValidationError("Fuel type is required for road transport")
                
                vehicle_multiplier = self.emission_factors["vehicle_factors"][data.vehicle_type]
                fuel_multiplier = self.emission_factors["fuel_factors"][data.fuel_type]

            # Calculate total emissions
            base_emissions = data.distance * base_factor * data.volume
            adjusted_emissions = base_emissions * vehicle_multiplier * fuel_multiplier
            load_factor_impact = 1 + (1 - data.load_factor) * 0.2  # 20% penalty for empty space
            total_emissions = adjusted_emissions * load_factor_impact

            # Include return trip if specified
            if data.return_trip:
                total_emissions *= 2

            # Calculate efficiency metrics
            emissions_per_km = total_emissions / data.distance
            emissions_per_volume = total_emissions / data.volume

            # Calculate transport efficiency score (0-100)
            efficiency_score = self._calculate_efficiency_score(
                emissions_per_km,
                emissions_per_volume,
                data.load_factor
            )

            # Generate recommendations
            recommendations = self._generate_recommendations(
                data,
                emissions_per_km,
                emissions_per_volume,
                efficiency_score
            )

            # Prepare emission breakdown
            emission_breakdown = {
                "base_emissions": base_emissions,
                "vehicle_impact": base_emissions * (vehicle_multiplier - 1),
                "fuel_impact": base_emissions * (fuel_multiplier - 1),
                "load_factor_impact": base_emissions * (load_factor_impact - 1)
            }

            return TransportationAssessment(
                total_emissions=total_emissions,
                emissions_per_km=emissions_per_km,
                emissions_per_volume=emissions_per_volume,
                transport_efficiency_score=efficiency_score,
                recommendations=recommendations,
                emission_breakdown=emission_breakdown
            )

        except ValidationError as e:
            raise e
        except Exception as e:
            raise CalculationError(f"Error calculating transportation emissions: {str(e)}")

    def _calculate_efficiency_score(
        self,
        emissions_per_km: float,
        emissions_per_volume: float,
        load_factor: float
    ) -> float:
        """Calculate transport efficiency score (0-100)."""
        # Normalize metrics to 0-100 scale
        km_score = max(0, 100 * (1 - emissions_per_km / 2))  # Assuming 2 kg/km as max
        volume_score = max(0, 100 * (1 - emissions_per_volume / 5))  # Assuming 5 kg/m3 as max
        load_score = load_factor * 100

        # Weighted average
        return (km_score * 0.4 + volume_score * 0.4 + load_score * 0.2)

    def _generate_recommendations(
        self,
        data: TransportationInput,
        emissions_per_km: float,
        emissions_per_volume: float,
        efficiency_score: float
    ) -> List[str]:
        """Generate recommendations for improving transportation efficiency."""
        recommendations = []

        if efficiency_score < 70:
            if data.transport_mode == TransportMode.TRUCK:
                if data.vehicle_type in [VehicleType.SMALL_TRUCK, VehicleType.MEDIUM_TRUCK]:
                    recommendations.append("Consider using larger trucks for better efficiency")
                if data.fuel_type in [FuelType.DIESEL, FuelType.PETROL]:
                    recommendations.append("Consider switching to electric or hybrid vehicles")
            
            if data.load_factor < 0.8:
                recommendations.append("Optimize load factor to reduce empty space")
            
            if emissions_per_km > 1.5:
                recommendations.append("Consider alternative transport modes for long distances")
            
            if emissions_per_volume > 3:
                recommendations.append("Optimize packaging to reduce volume requirements")

        return recommendations 