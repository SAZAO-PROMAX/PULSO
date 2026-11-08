import copy
import pytest
from services.api.tests.test_accounts import client,register,login,ORIGIN
from services.api.tests.test_store import document
from fastapi.testclient import TestClient
from services.api.app.main import app

def event(owner,id='evt-one'):
    return dict(id=id,ownerId=owner,synthetic=True,type='fall',title='Acontecimento inteiramente fictício',startsAt='2026-05-08T10:00:00Z',endsAt=None,description='Descrição fictícia.',institution='',documentIds=[],verification='user_declared')

def test_events_crud_versions_isolation_and_no_causality(client):
    register(client);user,h=login(client);owner=user['id'];base='/demo/profiles/'+owner;body=event(owner)
    assert client.post(base+'/events',json=body,headers=ORIGIN).status_code==403
    assert client.post(base+'/events',json=body,headers=h).status_code==200
    assert client.post(base+'/events',json=body,headers=h).status_code==409
    saved=client.get(base+'/data').json()['events'][0];assert saved['source']=='user_declared' and saved['version']==1
    assert client.patch(base+'/events/evt-one',json={'title':'Correção fictícia'},headers=h).status_code==428
    assert client.patch(base+'/events/evt-one',json={'title':'Correção fictícia'},headers={**h,'If-Match':'1'}).status_code==200
    assert client.patch(base+'/events/evt-one',json={'title':'Versão antiga'},headers={**h,'If-Match':'1'}).status_code==409
    updated=client.get(base+'/data').json()['events'][0];assert updated['previousVersions'][0]['fields']['title']==body['title'] and updated['version']==2
    second=TestClient(app);register(second,'other@example.test');_,h2=login(second,'other@example.test')
    assert second.get(base+'/data',headers={'X-Pulso-Profile':owner}).status_code==403
    assert second.patch(base+'/events/evt-one',json={'title':'Outro'},headers={**h2,'If-Match':'2'}).status_code==403
    assert second.delete(base+'/events/evt-one',headers={**h2,'If-Match':'2'}).status_code==403
    assert client.delete(base+'/events/evt-one',headers={**h,'If-Match':'1'}).status_code==409
    assert client.delete(base+'/events/evt-one',headers={**h,'If-Match':'2'}).status_code==200
    assert client.get(base+'/data').json()['events']==[]

@pytest.mark.parametrize('patch',[{'startsAt':'2026-02-30T10:00:00Z'},{'endsAt':'2026-05-07T10:00:00Z'},{'verification':'professional_verified'},{'verification':{}},{'type':[]},{'documentIds':['other-owner-doc']},{'synthetic':False},{'title':''},{'verification':'documented'}])
def test_reject_invalid_events_atomically(client,patch):
    register(client);user,h=login(client);base='/demo/profiles/'+user['id']
    before=client.get(base+'/data').json()
    assert client.post(base+'/events',json={**event(user['id']),**patch},headers=h).status_code==422
    assert client.get(base+'/data').json()==before

def test_event_document_links_removed_atomically_and_history_preserved(client):
    owner='demo-a';h={'X-Pulso-Profile':owner};base='/demo/profiles/'+owner
    # Seeded synthetic documents are enough to test references, without copying an original.
    data=client.get(base+'/data',headers=h).json();doc=data['documents'][0]
    body={**event(owner),'documentIds':[doc['id']],'verification':'documented','endsAt':'2026-05-10T11:00:00Z'}
    assert client.post(base+'/events',json=body,headers=h).status_code==200
    assert client.post(base+'/events',json=event(owner,'evt-two'),headers=h).status_code==200
    assert client.delete(base+'/document/'+doc['id'],headers={**h,'If-Match':str(doc.get('version',1))}).status_code==200
    events=client.get(base+'/data',headers=h).json()['events'];assert len(events)==2
    changed=events[0];assert changed['documentIds']==[] and changed['verification']=='user_declared' and changed['version']==2
    assert changed['previousVersions'][0]['fields']['documentIds']==[doc['id']]
    assert client.patch(base+'/events/evt-one',json={'title':'Conflito fictício'},headers={**h,'If-Match':'1'}).status_code==409
