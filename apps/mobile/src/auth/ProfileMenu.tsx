import React,{useRef,useState} from 'react';
import {Image,Modal,Platform,Pressable,ScrollView,View} from 'react-native';
import {Button,Card,T,useTheme} from '../ui';
import {avatarSymbols,useAuth} from './AuthProvider';
export type ProfileView='login'|'register'|'recovery'|'profile'|'preferences'|'privacy';
export function ProfileMenu({onProfile,onHistory}:{onProfile:(view:ProfileView)=>void;onHistory:()=>void}){
 const auth=useAuth(),{colors:c}=useTheme(),[open,setOpen]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),trigger=useRef<View>(null),closeButton=useRef<View>(null);
 const initials=auth.user?.displayName.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toLocaleUpperCase('pt-PT');
 function close(){setOpen(false);if(Platform.OS==='web')setTimeout(()=>(trigger.current as unknown as {focus?:()=>void})?.focus?.(),0);}
 function go(view:ProfileView){setOpen(false);onProfile(view);}
 return <><Pressable ref={trigger} accessibilityRole="button" accessibilityLabel="Abrir menu de perfil" aria-haspopup="dialog" aria-expanded={open} onPress={()=>{setError('');setOpen(true);}} style={{width:52,height:52,borderRadius:26,borderWidth:1,borderColor:c.control,backgroundColor:c.card,alignItems:'center',justifyContent:'center'}}>
 {auth.photo?<Image source={{uri:auth.photo}} accessible={false} style={{width:44,height:44,borderRadius:22}}/>:<T style={{fontSize:24,lineHeight:30,fontWeight:'700'}}>{auth.user?(avatarSymbols[auth.user.avatarPreset??'']??initials):'○'}</T>}</Pressable>
 <Modal transparent visible={open} animationType="none" onRequestClose={close} accessibilityLabel="Menu de perfil" onShow={()=>{if(Platform.OS==='web')(closeButton.current as unknown as {focus?:()=>void})?.focus?.();}}>
 <View style={{flex:1,backgroundColor:'rgba(5,19,12,0.48)',justifyContent:'center',padding:16}}><ScrollView contentContainerStyle={{maxWidth:460,width:'100%',alignSelf:'center'}}><Card><T kind="heading">{auth.user?.displayName??'A tua conta'}</T><Button buttonRef={closeButton} label="Fechar menu de perfil" onPress={close}/>
 {auth.user?<><Button label="O meu perfil" onPress={()=>go('profile')}/><Button label="Os meus exames" onPress={()=>{setOpen(false);onHistory();}}/><Button label="Preferências" onPress={()=>go('preferences')}/><Button label="Privacidade e segurança" onPress={()=>go('privacy')}/><Button label="Terminar sessão" disabled={busy} onPress={()=>{setBusy(true);void auth.signOut().then(close).catch(e=>setError((e as Error).message)).finally(()=>setBusy(false));}}/></>:<><Button label="Iniciar sessão" onPress={()=>go('login')}/><Button label="Criar conta" onPress={()=>go('register')}/><T kind="small">Contas experimentais: usa identidade fictícia. Os perfis de demonstração mantêm-se separados.</T></>}
 {!!error&&<T accessibilityRole="alert">{error}</T>}</Card></ScrollView></View></Modal></>;
}
