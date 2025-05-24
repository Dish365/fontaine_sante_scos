import pytest
from httpx import AsyncClient
from ..main import app
from ..schemas.tradeoff import TradeoffInput, OptimizationPreferences
from ..exceptions import ValidationError, CalculationError

@pytest.mark.asyncio
async def test_analyze_tradeoffs_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tradeoff/analyze",
            json={
                "supplier_id": "SUP001",
                "economic_score": 85,
                "quality_score": 90,
                "environmental_score": 75,
                "historical_performance": {
                    "delivery_reliability": 95,
                    "quality_consistency": 88,
                    "cost_stability": 82
                },
                "risk_factors": {
                    "financial_stability": "low",
                    "geopolitical_risk": "medium",
                    "supply_chain_complexity": "low"
                },
                "preferences": {
                    "economic_weight": 0.4,
                    "quality_weight": 0.4,
                    "environmental_weight": 0.2,
                    "risk_tolerance": "medium",
                    "optimization_goals": ["cost_reduction", "quality_improvement"]
                }
            }
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert "balanced_score" in data
    assert "risk_assessment" in data
    assert "tradeoff_matrix" in data
    assert "recommendations" in data
    assert "optimization_suggestions" in data

@pytest.mark.asyncio
async def test_analyze_tradeoffs_invalid_scores():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tradeoff/analyze",
            json={
                "supplier_id": "SUP001",
                "economic_score": 150,  # Invalid score
                "quality_score": 90,
                "environmental_score": 75,
                "historical_performance": {
                    "delivery_reliability": 95,
                    "quality_consistency": 88,
                    "cost_stability": 82
                },
                "risk_factors": {
                    "financial_stability": "low",
                    "geopolitical_risk": "medium",
                    "supply_chain_complexity": "low"
                },
                "preferences": {
                    "economic_weight": 0.4,
                    "quality_weight": 0.4,
                    "environmental_weight": 0.2,
                    "risk_tolerance": "medium",
                    "optimization_goals": ["cost_reduction"]
                }
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "economic_score" in data["message"].lower()

@pytest.mark.asyncio
async def test_analyze_tradeoffs_invalid_weights():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tradeoff/analyze",
            json={
                "supplier_id": "SUP001",
                "economic_score": 85,
                "quality_score": 90,
                "environmental_score": 75,
                "historical_performance": {
                    "delivery_reliability": 95,
                    "quality_consistency": 88,
                    "cost_stability": 82
                },
                "risk_factors": {
                    "financial_stability": "low",
                    "geopolitical_risk": "medium",
                    "supply_chain_complexity": "low"
                },
                "preferences": {
                    "economic_weight": 0.5,
                    "quality_weight": 0.5,
                    "environmental_weight": 0.2,  # Weights sum > 1
                    "risk_tolerance": "medium",
                    "optimization_goals": ["cost_reduction"]
                }
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "weights" in data["message"].lower()

@pytest.mark.asyncio
async def test_analyze_tradeoffs_invalid_risk_level():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tradeoff/analyze",
            json={
                "supplier_id": "SUP001",
                "economic_score": 85,
                "quality_score": 90,
                "environmental_score": 75,
                "historical_performance": {
                    "delivery_reliability": 95,
                    "quality_consistency": 88,
                    "cost_stability": 82
                },
                "risk_factors": {
                    "financial_stability": "invalid_level",  # Invalid risk level
                    "geopolitical_risk": "medium",
                    "supply_chain_complexity": "low"
                },
                "preferences": {
                    "economic_weight": 0.4,
                    "quality_weight": 0.4,
                    "environmental_weight": 0.2,
                    "risk_tolerance": "medium",
                    "optimization_goals": ["cost_reduction"]
                }
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "risk_factors" in data["message"].lower()

@pytest.mark.asyncio
async def test_analyze_tradeoffs_missing_historical_data():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tradeoff/analyze",
            json={
                "supplier_id": "SUP001",
                "economic_score": 85,
                "quality_score": 90,
                "environmental_score": 75,
                "historical_performance": {
                    "delivery_reliability": 95
                    # Missing quality_consistency and cost_stability
                },
                "risk_factors": {
                    "financial_stability": "low",
                    "geopolitical_risk": "medium",
                    "supply_chain_complexity": "low"
                },
                "preferences": {
                    "economic_weight": 0.4,
                    "quality_weight": 0.4,
                    "environmental_weight": 0.2,
                    "risk_tolerance": "medium",
                    "optimization_goals": ["cost_reduction"]
                }
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "historical_performance" in data["message"].lower()

@pytest.mark.asyncio
async def test_analyze_tradeoffs_invalid_optimization_goals():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/tradeoff/analyze",
            json={
                "supplier_id": "SUP001",
                "economic_score": 85,
                "quality_score": 90,
                "environmental_score": 75,
                "historical_performance": {
                    "delivery_reliability": 95,
                    "quality_consistency": 88,
                    "cost_stability": 82
                },
                "risk_factors": {
                    "financial_stability": "low",
                    "geopolitical_risk": "medium",
                    "supply_chain_complexity": "low"
                },
                "preferences": {
                    "economic_weight": 0.4,
                    "quality_weight": 0.4,
                    "environmental_weight": 0.2,
                    "risk_tolerance": "medium",
                    "optimization_goals": ["invalid_goal"]  # Invalid optimization goal
                }
            }
        )
    
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Validation Error"
    assert "optimization_goals" in data["message"].lower() 