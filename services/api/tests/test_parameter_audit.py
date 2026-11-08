import base64,hashlib,copy
import pytest
from services.api.app.laboratory import PARAMETERS,parameter_id,normalized_unit,numeric
from services.api.tests.test_accounts import client,register,login
from services.api.tests.test_pdf import pdf
VITAL={'systolic':'mmHg','diastolic':'mmHg','heart_rate':'bpm','spo2':'%'}

@pytest.mark.parametrize('parameter',list(PARAMETERS)+list(VITAL))
def test_full_catalogue_roundtrip_provenance_dates_edit_delete(client,parameter):
    register(client);user,h=login(client);owner=user['id'];base='/demo/profiles/'+owner
    if parameter in PARAMETERS:
        meta=PARAMETERS[parameter]
        for alias in meta['aliases']:assert parameter_id(alias)==parameter
        for unit in meta['units']:assert normalized_unit(parameter,unit)==unit
        label=meta['label'];unit=meta['units'][0]
    else:label=parameter;unit=VITAL[parameter]
    assert numeric('1,25')==1.25
    text=f'PULSO - INTEIRAMENTE FICTICIO\n{label} | 1,25 | {unit}\n2026-11-08'
    raw=pdf(text.splitlines());doc=dict(id='audit-doc',ownerId=owner,synthetic=True,title='Auditoria fictícia',laboratory='Laboratório fictício A',issuedAt='2026-11-08T12:00:00Z',importedAt='2026-11-08T12:00:00Z',sha256=hashlib.sha256(raw).hexdigest(),original=dict(fileName='audit.pdf',mediaType='application/pdf',text=text,dataUrl='data:application/pdf;base64,'+base64.b64encode(raw).decode()))
    row=dict(id='audit-row',ownerId=owner,synthetic=True,parameter=parameter,value=1.25,unit=unit,measuredAt='2026-11-08T12:00:00Z',documentId=doc['id'],method='método de ensaio',context='contexto fictício',referenceText=None,status='user_confirmed')
    rows=[row,{**row,'id':'same-day','value':1.75,'laboratory':'Laboratório fictício B'},{**row,'id':'other-day','measuredAt':'2026-11-07T12:00:00Z'},{**row,'id':'other-method','method':'método diferente'},{**row,'id':'other-context','context':'outra amostra'},{**row,'id':'bad-unit','unit':'unidade não comparável'},{**row,'id':'missing-date','measuredAt':None},{**row,'id':'missing-value','value':None}]
    assert client.post(base+'/confirm',json={'document':doc,'results':rows},headers=h).status_code==200
    stored=client.get(base+'/data').json();assert len(stored['results'])==8 and stored['documents'][0]['original']==doc['original']
    assert {r['id'] for r in stored['results']}=={r['id'] for r in rows}
    assert client.patch(base+'/result/audit-row',json={'value':1.5},headers={**h,'If-Match':'1'}).status_code==200
    stored=client.get(base+'/data').json();changed=next(r for r in stored['results'] if r['id']=='audit-row');assert changed['value']==1.5 and changed['previousVersions'][0]['fields']['value']==1.25
    assert client.delete(base+'/result/audit-row',headers={**h,'If-Match':'2'}).status_code==200
    stored=client.get(base+'/data').json();assert len(stored['results'])==7 and stored['documents'][0]['original']==doc['original']
