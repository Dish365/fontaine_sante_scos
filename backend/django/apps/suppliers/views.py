from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Supplier, Material, SupplierMaterial, SupplierAssessment, Order, OrderItem
from .serializers import (
    SupplierSerializer, MaterialSerializer, SupplierMaterialSerializer,
    SupplierAssessmentSerializer, SupplierCreateSerializer,
    OrderSerializer, OrderCreateSerializer, OrderItemSerializer
)
from apps.services.supplier_service import SupplierService, SupplierAnalyticsService
import asyncio

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supplier_service = SupplierService()
        self.analytics_service = SupplierAnalyticsService()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SupplierCreateSerializer
        return SupplierSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    async def create_order(self, request, pk=None):
        supplier = self.get_object()
        request.data['supplier'] = supplier.id
        order_data = await self.supplier_service.create_order(request.data)
        return Response(order_data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    async def orders(self, request, pk=None):
        order_history = await self.supplier_service.get_order_history(pk)
        return Response(order_history)
    
    @action(detail=True, methods=['get'])
    async def environmental_impact(self, request, pk=None):
        impact_data = await self.analytics_service.get_environmental_impact(pk)
        return Response(impact_data)
    
    @action(detail=True, methods=['post'])
    async def sustainability_score(self, request, pk=None):
        supplier = self.get_object()
        supplier_data = SupplierSerializer(supplier).data
        score = await self.analytics_service.calculate_sustainability_score(supplier_data)
        return Response({"score": score})
    
    @action(detail=True, methods=['get'])
    async def performance_metrics(self, request, pk=None):
        metrics = await self.supplier_service.get_supplier_performance(pk)
        return Response(metrics)
    
    @action(detail=True, methods=['get'])
    async def risk_assessment(self, request, pk=None):
        risk_data = await self.supplier_service.calculate_supplier_risk(pk)
        return Response(risk_data)
    
    @action(detail=True, methods=['get'])
    async def capacity_analysis(self, request, pk=None):
        capacity_data = await self.supplier_service.get_supplier_capacity(pk)
        return Response(capacity_data)
    
    @action(detail=True, methods=['get'])
    async def compliance_status(self, request, pk=None):
        compliance_data = await self.supplier_service.get_supplier_compliance(pk)
        return Response(compliance_data)
    
    @action(detail=True, methods=['get'])
    async def quality_metrics(self, request, pk=None):
        quality_data = await self.supplier_service.get_supplier_quality_metrics(pk)
        return Response(quality_data)
    
    @action(detail=True, methods=['get'])
    async def financial_health(self, request, pk=None):
        financial_data = await self.supplier_service.get_supplier_financial_health(pk)
        return Response(financial_data)
    
    @action(detail=True, methods=['get'])
    async def recommendations(self, request, pk=None):
        recommendations = await self.supplier_service.get_supplier_recommendations(pk)
        return Response(recommendations)
    
    @action(detail=True, methods=['get'])
    async def carbon_footprint(self, request, pk=None):
        footprint_data = await self.analytics_service.get_carbon_footprint_trend(pk)
        return Response(footprint_data)
    
    @action(detail=True, methods=['get'])
    async def energy_consumption(self, request, pk=None):
        energy_data = await self.analytics_service.get_energy_consumption_analysis(pk)
        return Response(energy_data)
    
    @action(detail=True, methods=['get'])
    async def waste_management(self, request, pk=None):
        waste_data = await self.analytics_service.get_waste_management_metrics(pk)
        return Response(waste_data)
    
    @action(detail=True, methods=['get'])
    async def water_usage(self, request, pk=None):
        water_data = await self.analytics_service.get_water_usage_analysis(pk)
        return Response(water_data)
    
    @action(detail=True, methods=['get'])
    async def sustainability_goals(self, request, pk=None):
        goals_data = await self.analytics_service.get_sustainability_goals_progress(pk)
        return Response(goals_data)
    
    @action(detail=True, methods=['get'])
    async def environmental_compliance(self, request, pk=None):
        compliance_data = await self.analytics_service.get_environmental_compliance_status(pk)
        return Response(compliance_data)
    
    @action(detail=True, methods=['get'])
    async def green_initiatives(self, request, pk=None):
        initiatives = await self.analytics_service.get_green_initiatives(pk)
        return Response(initiatives)

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]

class SupplierMaterialViewSet(viewsets.ModelViewSet):
    queryset = SupplierMaterial.objects.all()
    serializer_class = SupplierMaterialSerializer
    permission_classes = [IsAuthenticated]

class SupplierAssessmentViewSet(viewsets.ModelViewSet):
    queryset = SupplierAssessment.objects.all()
    serializer_class = SupplierAssessmentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        queryset = SupplierAssessment.objects.all()
        supplier_id = self.request.query_params.get('supplier_id', None)
        if supplier_id is not None:
            queryset = queryset.filter(supplier_id=supplier_id)
        return queryset

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supplier_service = SupplierService()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        queryset = Order.objects.all()
        supplier_id = self.request.query_params.get('supplier_id', None)
        if supplier_id is not None:
            queryset = queryset.filter(supplier_id=supplier_id)
        return queryset
    
    @action(detail=True, methods=['get'])
    async def analytics(self, request, pk=None):
        order = self.get_object()
        order_data = OrderSerializer(order).data
        metrics = await self.supplier_service.calculate_order_metrics(order_data)
        return Response(metrics)
