import React,{useState,useEffect} from 'react';
import {View,Platform} from 'react-native';
import {Button,Card,T,layout,useTheme} from './ui';
import {ExperienceControls} from './ExperiencePanel';
import {ConditionSelector} from './auth/AccountPanel';
import {useAuth,authRequest} from './auth/AuthProvider';
import {areas} from './model';
import {modes} from './experience';
const titles=['Bem-vindo ao PULSO','A sua apresentação','Ao seu ritmo','Acessibilidade','Áreas prioritárias','Condições de saúde','Tudo pronto'];
export function Onboarding({onClose}:{onClose:()=>void}){
 const auth=useAuth(),theme=useTheme(),[value,setValue]=useState(theme.settings),[conditions,setConditions]=useState(auth.user?.conditions??[]),[step,setStep]=useState(theme.settings.onboardingStep),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(Platform.OS==='web')document.getElementById('onboarding-title')?.focus();},[step]);
 async function next(finish=false){setBusy(true);setError('');try{
  if(step===5&&auth.user&&JSON.stringify(conditions)!==JSON.stringify(auth.user.conditions)){if(!auth.user.birthDate)throw Error('Complete primeiro a data de nascimento no Perfil; pode saltar este passo.');await authRequest('profile',{...auth.user,conditions},'PATCH',auth.user.version);await auth.refresh();}
  // refresh above may change the version; save uses the fresh session directly.
  if(auth.user){const user=await auth.refresh();await authRequest('preferences',{...value,onboardingStep:finish?6:Math.min(6,step+1),onboardingCompleted:finish},'PATCH',user!.version);await auth.refresh();}
  if(finish)onClose();else setStep(s=>s+1);
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <Card><T kind="small">Primeiros passos · {step+1} de 7</T><T kind="heading" nativeID="onboarding-title" tabIndex={-1}>{titles[step]}</T>
 {step===0&&<><T>Organize exames, acompanhe medições, consulte o histórico e aprenda ao seu ritmo.</T><T kind="small">Sem diagnóstico ou avaliação automática. Use apenas dados fictícios nesta versão experimental.</T></>}
 {step===1&&<ExperienceControls part="mode" value={value} onChange={setValue} disabled={busy}/>}
 {step===2&&<><T>Como se sente a utilizar aplicações no telemóvel? Resposta opcional.</T>{([['guided','Prefiro receber orientação'],['regular','Utilizo aplicações habitualmente'],['advanced','Sinto-me confortável com opções avançadas'],['skip','Prefiro não responder']] as const).map(([id,label])=><Button key={id} label={label} selected={value.technology===id} disabled={busy} onPress={()=>setValue({...value,technology:id})}/>)}<T kind="small">{value.technology==='guided'?'Pode experimentar o modo Simples; a escolha continua a ser sua.':'A resposta não limita funcionalidades e não depende da idade.'}</T>{value.technology==='guided'&&<Button label="Experimentar o modo Simples" onPress={()=>setValue({...value,mode:'simple',guidedHelp:true})}/>}</>}
 {step===3&&<ExperienceControls part="accessibility" value={value} onChange={setValue} disabled={busy}/>}
 {step===4&&<><T>Quais as áreas que pretende ver primeiro? Todas continuam disponíveis.</T><View style={layout.row}>{areas.map(area=><Button key={area} label={area} selected={value.primaryAreas.includes(area)} disabled={busy} onPress={()=>setValue({...value,primaryAreas:value.primaryAreas.includes(area)?value.primaryAreas.filter(v=>v!==area):[...value.primaryAreas,area]})}/>)}</View><T kind="small">Medicação e consultas partilham a área já existente; não há calendário ou gestão terapêutica nova.</T></>}
 {step===5&&<ConditionSelector selected={conditions} onChange={setConditions}/>}
 {step===6&&<><T>Apresentação: {modes.find(m=>m.id===value.mode)?.label}. Tema: {value.theme==='system'?'sistema':value.theme==='dark'?'escuro':'claro'}.</T><T>Áreas prioritárias: {value.primaryAreas.join(', ')||'todas, na ordem habitual'}.</T><T>{conditions.length} condições autodeclaradas. Nenhuma foi validada clinicamente.</T><T kind="small">Pode rever estes passos ou alterar as escolhas através do Perfil.</T></>}
 <View style={layout.row}>{step>0&&<Button label="Anterior" disabled={busy} onPress={()=>setStep(s=>s-1)}/>}<Button label={step===6?'Entrar no Hub':'Continuar'} primary disabled={busy} onPress={()=>void next(step===6)}/>{step===5&&<Button label="Saltar condições" disabled={busy} onPress={()=>{setConditions(auth.user?.conditions??[]);setStep(6);}}/>}<Button label="Continuar mais tarde" disabled={busy} onPress={onClose}/></View>{!!error&&<T accessibilityRole="alert">{error}</T>}{busy&&<T accessibilityLiveRegion="polite">A guardar escolhas…</T>}</Card>;
}
