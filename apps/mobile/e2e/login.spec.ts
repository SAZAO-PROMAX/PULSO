import {test,expect} from './fixtures';

async function prepare(page:import('@playwright/test').Page,baseURL:string){
 const base=new URL(baseURL),api=base.protocol+'//'+base.hostname+':8000';
 const email='login-'+Date.now()+'-'+Math.random().toString(16).slice(2)+'@example.test',password='fictitious-login-password-2026';
 const response=await page.request.post(api+'/auth/register',{headers:{Origin:base.origin},data:{email,password,displayName:'Pessoa inteiramente fictícia',birthDate:'1970-05-23'}});expect(response.ok()).toBeTruthy();
 await page.goto('/');await page.getByRole('button',{name:'Abrir menu de perfil',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Iniciar sessão',exact:true}).click();
 await page.getByLabel('E-mail',{exact:true}).fill(email);await page.getByLabel('Palavra-passe',{exact:true}).fill(password);
 return {base,api,email};
}

test('login confirma cookie, dados e recarga no mesmo hostname da aplicação',async({page,baseURL})=>{
 const {base,api}=await prepare(page,baseURL!);const hosts:string[]=[];
 page.on('request',r=>{if(new URL(r.url()).pathname==='/auth/login')hosts.push(new URL(r.url()).hostname);});
 await page.getByRole('button',{name:'Iniciar sessão',exact:true}).click();
 await expect.poll(()=>hosts[0]).toBe(base.hostname);
 await expect(page.getByText('CONTA EXPERIMENTAL · DADOS FICTÍCIOS',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Adicionar medição',exact:true})).toBeVisible();
 const session=await (await page.request.get(api+'/auth/session')).json();expect(session.user).not.toBeNull();
 const data=await page.request.get(api+'/demo/profiles/'+session.user.id+'/data');expect(data.ok()).toBeTruthy();expect((await data.json()).results).toEqual([]);
 await page.reload();await expect(page.getByText('CONTA EXPERIMENTAL · DADOS FICTÍCIOS',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Adicionar medição',exact:true})).toBeVisible();
});

test('cookie recusado não apresenta uma conta autenticada nem apaga os campos',async({page,context,baseURL})=>{
 const {email}=await prepare(page,baseURL!);
 await page.route('**/auth/login',async route=>{const response=await route.fetch();const headers={...response.headers()};delete headers['set-cookie'];await context.clearCookies({name:'pulso_session'});await route.fulfill({response,headers});});
 await page.getByRole('button',{name:'Iniciar sessão',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('cookie');await expect(page.getByText('CONTA EXPERIMENTAL · DADOS FICTÍCIOS',{exact:true})).toHaveCount(0);await expect(page.getByLabel('E-mail',{exact:true})).toHaveValue(email);
});
