from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200

def test_register():
    r = client.post("/api/auth/register", json={"email": "test@test.com", "password": "test123"})
    assert r.status_code == 200
