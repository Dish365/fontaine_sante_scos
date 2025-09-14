from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class SuppliersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.suppliers'
    verbose_name = 'Suppliers'
    
    def ready(self):
        """
        Called when the app is ready. This is where we can do initialization
        that requires Django to be fully loaded.
        """
        try:
            # Test that services can be imported
            from .services import BaseService, SupplierService, TransportationService
            logger.info("Services layer successfully connected to Django app")
        except ImportError as e:
            logger.error(f"Failed to import services: {e}")
            # Don't raise exception to allow Django to continue starting 