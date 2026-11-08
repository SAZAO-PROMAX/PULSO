import React,{createContext,useCallback,useContext,useEffect,useState,useRef} from 'react';
import {Experience} from '../experience';
import {Platform} from 'react-native';
import {apiFetch,setCsrf,onSessionExpired} from '../api';
import {ApiError} from '../clinical/repository';
export interface User {experience:Experience;id:string;email:string;emailVerified:boolean;version:number;displayName:string;fullName:string;birthDate:string|null;conditions:string[];conditionStatus:'self_declared';interests:string[];avatarPreset:string|null;hasPhoto:boolean}
interface Session{user:User|null;csrf:string|null}
export async function authRequest(path:string,body?:unknown,method='POST',version?:number){
 try{const response=await apiFetch('/auth/'+path,{method,headers:{'Content-Type':'application/json',...(version===undefined?{}:{'If-Match':String(version)})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok)throw new ApiError(data.detail??'Não foi possível concluir o pedido.',response.status);return data;
 }catch(e){if(e instanceof ApiError)throw e;throw Error('Não foi possível contactar o serviço local. Os campos foram mantidos; tente novamente.');}
}
const Auth=createContext<{user:User|null;ready:boolean;testAccess:boolean;sessionError:string;photo:string|null;refresh:()=>Promise<User|null>;signIn:(email:string,password:string)=>Promise<void>;signOut:()=>Promise<void>}>({user:null,ready:false,testAccess:false,sessionError:'',photo:null,refresh:async()=>null,signIn:async()=>{},signOut:async()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}){
 const [testAccess,setTestAccess]=useState(false),[contextReady,setContextReady]=useState(false);
 useEffect(()=>{void apiFetch('/auth/test-context',{signal:AbortSignal.timeout(5000)}).then(r=>r.json()).then(data=>setTestAccess(data.enabled===true)).catch(()=>{}).finally(()=>setContextReady(true));},[]);
 const generation=useRef(0);const [ready,setReady]=useState(false),[sessionError,setSessionError]=useState('');
 const [user,setUser]=useState<User|null>(null),[photo,setPhoto]=useState<{owner:string;url:string}|null>(null);
 const apply=useCallback((data:Session)=>{setCsrf(data.csrf);setUser(data.user);setReady(true);setSessionError('');return data.user;},[]);
 const refresh=useCallback(async()=>{const before=generation.current;try{const response=await apiFetch('/auth/session',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Não foi possível verificar a sessão.');const value=await response.json();return before===generation.current?apply(value):null;}catch(e){if(before===generation.current){setReady(true);setSessionError('Não foi possível verificar a sessão. Tente novamente.');}throw e;}},[apply]);
 useEffect(()=>{onSessionExpired(()=>{generation.current++;apply({user:null,csrf:null});});return()=>onSessionExpired(null);},[apply]);
 useEffect(()=>{void refresh().catch(()=>{});},[refresh]);
 useEffect(()=>{if(Platform.OS!=='web')return;const check=(e:PageTransitionEvent)=>{if(e.persisted){setReady(false);void refresh().catch(()=>{});}};window.addEventListener('pageshow',check);return()=>window.removeEventListener('pageshow',check);},[refresh]);
 useEffect(()=>{if(!user)return;const timer=setInterval(()=>void refresh().catch(()=>{}),60000);return()=>clearInterval(timer);},[user?.id,refresh]);
 useEffect(()=>{setPhoto(null);if(!user?.hasPhoto||Platform.OS!=='web')return;let url:string|null=null,active=true;const controller=new AbortController();
  const owner=user.id;void apiFetch('/auth/avatar',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Fotografia indisponível.');return r.blob();}).then(blob=>{if(active){url=URL.createObjectURL(blob);setPhoto({owner,url});}}).catch(()=>{});
  return()=>{active=false;controller.abort();if(url)URL.revokeObjectURL(url);};
 },[user?.id,user?.version,user?.hasPhoto]);
 async function signIn(email:string,password:string){
  const before=++generation.current;const signed=await authRequest('login',{email,password});
  const confirmed:Session=await authRequest('session',undefined,'GET');
  if(!confirmed.user||confirmed.user.id!==signed.user.id){apply({user:null,csrf:null});throw Error('O navegador não confirmou o cookie de sessão. Permite cookies e usa o mesmo endereço local para a aplicação e a API. Tenta iniciar sessão novamente.');}
  if(before===generation.current)apply(confirmed);
 }
 async function signOut(){generation.current++;try{await authRequest('logout');}catch(e){if(!(e instanceof ApiError&&e.status===401))throw e;}if(Platform.OS==='web')window.location.hash='/';apply({user:null,csrf:null});}
 return <Auth.Provider value={{user,ready:ready&&contextReady,testAccess,sessionError,photo:user?.hasPhoto&&photo?.owner===user.id?photo.url:null,refresh,signIn,signOut}}>{children}</Auth.Provider>;
}
export const useAuth=()=>useContext(Auth);
