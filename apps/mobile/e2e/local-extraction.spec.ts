import {test,expect,openArea} from './fixtures';
import path from 'node:path';

// API runs with inference disabled; actual local GPU inference is measured separately.
test('imagem com Ollama desligado: introdução manual, revisão, SQLite, gráfico e proveniência',async({page,request})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Adicionar exame',exact:true}).click();
 await expect(page.getByText('Motor local indisponível · leitura de texto e introdução manual disponíveis',{exact:true})).toBeVisible();
 await page.getByLabel('Selecionar documento sintético').setInputFiles(path.resolve(__dirname,'../../../tmp/v04-benchmark/photo.png'));
 await page.getByRole('button',{name:'Importar PDF',exact:true}).click();
 await expect(page.getByText('Leitura automática não concluída. Podes introduzir os resultados manualmente.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Adicionar resultado manual',exact:true}).click();
 await page.getByLabel('Valor Glicose',{exact:true}).fill('101,5');
 await page.getByLabel('Data Glicose (opcional)',{exact:true}).fill('2026-11-08');
 await page.getByLabel('Página Glicose (opcional)',{exact:true}).fill('1');
 await page.getByLabel('Origem Glicose (opcional)',{exact:true}).fill('Laboratório fictício manual');
 await page.getByLabel('Método Glicose',{exact:true}).fill('hexoquinase');
 await page.getByLabel('Amostra Glicose',{exact:true}).fill('plasma');
 await page.getByRole('button',{name:'Confirmar e guardar resultados',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Revê cada linha');
 await expect(page.getByLabel('Valor Glicose',{exact:true})).toHaveValue('101,5');
 await page.getByRole('button',{name:'Marcar revisto: Glicose',exact:true}).click();
 await page.getByRole('button',{name:'Confirmar e guardar resultados',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Documento laboratorial sintético',exact:true})).toBeFocused();await page.getByRole('button',{name:'Ver evolução de Glicose',exact:true}).click();await expect(page.getByTestId('point-detail')).toContainText('101,5 mg/dL');await page.getByRole('button',{name:'Histórico',exact:true}).click();await expect(page.getByText('Glicose: 101,5 mg/dL',{exact:true})).toBeVisible();
 await page.reload();await openArea(page,'Análises ao sangue');
 await page.getByRole('button',{name:'Ponto 08/11/2026 101,5 mg/dL',exact:true}).click();
 await expect(page.getByText('Origem: Laboratório fictício manual',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Ver documento original fictício',exact:true}).click();
 await expect(page.getByRole('button',{name:'Abrir imagem original',exact:true})).toBeVisible();
 const response=await request.get('http://127.0.0.1:8000/demo/profiles/demo-a/data',{headers:{'X-Pulso-Profile':'demo-a'}});
 const data=await response.json(),row=data.results.find((r:any)=>r.value===101.5);
 expect(row.evidence.extractionMethod).toBe('manual');expect(row.evidence.extractedValue).toBe('');
 expect(data.documents.find((d:any)=>d.id===row.documentId).original.mediaType).toBe('image/png');
});
