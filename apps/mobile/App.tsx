import React,{useEffect,useReducer,useState,useRef} from 'react';
import {SafeAreaView,ScrollView,View,Platform,useWindowDimensions} from 'react-native';
import {tabs,areas,profiles,initialState,reducer,Area} from './src/model';
import {ClinicalPanel} from './src/clinical/ClinicalPanel';
import {ClinicalData,Parameter,labParameters,SavedAnalysis,SavedRecord} from './src/clinical/data';
import {clinicalRepository} from './src/clinical/repository';
import {EventEditor} from './src/clinical/EventViews';
import {History} from './src/clinical/RecordViews';
import {ThemeProvider,T,Card,Button,Select,useTheme,layout} from './src/ui';
import {PublicEntry} from './src/PublicEntry';
import {currentRoute,goRoute,safePrivateRoute} from './src/routes';
import {Onboarding} from './src/Onboarding';
import {Hub} from './src/Hub';
import {RegisterHub} from './src/RegisterHub';
import {AuthProvider,useAuth} from './src/auth/AuthProvider';
import {AccountPanel} from './src/auth/AccountPanel';
import {ProfileMenu,ProfileView} from './src/auth/ProfileMenu';
import {LearningProvider,LearnScreen} from './src/learning/Learning';
import {todayTopic} from './src/learning/content';
export default function App(){return <AuthProvider><ThemeProvider><SessionGate/></ThemeProvider></AuthProvider>;}
function SessionGate(){
 const auth=useAuth(),{colors:c}=useTheme(),[requested]=useState(()=>safePrivateRoute(currentRoute()));
 if(!auth.ready)return <SafeAreaView style={{flex:1,padding:24,backgroundColor:c.bg}}><T accessibilityLiveRegion="polite">A verificar sessão…</T></SafeAreaView>;
 if(!auth.user&&!auth.testAccess)return <PublicEntry/>;
 return <Shell key={auth.user?.id??'isolated-demo'} requested={requested}/>;
}
function Shell({requested}:{requested:ReturnType<typeof safePrivateRoute>}){
 const auth=useAuth(),isolatedDemo=auth.testAccess;
 const [destination,setDestination]=useState<(SavedRecord&{owner:string})|null>(null);
 const [historyVisit,setHistoryVisit]=useState(0);
 const scroll=useRef<ScrollView>(null);
 const [analysis,setAnalysis]=useState<(SavedAnalysis&{owner:string})|null>(null);
 const {colors:c,dark,toggle,preferenceWarning,settings,save,busy}=useTheme();
 const [onboarding,setOnboarding]=useState(false);
 const {width}=useWindowDimensions(),desktop=width>=900;
 const [state,dispatch]=useReducer(reducer,initialState),[revision,setRevision]=useState(0),[load,setLoad]=useState<{owner:string;revision?:number;data?:ClinicalData;error?:string}>({owner:''}),[message,setMessage]=useState(''),[form,setForm]=useState<'pressure'|'pdf'|'event'|null>(null),[resetConfirm,setResetConfirm]=useState(false);
 const [learnTopic,setLearnTopic]=useState<string|null>(null),[selectedParameter,setSelectedParameter]=useState<Parameter|null>(null);
 const [profileView,setProfileView]=useState<ProfileView>('profile');
 const owner=auth.user?.id??state.profileId,profile=auth.user??profiles.find(p=>p.id===state.profileId)!;
 useEffect(()=>{if(Platform.OS==='web')document.getElementById(learnTopic&&(state.tab==='Aprender'||state.area==='Saúde geral e prevenção')?'learning-topic-title':'page-title')?.focus();},[owner,state.tab,state.area,learnTopic]);
 useEffect(()=>{let active=true;setLoad(previous=>previous.owner===owner?previous:{owner});clinicalRepository.load(owner).then(data=>{if(active)setLoad({owner,revision,data});}).catch(e=>{if(active)setLoad({owner,revision,error:e instanceof Error?e.message:'Não foi possível carregar a base local. Inicia o PULSO com o comando conjunto e tenta novamente.'});});return()=>{active=false;};},[owner,revision]);
 useEffect(()=>{setDestination(null);setAnalysis(null);setOnboarding(false);setMessage('');setForm(null);setLearnTopic(null);setProfileView('profile');dispatch({type:'tab',tab:'Início'});},[auth.user?.id]);
 useEffect(()=>{if(isolatedDemo)return;const route=safePrivateRoute(currentRoute())??requested??'/app';const applyRoute=()=>{const next=safePrivateRoute(currentRoute())??'/app';const tab=next==='/history'||next==='/events'?'Histórico':next==='/record'?'Registar':next==='/learn'?'Aprender':next==='/profile'?'Perfil':'Início';dispatch({type:'tab',tab});if(next==='/evolution')dispatch({type:'area',area:'Análises ao sangue'});};goRoute(route);applyRoute();if(Platform.OS==='web')window.addEventListener('hashchange',applyRoute);return()=>{if(Platform.OS==='web')window.removeEventListener('hashchange',applyRoute);};},[]);
 const data=load.owner===owner?load.data:undefined;
 useEffect(()=>{scroll.current?.scrollTo({y:0,animated:false});},[owner,state.tab,state.area]);
 useEffect(()=>{if(analysis?.owner!==owner||!data||Platform.OS!=='web')return;const target=document.getElementById('analysis-evolution-title');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start'});},[analysis,owner,data]);
 const navigate=(tab:typeof tabs[number])=>{if(tab==='Perfil')setProfileView('profile');if(tab==='Histórico')setHistoryVisit(n=>n+1);setDestination(null);if(!isolatedDemo)goRoute(tab==='Histórico'?'/history':tab==='Registar'?'/record':tab==='Aprender'?'/learn':tab==='Perfil'?'/profile':'/app');setAnalysis(null);setMessage('');setLearnTopic(null);if(tab==='Registar')setForm(null);dispatch({type:'tab',tab});};
 const goArea=(area:Area)=>{setDestination(null);setAnalysis(null);setMessage('');setSelectedParameter(null);setLearnTopic(null);dispatch({type:'area',area});};
 const goParameter=(parameter:Parameter)=>{setDestination(null);setAnalysis(null);setMessage('');setLearnTopic(null);setSelectedParameter(parameter);dispatch({type:'area',area:labParameters.includes(parameter)?'Análises ao sangue':parameter==='spo2'?'Saúde respiratória':'Tensão arterial'});};
 const goTopic=(id:string)=>{setDestination(null);setAnalysis(null);setMessage('');setLearnTopic(id);dispatch({type:'tab',tab:'Aprender'});};
 const saved=(record?:SavedRecord)=>{setRevision(x=>x+1);setForm(null);setAnalysis(null);setDestination(record?{...record,owner}:null);dispatch({type:'tab',tab:'Histórico'});if(!isolatedDemo)goRoute('/history');setMessage(record?.kind==='document'?'Exame guardado.':record?.kind==='event'?'Acontecimento guardado.':'Medição guardada.');};
 const openEvolution=(documentId:string,parameter?:Parameter)=>{const params=[...new Set((data?.results??[]).filter(r=>r.documentId===documentId).map(r=>r.parameter))];setDestination(null);setAnalysis({owner,documentId,parameters:params});setSelectedParameter(parameter??params[0]??null);dispatch({type:'area',area:parameter&&!labParameters.includes(parameter)?parameter==='spo2'?'Saúde respiratória':'Tensão arterial':'Análises ao sangue'});};

 const start=(which:'pressure'|'pdf'|'event')=>{navigate('Registar');setForm(which);};
 return <LearningProvider key={owner} onTopic={goTopic} onHistory={goParameter}><SafeAreaView style={{flex:1,backgroundColor:c.bg}}>
 <View style={{borderBottomWidth:1,borderColor:c.line,backgroundColor:c.card}}><View style={[layout.row,{width:'100%',maxWidth:1120,alignSelf:'center',paddingHorizontal:width<600?16:24,paddingVertical:10,justifyContent:'space-between',alignItems:'center'}]}><T style={{fontSize:24,fontWeight:'900',letterSpacing:5}}>PULSO</T>{desktop&&<View accessibilityLabel="Navegação principal" style={layout.row}>{tabs.map(tab=><Button key={tab} label={tab} variant="nav" selected={state.tab===tab&&!state.area} onPress={()=>navigate(tab)}/>)}</View>}<View style={[layout.row,{alignItems:'center'}]}><Button label={dark?'☀':'◐'} accessibilityLabel={dark?'Modo claro':'Modo escuro'} variant="tertiary" disabled={busy} onPress={toggle}/><ProfileMenu onProfile={view=>{navigate('Perfil');setProfileView(view);}} onHistory={()=>navigate('Histórico')}/></View></View></View>
 <ScrollView ref={scroll} style={{flex:1,minHeight:0}} key={owner+'-'+state.tab+'-'+state.area} contentContainerStyle={{width:'100%',maxWidth:1120,alignSelf:'center',padding:width<600?16:24,gap:24,paddingBottom:36}}>
 {!!preferenceWarning&&<T accessibilityRole="alert" kind="small">{preferenceWarning}</T>}
 <View style={layout.stack}><T kind="small" style={{letterSpacing:1}}>{auth.user?'Conta experimental · dados fictícios':'Demonstração de teste · dados fictícios'}</T>
 <T nativeID="page-title" tabIndex={-1} accessibilityRole="header" kind="title">{state.area??(state.tab==='Início'?'A minha saúde':state.tab)}</T></View>
 {auth.user&&!auth.user.birthDate&&state.tab!=='Perfil'&&<Card><T kind="heading">Complete o seu perfil</T><T>A data de nascimento é agora obrigatória. Os registos existentes estão preservados.</T><Button label="Adicionar data de nascimento" primary onPress={()=>{navigate('Perfil');setProfileView('profile');}}/></Card>}

 {!!message&&<Card><T accessibilityLiveRegion="polite">{message}</T></Card>}
 {onboarding&&auth.user?<Onboarding onClose={()=>setOnboarding(false)}/>:state.tab==='Aprender'&&!state.area?<LearnScreen selectedId={learnTopic} onSelect={setLearnTopic}/>:
 state.area==='Saúde geral e prevenção'?<><Select label="Área de evolução" value={state.area} options={areas.map(area=>({value:area,label:area}))} onChange={area=>goArea(area as Area)}/><LearnScreen selectedId={learnTopic} onSelect={setLearnTopic} initialCategory="Prevenção"/><Button label="Voltar ao início" onPress={()=>navigate('Início')}/></>:
 load.owner===owner&&load.revision===revision&&load.error?<Card><T accessibilityRole="alert">{load.error}</T><Button label="Tentar novamente" onPress={()=>setRevision(x=>x+1)}/><Button label="Abrir Aprender" onPress={()=>navigate('Aprender')}/></Card>:!data||destination?.owner===owner&&load.revision!==revision?<T accessibilityLiveRegion="polite">A carregar dados fictícios…</T>:
 state.area?<View style={layout.stack}><Select label="Área de evolução" value={state.area} options={areas.map(area=>({value:area,label:area}))} onChange={area=>goArea(area as Area)}/>
 {['Análises ao sangue','Tensão arterial','Saúde respiratória'].includes(state.area)?<ClinicalPanel key={owner+state.area+selectedParameter+(analysis?.owner===owner?analysis.documentId:'')} importedDocumentId={analysis?.owner===owner?analysis.documentId:undefined} ownerId={owner} data={data} initialParameter={selectedParameter} parameters={state.area==='Análises ao sangue'?labParameters:state.area==='Tensão arterial'?['systolic','diastolic','heart_rate']:['spo2']}/>:
 <Card><T kind="heading">Os teus compromissos</T><T>O calendário e o registo de medicação continuam em preparação.</T><T kind="small">Entretanto, podes preparar informação para conversar com a tua equipa de saúde.</T><Button label="Como preparar uma consulta" onPress={()=>goTopic('prepare-visit')}/><Button label="Levar uma lista de medicação" onPress={()=>goTopic('medicine-list')}/></Card>}
 <Button label="Voltar ao início" onPress={()=>navigate('Início')}/></View>:
 state.tab==='Início'?<Hub data={data} ownerId={owner} profileName={profile.displayName} featured={todayTopic()} onImport={()=>start('pdf')} onPressure={()=>start('pressure')} onHistory={()=>navigate('Histórico')} onArea={goArea} onParameter={goParameter} onLearn={()=>navigate('Aprender')}/>:
 state.tab==='Histórico'?<History onImport={()=>start('pdf')} onPressure={()=>start('pressure')} onEvent={()=>start('event')} key={owner+'-'+historyVisit} data={data} initialRecord={destination?.owner===owner?destination:undefined} onEvolution={openEvolution} onChanged={message=>{setDestination(null);setRevision(x=>x+1);setMessage(message);}}/>:
 state.tab==='Registar'&&form==='event'?<EventEditor owner={owner} data={data} onSaved={id=>saved({kind:'event',id})} onCancel={()=>setForm(null)}/>:state.tab==='Registar'?<View style={layout.stack}><RegisterHub onEvent={()=>setForm('event')} key={owner+'-'+form} owner={owner} onSaved={saved} initialMode={form==='event'?null:form}/></View>:
 state.tab==='Perfil'?<View style={layout.stack}><View style={{maxWidth:760,width:"100%",alignSelf:"center"}}><AccountPanel onOnboarding={()=>setOnboarding(true)} view={profileView} onView={setProfileView} onHistory={()=>navigate('Histórico')}/></View>{!auth.user&&isolatedDemo&&<><Card><T kind="heading">Perfis de demonstração</T><T kind="small">Estes perfis não são contas autenticadas. A troca limpa detalhes e formulários não guardados.</T>{profiles.map(p=><Button key={p.id} label={p.displayName} selected={p.id===state.profileId} onPress={()=>{setMessage('');setResetConfirm(false);dispatch({type:'profile',id:p.id});}}/>)}</Card>
 <Card><T kind="heading">Dados locais</T><T kind="small">Guardados neste computador pelo serviço local. Sem sincronização externa. Apenas dados fictícios.</T><Button label="Repor demonstração deste perfil" onPress={()=>setResetConfirm(true)}/>{resetConfirm&&<><T>Os registos e PDFs adicionados neste perfil serão removidos. Os exemplos iniciais serão repostos.</T><Button label="Confirmar reposição" onPress={()=>void clinicalRepository.reset(state.profileId).then(()=>{setRevision(x=>x+1);setResetConfirm(false);setMessage('Demonstração reposta.');}).catch(()=>setMessage('Não foi possível repor.'))}/><Button label="Cancelar reposição" onPress={()=>setResetConfirm(false)}/></>}</Card></>}</View>:
 null}
 {auth.user&&!settings.onboardingCompleted&&!onboarding&&state.tab==='Início'&&<Card><T kind="heading">O PULSO ao seu ritmo</T><T>Escolha a apresentação e as áreas que quer ver primeiro. Pode alterar tudo mais tarde.</T><Button label="Configurar a minha experiência" onPress={()=>setOnboarding(true)}/><Button label="Saltar primeiros passos" onPress={()=>void save({...settings,onboardingCompleted:true}).catch(()=>{})}/></Card>}
 <T kind="small">PULSO experimental · apenas dados fictícios · sem avaliação clínica</T>
 </ScrollView>
 {!desktop&&<ScrollView accessibilityLabel="Navegação principal" keyboardShouldPersistTaps="handled" style={{flexGrow:0,flexShrink:0,maxHeight:'30%',borderTopWidth:1,borderColor:c.line,backgroundColor:c.card}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:2,padding:6,paddingBottom:Platform.OS==='web'?'max(6px, env(safe-area-inset-bottom))' as any:6}}>{tabs.map(tab=><Button key={tab} label={tab} variant="nav" selected={state.tab===tab&&!state.area} onPress={()=>navigate(tab)}/>)}</ScrollView>}
 </SafeAreaView></LearningProvider>;
}
