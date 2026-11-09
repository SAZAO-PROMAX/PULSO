import React,{createContext,useContext,useRef,useState,useId} from 'react';
import {View,Pressable,Modal,ScrollView,useWindowDimensions,Platform,Linking} from 'react-native';
import {T,Card,Button,Field,Select,layout,useTheme} from '../ui';
import type {Parameter} from '../clinical/data';
import {Topic,Category,categories,publishedTopics,topicById,topicForParameter,searchTopics,todayTopic,clinicallyReviewed} from './content';

type Anchor={x:number;y:number;width:number;height:number};
type EducationContext={open:(id:string,anchor?:Anchor,restore?:()=>void,trigger?:string)=>void;history:(parameter:Parameter)=>void;trigger?:string;panelId?:string};
const Education=createContext<EducationContext>({open:()=>{},history:()=>{}});
export function LearningProvider({children,onTopic,onHistory}:{children:React.ReactNode;onTopic:(id:string)=>void;onHistory:(parameter:Parameter)=>void}){
 const [opened,setOpened]=useState<{id:string;anchor?:Anchor;trigger?:string}|null>(null),restore=useRef<(()=>void)|undefined>(undefined),closeRef=useRef<View>(null),panelId=useId();
 const {width,height}=useWindowDimensions(),{colors:c}=useTheme();const topic=opened?topicById(opened.id):undefined;
 const compact=width<760,boxWidth=Math.min(560,width-32);
 const left=opened?.anchor?Math.max(16,Math.min(width-boxWidth-16,opened.anchor.x)):Math.max(16,(width-boxWidth)/2);
 const top=opened?.anchor?Math.max(16,Math.min(height-430,opened.anchor.y+opened.anchor.height+8)):32;
 function close(returnFocus=true){setOpened(null);if(returnFocus){const focus=restore.current;setTimeout(()=>focus?.(),0);}restore.current=undefined;}
 function history(parameter:Parameter){close(false);onHistory(parameter);}
 return <Education.Provider value={{open:(id,anchor,focus,trigger)=>{if(topicById(id)){restore.current=focus;setOpened({id,anchor,trigger});}},history,trigger:opened?.trigger,panelId}}>{children}
 <Modal visible={!!topic} transparent animationType="none" onRequestClose={()=>close()} accessibilityViewIsModal accessibilityLabel={'Explicação educativa: '+(topic?.term??'')} aria-labelledby={panelId+'-title'} onShow={()=>{if(Platform.OS==='web')(closeRef.current as unknown as {focus?:()=>void})?.focus?.();}}>
  <View style={{flex:1,backgroundColor:'rgba(5,19,12,0.48)',justifyContent:compact?'flex-end':'flex-start'}}>
   <Pressable accessible={false} focusable={false} onPress={()=>close()} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>
   {topic&&<View nativeID={panelId} testID="education-card" style={{backgroundColor:c.card,borderWidth:1,borderColor:c.line,borderRadius:compact?24:20,borderBottomLeftRadius:compact?0:20,borderBottomRightRadius:compact?0:20,width:compact?'100%':boxWidth,maxHeight:compact?height*0.9:height-top-16,marginTop:compact?0:top,marginLeft:compact?0:left}}>
    <View style={{padding:20,gap:8,borderBottomWidth:1,borderColor:c.line}}><T kind="small">EXPLICAÇÃO EDUCATIVA</T><T nativeID={panelId+'-title'} kind="heading">{topic.term}</T><Button buttonRef={closeRef} label="Fechar explicação" onPress={()=>close()}/></View>
    <ScrollView contentContainerStyle={{padding:20,gap:16}}><TopicSections topic={topic} compact/><T kind="small">Explicação geral. Não avalia o teu resultado nem define um tratamento.</T><SourceList topic={topic} compact/>
     <Button label="Ver ficha em Aprender" primary onPress={()=>{close(false);onTopic(topic.id);}}/>
     {topic.parameter&&<Button label="Ver histórico deste parâmetro" onPress={()=>history(topic.parameter!)}/>}
    </ScrollView>
   </View>}
  </View>
 </Modal></Education.Provider>;
}
export function InfoButton({id,label}:{id:string;label?:string}){
 const education=useContext(Education),ref=useRef<View>(null),trigger=useId(),{colors:c}=useTheme();const topic=topicById(id);
 if(!topic)return null;
 const restore=()=>{if(Platform.OS==='web')(ref.current as unknown as {focus?:()=>void})?.focus?.();};
 return <Pressable ref={ref} accessibilityRole="button" accessibilityLabel={'Sobre '+(label??topic.term)} accessibilityHint="Abre uma explicação educativa, sem avaliar o resultado" aria-haspopup="dialog" aria-expanded={education.trigger===trigger} aria-controls={education.trigger===trigger?education.panelId:undefined} onPress={()=>{if(ref.current)ref.current.measureInWindow((x,y,width,height)=>education.open(id,{x,y,width,height},restore,trigger));else education.open(id,undefined,restore,trigger);}} style={({pressed})=>({minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center',borderRadius:22,backgroundColor:pressed?c.line:c.soft})}>
  <View style={{width:21,height:21,borderWidth:1.5,borderColor:c.muted,borderRadius:11,alignItems:'center',justifyContent:'center'}}><T style={{fontSize:14,lineHeight:18,fontWeight:'700'}}>i</T></View>
 </Pressable>;
}
export function MedicalTerm({parameter,label,kind='heading'}:{parameter:Parameter;label?:string;kind?:'heading'|'body'}){
 const topic=topicForParameter(parameter);
 return <View style={[layout.row,{alignItems:'center',justifyContent:'space-between'}]}><View style={{flex:1,minWidth:0}}><T kind={kind}>{label??topic?.term??parameter}</T></View>{topic&&<InfoButton id={topic.id}/>}</View>;
}
export function SafetyNote(){const {colors:c}=useTheme();return <View style={{padding:14,borderRadius:12,backgroundColor:c.soft,gap:6}}><T style={{fontWeight:'600'}}>Conteúdo educativo · não é um diagnóstico</T><T kind="small">Explicação geral, independente dos teus valores. Não substitui avaliação médica nem define tratamentos ou objetivos individuais.</T></View>;}
function TopicSections({topic,compact=false}:{topic:Topic;compact?:boolean}){return <View style={{gap:20}}>{(compact?topic.sections.slice(0,2):topic.sections).map(section=><View key={section.title} style={{gap:6}}><T kind="heading" level={3} style={{fontSize:19,lineHeight:27}}>{section.title}</T><T>{section.body}</T></View>)}</View>;}
function SourceList({topic,compact=false}:{topic:Topic;compact?:boolean}){
 const {colors:c}=useTheme();
 return <View style={{gap:6}}><T kind="heading" level={3} style={{fontSize:19}}>Fontes e revisão</T>{(compact?topic.sources.slice(0,1):topic.sources).map(source=><View key={source.url}>{Platform.OS==='web'?<a href={source.url} hrefLang={source.language??'en'} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',minHeight:44,color:c.ink,fontSize:16,lineHeight:'24px',overflowWrap:'anywhere'}}>{source.name} ↗</a>:<Button label={source.name+' ↗'} onPress={()=>void Linking.openURL(source.url)}/>}
 <T kind="small">{source.language==='pt'?'Em português':'Em inglês'} · {source.verification==='consulted'?'Consultada editorialmente em '+source.checkedOn?.split('-').reverse().join('/'):'Ligação não confirmada nesta revisão.'}</T>{(!compact||source.verification!=='consulted')&&source.note&&<T kind="small">{source.note}</T>}</View>)}
 <T kind="small">{topic.editorialStatus==='reviewed'?'Revisto editorialmente em '+topic.reviewedOn.split('-').reverse().join('/'):'Rascunho editorial.'}</T>
 <T kind="small">{clinicallyReviewed(topic)?'Revisão profissional identificada: '+topic.professionalReview!.name+' · '+topic.professionalReview!.qualification+' · '+topic.professionalReview!.reviewedOn:'Revisão clínica independente pendente. Publicado como conteúdo educativo experimental.'}</T>
 {topic.reviewNotes.map(note=><T key={note} kind="small">{note}</T>)}</View>;
}
export function LearnScreen({selectedId,onSelect,initialCategory='Todas'}:{selectedId:string|null;onSelect:(id:string|null)=>void;initialCategory?:Category|'Todas'}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState<Category|'Todas'>(initialCategory),education=useContext(Education);
 const topic=selectedId?topicById(selectedId):undefined,featured=todayTopic();const results=searchTopics(query,category);
 if(topic)return <View style={layout.stack}><Button label="← Voltar aos tópicos" accessibilityLabel="Voltar aos tópicos" onPress={()=>onSelect(null)}/><Card><T kind="small">APRENDER · {topic.category.toLocaleUpperCase('pt-PT')}</T><T kind="heading" nativeID="learning-topic-title" tabIndex={-1}>{topic.title}</T><T>{topic.summary}</T><SafetyNote/><TopicSections topic={topic}/><SourceList topic={topic}/>
  {topic.parameter&&<Button label="Ver histórico deste parâmetro" primary onPress={()=>education.history(topic.parameter!)}/>}
  <T kind="heading">Continuar a aprender</T><View style={layout.row}>{topic.related.map(id=>{const related=topicById(id);return related?<Button key={id} label={'Ler: '+related.title} onPress={()=>onSelect(id)}/>:null;})}</View>
 </Card></View>;
 return <View style={{gap:24}}>
  <T>Palavras mais claras. Conversas mais informadas.</T><T kind="small">{publishedTopics.length} tópicos educativos · consulta local, sem personalização clínica.</T>
  <Card style={{borderWidth:0}}><T kind="small">APRENDER HOJE</T><T kind="heading">{featured.title}</T><T>{featured.summary}</T><Button label="Ler o destaque de hoje" variant="tertiary" onPress={()=>onSelect(featured.id)}/></Card>
  <Field label="Pesquisar termos e tópicos" value={query} onChange={setQuery} placeholder="Ex.: HbA1c, creatinina, consulta"/>
  <View style={{maxWidth:420,width:'100%'}}><Select label="Categoria educativa" value={category} options={(['Todas',...categories] as const).map(c=>({value:c,label:c}))} onChange={value=>setCategory(value as Category|'Todas')}/></View>
  <T kind="small" accessibilityLiveRegion="polite">{results.length} {results.length===1?'tópico encontrado':'tópicos encontrados'}</T>
  {!results.length&&<Card><T kind="heading">Não encontrámos esse tópico.</T><T>Experimenta outra palavra ou escolhe uma categoria diferente.</T><Button label="Limpar pesquisa e filtros" onPress={()=>{setQuery('');setCategory('Todas');}}/></Card>}
  <View style={layout.row}>{results.map(item=><View key={item.id} style={[layout.grow,{flexBasis:300}]}><Card style={{flex:1,borderWidth:0}}><T kind="small">{item.category}</T><T kind="heading" style={{fontSize:21,lineHeight:28}}>{item.title}</T><T kind="small" numberOfLines={3}>{item.summary}</T><View style={{flex:1}}/><Button label="Ler ficha →" accessibilityLabel={'Ler: '+item.title} variant="tertiary" onPress={()=>onSelect(item.id)}/></Card></View>)}</View>
  <SafetyNote/>
 </View>;
}
