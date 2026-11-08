"""Experimental accounts in the existing SQLite. Opaque server sessions, not JWTs."""
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
import uuid
import unicodedata
from contextlib import contextmanager
from datetime import date
from pathlib import Path
import pymupdf
from argon2 import PasswordHasher, Type
from argon2.exceptions import VerificationError, InvalidHashError
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import Response as BinaryResponse
from starlette.concurrency import run_in_threadpool

ROOT=Path(__file__).resolve().parents[3]
COOKIE='pulso_session';SESSION_SECONDS=8*3600;TOKEN_SECONDS=15*60
HASHER=PasswordHasher(time_cost=3,memory_cost=65536,parallelism=2,type=Type.ID)
DUMMY=HASHER.hash('dummy-not-an-account-password')
AVATARS={'leaf','sun','wave','heart','mountain','flower','moon','star'}
INTERESTS={'Análises ao sangue','Tensão arterial','Saúde respiratória','Medicação e consultas','Saúde geral e prevenção'}
CONDITION_CATALOG=json.loads((ROOT/'packages/shared/conditions.json').read_text(encoding='utf-8'))
CONDITIONS={c['id'] for c in CONDITION_CATALOG}
router=APIRouter(prefix='/auth')
SCHEMA='''
CREATE TABLE IF NOT EXISTS auth_users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,profile TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,email_verified INTEGER NOT NULL DEFAULT 0,pending_email TEXT,avatar BLOB);
CREATE TABLE IF NOT EXISTS auth_sessions(digest TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES auth_users(id),csrf TEXT NOT NULL,expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS auth_tokens(digest TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES auth_users(id),purpose TEXT NOT NULL,expires REAL NOT NULL,used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS auth_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires REAL NOT NULL);
'''

@contextmanager
def connection(write=False):
    path=Path(os.environ.get('PULSO_DB_PATH',str(ROOT/'.local/pulso.sqlite3')))
    path.parent.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(path,timeout=10);db.row_factory=sqlite3.Row
    try:
        db.execute('PRAGMA foreign_keys=ON');db.executescript(SCHEMA)
        db.execute('BEGIN IMMEDIATE' if write else 'BEGIN')
        yield db;db.commit()
    except Exception:db.rollback();raise
    finally:db.close()

def digest(value):return hashlib.sha256(value.encode('utf-8')).hexdigest()

def origin(request):
    allowed=os.getenv('PULSO_WEB_ORIGINS','http://localhost:8081,http://127.0.0.1:8081,http://127.0.0.1:8765').split(',')
    if request.headers.get('origin') not in allowed:raise HTTPException(403,'Origem do pedido não permitida.')

EXPERIENCE_DEFAULTS=json.loads((ROOT/'packages/shared/experience.json').read_text(encoding='utf-8'))

def experience_value(value):
    if not isinstance(value,dict) or set(value)-set(EXPERIENCE_DEFAULTS):raise HTTPException(422,'Preferências inválidas.')
    result={**EXPERIENCE_DEFAULTS,**value}
    for key,allowed in {'mode':{'simple','balanced','detailed'},'theme':{'light','dark','system'},'textSize':{'standard','large','extra'},'technology':{'guided','regular','advanced','skip'}}.items():
        if not isinstance(result[key],str) or result[key] not in allowed:raise HTTPException(422,'Preferência inválida: '+key)
    for key in ('highContrast','reducedMotion','guidedHelp','onboardingCompleted'):
        if not isinstance(result[key],bool):raise HTTPException(422,'Preferência booleana inválida.')
    if type(result['onboardingStep']) is not int or not 0<=result['onboardingStep']<=6:raise HTTPException(422,'Passo inválido.')
    areas=result['primaryAreas']
    if not isinstance(areas,list) or len(areas)>len(INTERESTS) or any(not isinstance(a,str) or a not in INTERESTS for a in areas) or len(set(areas))!=len(areas):raise HTTPException(422,'Áreas prioritárias inválidas.')
    return result

def public_user(row):
    profile=json.loads(row['profile']);profile['experience']={**EXPERIENCE_DEFAULTS,**profile.get('experience',{})}
    return {'id':row['id'],'email':row['email'],'emailVerified':bool(row['email_verified']),'version':row['version'],'hasPhoto':row['avatar'] is not None,**profile}

