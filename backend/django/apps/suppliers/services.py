import httpx
from django.conf import settings
from typing import Dict, Any, Optional
from .models import Supplier, Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer

class SupplierService:
    def __init__(self):
        self.fastapi_base_url = settings.FASTAPI_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.fastapi_base_url)
    
    async def calculate_order_metrics(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send order data to FastAPI for calculations and get results
        """
        try:
            response = await self.client.post(
                "/api/orders/calculate",
                json=order_data
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error communicating with FastAPI: {str(e)}")
    
    async def get_supplier_analytics(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get supplier analytics from FastAPI
        """
        try:
            response = await self.client.get(
                f"/api/suppliers/{supplier_id}/analytics"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error getting supplier analytics: {str(e)}")
    
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
    
    async def close(self):
        """
        Close the HTTP client
        """
        await self.client.aclose()

class SupplierAnalyticsService:
    def __init__(self):
        self.fastapi_base_url = settings.FASTAPI_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.fastapi_base_url)
    
    async def get_environmental_impact(self, supplier_id: int) -> Dict[str, Any]:
        """
        Get environmental impact analysis from FastAPI
        """
        try:
            response = await self.client.get(
                f"/api/suppliers/{supplier_id}/environmental-impact"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error getting environmental impact: {str(e)}")
    
    async def calculate_sustainability_score(self, supplier_data: Dict[str, Any]) -> float:
        """
        Calculate sustainability score using FastAPI
        """
        try:
            response = await self.client.post(
                "/api/suppliers/calculate-sustainability",
                json=supplier_data
            )
            response.raise_for_status()
            return response.json()["score"]
        except httpx.HTTPError as e:
            raise Exception(f"Error calculating sustainability score: {str(e)}")
    
    async def close(self):
        """
        Close the HTTP client
        """
        await self.client.aclose() 