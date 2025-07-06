from rest_framework import serializers
from decimal import Decimal
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

class MaterialCategorySerializer(serializers.ModelSerializer):
    material_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MaterialCategory
        fields = ['id', 'name', 'description', 'is_active', 'material_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_material_count(self, obj):
        return obj.materials.filter(is_active=True).count()

class MaterialSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = ['id', 'name', 'description', 'unit', 'category', 'category_name', 
                 'sku', 'is_organic', 'is_active', 'supplier_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_supplier_count(self, obj):
        return obj.suppliers.filter(is_active=True).count()

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol', 'is_active']

class TaxRegionSerializer(serializers.ModelSerializer):
    tax_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxRegion
        fields = ['id', 'name', 'country', 'province_state', 'gst_rate', 'pst_rate', 
                 'hst_rate', 'total_tax_rate', 'tax_type', 'is_cross_border', 'duty_rate',
                 'is_active', 'effective_date', 'notes', 'tax_breakdown', 'created_at', 'updated_at']
        read_only_fields = ['total_tax_rate', 'created_at', 'updated_at']
    
    def get_tax_breakdown(self, obj):
        """Get detailed tax breakdown for a sample amount"""
        return obj.calculate_tax_breakdown(Decimal('100.00'))

class VolumePricingTierSerializer(serializers.ModelSerializer):
    discount_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = VolumePricingTier
        fields = ['id', 'min_quantity', 'max_quantity', 'price_per_unit', 
                 'discount_percentage', 'discount_amount', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['discount_amount', 'created_at', 'updated_at']
    
    def get_discount_amount(self, obj):
        """Calculate discount amount from base price"""
        if obj.discount_percentage and obj.supplier_material:
            base_price = obj.supplier_material.base_cost_per_unit
            return float(base_price * (obj.discount_percentage / 100))
        return 0.0

class SeasonalPricingSerializer(serializers.ModelSerializer):
    is_current = serializers.SerializerMethodField()
    adjusted_price = serializers.SerializerMethodField()
    
    class Meta:
        model = SeasonalPricing
        fields = ['id', 'season_name', 'start_date', 'end_date', 'price_per_unit',
                 'price_adjustment_percentage', 'adjusted_price', 'reason', 'is_current',
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['is_current', 'adjusted_price', 'created_at', 'updated_at']
    
    def get_is_current(self, obj):
        """Check if seasonal pricing is currently active"""
        from datetime import date
        today = date.today()
        return obj.start_date <= today <= obj.end_date
    
    def get_adjusted_price(self, obj):
        """Get the adjusted price based on base price and adjustment percentage"""
        if obj.price_adjustment_percentage and obj.supplier_material:
            base_price = obj.supplier_material.base_cost_per_unit
            adjustment = base_price * (obj.price_adjustment_percentage / 100)
            return float(base_price + adjustment)
        return float(obj.price_per_unit) if obj.price_per_unit else 0.0

class SupplierMaterialSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_unit = serializers.CharField(source='material.unit', read_only=True)
    material_sku = serializers.CharField(source='material.sku', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    currency_symbol = serializers.CharField(source='currency.symbol', read_only=True)
    tax_region_name = serializers.CharField(source='tax_region.name', read_only=True)
    volume_pricing_tiers = VolumePricingTierSerializer(many=True, read_only=True)
    seasonal_pricing = SeasonalPricingSerializer(many=True, read_only=True)
    
    # Calculated fields
    current_price = serializers.SerializerMethodField()
    price_with_tax = serializers.SerializerMethodField()
    available_discounts = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplierMaterial
        fields = ['id', 'material', 'material_name', 'material_unit', 'material_sku',
                 'base_cost_per_unit', 'currency', 'currency_code', 'currency_symbol',
                 'tax_region', 'tax_region_name', 'tax_included', 'lead_time',
                 'minimum_order_quantity', 'maximum_order_quantity', 'current_price',
                 'price_with_tax', 'available_discounts', 'volume_pricing_tiers',
                 'seasonal_pricing', 'is_active', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['current_price', 'price_with_tax', 'available_discounts', 
                           'created_at', 'updated_at']
    
    def get_current_price(self, obj):
        """Get current effective price including seasonal adjustments"""
        return float(obj.get_seasonal_price())
    
    def get_price_with_tax(self, obj):
        """Get price including applicable taxes"""
        return float(obj.get_price_with_tax())
    
    def get_available_discounts(self, obj):
        """Get available volume discounts"""
        active_tiers = obj.volume_pricing_tiers.filter(is_active=True).order_by('min_quantity')
        return [{
            'min_qty': float(tier.min_quantity),
            'max_qty': float(tier.max_quantity) if tier.max_quantity else None,
            'price': float(tier.price_per_unit),
            'discount_pct': float(tier.discount_percentage) if tier.discount_percentage else None
        } for tier in active_tiers]

class SupplierMaterialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating supplier material relationships"""
    
    class Meta:
        model = SupplierMaterial
        fields = ['supplier', 'material', 'base_cost_per_unit', 'currency', 'tax_region',
                 'tax_included', 'lead_time', 'minimum_order_quantity', 'maximum_order_quantity',
                 'is_active', 'notes']
    
    def validate(self, data):
        """Custom validation for supplier material creation"""
        # Ensure supplier exists and is active
        if not data.get('supplier'):
            raise serializers.ValidationError("Supplier is required")
        
        if not data['supplier'].is_active:
            raise serializers.ValidationError("Supplier must be active")
        
        # Ensure material exists and is active
        if not data.get('material'):
            raise serializers.ValidationError("Material is required")
        
        if not data['material'].is_active:
            raise serializers.ValidationError("Material must be active")
        
        # Ensure currency exists and is active
        if not data.get('currency'):
            raise serializers.ValidationError("Currency is required")
        
        if not data['currency'].is_active:
            raise serializers.ValidationError("Currency must be active")
        
        # Check for duplicate supplier-material combination
        if SupplierMaterial.objects.filter(
            supplier=data['supplier'], 
            material=data['material']
        ).exists():
            raise serializers.ValidationError(
                f"Supplier '{data['supplier'].name}' is already assigned to material '{data['material'].name}'"
            )
        
        return data

class WarehouseSerializer(serializers.ModelSerializer):
    # Address and location fields
    full_address = serializers.CharField(read_only=True)
    coordinates = serializers.SerializerMethodField()
    has_valid_coordinates = serializers.BooleanField(read_only=True)
    map_url = serializers.SerializerMethodField()
    
    # Calculated fields
    nearby_suppliers = serializers.SerializerMethodField()
    utilization_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'warehouse_type', 'description',
                 'street_number', 'street_name', 'unit_suite', 'city', 'state_province',
                 'postal_code', 'country', 'country_code', 'full_address',
                 'latitude', 'longitude', 'coordinates', 'has_valid_coordinates',
                 'address_formatted', 'address_validated', 'geocoding_source', 'geocoded_at',
                 'storage_capacity', 'current_utilization', 'utilization_status',
                 'manager_name', 'manager_email', 'manager_phone', 'map_url',
                 'is_active', 'is_primary', 'nearby_suppliers', 'created_at', 'updated_at']
        read_only_fields = ['full_address', 'coordinates', 'has_valid_coordinates', 
                           'address_formatted', 'address_validated', 'geocoding_source', 
                           'geocoded_at', 'map_url', 'utilization_status', 'nearby_suppliers',
                           'created_at', 'updated_at']
    
    def get_coordinates(self, obj):
        """Get coordinates as [lat, lng] array for mapping"""
        return list(obj.coordinates) if obj.coordinates else None
    
    def get_map_url(self, obj):
        """Get OpenStreetMap URL for this warehouse"""
        return obj.get_map_url()
    
    def get_nearby_suppliers(self, obj):
        """Get count of nearby suppliers within 100km"""
        return obj.get_nearby_suppliers(radius_km=100).count()
    
    def get_utilization_status(self, obj):
        """Get utilization status description"""
        if not obj.current_utilization:
            return 'Unknown'
        
        utilization = float(obj.current_utilization)
        if utilization < 50:
            return 'Low'
        elif utilization < 80:
            return 'Medium'
        elif utilization < 95:
            return 'High'
        else:
            return 'Critical'

class OrderItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_unit = serializers.CharField(source='material.unit', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'material', 'material_name', 'material_unit',
                 'quantity', 'unit_price', 'total_price', 'notes',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = Order
        fields = ['order_id', 'supplier', 'supplier_name', 'order_date',
                 'expected_delivery_date', 'actual_delivery_date', 'status',
                 'total_amount', 'notes', 'items', 'created_by', 'created_by_name',
                 'created_at', 'updated_at']
        read_only_fields = ['order_id', 'created_at', 'updated_at', 'created_by', 'total_amount']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['supplier', 'expected_delivery_date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order

class SupplierAssessmentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SupplierAssessment
        fields = ['id', 'title', 'description', 'status', 'assessment_date',
                 'next_assessment_date', 'score', 'notes', 'created_at',
                 'updated_at', 'created_by', 'created_by_name']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class SupplierSerializer(serializers.ModelSerializer):
    # Enhanced address and location fields
    full_address = serializers.CharField(read_only=True)
    coordinates = serializers.SerializerMethodField()
    has_valid_coordinates = serializers.BooleanField(read_only=True)
    map_url = serializers.SerializerMethodField()
    
    # Transportation fields
    transportation_modes_display = serializers.SerializerMethodField()
    all_transportation_modes = serializers.SerializerMethodField()
    
    # Related data
    materials = SupplierMaterialSerializer(source='suppliermaterial_set', many=True, read_only=True)
    assessments = SupplierAssessmentSerializer(many=True, read_only=True)
    orders = OrderSerializer(many=True, read_only=True)
    
    # Calculated fields
    total_orders = serializers.IntegerField(read_only=True)
    material_count = serializers.SerializerMethodField()
    average_lead_time = serializers.SerializerMethodField()
    distance_to_warehouses = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone',
                 # Enhanced address fields
                 'street_number', 'street_name', 'unit_suite', 'city', 'state_province',
                 'postal_code', 'country', 'country_code', 'full_address',
                 # Geolocation fields
                 'latitude', 'longitude', 'coordinates', 'has_valid_coordinates',
                 'address_formatted', 'address_validated', 'geocoding_source', 'geocoded_at',
                 'map_url',
                 # Legacy address field
                 'address',
                 # Business fields
                 'materials', 'material_count', 'min_supply_capacity', 'max_supply_capacity',
                 'current_capacity', 'transportation_mode', 'transportation_modes', 
                 'transportation_modes_display', 'all_transportation_modes', 'transportation_details',
                 'environmental_certification', 'carbon_footprint', 'renewable_energy_usage',
                 'waste_management_policy', 'environmental_impact_report', 'sustainability_goals',
                 # Status field
                 'is_active',
                 # Calculated fields
                 'average_lead_time', 'distance_to_warehouses',
                 # Related data
                 'assessments', 'orders', 'total_orders', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['full_address', 'coordinates', 'has_valid_coordinates', 
                           'address_formatted', 'address_validated', 'geocoding_source', 
                           'geocoded_at', 'map_url', 'material_count', 'average_lead_time',
                           'distance_to_warehouses', 'transportation_modes_display', 
                           'all_transportation_modes', 'created_at', 'updated_at', 'created_by']
    
    def get_coordinates(self, obj):
        """Get coordinates as [lat, lng] array for mapping"""
        return list(obj.coordinates) if obj.coordinates else None
    
    def get_map_url(self, obj):
        """Get OpenStreetMap URL for this supplier"""
        return obj.get_map_url()
    
    def get_material_count(self, obj):
        """Get count of active materials supplied"""
        return obj.suppliermaterial_set.filter(is_active=True).count()
    
    def get_average_lead_time(self, obj):
        """Get average lead time across all materials"""
        materials = obj.suppliermaterial_set.filter(is_active=True)
        if materials.exists():
            total_lead_time = sum(sm.lead_time for sm in materials)
            return round(total_lead_time / materials.count(), 1)
        return 0
    
    def get_distance_to_warehouses(self, obj):
        """Get distances to all active warehouses"""
        if not obj.has_valid_coordinates:
            return []
        
        distances = []
        warehouses = Warehouse.objects.filter(is_active=True, latitude__isnull=False, longitude__isnull=False)
        
        for warehouse in warehouses:
            distance = obj.get_distance_to(warehouse) if hasattr(obj, 'get_distance_to') else None
            if distance:
                distances.append({
                    'warehouse_id': warehouse.id,
                    'warehouse_name': warehouse.name,
                    'distance_km': round(distance, 2)
                })
        
        return sorted(distances, key=lambda x: x['distance_km'])
    
    def get_transportation_modes_display(self, obj):
        """Get human-readable names for transportation modes"""
        if not obj.transportation_modes:
            # Fallback to single mode for backward compatibility
            return [dict(obj.TRANSPORTATION_CHOICES).get(obj.transportation_mode, obj.transportation_mode)]
        
        mode_dict = dict(obj.TRANSPORTATION_CHOICES)
        return [mode_dict.get(mode, mode) for mode in obj.transportation_modes if mode in mode_dict]
    
    def get_all_transportation_modes(self, obj):
        """Get all transportation modes (both single and multiple)"""
        modes = []
        
        # Add the primary mode if it's not already in transportation_modes
        if obj.transportation_mode and (not obj.transportation_modes or obj.transportation_mode not in obj.transportation_modes):
            modes.append(obj.transportation_mode)
        
        # Add all modes from transportation_modes
        if obj.transportation_modes:
            modes.extend([mode for mode in obj.transportation_modes if mode not in modes])
        
        return modes

class SupplierCreateSerializer(serializers.ModelSerializer):
    materials_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    auto_geocode = serializers.BooleanField(write_only=True, default=True)
    
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone',
                 'street_number', 'street_name', 'unit_suite', 'city', 'state_province',
                 'postal_code', 'country', 'country_code',
                 'min_supply_capacity', 'max_supply_capacity', 'current_capacity',
                 'transportation_mode', 'transportation_modes', 'transportation_details', 'materials_data',
                 'environmental_certification', 'carbon_footprint', 'renewable_energy_usage',
                 'waste_management_policy', 'environmental_impact_report', 'sustainability_goals',
                 'is_active', 'auto_geocode']
    
    def create(self, validated_data):
        materials_data = validated_data.pop('materials_data', [])
        auto_geocode = validated_data.pop('auto_geocode', True)
        
        # Handle transportation modes
        transportation_modes = validated_data.get('transportation_modes', [])
        transportation_mode = validated_data.get('transportation_mode', 'road')
        
        # Ensure primary mode is in transportation_modes list
        if transportation_modes and transportation_mode not in transportation_modes:
            transportation_modes.insert(0, transportation_mode)
        elif not transportation_modes:
            transportation_modes = [transportation_mode]
        
        validated_data['transportation_modes'] = transportation_modes
        
        supplier = Supplier.objects.create(**validated_data)
        
        # Auto-geocode address if requested
        if auto_geocode and supplier.full_address:
            try:
                supplier.geocode_address()
                supplier.save()
            except Exception as e:
                # Log error but don't fail creation
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to geocode supplier {supplier.name}: {e}")
        
        # Create supplier materials
        for material_data in materials_data:
            material = Material.objects.get(id=material_data['material_id'])
            SupplierMaterial.objects.create(
                supplier=supplier,
                material=material,
                base_cost_per_unit=material_data['base_cost_per_unit'],
                lead_time=material_data.get('lead_time', 0),
                minimum_order_quantity=material_data.get('minimum_order_quantity', 1),
                maximum_order_quantity=material_data.get('maximum_order_quantity'),
                currency_id=material_data.get('currency_id'),
                tax_region_id=material_data.get('tax_region_id'),
                tax_included=material_data.get('tax_included', False),
                notes=material_data.get('notes', '')
            )
        
        return supplier

class TransportationEmissionSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    recommendations = serializers.SerializerMethodField()

    class Meta:
        model = TransportationEmission
        fields = [
            'id',
            'supplier',
            'supplier_name',
            'distance',
            'volume',
            'transport_mode',
            'vehicle_type',
            'fuel_type',
            'load_factor',
            'return_trip',
            'total_emissions',
            'emissions_per_km',
            'emissions_per_volume',
            'transport_efficiency_score',
            'recommendations',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'total_emissions',
            'emissions_per_km',
            'emissions_per_volume',
            'transport_efficiency_score'
        ]

    def get_recommendations(self, obj):
        from .services import TransportationService
        service = TransportationService()
        return service._generate_recommendations(obj)

class EmissionFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionFactor
        fields = [
            'id',
            'transport_mode',
            'vehicle_type',
            'fuel_type',
            'base_emission_factor',
            'volume_factor',
            'load_factor_impact',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class TransportationEmissionSummarySerializer(serializers.Serializer):
    total_emissions = serializers.FloatField()
    average_efficiency = serializers.FloatField()
    total_distance = serializers.FloatField()
    total_volume = serializers.FloatField()
    emissions_by_mode = serializers.DictField(child=serializers.FloatField())

# Tax Calculation Serializers
class TaxCalculationRequestSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    tax_region_id = serializers.IntegerField()
    include_duties = serializers.BooleanField(default=False)
    
class TaxCalculationResponseSerializer(serializers.Serializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    gst_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    pst_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    hst_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    duty_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_tax = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_with_tax = serializers.DecimalField(max_digits=12, decimal_places=2)
    tax_type = serializers.CharField()
    tax_region = serializers.CharField()

# Geocoding Serializers
class GeocodeRequestSerializer(serializers.Serializer):
    address = serializers.CharField(max_length=500)
    country_code = serializers.CharField(max_length=2, default='CA')

class GeocodeResponseSerializer(serializers.Serializer):
    formatted_address = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    components = serializers.DictField()
    confidence = serializers.FloatField()

# Material Search and Filtering Serializers
class MaterialSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=200, required=False)
    category_id = serializers.IntegerField(required=False)
    is_organic = serializers.BooleanField(required=False)
    min_suppliers = serializers.IntegerField(required=False)
    unit = serializers.CharField(max_length=50, required=False)

class SupplierSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=200, required=False)
    material_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    max_distance_km = serializers.FloatField(required=False)
    warehouse_id = serializers.IntegerField(required=False)
    min_capacity = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    transportation_mode = serializers.CharField(max_length=20, required=False)
    environmental_certification = serializers.CharField(max_length=20, required=False) 