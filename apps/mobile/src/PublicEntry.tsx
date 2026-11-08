import React,{useEffect,useState} from 'react';
import {Platform,ScrollView,View} from 'react-native';
import {T,Button,Card,layout,useTheme} from './ui';
import {AccountPanel} from './auth/AccountPanel';
import {ProfileView} from './auth/ProfileMenu';
import {currentRoute,goRoute,safePrivateRoute} from './routes';
import {useAuth} from './auth/AuthProvider';
export function PublicEntry(){
 const auth=useAuth(),theme=useTheme(),[route,setRoute]=useState(currentRoute);
 useEffect(()=>{if(Platform.OS!=='web')return;const update=()=>setRoute(currentRoute());window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 function navigate(route:string){setRoute(route);goRoute(route);}
 const view:ProfileView=route==='/register'?'register':route==='/recovery'?'recovery':'login',home=route==='/'||!['/login','/register','/recovery','/privacy'].includes(route)&&!safePrivateRoute(route);
 return <ScrollView style={{flex:1,backgroundColor:theme.colors.bg}} contentContainerStyle={{maxWidth:880,width:'100%',alignSelf:'center',padding:24,gap:24,paddingBottom:40}}><View style={[layout.row,{alignItems:'center',justifyContent:'space-between'}]}><T style={{fontSize:24,fontWeight:'900',letterSpacing:5}}>PULSO</T><Button label={theme.dark?'Modo claro':'Modo escuro'} onPress={theme.toggle}/></View>
 {home?<><T kind="title">A sua informação de saúde, organizada num só lugar.</T><T>Guarde exames, acompanhe registos e consulte a sua evolução.</T><View style={layout.row}><Button label="Criar conta" primary onPress={()=>navigate('/register')}/><Button label="Iniciar sessão" onPress={()=>navigate('/login')}/></View><Card><T kind="heading">Ao seu ritmo</T><T>Exames e documentos num histórico pessoal.</T><T>Medições e acontecimentos com origem identificada.</T><T>Explicações para compreender a informação.</T></Card></>:route==='/privacy'?<Card><T kind="heading">Privacidade e utilização</T><T>Protótipo experimental local. Use apenas identidades e documentos fictícios.</T><T>Não é uma ferramenta clínica validada. Não produz diagnósticos nem recomenda tratamentos.</T><T>O acesso pessoal exige conta. A base local ainda não tem proteção adequada para dados reais. Recuperação e verificação de e-mail são apenas de desenvolvimento, sem envio de correio.</T></Card>:<AccountPanel view={view} onView={v=>navigate(v==='register'?'/register':v==='recovery'?'/recovery':'/login')} onHistory={()=>{}}/>}
 {!home&&<Button label="Voltar à página inicial" onPress={()=>navigate('/')}/>}<Button label="Privacidade e utilização" onPress={()=>navigate('/privacy')}/><T kind="small">PULSO experimental · apenas dados fictícios</T>{!!auth.sessionError&&<Card><T accessibilityRole="alert">{auth.sessionError}</T><Button label="Verificar sessão" onPress={()=>void auth.refresh().catch(()=>{})}/></Card>}</ScrollView>;
}
