from django.core.management.base import BaseCommand
from apps.suppliers.models import ExternalTaxService
from django.utils import timezone

class Command(BaseCommand):
    help = 'Set up Canadian Tax API service for live tax rate calculation'

    def add_arguments(self, parser):
        parser.add_argument(
            '--api-key',
            type=str,
            help='API key for Canadian Sales Tax API (salestaxapi.ca)',
        )
        parser.add_argument(
            '--test-mode',
            action='store_true',
            help='Enable test mode for the API service',
        )
        parser.add_argument(
            '--activate',
            action='store_true',
            help='Activate the service immediately',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up Canadian Tax API service...'))
        
        # Create or update Canadian Tax API service
        service, created = ExternalTaxService.objects.get_or_create(
            name='canadian_tax_api',
            defaults={
                'api_key': options.get('api_key', ''),
                'api_url': 'https://api.salestaxapi.ca/v3',
                'supported_countries': 'CA',
                'supports_cross_border': False,
                'supports_gst_hst': True,
                'supports_pst': True,
                'supports_duty_calculation': False,
                'is_active': options.get('activate', False),
                'test_mode': options.get('test_mode', True),
                'priority': 1,
            }
        )
        
        if not created:
            # Update existing service
            if options.get('api_key'):
                service.api_key = options['api_key']
            
            if options.get('test_mode') is not None:
                service.test_mode = options['test_mode']
            
            if options.get('activate'):
                service.is_active = True
            
            service.save()
            self.stdout.write(self.style.SUCCESS(f'Updated existing Canadian Tax API service'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created new Canadian Tax API service'))
        
        # Display service status
        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'Service Name: {service.get_name_display()}')
        self.stdout.write(f'API URL: {service.api_url}')
        self.stdout.write(f'Has API Key: {"Yes" if service.api_key else "No"}')
        self.stdout.write(f'Test Mode: {"Enabled" if service.test_mode else "Disabled"}')
        self.stdout.write(f'Status: {"Active" if service.is_active else "Inactive"}')
        self.stdout.write(f'Countries: {service.supported_countries}')
        self.stdout.write(f'GST/HST Support: {"Yes" if service.supports_gst_hst else "No"}')
        self.stdout.write(f'PST Support: {"Yes" if service.supports_pst else "No"}')
        self.stdout.write('='*50)
        
        if not service.api_key:
            self.stdout.write(
                self.style.WARNING(
                    '\nWARNING: No API key provided. The service will use the free v1 API with limited features.'
                )
            )
            self.stdout.write(
                'To use the full v3 API, run this command with --api-key YOUR_API_KEY'
            )
        
        if not service.is_active:
            self.stdout.write(
                self.style.WARNING(
                    '\nNOTE: Service is not active. Tax calculations will use static database rates.'
                )
            )
            self.stdout.write(
                'To activate the service, run this command with --activate'
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    '\n✅ Canadian Tax API service is active and ready to use!'
                )
            )
        
        # Test the API connection if service is active
        if service.is_active:
            self.stdout.write('\nTesting API connection...')
            try:
                from apps.suppliers.canadian_tax_api import CanadianTaxAPIClient
                
                api_client = CanadianTaxAPIClient(
                    api_key=service.api_key,
                    test_mode=service.test_mode,
                    prefer_v3=bool(service.api_key)
                )
                
                if api_client.validate_api_connection():
                    self.stdout.write(self.style.SUCCESS('✅ API connection successful!'))
                    
                    # Test with Ontario tax calculation
                    test_result = api_client.get_province_rates('ON')
                    if test_result:
                        self.stdout.write(
                            f'✅ Test calculation for Ontario: {test_result.get("type", "N/A")} - '
                            f'{test_result.get("applicable", 0)*100:.1f}% total rate'
                        )
                else:
                    self.stdout.write(self.style.ERROR('❌ API connection failed'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ API test failed: {e}'))
        
        self.stdout.write('\nSetup complete!') 