import {Parameter,Result} from './data';
export const supportedUnits:Partial<Record<Parameter,string[]>>={glucose:['mg/dL','mmol/L'],ldl:['mg/dL','mmol/L'],creatinine:['mg/dL','umol/L'],hemoglobin:['g/dL','g/L'],hba1c:['%','mmol/mol']};
export interface Candidate {parameter:Parameter;value:string;unit:string;referenceText:string|null;method:string;context:string;page:number;excerpt:string;issues:string[]}
export interface Extraction {parserVersion:string;sha256:string;laboratory:string;date:string;text:string;candidates:Candidate[]}
export interface ReviewRow {value:string;unit:string;method:string;context:string;include:boolean;reviewed:boolean}
export function confirmRows(owner:string,docId:string,parsed:Extraction,rows:ReviewRow[]):Result[] {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)||!Number.isFinite(Date.parse(parsed.date))||new Date(parsed.date).toISOString().slice(0,10)!==parsed.date||!parsed.laboratory.trim())throw Error('Revê a data do exame e o laboratório de origem.');
 const chosen=rows.flatMap((row,i)=>row.include?[{row,raw:parsed.candidates[i],i}]:[]);
 if(!chosen.length)throw Error('Escolhe pelo menos um resultado.');
 if(new Set(chosen.map(x=>x.raw.parameter)).size!==chosen.length)throw Error('Parâmetro repetido: exclui a linha duplicada antes de confirmar.');
 return chosen.map(({row,raw,i})=>{
  if(!row.reviewed||!/^\d+(?:[.,]\d+)?$/.test(row.value)||!supportedUnits[raw.parameter]?.includes(row.unit)||!row.method.trim()||!row.context.trim())throw Error('Revê cada linha selecionada, valor, unidade, método e amostra. Podes excluir linhas não resolvidas.');
  return {id:docId+'-'+i,ownerId:owner,synthetic:true,parameter:raw.parameter,value:Number(row.value.replace(',','.')),unit:row.unit,measuredAt:parsed.date+'T12:00:00+00:00',documentId:docId,method:row.method,context:row.context,referenceText:raw.referenceText,status:'user_confirmed',datePrecision:'day',evidence:{page:raw.page,excerpt:raw.excerpt,extractedValue:raw.value,extractedUnit:raw.unit}};
 });
}
export function localDateTime(value:string) {
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw Error('Usa data/hora no formato AAAA-MM-DDTHH:mm.');
 const d=new Date(value);if(!Number.isFinite(d.getTime()))throw Error('Data/hora inválida.');
 const pad=(n:number)=>String(n).padStart(2,'0');
 if(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())!==value)throw Error('Data/hora inexistente.');
 return d.toISOString();
}


