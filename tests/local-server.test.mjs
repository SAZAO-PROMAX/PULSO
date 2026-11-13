import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import net from 'node:net';
import {createRequire} from 'node:module';
const root=process.cwd(),script=resolve(root,'scripts/local-server.mjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,ms=130000){const end=Date.now()+ms;while(Date.now()<end){if(await fn())return;await sleep(500);}throw Error('Prazo de verificacao excedido.');}
function setup(api,web,guard){const dir=mkdtempSync(resolve(root,'tmp/supervisor-test-'));return {dir,env:{...process.env,PULSO_API_PORT:String(api),PULSO_WEB_PORT:String(web),PULSO_GUARD_PORT:String(guard),PULSO_RUN_DIR:dir,PULSO_DB_PATH:resolve(dir,'test.sqlite3'),PULSO_WEB_ORIGINS:'http://localhost:'+web,LLM_EXTRACTION_ENABLED:'false',PULSO_TEST_MODE:'',EXPO_PUBLIC_PULSO_TEST_DEMO:'false',EXPO_NO_DOTENV:'1',EXPO_PUBLIC_API_URL:'http://localhost:'+api}};}
function command(env,arg){return spawnSync(process.execPath,[script,arg],{cwd:root,env,encoding:'utf8',timeout:35000});}

test('supervisor: arranque independente, repeticao, recuperacao de crash e paragem propria',{skip:process.platform!=='win32',timeout:240000},async()=>{
 const {dir,env}=setup(8016,8086,8096),watch=spawn(process.execPath,[script,'--watch'],{cwd:root,env,stdio:'ignore',windowsHide:true});
 const state=()=>{try{return JSON.parse(readFileSync(resolve(dir,'dev-runtime.json'),'utf8'));}catch{return null;}};
 const ready=async()=>{try{return state()?.status==='ready'&&(await fetch('http://localhost:8086/',{signal:AbortSignal.timeout(2000)})).ok&&(await fetch('http://127.0.0.1:8016/health',{signal:AbortSignal.timeout(2000)})).ok;}catch{return false;}};
 try{
  await until(ready);const first=state();assert.equal(command(env,'--ensure').status,0);assert.equal(state().pid,first.pid);
  const browser=await createRequire(resolve(root,'apps/mobile/package.json'))('playwright').chromium.launch({channel:'chrome'});try{const p=await browser.newPage();await p.goto('http://localhost:8086/');await p.getByRole('button',{name:'Iniciar sessão',exact:true}).waitFor();}finally{await browser.close();}
  const api=first.children.find(c=>c.component==='API');
  // Only the API child created by this test launcher; validate ancestry before injecting failure.
  const killed=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',`$p=Get-CimInstance Win32_Process -Filter 'ProcessId=${api.pid}'; if (!$p -or $p.ParentProcessId -ne ${first.pid} -or $p.Name -ne 'python.exe') { exit 5 }; taskkill /PID ${api.pid} /T /F; exit $LASTEXITCODE`],{encoding:'utf8',windowsHide:true});assert.equal(killed.status,0);
  await until(async()=>state()?.pid!==first.pid&&await ready());assert.equal(command(env,'--ensure').status,0);
  assert.equal(command(env,'--stop').status,0);await until(()=>watch.exitCode!==null,10000);
  const logs=readFileSync(resolve(dir,'supervisor.log'),'utf8');assert.match(logs,/launcher-exit/);assert.ok(logs.match(/launcher-start/g).length>=2);assert.doesNotMatch(logs,/password|csrf|cookie|email|documentId/i);
 }finally{command(env,'--stop');}
});

test('supervisor: porta de guarda desconhecida nao provoca arranque ou terminacao',{skip:process.platform!=='win32',timeout:15000},async()=>{
 const {dir,env}=setup(8017,8087,8097),foreign=net.createServer(s=>s.destroy());await new Promise(r=>foreign.listen(8097,'127.0.0.1',r));
 try{assert.equal(command(env,'--watch').status,0);assert.equal(existsSync(resolve(dir,'dev-runtime.json')),false);assert.equal(foreign.listening,true);}finally{await new Promise(r=>foreign.close(r));}
});
