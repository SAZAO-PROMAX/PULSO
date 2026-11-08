import React,{useRef,useState} from 'react';
import {TextInput} from 'react-native';

import {Button,Card,Field,T} from '../ui';
import {clinicalRepository} from './repository';

import {localDateTime} from './importData';
import {InfoButton} from '../learning/Learning';



function nowLocal(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16);}
export function PressureForm({owner,onSaved}:{owner:string;onSaved:()=>void}){
 const [values,setValues]=useState({systolic:'',diastolic:'',heartRate:'',date:nowLocal()}),[error,setError]=useState(''),[review,setReview]=useState(false),[busy,setBusy]=useState(false);
 const [fieldErrors,setFieldErrors]=useState<Partial<Record<keyof typeof values,string>>>({}),inputs=useRef<Partial<Record<keyof typeof values,TextInput|null>>>({});
 const id=useRef('pressure-'+(Date.now().toString(36)+Math.random().toString(36).slice(2))),lock=useRef(false);
 const edit=(key:keyof typeof values)=>(v:string)=>{setValues(x=>({...x,[key]:v}));setFieldErrors(x=>({...x,[key]:undefined}));setReview(false);setError('');};
 async function save(){if(lock.current)return;lock.current=true;setBusy(true);try{await clinicalRepository.savePressure(owner,{...values,date:localDateTime(values.date)},id.current);onSaved();}catch(e){setError(e instanceof Error?e.message:'Não foi possível guardar.');}finally{lock.current=false;setBusy(false);}}
 function prepare(){
  const errors:typeof fieldErrors={};const whole=(v:string)=>/^\d{1,3}$/.test(v)&&Number(v)>0;
  if(!whole(values.systolic))errors.systolic='Introduz a tensão sistólica: um número inteiro positivo com até três algarismos.';
  if(!whole(values.diastolic))errors.diastolic='Introduz a tensão diastólica: um número inteiro positivo com até três algarismos.';
  if(values.heartRate&&!whole(values.heartRate))errors.heartRate='Introduz a frequência cardíaca com até três algarismos, ou deixa o campo vazio.';
  try{localDateTime(values.date);}catch{errors.date='Confirma a data e a hora. Usa AAAA-MM-DDTHH:mm, por exemplo 2026-11-08T09:30.';}
  setFieldErrors(errors);const first=Object.keys(errors)[0] as keyof typeof values|undefined;
  if(first){setError('Revê os campos assinalados antes de continuar.');setReview(false);setTimeout(()=>inputs.current[first]?.focus(),0);return;}
  setReview(true);setError('');
 }
 return <Card><T kind="heading">Registar tensão arterial</T><T kind="small">Só dados fictícios. Uma leitura por gravação, com sessão própria. Não é avaliação clínica.</T>
 <Field inputRef={node=>{inputs.current.systolic=node;}} error={fieldErrors.systolic} labelAccessory={<InfoButton id="systolic"/>} label="Sistólica (mmHg)" value={values.systolic} onChange={edit('systolic')}/><Field inputRef={node=>{inputs.current.diastolic=node;}} error={fieldErrors.diastolic} labelAccessory={<InfoButton id="diastolic"/>} label="Diastólica (mmHg)" value={values.diastolic} onChange={edit('diastolic')}/><Field inputRef={node=>{inputs.current.heartRate=node;}} error={fieldErrors.heartRate} labelAccessory={<InfoButton id="heart_rate"/>} label="Frequência cardíaca (bpm, opcional)" value={values.heartRate} onChange={edit('heartRate')}/><Field inputRef={node=>{inputs.current.date=node;}} error={fieldErrors.date} label="Data e hora local (AAAA-MM-DDTHH:mm)" value={values.date} onChange={edit('date')}/>
 {!!error&&<T accessibilityRole="alert">{error}</T>}
 {review?<><T>Confirmação: {values.systolic}/{values.diastolic} mmHg{values.heartRate?' · '+values.heartRate+' bpm':''} · {values.date}. Apenas informação fictícia.</T><Button label="Confirmar e guardar medição" primary onPress={save} disabled={busy}/><Button label="Voltar à edição" onPress={()=>setReview(false)} disabled={busy}/></>:<Button label="Rever medição" primary onPress={prepare}/>}
 </Card>;
}

export {DocumentImport as PdfForm} from './DocumentImport';
