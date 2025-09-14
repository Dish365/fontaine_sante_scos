import os
import sys
import pytest
from pathlib import Path

# Add the root directory to Python path
root_dir = str(Path(__file__).parent.parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def client():
    """Create a test client for FastAPI app"""
    return TestClient(app)

@pytest.fixture(scope="session")
def test_app():
    """Return the FastAPI app instance"""
    return app

@pytest.fixture(autouse=True)
def setup_test_env():
    """Setup test environment variables and configurations"""
    # Store original environment
    original_env = dict(os.environ)
    
    # Set test environment variables
    os.environ.update({
        "TESTING": "1",
        "FASTAPI_ENV": "test",
        "DJANGO_URL": "http://localhost:8000",
        "FASTAPI_URL": "http://localhost:8001"
    })
    
    yield
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env) 