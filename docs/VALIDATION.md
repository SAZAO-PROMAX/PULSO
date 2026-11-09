# Reorientação web — revisão, composição e operação, 09/11/2026

Versão permanece 0.7.4. Base P0 `8ce706c`; commit desta atualização: `git log -1 -- docs/VALIDATION.md`. Sem backend/migração/dependência nova, Android ou interpretação de imagens clínicas. O mesmo Work recebeu contexto acessível de BrainStorm, feedback e checkpoints; identificou lacunas sem inspecionar diretamente o checkout.

| Verificação executada | Resultado observado |
|---|---|
| Typecheck e `npm.cmd test` em apps/mobile | Aprovados; 62 testes TS, repetidos após as últimas alterações |
| public-product + public-navigation-review com launcher real | 11 aprovados, 30,2 s; revisão por teclado, rascunhos/Voltar, edição invalida conferência, POST 503, commit + GET 503, perda da resposta após commit com repetição idempotente, PDF parser real, PNG manual, original, persistência, Hub e pesquisa |
| public-f-visual.spec.ts | 9 aprovados, 29,5 s; claro/escuro, Simples/Equilibrado, 390/1280, texto ampliado/foco |
| flows, local-extraction, catalogue, accounts | 8 aprovados; fluxos, catálogo de 19 parâmetros/origem, conta e fallback manual |
| public-compact-review.spec.ts com PULSO_G_PARAMETERS=25 | 1 aprovado, 24,3 s; 25 propostas controladas, edição/exclusão/rascunho/teclado, guarda real |
| Integração curta inicial do launcher | 1 aprovado, 8 s; prontidão API/web, estado e recusa de parar processo cuja identidade difere; teste posteriormente ampliado |
| Ensaio ampliado do launcher | **Em curso, não aprovado/concluído nesta atualização**: 2 horas solicitadas em tmp/product-stability.log, 8015/8085 e SQLite própria em tmp |
| Serviços habituais, apenas leitura | Web 8081 e health 8000: 200; entrada pública Chromium sem pageerror |

O ensaio em curso verifica HTTP a cada 30 s e escrita sintética/reabertura funcional a cada 10 min, com outra sessão recusada; não é carga. Falha se houver intervalo sem observação superior a 90 s. O log operacional não guarda cookies, credenciais ou conteúdo documental. Launcher regista saídas, espera pela interface e permite parar apenas a sessão identificada; não é serviço Windows/reinício automático nem prova da causa histórica das paragens.

Repetição (PowerShell, raiz; Node no PATH), apenas com portas livres e sem ensaio anterior ativo:

```powershell
$env:PULSO_STABILITY_SECONDS='7200'
node --test tests/dev-launcher.test.mjs *> tmp/product-stability.log
Remove-Item Env:PULSO_STABILITY_SECONDS
# Consultar sem encerrar o teste:
Get-Content tmp/product-stability.log -Tail 8
```

Para interromper a instância de ensaio, identificar o diretório tmp/launcher-test-* desta execução pelo respetivo console/log, definir PULSO_RUN_DIR para esse diretório e executar `.\dev.cmd --stop`; depois remover a variável. Não adivinhar PIDs/terminar outra instância. Interrupção não conta como aprovação de duas horas. Ao retomar, recolher o resultado antes de iniciar outro; sessão Codex 88638. Artefactos tmp não publicados.

Chromium: bases tmp, loopback 8014/8784; sustentado 8015/8085. Sem escritas/testes/reposições na base normal. Capturas 320/390/768/1280/1440/1920 sem overflow, navegação centrada verificada em desktop; capturas desktop/390 inspecionadas visualmente. Detalhado ensaiado na revisão densa, não em todos os cruzamentos. Movimento reduzido aprovado. Sem zoom real, leitor de ecrã, dispositivos físicos, inferência real ou validação clínica. PNG manual não prova reconhecimento de fotografia. Suite completa não repetida.

Avisos reais `Unexpected text node` reproduzidos em teste Metro no Hub/Histórico: espaço JSX solto no Card do Hub e condição de filtros devolvendo string vazia. Removido o espaço e convertida condição para booleano; teste de consola passou depois. Primeira tentativa de executar a suite antiga de navegação no Metro interrompida por hostname incompatível dos cookies (127.0.0.1 vs localhost); helper ajustado ao launcher e os 11 casos passaram. Logs tmp/product-console-before.log e product-metro-verified.log. A causa das paragens históricas não foi atribuída a esses avisos sem prova.

Sessão habitual anterior, criada por esta execução, encerrada pelo seu terminal e substituída por launcher independente atualizado; estado ready, API/web respondem. Nenhum processo desconhecido terminado nem reposição da base.

Pendências: extração real de fotografia; sessão expirada/conflitos não repetidos neste novo fluxo; página pública ainda não redesenhada; estabilidade de duas horas por concluir. Sem diagnóstico de radiografias. Gráfico com um único ponto mantém aviso de ausência de tendência. Unidades/métodos/amostras separados. Erro de foco do primeiro P0 corrigido e revisão densa repetida.

---

# Reorientação — checkpoint documental P0, 09/11/2026

Base5e7a4c2, versão0.7.4. Implementação: Conferi/Editar/Excluir diretamente na linha, origem/data/excerto próximos; pendências orientam revisão, guarda permanece explícita e bloqueada até conferência. Alterações materiais invalidam revisão. Confirmação API fornece destino evolução com IDs/parâmetros do documento, aguardando leitura da revisão atual. Falha dessa leitura informa que o exame ficou guardado e repete apenas GET. Documento sem resultados numéricos mantém detalhe; original/detalhe acessíveis na evolução. Corrigida disputa de foco shell/detalhe.

Executados62testesTypeScript e typecheck, aprovados. Chromium:10testes distintos na soma dos ficheiros public-product(2),public-navigation-review(7),public-compact-review(1); execução conjunta9aprovações/1falha de restituição de foco após nova ação inline, corrigida e caso compacto repetido/aprovado. Percursos novos cobrem teclado sem editor, correção, erro503na gravação, commit+erro503na leitura, ausência de duplicação, gráfico direto, detalhe/original e recarga. PDF usa parser determinístico real; PNG usa fallback manual real com inferência desligada, não prova extração visual nem OCR. Caso denso usa propostas controladas com guarda real. Logs tmp/product-{unit,p0,p0-regression,p0-dense}.log. API/backend/pipeline não alterados. Testes históricos adaptados ao acesso explícito ao detalhe, nem todos repetidos neste checkpoint. SQLite em tmp,loopback8014/8784,base normal sem testes/reposições. Sem suite completa,carga,GPU ouAndroid.

Ainda pendentes: composição visual, lifecycle e ensaio de estabilidade de2horas. Não declarar transformação inteira concluída com este checkpoint. Cooperação Work: recebeu o resumo acessível de BrainStorm e reviu sequência/aceitação; não inspecionou diretamente checkout/vídeo.

---

# Pós-entrega v0.7.4 — recuperação web e diagnóstico Android, 09/11/2026

Sem mudança de versão ou autenticação. **1 percurso Playwright de PDF autenticado aprovado** com launcher/base temporária; página pública normal carregada em Chromium com zero pageerror. **2 API direcionados aprovados**, 13 não selecionados (isolamento/CSRF/revogação e diagnóstico sem Origin), em tmp. Emulador Android16/API36 com ExpoGo57.0.9: página pública PULSO abriu, canal local respondeu200, tentativa de login mostrou403/Origin e não abriu Hub privado. Não é aprovação da autenticação nativa, nem build própria, teste físico, câmara/PDF privado ou suite completa. Ollama/carga não executados. Ferramentas, comandos, proposta de contrato e ponto de continuação em [MOBILE_VALIDATION.md](MOBILE_VALIDATION.md). Artefactos locais em tmp; base normal sem testes/reposições.

---

# v0.7.4 — G: validação integrada e encerramento web, 09/11/2026

Base `6285136`; versão Expo/frontend/API passa a **0.7.4 experimental** após resolver as regressões abaixo. Commit correspondente: `git log -1 -- docs/VALIDATION.md`. Sem nova dependência, migração, cloud, inferência real ou ensaio de carga. Base normal intacta: bases SQLite de ensaio em `tmp`, serviços em loopback 8014/8784; arranque habitual isolado em 8000/8081.

## Resultados realmente executados

| Verificação | Resultado final observado |
|---|---|
| API completa | 110 aprovados; 2 avisos de depreciação PyMuPDF/Starlette |
| TypeScript | 62 aprovados |
| Estrutura | 2 aprovados |
| Chromium demonstrativo isolado | 36 testes distintos aprovados após correções/repetições direcionadas; 2 opcionais de inferência real omitidos |
| Chromium entrada pública/autenticada | 28 testes distintos aprovados após repetição do percurso compacto; cada ficheiro em base própria, respeitando limites de registo |
| Revisão com 25 resultados | 1 configuração adicional aprovada; 25 persistidos, repetidos legítimos em segunda data/página e método/amostra distintos |
| Arranque habitual + PDF autenticado | 1 configuração adicional aprovada por `scripts/dev.mjs`, API 8000/Expo 8081, base temporária e Ollama desligado |
| Typecheck final / pip check | aprovados / nenhuma dependência quebrada |
| Exportação web | aprovada pelos arranques Playwright com `expo export --platform web --clear` |

Não somar repetições como novos testes distintos. A primeira execução geral demonstrativa teve 25 aprovações, 11 falhas e 2 omissões. Após adaptações e correções, repetiram-se apenas os ficheiros afetados: 9/14, depois 8/9; a falha restante manual foi resolvida e passou isoladamente. O público passou por ficheiro: 27 aprovações iniciais e uma falha na expectativa do teste após logout; caso compacto corrigido passou novamente com 15 e com 25. Navegação com texto ampliado passou novamente após o ajuste final 3+2.

Logs locais ignorados pelo Git: `tmp/v074-g-{api,unit,foundation,pip,typecheck-final,demo,demo-corrections,demo-final,local-pass,15-final,25-final,nav-final,launcher}.log`, `tmp/g-public-*.log`. Capturas `tmp/g-nav-*.png` e capturas visuais F; artefactos temporários não são entregues no commit.

## Problemas encontrados e corrigidos

- Perfil: a lista de vistas admitidas pela shell excluía vistas de acesso do percurso demonstrativo; reposta a união existente sem modificar SessionGate/autorização. Duas mudanças de contexto no mesmo evento usavam o valor anterior: referência corrente evita ignorar a segunda. Abertura de Preferências e percursos existentes voltaram a passar.
- Histórico: ação explícita de abrir a raiz podia restaurar o detalhe anterior; limpa apenas identificadores de seleção nessa nova entrada do histórico. Preserva o percurso anterior para Voltar e a proteção de alterações pendentes. Percursos B3, registos, documentos e gráficos aprovados.
- Navegação: Perfil podia ficar sozinho na segunda linha por distribuição variável. Cinco destinos recebem largura previsível; 320/390, três modos e texto normal/muito grande verificados. Texto normal numa linha, muito grande em 3+2 intencional, alvos >=44 px e sem overflow horizontal. Captura final Simples/muito grande/320 inspecionada: rótulos legíveis, sem fragmentar palavras.
- Resumo: substituído “0 exigem atenção” por contagens independentes de propostas, por rever, revistos, avisos e excluídos. Ausência de aviso não representa revisão.
- Testes históricos: portas fixas 8000 ignoravam configuração isolada; agora respeitam PULSO_TEST_API_PORT. Campos de data HTML recebem ISO. Testes abrem o editor compacto em vez de exigir todos os campos permanentes. Guarda não revista continua bloqueada: teste manual verifica botão desativado, sem forçar clique. Sem remoção de testes úteis nem relaxamento das guardas do servidor.

