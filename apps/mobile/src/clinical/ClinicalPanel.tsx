import React,{useState} from 'react';
import {View} from 'react-native';
import {T,Button,Field,layout,Card,useTheme} from '../ui';
import {ClinicalData,Parameter,parameterLabels,buildSeries,exclusionReason} from './data';
import {TimelineChart} from './TimelineChart';
import {periods,timeRange,filterTime} from './timeRange';
import {MedicalTerm} from '../learning/Learning';
export function ClinicalPanel({ownerId,parameters,data,initialParameter}:{ownerId:string;parameters:Parameter[];data:ClinicalData;initialParameter?:Parameter|null}) {
 const {settings,colors:c}=useTheme();
 const [combined,setCombined]=useState(settings.mode==='detailed'),[chosen,setChosen]=useState<Parameter[]>(parameters),[more,setMore]=useState(false),[start,setStart]=useState(''),[end,setEnd]=useState('');
 const [parameter,setParameter]=useState(initialParameter&&parameters.includes(initialParameter)?initialParameter:parameters[0]),[period,setPeriod]=useState('all');
 let range:{min:number;max:number}|null=null,rangeError='';try{range=timeRange(period,start,end);}catch(e){rangeError=(e as Error).message;}
 const visible=rangeError?{...data,results:[]}:filterTime(data,range);
 const selected=combined?chosen:[parameter],groups=selected.map(p=>buildSeries(visible,ownerId,p));
 const series=groups.flatMap(g=>g.series),omitted=groups.reduce((n,g)=>n+g.omitted,0);
 const times=series.flatMap(s=>s.points.map(p=>Date.parse(p.measuredAt))),domain=times.length?{min:Math.min(...times),max:Math.max(...times)}:undefined;
 const all=data.results.filter(r=>r.ownerId===ownerId&&selected.includes(r.parameter)&&r.status!=='extracted_pending');
 const shown=series.reduce((n,s)=>n+s.points.length,0);
 const outside=all.filter(r=>!visible.results.some(v=>v.id===r.id)).length;
 const reasons=new Map<string,number>();
 for(const row of visible.results.filter(r=>r.ownerId===ownerId&&selected.includes(r.parameter))){const reason=exclusionReason(data,row);if(reason)reasons.set(reason,(reasons.get(reason)??0)+1);}
 return <View style={layout.stack}><T kind="small">Evolução descritiva · dados fictícios. Sem diagnósticos ou conversões automáticas.</T>
 <View style={layout.row}><Button label="Individual" selected={!combined} onPress={()=>setCombined(false)}/><Button label="Combinado" selected={combined} onPress={()=>setCombined(true)}/></View>{combined&&<T>Gráficos alinhados no tempo, com escalas independentes e unidades identificadas. Não há normalização nem equivalência entre parâmetros.</T>}
 <View accessibilityLabel="Parâmetro" style={layout.row}>{parameters.map(p=><Button key={p} label={parameterLabels[p]} selected={combined?chosen.includes(p):p===parameter} onPress={()=>combined?setChosen(chosen.includes(p)?chosen.filter(v=>v!==p):[...chosen,p]):setParameter(p)}/>)}</View>
 <MedicalTerm parameter={parameter} label={parameterLabels[parameter]}/>
 {settings.mode==='simple'&&<Button label={more?'Ocultar períodos adicionais':'Mostrar todos os períodos'} onPress={()=>setMore(!more)}/>}
 <View accessibilityLabel="Período" style={layout.row}>{periods.filter(([id])=>settings.mode!=='simple'||more||['all','90','1y'].includes(id)).map(([id,label])=><Button key={id} label={label} selected={period===id} onPress={()=>setPeriod(id)}/>)}</View>
 {period==='custom'&&<Card><Field date label="Data inicial do gráfico" value={start} onChange={setStart}/><Field date label="Data final do gráfico" value={end} onChange={setEnd}/><T kind="small">Inclui os dois dias completos, em UTC. Não modifica registos.</T></Card>}{!!rangeError&&<T accessibilityRole="alert">{rangeError}</T>}

 <T kind="small">{all.length} confirmados no histórico · {shown} representados neste período · {outside} fora do período.</T><T kind="small">Períodos relativos a hoje. Unidades, métodos e amostras diferentes permanecem em séries independentes.</T>
 {!!omitted&&<T kind="small">{omitted} registo(s) pendentes ou incompletos fora do gráfico.</T>}
 {!!reasons.size&&<Card><T kind="heading">Porque há registos fora do gráfico?</T>{[...reasons].map(([reason,count])=><T key={reason}>{count} {count===1?'registo':'registos'}: {reason}</T>)}<T kind="small">Os registos mantêm-se no Histórico, com o documento e os dados originais.</T></Card>}
 {!series.length&&<Card><T kind="heading">Ainda sem resultados neste período</T><T>Sem medições comparáveis disponíveis.</T><T kind="small">Escolhe outro parâmetro ou período. Não são preenchidos valores em falta.</T></Card>}
 {series.map((s,i)=><View key={s.key+period+start+end} style={layout.stack}>{combined&&<Button label={'Ocultar série '+parameterLabels[s.parameter]+' · '+s.unit+' · '+s.method+' · '+s.context} onPress={()=>setChosen(chosen.filter(p=>p!==s.parameter))}/>}<TimelineChart series={s} data={data} timeDomain={combined?domain:undefined} color={combined?(i%2?c.info:c.series):undefined}/></View>)}
 </View>;
}

