import React,{useState} from 'react';
import {View} from 'react-native';
import {T,Button,layout,Card} from '../ui';
import {ClinicalData,Parameter,parameterLabels,buildSeries} from './data';
import {TimelineChart} from './TimelineChart';
export function ClinicalPanel({ownerId,parameters,data}:{ownerId:string;parameters:Parameter[];data:ClinicalData}) {
 const [parameter,setParameter]=useState(parameters[0]),[period,setPeriod]=useState(0);
 const visible:ClinicalData={...data,results:data.results.filter(r=>!period||!!r.measuredAt&&Date.parse(r.measuredAt)>=Date.now()-period*86400000)};
 const {series,omitted}=buildSeries(visible,ownerId,parameter);
 const all=data.results.filter(r=>r.ownerId===ownerId&&r.parameter===parameter&&r.status!=='extracted_pending');
 const shown=series.reduce((n,s)=>n+s.points.length,0);
 const outside=all.filter(r=>!visible.results.some(v=>v.id===r.id)).length;
 return <View style={layout.stack}><T kind="small">Evolução descritiva · dados fictícios. Sem diagnósticos ou conversões automáticas.</T>
 <View accessibilityLabel="Parâmetro" style={layout.row}>{parameters.map(p=><Button key={p} label={parameterLabels[p]} selected={p===parameter} onPress={()=>setParameter(p)}/>)}</View>
 <View accessibilityLabel="Período" style={layout.row}>{[[0,'Todo o histórico'],[90,'90 dias'],[365,'1 ano']].map(([days,label])=><Button key={days} label={String(label)} selected={period===days} onPress={()=>setPeriod(Number(days))}/>)}</View>
 <T kind="small">{all.length} confirmados no histórico · {shown} representados neste período · {outside} fora do período.</T><T kind="small">Períodos relativos a hoje. Unidades, métodos e amostras diferentes permanecem em séries independentes.</T>
 {!!omitted&&<T kind="small">{omitted} registo(s) pendentes ou incompletos fora do gráfico.</T>}
 {!series.length&&<Card><T kind="heading">Ainda sem resultados neste período</T><T>Sem medições comparáveis disponíveis.</T><T kind="small">Escolhe outro parâmetro ou período. Não são preenchidos valores em falta.</T></Card>}
 {series.map(s=><TimelineChart key={s.key+period} series={s} data={data}/>)}
 </View>;
}

