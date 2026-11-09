import React,{useEffect,useRef,useState} from 'react';
import {Image,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {Button,Card,T,layout} from '../ui';
import {checkPhoto,InputDocument,stripJpegMetadata} from './inputDocument';
import {documentDigest} from './documentDigest';
export function CameraCapture({onConfirm,onCancel,galleryOnly=false}:{onConfirm:(file:InputDocument)=>void;onCancel:()=>void;galleryOnly?:boolean}){
 const [photo,setPhoto]=useState<InputDocument|null>(null),[checked,setChecked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),active=useRef(true);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function pick(camera:boolean){if(busy)return;setBusy(true);setError('');try{
  if(camera){const permission=await ImagePicker.requestCameraPermissionsAsync();if(!permission.granted)throw Error('Acesso à câmara recusado. Pode autorizar nas definições ou selecionar uma imagem.');}
  const options:ImagePicker.ImagePickerOptions={mediaTypes:['images'],base64:true,exif:false,allowsEditing:false,quality:1};
  const result=camera?await ImagePicker.launchCameraAsync(options):await ImagePicker.launchImageLibraryAsync(options);if(!active.current||result.canceled)return;
  const asset=result.assets[0];if(!asset.base64)throw Error('Não foi possível ler a fotografia. Repita ou selecione outra imagem.');
  const source=Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0));checkPhoto(asset.width,asset.height,source.length);const bytes=stripJpegMetadata(source),sha=await documentDigest(source.buffer),sourceSha256=Array.from(new Uint8Array(sha),b=>b.toString(16).padStart(2,'0')).join('');
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);const dataUrl='data:image/jpeg;base64,'+btoa(binary);
  if(active.current){setPhoto({name:'digitalizacao-sintetica-'+Date.now()+'.jpg',type:'image/jpeg',size:bytes.length,arrayBuffer:async()=>new Uint8Array(bytes).buffer,dataUrl,capture:{source:camera?'native-camera':'native-library',pages:1,metadata:'jpeg-metadata-removed',sourceSha256}});setChecked(false);}
 }catch(e){if(active.current)setError((e as Error).message);}finally{if(active.current)setBusy(false);}}
 return <Card><T kind="heading">{galleryOnly?'Selecionar imagem':'Digitalizar exame'}</T><T>Apenas documentos fictícios. Uma página por digitalização, até 2 MB e 12 megapíxeis. Várias páginas: importe um PDF na web.</T>
 {photo&&<><Image source={{uri:photo.dataUrl}} accessibilityLabel="Fotografia do documento fictício para revisão" resizeMode="contain" style={{width:'100%',height:360}}/><T>Verifique texto completo, orientação, cortes e reflexos. O seletor fornece JPEG; metadados removidos sem recomprimir os píxeis. Qualidade não validada automaticamente.</T><Button label="Conferi o enquadramento e a legibilidade" selected={checked} onPress={()=>setChecked(!checked)}/><Button label="Confirmar fotografia" primary disabled={!checked||busy} onPress={()=>{if(checked)onConfirm(photo);}}/></>}
 <View style={layout.row}>{!galleryOnly&&<Button label={photo?'Repetir fotografia':'Abrir câmara'} primary={!photo} disabled={busy} onPress={()=>void pick(true)}/>}<Button label="Selecionar imagem existente" disabled={busy} onPress={()=>void pick(false)}/><Button label="Cancelar digitalização" variant="tertiary" disabled={busy} onPress={onCancel}/></View>{busy&&<T accessibilityLiveRegion="polite">A preparar fotografia…</T>}{!!error&&<T accessibilityRole="alert">{error}</T>}</Card>;
}
