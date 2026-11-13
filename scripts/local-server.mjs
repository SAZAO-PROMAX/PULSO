import {existsSync,readFileSync,writeFileSync,appendFileSync,mkdirSync,statSync,renameSync,rmSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import net from 'node:net';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const runDir=resolve(root,process.env.PULSO_RUN_DIR??'.local');
if(!['.local','tmp'].some(p=>runDir===resolve(root,p)||runDir.startsWith(resolve(root,p)+sep)))throw Error('Diretório operacional inválido.');
const api=Number(process.env.PULSO_API_PORT??8000),web=Number(process.env.PULSO_WEB_PORT??8081),guard=Number(process.env.PULSO_GUARD_PORT??7999);
if(![api,web,guard].every(p=>Number.isInteger(p)&&p>=1024&&p<=65535)||new Set([api,web,guard]).size!==3)throw Error('Portas locais inválidas.');
const dev=resolve(root,'scripts/dev.mjs'),stopFile=resolve(runDir,'supervisor.stop'),logFile=resolve(runDir,'supervisor.log');
mkdirSync(runDir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function log(event,details={}){if(existsSync(logFile)&&statSync(logFile).size>65536)renameSync(logFile,logFile+'.previous');appendFileSync(logFile,JSON.stringify({at:new Date().toISOString(),event,...details})+'\n');}
async function responds(url){try{return (await fetch(url,{signal:AbortSignal.timeout(3000)})).ok;}catch{return false;}}
async function ready(){
 try{const state=JSON.parse(readFileSync(resolve(runDir,'dev-runtime.json'),'utf8'));if(state.root!==root||state.apiPort!==api||state.webPort!==web||state.status!=='ready')return false;}catch{return false;}
 return (await Promise.all([responds('http://127.0.0.1:'+api+'/health'),responds('http://localhost:'+web+'/')])).every(Boolean);
}
async function guardBusy(){return new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port:guard});s.setTimeout(1000);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(true);});});}
function stopLauncher(){return spawnSync(process.execPath,[dev,'--stop'],{cwd:root,env:process.env,windowsHide:true,stdio:'ignore',timeout:20000}).status===0;}

async function watch(){
 const lock=net.createServer(s=>s.destroy());
 const acquired=await new Promise((ok,no)=>{lock.once('error',e=>e.code==='EADDRINUSE'?ok(false):no(e));lock.listen(guard,'127.0.0.1',()=>ok(true));});
 if(!acquired)return; // Another supervisor or an unknown listener: never terminate it.
 rmSync(stopFile,{force:true});log('supervisor-start',{pid:process.pid,api,web,guard});
 let child=null,failures=0,attempts=0,nextStart=0,closing=false,everReady=false;
 const requestStop=()=>{closing=true;};process.on('SIGINT',requestStop);process.on('SIGTERM',requestStop);
 try{
  while(!closing&&!existsSync(stopFile)){
   const healthy=await ready();
   if(healthy){failures=0;if(!everReady){log('services-ready');everReady=true;}attempts=0;}
   else if(child){
    // Startup has its own deadline in dev.mjs. Only recover after readiness was reached.
    if(everReady&&++failures>=3){log('health-recovery');if(!stopLauncher()){log('recovery-refused');closing=true;break;}failures=0;}
   }else if(Date.now()>=nextStart){
    attempts++;everReady=false;log('launcher-start',{attempt:attempts});
    const started=spawn(process.execPath,[dev],{cwd:root,env:process.env,windowsHide:true,stdio:'ignore'});child=started;
    started.on('error',()=>{log('launcher-error');});
    started.on('exit',(code,signal)=>{log('launcher-exit',{code,signal});if(child===started)child=null;nextStart=Date.now()+Math.min(300000,5000*2**Math.min(attempts,6));});
   }
   await sleep(5000);
  }
 }finally{
  // dev.mjs verifies PID, process birth time, command and project before stopping its tree.
  if(child&&!stopLauncher())log('stop-refused');
  log('supervisor-stop');await new Promise(r=>lock.close(r));
 }
}

try{
 if(process.argv.includes('--watch'))await watch();
 else if(process.argv.includes('--stop')){
  writeFileSync(stopFile,'stop\n');const end=Date.now()+30000;while(await guardBusy()){if(Date.now()>end)throw Error('A paragem não foi confirmada. Consulte supervisor.log.');await sleep(500);}
  console.log('Supervisor parado. Para voltar a iniciar, abra PULSO.cmd.');
 }else{
  if(!await guardBusy()){
   const child=spawn(process.execPath,[fileURLToPath(import.meta.url),'--watch'],{cwd:root,env:process.env,detached:true,windowsHide:true,stdio:'ignore'});child.unref();
  }
  const end=Date.now()+150000;
  while(!await ready()){if(Date.now()>end)throw Error('PULSO não ficou disponível. Consulte .local/supervisor.log e dev-lifecycle.log. Nenhum processo desconhecido foi terminado.');await sleep(500);}
  console.log('PULSO disponível: http://localhost:'+web+'/');
 }
}catch(e){console.error(e.message);process.exitCode=1;}
