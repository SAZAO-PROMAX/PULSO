import React,{useState,useEffect} from 'react';
import {Image,Platform,Pressable,View} from 'react-native';
import {Button,Card,Field,T,layout,useTheme} from '../ui';
import {areas} from '../model';
import {apiFetch} from '../api';
import {ApiError} from '../clinical/repository';
import {authRequest,useAuth,User} from './AuthProvider';
import {ProfileView} from './ProfileMenu';
import {ExperiencePanel} from '../ExperiencePanel';
import {AvatarPicker} from './AvatarPicker';
import {Avatar} from './Avatar';
import {avatarOptions,conditionLabel,customCondition,searchConditions,validBirthDate,birthDateDisplay,birthDateISO} from './profileOptions';

type Draft={displayName:string;fullName:string;birthDate:string|null;conditions:string[];interests:string[];avatarPreset:string|null};
const empty:Draft={displayName:'',fullName:'',birthDate:null,conditions:[],interests:[],avatarPreset:null};
const draftOf=(user:User):Draft=>({displayName:user.displayName,fullName:user.fullName,birthDate:user.birthDate,conditions:user.conditions,interests:user.interests,avatarPreset:user.avatarPreset});
function requireBirthDate(value:string|null){
 if(validBirthDate(value??''))return;
 if(Platform.OS==='web')document.querySelector<HTMLInputElement>('input[aria-label^="Data de nascimento"]')?.focus();
 throw Error('A data de nascimento é obrigatória e deve ser válida.');
}
function BirthDate({draft,setDraft}:{draft:Draft;setDraft:(d:Draft)=>void}){
 return <View style={{gap:6}}><Field required label="Data de nascimento (obrigatória, DD/MM/AAAA)" value={birthDateDisplay(draft.birthDate??'')} placeholder="Ex.: 23/05/1970" onChange={value=>setDraft({...draft,birthDate:birthDateISO(value)||null})} error={draft.birthDate&&!validBirthDate(draft.birthDate)?'Introduza uma data válida em DD/MM/AAAA, entre 1900 e hoje.':undefined}/><T kind="small">Obrigatória nesta fase. Use uma data fictícia.</T></View>;
}
export function ConditionSelector({selected,onChange}:{selected:string[];onChange:(v:string[])=>void}){
 const [search,setSearch]=useState(''),matches=searchConditions(search),custom=customCondition(search,selected);
 function toggle(id:string){onChange(selected.includes(id)?selected.filter(v=>v!==id):[...selected,id]);}
 return <View style={layout.stack}> <T kind="heading">Condições de saúde a acompanhar</T><T kind="small">Opcional e autodeclarado. Não altera limites ou interpretações dos gráficos. Pesquise uma condição ou adicione o nome se não constar da lista.</T>
 {!!selected.length&&<><T kind="small">Selecionadas — toque para remover</T><View style={layout.row}>{selected.map(id=><Button key={id} label={conditionLabel(id)} variant="chip" selected onPress={()=>toggle(id)}/>)}</View></>}
 <Field label="Pesquisar condições" value={search} placeholder="Ex.: asma, tiroide, DPOC…" onChange={setSearch}/>
 <T kind="small" accessibilityLiveRegion="polite">{search.trim()?`${matches.length} resultados na lista local`:'Condições frequentes'}</T>
 <View style={layout.row}>{matches.slice(0,12).filter(o=>!selected.includes(o.id)).map(o=><Button key={o.id} label={o.label} variant="chip" disabled={selected.length>=30} onPress={()=>toggle(o.id)}/>)}</View>
 {matches.length>12&&<T kind="small">Escreva mais letras para reduzir os resultados.</T>}
 {!!custom&&<Button label={'Adicionar «'+conditionLabel(custom)+'»'} disabled={selected.length>=30} onPress={()=>{toggle(custom);setSearch('');}}/>}
 <T kind="small">Lista local não exaustiva, sem códigos clínicos. Pode adicionar condições ausentes (2–100 caracteres), até 30 no total.</T>
 {!!selected.length&&<Button label="Não declarar condições" onPress={()=>onChange([])}/>}
</View>;
}
function OptionalFields({draft,setDraft,group='all'}:{draft:Draft;setDraft:(d:Draft)=>void;group?:'all'|'health'|'appearance'}){
 const {colors:c}=useTheme();
 return <View style={layout.stack}>{group!=='appearance'&&<><ConditionSelector selected={draft.conditions} onChange={conditions=>setDraft({...draft,conditions})}/><T kind="heading">Áreas de interesse</T><View style={layout.row}>{areas.map(area=><Button key={area} label={area} variant="chip" selected={draft.interests.includes(area)} onPress={()=>setDraft({...draft,interests:draft.interests.includes(area)?draft.interests.filter(v=>v!==area):[...draft.interests,area]})}/>)}</View></>}{group!=='health'&&<> <T kind="heading">Imagem do perfil</T><View style={[layout.row,{alignItems:'center',gap:16}]}><Avatar preset={draft.avatarPreset} name={draft.displayName} size={88}/><View style={{flex:1,minWidth:140}}><T>Pré-visualização</T><T kind="small">{avatarOptions.find(a=>a.id===draft.avatarPreset)?.label??'As suas iniciais'} · guarde o perfil para aplicar.</T></View></View>
 <View style={layout.row}>{avatarOptions.map(option=><Pressable key={option.id} accessibilityRole="button" accessibilityLabel={'Escolher '+option.label} accessibilityState={Platform.OS==='web'?{}:{selected:draft.avatarPreset===option.id}} {...(Platform.OS==='web'?{'aria-pressed':draft.avatarPreset===option.id}:{})} onPress={()=>setDraft({...draft,avatarPreset:option.id})} style={{width:112,minHeight:120,alignItems:'center',gap:4,padding:8,borderWidth:draft.avatarPreset===option.id?3:1,borderColor:c.control,borderRadius:16,backgroundColor:draft.avatarPreset===option.id?c.soft:c.card}}><Avatar preset={option.id} name={draft.displayName} size={56}/><T kind="small">{option.label}</T>{draft.avatarPreset===option.id&&<T kind="small">✓ Escolhido</T>}</Pressable>)}</View><Button label="Usar iniciais" selected={draft.avatarPreset===null} onPress={()=>setDraft({...draft,avatarPreset:null})}/></>}</View>;
}

