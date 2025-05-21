import pytest
from httpx import AsyncClient
from ..main import app
from ..schemas.quality import QualityInput
from ..exceptions import ValidationError, CalculationError

@pytest.mark.asyncio
async def test_assess_quality_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/quality/assess",
            json={
                "material_id": 1,
                "measurements": {
                    "tensile_strength": 500,
                    "hardness": 45,
                    "surface_finish": 0.8
                },
                "standards": {
                    "tensile_strength": 450,
                    "hardness": 40,
                    "surface_finish": 1.0
                },
                "supplier_id": "SUP001",
                "defect_rate": 2.5,
                "customer_satisfaction": 85,
                "compliance_score": 92,
                "process_efficiency": 88,
                "certification_status": ["ISO9001", "ISO14001"],
                "audit_history": [
                    {
                        "date": "2024-01-15",
                        "score": 90,
                        "findings": [
                            {
                                "severity": "minor",
                                "description": "Documentation update needed"
                            }
                        ]
                    }
                ]
            }
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "quality_score" in data
    assert "compliance_details" in data
    assert "recommendations" in data
    assert "overall_score" in data
    assert "risk_level" in data
    assert "improvement_areas" in data
    assert "certification_status" in data
    assert "audit_summary" in data

@pytest.mark.asyncio
async def test_assess_quality_invalid_defect_rate():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/quality/assess",
            json={
                "material_id": 1,
                "measurements": {
                    "tensile_strength": 500,
                    "hardness": 45
                },
                "standards": {
                    "tensile_strength": 450,
                    "hardness": 40
                },
                "supplier_id": "SUP001",
                "defect_rate": 105,  # Invalid defect rate
                "customer_satisfaction": 85,
                "compliance_score": 92,
                "process_efficiency": 88,
                "certification_status": ["ISO9001"],
                "audit_history": []
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "defect_rate" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_quality_invalid_scores():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/quality/assess",
            json={
                "material_id": 1,
                "measurements": {
                    "tensile_strength": 500,
                    "hardness": 45
                },
                "standards": {
                    "tensile_strength": 450,
                    "hardness": 40
                },
                "supplier_id": "SUP001",
                "defect_rate": 2.5,
                "customer_satisfaction": 105,  # Invalid satisfaction score
                "compliance_score": 92,
                "process_efficiency": 88,
                "certification_status": ["ISO9001"],
                "audit_history": []
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "customer_satisfaction" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_quality_missing_measurements():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/quality/assess",
            json={
                "material_id": 1,
                "measurements": {},  # Empty measurements
                "standards": {
                    "tensile_strength": 450,
                    "hardness": 40
                },
                "supplier_id": "SUP001",
                "defect_rate": 2.5,
                "customer_satisfaction": 85,
                "compliance_score": 92,
                "process_efficiency": 88,
                "certification_status": ["ISO9001"],
                "audit_history": []
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "measurements" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_quality_mismatched_standards():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/quality/assess",
            json={
                "material_id": 1,
                "measurements": {
                    "tensile_strength": 500,
                    "hardness": 45
                },
                "standards": {
                    "tensile_strength": 450
                    # Missing hardness standard
                },
                "supplier_id": "SUP001",
                "defect_rate": 2.5,
                "customer_satisfaction": 85,
                "compliance_score": 92,
                "process_efficiency": 88,
                "certification_status": ["ISO9001"],
                "audit_history": []
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "standards" in data["message"].lower()

@pytest.mark.asyncio
async def test_assess_quality_invalid_audit_history():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/quality/assess",
            json={
                "material_id": 1,
                "measurements": {
                    "tensile_strength": 500,
                    "hardness": 45
                },
                "standards": {
                    "tensile_strength": 450,
                    "hardness": 40
                },
                "supplier_id": "SUP001",
                "defect_rate": 2.5,
                "customer_satisfaction": 85,
                "compliance_score": 92,
                "process_efficiency": 88,
                "certification_status": ["ISO9001"],
                "audit_history": [
                    {
                        "date": "invalid-date",  # Invalid date format
                        "score": 90,
                        "findings": []
                    }
                ]
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "audit_history" in data["message"].lower() 