import React,{useState} from 'react';
import {View} from 'react-native';
import {Button,T,layout} from '../ui';
import {InputDocument} from './inputDocument';
import {CameraCapture} from './CameraCapture';
export function PdfPicker({onFile,onClear,selected,stage,disabled}:{onFile:(file:InputDocument)=>void;onClear:()=>void;selected:InputDocument|null;stage:string;disabled:boolean}){
 const [choosing,setChoosing]=useState(false);
 if(choosing)return <CameraCapture galleryOnly onConfirm={file=>{onFile(file);setChoosing(false);}} onCancel={()=>setChoosing(false)}/>;
 return <View style={layout.stack}>{selected&&<><T>{selected.name}</T><T accessibilityLiveRegion="polite">{stage} · ainda não guardado</T></>}<Button label={selected?'Trocar documento':'Selecionar imagem existente'} disabled={disabled} onPress={()=>setChoosing(true)}/>{selected&&<Button label="Cancelar seleção" disabled={disabled} onPress={onClear}/>}<T kind="small">PDF nativo ainda indisponível. Pode importar PDF na web.</T></View>;
}
