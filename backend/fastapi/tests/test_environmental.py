import pytest
from httpx import AsyncClient
from ..main import app
from ..schemas.environmental import EnvironmentalInput
from ..exceptions import ValidationError, CalculationError

@pytest.mark.asyncio
async def test_assess_environmental_impact_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/environmental/assess-impact",
            json={
                "supplier_id": "SUP001",
                "energy_consumption": 5000,  # kWh
                "water_usage": 200,  # m3
                "waste_generated": 100,  # kg
                "carbon_emissions": 2000,  # kg CO2e
                "recycling_rate": 75,  # percentage
                "renewable_energy_usage": 30,  # percentage
                "environmental_certifications": ["ISO14001", "ISO50001"]
            }
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "environmental_score" in data
    assert "carbon_footprint" in data
    assert "sustainability_level" in data
    assert "impact_breakdown" in data
    assert "certification_status" in data
    assert "recommendations" in data
    assert "compliance_status" in data

@pytest.mark.asyncio
async def test_assess_environmental_impact_negative_values():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/environmental/assess-impact",
            json={
                "supplier_id": "SUP001",
                "energy_consumption": -5000,  # Negative value
                "water_usage": 200,
                "waste_generated": 100,
                "carbon_emissions": 2000,
                "recycling_rate": 75,
                "renewable_energy_usage": 30,
                "environmental_certifications": ["ISO14001"]
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "energy_consumption" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_environmental_impact_invalid_percentages():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/environmental/assess-impact",
            json={
                "supplier_id": "SUP001",
                "energy_consumption": 5000,
                "water_usage": 200,
                "waste_generated": 100,
                "carbon_emissions": 2000,
                "recycling_rate": 150,  # Invalid percentage
                "renewable_energy_usage": 30,
                "environmental_certifications": ["ISO14001"]
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "recycling_rate" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_environmental_impact_missing_data():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/environmental/assess-impact",
            json={
                "supplier_id": "SUP001",
                "energy_consumption": 5000,
                "water_usage": 200,
                # Missing waste_generated
                "carbon_emissions": 2000,
                "recycling_rate": 75,
                "renewable_energy_usage": 30,
                "environmental_certifications": ["ISO14001"]
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "waste_generated" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_environmental_impact_invalid_certifications():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/environmental/assess-impact",
            json={
                "supplier_id": "SUP001",
                "energy_consumption": 5000,
                "water_usage": 200,
                "waste_generated": 100,
                "carbon_emissions": 2000,
                "recycling_rate": 75,
                "renewable_energy_usage": 30,
                "environmental_certifications": ["INVALID_CERT"]  # Invalid certification
            }
        )
    
    assert response.status_code == 200  # Should still succeed but mark certification as invalid
    data = response.json()
    assert data["certification_status"]["ISO14001"] is False
    assert data["certification_status"]["ISO50001"] is False 