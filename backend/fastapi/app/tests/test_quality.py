import pytest
from ..engines.quality import QualityEngine

@pytest.fixture
def quality_engine():
    return QualityEngine()

@pytest.fixture
def sample_input():
    return {
        "defect_rate": 2.5,
        "customer_satisfaction": 85.0,
        "compliance_score": 90.0,
        "process_efficiency": 88.0
    }

@pytest.mark.asyncio
async def test_quality_calculation(quality_engine, sample_input):
    result = await quality_engine.calculate(sample_input)
    
    assert result is not None
    assert "quality_score" in result
    assert "risk_level" in result
    assert "improvement_areas" in result
    
    assert isinstance(result["quality_score"], float)
    assert isinstance(result["risk_level"], str)
    assert isinstance(result["improvement_areas"], list)
    
    # Quality score should be between 0 and 100
    assert 0 <= result["quality_score"] <= 100
    
    # Risk level should be one of the expected values
    assert result["risk_level"] in ["Low", "Medium", "High"]
    
    # Should have at least one improvement area
    assert len(result["improvement_areas"]) > 0

@pytest.mark.asyncio
async def test_quality_calculation_invalid_input(quality_engine):
    with pytest.raises(Exception):
        await quality_engine.calculate({}) 