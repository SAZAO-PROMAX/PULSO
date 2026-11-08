import React,{useState} from 'react';
import {View,Pressable} from 'react-native';
import {Button,Card,Field,T,layout,useTheme} from './ui';
import {registrationCategories,classificationFor} from './clinical/classification';
import {PressureForm,PdfForm} from './clinical/Forms';
type Selection={category:string;type:string}|null;
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');
export function RegisterHub({owner,onSaved,initialMode,onEvent}:{onEvent?:()=>void;owner:string;onSaved:()=>void;initialMode:'pressure'|'pdf'|null}){
 const {colors:c}=useTheme(),[query,setQuery]=useState(''),[category,setCategory]=useState<string|null>(null),[selected,setSelected]=useState<Selection>(initialMode==='pressure'?{category:'pressure',type:'manual-pressure'}:initialMode==='pdf'?{category:'laboratory',type:'blood'}:null);
 const item=registrationCategories.find(c=>c.id===(selected?.category??category)),type=item?.types.find(t=>t.id===selected?.type);
 if(selected&&item&&type)return <View style={layout.stack}><Button label="Voltar às categorias de registo" onPress={()=>{setSelected(null);setCategory(null);}}/>
 {type.mode==='pressure'?<PressureForm owner={owner} onSaved={onSaved}/>:type.mode==='planned'?<Card><T kind="heading">Em preparação</T><T>Esta opção ainda não permite criar registos.</T></Card>:<PdfForm key={item.id+type.id} owner={owner} onSaved={onSaved} classification={classificationFor(item.id,type.id)} documentOnly={type.mode==='document'}/>}</View>;
 return <View style={layout.stack}><T kind="heading">O que pretende registar?</T><T>Selecione uma categoria para adicionar um exame, documento ou medição.</T>
 <Field label="Pesquisar categorias e tipos de exame" value={query} onChange={value=>{setQuery(value);setCategory(null);}} placeholder="Ex.: sangue, Holter, radiografia"/>
 <View style={layout.row}><Button label="Importar análises ao sangue" primary onPress={()=>setSelected({category:'laboratory',type:'blood'})}/><Button label="Registar tensão arterial" onPress={()=>setSelected({category:'pressure',type:'manual-pressure'})}/>{onEvent&&<Button label="Registar acontecimento" onPress={onEvent}/>}</View>
 {item&&category?<Card><T kind="heading">{item.label}</T><View style={layout.row}>{item.types.map(t=><Button key={t.id} label={t.label+(t.mode==='planned'?' · Em preparação':'')} disabled={t.mode==='planned'} onPress={()=>setSelected({category:item.id,type:t.id})}/>)}</View><Button label="Todas as categorias de registo" onPress={()=>setCategory(null)}/></Card>:
 <View style={layout.row}>{registrationCategories.filter(item=>norm(item.label+' '+item.description+' '+item.types.map(t=>t.label).join(' ')).includes(norm(query.trim()))).map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.label} onPress={()=>setCategory(item.id)} style={({pressed})=>({flexGrow:1,flexShrink:1,flexBasis:230,minWidth:0,minHeight:156,padding:20,gap:8,borderWidth:1,borderColor:c.control,borderRadius:20,backgroundColor:pressed?c.soft:c.card})}><T accessible={false} style={{fontSize:30,lineHeight:36}}>{item.icon}</T><T kind="heading">{item.label}</T><T kind="small">{item.description}</T></Pressable>)}</View>}
 {!registrationCategories.some(item=>norm(item.label+' '+item.description+' '+item.types.map(t=>t.label).join(' ')).includes(norm(query.trim())))&&<Card><T>Nenhuma categoria encontrada. Experimente outra palavra.</T></Card>}
 <T kind="small">Só análises ao sangue suportadas permitem extrair resultados. Os outros tipos guardam documentos sem interpretação. Use apenas ficheiros inteiramente fictícios.</T></View>;
}
