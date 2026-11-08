import React,{useEffect,useReducer,useState,useRef} from 'react';
import {SafeAreaView,ScrollView,View,Platform,useWindowDimensions} from 'react-native';
import {tabs,profiles,initialState,reducer,Area} from './src/model';
import {ClinicalPanel} from './src/clinical/ClinicalPanel';
import {ClinicalData,Parameter,labParameters,SavedAnalysis} from './src/clinical/data';
import {clinicalRepository} from './src/clinical/repository';
import {EventEditor} from './src/clinical/EventViews';
import {History} from './src/clinical/RecordViews';
import {ThemeProvider,T,Card,Button,useTheme,layout} from './src/ui';
import {Onboarding} from './src/Onboarding';
import {Hub} from './src/Hub';
import {RegisterHub} from './src/RegisterHub';
import {AuthProvider,useAuth} from './src/auth/AuthProvider';
import {AccountPanel} from './src/auth/AccountPanel';
import {ProfileMenu,ProfileView} from './src/auth/ProfileMenu';
import {LearningProvider,LearnScreen} from './src/learning/Learning';
import {publishedTopics,todayTopic} from './src/learning/content';
export default function App(){return <AuthProvider><ThemeProvider><Shell/></ThemeProvider></AuthProvider>;}
function Shell(){
 const auth=useAuth();
 const scroll=useRef<ScrollView>(null);
 const [analysis,setAnalysis]=useState<(SavedAnalysis&{owner:string})|null>(null);
 const {colors:c,dark,toggle,preferenceWarning,settings,save,busy}=useTheme();
 const [onboarding,setOnboarding]=useState(false);
 const {width}=useWindowDimensions();
 const [state,dispatch]=useReducer(reducer,initialState),[revision,setRevision]=useState(0),[load,setLoad]=useState<{owner:string;revision?:number;data?:ClinicalData;error?:string}>({owner:''}),[message,setMessage]=useState(''),[form,setForm]=useState<'pressure'|'pdf'|'event'|null>(null),[resetConfirm,setResetConfirm]=useState(false);
 const [learnTopic,setLearnTopic]=useState<string|null>(null),[selectedParameter,setSelectedParameter]=useState<Parameter|null>(null);
 const [profileView,setProfileView]=useState<ProfileView>('profile');
 const owner=auth.user?.id??state.profileId,profile=auth.user??profiles.find(p=>p.id===state.profileId)!;
 useEffect(()=>{if(Platform.OS==='web')document.getElementById(learnTopic&&(state.tab==='Aprender'||state.area==='Saúde geral e prevenção')?'learning-topic-title':'page-title')?.focus();},[owner,state.tab,state.area,learnTopic]);
 useEffect(()=>{let active=true;setLoad({owner,revision});clinicalRepository.load(owner).then(data=>{if(active)setLoad({owner,revision,data});}).catch(e=>{if(active)setLoad({owner,revision,error:e instanceof Error?e.message:'Não foi possível carregar a base local. Inicia o PULSO com o comando conjunto e tenta novamente.'});});return()=>{active=false;};},[owner,revision]);
 useEffect(()=>{setAnalysis(null);setOnboarding(false);setMessage('');setForm(null);setLearnTopic(null);setProfileView('profile');dispatch({type:'tab',tab:'Início'});},[auth.user?.id]);
 const data=load.owner===owner&&load.revision===revision?load.data:undefined;
 useEffect(()=>{scroll.current?.scrollTo({y:0,animated:false});},[owner,state.tab,state.area]);
 useEffect(()=>{if(analysis?.owner!==owner||!data||Platform.OS!=='web')return;const target=document.getElementById('analysis-evolution-title');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start'});},[analysis,owner,data]);
 const navigate=(tab:typeof tabs[number])=>{setAnalysis(null);setMessage('');setLearnTopic(null);if(tab==='Registar')setForm(null);dispatch({type:'tab',tab});};
 const goArea=(area:Area)=>{setAnalysis(null);setMessage('');setSelectedParameter(null);setLearnTopic(null);dispatch({type:'area',area});};
 const goParameter=(parameter:Parameter)=>{setAnalysis(null);setMessage('');setLearnTopic(null);setSelectedParameter(parameter);dispatch({type:'area',area:labParameters.includes(parameter)?'Análises ao sangue':parameter==='spo2'?'Saúde respiratória':'Tensão arterial'});};
 const goTopic=(id:string)=>{setAnalysis(null);setMessage('');setLearnTopic(id);dispatch({type:'tab',tab:'Aprender'});};
 const saved=(result?:SavedAnalysis)=>{setRevision(x=>x+1);setForm(null);setAnalysis(result?{...result,owner}:null);if(result){setSelectedParameter(result.parameters[0]??null);dispatch({type:'area',area:'Análises ao sangue'});setMessage('Resultados confirmados e guardados. A evolução abre nos parâmetros desta análise, mantendo os registos anteriores comparáveis.');}else{dispatch({type:'tab',tab:'Histórico'});setMessage('Concluído. Os registos foram guardados no teu histórico.');}};
 const start=(which:'pressure'|'pdf'|'event')=>{navigate('Registar');setForm(which);};
 return <LearningProvider key={owner} onTopic={goTopic} onHistory={goParameter}><SafeAreaView style={{flex:1,backgroundColor:c.bg}}>
 <View style={[layout.row,{width:'100%',maxWidth:1120,alignSelf:'center',paddingHorizontal:width<600?16:24,paddingVertical:12,justifyContent:'space-between',alignItems:'center'}]}><T style={{fontSize:24,fontWeight:'900',letterSpacing:5}}>PULSO</T><View style={[layout.row,{alignItems:'center'}]}>{width>=460&&<Button label={dark?'Modo claro':'Modo escuro'} disabled={busy} onPress={toggle}/>}<ProfileMenu onProfile={view=>{navigate('Perfil');setProfileView(view);}} onHistory={()=>navigate('Histórico')}/></View></View>
 <ScrollView ref={scroll} key={owner+'-'+state.tab+'-'+state.area} contentContainerStyle={{width:'100%',maxWidth:1120,alignSelf:'center',padding:width<600?16:24,gap:24,paddingBottom:36}}>
 {width<460&&<View style={{alignItems:'flex-end'}}><Button label={dark?'Modo claro':'Modo escuro'} disabled={busy} onPress={toggle}/></View>}
 {!!preferenceWarning&&<T accessibilityRole="alert" kind="small">{preferenceWarning}</T>}
 <View style={layout.stack}><T kind="small" style={{letterSpacing:1}}>{auth.user?'CONTA EXPERIMENTAL · DADOS FICTÍCIOS':'DEMONSTRAÇÃO · DADOS FICTÍCIOS'}</T><T kind="small">{profile.displayName} · Base local · {auth.user?'conta individual experimental':'perfis fictícios'}</T>
 <T nativeID="page-title" tabIndex={-1} accessibilityRole="header" kind="title">{state.area??(state.tab==='Início'?'A minha saúde':state.tab)}</T><T kind="small">Organizar, acompanhar e compreender. Sem avaliação clínica automática.</T></View>
 {auth.user&&!auth.user.birthDate&&state.tab!=='Perfil'&&<Card><T kind="heading">Complete o seu perfil</T><T>A data de nascimento é agora obrigatória. Os registos existentes estão preservados.</T><Button label="Adicionar data de nascimento" primary onPress={()=>{navigate('Perfil');setProfileView('profile');}}/></Card>}
 {auth.user&&!settings.onboardingCompleted&&!onboarding&&state.tab==='Início'&&<Card><T kind="heading">O PULSO ao seu ritmo</T><T>Escolha a apresentação e as áreas que quer ver primeiro. Pode alterar tudo mais tarde.</T><Button label="Configurar a minha experiência" onPress={()=>setOnboarding(true)}/><Button label="Saltar primeiros passos" onPress={()=>void save({...settings,onboardingCompleted:true}).catch(()=>{})}/></Card>}
 {!!message&&<Card><T accessibilityLiveRegion="polite">{message}</T></Card>}
 {onboarding&&auth.user?<Onboarding onClose={()=>setOnboarding(false)}/>:state.tab==='Aprender'&&!state.area?<LearnScreen selectedId={learnTopic} onSelect={setLearnTopic}/>:
 state.area==='Saúde geral e prevenção'?<><LearnScreen selectedId={learnTopic} onSelect={setLearnTopic} initialCategory="Prevenção"/><Button label="Voltar ao início" onPress={()=>navigate('Início')}/></>:
 load.owner===owner&&load.revision===revision&&load.error?<Card><T accessibilityRole="alert">{load.error}</T><Button label="Tentar novamente" onPress={()=>setRevision(x=>x+1)}/><Button label="Abrir Aprender" onPress={()=>navigate('Aprender')}/></Card>:!data?<T accessibilityLiveRegion="polite">A carregar dados fictícios…</T>:
 state.area?<View style={layout.stack}>
 {['Análises ao sangue','Tensão arterial','Saúde respiratória'].includes(state.area)?<ClinicalPanel key={owner+state.area+selectedParameter+(analysis?.owner===owner?analysis.documentId:'')} importedDocumentId={analysis?.owner===owner?analysis.documentId:undefined} ownerId={owner} data={data} initialParameter={selectedParameter} parameters={state.area==='Análises ao sangue'?labParameters:state.area==='Tensão arterial'?['systolic','diastolic','heart_rate']:['spo2']}/>:
 <Card><T kind="heading">Os teus compromissos</T><T>O calendário e o registo de medicação continuam em preparação.</T><T kind="small">Entretanto, podes preparar informação para conversar com a tua equipa de saúde.</T><Button label="Como preparar uma consulta" onPress={()=>goTopic('prepare-visit')}/><Button label="Levar uma lista de medicação" onPress={()=>goTopic('medicine-list')}/></Card>}
 <Button label="Voltar ao início" onPress={()=>navigate('Início')}/></View>:
 state.tab==='Início'?<Hub data={data} ownerId={owner} profileName={profile.displayName} topicCount={publishedTopics.length} featured={todayTopic()} onEvent={()=>start('event')} onImport={()=>start('pdf')} onPressure={()=>start('pressure')} onHistory={()=>navigate('Histórico')} onArea={goArea} onParameter={goParameter} onLearn={()=>navigate('Aprender')} onTopic={goTopic}/>:
 state.tab==='Histórico'?<History key={owner+revision} data={data} onChanged={message=>{setRevision(x=>x+1);setMessage(message);}}/>:
 state.tab==='Registar'&&form==='event'?<EventEditor owner={owner} data={data} onSaved={()=>{saved();setMessage('Acontecimento guardado na cronologia.');}} onCancel={()=>setForm(null)}/>:state.tab==='Registar'?<View style={layout.stack}><RegisterHub onEvent={()=>setForm('event')} key={owner+'-'+form} owner={owner} onSaved={saved} initialMode={form==='event'?null:form}/></View>:
 state.tab==='Perfil'?<View style={layout.stack}><AccountPanel onOnboarding={()=>setOnboarding(true)} view={profileView} onView={setProfileView} onHistory={()=>navigate('Histórico')}/>{!auth.user&&<><Card><T kind="heading">Perfis de demonstração</T><T kind="small">Estes perfis não são contas autenticadas. A troca limpa detalhes e formulários não guardados.</T>{profiles.map(p=><Button key={p.id} label={p.displayName} selected={p.id===state.profileId} onPress={()=>{setMessage('');setResetConfirm(false);dispatch({type:'profile',id:p.id});}}/>)}</Card>
 <Card><T kind="heading">Dados locais</T><T kind="small">Guardados neste computador pelo serviço local. Sem sincronização externa. Apenas dados fictícios.</T><Button label="Repor demonstração deste perfil" onPress={()=>setResetConfirm(true)}/>{resetConfirm&&<><T>Os registos e PDFs adicionados neste perfil serão removidos. Os exemplos iniciais serão repostos.</T><Button label="Confirmar reposição" onPress={()=>void clinicalRepository.reset(state.profileId).then(()=>{setRevision(x=>x+1);setResetConfirm(false);setMessage('Demonstração reposta.');}).catch(()=>setMessage('Não foi possível repor.'))}/><Button label="Cancelar reposição" onPress={()=>setResetConfirm(false)}/></>}</Card></>}</View>:
 null}
 <T kind="small">PULSO v0.7.1 experimental · Sem diagnóstico ou recomendações de tratamento</T>
 </ScrollView>
 <ScrollView accessibilityLabel="Navegação principal" keyboardShouldPersistTaps="handled" style={{flexGrow:0,flexShrink:0,maxHeight:'35%',borderTopWidth:1,borderColor:c.line,backgroundColor:c.bg}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6,padding:12}}>{tabs.map(tab=><Button key={tab} label={tab} selected={state.tab===tab&&!state.area} onPress={()=>navigate(tab)}/>)}</ScrollView>
 </SafeAreaView></LearningProvider>;
}
