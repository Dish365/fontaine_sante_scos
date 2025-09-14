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
    assert isinstance(result["balanced_score"], float)  # Should be float not dict
    assert isinstance(result["recommendations"], list)
    assert isinstance(result["risk_assessment"], str)
    
    # Test specific metrics
    assert result["overall_score"] > 70
    assert "balanced_score" in result
    assert len(result["recommendations"]) > 0

@pytest.mark.asyncio
async def test_tradeoff_calculation_invalid_input(tradeoff_engine):
    with pytest.raises(Exception):
        await tradeoff_engine.calculate({}) 