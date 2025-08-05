import pytest
from ..engines.economic import EconomicEngine

@pytest.fixture
def economic_engine():
    return EconomicEngine()

@pytest.fixture
def sample_input():
    return {
        "production_cost": 10.0,
        "selling_price": 15.0,
        "volume": 1000,
        "overhead_costs": 5000,
        "labor_costs": 3000
    }

@pytest.mark.asyncio
async def test_economic_calculation(economic_engine, sample_input):
    result = await economic_engine.calculate(sample_input)

    assert result is not None
    assert "total_revenue" in result
    assert "total_costs" in result
    assert "profit_margin" in result
    
    # Check that total_costs matches expected calculation
    # labor_costs (3000) + overhead_costs (5000) = 8000 (not 18000)
    assert result["total_costs"] == 8000.0
    assert result["profit_margin"] > 0  # Should be positive since revenue > costs
    assert result["roi"] > 0             # Should be positive since revenue > costs

@pytest.mark.asyncio
async def test_economic_calculation_invalid_input(economic_engine):
    with pytest.raises(Exception):
        await economic_engine.calculate({}) 