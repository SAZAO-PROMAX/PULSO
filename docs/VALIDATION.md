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