## Percurso documental / PDF difícil

PDF conhecido: extração determinística real, correção, revisão deliberada, confirmação, original, detalhe, histórico, gráfico, recarga e proveniência. Imagem com motor desligado: introdução manual, revisão e persistência aprovadas. Segurança exercitada na API e browser: sessão/expiração, Origin/CSRF, contas diferentes, If-Match/conflitos, limites/recusas da fila, documento inválido e dados não confirmados. Sem alegar autenticação por perfil demo.

Revisão densa: fixture controlada de 15 resultados + extra incompleta, e configuração de 25 + extra. Seleção por teclado, edição de valor/unidade/data, exclusão da extra, data HDL ausente, evidência rejeitada preservada, avisos e confirmação explícita; falha sintética 503 conserva revisão, repetição guarda sem duplicar; histórico/gráfico, logout/login e persistência aprovados. Os 25 incluem 10 medições adicionais em outra data/página, método/amostra de glicose distintos; não se fundem séries incompatíveis. O transporte das propostas é controlado, a confirmação/persistência usa a API real isolada. Isto não mede a precisão de Ollama em PDFs densos.

Regressões de fidelidade de D estão incluídas nos 110 testes API. Não atribuir retrospetivamente uma causa exata ao HDL histórico: formato bruto proposto não conservado; extra histórica sem origem demonstrável. Não copiar datas por proximidade nem inventar valores. Benchmark histórico e ground truth não foram alterados. Sem novo ensaio GPU; 14 propostas historicamente sem conferência textual continuam uma limitação, não aprovações clínicas.

## Repetir em PowerShell (raiz do projeto)

```powershell
.venv/Scripts/python.exe -m pytest services/api/tests -q --basetemp=tmp/pytest-v074-g
npm.cmd test --prefix apps/mobile
node --test tests/foundation.test.mjs
npm.cmd run typecheck --prefix apps/mobile
.venv/Scripts/python.exe -m pip check
$env:PULSO_TEST_LOCAL_LLM='false'
$env:PULSO_TEST_LAUNCHER='false'
$env:PULSO_TEST_API_PORT='8014'
$env:PULSO_TEST_WEB_PORT='8784'
$env:PULSO_TEST_PUBLIC='false'
Push-Location apps/mobile
npx.cmd playwright test --reporter=line
$env:PULSO_TEST_PUBLIC='true'
# Cada ficheiro inicia uma instância isolada; não contornar limites de registo.
Get-ChildItem e2e/public-*.spec.ts | ForEach-Object { npx.cmd playwright test $_.Name --reporter=line; if ($LASTEXITCODE -ne 0) { throw 'Teste público falhou' } }
$env:PULSO_G_PARAMETERS='25'
npx.cmd playwright test public-compact-review.spec.ts --reporter=line
Remove-Item Env:PULSO_G_PARAMETERS
Pop-Location
node scripts/dev.mjs --check
# Só com 8000/8081 livres; o config fornece DB temporária ao launcher.
$env:PULSO_TEST_LAUNCHER='true'
$env:PULSO_TEST_API_PORT='8000'
$env:PULSO_TEST_WEB_PORT='8081'
$env:EXPO_PUBLIC_API_URL='http://localhost:8000'
Push-Location apps/mobile
npx.cmd playwright test public-entry.spec.ts --grep 'conta autenticada importa PDF' --reporter=line
Pop-Location
Remove-Item Env:PULSO_TEST_LAUNCHER
```

Os comandos da suite demonstrativa omitem os dois testes reais quando PULSO_TEST_LOCAL_LLM não está ativado; manter Ollama desligado nesta reprodução. Ctrl+C interrompe o comando e respetivos servidores de teste; nunca terminar processos desconhecidos. Não definir DB normal para testes. PATH deve incluir Node.js instalado, conforme GUIA_WINDOWS.md. Os logs listados documentam os comandos realmente executados, incluindo repetições, não uma execução única perfeita.

## Limites / encerramento

Web Chromium local aprovada no âmbito ensaiado; larguras 320,390,768,1100,1280, temas e três modos incluídos. Texto ampliado pela preferência e ampliação CSS histórica não equivalem a zoom real. Sem leitor de ecrã, teste humano, certificação WCAG, dispositivo/emulador Android/iOS, inferência GPU, carga ou validação clínica. A fila continua volátil, e-mail de desenvolvimento, dados exclusivamente fictícios. Versão encerrada para desenvolvimento experimental web; não preparada para dados médicos reais ou distribuição clínica. Próximas prioridades em PROJECT_STATUS.md. Relatórios A–F abaixo conservados como histórico; os estados “em curso” nesses blocos referem-se às respetivas datas/checkpoints.

---

# v0.7.4 — F: refinamento visual, 09/11/2026

Base 99f2b26. **13 TypeScript e 13 Chromium distintos aprovados**, typecheck/exportação web aprovados. TypeScript: reviewState/persistence/experience (incluindo contraste ink/muted em soft, além dos pares anteriores). Chromium: oito combinações do percurso visual, um ensaio de texto muito grande/foco, três de câmara e um de revisão compacta. Antes: mesmos oito percursos em base temporária, não somados como aprovações adicionais. Logs tmp/v074-f-{before,after-final,extra,regression-final,unit-final}.log. Sem suite completa, carga, GPU, inferência real, alteração à base normal ou nova dependência.

## Comparação e alterações

56 capturas antes + 56 depois: Registar, seleção, preview de câmara sintética, revisão, edição, confirmação e detalhe guardado; 390/1280 px × claro/escuro × Simples/Equilibrado. Mesmo PDF de cinco resultados e nome fictício; IDs/e-mails de teste e instante de importação diferem, portanto não se trata de comparação pixel a pixel. Base antes capturada antes de alterar produto; PULSO_VISUAL_PHASE apenas rotula capturas, não restaura uma revisão Git.

Revistos visualmente os sete pares mobile Simples/claro, revisão desktop Equilibrado/escuro e texto muito grande. Comparações locais: tmp/v074-f-comparison-final-{390,1280}.pdf; capturas v074-f-before/after-*.png. Não adicionar esses documentos/imagens ao Git.

- Registar: retirados contornos e emoji decorativo; superfícies/títulos distinguem câmara, ficheiro e medição. Mesmas ações e callbacks.
- Seleção/câmara: contornos reservados ao alvo de ficheiro; superfícies mais leves e mesma conferência de qualidade. Sem nova animação.
- Etapas Documento/Preparar/Rever/Guardar derivadas de busy/parsed/guarda existente. Rótulos e marcas textuais, sem depender só de cor. Teste segura o transporte real antes de o continuar e verifica Etapa 1 → Etapa 2; a revisão aparece após resposta. Guardado só no destino já existente após confirmação da API. Preparar não declara uma extração automática concluída nos casos manuais.
- Revisão: valores com maior hierarquia, estados textuais discretos, ações Editar sem caixa, resultado selecionado com superfície/faixa e edição contextual. Resumo e confirmação numa superfície dedicada. Mobile: original com acesso curto; desktop: DocumentView abre texto original por defeito em coluna adjacente, preservando abrir PDF original. Não existe novo motor/iframe PDF.
- DocumentView reutilizado com initialOpen opcional (falso fora da revisão desktop), botão de texto e texto original na escala secundária. Detalhe guardado também foi capturado/verificado. ui.tsx, tokens, fontes e Hub não foram alterados.

## Ensaios e limites

public-f-visual: modo Simples/Equilibrado, temas/larguras acima, movimento reduzido, guardar/detalhe reais em API 8014 e SQLite nova em tmp. Texto extra a 390 escuro: campos ≥24 px, foco com outline ≥3 px, Tab/Shift+Tab, Enter, Escape e restituição do foco aprovados. public-compact-review: Detalhado além dos modos anteriores, 15 parâmetros + extra, teclado, recarga, falha/repetição, exclusão, proveniência e logout. public-camera: permissões recusadas/ausentes e captura/repetição aceites só após conferência. Não há alteração de regras clínicas/permissões por modo.

Problemas visíveis restantes: percurso com muitos resultados exige scroll vertical; editor conserva metadados extensos; PDF abre no visualizador existente em vez de renderização integrada; texto muito grande ocupa mais altura e pode envolver a navegação em duas linhas, sem overflow horizontal observado. Sem zoom real, leitor de ecrã, teste humano, Android/iOS físico/emulador ou certificação WCAG. Contraste calculado é evidência limitada aos pares testados, não auditoria completa. G não iniciado e versão executável continua 0.7.3.

Repetir com Node no PATH: `npx.cmd --prefix apps/mobile tsx --test apps/mobile/tests/reviewState.test.ts apps/mobile/tests/persistence.test.ts apps/mobile/tests/experience.test.ts` e `npm.cmd run typecheck --prefix apps/mobile`. Em apps/mobile, usar configuração isolada PULSO_TEST_PUBLIC=true, PULSO_TEST_API_PORT=8014, PULSO_TEST_WEB_PORT=8784, EXPO_PUBLIC_API_URL=http://127.0.0.1:8014; executar `npx.cmd playwright test public-f-visual.spec.ts --reporter=line`, depois `npx.cmd playwright test public-compact-review.spec.ts public-camera.spec.ts --reporter=line`. Cada lote usa base nova para respeitar limites de registo. Não executar todos juntos nem reutilizar a base normal.

---

# v0.7.4 — E: confirmações e continuidade, 09/11/2026

Base f62515c. **12 TypeScript e 6 Chromium direcionados aprovados**, typecheck/exportação web aprovados. Logs tmp/v074-e-unit.log, tmp/v074-e-final.log e repetição específica tmp/v074-e-cancel-final.log (mesmo percurso, não um sétimo teste distinto). SQLite temporária, API 8014/web 8784, só contas/PDF/fotografias sintéticos. Sem suite completa, API completa, inferência Ollama, carga ou GPU. Backend/pipeline D, autenticação, Origin/CSRF/If-Match e base normal inalterados.

## Auditoria direcionada

| Interação | Classe | Decisão |
|---|---|---|
| Permissão de câmara/diálogo de ficheiro do sistema | A — sistema | Manter. Câmara só por ação explícita. Nativo consulta estado antes de pedir, sem repetir pedido se concedido; não ensaiado fisicamente. |
| Conferir qualidade e aceitar fotografia | C — revisão | Manter numa ação explícita: Conferi a qualidade — usar fotografia. Enquadramento, texto completo, orientação/reflexos/legibilidade continuam instruídos; não há validação automática. |
| Marcação de qualidade seguida de outro clique para aceitar a mesma foto | D — repetição | Reunir as duas ações na declaração/aceitação acima, conservando a conferência. |
| Marcar resultado revisto + fechar manualmente o editor | C + D | Revisão individual mantida; fecho adicional removido após validação da linha. Erro mantém o editor, sem marcar revisto. Excluir também regressa à lista. |
| Confirmar e guardar o conjunto revisto | C — revisão | Manter uma ação final explícita, resumo dos incluídos/revistos/excluídos/por rever/com avisos. Sem confirmação automática. |
| Perda real de rascunho, cancelamento, recarga | B — dados | Manter/reutilizar descarte. Corrigido Cancelar seleção quando já há revisão, que antes podia apagá-la diretamente. Sem aviso em formulário vazio. |
| Eliminação de exame/medição/acontecimento | B — irreversível | Manter os controlos existentes; não foram alterados nem revalidados neste bloco. |
| Conflito de versão, sessão/autorização e informação incompleta | B/C — integridade | Manter regras e avisos; nenhuma flexibilização. |

