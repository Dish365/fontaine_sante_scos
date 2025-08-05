# app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import orders, suppliers
from .engines import economic
import os

app = FastAPI(
    title="Fontaine Santé SCOS Economic Service",
    description="Economic analysis service for supplier cost optimization",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(economic.router)
app.include_router(orders.router)
app.include_router(suppliers.router)

@app.get("/")
async def root():
    return {"message": "Fontaine Santé SCOS Economic Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": str(exc.detail),
            "status_code": exc.status_code
        }
    )