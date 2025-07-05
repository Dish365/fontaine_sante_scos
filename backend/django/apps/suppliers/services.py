import httpx
from django.conf import settings
from django.db.models import Avg, Sum
from django.utils import timezone
from typing import Dict, Any, Optional, List
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

# BaseService class
class BaseService:
    _client = None
    
    def __init__(self):
        self.fastapi_base_url = settings.FASTAPI_BASE_URL
    
    @property
    def client(self):
        """Singleton HTTP client to avoid creating multiple connections"""
        if BaseService._client is None:
            BaseService._client = httpx.AsyncClient(
                base_url=self.fastapi_base_url,
                timeout=30.0,
                headers={'Content-Type': 'application/json'}
            )
        return BaseService._client
    
    async def make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a request to FastAPI with comprehensive error handling
        """
        try:
            response = await self.client.request(
                method=method,
                url=endpoint,
                json=data,
                params=params
            )
            response.raise_for_status()
            
            # Handle empty responses
            if response.status_code == 204 or not response.content:
                return {}
                
            return response.json()
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} for {method} {endpoint}: {e.response.text}")
            raise Exception(f"HTTP {e.response.status_code}: {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Request error for {method} {endpoint}: {str(e)}")
            raise Exception(f"Connection error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error for {method} {endpoint}: {str(e)}")
            raise Exception(f"Service error: {str(e)}")
    
    @classmethod
    async def close_client(cls):
        """
        Close the HTTP client - call this on application shutdown
        """
        if cls._client:
            await cls._client.aclose()
            cls._client = None
    
    @asynccontextmanager
    async def request_context(self):
        """
        Context manager for handling requests with automatic cleanup
        """
        try:
            yield self
        except Exception as e:
            logger.error(f"Error in service context: {str(e)}")
            raise
        finally:
            # Individual request cleanup if needed
            pass

# SupplierService class
class SupplierService(BaseService):
    async def calculate_order_metrics(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send order data to FastAPI for calculations and get results
        """
        return await self.make_request('POST', '/api/orders/calculate', order_data)
    
    async def get_supplier_analytics(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get supplier analytics from FastAPI
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/analytics')
    
    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create an order with calculations from FastAPI
        """
        from .models import Order
        from .serializers import OrderSerializer, OrderCreateSerializer
        
        # First, get calculations from FastAPI
        metrics = await self.calculate_order_metrics(order_data)
        
        # Add calculated metrics to order data
        order_data.update(metrics)
        
        # Create order in Django
        serializer = OrderCreateSerializer(data=order_data)
        if serializer.is_valid():
            order = serializer.save()
            return OrderSerializer(order).data
        raise Exception(f"Error creating order: {serializer.errors}")
    
    async def get_order_history(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get order history with analytics from FastAPI
        """
        from .models import Order
        from .serializers import OrderSerializer
        
        # Get orders from Django
        orders = Order.objects.filter(supplier_id=supplier_id)
        order_data = OrderSerializer(orders, many=True).data
        
        # Get analytics from FastAPI
        analytics = await self.get_supplier_analytics(supplier_id)
        
        return {
            "orders": order_data,
            "analytics": analytics
        }
    
    async def get_supplier_performance(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get detailed supplier performance metrics
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/performance')
    
    async def calculate_supplier_risk(self, supplier_id: int) -> Dict[str, Any]:
        """
        Calculate supplier risk score and factors
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/risk-assessment')
    
    async def get_supplier_capacity(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get supplier capacity analysis
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/capacity')
    
    async def get_supplier_compliance(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get supplier compliance status and history
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/compliance')
    
    async def get_supplier_quality_metrics(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get supplier quality metrics and history
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/quality-metrics')
    
    async def get_supplier_financial_health(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get supplier financial health indicators
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/financial-health')
    
    async def get_supplier_recommendations(self, supplier_id: int) -> List[Dict[str, Any]]:
        """
        Get recommendations for supplier improvement
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/recommendations')

# SupplierAnalyticsService class
class SupplierAnalyticsService(BaseService):
    async def get_environmental_impact(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get environmental impact analysis from FastAPI
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/environmental-impact')
    
    async def calculate_sustainability_score(self, supplier_data: Dict[str, Any]) -> float:
        """
        Calculate sustainability score using FastAPI
        """
        result = await self.make_request('POST', '/api/suppliers/calculate-sustainability', supplier_data)
        return result["score"]
    
    async def get_carbon_footprint_trend(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get carbon footprint trend analysis
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/carbon-footprint-trend')
    
    async def get_energy_consumption_analysis(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get energy consumption analysis
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/energy-consumption')
    
    async def get_waste_management_metrics(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get waste management metrics and analysis
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/waste-management')
    
    async def get_water_usage_analysis(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get water usage analysis
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/water-usage')
    
    async def get_sustainability_goals_progress(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get progress towards sustainability goals
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/sustainability-goals')
    
    async def get_environmental_compliance_status(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get environmental compliance status and history
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/environmental-compliance')
    
    async def get_green_initiatives(self, supplier_id: int) -> List[Dict[str, Any]]:
        """
        Get list of green initiatives and their impact
        """
        return await self.make_request('GET', f'/api/suppliers/{supplier_id}/green-initiatives')

# TransportationService class
class TransportationService(BaseService):
    def __init__(self):
        super().__init__()
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
            from .models import EmissionFactor, TransportMode, VehicleType, FuelType
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
            from .models import Supplier, TransportationEmission, TransportMode
            
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

    def _generate_recommendations(self, emission) -> List[str]:
        """Generate recommendations for improving transportation efficiency."""
        from .models import TransportMode, VehicleType, FuelType
        
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
            from .models import TransportationEmission
            
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
        from .models import TransportMode
        
        emissions_by_mode = {}
        for mode in TransportMode.choices:
            mode_emissions = query.filter(transport_mode=mode[0]).aggregate(
                total=Sum('total_emissions')
            )['total'] or 0
            emissions_by_mode[mode[1]] = mode_emissions
        return emissions_by_mode

# UserService class
class UserService:
    def __init__(self):
        self.fastapi_base_url = settings.FASTAPI_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.fastapi_base_url)
    
    async def get_user_analytics(self, user_id: int) -> Dict[str, Any]:
        """
        Get user analytics from FastAPI
        """
        try:
            response = await self.client.get(
                f"/api/users/{user_id}/analytics"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error getting user analytics: {str(e)}")
    
    async def calculate_user_performance(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate user performance metrics using FastAPI
        """
        try:
            response = await self.client.post(
                "/api/users/calculate-performance",
                json=user_data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error calculating user performance: {str(e)}")
    
    async def get_user_activity_history(self, user_id: int) -> Dict[str, Any]:
        """
        Get user activity history with analytics
        """
        from apps.users.models import User
        from apps.users.serializers import UserSerializer
        
        # Get user from Django
        user = User.objects.get(id=user_id)
        user_data = UserSerializer(user).data
        
        # Get analytics from FastAPI
        analytics = await self.get_user_analytics(user_id)
        
        return {
            "user": user_data,
            "analytics": analytics
        }
    
    async def close(self):
        """
        Close the HTTP client
        """
        await self.client.aclose()
