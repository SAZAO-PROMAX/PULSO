import {Page} from '@playwright/test';
export async function editResult(page:Page,label:string){
 if(await page.getByLabel('Valor '+label,{exact:true}).isVisible())return;
 await page.getByRole('button',{name:new RegExp('^Editar resultado [0-9]+: '+label+'$')}).click();
}
export async function reviewKnown(page:Page){for(const label of ['Glicose','Colesterol LDL','Creatinina','Hemoglobina','Hemoglobina glicada']){await editResult(page,label);await page.getByRole('button',{name:'Marcar revisto: '+label,exact:true}).click();}}
