import fixture from '../../../../data/synthetic/clinical.json';
import laboratory from '../../../../packages/shared/laboratory.json';
export const parameterLabels = {glucose:'Glicose',ldl:'Colesterol LDL',creatinine:'Creatinina',hemoglobin:'Hemoglobina',hba1c:'Hemoglobina glicada',cholesterol_total:'Colesterol total',hdl:'Colesterol HDL',triglycerides:'Triglicéridos',ferritin:'Ferritina',tsh:'TSH',ft4:'T4 livre',vitamin_d:'Vitamina D',urea:'Ureia',sodium:'Sódio',potassium:'Potássio',systolic:'Tensão sistólica',diastolic:'Tensão diastólica',heart_rate:'Frequência cardíaca',spo2:'Saturação de oxigénio (SpO₂)'} as const;
export type Parameter = keyof typeof parameterLabels;
export const labParameters=laboratory.parameters.map(p=>p.id as Parameter);
export const labUnits=Object.fromEntries(laboratory.parameters.map(p=>[p.id,p.units])) as Partial<Record<Parameter,string[]>>;
export type Confirmation = 'user_declared'|'extracted_pending'|'user_confirmed'|'professional_verified';
export interface MedicalDocument {
 id:string; ownerId:string; synthetic:boolean; title:string; laboratory:string|null;
 issuedAt:string|null; importedAt:string; sha256?:string; parserVersion?:string; processedAt?:string; pageMethods?:{page:number;method:string;state:string}[];original:{fileName:string;mediaType:string;text:string;dataUrl?:string};
}
export interface Result {
 id:string; ownerId:string; synthetic:boolean; parameter:Parameter; value:number|null;
 unit:string; measuredAt:string|null; documentId:string|null; method:string|null; context:string|null;
 source?:'manual'; sessionId?:string; createdAt?:string; laboratory?:string|null;
 evidence?:{page:number|null;excerpt:string;extractedValue:string;extractedUnit:string;originalParameter?:string|null;extractedDate?:string|null;extractedLaboratory?:string|null;extractedMethod?:string|null;extractedContext?:string|null;verification?:string;extractionMethod?:string;model?:string|null;modelDigest?:string|null;ollamaVersion?:string|null;processedAt?:string;collectionDate?:string|null;reportDate?:string|null;region?:{x0:number;y0:number;x1:number;y1:number;units:string}|null};
 datePrecision?:'day';
 referenceText:string|null; status:Confirmation;
}
export interface ClinicalData {schemaVersion:number;documents:MedicalDocument[];results:Result[]}
const statuses:Confirmation[]=['user_declared','extracted_pending','user_confirmed','professional_verified'];
export function validTimestamp(value:unknown):value is string {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value))) return false;
 const [year,month,day]=value.slice(0,10).split('-').map(Number);
 return new Date(Date.UTC(year,month-1,day)).getUTCDate()===day && month>=1 && month<=12;
}
const nonempty=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0;
export function validateData(data:ClinicalData):void {
 if(data?.schemaVersion!==1||!Array.isArray(data.documents)||!Array.isArray(data.results)) throw Error('Versão de dados não suportada.');
 for(const collection of [data.documents,data.results]) {
  if(collection.some(x=>!x||!nonempty(x.id)||!['demo-a','demo-b'].includes(x.ownerId))||new Set(collection.map(x=>x.id)).size!==collection.length) throw Error('Identificadores inválidos ou repetidos.');
 }
 for(const d of data.documents) {
  if(d.synthetic!==true || !d.original || !nonempty(d.original.text) || !nonempty(d.original.fileName)||!nonempty(d.original.mediaType)|| !(d.laboratory===null||nonempty(d.laboratory)) || !(d.issuedAt===null||validTimestamp(d.issuedAt)) || !validTimestamp(d.importedAt)) throw Error('Documento inválido.');
  if(d.original.dataUrl!==undefined && (typeof d.original.dataUrl!=='string'||d.original.dataUrl.length>2900000||!/^data:(?:application\/pdf|image\/png|image\/jpeg);base64,[A-Za-z0-9+/]+=*$/.test(d.original.dataUrl))) throw Error('Original inválido.');
  if(d.sha256!==undefined && !/^[a-f0-9]{64}$/.test(d.sha256)) throw Error('Identificação do PDF inválida.');
 }
 for(const r of data.results) {
  const doc=data.documents.find(d=>d.id===r.documentId && d.ownerId===r.ownerId);
  if((!doc && !(r.documentId===null && r.source==='manual' && nonempty(r.sessionId))) || r.synthetic!==true || !Object.hasOwn(parameterLabels,r.parameter) || !statuses.includes(r.status) ||
    typeof r.unit!=='string' || !(r.method===null||typeof r.method==='string') || !(r.context===null||typeof r.context==='string') || !(r.referenceText===null||typeof r.referenceText==='string') ||
    (r.value!==null&&(typeof r.value!=='number'||!Number.isFinite(r.value))) || (r.measuredAt!==null&&!validTimestamp(r.measuredAt))) throw Error('Resultado ou ligação ao documento inválido.');
  if(r.datePrecision!==undefined&&r.datePrecision!=='day')throw Error('Precisão da data inválida.');
  if(r.source!==undefined&&(r.source!=='manual'||r.documentId!==null||!nonempty(r.sessionId)||r.status!=='user_declared'))throw Error('Proveniência manual inválida.');
  if(r.evidence && ((r.evidence.page!==null&&(!Number.isInteger(r.evidence.page)||r.evidence.page<1))||typeof r.evidence.excerpt!=='string'||typeof r.evidence.extractedValue!=='string'||typeof r.evidence.extractedUnit!=='string')) throw Error('Evidência inválida.');
 }
}
export interface ClinicalRepository {load(ownerId:string):Promise<ClinicalData>}
export class FixtureRepository implements ClinicalRepository {
 constructor(private data:ClinicalData=fixture as ClinicalData){}
 async load(ownerId:string):Promise<ClinicalData> {
  validateData(this.data);
  return JSON.parse(JSON.stringify({...this.data, documents:this.data.documents.filter(d=>d.ownerId===ownerId),results:this.data.results.filter(r=>r.ownerId===ownerId)})) as ClinicalData;
 }
}
export type Point = Result & {value:number;measuredAt:string};
export interface Series {key:string;parameter:Parameter;unit:string;method:string;context:string;points:Point[]}
const canonicalText=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
const units={...labUnits,systolic:['mmHg'],diastolic:['mmHg'],heart_rate:['bpm'],spo2:['%']};
export function canonicalUnit(parameter:Parameter,unit:string){return units[parameter]?.find(u=>u.toLowerCase()===unit.trim().replace(/[µμ]/g,'u').toLowerCase());}
export function exclusionReason(data:ClinicalData,r:Result):string|null {
 if(r.status==='extracted_pending')return 'Pendente de confirmação.';
 if(r.value===null||!Number.isFinite(r.value))return 'Valor em falta; não é inventado um resultado.';
 if(!r.measuredAt||!validTimestamp(r.measuredAt))return 'Data válida em falta.';
 if(!canonicalUnit(r.parameter,r.unit))return 'Unidade não suportada para comparação. Consulta o valor e o documento original.';
 if(!r.method?.trim()||!r.context?.trim())return 'Método ou amostra em falta: não é possível garantir comparabilidade.';
 if(r.source!=='manual'&&!data.documents.some(d=>d.id===r.documentId&&d.ownerId===r.ownerId))return 'Documento de origem indisponível.';
 return null;
}
export function buildSeries(data:ClinicalData,ownerId:string,parameter:Parameter):{series:Series[];omitted:number} {
 const groups=new Map<string,Series>(); let omitted=0;
 for(const r of data.results.filter(r=>r.ownerId===ownerId && r.parameter===parameter)) {
  const doc=data.documents.find(d=>d.id===r.documentId && d.ownerId===ownerId);
  if(r.synthetic!==true||exclusionReason(data,r)) {omitted++;continue;}
  const unit=canonicalUnit(parameter,r.unit)!,method=canonicalText(r.method!),context=canonicalText(r.context!);
  const key=JSON.stringify([r.parameter,unit,method,context]);
  if(!groups.has(key)) groups.set(key,{key,parameter,unit,method,context,points:[]});
  groups.get(key)!.points.push(r as Point);
 }
 for(const g of groups.values()) g.points.sort((a,b)=>Date.parse(a.measuredAt)-Date.parse(b.measuredAt)||a.id.localeCompare(b.id));
 return {series:[...groups.values()].sort((a,b)=>a.key.localeCompare(b.key)),omitted};
}
export function coordinates(points:Point[],width:number,height:number,domain?:{min:number;max:number}) {
 if(!points.length) return [];
 const times=points.map(p=>Date.parse(p.measuredAt)), values=points.map(p=>p.value);
 const minT=Math.min(...times),rangeT=Math.max(...times)-minT;
 const minV=domain?.min??Math.min(...values),rangeV=(domain?.max??Math.max(...values))-minV;
 return points.map((p,i)=>({x:24+(rangeT?(times[i]-minT)/rangeT:0.5)*(width-48),y:24+(rangeV?1-(p.value-minV)/rangeV:0.5)*(height-48)}));
}
export function displayDate(iso:string) {return new Date(iso).toLocaleDateString('pt-PT',{timeZone:'Europe/Lisbon'});}
export function displayTime(iso:string) {return new Date(iso).toLocaleString('pt-PT',{timeZone:'Europe/Lisbon',dateStyle:'short',timeStyle:'short'})+' (Lisboa)';}
export const numberText=(value:number)=>value.toLocaleString('pt-PT',{maximumFractionDigits:6});
export const resultDate=(r:Result)=>!r.measuredAt?'Data não disponível':r.datePrecision==='day'?displayDate(r.measuredAt)+' (hora não fornecida)':displayTime(r.measuredAt);
export const confirmationLabels:Record<Confirmation,string>={user_declared:'Registo manual fictício',user_confirmed:'Confirmado pelo utilizador — sem validação clínica',extracted_pending:'Pendente de revisão',professional_verified:'Fonte profissional verificada'};
