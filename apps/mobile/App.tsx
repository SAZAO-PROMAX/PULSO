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
import {AuthProvider,useAuth} from './src/auth/AuthProvider';
import {AccountPanel} from './src/auth/AccountPanel';
import {ProfileMenu,ProfileView} from './src/auth/ProfileMenu';
import {LearningProvider,LearnScreen} from './src/learning/Learning';
import {publishedTopics,todayTopic} from './src/learning/content';
export default function App(){return <ThemeProvider><AuthProvider><Shell/></AuthProvider></ThemeProvider>;}
function Shell(){
 const auth=useAuth();
 const {colors:c,dark,toggle,preferenceWarning}=useTheme();
 const {width}=useWindowDimensions();
 const [state,dispatch]=useReducer(reducer,initialState),[revision,setRevision]=useState(0),[load,setLoad]=useState<{owner:string;data?:ClinicalData;error?:string}>({owner:''}),[message,setMessage]=useState(''),[form,setForm]=useState<'pressure'|'pdf'|null>(null),[resetConfirm,setResetConfirm]=useState(false);
 const [learnTopic,setLearnTopic]=useState<string|null>(null),[selectedParameter,setSelectedParameter]=useState<Parameter|null>(null);
 const [profileView,setProfileView]=useState<ProfileView>('profile');
 const owner=auth.user?.id??state.profileId,profile=auth.user??profiles.find(p=>p.id===state.profileId)!;
 useEffect(()=>{if(Platform.OS==='web')document.getElementById(learnTopic&&(state.tab==='Aprender'||state.area==='Saúde geral e prevenção')?'learning-topic-title':'page-title')?.focus();},[owner,state.tab,state.area,learnTopic]);
 useEffect(()=>{let active=true;setLoad({owner});clinicalRepository.load(owner).then(data=>{if(active)setLoad({owner,data});}).catch(e=>{if(active)setLoad({owner,error:e instanceof Error?e.message:'Não foi possível carregar a base local. Inicia o PULSO com o comando conjunto e tenta novamente.'});});return()=>{active=false;};},[owner,revision]);
 useEffect(()=>{setMessage('');setForm(null);setLearnTopic(null);setProfileView('profile');dispatch({type:'tab',tab:'Início'});},[auth.user?.id]);
 const data=load.owner===owner?load.data:undefined;
 const navigate=(tab:typeof tabs[number])=>{setMessage('');setLearnTopic(null);if(tab==='Registar')setForm(null);dispatch({type:'tab',tab});};
 const goArea=(area:Area)=>{setMessage('');setSelectedParameter(null);setLearnTopic(null);dispatch({type:'area',area});};
 const goParameter=(parameter:Parameter)=>{setMessage('');setLearnTopic(null);setSelectedParameter(parameter);dispatch({type:'area',area:labParameters.includes(parameter)?'Análises ao sangue':parameter==='spo2'?'Saúde respiratória':'Tensão arterial'});};
 const goTopic=(id:string)=>{setMessage('');setLearnTopic(id);dispatch({type:'tab',tab:'Aprender'});};
 const saved=()=>{setRevision(x=>x+1);dispatch({type:'tab',tab:'Histórico'});setMessage('Concluído. Os resultados foram guardados no teu histórico.');};
 const start=(which:'pressure'|'pdf')=>{navigate('Registar');setForm(which);};
 return <LearningProvider key={owner} onTopic={goTopic} onHistory={goParameter}><SafeAreaView style={{flex:1,backgroundColor:c.bg}}>
 <View style={[layout.row,{width:'100%',maxWidth:1120,alignSelf:'center',paddingHorizontal:width<600?16:24,paddingVertical:12,justifyContent:'space-between',alignItems:'center'}]}><T style={{fontSize:24,fontWeight:'900',letterSpacing:5}}>PULSO</T><View style={[layout.row,{alignItems:'center'}]}>{width>=460&&<Button label={dark?'Modo claro':'Modo escuro'} onPress={toggle}/>}<ProfileMenu onProfile={view=>{navigate('Perfil');setProfileView(view);}} onHistory={()=>navigate('Histórico')}/></View></View>
 <ScrollView key={owner+'-'+state.tab+'-'+state.area} contentContainerStyle={{width:'100%',maxWidth:1120,alignSelf:'center',padding:width<600?16:24,gap:24,paddingBottom:36}}>
 {width<460&&<View style={{alignItems:'flex-end'}}><Button label={dark?'Modo claro':'Modo escuro'} onPress={toggle}/></View>}
 {!!preferenceWarning&&<T accessibilityRole="alert" kind="small">{preferenceWarning}</T>}
 <View style={layout.stack}><T kind="small" style={{letterSpacing:1}}>{auth.user?'CONTA EXPERIMENTAL · DADOS FICTÍCIOS':'DEMONSTRAÇÃO · DADOS FICTÍCIOS'}</T><T kind="small">{profile.displayName} · Base local · {auth.user?'conta individual experimental':'perfis fictícios'}</T>
 <T nativeID="page-title" tabIndex={-1} accessibilityRole="header" kind="title">{state.area??(state.tab==='Início'?'A minha saúde':state.tab)}</T><T kind="small">Organizar, acompanhar e compreender. Sem avaliação clínica automática.</T></View>
 {!!message&&<Card><T accessibilityLiveRegion="polite">{message}</T></Card>}
 {state.tab==='Aprender'&&!state.area?<LearnScreen selectedId={learnTopic} onSelect={setLearnTopic}/>:
 state.area==='Saúde geral e prevenção'?<><LearnScreen selectedId={learnTopic} onSelect={setLearnTopic} initialCategory="Prevenção"/><Button label="Voltar ao início" onPress={()=>navigate('Início')}/></>:
 load.owner===owner&&load.error?<Card><T accessibilityRole="alert">{load.error}</T><Button label="Tentar novamente" onPress={()=>setRevision(x=>x+1)}/><Button label="Abrir Aprender" onPress={()=>navigate('Aprender')}/></Card>:!data?<T accessibilityLiveRegion="polite">A carregar dados fictícios…</T>:
 state.area?<View style={layout.stack}>
 {['Análises ao sangue','Tensão arterial','Saúde respiratória'].includes(state.area)?<ClinicalPanel key={owner+state.area+selectedParameter} ownerId={owner} data={data} initialParameter={selectedParameter} parameters={state.area==='Análises ao sangue'?labParameters:state.area==='Tensão arterial'?['systolic','diastolic','heart_rate']:['spo2']}/>:
 <Card><T kind="heading">Os teus compromissos</T><T>O calendário e o registo de medicação continuam em preparação.</T><T kind="small">Entretanto, podes preparar informação para conversar com a tua equipa de saúde.</T><Button label="Como preparar uma consulta" onPress={()=>goTopic('prepare-visit')}/><Button label="Levar uma lista de medicação" onPress={()=>goTopic('medicine-list')}/></Card>}
 <Button label="Voltar ao início" onPress={()=>navigate('Início')}/></View>:
 state.tab==='Início'?<Hub data={data} ownerId={owner} profileName={profile.displayName} topicCount={publishedTopics.length} featured={todayTopic()} onImport={()=>start('pdf')} onPressure={()=>start('pressure')} onHistory={()=>navigate('Histórico')} onArea={goArea} onParameter={goParameter} onLearn={()=>navigate('Aprender')} onTopic={goTopic}/>:
 state.tab==='Histórico'?<History key={owner+revision} data={data} onChanged={message=>{setRevision(x=>x+1);setMessage(message);}}/>:
 state.tab==='Registar'?<RegisterHub key={owner+'-'+form} owner={owner} onSaved={saved} initialMode={form}/>:
 state.tab==='Perfil'?<View style={layout.stack}><AccountPanel view={profileView} onView={setProfileView} onHistory={()=>navigate('Histórico')}/>{!auth.user&&<><Card><T kind="heading">Perfis de demonstração</T><T kind="small">Estes perfis não são contas autenticadas. A troca limpa detalhes e formulários não guardados.</T>{profiles.map(p=><Button key={p.id} label={p.displayName} selected={p.id===state.profileId} onPress={()=>{setMessage('');setResetConfirm(false);dispatch({type:'profile',id:p.id});}}/>)}</Card>
 <Card><T kind="heading">Dados locais</T><T kind="small">Guardados neste computador pelo serviço local. Sem sincronização externa. Apenas dados fictícios.</T><Button label="Repor demonstração deste perfil" onPress={()=>setResetConfirm(true)}/>{resetConfirm&&<><T>Os registos e PDFs adicionados neste perfil serão removidos. Os exemplos iniciais serão repostos.</T><Button label="Confirmar reposição" onPress={()=>void clinicalRepository.reset(state.profileId).then(()=>{setRevision(x=>x+1);setResetConfirm(false);setMessage('Demonstração reposta.');}).catch(()=>setMessage('Não foi possível repor.'))}/><Button label="Cancelar reposição" onPress={()=>setResetConfirm(false)}/></>}</Card></>}</View>:
 null}
 <T kind="small">PULSO v0.6 experimental · Sem diagnóstico ou recomendações de tratamento</T>
 </ScrollView>
 <ScrollView accessibilityLabel="Navegação principal" keyboardShouldPersistTaps="handled" style={{flexGrow:0,flexShrink:0,maxHeight:'35%',borderTopWidth:1,borderColor:c.line,backgroundColor:c.bg}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6,padding:12}}>{tabs.map(tab=><Button key={tab} label={tab} selected={state.tab===tab&&!state.area} onPress={()=>navigate(tab)}/>)}</ScrollView>
 </SafeAreaView></LearningProvider>;
}
