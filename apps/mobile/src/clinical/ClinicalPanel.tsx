import React,{useState} from 'react';
import {View,useWindowDimensions} from 'react-native';
import {T,Button,Field,layout,Card,useTheme} from '../ui';
import {ClinicalData,Parameter,parameterLabels,buildSeries,exclusionReason} from './data';
import {DocumentView} from './DocumentView';
import {TimelineChart} from './TimelineChart';
import {eventsInRange} from './events';
import {EventDetail} from './EventViews';
import {periods,timeRange,filterTime} from './timeRange';
import {MedicalTerm} from '../learning/Learning';
export function ClinicalPanel({ownerId,parameters,data,initialParameter,importedDocumentId,onDocument}:{onDocument?:(id:string)=>void;importedDocumentId?:string;ownerId:string;parameters:Parameter[];data:ClinicalData;initialParameter?:Parameter|null}) {
 const {settings,colors:c}=useTheme(),{width}=useWindowDimensions();const [search,setSearch]=useState('');const normalize=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');
 const imported=data.documents.find(d=>d.id===importedDocumentId&&d.ownerId===ownerId);
 const importedParameters=[...new Set(data.results.filter(r=>r.ownerId===ownerId&&r.documentId===imported?.id&&r.status!=='extracted_pending').map(r=>r.parameter))];
 const [combined,setCombined]=useState(settings.mode==='detailed'),[chosen,setChosen]=useState<Parameter[]>(importedParameters.length?importedParameters:parameters),[more,setMore]=useState(settings.mode==='detailed'),[options,setOptions]=useState(settings.mode==='detailed'),[start,setStart]=useState(''),[end,setEnd]=useState('');
 const [parameter,setParameter]=useState(initialParameter&&parameters.includes(initialParameter)?initialParameter:parameters[0]),[period,setPeriod]=useState('all');
 let range:{min:number;max:number}|null=null,rangeError='';try{range=timeRange(period,start,end);}catch(e){rangeError=(e as Error).message;}
 const visible=rangeError?{...data,results:[]}:filterTime(data,range);
 const selected=combined?chosen:[parameter],groups=selected.map(p=>buildSeries(visible,ownerId,p));
 const series=groups.flatMap(g=>g.series),omitted=groups.reduce((n,g)=>n+g.omitted,0);
 const events=rangeError?[]:eventsInRange((data.events??[]).filter(e=>e.ownerId===ownerId),range?.min??-Infinity,range?.max??Infinity);
 const [showEvents,setShowEvents]=useState(false);
 const times=[...series.flatMap(s=>s.points.map(p=>Date.parse(p.measuredAt))),...events.flatMap(e=>[Math.max(range?.min??-Infinity,Date.parse(e.startsAt)),Math.min(range?.max??Infinity,Date.parse(e.endsAt??e.startsAt))])],domain=times.length?{min:Math.min(...times),max:Math.max(...times)}:undefined;
 const all=data.results.filter(r=>r.ownerId===ownerId&&selected.includes(r.parameter)&&r.status!=='extracted_pending');
 const shown=series.reduce((n,s)=>n+s.points.length,0);
 const outside=all.filter(r=>!visible.results.some(v=>v.id===r.id)).length;
 const reasons=new Map<string,number>();
 for(const row of visible.results.filter(r=>r.ownerId===ownerId&&selected.includes(r.parameter))){const reason=exclusionReason(data,row);if(reason)reasons.set(reason,(reasons.get(reason)??0)+1);}
 return <View style={layout.stack}>{imported&&<Card><T kind="heading" nativeID="analysis-evolution-title" tabIndex={-1}>Evolução dos resultados desta análise</T><T>{imported.title}</T><T kind="small">Parâmetros confirmados: {importedParameters.map(p=>parameterLabels[p]).join(', ')}. O ponto desta análise é selecionado quando tem dados comparáveis; resultados incompletos mantêm-se no Histórico.</T>{onDocument&&<Button label="Ver detalhe do exame" variant="tertiary" onPress={()=>onDocument(imported.id)}/>}<DocumentView doc={imported}/></Card>}<T kind="small">Evolução dos registos.</T>
 <View testID="results-workspace" style={{flexDirection:width>=1100?'row':'column',gap:28,alignItems:'stretch'}}><View style={{width:width>=1100?280:undefined,gap:16}}><T kind="heading">Explorar resultados</T><Field label="Pesquisar parâmetros" value={search} onChange={setSearch} placeholder="Ex.: glicose, colesterol…"/><Button label="Opções do gráfico" expanded={options} selected={options} onPress={()=>setOptions(!options)}/>{parameters.length>5&&<Button label={more?'Recolher parâmetros':'Ver todos os parâmetros'} onPress={()=>setMore(!more)}/>}
 {options&&<View style={layout.row}><Button label="Individual" selected={!combined} onPress={()=>setCombined(false)}/><Button label="Combinado" selected={combined} onPress={()=>setCombined(true)}/></View>}{combined&&<T>Gráficos alinhados no tempo, com escalas independentes e unidades identificadas. Não há normalização nem equivalência entre parâmetros.</T>}
 <View accessibilityLabel="Parâmetro" style={layout.row}>{parameters.filter(p=>(!!search||more||parameters.length<=5||['glucose','ldl','creatinine','hemoglobin','hba1c'].includes(p)||p===parameter||importedParameters.includes(p)||combined&&chosen.includes(p))&&normalize(parameterLabels[p]).includes(normalize(search))).map(p=><Button key={p} label={parameterLabels[p]} selected={combined?chosen.includes(p):p===parameter} onPress={()=>combined?setChosen(chosen.includes(p)?chosen.filter(v=>v!==p):[...chosen,p]):setParameter(p)}/>)}</View>
 <MedicalTerm parameter={parameter} label={parameterLabels[parameter]}/>

 <View accessibilityLabel="Período" style={layout.row}>{periods.filter(([id])=>options||['all','90','1y'].includes(id)).map(([id,label])=><Button key={id} label={label} selected={period===id} onPress={()=>setPeriod(id)}/>)}</View>
 {period==='custom'&&<Card><Field required date label="Data inicial do gráfico" value={start} onChange={setStart}/><Field required date label="Data final do gráfico" value={end} onChange={setEnd}/><T kind="small">Inclui os dois dias completos, em UTC. Não modifica registos.</T></Card>}{!!rangeError&&<T accessibilityRole="alert">{rangeError}</T>}

 </View><View style={{flex:1,minWidth:0,gap:16}}><T kind="small">{all.length} resultados · {shown} no gráfico · {outside} fora do período.</T><T kind="small">Unidades, métodos e amostras diferentes permanecem separados.</T>
 {!!omitted&&<T kind="small">{omitted} registo(s) pendentes ou incompletos fora do gráfico.</T>}
 {!!reasons.size&&<Card><T kind="heading">Porque há registos fora do gráfico?</T>{[...reasons].map(([reason,count])=><T key={reason}>{count} {count===1?'registo':'registos'}: {reason}</T>)}<T kind="small">Os registos mantêm-se no Histórico, com o documento e os dados originais.</T></Card>}
 {!!events.length&&<><Button label="Consultar acontecimentos deste período" onPress={()=>setShowEvents(!showEvents)}/>{showEvents&&events.map(event=><Card key={event.id}><EventDetail event={event} data={data}/></Card>)}</>}
 {!series.length&&<Card><T kind="heading">Ainda sem resultados neste período</T><T>Sem medições comparáveis disponíveis.</T><T kind="small">Escolhe outro parâmetro ou período. Não são preenchidos valores em falta.</T></Card>}
 {series.map((s,i)=><View key={s.key+period+start+end} style={layout.stack}>{combined&&<Button label={'Ocultar série '+parameterLabels[s.parameter]+' · '+s.unit+' · '+s.method+' · '+s.context} onPress={()=>setChosen(chosen.filter(p=>p!==s.parameter))}/>}<TimelineChart initialPointId={s.points.find(p=>p.documentId===imported?.id)?.id} series={s} data={data} events={events} timeDomain={combined||events.length?domain:undefined} color={combined?(i%2?c.info:c.series):undefined}/></View>)}
 </View></View></View>;
}

