import pytest
from ..engines.tradeoff import TradeoffEngine

@pytest.fixture
def tradeoff_engine():
    return TradeoffEngine()

@pytest.fixture
def sample_input():
    return {
        "economic_weight": 0.4,
        "quality_weight": 0.3,
        "environmental_weight": 0.3,
        "economic_score": 75.0,
        "quality_score": 85.0,
        "environmental_score": 90.0
    }

@pytest.mark.asyncio
async def test_tradeoff_calculation(tradeoff_engine, sample_input):
    result = await tradeoff_engine.calculate(sample_input)
    
    assert result is not None
    assert "overall_score" in result
    assert "balanced_score" in result
    assert "recommendations" in result
    assert "risk_assessment" in result
    
    assert isinstance(result["overall_score"], float)
    assert isinstance(result["balanced_score"], dict)
    assert isinstance(result["recommendations"], list)
    assert isinstance(result["risk_assessment"], str)
    
    # Overall score should be between 0 and 100
    assert 0 <= result["overall_score"] <= 100
    
    # Balanced score should contain all three dimensions
    assert "economic" in result["balanced_score"]
    assert "quality" in result["balanced_score"]
    assert "environmental" in result["balanced_score"]
    
    # Weights should sum to 1
    weights_sum = (
        sample_input["economic_weight"] +
        sample_input["quality_weight"] +
        sample_input["environmental_weight"]
    )
    assert abs(weights_sum - 1.0) < 0.0001
    
    # Should have at least one recommendation
    assert len(result["recommendations"]) > 0
    
    # Risk assessment should be one of the expected values
    assert result["risk_assessment"] in ["Low", "Medium", "High"]

@pytest.mark.asyncio
async def test_tradeoff_calculation_invalid_input(tradeoff_engine):
    with pytest.raises(Exception):
        await tradeoff_engine.calculate({}) 