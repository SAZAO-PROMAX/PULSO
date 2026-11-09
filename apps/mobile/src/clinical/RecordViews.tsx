import {useContextStep,useEditGuard,confirmLeave} from '../editNavigation';
import React,{useState,useEffect} from 'react';
import {View,Platform} from 'react-native';
import {Card,T,Button,Field,Select,layout,useTheme} from '../ui';
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
 const [selected,setSelected]=useContextStep('history-result',initialRecord?.kind==='pressure'?data.results.find(r=>r.sessionId===initialRecord.id&&r.parameter==='systolic')?.id??null:null),[selectedDoc,setSelectedDoc]=useContextStep('history-document',initialRecord?.kind==='document'?initialRecord.id:null);
 const [returnDoc,setReturnDoc]=useState<string|null>(null);
 const [filters,setFilters]=useState(false),[origin,setOrigin]=useState('');
 const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),[type,setType]=useState('all'),[specialty,setSpecialty]=useState('all'),[period,setPeriod]=useState(0);
 const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');
 const within=(date:string|null)=>!period||!!date&&Date.parse(date)>=Date.now()-period*86400000;
 const documents=data.documents.filter(d=>norm(d.laboratory??'').includes(norm(origin))&&(category==='all'||d.category===category)&&(type==='all'||d.examType===type)&&(specialty==='all'||d.specialties?.includes(specialty))&&within(documentTime(d))&&norm(d.title+' '+(d.laboratory??'')+' '+classificationLabel(d)+' '+data.results.filter(r=>r.documentId===d.id).map(r=>parameterLabels[r.parameter]).join(' ')).includes(norm(query.trim()))).sort((a,b)=>Date.parse(documentTime(b))-Date.parse(documentTime(a))||a.id.localeCompare(b.id));
 const rows=confirmedResults(data).filter(r=>r.source==='manual'?norm('Registo domiciliário').includes(norm(origin))&&(category==='all'||category==='pressure')&&(type==='all'||type==='manual-pressure')&&specialty==='all'&&within(r.measuredAt)&&norm(parameterLabels[r.parameter]+' registo domiciliário').includes(norm(query.trim())):documents.some(d=>d.id===r.documentId));
 const result=data.results.find(r=>r.id===selected),doc=data.documents.find(d=>d.id===selectedDoc);
 useEffect(()=>{if(Platform.OS!=='web'||initialRecord?.kind==='event'&&!doc&&!result)return;const title=document.getElementById(doc||result?'record-detail-title':'history-title');title?.focus({preventScroll:true});title?.scrollIntoView({block:'start'});},[selected,selectedDoc,doc?.version,result?.version]);
 if(doc)return <Card><T kind="heading" nativeID="record-detail-title" tabIndex={-1}>{doc.title}</T><T kind="small">{classificationLabel(doc)} · {doc.laboratory??'Origem não indicada'} · {doc.examDate??displayTime(doc.importedAt)}</T><DocumentView doc={doc}/>{data.results.filter(r=>r.documentId===doc.id).map(r=><View key={r.id} style={layout.stack}><MedicalTerm parameter={r.parameter} label={parameterLabels[r.parameter]+': '+(r.value===null?'—':numberText(r.value))+' '+r.unit}/><T kind="small">{resultDate(r)}{exclusionReason(data,r)?' · '+exclusionReason(data,r):''}</T><Button label={'Ver evolução de '+parameterLabels[r.parameter]} onPress={()=>onEvolution?.(doc.id,r.parameter)}/><Button label={'Consultar resultado '+parameterLabels[r.parameter]} onPress={()=>{setReturnDoc(doc.id);setSelectedDoc(null);setSelected(r.id);}}/></View>)}<DocumentActions key={doc.id+'-'+doc.version} doc={doc} count={data.results.filter(r=>r.documentId===doc.id).length} onChanged={onChanged}/><Button label="← Voltar ao Histórico" accessibilityLabel="Voltar ao Histórico" onPress={()=>{if(confirmLeave())setSelectedDoc(null);}}/></Card>;
 if(result)return <Card><T kind="heading" nativeID="record-detail-title" tabIndex={-1}>Detalhe do registo</T>{result.sessionId&&data.results.filter(r=>r.sessionId===result.sessionId).map(r=><T key={r.id}>{parameterLabels[r.parameter]}: {numberText(r.value!)} {r.unit}</T>)}<ResultDetail data={data} result={result}/><ResultActions key={result.id+'-'+result.version} result={result} onChanged={onChanged}/><Button label="Ver evolução do parâmetro" onPress={()=>onEvolution?.(result.documentId??'',result.parameter)}/><Button label={returnDoc?"← Voltar ao exame":"← Voltar ao Histórico"} accessibilityLabel={returnDoc?"Voltar ao exame":"Voltar ao Histórico"} onPress={()=>{if(confirmLeave()){setSelected(null);if(returnDoc)setSelectedDoc(returnDoc);}}}/></Card>;
 return <View style={layout.stack}><T kind="heading" nativeID="history-title" tabIndex={-1}>Registos</T>
 <Field label="Pesquisar no Histórico" value={query} onChange={setQuery} placeholder="Nome, origem, tipo ou parâmetro"/>
 <View style={layout.row}><View style={layout.grow}><Select label="Categoria" value={category} options={[{value:'all',label:'Todos os registos'},...registrationCategories.map(c=>({value:c.id,label:c.label})),{value:'events',label:'Acontecimentos'}]} onChange={value=>{setCategory(value);setType('all');}}/></View><View style={layout.grow}><Select label="Período" value={String(period)} options={[{value:'0',label:'Todo o período'},{value:'90',label:'Últimos 90 dias'},{value:'365',label:'Último ano'}]} onChange={v=>setPeriod(Number(v))}/></View></View>
 <View style={layout.row}><Button label="Mais filtros" variant="tertiary" expanded={filters} selected={filters} onPress={()=>setFilters(!filters)}/></View>
 {filters&&<Card><View style={layout.row}><View style={layout.grow}><Select label="Tipo de exame" value={type} options={[{value:'all',label:'Todos os tipos'},...(registrationCategories.find(c=>c.id===category)?.types.filter(t=>t.mode!=='planned').map(t=>({value:t.id,label:t.label}))??[])]} onChange={setType}/></View><View style={layout.grow}><Select label="Especialidade" value={specialty} options={[{value:'all',label:'Todas as especialidades'},...specialties.map(s=>({value:s.id,label:s.label}))]} onChange={setSpecialty}/></View></View><Field label="Filtrar origem" value={origin} onChange={setOrigin}/><T kind="small">Período pela data do documento; se desconhecida, pela importação. Documentos sem categoria permanecem em Todos os registos.</T></Card>}
 {!!(query||category!=='all'||type!=='all'||specialty!=='all'||period!==0||origin)&&<View style={layout.row}>
 {!!query&&<Button label={'Pesquisa: '+query+' ×'} accessibilityLabel="Remover pesquisa" variant="chip" onPress={()=>setQuery('')}/>}
 {category!=='all'&&<Button label={(registrationCategories.find(c=>c.id===category)?.label??'Acontecimentos')+' ×'} accessibilityLabel="Remover categoria" variant="chip" onPress={()=>{setCategory('all');setType('all');}}/>}
 {type!=='all'&&<Button label={(registrationCategories.flatMap(c=>c.types).find(t=>t.id===type)?.label??type)+' ×'} accessibilityLabel="Remover tipo de exame" variant="chip" onPress={()=>setType('all')}/>}
 {specialty!=='all'&&<Button label={(specialties.find(s=>s.id===specialty)?.label??specialty)+' ×'} accessibilityLabel="Remover especialidade" variant="chip" onPress={()=>setSpecialty('all')}/>}
 {!!period&&<Button label={(period===90?'Últimos 90 dias':'Último ano')+' ×'} accessibilityLabel="Remover período" variant="chip" onPress={()=>setPeriod(0)}/>}
 {!!origin&&<Button label={origin+' ×'} accessibilityLabel="Remover origem" variant="chip" onPress={()=>setOrigin('')}/>}
 <Button label="Limpar filtros" variant="tertiary" onPress={()=>{setQuery('');setCategory('all');setType('all');setSpecialty('all');setPeriod(0);setOrigin('');}}/></View>}
 {(category==='events'||category==='all'&&!!data.events?.length)&&<EventHistory initialEventId={initialRecord?.kind==='event'?initialRecord.id:undefined} data={data} onChanged={onChanged} query={query} period={period}/>}
 {!rows.length&&!documents.length&&category!=='events'&&!(category==='all'&&data.events?.length)&&<Card>{data.results.length||data.documents.length||query||category!=='all'||origin||period||type!=='all'||specialty!=='all'?<T>Nenhum registo corresponde aos filtros.</T>:<><T kind="heading">O seu histórico começa aqui.</T><T kind="small">Adicione um exame, uma medição ou um acontecimento para os consultar aqui.</T><View style={layout.row}><Button label="Adicionar exame" primary onPress={()=>onImport?.()}/><Button label="Registar medição" variant="tertiary" onPress={()=>onPressure?.()}/><Button label="Adicionar acontecimento" variant="tertiary" onPress={()=>onEvent?.()}/></View></>}</Card>}
 {documents.map(d=><Card key={d.id}><T kind="heading">{d.title}</T><T kind="small">{d.laboratory??'Instituição não indicada'} · {classificationLabel(d)}</T><T kind="small">{d.examDate?'Data do exame: '+d.examDate:'Data do exame não indicada'}</T><Button label="Abrir exame" accessibilityLabel={'Gerir exame '+d.title} variant="tertiary" onPress={()=>{setSelected(null);setSelectedDoc(d.id);}}/></Card>)}
 {rows.map(r=><Card key={r.id} testID="history-record"><MedicalTerm parameter={r.parameter} label={parameterLabels[r.parameter]+': '+(r.value===null?'—':numberText(r.value))+' '+r.unit}/>
 <T kind="small">{resultDate(r)} · {originFor(data,r)}</T>{exclusionReason(data,r)&&<T kind="small">Fora dos gráficos: {exclusionReason(data,r)}</T>}<Button label="Ver resultado" accessibilityLabel={'Consultar '+parameterLabels[r.parameter]+' '+resultDate(r)} variant="tertiary" onPress={()=>{setSelectedDoc(null);setSelected(r.id);}}/></Card>)}
 {data.results.some(r=>r.status==='extracted_pending')&&<Card><T kind="heading">Exemplo pendente</T><T kind="small">Existe um resultado de demonstração pendente. Não é considerado confirmado nem incluído nos gráficos.</T></Card>}
 </View>;
}




