import React,{createContext,useContext,useState,useEffect,useId} from 'react';
import {View,Text,Pressable,TextInput,StyleSheet,TextProps,StyleProp,ViewStyle,TextStyle,Platform} from 'react-native';
import {readTheme,writeTheme} from './preferences';
const light={bg:'#f5f7f1',card:'#ffffff',ink:'#193328',muted:'#4f6257',line:'#cbd7c7',control:'#728477',accent:'#d2f18a',accentInk:'#193328',soft:'#edf3e7',hero:'#183c2d',heroInk:'#f6faef'};
const dark={bg:'#101b16',card:'#1c2b22',ink:'#f1f6ed',muted:'#bdcdbc',line:'#566b59',control:'#8da191',accent:'#d2f18a',accentInk:'#193328',soft:'#273b2c',hero:'#203e2c',heroInk:'#f6faef'};
export const palettes={light,dark};
const Theme=createContext({colors:light,dark:false,toggle:()=>{},preferenceWarning:''});
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [initial]=useState(readTheme),[isDark,setDark]=useState(initial.theme==='dark'),[preferenceWarning,setWarning]=useState(initial.warning);
 const colors=isDark?dark:light;
 useEffect(()=>{if(Platform.OS==='web')document.documentElement.lang='pt-PT';},[]);
 function toggle(){const next=!isDark;setDark(next);setWarning(writeTheme(next?'dark':'light'));}
 return <Theme.Provider value={{colors,dark:isDark,toggle,preferenceWarning}}>
 {Platform.OS==='web'&&<style>{`button:focus-visible,[role="button"]:focus-visible,input:focus-visible,a:focus-visible,[tabindex="0"]:focus-visible{outline:3px solid ${colors.ink};outline-offset:2px} [role="heading"][tabindex="-1"]:focus{outline:none}`}</style>}{children}</Theme.Provider>;
}
export const useTheme=()=>useContext(Theme);
export function T({children,kind='body',level,style,...rest}:TextProps&{tabIndex?:0|-1;level?:1|2|3|4;kind?:'body'|'small'|'title'|'heading'}){
 const {colors:c}=useTheme();
 const base:TextStyle={color:kind==='small'?c.muted:c.ink,fontSize:kind==='title'?34:kind==='heading'?22:kind==='small'?14:17,lineHeight:kind==='title'?42:kind==='heading'?30:26,fontWeight:kind==='title'||kind==='heading'?'700':'400'};
 return <Text accessibilityRole={kind==='title'||kind==='heading'?'header':undefined} {...(kind==='heading'||kind==='title'?{'aria-level':level??(kind==='title'?1:2)}:{})} {...rest} style={[base,style]}>{children}</Text>;
}
export function Card({children,testID,style}:{children:React.ReactNode;testID?:string;style?:StyleProp<ViewStyle>}){const {colors:c}=useTheme();return <View testID={testID} style={[{backgroundColor:c.card,borderColor:c.line,borderWidth:1,borderRadius:20,padding:20,gap:12},style]}>{children}</View>;}
export function Button({label,onPress,selected,primary=false,disabled=false,buttonRef}:{label:string;onPress:()=>void;selected?:boolean;primary?:boolean;disabled?:boolean;buttonRef?:React.Ref<View>}){const {colors:c}=useTheme();return <Pressable ref={buttonRef} accessibilityRole="button" accessibilityLabel={label} accessibilityState={Platform.OS==='web'?{disabled}:{selected,disabled}} {...(Platform.OS==='web'?{'aria-pressed':selected}:{})} disabled={disabled} onPress={onPress} style={({pressed})=>({minHeight:50,maxWidth:'100%',paddingHorizontal:16,paddingVertical:12,borderRadius:12,borderWidth:1,borderColor:c.control,backgroundColor:selected||primary?c.accent:c.card,opacity:disabled?0.5:pressed?0.75:1,justifyContent:'center'})}><T style={{fontWeight:'600',color:selected||primary?c.accentInk:c.ink}}>{label}</T></Pressable>;}
export function Field({label,value,onChange,placeholder,labelAccessory,error,inputRef}:{label:string;value:string;onChange:(s:string)=>void;placeholder?:string;labelAccessory?:React.ReactNode;error?:string;inputRef?:React.Ref<TextInput>}){
 const {colors:c}=useTheme(),id=useId(),labelId=id+'-label',errorId=id+'-error';
 return <View style={{gap:5}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{flex:1}}><T nativeID={labelId} kind="small">{label}</T></View>{labelAccessory}</View><TextInput ref={inputRef} accessibilityLabel={label} aria-labelledby={labelId} aria-invalid={!!error} aria-describedby={error?errorId:undefined} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={c.muted} style={{color:c.ink,fontSize:18,padding:14,minHeight:50,borderWidth:error?2:1,borderColor:error?c.ink:c.control,borderRadius:10,backgroundColor:c.bg}}/>{error&&<T nativeID={errorId} kind="small">{error}</T>}</View>;
}
export const layout=StyleSheet.create({stack:{gap:16},row:{flexDirection:'row',flexWrap:'wrap',gap:8},grow:{flexGrow:1,flexShrink:1,minWidth:0,flexBasis:260}});
