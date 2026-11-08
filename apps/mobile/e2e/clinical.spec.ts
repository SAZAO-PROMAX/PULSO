import {test,expect} from './fixtures';
for(const width of [390,1100]) test('gráficos interativos e documento a '+width+'px',async({page})=>{
 await page.clock.install({time:new Date('2026-11-07T12:00:00Z')});
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 await expect(page.getByText('Evolução descritiva', {exact:false})).toBeVisible();
 await expect(page.getByText('Glicose · mg/dL', {exact:true})).toBeVisible();
 await expect(page.getByText('Glicose · mmol/L', {exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ponto 08/05/2026 94 mg/dL',exact:true}).click();
 await expect(page.getByText('Origem: Laboratório Demo Norte',{exact:true})).toBeVisible();
 await expect(page.getByText('Referência do documento: 70–110 mg/dL',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ver documento original fictício',exact:true}).click();
 await expect(page.getByText('documento-ficticio-1.txt',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'90 dias',exact:true}).click();
 await expect(page.getByRole('button',{name:'Ponto 08/05/2026 94 mg/dL',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Ponto 02/10/2026 97 mg/dL',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Todo o histórico',exact:true}).click();
 await page.getByRole('heading',{name:'Análises ao sangue',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:'../../docs/sprint1-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'Perfil',exact:true}).click();
 await page.getByRole('button',{name:'Perfil fictício B',exact:true}).click();
 await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 for(const parameter of ['Glicose','Colesterol LDL','Creatinina','Hemoglobina','Hemoglobina glicada']) { await page.getByRole('button',{name:parameter,exact:true}).click(); await expect(page.getByText('Sem medições comparáveis disponíveis.')).toHaveCount(1); }
 await expect(page.getByTestId('point-detail')).toHaveCount(0);
 expect(errors).toEqual([]);
});
test('respiração e tensão reutilizam os gráficos',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Saúde respiratória',exact:true}).click();
 await expect(page.getByText('Saturação de oxigénio (SpO₂) · %',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Voltar ao início'}).click();
 await page.getByRole('button',{name:'Tensão arterial',exact:true}).click();
 await expect(page.getByText('Tensão sistólica · mmHg',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Tensão diastólica',exact:true}).click(); await expect(page.getByText('Tensão diastólica · mmHg',{exact:true}).first()).toBeVisible();

});




