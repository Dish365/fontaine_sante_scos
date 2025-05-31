from typing import Dict, Any, List, Optional
from django.db.models import Avg, Sum
from django.utils import timezone
from ..suppliers.models import (
    TransportationEmission,
    EmissionFactor,
    TransportMode,
    VehicleType,
    FuelType
)
from ..suppliers.models import Supplier
from .base import BaseService

class TransportationService(BaseService):
    def __init__(self):
        self._emission_factors_cache = None

    def get_emission_factors(self):
        if self._emission_factors_cache is None:
            self._emission_factors_cache = self._initialize_emission_factors()
        return self._emission_factors_cache

    def _initialize_emission_factors(self):
        # Default emission factors if not found in database
        default_factors = {
            'truck': {
                'small_truck': {
                    'diesel': {'base': 0.2, 'volume': 0.1, 'load': 0.05},
                    'petrol': {'base': 0.22, 'volume': 0.1, 'load': 0.05},
                    'electric': {'base': 0.1, 'volume': 0.1, 'load': 0.05},
                    'hybrid': {'base': 0.15, 'volume': 0.1, 'load': 0.05},
                    'biodiesel': {'base': 0.18, 'volume': 0.1, 'load': 0.05},
                    'cng': {'base': 0.16, 'volume': 0.1, 'load': 0.05}
                },
                'medium_truck': {
                    'diesel': {'base': 0.3, 'volume': 0.15, 'load': 0.08},
                    'petrol': {'base': 0.32, 'volume': 0.15, 'load': 0.08},
                    'electric': {'base': 0.15, 'volume': 0.15, 'load': 0.08},
                    'hybrid': {'base': 0.2, 'volume': 0.15, 'load': 0.08},
                    'biodiesel': {'base': 0.25, 'volume': 0.15, 'load': 0.08},
                    'cng': {'base': 0.22, 'volume': 0.15, 'load': 0.08}
                },
                'large_truck': {
                    'diesel': {'base': 0.4, 'volume': 0.2, 'load': 0.1},
                    'petrol': {'base': 0.42, 'volume': 0.2, 'load': 0.1},
                    'electric': {'base': 0.2, 'volume': 0.2, 'load': 0.1},
                    'hybrid': {'base': 0.25, 'volume': 0.2, 'load': 0.1},
                    'biodiesel': {'base': 0.35, 'volume': 0.2, 'load': 0.1},
                    'cng': {'base': 0.3, 'volume': 0.2, 'load': 0.1}
                }
            },
            'train': {
                None: {
                    'diesel': {'base': 0.1, 'volume': 0.05, 'load': 0.02},
                    'electric': {'base': 0.05, 'volume': 0.05, 'load': 0.02}
                }
            },
            'ship': {
                None: {
                    'diesel': {'base': 0.15, 'volume': 0.1, 'load': 0.05},
                    'biodiesel': {'base': 0.12, 'volume': 0.1, 'load': 0.05}
                }
            },
            'plane': {
                None: {
                    'jet_fuel': {'base': 0.5, 'volume': 0.3, 'load': 0.15}
                }
            }
        }
        
        # Try to get emission factors from database, fallback to defaults if not found
        try:
            from apps.suppliers.models import EmissionFactor
            for transport_mode, vehicle_types in default_factors.items():
                for vehicle_type, fuel_types in vehicle_types.items():
                    for fuel_type, factors in fuel_types.items():
                        EmissionFactor.objects.get_or_create(
                            transport_mode=transport_mode,
                            vehicle_type=vehicle_type,
                            fuel_type=fuel_type,
                            defaults={
                                'base_emission_factor': factors['base'],
                                'volume_factor': factors['volume'],
                                'load_factor_impact': factors['load']
                            }
                        )
            return {ef.transport_mode: {ef.vehicle_type: {ef.fuel_type: ef} for ef in EmissionFactor.objects.filter(transport_mode=transport_mode)} for transport_mode in default_factors.keys()}
        except Exception as e:
            print(f"Error initializing emission factors: {e}")
            return default_factors

    def calculate_emissions(
        self,
        supplier_id: str,
        distance: float,
        volume: float,
        transport_mode: str,
        vehicle_type: Optional[str] = None,
        fuel_type: Optional[str] = None,
        load_factor: float = 1.0,
        return_trip: bool = False
    ) -> Dict[str, Any]:
        """Calculate transportation emissions and store the results."""
        try:
            # Validate supplier
            supplier = Supplier.objects.get(id=supplier_id)

            # Get emission factors
            emission_factors = self.get_emission_factors()
            emission_factor = emission_factors[transport_mode][vehicle_type][fuel_type]
            
            # Calculate base emissions
            base_emissions = distance * emission_factor.base_emission_factor * volume
            
            # Apply vehicle and fuel multipliers if applicable
            if transport_mode == TransportMode.TRUCK:
                if not vehicle_type or not fuel_type:
                    raise ValueError("Vehicle type and fuel type are required for road transport")
                
                vehicle_multiplier = emission_factors[transport_mode][vehicle_type][None].base_emission_factor
                fuel_multiplier = emission_factors[transport_mode][None][fuel_type].base_emission_factor
                adjusted_emissions = base_emissions * vehicle_multiplier * fuel_multiplier
            else:
                adjusted_emissions = base_emissions

            # Apply load factor impact
            load_factor_impact = 1 + (1 - load_factor) * emission_factor.load_factor_impact
            total_emissions = adjusted_emissions * load_factor_impact

            # Include return trip if specified
            if return_trip:
                total_emissions *= 2

            # Calculate efficiency metrics
            emissions_per_km = total_emissions / distance
            emissions_per_volume = total_emissions / volume
            efficiency_score = self._calculate_efficiency_score(
                emissions_per_km,
                emissions_per_volume,
                load_factor
            )

            # Store the calculation
            emission = TransportationEmission.objects.create(
                supplier=supplier,
                distance=distance,
                volume=volume,
                transport_mode=transport_mode,
                vehicle_type=vehicle_type,
                fuel_type=fuel_type,
                load_factor=load_factor,
                return_trip=return_trip,
                total_emissions=total_emissions,
                emissions_per_km=emissions_per_km,
                emissions_per_volume=emissions_per_volume,
                transport_efficiency_score=efficiency_score
            )

            return {
                "success": True,
                "data": {
                    "emission_id": emission.id,
                    "total_emissions": total_emissions,
                    "emissions_per_km": emissions_per_km,
                    "emissions_per_volume": emissions_per_volume,
                    "efficiency_score": efficiency_score,
                    "recommendations": self._generate_recommendations(emission)
                }
            }

        except Supplier.DoesNotExist:
            return {"success": False, "error": "Supplier not found"}
        except Exception as e:
            return {"success": False, "error": str(e)}

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

    def _generate_recommendations(self, emission: TransportationEmission) -> List[str]:
        """Generate recommendations for improving transportation efficiency."""
        recommendations = []

        if emission.transport_efficiency_score < 70:
            if emission.transport_mode == TransportMode.TRUCK:
                if emission.vehicle_type in [VehicleType.SMALL_TRUCK, VehicleType.MEDIUM_TRUCK]:
                    recommendations.append("Consider using larger trucks for better efficiency")
                if emission.fuel_type in [FuelType.DIESEL, FuelType.PETROL]:
                    recommendations.append("Consider switching to electric or hybrid vehicles")
            
            if emission.load_factor < 0.8:
                recommendations.append("Optimize load factor to reduce empty space")
            
            if emission.emissions_per_km > 1.5:
                recommendations.append("Consider alternative transport modes for long distances")
            
            if emission.emissions_per_volume > 3:
                recommendations.append("Optimize packaging to reduce volume requirements")

        return recommendations

    def get_supplier_emissions(
        self,
        supplier_id: str,
        start_date: Optional[timezone.datetime] = None,
        end_date: Optional[timezone.datetime] = None
    ) -> Dict[str, Any]:
        """Get transportation emissions for a supplier within a date range."""
        try:
            query = TransportationEmission.objects.filter(supplier_id=supplier_id)
            
            if start_date:
                query = query.filter(created_at__gte=start_date)
            if end_date:
                query = query.filter(created_at__lte=end_date)

            emissions = query.aggregate(
                total_emissions=Sum('total_emissions'),
                avg_efficiency=Avg('transport_efficiency_score'),
                total_distance=Sum('distance'),
                total_volume=Sum('volume')
            )

            return {
                "success": True,
                "data": {
                    "total_emissions": emissions['total_emissions'] or 0,
                    "average_efficiency": emissions['avg_efficiency'] or 0,
                    "total_distance": emissions['total_distance'] or 0,
                    "total_volume": emissions['total_volume'] or 0,
                    "emissions_by_mode": self._get_emissions_by_mode(query)
                }
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def _get_emissions_by_mode(self, query) -> Dict[str, float]:
        """Get emissions breakdown by transport mode."""
        emissions_by_mode = {}
        for mode in TransportMode.values:
            total = query.filter(transport_mode=mode).aggregate(
                total=Sum('total_emissions')
            )['total'] or 0
            emissions_by_mode[mode] = total
        return emissions_by_mode 