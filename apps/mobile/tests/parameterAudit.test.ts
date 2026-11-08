import test from 'node:test';
import assert from 'node:assert/strict';
import {parameterLabels,Parameter,labUnits,ClinicalData,Result,buildSeries,coordinates,validateData} from '../src/clinical/data';
import {timeRange,filterTime} from '../src/clinical/timeRange';
for(const parameter of Object.keys(parameterLabels) as Parameter[])test('catálogo completo: gráficos, datas, unidades e ausência — '+parameter,()=>{
 const unit=labUnits[parameter]?.[0]??(parameter==='heart_rate'?'bpm':parameter==='spo2'?'%':'mmHg'),doc={id:'doc',ownerId:'demo-a',synthetic:true,title:'Fictício',laboratory:'Laboratório fictício A',issuedAt:null,importedAt:'2026-11-08T12:00:00Z',original:{fileName:'audit.txt',mediaType:'text/plain',text:'Dados inteiramente fictícios'}};
 const row:Result={id:'a',ownerId:'demo-a',synthetic:true,parameter,value:1.25,unit,measuredAt:'2026-11-08T12:00:00Z',documentId:'doc',method:'método de ensaio',context:'amostra fictícia',referenceText:null,status:'user_confirmed'};
 const data:ClinicalData={schemaVersion:1,documents:[doc],results:[row,{...row,id:'b',measuredAt:'2026-11-07T12:00:00Z'},{...row,id:'duplicate-date',laboratory:'Laboratório fictício B'},{...row,id:'method',method:'outro método'},{...row,id:'context',context:'outra amostra'},{...row,id:'unit',unit:'incompatível'},{...row,id:'date',measuredAt:null},{...row,id:'value',value:null}]};
 validateData(data);const before=JSON.stringify(data),built=buildSeries(data,'demo-a',parameter);assert.equal(built.series.length,3);assert.equal(built.omitted,3);assert.equal(built.series.flatMap(s=>s.points).length,5);assert.equal(buildSeries(data,'demo-b',parameter).series.length,0);
 const primary=built.series.find(s=>s.points.length===3)!;assert.equal(primary.points[0].id,'b');assert.equal(coordinates(primary.points,300,190).length,3);
 const filtered=filterTime(data,timeRange('custom','2026-11-08','2026-11-08'));assert.equal(buildSeries(filtered,'demo-a',parameter).series.flatMap(s=>s.points).length,4);assert.equal(JSON.stringify(data),before);
});
