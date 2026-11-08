import {ClinicalData,ClinicalRepository,MedicalDocument,Result,validateData} from './data';
export interface StoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
const host=typeof window!=='undefined'&&window.location?.hostname?window.location.hostname:'127.0.0.1';
export const API=process.env.EXPO_PUBLIC_API_URL??('http://'+(host==='localhost'?'127.0.0.1':host)+':8000');
export class ApiRepository implements ClinicalRepository {
 constructor(private transport:typeof fetch=(...args)=>fetch(...args),private storage?:()=>StoragePort){}
 private async request(owner:string,path:string,method='GET',body?:unknown,version?:number){
  if(!['demo-a','demo-b'].includes(owner))throw Error('Perfil de demonstração inválido.');
  let response:Response;
  try{response=await this.transport(API+'/demo/profiles/'+owner+path,{method,headers:{'Content-Type':'application/json','X-Pulso-Profile':owner,...(version===undefined?{}:{'If-Match':'"'+version+'"'})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});}
  catch{throw Error('Não foi possível ligar ao serviço local. Inicia o PULSO com .\\dev.cmd. Os campos continuam disponíveis para tentar novamente.');}
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new ApiError(typeof payload.detail==='string'?payload.detail:'Não foi possível guardar ou recuperar os dados. Tenta novamente.',response.status);
  return payload;
 }
 async load(owner:string):Promise<ClinicalData>{
  const key='pulso-demo-v2-'+owner;let storage:StoragePort|undefined;
  try{storage=this.storage?.()??(typeof window!=='undefined'?window.localStorage:undefined);}catch{}
  const old=storage?.getItem(key);
  if(old){
   const snapshot=JSON.parse(old) as ClinicalData;validateData(snapshot);
   await this.request(owner,'/migrate','POST',snapshot);
   // Delete the legacy copy only after a successful backend transaction.
   try{storage?.removeItem(key);}catch{}
  }
  const data=await this.request(owner,'/data') as ClinicalData;
  validateData(data);
  if([...data.documents,...data.results].some(r=>r.ownerId!==owner))throw Error('Resposta de perfil inválida.');
  return data;
 }
 async savePressure(owner:string,input:{systolic:string;diastolic:string;heartRate:string;date:string},id:string){await this.request(owner,'/pressure','POST',{...input,id});}
 async confirmDocument(owner:string,document:MedicalDocument,results:Result[]){await this.request(owner,'/confirm','POST',{document,results});}
 async saveDocument(owner:string,document:MedicalDocument){await this.request(owner,'/documents','POST',{document});}
 async reset(owner:string){await this.request(owner,'/reset','POST');}
 async editResult(owner:string,id:string,patch:Partial<Result>,version:number){await this.request(owner,'/result/'+encodeURIComponent(id),'PATCH',patch,version);}
 async deleteResult(owner:string,id:string,version:number){await this.request(owner,'/result/'+encodeURIComponent(id),'DELETE',undefined,version);}
 async editDocument(owner:string,id:string,patch:Partial<MedicalDocument>,version:number){await this.request(owner,'/document/'+encodeURIComponent(id),'PATCH',patch,version);}
 async deleteDocument(owner:string,id:string,version:number){await this.request(owner,'/document/'+encodeURIComponent(id),'DELETE',undefined,version);}
}
export const clinicalRepository=new ApiRepository();
export function confirmedResults(data:ClinicalData){return data.results.filter(r=>r.status!=='extracted_pending').sort((a,b)=>(b.measuredAt?Date.parse(b.measuredAt):-Infinity)-(a.measuredAt?Date.parse(a.measuredAt):-Infinity)||a.id.localeCompare(b.id));}
export function originFor(data:ClinicalData,r:Result){return r.source==='manual'?'Registo domiciliário fictício':r.laboratory??data.documents.find(d=>d.id===r.documentId)?.laboratory??'Origem não indicada';}
