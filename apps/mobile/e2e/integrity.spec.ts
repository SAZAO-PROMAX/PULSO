import {test,expect} from './fixtures';

test('edição desatualizada mantém campos e exige decisão antes de reaplicar',async({page,request})=>{
 await page.goto('/');await page.getByRole('button',{name:'Histórico',exact:true}).click();
 const record=page.getByTestId('history-record').filter({hasText:'Glicose: 94 mg/dL'});
 await record.getByRole('button',{name:/^Consultar Glicose/}).click();await page.getByRole('button',{name:'Editar medição',exact:true}).click();
 await page.getByLabel('Valor corrigido',{exact:true}).fill('99,9');
 const external=await request.patch('http://127.0.0.1:8000/demo/profiles/demo-a/result/glucose-0',{headers:{'X-Pulso-Profile':'demo-a','If-Match':'"1"'},data:{value:95}});expect(external.ok()).toBeTruthy();
 await page.getByRole('button',{name:'Guardar correção',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Conflito de edição',exact:true})).toBeVisible();await expect(page.getByLabel('Valor corrigido',{exact:true})).toHaveValue('99,9');
 await page.getByRole('button',{name:'Consultar versão atual',exact:true}).click();await expect(page.getByText('Versão atual: 2 · 95 mg/dL',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Usar esta versão como base, mantendo os meus campos',exact:true}).click();await page.getByRole('button',{name:'Guardar correção',exact:true}).click();
 await expect(page.getByText('Correção guardada.',{exact:true})).toBeVisible();
 const data=await (await request.get('http://127.0.0.1:8000/demo/profiles/demo-a/data',{headers:{'X-Pulso-Profile':'demo-a'}})).json();
 const row=data.results.find((r:any)=>r.id==='glucose-0');expect(row.value).toBe(99.9);expect(row.version).toBe(3);expect(row.previousVersions).toHaveLength(2);
});
