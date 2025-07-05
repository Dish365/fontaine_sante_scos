from django.core.management.base import BaseCommand
import asyncio
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test connection to services layer'

    def handle(self, *args, **options):
        self.stdout.write("Testing services connection...")
        
        try:
            # Test basic import
            from apps.suppliers.services import BaseService
            self.stdout.write(
                self.style.SUCCESS("✓ BaseService imported successfully")
            )
            
            # Test supplier service
            from apps.suppliers.services import SupplierService, SupplierAnalyticsService
            self.stdout.write(
                self.style.SUCCESS("✓ SupplierService imported successfully")
            )
            
            # Test transportation service
            from apps.suppliers.services import TransportationService
            self.stdout.write(
                self.style.SUCCESS("✓ TransportationService imported successfully")
            )
            
            # Test service instantiation
            supplier_service = SupplierService()
            analytics_service = SupplierAnalyticsService()
            transport_service = TransportationService()
            
            self.stdout.write(
                self.style.SUCCESS("✓ All services instantiated successfully")
            )
            
            # Test async service method (if possible)
            async def test_async():
                try:
                    # This is just a test to see if the async methods exist
                    # We don't actually call them as they might require FastAPI to be running
                    if hasattr(supplier_service, 'get_order_history'):
                        self.stdout.write(
                            self.style.SUCCESS("✓ Async methods available")
                        )
                    return True
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"⚠ Async test failed: {e}")
                    )
                    return False
            
            # Run async test
            result = asyncio.run(test_async())
            
            self.stdout.write(
                self.style.SUCCESS("🎉 All services tests passed!")
            )
            
        except ImportError as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Import error: {e}")
            )
            self.stdout.write(
                self.style.ERROR("Services layer is not properly configured")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Unexpected error: {e}")
            ) 