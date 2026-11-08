import {ClinicalData,Point} from './data';
export const periods=[['all','Todo o histórico'],['7','7 dias'],['30','30 dias'],['90','90 dias'],['6m','6 meses'],['1y','1 ano'],['2y','2 anos'],['5y','5 anos'],['custom','Personalizado']] as const;
export function validDay(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export function timeRange(period:string,start='',end='',now=Date.now()):{min:number;max:number}|null{
 if(period==='all')return null;
 if(period==='custom'){if(!validDay(start)||!validDay(end)||start>end)throw Error('Escolha datas válidas; a data inicial não pode ser posterior à final.');return {min:Date.parse(start+'T00:00:00Z'),max:Date.parse(end+'T23:59:59.999Z')};}
 const date=new Date(now);if(period.endsWith('m')||period.endsWith('y')){const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()-Number(period.slice(0,-1))*(period.endsWith('y')?12:1));const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));}else date.setTime(now-Number(period)*86400000);
 return {min:date.getTime(),max:now};
}
export function filterTime(data:ClinicalData,range:{min:number;max:number}|null):ClinicalData{return {...data,results:range?data.results.filter(r=>r.measuredAt&&Date.parse(r.measuredAt)>=range.min&&Date.parse(r.measuredAt)<=range.max):data.results};}
export function drawPoints(points:Point[],limit=200){if(points.length<=limit)return points;const indices=new Set([0,points.length-1]);const stride=Math.ceil(points.length/(limit/2));for(let i=0;i<points.length;i+=stride){const bucket=points.slice(i,i+stride);let low=0,high=0;bucket.forEach((p,j)=>{if(p.value<bucket[low].value)low=j;if(p.value>bucket[high].value)high=j;});indices.add(i+low);indices.add(i+high);}return [...indices].sort((a,b)=>a-b).map(i=>points[i]);}
