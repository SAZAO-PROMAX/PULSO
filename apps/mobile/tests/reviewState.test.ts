import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewState} from '../src/clinical/reviewState';
import {confirmRows,Candidate,Extraction,ReviewRow} from '../src/clinical/importData';
const raw:Candidate={parameter:'hdl',value:'52',unit:'mg/dL',date:null,method:'direto',context:'plasma',page:1,excerpt:'HDL | 52 | mg/dL',referenceText:null,issues:[],verification:'source_unverified'};
const parsed:Extraction={parserVersion:'test',sha256:'a'.repeat(64),laboratory:null,date:null,text:'synthetic',candidates:[raw]};
const row:ReviewRow={parameter:'hdl',value:'52',unit:'mg/dL',date:'',method:'direto',context:'plasma',include:true,reviewed:false};
test('estados compactos mantêm ausência e evidência visíveis após revisão',()=>{assert.equal(reviewState(row,raw,parsed).label,'Informação incompleta');assert.ok(reviewState({...row,reviewed:true},raw,parsed).reasons.includes('Data por verificar'));assert.equal(reviewState({...row,include:false},raw,parsed).label,'Excluído');assert.equal(reviewState({...row,value:''},raw,parsed).label,'Precisa de correção');});
test('lista compacta não confirma por estado visual e conserva valores originais',()=>{assert.throws(()=>confirmRows('demo-a','doc',parsed,[row]));const result=confirmRows('demo-a','doc',parsed,[{...row,reviewed:true,value:'53',date:'2026-11-08'}])[0];assert.equal(result.value,53);assert.equal(result.evidence?.extractedValue,'52');assert.equal(result.evidence?.extractedDate,null);});
