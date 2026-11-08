import React,{useRef,useState} from 'react';

import {Button,Card,Field,T} from '../ui';
import {clinicalRepository} from './repository';

import {localDateTime} from './importData';



function nowLocal(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16);}
export function PressureForm({owner,onSaved}:{owner:string;onSaved:()=>void}){
 const [values,setValues]=useState({systolic:'',diastolic:'',heartRate:'',date:nowLocal()}),[error,setError]=useState(''),[review,setReview]=useState(false),[busy,setBusy]=useState(false);
 const id=useRef('pressure-'+(Date.now().toString(36)+Math.random().toString(36).slice(2))),lock=useRef(false);
 const edit=(key:keyof typeof values)=>(v:string)=>{setValues(x=>({...x,[key]:v}));setReview(false);setError('');};
 async function save(){if(lock.current)return;lock.current=true;setBusy(true);try{await clinicalRepository.savePressure(owner,{...values,date:localDateTime(values.date)},id.current);onSaved();}catch(e){setError(e instanceof Error?e.message:'Não foi possível guardar.');}finally{lock.current=false;setBusy(false);}}
 function prepare(){try{localDateTime(values.date);if(!/^\d{1,3}$/.test(values.systolic)||!/^\d{1,3}$/.test(values.diastolic)||Number(values.systolic)<=0||Number(values.diastolic)<=0||(values.heartRate&&!/^\d{1,3}$/.test(values.heartRate)))throw Error('Preenche sistólica e diastólica com inteiros de 1 a 999; pulsação é opcional.');setReview(true);setError('');}catch(e){setError((e as Error).message);}}
 return <Card><T kind="heading">Registar tensão arterial</T><T kind="small">Só dados fictícios. Uma leitura por gravação, com sessão própria. Não é avaliação clínica.</T>
 <Field label="Sistólica (mmHg)" value={values.systolic} onChange={edit('systolic')}/><Field label="Diastólica (mmHg)" value={values.diastolic} onChange={edit('diastolic')}/><Field label="Frequência cardíaca (bpm, opcional)" value={values.heartRate} onChange={edit('heartRate')}/><Field label="Data e hora local (AAAA-MM-DDTHH:mm)" value={values.date} onChange={edit('date')}/>
 {error&&<T accessibilityRole="alert">{error}</T>}
 {review?<><T>Confirmação: {values.systolic}/{values.diastolic} mmHg{values.heartRate?' · '+values.heartRate+' bpm':''} · {values.date}. Apenas informação fictícia.</T><Button label="Confirmar e guardar medição" primary onPress={save} disabled={busy}/><Button label="Voltar à edição" onPress={()=>setReview(false)} disabled={busy}/></>:<Button label="Rever medição" primary onPress={prepare}/>}
 </Card>;
}

export {DocumentImport as PdfForm} from './DocumentImport';
