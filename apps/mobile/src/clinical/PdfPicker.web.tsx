import React,{useRef,useState} from 'react';
import {useTheme} from '../ui';
export function PdfPicker({onFile,disabled}:{onFile:(file:File)=>void;disabled:boolean}){
 const input=useRef<HTMLInputElement>(null),[drag,setDrag]=useState(false);const {colors:c}=useTheme();
 return <div onDragOver={e=>{e.preventDefault();if(!disabled)setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(!disabled&&e.dataTransfer.files[0])onFile(e.dataTransfer.files[0]);}} style={{padding:24,border:'2px dashed '+c.line,borderRadius:16,background:drag?c.soft:c.bg,color:c.ink,textAlign:'center'}}>
 <div aria-hidden="true" style={{fontSize:32}}>▤</div><p>Seleciona um PDF ou fotografia sintética para começar, ou arrasta-o para aqui.</p>
 <input ref={input} aria-label="Selecionar documento sintético" type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" disabled={disabled} style={{display:'none'}} onChange={e=>{const file=e.target.files?.[0];if(file)onFile(file);e.target.value='';}}/>
 <button type="button" disabled={disabled} onClick={()=>input.current?.click()} style={{minHeight:52,padding:'12px 24px',fontSize:18,fontWeight:600,border:'1px solid '+c.line,borderRadius:12,background:c.accent,color:c.accentInk}}>Selecionar documento</button>
 <p>PDF, PNG ou JPEG sintético · até 2 MB e 3 páginas</p></div>;
}
