import {test} from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=resolve(import.meta.dirname,'../..');
mkdirSync(resolve(root,'tmp'),{recursive:true});
function fixture(remote){
  const cwd=mkdtempSync(resolve(root,'tmp/sync-guard-'));
  mkdirSync(resolve(cwd,'scripts'));
  copyFileSync(resolve(root,'scripts/sync.mjs'),resolve(cwd,'scripts/sync.mjs'));
  for(const args of [['init','-b','main'],['remote','add','origin',remote]]){
    const result=spawnSync('git',args,{cwd,encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stderr);
  }
  return cwd;
}
function run(cwd,mode){return spawnSync(process.execPath,['scripts/sync.mjs',mode],{cwd,encoding:'utf8',windowsHide:true});}

test('recusa origin diferente antes de comunicar com qualquer remoto',()=>{
  const cwd=fixture('https://example.invalid/other/repo.git');
  const head=readFileSync(resolve(cwd,'.git/HEAD'),'utf8');
  const result=run(cwd,'push');
  assert.equal(result.status,1);
  assert.match(result.stderr,/Origin diferente/);
  assert.equal(readFileSync(resolve(cwd,'.git/HEAD'),'utf8'),head);
});

test('recusa pull e push com trabalho sem commit antes do fetch',()=>{
  const cwd=fixture('https://github.com/SAZAO-PROMAX/PULSO.git');
  writeFileSync(resolve(cwd,'trabalho.txt'),'trabalho a preservar');
  for(const mode of ['pull','push']){
    const result=run(cwd,mode);
    assert.equal(result.status,1);
    assert.match(result.stderr,/alterações sem commit/);
  }
  assert.equal(readFileSync(resolve(cwd,'trabalho.txt'),'utf8'),'trabalho a preservar');
});

test('modo desconhecido falha sem alterar o checkout',()=>{
  const cwd=fixture('https://example.invalid/other/repo.git');
  const result=run(cwd,'force');
  assert.equal(result.status,1);
  assert.match(result.stderr,/Usar:/);
});
