from fastapi.testclient import TestClient
from main import app, users_db

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_login_success():
    response = client.post(
        "/api/auth/login",
        json={"username": "farmer", "password": "password"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post(
        "/api/auth/login",
        json={"username": "farmer", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_sensor_unauthorized():
    response = client.get("/api/sensor")
    assert response.status_code == 401

def test_get_sensor_authorized():
    # Login first
    login_resp = client.post(
        "/api/auth/login",
        json={"username": "farmer", "password": "password"}
    )
    token = login_resp.json()["access_token"]
    
    # Get sensor data
    response = client.get(
        "/api/sensor",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "ph" in response.json()

def test_orchestrate():
    login_resp = client.post(
        "/api/auth/login",
        json={"username": "farmer", "password": "password"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.post(
        "/api/orchestrate",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "orchestrator_output" in data
    assert "actuator_state" in data
    assert "insights" in data

