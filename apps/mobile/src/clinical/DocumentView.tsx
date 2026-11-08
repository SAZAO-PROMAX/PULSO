import React,{useState} from 'react';
import {View,Platform} from 'react-native';
import {Button,T,layout} from '../ui';
import {MedicalDocument} from './data';
export function DocumentView({doc}:{doc:MedicalDocument}) {
 const [open,setOpen]=useState(false);
 function openPdf(){
  if(Platform.OS!=='web'||!doc.original.dataUrl)return;
  const raw=atob(doc.original.dataUrl.split(',')[1]);const bytes=Uint8Array.from(raw,x=>x.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([bytes],{type:doc.original.mediaType}));window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 return <View style={layout.stack}><Button label={open?'Fechar documento original':'Ver documento original fictício'} onPress={()=>setOpen(!open)}/>
 {open&&<><T kind="heading">{doc.original.fileName}</T>{doc.original.dataUrl&&<Button label={doc.original.mediaType==='application/pdf'?'Abrir PDF original':'Abrir imagem original'} onPress={openPdf}/>}<T selectable>{doc.original.text}</T></>}</View>;
}
