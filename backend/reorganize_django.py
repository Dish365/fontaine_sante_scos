#!/usr/bin/env python3
import os
import shutil
import sys
from pathlib import Path

def create_directory(path):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)
    print(f"Created directory: {path}")

def move_file(src, dst):
    """Move file from src to dst."""
    if os.path.exists(src):
        shutil.move(src, dst)
        print(f"Moved: {src} -> {dst}")
    else:
        print(f"Warning: Source file not found: {src}")

def copy_file(src, dst):
    """Copy file from src to dst."""
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied: {src} -> {dst}")
    else:
        print(f"Warning: Source file not found: {src}")

def main():
    # Define base paths
    base_dir = Path(__file__).parent
    django_dir = base_dir / "django"
    django_backend_dir = base_dir / "django_backend"
    
    # Create new directory structure
    new_structure = {
        "apps": ["users", "suppliers", "core", "assessments"],
        "config": ["settings"],
        "requirements": []
    }
    
    # Create new directory structure
    for dir_name, subdirs in new_structure.items():
        dir_path = django_dir / dir_name
        create_directory(dir_path)
        for subdir in subdirs:
            create_directory(dir_path / subdir)
    
    # Move Django apps to apps directory
    for app in new_structure["apps"]:
        src = django_dir / app
        dst = django_dir / "apps" / app
        if src.exists():
            move_file(src, dst)
    
    # Move config files
    config_src = django_backend_dir / "config"
    config_dst = django_dir / "config"
    if config_src.exists():
        for item in config_src.iterdir():
            if item.is_file():
                copy_file(item, config_dst / item.name)
            else:
                shutil.copytree(item, config_dst / item.name, dirs_exist_ok=True)
    
    # Move Dockerfile
    dockerfile_src = django_backend_dir / "Dockerfile"
    dockerfile_dst = django_dir / "Dockerfile"
    if dockerfile_src.exists():
        copy_file(dockerfile_src, dockerfile_dst)
    
    # Create requirements directory and split requirements
    requirements_src = django_dir / "requirements.txt"
    if requirements_src.exists():
        # Create base requirements
        with open(requirements_src, 'r') as f:
            base_requirements = f.read()
        
        # Write base requirements
        base_req_path = django_dir / "requirements" / "base.txt"
        with open(base_req_path, 'w') as f:
            f.write(base_requirements)
        
        # Create development requirements
        dev_req_path = django_dir / "requirements" / "development.txt"
        with open(dev_req_path, 'w') as f:
            f.write("-r base.txt\n")
            f.write("pytest==7.4.0\n")
            f.write("pytest-django==4.5.2\n")
            f.write("black==23.7.0\n")
            f.write("flake8==6.1.0\n")
        
        # Create production requirements
        prod_req_path = django_dir / "requirements" / "production.txt"
        with open(prod_req_path, 'w') as f:
            f.write("-r base.txt\n")
            f.write("gunicorn==21.2.0\n")
            f.write("whitenoise==6.5.0\n")
    
    # Create docker-compose.yml if it doesn't exist
    docker_compose_path = django_dir / "docker-compose.yml"
    if not docker_compose_path.exists():
        docker_compose_content = """version: '3.8'

services:
  web:
    build: .
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=0
      - DJANGO_SETTINGS_MODULE=config.settings.production
    depends_on:
      - db

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=fontaine_sante
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

volumes:
  postgres_data:
"""
        with open(docker_compose_path, 'w') as f:
            f.write(docker_compose_content)
    
    # Create settings files if they don't exist
    settings_dir = django_dir / "config" / "settings"
    if not (settings_dir / "base.py").exists():
        base_settings = """from pathlib import Path
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.users',
    'apps.suppliers',
    'apps.core',
    'apps.assessments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
"""
        with open(settings_dir / "base.py", 'w') as f:
            f.write(base_settings)
    
    if not (settings_dir / "development.py").exists():
        dev_settings = """from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
"""
        with open(settings_dir / "development.py", 'w') as f:
            f.write(dev_settings)
    
    if not (settings_dir / "production.py").exists():
        prod_settings = """from .base import *

DEBUG = False

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'fontaine_sante'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.getenv('POSTGRES_HOST', 'db'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
"""
        with open(settings_dir / "production.py", 'w') as f:
            f.write(prod_settings)
    
    # Create README.md if it doesn't exist
    readme_path = django_dir / "README.md"
    if not readme_path.exists():
        readme_content = """# Fontaine Santé Django Backend

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

2. Install dependencies:
```bash
pip install -r requirements/development.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create superuser:
```bash
python manage.py createsuperuser
```

5. Run development server:
```bash
python manage.py runserver
```

## Docker Setup

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

## Project Structure

```
django/
├── apps/                  # Django applications
│   ├── users/            # User management
│   ├── suppliers/        # Supplier management
│   ├── core/            # Core functionality
│   └── assessments/     # Assessment management
├── config/              # Project configuration
│   ├── settings/       # Settings files
│   ├── urls.py        # URL configuration
│   └── wsgi.py        # WSGI configuration
├── requirements/       # Requirements files
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── manage.py         # Django management script
```
"""
        with open(readme_path, 'w') as f:
            f.write(readme_content)
    
    print("\nReorganization complete!")
    print("\nNext steps:")
    print("1. Review the new structure")
    print("2. Update any import paths in your code")
    print("3. Test the application")
    print("4. Remove the old django_backend directory if everything works")

if __name__ == "__main__":
    main() 