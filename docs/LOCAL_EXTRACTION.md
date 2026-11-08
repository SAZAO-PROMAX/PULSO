# Extração local PULSO v0.4 — 08/11/2026

## Incremento v0.6 — fila limitada

O formulário web usa agora POST `/demo/extractions` (202), GET `/demo/extractions/{id}` e DELETE do pedido ainda em espera, com âmbito do perfil. Estados: queued, processing, ready (aguarda confirmação), error e cancelled. O original/resultados só são persistidos após confirmação no fluxo existente. Validação de assinatura/formato/limites precede o processamento; cliques repetidos com o mesmo hash/perfil reutilizam o pedido ou resultado ainda retido.
Fila em memória, máximo cinco pedidos ativos/aguardando, espera até 60 s, processamento com prazo de 285 s, resposta retida até 300 s e no máximo 20 concluídos. Pedidos expirados são removidos/assinalados na próxima consulta ou passagem do trabalhador. O número de uploads em receção também é limitado. Fila cheia: 429/Retry-After; trabalho iniciado não é cancelado pela interface. Reiniciar o processo perde fila/resultados temporários; 404 explica repetição e ausência de gravação. Uma única extração partilhada com o endpoint síncrono `/demo/extract`, mantido para compatibilidade. Não aumentar workers: a fila/semaforo são locais ao processo e não coordenam múltiplas instâncias. Sem alteração de modelo, concorrência GPU, serviços externos ou nova base.

As secções seguintes registam a implementação e os ensaios históricos v0.4.

Implementada sobre Expo/React Native + FastAPI + a mesma SQLite. Não foi reconstruído o dashboard. Apenas documentos inteiramente sintéticos; confirmação humana não equivale a validação médica.

## Ambiente verificado

Windows, Ryzen 7 260, 31,26 GiB de RAM utilizável, RTX 5050 Laptop com 8151 MiB de VRAM, driver 621.01. Ollama 0.40.15 e qwen3-vl:4b já estavam instalados: não foram reinstalados nem descarregados outros modelos. Modelo local com digest `a1b29c246319cdcb1f3842f36d29f198f737c0cf516ba1bcba34b1b974e87980`. Servidor observado apenas em 127.0.0.1:11434.

Ollama indicou 100% GPU. Com contexto 8192, `/api/ps` reportou 4 322 691 645 bytes alocados ao modelo e o mesmo valor em VRAM (aproximadamente 4,03 GiB). Isto é uma amostra após inferência, não uma medição do pico total de RAM/VRAM nem uma garantia para outros documentos. Não foi provocado esgotamento real de memória na GPU; falhas HTTP do motor são ensaiadas com transporte simulado.

## Ligação e configuração

Backend → REST Ollama em `http://127.0.0.1:11434`. Só aceita esse endereço ou localhost equivalente e o modelo exato `qwen3-vl:4b`. Sem Cloud, chaves, login, ferramentas, base de dados ou ficheiros disponibilizados ao modelo. Proxies de ambiente e redirecionamentos estão desativados no cliente. Navegador comunica apenas com FastAPI.

Valores por defeito no adaptador, também documentados em `.env.example`:

```powershell
$env:OLLAMA_BASE_URL='http://127.0.0.1:11434'
$env:OLLAMA_MODEL='qwen3-vl:4b'
$env:LLM_EXTRACTION_ENABLED='true'
.\dev.cmd
```

O launcher herda estas variáveis; não lê automaticamente `.env`. Não é necessário criar esse ficheiro para usar os valores por defeito. Para desativar a inferência, definir `LLM_EXTRACTION_ENABLED=false` antes de iniciar. Não modificar OLLAMA_HOST para expor o serviço.

## Fluxo realmente implementado

