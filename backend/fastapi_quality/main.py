from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Quality Calculator Service",
    description="FastAPI service for quality assessment calculations and analysis",
    version="1.0.0",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configured via environment variables in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Quality Calculator Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 