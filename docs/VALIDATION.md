# Validação atual — simplificação v0.7.1, 08/11/2026

**198 testes distintos aprovados:** 100 API, 55 TypeScript, 34 Chromium em demonstração explicitamente isolada e 4 Chromium na configuração normal sem demonstração, 2 de estrutura e 3 do gerador. Dois Chromium opcionais de inferência real omitidos. Typecheck, pip check e exportação web aprovados. Sem nova inferência GPU, teste de carga, exportação nativa ou dependência instalada. Logs finais locais: `tmp/simplification-api-final2.log`, `tmp/simplification-unit-final.log`, `tmp/simplification-browser-release.log`, `tmp/simplification-public-release.log`. Todos os testes escrevem apenas em bases temporárias; nenhuma limpeza da base normal.

A: entrada pública sem pedidos clínicos, verificação neutra, rota privada/retorno interno permitido, conta vazia, cookie recusado, logout/Voltar e sessão ausente sem dados anteriores. Endpoints /demo protegidos no normal, mesmo com cabeçalhos falsos; modo demonstrativo recusa DB normal. Reposição exige confirmação do dono demo e preserva a conta de ensaio. O cliente depende do contexto confirmado pelo servidor, não de uma flag de compilação. Um desvio de retorno à rota no teste da compilação estática foi corrigido e o percurso repetido na suite normal.

B: exame com resultados e documento sem extração abrem detalhe após persistência; tensão abre o registo, acontecimentos a cronologia. Evolução é ação no exame. Edição mantém contexto/filtros, conflito mantém campos; exclusão regressa à lista e preserva recursos não abrangidos. Testes de acontecimentos aguardam confirmação de gravação antes de ler a versão, evitando uma leitura prematura no próprio teste. C: catálogo de 19 parâmetros percorrido na API/modelo e UI; matriz abaixo, sem alegar reconhecimento universal por IA. D: Hub compacto sem métricas vazias, categorias/filtros/opções progressivos, Perfil por grupos, onboarding rápido e textos mais curtos.

E: 320, 390, 768, 1100 e 1280 px nos três modos na aplicação normal; teclado/foco, Escape/modais, contraste de tokens e zoom CSS 200% na regressão. Capturas revistas, todas fictícias. Antes: imagens existentes do commit `cb954f5` extraídas para `tmp/before-hub-390.png`, `tmp/before-graph-390.png` e `tmp/before-graph-1100.png`. Depois: `tmp/after-public-*.png`, `tmp/after-hub-*.png`, `tmp/after-Histórico-390.png`, `tmp/after-Registar-390.png`, `tmp/after-Perfil-390.png` e capturas gráficas documentais atualizadas. Não existia página pública anterior para comparar. Artefactos locais não são publicados. Sem leitor de ecrã real, zoom real, dispositivos físicos, participantes ou certificação WCAG; sem auditoria clínica/legal/segurança independente.

Comandos PowerShell na raiz (parar previamente o servidor normal, sem terminar processos desconhecidos):

```powershell
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/repeat-simplification
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
