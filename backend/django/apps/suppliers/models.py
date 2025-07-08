from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
import uuid
import requests
import logging
import json

logger = logging.getLogger(__name__)

class MaterialCategory(models.Model):
    """Material categories managed in Django Admin"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Material Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Material(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilograms'),
        ('g', 'Grams'),
        ('lbs', 'Pounds'),
        ('oz', 'Ounces'),
        ('l', 'Liters'),
        ('ml', 'Milliliters'),
        ('gal', 'Gallons'),
        ('pieces', 'Pieces'),
        ('boxes', 'Boxes'),
        ('pallets', 'Pallets'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50, choices=UNIT_CHOICES)
    category = models.ForeignKey(
        MaterialCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='materials'
    )
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    is_organic = models.BooleanField(default=True, help_text="Assume all materials are organic by default")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category__name', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.unit})"

class Supplier(models.Model):
    TRANSPORTATION_CHOICES = [
        ('road', 'Road Transport'),
        ('rail', 'Rail Transport'),
        ('air', 'Air Transport'),
        ('sea', 'Sea Transport'),
        ('mixed', 'Mixed Transport'),
    ]
    
    ENVIRONMENTAL_CERTIFICATION_CHOICES = [
        ('iso14001', 'ISO 14001'),
        ('iso50001', 'ISO 50001'),
        ('green_business', 'Green Business Certification'),
        ('carbon_neutral', 'Carbon Neutral Certified'),
        ('none', 'No Certification'),
    ]
    
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Enhanced address fields for better data management and mapping
    street_number = models.CharField(max_length=20, blank=True, help_text="Street number")
    street_name = models.CharField(max_length=200, blank=True, help_text="Street name")
    unit_suite = models.CharField(max_length=50, blank=True, help_text="Unit, suite, or apartment number")
    city = models.CharField(max_length=100, help_text="City or municipality")
    state_province = models.CharField(
        max_length=100, 
        help_text="State or province"
    )
    postal_code = models.CharField(max_length=20, help_text="Postal code or ZIP code")
    country = models.CharField(max_length=100, default='Canada', help_text="Country")
    country_code = models.CharField(max_length=2, default='CA', help_text="ISO country code")
    
    # Geolocation fields for mapping and distance calculations
    latitude = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        help_text="Latitude coordinate for mapping"
    )
    longitude = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        help_text="Longitude coordinate for mapping"
    )
    
    # Address validation and geocoding metadata
    address_formatted = models.TextField(
        blank=True,
        help_text="Formatted address string from geocoding service"
    )
    address_validated = models.BooleanField(
        default=False,
        help_text="Whether the address has been validated through geocoding"
    )
    geocoding_source = models.CharField(
        max_length=50,
        blank=True,
        help_text="Source of geocoding data (e.g., 'OpenStreetMap')"
    )
    geocoded_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the address was last geocoded"
    )
    
    # Legacy address field for backward compatibility
    address = models.TextField(
        blank=True,
        help_text="Legacy address field - will be auto-populated from structured fields"
    )
    
    # Material and Cost Information
    materials = models.ManyToManyField(
        Material,
        through='SupplierMaterial',
        related_name='suppliers'
    )
    
    # Capacity Information
    min_supply_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Minimum supply capacity per order"
    )
    max_supply_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Maximum supply capacity per order"
    )
    current_capacity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Current available capacity"
    )
    
    # Transportation Information
    transportation_mode = models.CharField(
        max_length=10,
        choices=TRANSPORTATION_CHOICES,
        default='road',
        help_text="Primary transportation mode (legacy field, use transportation_modes for multiple)"
    )
    transportation_modes = models.JSONField(
        default=list,
        blank=True,
        help_text="List of supported transportation modes (e.g., ['road', 'rail', 'air'])"
    )
    transportation_details = models.TextField(
        blank=True,
        null=True,
        help_text="Additional details about transportation methods and capabilities"
    )
    
    # Environmental Information
    environmental_certification = models.CharField(
        max_length=20,
        choices=ENVIRONMENTAL_CERTIFICATION_CHOICES,
        default='none',
        help_text="Environmental certification status"
    )
    carbon_footprint = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Annual carbon footprint in metric tons CO2e"
    )
    renewable_energy_usage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Percentage of energy from renewable sources"
    )
    waste_management_policy = models.TextField(
        blank=True,
        help_text="Description of waste management practices"
    )
    environmental_impact_report = models.URLField(
        blank=True,
        help_text="URL to latest environmental impact report"
    )
    sustainability_goals = models.TextField(
        blank=True,
        help_text="Description of sustainability goals and targets"
    )
    
    # Status and metadata
    is_active = models.BooleanField(default=True, help_text="Whether this supplier is active")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_suppliers'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name 
    
    @property
    def total_orders(self):
        return self.orders.count()
    
    @property
    def order_history(self):
        return self.orders.all().order_by('-order_date')
    
    @property
    def full_address(self):
        """Get formatted full address"""
        if self.address_formatted:
            return self.address_formatted
        
        # Build address from components
        address_parts = []
        
        # Street address
        street_parts = []
        if self.street_number:
            street_parts.append(self.street_number)
        if self.street_name:
            street_parts.append(self.street_name)
        if street_parts:
            street_address = ' '.join(street_parts)
            if self.unit_suite:
                street_address += f", {self.unit_suite}"
            address_parts.append(street_address)
        
        # City, Province, Postal Code
        if self.city:
            address_parts.append(self.city)
        if self.state_province:
            address_parts.append(self.state_province)
        if self.postal_code:
            address_parts.append(self.postal_code)
        if self.country and self.country != 'Canada':
            address_parts.append(self.country)
        
        return ', '.join(address_parts)
    
    @property
    def coordinates(self):
        """Get coordinates as tuple"""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None
    
    @property
    def has_valid_coordinates(self):
        """Check if supplier has valid coordinates"""
        return (self.latitude is not None and 
                self.longitude is not None and
                -90 <= self.latitude <= 90 and
                -180 <= self.longitude <= 180)
    
    def save(self, *args, **kwargs):
        """Override save to update legacy address field"""
        # Update legacy address field for backward compatibility
        if not self.address:
            self.address = self.full_address
        
        super().save(*args, **kwargs)
    
    def geocode_address(self):
        """Geocode the supplier address using OpenStreetMap"""
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            if not self.full_address:
                return False
            
            osm_client = OpenStreetMapClient()
            result = osm_client.geocode_address(self.full_address, self.country_code)
            
            if result:
                # Update coordinates
                self.latitude = Decimal(str(result['latitude']))
                self.longitude = Decimal(str(result['longitude']))
                
                # Update formatted address
                self.address_formatted = result['formatted_address']
                
                # Update components if they were empty
                components = result['components']
                if not self.street_number and components['street_number']:
                    self.street_number = components['street_number']
                if not self.street_name and components['street_name']:
                    self.street_name = components['street_name']
                if not self.city and components['city']:
                    self.city = components['city']
                if not self.state_province and components['state_province']:
                    self.state_province = components['state_province']
                if not self.postal_code and components['postal_code']:
                    self.postal_code = components['postal_code']
                if not self.country_code and components['country_code']:
                    self.country_code = components['country_code']
                
                # Update metadata
                self.address_validated = True
                self.geocoding_source = 'OpenStreetMap'
                self.geocoded_at = timezone.now()
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error geocoding address for supplier {self.name}: {e}")
            return False
    
    def get_distance_to(self, other_supplier):
        """Calculate distance to another supplier in kilometers"""
        if not (self.has_valid_coordinates and other_supplier.has_valid_coordinates):
            return None
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            return osm_client.get_distance_between_points(
                float(self.latitude), float(self.longitude),
                float(other_supplier.latitude), float(other_supplier.longitude)
            )
        except Exception:
            return None
    
    def get_nearby_suppliers(self, radius_km=50):
        """Get other suppliers within specified radius"""
        if not self.has_valid_coordinates:
            return Supplier.objects.none()
        
        from django.db.models import Q
        from decimal import Decimal
        
        # Simple bounding box calculation (approximate)
        # 1 degree latitude ≈ 111 km
        # 1 degree longitude ≈ 111 km * cos(latitude)
        lat_delta = Decimal(radius_km) / Decimal('111')
        lon_delta = lat_delta / Decimal(str(abs(float(self.latitude) * 0.017453)))  # Convert to radians approximation
        
        min_lat = self.latitude - lat_delta
        max_lat = self.latitude + lat_delta
        min_lon = self.longitude - lon_delta
        max_lon = self.longitude + lon_delta
        
        return Supplier.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__gte=min_lat,
            latitude__lte=max_lat,
            longitude__gte=min_lon,
            longitude__lte=max_lon
        ).exclude(id=self.id)
    
    def get_map_url(self, zoom=15):
        """Get URL to view supplier location on OpenStreetMap"""
        if not self.has_valid_coordinates:
            return None
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            return osm_client.get_map_url(float(self.latitude), float(self.longitude), zoom)
        except Exception:
            return None
    
    def get_static_map_url(self, width=400, height=300, zoom=15):
        """Get URL for static map image of supplier location"""
        if not self.has_valid_coordinates:
            return None
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            return osm_client.get_static_map_url(
                float(self.latitude), float(self.longitude), 
                width, height, zoom
            )
        except Exception:
            return None

class Warehouse(models.Model):
    """Enhanced Warehouse model for comprehensive inventory management and logistics mapping"""
    
    TYPE_CHOICES = [
        ('distribution', 'Distribution Center'),
        ('fulfillment', 'Fulfillment Center'),
        ('storage', 'Storage Facility'),
        ('cold_storage', 'Cold Storage'),
        ('cross_dock', 'Cross-Dock Facility'),
        ('hub', 'Regional Hub'),
        ('consolidation', 'Consolidation Center'),
        ('retail', 'Retail Store'),
        ('manufacturing', 'Manufacturing Facility'),
    ]
    
    PRIORITY_CHOICES = [
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, help_text="Unique warehouse code")
    warehouse_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='distribution')
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Enhanced address fields (same as Supplier)
    street_number = models.CharField(max_length=20, blank=True, help_text="Street number")
    street_name = models.CharField(max_length=200, blank=True, help_text="Street name")
    unit_suite = models.CharField(max_length=50, blank=True, help_text="Unit, suite, or apartment number")
    city = models.CharField(max_length=100, help_text="City or municipality")
    state_province = models.CharField(max_length=100, help_text="State or province")
    postal_code = models.CharField(max_length=20, help_text="Postal code or ZIP code")
    country = models.CharField(max_length=100, default='Canada', help_text="Country")
    country_code = models.CharField(max_length=2, default='CA', help_text="ISO country code")
    
    # Enhanced geolocation fields for real-time monitoring
    latitude = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        help_text="Latitude coordinate for mapping and real-time monitoring"
    )
    longitude = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        help_text="Longitude coordinate for mapping and real-time monitoring"
    )
    altitude = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Altitude in meters for enhanced GPS tracking"
    )
    
    # Address validation and geocoding metadata
    address_formatted = models.TextField(blank=True, help_text="Formatted address from geocoding")
    address_validated = models.BooleanField(default=False, help_text="Address validated via geocoding")
    geocoding_source = models.CharField(max_length=50, blank=True, help_text="Geocoding source")
    geocoded_at = models.DateTimeField(null=True, blank=True, help_text="Last geocoded date")
    geocoding_accuracy = models.CharField(max_length=20, blank=True, help_text="Geocoding accuracy level")
    
    # GPS and Real-time Monitoring Fields
    gps_last_updated = models.DateTimeField(null=True, blank=True, help_text="Last GPS coordinate update")
    monitoring_enabled = models.BooleanField(default=True, help_text="Enable real-time monitoring")
    monitoring_interval = models.IntegerField(default=300, help_text="Monitoring update interval in seconds")
    geofence_radius = models.IntegerField(default=100, help_text="Geofence radius in meters for monitoring")
    
    # Transportation and Logistics
    supported_transport_modes = models.JSONField(
        default=list,
        blank=True,
        help_text="List of supported transportation modes for deliveries ['road', 'rail', 'air', 'sea']"
    )
    primary_transport_mode = models.CharField(
        max_length=20,
        choices=[
            ('road', 'Road Transport'),
            ('rail', 'Rail Transport'),
            ('air', 'Air Transport'),
            ('sea', 'Sea Transport'),
            ('mixed', 'Mixed Transport'),
        ],
        default='road',
        help_text="Primary transportation mode for this warehouse"
    )
    loading_dock_count = models.IntegerField(default=1, help_text="Number of loading docks")
    max_vehicle_capacity = models.CharField(
        max_length=50,
        blank=True,
        help_text="Maximum vehicle capacity that can be accommodated"
    )
    operates_24_7 = models.BooleanField(default=False, help_text="Operates 24/7")
    operating_hours = models.JSONField(
        default=dict,
        blank=True,
        help_text="Operating hours by day {'monday': {'open': '09:00', 'close': '17:00'}}"
    )
    
    # Capacity and operational information
    storage_capacity = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Storage capacity in cubic meters"
    )
    current_utilization = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Current utilization percentage"
    )
    max_capacity_threshold = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=90.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Maximum capacity threshold for alerts"
    )
    
    # Special capabilities
    cold_storage_available = models.BooleanField(default=False, help_text="Cold storage capabilities")
    hazmat_certified = models.BooleanField(default=False, help_text="Hazardous materials certified")
    organic_certified = models.BooleanField(default=False, help_text="Organic handling certified")
    cross_dock_capable = models.BooleanField(default=False, help_text="Cross-docking capabilities")
    
    # Contact information
    manager_name = models.CharField(max_length=100, blank=True)
    manager_email = models.EmailField(blank=True)
    manager_phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    
    # Supplier relationship preferences
    preferred_suppliers = models.ManyToManyField(
        'Supplier',
        blank=True,
        related_name='preferred_warehouses',
        help_text="Preferred suppliers for this warehouse"
    )
    max_supplier_distance = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum preferred distance from suppliers (km)"
    )
    
    # Performance metrics for real-time monitoring
    avg_delivery_time = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Average delivery time in hours"
    )
    on_time_delivery_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="On-time delivery rate percentage"
    )
    last_performance_update = models.DateTimeField(null=True, blank=True)
    
    # Operational settings
    is_active = models.BooleanField(default=True)
    is_primary = models.BooleanField(default=False, help_text="Primary warehouse for region")
    accepts_new_suppliers = models.BooleanField(default=True, help_text="Accepts new supplier registrations")
    
    # Real-time monitoring status
    last_monitoring_check = models.DateTimeField(null=True, blank=True)
    monitoring_status = models.CharField(
        max_length=20,
        choices=[
            ('online', 'Online'),
            ('offline', 'Offline'),
            ('maintenance', 'Maintenance'),
            ('alert', 'Alert'),
        ],
        default='online'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_warehouses'
    )
    
    class Meta:
        ordering = ['-is_primary', 'priority', 'name']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_active', 'monitoring_enabled']),
            models.Index(fields=['warehouse_type', 'is_active']),
        ]
        
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def full_address(self):
        """Get formatted full address"""
        if self.address_formatted:
            return self.address_formatted
        
        address_parts = []
        
        # Street address
        street_parts = []
        if self.street_number:
            street_parts.append(self.street_number)
        if self.street_name:
            street_parts.append(self.street_name)
        if street_parts:
            street_address = ' '.join(street_parts)
            if self.unit_suite:
                street_address += f", {self.unit_suite}"
            address_parts.append(street_address)
        
        # City, Province, Postal Code
        if self.city:
            address_parts.append(self.city)
        if self.state_province:
            address_parts.append(self.state_province)
        if self.postal_code:
            address_parts.append(self.postal_code)
        if self.country and self.country != 'Canada':
            address_parts.append(self.country)
        
        return ', '.join(address_parts)
    
    @property
    def coordinates(self):
        """Get coordinates as tuple"""
        if self.latitude and self.longitude:
            return (float(self.latitude), float(self.longitude))
        return None
    
    @property
    def has_valid_coordinates(self):
        """Check if warehouse has valid coordinates"""
        return (self.latitude is not None and 
                self.longitude is not None and
                -90 <= self.latitude <= 90 and
                -180 <= self.longitude <= 180)
    
    @property
    def utilization_status(self):
        """Get utilization status description"""
        if not self.current_utilization:
            return 'Unknown'
        
        utilization = float(self.current_utilization)
        if utilization < 50:
            return 'Low'
        elif utilization < 80:
            return 'Medium'
        elif utilization < 95:
            return 'High'
        else:
            return 'Critical'
    
    @property
    def is_over_capacity(self):
        """Check if warehouse is over capacity threshold"""
        return (self.current_utilization and 
                self.current_utilization >= self.max_capacity_threshold)
    
    @property
    def needs_monitoring_update(self):
        """Check if monitoring update is needed"""
        if not self.monitoring_enabled or not self.last_monitoring_check:
            return True
        
        elapsed = timezone.now() - self.last_monitoring_check
        return elapsed.total_seconds() > self.monitoring_interval
    
    def save(self, *args, **kwargs):
        """Override save to handle GPS updates and monitoring"""
        # Update GPS timestamp if coordinates changed
        if self.pk:
            original = Warehouse.objects.get(pk=self.pk)
            if (original.latitude != self.latitude or 
                original.longitude != self.longitude):
                self.gps_last_updated = timezone.now()
        
        super().save(*args, **kwargs)
    
    def geocode_address(self):
        """Geocode the warehouse address using OpenStreetMap"""
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            if not self.full_address:
                return False
            
            osm_client = OpenStreetMapClient()
            result = osm_client.geocode_address(self.full_address, self.country_code)
            
            if result:
                # Update coordinates
                self.latitude = Decimal(str(result['latitude']))
                self.longitude = Decimal(str(result['longitude']))
                
                # Update formatted address
                self.address_formatted = result['formatted_address']
                
                # Update components if empty
                components = result['components']
                if not self.street_number and components.get('street_number'):
                    self.street_number = components['street_number']
                if not self.street_name and components.get('street_name'):
                    self.street_name = components['street_name']
                if not self.city and components.get('city'):
                    self.city = components['city']
                if not self.state_province and components.get('state_province'):
                    self.state_province = components['state_province']
                if not self.postal_code and components.get('postal_code'):
                    self.postal_code = components['postal_code']
                if not self.country_code and components.get('country_code'):
                    self.country_code = components['country_code']
                
                # Update metadata
                self.address_validated = True
                self.geocoding_source = 'OpenStreetMap'
                self.geocoded_at = timezone.now()
                self.geocoding_accuracy = result.get('accuracy', 'unknown')
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error geocoding address for warehouse {self.name}: {e}")
            return False
    
    def get_distance_to_supplier(self, supplier):
        """Calculate distance to a supplier in kilometers"""
        if not (self.has_valid_coordinates and supplier.has_valid_coordinates):
            return None
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            return osm_client.get_distance_between_points(
                float(self.latitude), float(self.longitude),
                float(supplier.latitude), float(supplier.longitude)
            )
        except Exception:
            return None
    
    def get_suppliers_by_distance(self, radius_km=100, transport_mode=None):
        """Get suppliers within specified radius, optionally filtered by transport mode"""
        if not self.has_valid_coordinates:
            return Supplier.objects.none()
        
        from django.db.models import Q
        
        # Simple bounding box calculation
        lat_delta = Decimal(radius_km) / Decimal('111')
        lon_delta = lat_delta / Decimal(str(abs(float(self.latitude) * 0.017453)))
        
        min_lat = self.latitude - lat_delta
        max_lat = self.latitude + lat_delta
        min_lon = self.longitude - lon_delta
        max_lon = self.longitude + lon_delta
        
        queryset = Supplier.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__gte=min_lat,
            latitude__lte=max_lat,
            longitude__gte=min_lon,
            longitude__lte=max_lon,
            is_active=True
        )
        
        # Filter by transport mode if specified
        if transport_mode:
            queryset = queryset.filter(
                Q(transportation_mode=transport_mode) |
                Q(transportation_modes__contains=[transport_mode])
            )
        
        return queryset
    
    def get_compatible_suppliers(self, material_id=None):
        """Get suppliers compatible with this warehouse's capabilities"""
        suppliers = self.get_suppliers_by_distance(
            radius_km=self.max_supplier_distance or 100
        )
        
        # Filter by material if specified
        if material_id:
            suppliers = suppliers.filter(
                suppliermaterial__material_id=material_id,
                suppliermaterial__is_active=True
            )
        
        # Filter by special capabilities
        if self.cold_storage_available:
            # Could add logic to filter suppliers with cold storage materials
            pass
        
        if self.organic_certified:
            suppliers = suppliers.filter(
                suppliermaterial__material__is_organic=True
            )
        
        return suppliers.distinct()
    
    def get_optimal_suppliers(self, material_id, quantity=None):
        """Get optimal suppliers for a specific material and quantity"""
        suppliers = self.get_compatible_suppliers(material_id)
        
        supplier_scores = []
        for supplier in suppliers:
            try:
                # Calculate distance
                distance = self.get_distance_to_supplier(supplier)
                if distance is None:
                    continue
                
                # Get supplier material info
                supplier_material = supplier.suppliermaterial_set.filter(
                    material_id=material_id,
                    is_active=True
                ).first()
                
                if not supplier_material:
                    continue
                
                # Calculate score based on multiple factors
                distance_score = max(0, 100 - (distance * 2))  # Penalize distance
                capacity_score = 100 if supplier.current_capacity >= (quantity or 1) else 50
                price_score = 100 - min(100, float(supplier_material.base_cost_per_unit))
                
                # Transport mode compatibility
                transport_score = 100
                if self.primary_transport_mode not in supplier.transportation_modes:
                    transport_score = 80
                
                # Calculate weighted score
                total_score = (
                    distance_score * 0.3 +
                    capacity_score * 0.2 +
                    price_score * 0.3 +
                    transport_score * 0.2
                )
                
                supplier_scores.append({
                    'supplier': supplier,
                    'distance': distance,
                    'score': total_score,
                    'price': float(supplier_material.base_cost_per_unit),
                    'lead_time': supplier_material.lead_time,
                    'transport_compatible': self.primary_transport_mode in supplier.transportation_modes
                })
                
            except Exception as e:
                logger.warning(f"Error calculating supplier score for {supplier.name}: {e}")
                continue
        
        # Sort by score (descending)
        supplier_scores.sort(key=lambda x: x['score'], reverse=True)
        return supplier_scores
    
    def update_monitoring_status(self, status=None):
        """Update monitoring status and timestamp"""
        if status:
            self.monitoring_status = status
        self.last_monitoring_check = timezone.now()
        self.save(update_fields=['monitoring_status', 'last_monitoring_check'])
    
    def get_performance_metrics(self):
        """Get performance metrics for this warehouse"""
        # This would integrate with order tracking system
        return {
            'avg_delivery_time': float(self.avg_delivery_time or 0),
            'on_time_delivery_rate': float(self.on_time_delivery_rate or 0),
            'utilization_rate': float(self.current_utilization or 0),
            'supplier_count': self.get_suppliers_by_distance().count(),
            'monitoring_status': self.monitoring_status,
            'last_update': self.last_monitoring_check,
        }
    
    def is_within_geofence(self, lat, lng):
        """Check if coordinates are within warehouse geofence"""
        if not self.has_valid_coordinates:
            return False
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            distance = osm_client.get_distance_between_points(
                float(self.latitude), float(self.longitude),
                float(lat), float(lng)
            )
            
            return distance <= (self.geofence_radius / 1000)  # Convert meters to km
        except Exception:
            return False
    
    def get_map_url(self, zoom=15):
        """Get URL to view warehouse location on OpenStreetMap"""
        if not self.has_valid_coordinates:
            return None
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            return osm_client.get_map_url(float(self.latitude), float(self.longitude), zoom)
        except Exception:
            return None
    
    def get_static_map_url(self, width=400, height=300, zoom=15):
        """Get URL for static map image of warehouse location"""
        if not self.has_valid_coordinates:
            return None
        
        try:
            from .openstreetmap_api import OpenStreetMapClient
            
            osm_client = OpenStreetMapClient()
            return osm_client.get_static_map_url(
                float(self.latitude), float(self.longitude), 
                width, height, zoom
            )
        except Exception:
            return None