export function AccountPanel({view,onView,onHistory,onOnboarding}:{onOnboarding?:()=>void;view:ProfileView;onView:(v:ProfileView)=>void;onHistory:()=>void}){
 const auth=useAuth();
 if(!auth.user)return <GuestAccount key={view} view={view} onView={onView}/>;
 if(view==='preferences')return <ExperiencePanel/>;
 if(view==='privacy')return <Card><T kind="heading">Privacidade e segurança</T><T>Conta experimental com sessão no servidor. A base local ainda não tem encriptação apropriada para dados reais.</T><T>Apenas identidade e documentos fictícios. Confirmação de resultados não é validação médica. Fotografias não são enviadas ao Ollama.</T><T kind="small">As sessões expiram ao fim de oito horas. Terminar sessão revoga a sessão atual; recuperar a palavra-passe revoga todas. Não existe serviço de e-mail: a confirmação por código é só de desenvolvimento e não comprova titularidade de uma caixa de correio real.</T><Button label="Voltar ao meu perfil" onPress={()=>onView('profile')}/></Card>;
 return <View style={[layout.stack,{maxWidth:760,width:"100%",alignSelf:"center"}]}><ProfileEditor key={auth.user.id} user={auth.user} onHistory={onHistory}/><View style={layout.row}><Button label="Rever primeiros passos" variant="tertiary" onPress={()=>onOnboarding?.()}/></View></View>;
}

