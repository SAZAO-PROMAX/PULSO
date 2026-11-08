import json
import struct
import zlib
import pytest
import pymupdf
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app import accounts
from services.api.tests.test_store import document

ORIGIN={'Origin':'http://localhost:8081'}
PASSWORD='fictitious-test-password-2026'

@pytest.fixture
def client(tmp_path,monkeypatch):
    monkeypatch.setenv('PULSO_DB_PATH',str(tmp_path/'accounts.sqlite3'))
    with TestClient(app) as client:yield client

def register(client,email='one@example.test'):
    return client.post('/auth/register',json={'email':email,'password':PASSWORD,'displayName':'Pessoa fictícia'},headers=ORIGIN)

def login(client,email='one@example.test',password=PASSWORD):
    response=client.post('/auth/login',json={'email':email,'password':password},headers=ORIGIN)
    assert response.status_code==200
    data=response.json();return data['user'],{**ORIGIN,'X-Pulso-CSRF':data['csrf']}

def test_accounts_sessions_csrf_isolation_persistence_logout(client):
    assert register(client).status_code==200
    assert register(client,'two@example.test').status_code==200
    user,headers=login(client)
    with accounts.connection() as db:
        row=db.execute('SELECT password_hash FROM auth_users WHERE id=?',(user['id'],)).fetchone()
        assert row['password_hash'].startswith('$argon2id$') and row['password_hash']!=PASSWORD
        assert db.execute('SELECT digest FROM auth_sessions').fetchone()['digest']!=client.cookies.get(accounts.COOKIE)
    cookie=client.cookies.get(accounts.COOKIE)
    assert 'httponly' in client.post('/auth/login',json={'email':'one@example.test','password':PASSWORD},headers=ORIGIN).headers['set-cookie'].lower()
    assert client.cookies.get(accounts.COOKIE)!=cookie
    user,headers=login(client)
    prefix='/demo/profiles/'+user['id'];scope={'X-Pulso-Profile':user['id']}
    assert client.get(prefix+'/data',headers=scope).json()=={'schemaVersion':1,'documents':[],'results':[]}
    body={'id':'fictitious','systolic':'128','diastolic':'78','date':'2026-11-08T10:00:00Z'}
    assert client.post(prefix+'/pressure',json=body,headers={**ORIGIN,**scope}).status_code==403
    assert client.post(prefix+'/pressure',json=body,headers={**headers,**scope}).status_code==200
    assert len(client.get(prefix+'/data',headers=scope).json()['results'])==2
    second=TestClient(app);other,other_headers=login(second,'two@example.test')
    assert second.get(prefix+'/data',headers=scope).status_code==403
    assert second.post(prefix+'/pressure',json=body,headers={**other_headers,**scope}).status_code==403
    assert second.get('/demo/profiles/'+other['id']+'/data',headers={'X-Pulso-Profile':other['id']}).json()['results']==[]
    bad=document(owner='demo-a')
    assert client.post(prefix+'/confirm',json=bad,headers={**headers,**scope}).status_code==422
    assert client.post('/auth/logout',headers=headers).status_code==200
    assert client.get(prefix+'/data',headers=scope).status_code==401
    login(client);assert len(client.get(prefix+'/data',headers=scope).json()['results'])==2
    assert client.get(prefix+'/data',headers=scope).headers['cache-control']=='no-store'

def test_profile_versions_self_declared_conditions_and_email_change(client):
    register(client);user,headers=login(client)
    profile={**user,'displayName':'Outro nome fictício','birthDate':'1990-01-01','conditions':['asthma'],'interests':['Saúde respiratória'],'avatarPreset':'leaf'}
    assert client.patch('/auth/profile',json=profile,headers={**headers,'If-Match':'1'}).status_code==200
    assert client.patch('/auth/profile',json=profile,headers={**headers,'If-Match':'1'}).status_code==409
    current=client.get('/auth/session').json()['user'];assert current['conditionStatus']=='self_declared' and current['birthDate']=='1990-01-01'
    assert client.post('/auth/email-change',json={'email':'new@example.test','password':PASSWORD},headers=headers).status_code==200
    assert client.get('/auth/session').json()['user']['email']=='one@example.test'
    token=accounts.issue_token('one@example.test','email-change')
    assert client.post('/auth/verify-email',json={'token':token},headers=ORIGIN).status_code==200
    assert client.post('/auth/verify-email',json={'token':token},headers=ORIGIN).status_code==400
    updated,_=login(client,'new@example.test');assert updated['emailVerified'] is True

