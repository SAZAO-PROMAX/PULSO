import React,{useState,useId} from 'react';
import {View,Pressable,Platform} from 'react-native';
import {Card,T,Button,useTheme,layout} from '../ui';
import {ClinicalData,Series,coordinates,displayDate,parameterLabels,numberText,resultDate} from './data';
import {eventsInRange,groupEvents,HealthEvent} from './events';
import {EventDetail} from './EventViews';
import {drawPoints} from './timeRange';
import {ResultDetail} from './RecordViews';
import {MedicalTerm} from '../learning/Learning';
import {originFor} from './repository';
export function TimelineChart({series,data,timeDomain,color,events=[]}:{series:Series;data:ClinicalData;events?:HealthEvent[];timeDomain?:{min:number;max:number};color?:string}) {
 const {colors:c}=useTheme();
 const [width,setWidth]=useState(260),[selected,setSelected]=useState<string|null>(null);
 const [page,setPage]=useState(0);const plotted=drawPoints(series.points),rows=series.points.slice(page*50,(page+1)*50);
 const [eventDay,setEventDay]=useState<string|null>(null);
 const minTime=timeDomain?.min??Date.parse(series.points[0].measuredAt),maxTime=timeDomain?.max??Date.parse(series.points[series.points.length-1].measuredAt),eventGroups=groupEvents(eventsInRange(events,minTime,maxTime));
 const xFor=(time:number)=>24+(maxTime===minTime ? .5 :Math.max(0,Math.min(1,(time-minTime)/(maxTime-minTime))))*(width-48);
 const descriptionId=useId();
 const values=series.points.map(p=>p.value),low=Math.min(0,...values),high=Math.max(1,...values)*1.15;
 const coords=coordinates(plotted,width,190,{min:low,max:high},timeDomain);
 const point=series.points.find(p=>p.id===selected);
 const last=series.points[series.points.length-1];
 return <Card><MedicalTerm parameter={series.parameter} label={parameterLabels[series.parameter]+' · '+series.unit}/>
 <T style={{fontSize:32,lineHeight:40,fontWeight:'700'}}>{numberText(last.value)} {series.unit}</T><T kind="small">Último registo: {resultDate(last)} · {originFor(data,last)}</T>
 <T kind="small">{series.method} · {series.context} · {series.points.length} medições</T>
 <T nativeID={descriptionId} kind="small">{series.points.length} {series.points.length===1?'medição':'medições'} em {series.unit}, de {displayDate(series.points[0].measuredAt)} a {displayDate(last.measuredAt)}. As mesmas medições podem ser consultadas na lista abaixo, com data, valor e origem.</T>
 <View style={{flexDirection:'row',gap:8}}>
 <View style={{width:74,flexShrink:0,height:190,paddingVertical:11,justifyContent:'space-between'}}>{[high,(high+low)/2,low].map((v,i)=><T key={i} kind="small">{numberText(Math.round(v*100)/100)}</T>)}</View>
 <View testID="timeline-plot" aria-describedby={descriptionId} onLayout={e=>setWidth(Math.max(80,e.nativeEvent.layout.width))} style={{flex:1,height:190,borderBottomWidth:1,borderLeftWidth:1,borderColor:c.line}}>
 {[24,95,166].map(y=><View key={y} style={{position:'absolute',left:0,right:0,top:y,borderTopWidth:1,borderColor:c.line,opacity:0.4}}/>)}
 {eventGroups.map(([day,rows])=>{const x=xFor(Date.parse(rows[0].startsAt)),end=Math.max(...rows.map(e=>Date.parse(e.endsAt??e.startsAt))),endX=xFor(end);return <React.Fragment key={day}>{endX>x&&<View pointerEvents="none" style={{position:'absolute',top:0,bottom:0,left:x,width:endX-x,backgroundColor:c.info,opacity:.12}}/>}<Pressable accessibilityRole="button" accessibilityLabel={'Acontecimentos '+day+': '+rows.length} onPress={()=>setEventDay(day)} style={{position:'absolute',left:x-22,top:0,width:44,height:190,alignItems:'center'}}><View pointerEvents="none" style={{position:'absolute',top:0,bottom:0,borderLeftWidth:2,borderStyle:'dashed',borderColor:c.info}}/><T style={{color:c.info,fontSize:18}}>◆</T></Pressable></React.Fragment>;})}
 {coords.slice(1).map((p,i)=>{const a=coords[i],dx=p.x-a.x,dy=p.y-a.y;return <View key={'line'+i} pointerEvents="none" style={{position:'absolute',height:2,backgroundColor:color??c.muted,width:Math.hypot(dx,dy),left:(a.x+p.x)/2-Math.hypot(dx,dy)/2,top:(a.y+p.y)/2,transform:[{rotate:Math.atan2(dy,dx)+'rad'}]}}/>;})}
 {coords.map((p,i)=><Pressable key={plotted[i].id} accessibilityRole="button" accessibilityState={Platform.OS==='web'?{}:{selected:selected===plotted[i].id}} {...(Platform.OS==='web'?{'aria-pressed':selected===plotted[i].id}:{})} accessibilityLabel={'Ponto '+displayDate(plotted[i].measuredAt)+' '+numberText(plotted[i].value)+' '+series.unit} onPress={()=>setSelected(plotted[i].id)} style={{position:'absolute',width:44,height:44,left:p.x-22,top:p.y-22,alignItems:'center',justifyContent:'center'}}><View style={{width:selected===plotted[i].id?18:12,height:selected===plotted[i].id?18:12,borderRadius:10,backgroundColor:color??c.accent,borderWidth:2,borderColor:c.ink}}/></Pressable>)}
 </View></View>
 <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><T kind="small">{displayDate(timeDomain?new Date(timeDomain.min).toISOString():series.points[0].measuredAt)}</T><T kind="small">{displayDate(timeDomain?new Date(timeDomain.max).toISOString():last.measuredAt)}</T></View>
 <T kind="small">Escala numérica descritiva em {series.unit}, sem faixas clínicas. {series.points.length===1?'Um único ponto, sem tendência.':'Linhas ligam registos; não estimam medições intermédias.'}</T>
 {!!eventGroups.length&&<View style={layout.stack}><T kind="heading" level={3}>Contexto na cronologia</T><T kind="small">◆ Acontecimentos agrupados por dia UTC; detalhes em hora local. Faixas representam duração. Coincidência temporal não prova causa e efeito.</T>{eventGroups.map(([day,rows])=><Button key={day} label={'Acontecimentos '+day+': '+rows.length} selected={eventDay===day} onPress={()=>setEventDay(day)}/>)}{eventGroups.find(([day])=>day===eventDay)?.[1].map(event=><Card key={event.id}><EventDetail event={event} data={data}/></Card>)}</View>}
 <T kind="heading" level={3}>Registos do gráfico</T>
 <View role="list" accessibilityLabel={'Medições de '+parameterLabels[series.parameter]} style={layout.stack}>{rows.map(p=><View key={p.id} role="listitem" style={{gap:6}}><Button label={resultDate(p)+' · '+numberText(p.value)+' '+p.unit} selected={selected===p.id} onPress={()=>setSelected(p.id)}/><T kind="small">Origem do registo: {originFor(data,p)} · {data.documents.find(d=>d.id===p.documentId&&d.ownerId===p.ownerId)?.title??'Registo domiciliário, sem documento'}</T></View>)}</View>
 {series.points.length>50&&<View style={layout.row}><Button label="Medições anteriores" disabled={page===0} onPress={()=>setPage(page-1)}/><T kind="small">Página {page+1} de {Math.ceil(series.points.length/50)} · todas as medições disponíveis nesta lista</T><Button label="Medições seguintes" disabled={(page+1)*50>=series.points.length} onPress={()=>setPage(page+1)}/></View>}
 {plotted.length<series.points.length&&<T kind="small">Desenho reduzido a {plotted.length} pontos, preservando extremos por bloco; a lista paginada conserva todos os resultados.</T>}
 <T kind="small" accessibilityLiveRegion="polite">{point?'Selecionado: '+resultDate(point)+' · '+numberText(point.value)+' '+point.unit+'. Consulta o detalhe a seguir.':'Seleciona um ponto ou um resultado para consultar a origem.'}</T>
 {point&&<ResultDetail data={data} result={point}/>}
 </Card>;
}


