import React from 'react';
import {View} from 'react-native';
import {Card,T,Button,layout,useTheme} from './ui';
import {Area} from './model';
import {ClinicalData,Parameter,parameterLabels,displayDate,numberText,resultDate} from './clinical/data';
import {hubSummary} from './hubData';

interface Props{
 data:ClinicalData;ownerId:string;profileName:string;featured:{id:string;title:string;summary:string};
 onImport:()=>void;onPressure:()=>void;onHistory:()=>void;onArea:(area:Area)=>void;onParameter:(parameter:Parameter)=>void;onLearn:()=>void;
}
export function Hub({data,ownerId,profileName,featured,onImport,onPressure,onHistory,onArea,onParameter,onLearn}:Props){
 const {colors:c,settings}=useTheme(),[expanded,setExpanded]=React.useState(settings.mode==='detailed');
 const {documents,latest,systolic,diastolic}=hubSummary(data,ownerId),hasRecords=documents.length>0||data.results.some(r=>r.ownerId===ownerId)||!!data.events?.length;
 return <View style={{gap:28}}>
 <View style={{gap:16}}><T kind="heading">Olá, {profileName}</T><T kind="small">{settings.guidedHelp?'Adicione, reveja e confirme. O registo fica no seu Histórico.':'Os seus registos de saúde, num só lugar.'}</T><View style={layout.row}><Button label="Adicionar exame" primary onPress={onImport}/><Button label="Adicionar medição" onPress={onPressure}/></View></View>
 {!hasRecords&&<View style={{paddingVertical:20,gap:8,borderTopWidth:1,borderBottomWidth:1,borderColor:c.line}}><T kind="heading">O seu histórico começa aqui.</T><T kind="small">Adicione um exame ou uma medição. Depois de confirmar, poderá consultar os registos e a sua evolução.</T></View>}
 {hasRecords&&<Card><View style={[layout.row,{justifyContent:'space-between',alignItems:'center'}]}><T kind="heading">Últimos registos</T><Button label="Ver histórico" variant="tertiary" onPress={onHistory}/></View>
 {documents.slice(0,expanded?3:1).map(d=><View key={d.id} style={{gap:4}}><T style={{fontWeight:'600'}}>{d.title}</T><T kind="small">{displayDate(d.issuedAt??d.importedAt)} · {d.laboratory??'Origem não indicada'}</T></View>)}
 {latest.slice(0,expanded?5:1).map(r=><View key={r.id} style={{gap:4}}><T>{parameterLabels[r.parameter]} · {numberText(r.value!)} {r.unit}</T><T kind="small">{resultDate(r)}</T><Button label="Ver evolução" accessibilityLabel={'Ver evolução de '+parameterLabels[r.parameter]} variant="tertiary" onPress={()=>onParameter(r.parameter)}/></View>)}
 {systolic&&<View style={{gap:4}}><T>Tensão · {numberText(systolic.value!)}{diastolic?' / '+numberText(diastolic.value!):''} mmHg</T><T kind="small">{resultDate(systolic)}</T></View>}
 {data.events?.slice(0,expanded?3:1).map(e=><T key={e.id}>{displayDate(e.startsAt)} · {e.title}</T>)}
 <View style={layout.row}><Button label={expanded?'Recolher resumos':'Mostrar todos os resumos'} variant="tertiary" expanded={expanded} onPress={()=>setExpanded(!expanded)}/></View></Card>}
 <View style={layout.row}><View style={layout.grow}><Card style={{backgroundColor:c.soft,borderWidth:0}}><T kind="heading">A sua evolução</T><T kind="small">Explore os resultados por parâmetro, data e origem.</T><View style={layout.row}><Button label="Ver evolução" variant="tertiary" onPress={()=>onArea('Análises ao sangue')}/></View></Card></View><View style={layout.grow}><Card style={{borderWidth:0}}><T kind="small">APRENDER</T><T kind="heading">{featured.title}</T><View style={layout.row}><Button label="Abrir Aprender" variant="tertiary" onPress={onLearn}/></View></Card></View></View>
 </View>;
}
