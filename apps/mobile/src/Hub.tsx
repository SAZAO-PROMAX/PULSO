import React from 'react';
import {View,Pressable} from 'react-native';
import {Card,T,Button,layout,useTheme} from './ui';
import {areas,Area} from './model';
import {ClinicalData,Parameter,parameterLabels,displayDate,numberText,resultDate} from './clinical/data';
import {originFor} from './clinical/repository';
import {hubSummary} from './hubData';

const descriptions=['Exames e evolução dos teus indicadores.','As tuas leituras, organizadas por data.','Oxigénio no sangue e contexto da medição.','Um espaço para preparar os teus cuidados.','Conceitos simples para decisões informadas.'];
const icons=['≡','＋','≈','□','↗'];
interface Props{
 data:ClinicalData;ownerId:string;profileName:string;topicCount:number;featured:{id:string;title:string;summary:string};
 onImport:()=>void;onPressure:()=>void;onHistory:()=>void;onArea:(area:Area)=>void;onParameter:(parameter:Parameter)=>void;onLearn:()=>void;onTopic:(id:string)=>void;
}
export function Hub({data,ownerId,profileName,topicCount,featured,onImport,onPressure,onHistory,onArea,onParameter,onLearn,onTopic}:Props){
 const {colors:c,settings}=useTheme();const [expanded,setExpanded]=React.useState(false);const simple=settings.mode==='simple';const ordered=[...areas].sort((a,b)=>Number(settings.primaryAreas.includes(b))-Number(settings.primaryAreas.includes(a)));const {documents,latest,systolic,diastolic}=hubSummary(data,ownerId);
 return <View style={{gap:24}}>
 <View style={{backgroundColor:c.hero,borderRadius:24,padding:22,gap:14}}>
  <T style={{color:c.accent}}>Olá, {profileName}</T>
  <T style={{fontSize:30,lineHeight:38,fontWeight:'700',color:c.heroInk,maxWidth:650}}>Os teus registos, mais claros.</T>
  <T style={{color:c.heroInk,maxWidth:650}}>Exames, medições e explicações. Tudo ao teu ritmo.</T>
  <View style={layout.row}><Button label="Adicionar exame" primary onPress={onImport}/><Button label="Adicionar medição" onPress={onPressure}/>{settings.mode==='detailed'&&<Button label="Abrir filtros do Histórico" onPress={onHistory}/>}</View>{settings.guidedHelp&&<T style={{color:c.heroInk}}>1. Adicione um documento fictício. 2. Reveja os dados. 3. Confirme para os ver no Histórico.</T>}
 </View>
 {(!simple||expanded)&&<View accessibilityLabel="Resumo dos teus registos" style={layout.row}>
  {[{value:documents.length,label:'exames guardados'},{value:latest.length,label:'parâmetros atualizados'},{value:topicCount,label:'tópicos para explorar'}].map(item=><View key={item.label} style={[layout.grow,{flexBasis:120}]}><Card style={{flex:1}}><T style={{fontSize:32,lineHeight:40,fontWeight:'700'}}>{item.value}</T><T kind="small">{item.label}</T></Card></View>)}
 </View>}
 <View style={{gap:12}}><T kind="heading">As tuas áreas de saúde</T><T kind="small">Um caminho simples para cada tipo de registo.</T>
 <View style={layout.row}>{ordered.map((area)=><Pressable key={area} accessibilityRole="button" accessibilityLabel={area} onPress={()=>onArea(area)} style={({pressed})=>({flexBasis:280,flexGrow:1,flexShrink:1,minWidth:0,borderRadius:20,padding:22,gap:12,borderWidth:1,borderColor:c.control,backgroundColor:pressed?c.soft:c.card})}>
  <View accessible={false} style={{backgroundColor:c.soft,width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center'}}><T style={{fontSize:26,color:c.ink}}>{icons[areas.indexOf(area)]}</T></View><T kind="heading">{area}</T><T kind="small">{descriptions[areas.indexOf(area)]}</T><T style={{fontWeight:'600'}}>Explorar →</T>
 </Pressable>)}</View></View>
 {simple&&<><T>Comece por adicionar um exame ou uma medição. As cinco áreas e o Histórico continuam disponíveis.</T><Button label={expanded?'Mostrar menos resumos':'Mostrar todos os resumos'} onPress={()=>setExpanded(!expanded)}/><Button label="Consultar histórico" onPress={onHistory}/><Button label="Abrir Aprender" onPress={onLearn}/></>}
 {(!simple||expanded)&&<View style={layout.row}>
  <View style={layout.grow}><Card style={{flex:1}}><T kind="small" style={{letterSpacing:1}}>DOCUMENTOS</T><T kind="heading">Últimos exames</T>
   {documents.length?documents.slice(0,2).map(d=><View key={d.id} style={{gap:4,paddingVertical:8,borderBottomWidth:1,borderColor:c.line}}><T style={{fontWeight:'600'}}>{d.title}</T><T kind="small">{d.laboratory??'Origem não indicada'}</T><T kind="small">Importado {displayDate(d.importedAt)} · {d.issuedAt?'Relatório de '+displayDate(d.issuedAt):'Data do relatório não indicada'}</T></View>):<><T>Ainda não adicionaste exames.</T><T kind="small">Começa por importar um PDF laboratorial inteiramente fictício.</T></>}
   <Button label="Consultar exames e resultados" onPress={onHistory}/>
  </Card></View>
  <View style={layout.grow}><Card style={{flex:1}}><T kind="small" style={{letterSpacing:1}}>O TEU HISTÓRICO</T><T kind="heading">Evolução recente</T>
   {latest.length?latest.slice(0,3).map(r=><View key={r.id} style={{gap:4,paddingVertical:8,borderBottomWidth:1,borderColor:c.line}}><T style={{fontWeight:'600'}}>{parameterLabels[r.parameter]}</T><T>{numberText(r.value!)} {r.unit}</T><T kind="small">{resultDate(r)} · {originFor(data,r)}</T><Button label={'Ver evolução de '+parameterLabels[r.parameter]} onPress={()=>onParameter(r.parameter)}/></View>):<><T>A tua evolução começa com o primeiro registo.</T><T kind="small">Depois de confirmares resultados com data, poderás consultar aqui os parâmetros mais recentes.</T></>}
   <T kind="small">Registos descritivos. A presença no histórico não garante comparabilidade nem segurança clínica.</T>
  </Card></View>
  <View style={layout.grow}><Card style={{flex:1}}><T kind="small" style={{letterSpacing:1}}>EM CASA</T><T kind="heading">Última tensão registada</T>
   {systolic?<><T style={{fontSize:30,lineHeight:38,fontWeight:'700'}}>{numberText(systolic.value!)}{diastolic?' / '+numberText(diastolic.value!):''} {systolic.unit}</T><T kind="small">{diastolic?'Sistólica / diastólica · mesma sessão':'Sistólica · sem diastólica associada'}</T><T kind="small">{resultDate(systolic)} · {originFor(data,systolic)}</T></>:<><T>Ainda sem medições.</T><T kind="small">Podes registar uma leitura fictícia e consultar a sua evolução.</T></>}
   <Button label="Ver evolução da tensão" onPress={()=>onArea('Tensão arterial')}/>
  </Card></View>
 </View>
}
 <View style={layout.row}>
  <View style={layout.grow}><Card style={{flex:1}}><T kind="small" style={{letterSpacing:1}}>APRENDER HOJE</T><T kind="heading">{featured.title}</T><T>{featured.summary}</T><Button label="Ler o destaque de hoje" primary onPress={()=>onTopic(featured.id)}/>{!simple&&<Button label="Abrir Aprender" onPress={onLearn}/>}<T kind="small">Educação geral. Não é uma interpretação dos teus resultados.</T></Card></View>
  <View style={layout.grow}><Card style={{flex:1}}><T kind="small" style={{letterSpacing:1}}>O PRÓXIMO PASSO</T><T kind="heading">Preparar a próxima consulta</T><T>Organiza perguntas e documentos para uma conversa mais clara.</T><Button label="Como preparar uma consulta" onPress={()=>onTopic('prepare-visit')}/><T kind="small">O calendário e o registo de medicação continuam em preparação. Não são apresentados compromissos fictícios como agendamentos reais.</T></Card></View>
 </View>
 </View>;
}
