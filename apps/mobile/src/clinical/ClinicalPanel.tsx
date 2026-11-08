import React,{useState} from 'react';
import {View} from 'react-native';
import {T,Button,layout,Card} from '../ui';
import {ClinicalData,Parameter,parameterLabels,buildSeries,exclusionReason} from './data';
import {TimelineChart} from './TimelineChart';
import {MedicalTerm} from '../learning/Learning';
export function ClinicalPanel({ownerId,parameters,data,initialParameter}:{ownerId:string;parameters:Parameter[];data:ClinicalData;initialParameter?:Parameter|null}) {
 const [parameter,setParameter]=useState(initialParameter&&parameters.includes(initialParameter)?initialParameter:parameters[0]),[period,setPeriod]=useState(0);
 const visible:ClinicalData={...data,results:data.results.filter(r=>!period||!!r.measuredAt&&Date.parse(r.measuredAt)>=Date.now()-period*86400000)};
 const {series,omitted}=buildSeries(visible,ownerId,parameter);
 const all=data.results.filter(r=>r.ownerId===ownerId&&r.parameter===parameter&&r.status!=='extracted_pending');
 const shown=series.reduce((n,s)=>n+s.points.length,0);
 const outside=all.filter(r=>!visible.results.some(v=>v.id===r.id)).length;
 const reasons=new Map<string,number>();
 for(const row of visible.results.filter(r=>r.ownerId===ownerId&&r.parameter===parameter)){const reason=exclusionReason(data,row);if(reason)reasons.set(reason,(reasons.get(reason)??0)+1);}
 return <View style={layout.stack}><T kind="small">Evolução descritiva · dados fictícios. Sem diagnósticos ou conversões automáticas.</T>
 <View accessibilityLabel="Parâmetro" style={layout.row}>{parameters.map(p=><Button key={p} label={parameterLabels[p]} selected={p===parameter} onPress={()=>setParameter(p)}/>)}</View>
 <MedicalTerm parameter={parameter} label={parameterLabels[parameter]}/>
 <View accessibilityLabel="Período" style={layout.row}>{[[0,'Todo o histórico'],[90,'90 dias'],[365,'1 ano']].map(([days,label])=><Button key={days} label={String(label)} selected={period===days} onPress={()=>setPeriod(Number(days))}/>)}</View>
 <T kind="small">{all.length} confirmados no histórico · {shown} representados neste período · {outside} fora do período.</T><T kind="small">Períodos relativos a hoje. Unidades, métodos e amostras diferentes permanecem em séries independentes.</T>
 {!!omitted&&<T kind="small">{omitted} registo(s) pendentes ou incompletos fora do gráfico.</T>}
 {!!reasons.size&&<Card><T kind="heading">Porque há registos fora do gráfico?</T>{[...reasons].map(([reason,count])=><T key={reason}>{count} {count===1?'registo':'registos'}: {reason}</T>)}<T kind="small">Os registos mantêm-se no Histórico, com o documento e os dados originais.</T></Card>}
 {!series.length&&<Card><T kind="heading">Ainda sem resultados neste período</T><T>Sem medições comparáveis disponíveis.</T><T kind="small">Escolhe outro parâmetro ou período. Não são preenchidos valores em falta.</T></Card>}
 {series.map(s=><TimelineChart key={s.key+period} series={s} data={data}/>)}
 </View>;
}

