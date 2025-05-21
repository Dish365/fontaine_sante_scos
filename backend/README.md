# Fontaine Santé SCOS Backend

This is the backend implementation for the Fontaine Santé Supply Chain Optimization System (SCOS). The system consists of a Django-based main API gateway and several FastAPI microservices for specialized calculations.

## Architecture

The backend is structured as follows:

- **Django Backend**: Main API gateway handling authentication, request routing, and data persistence
- **FastAPI Services**:
  - Economic Calculator Service
  - Environmental Calculator Service
  - Quality Calculator Service
  - Trade-off Calculator Service

## Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- Rust (for building certain Python packages)

## Setup

1. Install Rust:
   ```bash
   # Windows
   # Download and run rustup-init.exe from https://rustup.rs

   # Unix/macOS
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Unix/macOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements/development.txt
   ```

4. Set up environment variables:
   ```bash
   # Create .env file in django_backend directory
   DJANGO_SECRET_KEY=your-secret-key
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

5. Initialize the database:
   ```bash
   cd django_backend
   python manage.py migrate
   ```

## Running the Services

Using Docker Compose:
```bash
docker-compose up
```

Or manually:

1. Django Backend:
   ```bash
   cd django_backend
   python manage.py runserver
   ```

2. FastAPI Services:
   ```bash
   # In separate terminals
   cd fastapi_economic
   uvicorn main:app --reload --port 8001

   cd fastapi_environmental
   uvicorn main:app --reload --port 8002

   cd fastapi_quality
   uvicorn main:app --reload --port 8003

   cd fastapi_tradeoff
   uvicorn main:app --reload --port 8004
   ```

## API Documentation

- Django API: http://localhost:8000/api/schema/swagger-ui/
- Economic Service: http://localhost:8001/docs
- Environmental Service: http://localhost:8002/docs
- Quality Service: http://localhost:8003/docs
- Trade-off Service: http://localhost:8004/docs

## Development

1. Code Style:
   ```bash
   # Format code
   black .
   isort .

   # Check style
   flake8
   ```

2. Running Tests:
   ```bash
   pytest
   ```

## Directory Structure

```
backend/
├── django_backend/          # Main Django API Gateway
│   ├── config/             # Project configuration
│   ├── apps/              
│   │   ├── economic/      # Economic data handling
│   │   ├── environmental/ # Environmental impact handling
│   │   ├── quality/       # Quality assessment handling
│   │   ├── tradeoff/      # Trade-off analysis handling
│   │   └── core/          # Shared functionality
│   ├── authentication/     # Authentication service
│   └── api/               # API gateway implementation
├── fastapi_economic/       # Economic Calculator Service
├── fastapi_environmental/  # Environmental Calculator Service
├── fastapi_quality/        # Quality Calculator Service
└── fastapi_tradeoff/      # Trade-off Calculator Service
``` 