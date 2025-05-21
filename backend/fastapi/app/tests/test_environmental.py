import pytest
from ..engines.environmental import EnvironmentalEngine

@pytest.fixture
def environmental_engine():
    return EnvironmentalEngine()

@pytest.fixture
def sample_input():
    return {
        "energy_consumption": 5000.0,  # kWh
        "water_usage": 1000.0,        # cubic meters
        "waste_generated": 50.0,      # tons
        "carbon_emissions": 2000.0    # tons CO2e
    }

@pytest.mark.asyncio
async def test_environmental_calculation(environmental_engine, sample_input):
    result = await environmental_engine.calculate(sample_input)
    
    assert result is not None
    assert "environmental_score" in result
    assert "carbon_footprint" in result
    assert "sustainability_level" in result
    assert "recommendations" in result
    
    assert isinstance(result["environmental_score"], float)
    assert isinstance(result["carbon_footprint"], float)
    assert isinstance(result["sustainability_level"], str)
    assert isinstance(result["recommendations"], list)
    
    # Environmental score should be between 0 and 100
    assert 0 <= result["environmental_score"] <= 100
    
    # Carbon footprint should be positive
    assert result["carbon_footprint"] > 0
    
    # Sustainability level should be one of the expected values
    assert result["sustainability_level"] in ["Low", "Medium", "High"]
    
    # Should have at least one recommendation
    assert len(result["recommendations"]) > 0

@pytest.mark.asyncio
async def test_environmental_calculation_invalid_input(environmental_engine):
    with pytest.raises(Exception):
        await environmental_engine.calculate({}) 