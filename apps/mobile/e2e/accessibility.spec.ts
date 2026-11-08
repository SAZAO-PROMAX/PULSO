import {test,expect} from './fixtures';
import fs from 'node:fs';
import path from 'node:path';

// Targeted WCAG checks, not certification or a replacement for a screen reader.
const ratio=(a:string,b:string)=>{
 const luminance=(s:string)=>{const v=s.match(/[\d.]+/g)!.slice(0,3).map(Number).map(x=>{x/=255;return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};

test('tema persiste ao fechar e voltar a abrir um navegador de teste',async({playwright},info)=>{
 const dir=info.outputPath('theme-profile');let context=await playwright.chromium.launchPersistentContext(dir,{headless:true});
 try{
  let page=await context.newPage();await page.goto('http://127.0.0.1:8765');
  await page.getByRole('button',{name:'Modo escuro',exact:true}).click();
  await expect(page.getByRole('button',{name:'Modo claro',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual(['pulso.theme.v1']);
  await context.close();context=await playwright.chromium.launchPersistentContext(dir,{headless:true});
  page=await context.newPage();await page.goto('http://127.0.0.1:8765');
  await expect(page.getByRole('button',{name:'Modo claro',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('pulso.theme.v1'))).toBe('dark');
 }finally{await context.close();}
});

test('modal tem nome, foco inicial, ciclo Tab, Escape e estados corretos',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 const info=page.getByRole('button',{name:'Sobre Glicose',exact:true}).first();await info.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog');await expect(dialog).toHaveAccessibleName('Glicose');
 await expect(dialog.getByRole('button',{name:'Fechar explicação',exact:true})).toBeFocused();
 expect(await dialog.getByRole('heading',{level:3}).allTextContents()).toContain('O que é');
 expect(await dialog.getByRole('heading',{level:3}).allTextContents()).not.toContain('Antes de interpretar o resultado'); // short card; full text remains in Aprender
 for(let i=0;i<7;i++){await page.keyboard.press('Tab');await expect.poll(()=>dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);}
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(info).toBeFocused();
 expect(await page.locator('[role="button"][aria-selected]').count(),'Button: usar aria-pressed, não aria-selected').toBe(0);
 await expect(page.getByRole('button',{name:'Glicose',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('campos: erro associado, foco e contraste em ambos os temas',async({page})=>{
 await page.goto('/');expect(await page.locator('html').getAttribute('lang')).toBe('pt-PT');
 await page.getByRole('button',{name:'Adicionar medição',exact:true}).click();
 await page.getByRole('button',{name:'Rever medição',exact:true}).click();
 const input=page.getByLabel('Sistólica (mmHg)',{exact:true});await expect(input).toBeFocused();await expect(input).toHaveAttribute('aria-invalid','true');
 const errorId=await input.getAttribute('aria-describedby');expect(errorId).toBeTruthy();
 await expect(page.locator('[id="'+errorId+'"]')).toContainText('tensão sistólica');
 for(const dark of [false,true]){
  if(dark)await page.getByRole('button',{name:'Modo escuro',exact:true}).click();
  await input.focus();
  const c=await input.evaluate(el=>{const s=getComputedStyle(el);return {text:s.color,bg:s.backgroundColor,border:s.borderTopColor,outline:s.outlineColor,width:parseFloat(s.outlineWidth)};});
  expect(ratio(c.text,c.bg),'Field: contraste do texto ≥4,5').toBeGreaterThanOrEqual(4.5);
  expect(ratio(c.border,c.bg),'Field: limite do controlo ≥3').toBeGreaterThanOrEqual(3);
  expect(ratio(c.outline,c.bg),'Field: contraste do foco ≥3').toBeGreaterThanOrEqual(3);expect(c.width,'Field: foco visível').toBeGreaterThanOrEqual(3);
 }
 await input.fill('128');await expect(input).not.toHaveAttribute('aria-invalid','true');
});

test('gráfico tem lista consultável por teclado e explica dados não comparáveis',async({page,request})=>{
 await page.goto('/');await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 const list=page.getByRole('list',{name:'Medições de Glicose',exact:true}).first();
 await expect(list.getByRole('listitem')).toHaveCount(3);await expect(list).toContainText('Origem do registo:');await expect(list).toContainText('mg/dL');
 const first=list.getByRole('button').first();await first.focus();await page.keyboard.press('Space');
 await expect(first).toHaveAttribute('aria-pressed','true');await expect(page.getByTestId('point-detail')).toBeVisible();
 const raw=fs.readFileSync(path.resolve(__dirname,'../../../data/synthetic/laboratorio-demo.pdf'));
 const extracted=await request.post('http://127.0.0.1:8000/demo/extract',{data:raw,headers:{'Content-Type':'application/pdf','X-Pulso-Demo':'synthetic-only'}});
 const p=await extracted.json(),id='missing-date-demo',owner='demo-b';
 const doc={id,ownerId:owner,synthetic:true,title:'Relatório fictício sem data',laboratory:p.laboratory,issuedAt:null,importedAt:new Date().toISOString(),sha256:p.sha256,original:{fileName:'test.pdf',mediaType:'application/pdf',text:p.text,dataUrl:'data:application/pdf;base64,'+raw.toString('base64')}};
 const result={id:'missing-row',ownerId:owner,synthetic:true,parameter:'glucose',value:98.5,unit:'mg/dL',measuredAt:null,documentId:id,method:null,context:null,referenceText:null,status:'user_confirmed'};
 const saved=await request.post('http://127.0.0.1:8000/demo/profiles/demo-b/confirm',{headers:{'X-Pulso-Profile':owner},data:{document:doc,results:[result]}});expect(saved.ok(),await saved.text()).toBeTruthy();
 await page.getByRole('button',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Perfil fictício B',exact:true}).click();await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 await expect(page.getByText('Porque há registos fora do gráfico?',{exact:true})).toBeVisible();await expect(page.getByText('1 registo: Data válida em falta.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Histórico',exact:true}).click();await expect(page.getByText('Glicose: 98,5 mg/dL',{exact:true})).toBeVisible();
});

test('biblioteca local sem Internet; fonte só é pedida depois do clique',async({page,context})=>{
 const external:string[]=[];
 await context.route('**/*',route=>{const host=new URL(route.request().url()).hostname;if(['127.0.0.1','localhost'].includes(host))return route.continue();external.push(route.request().url());return route.abort();});
 await page.goto('/');await page.getByRole('button',{name:'Aprender',exact:true}).click();await page.getByLabel('Pesquisar termos e tópicos',{exact:true}).fill('consulta');
 await page.getByRole('button',{name:'Ler: Como preparar uma consulta médica?',exact:true}).click();
 await expect(page.getByText('Antes de usar esta informação',{exact:true})).toBeVisible();expect(external).toEqual([]);
 const source=page.getByRole('link',{name:/DGS/});await expect(source).toHaveAttribute('rel','noopener noreferrer');
 const popup=context.waitForEvent('page');await source.click();const opened=await popup;
 await expect.poll(()=>external.length).toBeGreaterThan(0);expect(external[0]).toBe('https://www.dgs.pt/paginas-de-sistema/saude-de-a-a-z/literacia-em-saude.aspx');await opened.close();
 await expect(page.getByText('Antes de usar esta informação',{exact:true})).toBeVisible();
});
