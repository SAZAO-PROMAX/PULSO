import React,{createContext,useCallback,useContext,useEffect,useState} from 'react';
import {Experience} from '../experience';
import {Platform} from 'react-native';
import {apiFetch,setCsrf} from '../api';
import {ApiError} from '../clinical/repository';
export interface User {experience:Experience;id:string;email:string;emailVerified:boolean;version:number;displayName:string;fullName:string;birthDate:string|null;conditions:string[];conditionStatus:'self_declared';interests:string[];avatarPreset:string|null;hasPhoto:boolean}
interface Session{user:User|null;csrf:string|null}
export async function authRequest(path:string,body?:unknown,method='POST',version?:number){
 try{const response=await apiFetch('/auth/'+path,{method,headers:{'Content-Type':'application/json',...(version===undefined?{}:{'If-Match':String(version)})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok)throw new ApiError(data.detail??'Não foi possível concluir o pedido.',response.status);return data;
 }catch(e){if(e instanceof ApiError)throw e;throw Error('Não foi possível contactar o serviço local. Os campos foram mantidos; tente novamente.');}
}
const Auth=createContext<{user:User|null;photo:string|null;refresh:()=>Promise<User|null>;signIn:(email:string,password:string)=>Promise<void>;signOut:()=>Promise<void>}>({user:null,photo:null,refresh:async()=>null,signIn:async()=>{},signOut:async()=>{}});
export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<User|null>(null),[photo,setPhoto]=useState<{owner:string;url:string}|null>(null);
 const apply=useCallback((data:Session)=>{setCsrf(data.csrf);setUser(data.user);return data.user;},[]);
 const refresh=useCallback(async()=>{const response=await apiFetch('/auth/session',{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Não foi possível verificar a sessão.');return apply(await response.json());},[apply]);
 useEffect(()=>{void refresh().catch(()=>{});},[refresh]);
 useEffect(()=>{if(!user)return;const timer=setInterval(()=>void refresh().catch(()=>{}),60000);return()=>clearInterval(timer);},[user?.id,refresh]);
 useEffect(()=>{setPhoto(null);if(!user?.hasPhoto||Platform.OS!=='web')return;let url:string|null=null,active=true;const controller=new AbortController();
  const owner=user.id;void apiFetch('/auth/avatar',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Fotografia indisponível.');return r.blob();}).then(blob=>{if(active){url=URL.createObjectURL(blob);setPhoto({owner,url});}}).catch(()=>{});
  return()=>{active=false;controller.abort();if(url)URL.revokeObjectURL(url);};
 },[user?.id,user?.version,user?.hasPhoto]);
 async function signIn(email:string,password:string){
  const signed=await authRequest('login',{email,password});
  const confirmed:Session=await authRequest('session',undefined,'GET');
  if(!confirmed.user||confirmed.user.id!==signed.user.id){apply({user:null,csrf:null});throw Error('O navegador não confirmou o cookie de sessão. Permite cookies e usa o mesmo endereço local para a aplicação e a API. Tenta iniciar sessão novamente.');}
  apply(confirmed);
 }
 async function signOut(){try{await authRequest('logout');}catch(e){if(!(e instanceof ApiError&&e.status===401))throw e;}apply({user:null,csrf:null});}
 return <Auth.Provider value={{user,photo:user?.hasPhoto&&photo?.owner===user.id?photo.url:null,refresh,signIn,signOut}}>{children}</Auth.Provider>;
}
export const useAuth=()=>useContext(Auth);
