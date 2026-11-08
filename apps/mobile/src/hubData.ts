import {ClinicalData,labParameters,validTimestamp} from './clinical/data';
import {confirmedResults} from './clinical/repository';

// Counts and chronology only. No thresholds, risk classifications or inferred pairs.
export function hubSummary(data:ClinicalData,ownerId:string){
 const documents=data.documents.filter(d=>d.ownerId===ownerId).slice().sort((a,b)=>Date.parse(b.importedAt)-Date.parse(a.importedAt));
 const results=confirmedResults(data).filter(r=>r.ownerId===ownerId&&r.value!==null&&validTimestamp(r.measuredAt));
 const seen=new Set<string>();
 const latest=results.filter(r=>{if(!labParameters.includes(r.parameter)||seen.has(r.parameter))return false;seen.add(r.parameter);return true;});
 const systolic=results.find(r=>r.parameter==='systolic');
 const diastolic=systolic?.sessionId?results.find(r=>r.parameter==='diastolic'&&r.sessionId===systolic.sessionId&&r.measuredAt===systolic.measuredAt&&r.unit===systolic.unit):undefined;
 return {documents,latest,systolic,diastolic};
}
