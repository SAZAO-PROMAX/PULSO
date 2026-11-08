import React,{useRef,useState} from 'react';
import {View,Linking} from 'react-native';
import {Button,Card,Field,T,layout} from '../ui';
import {clinicalRepository,API} from './repository';
import {parameterLabels,MedicalDocument} from './data';
import {Extraction,ReviewRow,confirmRows,localDateTime} from './importData';
import {DocumentView} from './RecordViews';
import {PdfPicker} from './PdfPicker';

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
export function PdfForm({owner,onSaved}:{owner:string;onSaved:()=>void}){
 const [parsed,setParsed]=useState<Extraction|null>(null),[rows,setRows]=useState<ReviewRow[]>([]),[fileData,setFileData]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [selected,setSelected]=useState<File|null>(null),[stage,setStage]=useState('');
 const lock=useRef(false),id=useRef('pdf-'+(Date.now().toString(36)+Math.random().toString(36).slice(2))),active=useRef(true);
 React.useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function read(file:File){
  setError('');setParsed(null);setRows([]);
  if(!file.name.toLowerCase().endsWith('.pdf')||file.size>512*1024){setStage('Erro');setError('Escolhe um PDF sintético até 512 KB.');return;}
  setStage('A enviar documento');setBusy(true);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try{
   const payload=await file.arrayBuffer();
   const response=await new Promise<Response>((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('POST',API+'/demo/extract');xhr.setRequestHeader('Content-Type','application/pdf');xhr.setRequestHeader('X-Pulso-Demo','synthetic-only');xhr.upload.onload=()=>{if(active.current)setStage('A extrair resultados');};xhr.onload=()=>resolve(new Response(xhr.responseText,{status:xhr.status}));xhr.onerror=()=>reject(new TypeError());xhr.onabort=()=>reject(new Error('O pedido demorou demasiado. Tenta novamente.'));controller.signal.addEventListener('abort',()=>xhr.abort(),{once:true});xhr.send(payload);});
   if(!response.ok){const body=await response.json();throw Error(typeof body.detail==='string'?body.detail:'Não foi possível ler este documento. Verifica o ficheiro e tenta novamente.');}
   const data=await response.json() as Extraction;
   const original=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Falha na leitura do ficheiro.'));reader.readAsDataURL(new Blob([payload],{type:'application/pdf'}));});
   if(!active.current)return;
   setStage('Aguarda confirmação');setFileData(original);setParsed(data);setRows(data.candidates.map(c=>({value:c.value,unit:c.unit,method:c.method,context:c.context,include:true,reviewed:false})));
  }catch(e){if(active.current){setStage('Erro');setError(e instanceof Error&&e.name!=='TypeError'?e.message:'Não foi possível contactar o serviço de importação. Inicia o PULSO pelo comando conjunto e tenta novamente.');}}
  finally{clearTimeout(timer);if(active.current)setBusy(false);}
 }
 function change(index:number,patch:Partial<ReviewRow>){setRows(x=>x.map((r,i)=>i===index?{...r,...patch}:r));}
 async function confirm(){if(!parsed||lock.current)return;lock.current=true;setBusy(true);setError('');setStage('A guardar na base local');try{
  const results=confirmRows(owner,id.current,parsed,rows),now=new Date().toISOString();
  const doc:MedicalDocument={id:id.current,ownerId:owner,synthetic:true,title:'PDF laboratorial sintético',laboratory:parsed.laboratory,issuedAt:parsed.date+'T12:00:00+00:00',importedAt:now,sha256:parsed.sha256,parserVersion:parsed.parserVersion,original:{fileName:'laboratorio-'+parsed.sha256.slice(0,12)+'.pdf',mediaType:'application/pdf',text:parsed.text,dataUrl:fileData}};
  await clinicalRepository.confirmDocument(owner,doc,results);if(active.current)onSaved();
 }catch(e){setStage('Erro na gravação');setError((e as Error).message);}finally{lock.current=false;if(active.current)setBusy(false);}}
 return <Card><T kind="heading">Importar PDF sintético</T><T>Usa apenas o modelo PULSO de demonstração com texto selecionável. Máximo 512 KB e 3 páginas. Sem OCR.</T>
 <Button label="Descarregar PDF de exemplo" onPress={()=>void Linking.openURL('/laboratorio-demo.pdf')}/>
 <PdfPicker onFile={file=>{setSelected(file);setParsed(null);setRows([]);setFileData('');setError('');setStage('Ficheiro selecionado');}} disabled={busy}/>
 {selected&&!parsed&&<><T>{selected.name}</T><Button label="Importar PDF" primary disabled={busy} onPress={()=>void read(selected)}/><Button label="Cancelar seleção" disabled={busy} onPress={()=>{setSelected(null);setStage('');setError('');}}/></>}
 {stage&&<T accessibilityLiveRegion="polite">{stage}</T>}
 {error&&<><T accessibilityRole="alert">{error}</T>{selected&&!parsed&&<Button label="Tentar novamente" disabled={busy} onPress={()=>void read(selected)}/>}</>}
 {parsed&&<><T kind="heading">Rever resultados extraídos</T><Field label="Laboratório de origem" value={parsed.laboratory} onChange={laboratory=>{setParsed({...parsed,laboratory});setRows(rows.map(r=>({...r,reviewed:false})));}}/><Field label="Data do exame (AAAA-MM-DD)" value={parsed.date} onChange={date=>{setParsed({...parsed,date});setRows(rows.map(r=>({...r,reviewed:false})));}}/>
 <DocumentView doc={{id:id.current,ownerId:owner,synthetic:true,title:'Revisão',laboratory:parsed.laboratory,issuedAt:parsed.date,importedAt:new Date().toISOString(),original:{fileName:selected?.name??'exame.pdf',mediaType:'application/pdf',text:parsed.text,dataUrl:fileData}}}/><T kind="small">O PDF só fornece a data. A hora não foi medida e não será apresentada como hora clínica. Revê cada linha ou exclui-a. Nada é guardado antes da confirmação.</T>
 {rows.map((r,i)=>{const raw=parsed.candidates[i];return <Card key={i}><T kind="heading">{parameterLabels[raw.parameter]}</T><T>Referência: {raw.referenceText??'Não fornecida'}</T><T kind="small">Página {raw.page} · {raw.excerpt}</T>{raw.issues.map((issue,j)=><T key={j} kind="small">{issue}</T>)}
 <Button label={(r.include?'Excluir ':'Incluir ')+parameterLabels[raw.parameter]} selected={r.include} onPress={()=>change(i,{include:!r.include})}/>
 {r.include&&<><Field label={'Valor '+parameterLabels[raw.parameter]} value={r.value} onChange={value=>change(i,{value,reviewed:false})}/><Field label={'Unidade '+parameterLabels[raw.parameter]} value={r.unit} onChange={unit=>change(i,{unit,reviewed:false})}/><Field label={'Método '+parameterLabels[raw.parameter]} value={r.method} onChange={method=>change(i,{method,reviewed:false})}/><Field label={'Amostra '+parameterLabels[raw.parameter]} value={r.context} onChange={context=>change(i,{context,reviewed:false})}/><Button label={(r.reviewed?'Revisto: ':'Marcar revisto: ')+parameterLabels[raw.parameter]} selected={r.reviewed} onPress={()=>change(i,{reviewed:!r.reviewed})}/></>}
 </Card>;})}
 <Button label="Confirmar e guardar resultados" primary disabled={busy} onPress={confirm}/>
 <Button label="Voltar e corrigir" disabled={busy} onPress={()=>{setParsed(null);setRows([]);setStage('Ficheiro selecionado');}}/>
 <Button label="Cancelar importação" disabled={busy} onPress={()=>{setParsed(null);setRows([]);setFileData('');setSelected(null);setStage('');setError('');}}/>
 </>}
 </Card>;
}





