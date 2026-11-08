const host=typeof window!=='undefined'&&window.location?.hostname?window.location.hostname:'127.0.0.1';
export const API=process.env.EXPO_PUBLIC_API_URL??('http://'+host+':8000');
let csrf:string|null=null,epoch=0;let expired:(()=>void)|null=null;
export const sessionEpoch=()=>epoch;
export const onSessionExpired=(handler:(()=>void)|null)=>{expired=handler;};
export const expireSession=(requestEpoch:number)=>{if(requestEpoch===epoch)expired?.();};
export const setCsrf=(value:string|null)=>{if(csrf!==value)epoch++;csrf=value;};
export const sessionHeaders=(method='GET'):Record<string,string>=>csrf&&!['GET','HEAD','OPTIONS'].includes(method)?{'X-Pulso-CSRF':csrf}:{};
export async function apiFetch(path:string,init:RequestInit={}){const requestEpoch=epoch,method=init.method??'GET';const response=await fetch(API+path,{...init,credentials:'include',headers:{...Object.fromEntries(new Headers(init.headers)),...sessionHeaders(method)}});if(response.status===401)expireSession(requestEpoch);return response;}
