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
    headers={"X-Pulso-Profile":owner}
    if method in {'PATCH','DELETE'}:
        collection='documents' if path.startswith('/document/') else 'results'
        data=client.get('/demo/profiles/'+owner+'/data',headers=headers).json()
        item=next((r for r in data[collection] if r['id']==path.rsplit('/',1)[-1]),None)
        if item:headers['If-Match']=str(item.get('version',1))
    return client.request(method,"/demo/profiles/"+owner+path,json=body,headers=headers)

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

def test_pressure_id_conflict_equivalent_timezone_and_no_resurrection(client):
    body=dict(id='retry',systolic='128',diastolic='081',heartRate='',date='2026-11-08T10:00:00Z')
    assert request(client,'POST','/pressure',body).status_code==200
    assert request(client,'POST','/pressure',{**body,'diastolic':'81','date':'2026-11-08T11:00:00+01:00'}).status_code==200
    before=request(client,'GET','/data').json()
    for change in ({'systolic':'140'},{'heartRate':'70'},{'date':'2026-11-08T11:00:00Z'}):
        assert request(client,'POST','/pressure',{**body,**change}).status_code==409
        assert request(client,'GET','/data').json()==before
    assert request(client,'DELETE','/result/retry-systolic').status_code==200
    assert request(client,'POST','/pressure',body).status_code==409
    assert len(request(client,'GET','/data').json()['results'])==1

def test_optimistic_concurrency_atomic_conflict_and_parent_version(client):
    from concurrent.futures import ThreadPoolExecutor
    request(client,'POST','/confirm',document())
    url='/demo/profiles/demo-b/result/result-0'
    headers={'X-Pulso-Profile':'demo-b','If-Match':'"1"'}
    assert client.patch(url,json={'value':100},headers={'X-Pulso-Profile':'demo-b'}).status_code==428
    def edit(value):return client.patch(url,json={'value':value},headers=headers).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:codes=list(pool.map(edit,[101,102]))
    assert sorted(codes)==[200,409]
    data=request(client,'GET','/data').json();row=data['results'][0];doc=data['documents'][0]
    assert row['version']==2 and len(row['previousVersions'])==1 and doc['version']==2
    assert client.delete(url,headers=headers).status_code==409
    assert client.delete('/demo/profiles/demo-b/document/doc-0',headers=headers).status_code==409
    assert len(request(client,'GET','/data').json()['results'])==1
    assert client.patch(url,json={'value':103},headers={**headers,'If-Match':'"2"'}).status_code==200
    assert request(client,'GET','/data').json()['results'][0]['evidence']==document()['results'][0]['evidence']

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

def test_image_missing_metadata_and_provenance_roundtrip(client):
    from scripts.benchmark_extraction import image
    body=document();original=image(pdf(LINES));doc=body['document'];row=body['results'][0]
    doc.update(laboratory=None,issuedAt=None,sha256=hashlib.sha256(original).hexdigest())
    doc['original'].update(mediaType='image/png',fileName='synthetic.png',dataUrl='data:image/png;base64,'+base64.b64encode(original).decode())
    row.update(parameter='ferritin',value=44,unit='ng/mL',measuredAt=None,method=None,context=None,
        evidence={'page':1,'excerpt':'Ferritina | 44 | ng/mL','extractedValue':'44','extractedUnit':'ng/mL','extractionMethod':'ollama_vision','model':'qwen3-vl:4b','verification':'visual_unverified'})
    assert request(client,'POST','/confirm',body).status_code==200
    data=request(TestClient(app),'GET','/data').json()
    assert data['documents'][0]['original']==doc['original']
    assert data['results'][0]['measuredAt'] is None and data['results'][0]['evidence']==row['evidence']
    assert request(client,'GET','/preview/result-0').status_code==404
    assert request(client,'PATCH','/result/result-0',{'value':45}).status_code==200
    assert request(client,'GET','/data').json()['results'][0]['evidence']['extractedValue']=='44'
    assert request(client,'DELETE','/result/result-0').status_code==200
    assert len(request(TestClient(app),'GET','/data').json()['documents'])==1

def test_preview_recomputes_region_and_checks_scope(client):
    from services.api.app.hybrid import extract_document
    body=document();raw=base64.b64decode(body['document']['original']['dataUrl'].split(',')[1])
    c=extract_document(raw,'application/pdf')['candidates'][0]
    assert c['region'] is not None
    body['results'][0]['evidence'].update(page=c['page'],excerpt=c['excerpt'],verification=c['verification'],region={'x0':-999,'x1':999999})
    assert request(client,'POST','/confirm',body).status_code==200
    response=request(client,'GET','/preview/result-0')
    assert response.status_code==200 and response.content.startswith(b'\x89PNG')
    assert response.headers['cache-control']=='no-store'
    assert client.get('/demo/profiles/demo-b/preview/result-0',headers={'X-Pulso-Profile':'demo-a'}).status_code==403
    assert request(client,'GET','/preview/result-0',owner='demo-a').status_code==404

def test_pending_proposal_never_saved_by_confirm(client):
    body=document();body['results'][0]['status']='extracted_pending'
    assert request(client,'POST','/confirm',body).status_code==422
    assert request(client,'GET','/data').json()['results']==[]

def test_disk_persistence_is_readable_in_new_python_process(client):
    import os,subprocess,sys
    body=document();assert request(client,'POST','/confirm',body).status_code==200
    reopened=subprocess.run([sys.executable,'-c',"import json; from services.api.app import store; print(json.dumps(store.load('demo-b')))"],
        cwd=store.ROOT,env=os.environ.copy(),capture_output=True,text=True,timeout=15,check=True)
    data=json.loads(reopened.stdout)
    assert data['results'][0]['value']==99.2 and data['documents'][0]['sha256']==body['document']['sha256']

@pytest.mark.parametrize('encrypted',[False,True])
def test_manual_confirm_cannot_bypass_document_limits(client,encrypted):
    import pymupdf
    body=document()
    raw=pdf(LINES,pages=4)
    if encrypted:
        with pymupdf.open(stream=pdf(LINES),filetype='pdf') as source:
            raw=source.tobytes(encryption=pymupdf.PDF_ENCRYPT_AES_256,user_pw='test',owner_pw='test')
    doc=body['document'];doc['sha256']=hashlib.sha256(raw).hexdigest()
    doc['original']['dataUrl']='data:application/pdf;base64,'+base64.b64encode(raw).decode()
    assert request(client,'POST','/confirm',body).status_code==422
    assert request(client,'GET','/data').json()['documents']==[]