1. Validar MIME e assinatura PDF/PNG/JPEG, até 2 MB/3 páginas, 12 megapíxeis por imagem, sem documentos cifrados.
2. PyMuPDF preserva texto e blocos por página. O parser antigo reconhece o formato sintético conhecido sem inferência. Outros PDFs de texto seguem para associação com o modelo; páginas digitalizadas/imagens seguem para visão, com aresta máxima de 1280 px. PDF misto seleciona por página.
3. Resposta JSON com esquema Pydantic, tipos estritos, campos extra recusados, até 30 propostas por página. Respostas truncadas, inválidas ou com chamadas de ferramentas falham.
4. Validador independente procura o excerto exato e a sequência nome → resultado → unidade. Não usa autoconfiança do modelo. Verifica separador decimal, catálogo, unidade, data impressa e evidência de metadados. Só correspondências inequívocas recebem região textual. Imagens não têm OCR independente: valores ficam sempre `visual_unverified`, com aviso. Valores originais continuam disponíveis para revisão.
5. Revisão permite corrigir parâmetro, valor, unidade, data, página, origem, método/amostra, excluir linhas e adicionar manualmente. Cada linha aceite precisa de marcação como revista. Falhas recuperáveis preservam os campos; cancelamento/fecho/recarregamento descartam o rascunho não guardado.
6. Confirmação usa a API/SQLite existente, com original/hash, excerto/página, método, modelo/digest/versão, momento do processamento e valores extraídos separados dos confirmados. Campos originais de data/laboratório/método/amostra também ficam na evidência. Correções posteriores mantêm versões anteriores. A opção explícita de registar sem valor numérico guarda nulo, conserva ND/texto original e não cria um ponto no gráfico.
7. Histórico/gráficos leem a mesma fonte. Todos os parâmetros do catálogo são selecionáveis. Unidades/métodos/amostras incompatíveis continuam separados; dados sem data/método/amostra ficam no histórico com motivo de exclusão. Sem conversões numéricas, diagnósticos ou objetivos clínicos.
8. Ponto do gráfico → detalhe → original e proveniência. Quando há região textual única, o backend recalcula o destaque no PDF guardado e gera uma pré-visualização PNG sem alterar o original. Não há destaque para imagem ou coordenadas não verificáveis.

Uma extração por vez; 90 s por chamada ao motor, prazo global de subprocesso 285 s e cliente 300 s. Texto total até 30 000 caracteres, máximo 12 000 numa página enviada ao modelo; acima disso, revisão manual. Resposta do motor até 512 KB. PDFs e imagens são processados em memória, sem criar temporários na API. Fixtures e métricas de testes ficam em `tmp/`, ignorado pelo Git.

O estado do motor é verificado ao abrir a importação. Sem Ollama/modelo, histórico, gráficos, edição e tensão continuam disponíveis; parser conhecido e introdução manual mantêm-se funcionais. Uma falha não é apresentada como extração concluída.

## Catálogo e fontes