class Currency(models.Model):
    """Supported currencies"""
    code = models.CharField(max_length=3, unique=True)  # USD, CAD
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=5)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Currencies"
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class TaxRegion(models.Model):
    """Tax regions for tax calculation with Canadian-specific support"""
    
    # Canadian Provinces and Territories
    CANADIAN_PROVINCES = [
        ('AB', 'Alberta'),
        ('BC', 'British Columbia'),
        ('MB', 'Manitoba'),
        ('NB', 'New Brunswick'),
        ('NL', 'Newfoundland and Labrador'),
        ('NT', 'Northwest Territories'),
        ('NS', 'Nova Scotia'),
        ('NU', 'Nunavut'),
        ('ON', 'Ontario'),
        ('PE', 'Prince Edward Island'),
        ('QC', 'Quebec'),
        ('SK', 'Saskatchewan'),
        ('YT', 'Yukon'),
    ]
    
    # Tax Types for Canada
    TAX_TYPE_CHOICES = [
        ('GST', 'GST Only (5%)'),
        ('HST', 'Harmonized Sales Tax (GST + Provincial combined)'),
        ('GST_PST', 'GST + Provincial Sales Tax (separate)'),
        ('GST_QST', 'GST + Quebec Sales Tax'),
        ('SALES_TAX', 'US Sales Tax'),
        ('VAT', 'Value Added Tax'),
    ]
    
    name = models.CharField(max_length=100)  # e.g., "Ontario, Canada", "California, USA"
    country = models.CharField(max_length=2, default='CA')  # CA, US
    province_state = models.CharField(max_length=100, choices=CANADIAN_PROVINCES, blank=True)
    
    # Tax rates - Canadian system requires multiple rates
    gst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.05,
        help_text="GST rate (5% for Canada)"
    )
    pst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.00,
        help_text="Provincial Sales Tax rate (varies by province)"
    )
    hst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.00,
        help_text="HST rate for participating provinces (includes both GST and provincial component)"
    )
    
    # Combined tax rate for easy calculation
    total_tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        help_text="Total combined tax rate"
    )
    
    tax_type = models.CharField(
        max_length=20, 
        choices=TAX_TYPE_CHOICES,
        default='GST',
        help_text="Type of tax system used"
    )
    
    # Cross-border and import/export considerations
    is_cross_border = models.BooleanField(
        default=False,
        help_text="Whether this involves cross-border transactions"
    )
    duty_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0.00,
        help_text="Import duty rate for cross-border transactions"
    )
    
    is_active = models.BooleanField(default=True)
    effective_date = models.DateField(
        auto_now_add=True,
        help_text="Date when these tax rates became effective"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about tax rules, exemptions, etc."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['country', 'province_state', 'name']
        unique_together = ['country', 'province_state', 'effective_date']

    def __str__(self):
        if self.province_state:
            return f"{self.get_province_state_display()}, {self.country} ({self.tax_type})"
        return f"{self.name} ({self.tax_type})"
    
    def save(self, *args, **kwargs):
        from decimal import Decimal
        
        # Auto-calculate total_tax_rate based on tax_type
        if self.tax_type == 'HST':
            self.total_tax_rate = self.hst_rate
            self.gst_rate = Decimal('0.05')  # Standard GST component
            self.pst_rate = max(Decimal('0'), self.hst_rate - Decimal('0.05'))  # Provincial component
        elif self.tax_type == 'GST_PST' or self.tax_type == 'GST_QST':
            self.total_tax_rate = self.gst_rate + self.pst_rate
            self.hst_rate = Decimal('0')
        elif self.tax_type == 'GST':
            self.total_tax_rate = self.gst_rate
            self.pst_rate = Decimal('0')
            self.hst_rate = Decimal('0')
        else:
            # For non-Canadian tax systems
            self.total_tax_rate = max(self.gst_rate, self.pst_rate, self.hst_rate)
        
        super().save(*args, **kwargs)
    
    @classmethod
    def get_current_canadian_rates(cls):
        """Get current Canadian tax rates by province/territory"""
        return {
            'AB': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'total': 0.05, 'type': 'GST'},
            'BC': {'gst': 0.05, 'pst': 0.07, 'hst': 0.00, 'total': 0.12, 'type': 'GST_PST'},
            'MB': {'gst': 0.05, 'pst': 0.07, 'hst': 0.00, 'total': 0.12, 'type': 'GST_PST'},
            'NB': {'gst': 0.05, 'pst': 0.10, 'hst': 0.15, 'total': 0.15, 'type': 'HST'},
            'NL': {'gst': 0.05, 'pst': 0.10, 'hst': 0.15, 'total': 0.15, 'type': 'HST'},
            'NT': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'total': 0.05, 'type': 'GST'},
            'NS': {'gst': 0.05, 'pst': 0.09, 'hst': 0.14, 'total': 0.14, 'type': 'HST'},  # Updated April 2025
            'NU': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'total': 0.05, 'type': 'GST'},
            'ON': {'gst': 0.05, 'pst': 0.08, 'hst': 0.13, 'total': 0.13, 'type': 'HST'},
            'PE': {'gst': 0.05, 'pst': 0.10, 'hst': 0.15, 'total': 0.15, 'type': 'HST'},
            'QC': {'gst': 0.05, 'pst': 0.09975, 'hst': 0.00, 'total': 0.14975, 'type': 'GST_QST'},
            'SK': {'gst': 0.05, 'pst': 0.06, 'hst': 0.00, 'total': 0.11, 'type': 'GST_PST'},
            'YT': {'gst': 0.05, 'pst': 0.00, 'hst': 0.00, 'total': 0.05, 'type': 'GST'},
        }
    
    def calculate_tax_breakdown(self, amount):
        """Calculate detailed tax breakdown for an amount"""
        from decimal import Decimal
        
        # Convert amount to Decimal for consistent calculations
        amount = Decimal(str(amount))
        
        breakdown = {
            'subtotal': amount,
            'gst_amount': Decimal('0'),
            'pst_amount': Decimal('0'),
            'hst_amount': Decimal('0'),
            'duty_amount': Decimal('0'),
            'total_tax': Decimal('0'),
            'total_with_tax': amount,
            'tax_type': self.tax_type
        }
        
        if self.is_cross_border and self.duty_rate > 0:
            breakdown['duty_amount'] = amount * self.duty_rate
            amount_after_duty = amount + breakdown['duty_amount']
        else:
            amount_after_duty = amount
        
        if self.tax_type == 'HST':
            breakdown['hst_amount'] = amount_after_duty * self.hst_rate
            breakdown['total_tax'] = breakdown['hst_amount'] + breakdown['duty_amount']
        elif self.tax_type in ['GST_PST', 'GST_QST']:
            breakdown['gst_amount'] = amount_after_duty * self.gst_rate
            breakdown['pst_amount'] = amount_after_duty * self.pst_rate
            breakdown['total_tax'] = breakdown['gst_amount'] + breakdown['pst_amount'] + breakdown['duty_amount']
        elif self.tax_type == 'GST':
            breakdown['gst_amount'] = amount_after_duty * self.gst_rate
            breakdown['total_tax'] = breakdown['gst_amount'] + breakdown['duty_amount']
        
        breakdown['total_with_tax'] = amount + breakdown['total_tax']
        
        # Round all monetary values to 2 decimal places
        for key in ['subtotal', 'gst_amount', 'pst_amount', 'hst_amount', 'duty_amount', 'total_tax', 'total_with_tax']:
            if key in breakdown:
                breakdown[key] = breakdown[key].quantize(Decimal('0.01'))
        
        return breakdown

