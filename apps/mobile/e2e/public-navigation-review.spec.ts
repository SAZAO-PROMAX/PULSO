import {test,expect,Page} from '@playwright/test';
import path from 'node:path';

const pdf=path.resolve(__dirname,'../../../data/synthetic/laboratorio-demo.pdf');
const email=`navigation-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`,password='synthetic-navigation-password';
// One account per file: only the final journey persists a record. Keep registration limits intact.
test.beforeAll(async({request,baseURL})=>{
 const api='http://127.0.0.1:'+(process.env.PULSO_TEST_API_PORT??8000);
 expect((await request.post(api+'/auth/register',{headers:{Origin:new URL(baseURL!).origin},data:{email,password,displayName:'Pessoa sintética de teste',birthDate:'1970-05-23'}})).ok()).toBeTruthy();
});
async function enter(page:Page,baseURL:string){
 const origin=new URL(baseURL).origin,api='http://127.0.0.1:'+(process.env.PULSO_TEST_API_PORT??8000);
 expect((await page.request.post(api+'/auth/login',{headers:{Origin:origin},data:{email,password}})).ok()).toBeTruthy();
 await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1'&&![new URL(baseURL).port,String(process.env.PULSO_TEST_API_PORT??8000)].includes(url.port))return route.abort();return route.continue();});
 await page.goto('/#/app');await expect(page.getByRole('button',{name:'Adicionar exame',exact:true})).toBeVisible();
}
// Only Tab/Shift+Tab finds the control; no click or programmatic focus.
async function activate(page:Page,name:string,key='Enter'){
 const control=page.getByRole('button',{name,exact:true});
 for(let n=0;n<160;n++){
  if(await control.evaluate(el=>el===document.activeElement))break;
  await page.keyboard.press('Tab');
 }
 await expect(control).toBeFocused();await page.keyboard.press(key);
}
test.beforeEach(async({page,baseURL})=>enter(page,baseURL!));

