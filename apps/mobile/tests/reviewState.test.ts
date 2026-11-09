import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewState} from '../src/clinical/reviewState';
import {buildSeries} from '../src/clinical/data';
import {confirmRows,Candidate,Extraction,ReviewRow} from '../src/clinical/importData';
const raw:Candidate={parameter:'hdl',value:'52',unit:'mg/dL',date:null,method:'direto',context:'plasma',page:1,excerpt:'HDL | 52 | mg/dL',referenceText:null,issues:[],verification:'source_unverified'};
const parsed:Extraction={parserVersion:'test',sha256:'a'.repeat(64),laboratory:null,date:null,text:'synthetic',candidates:[raw]};
const row:ReviewRow={parameter:'hdl',value:'52',unit:'mg/dL',date:'',method:'direto',context:'plasma',include:true,reviewed:false};
test('estados compactos mantêm ausência e evidência visíveis após revisão',()=>{assert.equal(reviewState(row,raw,parsed).label,'Informação incompleta');assert.ok(reviewState({...row,reviewed:true},raw,parsed).reasons.includes('Data por confirmar'));assert.equal(reviewState({...row,include:false},raw,parsed).label,'Excluído');assert.equal(reviewState({...row,value:''},raw,parsed).label,'Precisa de correção');});
test('lista compacta não confirma por estado visual e conserva valores originais',()=>{assert.throws(()=>confirmRows('demo-a','doc',parsed,[row]));const result=confirmRows('demo-a','doc',parsed,[{...row,reviewed:true,value:'53',date:'2026-11-08'}])[0];assert.equal(result.value,53);assert.equal(result.evidence?.extractedValue,'52');assert.equal(result.evidence?.extractedDate,null);});

test('métodos distintos não são colapsados e campos propostos rejeitados conservam proveniência',()=>{
 const source={...raw,sourceFields:{reportDate:'2026-11-080',collectionDate:null,method:'direto',context:'plasma'}};
 const report={...parsed,candidates:[source,source]};
 const chosen=[{...row,date:'2026-11-08',reviewed:true},{...row,date:'2026-11-08',reviewed:true,method:'outro método autodeclarado'}];
 const results=confirmRows('demo-a','doc',report,chosen);assert.equal(results.length,2);assert.equal(results[0].evidence?.sourceFields?.reportDate,'2026-11-080');
 const series=buildSeries({schemaVersion:1,documents:[{id:'doc',ownerId:'demo-a',synthetic:true,title:'Sintético',laboratory:null,issuedAt:null,importedAt:'2026-11-08T12:00:00Z',original:{fileName:'synthetic.pdf',mediaType:'application/pdf',text:''}}],results},'demo-a','hdl');assert.equal(series.series.length,2);
 assert.throws(()=>confirmRows('demo-a','doc',report,[chosen[0],chosen[0]]));assert.throws(()=>confirmRows('demo-a','doc',report,[chosen[0],{...chosen[0],method:' DIRETO '} ]));
 assert.equal(reviewState(row,{...raw,verification:'visual_unverified'},parsed).reasons.includes('Evidência visual a conferir'),true);
 assert.equal(reviewState(row,{...raw,verification:'text_verified'},parsed).reasons.includes('Evidência textual conferida'),true);
});
