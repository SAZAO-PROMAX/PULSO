import base64
import hashlib
import json
import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app import store
from services.api.tests.test_pdf import pdf
from scripts.create_sample_pdf import LINES

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setenv("PULSO_DB_PATH",str(tmp_path/"pulso.sqlite3"))
    return TestClient(app)

def request(client,method,path,body=None,owner="demo-b"):
    return client.request(method,"/demo/profiles/"+owner+path,json=body,headers={"X-Pulso-Profile":owner})

def document(i=0,date="2026-11-07",value="99,2",owner="demo-b",unit="mg/dL",lab="A"):
    lines=[*LINES[:5],f"Glicose | {value} | {unit} | referencia ficticia | hexoquinase | plasma"]
    lines[1]="Laboratorio: Laboratorio Demo "+lab
    lines[2]="Data: "+date
    raw=pdf(lines)
    doc=dict(id=f"doc-{i}",ownerId=owner,synthetic=True,title="PDF fictício",laboratory="Laboratorio Demo "+lab,
        issuedAt=date+"T12:00:00Z",importedAt="2026-11-07T13:00:00Z",sha256=hashlib.sha256(raw).hexdigest(),
        original=dict(fileName="test.pdf",mediaType="application/pdf",text="\n".join(lines),dataUrl="data:application/pdf;base64,"+base64.b64encode(raw).decode()))
    row=dict(id=f"result-{i}",ownerId=owner,synthetic=True,parameter="glucose",value=float(value.replace(",",".")),unit=unit,
        measuredAt=date+"T12:00:00Z",datePrecision="day",documentId=doc["id"],method="hexoquinase",context="plasma",
        referenceText="referencia ficticia",status="user_confirmed",evidence=dict(page=1,excerpt=lines[-1],extractedValue="98,5",extractedUnit=unit))
    return {"document":doc,"results":[row]}

def test_confirm_reopen_original_idempotency_and_scope(client):
    body=document()
    assert request(client,"POST","/confirm",body).status_code==200
    data=request(TestClient(app),"GET","/data").json()
    assert len(data["results"])==1 and data["results"][0]["value"]==99.2
    assert data["documents"][0]["original"]==body["document"]["original"]
    assert request(client,"POST","/confirm",body).status_code==200
    assert len(request(client,"GET","/data").json()["results"])==1
    duplicate=json.loads(json.dumps(body));duplicate["document"]["id"]="duplicate";duplicate["results"][0].update(id="duplicate",documentId="duplicate")
    assert request(client,"POST","/confirm",duplicate).status_code==409
    assert client.get("/demo/profiles/demo-b/data",headers={"X-Pulso-Profile":"demo-a"}).status_code==403
    assert not any(r["id"]=="result-0" for r in request(client,"GET","/data",owner="demo-a").json()["results"])

def test_migration_is_atomic_and_not_replayed_after_deletion(client):
    body=document()
    snapshot={"schemaVersion":1,"documents":[body["document"]],"results":body["results"]}
    assert request(client,"POST","/migrate",snapshot).status_code==200
    assert request(client,"DELETE","/result/result-0").status_code==200
    assert request(client,"POST","/migrate",snapshot).status_code==200
    assert request(client,"GET","/data").json()["results"]==[]
    bad=json.loads(json.dumps(snapshot));bad["results"][0]["ownerId"]="demo-a"
    assert request(client,"POST","/migrate",bad).status_code==422

def test_pressure_validation_and_recovery(client):
    row=dict(id="session",systolic="128",diastolic="81",heartRate="",date="2026-11-07T09:30:00Z")
    assert request(client,"POST","/pressure",row).status_code==200
    assert request(client,"POST","/pressure",row).status_code==200
    data=request(TestClient(app),"GET","/data").json()
    assert len(data["results"])==2 and not data["documents"]
    assert all(r["source"]=="manual" for r in data["results"])
    assert request(client,"POST","/pressure",{**row,"id":"bad","date":"2026-02-30T09:30:00Z"}).status_code==422
    assert len(request(client,"GET","/data").json()["results"])==2

def test_edit_and_delete_are_transactional_and_keep_original_evidence(client):
    body=document()
    request(client,"POST","/confirm",body)
    assert request(client,"PATCH","/result/result-0",{"value":101.3}).status_code==200
    updated=request(client,"GET","/data").json()["results"][0]
    assert updated["value"]==101.3 and updated["evidence"]==body["results"][0]["evidence"]
    assert updated["previousVersions"][0]["fields"]["value"]==99.2
    assert request(client,"PATCH","/result/result-0",{"ownerId":"demo-a"}).status_code==422
    assert request(client,"PATCH","/result/result-0",{"measuredAt":"no-date"}).status_code==422
    assert request(client,"GET","/data").json()["results"][0]["value"]==101.3
    assert request(client,"PATCH","/document/doc-0",{"title":"Corrigido","laboratory":"Demo corrigido"}).status_code==200
    assert request(client,"DELETE","/document/doc-0").status_code==200
    assert request(TestClient(app),"GET","/data").json()=={"schemaVersion":1,"documents":[],"results":[]}

def test_five_dates_different_labs_unordered_same_day_new_measurement(client):
    dates=["2026-01-01","2026-02-02","2026-03-03","2026-04-04","2026-05-05"]
    for i in [2,0,4,1,3]:
        assert request(client,"POST","/confirm",document(i,dates[i],str(90+i),lab=chr(65+i%3))).status_code==200
    assert len(request(client,"GET","/data").json()["results"])==5
    assert request(client,"POST","/confirm",document(5,dates[4],"98",lab="B")).status_code==200
    assert request(client,"POST","/confirm",document(6,"2026-06-06","5,4",unit="mmol/L")).status_code==200
    data=request(TestClient(app),"GET","/data").json()
    assert len(data["results"])==7
    assert sum(r["unit"]=="mg/dL" for r in data["results"])==6
    assert sum(r["measuredAt"].startswith("2026-05-05") for r in data["results"])==2
    assert request(client,"DELETE","/result/result-2").status_code==200
    assert len(request(TestClient(app),"GET","/data").json()["results"])==6

def test_failure_rolls_back_whole_document(client):
    body=document()
    body["results"].append({**body["results"][0],"id":"bad","documentId":"absent"})
    assert request(client,"POST","/confirm",body).status_code==422
    assert request(client,"GET","/data").json()["documents"]==[]
    assert request(client,"GET","/data").json()["results"]==[]
