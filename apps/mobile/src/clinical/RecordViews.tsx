import React,{useState} from 'react';
import {View,Platform} from 'react-native';
import {Card,T,Button,Field,layout} from '../ui';
import {ClinicalData,MedicalDocument,Result,parameterLabels,displayTime,resultDate,numberText,confirmationLabels,exclusionReason} from './data';
import {originFor,confirmedResults,clinicalRepository,API} from './repository';
export function DocumentView({doc}:{doc:MedicalDocument}) {
 const [open,setOpen]=useState(false);
 function openPdf(){
  if(Platform.OS!=='web'||!doc.original.dataUrl)return;
  const raw=atob(doc.original.dataUrl.split(',')[1]);const bytes=Uint8Array.from(raw,x=>x.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([bytes],{type:doc.original.mediaType}));window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 return <View style={layout.stack}><Button label={open?'Fechar documento original':'Ver documento original fictício'} onPress={()=>setOpen(!open)}/>
 {open&&<><T kind="heading">{doc.original.fileName}</T>{doc.original.dataUrl&&<Button label={doc.original.mediaType==='application/pdf'?'Abrir PDF original':'Abrir imagem original'} onPress={openPdf}/>}<T selectable>{doc.original.text}</T></>}</View>;
}
export function ResultDetail({data,result:r}:{data:ClinicalData;result:Result}) {
 const doc=data.documents.find(d=>d.id===r.documentId&&d.ownerId===r.ownerId);
 const [previewError,setPreviewError]=useState('');
 async function highlight(){
  const target=window.open('about:blank','_blank');if(target)target.opener=null;
  try{const response=await fetch(API+'/demo/profiles/'+r.ownerId+'/preview/'+encodeURIComponent(r.id),{headers:{'X-Pulso-Profile':r.ownerId},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('Região indisponível. Consulta o documento original.');
   const url=URL.createObjectURL(await response.blob());if(target)target.location.href=url;else throw Error('Permite abrir o documento numa nova janela.');setTimeout(()=>URL.revokeObjectURL(url),60000);setPreviewError('');
  }catch(e){target?.close();setPreviewError((e as Error).message);}
 }
 return <View testID="point-detail" style={layout.stack}><T kind="heading">Resultado selecionado</T>
 <T>{resultDate(r)} · {r.value===null?'Valor não disponível':numberText(r.value)} {r.unit}</T>
 <T>Origem: {originFor(data,r)}</T><T>Referência do documento: {r.referenceText??'Não fornecida'}</T><T>Estado: {confirmationLabels[r.status]}</T>
 {r.sessionId&&<T kind="small">Leitura de uma sessão domiciliária. Sem associação a medições do oxímetro.</T>}
 {r.evidence&&<T kind="small">Página {r.evidence.page??'não indicada'} · Extraído originalmente: {r.evidence.extractedValue} {r.evidence.extractedUnit}</T>}
 {r.evidence&&<><T kind="small">Método de leitura: {r.evidence.extractionMethod??'parser anterior'}{r.evidence.model?' · '+r.evidence.model:''}{r.evidence.ollamaVersion?' · Ollama '+r.evidence.ollamaVersion:''}</T>
 <T kind="small">Nome original: {r.evidence.originalParameter??'Não registado'} · Processado: {r.evidence.processedAt?displayTime(r.evidence.processedAt):'Não registado'}</T>
 <T kind="small">Evidência: {r.evidence.verification==='text_verified'?'associação conferida no texto; confirmação humana mantida':'conferência humana do original necessária'}</T>
 <T kind="small" selectable>{r.evidence.excerpt}</T>
 {Platform.OS==='web'&&r.evidence.region&&r.evidence.verification==='text_verified'&&<Button label="Ver região destacada no documento" onPress={()=>void highlight()}/>}
 {previewError&&<T accessibilityRole="alert">{previewError}</T>}</>}
 {doc?<><T kind="small">{doc.title} · Importado {displayTime(doc.importedAt)}</T><DocumentView doc={doc}/></>:<T kind="small">Registo manual sem documento associado.</T>}
 </View>;
}
export function History({data,onChanged}:{data:ClinicalData;onChanged:(message:string)=>void}) {
 const [selected,setSelected]=useState<string|null>(null),[selectedDoc,setSelectedDoc]=useState<string|null>(null);
 const rows=confirmedResults(data),result=rows.find(r=>r.id===selected),doc=data.documents.find(d=>d.id===selectedDoc);
 return <View style={layout.stack}><T kind="heading">Registos de demonstração</T><T kind="small">O mesmo histórico alimenta o painel e os gráficos. Pendentes não são resultados confirmados.</T>
 {!rows.length&&<Card><T>Este perfil ainda não tem registos.</T></Card>}
 {data.documents.map(d=><Card key={d.id}><T kind="heading">{d.title}</T><T kind="small">{d.laboratory}</T><Button label={'Gerir exame '+d.title} onPress={()=>{setSelected(null);setSelectedDoc(d.id);}}/></Card>)}
 {doc&&<Card><DocumentView doc={doc}/><DocumentActions doc={doc} count={data.results.filter(r=>r.documentId===doc.id).length} onChanged={onChanged}/><Button label="Fechar exame" onPress={()=>setSelectedDoc(null)}/></Card>}
 {result&&<Card><ResultDetail data={data} result={result}/><ResultActions result={result} onChanged={onChanged}/><Button label="Fechar detalhe" onPress={()=>setSelected(null)}/></Card>}
 {rows.map(r=><Card key={r.id}><T kind="heading">{parameterLabels[r.parameter]}: {r.value===null?'—':numberText(r.value)} {r.unit}</T>
 <T kind="small">{resultDate(r)} · {originFor(data,r)}</T>{exclusionReason(data,r)&&<T kind="small">Fora dos gráficos: {exclusionReason(data,r)}</T>}<Button label={'Consultar '+parameterLabels[r.parameter]+' '+resultDate(r)} onPress={()=>{setSelectedDoc(null);setSelected(r.id);}}/></Card>)}
 {data.results.some(r=>r.status==='extracted_pending')&&<Card><T kind="heading">Exemplo pendente</T><T kind="small">Existe um resultado de demonstração pendente. Não é considerado confirmado nem incluído nos gráficos.</T></Card>}
 </View>;
}




function ResultActions({result:r,onChanged}:{result:Result;onChanged:(message:string)=>void}){
 const [edit,setEdit]=useState(false),[remove,setRemove]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [value,setValue]=useState(r.value===null?'':String(r.value)),[unit,setUnit]=useState(r.unit),[date,setDate]=useState(r.measuredAt??'');
 async function act(work:()=>Promise<void>,message:string){setBusy(true);setError('');try{await work();onChanged(message);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <View style={layout.stack}>
 <Button label="Editar medição" disabled={busy} onPress={()=>{setEdit(true);setRemove(false);}}/>
 {edit&&<><Field label="Valor corrigido" value={value} onChange={setValue}/><Field label="Unidade corrigida" value={unit} onChange={setUnit}/><Field label="Data/hora com fuso (ISO)" value={date} onChange={setDate}/><T kind="small">O valor anterior e a evidência original são preservados. Se só existia a data, a hora técnica não é uma hora clínica.</T><Button label="Guardar correção" disabled={busy} onPress={()=>{if(!/^\d+(?:[.,]\d+)?$/.test(value)){setError('Introduz um número válido.');return;}void act(()=>clinicalRepository.editResult(r.ownerId,r.id,{value:Number(value.replace(',','.')),unit,measuredAt:date}),'Correção confirmada pela API.');}}/><Button label="Cancelar correção" disabled={busy} onPress={()=>{setEdit(false);setError('');}}/></>}
 <Button label="Eliminar medição" disabled={busy} onPress={()=>{setRemove(true);setEdit(false);}}/>
 {remove&&<><T>Eliminar apenas esta medição? O exame original e os restantes resultados serão mantidos.</T><Button label="Confirmar eliminação da medição" disabled={busy} onPress={()=>void act(()=>clinicalRepository.deleteResult(r.ownerId,r.id),'Medição eliminada na base local.')}/><Button label="Cancelar eliminação" disabled={busy} onPress={()=>setRemove(false)}/></>}
 {busy&&<T accessibilityLiveRegion="polite">A guardar na base local…</T>}{error&&<T accessibilityRole="alert">{error}</T>}
 </View>;
}
function DocumentActions({doc,count,onChanged}:{doc:MedicalDocument;count:number;onChanged:(message:string)=>void}){
 const [edit,setEdit]=useState(false),[remove,setRemove]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [title,setTitle]=useState(doc.title),[lab,setLab]=useState(doc.laboratory??'');
 async function act(work:()=>Promise<void>,message:string){setBusy(true);setError('');try{await work();onChanged(message);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <View style={layout.stack}><Button label="Editar exame" disabled={busy} onPress={()=>{setEdit(true);setRemove(false);}}/>
 {edit&&<><Field label="Título do exame" value={title} onChange={setTitle}/><Field label="Laboratório do exame" value={lab} onChange={setLab}/><Button label="Guardar exame" disabled={busy} onPress={()=>void act(()=>clinicalRepository.editDocument(doc.ownerId,doc.id,{title,laboratory:lab}),'Exame corrigido na base local.')}/><Button label="Cancelar edição do exame" disabled={busy} onPress={()=>setEdit(false)}/></>}
 <Button label="Eliminar exame completo" disabled={busy} onPress={()=>{setEdit(false);setRemove(true);}}/>
 {remove&&<><T>Eliminar este exame e os {count} resultados associados? O documento original e esses resultados serão eliminados em conjunto.</T><Button label="Confirmar eliminação do exame e resultados" disabled={busy} onPress={()=>void act(()=>clinicalRepository.deleteDocument(doc.ownerId,doc.id),'Exame e resultados associados eliminados.')}/><Button label="Cancelar eliminação do exame" disabled={busy} onPress={()=>setRemove(false)}/></>}
 {busy&&<T accessibilityLiveRegion="polite">A guardar na base local…</T>}{error&&<T accessibilityRole="alert">{error}</T>}
 </View>;
}
