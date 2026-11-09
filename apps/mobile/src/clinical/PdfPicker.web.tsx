import React,{useRef,useState} from 'react';
import {InputDocument} from './inputDocument';
import {useTheme} from '../ui';
export function PdfPicker({onFile,onClear,selected,stage,disabled}:{onFile:(file:InputDocument)=>void;onClear:()=>void;selected:InputDocument|null;stage:string;disabled:boolean}){
 const input=useRef<HTMLInputElement>(null),[drag,setDrag]=useState(false),{colors:c,scale,settings}=useTheme();
 const button:React.CSSProperties={minHeight:48,maxWidth:'100%',padding:'12px 20px',fontSize:18*scale,fontWeight:600,fontFamily:'inherit',border:'1px solid '+c.control,borderRadius:12,cursor:disabled?'default':'pointer',opacity:disabled?.55:1};
 const format=selected?.name.split('.').pop()?.toLocaleUpperCase('pt-PT')??'Documento';
 return <section aria-label="Área de seleção do documento" aria-busy={disabled} onDragOver={e=>{e.preventDefault();if(!disabled)setDrag(true);}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setDrag(false);}} onDrop={e=>{e.preventDefault();setDrag(false);if(!disabled&&e.dataTransfer.files[0])onFile(e.dataTransfer.files[0]);}} style={{padding:24,border:'2px '+(selected?'solid ':'dashed ')+c.control,borderRadius:16,background:drag||selected?c.soft:c.bg,color:c.ink,textAlign:'center',fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',fontSize:18*scale,lineHeight:1.5,minWidth:0}}>
 <style>{`@keyframes pulso-file-enter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
 <input ref={input} aria-label="Selecionar documento sintético" type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" disabled={disabled} style={{display:'none'}} onChange={e=>{const file=e.target.files?.[0];if(file)onFile(file);e.target.value='';}}/>
 {selected?<div key={selected.name+'-'+selected.size+'-'+('lastModified' in selected?selected.lastModified:'capture')} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,minWidth:0,animation:settings.reducedMotion?'none':'pulso-file-enter 160ms ease-out'}}>
  <div aria-hidden="true" style={{minWidth:56,padding:'10px 12px',borderRadius:12,background:c.card,border:'1px solid '+c.line,fontWeight:700}}>{format}</div>
  <div style={{fontWeight:700,overflowWrap:'anywhere',maxWidth:'100%'}}>{selected.name}</div>
  <div style={{fontSize:16*scale,color:c.muted}}>{format} · {new Intl.NumberFormat('pt-PT',{maximumFractionDigits:1}).format(selected.size/1024)} KB · ainda não guardado</div>
  <div role="status" aria-live="polite" style={{fontWeight:600}}>{stage||'Ficheiro selecionado'}</div>
  <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:8,maxWidth:'100%'}}><button type="button" disabled={disabled} onClick={()=>input.current?.click()} style={{...button,background:c.card,color:c.ink}}>Trocar documento</button><button type="button" disabled={disabled} onClick={onClear} style={{...button,background:'transparent',borderColor:'transparent',color:c.ink}}>Cancelar seleção</button></div>
 </div>:<><div aria-hidden="true" style={{fontSize:32}}>▤</div><p>Selecione um documento ou arraste-o para aqui.</p><button type="button" disabled={disabled} onClick={()=>input.current?.click()} style={{...button,background:c.accent,color:c.accentInk}}>Selecionar documento</button><p style={{fontSize:16*scale,color:c.muted,marginBottom:0}}>PDF, PNG ou JPEG sintético · até 2 MB e 3 páginas</p></>}
 </section>;
}