function ResultActions({result:r,onChanged}:{result:Result;onChanged:(message:string)=>void}){
 const [version,setVersion]=useState(r.version??1),[conflict,setConflict]=useState(false);
 const [edit,setEdit]=useState(false),[remove,setRemove]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [value,setValue]=useState(r.value===null?'':String(r.value)),[unit,setUnit]=useState(r.unit),[date,setDate]=useState(r.measuredAt??'');
 const guard=useEditGuard({value,unit,date},busy);
 async function act(work:()=>Promise<void>,message:string){setBusy(true);setError('');try{await work();guard.reset();onChanged(message);}catch(e){setError((e as Error).message);setConflict(e instanceof ApiError&&e.status===409);}finally{setBusy(false);}}
 return <View style={layout.stack}>
 <Button label="Editar medição" disabled={busy} onPress={()=>{setEdit(true);setRemove(false);}}/>
 {edit&&<><Field label="Valor corrigido" value={value} onChange={setValue}/><Field label="Unidade corrigida" value={unit} onChange={setUnit}/><Field label="Data e hora com fuso horário (ISO)" value={date} onChange={setDate}/><T kind="small">O valor anterior e a evidência original são preservados. Se só existia a data, a hora técnica não é uma hora clínica.</T><Button label="Guardar correção" disabled={busy||conflict} onPress={()=>{if(!/^\d+(?:[.,]\d+)?$/.test(value)){setError('Introduz um número válido.');return;}void act(()=>clinicalRepository.editResult(r.ownerId,r.id,{value:Number(value.replace(',','.')),unit,measuredAt:date},version),'Correção guardada.');}}/><Button label="Cancelar correção" disabled={busy} onPress={()=>guard.leave(()=>{setValue(r.value===null?'':String(r.value));setUnit(r.unit);setDate(r.measuredAt??'');guard.reset({value:r.value===null?'':String(r.value),unit:r.unit,date:r.measuredAt??''});setEdit(false);setError('');})}/></>}
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
 const guard=useEditGuard({title,lab,classification},busy);
 async function act(work:()=>Promise<void>,message:string){setBusy(true);setError('');try{await work();guard.reset();onChanged(message);}catch(e){setError((e as Error).message);setConflict(e instanceof ApiError&&e.status===409);}finally{setBusy(false);}}
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