O fluxo fica: abrir câmara explicitamente → fotografar → conferir e usar (ou repetir) → classificar → processar → rever/corrigir cada linha → confirmação final → detalhe após sucesso real da API. Ficheiro existente segue classificação/importação sem diálogo adicional de aceitação. O editor fecha após revisão válida, com foco restituído à linha; a guarda só é feita a partir da lista. Cancelar a importação com revisão pede descarte e volta às categorias; Escape conserva rascunho. Mensagens de qualidade mais curtas e alternativa web Importar ficheiro.

## Ensaios executados

- reviewState.test.ts + persistence.test.ts: 12 aprovados; validação, evidência, exclusão, duplicações/métodos e falhas/versões mantidos.
- public-camera: três percursos — foto/repetição/qualidade/ECG sem extração; permissão recusada e API ausente com alternativa. A fotografia não é aceite antes da ação explícita, streams encerradas e contexto/foco mantidos.
- public-compact-review: proposta controlada com 15 parâmetros + extra. Unidade inválida recusa marcação/fecho; correção, revisão e exclusão explícitas, teclado completo, Voltar/Avançar, modos/temas, original/proveniência, logout. Falha 503 de gravação preserva marcas/valores; repetição grava exatamente um exame e 15 resultados. Cancelar seleção processada e Cancelar importação apresentam proteção; Escape conserva 16 propostas.
- public-entry: apenas PDF conhecido autenticado, parser determinístico real, revisão/guarda/detalhe/gráfico; outro perfil recusado.
- public-navigation-review: apenas formulário vazio muda de tipo sem diálogo e tensão conserva rascunho ao voltar.

Comandos: Node no PATH; `npx.cmd --prefix apps/mobile tsx --test apps/mobile/tests/reviewState.test.ts apps/mobile/tests/persistence.test.ts` e `npm.cmd run typecheck --prefix apps/mobile`. Em apps/mobile, com variáveis de teste isoladas documentadas abaixo: `npx.cmd playwright test public-camera.spec.ts public-compact-review.spec.ts public-entry.spec.ts public-navigation-review.spec.ts --grep "câmara |quinze resultados|conta autenticada importa PDF|formulário vazio" --reporter=line`.

Limites: não houve ensaio físico/emulador Android/iOS, leitor de ecrã ou zoom real. Eliminações/conflictos não foram alterados; não declarar regressão completa de segurança. Permissões do navegador permanecem a cargo do navegador. Versão executável 0.7.3; F/G não iniciados.

---

# v0.7.4 — D: fidelidade documental, 09/11/2026

Base 9740621. **46 API + 12 TypeScript + 1 Chromium aprovados**, typecheck/exportação web aprovados. Sem inferência real, GPU, carga ou suite completa. Logs tmp/v074-d-api-final.log, tmp/v074-d-unit-final.log e tmp/v074-d-browser-final.log. Primeira execução API restrita não produziu resultado e foi interrompida; execução autorizada concluiu em base temporária. Avisos PyMuPDF/Starlette já conhecidos.

## Investigação histórica, sem confundir com nova extração

Inspecionados tmp/v073-doc-repeat/fifteen_rows.pdf e results.json. PDF/texto independente contêm Data do relatorio: 2026-11-08 e Colesterol HDL | 52 | mg/dL | referencia ficticia | direto | plasma. A observação histórica HDL tem data nula e aviso Data ausente, inválida ou sem evidência, emitido pelo validador quando recebe uma data proposta não suportada. Isto localiza a rejeição na normalização/validação, antes do frontend. O JSON bruto anterior ao validador não foi guardado: não é possível recuperar o literal, nem decidir entre formato inválido e data sem correspondência textual. A regressão reproduz essa classe com 2026-11-080; **não se afirma que foi esse literal histórico**. A data não foi preenchida automaticamente.

A extra histórica tem parâmetro normalizado nulo, valor vazio, unidade não reconhecida e revisão necessária. O artefacto não contém nome/excerto bruto suficiente para decidir entre cabeçalho, desconhecido ou linha incompleta. Não foi inventado número nem analito. Conserva-se proposta na revisão para correção/exclusão e original intacto. Nos 14 casos históricos sem conferência textual, 12 eram visuais e dois eram HDL/extra; ausência de verificação não demonstra erro de valor. Os totais v0.7.3 permanecem históricos.

## Correções e regressões desta execução

- Testes date_supported demonstram aceitação indevida anterior de prefixo de data e data existente noutra linha de página com duas datas. Agora exige token e uma única data na página, ou data no excerto exato e único da própria linha. Sem datas inventadas/associação por proximidade. Política conservadora pode exigir mais revisão em relatórios com várias datas legítimas.
- Excertos textuais repetidos não são prova de ocorrência única; mantêm valor/unidade originais e ficam source_unverified. Visão continua visual_unverified, sem OCR independente. Verificação textual refere-se à associação nome/valor/unidade; não certifica todos os metadados.
- Método direto encontrado apenas dentro de indireto era aceite por substring; agora exige fronteiras textuais. Método/amostra propostos continuam em sourceFields mesmo se normalização os rejeitar. sourceFields contém os campos apresentados ao validador, incluindo o fallback de página já existente; não é cópia integral do JSON bruto nem prova de origem documental.
- confirmRows distingue métodos/amostras ao verificar duplicações. Repetição exata continua bloqueada; dois métodos explicitamente revistos geram duas séries, sem conversões. Unknown/ND/unidade incompatível/cabeçalho/extra vazio permanecem propostas pendentes, não medições automáticas.
- Integração C: três rótulos de evidência e Data por confirmar; campos propostos detalhados no painel. Teste controlado persiste sourceFields.reportDate rejeitada, mantém extractedDate nula e data corrigida separada, guarda 15 linhas revistas excluindo extra e mantém SHA do original/histórico/gráfico. Propostas controladas não são nova inferência.

Comandos na raiz, Node no PATH:

```powershell
.venv/Scripts/python.exe -m pytest services/api/tests/test_document_fidelity.py services/api/tests/test_local_extraction.py services/api/tests/test_store.py -q --basetemp=tmp/pytest-v074-d-repeticao
npx.cmd --prefix apps/mobile tsx --test apps/mobile/tests/reviewState.test.ts apps/mobile/tests/persistence.test.ts
npm.cmd run typecheck --prefix apps/mobile
```

Chromium: apenas public-compact-review.spec.ts, com configuração loopback 8784/8014 e SQLite em tmp documentada em C abaixo. Não alterados ground truth, limites de GPU/fila, modelos, autenticação, CSRF/Origin ou versões If-Match. Sem migração nem alteração à base normal. Parser de validação identificado por pulso-hybrid-0.4-d1; aplicação/API continuam 0.7.3. Sem Android/iOS, validação clínica, OCR independente ou promessa de precisão universal. E/F/G não iniciados.

---

# v0.7.4 — C: revisão compacta, 09/11/2026

Base 7c11026. **11 testes TypeScript direcionados e 2 percursos Chromium aprovados**, typecheck/exportação web aprovados. Logs tmp/v074-c-unit-final.log, tmp/v074-c-final.log e repetição específica com Voltar/Avançar em tmp/v074-c-navigation-final.log. Nenhuma suite completa, carga, 1.000 contas, inferência Ollama, benchmark GPU ou teste API completo executado. A API real de teste usa SQLite nova em tmp e loopback 8014/web 8784; base normal preservada.

- `reviewState.test.ts` e `persistence.test.ts`: estados visuais não contornam confirmRows, ausências/evidência continuam explícitas, confirmação/correção/original/versões/falhas mantidos.
- `public-compact-review.spec.ts`: PDF sintético de 15 analitos do gerador existente; propostas controladas no transporte de extração, com HDL sem data e uma extra não mapeada/sem valor. Não é inferência nem avaliação da extração. Quinze resultados/valores/unidades apresentados e zero campos individuais abertos inicialmente. Edição contextual por teclado corrige valor/unidade e data; Escape devolve foco; Voltar/Avançar e categorias conservam correções sem reextração. Guardar sem revisão é recusado; após revisão individual e exclusão da extra, a API persiste 15 resultados e um original com SHA correto. Data original nula do HDL fica na evidência, data corrigida no resultado. Histórico/gráfico/recarga aprovados; guardar limpa rascunho e logout remove novo rascunho privado.
- Regressão autenticada do PDF conhecido em `public-entry.spec.ts` adaptada ao editor contextual e executada isoladamente: parser determinístico real, revisão explícita, guarda/detalhe/gráfico. Nenhum motor LLM chamado.
- Layout em 320/390/768/1100/1280; Simples/Equilibrado/Detalhado, claro/escuro em 390/1280. Aguarda estabilização da viewport antes de medir; uma leitura imediata captou o layout anterior da navegação. No modo Detalhado existem vários painéis de gráfico: a asserção passou a selecionar o primeiro, correspondente à glicose, sem alterar gráficos.

Comparação visual feita com captura histórica A (cinco resultados, 35 campos permanentes) e capturas C (15 parâmetros + extra, lista sem campos abertos), sem repetir A nem alegar ensaio humano ou corpus visual idêntico. Revistas capturas 390 claro, Simples escuro 390 e Detalhado claro 1280; artefactos tmp/v074-c-*.png não publicados. Original reutiliza DocumentView e abertura privada existente; não há novo motor PDF/iframe. Metadados/evidência e regras de confirmação/persistência não foram removidos.

Limites: Android/iOS, leitor de ecrã e zoom real não ensaiados. Testes históricos que pressupõem o formulário extenso (por exemplo a reprodução dos 35 campos) não foram todos adaptados/executados; ficam para a regressão geral G. Não declarar a suite completa aprovada. D não iniciado e pipeline de extração não alterado. Versão executável permanece 0.7.3.

Repetir na raiz (Node no PATH):

```powershell
npx.cmd --prefix apps/mobile tsx --test apps/mobile/tests/reviewState.test.ts apps/mobile/tests/persistence.test.ts
npm.cmd run typecheck --prefix apps/mobile
```

Em apps/mobile, num terminal de testes com PULSO_TEST_PUBLIC=true, PULSO_TEST_API_PORT=8014, PULSO_TEST_WEB_PORT=8784 e EXPO_PUBLIC_API_URL=http://127.0.0.1:8014:
`npx.cmd playwright test public-compact-review.spec.ts public-entry.spec.ts --grep "quinze resultados|conta autenticada importa PDF" --reporter=line`.
Fechar esse terminal antes do arranque normal, para não herdar variáveis de teste.

---

# v0.7.4 — B3, 09/11/2026

Base e0bc5c2. Typecheck aprovado. Apenas `public-b3.spec.ts` executado: **1 percurso integrado Chromium aprovado**, log tmp/v074-b3-final.log. Conta inteiramente sintética, SQLite nova em tmp, API 8014/web 8784. Sem repetição de A/B1/B2, suite completa, carga, API completa ou inferência Ollama. Exportação web necessária ao Playwright passou. Base normal não foi utilizada pelos testes.

Verificações: cancelar saída do Perfil conserva nome; aceitar descarte permite sair. Acontecimento novo/edição conserva campos ao recusar cancelamento/navegação e só guarda após confirmação existente. Artigo volta à biblioteca pelo navegador. Medição editada conserva valor ao recusar Voltar (interno e navegador); cancelar com descarte permite voltar à lista. Edição de título do exame permanece ao recusar saída e pode ser descartada. Detalhes de medição/exame regressam à lista com Voltar do navegador. O primeiro ensaio encontrou um contexto nulo confundido com contexto ausente; corrigido e repetido. O regresso do resultado ao exame de origem está implementado; esse ramo específico não foi exercitado por este PDF guardado sem resultados.

Infraestrutura partilhada editNavigation: baseline em memória por editor, diálogo nativo do navegador, aviso beforeunload, proteção de hash/popstate e contexto composto só de identificadores. Nenhum campo médico/password/rascunho é gravado no histórico do navegador. Sem alterações à API, autenticação, autorização, CSRF, If-Match ou pipeline documental. C e seguintes não foram alterados.

