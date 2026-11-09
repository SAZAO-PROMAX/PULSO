import {Candidate,Extraction,ReviewRow,confirmRows} from './importData';
export function reviewState(row:ReviewRow,raw:Candidate,parsed:Extraction){
 const reasons:string[]=[];
 if(!row.include)return {label:'Excluído',attention:false,reasons};
 let invalid=false;
 try{confirmRows('review','review',{...parsed,candidates:[raw]},[{...row,reviewed:true}]);}catch{invalid=true;}
 if(!row.date)reasons.push('Data por verificar');
 if(!row.method||!row.context)reasons.push('Método ou amostra não indicados');
 if(raw.verification&&raw.verification!=='text_verified')reasons.push('Conferir original');
 if(raw.issues.length)reasons.push('Avisos da extração: consultar detalhes');
 const incomplete=!row.value&&!row.missingValue||!row.unit||!row.date;
 return {label:invalid?'Precisa de correção':row.reviewed?'Revisto':incomplete?'Informação incompleta':'Por confirmar',attention:invalid||incomplete||reasons.length>0,reasons};
}
