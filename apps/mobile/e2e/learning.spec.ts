import {test,expect,openArea} from './fixtures';

test('hub usa dados do perfil e apresenta estados vazios sem inventar exames',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('Olá, Perfil fictício A',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Perfil',exact:true}).click();await page.getByRole('button',{name:'Perfil fictício B',exact:true}).click();
 await expect(page.getByText('Olá, Perfil fictício B',{exact:true})).toBeVisible();
 await expect(page.getByText('O seu histórico começa aqui.',{exact:true})).toBeVisible();
 await expect(page.getByText('23',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Abrir Aprender',exact:true}).click();
 await expect(page.getByLabel('Pesquisar termos e tópicos',{exact:true})).toBeVisible();
});

test('pesquisa, categorias, ficha, fontes e termos relacionados',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Aprender',exact:true}).click();
 await page.getByLabel('Pesquisar termos e tópicos',{exact:true}).fill('glicada');
 await expect(page.getByText('1 tópico encontrado',{exact:true})).toBeVisible();
 await page.getByLabel('Categoria educativa',{exact:true}).selectOption({label:'Medicação'});
 await expect(page.getByText('Não encontrámos esse tópico.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Limpar pesquisa e filtros',exact:true}).click();
 await page.getByLabel('Categoria educativa',{exact:true}).selectOption({label:'Consultas'});
 await page.getByRole('button',{name:'Ler: Como preparar uma consulta médica?',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Como preparar uma consulta médica?',exact:true})).toBeFocused();
 await expect(page.getByText('Conteúdo educativo · não é um diagnóstico',{exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:/DGS/})).toHaveAttribute('href','https://www.dgs.pt/paginas-de-sistema/saude-de-a-a-z/literacia-em-saude.aspx');
 await expect(page.getByText('Revisão clínica independente pendente. Publicado como conteúdo educativo experimental.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ler: Levar uma lista de medicação',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Levar uma lista de medicação',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Voltar aos tópicos',exact:true}).click();
 await expect(page.getByText('1 tópico encontrado',{exact:true})).toBeVisible();
});

test('popover desktop por teclado, Escape, retorno do foco e ligação ao histórico',async({page})=>{
 await page.setViewportSize({width:1280,height:900});await page.goto('/');
 await openArea(page,'Análises ao sangue');
 await page.getByRole('button',{name:'Hemoglobina glicada',exact:true}).click();
 const info=page.getByRole('button',{name:'Sobre Hemoglobina glicada (HbA1c)',exact:true}).first();
 await info.focus();await page.keyboard.press('Enter');
 const card=page.getByTestId('education-card');await expect(card).toBeVisible();
 await expect(card.getByText('O que é',{exact:true})).toBeVisible();
 const bounds=(await card.boundingBox())!;expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(1280);expect(bounds.y+bounds.height).toBeLessThanOrEqual(900);
 await page.keyboard.press('Escape');await expect(card).toHaveCount(0);await expect(info).toBeFocused();
 await info.click();await page.getByRole('button',{name:'Ver ficha em Aprender',exact:true}).click();
 await expect(page.getByRole('heading',{name:'O que é a HbA1c?',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ver histórico deste parâmetro',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Análises ao sangue',exact:true})).toBeFocused();
 await expect(page.getByText('Hemoglobina glicada · %',{exact:true})).toBeVisible();
});

test('modal móvel preserva o formulário e não apresenta os valores como educação',async({page})=>{
 await page.setViewportSize({width:320,height:850});await page.goto('/');
 await page.getByRole('button',{name:'Adicionar medição',exact:true}).click();
 await page.getByLabel('Sistólica (mmHg)',{exact:true}).fill('128');
 await page.getByRole('button',{name:'Sobre Tensão sistólica',exact:true}).click();
 const card=page.getByTestId('education-card');await expect(card).toBeVisible();
 await expect(card).not.toContainText('128');const box=(await card.boundingBox())!;
 expect(box.x+box.width).toBeLessThanOrEqual(320);expect(box.y+box.height).toBeLessThanOrEqual(851);
 await page.screenshot({path:'../../tmp/ux-info-mobile.png'});
 await page.getByRole('button',{name:'Fechar explicação',exact:true}).click();
 await expect(page.getByLabel('Sistólica (mmHg)',{exact:true})).toHaveValue('128');
});

test('Aprender funciona quando a API de registos está indisponível',async({page})=>{
 await page.route('**/demo/profiles/**/data',route=>route.abort());await page.goto('/');
 await expect(page.getByRole('alert')).toBeVisible();
 await page.getByRole('button',{name:'Aprender',exact:true}).click();
 await page.getByLabel('Pesquisar termos e tópicos',{exact:true}).fill('creatinina');
 await page.getByRole('button',{name:'Ler: O que mede a creatinina?',exact:true}).click();
 await expect(page.getByText('O que é',{exact:true})).toBeVisible();
});

for(const width of [390,1280])test('hub e Aprender sem overflow a '+width,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');
 await expect(page.getByRole('button',{name:'Adicionar exame',exact:true})).toBeVisible();
 await page.screenshot({path:'../../tmp/ux-hub-'+width+'.png'});
 await page.getByRole('button',{name:'Modo escuro',exact:true}).click();
 await page.getByRole('button',{name:'Aprender',exact:true}).click();
 await page.screenshot({path:'../../tmp/ux-learning-'+width+'.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.getByLabel('Categoria educativa',{exact:true}).selectOption({label:'Análises ao sangue'});
 await page.getByRole('button',{name:'Ler: Glicose: o açúcar no sangue',exact:true}).click();
 await page.evaluate(()=>{document.body.style.zoom='2';});
 await expect(page.getByRole('button',{name:'Voltar aos tópicos',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Ver histórico deste parâmetro',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.getByRole('button',{name:'Ver histórico deste parâmetro',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:'../../tmp/ux-zoom-'+width+'.png'});
 await page.getByRole('button',{name:'Ver histórico deste parâmetro',exact:true}).click();
 await expect(page.getByText('Glicose · mg/dL',{exact:true})).toBeVisible();
});
