import React from 'react';
import {View,useWindowDimensions} from 'react-native';
import {Card,T,Button,layout,useTheme} from './ui';
import {Area} from './model';
import {ClinicalData,Parameter,parameterLabels,displayDate,numberText,resultDate,buildSeries} from './clinical/data';
import {hubSummary} from './hubData';
import {TimelineChart} from './clinical/TimelineChart';

interface Props{
 data:ClinicalData;ownerId:string;profileName:string;featured:{id:string;title:string;summary:string};
 onImport:()=>void;onPressure:()=>void;onHistory:()=>void;onArea:(area:Area)=>void;onParameter:(parameter:Parameter)=>void;onLearn:()=>void;
}
export function Hub({data,ownerId,profileName,featured,onImport,onPressure,onHistory,onArea,onParameter,onLearn}:Props){
 const {colors:c,settings}=useTheme(),[expanded,setExpanded]=React.useState(settings.mode==='detailed');
 const {width}=useWindowDimensions();const [preview,setPreview]=React.useState<Parameter|null>(null);
 const {documents,latest,systolic,diastolic}=hubSummary(data,ownerId),hasRecords=documents.length>0||data.results.some(r=>r.ownerId===ownerId)||!!data.events?.length;
 const focusParameter=preview??latest[0]?.parameter??(systolic?'systolic':null);const trend=focusParameter?buildSeries(data,ownerId,focusParameter).series[0]:null;
 return <View style={{gap:28}}>
 <View style={{gap:16}}><T kind="heading">Olá, {profileName}</T><T kind="small">{settings.guidedHelp?'Adicione, reveja e confirme. O registo fica no seu Histórico.':'Os seus registos de saúde, num só lugar.'}</T><View style={layout.row}><Button label="Adicionar exame" primary onPress={onImport}/><Button label="Adicionar medição" onPress={onPressure}/></View></View>
 {!hasRecords&&<View style={{paddingVertical:20,gap:8,borderTopWidth:1,borderBottomWidth:1,borderColor:c.line}}><T kind="heading">O seu histórico começa aqui.</T><T kind="small">Adicione um exame ou uma medição. Depois de confirmar, poderá consultar os registos e a sua evolução.</T></View>}
 {hasRecords&&<View style={{flexDirection:width>=1100?'row':'column',gap:28,alignItems:'stretch'}}><View testID="hub-evolution" style={{flex:2,minWidth:0,gap:16}}><View style={[layout.row,{alignItems:'center',justifyContent:'space-between'}]}><T kind="heading">Em perspetiva</T><Button label={focusParameter?"Explorar resultados":"Consultar documentos"} variant="tertiary" onPress={()=>focusParameter?onParameter(focusParameter):onHistory()}/></View><T kind="small">Os seus resultados confirmados, com data e origem. Selecione um parâmetro para o explorar.</T><View style={layout.row}>{latest.slice(0,5).map(r=><Button key={r.parameter} label={parameterLabels[r.parameter]} accessibilityLabel={'Antever '+parameterLabels[r.parameter]} variant="chip" selected={focusParameter===r.parameter} onPress={()=>setPreview(r.parameter)}/>)}</View>{trend?<TimelineChart key={trend.key} series={trend} data={data}/>:<T kind="small">Sem medições comparáveis para esta pré-visualização. Os registos mantêm-se no Histórico.</T>}</View>
 <View style={{flex:1,minWidth:0}}><Card style={{borderWidth:0,backgroundColor:c.soft}}><View style={[layout.row,{justifyContent:'space-between',alignItems:'center'}]}><T kind="heading">Últimos registos</T><Button label="Ver histórico" variant="tertiary" onPress={onHistory}/></View>
 {documents.slice(0,expanded?3:1).map(d=><View key={d.id} style={{gap:4}}><T style={{fontWeight:'600'}}>{d.title}</T><T kind="small">{displayDate(d.issuedAt??d.importedAt)} · {d.laboratory??'Origem não indicada'}</T></View>)}
 {latest.slice(0,expanded?5:1).map(r=><View key={r.id} style={{gap:4}}><T>{parameterLabels[r.parameter]} · {numberText(r.value!)} {r.unit}</T><T kind="small">{resultDate(r)}</T><Button label="Ver evolução" accessibilityLabel={'Ver evolução de '+parameterLabels[r.parameter]} variant="tertiary" onPress={()=>onParameter(r.parameter)}/></View>)}
 {systolic&&<View style={{gap:4}}><T>Tensão · {numberText(systolic.value!)}{diastolic?' / '+numberText(diastolic.value!):''} mmHg</T><T kind="small">{resultDate(systolic)}</T></View>}
 {data.events?.slice(0,expanded?3:1).map(e=><T key={e.id}>{displayDate(e.startsAt)} · {e.title}</T>)}
 <View style={layout.row}><Button label={expanded?'Recolher resumos':'Mostrar todos os resumos'} variant="tertiary" expanded={expanded} onPress={()=>setExpanded(!expanded)}/></View></Card></View>
 </View>}
 <View style={layout.row}><View style={layout.grow}><Card style={{backgroundColor:c.soft,borderWidth:0}}><T kind="heading">A sua evolução</T><T kind="small">Explore os resultados por parâmetro, data e origem.</T><View style={layout.row}><Button label="Ver evolução" variant="tertiary" onPress={()=>onArea('Análises ao sangue')}/></View></Card></View><View style={layout.grow}><Card style={{borderWidth:0}}><T kind="small">APRENDER</T><T kind="heading">{featured.title}</T><View style={layout.row}><Button label="Abrir Aprender" variant="tertiary" onPress={onLearn}/></View></Card></View></View>
 </View>;
}
