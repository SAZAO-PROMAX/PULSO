"""Reproducible synthetic cohorts; owned loopback API, disposable SQLite, real scope checks.
Account/session fixture insertion is explicit; registration/password login coverage is reported separately.
"""
import argparse,asyncio,base64,ctypes,struct,hashlib,json,os,random,secrets,socket,sqlite3,subprocess,sys,time,uuid
from pathlib import Path
from collections import Counter
import httpx,pymupdf
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from scripts.load_test import safe_output,digest,percentile,process_resources,windows_python_child
STAMP='2026-11-08T12:00:00Z';PASSWORD='synthetic-cohort-password-2026';ORIGIN='http://localhost:8081'
def canonical(data):return hashlib.sha256(json.dumps(data,sort_keys=True,ensure_ascii=True,separators=(',',':')).encode()).hexdigest()
def fixture(index,seed):
 from services.api.app.laboratory import CATALOG
 rng=random.Random(seed+index);owner='user-'+uuid.uuid5(uuid.NAMESPACE_URL,f'pulso-synthetic-{seed}-{index}').hex
 ages=[(18,34),(35,54),(55,64),(65,74),(75,95)];lo,hi=ages[index%5];age=rng.randint(lo,hi)
 declared=[[],['hypertension'],['diabetes'],['dyslipidemia'],['asthma'],['copd'],['custom:Condição renal fictícia'],['hypothyroidism'],['custom:Anemia fictícia'],['hypertension','diabetes','custom:Condição fictícia ausente']][index%10]
 profile=dict(displayName=f'Pessoa fictícia {index:04}',fullName='',birthDate=f'{2026-age}-01-15',conditions=declared,conditionStatus='self_declared',interests=[],avatarPreset=None)
 data=dict(schemaVersion=1,documents=[],results=[],events=[]);count=[0,1,2,5,12,30,60,3,8,16][index%10]
 for j in range(count):
  did=f'doc-{index}-{j}';date=f'{2020+j%7:04}-{1+j%12:02}-15T12:00:00Z';category='laboratory' if j%4 else 'cardiology';exam='blood' if category=='laboratory' else 'ecg';specialty='general' if category=='laboratory' else 'cardiology'
  planned=[]
  if category=='laboratory':
   for k in range(3):
    p=CATALOG['parameters'][(index+j+k)%15];v=[0.01,1.25,9999,None][(j+k)%4];unit=p['units'][-1] if j%5==0 else p['units'][0]
    planned.append(dict(id=f'r-{index}-{j}-{k}',ownerId=owner,synthetic=True,parameter=p['id'],value=v,unit=unit,measuredAt=None if j%9==0 else date,documentId=did,method='método B' if j%3 else 'método A',context='plasma' if j%2 else 'soro',referenceText='referência inteiramente fictícia; sem finalidade clínica',status='user_confirmed',version=1,evidence=dict(page=1,excerpt=f"{p['id']} | {'ND' if v is None else str(v).replace('.',',')} | {unit}",extractedValue='ND' if v is None else str(v).replace('.',','),extractedUnit=unit,verification='text_verified',extractionMethod='deterministic')))
  lines=['PULSO - DOCUMENTO INTEIRAMENTE FICTICIO',f'Fixture {seed}-{index}-{j}',f'Sexo no documento: {['M','F','nao declarado'][index%3]}',date]+[r['evidence']['excerpt'] for r in planned]
  text='\n'.join(lines);pdf=pymupdf.open();page=pdf.new_page();page.insert_text((30,40),text,fontsize=10);raw=pdf.tobytes(no_new_id=True,deflate=True);pdf.close()
  data['documents'].append(dict(id=did,ownerId=owner,synthetic=True,title=f'Documento fictício {j}',laboratory=f'Laboratório fictício {j%3}',issuedAt=date,importedAt=STAMP,category=category,examType=exam,specialties=[specialty],examDate=date[:10],version=1,sha256=hashlib.sha256(raw).hexdigest(),original=dict(fileName='sintetico.pdf',mediaType='application/pdf',text=text,dataUrl='data:application/pdf;base64,'+base64.b64encode(raw).decode())))
  data['results']+=planned
 if index%10>=4:
  for j in range(1+index%12):
   for p,value,unit in [('systolic',123,'mmHg'),('diastolic',82,'mmHg'),('heart_rate',72,'bpm'),('spo2',97,'%')]:
    data['results'].append(dict(id=f'v-{index}-{j}-{p}',ownerId=owner,synthetic=True,parameter=p,value=value,unit=unit,measuredAt=STAMP,documentId=None,source='manual',sessionId=f'home-{index}-{j}',method='registo manual',context='domiciliário',referenceText=None,status='user_declared',version=1))
 if count and index%3==0:
  data['events']=[dict(id=f'event-{index}',ownerId=owner,synthetic=True,type='other',title='Acontecimento fictício',startsAt=STAMP,endsAt=None,description='',institution='',documentIds=[data['documents'][0]['id']],source='user_declared',verification='documented',createdAt=STAMP,updatedAt=STAMP,version=1,previousVersions=[])]
 return owner,profile,data,('18-34','35-54','55-64','65-74','75+')[index%5]

