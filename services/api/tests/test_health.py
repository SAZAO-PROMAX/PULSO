from fastapi.testclient import TestClient
from services.api.app.main import app

client = TestClient(app)

def test_health_has_only_operational_demo_metadata():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "mode": "synthetic-demo"}

def test_no_clinical_or_upload_routes():
    assert client.get("/profiles").status_code == 404
    assert client.post("/uploads").status_code == 404

def test_openapi_documents_health_response():
    schema = client.get("/openapi.json").json()
    assert "/health" in schema["paths"]
    assert schema["components"]["schemas"]["HealthResponse"]["properties"]["mode"]["const"] == "synthetic-demo"
