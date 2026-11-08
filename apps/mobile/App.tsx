import React,{useEffect,useReducer,useState} from 'react';
import {SafeAreaView,ScrollView,View,Pressable,Platform} from 'react-native';
import {areas,tabs,profiles,initialState,reducer,Area} from './src/model';
import {ClinicalPanel} from './src/clinical/ClinicalPanel';
import {ClinicalData,parameterLabels,displayDate,numberText} from './src/clinical/data';
import {clinicalRepository,confirmedResults,originFor} from './src/clinical/repository';
import {History} from './src/clinical/RecordViews';
import {PressureForm,PdfForm} from './src/clinical/Forms';
import {ThemeProvider,T,Card,Button,useTheme,layout} from './src/ui';
const descriptions=['Exames, documentos e evolução dos resultados.','Registos domiciliários e evolução ao longo do tempo.','Registos de SpO₂, com origem e contexto.','Medicação e compromissos, quando disponíveis.','Informação simples e preparação da consulta.'];
const icons=['≡','＋','○','□','↗'];
export default function App(){return <ThemeProvider><Shell/></ThemeProvider>;}
function Shell(){
 const {colors:c,dark,toggle}=useTheme();
 const [state,dispatch]=useReducer(reducer,initialState),[revision,setRevision]=useState(0),[load,setLoad]=useState<{owner:string;data?:ClinicalData;error?:string}>({owner:''}),[message,setMessage]=useState(''),[form,setForm]=useState<'pressure'|'pdf'>('pressure'),[resetConfirm,setResetConfirm]=useState(false);
 useEffect(()=>{if(Platform.OS==='web')document.getElementById('page-title')?.focus();},[state.profileId,state.tab,state.area]);
 const profile=profiles.find(p=>p.id===state.profileId)!;
 useEffect(()=>{let active=true;setLoad({owner:state.profileId});clinicalRepository.load(state.profileId).then(data=>{if(active)setLoad({owner:state.profileId,data});}).catch(e=>{if(active)setLoad({owner:state.profileId,error:e instanceof Error?e.message:'Não foi possível carregar a base local. Inicia o PULSO com o comando conjunto e tenta novamente.'});});return()=>{active=false;};},[state.profileId,revision]);
 const data=load.owner===state.profileId?load.data:undefined;
 const navigate=(tab:typeof tabs[number])=>{setMessage('');dispatch({type:'tab',tab});};
 const goArea=(area:Area)=>{setMessage('');dispatch({type:'area',area});};
 const saved=()=>{setRevision(x=>x+1);dispatch({type:'tab',tab:'Histórico'});setMessage('Concluído. Os resultados foram guardados no teu histórico neste navegador.');};
 const start=(which:'pressure'|'pdf')=>{setForm(which);navigate('Registar');};
 const rows=data?confirmedResults(data):[];
 const pressure=rows.find(r=>r.parameter==='systolic'&&r.value!==null&&r.measuredAt!==null);
 const documents=data?[...data.documents].sort((a,b)=>Date.parse(b.issuedAt)-Date.parse(a.issuedAt)):[];
 return <SafeAreaView style={{flex:1,backgroundColor:c.bg}}>
 <ScrollView key={state.profileId+'-'+state.tab+'-'+state.area} contentContainerStyle={{width:'100%',maxWidth:1120,alignSelf:'center',padding:24,gap:24,paddingBottom:36}}>
 <View style={[layout.row,{justifyContent:'space-between',alignItems:'center'}]}><T style={{fontSize:24,fontWeight:'900',letterSpacing:5}}>PULSO</T><Button label={dark?'Modo claro':'Modo escuro'} onPress={toggle}/></View>
 <View style={layout.stack}><T kind="small" style={{letterSpacing:1}}>DEMONSTRAÇÃO · DADOS FICTÍCIOS</T><T kind="small">{profile.displayName} · Base local · perfis fictícios</T>
 <T nativeID="page-title" tabIndex={-1} accessibilityRole="header" kind="title">{state.area??(state.tab==='Início'?'A minha saúde':state.tab)}</T><T kind="small">Organizar, acompanhar e compreender. Sem avaliação clínica automática.</T></View>
 {!!message&&<Card><T accessibilityLiveRegion="polite">{message}</T></Card>}
 {load.owner===state.profileId&&load.error?<Card><T accessibilityRole="alert">{load.error}</T><Button label="Tentar novamente" onPress={()=>setRevision(x=>x+1)}/></Card>:!data?<T accessibilityLiveRegion="polite">A carregar dados fictícios…</T>:
 state.area?<View style={layout.stack}>
 {['Análises ao sangue','Tensão arterial','Saúde respiratória'].includes(state.area)?<ClinicalPanel key={state.profileId+state.area} ownerId={state.profileId} data={data} parameters={state.area==='Análises ao sangue'?['glucose','ldl','creatinine','hemoglobin','hba1c']:state.area==='Tensão arterial'?['systolic','diastolic']:['spo2']}/>:
 <Card><T kind="heading">{state.area==='Medicação e consultas'?'Os teus compromissos':'Um espaço para aprender'}</T><T>{state.area==='Medicação e consultas'?'Ainda não há consultas ou medicação registadas.':'A biblioteca de conteúdos clínicos revistos ainda não está disponível.'}</T><T kind="small">Esta área continua em preparação. Não são gerados planos clínicos nem conteúdos personalizados.</T></Card>}
 <Button label="Voltar ao início" onPress={()=>navigate('Início')}/></View>:
 state.tab==='Início'?<>
 <Card><T kind="heading">O teu próximo registo, num só lugar</T><T>Adiciona um PDF de demonstração ou uma medição fictícia feita em casa.</T><View style={layout.row}><Button label="Adicionar exame" primary onPress={()=>start('pdf')}/><Button label="Adicionar medição" onPress={()=>start('pressure')}/></View></Card>
 <View style={layout.row}><View style={layout.grow}><Card><T kind="small">ÚLTIMOS EXAMES</T>{documents.length?documents.slice(0,2).map(d=><View key={d.id}><T style={{fontWeight:'600'}}>{d.title}</T><T kind="small">{displayDate(d.issuedAt)} · {d.laboratory}</T></View>):<T>Ainda sem exames. Importa o PDF sintético de exemplo.</T>}<Button label="Consultar exames e resultados" onPress={()=>navigate('Histórico')}/></Card></View>
 <View style={layout.grow}><Card><T kind="small">ÚLTIMA TENSÃO REGISTADA</T>{pressure?<><T kind="heading">{numberText(pressure.value!)} {pressure.unit} · sistólica</T><T kind="small">{displayDate(pressure.measuredAt!)} · {originFor(data,pressure)}</T><T kind="small">Ver sistólica e diastólica em séries independentes.</T></>:<T>Ainda sem medições. Começa por um registo fictício.</T>}<Button label="Ver evolução da tensão" onPress={()=>goArea('Tensão arterial')}/></Card></View></View>
 <T accessibilityRole="header" kind="heading">As tuas áreas de saúde</T><View style={layout.row}>{areas.map((area,i)=><Pressable key={area} accessibilityRole="button" accessibilityLabel={area} onPress={()=>goArea(area)} style={({pressed})=>({flexBasis:260,flexGrow:1,flexShrink:1,minWidth:0,borderRadius:20,padding:22,gap:10,borderWidth:1,borderColor:c.line,backgroundColor:pressed?c.soft:c.card})}><View accessible={false}><T style={{color:c.accentInk,backgroundColor:c.accent,width:44,height:44,textAlign:'center',paddingTop:7,borderRadius:13}}>{icons[i]}</T></View><T kind="heading">{area}</T><T kind="small">{descriptions[i]}</T><T kind="small">Explorar →</T></Pressable>)}</View>
 <View style={layout.row}><View style={layout.grow}><Card><T kind="heading">Próximas consultas</T><T kind="small">Nenhuma consulta registada. O calendário está em preparação.</T></Card></View><View style={layout.grow}><Card><T kind="heading">Compreender a tua informação</T><T kind="small">Conhece a origem e as limitações dos registos.</T><Button label="Abrir Aprender" onPress={()=>navigate('Aprender')}/></Card></View></View>
 </>:
 state.tab==='Histórico'?<History key={state.profileId+revision} data={data} onChanged={message=>{setRevision(x=>x+1);setMessage(message);}}/>:
 state.tab==='Registar'?<View style={layout.stack}><View style={layout.row}><Button label="Tensão arterial" selected={form==='pressure'} onPress={()=>setForm('pressure')}/><Button label="PDF laboratorial" selected={form==='pdf'} onPress={()=>setForm('pdf')}/></View>
 {form==='pressure'?<PressureForm key={state.profileId+'pressure'} owner={state.profileId} onSaved={saved}/>:<PdfForm key={state.profileId+'pdf'} owner={state.profileId} onSaved={saved}/>}</View>:
 state.tab==='Perfil'?<View style={layout.stack}><Card><T kind="heading">Perfis de demonstração</T><T kind="small">Sem autenticação de produção. A troca limpa detalhes e formulários não guardados.</T>{profiles.map(p=><Button key={p.id} label={p.displayName} selected={p.id===state.profileId} onPress={()=>{setMessage('');setResetConfirm(false);dispatch({type:'profile',id:p.id});}}/>)}</Card>
 <Card><T kind="heading">Dados locais</T><T kind="small">Guardados na base SQLite deste computador pela API. Sem conta real ou sincronização externa. Apenas dados fictícios.</T><Button label="Repor demonstração deste perfil" onPress={()=>setResetConfirm(true)}/>{resetConfirm&&<><T>Os registos e PDFs adicionados neste perfil serão removidos. As fixtures iniciais serão repostas.</T><Button label="Confirmar reposição" onPress={()=>void clinicalRepository.reset(state.profileId).then(()=>{setRevision(x=>x+1);setResetConfirm(false);setMessage('Demonstração reposta.');}).catch(()=>setMessage('Não foi possível repor.'))}/><Button label="Cancelar reposição" onPress={()=>setResetConfirm(false)}/></>}</Card></View>:
 <Card><T kind="heading">Conhecer os teus registos</T><T>Confere sempre a data, unidade, origem e documento. Confirmar um valor na aplicação não equivale a validação por um profissional.</T><T kind="small">Não existe ainda uma biblioteca clínica revista. Os gráficos descrevem dados e não avaliam o estado de saúde.</T></Card>}
 <T kind="small">PULSO experimental · Sem diagnóstico ou recomendações de tratamento</T>
 </ScrollView>
 <View accessibilityLabel="Navegação principal" style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6,padding:12,borderTopWidth:1,borderColor:c.line,backgroundColor:c.bg}}>{tabs.map(tab=><Button key={tab} label={tab} selected={state.tab===tab&&!state.area} onPress={()=>navigate(tab)}/>)}</View>
 </SafeAreaView>;
}






