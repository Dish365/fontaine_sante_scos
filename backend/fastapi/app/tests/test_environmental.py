import os
import sys
import pytest
from pathlib import Path

# Add the root directory to Python path
root_dir = str(Path(__file__).parent.parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.engines.environmental import EnvironmentalEngine
from app.exceptions import ValidationError, CalculationError

@pytest.fixture
def env_engine():
    return EnvironmentalEngine()

@pytest.fixture
def sample_env_data():
    return {
        'energy_consumption': 1000,  # kWh
        'water_usage': 50,          # m³
        'waste_generated': 25,      # kg
        'carbon_emissions': 80,     # kg CO2e
        'recycling_rate': 75,       # %
        'renewable_energy_usage': 60,  # %
        'environmental_certifications': ['ISO14001', 'ISO50001']
    }

@pytest.mark.asyncio
async def test_calculate_basic_metrics(env_engine, sample_env_data):
    """Test basic environmental metrics calculation"""
    result = await env_engine.calculate(sample_env_data)
    
    assert result is not None
    assert 'environmental_score' in result
    assert 'carbon_footprint' in result
    assert 'sustainability_level' in result
    assert 'impact_breakdown' in result
    assert 'recommendations' in result
    
    # Check score is within valid range
    assert 0 <= result['environmental_score'] <= 100
    
    # Check sustainability level is valid
    assert result['sustainability_level'] in ['Low', 'Medium', 'High']
    
    # Check impact breakdown structure
    assert all(key in result['impact_breakdown'] for key in ['energy', 'water', 'waste', 'emissions'])

@pytest.mark.asyncio
async def test_calculate_carbon_footprint(env_engine, sample_env_data):
    """Test carbon footprint calculation"""
    result = await env_engine.calculate(sample_env_data)
    
    # Carbon footprint calculation:
    # (energy_consumption * 0.5 + water_usage * 0.298 + waste_generated * 2.53 + carbon_emissions) / 1000
    expected_footprint = (1000 * 0.5 + 50 * 0.298 + 25 * 2.53 + 80) / 1000
    assert abs(result['carbon_footprint'] - expected_footprint) < 0.01

@pytest.mark.asyncio
async def test_calculate_sustainability_score(env_engine, sample_env_data):
    """Test sustainability score calculation"""
    result = await env_engine.calculate(sample_env_data)
    
    # Score should be higher with good metrics
    assert result['environmental_score'] > 60
    
    # Test with poor metrics
    poor_data = sample_env_data.copy()
    poor_data.update({
        'energy_consumption': 2000,
        'water_usage': 150,
        'waste_generated': 100,
        'carbon_emissions': 200,
        'recycling_rate': 20,
        'renewable_energy_usage': 10
    })
    poor_result = await env_engine.calculate(poor_data)
    assert poor_result['environmental_score'] < result['environmental_score']

@pytest.mark.asyncio
async def test_impact_breakdown_calculation(env_engine, sample_env_data):
    """Test impact breakdown calculations"""
    result = await env_engine.calculate(sample_env_data)
    breakdown = result['impact_breakdown']
    
    # Check energy metrics
    assert 0 <= breakdown['energy']['impact_score'] <= 1
    assert breakdown['energy']['renewable_percentage'] == sample_env_data['renewable_energy_usage']
    
    # Check water metrics
    assert 0 <= breakdown['water']['impact_score'] <= 1
    
    # Check waste metrics
    assert 0 <= breakdown['waste']['impact_score'] <= 1
    assert breakdown['waste']['recycling_rate'] == sample_env_data['recycling_rate']
    
    # Check emissions metrics
    assert 0 <= breakdown['emissions']['impact_score'] <= 1

@pytest.mark.asyncio
async def test_recommendations_generation(env_engine, sample_env_data):
    """Test environmental recommendations generation"""
    result = await env_engine.calculate(sample_env_data)
    
    assert isinstance(result['recommendations'], list)
    assert len(result['recommendations']) > 0
    
    # Test recommendations for poor metrics
    poor_data = sample_env_data.copy()
    poor_data.update({
        'energy_consumption': 2000,
        'water_usage': 150,
        'recycling_rate': 20
    })
    poor_result = await env_engine.calculate(poor_data)
    
    # Should have more recommendations for poor performance
    assert len(poor_result['recommendations']) >= len(result['recommendations'])
    assert any('energy' in rec.lower() for rec in poor_result['recommendations'])
    assert any('water' in rec.lower() for rec in poor_result['recommendations'])

@pytest.mark.asyncio
async def test_input_validation(env_engine):
    """Test input validation"""
    with pytest.raises(Exception):
        await env_engine.calculate({})  # Empty data should raise exception
    
    with pytest.raises(Exception, match="Missing required fields"):
        await env_engine.calculate({"energy_consumption": 100})  # Missing required fields
    
    with pytest.raises(Exception):
        await env_engine.calculate({
            'energy_consumption': -100,  # Invalid negative value
            'water_usage': 50,
            'waste_generated': 25
        })
    
    with pytest.raises(Exception):
        await env_engine.calculate({
            'energy_consumption': 1000,
            'water_usage': 50,
            'recycling_rate': 150  # Invalid percentage
        })

@pytest.mark.asyncio
async def test_edge_cases(env_engine):
    """Test edge cases"""
    # Test with zero values
    zero_data = {
        'energy_consumption': 0,
        'water_usage': 0,
        'waste_generated': 0,
        'carbon_emissions': 0,
        'recycling_rate': 0,
        'renewable_energy_usage': 0,
        'environmental_certifications': []
    }
    result = await env_engine.calculate(zero_data)
    assert result['carbon_footprint'] == 0
    assert result['environmental_score'] >= 0
    
    # Test with maximum values
    max_data = {
        'energy_consumption': 10000,
        'water_usage': 1000,
        'waste_generated': 500,
        'carbon_emissions': 1000,
        'recycling_rate': 100,
        'renewable_energy_usage': 100,
        'environmental_certifications': ['ISO14001', 'ISO50001', 'LEED']
    }
    result = await env_engine.calculate(max_data)
    assert result['environmental_score'] <= 100

@pytest.mark.asyncio
async def test_certification_impact(env_engine, sample_env_data):
    """Test impact of environmental certifications"""
    # Test without certifications
    no_cert_data = sample_env_data.copy()
    no_cert_data['environmental_certifications'] = []
    no_cert_result = await env_engine.calculate(no_cert_data)
    
    # Test with certifications
    cert_data = sample_env_data.copy()
    cert_data['environmental_certifications'] = ['ISO14001', 'ISO50001', 'LEED']
    cert_result = await env_engine.calculate(cert_data)
    
    # More certifications should positively impact the score
    assert cert_result['environmental_score'] >= no_cert_result['environmental_score'] 