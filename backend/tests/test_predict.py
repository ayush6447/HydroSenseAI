from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_yield_prediction():
    # Add auth token in real tests
    pass
