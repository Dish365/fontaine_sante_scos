"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import signal
import asyncio
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Get Django ASGI application first
django_asgi_app = get_asgi_application()

# Import services after Django is configured (sys.path is set in settings)
try:
    from apps.suppliers.services import BaseService
    
    async def cleanup_services():
        """Cleanup function for closing HTTP clients"""
        await BaseService.close_client()

    async def lifespan_handler():
        """Handle application lifespan events"""
        def signal_handler(signum, frame):
            loop = asyncio.get_event_loop()
            loop.create_task(cleanup_services())
        
        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

    # Initialize lifespan handler
    try:
        asyncio.create_task(lifespan_handler())
    except RuntimeError:
        # In case there's no running loop
        pass

except ImportError:
    # Services not available, continue without them
    pass

application = django_asgi_app
