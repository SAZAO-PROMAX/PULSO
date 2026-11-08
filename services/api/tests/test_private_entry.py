from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.tests.test_accounts import register,login
from services.api.app.test_mode import synthetic_test_mode
import pytest

@pytest.mark.parametrize('path',['/demo/profiles/demo-a/data','/demo/profiles/demo-b/data','/demo/sample.pdf','/demo/extraction/status','/demo/extractions/missing'])
def test_no_public_health_endpoints(monkeypatch,path):
    monkeypatch.delenv('PULSO_TEST_MODE',raising=False)
    with TestClient(app) as client:
        assert client.get(path,headers={'X-Pulso-Profile':'demo-a'}).status_code==401
        assert client.post('/demo/extract',content=b'fake').status_code==401
        assert client.post('/demo/profiles/demo-a/reset',json={'confirm':'demo-a'},headers={'X-Pulso-Profile':'demo-a'}).status_code==401
        register(client);user,headers=login(client)
        assert client.get('/demo/profiles/'+user['id']+'/data').json()=={'schemaVersion':1,'documents':[],'results':[]}
        assert client.get('/demo/profiles/demo-a/data',headers=headers).status_code==403
        assert client.post('/demo/profiles/demo-a/reset',json={'confirm':'demo-a'},headers=headers).status_code==403

def test_demo_flag_refuses_normal_database_and_reset_needs_confirmation(monkeypatch):
    monkeypatch.setenv('PULSO_DB_PATH','.local/pulso.sqlite3');assert not synthetic_test_mode()
    # No request or write to the normal database.

def test_scoped_demo_reset_preserves_accounts():
    with TestClient(app) as client:
        register(client);user,headers=login(client);owner=user['id'];base='/demo/profiles/'+owner
        assert client.post(base+'/pressure',headers=headers,json={'id':'own','systolic':'120','diastolic':'80','date':'2026-11-08T12:00:00Z'}).status_code==200
        before=client.get(base+'/data').json()
        for confirm in [None,{'confirm':'demo-b'}]:
            assert client.post('/demo/profiles/demo-a/reset',headers={'X-Pulso-Profile':'demo-a'},json=confirm).status_code==422
        assert client.post('/demo/profiles/demo-a/reset',headers={'X-Pulso-Profile':'demo-a'},json={'confirm':'demo-a'}).status_code==200
        assert client.get(base+'/data').json()==before
