import {FixtureRepository} from './fixtureRepository';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {topics,publishedTopics,topicById,topicForParameter,categories,searchTopics,todayTopic,clinicallyReviewed} from '../src/learning/content';
import {parameterLabels} from '../src/clinical/data';
import {hubSummary} from '../src/hubData';

test('termos dos parâmetros têm ficha pública, fonte, data e relações resolvidas',()=>{
 for(const parameter of Object.keys(parameterLabels) as (keyof typeof parameterLabels)[])assert.ok(topicForParameter(parameter),parameter);
 assert.equal(new Set(topics.map(t=>t.id)).size,topics.length);assert.equal(new Set(topics.map(t=>t.slug)).size,topics.length);
 for(const topic of publishedTopics){
  assert.match(topic.reviewedOn,/^\d{4}-\d{2}-\d{2}$/);assert.equal(topic.clinicalReview,'pending');
  assert.equal(topic.sections.length,6);assert.equal(topic.editorialStatus,'reviewed');assert.equal(clinicallyReviewed(topic),false);
  assert.equal(clinicallyReviewed({...topic,clinicalReview:'reviewed'}),false);
  assert.ok(topic.sources.every(s=>new URL(s.url).protocol==='https:'&&(s.verification==='not_verified'||s.verification==='consulted'&&!!s.checkedOn)));
  assert.ok(topic.related.every(id=>id!==topic.id&&topicById(id)));
 }
 assert.ok(categories.every(c=>searchTopics('',c).length>0));assert.equal(topicById('not-published'),undefined);
});
test('pesquisa aceita acentos, aliases e SpO₂; filtros combinam sem inventar resultados',()=>{
 assert.ok(searchTopics('hemoglobina glicada').some(t=>t.id==='hba1c'));
 assert.ok(searchTopics('trigliceridos').some(t=>t.id==='triglycerides'));
 assert.ok(searchTopics('spo2').some(t=>t.id==='spo2'));assert.ok(searchTopics('SpO₂').some(t=>t.id==='spo2'));
 assert.deepEqual(searchTopics('creatinina','Medicação'),[]);assert.deepEqual(searchTopics('termo inexistente'),[]);
 assert.ok(searchTopics('consulta','Consultas').every(t=>t.category==='Consultas'));
 assert.equal(todayTopic(new Date(2026,10,8)).id,todayTopic(new Date(2026,10,8,23,59)).id);
});
test('resumos do hub contam só o perfil certo e não associam tensões de sessões diferentes',async()=>{
 const data=await new FixtureRepository().load('demo-a');
 const base=data.results.find(r=>r.parameter==='glucose'&&r.value!==null&&r.status!=='extracted_pending')!;
 data.results=[{...base,id:'s1',parameter:'systolic',source:'manual',sessionId:'one',documentId:null,status:'user_declared',value:128,unit:'mmHg',measuredAt:'2026-11-08T10:00:00Z'},
  {...base,id:'d1',parameter:'diastolic',source:'manual',sessionId:'other',documentId:null,status:'user_declared',value:81,unit:'mmHg',measuredAt:'2026-11-08T10:00:00Z'},
  {...base,id:'latest',value:0,measuredAt:'2026-11-08T09:00:00Z'},
  {...base,id:'older',value:90,measuredAt:'2026-01-01T09:00:00Z'},
  {...base,id:'pending',status:'extracted_pending',measuredAt:'2026-11-08T11:00:00Z'},
  {...base,id:'other-profile',ownerId:'demo-b',measuredAt:'2026-11-08T12:00:00Z'}];
 const summary=hubSummary(data,'demo-a');assert.equal(summary.diastolic,undefined);assert.equal(summary.latest.length,1);assert.equal(summary.latest[0].value,0);
 data.results[1].sessionId='one';assert.equal(hubSummary(data,'demo-a').diastolic?.value,81);
 assert.equal(hubSummary({schemaVersion:1,documents:[],results:[]},'demo-b').documents.length,0);
 assert.ok(summary.documents.every(d=>d.ownerId==='demo-a'));
});