Limites: não houve dispositivo/emulador, leitor de ecrã, zoom real nem auditoria de todos os controlos. Nativo pede guardar/cancelar antes da saída global; cancelamento local preparado com Alert, sem teste físico. Sem URLs individuais partilháveis. Relatório não declara validação clínica. Repetir em apps/mobile com as portas/variáveis isoladas documentadas abaixo: `npx.cmd playwright test public-b3.spec.ts --reporter=line`.

---

# v0.7.4 em curso — B2: navegação de Registar, 09/11/2026

Base `3ef956c`. **59 TypeScript e 16 Chromium aprovados, zero falhas esperadas neste lote.** Typecheck/exportação web aprovados. Logs tmp/v074-b2-unit.log e tmp/v074-block-b2-public.log; repetição final direcionada em tmp/v074-block-b2-final.log. O primeiro ensaio do cancelamento de recarga esperava uma navegação que tinha sido cancelada; o rascunho permanecia no snapshot. O teste passou a limitar essa espera a três segundos e verificar explicitamente o campo preservado.

- Rotas de Registar só aceitam passos/categorias/tipos explícitos do catálogo. Rejeitam parâmetros desconhecidos, tipos planeados, travessias e URLs externas. Sem dados/nomes documentais no URL. A mesma autenticação protege ligações diretas.
- Voltar/Avançar do navegador conserva o formulário e o documento. Ir a Histórico/Início e regressar retoma o rascunho, sem confirmar ou reextrair. Um componente de registo fica montado dentro da Shell da conta; é desmontado ao terminar sessão/mudar de dono. Não há armazenamento de rascunhos em disco ou localStorage.
- Aviso beforeunload existe apenas com documento/fotografia/alterações por guardar. Cancelar a recarga conserva os campos; terminar sessão limpa a memória privada e Voltar não revela o documento. A recarga aceite continua a perder o rascunho, por decisão explícita no aviso do navegador.
- Câmara sintética: pré-visualização mantida entre separadores; streams encerradas quando a câmara fica oculta. Reabrir exige ação para ligar novamente vídeo. Permissão apenas por ação explícita; qualidade da fotografia e confirmação humana dos resultados mantidas.
- Chromium completo conserva as regressões de autenticação, permissões recusadas, importação, persistência, três modos e layouts. A versão executável continua 0.7.3 até acabar o sprint; não se declara uma v0.7.4 completa.

**Limites:** B2 cobre Registar na web, não todo o bloco B. B3 deverá tratar detalhes/artigos/acontecimentos/perfil e proteção de edições fora de Registar antes de iniciar C. BackHandler Android foi acrescentado em código; sem dispositivo/emulador, sem alegar gestos iOS verificados. Backend/pipeline/SQLite não foram alterados; não se repetiram API completa, Ollama real, carga ou 1.000 contas. Caso difícil HDL continua pendente de D.

Repetir a suite pública com as variáveis/portas do comando A abaixo: `npx.cmd playwright test --reporter=line`. Usar um terminal reservado aos testes e fechá-lo antes do arranque normal para não herdar EXPO_PUBLIC_API_URL de teste. A base normal/serviços existentes foram preservados. Artefactos permanecem em tmp, fora do Git.

---

# v0.7.4 em curso — bloco B1, 09/11/2026

Checkpoint anterior A: `8f33c82`. B1 corrige a navegação **dentro de Registar**, não todo o bloco B. Versão executável mantém 0.7.3 até conclusão da v0.7.4.

Antes/depois reproduzido: a escolha de categoria perdia foco; agora foca o título de tipos e depois o formulário. Voltar desmontava o formulário e apagava seleção/correções; agora mantém uma única instância oculta em memória, retoma sem reextrair e nunca grava automaticamente. Cabeçalhos/Voltar usam foco e seta com nome acessível. Tensão usa a mesma preservação local. Trocar de tipo/câmara/acontecimento com um rascunho exige descartar explicitamente; formulário vazio não exige confirmação. Escape fecha o diálogo e restitui foco; Continuar a editar reabre o formulário. Não foram retiradas confirmações de resultados, qualidade da fotografia, permissões de câmara ou eliminações.

A revisão ainda tem os mesmos 35 campos para cinco resultados: **bloco C não iniciado**. Pipeline e regras de confirmação não foram alterados. O caso difícil HDL/data/proposta extra não foi repetido nem declarado corrigido. B2 continua necessário para Voltar/Avançar global, proteção ao sair pela navegação principal/recarregar e outros detalhes/artigos. Uma falha esperada explícita mantém a reprodução do histórico do navegador; não a contar como funcionalidade aprovada.

Testes desta etapa:

- `npm.cmd test --prefix apps/mobile`: 58 aprovados, tmp/v074-unit.log. Typecheck aprovado depois das alterações finais. Exportação web executada pela suite Chromium.
- Novo ficheiro percorre Tab/Shift+Tab, Enter/Espaço, seletor de ficheiro ativado por Enter (ficheiro fornecido ao evento Playwright, sem automatizar o diálogo nativo do Windows), correção/revisão deliberada de cinco linhas, gravação única, detalhe/gráfico e persistência após recarga. Sem cliques nem focus() nesse percurso integral. Outros cenários usam fill() para preparar dados e não são declarados integralmente por teclado.
- Rascunho conserva nome/ficheiro, valor corrigido e marca de revisão; contador confirma uma só extração e zero gravações ao voltar. Tensão conserva valor. Campo de texto + Enter não confirma resultados; guardar sem revisão é bloqueado antes de enviar POST.
- Diálogo em 320/390/768/1100/1280 px sem overflow horizontal observado; capturas tmp/v074-draft-dialog-{390,1280}.png, 390 revista visualmente. Sem ensaio de zoom real/texto ampliado do novo diálogo, leitor de ecrã ou Android/iOS.
- Regressões existentes de câmara, seletor, autenticação/recusa de cookie, sessão expirada, guarda/detalhe/evolução e três modos foram repetidas em bases temporárias. Ficheiros public-* agora respeitam a porta API de teste.

Ocorrências durante B1: o primeiro ensaio encontrou foco perdido após descarte e depois interferência no retorno da câmara; ambos corrigidos e repetidos. Um lote inicial de 15 cenários excedeu o limite normal de criação de contas. Não se alterou a aplicação/limite: o novo ficheiro usa uma conta sintética, sessões separadas e só o último percurso guarda resultados; a suite completa fica no limite existente de dez registos. Nenhuma limpeza da base normal ou pedido de escrita nela.

Comando completo, na mesma configuração PowerShell de A abaixo: `npx.cmd playwright test --reporter=line`. Artefactos ficam em tmp; não publicar capturas/documentos/bases. **Resultado final:** 15 cenários Chromium aprovados e uma falha esperada do histórico do navegador (Playwright apresenta 16 passed por incluir essa falha esperada); 58 TypeScript aprovados, total de 73 aprovações reais. Log tmp/v074-block-b1-public.log. Sem testes API completos repetidos porque o backend não foi alterado; a regressão Chromium usa API real isolada. Sem inferência real, carga, 1.000 contas ou alterações a modelos/SQLite.

---

# v0.7.4 em curso — bloco A, 09/11/2026

Base: `1c6e0cc`. Inspeção da documentação, DocumentImport/RegisterHub, rotas/Shell, controlos, modal educativo e hybrid concluída. Sem gravação do utilizador disponível/analisada; reprodução baseada no pedido escrito.

Ensaio Chromium autenticado, contas sintéticas, SQLite nova em tmp, web 8784/API 8014, Ollama desligado. Instância normal 8081/8000 mantida. A configuração Playwright aceita PULSO_TEST_WEB_PORT/PULSO_TEST_API_PORT; exportação com cache renovada para não reutilizar a URL da API de outra execução. A primeira tentativa restrita não concluiu; a primeira exportação isolada conservou URL antiga e falhou na sessão, antes dos percursos. Corrigida a configuração do ensaio e adicionada interdição de pedidos do navegador a outras portas loopback.

`public-navigation-review.spec.ts`: quatro cenários executados; **um aprovado e três falhas esperadas que reproduzem defeitos**, não quatro funcionalidades corrigidas. Log tmp/v074-block-a-isolated.log. Checkpoint A não altera produto:

- Enter e Espaço ativam os botões de Registar/categorias ensaiados. Ao escolher categoria o controlo desaparece e o foco não acompanha o título de tipos: defeito reproduzido.
- Documento selecionado/nome alterado → Voltar às categorias → mesmo tipo: rascunho perdido sem aviso, reproduzido.
- Voltar do navegador após selecionar tipo salta para o Hub; passos internos não constam do histórico, reproduzido.
- PDF conhecido devolve cinco propostas com 35 campos de linha permanentes. Enter no valor não envia confirmação. Guardar sem linhas revistas é recusado sem POST de confirmação. Captura sintética tmp/v074-review-before-390.png.

Os testes marcados test.fail explicitam pendências; remover a marcação apenas quando o comportamento esperado passar. Não foram repetidos carga, 1.000 contas nem inferência real. Caso difícil HDL/data/proposta extra continua como regressão histórica, sem alegar diagnóstico novo da causa. Android/iOS não ensaiados.

Repetir em PowerShell, apps/mobile:

```powershell
$env:Path='C:\Program Files\nodejs;'+$env:Path
$env:PULSO_TEST_PUBLIC='true'
$env:PULSO_TEST_API_PORT='8014'
$env:PULSO_TEST_WEB_PORT='8784'
$env:EXPO_PUBLIC_API_URL='http://127.0.0.1:8014'
npx.cmd playwright test public-navigation-review.spec.ts --reporter=line
```

Esta configuração de portas é usada pelo novo ficheiro; suites históricas com URLs literais precisam das portas originais ou de adaptação explícita. Não reutilizar serviços existentes.

---

# Validação atual — v0.7.3

Atualização: 09/11/2026, Europe/Lisbon. Evidência apenas sintética; não é validação clínica ou certificação.

## Aplicação e câmara

**211 testes distintos aprovados:** 100 API, 58 TypeScript, 36 Chromium demonstrativos isolados, 9 Chromium na configuração normal, 2 de estrutura e 6 dos geradores/métricas. Typecheck e pip check aprovados; exportação web exercitada pelo Playwright. Dois testes Chromium opcionais de Ollama real não foram executados; inferência real foi medida separadamente abaixo. Logs tmp/v073-{api,unit-final,public-final,demo-final,harness,foundation}.log.

Registar oferece Digitalizar exame / Importar ficheiro / Registar medição; categorias preservadas no passo seguinte. Nova captura web pede vídeo sem áudio por ação explícita, mostra pré-visualização, exige conferência de qualidade, permite repetir/cancelar, fecha as tracks e segue para classificação/DocumentImport. Ficheiro alternativo permanece disponível em contexto sem câmara ou permissão recusada. Documento não laboratorial (ECG sintético) é guardado com original/proveniência e zero resultados, sem chamar a extração. Casos de importação/revisão/correção/guardar/detalhe/gráfico, sessão/cookie/logout e isolamento passam pela regressão existente.

Teste de câmara usa canvas/MediaStream sintéticos no Chromium, nunca a webcam pessoal. Verifica permissão recusada, API ausente, limites de layout 320/390/768/1100/1280, foco na revisão/classificação e retorno ao cancelar. Movimento reduzido e os três modos mantêm a cobertura existente. Capturas tmp/v073-camera-preview-{390,1280}.png. Teste físico, NVDA/VoiceOver e zoom real pendentes; sem certificação WCAG.

