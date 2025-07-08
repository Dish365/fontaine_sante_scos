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
    static_map_url = serializers.SerializerMethodField()
    
    # Transportation and logistics fields
    supported_transport_modes_display = serializers.SerializerMethodField()
    primary_transport_mode_display = serializers.SerializerMethodField()
    transport_compatibility_score = serializers.SerializerMethodField()
    
    # Monitoring and performance fields
    utilization_status = serializers.CharField(read_only=True)
    is_over_capacity = serializers.BooleanField(read_only=True)
    needs_monitoring_update = serializers.BooleanField(read_only=True)
    performance_metrics = serializers.SerializerMethodField()
    
    # Supplier relationship fields
    preferred_suppliers = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Supplier.objects.filter(is_active=True),
        required=False
    )
    preferred_suppliers_detail = serializers.SerializerMethodField()
    nearby_suppliers_count = serializers.SerializerMethodField()
    compatible_suppliers_count = serializers.SerializerMethodField()
    
    # Capacity and operational fields
    capacity_utilization_percentage = serializers.SerializerMethodField()
    available_capacity = serializers.SerializerMethodField()
    operational_hours_display = serializers.SerializerMethodField()
    
    # Special capabilities display
    capabilities_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = [
            # Basic info
            'id', 'name', 'code', 'warehouse_type', 'description', 'priority',
            
            # Enhanced address fields
                 'street_number', 'street_name', 'unit_suite', 'city', 'state_province',
                 'postal_code', 'country', 'country_code', 'full_address',
            
            # Geolocation and monitoring
            'latitude', 'longitude', 'altitude', 'coordinates', 'has_valid_coordinates',
                 'address_formatted', 'address_validated', 'geocoding_source', 'geocoded_at',
            'geocoding_accuracy', 'map_url', 'static_map_url',
            
            # GPS and monitoring
            'gps_last_updated', 'monitoring_enabled', 'monitoring_interval', 
            'geofence_radius', 'monitoring_status', 'last_monitoring_check',
            'needs_monitoring_update', 'performance_metrics',
            
            # Transportation and logistics
            'supported_transport_modes', 'supported_transport_modes_display',
            'primary_transport_mode', 'primary_transport_mode_display',
            'transport_compatibility_score', 'loading_dock_count', 'max_vehicle_capacity',
            'operates_24_7', 'operating_hours', 'operational_hours_display',
            
            # Capacity and utilization
                 'storage_capacity', 'current_utilization', 'utilization_status',
            'max_capacity_threshold', 'is_over_capacity', 'capacity_utilization_percentage',
            'available_capacity',
            
            # Special capabilities
            'cold_storage_available', 'hazmat_certified', 'organic_certified',
            'cross_dock_capable', 'capabilities_summary',
            
            # Contact information
            'manager_name', 'manager_email', 'manager_phone',
            'emergency_contact', 'emergency_phone',
            
            # Supplier relationships
            'preferred_suppliers', 'preferred_suppliers_detail', 'max_supplier_distance',
            'nearby_suppliers_count', 'compatible_suppliers_count',
            
            # Performance metrics
            'avg_delivery_time', 'on_time_delivery_rate', 'last_performance_update',
            
            # Operational settings
            'is_active', 'is_primary', 'accepts_new_suppliers',
            
            # Metadata
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'full_address', 'coordinates', 'has_valid_coordinates', 
                           'address_formatted', 'address_validated', 'geocoding_source', 
            'geocoded_at', 'geocoding_accuracy', 'map_url', 'static_map_url',
            'gps_last_updated', 'utilization_status', 'is_over_capacity',
            'needs_monitoring_update', 'performance_metrics',
            'supported_transport_modes_display', 'primary_transport_mode_display',
            'transport_compatibility_score', 'capacity_utilization_percentage',
            'available_capacity', 'operational_hours_display', 'capabilities_summary',
            'preferred_suppliers_detail', 'nearby_suppliers_count', 'compatible_suppliers_count',
            'last_monitoring_check', 'last_performance_update',
            'created_at', 'updated_at', 'created_by'
        ]
    
    def get_coordinates(self, obj):
        """Get coordinates as [lat, lng] array for mapping"""
        return list(obj.coordinates) if obj.coordinates else None
    
    def get_map_url(self, obj):
        """Get OpenStreetMap URL for this warehouse"""
        return obj.get_map_url()
    
    def get_static_map_url(self, obj):
        """Get static map image URL for this warehouse"""
        return obj.get_static_map_url()
    
    def get_supported_transport_modes_display(self, obj):
        """Get human-readable names for supported transport modes"""
        if not obj.supported_transport_modes:
            return [obj.get_primary_transport_mode_display()]
        
        mode_choices = dict([
            ('road', 'Road Transport'),
            ('rail', 'Rail Transport'),
            ('air', 'Air Transport'),
            ('sea', 'Sea Transport'),
            ('mixed', 'Mixed Transport'),
        ])
        
        return [mode_choices.get(mode, mode) for mode in obj.supported_transport_modes]
    
    def get_primary_transport_mode_display(self, obj):
        """Get human-readable name for primary transport mode"""
        return obj.get_primary_transport_mode_display()
    
    def get_transport_compatibility_score(self, obj):
        """Calculate transport compatibility score with suppliers"""
        if not obj.has_valid_coordinates:
            return 0
        
        try:
            nearby_suppliers = obj.get_suppliers_by_distance(radius_km=100)
            if not nearby_suppliers.exists():
                return 0
            
            compatible_count = 0
            for supplier in nearby_suppliers:
                if (obj.primary_transport_mode in supplier.transportation_modes or
                    supplier.transportation_mode == obj.primary_transport_mode):
                    compatible_count += 1
            
            return round((compatible_count / nearby_suppliers.count()) * 100, 2)
        except Exception:
            return 0
    
    def get_performance_metrics(self, obj):
        """Get comprehensive performance metrics"""
        return obj.get_performance_metrics()
    
    def get_preferred_suppliers_detail(self, obj):
        """Get detailed information about preferred suppliers"""
        preferred = obj.preferred_suppliers.filter(is_active=True)
        return [{
            'id': supplier.id,
            'name': supplier.name,
            'distance_km': round(obj.get_distance_to_supplier(supplier), 2) if obj.get_distance_to_supplier(supplier) else None,
            'transport_compatible': (
                obj.primary_transport_mode in supplier.transportation_modes or
                supplier.transportation_mode == obj.primary_transport_mode
            ),
            'material_count': supplier.suppliermaterial_set.filter(is_active=True).count()
        } for supplier in preferred]
    
    def get_nearby_suppliers_count(self, obj):
        """Get count of nearby suppliers within max distance"""
        try:
            radius = float(obj.max_supplier_distance) if obj.max_supplier_distance else 100
            return obj.get_suppliers_by_distance(radius_km=radius).count()
        except Exception:
            return 0
    
    def get_compatible_suppliers_count(self, obj):
        """Get count of suppliers compatible with warehouse capabilities"""
        try:
            return obj.get_compatible_suppliers().count()
        except Exception:
            return 0
    
    def get_capacity_utilization_percentage(self, obj):
        """Get capacity utilization as percentage"""
        return float(obj.current_utilization) if obj.current_utilization else 0.0
    
    def get_available_capacity(self, obj):
        """Calculate available capacity"""
        if obj.storage_capacity and obj.current_utilization:
            used_capacity = (obj.storage_capacity * obj.current_utilization) / 100
            return float(obj.storage_capacity - used_capacity)
        return None
    
    def get_operational_hours_display(self, obj):
        """Get formatted operational hours"""
        if not obj.operating_hours:
            return "Standard business hours" if not obj.operates_24_7 else "24/7 Operations"
        
        if obj.operates_24_7:
            return "24/7 Operations"
        
        # Format operating hours if available
        formatted_hours = {}
        for day, hours in obj.operating_hours.items():
            if isinstance(hours, dict) and 'open' in hours and 'close' in hours:
                formatted_hours[day.capitalize()] = f"{hours['open']} - {hours['close']}"
        else:
                formatted_hours[day.capitalize()] = str(hours)
        
        return formatted_hours
    
    def get_capabilities_summary(self, obj):
        """Get summary of warehouse capabilities"""
        capabilities = []
        
        if obj.cold_storage_available:
            capabilities.append("Cold Storage")
        if obj.hazmat_certified:
            capabilities.append("Hazmat Certified")
        if obj.organic_certified:
            capabilities.append("Organic Certified")
        if obj.cross_dock_capable:
            capabilities.append("Cross-Dock Capable")
        if obj.operates_24_7:
            capabilities.append("24/7 Operations")
        
        return {
            'count': len(capabilities),
            'capabilities': capabilities,
            'has_special_capabilities': len(capabilities) > 0
        }
    
    def validate(self, data):
        """Custom validation for warehouse data"""
        # Validate coordinates if provided
        if 'latitude' in data and 'longitude' in data:
            lat = data.get('latitude')
            lng = data.get('longitude')
            
            if lat is not None and lng is not None:
                if not (-90 <= lat <= 90):
                    raise serializers.ValidationError("Latitude must be between -90 and 90")
                if not (-180 <= lng <= 180):
                    raise serializers.ValidationError("Longitude must be between -180 and 180")
        
        # Validate utilization percentage
        if 'current_utilization' in data:
            utilization = data.get('current_utilization')
            if utilization is not None and not (0 <= utilization <= 100):
                raise serializers.ValidationError("Current utilization must be between 0 and 100")
        
        # Validate capacity threshold
        if 'max_capacity_threshold' in data:
            threshold = data.get('max_capacity_threshold')
            if threshold is not None and not (0 <= threshold <= 100):
                raise serializers.ValidationError("Max capacity threshold must be between 0 and 100")
        
        # Validate monitoring interval
        if 'monitoring_interval' in data:
            interval = data.get('monitoring_interval')
            if interval is not None and interval < 60:
                raise serializers.ValidationError("Monitoring interval must be at least 60 seconds")
        
        # Validate geofence radius
        if 'geofence_radius' in data:
            radius = data.get('geofence_radius')
            if radius is not None and radius < 10:
                raise serializers.ValidationError("Geofence radius must be at least 10 meters")
        
        # Validate warehouse code uniqueness
        if 'code' in data:
            code = data.get('code')
            if code:
                existing = Warehouse.objects.filter(code=code)
                if self.instance:
                    existing = existing.exclude(id=self.instance.id)
                if existing.exists():
                    raise serializers.ValidationError("Warehouse code must be unique")
        
        # Validate supported transport modes
        if 'supported_transport_modes' in data:
            modes = data.get('supported_transport_modes')
            if modes:
                valid_modes = ['road', 'rail', 'air', 'sea', 'mixed']
                invalid_modes = [mode for mode in modes if mode not in valid_modes]
                if invalid_modes:
                    raise serializers.ValidationError(f"Invalid transport modes: {invalid_modes}")
        
        # Validate primary transport mode is in supported modes
        primary_mode = data.get('primary_transport_mode')
        supported_modes = data.get('supported_transport_modes', [])
        
        if primary_mode and supported_modes and primary_mode not in supported_modes:
            # Auto-add primary mode to supported modes
            supported_modes.append(primary_mode)
            data['supported_transport_modes'] = supported_modes
        
        return data
    
    def create(self, validated_data):
        """Custom create method with auto-geocoding"""
        # Handle preferred suppliers
        preferred_suppliers = validated_data.pop('preferred_suppliers', [])
        
        # Create warehouse
        warehouse = Warehouse.objects.create(**validated_data)
        
        # Set preferred suppliers
        if preferred_suppliers:
            warehouse.preferred_suppliers.set(preferred_suppliers)
        
        # Auto-geocode if address is provided and no coordinates
        if (warehouse.full_address and 
            not warehouse.has_valid_coordinates and 
            not validated_data.get('skip_geocoding', False)):
            try:
                warehouse.geocode_address()
                warehouse.save()
            except Exception as e:
                # Log warning but don't fail creation
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to geocode warehouse {warehouse.name}: {e}")
        
        return warehouse
    
    def update(self, instance, validated_data):
        """Custom update method with geocoding on address change"""
        # Handle preferred suppliers
        preferred_suppliers = validated_data.pop('preferred_suppliers', None)
        
        # Check if address changed
        address_changed = any(
            validated_data.get(field) != getattr(instance, field)
            for field in ['street_number', 'street_name', 'unit_suite', 'city', 
                         'state_province', 'postal_code', 'country']
        )
        
        # Update warehouse
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update preferred suppliers
        if preferred_suppliers is not None:
            instance.preferred_suppliers.set(preferred_suppliers)
        
        # Auto-geocode if address changed
        if address_changed and not validated_data.get('skip_geocoding', False):
            try:
                instance.geocode_address()
                instance.save()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to geocode warehouse {instance.name}: {e}")
        
        return instance

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
    api_source = serializers.CharField(required=False)
    last_updated = serializers.CharField(required=False)
    effective_date = serializers.CharField(required=False, allow_blank=True)
    province = serializers.CharField(required=False)

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