def session(request,mutation=False):
    token=request.cookies.get(COOKIE,'')
    if not re.fullmatch(r'[A-Za-z0-9_-]{43}',token):raise HTTPException(401,'Sessão indisponível ou expirada. Inicia sessão novamente.')
    with connection() as db:
        row=db.execute('SELECT s.csrf,s.expires,u.* FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.digest=?',(digest(token),)).fetchone()
    if not row or row['expires']<=time.time():raise HTTPException(401,'Sessão indisponível ou expirada. Inicia sessão novamente.')
    if mutation:
        origin(request)
        csrf=request.headers.get('x-pulso-csrf','')
        if not hmac.compare_digest(csrf.encode('utf-8'),row['csrf'].encode('utf-8')):raise HTTPException(403,'Pedido não autorizado. Atualiza a sessão e tenta novamente.')
    return row

def authorize(request,owner):
    row=session(request,mutation=request.method not in {'GET','HEAD','OPTIONS'})
    if row['id']!=owner:raise HTTPException(403,'Não tens acesso a este perfil.')
    return row

def limit(request,kind,email='',maximum=20,seconds=60):
    address=request.client.host if request.client else 'unknown'
    keys=[(kind+':ip:'+digest(address),maximum)]
    if email:keys.append((kind+':email:'+digest(email),8))
    with connection(True) as db:
        now=time.time();db.execute('DELETE FROM auth_limits WHERE expires<=?',(now,))
        for key,cap in keys:
            row=db.execute('SELECT count FROM auth_limits WHERE bucket=?',(key,)).fetchone()
            if row and row['count']>=cap:raise HTTPException(429,'Demasiadas tentativas. Aguarda um minuto e tenta novamente.',headers={'Retry-After':str(seconds)})
            db.execute('INSERT INTO auth_limits VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1',(key,now+seconds))

def email_value(value):
    if not isinstance(value,str) or len(value)>254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',value.strip()):raise HTTPException(422,'Introduz um e-mail válido para a conta fictícia.')
    return value.strip().casefold()

def password_value(value):
    if not isinstance(value,str) or not 12<=len(value)<=128:raise HTTPException(422,'Usa uma palavra-passe entre 12 e 128 caracteres.')
    return value

def profile_value(value):
    if not isinstance(value,dict):raise HTTPException(422,'Perfil inválido.')
    name=value.get('displayName','')
    if not isinstance(name,str) or not 1<=len(name.strip())<=80:raise HTTPException(422,'Introduz um nome de apresentação até 80 caracteres.')
    full=value.get('fullName','')
    if not isinstance(full,str) or len(full)>160:raise HTTPException(422,'Nome completo inválido.')
    born=value.get('birthDate') or None
    if not born:raise HTTPException(422,'A data de nascimento é obrigatória.')
    if born:
        try:
            if not isinstance(born,str) or len(born)!=10 or date.fromisoformat(born).isoformat()!=born or not date(1900,1,1)<=date.fromisoformat(born)<=date.today():raise ValueError()
        except ValueError:raise HTTPException(422,'Data de nascimento inválida. Usa AAAA-MM-DD, entre 1900 e hoje.')
    conditions=value.get('conditions',[]);interests=value.get('interests',[]);avatar=value.get('avatarPreset')
    if not isinstance(conditions,list) or len(conditions)>30 or any(not isinstance(v,str) or (v not in CONDITIONS and not (v.startswith('custom:') and 2<=len(v[7:])<=100 and v[7:]==v[7:].strip() and not any(ord(c)<32 or ord(c)==127 for c in v))) for v in conditions):raise HTTPException(422,'Condições inválidas; seleciona até 30, com nomes entre 2 e 100 caracteres.')
    def normal(text):return ' '.join(''.join(c for c in unicodedata.normalize('NFD',text).casefold() if not unicodedata.combining(c)).split())
    labels={c['id']:c['label'] for c in CONDITION_CATALOG}
    keys=[normal(v[7:] if v.startswith('custom:') else labels[v]) for v in conditions]
    if len(keys)!=len(set(keys)):raise HTTPException(422,'Existem condições repetidas.')
    for values,allowed in ((interests,INTERESTS),):
        if not isinstance(values,list) or len(values)>len(allowed) or any(not isinstance(v,str) or v not in allowed for v in values) or len(set(values))!=len(values):raise HTTPException(422,'Seleções do perfil inválidas.')
    if avatar is not None and (not isinstance(avatar,str) or avatar not in AVATARS):raise HTTPException(422,'Avatar inválido.')
    return {'displayName':name.strip(),'fullName':full.strip(),'birthDate':born,'conditions':conditions,'conditionStatus':'self_declared','interests':interests,'avatarPreset':avatar}

