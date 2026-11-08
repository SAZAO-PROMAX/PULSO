import {existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import net from 'node:net';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const python=resolve(root,'.venv/Scripts/python.exe'),expo=resolve(root,'apps/mobile/node_modules/expo/bin/cli');
const check=process.argv.includes('--check'),children=[];
let stopping=false;
function available(port){return new Promise((ok,no)=>{const s=net.createServer();s.once('error',()=>no(Error('Porta '+port+' ocupada. Para o servidor anterior na respetiva janela (Ctrl+C), sem abrir outro.')));s.listen(port,'127.0.0.1',()=>s.close(ok));});}
function run(exe,args,cwd=root){const child=spawn(exe,args,{cwd,stdio:'inherit',windowsHide:true,env:{...process.env,CI:'false',BROWSER:'none'}});children.push(child);child.on('error',e=>{console.error(e.message);stop(1);});child.on('exit',code=>{if(!stopping){console.error('Um servidor terminou (código '+code+').');stop(code??0);}});return child;}
function stop(code=0){if(stopping)return;stopping=true;for(const c of children){if(!c.pid)continue;if(process.platform==='win32')spawn('taskkill',['/pid',String(c.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});else c.kill('SIGTERM');}setTimeout(()=>process.exit(code),700);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
async function healthy(){for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:8000/health',{signal:AbortSignal.timeout(500)});if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw Error('A API não arrancou em 10 segundos; consulta o erro acima.');}
try{
 if(!existsSync(python))throw Error('Falta .venv. Executa py -m venv .venv e instala services/api/requirements-dev.txt.');
 if(!existsSync(expo))throw Error('Faltam dependências da interface: entra em apps/mobile e executa npm.cmd ci.');
 await available(8000);await available(8081);
 if(check){console.log('Node: '+process.execPath+'\nPython e Expo encontrados. Portas 8000/8081 livres.');}
 else{run(python,['-m','uvicorn','services.api.app.main:app','--host','127.0.0.1','--port','8000','--no-proxy-headers','--reload','--reload-dir','services/api']);await healthy();if(!stopping){console.log('\nPULSO: http://localhost:8081\nAPI: http://127.0.0.1:8000/docs\nMantém esta janela aberta. Ctrl+C para ambos os servidores.\n');run(process.execPath,[expo,'start','--web','--localhost','--port','8081'],resolve(root,'apps/mobile'));}}
}catch(e){console.error('PULSO: '+e.message);stop(1);}


