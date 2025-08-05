#!/usr/bin/env python3
"""
Setup script to create default warehouses for development
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.suppliers.models import Warehouse

def setup_warehouses():
    """Create default warehouses if none exist"""
    
    User = get_user_model()
    
    # Create a default user if none exists
    if not User.objects.exists():
        print("Creating default superuser...")
        user = User.objects.create_superuser(
            email='admin@fontaine-sante.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print(f"Created user: {user.email}")
    else:
        user = User.objects.first()
        print(f"Using existing user: {user.email}")
    
    # Check if warehouses exist
    existing_count = Warehouse.objects.count()
    print(f"Existing warehouses: {existing_count}")
    
    if existing_count == 0:
        print("Creating default warehouses...")
        
        warehouses = [
            {
                'name': 'Montreal Distribution Center',
                'code': 'MTL001',
                'city': 'Montreal',
                'state_province': 'Quebec',
                'postal_code': 'H3A 1A1',
                'country': 'Canada',
                'warehouse_type': 'distribution',
                'is_primary': True,
                'is_active': True,
                'storage_capacity': 50000.00,
                'current_utilization': 65.0,
                'operates_24_7': True,
                'cold_storage_available': True,
                'hazmat_certified': True,
                'manager_name': 'Jean Dupont',
                'manager_email': 'jean.dupont@fontaine-sante.com',
                'manager_phone': '+1-514-555-0001',
            },
            {
                'name': 'Quebec City Warehouse',
                'code': 'QBC001',
                'city': 'Quebec City',
                'state_province': 'Quebec',
                'postal_code': 'G1K 3X1',
                'country': 'Canada',
                'warehouse_type': 'storage',
                'is_primary': False,
                'is_active': True,
                'storage_capacity': 30000.00,
                'current_utilization': 45.0,
                'operates_24_7': False,
                'cold_storage_available': True,
                'hazmat_certified': False,
                'manager_name': 'Marie Tremblay',
                'manager_email': 'marie.tremblay@fontaine-sante.com',
                'manager_phone': '+1-418-555-0002',
            },
            {
                'name': 'Toronto Regional Hub',
                'code': 'TOR001',
                'city': 'Toronto',
                'state_province': 'Ontario',
                'postal_code': 'M5V 3A1',
                'country': 'Canada',
                'warehouse_type': 'hub',
                'is_primary': False,
                'is_active': True,
                'storage_capacity': 75000.00,
                'current_utilization': 80.0,
                'operates_24_7': True,
                'cold_storage_available': True,
                'hazmat_certified': True,
                'manager_name': 'David Smith',
                'manager_email': 'david.smith@fontaine-sante.com',
                'manager_phone': '+1-416-555-0003',
            }
        ]
        
        created_warehouses = []
        for warehouse_data in warehouses:
            warehouse = Warehouse.objects.create(
                created_by=user,
                **warehouse_data
            )
            created_warehouses.append(warehouse)
            print(f"Created warehouse: {warehouse.name} ({warehouse.code})")
            
            # Try to geocode the warehouse
            try:
                if warehouse.geocode_address():
                    warehouse.save()
                    print(f"  -> Geocoded: {warehouse.coordinates}")
                else:
                    print(f"  -> Geocoding failed")
            except Exception as e:
                print(f"  -> Geocoding error: {e}")
        
        print(f"\n✅ Created {len(created_warehouses)} warehouses")
        
    else:
        print("Warehouses already exist, skipping creation")
    
    # Print summary
    total_warehouses = Warehouse.objects.count()
    active_warehouses = Warehouse.objects.filter(is_active=True).count()
    primary_warehouses = Warehouse.objects.filter(is_primary=True).count()
    
    print(f"\n📊 Warehouse Summary:")
    print(f"  Total: {total_warehouses}")
    print(f"  Active: {active_warehouses}")
    print(f"  Primary: {primary_warehouses}")
    
    return total_warehouses

if __name__ == "__main__":
    print("Setting up warehouses for Fontaine Santé SCOS...")
    print("=" * 50)
    
    try:
        count = setup_warehouses()
        print(f"\n🎉 Setup complete! {count} warehouses available.")
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1) 