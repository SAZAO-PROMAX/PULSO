import {Parameter,Result,labUnits,canonicalUnit} from './data';
export const supportedUnits=labUnits;
export interface Candidate {
 parameter:Parameter|null;originalParameter?:string|null;value:string;numericValue?:number|null;unit:string;normalizedUnit?:string|null;
 referenceText:string|null;method:string|null;context:string|null;page:number|null;excerpt:string;issues:string[];
 date?:string|null;collectionDate?:string|null;reportDate?:string|null;dateKind?:string|null;laboratory?:string|null;
 verification?:string;extractionMethod?:string;model?:string|null;modelDigest?:string|null;ollamaVersion?:string|null;
 region?:{x0:number;y0:number;x1:number;y1:number;units:string}|null;reviewState?:string;
}
export interface Extraction {
 parserVersion:string;sha256:string;laboratory:string|null;date:string|null;text:string;candidates:Candidate[];
 mediaType?:string;reportDate?:string|null;collectionDate?:string|null;processedAt?:string;warnings?:string[];status?:string;
 pages?:{page:number;method:string;state:string}[];
}
export interface ReviewRow {value:string;unit:string;method:string;context:string;include:boolean;reviewed:boolean;date?:string;parameter?:Parameter|null;laboratory?:string;page?:string;missingValue?:boolean}
export const rowLabel=(row:ReviewRow,raw:Candidate)=>row.parameter??raw.parameter;
function dateValue(raw:string|undefined|null){if(!raw)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||!Number.isFinite(Date.parse(raw))||new Date(raw).toISOString().slice(0,10)!==raw)throw Error('Revê as datas: usar AAAA-MM-DD ou deixar vazio quando desconhecida.');return raw;}
export function confirmRows(owner:string,docId:string,parsed:Extraction,rows:ReviewRow[]):Result[] {
 dateValue(parsed.date);
 const chosen=rows.flatMap((row,i)=>row.include?[{row,raw:parsed.candidates[i],i}]:[]);
 if(!chosen.length)throw Error('Escolhe pelo menos um resultado.');
 // Different dates, pages or source rows are legitimate; never collapse by analyte alone.
 const keys=chosen.map(({row,raw})=>JSON.stringify([rowLabel(row,raw),row.date??(raw.date===undefined?parsed.date:raw.date),row.page??raw.page,raw.excerpt,raw.region??null]));
 if(new Set(keys).size!==keys.length)throw Error('Possível linha duplicada: revê e exclui a repetição exata.');
 return chosen.map(({row,raw,i})=>{
  const parameter=rowLabel(row,raw),date=dateValue(row.date??(raw.date===undefined?parsed.date:raw.date));
  const page=row.page===undefined?raw.page:row.page.trim()===''?null:Number(row.page);
  if(page!==null&&(!Number.isInteger(page)||page<1||page>3))throw Error('Página inválida: usar 1 a 3 ou deixar vazia quando desconhecida.');
  if(!parameter||!row.reviewed||(!row.missingValue&&!/^\d+(?:[.,]\d+)?$/.test(row.value))||!canonicalUnit(parameter,row.unit))throw Error('Revê cada linha selecionada, identifica o parâmetro e confere valor e unidade. Podes excluir linhas não resolvidas.');
  return {id:docId+'-'+i,ownerId:owner,synthetic:true,parameter,value:row.missingValue?null:Number(row.value.replace(',','.')),unit:row.unit,
   measuredAt:date?date+'T12:00:00+00:00':null,documentId:docId,method:row.method.trim()||null,context:row.context.trim()||null,
   laboratory:row.laboratory===undefined?(raw.laboratory??parsed.laboratory??null):(row.laboratory.trim()||null),referenceText:raw.referenceText,status:'user_confirmed',datePrecision:'day',
   evidence:{page,excerpt:raw.excerpt,extractedValue:raw.value,extractedUnit:raw.unit,originalParameter:raw.originalParameter,
    extractedDate:raw.date,extractedLaboratory:raw.laboratory,extractedMethod:raw.method,extractedContext:raw.context,
    verification:raw.verification??'legacy',extractionMethod:raw.extractionMethod??'deterministic',model:raw.model,modelDigest:raw.modelDigest,
    ollamaVersion:raw.ollamaVersion,processedAt:parsed.processedAt,collectionDate:raw.collectionDate,reportDate:raw.reportDate,region:page===raw.page?raw.region:null}};
 });
}
export function localDateTime(value:string) {
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw Error('Usa data/hora no formato AAAA-MM-DDTHH:mm.');
 const d=new Date(value);if(!Number.isFinite(d.getTime()))throw Error('Data/hora inválida.');
 const pad=(n:number)=>String(n).padStart(2,'0');
 if(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())!==value)throw Error('Data/hora inexistente.');
 return d.toISOString();
}
