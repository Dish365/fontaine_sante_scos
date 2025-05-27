from django.conf import settings
from typing import Dict, Any, Optional, List
from apps.suppliers.models import Supplier, Order, OrderItem
from apps.suppliers.serializers import OrderSerializer, OrderCreateSerializer, SupplierSerializer
from .base import BaseService

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