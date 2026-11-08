import test from 'node:test';
import assert from 'node:assert/strict';
import {eventsInRange,groupEvents,HealthEvent} from '../src/clinical/events';
import {validateData} from '../src/clinical/data';
const base:HealthEvent={id:'e1',ownerId:'demo-a',synthetic:true,type:'fall',title:'Fictício',startsAt:'2026-05-08T10:00:00Z',endsAt:'2026-05-10T10:00:00Z',description:'',institution:'',documentIds:[],verification:'user_declared',source:'user_declared',createdAt:'2026-05-08T10:00:00Z',updatedAt:'2026-05-08T10:00:00Z',version:1,previousVersions:[]};
test('eventos no mesmo dia, duração com sobreposição e data sem medições',()=>{
 const events=[base,{...base,id:'e2',startsAt:'2026-05-08T16:00:00Z',endsAt:null},{...base,id:'e3',startsAt:'2026-06-01T16:00:00Z',endsAt:null}];
 assert.equal(groupEvents(events)[0][1].length,2);
 assert.deepEqual(eventsInRange(events,Date.parse('2026-05-09T00:00:00Z'),Date.parse('2026-05-09T23:59:59Z')).map(e=>e.id),['e1']);
 assert.equal(eventsInRange(events,-Infinity,Infinity).length,3);
});
test('validação de eventos, documento do mesmo dono e sem validação profissional fabricada',()=>{
 const data={schemaVersion:1,documents:[],results:[],events:[base]};assert.doesNotThrow(()=>validateData(data));
 assert.throws(()=>validateData({...data,events:[{...base,documentIds:['outro']}]}));
 assert.throws(()=>validateData({...data,events:[{...base,verification:'professional_verified'} as unknown as HealthEvent]}));
});
