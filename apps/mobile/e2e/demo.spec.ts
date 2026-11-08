import {test,expect} from './fixtures';
test('navegação real e isolamento entre perfis fictícios',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'A minha saúde',exact:true})).toBeVisible();
 for(const area of ['Análises ao sangue','Tensão arterial','Saúde respiratória','Medicação e consultas','Saúde geral e prevenção']) {
  await page.getByRole('button',{name:area,exact:true}).click();
  await expect(page.getByRole('heading',{name:area,exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Voltar ao início'}).click();
 }
 await page.getByRole('button',{name:'Histórico',exact:true}).click();
 await expect(page.getByText('Tensão sistólica: 123 mmHg').first()).toBeVisible();
 await page.getByRole('button',{name:'Perfil',exact:true}).click();
 await page.getByRole('button',{name:'Perfil fictício B',exact:true}).click();
 await page.getByRole('button',{name:'Histórico',exact:true}).click();
 await expect(page.getByText('Este perfil ainda não tem registos.')).toBeVisible();
 await expect(page.getByText('Tensão sistólica: 123 mmHg')).toHaveCount(0);
 for(const tab of ['Registar','Aprender','Perfil','Início']) await page.getByRole('button',{name:tab,exact:true}).click();
 await page.screenshot({path:'../../docs/sprint0-mobile.png',fullPage:true});
 expect(errors).toEqual([]);
});