Native: expo-image-picker ~57.0.21 e expo-crypto ~57.0.4 compatíveis com SDK 57. Câmara/galeria com preview/aceitar/repetir, hash local e JPEG sem metadados APP1/APP13/comentários, sem recomprimir os bytes dos píxeis depois do JPEG fornecido pelo SDK. Configuração bloqueia microfone; nenhuma permissão de localização/reconhecimento facial. Exportações JavaScript Android/iOS aprovadas (tmp/v073-android.log e tmp/v073-ios.log); configuração inspecionada com expo config --type introspect. Android declara RECORD_AUDIO com tools:node=remove; iOS sem NSMicrophoneUsageDescription. **Não houve dispositivo/emulador**, nem foi validada a integração nativa completa de sessão, Origin/cookies, transporte e API local. A disponibilização operacional comprovada é a web; exportação JS não prova câmara nativa.

Limite intencional: uma página por fotografia, 2 MB e 12 MP; PDFs mantêm até 3 páginas. Sem botão de múltiplas fotografias, rotação, recorte, melhoria automática ou garantia de legibilidade. Fotografias nativas grandes podem ser recusadas sem redução automática. Uploads comuns preservam o original integral; sanitização de metadados de todos os ficheiros e retenção das caches do SDK ainda exigem revisão antes de dados reais. Captura nativa guarda hash do JPEG entregue pelo SDK antes da remoção de metadados; não é hash de um RAW de sensor nem prova independente de qualidade.

## Contas e capacidade

1.000 contas de fixture e seus snapshots foram verificados através da autorização normal; 10 logins HTTP, 3.000 acessos cruzados recusados, persistência após reinício e 1.000 revogações aprovados. Registo HTTP das 1.000 contas não executado; nenhuma autenticação foi desativada. Coorte, cenários, recursos, comandos e tabela de carga ficam unicamente em [LOAD_TEST.md](LOAD_TEST.md), sem os duplicar aqui.

## Fidelidade documental

Gerador reutiliza os casos/ground truth previamente definidos em benchmark_extraction.py e o mesmo módulo hybrid. Adiciona imagem de baixo contraste, reflexo, recorte, fonte itálica simulada, inglês e data ambígua. Itálico de computador não é manuscrito humano. Expected JSON é escrito antes de invocar o modelo. Nunca se usa a resposta do modelo como referência.

Com Ollama desligado: **21 documentos, 98 resultados esperados na fonte, 10 recuperados pelo parser conhecido e 88 sem proposta automática**; o estado manual_required explica a necessidade de introdução/revisão manual. São limites do parser, não 88 erros de persistência. O caso misto recuperou os cinco analitos digitais conhecidos; os outros três ficaram sem proposta. Os casos degradados podem ocultar informação; fonte original e imagem degradada não são equivalentes.

Amostra real sequencial: **7 documentos únicos**, 35 resultados esperados; 36 propostas, 34 associações completas (parâmetro/valor/unidade/data/página), nenhuma omissão ou divergência de valor/unidade/página/documento observada nos resultados associados, uma data não coincidente e uma proposta extra não mapeada. 14 propostas sem verificação textual independente. Há seis chamadas ao modelo e um documento resolvido pelo parser; dois processamentos adicionais repetiram o caso difícil e a fotografia, totalizando oito chamadas reais ao modelo em nove processamentos (sete documentos únicos). Modelo local existente qwen3-vl:4b, Ollama 0.40.15, concorrência 1, prazo do lote 300 s; lote principal 72,66 s. Nenhum modelo novo instalado e nenhum documento guardado na base.

| Documento | Esperados | Propostas | Completos | Data divergente/ausente | Extras | Sem verificação textual | s |
|---|---:|---:|---:|---:|---:|---:|---:|
| known_deterministic | 5 | 5 | 5 | 0 | 0 | 0 | 0.41 |
| fifteen_rows | 15 | 16 | 14 | 1 | 1 | 2 | 38.59 |
| injection | 3 | 3 | 3 | 0 | 0 | 0 | 6.21 |
| photo | 3 | 3 | 3 | 0 | 0 | 3 | 6.95 |
| tilted | 3 | 3 | 3 | 0 | 0 | 3 | 7.20 |
| low_contrast | 3 | 3 | 3 | 0 | 0 | 3 | 6.79 |
| cropped | 3 | 3 | 3 | 0 | 0 | 3 | 6.18 |

| Parâmetro | Esperados na amostra | Completos | Data ausente/divergente | Sem verificação textual |
|---|---:|---:|---:|---:|
| glucose | 7 | 7 | 0 | 4 |
| ldl | 7 | 7 | 0 | 4 |
| creatinine | 7 | 7 | 0 | 4 |
| hemoglobin | 2 | 2 | 0 | 0 |
| hba1c | 2 | 2 | 0 | 0 |
| cholesterol_total | 1 | 1 | 0 | 0 |
| hdl | 1 | 0 | 1 | 1 |
| triglycerides | 1 | 1 | 0 | 0 |
| ferritin | 1 | 1 | 0 | 0 |
| tsh | 1 | 1 | 0 | 0 |
| ft4 | 1 | 1 | 0 | 0 |
| vitamin_d | 1 | 1 | 0 | 0 |
| urea | 1 | 1 | 0 | 0 |
| sodium | 1 | 1 | 0 | 0 |
| potassium | 1 | 1 | 0 | 0 |

O documento fifteen_rows é a regressão difícil conservada no corpus. Na repetição detalhada (27,06 s), HDL manteve valor/unidade corretos mas data nula; a proposta extra estava não mapeada e sem valor numérico. Não se afirma que foi inventado um número. A ureia tinha aviso de amostra sem evidência. Esses campos exigem conferência/correção ou exclusão explícita; nenhuma proposta foi automaticamente confirmada. Não foi alterado o pipeline para melhorar o benchmark. Correções humanas efetivamente realizadas no benchmark: zero; os fluxos UI de correção/confirmação são ensaiados separadamente.

As quatro fotografias/imagens frontal, inclinada, de baixo contraste e recortada acertaram os campos esperados nesta amostra, mas as 12 propostas visuais continuam sem conferência textual independente. O recorte retirou colunas laterais, não demonstra recuperação de números ocultos. Instruções maliciosas não produziram ações externas nem o valor extra pedido no documento. Reflexos, idioma inglês, data ambígua, fonte itálica e restantes casos foram exercitados apenas com o motor desligado nesta entrega; não há suporte real demonstrado a manuscritos, idiomas arbitrários ou todas as degradações.

Catálogo de dados/gráficos: **19 parâmetros**, incluindo quatro vitais; o corpus laboratorial tem 15 analitos. CRUD/unidades/aliases/proveniência e UI dos 19 continuam cobertos pela matriz partilhada abaixo e testes executados. A amostra real não prova todos os aliases, unidades alternativas, métodos/amostras ou documentos para cada parâmetro. O teste de métricas distingue data ausente, extra, omissão e evidência visual. Relatórios detalhados por documento/parâmetro em tmp/v073-doc-{disabled,real,repeat,resource}/results.json; ficheiros de referência/casos ficam em tmp e os geradores no Git.

Repetição (pasta nova; Ctrl+C ou prazo máximo interrompe, sem alterar a base):

```powershell
.\.venv\Scripts\python.exe scripts/document_reliability.py --mode disabled --max-seconds 120 --output tmp/doc-repeticao-off
.\.venv\Scripts\python.exe scripts/document_reliability.py --mode real --only known_deterministic photo tilted injection fifteen_rows low_contrast cropped --max-seconds 300 --output tmp/doc-repeticao-real
```

Não executar inferência real e carga simultaneamente. O deadline limita subprocessos próprios; não termina o serviço Ollama partilhado. A repetição fotográfica com --sample-gpu durou 9,98 s e acertou os três resultados, ainda visualmente não verificados. Dez amostras de nvidia-smi (aproximadamente uma por segundo) observaram máximo de 5214 MiB de memória GPU total em uso e 95% de utilização, numa RTX 5050 Laptop de 8151 MiB. É amostragem desse caso, não pico absoluto nem garantia de margem sustentada. Tempos/contadores de tokens do modelo constam do JSON. Não confundir este ensaio local com validação clínica, auditoria de segurança, sincronização cloud ou capacidade de produção.

Os comandos de regressão partilhados e a matriz histórica abaixo continuam aplicáveis; acrescentar os novos testes dos geradores via unittest discover. Todos os relatórios anteriores são históricos, não novos ensaios.

## Histórico — redesign v0.7.2, 08/11/2026

Correção pontual da seleção de documentos, ainda na v0.7.2: **68 testes aprovados** — 56 TypeScript, 5 Chromium na configuração normal (`public-entry`/`public-picker`) e 7 dos fluxos de PDF, imagem manual e documento sem extração (`flows`, `local-extraction`, `register`). Typecheck e exportação web aprovados. O novo teste percorre escolha, troca pelo seletor, arrasto, formato/tamanho inválidos preservando a seleção anterior, bloqueio durante leitura, falha sem perda do ficheiro e cancelamento. Verifica nome único dentro da área, indicação de não guardado, ausência de texto solto em View, movimento reduzido e 320/1100 px. Capturas fictícias locais em `tmp/picker-selected-{320,1100}.png`; animações finalizadas para a captura. Animação de entrada dura 160 ms, não representa progresso de upload. Sem pré-visualização automática do PDF nem mudanças à extração, autenticação ou persistência; testes com DB temporária e Ollama desligado, sem consultar/limpar a base normal. API/inferência real não repetidas nesta correção. Logs: `tmp/picker-unit.log`, `tmp/picker-public-final.log`, `tmp/picker-flows-final.log`; repetir na mesma configuração Playwright da secção abaixo, selecionando estes ficheiros. Em `DocumentImport`, uma condição textual vazia foi convertida para booleana para evitar aviso React Native. Ensaios físicos/leitor de ecrã continuam pendentes.

Regressão completa anterior do redesign (não repetida integralmente nesta correção):

**202 testes distintos aprovados:** 100 API, 56 TypeScript, 36 Chromium em demonstração explicitamente isolada, 5 Chromium na configuração normal sem demonstração, 2 de estrutura e 3 do gerador. Dois Chromium opcionais de inferência real omitidos. Typecheck, pip check e exportação web aprovados, sem novas dependências. Logs locais: `tmp/v072-api.log`, `tmp/v072-unit-final.log`, `tmp/v072-demo-release.log`, `tmp/v072-public-release.log`. Todos os testes escrevem apenas em bases temporárias. Nenhuma limpeza da base normal; nenhuma nova inferência GPU, carga ou exportação nativa.

A: entrada pública sem pedidos clínicos, verificação neutra, rota privada/retorno interno permitido, conta vazia, cookie recusado, logout/Voltar e sessão ausente sem dados anteriores. Endpoints /demo protegidos no normal, mesmo com cabeçalhos falsos; modo demonstrativo recusa DB normal. Reposição exige confirmação do dono demo e preserva a conta de ensaio. O cliente depende do contexto confirmado pelo servidor, não de uma flag de compilação. Um desvio de retorno à rota no teste da compilação estática foi corrigido e o percurso repetido na suite normal.

B: exame com resultados e documento sem extração abrem detalhe após persistência; tensão abre o registo, acontecimentos a cronologia. Evolução é ação no exame. Edição mantém contexto/filtros, conflito mantém campos; exclusão regressa à lista e preserva recursos não abrangidos. Testes de acontecimentos aguardam confirmação de gravação antes de ler a versão, evitando uma leitura prematura no próprio teste. C: catálogo de 19 parâmetros percorrido na API/modelo e UI; matriz abaixo, sem alegar reconhecimento universal por IA. D: Hub sem barra clínica repetida, estado vazio único, resumos expansíveis e tensão mesmo sem exames. Categorias/período em seletores, Mais filtros e remoção individual/limpeza sem alterar predicados. Aprender mantém pesquisa/23 fichas e nomes acessíveis, com ações curtas. Perfil limitado a 760 px, avatar/conta e data DD/MM/AAAA ↔ ISO; nascimento obrigatório preservado. Navegação superior desktop/inferior móvel, com espaço reservado no layout e seleção também sublinhada.

