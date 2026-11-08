import React,{useState,useEffect} from 'react';
import {View,Platform} from 'react-native';
import {Card,T,Button,Field,layout,useTheme} from '../ui';
import {ClinicalData,MedicalDocument,Result,SavedRecord,parameterLabels,displayTime,resultDate,numberText,confirmationLabels,exclusionReason} from './data';
import {originFor,confirmedResults,clinicalRepository,ApiError} from './repository';
import {MedicalTerm,InfoButton} from '../learning/Learning';
import {Classification,registrationCategories,specialties,classificationLabel,documentTime} from './classification';
import {ClassificationFields} from './ClassificationFields';
import {apiFetch} from '../api';
import {EventHistory} from './EventViews';
import {DocumentView} from './DocumentView';
export {DocumentView} from './DocumentView';
export function ResultDetail({data,result:r}:{data:ClinicalData;result:Result}) {
 const doc=data.documents.find(d=>d.id===r.documentId&&d.ownerId===r.ownerId);
 const [previewError,setPreviewError]=useState('');
 async function highlight(){
  const target=window.open('about:blank','_blank');if(target)target.opener=null;
  try{const response=await apiFetch('/demo/profiles/'+r.ownerId+'/preview/'+encodeURIComponent(r.id),{headers:{'X-Pulso-Profile':r.ownerId},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('Região indisponível. Consulta o documento original.');
   const url=URL.createObjectURL(await response.blob());if(target)target.location.href=url;else throw Error('Permite abrir o documento numa nova janela.');setTimeout(()=>URL.revokeObjectURL(url),60000);setPreviewError('');
  }catch(e){target?.close();setPreviewError((e as Error).message);}
 }
 return <View testID="point-detail" style={layout.stack}><T kind="heading">Resultado selecionado</T>
 <MedicalTerm parameter={r.parameter} label={parameterLabels[r.parameter]}/>
 <T>{resultDate(r)} · {r.value===null?'Valor não disponível':numberText(r.value)} {r.unit}</T>
 <T>Origem: {originFor(data,r)}</T><T>Referência do documento: {r.referenceText??'Não fornecida'}</T><T>Estado: {confirmationLabels[r.status]}</T>
 <View style={[layout.row,{alignItems:'center'}]}><T kind="small">O intervalo do laboratório não é um objetivo individual.</T><InfoButton id="read-results" label="Intervalos de referência"/></View>
 {r.sessionId&&<T kind="small">Leitura de uma sessão domiciliária. Sem associação a medições do oxímetro.</T>}
 {r.evidence&&<T kind="small">Página {r.evidence.page??'não indicada'} · Extraído originalmente: {r.evidence.extractedValue} {r.evidence.extractedUnit}</T>}
 {r.evidence&&<><T kind="small">Método de leitura: {r.evidence.extractionMethod??'parser anterior'}{r.evidence.model?' · '+r.evidence.model:''}{r.evidence.ollamaVersion?' · Ollama '+r.evidence.ollamaVersion:''}</T>
 <T kind="small">Nome original: {r.evidence.originalParameter??'Não registado'} · Processado: {r.evidence.processedAt?displayTime(r.evidence.processedAt):'Não registado'}</T>
 <T kind="small">Evidência: {r.evidence.verification==='text_verified'?'associação conferida no texto; confirmação humana mantida':'conferência humana do original necessária'}</T>
 <T kind="small" selectable>{r.evidence.excerpt}</T>
 {Platform.OS==='web'&&r.evidence.region&&r.evidence.verification==='text_verified'&&<Button label="Ver região destacada no documento" onPress={()=>void highlight()}/>}
 {!!previewError&&<T accessibilityRole="alert">{previewError}</T>}</>}
 {doc?<><T kind="small">{doc.title} · Importado {displayTime(doc.importedAt)}</T><DocumentView doc={doc}/></>:<T kind="small">Registo manual sem documento associado.</T>}
 </View>;
}
export function History({data,onChanged,initialRecord,onEvolution,onImport,onPressure,onEvent}:{onImport?:()=>void;onPressure?:()=>void;onEvent?:()=>void;initialRecord?:SavedRecord;onEvolution?:(documentId:string,parameter?:Result['parameter'])=>void;data:ClinicalData;onChanged:(message:string)=>void}) {
 const [selected,setSelected]=useState<string|null>(initialRecord?.kind==='pressure'?data.results.find(r=>r.sessionId===initialRecord.id&&r.parameter==='systolic')?.id??null:null),[selectedDoc,setSelectedDoc]=useState<string|null>(initialRecord?.kind==='document'?initialRecord.id:null);
 const {settings}=useTheme();const [filters,setFilters]=useState(settings.mode==='detailed'),[origin,setOrigin]=useState('');
 const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),[type,setType]=useState('all'),[specialty,setSpecialty]=useState('all'),[period,setPeriod]=useState(0);
 const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');
 const within=(date:string|null)=>!period||!!date&&Date.parse(date)>=Date.now()-period*86400000;
 const documents=data.documents.filter(d=>norm(d.laboratory??'').includes(norm(origin))&&(category==='all'||d.category===category)&&(type==='all'||d.examType===type)&&(specialty==='all'||d.specialties?.includes(specialty))&&within(documentTime(d))&&norm(d.title+' '+(d.laboratory??'')+' '+classificationLabel(d)+' '+data.results.filter(r=>r.documentId===d.id).map(r=>parameterLabels[r.parameter]).join(' ')).includes(norm(query.trim()))).sort((a,b)=>Date.parse(documentTime(b))-Date.parse(documentTime(a))||a.id.localeCompare(b.id));
 const rows=confirmedResults(data).filter(r=>r.source==='manual'?norm('Registo domiciliário').includes(norm(origin))&&(category==='all'||category==='pressure')&&(type==='all'||type==='manual-pressure')&&specialty==='all'&&within(r.measuredAt)&&norm(parameterLabels[r.parameter]+' registo domiciliário').includes(norm(query.trim())):documents.some(d=>d.id===r.documentId));
 const result=data.results.find(r=>r.id===selected),doc=data.documents.find(d=>d.id===selectedDoc);
 useEffect(()=>{if(Platform.OS!=='web'||initialRecord?.kind==='event'&&!doc&&!result)return;const title=document.getElementById(doc||result?'record-detail-title':'history-title');title?.focus({preventScroll:true});title?.scrollIntoView({block:'start'});},[selected,selectedDoc,doc?.version,result?.version]);
 if(doc)return <Card><T kind="heading" nativeID="record-detail-title" tabIndex={-1}>{doc.title}</T><T kind="small">{classificationLabel(doc)} · {doc.laboratory??'Origem não indicada'} · {doc.examDate??displayTime(doc.importedAt)}</T><DocumentView doc={doc}/>{data.results.filter(r=>r.documentId===doc.id).map(r=><View key={r.id} style={layout.stack}><MedicalTerm parameter={r.parameter} label={parameterLabels[r.parameter]+': '+(r.value===null?'—':numberText(r.value))+' '+r.unit}/><T kind="small">{resultDate(r)}{exclusionReason(data,r)?' · '+exclusionReason(data,r):''}</T><Button label={'Ver evolução de '+parameterLabels[r.parameter]} onPress={()=>onEvolution?.(doc.id,r.parameter)}/><Button label={'Consultar resultado '+parameterLabels[r.parameter]} onPress={()=>{setSelectedDoc(null);setSelected(r.id);}}/></View>)}<DocumentActions key={doc.id+'-'+doc.version} doc={doc} count={data.results.filter(r=>r.documentId===doc.id).length} onChanged={onChanged}/><Button label="Voltar ao Histórico" onPress={()=>setSelectedDoc(null)}/></Card>;
 if(result)return <Card><T kind="heading" nativeID="record-detail-title" tabIndex={-1}>Detalhe do registo</T>{result.sessionId&&data.results.filter(r=>r.sessionId===result.sessionId).map(r=><T key={r.id}>{parameterLabels[r.parameter]}: {numberText(r.value!)} {r.unit}</T>)}<ResultDetail data={data} result={result}/><ResultActions key={result.id+'-'+result.version} result={result} onChanged={onChanged}/><Button label="Ver evolução do parâmetro" onPress={()=>onEvolution?.(result.documentId??'',result.parameter)}/><Button label="Voltar ao Histórico" onPress={()=>setSelected(null)}/></Card>;
 return <View style={layout.stack}><T kind="heading" nativeID="history-title" tabIndex={-1}>Registos</T>
 <Field label="Pesquisar no Histórico" value={query} onChange={setQuery} placeholder="Nome, origem, tipo ou parâmetro"/>
 <View style={layout.row}><Button label="Filtros" expanded={filters} selected={filters} onPress={()=>setFilters(!filters)}/><Button label="Acontecimentos" selected={category==='events'} onPress={()=>{setCategory('events');setType('all');}}/></View>
 {filters&&<View style={layout.stack}> <View style={layout.row}><Button label="Todos os registos" selected={category==='all'} onPress={()=>{setCategory('all');setType('all');}}/>{registrationCategories.map(c=><Button key={c.id} label={'Histórico: '+c.label} selected={category===c.id} onPress={()=>{setCategory(c.id);setType('all');setSelected(null);setSelectedDoc(null);}}/>)}</View>
 {category!=='all'&&category!=='events'&&<View style={layout.row}><Button label="Todos os tipos de exame" selected={type==='all'} onPress={()=>setType('all')}/>{registrationCategories.find(c=>c.id===category)?.types.filter(t=>t.mode!=='planned').map(t=><Button key={t.id} label={'Filtrar tipo: '+t.label} selected={type===t.id} onPress={()=>setType(t.id)}/>)}</View>}
 <View style={layout.row}><Button label="Todas as especialidades" selected={specialty==='all'} onPress={()=>setSpecialty('all')}/>{specialties.map(s=><Button key={s.id} label={'Filtrar especialidade: '+s.label} selected={specialty===s.id} onPress={()=>setSpecialty(s.id)}/>)}</View>
 <View style={layout.row}>{[[0,'Todo o período'],[90,'Últimos 90 dias'],[365,'Último ano']].map(([n,label])=><Button key={n} label={String(label)} selected={period===n} onPress={()=>setPeriod(Number(n))}/>)}</View><T kind="small">Período pela data do documento; se desconhecida, pela importação. Documentos antigos sem categoria permanecem em Todos os registos até serem classificados.</T>
<Field label="Filtrar origem" value={origin} onChange={setOrigin}/></View>}
 {(category==='events'||category==='all'&&!!data.events?.length)&&<EventHistory initialEventId={initialRecord?.kind==='event'?initialRecord.id:undefined} data={data} onChanged={onChanged} query={query} period={period}/>}
 {!rows.length&&!documents.length&&category!=='events'&&<Card>{data.results.length||data.documents.length?<T>Nenhum registo corresponde aos filtros.</T>:<><T>Ainda não tem exames guardados.</T><Button label="Adicionar exame" onPress={()=>onImport?.()}/><T>Ainda não existem medições registadas.</T><Button label="Registar medição" onPress={()=>onPressure?.()}/>{!data.events?.length&&<><T>Ainda não existem acontecimentos registados.</T><Button label="Adicionar acontecimento" onPress={()=>onEvent?.()}/></>}</>}</Card>}
 {documents.map(d=><Card key={d.id}><T kind="heading">{d.title}</T><T kind="small">{d.laboratory??'Instituição não indicada'} · {classificationLabel(d)}</T><T kind="small">{d.examDate?'Data do exame: '+d.examDate:'Data do exame não indicada'}</T><Button label={'Gerir exame '+d.title} onPress={()=>{setSelected(null);setSelectedDoc(d.id);}}/></Card>)}
 {rows.map(r=><Card key={r.id} testID="history-record"><MedicalTerm parameter={r.parameter} label={parameterLabels[r.parameter]+': '+(r.value===null?'—':numberText(r.value))+' '+r.unit}/>
 <T kind="small">{resultDate(r)} · {originFor(data,r)}</T>{exclusionReason(data,r)&&<T kind="small">Fora dos gráficos: {exclusionReason(data,r)}</T>}<Button label={'Consultar '+parameterLabels[r.parameter]+' '+resultDate(r)} onPress={()=>{setSelectedDoc(null);setSelected(r.id);}}/></Card>)}
 {data.results.some(r=>r.status==='extracted_pending')&&<Card><T kind="heading">Exemplo pendente</T><T kind="small">Existe um resultado de demonstração pendente. Não é considerado confirmado nem incluído nos gráficos.</T></Card>}
 </View>;
}




function ResultActions({result:r,onChanged}:{result:Result;onChanged:(message:string)=>void}){
 const [version,setVersion]=useState(r.version??1),[conflict,setConflict]=useState(false);
 const [edit,setEdit]=useState(false),[remove,setRemove]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [value,setValue]=useState(r.value===null?'':String(r.value)),[unit,setUnit]=useState(r.unit),[date,setDate]=useState(r.measuredAt??'');
 async function act(work:()=>Promise<void>,message:string){setBusy(true);setError('');try{await work();onChanged(message);}catch(e){setError((e as Error).message);setConflict(e instanceof ApiError&&e.status===409);}finally{setBusy(false);}}
 return <View style={layout.stack}>
 <Button label="Editar medição" disabled={busy} onPress={()=>{setEdit(true);setRemove(false);}}/>
 {edit&&<><Field label="Valor corrigido" value={value} onChange={setValue}/><Field label="Unidade corrigida" value={unit} onChange={setUnit}/><Field label="Data e hora com fuso horário (ISO)" value={date} onChange={setDate}/><T kind="small">O valor anterior e a evidência original são preservados. Se só existia a data, a hora técnica não é uma hora clínica.</T><Button label="Guardar correção" disabled={busy||conflict} onPress={()=>{if(!/^\d+(?:[.,]\d+)?$/.test(value)){setError('Introduz um número válido.');return;}void act(()=>clinicalRepository.editResult(r.ownerId,r.id,{value:Number(value.replace(',','.')),unit,measuredAt:date},version),'Correção guardada.');}}/><Button label="Cancelar correção" disabled={busy} onPress={()=>{setEdit(false);setError('');}}/></>}
 <Button label="Eliminar medição" disabled={busy} onPress={()=>{setRemove(true);setEdit(false);}}/>
 {remove&&<><T>Eliminar apenas esta medição? O exame original e os restantes resultados serão mantidos.</T><Button label="Confirmar eliminação da medição" disabled={busy||conflict} onPress={()=>void act(()=>clinicalRepository.deleteResult(r.ownerId,r.id,version),'Medição eliminada na base local.')}/><Button label="Cancelar eliminação" disabled={busy} onPress={()=>setRemove(false)}/></>}
 {conflict&&<ConflictResolver owner={r.ownerId} kind="result" id={r.id} onVersion={v=>{setVersion(v);setConflict(false);setError('');}}/>}
 {busy&&<T accessibilityLiveRegion="polite">A guardar na base local…</T>}{!!error&&<T accessibilityRole="alert">{error}</T>}
 </View>;
}
function DocumentActions({doc,count,onChanged}:{doc:MedicalDocument;count:number;onChanged:(message:string)=>void}){
 const [version,setVersion]=useState(doc.version??1),[conflict,setConflict]=useState(false);
 const [edit,setEdit]=useState(false),[remove,setRemove]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [title,setTitle]=useState(doc.title),[lab,setLab]=useState(doc.laboratory??'');
 const [classification,setClassification]=useState<Classification>({category:doc.category??'',examType:doc.examType??'',specialties:doc.specialties??[],examDate:doc.examDate??null});
 async function act(work:()=>Promise<void>,message:string){setBusy(true);setError('');try{await work();onChanged(message);}catch(e){setError((e as Error).message);setConflict(e instanceof ApiError&&e.status===409);}finally{setBusy(false);}}
 return <View style={layout.stack}><Button label="Editar exame" disabled={busy} onPress={()=>{setEdit(true);setRemove(false);}}/>
 {edit&&<><Field label="Título do exame" value={title} onChange={setTitle}/><Field label="Laboratório do exame" value={lab} onChange={setLab}/><ClassificationFields value={classification} onChange={setClassification} editableCategory/><Button label="Guardar exame" disabled={busy||conflict} onPress={()=>void act(()=>clinicalRepository.editDocument(doc.ownerId,doc.id,{title,laboratory:lab.trim()||null,specialties:classification.specialties,examDate:classification.examDate,...(classification.category?{category:classification.category,examType:classification.examType}:{})},version),'Exame corrigido na base local.')}/><Button label="Cancelar edição do exame" disabled={busy} onPress={()=>setEdit(false)}/></>}
 <Button label="Eliminar exame completo" disabled={busy} onPress={()=>{setEdit(false);setRemove(true);}}/>
 {remove&&<><T>Eliminar este exame e os {count} resultados associados? O documento original e esses resultados serão eliminados em conjunto; as suas associações a acontecimentos serão removidas, preservando os acontecimentos.</T><Button label="Confirmar eliminação do exame e resultados" disabled={busy||conflict} onPress={()=>void act(()=>clinicalRepository.deleteDocument(doc.ownerId,doc.id,version),'Exame e resultados associados eliminados.')}/><Button label="Cancelar eliminação do exame" disabled={busy} onPress={()=>setRemove(false)}/></>}
 {conflict&&<ConflictResolver owner={doc.ownerId} kind="document" id={doc.id} onVersion={v=>{setVersion(v);setConflict(false);setError('');}}/>}
 {busy&&<T accessibilityLiveRegion="polite">A guardar na base local…</T>}{!!error&&<T accessibilityRole="alert">{error}</T>}
 </View>;
}

function ConflictResolver({owner,kind,id,onVersion}:{owner:string;kind:'document'|'result';id:string;onVersion:(version:number)=>void}){
 const [current,setCurrent]=useState<MedicalDocument|Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){setBusy(true);try{const data=await clinicalRepository.load(owner);const row=(kind==='document'?data.documents:data.results).find(r=>r.id===id);if(!row)throw Error('O registo já não existe. Os teus campos continuam disponíveis; fecha a edição e atualiza o Histórico.');setCurrent(row);setError('');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <Card><T kind="heading">Conflito de edição</T><T>Os teus campos não foram apagados. Consulta o que foi guardado antes de decidir se queres reaplicar as tuas alterações.</T><Button label="Consultar versão atual" disabled={busy} onPress={()=>void refresh()}/>
 {current&&<><T>Versão atual: {current.version??1} · {'title' in current?current.title:current.value===null?'Sem valor':numberText(current.value)+' '+current.unit}</T><T kind="small">{'title' in current?'Origem atual: '+(current.laboratory??'Não indicada'):('Data atual: '+(current.measuredAt??'Não indicada'))}</T><Button label="Usar esta versão como base, mantendo os meus campos" onPress={()=>onVersion(current.version??1)}/></>}{!!error&&<T accessibilityRole="alert">{error}</T>}</Card>;
}
