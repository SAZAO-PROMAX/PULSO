import {test,expect,Page} from '@playwright/test';
import path from 'node:path';

const pdf=path.resolve(__dirname,'../../../data/synthetic/laboratorio-demo.pdf');
async function enter(page:Page,baseURL:string){
 const origin=new URL(baseURL).origin,api='http://127.0.0.1:'+(process.env.PULSO_TEST_API_PORT??8000);
 const email=`navigation-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`,password='synthetic-navigation-password';
 expect((await page.request.post(api+'/auth/register',{headers:{Origin:origin},data:{email,password,displayName:'Pessoa sintética de teste',birthDate:'1970-05-23'}})).ok()).toBeTruthy();
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

test('categorias: Enter e Espaço ativam, mas o foco deve acompanhar o novo passo',async({page})=>{
 await activate(page,'Registar');await activate(page,'Importar ficheiro','Space');
 await expect(page.getByRole('heading',{name:'Escolha a categoria do documento'})).toBeFocused();
 await activate(page,'Análises clínicas');
 await expect(page.getByRole('button',{name:'Análises ao sangue',exact:true})).toBeVisible();
 test.fail(true,'v0.7.3: categoria desmonta o controlo focado e não transfere o foco para o passo de tipos.');
 await expect(page.getByRole('heading',{name:'Análises clínicas',exact:true})).toBeFocused();
});

test('voltar à categoria e reabrir conserva o rascunho documental',async({page})=>{
 await activate(page,'Adicionar exame');
 await page.getByLabel('Selecionar documento sintético').setInputFiles(pdf);
 await page.getByLabel('Nome do documento',{exact:true}).fill('Rascunho sintético por conservar');
 await activate(page,'Voltar às categorias de registo');await activate(page,'Análises clínicas');await activate(page,'Análises ao sangue');
 test.fail(true,'v0.7.3: voltar desmonta DocumentImport e elimina ficheiro/nome sem aviso.');
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
 test.fail(true,'v0.7.3: os passos internos não são entradas de histórico.');
 await expect(page.getByRole('button',{name:'Análises ao sangue',exact:true})).toBeVisible();
});
