# This file is intentionally empty to mark the directory as a Python package 

import os

# Set the Django settings module based on the environment
DJANGO_ENV = os.environ.get('DJANGO_ENV', 'development')

if DJANGO_ENV == 'production':
    from .production import *
else:
    from .development import * 