import {useEffect,useRef,useState} from 'react';
import {Platform,Alert} from 'react-native';
import {currentRoute} from './routes';
const guards=new Map<symbol,{dirty:boolean;busy:boolean}>();
let approved=false;
export function confirmLeave(){
 if(approved)return true;
 if([...guards.values()].some(g=>g.busy))return false;
 if(![...guards.values()].some(g=>g.dirty))return true;
 if(Platform.OS!=='web'){Alert.alert('Alterações por guardar','Guarde ou cancele a edição antes de sair.');return false;}
 const accepted=window.confirm('Tem alterações por guardar. Descartar as alterações e sair?');
 if(accepted){approved=true;setTimeout(()=>{approved=false;},0);}return accepted;
}
export function useEditGuard(value:unknown,busy=false){
 const serial=JSON.stringify(value),baseline=useRef(serial),id=useRef(Symbol()),latest=useRef(serial);latest.current=serial;
 useEffect(()=>{guards.set(id.current,{dirty:serial!==baseline.current,busy});return()=>{guards.delete(id.current);};},[serial,busy]);
 useEffect(()=>{
  if(Platform.OS!=='web')return;
  let route=currentRoute(),previous=window.history.state,reverting=false;
  const pop=(e:Event)=>{if(!confirmLeave()){reverting=true;window.history.pushState(previous,'','#'+route);e.stopImmediatePropagation();setTimeout(()=>{reverting=false;},0);}else previous=window.history.state;};
  const unload=(e:BeforeUnloadEvent)=>{if([...guards.values()].some(g=>g.dirty)){e.preventDefault();e.returnValue='';}};
  const change=(e:Event)=>{if(reverting){e.stopImmediatePropagation();return;}if(!confirmLeave()){window.history.replaceState(window.history.state,'','#'+route);e.stopImmediatePropagation();}else route=currentRoute();};
  window.addEventListener('popstate',pop,true);window.addEventListener('beforeunload',unload);window.addEventListener('hashchange',change,true);
  return()=>{window.removeEventListener('popstate',pop,true);window.removeEventListener('beforeunload',unload);window.removeEventListener('hashchange',change,true);};
 },[]);
 return {reset:(value?:unknown)=>{baseline.current=value===undefined?latest.current:JSON.stringify(value);guards.delete(id.current);},leave:(work:()=>void)=>{if(Platform.OS!=='web'&&latest.current!==baseline.current){Alert.alert('Alterações por guardar','Descartar as alterações?',[{text:'Continuar a editar',style:'cancel'},{text:'Descartar',style:'destructive',onPress:work}]);}else if(confirmLeave())work();}};
}
// Context identifiers only; drafts and field values never enter browser history.
let scheduled=false,pending:Record<string,string|null>={};
function contextValue(key:string,initial:string|null){const context=window.history.state?.pulsoContext;return context&&Object.prototype.hasOwnProperty.call(context,key)?typeof context[key]==='string'?context[key]:null:initial;}
export function useContextStep(key:string,initial:string|null){
 const [value,setValue]=useState<string|null>(()=>Platform.OS==='web'?contextValue(key,initial):initial);
 const current=useRef(value);current.current=value;
 useEffect(()=>{if(Platform.OS!=='web')return;window.history.replaceState({...window.history.state,pulsoContext:{...window.history.state?.pulsoContext,[key]:value}},'');const pop=()=>setValue(contextValue(key,initial));window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[key]);
 return [value,(next:string|null)=>{if(next===current.current)return;if(!confirmLeave())return;current.current=next;setValue(next);if(Platform.OS!=='web')return;pending[key]=next;if(!scheduled){scheduled=true;queueMicrotask(()=>{window.history.pushState({...window.history.state,pulsoContext:{...window.history.state?.pulsoContext,...pending}},'');pending={};scheduled=false;});}}] as const;
}