def verify(encoded,password):
    if not isinstance(password,str) or len(password)>128:return False
    try:return HASHER.verify(encoded,password)
    except (VerificationError,InvalidHashError):return False

def create_account(data):
    email=email_value(data.get('email'));password=password_value(data.get('password'));profile=profile_value(data)
    encoded=HASHER.hash(password)
    with connection(True) as db:
        db.execute('INSERT OR IGNORE INTO auth_users(id,email,password_hash,profile) VALUES(?,?,?,?)',('user-'+uuid.uuid4().hex,email,encoded,json.dumps(profile,ensure_ascii=False)))
    return {'message':'Pedido recebido. Pode tentar iniciar sessão. Modo de desenvolvimento: nenhum e-mail foi enviado.'}

def login(data,previous):
    email=email_value(data.get('email'));password=data.get('password','')
    if not isinstance(password,str) or len(password)>128:password=''
    with connection() as db:row=db.execute('SELECT * FROM auth_users WHERE email=?',(email,)).fetchone()
    valid=verify(row['password_hash'] if row else DUMMY,password)
    if not row or not valid:raise HTTPException(401,'Não foi possível iniciar sessão. Confirma os dados e tenta novamente.')
    token=secrets.token_urlsafe(32);csrf=secrets.token_urlsafe(32)
    with connection(True) as db:
        db.execute('DELETE FROM auth_sessions WHERE expires<=? OR digest=?',(time.time(),digest(previous)))
        db.execute('INSERT INTO auth_sessions VALUES(?,?,?,?)',(digest(token),row['id'],csrf,time.time()+SESSION_SECONDS))
        if HASHER.check_needs_rehash(row['password_hash']):db.execute('UPDATE auth_users SET password_hash=? WHERE id=? AND password_hash=?',(HASHER.hash(password),row['id'],row['password_hash']))
    return token,{'user':public_user(row),'csrf':csrf,'developmentEmail':True}

def issue_token(email,purpose):
    """Only local operator CLI/tests call this; never a public token endpoint."""
    if purpose not in {'reset','verify','email-change'}:raise ValueError('Finalidade inválida.')
    token=secrets.token_urlsafe(32)
    with connection(True) as db:
        row=db.execute('SELECT id,pending_email FROM auth_users WHERE email=?',(email_value(email),)).fetchone()
        if not row or (purpose=='email-change' and not row['pending_email']):return None
        db.execute('DELETE FROM auth_tokens WHERE user_id=? AND purpose=?',(row['id'],purpose))
        db.execute('INSERT INTO auth_tokens(digest,user_id,purpose,expires) VALUES(?,?,?,?)',(digest(token),row['id'],purpose,time.time()+TOKEN_SECONDS))
    return token

def consume_token(data,reset=False):
    token=data.get('token','')
    if not isinstance(token,str) or not re.fullmatch(r'[A-Za-z0-9_-]{43}',token):raise HTTPException(400,'Código inválido ou expirado.')
    encoded=HASHER.hash(password_value(data.get('password'))) if reset else None
    with connection(True) as db:
        row=db.execute('SELECT * FROM auth_tokens WHERE digest=? AND used=0 AND expires>?',(digest(token),time.time())).fetchone()
        if not row or (reset and row['purpose']!='reset') or (not reset and row['purpose'] not in {'verify','email-change'}):raise HTTPException(400,'Código inválido ou expirado.')
        if reset:
            db.execute('UPDATE auth_users SET password_hash=?,pending_email=NULL,version=version+1 WHERE id=?',(encoded,row['user_id']))
            db.execute('DELETE FROM auth_sessions WHERE user_id=?',(row['user_id'],))
            db.execute('DELETE FROM auth_tokens WHERE user_id=? AND digest<>?',(row['user_id'],digest(token)))
        elif row['purpose']=='verify':db.execute('UPDATE auth_users SET email_verified=1,version=version+1 WHERE id=?',(row['user_id'],))
        else:
            user=db.execute('SELECT pending_email FROM auth_users WHERE id=?',(row['user_id'],)).fetchone()
            try:db.execute('UPDATE auth_users SET email=pending_email,pending_email=NULL,email_verified=1,version=version+1 WHERE id=? AND pending_email IS NOT NULL',(row['user_id'],))
            except sqlite3.IntegrityError:raise HTTPException(409,'Não foi possível concluir a alteração do e-mail.')
            if not user or not user['pending_email']:raise HTTPException(400,'Código inválido ou expirado.')
            db.execute('DELETE FROM auth_sessions WHERE user_id=?',(row['user_id'],))
            db.execute('DELETE FROM auth_tokens WHERE user_id=? AND digest<>?',(row['user_id'],digest(token)))
        db.execute('UPDATE auth_tokens SET used=1 WHERE digest=?',(digest(token),))
    return {'message':'Palavra-passe alterada. Inicia sessão novamente.' if reset else 'Verificação concluída.'}

