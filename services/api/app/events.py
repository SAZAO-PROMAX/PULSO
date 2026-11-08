"""Synthetic user-declared events in the existing transactional profile snapshot."""
import copy
from datetime import datetime,timezone
from fastapi import HTTPException
from . import store
TYPES={'emergency','hospital','fall','medication','symptom','procedure','reaction','other'}
FIELDS={'type','title','startsAt','endsAt','description','institution','documentIds','verification'}

def validate_events(owner,data):
    rows=data.get('events',[])
    if not isinstance(rows,list) or len(rows)>200:raise ValueError('Limite de acontecimentos excedido.')
    ids=set();docs={d['id'] for d in data['documents']}
    for row in rows:
        if not isinstance(row,dict) or row.get('ownerId')!=owner or row.get('synthetic') is not True or not isinstance(row.get('id'),str) or not 1<=len(row['id'])<=100 or row['id'] in ids:raise ValueError('Acontecimento inválido ou de outro perfil.')
        ids.add(row['id'])
        if not isinstance(row.get('type'),str) or row['type'] not in TYPES or row.get('source')!='user_declared' or not isinstance(row.get('verification'),str) or row['verification'] not in {'user_declared','documented'}:raise ValueError('Tipo ou estado de acontecimento inválido; não existe validação profissional.')
        for key,limit,required in [('title',120,True),('description',2000,False),('institution',120,False)]:
            value=row.get(key)
            if not isinstance(value,str) or len(value)>limit or (required and not value.strip()):raise ValueError('Texto de acontecimento inválido.')
        store.timestamp(row.get('startsAt'));store.timestamp(row.get('createdAt'));store.timestamp(row.get('updatedAt'))
        if row.get('endsAt') is not None:
            store.timestamp(row['endsAt'])
            if datetime.fromisoformat(row['endsAt'].replace('Z','+00:00'))<datetime.fromisoformat(row['startsAt'].replace('Z','+00:00')):raise ValueError('O fim não pode ser anterior ao início.')
        links=row.get('documentIds')
        if not isinstance(links,list) or len(links)>20 or any(not isinstance(v,str) or v not in docs for v in links) or len(set(links))!=len(links):raise ValueError('Documento associado indisponível neste perfil.')
        if row['verification']=='documented' and not links:raise ValueError('Documentado exige documento associado; não equivale a validação clínica.')
        if type(row.get('version')) is not int or row['version']<1 or not isinstance(row.get('previousVersions'),list):raise ValueError('Versão de acontecimento inválida.')

def edit(owner,event_id,body=None,expected=None,create=False):
    def operation(data):
        rows=data.setdefault('events',[]);current=next((r for r in rows if r['id']==event_id),None)
        now=datetime.now(timezone.utc).isoformat(timespec='seconds')
        if create:
            if current:raise HTTPException(409,'Este acontecimento já existe. Consulte a cronologia antes de repetir.')
            if not isinstance(body,dict) or set(body)-FIELDS-{'id','ownerId','synthetic'} or body.get('id')!=event_id or body.get('ownerId')!=owner or body.get('synthetic') is not True:raise HTTPException(422,'Acontecimento fictício inválido.')
            rows.append({**body,'source':'user_declared','version':1,'createdAt':now,'updatedAt':now,'previousVersions':[]})
        else:
            if current is None:raise HTTPException(404,'Acontecimento não encontrado neste perfil.')
            if expected is None:raise HTTPException(428,'É necessária a versão atual do acontecimento.')
            if expected!=current['version']:raise HTTPException(409,'O acontecimento mudou noutra sessão. Os seus campos foram mantidos; consulte a versão atual antes de decidir.')
            if body is None:rows.remove(current)
            else:
                if not body or set(body)-FIELDS:raise HTTPException(422,'Campos de acontecimento não editáveis.')
                current['previousVersions'].append({'changedAt':now,'version':current['version'],'fields':{k:copy.deepcopy(current[k]) for k in FIELDS}})
                current.update(body);current['version']+=1;current['updatedAt']=now
        return {'saved':True}
    return store.mutate(owner,operation)

def unlink_document(data,document_id):
    now=datetime.now(timezone.utc).isoformat(timespec='seconds')
    for event in data.get('events',[]):
        if document_id not in event['documentIds']:continue
        event['previousVersions'].append({'changedAt':now,'version':event['version'],'fields':{k:copy.deepcopy(event[k]) for k in FIELDS}})
        event['documentIds'].remove(document_id);event['version']+=1;event['updatedAt']=now
        if not event['documentIds']:event['verification']='user_declared'