JSON partilhado entre Python e TypeScript, com os 12 parâmetros pedidos e ureia, sódio e potássio para testar um relatório de 15 parâmetros distintos. Alias exatos, sem associação aproximada de nomes. LOINC e mapeamentos UCUM permanecem nulos; não são inventados códigos. Unidades reconhecidas não significam equivalência de métodos nem validação clínica. Ureia/sódio/potássio apenas acrescentam nomes/unidades, sem importar intervalos ou regras: [catálogo NHS de análises](https://www.barnsleyhospital.nhs.uk/pathology/blood-sciences/test-repertoire/table), [ureia](https://www.nwlpathology.nhs.uk/test/urea/).

Documentação oficial consultada antes da implementação: [índice](https://docs.ollama.com/llms.txt), [início](https://docs.ollama.com/quickstart), [Windows](https://docs.ollama.com/windows), [GPU](https://docs.ollama.com/gpu), [API](https://docs.ollama.com/api/introduction), [visão](https://docs.ollama.com/capabilities/vision), [saídas estruturadas](https://docs.ollama.com/capabilities/structured-outputs), [chat](https://docs.ollama.com/api/chat), [modelo](https://ollama.com/library/qwen3-vl:4b). Não existe SDK OpenAI no backend; usa-se a API nativa local.

Durante o ensaio inicial, `think:false` sozinho ainda consumiu o orçamento de geração em raciocínio e devolveu zero linhas em dois casos. A continuação de assistente iniciada com `{`, mantendo esquema JSON e `think:false`, resolveu os ensaios seguintes nesta versão local. Isto é uma solução observada neste ambiente, não uma garantia sobre futuras versões; respostas incompletas continuam recusadas. Não são registados prompts nem raciocínio do modelo.

## Reproduzir os ensaios

Parar primeiro o PULSO normal com Ctrl+C, para libertar a porta 8000. Na raiz:

```powershell
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/pytest-local-run
& 'C:\Program Files\nodejs\node.exe' --test tests/foundation.test.mjs
.\.venv\Scripts\python.exe scripts/benchmark_extraction.py --fixtures-only
```

O último comando só gera os documentos fictícios em `tmp/v04-benchmark`, sem inferência. Para medir a inferência real, abrir o Ollama e executar o mesmo comando sem `--fixtures-only`; grava `results.json`. Valores esperados são definidos no script antes da leitura. `--only photo tilted` limita os casos; por defeito substitui o relatório anterior. `--append-report` preserva os outros casos e substitui apenas os casos repetidos. O relatório inclui uma execução separada do parser antigo para comparar cobertura/tempo.

Em `apps/mobile`, com Node no PATH:

```powershell
npm.cmd run typecheck
npm.cmd test
npx.cmd expo export --platform web
npm.cmd run test:web
$env:PULSO_TEST_LOCAL_LLM='true'
npx.cmd playwright test local-live.spec.ts
Remove-Item Env:PULSO_TEST_LOCAL_LLM
```

Suite normal desativa inferência na sua API temporária, ensaiando contingência, parser e persistência. Os dois testes `local-live` são opcionais nessa suite e exigem execução separada explícita com Ollama real. Playwright gera fixtures, usa SQLite temporária, executa sequencialmente e não reutiliza a API normal. Não apaga a base `.local` do utilizador.

## Resultados executados neste computador

Arranque normal com `.\dev.cmd` também executado: frontend localhost:8081 respondeu HTTP 200; `/health` devolveu ok e `/demo/extraction/status` confirmou enabled/available, qwen3-vl:4b e Ollama 0.40.15. Serviços locais deixados em execução para abrir a aplicação. A base normal não foi reposta nem substituída pelas bases temporárias dos testes.

- TypeScript `typecheck`: aprovado; exportação web Expo: aprovada.
- Testes TypeScript: 20 aprovados. Cronologia, comparabilidade, unidades, isolamento, confirmação, correções, datas ausentes, valor ND explícito e preservação da evidência.
- Pytest API: 42 aprovados. Esquema/JSON inválido, truncamento, ferramentas recusadas, URL/modelo externos recusados, indisponibilidade, falha HTTP do motor, colunas trocadas, decimal/unidade/data, associação por página, imagem e limites; SQLite/original/hash, idempotência, correção/eliminação, isolamento, destaque recalculado e leitura por novo processo Python.
- Chromium normal: 11 aprovados; 2 testes reais de inferência omitidos intencionalmente nessa execução. Contingência com motor desligado, introdução manual de imagem, PDF conhecido, persistência, gráficos, falha de gravação sem perda, edição/eliminação, larguras 320/390/1100, tema e ampliação CSS 200%.
- Chromium com Ollama real: os 2 testes omitidos foram executados separadamente e passaram. PDF → modelo de texto → correção → confirmação → recarregar → ponto/proveniência/destaque; fotografia → visão → aviso de evidência não verificada → confirmação → gráfico/original.
- Fundação: 2 aprovados. Total de testes distintos aprovados: 77. Os ensaios de extração abaixo são adicionais, não incluídos nessa contagem.

Medição real do conjunto sintético, valores esperados definidos previamente. A coluna «corretos» compara parâmetro/valor original/unidade com o esperado (inclui um ND corretamente reconhecido como ausência). Não equivale a validação médica nem significa que todos tenham evidência textual independente.

| Caso | Corretos/esperados | Propostas extra | Datas divergentes/ausentes | Com problemas assinalados | Segundos |
|---|---:|---:|---:|---:|---:|
| Parser conhecido | 5/5 | 0 | 0 | 0 | 0,07 |
| PDF digital simples | 3/3 | 0 | 0 | 0 | 6,00 |
| Várias páginas | 6/6 | 0 | 0 | 0 | 11,54 |
| 15 parâmetros distintos | 15/15 | 0 | 0 | 0 | 27,17 |
| Segundo laboratório | 3/3 | 0 | 0 | 0 | 5,37 |
| Campos ausentes/ND | 1/1 | 0 | 0 | 1 | 2,13 |
| Instruções maliciosas | 3/3 | 0 | 0 | 0 | 5,86 |
| Fotografia simulada | 3/3 | 0 | 0 | 3 | 6,62 |
| Imagem inclinada 3° | 3/3 | 0 | 0 | 3 | 6,21 |
| PDF digitalizado | 3/3 | 0 | 0 | 3 | 5,91 |
| PDF misto | 8/8 | 0 | 0 | 3 | 5,72 |
| Unidades alternativas | 3/3 | 0 | 0 | 0 | 5,77 |
| Mesmos parâmetros em datas diferentes | 6/6 | 0 | 0 | 0 | 11,62 |
| Colunas próximas | 3/3 | 0 | 0 | 1 | 5,31 |
| 15 linhas densas, com parâmetros repetidos | 15/15 | 1 | 1 | 2 | 27,27 |

Total: 80 associações esperadas encontradas em 81 propostas, sem omissões nem trocas de valores/unidades nas 80 correspondências; uma proposta extra/não reconhecida e uma data não resolvida no caso denso. Sem páginas trocadas nos casos ensaiados. A métrica de data inclui nulo onde se esperava uma data; não se trata de uma data inventada aceite. 66 propostas com associação conferida por texto, 16 propostas com problemas assinalados; **todas as 81 exigem revisão humana**, mesmo sem problemas assinalados. Problemas podem sobrepor-se: essas contagens não são categorias exclusivas.

O caso denso foi conservado como regressão porque reproduz a proposta adicional e a data ausente. O validador mantém a proposta sinalizada; a interface exige associar/excluir e confirmar explicitamente. No caso de colunas próximas, uma associação correta no esperado não passou a verificação estrita do excerto e continuou sinalizada. Fotografias são renderizações de tabelas sintéticas, não fotografias de câmara reais.

Comparação limitada: parser anterior devolveu 5/5 no seu formato conhecido e só os 5 resultados de texto no PDF misto; o híbrido manteve esses 5 e propôs os outros 3 da página visual. Nos outros formatos, o parser antigo rejeita o layout/tipo. Isto demonstra cobertura adicional neste conjunto, não superioridade geral de precisão. O teste malicioso não gerou o valor inventado solicitado nem chamadas de ferramentas; não é uma prova universal contra prompt injection.

Avisos não bloqueantes: depreciações Starlette/httpx e PyMuPDF/ByteString, NO_COLOR/FORCE_COLOR. Sem atualização de dependências ou nova auditoria npm. Corrigidos durante desenvolvimento: consumo indevido de geração em raciocínio, PDF de teste digitalizado sem compressão acima de 2 MB e uma incompatibilidade `image_profile` do PyMuPDF instalado (substituída por metadados de imagem da página). Primeiro teste real após recarregar selecionava o perfil inicial errado; corrigido o teste, sem alterar a navegação da aplicação.

## Limitações restantes

Sem autenticação de produção: cabeçalho de perfil não prova identidade, embora o backend verifique âmbito e ligações. Sem encriptação de produção, avaliação legal/clínica, OCR independente ou integração institucional. Somente documentos sintéticos. Layouts, idiomas, baixa qualidade, tabelas partidas, rotação forte e manuscritos não estão validados. O modelo pode omitir/inventar/trocar campos; a interface exige conferência e conserva as propostas sinalizadas. Resultados desconhecidos requerem associação manual ao catálogo ou exclusão.

Não existe extração parcial persistida nem rascunho recuperável após fecho. Páginas falhadas podem ser completadas manualmente; repetir a leitura automática após editar exige começar uma nova seleção de forma explícita. Não se substituem propostas já corrigidas silenciosamente. Aplicação nativa Android/iOS, seletor/câmara nativos e teste físico continuam pendentes. Os ensaios pequenos não permitem concluir superioridade geral face ao parser anterior.

## Ficheiros deste incremento

Criados: `services/api/app/local_ollama.py` (adaptador), `hybrid.py` (pipeline/validação documental partilhada com introdução manual), `laboratory.py` (normalização), `packages/shared/laboratory.json`, `apps/mobile/src/clinical/DocumentImport.tsx`, `.env.example`, `scripts/benchmark_extraction.py`, testes `test_local_extraction.py`, `local-extraction.spec.ts`, `local-live.spec.ts` e este relatório.

Alterados: API `main.py`, `data_routes.py`, `store.py` e testes de PDF/persistência; frontend `App.tsx`, `Forms`, `PdfPicker.web`, `RecordViews`, `data`, `importData`, `repository`, testes de persistência/fluxos e configuração Playwright. `Forms` mantém tensão e encaminha importação para o componente único; a implementação anterior de importação foi removida para evitar duas versões. Atualizados os guias/README, PRD com nota de âmbito, arquitetura, segurança, decisões, validação e instruções de trabalho; capturas existentes dos gráficos foram regeneradas. Sem alterações de dependências, sem uma segunda base e sem publicação GitHub deste incremento.