E: 320, 390, 768, 1100 e 1280 px nos três modos; teclado/foco/modais, contraste de texto/campos/tokens e zoom CSS 200% na regressão. Novo teste de seletores/filtros por teclado, calendário pt-PT e estados com apenas tensão/acontecimentos. Teste geométrico de cabeçalho, navegação e rodapé nas quatro páginas, com texto muito grande em tema escuro. Capturas comparáveis antes/depois com a mesma conta e exame inteiramente fictícios: `tmp/v072-before-{Início,Histórico,Aprender,Perfil}-{390,1280}.png` e `tmp/v072-after-*.png`, incluindo Hub vazio. Sem sobreposição detetada nesses casos; não é auditoria de todos os elementos. Inventário visual em [UX_LEARN.md](UX_LEARN.md). As quatro capturas documentais existentes foram atualizadas pela suite; restantes artefactos ficam fora do Git.

Erros encontrados: percursos antigos dos testes ainda procuravam as áreas/acontecimentos diretamente no Hub e foram adaptados aos caminhos reais, sem remover verificações. A revisão identificou estados vazios indevidos com apenas tensão no Hub ou apenas acontecimentos no Histórico; corrigidos na apresentação e cobertos por teste. A reposição manual da demonstração falhava por não enviar a confirmação do perfil exigida pela API; o cliente passou a enviá-la após a confirmação explícita já existente. Testado apenas com perfil fictício/DB em tmp; a proibição no ambiente pessoal mantém-se. Nenhuma alteração à persistência, autorização, regras de comparabilidade ou extração. Mantêm-se avisos de depreciação existentes. Leitor de ecrã real, zoom real, dispositivos físicos e participantes pendentes; sem certificação WCAG ou auditoria clínica/segurança independente.

Comandos PowerShell na raiz (parar previamente o servidor normal, sem terminar processos desconhecidos):

```powershell
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/repeat-v072
.\.venv\Scripts\python.exe -m pip check
node --test tests/foundation.test.mjs
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_load_runner.py -v
Push-Location apps/mobile
$env:PULSO_TEST_PUBLIC = 'false'
npm.cmd run test:web
$env:PULSO_TEST_PUBLIC = 'true'
npm.cmd run test:web
Remove-Item Env:PULSO_TEST_PUBLIC
Pop-Location
```

Pytest configura modo de teste e DB temporária; para os testes demo o basetemp deve estar dentro de tmp, como no comando. Playwright exporta a interface para tmp e configura o servidor com base única descartável; a suite pública desativa o bypass demonstrativo. O frontend normal não importa FixtureRepository ou o conjunto clínico de fixtures, e contas novas não leem seed demonstrativo. Avisos de depreciação existentes continuam; auditoria histórica de dependências não foi reavaliada.

## Registo histórico — correção de transição v0.7.1 (destino anterior, substituído neste sprint)


Correção do destino após confirmação de resultados: DocumentImport comunica o documento/parâmetros apenas depois da gravação confirmada pela API; App recarrega a revisão atual e abre Análises ao sangue, em vez do Histórico. Foco/rolagem vão para o resumo da análise e TimelineChart seleciona o respetivo ponto quando comparável. No modo combinado só os parâmetros importados começam ativos. Os históricos anteriores comparáveis e o original são preservados; campos em falta não geram pontos. Documentos sem extração, tensão e acontecimentos continuam no Histórico.

**146 testes distintos aprovados:** 74 API, 34 TypeScript, 33 Chromium, 2 de estrutura e 3 do gerador. Typecheck, pip check e exportação web aprovados. Dois Chromium opcionais de inferência real omitidos. Logs locais: `tmp/v071-api.log`, `tmp/v071-unit.log`, `tmp/v071-browser-final.log`, `tmp/v071-export.log`; seis fluxos também passaram antes com o launcher real em `tmp/pdf-redirect-focused.log`. Testes só com SQLite temporária e documentos sintéticos, sem consultar/repor dados da conta normal.

Regressões: confirmar com a página no fim da revisão abre e foca o destino no topo, seleciona a glicose corrigida e mantém origem/original; falha 503 mantém o formulário sem avanço; conta autenticada preserva isolamento; confirmar só LDL com método ausente abre LDL e explica a exclusão, sem selecionar um ponto antigo como se fosse novo; modo combinado ativa só o parâmetro desse PDF. Introdução manual sem Ollama, persistência/recarga, documentos sem resultados, tensão e restantes fluxos preservados. Testes do destino antigo foram atualizados mantendo verificações de valores/persistência. Sem alterações funcionais da API/persistência, novas dependências, nova inferência/carga ou exportações nativas nesta correção; API apenas atualiza a identificação de versão. Na revisão do lock, corrigidas duas versões de metadados (@expo/expo-modules-macros-plugin e source-map) alteradas indevidamente na v0.7; conferidas com os pacotes instalados e os URLs/integridades já existentes, sem instalar/atualizar bibliotecas.

Repetir com os comandos web/API/estrutura abaixo, substituindo a pasta temporária de pytest por uma nova (por exemplo `tmp/v071-repeat`). Android/iOS continuam limitados à evidência de exportação JS da v0.7, sem dispositivo físico, leitor real ou validação clínica.

## Registo histórico — v0.7


**145 testes distintos aprovados:** 74 API, 34 TypeScript, 32 Chromium, 2 de estrutura e 3 do gerador de carga. Dois Chromium opcionais de inferência real omitidos. Typecheck, pip check, exportação web e exportações JavaScript Android/iOS concluídos. Sem novas dependências ou inferência GPU/carga real. Logs locais em `tmp/v07-api-release.log`, `tmp/v07-unit-release.log`, `tmp/v07-web-final.log`, `tmp/v07-web-export-final.log`, `tmp/v07-android-export.log` e `tmp/v07-ios-export.log`. Bases temporárias; base normal não foi reposta nem usada pelos testes.

A/B: preferências isoladas/versionadas por conta, preservadas ao editar perfil, modos sem alterar dados/permissões, onboarding de sete passos/conclusão/recarga, áreas prioritárias e contraste. C: comparação por painéis alinhados, unidades e métodos separados, ativação de parâmetros, períodos, datas inclusivas/inválidas, calendário em fim de mês, duplicados legítimos e desenho limitado com fonte completa. D: CRUD de acontecimentos, datas/duração, estados sem validação profissional fabricada, conflitos, isolamento, associação/original e remoção atómica de referências documentais. Acontecimento eliminado não elimina exames/resultados. Fluxos antigos de contas, PDF/tensão, fila, versões e histórico mantidos.

Uma regressão de teclado foi identificada na primeira suite: o novo atalho antecedia a pesquisa em Registar. Corrigida reutilizando a zona de ações do RegisterHub; suite final sem falhas. Testes do launcher real por bloco também aprovados (onboarding, perfil, gráficos e acontecimentos); na revisão final, sete casos de onboarding/gráficos/acontecimentos/PDF/tensão/foco/zoom CSS passaram novamente (`tmp/v07-launcher-final.log`). Não são testes distintos adicionais. Contraste dos tokens verificado para texto ≥4,5 e limites ≥3 nos dois temas; verificações de navegador para foco/erros/modais/listas e layout mantidas. Capturas novas revistas a 320/1100 px, com modos/texto ampliado; suites cobrem também 390/1280 e zoom CSS 200%. Sem zoom real, leitor de ecrã real, dispositivos físicos, ensaio humano, auditoria de segurança ou certificação WCAG.

E: exportações JS Android/iOS verificam o grafo de módulos, não login/ficheiros/câmara/dispositivos. Nenhum APK/IPA/EAS/loja foi criado. Auditoria, lacunas e especificações de sincronização/papéis em ARCHITECTURE.md. F: protocolo atualizado sem participantes ou resultados inventados. Continuam avisos de depreciação Starlette/httpx/PyMuPDF e NO_COLOR; auditoria histórica de dependências não reavaliada.

Comandos PowerShell na raiz; parar o servidor normal antes de Playwright, sem terminar processos desconhecidos:

```powershell
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/v07-repeat
.\.venv\Scripts\python.exe -m pip check
node --test tests/foundation.test.mjs
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_load_runner.py -v
Push-Location apps/mobile
npx.cmd expo export --platform web
npm.cmd run test:web
npx.cmd expo export --platform android --output-dir ../../tmp/v07-android-repeat
npx.cmd expo export --platform ios --output-dir ../../tmp/v07-ios-repeat
Pop-Location
```

## Registo histórico — v0.6.1


## Otimização do perfil — mesma v0.6.1

**124 testes distintos aprovados:** 62 API, 28 TypeScript, 29 Chromium, 2 de estrutura e 3 do gerador; typecheck/exportação web aprovados, 2 Chromium de inferência real omitidos. Quatro casos repetidos com o launcher real, incluindo perfil. Logs locais `tmp/profile-api-release.log`, `tmp/profile-unit.log`, `tmp/profile-web-release.log`, `tmp/profile-export.log` e `tmp/profile-launcher.log`. Sem acesso aos conteúdos da base normal, migração, nova inferência ou carga.

Regressões: nascimento obrigatório/ausente/inválido/futuro/bissexto no servidor e interface; conta antiga sem data entra e completa perfil sem recriação; condições por ID e nomes livres, limites e duplicados; pesquisa sem acentos/por sinónimo, seleção/remoção, interesses, avatar por teclado e persistência após recarga. As condições continuam autodeclaradas, não diagnósticos. Suite integrada mantém isolamento de contas, fotografia privada, PDF e tensão. Capturas locais do perfil revistas a 320 px escuro e 1100 px claro, sem transbordo horizontal. Não houve ensaio humano ou leitor de ecrã real.

Comandos adicionais (PowerShell, raiz; testes web exigem parar primeiro o PULSO normal):

```powershell
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/profile-api-repeat
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
Push-Location apps/mobile
npx.cmd expo export --platform web
npm.cmd run test:web
$env:PULSO_TEST_LAUNCHER = 'true'
npx.cmd playwright test e2e/profile.spec.ts e2e/accounts.spec.ts e2e/login.spec.ts
Remove-Item Env:PULSO_TEST_LAUNCHER
Pop-Location
```

### Correção anterior de sessão


Correção de login: o arranque real forçava API em `127.0.0.1` para interface em `localhost`; reproduzido antes da correção com falha de hostname. O arranque preserva agora a escolha automática pelo hostname do navegador; login confirma a sessão antes de mostrar a conta. Cookie HttpOnly/SameSite, Origin e CSRF mantidos. Sem alterações à base normal ou às contas existentes.

**113 distintos aprovados:** 54 API, 26 TypeScript, 28 Chromium, 2 de estrutura e 3 do gerador. Typecheck e exportação web aprovados; 2 Chromium opcionais de inferência real omitidos. Logs locais `tmp/v061-api.log`, `tmp/v061-browser.log`, `tmp/v061-export.log`. Sem inferência real ou novo ensaio de carga.

Três casos também passaram com Metro/arranque real: sessão e recarga com hostname consistente, cookie recusado sem falsa autenticação, fluxo integrado de contas. Logs `tmp/login-launcher-fixed.log` e reprodução anterior `tmp/login-before.log`. Contas fictícias e SQLite temporária. Para repetir, parar o PULSO normal e executar em `apps/mobile`:

```powershell
$env:PULSO_TEST_LAUNCHER = 'true'
npx.cmd playwright test e2e/login.spec.ts e2e/accounts.spec.ts
Remove-Item Env:PULSO_TEST_LAUNCHER
```

