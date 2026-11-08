const host=typeof window!=='undefined'&&window.location?.hostname?window.location.hostname:'127.0.0.1';
export const API=process.env.EXPO_PUBLIC_API_URL??('http://'+host+':8000');
let csrf:string|null=null;
export const setCsrf=(value:string|null)=>{csrf=value;};
export const sessionHeaders=(method='GET'):Record<string,string>=>csrf&&!['GET','HEAD','OPTIONS'].includes(method)?{'X-Pulso-CSRF':csrf}:{};
export function apiFetch(path:string,init:RequestInit={}){const method=init.method??'GET';return fetch(API+path,{...init,credentials:'include',headers:{...Object.fromEntries(new Headers(init.headers)),...sessionHeaders(method)}});}
