import {existsSync,readFileSync,writeFileSync,appendFileSync,mkdirSync,statSync,renameSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import net from 'node:net';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const python=resolve(root,'.venv/Scripts/python.exe'),expo=resolve(root,'apps/mobile/node_modules/expo/bin/cli');
const apiPort=Number(process.env.PULSO_API_PORT??8000),webPort=Number(process.env.PULSO_WEB_PORT??8081);
if(![apiPort,webPort].every(p=>Number.isInteger(p)&&p>=1024&&p<=65535)||apiPort===webPort)throw Error('Portas locais inválidas.');
const runDir=resolve(root,process.env.PULSO_RUN_DIR??'.local'),allowed=[resolve(root,'.local'),resolve(root,'tmp')];
if(!allowed.some(p=>runDir===p||runDir.startsWith(p+'\\')))throw Error('Os artefactos operacionais têm de ficar em .local ou tmp.');
const stateFile=resolve(runDir,'dev-runtime.json'),logFile=resolve(runDir,'dev-lifecycle.log');
const apiURL='http://127.0.0.1:'+apiPort,webURL='http://localhost:'+webPort;
const check=process.argv.includes('--check'),status=process.argv.includes('--status'),stopRequested=process.argv.includes('--stop'),children=[];
let stopping=false,runtime;
function lifecycle(event,fields={}){try{mkdirSync(runDir,{recursive:true});if(existsSync(logFile)&&statSync(logFile).size>65536)renameSync(logFile,logFile+'.previous');appendFileSync(logFile,JSON.stringify({at:new Date().toISOString(),event,...fields})+'\n');}catch{console.error('Não foi possível escrever o log operacional.');}}
function persist(){writeFileSync(stateFile,JSON.stringify(runtime,null,2));}
function available(port){return new Promise((ok,no)=>{const s=net.createServer();s.once('error',()=>no(Error('Porta '+port+' ocupada. Use --status e a janela do launcher existente; não termine processos desconhecidos.')));s.listen(port,'127.0.0.1',()=>s.close(ok));});}
function run(exe,args,label,cwd=root){const child=spawn(exe,args,{cwd,stdio:'inherit',windowsHide:true,env:{...process.env,CI:'false',BROWSER:'none',EXPO_PUBLIC_API_PORT:String(apiPort),EXPO_NO_TELEMETRY:'1'}});children.push(child);lifecycle('child-start',{component:label,pid:child.pid});runtime.children.push({component:label,pid:child.pid});persist();child.on('error',e=>{lifecycle('child-error',{component:label,code:e.code??'unknown'});console.error(label+': não foi possível iniciar.');stop(1);});child.on('exit',(code,signal)=>{lifecycle('child-exit',{component:label,code,signal});if(!stopping){console.error(label+' terminou (código '+code+', sinal '+signal+'). Consulte o terminal e o log operacional.');stop(code??1);}});return child;}
function stop(code=0){if(stopping)return;stopping=true;lifecycle('stop',{code});if(runtime){runtime.status='stopped';runtime.endedAt=new Date().toISOString();persist();}for(const c of children){if(!c.pid)continue;if(process.platform==='win32')spawn('taskkill',['/pid',String(c.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});else c.kill('SIGTERM');}setTimeout(()=>process.exit(code),700);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
async function responds(url){try{return (await fetch(url,{signal:AbortSignal.timeout(2000)})).ok;}catch{return false;}}
async function healthy(url,label,ms){const end=Date.now()+ms;while(Date.now()<end){if(stopping)return;if(await responds(url))return;await new Promise(r=>setTimeout(r,300));}throw Error(label+' não ficou disponível no prazo. Consulte o erro no terminal.');}
try{
 if(status||stopRequested){
  if(!existsSync(stateFile)){console.log('Sem sessão registada neste diretório operacional.');process.exit(0);}
  const saved=JSON.parse(readFileSync(stateFile,'utf8'));
  if(stopRequested){
   if(process.platform!=='win32')throw Error('Use Ctrl+C no terminal do launcher.');
   if(!Number.isInteger(saved.pid)||saved.root!==root||!Number.isFinite(saved.birthEpoch))throw Error('Registo de sessão inválido; nenhum processo terminado.');
   const script=String.raw`$pulsoProcess=Get-CimInstance Win32_Process -Filter 'ProcessId=${saved.pid}'; if (!$pulsoProcess) { exit 3 }; $pulsoBorn=[DateTimeOffset](Get-Process -Id ${saved.pid}).StartTime; if ($pulsoProcess.Name -ne 'node.exe' -or $pulsoProcess.CommandLine -notmatch 'scripts[\\/]dev\.mjs' -or $pulsoBorn.ToUnixTimeMilliseconds() -ne ${saved.birthEpoch}) { exit 4 }; & taskkill /PID ${saved.pid} /T /F; exit $LASTEXITCODE`;
   const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{stdio:'inherit',windowsHide:true});
   if(result.status!==0)throw Error('Não foi possível confirmar/terminar a sessão original (código '+result.status+'). Nenhum processo alternativo foi escolhido.');
   saved.status='stopped';saved.endedAt=new Date().toISOString();writeFileSync(stateFile,JSON.stringify(saved,null,2));lifecycle('requested-stop',{pid:saved.pid});console.log('Sessão PULSO terminada.');
  }else{console.log('Sessão registada: '+saved.status+' · PID '+saved.pid+' · iniciada '+saved.startedAt);for(const [label,url]of [['API','http://127.0.0.1:'+saved.apiPort+'/health'],['Web','http://localhost:'+saved.webPort]])console.log(label+': '+(await responds(url)?'responde':'indisponível'));}
 }else{
  if(process.env.EXPO_PUBLIC_PULSO_TEST_DEMO==='true'&&!(process.env.PULSO_TEST_MODE==='synthetic-only'&&process.env.PULSO_DB_PATH&&resolve(process.env.PULSO_DB_PATH).startsWith(resolve(root,'tmp')+'\\')))throw Error('O modo demonstrativo exige base temporária dentro de tmp e configuração explícita.');
  if(!existsSync(python))throw Error('Falta .venv. Instale as dependências Python documentadas.');
  if(!existsSync(expo))throw Error('Faltam dependências da interface. Execute npm.cmd ci em apps/mobile.');
  await available(apiPort);await available(webPort);
  if(check)console.log('Node: '+process.execPath+'\nPython e Expo encontrados. Portas '+apiPort+'/'+webPort+' livres.');
  else{mkdirSync(runDir,{recursive:true});const birth=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',`([DateTimeOffset](Get-Process -Id ${process.pid}).StartTime).ToUnixTimeMilliseconds()`],{encoding:'utf8',windowsHide:true});if(birth.status!==0||!Number.isFinite(Number(birth.stdout.trim())))throw Error('Não foi possível identificar a sessão para paragem segura.');runtime={root,pid:process.pid,birthEpoch:Number(birth.stdout.trim()),startedAt:new Date().toISOString(),apiPort,webPort,status:'starting',children:[]};persist();lifecycle('start',{pid:process.pid,apiPort,webPort});console.log('A iniciar API e interface. Mantenha este terminal aberto; Ctrl+C termina a sessão.');run(python,['-m','uvicorn','services.api.app.main:app','--host','127.0.0.1','--port',String(apiPort),'--no-proxy-headers','--reload','--reload-dir','services/api'],'API');await healthy(apiURL+'/health','API',15000);if(!stopping){run(process.execPath,[expo,'start','--web','--localhost','--port',String(webPort)],'Web',resolve(root,'apps/mobile'));await healthy(webURL,'Interface',120000);if(!stopping){runtime.status='ready';persist();lifecycle('ready');console.log('\nPULSO disponível: '+webURL+'/\nAPI: '+apiURL+'/docs\nEstado: .\\dev.cmd --status · Parar: Ctrl+C ou .\\dev.cmd --stop\nLog operacional: '+logFile+' (sem conteúdo de pedidos).');}}}
 }
}catch(e){console.error('PULSO: '+e.message);lifecycle('launcher-error',{code:e.code??'startup'});if(runtime)stop(1);else process.exitCode=1;}
