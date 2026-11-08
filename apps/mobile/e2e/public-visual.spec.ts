import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
test('referência visual comparável das páginas principais, com dados e sem dados',async({page,baseURL})=>{
 const phase=process.env.PULSO_VISUAL_PHASE??'after',api=new URL(baseURL!).protocol+'//'+new URL(baseURL!).hostname+':8000',origin=new URL(baseURL!).origin,email='visual-person@example.test',password='fictitious-visual-password';
 await page.request.post(api+'/auth/register',{headers:{Origin:origin},data:{email,password,displayName:'Pessoa fictícia',birthDate:'1970-05-23'}});await page.goto('/#/login');await page.getByLabel('E-mail',{exact:true}).fill(email);await page.getByLabel('Palavra-passe',{exact:true}).fill(password);await page.getByRole('button',{name:'Iniciar sessão',exact:true}).click();await expect(page.getByRole('button',{name:'Adicionar exame',exact:true})).toBeVisible();
 const session=await (await page.request.get(api+'/auth/session')).json();await page.request.patch(api+'/auth/preferences',{headers:{Origin:origin,'X-Pulso-CSRF':session.csrf,'If-Match':String(session.user.version)},data:{...session.user.experience,onboardingCompleted:true}});await page.reload();
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});await page.screenshot({path:'../../tmp/v072-'+phase+'-hub-empty-'+width+'.png'});}
 const raw=fs.readFileSync(path.resolve(__dirname,'../../../data/synthetic/laboratorio-demo.pdf')),s=await (await page.request.get(api+'/auth/session')).json(),headers={Origin:origin,'X-Pulso-CSRF':s.csrf};
 const extraction=await page.request.post(api+'/demo/extract',{headers:{...headers,'Content-Type':'application/pdf','X-Pulso-Demo':'synthetic-only'},data:raw});expect(extraction.ok()).toBeTruthy();const p=await extraction.json(),owner=s.user.id,id='visual-document';
 const medicalDocument={id,ownerId:owner,synthetic:true,title:'Análise inteiramente fictícia',laboratory:p.laboratory,issuedAt:p.date+'T12:00:00Z',importedAt:'2026-11-08T12:00:00Z',sha256:createHash('sha256').update(raw).digest('hex'),original:{fileName:'laboratorio-demo.pdf',mediaType:'application/pdf',text:p.text,dataUrl:'data:application/pdf;base64,'+raw.toString('base64')}},results=p.candidates.map((r:any,i:number)=>({id:'visual-'+i,ownerId:owner,synthetic:true,parameter:r.parameter,value:Number(r.value.replace(',','.')),unit:r.unit,measuredAt:p.date+'T12:00:00Z',documentId:id,method:r.method,context:r.context,referenceText:r.referenceText,status:'user_confirmed'}));
 expect((await page.request.post(api+'/demo/profiles/'+owner+'/confirm',{headers,data:{document:medicalDocument,results}})).ok()).toBeTruthy();await page.reload();
 for(const tab of ['Início','Histórico','Aprender','Perfil']){await page.getByRole('button',{name:tab,exact:true}).click();for(const width of [390,1280]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'../../tmp/v072-'+phase+'-'+tab+'-'+width+'.png'});}}
 // Stress the shared layout with saved large text, all principal pages and both themes.
 const latestSession=await (await page.request.get(api+'/auth/session')).json();
 expect((await page.request.patch(api+'/auth/preferences',{headers:{Origin:origin,'X-Pulso-CSRF':latestSession.csrf,'If-Match':String(latestSession.user.version)},data:{...latestSession.user.experience,textSize:'extra',theme:'dark'}})).ok()).toBeTruthy();await page.reload();
 for(const width of [320,390,768,1100,1280]){
  await page.setViewportSize({width,height:900});
  for(const tab of ['Início','Histórico','Aprender','Perfil']){
   const nav=page.getByRole('button',{name:tab,exact:true});await nav.click();
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   // The header and bottom navigation occupy layout space, never overlay the scrolling pane.
   const title=page.locator('#page-title');await title.scrollIntoViewIfNeeded();const box=(await title.boundingBox())!,navBox=(await nav.boundingBox())!;
   expect(box.y).toBeGreaterThanOrEqual(70);if(width<900)expect(box.y+box.height).toBeLessThan(navBox.y);
   await page.getByText('PULSO experimental · apenas dados fictícios · sem avaliação clínica',{exact:true}).scrollIntoViewIfNeeded();
   const footer=(await page.getByText('PULSO experimental · apenas dados fictícios · sem avaliação clínica',{exact:true}).boundingBox())!;
   expect(footer.y+footer.height).toBeLessThanOrEqual(width<900?navBox.y:900);
  }
  await page.screenshot({path:'../../tmp/v072-large-dark-'+width+'.png'});
 }

});
