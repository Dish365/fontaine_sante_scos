from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum, F, ExpressionWrapper, DecimalField
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta, date
from decimal import Decimal
import asyncio
import logging
from django.db.models.functions import ExtractMonth, TruncMonth

logger = logging.getLogger(__name__)

# Custom permission class for internal service communication
class AllowInternalServiceOrAuthenticated(IsAuthenticated):
    """
    Custom permission that allows:
    1. Authenticated users (normal behavior)
    2. Internal service requests from FastAPI
    3. Frontend requests with proper headers
    """
    
    def has_permission(self, request, view):
        # Check if this is an internal service request from FastAPI
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        x_internal_service = request.META.get('HTTP_X_INTERNAL_SERVICE', '')
        
        # Allow FastAPI internal service requests
        if ('httpx' in user_agent.lower() and 'fastapi' in user_agent.lower()) or x_internal_service == 'fastapi':
            logger.info("Allowing FastAPI internal service request")
            return True
        
        # Allow frontend requests from our Next.js app
        origin = request.META.get('HTTP_ORIGIN', '')
        if origin in ['http://localhost:3000', 'http://localhost:3001']:
            logger.info("Allowing frontend request from trusted origin")
            return True
        
        # For all other requests, require authentication
        return super().has_permission(request, view)

# Import models
from .models import (
    Supplier,
    Material,
    MaterialCategory,
    SupplierMaterial,
    SupplierAssessment,
    Order,
    OrderItem,
    TransportationEmission,
    EmissionFactor,
    Currency,
    TaxRegion,
    Warehouse,
    WarehouseInventory,
    WarehouseCapacityAlert,
    VolumePricingTier,
    SeasonalPricing,
    ExternalTaxService
)

# Import serializers
from .serializers import (
    SupplierSerializer,
    SupplierCreateSerializer,
    MaterialSerializer,
    MaterialCategorySerializer,
    SupplierMaterialSerializer,
    SupplierMaterialCreateSerializer,
    SupplierAssessmentSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
    TransportationEmissionSerializer,
    EmissionFactorSerializer,
    TransportationEmissionSummarySerializer,
    CurrencySerializer,
    TaxRegionSerializer,
    WarehouseSerializer,
    WarehouseInventorySerializer,
    WarehouseCapacityAlertSerializer,
    VolumePricingTierSerializer,
    SeasonalPricingSerializer,
    TaxCalculationRequestSerializer,
    TaxCalculationResponseSerializer,
    GeocodeRequestSerializer,
    GeocodeResponseSerializer,
    MaterialSearchSerializer,
    SupplierSearchSerializer
)

# Import services with error handling
try:
    from .services import SupplierService, SupplierAnalyticsService, TransportationService
    SERVICES_AVAILABLE = True
    logger.info("Services successfully imported in views")
except ImportError as e:
    logger.warning(f"Services not available: {e}")
    SERVICES_AVAILABLE = False
    
class MaterialCategoryViewSet(viewsets.ModelViewSet):
    """Material Categories API - Manage material categories"""
    queryset = MaterialCategory.objects.all()
    serializer_class = MaterialCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def materials(self, request, pk=None):
        """Get all materials in this category"""
        category = self.get_object()
        materials = category.materials.filter(is_active=True)
        serializer = MaterialSerializer(materials, many=True, context={'request': request})
        return Response(serializer.data)

