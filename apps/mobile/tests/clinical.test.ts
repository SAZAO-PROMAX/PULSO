import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FixtureRepository,buildSeries,coordinates,validateData,Result} from '../src/clinical/data';
import {exclusionReason} from '../src/clinical/data';
async function sample(){return new FixtureRepository().load('demo-a');}
test('datas cronológicas, valores e unidades originais sem mutação',async()=>{
 const data=await sample(),before=JSON.stringify(data);
 const {series,omitted}=buildSeries(data,'demo-a','glucose');
 assert.equal(series.length,2); assert.equal(omitted,1);
 const mg=series.find(s=>s.unit==='mg/dL')!;
 assert.deepEqual(mg.points.map(p=>p.value),[94,101,97]);
 assert.deepEqual(mg.points.map(p=>p.measuredAt),['2026-05-08T09:00:00+01:00','2026-07-19T09:00:00+01:00','2026-10-02T09:00:00+01:00']);
 assert.equal(series.find(s=>s.unit==='mmol/L')!.points[0].value,5.4);
 assert.equal(JSON.stringify(data),before);
});
test('ausência de valor, data, método, contexto ou unidade não é preenchida',async()=>{
 const data=await sample(); const base=data.results.find(r=>r.parameter==='glucose'&&r.status==='user_confirmed')!;
 const patches:Partial<Result>[]=[{value:null},{measuredAt:null},{method:null},{context:null},{unit:''},{value:NaN},{measuredAt:'invalid'}];
 data.results=patches.map((patch,i)=>({...base,...patch,id:String(i)}));
 assert.deepEqual(buildSeries(data,'demo-a','glucose'),{series:[],omitted:7});
});
test('métodos e contextos diferentes não são agregados; desconhecidos não são inferidos',async()=>{
 const data=await sample(),base=data.results.find(r=>r.parameter==='hemoglobin')!;
 data.results=[base,{...base,id:'different-method',method:'outro'},{...base,id:'different-context',context:'outro'}];
 assert.equal(buildSeries(data,'demo-a','hemoglobin').series.length,3);
 assert.equal(buildSeries(data,'demo-a','ldl').series.length,0);
});
test('isolamento e vínculo obrigatório ao documento do mesmo proprietário',async()=>{
 const repo=new FixtureRepository(),a=await repo.load('demo-a'),b=await repo.load('demo-b');
 assert.equal(b.results.length,0);assert.equal(b.documents.length,0);
 assert.equal(buildSeries(a,'demo-b','glucose').series.length,0);
 for(const result of a.results) assert.ok(a.documents.some(d=>d.id===result.documentId&&d.ownerId===result.ownerId));
 a.documents[0].ownerId='demo-b';
 assert.throws(()=>validateData(a));
 await assert.rejects(new FixtureRepository(a).load('demo-a'));
});
test('IDs repetidos e ligações inexistentes são rejeitados',async()=>{
 const data=await sample();
 data.results.push({...data.results[0]});assert.throws(()=>validateData(data));
 data.results.pop();data.results[0].documentId='missing';assert.throws(()=>validateData(data));
});
test('referências, confirmação e documento original preservados; cópia independente',async()=>{
 const repo=new FixtureRepository(),a=await repo.load('demo-a');
 const r=a.results.find(r=>r.parameter==='hemoglobin')!;
 assert.equal(r.referenceText,'12–16 g/dL');assert.equal(r.status,'user_confirmed');
 assert.ok(a.documents.find(d=>d.id===r.documentId)!.original.text.includes('hemoglobin'));
 a.results.length=0;assert.ok((await repo.load('demo-a')).results.length>0);
});
test('séries com zero, um ou vários pontos e distâncias temporais proporcionais',async()=>{
 const data=await sample();
 assert.equal(buildSeries(data,'demo-a','creatinine').series[0].points.length,1);
 assert.deepEqual(coordinates([],300,180),[]);
 const points=buildSeries(data,'demo-a','glucose').series.find(s=>s.unit==='mg/dL')!.points;
 const coords=coordinates(points,300,180);
 assert.ok(coords.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
 assert.ok(coords[0].x<coords[1].x&&coords[1].x<coords[2].x);
 const single=coordinates([points[0]],300,180);assert.deepEqual(single,[{x:150,y:90}]);
 const same=coordinates([points[0],{...points[0],id:'same'}],300,180);
 assert.ok(same.every(p=>p.x===150&&p.y===90));
});
test('ordena instantes com fusos diferentes, conserva zeros e não cria datas intermédias',async()=>{
 const data=await sample(),base=data.results.find(r=>r.parameter==='glucose'&&r.status==='user_confirmed')!;
 data.results=[{...base,id:'later',value:0,measuredAt:'2026-01-01T09:00:00+00:00'},
 {...base,id:'earlier',value:1,measuredAt:'2026-01-01T09:30:00+01:00'}];
 const points=buildSeries(data,'demo-a','glucose').series[0].points;
 assert.deepEqual(points.map(p=>p.id),['earlier','later']);
 assert.deepEqual(points.map(p=>p.value),[1,0]);
 assert.equal(points.length,2);
});
test('cinco datas, laboratórios distintos, duas leituras no mesmo dia e unidade incompatível têm contagens explícitas',async()=>{
 const data=await sample(),base=data.results.find(r=>r.parameter==='glucose'&&r.status==='user_confirmed'&&r.unit==='mg/dL')!;
 const dates=['2026-01-01','2026-02-02','2026-03-03','2026-04-04','2026-05-05'];
 data.results=[2,0,4,1,3].map((i)=>({...base,id:'case-'+i,value:90+i,measuredAt:dates[i]+'T12:00:00Z',documentId:data.documents[i%3].id,method:i%2?' HEXOQUINASE ':'hexoquinase'}));
 data.results.push({...data.results[0],id:'same-day',value:98});
 data.results.push({...data.results[0],id:'unit-other',value:5.4,unit:'mmol/L'});
 data.results.push({...data.results[0],id:'unsupported',unit:'unknown'});
 const result=buildSeries(data,'demo-a','glucose');
 assert.equal(data.results.length,8);assert.equal(result.omitted,1);
 assert.equal(result.series.find(s=>s.unit==='mg/dL')!.points.length,6);
 assert.equal(result.series.find(s=>s.unit==='mmol/L')!.points.length,1);
 assert.match(exclusionReason(data,data.results.at(-1)!)!,/Unidade/);
 assert.deepEqual(result.series.find(s=>s.unit==='mg/dL')!.points.map(p=>p.value),[90,91,92,98,93,94]);
});

