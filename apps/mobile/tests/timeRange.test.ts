import test from 'node:test';
import assert from 'node:assert/strict';
import {timeRange,filterTime,drawPoints} from '../src/clinical/timeRange';
import {coordinates,Point} from '../src/clinical/data';
import fixture from '../../../data/synthetic/clinical.json';
import {ClinicalData} from '../src/clinical/data';
test('intervalos inclusivos, datas inválidas e dados ausentes sem modificar a fonte',()=>{
 const source=structuredClone(fixture) as ClinicalData,before=JSON.stringify(source),r=timeRange('custom','2026-05-08','2026-05-08')!;
 assert.ok(filterTime(source,r).results.every(x=>x.measuredAt?.startsWith('2026-05-08')));assert.equal(JSON.stringify(source),before);
 assert.throws(()=>timeRange('custom','2026-02-30','2026-03-01'));assert.throws(()=>timeRange('custom','2026-05-09','2026-05-08'));
 for(const period of ['7','30','90','6m','1y','2y','5y']){const range=timeRange(period,'','',Date.parse('2026-11-08T12:00:00Z'))!;assert.ok(range.min<range.max);assert.equal(range.max,Date.parse('2026-11-08T12:00:00Z'));}
 assert.equal(timeRange('all'),null);
});
test('eixo temporal comum e duplicados legítimos, sem unir unidades ou inventar valores',()=>{
 const points=fixture.results.filter(r=>r.parameter==='glucose'&&r.status==='user_confirmed') as Point[],p=points[0];
 const shared={min:Date.parse(p.measuredAt)-86400000,max:Date.parse(p.measuredAt)+86400000};
 const [a,b]=coordinates([p,{...p,id:'duplicate'}],300,190,undefined,shared);assert.equal(a.x,b.x);assert.equal(a.x,150);
});
test('desenho limitado conserva extremos e fonte completa para a lista',()=>{
 const base=fixture.results[0] as Point,points=Array.from({length:5000},(_,i)=>({...base,id:String(i),value:i===2431?9999:i%7,measuredAt:new Date(1700000000000+i*60000).toISOString()}));
 const drawn=drawPoints(points);assert.ok(drawn.length<=202);assert.ok(drawn.some(p=>p.value===9999));assert.equal(points.length,5000);assert.equal(drawn[0].id,'0');assert.equal(drawn.at(-1)?.id,'4999');
});