class MaterialViewSet(viewsets.ModelViewSet):
    """Materials API - Manage raw materials with enhanced search"""
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'unit', 'is_organic', 'is_active']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['category__name', 'name']

    @action(detail=False, methods=['post'])
    def search(self, request):
        """Advanced material search with custom filters"""
        serializer = MaterialSearchSerializer(data=request.data)
        if serializer.is_valid():
            queryset = self.get_queryset()
            
            # Apply filters
            if serializer.validated_data.get('query'):
                query = serializer.validated_data['query']
                queryset = queryset.filter(
                    Q(name__icontains=query) |
                    Q(description__icontains=query) |
                    Q(sku__icontains=query)
                )
            
            if serializer.validated_data.get('category_id'):
                queryset = queryset.filter(category_id=serializer.validated_data['category_id'])
            
            if serializer.validated_data.get('is_organic') is not None:
                queryset = queryset.filter(is_organic=serializer.validated_data['is_organic'])
            
            if serializer.validated_data.get('unit'):
                queryset = queryset.filter(unit=serializer.validated_data['unit'])
            
            if serializer.validated_data.get('min_suppliers'):
                queryset = queryset.annotate(
                    supplier_count=Count('suppliers', filter=Q(suppliers__is_active=True))
                ).filter(supplier_count__gte=serializer.validated_data['min_suppliers'])
            
            # Serialize results
            serializer = MaterialSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def suppliers(self, request, pk=None):
        """Get all suppliers for this material with pricing"""
        material = self.get_object()
        supplier_materials = material.suppliermaterial_set.filter(
            is_active=True,
            supplier__is_active=True
        ).select_related('supplier', 'currency', 'tax_region')
        
        serializer = SupplierMaterialSerializer(supplier_materials, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def pricing_analysis(self, request, pk=None):
        """Get pricing analysis for this material across suppliers"""
        material = self.get_object()
        supplier_materials = material.suppliermaterial_set.filter(is_active=True)
        
        if not supplier_materials.exists():
            return Response({'message': 'No pricing data available'})
        
        prices = [float(sm.get_seasonal_price()) for sm in supplier_materials]
        
        analysis = {
            'material_id': material.id,
            'material_name': material.name,
            'supplier_count': len(prices),
            'min_price': min(prices),
            'max_price': max(prices),
            'avg_price': sum(prices) / len(prices),
            'price_range': max(prices) - min(prices),
            'suppliers': []
        }
        
        for sm in supplier_materials:
            analysis['suppliers'].append({
                'supplier_id': sm.supplier.id,
                'supplier_name': sm.supplier.name,
                'price': float(sm.get_seasonal_price()),
                'price_with_tax': float(sm.get_price_with_tax()),
                'lead_time': sm.lead_time,
                'min_quantity': float(sm.minimum_order_quantity),
                'currency': sm.currency.code if sm.currency else 'CAD'
            })
        
        return Response(analysis)

class CurrencyViewSet(viewsets.ModelViewSet):
    """Currency API - Manage supported currencies"""
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['code', 'name']
    ordering = ['code']

class TaxRegionViewSet(viewsets.ModelViewSet):
    """Tax Regions API - Manage Canadian tax regions and rates"""
    queryset = TaxRegion.objects.all()
    serializer_class = TaxRegionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'province_state', 'tax_type', 'is_active', 'is_cross_border']
    search_fields = ['name', 'province_state']
    ordering_fields = ['name', 'country', 'province_state', 'effective_date']
    ordering = ['country', 'province_state']

    @action(detail=False, methods=['get'])
    def canadian_rates(self, request):
        """Get current Canadian tax rates for all provinces"""
        rates = TaxRegion.get_current_canadian_rates()
        return Response(rates)

    @action(detail=True, methods=['post'])
    def calculate_tax(self, request, pk=None):
        """Calculate tax for a given amount in this region"""
        tax_region = self.get_object()
        serializer = TaxCalculationRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            include_duties = serializer.validated_data.get('include_duties', False)
            
            breakdown = tax_region.calculate_tax_breakdown(amount)
            breakdown['tax_region'] = tax_region.name
            
            response_serializer = TaxCalculationResponseSerializer(data=breakdown)
            if response_serializer.is_valid():
                return Response(response_serializer.data)
            else:
                return Response(response_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WarehouseViewSet(viewsets.ModelViewSet):
    """Enhanced Warehouses API - Manage warehouse locations, capacity, and supplier relationships"""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [AllowInternalServiceOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warehouse_type', 'country', 'state_province', 'is_active', 'is_primary', 
                        'monitoring_enabled', 'monitoring_status', 'priority', 'cold_storage_available',
                        'hazmat_certified', 'organic_certified', 'cross_dock_capable', 'operates_24_7']
    search_fields = ['name', 'code', 'city', 'manager_name', 'description']
    ordering_fields = ['name', 'code', 'created_at', 'current_utilization', 'priority', 'warehouse_type']
    ordering = ['-is_primary', 'priority', 'name']

    def get_queryset(self):
        """Enhanced queryset with prefetch for performance"""
        return super().get_queryset().prefetch_related('preferred_suppliers')

    def perform_create(self, serializer):
        """Set created_by on warehouse creation"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def geocode(self, request, pk=None):
        """Geocode warehouse address with enhanced response"""
        warehouse = self.get_object()
        
        if warehouse.geocode_address():
            warehouse.save()
            serializer = self.get_serializer(warehouse)
            return Response({
                'success': True,
                'message': 'Address geocoded successfully',
                'warehouse': serializer.data,
                'coordinates': warehouse.coordinates,
                'geocoding_source': warehouse.geocoding_source,
                'geocoding_accuracy': warehouse.geocoding_accuracy
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to geocode address. Please check the address format.',
                'suggestions': [
                    'Ensure street number and name are provided',
                    'Check city and province spelling',
                    'Verify postal code format',
                    'Make sure country is correct'
                ]
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def nearby_suppliers(self, request, pk=None):
        """Get suppliers near this warehouse with enhanced filtering"""
        warehouse = self.get_object()
        
        # Get query parameters
        radius = float(request.query_params.get('radius', 100))  # Default 100km
        transport_mode = request.query_params.get('transport_mode')
        material_id = request.query_params.get('material_id')
        min_capacity = request.query_params.get('min_capacity')
        
        # Get suppliers based on parameters
        if material_id:
            suppliers = warehouse.get_compatible_suppliers(material_id=int(material_id))
        elif transport_mode:
            suppliers = warehouse.get_suppliers_by_distance(
                radius_km=radius, 
                transport_mode=transport_mode
            )
        else:
            suppliers = warehouse.get_suppliers_by_distance(radius_km=radius)
        
        # Additional filtering
        if min_capacity:
            suppliers = suppliers.filter(current_capacity__gte=float(min_capacity))
        
        # Calculate distances and sort
        supplier_data = []
        for supplier in suppliers:
            distance = warehouse.get_distance_to_supplier(supplier)
            if distance is not None:
                supplier_data.append({
                    'supplier': SupplierSerializer(supplier, context={'request': request}).data,
                    'distance_km': round(distance, 2),
                    'transport_compatible': (
                        not transport_mode or 
                        transport_mode in supplier.transportation_modes or
                        supplier.transportation_mode == transport_mode
                    )
                })
        
        # Sort by distance
        supplier_data.sort(key=lambda x: x['distance_km'])
        
        return Response({
            'warehouse_id': warehouse.id,
            'warehouse_name': warehouse.name,
            'warehouse_coordinates': warehouse.coordinates,
            'search_radius_km': radius,
            'transport_mode': transport_mode,
            'material_id': material_id,
            'supplier_count': len(supplier_data),
            'suppliers': supplier_data
        })

    @action(detail=True, methods=['get'])
    def optimal_suppliers(self, request, pk=None):
        """Get optimal suppliers for a specific material with scoring"""
        warehouse = self.get_object()
        
        material_id = request.query_params.get('material_id')
        quantity = request.query_params.get('quantity')
        
        if not material_id:
            return Response({
                'error': 'material_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get optimal suppliers with scoring
            supplier_scores = warehouse.get_optimal_suppliers(
                material_id=int(material_id),
                quantity=float(quantity) if quantity else None
            )
            
            # Format response
            optimal_suppliers = []
            for score_data in supplier_scores:
                supplier_data = SupplierSerializer(
                    score_data['supplier'], 
                    context={'request': request}
                ).data
                
                optimal_suppliers.append({
                    'supplier': supplier_data,
                    'optimization_score': round(score_data['score'], 2),
                    'distance_km': round(score_data['distance'], 2),
                    'price_per_unit': score_data['price'],
                    'lead_time_days': score_data['lead_time'],
                    'transport_compatible': score_data['transport_compatible'],
                    'recommendation': self._get_supplier_recommendation(score_data)
                })
            
            return Response({
                'warehouse_id': warehouse.id,
                'warehouse_name': warehouse.name,
                'material_id': material_id,
                'quantity': quantity,
                'optimal_suppliers': optimal_suppliers,
                'total_evaluated': len(optimal_suppliers)
            })
            
        except Exception as e:
            logger.error(f"Error finding optimal suppliers: {e}")
            return Response({
                'error': 'Failed to calculate optimal suppliers'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_supplier_recommendation(self, score_data):
        """Generate recommendation text for supplier"""
        score = score_data['score']
        if score >= 90:
            return "Excellent choice - high score across all criteria"
        elif score >= 80:
            return "Good option - strong performance in most areas"
        elif score >= 70:
            return "Acceptable - consider for backup or specific needs"
        elif score >= 60:
            return "Below average - may require additional evaluation"
        else:
            return "Poor fit - consider alternative suppliers"

    @action(detail=True, methods=['get'])
    def performance_metrics(self, request, pk=None):
        """Get performance metrics for this warehouse"""
        warehouse = self.get_object()
        
        metrics = warehouse.get_performance_metrics()
        
        # Add additional calculated metrics
        metrics.update({
            'capacity_utilization': {
                'current': float(warehouse.current_utilization or 0),
                'status': warehouse.utilization_status,
                'threshold': float(warehouse.max_capacity_threshold),
                'is_over_capacity': warehouse.is_over_capacity
            },
            'monitoring': {
                'enabled': warehouse.monitoring_enabled,
                'status': warehouse.monitoring_status,
                'last_check': warehouse.last_monitoring_check,
                'needs_update': warehouse.needs_monitoring_update,
                'interval_seconds': warehouse.monitoring_interval
            },
            'location': {
                'coordinates': warehouse.coordinates,
                'has_valid_coordinates': warehouse.has_valid_coordinates,
                'geofence_radius_meters': warehouse.geofence_radius,
                'last_gps_update': warehouse.gps_last_updated
            }
        })
        
        return Response(metrics)

    @action(detail=True, methods=['post'])
    def update_monitoring(self, request, pk=None):
        """Update monitoring status and metrics"""
        warehouse = self.get_object()
        
        # Update monitoring status
        new_status = request.data.get('status')
        if new_status in ['online', 'offline', 'maintenance', 'alert']:
            warehouse.update_monitoring_status(new_status)
        
        # Update performance metrics if provided
        if 'avg_delivery_time' in request.data:
            warehouse.avg_delivery_time = request.data['avg_delivery_time']
        
        if 'on_time_delivery_rate' in request.data:
            warehouse.on_time_delivery_rate = request.data['on_time_delivery_rate']
        
        if 'current_utilization' in request.data:
            warehouse.current_utilization = request.data['current_utilization']
        
        warehouse.last_performance_update = timezone.now()
        warehouse.save()
        
        return Response({
            'success': True,
            'message': 'Monitoring status updated successfully',
            'warehouse': self.get_serializer(warehouse).data
        })

    @action(detail=True, methods=['post'])
    def check_geofence(self, request, pk=None):
        """Check if coordinates are within warehouse geofence"""
        warehouse = self.get_object()
        
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if not lat or not lng:
            return Response({
                'error': 'latitude and longitude are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            is_within = warehouse.is_within_geofence(float(lat), float(lng))
            
            return Response({
                'warehouse_id': warehouse.id,
                'warehouse_name': warehouse.name,
                'warehouse_coordinates': warehouse.coordinates,
                'check_coordinates': [float(lat), float(lng)],
                'geofence_radius_meters': warehouse.geofence_radius,
                'is_within_geofence': is_within
            })
            
        except ValueError:
            return Response({
                'error': 'Invalid coordinates provided'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_preferred_supplier(self, request, pk=None):
        """Add a preferred supplier to this warehouse"""
        warehouse = self.get_object()
        supplier_id = request.data.get('supplier_id')
        
        if not supplier_id:
            return Response({
                'error': 'supplier_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(id=supplier_id, is_active=True)
            warehouse.preferred_suppliers.add(supplier)
            
            return Response({
                'success': True,
                'message': f'Supplier {supplier.name} added to preferred suppliers',
                'warehouse_id': warehouse.id,
                'supplier_id': supplier.id
            })
            
        except Supplier.DoesNotExist:
            return Response({
                'error': 'Supplier not found or inactive'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def remove_preferred_supplier(self, request, pk=None):
        """Remove a preferred supplier from this warehouse"""
        warehouse = self.get_object()
        supplier_id = request.query_params.get('supplier_id')
        
        if not supplier_id:
            return Response({
                'error': 'supplier_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(id=supplier_id)
            warehouse.preferred_suppliers.remove(supplier)
            
            return Response({
                'success': True,
                'message': f'Supplier {supplier.name} removed from preferred suppliers',
                'warehouse_id': warehouse.id,
                'supplier_id': supplier.id
            })
            
        except Supplier.DoesNotExist:
            return Response({
                'error': 'Supplier not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def monitoring_overview(self, request):
        """Get monitoring overview for all warehouses"""
        warehouses = self.get_queryset().filter(monitoring_enabled=True)
        
        overview = {
            'total_warehouses': warehouses.count(),
            'status_breakdown': {},
            'utilization_summary': {
                'avg_utilization': 0,
                'over_capacity_count': 0,
                'low_utilization_count': 0
            },
            'performance_summary': {
                'avg_delivery_time': 0,
                'avg_on_time_rate': 0
            },
            'alerts': []
        }
        
        # Calculate status breakdown
        for status_choice in ['online', 'offline', 'maintenance', 'alert']:
            count = warehouses.filter(monitoring_status=status_choice).count()
            overview['status_breakdown'][status_choice] = count
        
        # Calculate utilization summary
        active_warehouses = warehouses.filter(current_utilization__isnull=False)
        if active_warehouses.exists():
            total_utilization = sum(float(w.current_utilization) for w in active_warehouses)
            overview['utilization_summary']['avg_utilization'] = round(
                total_utilization / active_warehouses.count(), 2
            )
            overview['utilization_summary']['over_capacity_count'] = sum(
                1 for w in active_warehouses if w.is_over_capacity
            )
            overview['utilization_summary']['low_utilization_count'] = sum(
                1 for w in active_warehouses if w.current_utilization < 30
            )
        
        # Calculate performance summary
        perf_warehouses = warehouses.filter(
            avg_delivery_time__isnull=False,
            on_time_delivery_rate__isnull=False
        )
        if perf_warehouses.exists():
            avg_delivery = sum(float(w.avg_delivery_time) for w in perf_warehouses)
            avg_on_time = sum(float(w.on_time_delivery_rate) for w in perf_warehouses)
            overview['performance_summary']['avg_delivery_time'] = round(
                avg_delivery / perf_warehouses.count(), 2
            )
            overview['performance_summary']['avg_on_time_rate'] = round(
                avg_on_time / perf_warehouses.count(), 2
            )
        
        # Generate alerts
        for warehouse in warehouses:
            if warehouse.monitoring_status == 'alert':
                overview['alerts'].append({
                    'warehouse_id': warehouse.id,
                    'warehouse_name': warehouse.name,
                    'type': 'status_alert',
                    'message': f'Warehouse {warehouse.name} has alert status'
                })
            
            if warehouse.is_over_capacity:
                overview['alerts'].append({
                    'warehouse_id': warehouse.id,
                    'warehouse_name': warehouse.name,
                    'type': 'capacity_alert',
                    'message': f'Warehouse {warehouse.name} is over capacity ({warehouse.current_utilization}%)'
                })
            
            if warehouse.needs_monitoring_update:
                overview['alerts'].append({
                    'warehouse_id': warehouse.id,
                    'warehouse_name': warehouse.name,
                    'type': 'monitoring_alert',
                    'message': f'Warehouse {warehouse.name} needs monitoring update'
                })
        
        return Response(overview)
    
    @action(detail=True, methods=['get'])
    def capacity_status(self, request, pk=None):
        """Get detailed capacity status for a warehouse"""
        warehouse = self.get_object()
        capacity_status = warehouse.get_capacity_status()
        
        # Add inventory breakdown
        inventory_items = warehouse.inventory_items.select_related('material').all()
        inventory_data = WarehouseInventorySerializer(inventory_items, many=True).data
        
        # Add active alerts
        active_alerts = warehouse.capacity_alerts.filter(status='active')
        alerts_data = WarehouseCapacityAlertSerializer(active_alerts, many=True).data
        
        return Response({
            'warehouse_id': warehouse.id,
            'warehouse_name': warehouse.name,
            'capacity_status': capacity_status,
            'inventory_items': inventory_data,
            'active_alerts': alerts_data
        })
    
    @action(detail=True, methods=['post'])
    def update_capacity(self, request, pk=None):
        """Update warehouse capacity utilization"""
        warehouse = self.get_object()
        utilization = warehouse.update_capacity_utilization()
        
        return Response({
            'warehouse_id': warehouse.id,
            'warehouse_name': warehouse.name,
            'current_utilization': utilization,
            'capacity_status': warehouse.get_capacity_status()
        })
    
    @action(detail=True, methods=['get'])
    def incoming_orders(self, request, pk=None):
        """Get incoming orders for this warehouse"""
        warehouse = self.get_object()
        incoming_orders = warehouse.incoming_orders.filter(
            status__in=['pending', 'confirmed', 'in_progress', 'shipped']
        ).select_related('supplier').prefetch_related('items')
        
        orders_data = OrderSerializer(incoming_orders, many=True).data
        
        # Calculate total incoming volume
        total_incoming_volume = sum(
            float(order.total_volume_m3 or 0) for order in incoming_orders
        )
        
        return Response({
            'warehouse_id': warehouse.id,
            'warehouse_name': warehouse.name,
            'incoming_orders': orders_data,
            'total_incoming_volume_m3': total_incoming_volume,
            'will_exceed_capacity': (
                warehouse.get_available_capacity_m3() < total_incoming_volume
                if warehouse.storage_capacity else False
            )
        })

class SupplierViewSet(viewsets.ModelViewSet):
    """Enhanced Suppliers API with location services and analytics"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [AllowInternalServiceOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transportation_mode', 'environmental_certification', 'country', 'state_province', 'is_active']
    search_fields = ['name', 'contact_person', 'email', 'city']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SupplierCreateSerializer
        return SupplierSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """Advanced supplier search with location and material filters"""
        serializer = SupplierSearchSerializer(data=request.data)
        if serializer.is_valid():
            queryset = self.get_queryset()
            
            # Text search
            if serializer.validated_data.get('query'):
                query = serializer.validated_data['query']
                queryset = queryset.filter(
                    Q(name__icontains=query) |
                    Q(contact_person__icontains=query) |
                    Q(email__icontains=query) |
                    Q(city__icontains=query)
                )
            
            # Material filter
            if serializer.validated_data.get('material_ids'):
                queryset = queryset.filter(
                    suppliermaterial__material__id__in=serializer.validated_data['material_ids'],
                    suppliermaterial__is_active=True
                ).distinct()
            
            # Capacity filter
            if serializer.validated_data.get('min_capacity'):
                queryset = queryset.filter(
                    current_capacity__gte=serializer.validated_data['min_capacity']
                )
            
            # Transportation mode filter
            if serializer.validated_data.get('transportation_mode'):
                queryset = queryset.filter(
                    transportation_mode=serializer.validated_data['transportation_mode']
                )
            
            # Environmental certification filter
            if serializer.validated_data.get('environmental_certification'):
                queryset = queryset.filter(
                    environmental_certification=serializer.validated_data['environmental_certification']
                )
            
            # Location-based filtering
            if serializer.validated_data.get('warehouse_id') and serializer.validated_data.get('max_distance_km'):
                try:
                    warehouse = Warehouse.objects.get(id=serializer.validated_data['warehouse_id'])
                    if warehouse.has_valid_coordinates:
                        # Get suppliers within distance using bounding box approximation
                        max_distance = serializer.validated_data['max_distance_km']
                        lat_delta = Decimal(max_distance) / Decimal('111')
                        lon_delta = lat_delta / Decimal(str(abs(float(warehouse.latitude) * 0.017453)))
                        
                        min_lat = warehouse.latitude - lat_delta
                        max_lat = warehouse.latitude + lat_delta
                        min_lon = warehouse.longitude - lon_delta
                        max_lon = warehouse.longitude + lon_delta
                        
                        queryset = queryset.filter(
                            latitude__isnull=False,
                            longitude__isnull=False,
                            latitude__gte=min_lat,
                            latitude__lte=max_lat,
                            longitude__gte=min_lon,
                            longitude__lte=max_lon
                        )
                except Warehouse.DoesNotExist:
                    pass
            
            serializer = SupplierSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def geocode(self, request, pk=None):
        """Geocode supplier address using OpenStreetMap"""
        supplier = self.get_object()
        
        if supplier.geocode_address():
            supplier.save()
            serializer = self.get_serializer(supplier)
            return Response({
                'success': True,
                'message': 'Address geocoded successfully',
                'supplier': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to geocode address. Please check the address format.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def nearby_warehouses(self, request, pk=None):
        """Get warehouses near this supplier"""
        supplier = self.get_object()
        
        if not supplier.has_valid_coordinates:
            return Response({
                'error': 'Supplier location not available. Please geocode the address first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        warehouses = Warehouse.objects.filter(
            is_active=True,
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        warehouse_distances = []
        for warehouse in warehouses:
            distance = supplier.get_distance_to_supplier(warehouse) if hasattr(supplier, 'get_distance_to_supplier') else None
            if distance:
                warehouse_distances.append({
                    'warehouse': WarehouseSerializer(warehouse, context={'request': request}).data,
                    'distance_km': round(distance, 2)
                })
        
        # Sort by distance
        warehouse_distances.sort(key=lambda x: x['distance_km'])
        
        return Response({
            'supplier_id': supplier.id,
            'supplier_name': supplier.name,
            'warehouses': warehouse_distances
        })
    
    @action(detail=True, methods=['get'])
    def materials(self, request, pk=None):
        """Get all materials supplied by this supplier with pricing"""
        supplier = self.get_object()
        supplier_materials = supplier.suppliermaterial_set.filter(is_active=True)
        serializer = SupplierMaterialSerializer(supplier_materials, many=True, context={'request': request})
        return Response(serializer.data)

class SupplierMaterialViewSet(viewsets.ModelViewSet):
    """Supplier Materials API - Manage material pricing and relationships"""
    queryset = SupplierMaterial.objects.all()
    serializer_class = SupplierMaterialSerializer
    permission_classes = [AllowInternalServiceOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier', 'material', 'is_active', 'tax_included']
    ordering_fields = ['base_cost_per_unit', 'lead_time', 'created_at']

    def get_queryset(self):
        return super().get_queryset().select_related(
            'supplier', 'material', 'currency', 'tax_region'
        ).prefetch_related('volume_pricing_tiers', 'seasonal_pricing')
    
    def get_serializer_class(self):
        """Use different serializer for creation"""
        if self.action == 'create':
            return SupplierMaterialCreateSerializer
        return SupplierMaterialSerializer
    
    @action(detail=True, methods=['get'])
    def volume_pricing(self, request, pk=None):
        """Get volume pricing tiers for this supplier material"""
        supplier_material = self.get_object()
        tiers = supplier_material.volume_pricing_tiers.filter(is_active=True).order_by('min_quantity')
        serializer = VolumePricingTierSerializer(tiers, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_volume_pricing(self, request, pk=None):
        """Add volume pricing tier"""
        supplier_material = self.get_object()
        request.data['supplier_material'] = supplier_material.id
        
        serializer = VolumePricingTierSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def seasonal_pricing(self, request, pk=None):
        """Get seasonal pricing for this supplier material"""
        supplier_material = self.get_object()
        seasonal_prices = supplier_material.seasonal_pricing.filter(is_active=True).order_by('-start_date')
        serializer = SeasonalPricingSerializer(seasonal_prices, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_seasonal_pricing(self, request, pk=None):
        """Add seasonal pricing"""
        supplier_material = self.get_object()
        request.data['supplier_material'] = supplier_material.id
        
        serializer = SeasonalPricingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def calculate_price(self, request, pk=None):
        """Calculate price for a specific quantity with all applicable discounts and taxes"""
        supplier_material = self.get_object()
        quantity = Decimal(request.data.get('quantity', 1))
        
        # Get volume price
        volume_price = supplier_material.get_volume_price(quantity)
        
        # Get seasonal price
        seasonal_price = supplier_material.get_seasonal_price()
        
        # Use the lower of volume or seasonal price
        unit_price = min(volume_price, seasonal_price)
        
        # Calculate subtotal
        subtotal = unit_price * quantity
        
        # Calculate tax if tax region is specified
        total_with_tax = subtotal
        tax_breakdown = {}
        
        if supplier_material.tax_region:
            tax_data = supplier_material.tax_region.calculate_tax_breakdown(subtotal)
            total_with_tax = tax_data['total_amount']
            tax_breakdown = tax_data
        
        return Response({
            'quantity': float(quantity),
            'unit_price': float(unit_price),
            'subtotal': float(subtotal),
            'total_with_tax': float(total_with_tax),
            'currency': supplier_material.currency.code if supplier_material.currency else 'CAD',
            'tax_breakdown': tax_breakdown,
            'lead_time_days': supplier_material.lead_time,
            'minimum_order_quantity': float(supplier_material.minimum_order_quantity),
            'maximum_order_quantity': float(supplier_material.maximum_order_quantity) if supplier_material.maximum_order_quantity else None
        })

class VolumePricingTierViewSet(viewsets.ModelViewSet):
    """Volume Pricing Tiers API"""
    queryset = VolumePricingTier.objects.all()
    serializer_class = VolumePricingTierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier_material', 'is_active']
    ordering_fields = ['min_quantity', 'price_per_unit']
    ordering = ['supplier_material', 'min_quantity']

class SeasonalPricingViewSet(viewsets.ModelViewSet):
    """Seasonal Pricing API"""
    queryset = SeasonalPricing.objects.all()
    serializer_class = SeasonalPricingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier_material', 'is_active']
    ordering_fields = ['start_date', 'end_date']
    ordering = ['supplier_material', '-start_date']

    @action(detail=False, methods=['get'])
    def current_pricing(self, request):
        """Get currently active seasonal pricing"""
        today = date.today()
        current_pricing = self.get_queryset().filter(
            start_date__lte=today,
            end_date__gte=today,
            is_active=True
        )
        serializer = self.get_serializer(current_pricing, many=True)
        return Response(serializer.data)

class SupplierAssessmentViewSet(viewsets.ModelViewSet):
    """Supplier Assessments API"""
    queryset = SupplierAssessment.objects.all()
    serializer_class = SupplierAssessmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status']
    ordering_fields = ['assessment_date', 'score']
    ordering = ['-assessment_date']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        return super().get_queryset().select_related('supplier', 'created_by')

class OrderViewSet(viewsets.ModelViewSet):
    """Orders API"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status']
    ordering_fields = ['order_date', 'expected_delivery_date', 'total_amount']
    ordering = ['-order_date']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_queryset(self):
        return super().get_queryset().select_related(
            'supplier', 'destination_warehouse', 'created_by'
        ).prefetch_related('items', 'items__material')
    
    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """Mark order as delivered and update warehouse inventory"""
        order = self.get_object()
        
        if order.status == 'delivered':
            return Response({'message': 'Order already marked as delivered'})
        
        # Update order status
        order.status = 'delivered'
        order.actual_delivery_date = timezone.now().date()
        order.save()
        
        # Process delivery and update inventory
        from .services import OrderService
        order_service = OrderService()
        success = order_service.process_order_delivery(order.order_id)
        
        if success:
            return Response({'message': 'Order marked as delivered and inventory updated'})
        else:
            return Response(
                {'error': 'Order marked as delivered but inventory update failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WarehouseInventoryViewSet(viewsets.ModelViewSet):
    """Warehouse Inventory API"""
    queryset = WarehouseInventory.objects.all()
    serializer_class = WarehouseInventorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['warehouse', 'material', 'stock_status']
    ordering_fields = ['current_quantity', 'available_quantity', 'last_restocked_date']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return super().get_queryset().select_related('warehouse', 'material', 'last_restocked_order')
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get all low stock items"""
        from django.db import models as db_models
        low_stock_items = self.get_queryset().filter(
            current_quantity__lte=db_models.F('minimum_stock_level'),
            minimum_stock_level__isnull=False
        )
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_warehouse(self, request):
        """Get inventory grouped by warehouse"""
        warehouse_id = request.query_params.get('warehouse_id')
        if not warehouse_id:
            return Response({'error': 'warehouse_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        inventory = self.get_queryset().filter(warehouse_id=warehouse_id)
        serializer = self.get_serializer(inventory, many=True)
        return Response(serializer.data)

class WarehouseCapacityAlertViewSet(viewsets.ModelViewSet):
    """Warehouse Capacity Alerts API"""
    queryset = WarehouseCapacityAlert.objects.all()
    serializer_class = WarehouseCapacityAlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['warehouse', 'alert_type', 'status']
    ordering_fields = ['created_at', 'current_utilization']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return super().get_queryset().select_related('warehouse', 'material', 'acknowledged_by')
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        
        from .services import WarehouseCapacityService
        capacity_service = WarehouseCapacityService()
        success = capacity_service.acknowledge_alert(alert.id, request.user)
        
        if success:
            alert.refresh_from_db()
            serializer = self.get_serializer(alert)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Failed to acknowledge alert'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active alerts"""
        active_alerts = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(active_alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_warehouse(self, request):
        """Get alerts for a specific warehouse"""
        warehouse_id = request.query_params.get('warehouse_id')
        if not warehouse_id:
            return Response({'error': 'warehouse_id parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        alerts = self.get_queryset().filter(warehouse_id=warehouse_id)
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)

class TransportationEmissionViewSet(viewsets.ModelViewSet):
    """Transportation Emissions API"""
    queryset = TransportationEmission.objects.all()
    serializer_class = TransportationEmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier', 'transport_mode', 'vehicle_type', 'fuel_type']
    ordering_fields = ['created_at', 'total_emissions', 'transport_efficiency_score']
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().select_related('supplier')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Calculate emissions using TransportationService if available
            if SERVICES_AVAILABLE:
                try:
                    transport_service = TransportationService()
                    emission_data = transport_service.calculate_emissions(**serializer.validated_data)
        
                    # Update validated data with calculations
                    serializer.validated_data.update({
                        'total_emissions': emission_data.get('total_emissions', 0),
                        'emissions_per_km': emission_data.get('emissions_per_km', 0),
                        'emissions_per_volume': emission_data.get('emissions_per_volume', 0),
                        'transport_efficiency_score': emission_data.get('efficiency_score', 0)
                    })
                except Exception as e:
                    logger.warning(f"Transportation service calculation failed: {e}")
        
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transportation emissions summary"""
        queryset = self.get_queryset()
        
        # Calculate summary statistics
        summary = queryset.aggregate(
            total_emissions=Sum('total_emissions'),
            average_efficiency=Avg('transport_efficiency_score'),
            total_distance=Sum('distance'),
            total_volume=Sum('volume')
        )
        
        # Emissions by transport mode
        emissions_by_mode = {}
        for mode_choice in TransportationEmission._meta.get_field('transport_mode').choices:
            mode = mode_choice[0]
            mode_emissions = queryset.filter(transport_mode=mode).aggregate(
                total=Sum('total_emissions')
            )['total'] or 0
            emissions_by_mode[mode] = float(mode_emissions)
        
        summary_data = {
            'total_emissions': float(summary['total_emissions'] or 0),
            'average_efficiency': float(summary['average_efficiency'] or 0),
            'total_distance': float(summary['total_distance'] or 0),
            'total_volume': float(summary['total_volume'] or 0),
            'emissions_by_mode': emissions_by_mode
        }
        
        serializer = TransportationEmissionSummarySerializer(data=summary_data)
        if serializer.is_valid():
            return Response(serializer.data)
        
        return Response(summary_data)

class EmissionFactorViewSet(viewsets.ModelViewSet):
    """Emission Factors API"""
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transport_mode', 'vehicle_type', 'fuel_type', 'is_active']
    ordering_fields = ['transport_mode', 'base_emission_factor']
    ordering = ['transport_mode', 'vehicle_type', 'fuel_type']
    
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

# Utility API Views
class TaxCalculationView(APIView):
    """Canadian Tax Calculation API with live tax rate integration"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Calculate Canadian taxes for given amount and region using live API"""
        serializer = TaxCalculationRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                tax_region = TaxRegion.objects.get(id=serializer.validated_data['tax_region_id'])
                amount = serializer.validated_data['amount']
                include_duties = serializer.validated_data.get('include_duties', False)
                
                # Try to use ExternalTaxService with Canadian Tax API first
                breakdown = self._calculate_tax_with_api(tax_region, amount, include_duties)
                
                # If API calculation fails, fallback to static rates
                if not breakdown:
                    logger.warning(f"Canadian Tax API failed, using static rates for region {tax_region.name}")
                    breakdown = tax_region.calculate_tax_breakdown(amount)
                    breakdown['api_source'] = 'Static Database Rates (API Fallback)'
                
                breakdown['tax_region'] = tax_region.name
                
                response_serializer = TaxCalculationResponseSerializer(data=breakdown)
                if response_serializer.is_valid():
                    return Response(response_serializer.data)
                else:
                    return Response(response_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            except TaxRegion.DoesNotExist:
                return Response({'error': 'Tax region not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Tax calculation error: {e}")
                return Response({'error': 'Tax calculation service temporarily unavailable'}, 
                              status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _calculate_tax_with_api(self, tax_region, amount, include_duties=False):
        """Calculate tax using Canadian Tax API via ExternalTaxService"""
        try:
            # Get active Canadian Tax API service
            canadian_tax_service = ExternalTaxService.objects.filter(
                name='canadian_tax_api',
                is_active=True,
                supported_countries__in=['CA', 'GLOBAL']
            ).first()
            
            if canadian_tax_service and tax_region.country == 'CA' and tax_region.province_state:
                # Use Canadian Tax API
                breakdown = canadian_tax_service.calculate_tax(
                    amount=amount,
                    tax_region=tax_region,
                    include_duties=include_duties
                )
                
                # Ensure the breakdown has the expected format
                if breakdown and 'total_with_tax' in breakdown:
                    # Add required fields for response serializer compatibility
                    if 'duty_amount' not in breakdown:
                        breakdown['duty_amount'] = Decimal('0.00')
                    
                    return breakdown
            
            return None
            
        except Exception as e:
            logger.error(f"Canadian Tax API calculation failed: {e}")
            return None

class GeocodeView(APIView):
    """Address Geocoding API using OpenStreetMap"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Geocode an address to get coordinates"""
        serializer = GeocodeRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                from .openstreetmap_api import OpenStreetMapClient
                
                address = serializer.validated_data['address']
                country_code = serializer.validated_data.get('country_code', 'CA')
                
                osm_client = OpenStreetMapClient()
                result = osm_client.geocode_address(address, country_code)
                
                if result:
                    response_data = {
                        'formatted_address': result['formatted_address'],
                        'latitude': result['latitude'],
                        'longitude': result['longitude'],
                        'components': result['components'],
                        'confidence': result.get('importance', 0.5)
                    }
                    
                    response_serializer = GeocodeResponseSerializer(data=response_data)
                    if response_serializer.is_valid():
                        return Response(response_serializer.data)
                    else:
                        return Response(response_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # Provide more specific error message and suggestions
                    error_response = {
                        'error': 'Address not found or geocoding failed',
                        'message': f'Unable to find specific location for: {address}',
                        'suggestions': [
                            'Verify the street address spelling',
                            'Check if the street number is correct',
                            'Ensure the city name is accurate',
                            'Try removing unit/suite numbers',
                            'Use the most common address format',
                            'Check if this is a new development or construction'
                        ],
                        'address_tried': address,
                        'country_code': country_code
                    }
                    
                    # Try to provide specific suggestions based on the address
                    if 'unit' in address.lower() or 'suite' in address.lower():
                        error_response['suggestions'].insert(0, 'Try removing the unit/suite number - it may not be in the mapping database')
                    
                    if country_code == 'CA':
                        error_response['suggestions'].append('For Canadian addresses, ensure the postal code format is correct (e.g., K1A 0A6)')
                    
                    return Response(error_response, status=status.HTTP_404_NOT_FOUND)
                    
            except Exception as e:
                logger.error(f"Geocoding error: {e}")
                return Response({
                    'error': 'Geocoding service temporarily unavailable',
                    'message': 'The address verification service is currently experiencing issues. Please try again later.',
                    'technical_details': str(e) if settings.DEBUG else None
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EconomicAnalysisViewSet(viewsets.ViewSet):
    """Economic Analysis API endpoints"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def costs(self, request):
        """Get material cost analysis"""
        try:
            # Calculate total material costs
            total_cost = SupplierMaterial.objects.filter(is_active=True).aggregate(
                total=Sum(F('base_cost_per_unit') * F('minimum_order_quantity'))
            )['total'] or 0

            # Calculate average cost per unit
            avg_cost = SupplierMaterial.objects.filter(is_active=True).aggregate(
                avg=Avg('base_cost_per_unit')
            )['avg'] or 0

            # Get cost trends (last 12 months)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=365)
            
            cost_trends = Order.objects.filter(
                created_at__range=(start_date, end_date)
            ).annotate(
                period=TruncMonth('created_at')
            ).values('period').annotate(
                cost=Sum(F('quantity') * F('unit_price'))
            ).order_by('period')

            # Get top expensive materials
            top_materials = SupplierMaterial.objects.filter(
                is_active=True
            ).select_related('material').order_by('-base_cost_per_unit')[:10]

            # Generate cost optimization recommendations
            recommendations = self._generate_cost_recommendations()

            return Response({
                'totalMaterialCost': float(total_cost),
                'averageCostPerUnit': float(avg_cost),
                'costTrends': [
                    {
                        'period': item['period'].strftime('%Y-%m'),
                        'cost': float(item['cost'] or 0)
                    } for item in cost_trends
                ],
                'topExpensiveMaterials': [
                    {
                        'name': item.material.name,
                        'cost': float(item.base_cost_per_unit),
                        'unit': item.material.unit_of_measure
                    } for item in top_materials
                ],
                'recommendations': recommendations
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def transport(self, request):
        """Get transportation cost analysis"""
        try:
            # Calculate total transport costs
            transport_costs = Order.objects.filter(
                status='delivered'
            ).aggregate(
                total=Sum('transportation_cost')
            )

            # Calculate costs by transport mode
            mode_costs = Order.objects.filter(
                status='delivered'
            ).values('transportation_mode').annotate(
                cost=Sum('transportation_cost')
            ).order_by('-cost')

            total_cost = float(transport_costs['total'] or 0)
            
            # Calculate emissions by transport mode
            emissions = TransportationEmission.objects.values(
                'transportation_mode'
            ).annotate(
                total_emissions=Sum('co2_emissions')
            ).order_by('-total_emissions')

            return Response({
                'totalTransportCost': total_cost,
                'costByMode': [
                    {
                        'mode': item['transportation_mode'],
                        'cost': float(item['cost'] or 0),
                        'percentage': (float(item['cost'] or 0) / total_cost * 100) if total_cost > 0 else 0
                    } for item in mode_costs
                ],
                'emissionsData': [
                    {
                        'mode': item['transportation_mode'],
                        'emissions': float(item['total_emissions'] or 0)
                    } for item in emissions
                ]
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def storage(self, request):
        """Get storage cost analysis"""
        try:
            warehouses = Warehouse.objects.all()
            
            total_storage_cost = sum(w.monthly_storage_cost for w in warehouses)
            total_capacity = sum(w.total_capacity for w in warehouses if w.total_capacity)
            total_utilized = sum(w.current_utilization for w in warehouses if w.current_utilization)
            
            utilization_rate = total_utilized / total_capacity if total_capacity > 0 else 0

            return Response({
                'totalStorageCost': float(total_storage_cost),
                'utilizationRate': float(utilization_rate),
                'warehouseCosts': [
                    {
                        'warehouse': w.name,
                        'cost': float(w.monthly_storage_cost),
                        'utilization': float(w.current_utilization / w.total_capacity if w.total_capacity else 0)
                    } for w in warehouses
                ]
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def _generate_cost_recommendations(self):
        """Generate cost optimization recommendations"""
        recommendations = []

        # Check for high-cost materials
        expensive_materials = SupplierMaterial.objects.filter(
            is_active=True,
            base_cost_per_unit__gt=1000  # Adjust threshold as needed
        ).count()
        if expensive_materials > 0:
            recommendations.append({
                'type': 'High-Cost Materials',
                'description': f'Found {expensive_materials} materials with high base costs. Consider negotiating bulk discounts or finding alternative suppliers.',
                'potentialSavings': expensive_materials * 100,  # Estimated savings
                'priority': 'high'
            })

        # Check for underutilized warehouses
        underutilized = Warehouse.objects.filter(
            current_utilization__lt=F('total_capacity') * 0.5
        ).count()
        if underutilized > 0:
            recommendations.append({
                'type': 'Warehouse Utilization',
                'description': f'{underutilized} warehouses are under 50% capacity. Consider consolidating storage to reduce costs.',
                'potentialSavings': underutilized * 1000,  # Estimated savings
                'priority': 'medium'
            })

        # Check for transportation optimization
        transport_modes = Order.objects.values('transportation_mode').annotate(
            count=Count('id'),
            avg_cost=Avg('transportation_cost')
        ).order_by('-avg_cost')

        if transport_modes:
            highest_cost_mode = transport_modes[0]
            recommendations.append({
                'type': 'Transport Optimization',
                'description': f'{highest_cost_mode["transportation_mode"]} has the highest average cost. Consider alternative modes or routes.',
                'potentialSavings': float(highest_cost_mode['avg_cost'] * highest_cost_mode['count'] * 0.2),  # 20% potential savings
                'priority': 'medium'
            })

        return recommendations
