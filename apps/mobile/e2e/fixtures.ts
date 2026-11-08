import {test as base,expect} from '@playwright/test';
export const test=base.extend<{demoDatabase:void}>({
 demoDatabase:[async({request},use)=>{
  for(const owner of ['demo-a','demo-b']){
   const response=await request.post('http://127.0.0.1:8000/demo/profiles/'+owner+'/reset',{headers:{'X-Pulso-Profile':owner},data:{confirm:owner}});
   expect(response.ok()).toBeTruthy();
  }
  await use();
 },{auto:true}],
});
export {expect};

export async function reveal(page:import('@playwright/test').Page,label:string){
 const target=page.getByRole('button',{name:label,exact:true});if(await target.count()&&await target.first().isVisible())return;
 const back=page.getByRole('button',{name:'Voltar ao Histórico',exact:true});if(await back.count())await back.click();
 const filters=/^(Histórico:|Filtrar (tipo|especialidade)|Todas as especialidades|Todos os tipos|Últimos 90 dias|Último ano|Todo o período)/.test(label),button=page.getByRole('button',{name:filters?'Filtros':'Opções do gráfico',exact:true});
 if(await button.count()&&await button.getAttribute('aria-pressed')!=='true')await button.click();
}

export async function openArea(page:import('@playwright/test').Page,area:string){
 const select=page.getByLabel('Área de evolução',{exact:true});
 if(!await select.count())await page.getByRole('button',{name:'Ver evolução',exact:true}).click();
 await select.selectOption({label:area});
}