def test_recovery_single_use_expiry_revocation_and_no_email_enumeration(client):
    register(client);user,headers=login(client)
    existing=client.post('/auth/recovery',json={'email':'one@example.test'},headers=ORIGIN)
    absent=client.post('/auth/recovery',json={'email':'absent@example.test'},headers=ORIGIN)
    assert existing.json()==absent.json() and 'token' not in existing.json()
    token=accounts.issue_token('one@example.test','reset')
    data={'token':token,'password':'another-fictitious-password'}
    assert client.post('/auth/reset-password',json=data,headers=ORIGIN).status_code==200
    assert client.get('/auth/session').json()['user'] is None
    assert client.post('/auth/reset-password',json=data,headers=ORIGIN).status_code==400
    login(client,password=data['password'])
    expired=accounts.issue_token('one@example.test','reset')
    with accounts.connection(True) as db:db.execute('UPDATE auth_tokens SET expires=0 WHERE digest=?',(accounts.digest(expired),))
    assert client.post('/auth/reset-password',json={'token':expired,'password':PASSWORD},headers=ORIGIN).status_code==400

def test_auth_repeated_attempts_wrong_origin_and_expired_session(client):
    register(client)
    data={'email':'one@example.test','password':'wrong-fictitious-password'}
    assert client.post('/auth/login',json=data,headers={'Origin':'https://untrusted.invalid'}).status_code==403
    first=client.post('/auth/login',json=data,headers=ORIGIN)
    other=client.post('/auth/login',json={**data,'email':'absent@example.test'},headers=ORIGIN)
    assert first.status_code==other.status_code==401 and first.json()==other.json()
    for _ in range(7):assert client.post('/auth/login',json=data,headers=ORIGIN).status_code==401
    assert client.post('/auth/login',json=data,headers=ORIGIN).status_code==429
    with accounts.connection(True) as db:db.execute('DELETE FROM auth_limits')
    user,headers=login(client)
    with accounts.connection(True) as db:db.execute('UPDATE auth_sessions SET expires=0')
    assert client.get('/auth/session').json()['user'] is None
    assert client.get('/demo/profiles/'+user['id']+'/data').status_code==401

def test_avatar_private_resize_strip_metadata_replace_remove(client):
    register(client);user,headers=login(client)
    pix=pymupdf.Pixmap(pymupdf.csRGB,(0,0,600,400),False);pix.clear_with(220);raw=pix.tobytes('png')
    chunk=b'tEXt'+b'Comment\x00SYNTHETIC-EXIF-MARKER'
    raw=raw[:33]+struct.pack('>I',len(chunk)-4)+chunk+struct.pack('>I',zlib.crc32(chunk))+raw[33:]
    assert client.post('/auth/avatar',content=raw,headers={**headers,'Content-Type':'image/jpeg','If-Match':'1'}).status_code==422
    assert client.post('/auth/avatar',content=raw,headers={**headers,'Content-Type':'image/png','If-Match':'1'}).status_code==200
    response=client.get('/auth/avatar');assert response.status_code==200 and b'SYNTHETIC-EXIF-MARKER' not in response.content
    with pymupdf.open(stream=response.content,filetype='png') as doc:
        info=doc[0].get_image_info()[0];assert max(info['width'],info['height'])<=256
    visitor=TestClient(app);assert visitor.get('/auth/avatar').status_code==401
    register(visitor,'two@example.test');login(visitor,'two@example.test');assert visitor.get('/auth/avatar').status_code==404
    assert client.post('/auth/avatar',content=pix.tobytes('jpeg'),headers={**headers,'Content-Type':'image/jpeg','If-Match':'2'}).status_code==200
    assert client.delete('/auth/avatar',headers={**headers,'If-Match':'3'}).status_code==200
    assert client.get('/auth/avatar').status_code==404 and client.get('/auth/session').json()['user']['hasPhoto'] is False
