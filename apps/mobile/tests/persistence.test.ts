import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ApiRepository,StoragePort} from '../src/clinical/repository';
import {validateData,FixtureRepository} from '../src/clinical/data';
import {confirmRows,Extraction,ReviewRow,localDateTime} from '../src/clinical/importData';
const parsed:Extraction={parserVersion:'test',sha256:'a'.repeat(64),laboratory:'Laboratorio Demo X',date:'2026-11-07',text:'PULSO SYNTHETIC LAB V1',candidates:[{parameter:'glucose',value:'98,5',unit:'mg/dL',referenceText:'70-110',method:'hexoquinase',context:'plasma',page:1,excerpt:'Glicose | 98,5 | mg/dL',issues:[]}]};
const review:ReviewRow={value:'99,2',unit:'mg/dL',method:'hexoquinase',context:'plasma',include:true,reviewed:true};
test('cliente só remove cópia antiga após migração confirmada pelo backend',async()=>{
 const data=await new FixtureRepository().load('demo-a');let value:string|null=JSON.stringify(data),fail=true;const calls:string[]=[];
 const storage:StoragePort={getItem:()=>value,setItem:()=>{},removeItem:()=>{value=null;}};
 const transport:typeof fetch=async(url,options)=>{calls.push(String(url));assert.equal((options?.headers as Record<string,string>)['X-Pulso-Profile'],'demo-a');if(String(url).endsWith('/migrate')&&fail)return new Response(JSON.stringify({detail:'Falha de gravação'}),{status:503});return new Response(JSON.stringify(String(url).endsWith('/data')?data:{migrated:true}));};
 const repo=new ApiRepository(transport,()=>storage);
 await assert.rejects(repo.load('demo-a'),/Falha de gravação/);assert.ok(value);
 fail=false;assert.deepEqual(await repo.load('demo-a'),data);assert.equal(value,null);
 assert.equal(calls.filter(c=>c.endsWith('/migrate')).length,2);
});
test('falha de transporte não declara sucesso nem apaga campos ou originais',async()=>{
 const repo=new ApiRepository(async()=>{throw Error('offline');});
 const input={systolic:'128',diastolic:'81',heartRate:'',date:'2026-11-07T10:00:00Z'};
 await assert.rejects(repo.savePressure('demo-a',input,'sid'),/contactar a API/);
 assert.equal(input.systolic,'128');
});
test('confirmação explícita e correção preservam o extraído original',()=>{
 assert.throws(()=>confirmRows('demo-a','doc',parsed,[{...review,reviewed:false}]));
 assert.throws(()=>confirmRows('demo-a','doc',parsed,[{...review,unit:'unknown'}]));
 const rows=confirmRows('demo-a','doc',parsed,[review]);
 assert.equal(rows[0].value,99.2);assert.equal(rows[0].evidence?.extractedValue,'98,5');assert.equal(rows[0].datePrecision,'day');
});
test('fronteira recusa synthetic textual, datas sem fuso ou inexistentes',async()=>{
 const data=await new FixtureRepository().load('demo-a');
 for(const patch of [{synthetic:'true'},{measuredAt:'2026-11-07'},{measuredAt:'2026-02-30T12:00:00Z'}]){
  const invalid=JSON.parse(JSON.stringify(data));Object.assign(invalid.results[0],patch);assert.throws(()=>validateData(invalid));
 }
 assert.throws(()=>localDateTime('2026-02-30T10:00'));assert.throws(()=>localDateTime('not date'));
});
test('ausências e parâmetro repetido exigem resolução explícita',()=>{
 const duplicate={...parsed,candidates:[parsed.candidates[0],parsed.candidates[0]]};
 assert.throws(()=>confirmRows('demo-a','doc',duplicate,[review,review]));
 assert.equal(confirmRows('demo-a','doc',duplicate,[review,{...review,include:false}]).length,1);
 assert.throws(()=>confirmRows('demo-a','doc',parsed,[{...review,value:'?'}]));
});