class SupplierMaterial(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    
    # Basic pricing information
    base_cost_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Base cost per unit before volume discounts and taxes"
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        help_text="Currency for pricing"
    )
    
    # Tax information
    tax_region = models.ForeignKey(
        TaxRegion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Tax region for calculating taxes"
    )
    tax_included = models.BooleanField(
        default=False,
        help_text="Whether the base cost includes taxes"
    )
    
    # Supply information
    lead_time = models.IntegerField(
        validators=[MinValueValidator(0)],
        help_text="Lead time in days"
    )
    minimum_order_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=1,
        help_text="Minimum order quantity"
    )
    maximum_order_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Maximum order quantity (if any)"
    )
    
    # Status and metadata
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['supplier', 'material']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.supplier.name} - {self.material.name}"
    
    @property
    def cost_per_unit(self):
        """Legacy property for backward compatibility"""
        return self.base_cost_per_unit
    
    def get_price_with_tax(self, quantity=None):
        """Calculate price including tax for given quantity"""
        base_price = self.get_volume_price(quantity) if quantity else self.base_cost_per_unit
        
        if self.tax_included:
            return base_price
        
        if self.tax_region:
            tax_amount = base_price * self.tax_region.total_tax_rate
            return base_price + tax_amount
        
        return base_price
    
    def get_volume_price(self, quantity):
        """Get price based on volume pricing tiers"""
        if not quantity:
            return self.base_cost_per_unit
        
        # Get applicable volume pricing tier
        volume_tier = self.volume_pricing_tiers.filter(
            min_quantity__lte=quantity,
            is_active=True
        ).order_by('-min_quantity').first()
        
        if volume_tier:
            return volume_tier.price_per_unit
        
        return self.base_cost_per_unit
    
    def get_seasonal_price(self, target_date=None):
        """Get price based on seasonal pricing"""
        if not target_date:
            target_date = date.today()
        
        # Get applicable seasonal pricing
        seasonal_price = self.seasonal_pricing.filter(
            start_date__lte=target_date,
            end_date__gte=target_date,
            is_active=True
        ).first()
        
        if seasonal_price:
            return seasonal_price.price_per_unit
        
        return self.base_cost_per_unit

