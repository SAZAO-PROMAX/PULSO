// Sincronização explícita por entrega. Nunca executa um shell ou force-push.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mode=(process.argv[2]??'status').toLowerCase();
const origin='https://github.com/SAZAO-PROMAX/PULSO.git';
function run(command,args,{allowFailure=false,inherit=false}={}){
  const result=spawnSync(command,args,{cwd:root,encoding:'utf8',windowsHide:true,stdio:inherit?'inherit':'pipe'});
  if(!allowFailure&&(result.error||result.status!==0)){
    if(result.stderr)process.stderr.write(result.stderr);
    throw Error(`${command} ${args[0]} falhou. Nenhuma integração forçada.`);
  }
  return {ok:!result.error&&result.status===0,text:result.stdout?.trim()??''};
}
const git=(args,options)=>run('git',args,options);
try{
  if(!['status','pull','push'].includes(mode))throw Error('Usar: sync.cmd status | pull | push');
  if(git(['remote','get-url','origin']).text!==origin)throw Error('Origin diferente do repositório oficial; operação recusada.');
  const branch=git(['symbolic-ref','--quiet','--short','HEAD']).text;
  if(!branch)throw Error('É necessária uma branch; HEAD destacado recusado.');
  const dirty=git(['status','--porcelain']).text;
  if(mode!=='status'&&dirty)throw Error('Há alterações sem commit. Rever, testar e criar um commit explícito antes de sincronizar.');
  git(['fetch','origin'],{inherit:true});
  const remote=`refs/remotes/origin/${branch}`;
  const remoteExists=git(['show-ref','--verify','--quiet',remote],{allowFailure:true}).ok;
  let ahead=0,behind=0;
  if(remoteExists){
    [ahead,behind]=git(['rev-list','--left-right','--count',`HEAD...${remote}`]).text.split(/\s+/).map(Number);
    console.log(`Branch ${branch}; commits locais por enviar: ${ahead}; remotos por integrar: ${behind}.`);
    if(mode!=='status'&&ahead>0&&behind>0)throw Error('Históricos divergentes. Preservar os dois lados e resolver antes de publicar.');
  }else console.log(`Branch ${branch} ainda sem branch remota.`);
  if(mode==='pull'){
    if(!remoteExists)throw Error('Não existe branch remota para integrar.');
    git(['merge','--ff-only',remote],{inherit:true});
  }
  if(mode==='push'){
    if(behind>0)throw Error('A branch remota tem atualizações. Usar sync.cmd pull antes de publicar.');
    const localPython=resolve(root,'.venv/Scripts/python.exe');
    const python=existsSync(localPython)?localPython:'python';
    // Não substitui checks próprios de alterações à aplicação.
    const fidelityArgs=['-m','services.fidelity.run','--check'];
    if(existsSync(localPython))fidelityArgs.push('--reference');
    run(python,['-m','unittest','discover','-s','tests/fidelity','-q'],{inherit:true});
    run(process.execPath,['--test','tests/fidelity/sync.test.mjs'],{inherit:true});
    run(python,fidelityArgs,{inherit:true});
    git(['push','--set-upstream','origin',branch],{inherit:true});
    const localSha=git(['rev-parse','HEAD']).text;
    const remoteSha=git(['ls-remote','--heads','origin',`refs/heads/${branch}`]).text.split(/\s+/)[0];
    if(localSha!==remoteSha)throw Error('Commit remoto não confirmado. Não declarar sincronização concluída.');
    console.log(`Sincronização confirmada: ${branch} ${localSha}`);
  }
  git(['status','--short','--branch'],{inherit:true});
}catch(error){console.error(`PULSO: ${error.message}`);process.exitCode=1;}
