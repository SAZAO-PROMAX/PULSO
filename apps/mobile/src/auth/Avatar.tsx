import React from 'react';
import {Image,View} from 'react-native';
import {T,useTheme} from '../ui';
import {avatarOptions} from './profileOptions';
export function Avatar({preset,name,photo,size=64}:{preset:string|null;name:string;photo?:string|null;size?:number}){
 const {colors:c}=useTheme(),option=avatarOptions.find(a=>a.id===preset),initials=name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toLocaleUpperCase('pt-PT')||'P';
 return <View accessible={false} style={{width:size,height:size,borderRadius:size/2,backgroundColor:option?.color??c.soft,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:c.control,overflow:'hidden'}}>{photo?<Image source={{uri:photo}} accessible={false} style={{width:size,height:size,borderRadius:size/2}}/>:<T style={{fontSize:size*.44,lineHeight:size*.6,fontWeight:'700',color:option?'#193328':c.ink}}>{option?.symbol??initials}</T>}</View>;
}
