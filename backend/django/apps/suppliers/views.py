from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import (
    Supplier,
    Material,
    SupplierMaterial,
    SupplierAssessment,
    Order,
    OrderItem,
    TransportationEmission,
    EmissionFactor
)
from .serializers import (
    SupplierSerializer,
    MaterialSerializer,
    SupplierMaterialSerializer,
    SupplierAssessmentSerializer,
    SupplierCreateSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
    TransportationEmissionSerializer,
    EmissionFactorSerializer,
    TransportationEmissionSummarySerializer
)
from apps.services.supplier_service import SupplierService, SupplierAnalyticsService
from ..services.transportation_service import TransportationService
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

class TransportationEmissionViewSet(viewsets.ModelViewSet):
    queryset = TransportationEmission.objects.all()
    serializer_class = TransportationEmissionSerializer
    service = TransportationService()

    def get_queryset(self):
        queryset = super().get_queryset()
        supplier_id = self.request.query_params.get('supplier_id')
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Calculate emissions using the service
        result = self.service.calculate_emissions(
            supplier_id=serializer.validated_data['supplier'].id,
            distance=serializer.validated_data['distance'],
            volume=serializer.validated_data['volume'],
            transport_mode=serializer.validated_data['transport_mode'],
            vehicle_type=serializer.validated_data['vehicle_type'],
            fuel_type=serializer.validated_data['fuel_type'],
            load_factor=serializer.validated_data.get('load_factor', 0.8),
            return_trip=serializer.validated_data.get('return_trip', False)
        )
        
        # Update serializer data with calculated values
        serializer.validated_data.update({
            'total_emissions': result['total_emissions'],
            'emissions_per_km': result['emissions_per_km'],
            'emissions_per_volume': result['emissions_per_volume'],
            'transport_efficiency_score': result['efficiency_score']
        })
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        supplier_id = request.query_params.get('supplier_id')
        days = int(request.query_params.get('days', 30))
        
        if not supplier_id:
            return Response(
                {'error': 'supplier_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        emissions = self.service.get_supplier_emissions(
            supplier_id=supplier_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Calculate summary statistics
        total_emissions = sum(e['total_emissions'] for e in emissions)
        total_distance = sum(e['distance'] for e in emissions)
        total_volume = sum(e['volume'] for e in emissions)
        average_efficiency = sum(e['transport_efficiency_score'] for e in emissions) / len(emissions) if emissions else 0
        
        # Group emissions by transport mode
        emissions_by_mode = {}
        for emission in emissions:
            mode = emission['transport_mode']
            if mode not in emissions_by_mode:
                emissions_by_mode[mode] = 0
            emissions_by_mode[mode] += emission['total_emissions']
        
        summary_data = {
            'total_emissions': total_emissions,
            'average_efficiency': average_efficiency,
            'total_distance': total_distance,
            'total_volume': total_volume,
            'emissions_by_mode': emissions_by_mode
        }
        
        serializer = TransportationEmissionSummarySerializer(summary_data)
        return Response(serializer.data)

class EmissionFactorViewSet(viewsets.ModelViewSet):
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        transport_mode = self.request.query_params.get('transport_mode')
        vehicle_type = self.request.query_params.get('vehicle_type')
        fuel_type = self.request.query_params.get('fuel_type')
        
        if transport_mode:
            queryset = queryset.filter(transport_mode=transport_mode)
        if vehicle_type:
            queryset = queryset.filter(vehicle_type=vehicle_type)
        if fuel_type:
            queryset = queryset.filter(fuel_type=fuel_type)
            
        return queryset.filter(is_active=True)