function GuestAccount({view,onView}:{view:ProfileView;onView:(v:ProfileView)=>void}){
 const auth=useAuth(),mode=view==='register'?'register':view==='recovery'?'recovery':'login';
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[draft,setDraft]=useState<Draft>(empty),[optional,setOptional]=useState(false),[token,setToken]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function act(work:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await work();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <Card><T kind="heading">{mode==='register'?'Criar conta':mode==='recovery'?'Recuperar acesso':'Iniciar sessão'}</T><T kind="small">Use apenas dados fictícios. Sem envio de e-mails.</T>
 <Field label="E-mail" value={email} onChange={setEmail}/>
 {mode==='register'&&<><Field label="Nome de apresentação" value={draft.displayName} onChange={displayName=>setDraft({...draft,displayName})}/><BirthDate draft={draft} setDraft={setDraft}/></>}
 {mode!=='recovery'&&<Field label="Palavra-passe" value={password} onChange={setPassword} secure/>}
 {mode==='login'&&<><Button label="Iniciar sessão" primary disabled={busy} onPress={()=>void act(()=>auth.signIn(email,password))}/><Button label="Criar conta" disabled={busy} onPress={()=>onView('register')}/><Button label="Esqueci-me da palavra-passe" disabled={busy} onPress={()=>onView('recovery')}/></>}
 {mode==='register'&&<><Field label="Confirmar palavra-passe" value={confirmation} onChange={setConfirmation} secure/><T kind="small">Entre 12 e 128 caracteres. Não é necessário declarar condições de saúde.</T><Button label={optional?'Ocultar informação opcional':'Informação opcional do perfil'} onPress={()=>setOptional(!optional)}/>{optional&&<OptionalFields draft={draft} setDraft={setDraft}/>}
 <Button label="Criar conta experimental" primary disabled={busy} onPress={()=>void act(async()=>{requireBirthDate(draft.birthDate);if(password!==confirmation)throw Error('As palavras-passe não coincidem.');const data=await authRequest('register',{...draft,email,password});setMessage(data.message);setPassword('');setConfirmation('');})}/><Button label="Já tenho conta: iniciar sessão" onPress={()=>onView('login')}/></>}
 {mode==='recovery'&&<><Button label="Pedir recuperação em desenvolvimento" disabled={busy} onPress={()=>void act(async()=>{const data=await authRequest('recovery',{email});setMessage(data.message);})}/><T kind="small">Sem serviço de correio: um operador com acesso local pode usar scripts/auth_dev.py. Introduza abaixo o código emitido localmente. Não foi enviado qualquer e-mail.</T><Field label="Código temporário de recuperação" value={token} onChange={setToken} secure/><Field label="Nova palavra-passe" value={password} onChange={setPassword} secure/><Button label="Redefinir palavra-passe" disabled={busy} onPress={()=>void act(async()=>{const data=await authRequest('reset-password',{token,password});setMessage(data.message);setPassword('');setToken('');})}/><Button label="Voltar a iniciar sessão" onPress={()=>onView('login')}/></>}
 {busy&&<T accessibilityLiveRegion="polite">A concluir o pedido…</T>}{!!error&&<T accessibilityRole="alert">{error}</T>}{!!message&&<T accessibilityLiveRegion="polite">{message}</T>}</Card>;
}

function ProfileEditor({user,onHistory}:{user:User;onHistory:()=>void}){
 const auth=useAuth(),[section,setSection]=useState<'account'|'health'|'appearance'|'privacy'>('account'),[draft,setDraft]=useState<Draft>(draftOf(user)),[expected,setExpected]=useState(user.version),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[conflict,setConflict]=useState(false),[newEmail,setNewEmail]=useState(''),[password,setPassword]=useState(''),[token,setToken]=useState('');
 const dirty=JSON.stringify(draft)!==JSON.stringify(draftOf(user));
 useEffect(()=>{if(!dirty&&!conflict)setExpected(user.version);},[user.version,dirty,conflict]);
 async function act(work:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await work();}catch(e){setError((e as Error).message);if(e instanceof ApiError&&e.status===409)setConflict(true);}finally{setBusy(false);}}
 async function refresh(){const row=await auth.refresh();if(row){setDraft(draftOf(row));setExpected(row.version);setConflict(false);}}
 async function photograph(file:File){await act(async()=>{if(!['image/png','image/jpeg'].includes(file.type)||file.size>1024*1024)throw Error('Escolha uma fotografia PNG/JPEG sintética até 1 MB.');const response=await apiFetch('/auth/avatar',{method:'POST',headers:{'Content-Type':file.type,'If-Match':String(user.version)},body:file,signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok)throw new ApiError(data.detail,response.status);await refresh();setMessage('Fotografia guardada.');});}
 return <View style={layout.stack}><Card><View style={[layout.row,{alignItems:"center",gap:16}]}><Avatar preset={user.avatarPreset} photo={auth.photo} name={user.displayName} size={64}/><View style={{flex:1,minWidth:0}}><T kind="heading">O meu perfil</T><T>{user.email}</T></View></View><T kind="small">{user.emailVerified?'Confirmado no modo de desenvolvimento.':'E-mail ainda não verificado. Nenhum e-mail real foi enviado.'}</T>
 <View style={layout.row}>{([['account','Conta'],['health','Informação de saúde'],['appearance','Aparência e acessibilidade'],['privacy','Privacidade e segurança']] as const).map(([id,label])=><Button key={id} label={id==='health'?'Saúde':id==='appearance'?'Aparência':id==='privacy'?'Privacidade':label} accessibilityLabel={label} variant="chip" selected={section===id} onPress={()=>setSection(id)}/>)}</View>
 {section==='account'&&<><Field label="Nome completo (opcional)" value={draft.fullName} onChange={fullName=>setDraft({...draft,fullName})}/><Field label="Nome de apresentação" value={draft.displayName} onChange={displayName=>setDraft({...draft,displayName})}/><BirthDate draft={draft} setDraft={setDraft}/></>}{(section==='health'||section==='appearance')&&<OptionalFields group={section} draft={draft} setDraft={setDraft}/>}{section!=='privacy'&&<Button label="Guardar perfil" primary disabled={busy||conflict} onPress={()=>void act(async()=>{requireBirthDate(draft.birthDate);await authRequest('profile',draft,'PATCH',expected);await refresh();setMessage('Perfil guardado.');})}/>}
 {section==='appearance'&&<><ExperiencePanel/><T kind="heading">Fotografia opcional</T>{auth.photo&&<Image accessibilityLabel="Fotografia sintética do próprio perfil" source={{uri:auth.photo}} style={{width:100,height:100,borderRadius:50}}/>}<View style={[layout.row,{alignItems:'center',gap:12}]}><Avatar preset={user.avatarPreset} name={user.displayName} photo={auth.photo} size={72}/><T kind="small">Imagem atual guardada. A fotografia tem prioridade sobre o avatar. Remova a fotografia para mostrar o avatar ou as iniciais.</T></View>{dirty&&<T kind="small">Guarde as alterações do perfil antes de alterar a fotografia.</T>}<AvatarPicker disabled={busy||dirty} onFile={file=>void photograph(file)}/>{user.hasPhoto&&<Button label="Remover fotografia" disabled={busy||dirty} onPress={()=>void act(async()=>{await authRequest('avatar',undefined,'DELETE',user.version);await refresh();setMessage('Fotografia removida.');})}/>}
 </>}</Card>{section==='privacy'&&<Card><T kind="heading">Verificação e alteração do e-mail</T><T kind="small">Modo de desenvolvimento, sem envio de correio. O código temporário é emitido por um operador local. O e-mail só muda depois da confirmação; esta ação termina as sessões.</T>
 <Field label="Novo e-mail" value={newEmail} onChange={setNewEmail}/><Field label="Palavra-passe atual para alterar e-mail" value={password} onChange={setPassword} secure/><Button label="Pedir alteração do e-mail" disabled={busy} onPress={()=>void act(async()=>{const data=await authRequest('email-change',{email:newEmail,password});setPassword('');setMessage(data.message);})}/>
 <Field label="Código temporário de verificação" value={token} onChange={setToken} secure/><Button label="Confirmar código de e-mail" disabled={busy} onPress={()=>void act(async()=>{const data=await authRequest('verify-email',{token});setToken('');await refresh();setMessage(data.message);})}/></Card>}
 {conflict&&<Card><T>Há uma versão mais recente. Os seus campos mantêm-se no formulário.</T><Button label="Descartar alterações e recarregar perfil" disabled={busy} onPress={()=>void act(refresh)}/></Card>}
 {!!error&&<T accessibilityRole="alert">{error}</T>}{!!message&&<T accessibilityLiveRegion="polite">{message}</T>}{busy&&<T accessibilityLiveRegion="polite">A guardar…</T>}</View>;
}
