import {test,expect} from './fixtures';
import path from 'node:path';

test('Ollama real: PDF digital, correção, confirmação, gráfico e região',async({page,request})=>{
 test.skip(process.env.PULSO_TEST_LOCAL_LLM!=='true','Teste opcional que exige Ollama e o modelo local instalado.');
 test.setTimeout(120000);
 await page.goto('/');
 await page.getByRole('button',{name:'Adicionar exame',exact:true}).click();
 await expect(page.getByText('Motor local disponível · leitura no teu computador',{exact:true})).toBeVisible();
 await page.getByLabel('Selecionar documento sintético').setInputFiles(path.resolve(__dirname,'../../../tmp/v04-benchmark/simple_digital.pdf'));
 await page.getByRole('button',{name:'Importar PDF',exact:true}).click();
 await expect(page.getByText('Rever resultados extraídos',{exact:true})).toBeVisible({timeout:100000});
 await page.getByLabel('Valor Glicose',{exact:true}).fill('99,9');
 for(const p of ['Glicose','Colesterol LDL','Creatinina'])await page.getByRole('button',{name:'Marcar revisto: '+p,exact:true}).click();
 await page.getByRole('button',{name:'Confirmar e guardar resultados',exact:true}).click();
 await expect(page.getByText('Glicose: 99,9 mg/dL',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 await page.getByRole('button',{name:'Ponto 08/11/2026 99,9 mg/dL',exact:true}).click();
 await expect(page.getByText(/Método de leitura: ollama_text · qwen3-vl:4b · Ollama [0-9.]+/)).toBeVisible();
 await expect(page.getByText(/Extraído originalmente: 98,5 mg\/dL/)).toBeVisible();
 const state=await request.get('http://127.0.0.1:8000/demo/profiles/demo-a/data',{headers:{'X-Pulso-Profile':'demo-a'}});
 const data=await state.json();
 const glucose=data.results.find((r:any)=>r.parameter==='glucose'&&r.value===99.9);expect(glucose.evidence.extractedValue).toBe('98,5');
 expect(data.results.filter((r:any)=>r.documentId===glucose.documentId)).toHaveLength(3);
 const preview=await request.get('http://127.0.0.1:8000/demo/profiles/demo-a/preview/'+glucose.id,{headers:{'X-Pulso-Profile':'demo-a'}});
 expect(preview.ok(),await preview.text()).toBeTruthy();
 await page.screenshot({path:'../../tmp/v04-review-graph.png',fullPage:true});
});

test('Ollama real: fotografia, sinalização visual, confirmação e gráfico',async({page,request})=>{
 test.skip(process.env.PULSO_TEST_LOCAL_LLM!=='true','Exige o modelo local instalado.');test.setTimeout(120000);
 await page.goto('/');await page.getByRole('button',{name:'Adicionar exame',exact:true}).click();
 await page.getByLabel('Selecionar documento sintético').setInputFiles(path.resolve(__dirname,'../../../tmp/v04-benchmark/photo.png'));
 await page.getByRole('button',{name:'Importar PDF',exact:true}).click();
 await expect(page.getByText('Rever resultados extraídos',{exact:true})).toBeVisible({timeout:100000});
 await expect(page.getByText('Valor/associação não verificável por texto independente. Conferir no original.',{exact:true})).toHaveCount(3);
 for(const p of ['Glicose','Colesterol LDL','Creatinina'])await page.getByRole('button',{name:'Marcar revisto: '+p,exact:true}).click();
 await page.getByRole('button',{name:'Confirmar e guardar resultados',exact:true}).click();
 await expect(page.getByText('Glicose: 98,5 mg/dL',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Início',exact:true}).click();await page.getByRole('button',{name:'Análises ao sangue',exact:true}).click();
 await page.getByRole('button',{name:'Ponto 08/11/2026 98,5 mg/dL',exact:true}).click();
 await expect(page.getByText(/Método de leitura: ollama_vision/)).toBeVisible();
 await expect(page.getByRole('button',{name:'Ver região destacada no documento',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Ver documento original fictício',exact:true}).click();
 await expect(page.getByRole('button',{name:'Abrir imagem original',exact:true})).toBeVisible();
 const data=await (await request.get('http://127.0.0.1:8000/demo/profiles/demo-a/data',{headers:{'X-Pulso-Profile':'demo-a'}})).json();
 const doc=data.documents.find((d:any)=>d.original.mediaType==='image/png');
 expect(data.results.filter((r:any)=>r.documentId===doc.id&&r.evidence.verification==='visual_unverified')).toHaveLength(3);
});