def version(request):
    value=request.headers.get('if-match','')
    if not re.fullmatch(r'"?[1-9][0-9]{0,9}"?',value) or value.count('"') not in (0,2):raise HTTPException(428,'Atualiza o perfil antes de guardar.')
    return int(value.strip('"'))

def update_profile(user_id,data,expected):
    profile=profile_value(data)
    with connection(True) as db:
        row=db.execute('SELECT * FROM auth_users WHERE id=?',(user_id,)).fetchone()
        if row['version']!=expected:raise HTTPException(409,'O perfil mudou noutra sessão. Os campos foram mantidos; recarrega antes de decidir.')
        profile['experience']=json.loads(row['profile']).get('experience',EXPERIENCE_DEFAULTS)
        db.execute('UPDATE auth_users SET profile=?,version=version+1 WHERE id=?',(json.dumps(profile,ensure_ascii=False),user_id))
    return {'saved':True}

def avatar_bytes(raw,mime):
    signatures={'image/png':b'\x89PNG\r\n\x1a\n','image/jpeg':b'\xff\xd8\xff'}
    if mime not in signatures or not raw.startswith(signatures[mime]) or len(raw)>1024*1024:raise HTTPException(422,'Escolhe uma imagem PNG ou JPEG sintética até 1 MB.')
    try:
        with pymupdf.open(stream=raw,filetype='png' if mime=='image/png' else 'jpeg') as doc:
            page=doc[0];images=page.get_image_info()
            if not images or any(p['width']*p['height']>4000000 or max(p['width'],p['height'])>4096 for p in images):raise ValueError()
            scale=min(1,256/max(page.rect.width,page.rect.height))
            return page.get_pixmap(matrix=pymupdf.Matrix(scale,scale),colorspace=pymupdf.csRGB,alpha=False).tobytes('png')
    except Exception:raise HTTPException(422,'Imagem inválida ou acima do limite de 4 megapíxeis/4096 píxeis por lado.')

async def json_body(request):
    raw=bytearray()
    if request.headers.get('content-type','').split(';')[0]!='application/json':raise HTTPException(415,'Formato de pedido inválido.')
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw)>8192:raise HTTPException(413,'Pedido demasiado grande.')
    try:
        data=json.loads(raw)
        if not isinstance(data,dict):raise ValueError()
        return data
    except (ValueError,UnicodeError):raise HTTPException(422,'Pedido inválido.')

async def hash_work(operation,*args):
    import asyncio
    loop=asyncio.get_running_loop();gate=getattr(loop,'_pulso_hash_gate',None)
    if gate is None:gate=asyncio.Semaphore(2);setattr(loop,'_pulso_hash_gate',gate)
    async with gate:return await run_in_threadpool(operation,*args)

@router.get('/session')
def get_session(request:Request):
    try:row=session(request)
    except HTTPException:return {'user':None,'csrf':None,'developmentEmail':True}
    return {'user':public_user(row),'csrf':row['csrf'],'developmentEmail':True}

@router.post('/register')
async def register(request:Request):
    origin(request);data=await json_body(request);await run_in_threadpool(limit,request,'register','',10)
    return await hash_work(create_account,data)

@router.post('/login')
async def sign_in(request:Request,response:Response):
    origin(request);data=await json_body(request);email=email_value(data.get('email'))
    await run_in_threadpool(limit,request,'login',email)
    token,payload=await hash_work(login,data,request.cookies.get(COOKIE,''))
    response.set_cookie(COOKIE,token,httponly=True,samesite='strict',secure=os.getenv('PULSO_COOKIE_SECURE','false').lower()=='true',max_age=SESSION_SECONDS,path='/')
    return payload

