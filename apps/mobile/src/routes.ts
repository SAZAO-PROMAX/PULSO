import catalog from '../../../packages/shared/registration.json';
export const privateRoutes=['/app','/history','/record','/learn','/profile','/events','/evolution'] as const;
export type PrivateRoute=typeof privateRoutes[number];
export type RegistrationStep={step:'options'|'categories'|'camera'}|{step:'types';category:string}|{step:'form';category:string;type:string};
export function registrationRoute(value:RegistrationStep){return value.step==='options'?'/record':value.step==='form'?`/record/form/${value.category}/${value.type}`:value.step==='types'?`/record/types/${value.category}`:'/record/'+value.step;}
// Routes contain catalogue identifiers only, never document names, values or account data.
export function registrationStep(value:string):RegistrationStep|null{
 if(value==='/record')return {step:'options'};
 if(value==='/record/categories'||value==='/record/camera')return {step:value.endsWith('camera')?'camera':'categories'};
 const parts=value.split('/'),category=catalog.categories.find(c=>c.id===parts[3]);
 if(!category||parts[1]!=='record')return null;
 if(parts.length===4&&parts[2]==='types')return {step:'types',category:category.id};
 if(parts.length===5&&parts[2]==='form'&&category.types.some(t=>t.id===parts[4]&&t.mode!=='planned'))return {step:'form',category:category.id,type:parts[4]};
 return null;
}
export function safePrivateRoute(value:string):PrivateRoute|null{return (privateRoutes as readonly string[]).includes(value)?value as PrivateRoute:registrationStep(value)?'/record':null;}
export function currentRoute(){return typeof window!=='undefined'&&window.location?window.location.hash.slice(1)||'/':'/';}
export function goRoute(route:string){if(typeof window!=='undefined'&&window.location)window.location.hash=route;}
