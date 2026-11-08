import React,{useState} from 'react';
import {View,Pressable} from 'react-native';
import {Card,T,Button,useTheme,layout} from '../ui';
import {ClinicalData,Series,coordinates,displayDate,parameterLabels,numberText,resultDate} from './data';
import {ResultDetail} from './RecordViews';
export function TimelineChart({series,data}:{series:Series;data:ClinicalData}) {
 const {colors:c}=useTheme();
 const [width,setWidth]=useState(260),[selected,setSelected]=useState<string|null>(null);
 const values=series.points.map(p=>p.value),low=Math.min(0,...values),high=Math.max(1,...values)*1.15;
 const coords=coordinates(series.points,width,190,{min:low,max:high});
 const point=series.points.find(p=>p.id===selected);
 return <Card><T accessibilityRole="header" kind="heading">{parameterLabels[series.parameter]} · {series.unit}</T>
 <T kind="small">{series.method} · {series.context} · {series.points.length} medições</T>
 <View style={{flexDirection:'row',gap:8}}>
 <View style={{height:190,paddingVertical:11,justifyContent:'space-between'}}>{[high,(high+low)/2,low].map((v,i)=><T key={i} kind="small">{numberText(Math.round(v*100)/100)}</T>)}</View>
 <View testID="timeline-plot" onLayout={e=>setWidth(Math.max(80,e.nativeEvent.layout.width))} style={{flex:1,height:190,borderBottomWidth:1,borderLeftWidth:1,borderColor:c.line}}>
 {[24,95,166].map(y=><View key={y} style={{position:'absolute',left:0,right:0,top:y,borderTopWidth:1,borderColor:c.line,opacity:0.4}}/>)}
 {coords.slice(1).map((p,i)=>{const a=coords[i],dx=p.x-a.x,dy=p.y-a.y;return <View key={'line'+i} pointerEvents="none" style={{position:'absolute',height:2,backgroundColor:c.muted,width:Math.hypot(dx,dy),left:(a.x+p.x)/2-Math.hypot(dx,dy)/2,top:(a.y+p.y)/2,transform:[{rotate:Math.atan2(dy,dx)+'rad'}]}}/>;})}
 {coords.map((p,i)=><Pressable key={series.points[i].id} accessibilityRole="button" accessibilityState={{selected:selected===series.points[i].id}} accessibilityLabel={'Ponto '+displayDate(series.points[i].measuredAt)+' '+numberText(series.points[i].value)+' '+series.unit} onPress={()=>setSelected(series.points[i].id)} style={{position:'absolute',width:44,height:44,left:p.x-22,top:p.y-22,alignItems:'center',justifyContent:'center'}}><View style={{width:selected===series.points[i].id?18:12,height:selected===series.points[i].id?18:12,borderRadius:10,backgroundColor:c.accent,borderWidth:2,borderColor:c.ink}}/></Pressable>)}
 </View></View>
 <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><T kind="small">{displayDate(series.points[0].measuredAt)}</T><T kind="small">{displayDate(series.points[series.points.length-1].measuredAt)}</T></View>
 <T kind="small">Escala numérica descritiva em {series.unit}, sem faixas clínicas. {series.points.length===1?'Um único ponto, sem tendência.':'Linhas ligam registos; não estimam medições intermédias.'}</T>
 <View style={layout.stack}>{series.points.map(p=><Button key={p.id} label={resultDate(p)+' · '+numberText(p.value)+' '+p.unit} selected={selected===p.id} onPress={()=>setSelected(p.id)}/>)}</View>
 {point?<ResultDetail data={data} result={point}/>:<T kind="small">Seleciona um ponto ou um resultado para consultar a origem.</T>}
 </Card>;
}