test('categorias: Enter e Espaço ativam e o foco acompanha o novo passo',async({page})=>{
 await activate(page,'Registar');await activate(page,'Importar ficheiro','Space');
 await expect(page.getByRole('heading',{name:'Escolha a categoria do documento'})).toBeFocused();
 await activate(page,'Análises clínicas');
 await expect(page.getByRole('button',{name:'Análises ao sangue',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Análises clínicas',exact:true})).toBeFocused();
});

test('voltar à categoria e reabrir conserva o rascunho documental',async({page})=>{
 await activate(page,'Adicionar exame');
 await page.getByLabel('Selecionar documento sintético').setInputFiles(pdf);
 await page.getByLabel('Nome do documento',{exact:true}).fill('Rascunho sintético por conservar');
 await activate(page,'Voltar às categorias de registo');await activate(page,'Análises clínicas');await activate(page,'Análises ao sangue');
 await expect(page.getByLabel('Nome do documento',{exact:true})).toHaveValue('Rascunho sintético por conservar');
});

test('revisão atual: campos permanentes, Enter num valor não confirma e guarda sem revisão é recusada',async({page})=>{
 await activate(page,'Adicionar exame');await page.getByLabel('Selecionar documento sintético').setInputFiles(pdf);await activate(page,'Importar PDF');
 await expect(page.getByText('Rever resultados extraídos',{exact:true})).toBeVisible();
 await expect(page.getByRole('textbox',{name:/^Valor /})).toHaveCount(5);
 await expect(page.getByRole('textbox',{name:/^(Valor|Unidade|Data|Página|Origem|Método|Amostra) (Glicose|Colesterol LDL|Creatinina|Hemoglobina)/})).toHaveCount(35);
 let writes=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/confirm'))writes++;});
 await page.getByLabel('Valor Glicose',{exact:true}).focus();await page.keyboard.press('Enter');expect(writes).toBe(0);
 await page.screenshot({path:'../../tmp/v074-review-before-390.png',fullPage:true});
 await activate(page,'Confirmar e guardar resultados');await expect(page.getByRole('alert')).toContainText('Revê cada linha');expect(writes).toBe(0);
});

test('Voltar do navegador deve regressar à categoria, não saltar para o Hub',async({page})=>{
 await activate(page,'Registar');await activate(page,'Importar ficheiro');await activate(page,'Análises clínicas');await activate(page,'Análises ao sangue');
 await page.goBack();
 await expect(page.getByRole('button',{name:'Análises ao sangue',exact:true})).toBeVisible();
 await page.goForward();await expect(page).toHaveURL(/#\/record\/form\/laboratory\/blood$/);
 await page.getByLabel('Selecionar documento sintético').setInputFiles(pdf);await page.getByLabel('Nome do documento',{exact:true}).fill('Rascunho sintético de navegação');
 await page.goBack();await expect(page.getByRole('button',{name:'Análises ao sangue',exact:true})).toBeVisible();await page.goForward();await expect(page.getByLabel('Nome do documento',{exact:true})).toHaveValue('Rascunho sintético de navegação');
 await activate(page,'Histórico');await expect(page.getByRole('heading',{name:'Registos',exact:true})).toBeVisible();await page.goBack();await expect(page.getByLabel('Nome do documento',{exact:true})).toHaveValue('Rascunho sintético de navegação');
 await activate(page,'Início');await activate(page,'Registar');await activate(page,'Retomar registo por guardar');await expect(page.getByLabel('Nome do documento',{exact:true})).toHaveValue('Rascunho sintético de navegação');
 const dialog=page.waitForEvent('dialog'),reload=page.reload({timeout:3000}).catch(()=>{});const warning=await dialog;expect(warning.type()).toBe('beforeunload');await warning.dismiss();await reload;
 await expect(page.getByLabel('Nome do documento',{exact:true})).toHaveValue('Rascunho sintético de navegação');
 await activate(page,'Abrir menu de perfil');await activate(page,'Terminar sessão');await expect(page.getByRole('button',{name:'Histórico',exact:true})).toHaveCount(0);await page.goBack();await expect(page.getByLabel('Nome do documento',{exact:true})).toHaveCount(0);
});


test('rascunho revisto mantém correções sem repetir extração; troca exige descarte e Escape restitui foco',async({page})=>{
 let extractions=0,confirms=0;
 page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/demo/extractions'))extractions++;if(r.method()==='POST'&&r.url().endsWith('/confirm'))confirms++;});
 await activate(page,'Adicionar exame');await page.getByLabel('Selecionar documento sintético').setInputFiles(pdf);await activate(page,'Importar PDF');
 await expect(page.getByText('Rever resultados extraídos',{exact:true})).toBeVisible();
 await page.getByLabel('Valor Glicose',{exact:true}).fill('99,2');await activate(page,'Marcar revisto: Glicose');
 await activate(page,'Voltar às categorias de registo');await activate(page,'Retomar registo por guardar');
 await expect(page.getByLabel('Valor Glicose',{exact:true})).toHaveValue('99,2');await expect(page.getByRole('button',{name:'Revisto: Glicose',exact:true})).toBeVisible();expect(extractions).toBe(1);expect(confirms).toBe(0);
 await activate(page,'Voltar às categorias de registo');await activate(page,'Cardiologia');await activate(page,'Eletrocardiograma');
 await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('button',{name:'Continuar a editar',exact:true})).toBeFocused();
 for(const width of [320,390,768,1100,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(width===390||width===1280)await page.screenshot({path:'../../tmp/v074-draft-dialog-'+width+'.png'});}
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Eletrocardiograma',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');await activate(page,'Continuar a editar');await expect(page.getByLabel('Valor Glicose',{exact:true})).toHaveValue('99,2');
 await activate(page,'Voltar às categorias de registo');await activate(page,'Cardiologia');await activate(page,'Eletrocardiograma');await activate(page,'Descartar rascunho e continuar');
 await expect(page.getByRole('heading',{name:'Guardar documento sintético',exact:true})).toBeFocused();
 await expect(page.getByRole('button',{name:'Selecionar documento',exact:true})).toBeVisible();expect(confirms).toBe(0);
});

test('formulário vazio muda de tipo sem diálogo e tensão permanece ao voltar',async({page})=>{
 await activate(page,'Adicionar exame');await activate(page,'Voltar às categorias de registo');await activate(page,'Cardiologia');await activate(page,'Eletrocardiograma');await expect(page.getByRole('dialog')).toHaveCount(0);
 await activate(page,'Voltar às categorias de registo');await activate(page,'Voltar às opções de registo');await activate(page,'Registar medição');
 await page.getByLabel('Sistólica (mmHg)',{exact:true}).fill('128');await activate(page,'Voltar às categorias de registo');await activate(page,'Retomar registo por guardar');await expect(page.getByLabel('Sistólica (mmHg)',{exact:true})).toHaveValue('128');
});

test('PDF por teclado: seleção, correção, revisão deliberada, guarda única e recarga',async({page})=>{
 await activate(page,'Registar');await activate(page,'Importar ficheiro');await activate(page,'Análises clínicas');await activate(page,'Análises ao sangue');
 const chooser=page.waitForEvent('filechooser');await activate(page,'Selecionar documento');await (await chooser).setFiles(pdf);await activate(page,'Importar PDF');
 await expect(page.getByText('Rever resultados extraídos',{exact:true})).toBeVisible();
 const value=page.getByLabel('Valor Glicose',{exact:true});
 for(let n=0;n<160;n++){if(await value.evaluate(el=>el===document.activeElement))break;await page.keyboard.press('Tab');}
 await expect(value).toBeFocused();await page.keyboard.press('Control+a');await page.keyboard.insertText('99,2');await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');await expect(value).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.getByText('Rever resultados extraídos',{exact:true})).toBeVisible();
 for(const name of ['Glicose','Colesterol LDL','Creatinina','Hemoglobina','Hemoglobina glicada'])await activate(page,'Marcar revisto: '+name,'Space');
 let saves=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/confirm'))saves++;});
 await activate(page,'Confirmar e guardar resultados');await expect(page.getByRole('heading',{name:'Documento laboratorial sintético',exact:true})).toBeFocused();expect(saves).toBe(1);
 await activate(page,'Ver evolução de Glicose');await expect(page.getByTestId('point-detail')).toContainText('99,2 mg/dL');await page.reload();await expect(page.getByText('Glicose: 99,2 mg/dL',{exact:true})).toBeVisible();
});
