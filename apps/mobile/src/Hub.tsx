import React from 'react';
import {View,Pressable} from 'react-native';
import {Card,T,Button,layout,useTheme} from './ui';
import {areas,Area} from './model';
import {ClinicalData,Parameter,parameterLabels,displayDate,numberText,resultDate} from './clinical/data';
import {originFor} from './clinical/repository';
import {hubSummary} from './hubData';

interface Props{
 data:ClinicalData;ownerId:string;profileName:string;topicCount:number;featured:{id:string;title:string;summary:string};
 onEvent:()=>void;onImport:()=>void;onPressure:()=>void;onHistory:()=>void;onArea:(area:Area)=>void;onParameter:(parameter:Parameter)=>void;onLearn:()=>void;onTopic:(id:string)=>void;
}
export function Hub({data,ownerId,profileName,topicCount,featured,onEvent,onImport,onPressure,onHistory,onArea,onParameter,onLearn,onTopic}:Props){
 const {colors:c,settings}=useTheme();const [expanded,setExpanded]=React.useState(false);const simple=settings.mode==='simple';const ordered=[...areas].sort((a,b)=>Number(settings.primaryAreas.includes(b))-Number(settings.primaryAreas.includes(a)));const {documents,latest,systolic,diastolic}=hubSummary(data,ownerId);
 return <View style={layout.stack}>
 <View style={{gap:12}}><T kind="heading">Olá, {profileName}</T><View style={layout.row}><Button label="Adicionar exame" primary onPress={onImport}/><Button label="Adicionar medição" onPress={onPressure}/></View>{settings.guidedHelp&&<T kind="small">Adicione, reveja e confirme. O registo fica no seu Histórico.</T>}</View>
 <View style={layout.row}><Button label="Ver histórico" onPress={onHistory}/><Button label="Ver evolução" onPress={()=>onArea('Análises ao sangue')}/><Button label="Registar acontecimento" onPress={onEvent}/><Button label="Abrir Aprender" onPress={onLearn}/></View>
 <View style={layout.row}>{ordered.map(area=><Button key={area} label={area} onPress={()=>onArea(area)}/>)}</View>
 {!documents.length&&!latest.length&&!data.events?.length&&<Card><T>Ainda não tem exames guardados.</T><T>Ainda não existem medições registadas.</T><T>Ainda não existem acontecimentos registados.</T></Card>}
 {(documents.length>0||latest.length>0||!!data.events?.length)&&<><Button label={expanded?'Recolher resumos':'Mostrar todos os resumos'} onPress={()=>setExpanded(!expanded)}/><Card><T kind="heading">Mais recente</T>{documents.slice(0,expanded||settings.mode==='detailed'?3:1).map(d=><View key={d.id} style={{gap:4}}><T>{d.title}</T><T kind="small">{displayDate(d.issuedAt??d.importedAt)} · {d.laboratory??'Origem não indicada'}</T></View>)}{latest.slice(0,expanded||settings.mode==='detailed'?5:1).map(r=><View key={r.id} style={{gap:4}}><T>{parameterLabels[r.parameter]} · {numberText(r.value!)} {r.unit}</T><T kind="small">{resultDate(r)}</T><Button label={'Ver evolução de '+parameterLabels[r.parameter]} onPress={()=>onParameter(r.parameter)}/></View>)}{data.events?.slice(0,expanded?3:1).map(e=><T key={e.id}>{displayDate(e.startsAt)} · {e.title}</T>)}{systolic&&expanded&&<><T>Tensão · {numberText(systolic.value!)}{diastolic?' / '+numberText(diastolic.value!):''} mmHg</T><Button label="Ver evolução da tensão" onPress={()=>onArea('Tensão arterial')}/></>}</Card></>}
 {settings.mode==='detailed'&&<Button label="Abrir filtros do Histórico" onPress={onHistory}/>}
 <View style={{gap:8}}><T kind="heading">Aprender</T><T>{featured.title}</T><Button label="Ler o destaque de hoje" onPress={()=>onTopic(featured.id)}/></View>
 </View>;
}
