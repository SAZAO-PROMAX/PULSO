import {Candidate,Extraction,ReviewRow,confirmRows} from './importData';
export function reviewState(row:ReviewRow,raw:Candidate,parsed:Extraction){
 const reasons:string[]=[];
 if(!row.include)return {label:'Excluído',attention:false,reasons};
 let invalid=false;
 try{confirmRows('review','review',{...parsed,candidates:[raw]},[{...row,reviewed:true}]);}catch{invalid=true;}
 if(!row.date)reasons.push('Data por confirmar');
 if(!row.method||!row.context)reasons.push('Método ou amostra não indicados');
 if(raw.verification)reasons.push(raw.verification==='text_verified'?'Evidência textual conferida':raw.verification==='visual_unverified'?'Evidência visual a conferir':'Evidência insuficiente: conferir original');
 if(raw.issues.length)reasons.push('Avisos da extração: consultar detalhes');
 const incomplete=!row.value&&!row.missingValue||!row.unit||!row.date;
 return {label:invalid?'Precisa de correção':row.reviewed?'Revisto':incomplete?'Informação incompleta':'Por confirmar',attention:invalid||incomplete||!row.method||!row.context||raw.issues.length>0||!!raw.verification&&raw.verification!=='text_verified',reasons};
}