def listener_pid(port):
 # Fail closed if a different process takes the test port between the initial check and startup.
 if os.name!='nt':raise RuntimeError('Owned listener verification currently supports Windows only')
 api=ctypes.WinDLL('iphlpapi').GetExtendedTcpTable
 api.argtypes=[ctypes.c_void_p,ctypes.POINTER(ctypes.c_ulong),ctypes.c_bool,ctypes.c_ulong,ctypes.c_int,ctypes.c_ulong];api.restype=ctypes.c_ulong
 size=ctypes.c_ulong();api(None,ctypes.byref(size),False,socket.AF_INET,5,0);buffer=ctypes.create_string_buffer(size.value)
 if api(buffer,ctypes.byref(size),False,socket.AF_INET,5,0)!=0:return None
 count=struct.unpack_from('=I',buffer.raw)[0]
 for index in range(count):
  state,address,local_port,remote,remote_port,pid=struct.unpack_from('=6I',buffer.raw,4+index*24)
  if state==2 and socket.ntohs(local_port&65535)==port:return pid
 return None

class Run:
 def __init__(self,args,out):self.args=args;self.out=out;self.db=out/'cohort.sqlite3';self.base=f'http://127.0.0.1:{args.port}';self.identities=[];self.expected={};self.report={'seed':args.seed,'counts':{},'functional':{},'load':[],'coverage':{'accounts':'internal fixtures','sessions':'internal opaque session fixtures, real server authorization on every request','password_logins_http':0,'registration_http':0,'rendering':'separate Chromium tests, not 1000 rendered browsers'}};self.process=None;self.metrics=Counter();self.start=time.monotonic()
 def save(self): (self.out/'results.json').write_text(json.dumps(self.report,indent=2,ensure_ascii=False),encoding='utf-8')
 def start_server(self):
  env=dict(os.environ,PULSO_DB_PATH=str(self.db),PULSO_TEST_MODE='',LLM_EXTRACTION_ENABLED='false')
  self.log=(self.out/'server.log').open('a',encoding='utf-8');self.process=subprocess.Popen([sys.executable,'-m','uvicorn','services.api.app.main:app','--host','127.0.0.1','--port',str(self.args.port),'--no-access-log'],cwd=ROOT,env=env,stdout=self.log,stderr=self.log)
 def stop_server(self):
  if self.process and self.process.poll() is None:
   self.process.terminate()
   try:self.process.wait(timeout=10)
   except subprocess.TimeoutExpired:self.process.kill();self.process.wait()
  if hasattr(self,'log'):self.log.close()
 async def ready(self,client):
  for _ in range(100):
   if self.process.poll() is not None:raise RuntimeError('Owned test server exited before readiness')
   try:
    if (await client.get('/health')).status_code==200 and listener_pid(self.args.port)==windows_python_child(self.process.pid):return
   except httpx.HTTPError:pass
   await asyncio.sleep(.1)
  raise RuntimeError('Owned test server did not start')
 def seed(self):
  os.environ['PULSO_DB_PATH']=str(self.db)
  from services.api.app import accounts,store
  from services.api.app.events import validate_events as events_validate
  encoded=accounts.HASHER.hash(PASSWORD);ages=Counter();docs=results=0
  with accounts.connection(True):pass
  with store.connection():pass
  with sqlite3.connect(self.db) as db:
   for i in range(self.args.profiles):
    if time.monotonic()-self.start>self.args.max_seconds:raise TimeoutError('Cohort deadline during generation')
    owner,profile,data,band=fixture(i,self.args.seed);accounts.profile_value(profile);store.validate(owner,data);events_validate(owner,data)
    token=secrets.token_urlsafe(32);csrf=secrets.token_urlsafe(32);email=f'cohort-{i}@example.test';db.execute('INSERT INTO auth_users(id,email,password_hash,profile) VALUES(?,?,?,?)',(owner,email,encoded,json.dumps(profile)))
    db.execute('INSERT INTO auth_sessions VALUES(?,?,?,?)',(accounts.digest(token),owner,csrf,time.time()+8*3600));db.execute('INSERT INTO profiles(owner,payload) VALUES(?,?)',(owner,json.dumps(data,ensure_ascii=False)))
    self.identities.append((owner,token,csrf,email));self.expected[owner]=canonical(data);ages[band]+=1;docs+=len(data['documents']);results+=len(data['results'])
    if (i+1)%100==0:print('seeded',i+1,flush=True)
  self.report['counts']={'accounts':len(self.identities),'documents':docs,'results':results,'age_bands':dict(ages),'profile_fixture_sha256':canonical(self.expected)};self.save()
 def headers(self,identity,version=None):
  owner,token,csrf,email=identity;return {'Cookie':'pulso_session='+token,'Origin':ORIGIN,'X-Pulso-CSRF':csrf,'X-Pulso-Profile':owner,**({'If-Match':str(version)} if version else {})}
 async def call(self,c,identity,method,path,expect=200,**kwargs):
  h=self.headers(identity,kwargs.pop('version',None));r=await c.request(method,path,headers=h,**kwargs);self.metrics[f'{method} {r.status_code}']+=1
  if r.status_code!=expect:raise AssertionError(f'{method} {path}: {r.status_code}, expected {expect}')
  return r
 async def functional(self,c):
  # Bound fixture sessions are checked by unchanged normal middleware. No demo bypass.
  gate=asyncio.Semaphore(4);done=0
  async def one(i,ident):
   nonlocal done
   async with gate:
    owner=ident[0];base='/demo/profiles/'+owner;other=self.identities[(i+1)%len(self.identities)][0]
    data=(await self.call(c,ident,'GET',base+'/data')).json();assert canonical(data)==self.expected[owner]
    assert (await self.call(c,ident,'GET','/auth/session')).json()['user']['id']==owner
    for method,suffix in [('GET','/data'),('PATCH','/result/not-owned'),('DELETE','/document/not-owned')]:await self.call(c,ident,method,'/demo/profiles/'+other+suffix,expect=403,**({'json':{'value':1},'version':1} if method=='PATCH' else {}))
    payload=dict(id='journey',date=STAMP,systolic='123',diastolic='82')
    await self.call(c,ident,'POST',base+'/pressure',json=payload);await self.call(c,ident,'POST',base+'/pressure',json=payload);await self.call(c,ident,'POST',base+'/pressure',expect=409,json={**payload,'systolic':'124'})
    await self.call(c,ident,'PATCH',base+'/result/journey-systolic',json={'value':124},version=1)
    await self.call(c,ident,'PATCH',base+'/result/journey-systolic',expect=409,json={'value':125},version=1)
    changed=(await self.call(c,ident,'GET',base+'/data')).json();row=next(r for r in changed['results'] if r['id']=='journey-systolic');assert row['value']==124 and row['previousVersions'][0]['fields']['value']==123
    for p,v in [('systolic',2),('diastolic',1)]:await self.call(c,ident,'DELETE',base+'/result/journey-'+p,version=v)
    assert canonical((await self.call(c,ident,'GET',base+'/data')).json())==self.expected[owner]
    done+=1
    if done%100==0:print('functional accounts',done,flush=True);self.report['functional']['completed']=done;self.save()
  await asyncio.gather(*(one(i,ident) for i,ident in enumerate(self.identities)))
  self.report['functional'].update(completed=done,unexpected=0,cross_account_denials=3*done,idempotence_and_stale_versions=done,http=dict(self.metrics));self.save()
 async def persistence_and_logins(self,c):
  self.stop_server();self.start_server();await self.ready(c)
  for i,ident in enumerate(self.identities):assert canonical((await self.call(c,ident,'GET','/demo/profiles/'+ident[0]+'/data')).json())==self.expected[ident[0]]
  self.report['functional']['persisted_after_server_restart']=len(self.identities)
  for ident in self.identities[:10]:
   async with httpx.AsyncClient(base_url=self.base,trust_env=False,timeout=30) as login:
    r=await login.post('/auth/login',headers={'Origin':ORIGIN},json={'email':ident[3],'password':PASSWORD});assert r.status_code==200;csrf=r.json()['csrf'];assert (await login.get('/auth/session')).json()['user']['id']==ident[0];assert (await login.post('/auth/logout',headers={'Origin':ORIGIN,'X-Pulso-CSRF':csrf})).status_code==200;assert (await login.get('/demo/profiles/'+ident[0]+'/data')).status_code==401
  self.report['coverage']['password_logins_http']=min(10,len(self.identities));self.save()
 async def load(self,c):
  raw=(ROOT/'data/synthetic/laboratorio-demo.pdf').read_bytes();stable=None
  print('Provisional: normal fulfilled p95<=1500ms p99<=5000ms, unexpected<=1%, no integrity drift; refusal latency separate. Stop on failed tier or >5%/10 errors.',flush=True)
  for n in self.args.users:
   if n>len(self.identities):break
   start=time.monotonic();lat=[];rejected=[];codes=Counter();errors=[];completed=0;pid=windows_python_child(self.process.pid);resources_before=process_resources(pid)
   async def request(ident,method,path,**kw):
    t=time.monotonic()
    try:
     headers=self.headers(ident,kw.pop('version',None));headers.update({'Content-Type':'application/pdf','X-Pulso-Demo':'synthetic-only'} if path=='/demo/extractions' else {});r=await c.request(method,path,headers=headers,**kw);codes[str(r.status_code)]+=1
     if r.status_code in (429,409):rejected.append((time.monotonic()-t)*1000)
     elif r.status_code in (200,202):lat.append((time.monotonic()-t)*1000)
     else:errors.append(str(r.status_code))
     return r
    except httpx.HTTPError as exc:errors.append(type(exc).__name__);return None
   async def user(i):
    nonlocal completed
    ident=self.identities[i];base='/demo/profiles/'+ident[0];await asyncio.sleep(self.args.ramp*i/max(n,1));turn=0
    while time.monotonic()-start<self.args.ramp+self.args.duration:
     if len(errors)>=10 and len(errors)/max(1,sum(codes.values()))>.05:return
     r=await request(ident,'GET',base+'/data');await asyncio.sleep(self.args.pause)
     if i%4==0:
      sid=f'load-{i}-{turn}';body=dict(id=sid,date=STAMP,systolic='123',diastolic='82');await request(ident,'POST',base+'/pressure',json=body);await request(ident,'PATCH',base+'/result/'+sid+'-systolic',json={'value':124},version=1)
      for p,v in [('systolic',2),('diastolic',1)]:await request(ident,'DELETE',base+'/result/'+sid+'-'+p,version=v)
     elif i==1 and turn==0:
      # Admission probe, no automatic confirmation and no GPU inference.
      r=await request(ident,'POST','/demo/extractions',content=raw)
      if r is not None and r.status_code==202:
       ticket=r.json();deadline=time.monotonic()+15
       while ticket.get('state') not in ('ready','error','cancelled') and time.monotonic()<deadline:
        await asyncio.sleep(.15);poll=await request(ident,'GET','/demo/extractions/'+ticket['id'])
        if poll is None or poll.status_code!=200:break
        ticket=poll.json()
     completed+=1;turn+=1;await asyncio.sleep(self.args.pause)
   await asyncio.gather(*(user(i) for i in range(n)))
   elapsed=time.monotonic()-start;resources=process_resources(pid);integrity=True
   for ident in self.identities[:n]:
    r=await c.get('/demo/profiles/'+ident[0]+'/data',headers=self.headers(ident));integrity=integrity and r.status_code==200 and canonical(r.json())==self.expected[ident[0]]
   row=dict(clients=n,seconds=round(elapsed,2),fulfilled=sum(1 for _ in lat),controlled=len(rejected),codes=dict(codes),unexpected=len(errors),p50=percentile(lat,.5),p95=percentile(lat,.95),p99=percentile(lat,.99),refused_p95=percentile(rejected,.95),fulfilled_rps=round(len(lat)/elapsed,2),journeys=completed,integrity=integrity,resources=resources,cpu_seconds_delta=round(resources.get('cpu_seconds',0)-resources_before.get('cpu_seconds',0),3),db_bytes=self.db.stat().st_size)
   row['stable']=bool(integrity and not errors and lat and row['p95']<=1500 and row['p99']<=5000 and resources.get('rss_mb',0)<2048)
   self.report['load'].append(row);print('LOAD',json.dumps(row),flush=True);self.save()
   if not row['stable']:break
   stable=n
  self.report['largest_stable_short_tier']=stable;self.save()
 async def run(self):
  self.seed();self.start_server()
  async with httpx.AsyncClient(base_url=self.base,trust_env=False,timeout=30,limits=httpx.Limits(max_connections=1100,max_keepalive_connections=50)) as c:
   await self.ready(c);await self.functional(c);await self.persistence_and_logins(c)
   if not self.args.no_load:await self.load(c)
   for ident in self.identities:
    await self.call(c,ident,'POST','/auth/logout');await self.call(c,ident,'GET','/demo/profiles/'+ident[0]+'/data',expect=401)
   self.report['functional']['fixture_sessions_revoked']=len(self.identities)
  with sqlite3.connect(self.db) as db:assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert db.execute('SELECT count(*) FROM auth_users').fetchone()[0]==self.args.profiles
  self.report['sqlite_integrity']='ok';self.save()
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--profiles',type=int,default=1000);parser.add_argument('--seed',type=int,default=730);parser.add_argument('--output',default='tmp/v073-cohort');parser.add_argument('--port',type=int,default=8878);parser.add_argument('--users',nargs='+',type=int,default=[1,10,25,50,100,250,500,1000]);parser.add_argument('--duration',type=float,default=6);parser.add_argument('--ramp',type=float,default=2);parser.add_argument('--pause',type=float,default=.2);parser.add_argument('--max-seconds',type=float,default=900);parser.add_argument('--no-load',action='store_true');args=parser.parse_args()
 if not 2<=args.profiles<=1000 or args.port in (8000,8081,8765) or not 1024<=args.port<=65535 or min(args.duration,args.ramp,args.pause,args.max_seconds)<=0 or args.users!=sorted(set(args.users)) or min(args.users)<1 or max(args.users)>1000:parser.error('Invalid bounded isolated configuration')
 with socket.socket() as sock:
  if os.name=='nt':sock.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
  sock.bind(('127.0.0.1',args.port))
 out=safe_output(ROOT/args.output);normal=ROOT/'.local/pulso.sqlite3';before=digest(normal);run=Run(args,out)
 try:asyncio.run(asyncio.wait_for(run.run(),timeout=args.max_seconds))
 except BaseException as exc:run.report['failure']=type(exc).__name__+': '+str(exc);raise
 finally:run.stop_server();run.report['normal_db_unchanged']=before==digest(normal);run.report['server_stopped']=run.process is None or run.process.poll() is not None;run.save()
if __name__=='__main__':main()