## Entrega anterior — v0.6, 08/11/2026

Entrega: **54 testes API, 26 TypeScript, 26 Chromium, 2 de estrutura e 3 do gerador de carga aprovados (111 distintos)**. Dois Chromium opcionais de inferência real omitidos; não incluídos na contagem. Typecheck, exportação web e pip check aprovados. Logs locais em tmp/v06-api-release.log e tmp/v06-web-release.log; testes não usam a base normal. Não houve inferência GPU real nesta v0.6; pipeline/modelo preservados, parser sem Ollama exercitado. Validação adicional do menu de perfil por teclado no teste integrado de contas.

Contas: Argon2id, rotação/expiração/revogação de sessão, cookie HttpOnly/SameSite, CSRF/Origin, limites de tentativas, respostas de login/recuperação sem enumeração explícita, tokens temporários de uso único/expiração e alteração de e-mail pendente. Perfil autodeclarado/versionado; imagens sintéticas PNG/JPEG com MIME/assinatura, limite, redução e remoção de metadados; acesso de outra conta recusado. Navegador: criar duas contas fictícias, avatar e fotografia (substituir/remover), PDF corrigido/revisto/confirmado, tensão, histórico/gráfico, logout e novo login/recarga com dados recuperados; conta nova sem dados demo herdados. Nenhum token de acesso em localStorage; fotografia privada em blob da própria conta.

Registar/Histórico e integridade mantêm os ensaios dos checkpoints abaixo. Menu de perfil fixo, largura 320 revista; suites também cobrem 390/1100/1280, temas e zoom CSS 200%. NVDA voltou a não ser encontrado no PATH/locais/processos habituais nesta execução; sem ensaio com leitor real, zoom nativo, Android/iOS físicos, estudo com pessoas, auditoria independente de autenticação ou validação clínica. Não declarar certificação WCAG, capacidade de produção ou segurança para dados reais. E-mail é modo de desenvolvimento sem envio nem prova de titularidade externa.

Medição curta antes/depois e prova real da fila em LOAD_TEST.md: amostras isoladas, não repetição do ensaio de dez minutos nem teste de carga de login/contas. Problema de latência p99 na tentativa intermédia foi identificado e corrigido antes da entrega. Avisos Starlette/httpx, PyMuPDF/ByteString e NO_COLOR/FORCE_COLOR mantêm-se; auditoria histórica de dependências não repetida. Novas dependências limitadas a argon2-cffi e as suas três transitivas.

## Checkpoints da v0.6

Checkpoint Registar/Histórico: **48 API, 26 TypeScript e 25 Chromium aprovados** (2 opcionais omitidos); typecheck/exportação aprovados. Classificação validada, documento sem resultados, especialidades múltiplas, alteração de categoria sem duplicar original/alterar resultados, pesquisa/filtros/persistência e ausência de chamadas de extração no fluxo documental. Captura Registar a 320 px revista em tmp. Admissão ordenada de escrita manteve atomicidade e melhorou os percentis no ensaio curto; ver LOAD_TEST.md. Contas/perfil ainda em implementação neste checkpoint.

Checkpoint de integridade/fila: **46 testes API, 26 TypeScript e 24 Chromium aprovados**; 2 Chromium opcionais de inferência omitidos. Typecheck e exportação web aprovados. Regressões: ID de tensão repetido com conteúdo equivalente/diferente, data equivalente com fuso, ausência de ressurreição após eliminação parcial, duas edições com a mesma versão (uma 200/uma 409), precondição obrigatória, versão do documento pai, manutenção da evidência, formulário desatualizado com campos preservados e decisão explícita. Fila: limite/deduplicação/FIFO/cancelamento/expiração/âmbito e confirmação não automática; parser sem Ollama. Testes anteriores mantidos. Detalhes da fila em LOCAL_EXTRACTION.md. Os ensaios de desempenho comparáveis estão em atualização em LOAD_TEST.md.

## Registo histórico — v0.5

Executado em Windows: **25 testes TypeScript, 23 Chromium, 42 API e 2 de fundação — 92 aprovados**. Typecheck e exportação web Expo aprovados. Playwright: `23 passed, 2 skipped`; os dois opcionais de inferência real não foram repetidos nesta v0.5, sem alteração ao motor. Comandos reproduzíveis em [UX_LEARN.md](UX_LEARN.md); logs desta execução em `tmp/v05-browser.log` e `tmp/v05-api.log` (temporários, fora do Git).

Novos testes: preferência apenas não clínica, armazenamento bloqueado, fechar/reabrir processo Chromium conservando tema; diálogo nomeado com foco inicial, ciclo Tab, Escape e retorno; estados dos botões; erros associados aos campos; foco e contraste calculado de texto/campo nos dois temas; lista textual de medições por teclado; motivo real de data ausente mantendo o registo no histórico; biblioteca com pedidos externos bloqueados e fonte solicitada só depois do clique. Catálogo verifica seis secções/23 fichas, fontes, revisão editorial e ausência de revisão clínica inventada. Testes anteriores de PDF/correção/confirmação/recarga/original/gráfico, tensão, edição/eliminação, isolamento e migração preservados e aprovados.

Responsividade verificada pelas suites existentes em 320, 390, 1100 e 1280 px, incluindo tema escuro, modal, navegação, formulário e artigo com **zoom CSS 200%**. Não é zoom real do navegador. Tentativa de acesso ao Chrome pelo controlo nativo terminou por tempo de espera da autorização, antes de observar/controlar a página: nenhum ensaio de zoom real foi concluído. NVDA não encontrado nos locais habituais, PATH, registo de instalação/processos consultados; não foi instalado. Nenhum leitor de ecrã real, TalkBack, VoiceOver, dispositivo físico ou participante humano foi ensaiado. Não há certificação WCAG nem revisão clínica independente. O [protocolo](USABILITY_PROTOCOL.md) contém passos e grelha em branco, não resultados.

Base normal `.local` preservada; testes API/Chromium usaram bases temporárias. Sem dependências novas. Avisos não bloqueantes Starlette/httpx, PyMuPDF/ByteString e NO_COLOR/FORCE_COLOR mantêm-se. Auditoria de dependências histórica não foi reavaliada nem declarada resolvida. Não houve commit ou push deste sprint. Limites e inventário de alterações em [UX_LEARN.md](UX_LEARN.md).

## Registo histórico — Hub e Aprender, 08/11/2026

Typecheck e exportação web Expo aprovados. Testes executados neste sprint: **23 TypeScript, 18 Chromium, 42 API e 2 de fundação — 85 aprovados**. Os 2 testes opcionais com inferência real não foram repetidos nem incluídos nesta contagem; backend/Ollama não foram alterados.

Novos ensaios verificam contagens/isolamento no Hub e associação de tensão só na mesma sessão; catálogo/fontes/relações; pesquisa com acentos e aliases; categorias, fichas e termos relacionados; popover por teclado, Escape e restituição do foco; retorno ao parâmetro certo no histórico; modal a 320 px sem perder o formulário; biblioteca sem API; largura 390/1280, temas e navegação em artigo com ampliação CSS de 200%. Fluxos anteriores de importação/correção/confirmação, gráfico/original, tensão, edição/eliminação e isolamento continuam a passar.

Capturas revistas visualmente: Hub desktop/móvel, Aprender escuro, modal de 320 px e ficha ampliada. Código e dados educativos em [UX_LEARN.md](UX_LEARN.md). Conteúdos experimentais com revisão editorial datada e **revisão clínica independente pendente**. Sem certificação de acessibilidade, leitor de ecrã, ensaio com utilizadores ou dispositivo físico. Avisos não bloqueantes de depreciação Starlette/httpx e PyMuPDF/ByteString e NO_COLOR/FORCE_COLOR; sem dependências novas. Base normal preservada; testes usaram bases temporárias.

As secções seguintes são registos históricos.

# Validação Sprint 0 — 07/11/2026
Ambiente: Windows, Node 24.22.1, npm 11.19.1, Python 3.15.2. Expo 57.0.32, React Native 0.86.3 e React 19.2.3. Dependências Python em requirements-dev.txt, frontend no package-lock.json.

## Executado
- node --test tests/foundation.test.mjs: 2 aprovados.
- python -m pytest services/api/tests: 3 aprovados. Aviso de depreciação Starlette/TestClient sobre httpx; não afeta os resultados observados, acompanhar atualização futura.
- API Uvicorn iniciada em 127.0.0.1:8000; pedido HTTP real a /health devolveu status ok e mode synthetic-demo.
- npm.cmd run typecheck: aprovado após configurar tipos Node para os testes.
- npm.cmd test: 3 aprovados (navegação, troca de perfil, perfil desconhecido).
- npx.cmd expo install --check: dependências compatíveis com Expo.
- npx.cmd expo export --platform web: aprovado, bundle web gerado.
- npm.cmd run test:web: 1 aprovado em Chromium, viewport 390x844. Abre as cinco áreas, percorre separadores e confirma histórico vazio no perfil B após trocar do A. Sem erros JavaScript de página nesse fluxo.
- Captura docs/sprint0-mobile.png revista visualmente: títulos, cinco cartões e navegação legíveis, sem sobreposição observada nesse viewport.

## Limites e pendências
Não executados Android/iOS, testes com leitores de ecrã, ampliação real a 200%, usabilidade com pessoas ou revisão clínica. Labels e estados selecionados foram implementados; certificação de acessibilidade não foi realizada.
O isolamento testado é apenas de apresentação local entre perfis fictícios. Ambos os conjuntos de dados são incluídos no bundle; não há autenticação/autorização de produção.
API e interface são independentes nesta sprint. Não há armazenamento, uploads, interpretação ou edição de registos. Não considerar os AC-01 a AC-18 do MVP integralmente cumpridos nem a Sprint 1 concluída.

## Dependências e ocorrências
npm audit reportou 4 avisos moderados na cadeia Expo/fingerprint/glob/minimatch, sem avisos altos/críticos. Não foi aplicado o downgrade incompatível sugerido por audit --force. Registar para revisão de dependências antes de expansão ou distribuição; esta entrega é local com dados fictícios.
O npm assinalou o script de instalação esbuild não aprovado; os testes tsx e a exportação passaram sem o aprovar.
A primeira instalação revelou versões incompatíveis; corrigidas através de expo install --fix. A primeira compilação web revelou falta de watchFolders para JSON fora de apps/mobile; corrigida em metro.config.js. Repetições finais aprovadas.
Testes API sem permissões de ligação local ficaram bloqueados; a execução autorizada passou. Descargas e testes de navegador também precisaram de autorização neste ambiente.
Não foi criado commit nem feita publicação. Alterações já preparadas pelo utilizador no Git foram preservadas.

Reinstalação npm.cmd ci pelo lockfile: aprovada; typecheck, 3 testes de lógica e expo install --check repetidos após reinstalar, todos aprovados.

## Sprint 1 — 07/11/2026
Executado: npm.cmd run typecheck aprovado; npm.cmd test: 11 aprovados (8 de dados clínicos e 3 de navegação); expo export --platform web aprovado; npm.cmd run test:web: 4 aprovados, incluindo seleção de ponto, documento original, perfil vazio, respiração e tensão em Chromium a 390/1100px. node --test tests/foundation.test.mjs: 2 aprovados. pytest services/api/tests -q: 3 aprovados, mantendo aviso de depreciação httpx. Total: 20 testes aprovados.
A primeira exportação foi bloqueada por permissões ao atualizar dist; repetida com autorização, aprovada. Sem alterações em dependências. Avisos de dependências da Sprint 0 não foram reavaliados nesta sprint.
Captura mobile revista visualmente: títulos, cartão, escala e linha temporal legíveis, navegação preservada. Android/iOS, leitor de ecrã e ampliação real continuam não verificados. Carregamento/erro/repetição implementados, sem ensaio forçado no navegador. Sem teste de backend de dados clínicos: ainda não existe. Detalhes em SPRINT_1.md.

