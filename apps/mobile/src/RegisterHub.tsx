import React,{useState,useLayoutEffect,useRef,useEffect,useImperativeHandle,forwardRef} from 'react';
import {View,Pressable,Platform,Modal,BackHandler} from 'react-native';
import {Button,Card,Field,T,layout,useTheme} from './ui';
import {registrationCategories,classificationFor} from './clinical/classification';
import {SavedRecord} from './clinical/data';
import {CameraCapture} from './clinical/CameraCapture';
import {InputDocument} from './clinical/inputDocument';
import {PressureForm,PdfForm} from './clinical/Forms';
import {currentRoute,goRoute,registrationRoute,registrationStep,RegistrationStep} from './routes';
type Selection={category:string;type:string}|null;
const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT');
function Back({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Button label={'← '+label} accessibilityLabel={label} variant="tertiary" disabled={disabled} onPress={onPress}/>;}
export interface RegistrationActions{start:(mode:'pressure'|'pdf')=>void}
export const RegisterHub=forwardRef<RegistrationActions,{active?:boolean;onEvent?:()=>void;owner:string;onSaved:(analysis?:SavedRecord)=>void;initialMode:'pressure'|'pdf'|null}>(function RegisterHub({owner,onSaved,initialMode,onEvent,active=true},ref){
 const trigger=useRef<View>(null),cancelRef=useRef<View>(null),restore=useRef<HTMLElement|null>(null);
 const [camera,setCamera]=useState(false),[cameraMounted,setCameraMounted]=useState(false),[cameraDirty,setCameraDirty]=useState(false),[browse,setBrowse]=useState(false),[captured,setCaptured]=useState<InputDocument|null>(null);
 const {colors:c}=useTheme(),[query,setQuery]=useState(''),[category,setCategory]=useState<string|null>(null),[all,setAll]=useState(false),[selected,setSelected]=useState<Selection>(initialMode==='pressure'?{category:'pressure',type:'manual-pressure'}:initialMode==='pdf'?{category:'laboratory',type:'blood'}:null);
 const [formVisible,setFormVisible]=useState(!!initialMode),[draft,setDraft]=useState({dirty:false,busy:false});
 const [pending,setPending]=useState<(()=>void)|null>(null),initialFocus=useRef(true),previousCamera=useRef(false);
 const focusFormAfterDialog=()=>{if(Platform.OS==='web')setTimeout(()=>['registration-form-title','camera-review-title','camera-title','registration-category-title'].map(id=>document.getElementById(id)).find(el=>el&&el.getClientRects().length>0)?.focus(),0);};
 const item=registrationCategories.find(c=>c.id===category),formItem=registrationCategories.find(c=>c.id===selected?.category),type=formItem?.types.find(t=>t.id===selected?.type);
 useLayoutEffect(()=>{
  const first=initialFocus.current,wasCamera=previousCamera.current;initialFocus.current=false;previousCamera.current=camera;
  if(Platform.OS!=='web'||!active||camera||(!formVisible&&!browse&&(first||wasCamera)))return;
  const target=document.getElementById(formVisible?'registration-form-title':browse?(category?'registration-type-title':'registration-category-title'):'registration-options-title');
  target?.focus();
 },[formVisible,browse,category,camera,active]);
 function requestReplace(action:()=>void,acceptSource=false){
  if(draft.busy)return;
  if(draft.dirty||(!acceptSource&&(cameraDirty||!!captured))){if(Platform.OS==='web')restore.current=document.activeElement as HTMLElement;setPending(()=>action);}
  else action();
 }
 function keepEditing(){setPending(null);if(Platform.OS==='web')setTimeout(()=>restore.current?.focus(),0);}
 function choose(next:NonNullable<Selection>,write=true){
  const open=()=>{setCamera(false);setCameraMounted(false);setCameraDirty(false);setSelected(next);if(next.type==='manual-pressure')setCaptured(null);setFormVisible(true);if(write)goRoute(registrationRoute({step:'form',...next}));};
  if(selected?.category===next.category&&selected.type===next.type)open();
  else requestReplace(()=>{setDraft({dirty:false,busy:false});open();},next.type!=='manual-pressure');
 }
 function startCamera(write=true){const open=()=>{setFormVisible(false);setCamera(true);setCameraMounted(true);if(write)goRoute('/record/camera');};if(cameraMounted){setCaptured(null);open();return;}requestReplace(()=>{setSelected(null);setDraft({dirty:false,busy:false});setCaptured(null);open();});}
 function show(step:RegistrationStep,write=true){
  if(step.step==='form'){choose({category:step.category,type:step.type},write);return;}
  if(step.step==='camera'){startCamera(write);return;}
  setCamera(false);setFormVisible(false);setBrowse(step.step!=='options');setCategory(step.step==='types'?step.category:null);
  if(write)goRoute(registrationRoute(step));
 }
 function visibleRoute(){return registrationRoute(camera?{step:'camera'}:formVisible&&selected?{step:'form',...selected}:category?{step:'types',category}:browse?{step:'categories'}:{step:'options'});}
 const routeHandler=useRef<()=>void>(()=>{});
 routeHandler.current=()=>{
  const next=registrationStep(currentRoute());if(!next)return;
  // Back/Forward never discard a different dirty form just by changing its URL.
  if(next.step==='form'&&selected&&(next.category!==selected.category||next.type!==selected.type)&&draft.dirty){
   window.history.replaceState(null,'','#'+visibleRoute());choose({category:next.category,type:next.type});return;
  }
  if(next.step==='camera'&&!cameraMounted&&(draft.dirty||captured)){window.history.replaceState(null,'','#'+visibleRoute());startCamera();return;}
  show(next,false);
 };
 useEffect(()=>{
  if(Platform.OS!=='web')return;
  const step=registrationStep(currentRoute());
  if(step&&step.step!=='options')routeHandler.current();
  else if(initialMode)window.history.replaceState(null,'','#'+visibleRoute());
  const listener=()=>routeHandler.current();window.addEventListener('hashchange',listener);
  return()=>window.removeEventListener('hashchange',listener);
 },[]);
 useEffect(()=>{
  if(Platform.OS!=='web'||(!draft.dirty&&!cameraDirty&&!captured))return;
  const leave=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',leave);
  return()=>window.removeEventListener('beforeunload',leave);
 },[draft.dirty,cameraDirty,captured]);
 useImperativeHandle(ref,()=>({start:mode=>choose(mode==='pressure'?{category:'pressure',type:'manual-pressure'}:{category:'laboratory',type:'blood'})}));
 useEffect(()=>{
  if(Platform.OS!=='android'||!active)return;
  const subscription=BackHandler.addEventListener('hardwareBackPress',()=>{if(pending){keepEditing();return true;}if(draft.busy)return true;if(camera){show({step:'options'});return true;}if(formVisible||category){show({step:'categories'});return true;}if(browse){show({step:'options'});return true;}return false;});
  return()=>subscription.remove();
 },[active,pending,draft.busy,camera,formVisible,category,browse]);
 function finished(record?:SavedRecord){setSelected(null);setDraft({dirty:false,busy:false});setCaptured(null);setCameraMounted(false);setCameraDirty(false);setCamera(false);setFormVisible(false);setBrowse(false);setCategory(null);onSaved(record);}

 // Keep one form mounted while browsing its categories: memory only, never autosave.
 return <View style={layout.stack}>
 {selected&&formItem&&type&&<View style={[layout.stack,{display:formVisible&&!camera?'flex':'none'}]}>
  <Back label="Voltar às categorias de registo" disabled={draft.busy} onPress={()=>show({step:'categories'})}/>
  {type.mode==='pressure'?<PressureForm key={formItem.id+type.id} owner={owner} onSaved={finished} onDraftState={setDraft}/>:type.mode==='planned'?<Card><T kind="heading">Em preparação</T><T>Esta opção ainda não permite criar registos.</T></Card>:<PdfForm onDiscardRequest={action=>requestReplace(()=>{action();show({step:'categories'});})} key={formItem.id+type.id} owner={owner} onSaved={finished} onDraftState={setDraft} initialDocument={captured} classification={classificationFor(formItem.id,type.id)} documentOnly={type.mode==='document'}/>}
 </View>}
 <View style={{display:camera?'flex':'none'}}>{cameraMounted&&<CameraCapture visible={active&&camera} onDraftChange={setCameraDirty} onConfirm={file=>{setCaptured(file);show({step:'categories'});}} onCancel={()=>{setCameraMounted(false);setCameraDirty(false);show({step:'options'});if(Platform.OS==='web')setTimeout(()=>(trigger.current as unknown as {focus?:()=>void})?.focus?.(),0);}}/>}</View>{!camera&&!formVisible&&(!browse?<View style={layout.stack}>
 <T kind="heading" nativeID="registration-options-title" tabIndex={-1}>O que pretende registar?</T>
 {selected&&draft.dirty&&<Button label="Retomar registo por guardar" primary onPress={()=>choose(selected)}/>}
 {cameraMounted&&cameraDirty&&<Button label="Retomar digitalização" primary onPress={()=>startCamera()}/>}
 <View style={layout.row}><View style={layout.grow}><Card style={{borderWidth:0,backgroundColor:c.soft}}><T kind="heading">Com a câmara</T><T kind="small">Fotografe uma página fictícia, confira a imagem e escolha a categoria.</T><Button label="Digitalizar exame" buttonRef={trigger} primary onPress={()=>startCamera()}/></Card></View>
 <View style={layout.grow}><Card style={{borderWidth:0}}><T kind="heading">Um ficheiro existente</T><T kind="small">PDF ou imagem existente. Escolha a categoria antes de importar.</T><Button label="Importar ficheiro" onPress={()=>show({step:'categories'})}/></Card></View>
 <View style={layout.grow}><Card style={{borderWidth:0,backgroundColor:c.bg}}><T kind="heading">Uma medição em casa</T><T kind="small">Introduza uma leitura de tensão arterial e pulsação opcional.</T><Button label="Registar medição" onPress={()=>choose({category:'pressure',type:'manual-pressure'})}/></Card></View></View>
 {onEvent&&<Button label="Registar acontecimento" variant="tertiary" onPress={()=>requestReplace(onEvent)}/>}
 </View>:<View style={layout.stack}>
 <Back label={category?'Voltar às categorias de registo':'Voltar às opções de registo'} onPress={()=>show({step:category?'categories':'options'})}/>
 {captured&&<Card><T>Documento selecionado: {captured.name}</T><T kind="small">Ainda não foi guardado. Escolha a categoria e o tipo.</T></Card>}
 {selected&&draft.dirty&&<Button label="Retomar registo por guardar" onPress={()=>selected&&choose(selected)}/>}
 <T kind="heading" nativeID="registration-category-title" tabIndex={-1}>Escolha a categoria do documento</T>
 {!category&&<Field label="Pesquisar categorias e tipos de exame" value={query} onChange={value=>{setQuery(value);setCategory(null);}} placeholder="Ex.: sangue, Holter, radiografia"/>}
 {item&&category?<Card><T kind="heading" nativeID="registration-type-title" tabIndex={-1}>{item.label}</T><View style={layout.row}>{item.types.map(t=><Button key={t.id} label={t.label+(t.mode==='planned'?' · Em preparação':'')} disabled={t.mode==='planned'||!!captured&&t.mode==='pressure'} onPress={()=>choose({category:item.id,type:t.id})}/>)}</View></Card>:
 <View style={layout.row}>{registrationCategories.filter((item,index)=>all||query.trim()||index<4).filter(item=>norm(item.label+' '+item.description+' '+item.types.map(t=>t.label).join(' ')).includes(norm(query.trim()))).map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.label} onPress={()=>show({step:'types',category:item.id})} style={({pressed})=>({flexGrow:1,flexShrink:1,flexBasis:230,minWidth:0,minHeight:156,padding:20,gap:8,borderWidth:1,borderColor:c.control,borderRadius:20,backgroundColor:pressed?c.soft:c.card})}><T accessible={false} style={{fontSize:30,lineHeight:36}}>{item.icon}</T><T kind="heading">{item.label}</T><T kind="small">{item.description}</T></Pressable>)}</View>}
 {!category&&!query&&<Button label={all?'Mostrar categorias principais':'Ver todas as categorias'} onPress={()=>setAll(!all)}/>}
 {!registrationCategories.some(item=>norm(item.label+' '+item.description+' '+item.types.map(t=>t.label).join(' ')).includes(norm(query.trim())))&&<Card><T>Nenhuma categoria encontrada. Experimente outra palavra.</T></Card>}
 <T kind="small">A extração de resultados está disponível nas análises ao sangue. Outros tipos guardam o documento original.</T>
 </View>)}
 <Modal visible={!!pending&&active} transparent animationType="none" onRequestClose={keepEditing} aria-labelledby="discard-registration-title" onShow={()=>{if(Platform.OS==='web')(cancelRef.current as unknown as {focus?:()=>void})?.focus?.();}}>
  <View style={{flex:1,justifyContent:'center',padding:20,backgroundColor:'rgba(5,19,12,0.48)'}}><View style={{width:'100%',maxWidth:560,alignSelf:'center'}}><Card>
   <T kind="heading" nativeID="discard-registration-title">Substituir o registo por guardar?</T><T>Tem informação por guardar. Ao iniciar outro registo, este rascunho será descartado. Os registos já guardados não serão alterados.</T>
   <Button label="Continuar a editar" buttonRef={cancelRef} primary onPress={()=>{setPending(null);if(selected){setCamera(false);setFormVisible(true);goRoute(registrationRoute({step:'form',...selected}));}else if(cameraMounted){setCamera(true);setFormVisible(false);goRoute('/record/camera');}else show({step:'categories'});focusFormAfterDialog();}}/><Button label="Descartar rascunho e continuar" onPress={()=>{const action=pending;setPending(null);setSelected(null);setDraft({dirty:false,busy:false});setCaptured(null);setCameraMounted(false);setCameraDirty(false);setCamera(false);setFormVisible(false);action?.();focusFormAfterDialog();}}/>
  </Card></View></View>
 </Modal>
 </View>;
});
