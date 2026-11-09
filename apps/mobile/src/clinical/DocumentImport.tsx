import {DocumentJourney} from './DocumentJourney';
import {useContextStep} from '../editNavigation';
import {reviewState} from './reviewState';
import React,{useEffect,useRef,useState} from 'react';
import {View,Linking,Platform,useWindowDimensions} from 'react-native';
import {Button,Card,Field,T,layout,useTheme} from '../ui';
import {clinicalRepository,API} from './repository';
import {parameterLabels,MedicalDocument,labParameters,SavedRecord} from './data';
import {Extraction,Candidate,ReviewRow,confirmRows,rowLabel} from './importData';
import {DocumentView} from './RecordViews';
import {InputDocument} from './inputDocument';
import {documentDigest} from './documentDigest';
import {PdfPicker} from './PdfPicker';
import {MedicalTerm} from '../learning/Learning';
import {Classification,classificationFor,registrationCategories,validateClassification} from './classification';
import {ClassificationFields} from './ClassificationFields';
import {apiFetch,sessionHeaders} from '../api';
const MAX_BYTES=2*1024*1024;
const mimeFor=(file:InputDocument)=>file.name.toLowerCase().endsWith('.pdf')?'application/pdf':file.name.toLowerCase().endsWith('.png')?'image/png':/\.jpe?g$/i.test(file.name)?'image/jpeg':null;
async function original(file:InputDocument){
 if(!mimeFor(file)||file.size>MAX_BYTES)throw Error('Escolhe um PDF, PNG ou JPEG sintético até 2 MB.');
 const bytes=await file.arrayBuffer(),digest=await documentDigest(bytes);
 const sha=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 const url=file.dataUrl??await new Promise<string>((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=()=>no(Error('Falha na leitura do ficheiro.'));r.readAsDataURL(new Blob([bytes],{type:mimeFor(file)!}));});
 return {bytes,sha,url};
}
export function DocumentImport({owner,onSaved,classification=classificationFor('laboratory','blood'),documentOnly=false,initialDocument=null,onDraftState,onDiscardRequest}:{onDiscardRequest?:(action:()=>void)=>void;onDraftState?:(state:{dirty:boolean;busy:boolean})=>void;owner:string;onSaved:(analysis?:SavedRecord)=>void;classification?:Classification;documentOnly?:boolean;initialDocument?:InputDocument|null}){
 const [metadata,setMetadata]=useState(classification),[title,setTitle]=useState(documentOnly?(registrationCategories.find(c=>c.id===classification.category)?.types.find(t=>t.id===classification.examType)?.label??'Documento sintético'):'Documento laboratorial sintético'),[institution,setInstitution]=useState('');
 const [parsed,setParsed]=useState<Extraction|null>(null),[rows,setRows]=useState<ReviewRow[]>([]),[fileData,setFileData]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [selected,setSelected]=useState<InputDocument|null>(initialDocument),[stage,setStage]=useState(initialDocument?'Ficheiro selecionado':''),[choosing,setChoosing]=useState<number|null>(null),[engine,setEngine]=useState('A verificar o motor local…');
 const [editing,setEditing]=useContextStep('review-editor',null),[editDocument,setEditDocument]=useState(false);
 const {width}=useWindowDimensions(),{colors:c}=useTheme(),previousEditor=useRef<string|null>(null);
 function closeEditor(){setEditing(null);setChoosing(null);}
 useEffect(()=>{if(Platform.OS!=='web')return;const previous=previousEditor.current;previousEditor.current=editing;const target=editing!==null?'review-editor-title':previous!==null?'review-row-'+previous:null;if(target){const node=document.getElementById(target);(node?.querySelector('button')??node)?.focus();}const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&editing!==null){event.preventDefault();closeEditor();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[editing]);
 const baseline=useRef({title,metadata,institution});
 useEffect(()=>{onDraftState?.({dirty:!!selected||!!parsed||title!==baseline.current.title||institution!==baseline.current.institution||JSON.stringify(metadata)!==JSON.stringify(baseline.current.metadata),busy});},[selected,parsed,title,institution,metadata,busy,onDraftState]);
 const lock=useRef(false),id=useRef('doc-'+Date.now().toString(36)+Math.random().toString(36).slice(2)),active=useRef(true);
 const job=useRef<string|null>(null),reading=useRef<AbortController|null>(null),[waiting,setWaiting]=useState(false);
 useEffect(()=>()=>{reading.current?.abort();if(job.current)void apiFetch('/demo/extractions/'+job.current,{method:'DELETE',headers:{'X-Pulso-Profile':owner}}).catch(()=>{});},[owner]);
 useEffect(()=>{active.current=true;if(!documentOnly)apiFetch('/demo/extraction/status',{signal:AbortSignal.timeout(5000)}).then(r=>r.json()).then(s=>{if(active.current)setEngine(s.available?'Motor local disponível · leitura no teu computador':'Motor local indisponível · leitura de texto e introdução manual disponíveis');}).catch(()=>{if(active.current)setEngine('Não foi possível verificar o motor local.');});return()=>{active.current=false;};},[]);
 function setExtraction(data:Extraction,url:string){
  setFileData(url);setParsed(data);setChoosing(null);setEditing(null);
  setRows(data.candidates.map(c=>({parameter:c.parameter,value:c.value,unit:c.unit,method:c.method??'',context:c.context??'',date:(c.date===undefined?data.date:c.date)??'',laboratory:(c.laboratory===undefined?data.laboratory:c.laboratory)??'',include:true,reviewed:false})));
 }
 async function read(file:InputDocument){
  if(reading.current)return;
  setError('');setBusy(true);setStage('A preparar documento');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),360000);reading.current=controller;
  try{
   const source=await original(file);
   const response=await new Promise<Response>((resolve,reject)=>{
    const xhr=new XMLHttpRequest();xhr.open('POST',API+'/demo/extractions');xhr.withCredentials=true;xhr.setRequestHeader('Content-Type',mimeFor(file)!);xhr.setRequestHeader('X-Pulso-Demo','synthetic-only');xhr.setRequestHeader('X-Pulso-Profile',owner);for(const [key,value] of Object.entries(sessionHeaders('POST')))xhr.setRequestHeader(key,value);
    xhr.upload.onload=()=>{if(active.current)setStage('A validar o documento e a disponibilidade da fila.');};
    xhr.onload=()=>resolve(new Response(xhr.responseText,{status:xhr.status}));xhr.onerror=()=>reject(Error('Serviço local indisponível. Inicia o PULSO com .\\dev.cmd e tenta novamente.'));xhr.onabort=()=>reject(Error('Tempo de leitura excedido. Podes repetir ou introduzir manualmente.'));
    controller.signal.addEventListener('abort',()=>xhr.abort(),{once:true});xhr.send(source.bytes);
   });
   let ticket=await response.json();
   if(!response.ok)throw Error(typeof ticket.detail==='string'?ticket.detail:'Não foi possível colocar o documento em espera.');
   job.current=ticket.id;
   while(!['ready','error','cancelled'].includes(ticket.state)){
    if(active.current){setWaiting(ticket.state==='queued');setStage(ticket.state==='queued'?'A aguardar processamento · posição '+ticket.position:'A extrair · leitura local em curso.');}
    await new Promise<void>((resolve,reject)=>{const done=()=>{controller.signal.removeEventListener('abort',abort);resolve();};const timer=setTimeout(done,600);const abort=()=>{clearTimeout(timer);reject(Error('Pedido interrompido. Nada foi guardado.'));};controller.signal.addEventListener('abort',abort,{once:true});if(controller.signal.aborted)abort();});
    const status=await apiFetch('/demo/extractions/'+job.current,{headers:{'X-Pulso-Profile':owner},signal:controller.signal});ticket=await status.json();
    if(!status.ok)throw Error(ticket.detail??'Pedido de leitura indisponível. Podes repetir.');
   }
   if(ticket.state!=='ready')throw Error(ticket.error??'Pedido cancelado. Nada foi guardado.');
   const data:Extraction=ticket.result;job.current=null;
   if(active.current){setExtraction(data,source.url);setStage(data.status==='manual_required'?'Leitura automática não concluída. Podes introduzir os resultados manualmente.':'Aguarda revisão e confirmação');}
  }catch(e){if(active.current){setError((e as Error).message);setStage('A leitura não foi concluída. Nada foi guardado.');}}
  finally{clearTimeout(timer);reading.current=null;if(active.current){setBusy(false);setWaiting(false);}}
 }
 async function cancelWaiting(){if(!job.current)return;try{const response=await apiFetch('/demo/extractions/'+job.current,{method:'DELETE',headers:{'X-Pulso-Profile':owner}});const data=await response.json();if(!response.ok)throw Error(data.detail);setStage('Pedido cancelado. Nada foi guardado.');setWaiting(false);}catch(e){setError((e as Error).message);}}
 async function manual(){
  if(!selected)return;setBusy(true);setError('');
  try{const source=await original(selected);if(active.current){setExtraction({parserVersion:'manual-0.4',sha256:source.sha,mediaType:mimeFor(selected)!,laboratory:null,date:null,text:'[Introdução manual: consultar o documento original.]',candidates:[],status:'manual_required',processedAt:new Date().toISOString()},source.url);setStage('Introdução manual · nada guardado até confirmares.');}}
  catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 function clearDocument(){setSelected(null);setParsed(null);setRows([]);setFileData('');setStage('');setError('');}
 function change(i:number,patch:Partial<ReviewRow>){setError('');setRows(x=>x.map((r,j)=>j===i?{...r,...patch}:r));}
 async function saveOnly(){
  if(!selected||lock.current)return;lock.current=true;setBusy(true);setError('');
  try{const source=await original(selected);const doc:MedicalDocument={id:id.current,ownerId:owner,synthetic:true,title:title.trim(),laboratory:institution.trim()||null,issuedAt:null,importedAt:new Date().toISOString(),...metadata,sha256:source.sha,capture:selected.capture,original:{fileName:selected.name,mediaType:mimeFor(selected)!,text:'[Documento guardado sem extração automática. Consultar o original.]',dataUrl:source.url}};validateClassification(doc);await clinicalRepository.saveDocument(owner,doc);if(active.current)onSaved({kind:'document',id:doc.id});}
  catch(e){if(active.current)setError((e as Error).message);}finally{lock.current=false;if(active.current)setBusy(false);}
 }
 function addRow(){
  if(!parsed)return;
  const candidate:Candidate={parameter:'glucose',originalParameter:null,value:'',unit:'',referenceText:null,method:null,context:null,page:null,excerpt:'',issues:['Introdução manual: conferir parâmetro, valor, unidade, página e data no original.'],extractionMethod:'manual',verification:'manual_source_unverified'};
  setEditing(String(rows.length));setParsed({...parsed,candidates:[...parsed.candidates,candidate]});setRows([...rows,{parameter:'glucose',value:'',unit:'mg/dL',date:parsed.date??'',laboratory:parsed.laboratory??'',method:'',context:'',include:true,reviewed:false}]);
 }
 async function confirm(){
  if(!parsed||lock.current)return;lock.current=true;setBusy(true);setError('');setStage('A guardar na base local');
  try{
   const results=confirmRows(owner,id.current,parsed,rows),now=new Date().toISOString();
   const mime=parsed.mediaType??'application/pdf',extension=mime==='image/png'?'png':mime==='image/jpeg'?'jpg':'pdf';
   const report=parsed.reportDate;
   if(report&&(!/^\d{4}-\d{2}-\d{2}$/.test(report)||!Number.isFinite(Date.parse(report))||new Date(report).toISOString().slice(0,10)!==report))throw Error('Revê a data do relatório.');
   const doc:MedicalDocument={id:id.current,ownerId:owner,synthetic:true,title:title.trim(),laboratory:parsed.laboratory?.trim()||null,...metadata,
    issuedAt:report?report+'T12:00:00Z':null,importedAt:now,sha256:parsed.sha256,parserVersion:parsed.parserVersion,processedAt:parsed.processedAt,
    pageMethods:parsed.pages?.map(p=>({page:p.page,method:p.method,state:p.state})),
    capture:selected?.capture,original:{fileName:selected?.name??'laboratorio-'+parsed.sha256.slice(0,12)+'.'+extension,mediaType:mime,text:parsed.text,dataUrl:fileData}};
   validateClassification(doc);
   await clinicalRepository.confirmDocument(owner,doc,results);if(active.current)onSaved({kind:'document',id:doc.id});
  }catch(e){if(active.current){setError((e as Error).message);setStage('Não foi guardado. Os campos foram preservados.');}}
  finally{lock.current=false;if(active.current)setBusy(false);}
 }
 const preview=parsed?{id:id.current,ownerId:owner,synthetic:true,title:'Revisão',laboratory:parsed.laboratory,issuedAt:null,importedAt:new Date().toISOString(),original:{fileName:selected?.name??'documento',mediaType:parsed.mediaType??'application/pdf',text:parsed.text,dataUrl:fileData}}:null;
 return <Card style={{borderWidth:0,padding:width<600?16:24,gap:20}}><DocumentJourney current={parsed?(busy&&lock.current?3:2):busy?1:0}/>{!parsed&&<><T kind="heading" nativeID="registration-form-title" tabIndex={-1}>{documentOnly?'Guardar documento sintético':'Importar exame sintético'}</T>{!documentOnly&&<T kind="small">{engine}</T>}<T>{documentOnly?'O ficheiro será guardado sem extrair medições nem interpretar o exame.':'A leitura é local e exige sempre revisão humana.'} PDF, PNG ou JPEG fictício · até 2 MB e 3 páginas.</T>
 <Button label="Descarregar PDF de exemplo" variant="tertiary" onPress={()=>void Linking.openURL('/laboratorio-demo.pdf')}/>
 </>}{(!parsed||editDocument)&&<PdfPicker selected={selected} stage={stage} onClear={()=>{if(parsed&&onDiscardRequest)onDiscardRequest(clearDocument);else clearDocument();}} onFile={file=>{if(!mimeFor(file)||file.size>MAX_BYTES){setError('Escolha um PDF, PNG ou JPEG sintético até 2 MB.');return;}setSelected(file);setParsed(null);setRows([]);setFileData('');setError('');setStage('Ficheiro selecionado');}} disabled={busy}/>}
 {selected&&(!parsed||editDocument)&&<><Field label="Nome do documento" value={title} onChange={setTitle}/><ClassificationFields value={metadata} onChange={setMetadata}/>{documentOnly&&<Field label="Instituição de origem (opcional)" value={institution} onChange={setInstitution}/>}</>}
 {selected&&!parsed&&<>{documentOnly?<Button label="Guardar documento" primary disabled={busy} onPress={()=>void saveOnly()}/>:<><Button label="Importar PDF" primary disabled={busy} onPress={()=>void read(selected)}/><Button label="Introduzir resultados manualmente" variant="tertiary" disabled={busy} onPress={()=>void manual()}/></>}</>}
 {!selected&&!!stage&&<T accessibilityLiveRegion="polite">{stage}</T>}{!!error&&<T accessibilityRole="alert">{error}</T>}
 {waiting&&<Button label="Cancelar pedido em espera" onPress={()=>void cancelWaiting()}/>}
 {selected&&!parsed&&!!error&&<Button label="Tentar novamente" disabled={busy} onPress={()=>void(documentOnly?saveOnly():read(selected))}/>}
 {parsed&&<><T kind="heading">Rever resultados do exame</T>
 <T style={{fontWeight:'600'}}>{title}</T>
 <T kind="small">{parsed.date||'Data não identificada'} · {parsed.laboratory||'Instituição não identificada'}</T>
 <T accessibilityLiveRegion="polite">{rows.length} propostas · {rows.filter((r,i)=>reviewState(r,parsed.candidates[i],parsed).attention&&r.include).length} exigem atenção</T>
 <Button label={editDocument?'Fechar dados do exame':'Editar dados do exame'} variant="tertiary" onPress={()=>setEditDocument(!editDocument)}/>
 {editDocument&&<>

 <Field label="Laboratório de origem" value={parsed.laboratory??''} onChange={laboratory=>{setParsed({...parsed,laboratory});setRows(rows.map(r=>({...r,laboratory:r.laboratory===parsed.laboratory||!r.laboratory?laboratory:r.laboratory,reviewed:false})));}}/>
 <Field label="Data do exame (AAAA-MM-DD)" value={parsed.date??''} onChange={date=>{setParsed({...parsed,date});setRows(rows.map(r=>({...r,date:!r.date||r.date===parsed.date?date:r.date,reviewed:false})));}}/>
 <Field label="Data do relatório (opcional)" value={parsed.reportDate??''} onChange={reportDate=>setParsed({...parsed,reportDate})}/>
 </>}
 <View style={{flexDirection:width>=1000?'row':'column',gap:20,alignItems:'stretch'}}>
 {preview&&<View style={{flex:width>=1000?1:undefined,minWidth:0,backgroundColor:width>=1000?c.bg:'transparent',borderRadius:12,padding:width>=1000?16:0,gap:12}}>{width>=1000&&<T kind="small" style={{fontWeight:'700'}}>DOCUMENTO ORIGINAL</T>}<DocumentView key={width>=1000?'desktop':'mobile'} initialOpen={width>=1000} doc={preview}/></View>}
 <View style={{flex:width>=1000?1.4:undefined,minWidth:0,gap:8}}>
 {parsed.warnings?.map((warning,i)=><T kind="small" key={i}>{warning}</T>)}
 <T kind="small">Confira os resultados no original. Datas ou métodos ausentes podem impedir gráficos. A revisão pessoal não é validação clínica.</T>
 {rows.map((r,i)=>{const raw=parsed.candidates[i],p=rowLabel(r,raw),label=p?parameterLabels[p]:'Parâmetro por identificar';const state=reviewState(r,raw,parsed);return <View key={i} testID={'review-result-'+i} style={{borderBottomWidth:1,borderColor:c.line,paddingVertical:14,paddingHorizontal:10,gap:6,borderRadius:10,backgroundColor:editing===String(i)?c.soft:'transparent',borderLeftWidth:editing===String(i)?3:0,borderLeftColor:c.control}}>
 <View style={layout.row}><View style={{flex:1,minWidth:120}}><T kind="small" style={{fontWeight:'600'}}>{label}</T><T style={{fontSize:22,lineHeight:30,fontWeight:'600'}}>{r.missingValue?'Sem valor numérico':r.value||'Valor ausente'} {r.unit||'Unidade ausente'}</T><View style={{alignSelf:'flex-start',paddingHorizontal:8,paddingVertical:2,borderRadius:8,backgroundColor:c.soft}}><T kind="small" style={{fontWeight:'600',color:c.ink}}>{state.label}</T></View>{state.reasons.map(reason=><T kind="small" key={reason}>{reason}</T>)}</View><View nativeID={'review-row-'+i}><Button label="Editar" variant="tertiary" disabled={busy} accessibilityLabel={'Editar resultado '+(i+1)+': '+label} onPress={()=>setEditing(String(i))}/></View></View>

 {editing===String(i)&&<Card style={{borderWidth:0,backgroundColor:c.bg,padding:16}}><T kind="heading" nativeID="review-editor-title" tabIndex={-1}>Rever {label}</T><Button label="← Voltar aos resultados" accessibilityLabel="Voltar aos resultados" variant="tertiary" onPress={closeEditor}/>
 {p?<MedicalTerm parameter={p} label={label}/>:<T kind="heading">{label}</T>}<T kind="small">Nome no original: {raw.originalParameter??'Introdução manual'} · Página {raw.page??'não indicada'}</T>
 <T kind="small">Leitura: {raw.extractionMethod==='deterministic'?'leitura automática de texto':raw.extractionMethod==='manual'?'manual':'modelo local'}{raw.model?' · '+raw.model:''}</T>
 <T kind="small">Campos propostos pelo motor, antes da validação: data de colheita {raw.sourceFields?.collectionDate??'não fornecida'}, data do relatório {raw.sourceFields?.reportDate??'não fornecida'}, método {raw.sourceFields?.method??raw.method??'não fornecido'}, amostra {raw.sourceFields?.context??raw.context??'não fornecida'}. Conferir no original.</T>
 <T>Referência: {raw.referenceText??'Não fornecida'}</T><T kind="small">{raw.excerpt}</T>{raw.issues.map((issue,j)=><T key={j} kind="small">{issue}</T>)}
 <Button label={(r.include?'Excluir ':'Incluir ')+label} variant="tertiary" onPress={()=>{change(i,{include:!r.include});if(r.include)closeEditor();}}/>
 {r.include&&<><Button label={'Parâmetro: '+label} onPress={()=>setChoosing(choosing===i?null:i)}/>
 {choosing===i&&<View style={layout.row}>{labParameters.map(parameter=><Button key={parameter} label={parameterLabels[parameter]} selected={p===parameter} onPress={()=>{change(i,{parameter,reviewed:false});setChoosing(null);}}/>)}</View>}
 <Field label={'Valor '+label} value={r.value} onChange={value=>change(i,{value,missingValue:false,reviewed:false})}/>
 <Button label={(r.missingValue?'Sem valor numérico: ':'Registar sem valor numérico: ')+label} selected={!!r.missingValue} onPress={()=>change(i,{missingValue:!r.missingValue,reviewed:false})}/>
 {r.missingValue&&<T kind="small">Será guardado como valor ausente, sem ponto no gráfico. A representação original é preservada.</T>}
 <Field label={'Unidade '+label} value={r.unit} onChange={unit=>change(i,{unit,reviewed:false})}/>
 <Field label={'Data '+label+' (opcional)'} value={r.date??''} onChange={date=>change(i,{date,reviewed:false})}/>
 <Field label={'Página '+label+' (opcional)'} value={r.page??(raw.page===null?'':String(raw.page))} onChange={page=>change(i,{page,reviewed:false})}/>
 <Field label={'Origem '+label+' (opcional)'} value={r.laboratory??''} onChange={laboratory=>change(i,{laboratory,reviewed:false})}/>
 <Field label={'Método '+label} value={r.method} onChange={method=>change(i,{method,reviewed:false})}/>
 <Field label={'Amostra '+label} value={r.context} onChange={context=>change(i,{context,reviewed:false})}/>
 <Button label={(r.reviewed?'Revisto: ':'Marcar revisto: ')+label} primary={!r.reviewed} selected={r.reviewed} onPress={()=>{if(!r.reviewed){try{confirmRows(owner,id.current,{...parsed,candidates:[raw]},[{...r,reviewed:true}]);}catch(e){setError((e as Error).message);return;}}change(i,{reviewed:!r.reviewed});if(!r.reviewed)closeEditor();}}/></>}
 {preview&&<DocumentView doc={preview}/>}
 </Card>}
 </View>;})}
 </View></View>
 <View style={{gap:12,backgroundColor:c.soft,padding:16,borderRadius:12}}><T>Será guardado: {rows.filter(r=>r.include).length} resultados selecionados, dos quais {rows.filter(r=>r.include&&r.reviewed).length} revistos. {rows.filter(r=>!r.include).length} excluídos. Por rever: {rows.filter(r=>r.include&&!r.reviewed).length}. Com avisos ou informação incompleta: {rows.filter((r,i)=>r.include&&reviewState(r,parsed.candidates[i],parsed).attention).length}.</T>
 <Button label="Adicionar resultado manual" variant="tertiary" disabled={busy} onPress={addRow}/>
 {rows.length===0&&selected&&<Button label="Repetir leitura automática" disabled={busy} onPress={()=>void read(selected)}/>}
 <Button label="Confirmar e guardar resultados" primary disabled={busy||editing!==null} onPress={confirm}/>
 <Button label="Cancelar importação" variant="tertiary" disabled={busy} onPress={()=>{if(onDiscardRequest)onDiscardRequest(clearDocument);else clearDocument();}}/></View>
 </>}
 </Card>;
}
