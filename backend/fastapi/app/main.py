# app/main.py

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .middleware.logging import LoggingMiddleware
from .middleware.auth import AuthMiddleware
from .exceptions import CalculationError, ValidationError, ConfigurationError, ServiceError
from .engines import economic, quality, environmental, tradeoff

app = FastAPI(
    title="Supply Chain Optimization API",
    description="API for supply chain optimization and analysis",
    version="1.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

# Include routers
app.include_router(economic.router, prefix="/api/v1/economic", tags=["Economic"])
app.include_router(quality.router, prefix="/api/v1/quality", tags=["Quality"])
app.include_router(environmental.router, prefix="/api/v1/environmental", tags=["Environmental"])
app.include_router(tradeoff.router, prefix="/api/v1/tradeoff", tags=["Tradeoff"])

# Exception handlers
@app.exception_handler(CalculationError)
async def calculation_error_handler(request: Request, exc: CalculationError):
    return JSONResponse(
        status_code=400,
        content={
            "error": "Calculation Error",
            "message": str(exc),
            "detail": "An error occurred during the calculation process"
        }
    )

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": str(exc),
            "detail": "The provided data failed validation"
        }
    )

@app.exception_handler(ConfigurationError)
async def configuration_error_handler(request: Request, exc: ConfigurationError):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Configuration Error",
            "message": str(exc),
            "detail": "An error occurred in the application configuration"
        }
    )

@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Service Error",
            "message": str(exc),
            "detail": "An error occurred in the service layer"
        }
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}