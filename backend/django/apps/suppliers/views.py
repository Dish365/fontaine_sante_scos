from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta, date
from decimal import Decimal
import asyncio
import logging

logger = logging.getLogger(__name__)

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
    """Warehouses API - Manage warehouse locations and capacity"""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warehouse_type', 'country', 'state_province', 'is_active', 'is_primary']
    search_fields = ['name', 'code', 'city', 'manager_name']
    ordering_fields = ['name', 'code', 'created_at', 'current_utilization']
    ordering = ['-is_primary', 'name']

    @action(detail=True, methods=['post'])
    def geocode(self, request, pk=None):
        """Geocode warehouse address"""
        warehouse = self.get_object()
        
        if warehouse.geocode_address():
            warehouse.save()
            serializer = self.get_serializer(warehouse)
            return Response({
                'success': True,
                'message': 'Address geocoded successfully',
                'warehouse': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to geocode address'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def nearby_suppliers(self, request, pk=None):
        """Get suppliers near this warehouse"""
        warehouse = self.get_object()
        radius = float(request.query_params.get('radius', 100))  # Default 100km
        
        suppliers = warehouse.get_nearby_suppliers(radius_km=radius)
        serializer = SupplierSerializer(suppliers, many=True, context={'request': request})
        
        return Response({
            'warehouse_id': warehouse.id,
            'warehouse_name': warehouse.name,
            'search_radius_km': radius,
            'supplier_count': suppliers.count(),
            'suppliers': serializer.data
        })

class SupplierViewSet(viewsets.ModelViewSet):
    """Enhanced Suppliers API with location services and analytics"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
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
        return super().get_queryset().select_related('supplier', 'created_by').prefetch_related('items')

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
        """Create transportation emission with automatic calculations"""
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
    """Canadian Tax Calculation API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Calculate Canadian taxes for given amount and region"""
        serializer = TaxCalculationRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                tax_region = TaxRegion.objects.get(id=serializer.validated_data['tax_region_id'])
                amount = serializer.validated_data['amount']
                include_duties = serializer.validated_data.get('include_duties', False)
                
                breakdown = tax_region.calculate_tax_breakdown(amount)
                breakdown['tax_region'] = tax_region.name
                
                response_serializer = TaxCalculationResponseSerializer(data=breakdown)
                if response_serializer.is_valid():
                    return Response(response_serializer.data)
                else:
                    return Response(response_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            except TaxRegion.DoesNotExist:
                return Response({'error': 'Tax region not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GeocodeView(APIView):
    """Address Geocoding API using OpenStreetMap"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Geocode an address to get coordinates"""
        serializer = GeocodeRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                from .openstreetmap_api import OpenStreetMapClient
                
                osm_client = OpenStreetMapClient()
                result = osm_client.geocode_address(
                    serializer.validated_data['address'],
                    serializer.validated_data.get('country_code', 'CA')
                )
                
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
                    return Response({
                        'error': 'Address not found or geocoding failed'
                    }, status=status.HTTP_404_NOT_FOUND)
                    
            except Exception as e:
                logger.error(f"Geocoding error: {e}")
                return Response({
                    'error': 'Geocoding service temporarily unavailable'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
