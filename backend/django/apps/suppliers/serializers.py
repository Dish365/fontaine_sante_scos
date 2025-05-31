from rest_framework import serializers
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

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class SupplierMaterialSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    material_unit = serializers.CharField(source='material.unit', read_only=True)
    
    class Meta:
        model = SupplierMaterial
        fields = ['id', 'material', 'material_name', 'material_unit', 
                 'cost_per_unit', 'lead_time', 'is_active', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

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
    materials = SupplierMaterialSerializer(source='suppliermaterial_set', many=True, read_only=True)
    assessments = SupplierAssessmentSerializer(many=True, read_only=True)
    orders = OrderSerializer(many=True, read_only=True)
    total_orders = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone', 'address',
                 'materials', 'min_supply_capacity', 'max_supply_capacity',
                 'current_capacity', 'transportation_mode', 'transportation_details',
                 'environmental_certification', 'carbon_footprint', 'renewable_energy_usage',
                 'waste_management_policy', 'environmental_impact_report', 'sustainability_goals',
                 'assessments', 'orders', 'total_orders', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class SupplierCreateSerializer(serializers.ModelSerializer):
    materials_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone', 'address',
                 'min_supply_capacity', 'max_supply_capacity', 'current_capacity',
                 'transportation_mode', 'transportation_details', 'materials_data',
                 'environmental_certification', 'carbon_footprint', 'renewable_energy_usage',
                 'waste_management_policy', 'environmental_impact_report', 'sustainability_goals']
    
    def create(self, validated_data):
        materials_data = validated_data.pop('materials_data', [])
        supplier = Supplier.objects.create(**validated_data)
        
        for material_data in materials_data:
            material = Material.objects.get(id=material_data['material_id'])
            SupplierMaterial.objects.create(
                supplier=supplier,
                material=material,
                cost_per_unit=material_data['cost_per_unit'],
                lead_time=material_data.get('lead_time', 0)
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
        from ..services.transportation_service import TransportationService
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