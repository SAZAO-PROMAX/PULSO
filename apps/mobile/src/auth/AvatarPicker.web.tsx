import React,{useRef} from 'react';
import {Button,T} from '../ui';
export function AvatarPicker({onFile,disabled}:{onFile:(file:File)=>void;disabled:boolean}){
 const input=useRef<HTMLInputElement>(null);
 return <><input ref={input} aria-label="Selecionar fotografia sintética de perfil" type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" disabled={disabled} style={{display:'none'}} onChange={e=>{const file=e.target.files?.[0];if(file)onFile(file);e.target.value='';}}/><Button label="Carregar ou alterar fotografia sintética" disabled={disabled} onPress={()=>input.current?.click()}/><T kind="small">PNG/JPEG até 1 MB e 4 megapíxeis. A imagem é reduzida e os metadados removidos. Apenas fotografias fictícias.</T></>;
}