## Otimização de interface e integração funcional — estado atual
Executado em Windows, 07/11/2026, com a stack existente. Inspeção inicial incluiu o PRD, regras, arquitetura e o relatório de revisão fornecido. Nenhuma reconstrução da aplicação ou substituição da stack.

Resultados finais:
- npm.cmd run typecheck: aprovado após corrigir a tipagem do foco web.
- npm.cmd test: 16 aprovados (cronologia, valores/unidades, ausências, comparabilidade, proprietário/documento, proveniência, persistência, falha de quota, idempotência, revisão e correção).
- python -m pytest services/api/tests -q: 11 aprovados. Inclui saída campo a campo do PDF, vírgula decimal, unidade desconhecida, valor/data ausente ou ambígua, duplicados, formato inválido, cifrado, layout desconhecido e limites de tamanho/páginas.
- npm.cmd run test:web: 8 aprovados em Chromium. Inclui importar → corrigir → rever cada linha → confirmar → recarregar → histórico/gráfico/original; tensão → rever → guardar → recarregar → gráfico; troca de perfil; falha de armazenamento e repetição; modos claro/escuro; largura 320; foco e Tab; ampliação CSS de 200%. Testes de gráficos a 390/1100 px preservados e adaptados ao seletor, com verificação do período.
- node --test tests/foundation.test.mjs: 2 aprovados.
- expo export --platform web: aprovado.
Total: 37 testes aprovados. Ampliação CSS não é um ensaio manual do zoom nativo do navegador. Não foi feita certificação de acessibilidade, ensaio de leitor de ecrã, estudo com utilizadores, teste Android/iOS ou revisão clínica.

Evidência visual: captura escura de 320 px e capturas dos gráficos revistas; PDF de exemplo renderizado e revisto sem texto cortado. Não foi alegado impacto de usabilidade com pessoas.
Ocorrências corrigidas: o primeiro ensaio integral encontrou uma API antiga na porta 8000, só com /health; foi parada e o fluxo repetido com a API atual. Um teste de tensão assumia apenas uma série de método e foi adaptado para preservar a separação entre fixtures e registos manuais. A tipagem de tabIndex no componente de texto foi corrigida antes da aprovação final.
Avisos não bloqueantes: depreciações Starlette/httpx e PyMuPDF/ByteString; avisos NO_COLOR/FORCE_COLOR da ferramenta. Auditoria de dependências da Sprint 0 não foi repetida nesta entrega; os quatro avisos moderados anteriores não foram declarados resolvidos.

Funcionalidade real: persistência web em localStorage; API stateless extrai o layout PDF sintético; histórico/dashboard/gráficos leem a mesma fonte. Snapshot por perfil inclui PDF original, hash, parser e evidência. Não há PostgreSQL, autenticação, encriptação local, sincronização ou proteção contra escrita concorrente entre separadores. Apenas uma janela de escrita, apenas dados fictícios. Perfis são separação demonstrativa, não controlo de acesso de produção.
Não implementados: OCR, IA, alertas, partilha/instituições, edição de resultados já confirmados, múltiplas leituras na mesma sessão, calendário/medicação funcionais ou biblioteca clínica revista. Rascunhos não são persistidos; cancelar não grava. Duplicados PDF no mesmo perfil são recusados com mensagem explícita.
Ficheiros centrais: App.tsx, src/ui.tsx, src/clinical/{data,repository,RecordViews,ClinicalPanel,TimelineChart,Forms,importData,PdfPicker}. API: main.py e pdf_parser.py; uma amostra laboratorio-demo.pdf e script para a regenerar. Atualizados os testes úteis existentes, adicionados apenas testes de persistência, parser e fluxos. Removida a função observationsFor e a sua fonte paralela na interface; as duas leituras antigas continuam na migração explícita.
Documentação de utilização atualizada em GUIA_WINDOWS.md; arquitetura e segurança atualizadas. Nenhum commit, publicação ou partilha de dados realizado.

Os dois testes de gráfico/período foram repetidos com o relógio do navegador fixado em 07/11/2026, aprovados, para manter o teste estável ao longo do calendário. O prazo do parser foi testado por limites funcionais de entrada, não por ensaio de exaustão de recursos. Servidores de revisão iniciados localmente em 8081/8000; o arranque Expo desta sessão usa CI (sem observação automática de alterações), podendo ser reiniciado com o comando normal do guia para desenvolvimento contínuo.

## Correção do fluxo PDF — 07/11/2026
Implementado: seletor visual com tema e drop, seleção antes do envio, nome/cancelamento/substituição, estados por eventos reais de transferência/resposta, repetição de erros, revisão de data/laboratório, referência visível e original acessível antes de confirmar. Reutilizados repositório local, validações, deduplicação e gráficos. Exemplo copiado para public/laboratorio-demo.pdf; manter esta cópia sincronizada ao regenerar a fixture.
Diagnóstico: uma instância com --reload no Windows devolvia 500 ao criar subprocesso assíncrono; navegador reportava ausência de CORS nessa resposta. Corrigido com subprocess.run em asyncio.to_thread, timeout de 8 segundos e cwd explícito. Reiniciada a instância local para carregar a alteração. As restrições de sockets do sandbox também impediram verificações iniciais; testes finais executados com autorização fora do sandbox.
Executados: npm.cmd run typecheck aprovado; npm.cmd test 16 aprovados; .venv/Scripts/python.exe -m pytest services/api/tests -q 11 aprovados (avisos de depreciação Starlette/httpx e PyMuPDF/ByteString); npx.cmd expo export --platform web aprovado; npm.cmd run test:web 8 aprovados. Primeiras execuções web tiveram 7 aprovados/1 falha PDF com a instância anterior; repetição final passou após reinício. Teste PDF verifica extração, correção, confirmação, persistência após reload, gráfico, original e isolamento de perfil. GET localhost:8081/laboratorio-demo.pdf: 200 application/pdf.
Limites: processamento é síncrono por pedido; após upload a UI aguarda extração/resposta, sem percentagens ou telemetria de etapas internas. Gravação é localStorage, não no servidor. Não testados manualmente drop, leitor de ecrã ou Android; zoom testado é CSS, não zoom real do navegador. Script start.ps1 criado; os comandos constituintes foram executados, mas o ciclo completo desse script até Ctrl+C não foi ensaiado. Sem OCR, dados reais ou publicação.

## Estabilização — resultado final atual
17 testes de dados/navegação, 17 testes API/PDF/SQLite, 10 testes Chromium e 2 da estrutura aprovados (46). TypeScript e exportação web aprovados; git diff --check sem erros. Repetição direcionada detetou e corrigiu uma fixture de testes que só repunha a base no primeiro ficheiro; agora cada teste usa fixture automática, execução sequencial e base temporária. Nenhum teste utiliza a base .local do utilizador.
Arranque por dev.cmd executado duas vezes com Node de Program Files, HTTP 200 em 8081 e API em 8000. Segunda instância devolve erro 1; Ctrl+C liberta ambas as portas. Uma sessão fictícia com 2 observações persistiu após parar e reiniciar os processos, numa base temporária. Não foi literalmente encerrado o Codex durante a tarefa; o launcher testado não usa executáveis do runtime do Codex e funciona no terminal independente.
Etapas 1–4 e 6 implementadas/verificadas. Etapa 5 inspecionada: não havia login, pelo que não foi criado sistema complexo. Âmbito de perfil no backend não substitui autenticação; contas reais, sessões/revogação e autorização de produção continuam pendentes. QR/LAN documentados, sem ensaio físico, sem alterações de firewall e sem Tunnel/backend público.
Checkpoints por etapa em STABILIZATION.md. Sem commits: index preexistente com trabalho alheio e identidade Git ausente. Nenhum reset Git, publicação ou serviço pago.
Limites: SQLite contém snapshots versionados por perfil, não schema relacional de produção; dados apenas fictícios, sem encriptação/autenticação. Migrações conflitantes preservam ambas as cópias e exigem reconciliação posterior; rascunhos não confirmados continuam temporários. PDFs continuam limitados ao modelo determinístico suportado, sem OCR. Não foi implementado Arquivar.
## v0.4 — 08/11/2026, estado atual

Typecheck/exportação aprovados; 42 testes API, 20 TypeScript, 2 de fundação, 11 Chromium normais e 2 Chromium com Ollama real aprovados (77 distintos). Suite normal omite os 2 de inferência, que foram executados separadamente. Benchmark adicional: 15 documentos sintéticos/80 associações esperadas; 81 propostas, uma extra/não reconhecida e uma data não resolvida no caso denso, com revisão humana obrigatória. Hardware, tempos, recursos, comparação com parser anterior, comandos e limitações em [LOCAL_EXTRACTION.md](LOCAL_EXTRACTION.md). Secções anteriores são registos históricos, não estado atual. Não foi feita publicação deste incremento.


## Matriz funcional do catálogo — sprint de simplificação

Auditoria programática em bases temporárias: 19 testes API, 19 testes do modelo de gráficos e um percurso de navegador que seleciona os 19 parâmetros e confere unidade/proveniência do ponto. A = aprovado; F = falhou; NS = não suportado nesta via; NT = não testado. CRUD/proveniência abaixo refere-se à API com a unidade principal; unidades alternativas foram verificadas no catálogo, sem conversão ou alegação de UI repetida para cada uma. Inclui persistência, datas repetidas/diferentes, decimal com vírgula, valores/data ausentes, unidades/métodos/amostras distintos e edição/eliminação. UI de editar/eliminar é partilhada e testada nos fluxos comuns, não repetida para cada parâmetro.

| Parâmetro | Alias/unidade de extração | API CRUD/origem | Modelo gráfico | Seleção UI/origem | Parser PDF conhecido | Formulário domiciliário |
|---|---|---|---|---|---|---|
| Glicose | A | A | A | A | A | NS |
| Hemoglobina glicada | A | A | A | A | A | NS |
| Colesterol total | A | A | A | A | NS | NS |
| Colesterol HDL | A | A | A | A | NS | NS |
| Colesterol LDL | A | A | A | A | A | NS |
| Triglicéridos | A | A | A | A | NS | NS |
| Creatinina | A | A | A | A | A | NS |
| Hemoglobina | A | A | A | A | A | NS |
| Ferritina | A | A | A | A | NS | NS |
| TSH | A | A | A | A | NS | NS |
| T4 livre | A | A | A | A | NS | NS |
| Vitamina D | A | A | A | A | NS | NS |
| Ureia | A | A | A | A | NS | NS |
| Sódio | A | A | A | A | NS | NS |
| Potássio | A | A | A | A | NS | NS |
| Tensão sistólica | NS (unidade A no modelo) | A | A | A | NS | A |
| Tensão diastólica | NS (unidade A no modelo) | A | A | A | NS | A |
| Frequência cardíaca | NS (unidade A no modelo) | A | A | A | NS | A |
| SpO₂ | NS (unidade A no modelo) | A | A | A | NS | NS |

Extração real por Ollama de cada parâmetro: NT nesta auditoria; o catálogo de aliases/unidades e a validação determinística de propostas não provam reconhecimento de qualquer PDF. Parser conhecido limitado aos cinco analitos indicados; os restantes requerem introdução/revisão manual ou extração local posteriormente validada. SpO₂ não tem formulário domiciliário dedicado. A matriz não valida resultados clínicos. Logs: `tmp/entry-c-api.log`, `tmp/entry-c-unit.log`, `tmp/entry-c-browser.log`. Nenhum problema de integridade/isolamento novo encontrado nestes testes.
