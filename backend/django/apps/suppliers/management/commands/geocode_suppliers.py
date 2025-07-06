from django.core.management.base import BaseCommand
from django.db import transaction
from django.db import models
from apps.suppliers.models import Supplier, Warehouse
from apps.suppliers.openstreetmap_api import OpenStreetMapClient
import time

class Command(BaseCommand):
    help = 'Geocode supplier and warehouse addresses using OpenStreetMap API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--suppliers',
            action='store_true',
            help='Geocode supplier addresses',
        )
        parser.add_argument(
            '--warehouses',
            action='store_true',
            help='Geocode warehouse addresses',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Geocode all addresses (suppliers and warehouses)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-geocoding even if address is already validated',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=50,
            help='Maximum number of addresses to geocode (default: 50)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting address geocoding...'))
        
        # Initialize OpenStreetMap client
        osm_client = OpenStreetMapClient()
        
        geocoded_count = 0
        failed_count = 0
        
        # Process suppliers
        if options['suppliers'] or options['all']:
            self.stdout.write('Geocoding supplier addresses...')
            suppliers = self._get_suppliers_to_geocode(options['force'], options['limit'])
            
            for supplier in suppliers:
                try:
                    self.stdout.write(f'Processing supplier: {supplier.name}')
                    
                    if supplier.geocode_address():
                        supplier.save()
                        geocoded_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'✓ Geocoded {supplier.name}: {supplier.coordinates}')
                        )
                    else:
                        failed_count += 1
                        self.stdout.write(
                            self.style.ERROR(f'✗ Failed to geocode {supplier.name}')
                        )
                    
                    # Rate limiting - wait 1 second between requests
                    time.sleep(1)
                    
                except Exception as e:
                    failed_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'✗ Error geocoding {supplier.name}: {e}')
                    )
        
        # Process warehouses
        if options['warehouses'] or options['all']:
            self.stdout.write('Geocoding warehouse addresses...')
            warehouses = self._get_warehouses_to_geocode(options['force'], options['limit'])
            
            for warehouse in warehouses:
                try:
                    self.stdout.write(f'Processing warehouse: {warehouse.name}')
                    
                    if warehouse.geocode_address():
                        warehouse.save()
                        geocoded_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'✓ Geocoded {warehouse.name}: {warehouse.coordinates}')
                        )
                    else:
                        failed_count += 1
                        self.stdout.write(
                            self.style.ERROR(f'✗ Failed to geocode {warehouse.name}')
                        )
                    
                    # Rate limiting - wait 1 second between requests
                    time.sleep(1)
                    
                except Exception as e:
                    failed_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'✗ Error geocoding {warehouse.name}: {e}')
                    )
        
        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nGeocoding completed!\n'
                f'Successfully geocoded: {geocoded_count}\n'
                f'Failed: {failed_count}\n'
                f'Total processed: {geocoded_count + failed_count}'
            )
        )
        
        # Show some statistics
        self._show_statistics()

    def _get_suppliers_to_geocode(self, force=False, limit=50):
        """Get suppliers that need geocoding"""
        if force:
            # Re-geocode all suppliers
            suppliers = Supplier.objects.all()
        else:
            # Only geocode suppliers without valid coordinates or not validated
            suppliers = Supplier.objects.filter(
                models.Q(latitude__isnull=True) | 
                models.Q(longitude__isnull=True) | 
                models.Q(address_validated=False)
            )
        
        return suppliers[:limit]

    def _get_warehouses_to_geocode(self, force=False, limit=50):
        """Get warehouses that need geocoding"""
        if force:
            # Re-geocode all warehouses
            warehouses = Warehouse.objects.all()
        else:
            # Only geocode warehouses without valid coordinates or not validated
            warehouses = Warehouse.objects.filter(
                models.Q(latitude__isnull=True) | 
                models.Q(longitude__isnull=True) | 
                models.Q(address_validated=False)
            )
        
        return warehouses[:limit]

    def _show_statistics(self):
        """Show geocoding statistics"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write('GEOCODING STATISTICS')
        self.stdout.write('='*50)
        
        # Supplier statistics
        total_suppliers = Supplier.objects.count()
        geocoded_suppliers = Supplier.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            address_validated=True
        ).count()
        
        self.stdout.write(f'Suppliers:')
        self.stdout.write(f'  Total: {total_suppliers}')
        self.stdout.write(f'  Geocoded: {geocoded_suppliers}')
        self.stdout.write(f'  Pending: {total_suppliers - geocoded_suppliers}')
        
        # Warehouse statistics
        total_warehouses = Warehouse.objects.count()
        geocoded_warehouses = Warehouse.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            address_validated=True
        ).count()
        
        self.stdout.write(f'\nWarehouses:')
        self.stdout.write(f'  Total: {total_warehouses}')
        self.stdout.write(f'  Geocoded: {geocoded_warehouses}')
        self.stdout.write(f'  Pending: {total_warehouses - geocoded_warehouses}')
        
        # Show some sample geocoded locations
        self.stdout.write('\n' + '-'*30)
        self.stdout.write('SAMPLE GEOCODED LOCATIONS')
        self.stdout.write('-'*30)
        
        sample_suppliers = Supplier.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )[:5]
        
        for supplier in sample_suppliers:
            self.stdout.write(
                f'{supplier.name}: {supplier.coordinates} - {supplier.full_address}'
            )
        
        sample_warehouses = Warehouse.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )[:5]
        
        for warehouse in sample_warehouses:
            self.stdout.write(
                f'{warehouse.name}: {warehouse.coordinates} - {warehouse.full_address}'
            )

    def _test_osm_connection(self):
        """Test OpenStreetMap API connection"""
        self.stdout.write('Testing OpenStreetMap API connection...')
        
        osm_client = OpenStreetMapClient()
        
        try:
            # Test with a known address
            result = osm_client.geocode_address("1600 Amphitheatre Parkway, Mountain View, CA", "US")
            
            if result:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ OpenStreetMap API connection successful!'
                        f'\nTest result: {result["formatted_address"]}'
                        f'\nCoordinates: {result["latitude"]}, {result["longitude"]}'
                    )
                )
                return True
            else:
                self.stdout.write(
                    self.style.ERROR('✗ OpenStreetMap API test failed - no results')
                )
                return False
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ OpenStreetMap API connection failed: {e}')
            )
            return False 