from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Trade-off Calculator Service",
    description="FastAPI service for trade-off analysis and optimization",
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
    return {"message": "Trade-off Calculator Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 