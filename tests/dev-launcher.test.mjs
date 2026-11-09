import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,openSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
const root=process.cwd(),script=resolve(root,'scripts/dev.mjs');
const seconds=Number(process.env.PULSO_STABILITY_SECONDS??0);if(!Number.isInteger(seconds)||seconds<0||seconds>7200)throw Error('Duração deve ser 0 a7200segundos.');
test('launcher Windows: prontidão API/web, estado, identidade e paragem da sessão própria',{skip:process.platform!=='win32',timeout:160000+seconds*1000},async()=>{
 const dir=mkdtempSync(resolve(root,'tmp/launcher-test-')),env={...process.env,PULSO_API_PORT:'8015',PULSO_WEB_PORT:'8085',PULSO_RUN_DIR:dir,PULSO_DB_PATH:resolve(dir,'test.sqlite3'),LLM_EXTRACTION_ENABLED:'false',PULSO_TEST_MODE:'',EXPO_PUBLIC_PULSO_TEST_DEMO:'false',EXPO_NO_DOTENV:'1',PULSO_WEB_ORIGINS:'http://localhost:8085'};
 delete env.EXPO_PUBLIC_API_URL;const output=openSync(resolve(dir,'console.log'),'w'),child=spawn(process.execPath,[script],{cwd:root,env,stdio:['ignore',output,output],windowsHide:true});let stopped=false;
 const command=(arg)=>spawnSync(process.execPath,[script,arg],{cwd:root,env,encoding:'utf8',timeout:15000});
 try{
  const end=Date.now()+130000;let state;
  while(Date.now()<end){if(existsSync(resolve(dir,'dev-runtime.json'))){state=JSON.parse(readFileSync(resolve(dir,'dev-runtime.json'),'utf8'));if(state.status==='ready')break;}assert.equal(child.exitCode,null,readFileSync(resolve(dir,'console.log'),'utf8'));await new Promise(r=>setTimeout(r,500));}
  assert.equal(state?.status,'ready');assert.equal((await fetch('http://127.0.0.1:8015/health')).status,200);assert.equal((await fetch('http://localhost:8085/')).status,200);
  assert.match(command('--status').stdout,/API: responde/);assert.match(command('--status').stdout,/Web: responde/);
  const require=createRequire(resolve(root,'apps/mobile/package.json')),{chromium}=require('playwright'),browser=await chromium.launch();
  try{
   const context=await browser.newContext(),page=await context.newPage();let forbidden=0;await page.route(url=>url.port==='8000',route=>{forbidden++;return route.abort();});
   await page.goto('http://localhost:8085/');await page.getByRole('button',{name:'Iniciar sessão',exact:true}).waitFor();assert.equal(forbidden,0);
   const api='http://localhost:8015',origin='http://localhost:8085',headers={Origin:origin},password='synthetic-stability-password-2026',email='stability-'+Date.now()+'@example.test';
   assert.equal((await context.request.post(api+'/auth/register',{headers,data:{email,password,displayName:'Pessoa fictícia estabilidade',birthDate:'1970-05-23'}})).status(),200);
   const login=await context.request.post(api+'/auth/login',{headers,data:{email,password}});assert.equal(login.status(),200);const auth=await login.json();await page.reload();await page.getByRole('button',{name:'Adicionar exame',exact:true}).waitFor();
   const other=await browser.newContext();assert.equal((await other.request.get(api+'/demo/profiles/'+auth.user.id+'/data')).status(),401);await other.close();
   const started=Date.now(),end=started+seconds*1000;let checks=0,writes=0,previous=started;
   do{
    const now=Date.now();assert.ok(now-previous<90000,'Intervalo sem observação excessivo; não comprova disponibilidade contínua.');previous=now;
    assert.equal((await fetch('http://127.0.0.1:8015/health',{signal:AbortSignal.timeout(5000)})).status,200);assert.equal((await fetch('http://localhost:8085/',{signal:AbortSignal.timeout(5000)})).status,200);
    if(checks%20===0){assert.equal((await context.request.post(api+'/demo/profiles/'+auth.user.id+'/pressure',{headers:{...headers,'X-Pulso-CSRF':auth.csrf},data:{id:'stability-'+checks,systolic:'128',diastolic:'78',date:new Date().toISOString()}})).status(),200);writes++;await page.reload();await page.getByRole('button',{name:'Adicionar exame',exact:true}).waitFor();}
    checks++;console.log(JSON.stringify({stabilitySeconds:Math.round((Date.now()-started)/1000),checks,writes}));if(!seconds)break;await new Promise(r=>setTimeout(r,Math.min(30000,Math.max(0,end-Date.now()))));
   }while(Date.now()<end);
   console.log(JSON.stringify({completedSeconds:Math.round((Date.now()-started)/1000),checks,writes}));assert.equal(forbidden,0);
  }finally{await browser.close();}
  const original=readFileSync(resolve(dir,'dev-runtime.json'),'utf8');writeFileSync(resolve(dir,'dev-runtime.json'),JSON.stringify({...state,birthEpoch:state.birthEpoch-10000}));try{assert.notEqual(command('--stop').status,0);assert.equal((await fetch('http://localhost:8085/')).status,200);}finally{writeFileSync(resolve(dir,'dev-runtime.json'),original);}
  assert.equal(command('--stop').status,0);stopped=true;
  const logs=readFileSync(resolve(dir,'dev-lifecycle.log'),'utf8');assert.match(logs,/"event":"ready"/);assert.match(logs,/"event":"requested-stop"/);assert.doesNotMatch(logs,/password|csrf|cookie|email|documentId/i);
 }finally{if(!stopped&&existsSync(resolve(dir,'dev-runtime.json')))command('--stop');if(child.exitCode===null&&!stopped)child.kill();}
});
