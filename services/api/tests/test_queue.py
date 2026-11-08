import asyncio
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app import extraction_jobs
from services.api.tests.test_pdf import pdf

def test_queue_bounded_deduplicated_fifo_cancel_scope_and_expiry(monkeypatch):
    async def scenario():
        monkeypatch.setattr(extraction_jobs,'processing_slot',asyncio.Semaphore(1))
        gate=asyncio.Event();seen=[];active=0;peak=0
        async def process(payload,mime):
            nonlocal active,peak
            active+=1;peak=max(peak,active);seen.append(payload)
            await gate.wait();active-=1;return {'synthetic':True}
        q=extraction_jobs.ExtractionQueue(process,capacity=3)
        first=q.submit('demo-a',b'first','application/pdf');await asyncio.sleep(0)
        assert q.submit('demo-a',b'first','application/pdf')['id']==first['id']
        second=q.submit('demo-a',b'second','application/pdf');third=q.submit('demo-b',b'third','application/pdf')
        with pytest.raises(HTTPException) as full:q.submit('demo-a',b'fourth','application/pdf')
        assert full.value.status_code==429
        with pytest.raises(HTTPException) as scope:q.get('demo-b',first['id'])
        assert scope.value.status_code==404
        assert q.cancel('demo-a',second['id'])['state']=='cancelled'
        gate.set();await q.task
        assert seen==[b'first',b'third'] and peak==1
        assert q.get('demo-a',first['id'])['state']=='ready'
        assert all(not j['payload'] for j in q.jobs.values())
        q.retention=-1;q.cleanup();assert not q.jobs
        q2=extraction_jobs.ExtractionQueue(process,wait_seconds=-1)
        ticket=q2.submit('demo-a',b'expired','application/pdf');assert q2.get('demo-a',ticket['id'])['state']=='error';await q2.task
        assert b'expired' not in seen
    asyncio.run(scenario())

def test_jobs_http_validation_polling_and_no_persistence(tmp_path,monkeypatch):
    from services.api.app import main
    from services.api.app.hybrid import extract_document
    monkeypatch.setenv('PULSO_DB_PATH',str(tmp_path/'queue.sqlite3'));monkeypatch.setenv('LLM_EXTRACTION_ENABLED','false')
    async def process(raw,mime):return await asyncio.to_thread(extract_document,raw,mime)
    queue=extraction_jobs.ExtractionQueue(process)
    monkeypatch.setattr(main,'queue',queue)
    headers={'X-Pulso-Profile':'demo-b','X-Pulso-Demo':'synthetic-only','Content-Type':'application/pdf'}
    raw=pdf()
    with TestClient(app) as client:
        assert client.post('/demo/extractions',content=b'not pdf',headers=headers).status_code==422
        response=client.post('/demo/extractions',content=raw,headers=headers);assert response.status_code==202
        ticket=response.json()
        import time
        for _ in range(100):
            response=client.get('/demo/extractions/'+ticket['id'],headers=headers)
            if response.json()['state'] in {'ready','error'}:break
            time.sleep(.01)
        assert response.json()['state']=='ready' and response.json()['result']['candidates']
        assert client.get('/demo/extractions/'+ticket['id'],headers={'X-Pulso-Profile':'demo-a'}).status_code==404
        assert client.post('/demo/extractions',content=raw,headers=headers).json()['id']==ticket['id']
        state=client.get('/demo/profiles/demo-b/data',headers=headers).json()
        assert state['results']==[] and state['documents']==[]
