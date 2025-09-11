#!/usr/bin/env python
"""
Simple script to test API data availability
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.suppliers.models import Supplier, Warehouse, Material

def test_data():
    print("=== Testing Database Data ===")
    
    # Test Suppliers
    suppliers = Supplier.objects.all()
    print(f"Suppliers count: {suppliers.count()}")
    for supplier in suppliers[:3]:  # Show first 3
        print(f"  - {supplier.name} ({supplier.city})")
    
    # Test Warehouses
    warehouses = Warehouse.objects.all()
    print(f"Warehouses count: {warehouses.count()}")
    for warehouse in warehouses[:3]:  # Show first 3
        print(f"  - {warehouse.name} (Capacity: {warehouse.storage_capacity})")
    
    # Test Materials
    materials = Material.objects.all()
    print(f"Materials count: {materials.count()}")
    for material in materials[:3]:  # Show first 3
        print(f"  - {material.name} ({material.unit})")
    
    print("\n=== Creating sample data if empty ===")
    
    # Create sample supplier if none exist
    if suppliers.count() == 0:
        supplier = Supplier.objects.create(
            name="Sample Supplier",
            contact_person="John Doe",
            email="john@example.com",
            phone="123-456-7890",
            street_name="123 Main St",
            city="Montreal",
            state_province="QC",
            country="Canada",
            country_code="CA"
        )
        print(f"Created sample supplier: {supplier.name}")
    
    # Create sample warehouse if none exist
    if warehouses.count() == 0:
        warehouse = Warehouse.objects.create(
            name="Sample Warehouse",
            code="SW001",
            warehouse_type="distribution",
            street_name="456 Storage Ave",
            city="Montreal",
            state_province="QC",
            country="Canada",
            country_code="CA",
            storage_capacity=1000.0,
            max_capacity_threshold=85.0,
            manager_name="Jane Smith",
            manager_email="jane@example.com",
            manager_phone="987-654-3210"
        )
        print(f"Created sample warehouse: {warehouse.name}")
    
    # Create sample material if none exist
    if materials.count() == 0:
        material = Material.objects.create(
            name="Sample Material",
            category="raw",
            unit="kg",
            description="Sample raw material for testing"
        )
        print(f"Created sample material: {material.name}")

if __name__ == "__main__":
    test_data()
