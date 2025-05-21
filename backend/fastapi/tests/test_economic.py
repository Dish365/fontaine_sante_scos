import pytest
from httpx import AsyncClient
from ..main import app
from ..schemas.economic import SupplierCostInput
from ..exceptions import ValidationError, CalculationError

@pytest.mark.asyncio
async def test_calculate_economic_score_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/calculate-score",
            json={
                "supplier_id": 1,
                "material_cost": 1000,
                "transportation_cost": 200,
                "labor_cost": 300,
                "overhead_cost": 150,
                "tax_rate": 0.1,
                "capacity": 1000,
                "volume": 800,
                "lead_time": 5
            }
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "cost_breakdown" in data
    assert "recommendations" in data
    assert "total_cost" in data
    assert "cost_per_unit" in data
    assert "roi" in data

@pytest.mark.asyncio
async def test_calculate_economic_score_validation_error():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/calculate-score",
            json={
                "supplier_id": 1,
                "material_cost": 1000,
                "transportation_cost": 200,
                "labor_cost": 300,
                "overhead_cost": 150,
                "tax_rate": 0.1,
                "capacity": 0,  # Invalid capacity
                "volume": 800,
                "lead_time": 5
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "Volume must be greater than zero" in data["message"]

@pytest.mark.asyncio
async def test_optimize_sourcing_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/optimize",
            json=[
                {
                    "supplier_id": 1,
                    "material_cost": 1000,
                    "transportation_cost": 200,
                    "labor_cost": 300,
                    "overhead_cost": 150,
                    "tax_rate": 0.1,
                    "capacity": 1000,
                    "volume": 800,
                    "lead_time": 5
                },
                {
                    "supplier_id": 2,
                    "material_cost": 900,
                    "transportation_cost": 250,
                    "labor_cost": 280,
                    "overhead_cost": 140,
                    "tax_rate": 0.1,
                    "capacity": 1200,
                    "volume": 1000,
                    "lead_time": 4
                }
            ]
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "optimal_allocation" in data
    assert "total_cost" in data
    assert "savings_potential" in data
    assert "optimal_suppliers" in data
    assert "optimization_details" in data

@pytest.mark.asyncio
async def test_optimize_sourcing_empty_input():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/optimize",
            json=[]
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "No supplier data provided" in data["message"]

@pytest.mark.asyncio
async def test_optimize_sourcing_invalid_data():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/optimize",
            json=[
                {
                    "supplier_id": 1,
                    "material_cost": 1000,
                    "transportation_cost": 200,
                    "labor_cost": 300,
                    "overhead_cost": 150,
                    "tax_rate": 0.1,
                    "capacity": 0,  # Invalid capacity
                    "volume": 800,
                    "lead_time": 5
                }
            ]
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "Invalid capacity" in data["message"]

@pytest.mark.asyncio
async def test_calculate_economic_score_invalid_tax_rate():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/calculate-score",
            json={
                "supplier_id": 1,
                "material_cost": 1000,
                "transportation_cost": 200,
                "labor_cost": 300,
                "overhead_cost": 150,
                "tax_rate": 1.5,  # Invalid tax rate
                "capacity": 1000,
                "volume": 800,
                "lead_time": 5
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "tax_rate" in data["message"].lower()

@pytest.mark.asyncio
async def test_calculate_economic_score_negative_costs():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/economic/calculate-score",
            json={
                "supplier_id": 1,
                "material_cost": -1000,  # Negative cost
                "transportation_cost": 200,
                "labor_cost": 300,
                "overhead_cost": 150,
                "tax_rate": 0.1,
                "capacity": 1000,
                "volume": 800,
                "lead_time": 5
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "material_cost" in data["message"].lower() 