class VolumePricingTier(models.Model):
    """Volume-based pricing tiers for supplier materials"""
    supplier_material = models.ForeignKey(
        SupplierMaterial,
        on_delete=models.CASCADE,
        related_name='volume_pricing_tiers'
    )
    min_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Minimum quantity for this pricing tier"
    )
    max_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
        help_text="Maximum quantity for this pricing tier (optional)"
    )
    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price per unit for this quantity range"
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
        help_text="Discount percentage from base price"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['supplier_material', 'min_quantity']
        unique_together = ['supplier_material', 'min_quantity']
    
    def __str__(self):
        return f"{self.supplier_material} - {self.min_quantity}+ units @ {self.price_per_unit}"

class SeasonalPricing(models.Model):
    """Seasonal pricing for supplier materials"""
    supplier_material = models.ForeignKey(
        SupplierMaterial,
        on_delete=models.CASCADE,
        related_name='seasonal_pricing'
    )
    season_name = models.CharField(
        max_length=100,
        help_text="e.g., 'Winter 2024', 'Harvest Season'"
    )
    start_date = models.DateField(help_text="Start date for seasonal pricing")
    end_date = models.DateField(help_text="End date for seasonal pricing")
    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Seasonal price per unit"
    )
    price_adjustment_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(-100), MaxValueValidator(100)],
        null=True,
        blank=True,
        help_text="Percentage adjustment from base price (positive for increase, negative for decrease)"
    )
    reason = models.CharField(
        max_length=200,
        blank=True,
        help_text="Reason for seasonal pricing (e.g., 'High demand', 'Harvest surplus')"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['supplier_material', '-start_date']
    
    def __str__(self):
        return f"{self.supplier_material} - {self.season_name} ({self.start_date} to {self.end_date})"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date must be before end date")

class ExternalTaxService(models.Model):
    """Configuration for external tax calculation services with Canadian support"""
    SERVICE_CHOICES = [
        ('taxjar', 'TaxJar API (US Only)'),
        ('avalara', 'Avalara AvaTax (US/Canada/Global)'),
        ('cra_gst', 'Canada Revenue Agency GST Calculator'),
        ('manual', 'Manual Tax Calculation'),
        ('canadian_tax_api', 'Canadian Sales Tax API (salestaxapi.ca)'),
    ]
    
    SUPPORTED_COUNTRIES = [
        ('US', 'United States'),
        ('CA', 'Canada'),
        ('GLOBAL', 'Global Coverage'),
    ]
    
    name = models.CharField(max_length=50, choices=SERVICE_CHOICES, unique=True)
    api_key = models.CharField(max_length=200, blank=True, null=True)
    api_url = models.URLField(blank=True)
    supported_countries = models.CharField(
        max_length=10,
        choices=SUPPORTED_COUNTRIES,
        default='CA',
        help_text="Countries supported by this tax service"
    )
    supports_cross_border = models.BooleanField(
        default=False,
        help_text="Whether this service can handle cross-border transactions"
    )
    supports_gst_hst = models.BooleanField(
        default=True,
        help_text="Whether this service supports Canadian GST/HST calculation"
    )
    supports_pst = models.BooleanField(
        default=True,
        help_text="Whether this service supports Provincial Sales Tax calculation"
    )
    supports_duty_calculation = models.BooleanField(
        default=False,
        help_text="Whether this service can calculate import duties"
    )
    is_active = models.BooleanField(default=False)
    test_mode = models.BooleanField(default=True)
    priority = models.IntegerField(
        default=1,
        help_text="Priority order (1 = highest priority)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "External Tax Service"
        verbose_name_plural = "External Tax Services"
        ordering = ['priority', 'name']
    
    def __str__(self):
        return f"{self.get_name_display()} ({'Active' if self.is_active else 'Inactive'})"
    
    def is_compatible_with_region(self, tax_region):
        """Check if this service is compatible with the given tax region"""
        if tax_region.country == 'CA':
            return self.supported_countries in ['CA', 'GLOBAL'] and self.supports_gst_hst
        elif tax_region.country == 'US':
            return self.supported_countries in ['US', 'GLOBAL']
        return self.supported_countries == 'GLOBAL'
    
    def calculate_tax(self, amount, tax_region, **kwargs):
        """Calculate tax using external service or fallback to manual calculation"""
        if not self.is_active or not self.is_compatible_with_region(tax_region):
            # Fallback to manual calculation using tax_region rates
            return tax_region.calculate_tax_breakdown(amount)
        
        try:
            if self.name == 'taxjar':
                return self._calculate_taxjar(amount, tax_region, **kwargs)
            elif self.name == 'avalara':
                return self._calculate_avalara(amount, tax_region, **kwargs)
            elif self.name == 'cra_gst':
                return self._calculate_cra_gst(amount, tax_region, **kwargs)
            elif self.name == 'canadian_tax_api':
                return self._calculate_canadian_tax_api(amount, tax_region, **kwargs)
            else:
                # Manual calculation fallback
                return tax_region.calculate_tax_breakdown(amount)
        except Exception as e:
            # Log error and fallback to manual calculation
            print(f"Tax calculation error for {self.name}: {e}")
            return tax_region.calculate_tax_breakdown(amount)
    
    def _calculate_canadian_tax_api(self, amount, tax_region, **kwargs):
        """Calculate Canadian taxes using the Canadian Sales Tax API"""
        try:
            from .canadian_tax_api import CanadianTaxAPIClient
            
            if not tax_region.province_state:
                return tax_region.calculate_tax_breakdown(amount)
            
            # Initialize API client with appropriate configuration
            api_client = CanadianTaxAPIClient(
                api_key=self.api_key,
                test_mode=self.test_mode,
                prefer_v3=bool(self.api_key)  # Use v3 if we have an API key
            )
            
            # Get province code
            province_code = tax_region.province_state
            
            # Calculate tax breakdown using the dedicated client
            breakdown = api_client.calculate_tax_breakdown(
                amount=amount,
                province_code=province_code,
                include_duties=tax_region.is_cross_border,
                duty_rate=tax_region.duty_rate
            )
            
            # Ensure breakdown has proper format for frontend compatibility
            if breakdown:
                # Convert Decimal values to ensure compatibility
                from decimal import Decimal
                
                # Standardize field names to match TaxCalculationResponseSerializer
                standardized_breakdown = {
                    'subtotal': breakdown.get('subtotal', amount).quantize(Decimal('0.01')),
                    'gst_amount': breakdown.get('gst_amount', Decimal('0.00')).quantize(Decimal('0.01')),
                    'pst_amount': breakdown.get('pst_amount', Decimal('0.00')).quantize(Decimal('0.01')),
                    'hst_amount': breakdown.get('hst_amount', Decimal('0.00')).quantize(Decimal('0.01')),
                    'duty_amount': breakdown.get('duty_amount', Decimal('0.00')).quantize(Decimal('0.01')),
                    'total_tax': breakdown.get('total_tax', Decimal('0.00')).quantize(Decimal('0.01')),
                    'total_with_tax': breakdown.get('total_with_tax', amount).quantize(Decimal('0.01')),
                    'tax_type': breakdown.get('tax_type', 'Unknown'),
                    'api_source': breakdown.get('api_source', 'Canadian Sales Tax API'),
                    'last_updated': breakdown.get('last_updated', ''),
                    'effective_date': breakdown.get('effective_date') or '',  # Convert None to empty string
                    'province': breakdown.get('province', province_code.upper()),
                    'tax_region': tax_region.name  # Add the missing tax_region field
                }
                
                return standardized_breakdown
            
            # Return None if API failed - will trigger fallback
            return None
                
        except Exception as e:
            print(f"Canadian Tax API error: {e}")
            # Return None to trigger fallback to static rates
            return None
    
    def _calculate_cra_gst(self, amount, tax_region, **kwargs):
        """Calculate GST/HST using Canada Revenue Agency rates"""
        # This could integrate with CRA's tax calculation tools
        # For now, use the built-in Canadian tax calculation
        return tax_region.calculate_tax_breakdown(amount)
    
    def _calculate_avalara(self, amount, tax_region, **kwargs):
        """Calculate tax using Avalara AvaTax (supports Canada)"""
        if not self.api_key:
            return tax_region.calculate_tax_breakdown(amount)
        
        # Avalara supports Canadian GST/HST calculation
        # This would make an API call to Avalara's Canadian tax endpoints
        # For implementation, you would use their AvaTax API
        
        try:
            # Placeholder for Avalara API integration
            # Real implementation would use avalara-python-sdk
            # and call their Canadian tax calculation endpoints
            
            # Example API structure (not actual implementation):
            # avalara_client = self._get_avalara_client()
            # tax_calculation = avalara_client.calculate_tax({
            #     'amount': amount,
            #     'country': tax_region.country,
            #     'province': tax_region.province_state,
            #     'cross_border': tax_region.is_cross_border,
            # })
            
            # For now, fallback to manual calculation
            return tax_region.calculate_tax_breakdown(amount)
            
        except Exception as e:
            print(f"Avalara API error: {e}")
            return tax_region.calculate_tax_breakdown(amount)
    
    def _calculate_taxjar(self, amount, tax_region, **kwargs):
        """Calculate tax using TaxJar (US only, doesn't support Canada)"""
        if tax_region.country != 'US':
            # TaxJar doesn't support Canadian taxes
            return tax_region.calculate_tax_breakdown(amount)
        
        # TaxJar implementation for US taxes only
        # This would make an API call to TaxJar
        return tax_region.calculate_tax_breakdown(amount)

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled')
    ]
    
    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_orders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-order_date']
    
    def __str__(self):
        return f"Order {self.order_id} - {self.supplier.name}"
    
    def save(self, *args, **kwargs):
        if not self.total_amount:
            self.total_amount = sum(item.total_price for item in self.items.all())
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    material = models.ForeignKey(Material, on_delete=models.PROTECT)
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.material.name} - {self.quantity} {self.material.unit}"
    
    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class SupplierAssessment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.CASCADE, 
        related_name='supplier_assessments'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    assessment_date = models.DateField()
    next_assessment_date = models.DateField(null=True, blank=True)
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_supplier_assessments'
    )
    
    class Meta:
        ordering = ['-assessment_date', '-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.supplier.name}"

class TransportMode(models.TextChoices):
    TRUCK = 'truck', _('Truck')
    TRAIN = 'train', _('Train')
    SHIP = 'ship', _('Ship')
    PLANE = 'plane', _('Plane')

class VehicleType(models.TextChoices):
    SMALL_TRUCK = 'small_truck', _('Small Truck (< 3.5 tons)')
    MEDIUM_TRUCK = 'medium_truck', _('Medium Truck (3.5-16 tons)')
    LARGE_TRUCK = 'large_truck', _('Large Truck (> 16 tons)')
    ELECTRIC_VEHICLE = 'electric_vehicle', _('Electric Vehicle')
    HYBRID_VEHICLE = 'hybrid_vehicle', _('Hybrid Vehicle')

class FuelType(models.TextChoices):
    DIESEL = 'diesel', _('Diesel')
    PETROL = 'petrol', _('Petrol')
    ELECTRIC = 'electric', _('Electric')
    HYBRID = 'hybrid', _('Hybrid')
    BIODIESEL = 'biodiesel', _('Biodiesel')
    CNG = 'cng', _('Compressed Natural Gas')

class TransportationEmission(models.Model):
    supplier = models.ForeignKey(
        'Supplier',
        on_delete=models.CASCADE,
        related_name='transportation_emissions'
    )
    distance = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Distance in kilometers')
    )
    volume = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Volume in cubic meters')
    )
    transport_mode = models.CharField(
        max_length=20,
        choices=TransportMode.choices,
        help_text=_('Mode of transportation')
    )
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        null=True,
        blank=True,
        help_text=_('Type of vehicle (required for road transport)')
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=FuelType.choices,
        null=True,
        blank=True,
        help_text=_('Type of fuel used')
    )
    load_factor = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text=_('Load factor (0-1) representing how full the vehicle is')
    )
    return_trip = models.BooleanField(
        default=False,
        help_text=_('Whether to include return trip emissions')
    )
    total_emissions = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Total emissions in kg CO2e')
    )
    emissions_per_km = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Emissions per kilometer')
    )
    emissions_per_volume = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Emissions per cubic meter')
    )
    transport_efficiency_score = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text=_('Transport efficiency score (0-100)')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Transportation Emission')
        verbose_name_plural = _('Transportation Emissions')

    def __str__(self):
        return f"{self.supplier.name} - {self.transport_mode} - {self.created_at.date()}"

class EmissionFactor(models.Model):
    transport_mode = models.CharField(
        max_length=20,
        choices=TransportMode.choices,
        help_text=_('Mode of transportation')
    )
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        null=True,
        blank=True,
        help_text=_('Type of vehicle (for road transport)')
    )
    fuel_type = models.CharField(
        max_length=20,
        choices=FuelType.choices,
        null=True,
        blank=True,
        help_text=_('Type of fuel used')
    )
    base_emission_factor = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Base emission factor in kg CO2e per km')
    )
    volume_factor = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Volume impact factor')
    )
    load_factor_impact = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text=_('Load factor impact on emissions')
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['transport_mode', 'vehicle_type', 'fuel_type']
        ordering = ['transport_mode', 'vehicle_type', 'fuel_type']
        verbose_name = _('Emission Factor')
        verbose_name_plural = _('Emission Factors')

    def __str__(self):
        return f"{self.transport_mode} - {self.vehicle_type or 'N/A'} - {self.fuel_type or 'N/A'}" 