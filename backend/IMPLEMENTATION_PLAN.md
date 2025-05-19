# Fontaine Santé Backend Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for the Fontaine Santé backend system. The plan is divided into weekly sprints, with each sprint focusing on specific components and features.

## Week 1: Django Backend Foundation

### Day 1-2: Project Setup
1. Create Django project structure:
```bash
django-admin startproject django_backend
cd django_backend
python manage.py startapp users
python manage.py startapp suppliers
python manage.py startapp materials
python manage.py startapp assessments
```

2. Configure settings.py:
- Add installed apps
- Configure database settings
- Set up CORS middleware
- Configure REST framework settings

3. Set up requirements.txt:
```
Django==4.2.0
djangorestframework==3.14.0
django-cors-headers==4.3.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

### Day 3-4: Models Implementation
1. Create models in each app:
- users/models.py: User model
- suppliers/models.py: Supplier model
- materials/models.py: Material model
- assessments/models.py: Assessment model

2. Create migrations and apply them:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Day 5: API Setup
1. Create serializers for each model
2. Implement ViewSets
3. Configure URL routing
4. Set up authentication endpoints

## Week 2: FastAPI Microservices

### Day 1-2: Economic Service
1. Create FastAPI project structure:
```bash
mkdir fastapi_economic
cd fastapi_economic
```

2. Implement main.py:
- Set up FastAPI app
- Configure CORS
- Create Pydantic models
- Implement calculation endpoints

3. Create requirements.txt:
```
fastapi==0.100.0
uvicorn==0.23.2
pydantic==2.0.0
httpx==0.24.1
```

### Day 3-4: Quality Service
1. Create FastAPI project structure
2. Implement quality assessment logic
3. Create API endpoints
4. Add validation and error handling

### Day 5: Environmental Service
1. Create FastAPI project structure
2. Implement environmental impact calculations
3. Create API endpoints
4. Add validation and error handling

## Week 3: Service Integration

### Day 1-2: Service Client Implementation
1. Create service client in Django backend:
```python
# utils/service_client.py
class ServiceClient:
    def __init__(self):
        self.economic_client = httpx.AsyncClient()
        self.quality_client = httpx.AsyncClient()
        self.environmental_client = httpx.AsyncClient()
```

2. Implement communication methods
3. Add error handling
4. Create retry mechanisms

### Day 3-4: API Gateway
1. Configure Django URLs
2. Set up API routing
3. Implement request forwarding
4. Add response aggregation

### Day 5: Security & CORS
1. Configure CORS settings
2. Implement authentication
3. Add rate limiting
4. Set up request validation

## Week 4: Testing & Deployment

### Day 1-2: Testing
1. Write unit tests for Django models
2. Create API endpoint tests
3. Implement service integration tests
4. Add performance tests

### Day 3-4: Docker Configuration
1. Create Dockerfile for Django:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
```

2. Create Dockerfile for FastAPI services
3. Create docker-compose.yml
4. Configure environment variables

### Day 5: Deployment
1. Set up CI/CD pipeline
2. Configure production settings
3. Set up monitoring
4. Create deployment documentation

## Implementation Guidelines for AI Agents

### General Rules
1. Always include error handling
2. Add logging for important operations
3. Include input validation
4. Document all functions and classes
5. Follow PEP 8 style guide

### Code Structure
1. Use clear, descriptive names
2. Implement proper separation of concerns
3. Follow DRY principles
4. Include type hints
5. Add docstrings

### Testing Requirements
1. Write tests for all new features
2. Include edge cases
3. Test error conditions
4. Verify integration points

### Documentation
1. Update README.md
2. Document API endpoints
3. Include setup instructions
4. Add usage examples

## API Endpoints Specification

### Django Backend
```
GET    /api/suppliers/
POST   /api/suppliers/
GET    /api/suppliers/{id}/
PUT    /api/suppliers/{id}/
DELETE /api/suppliers/{id}/

GET    /api/materials/
POST   /api/materials/
GET    /api/materials/{id}/
PUT    /api/materials/{id}/
DELETE /api/materials/{id}/

GET    /api/assessments/
POST   /api/assessments/
GET    /api/assessments/{id}/
PUT    /api/assessments/{id}/
DELETE /api/assessments/{id}/
```

### FastAPI Services
```
POST   /economic/calculate
POST   /quality/assess
POST   /environmental/calculate
```

## Database Schema

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Suppliers
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Materials
```sql
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assessments
```sql
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    economic_score FLOAT,
    quality_score FLOAT,
    environmental_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/fontaine_sante

# FastAPI Services
ECONOMIC_SERVICE_URL=http://localhost:8001
QUALITY_SERVICE_URL=http://localhost:8002
ENVIRONMENTAL_SERVICE_URL=http://localhost:8003
```

## Success Criteria
1. All endpoints return correct responses
2. Services communicate effectively
3. Error handling works as expected
4. Tests pass successfully
5. Documentation is complete
6. Docker containers run without issues
7. Performance meets requirements
8. Security measures are in place 