# FastAPI Integration Documentation

## Table of Contents
1. [Project Structure](#project-structure)
2. [Core Components](#core-components)
3. [Engine Implementations](#engine-implementations)
4. [API Endpoints](#api-endpoints)
5. [Middleware](#middleware)
6. [Database Integration](#database-integration)
7. [Service Communication](#service-communication)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

## 1. Project Structure
```
backend/fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── logging.py
│   │   └── auth.py
│   ├── engines/
│   │   ├── __init__.py
│   │   ├── economic.py
│   │   ├── quality.py
│   │   ├── environmental.py
│   │   └── tradeoff.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── economic.py
│   │   ├── quality.py
│   │   ├── environmental.py
│   │   └── tradeoff.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── calculation_service.py
│   └── tests/
│       ├── __init__.py
│       ├── test_economic.py
│       ├── test_quality.py
│       ├── test_environmental.py
│       └── test_tradeoff.py
└── requirements.txt
```

## 2. Core Components

### Configuration (config.py)
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Fontaine SCOS"
    DJANGO_URL: str = "http://localhost:8000"
    
    # Calculation Parameters
    MAX_OPTIMIZATION_ITERATIONS: int = 1000
    DEFAULT_TOLERANCE: float = 0.0001
    
    # Caching
    CACHE_TTL: int = 3600  # 1 hour
    
    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
```

### Dependencies (dependencies.py)
```python
from fastapi import Header, HTTPException, Depends
from typing import Optional
from .services.calculation_service import CalculationService

async def verify_token(x_token: str = Header(...)):
    if not x_token:
        raise HTTPException(status_code=400, detail="X-Token header missing")
    # Add token verification logic
    return x_token

def get_calculation_service():
    return CalculationService()
```

### Main Application (main.py)
```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .middleware.logging import LoggingMiddleware
from .middleware.auth import AuthMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

# Include routers
from .engines.economic import router as economic_router
from .engines.quality import router as quality_router
from .engines.environmental import router as environmental_router
from .engines.tradeoff import router as tradeoff_router

app.include_router(
    economic_router,
    prefix=f"{settings.API_V1_STR}/economic",
    tags=["economic"]
)
app.include_router(
    quality_router,
    prefix=f"{settings.API_V1_STR}/quality",
    tags=["quality"]
)
app.include_router(
    environmental_router,
    prefix=f"{settings.API_V1_STR}/environmental",
    tags=["environmental"]
)
app.include_router(
    tradeoff_router,
    prefix=f"{settings.API_V1_STR}/tradeoff",
    tags=["tradeoff"]
)
```

## 3. Engine Implementations

### Economic Engine (engines/economic.py)
```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ..schemas.economic import (
    SupplierCostInput,
    EconomicScoreOutput,
    OptimizationResult
)
from ..services.calculation_service import CalculationService

router = APIRouter()

@router.post("/calculate-score", response_model=EconomicScoreOutput)
async def calculate_economic_score(
    data: SupplierCostInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.calculate_economic_score(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/optimize", response_model=OptimizationResult)
async def optimize_sourcing(
    data: List[SupplierCostInput],
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.optimize_sourcing(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Quality Engine (engines/quality.py)
```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..schemas.quality import QualityInput, QualityAssessment
from ..services.calculation_service import CalculationService

router = APIRouter()

@router.post("/assess", response_model=QualityAssessment)
async def assess_quality(
    data: QualityInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.assess_quality(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Environmental Engine (engines/environmental.py)
```python
from fastapi import APIRouter, Depends, HTTPException
from ..schemas.environmental import (
    EnvironmentalInput,
    EnvironmentalAssessment
)
from ..services.calculation_service import CalculationService

router = APIRouter()

@router.post("/assess-impact", response_model=EnvironmentalAssessment)
async def assess_environmental_impact(
    data: EnvironmentalInput,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.assess_environmental_impact(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Trade-off Engine (engines/tradeoff.py)
```python
from fastapi import APIRouter, Depends, HTTPException
from ..schemas.tradeoff import (
    TradeoffInput,
    TradeoffAnalysis,
    OptimizationPreferences
)
from ..services.calculation_service import CalculationService

router = APIRouter()

@router.post("/analyze", response_model=TradeoffAnalysis)
async def analyze_tradeoffs(
    data: TradeoffInput,
    preferences: OptimizationPreferences,
    calc_service: CalculationService = Depends(get_calculation_service)
):
    try:
        result = await calc_service.analyze_tradeoffs(data, preferences)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 4. Data Models (schemas)

### Economic Schemas (schemas/economic.py)
```python
from pydantic import BaseModel, Field
from typing import List, Dict

class SupplierCostInput(BaseModel):
    supplier_id: int
    material_cost: float = Field(..., gt=0)
    transportation_cost: float = Field(..., gt=0)
    tax_rate: float = Field(..., ge=0, le=1)
    capacity: float = Field(..., gt=0)

class EconomicScoreOutput(BaseModel):
    supplier_id: int
    score: float
    cost_breakdown: Dict[str, float]
    recommendations: List[str]

class OptimizationResult(BaseModel):
    optimal_allocation: Dict[int, float]
    total_cost: float
    savings_potential: float
```

### Quality Schemas (schemas/quality.py)
```python
from pydantic import BaseModel, Field
from typing import Dict, List

class QualityInput(BaseModel):
    material_id: int
    measurements: Dict[str, float]
    standards: Dict[str, float]

class QualityAssessment(BaseModel):
    material_id: int
    quality_score: float
    compliance_details: Dict[str, bool]
    recommendations: List[str]
```

## 5. Calculation Service

### Calculation Service (services/calculation_service.py)
```python
from typing import List, Dict
import numpy as np
from ..schemas.economic import SupplierCostInput, EconomicScoreOutput
from ..schemas.quality import QualityInput, QualityAssessment
from ..schemas.environmental import EnvironmentalInput, EnvironmentalAssessment
from ..schemas.tradeoff import TradeoffInput, TradeoffAnalysis

class CalculationService:
    async def calculate_economic_score(
        self,
        data: SupplierCostInput
    ) -> EconomicScoreOutput:
        total_cost = data.material_cost + data.transportation_cost
        tax_amount = total_cost * data.tax_rate
        
        # Calculate score (example logic)
        score = 100 * (1 - (total_cost / 10000))  # Normalize to 0-100
        
        return EconomicScoreOutput(
            supplier_id=data.supplier_id,
            score=max(0, min(100, score)),
            cost_breakdown={
                "material": data.material_cost,
                "transportation": data.transportation_cost,
                "tax": tax_amount
            },
            recommendations=self._generate_economic_recommendations(score)
        )

    async def assess_quality(
        self,
        data: QualityInput
    ) -> QualityAssessment:
        compliance = {}
        for metric, value in data.measurements.items():
            standard = data.standards.get(metric)
            if standard:
                compliance[metric] = value >= standard
                
        quality_score = sum(compliance.values()) / len(compliance) * 100
        
        return QualityAssessment(
            material_id=data.material_id,
            quality_score=quality_score,
            compliance_details=compliance,
            recommendations=self._generate_quality_recommendations(compliance)
        )

    def _generate_economic_recommendations(self, score: float) -> List[str]:
        recommendations = []
        if score < 60:
            recommendations.append("Consider negotiating better rates with suppliers")
        if score < 40:
            recommendations.append("Evaluate alternative transportation methods")
        return recommendations

    def _generate_quality_recommendations(
        self,
        compliance: Dict[str, bool]
    ) -> List[str]:
        recommendations = []
        for metric, compliant in compliance.items():
            if not compliant:
                recommendations.append(f"Improve {metric} to meet standards")
        return recommendations
```

## 6. Error Handling

### Custom Exceptions
```python
# exceptions.py
class CalculationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ValidationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

# Add to main.py
@app.exception_handler(CalculationError)
async def calculation_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": str(exc)},
    )

@app.exception_handler(ValidationError)
async def validation_error_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"message": str(exc)},
    )
```

## 7. Testing

### Example Test (tests/test_economic.py)
```python
import pytest
from httpx import AsyncClient
from ..main import app
from ..schemas.economic import SupplierCostInput

@pytest.mark.asyncio
async def test_calculate_economic_score():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/calculate-score",
            json={
                "supplier_id": 1,
                "material_cost": 1000,
                "transportation_cost": 200,
                "tax_rate": 0.1,
                "capacity": 1000
            }
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "cost_breakdown" in data
```

To run FastAPI:
```bash
uvicorn app.main:app --reload --port 8001
```

This implementation provides:
1. Clear API structure
2. Type-safe data validation
3. Comprehensive error handling
4. Service layer for calculations
5. Testing framework

Would you like me to:
1. Add more detailed implementation for specific engines?
2. Include additional middleware configurations?
3. Add more test cases?
4. Include deployment configurations?