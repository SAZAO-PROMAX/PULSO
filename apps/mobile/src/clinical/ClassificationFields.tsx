import React from 'react';
import {View} from 'react-native';
import {Button,Field,T,layout} from '../ui';
import {Classification,registrationCategories,specialties,classificationFor} from './classification';
export function ClassificationFields({value,onChange,editableCategory=false}:{value:Classification;onChange:(v:Classification)=>void;editableCategory?:boolean}){
 const category=registrationCategories.find(c=>c.id===value.category);
 return <View style={layout.stack}>
 {editableCategory?<><T kind="heading">Categoria e tipo</T><View style={layout.row}>{registrationCategories.map(c=><Button key={c.id} label={'Categoria do documento: '+c.label} selected={c.id===value.category} onPress={()=>{const type=c.types.find(t=>!['pressure','planned'].includes(t.mode))!;onChange({...classificationFor(c.id,type.id),examDate:value.examDate,specialties:value.specialties});}}/>)}</View>
 <View style={layout.row}>{category?.types.filter(t=>!['pressure','planned'].includes(t.mode)).map(t=><Button key={t.id} label={'Tipo do documento: '+t.label} selected={t.id===value.examType} onPress={()=>onChange({...value,examType:t.id})}/>)}</View></>:<T kind="small">{category?.label??'Por classificar'} · {category?.types.find(t=>t.id===value.examType)?.label??'Tipo não indicado'}</T>}
 <T kind="small">Especialidades associadas · pode selecionar várias, sem duplicar o ficheiro.</T><View style={layout.row}>{specialties.map(s=><Button key={s.id} label={'Especialidade: '+s.label} selected={value.specialties.includes(s.id)} onPress={()=>onChange({...value,specialties:value.specialties.includes(s.id)?value.specialties.filter(id=>id!==s.id):[...value.specialties,s.id]})}/>)}</View>
 <Field label="Data do documento (AAAA-MM-DD, opcional)" value={value.examDate??''} onChange={examDate=>onChange({...value,examDate:examDate.trim()||null})}/>
 </View>;
}
