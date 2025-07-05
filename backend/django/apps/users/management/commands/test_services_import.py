import asyncio
import sys
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Test the services module import and configuration after the move'

    def handle(self, *args, **options):
        """Test the service configuration after moving from Django app to separate module"""
        self.stdout.write(self.style.HTTP_INFO('Testing services module import...'))
        
        # Test services directory configuration
        try:
            services_dir = settings.SERVICES_DIR
            self.stdout.write(
                self.style.SUCCESS(f'✓ Services directory configured: {services_dir}')
            )
        except AttributeError:
            self.stdout.write(
                self.style.ERROR('✗ SERVICES_DIR not configured in settings')
            )
            return

        # Add services directory to Python path
        if str(services_dir) not in sys.path:
            sys.path.insert(0, str(services_dir))
            self.stdout.write(
                self.style.SUCCESS('✓ Services directory added to Python path')
            )

        # Test service import
        try:
            from base import BaseService
            self.stdout.write(
                self.style.SUCCESS('✓ BaseService imported successfully from services module')
            )
        except ImportError as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Failed to import BaseService: {str(e)}')
            )
            return

        # Test service initialization
        try:
            service = BaseService()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Service initialized successfully')
            )
            self.stdout.write(f'  FastAPI URL: {service.fastapi_base_url}')
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Service initialization failed: {str(e)}')
            )
            return

        # Test other services can be imported
        service_modules = [
            'transportation_service',
            'supplier_service', 
            'user_service'
        ]
        
        for module_name in service_modules:
            try:
                __import__(module_name)
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {module_name} imported successfully')
                )
            except ImportError as e:
                self.stdout.write(
                    self.style.WARNING(f'⚠ {module_name} import failed: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS('\n✓ Services module configuration test completed!')
        ) 