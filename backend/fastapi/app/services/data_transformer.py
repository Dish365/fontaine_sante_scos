import logging
from typing import List, Dict, Any, Optional
from decimal import Decimal
import math
from ..schemas.economic import SupplierCostInput
from ..exceptions import ValidationError, CalculationError

logger = logging.getLogger(__name__)

class DataTransformer:
    """Transform Django supplier data into economic analysis inputs"""
    
    # Default values for missing data
    DEFAULT_TAX_RATE = 0.15  # 15% default tax rate
    DEFAULT_LEAD_TIME = 7  # 7 days default lead time
    DEFAULT_VOLUME = 1000  # Default order volume
    DEFAULT_LABOR_COST_PERCENTAGE = 0.20  # 20% of material cost
    DEFAULT_OVERHEAD_PERCENTAGE = 0.15  # 15% of material cost
    DEFAULT_TRANSPORTATION_COST_PER_KM = 2.5  # $2.50 per kilometer
    DEFAULT_WAREHOUSE_DISTANCE = 100  # 100km default if no warehouse data
    
    def __init__(self):
        pass
    
    def transform_supplier_to_economic_input(
        self,
        supplier: Dict[str, Any],
        supplier_materials: List[Dict[str, Any]],
        warehouse: Optional[Dict[str, Any]] = None,
        order_volume: Optional[float] = None
    ) -> SupplierCostInput:
        """Transform supplier data to SupplierCostInput for economic analysis"""
        
        try:
            # Get supplier ID
            supplier_id = supplier.get('id')
            if not supplier_id:
                raise ValidationError("Supplier ID is required")
            
            # Calculate material costs (average of all materials if multiple)
            material_cost = self._calculate_material_cost(supplier_materials, order_volume)
            
            # Calculate transportation cost based on distance
            transportation_cost = self._calculate_transportation_cost(supplier, warehouse)
            
            # Estimate labor costs (percentage of material cost)
            labor_cost = material_cost * Decimal(str(self.DEFAULT_LABOR_COST_PERCENTAGE))
            
            # Estimate overhead costs (percentage of material cost)
            overhead_cost = material_cost * Decimal(str(self.DEFAULT_OVERHEAD_PERCENTAGE))
            
            # Get tax rate from supplier materials or use default
            tax_rate = self._get_tax_rate(supplier_materials)
            
            # Get capacity information
            capacity = self._get_supplier_capacity(supplier)
            
            # Use provided volume or default
            volume = order_volume or self.DEFAULT_VOLUME
            
            # Get lead time (average of all materials)
            lead_time = self._get_average_lead_time(supplier_materials)
            
            return SupplierCostInput(
                supplier_id=supplier_id,
                material_cost=float(material_cost),
                transportation_cost=float(transportation_cost),
                tax_rate=float(tax_rate),
                capacity=float(capacity),
                labor_cost=float(labor_cost),
                overhead_cost=float(overhead_cost),
                volume=float(volume),
                lead_time=int(lead_time)
            )
            
        except Exception as e:
            logger.error(f"Error transforming supplier {supplier.get('id', 'unknown')}: {e}")
            raise CalculationError(f"Failed to transform supplier data: {str(e)}")
    
    def _calculate_material_cost(
        self,
        supplier_materials: List[Dict[str, Any]],
        order_volume: Optional[float] = None
    ) -> Decimal:
        """Calculate total material cost for the supplier"""
        
        if not supplier_materials:
            logger.warning("No supplier materials found, using default material cost")
            return Decimal('100.00')  # Default material cost
        
        total_cost = Decimal('0')
        volume = order_volume or self.DEFAULT_VOLUME
        
        for material in supplier_materials:
            # Get price with tax included
            price_with_tax = material.get('price_with_tax', material.get('current_price', 0))
            if not price_with_tax:
                price_with_tax = material.get('base_cost_per_unit', 0)
            
            # Calculate cost for this material (assume equal distribution of volume)
            material_volume = volume / len(supplier_materials)
            material_cost = Decimal(str(price_with_tax)) * Decimal(str(material_volume))
            total_cost += material_cost
        
        return total_cost
    
    def _calculate_transportation_cost(
        self,
        supplier: Dict[str, Any],
        warehouse: Optional[Dict[str, Any]] = None
    ) -> Decimal:
        """Calculate transportation cost based on distance"""
        
        # Calculate distance between supplier and warehouse
        distance_km = self._calculate_distance(supplier, warehouse)
        
        # Get transportation mode cost multiplier
        transport_mode = supplier.get('transportation_mode', 'road')
        cost_multiplier = self._get_transport_cost_multiplier(transport_mode)
        
        # Calculate transportation cost
        base_cost = Decimal(str(distance_km)) * Decimal(str(self.DEFAULT_TRANSPORTATION_COST_PER_KM))
        transportation_cost = base_cost * Decimal(str(cost_multiplier))
        
        return transportation_cost
    
    def _calculate_distance(
        self,
        supplier: Dict[str, Any],
        warehouse: Optional[Dict[str, Any]] = None
    ) -> float:
        """Calculate distance between supplier and warehouse using coordinates"""
        
        if not warehouse or not supplier.get('coordinates') or not warehouse.get('coordinates'):
            logger.warning("Missing coordinates, using default distance")
            return self.DEFAULT_WAREHOUSE_DISTANCE
        
        try:
            # Get coordinates
            supplier_coords = supplier['coordinates']
            warehouse_coords = warehouse['coordinates']
            
            if not supplier_coords or not warehouse_coords:
                return self.DEFAULT_WAREHOUSE_DISTANCE
            
            # Simple haversine distance calculation
            lat1, lon1 = supplier_coords[0], supplier_coords[1]
            lat2, lon2 = warehouse_coords[0], warehouse_coords[1]
            
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
            logger.warning(f"Error calculating distance: {e}, using default")
            return self.DEFAULT_WAREHOUSE_DISTANCE
    
    def _get_transport_cost_multiplier(self, transport_mode: str) -> float:
        """Get cost multiplier based on transportation mode"""
        multipliers = {
            'road': 1.0,
            'rail': 0.7,
            'air': 3.0,
            'sea': 0.5,
            'mixed': 1.2
        }
        return multipliers.get(transport_mode, 1.0)
    
    def _get_tax_rate(self, supplier_materials: List[Dict[str, Any]]) -> Decimal:
        """Get tax rate from supplier materials or use default"""
        
        for material in supplier_materials:
            tax_region = material.get('tax_region_name')
            if tax_region:
                # This is simplified - in reality, you'd fetch tax details from Django
                # For now, return a reasonable default based on common Canadian rates
                return Decimal('0.13')  # 13% HST for most Canadian provinces
        
        return Decimal(str(self.DEFAULT_TAX_RATE))
    
    def _get_supplier_capacity(self, supplier: Dict[str, Any]) -> Decimal:
        """Get supplier capacity"""
        
        capacity = supplier.get('current_capacity') or supplier.get('max_supply_capacity')
        if capacity:
            return Decimal(str(capacity))
        
        # Default capacity based on supplier size (heuristic)
        return Decimal('10000')  # Default 10,000 units capacity
    
    def _get_average_lead_time(self, supplier_materials: List[Dict[str, Any]]) -> int:
        """Calculate average lead time from supplier materials"""
        
        if not supplier_materials:
            return self.DEFAULT_LEAD_TIME
        
        total_lead_time = 0
        count = 0
        
        for material in supplier_materials:
            lead_time = material.get('lead_time')
            if lead_time:
                total_lead_time += lead_time
                count += 1
        
        if count > 0:
            return int(total_lead_time / count)
        
        return self.DEFAULT_LEAD_TIME

# Singleton instance
data_transformer = DataTransformer() 