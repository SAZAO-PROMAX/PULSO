import React,{useEffect,useReducer,useState} from 'react';
import {SafeAreaView,ScrollView,View,Platform,useWindowDimensions} from 'react-native';
import {tabs,profiles,initialState,reducer,Area} from './src/model';
import {ClinicalPanel} from './src/clinical/ClinicalPanel';
import {ClinicalData,Parameter,labParameters} from './src/clinical/data';
import {clinicalRepository} from './src/clinical/repository';
import {History} from './src/clinical/RecordViews';
import {ThemeProvider,T,Card,Button,useTheme,layout} from './src/ui';
import {Hub} from './src/Hub';
import {RegisterHub} from './src/RegisterHub';
import {LearningProvider,LearnScreen} from './src/learning/Learning';
import {publishedTopics,todayTopic} from './src/learning/content';
export default function App(){return <ThemeProvider><Shell/></ThemeProvider>;}
function Shell(){
 const {colors:c,dark,toggle,preferenceWarning}=useTheme();
 const {width}=useWindowDimensions();
 const [state,dispatch]=useReducer(reducer,initialState),[revision,setRevision]=useState(0),[load,setLoad]=useState<{owner:string;data?:ClinicalData;error?:string}>({owner:''}),[message,setMessage]=useState(''),[form,setForm]=useState<'pressure'|'pdf'|null>(null),[resetConfirm,setResetConfirm]=useState(false);
 const [learnTopic,setLearnTopic]=useState<string|null>(null),[selectedParameter,setSelectedParameter]=useState<Parameter|null>(null);
 useEffect(()=>{if(Platform.OS==='web')document.getElementById(learnTopic&&(state.tab==='Aprender'||state.area==='Saúde geral e prevenção')?'learning-topic-title':'page-title')?.focus();},[state.profileId,state.tab,state.area,learnTopic]);
 const profile=profiles.find(p=>p.id===state.profileId)!;
 useEffect(()=>{let active=true;setLoad({owner:state.profileId});clinicalRepository.load(state.profileId).then(data=>{if(active)setLoad({owner:state.profileId,data});}).catch(e=>{if(active)setLoad({owner:state.profileId,error:e instanceof Error?e.message:'Não foi possível carregar a base local. Inicia o PULSO com o comando conjunto e tenta novamente.'});});return()=>{active=false;};},[state.profileId,revision]);
 const data=load.owner===state.profileId?load.data:undefined;
 const navigate=(tab:typeof tabs[number])=>{setMessage('');setLearnTopic(null);if(tab==='Registar')setForm(null);dispatch({type:'tab',tab});};
 const goArea=(area:Area)=>{setMessage('');setSelectedParameter(null);setLearnTopic(null);dispatch({type:'area',area});};
 const goParameter=(parameter:Parameter)=>{setMessage('');setLearnTopic(null);setSelectedParameter(parameter);dispatch({type:'area',area:labParameters.includes(parameter)?'Análises ao sangue':parameter==='spo2'?'Saúde respiratória':'Tensão arterial'});};
 const goTopic=(id:string)=>{setMessage('');setLearnTopic(id);dispatch({type:'tab',tab:'Aprender'});};
 const saved=()=>{setRevision(x=>x+1);dispatch({type:'tab',tab:'Histórico'});setMessage('Concluído. Os resultados foram guardados no teu histórico.');};
 const start=(which:'pressure'|'pdf')=>{navigate('Registar');setForm(which);};
 return <LearningProvider key={state.profileId} onTopic={goTopic} onHistory={goParameter}><SafeAreaView style={{flex:1,backgroundColor:c.bg}}>
 <ScrollView key={state.profileId+'-'+state.tab+'-'+state.area} contentContainerStyle={{width:'100%',maxWidth:1120,alignSelf:'center',padding:width<600?16:24,gap:24,paddingBottom:36}}>
 <View style={[layout.row,{justifyContent:'space-between',alignItems:'center'}]}><T style={{fontSize:24,fontWeight:'900',letterSpacing:5}}>PULSO</T><Button label={dark?'Modo claro':'Modo escuro'} onPress={toggle}/></View>
 {!!preferenceWarning&&<T accessibilityRole="alert" kind="small">{preferenceWarning}</T>}
 <View style={layout.stack}><T kind="small" style={{letterSpacing:1}}>DEMONSTRAÇÃO · DADOS FICTÍCIOS</T><T kind="small">{profile.displayName} · Base local · perfis fictícios</T>
 <T nativeID="page-title" tabIndex={-1} accessibilityRole="header" kind="title">{state.area??(state.tab==='Início'?'A minha saúde':state.tab)}</T><T kind="small">Organizar, acompanhar e compreender. Sem avaliação clínica automática.</T></View>
 {!!message&&<Card><T accessibilityLiveRegion="polite">{message}</T></Card>}
 {state.tab==='Aprender'&&!state.area?<LearnScreen selectedId={learnTopic} onSelect={setLearnTopic}/>:
 state.area==='Saúde geral e prevenção'?<><LearnScreen selectedId={learnTopic} onSelect={setLearnTopic} initialCategory="Prevenção"/><Button label="Voltar ao início" onPress={()=>navigate('Início')}/></>:
 load.owner===state.profileId&&load.error?<Card><T accessibilityRole="alert">{load.error}</T><Button label="Tentar novamente" onPress={()=>setRevision(x=>x+1)}/><Button label="Abrir Aprender" onPress={()=>navigate('Aprender')}/></Card>:!data?<T accessibilityLiveRegion="polite">A carregar dados fictícios…</T>:
 state.area?<View style={layout.stack}>
 {['Análises ao sangue','Tensão arterial','Saúde respiratória'].includes(state.area)?<ClinicalPanel key={state.profileId+state.area+selectedParameter} ownerId={state.profileId} data={data} initialParameter={selectedParameter} parameters={state.area==='Análises ao sangue'?labParameters:state.area==='Tensão arterial'?['systolic','diastolic','heart_rate']:['spo2']}/>:
 <Card><T kind="heading">Os teus compromissos</T><T>O calendário e o registo de medicação continuam em preparação.</T><T kind="small">Entretanto, podes preparar informação para conversar com a tua equipa de saúde.</T><Button label="Como preparar uma consulta" onPress={()=>goTopic('prepare-visit')}/><Button label="Levar uma lista de medicação" onPress={()=>goTopic('medicine-list')}/></Card>}
 <Button label="Voltar ao início" onPress={()=>navigate('Início')}/></View>:
 state.tab==='Início'?<Hub data={data} ownerId={state.profileId} profileName={profile.displayName} topicCount={publishedTopics.length} featured={todayTopic()} onImport={()=>start('pdf')} onPressure={()=>start('pressure')} onHistory={()=>navigate('Histórico')} onArea={goArea} onParameter={goParameter} onLearn={()=>navigate('Aprender')} onTopic={goTopic}/>:
 state.tab==='Histórico'?<History key={state.profileId+revision} data={data} onChanged={message=>{setRevision(x=>x+1);setMessage(message);}}/>:
 state.tab==='Registar'?<RegisterHub key={state.profileId+'-'+form} owner={state.profileId} onSaved={saved} initialMode={form}/>:
 state.tab==='Perfil'?<View style={layout.stack}><Card><T kind="heading">Perfis de demonstração</T><T kind="small">Sem autenticação de produção. A troca limpa detalhes e formulários não guardados.</T>{profiles.map(p=><Button key={p.id} label={p.displayName} selected={p.id===state.profileId} onPress={()=>{setMessage('');setResetConfirm(false);dispatch({type:'profile',id:p.id});}}/>)}</Card>
 <Card><T kind="heading">Dados locais</T><T kind="small">Guardados neste computador pelo serviço local. Sem conta real ou sincronização externa. Apenas dados fictícios.</T><Button label="Repor demonstração deste perfil" onPress={()=>setResetConfirm(true)}/>{resetConfirm&&<><T>Os registos e PDFs adicionados neste perfil serão removidos. Os exemplos iniciais serão repostos.</T><Button label="Confirmar reposição" onPress={()=>void clinicalRepository.reset(state.profileId).then(()=>{setRevision(x=>x+1);setResetConfirm(false);setMessage('Demonstração reposta.');}).catch(()=>setMessage('Não foi possível repor.'))}/><Button label="Cancelar reposição" onPress={()=>setResetConfirm(false)}/></>}</Card></View>:
 null}
 <T kind="small">PULSO experimental · Sem diagnóstico ou recomendações de tratamento</T>
 </ScrollView>
 <ScrollView accessibilityLabel="Navegação principal" keyboardShouldPersistTaps="handled" style={{flexGrow:0,flexShrink:0,maxHeight:'35%',borderTopWidth:1,borderColor:c.line,backgroundColor:c.bg}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6,padding:12}}>{tabs.map(tab=><Button key={tab} label={tab} selected={state.tab===tab&&!state.area} onPress={()=>navigate(tab)}/>)}</ScrollView>
 </SafeAreaView></LearningProvider>;
}