@router.post('/logout')
def logout(request:Request,response:Response):
    session(request,True)
    with connection(True) as db:db.execute('DELETE FROM auth_sessions WHERE digest=?',(digest(request.cookies[COOKIE]),))
    response.delete_cookie(COOKIE,path='/');return {'signedOut':True}

@router.patch('/profile')
async def edit_profile(request:Request):
    row=session(request,True);data=await json_body(request)
    return await run_in_threadpool(update_profile,row['id'],data,version(request))

@router.post('/recovery')
async def recovery(request:Request):
    origin(request);data=await json_body(request);email_value(data.get('email'))
    await run_in_threadpool(limit,request,'recovery','',5)
    return {'message':'Modo de desenvolvimento: nenhum e-mail foi enviado. Um operador local pode emitir um código temporário pela ferramenta auth_dev.py, se existir uma conta correspondente.'}

@router.post('/reset-password')
async def reset_password(request:Request):
    origin(request);data=await json_body(request);await run_in_threadpool(limit,request,'reset','',10)
    return await hash_work(consume_token,data,True)

@router.post('/verify-email')
async def verify_email(request:Request):
    origin(request);data=await json_body(request);await run_in_threadpool(limit,request,'verify','',10)
    return await run_in_threadpool(consume_token,data)

@router.post('/email-change')
async def email_change(request:Request):
    row=session(request,True);data=await json_body(request);target=email_value(data.get('email'))
    await run_in_threadpool(limit,request,'email-change','',5)
    if not await hash_work(verify,row['password_hash'],data.get('password','')):raise HTTPException(400,'Não foi possível validar o pedido.')
    with connection(True) as db:
        db.execute('UPDATE auth_users SET pending_email=? WHERE id=?',(target,row['id']))
        db.execute("DELETE FROM auth_tokens WHERE user_id=? AND purpose='email-change'",(row['id'],))
    return {'message':'Alteração pendente. Nenhum e-mail foi enviado. Em desenvolvimento, emite e confirma um código temporário para verificar o novo endereço.'}

@router.get('/avatar')
def get_avatar(request:Request):
    row=session(request)
    if row['avatar'] is None:raise HTTPException(404,'Sem fotografia de perfil.')
    return BinaryResponse(bytes(row['avatar']),media_type='image/png',headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})

@router.post('/avatar')
async def put_avatar(request:Request):
    row=session(request,True);expected=version(request);raw=bytearray()
    await run_in_threadpool(limit,request,'avatar',row['id'],10)
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw)>1024*1024:raise HTTPException(413,'Limite de 1 MB excedido.')
    image=await run_in_threadpool(avatar_bytes,bytes(raw),request.headers.get('content-type'))
    with connection(True) as db:
        changed=db.execute('UPDATE auth_users SET avatar=?,version=version+1 WHERE id=? AND version=?',(image,row['id'],expected)).rowcount
        if not changed:raise HTTPException(409,'O perfil mudou. Atualiza antes de alterar a fotografia.')
    return {'saved':True}

@router.delete('/avatar')
def delete_avatar(request:Request):
    row=session(request,True)
    with connection(True) as db:
        if not db.execute('UPDATE auth_users SET avatar=NULL,version=version+1 WHERE id=? AND version=?',(row['id'],version(request))).rowcount:raise HTTPException(409,'O perfil mudou. Atualiza antes de remover a fotografia.')
    return {'saved':True}


@router.patch('/preferences')
async def preferences(request:Request):
    row=session(request,True);data=await json_body(request);expected=version(request)
    value=experience_value(data)
    def save():
        with connection(True) as db:
            current=db.execute('SELECT profile,version FROM auth_users WHERE id=?',(row['id'],)).fetchone()
            if current['version']!=expected:raise HTTPException(409,'As preferências mudaram noutra sessão. Atualize a sessão e tente novamente.')
            profile=json.loads(current['profile']);profile['experience']=value
            db.execute('UPDATE auth_users SET profile=?,version=version+1 WHERE id=?',(json.dumps(profile,ensure_ascii=False),row['id']))
        return {'saved':True}
    return await run_in_threadpool(save)


@router.get('/test-context')
def test_context():
    from .test_mode import synthetic_test_mode
    return {'enabled':synthetic_test_mode()}
