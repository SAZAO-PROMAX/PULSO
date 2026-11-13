# Estado atual do PULSO

## Checkpoint ativo — diferenciação offline, 13/11/2026

Pedido atual do utilizador: executar a passagem de fase do ZIP e manter o código completo no computador e GitHub. Clone independente da base limpa `e255f0eeac4502d46f64e078121d7710c39a1355`, branch `trabalho/diferenciacao`, origin oficial. Aplicação pessoal mantém **0.7.4 experimental**; laboratório separado **fidelity-1.0**. Instalação/base/supervisor anteriores preservados; sem migração de contas ou alteração ao percurso web. O checkpoint de recuperação abaixo passa a histórico. Commit deste incremento: consultar `git log -1 -- docs/PROJECT_STATUS.md`; não confundir a base com a entrega.

Implementado: 30 pares sintéticos e oráculo separado, comparador determinístico com valores originais/evidência/regras versionadas, comparação literal, validação local de estrutura e referência **Pydantic 2.14.3 / fidelity-record-1**, CLI Windows, relatório HTML offline e tabela por caso/conjunto. A/B desenvolvimento (20), C avaliação (10), sem alegar avaliação externa/cega ou OCR. PULSO detetou as 10 perdas, evitou oito falsos alertas de representação e absteve-se nos 10 ambíguos. A baseline simples também detetou as 10 perdas; vantagem comercial/generalização/tempo humano continuam por demonstrar. Sem FHIR ou integração institucional. [Execução e passagem de fase](../codex/diferenciacao-viabilidade/EXECUCAO.md), [resultados completos](../codex/diferenciacao-viabilidade/RESULTADOS.md).

Validação desta entrega: **18 testes Python do laboratório**, **3 testes das guardas de sincronização**, **111 API**, **62 TypeScript**, typecheck e pip check aprovados. API só em `tmp/fidelity-api-verified`. Python/Expo instalados nesta cópia; launcher --check aprovado em portas alternativas livres, sem arrancar sobre a instância habitual. HTML validado estruturalmente/escape; pré-visualização pelo browser integrado falhou por timeout, sem validação visual nova. Sem carga, inferência, estabilidade, entrevistas ou ensaio humano. Ver [VALIDATION.md](VALIDATION.md).

Continuidade: `sync.cmd status/pull/push` verifica origin, checkout limpo e histórico, integra só fast-forward e confirma SHA remoto após push. A cada entrega: testar/rever ficheiros → commit → push; sem serviço permanente, force-push ou sincronização de bases/documentos. A auditoria privada do ZIP fica local e ignorada no Git. Estado de publicação deve ser confirmado com `git status -sb` e `git ls-remote`, não inferido desta ficha.

Próximos três objetivos: **(1)** novos casos inventados por terceiros e nova reserva para avaliação antes de ajustar regras, contrato/validador institucional fixados; **(2)** duas origens e medição humana de tempo/erros/ajuda com ordem alternada; **(3)** seis entrevistas em três organizações, sem contactar ninguém automaticamente, só avançando para piloto com os sinais de ENSAIO.md. Dados reais, Android, redesenho do Hub e ensaio prolongado permanecem fora deste incremento.

## Histórico da aplicação pessoal

Atualização: **13/11/2026, Europe/Lisbon**. Versão executável: **0.7.4 experimental** (Expo/frontend/API). Blocos A–G concluídos para o âmbito web ensaiado; não iniciar uma nova versão automaticamente.

**Último checkpoint — recuperação local:** base `32064f0`; commit desta atualização: `git log -1 -- docs/PROJECT_STATUS.md`. Serviços estavam ausentes e o registo ready de 09/11 era obsoleto; os processos já não existiam, sem evento de saída que estabelecesse a causa exata. Novo supervisor local inicia/recupera apenas a árvore identificada do launcher, com prontidão, exclusão de instâncias e recuo entre tentativas. Tarefa Windows por utilizador, sem elevação, arranca ao iniciar sessão; atalho PULSO no ambiente de trabalho verifica/recupera e abre a aplicação. Processo confirmado como filho do serviço do Agendador, sem dependência do Codex. Testes/limites em [VALIDATION.md](VALIDATION.md), utilização em [GUIA_WINDOWS.md](GUIA_WINDOWS.md). Sem alterações funcionais, versões, autenticação ou esquema. Ficheiro da base normal com SHA-256 inalterado durante a intervenção.

Validação mais recente: **2 testes supervisor + 3 estrutura/launcher aprovados**, crash da API só em tmp; entrada pública normal 200/sem pageerror, abertura idempotente pelo comando do atalho. Sem reinício/login Windows real, suspensão controlada, carga, inferência ou suite completa. O ensaio antigo de duas horas terminou **cancelado por timeout**, com grande intervalo sem observação: não foi aprovado e já não está em curso.

Branch `main`; entrega G publicada: `c093695a23d5378ddd5c2f6e7039080a6126ceec`. Na verificação anterior de 09/11/2026, HEAD, origin/main e GitHub coincidiam nesse commit, assim como os últimos commits dos documentos. Antes deste novo checkpoint, fetch confirmou ausência de divergência remota; as duas alterações documentais locais da preparação foram preservadas e incluídas. Repositório oficial: https://github.com/SAZAO-PROMAX/PULSO.

Checkpoint pós-entrega — recuperação web/Android, 09/11/2026: [MOBILE_VALIDATION.md](MOBILE_VALIDATION.md) contém os resultados atuais, ferramentas e proposta de sessão nativa. Serviços estavam parados; launcher e web verificados sem reinstalar dependências da aplicação. JDK/Android Studio/SDK36/ADB/Emulator instalados, AVD Android16 e Expo Go57.0.9 executados; página pública PULSO abriu. API temporária em loopback alcançada via ADB reverse; login nativo recusado por Origin na UI. Não contornar esta proteção. **Sessão nativa e percursos privados Android continuam bloqueados; PDF/visualizador nativos não implementados.** Versão permanece 0.7.4. Obter o commit deste checkpoint com `git log -1 -- docs/PROJECT_STATUS.md`; a preparação documental anterior está incluída, sem inventar hash futuro.

Verificações deste checkpoint: 1 percurso Playwright autenticado isolado aprovado, 2 testes API de segurança aprovados, página pública normal sem pageerror, diagnóstico de arranque/UI/transporte Android no emulador. Sem suite completa, carga, inferência ou dispositivo físico. API/Metro de teste e emulador encerrados; web normal mantida para utilização interativa. Ordem prevista naquele checkpoint: contrato nativo seguro/testado → seleção/consulta PDF → percursos privados/acessibilidade/cache. Não foi demonstrada segurança de uma nova autenticação nativa; aplicar o limite do Bloco 3 e retomar desse ponto.

**Checkpoint atual de reorientação web, 09/11/2026:** base documental `5e7a4c2`, correção documental local `8ce706c`. Conferência na própria linha, próxima pendência, erros junto da ação e guardar→evolução implementados e testados. Hub com gráfico interativo real, menus centrados, pesquisa de parâmetros e composição larga implementados. Launcher com prontidão API/web, estado, identidade de processo e log operacional. Versão permanece 0.7.4; transformação completa e estabilidade prolongada não declaradas. Prompt do Work em [NEXT_SPRINT_PROMPT.md](NEXT_SPRINT_PROMPT.md), fundamentação em [PRODUCT_DIRECTION.md](PRODUCT_DIRECTION.md). Android suspenso por decisão do utilizador. Commit desta atualização: `git log -1 -- docs/PROJECT_STATUS.md`; verificar publicação antes de a afirmar.

## Implementado e verificado

- Entrada pública e área pessoal autenticada, contas inicialmente vazias, logout/revogação; sem fallback demonstrativo público. Nascimento obrigatório. Perfil, preferências explícitas, temas e modos Simples/Equilibrado/Detalhado partilham as mesmas autorizações.
- Hub, Histórico com filtros, gráficos interativos de parâmetros laboratoriais/vitais, tensão domiciliária, acontecimentos versionados e 23 artigos Aprender. Origem/documento acessíveis; unidades, métodos e amostras incompatíveis continuam separados.
- Registar: ficheiro ou câmara experimental, classificação e importação PDF/PNG/JPEG sintética. Revisão compacta, original/evidência, Conferi/Editar/Excluir na linha, próxima pendência e confirmação final explícita. Correções invalidam conferência. Análise com resultados numéricos abre evolução após guardar, com detalhe/original acessíveis; outros documentos abrem detalhe. Falha de leitura após commit repete apenas leitura. Resposta perdida após commit e repetição explícita testadas sem duplicação.
- Hub mostra gráfico reutilizado com resultados confirmados e seleção de parâmetro, junto dos últimos registos em desktop. Navegação centrada e pesquisa no explorador; transições discretas respeitam movimento reduzido. Não há valores/metas inventados nem conversão de medições incompatíveis.
- Rascunho em memória ao mudar de contexto, sem reextração automática; Voltar/Avançar, aviso de perda quando há alterações e recuperação de foco na web. Logout desmonta a memória privada. Não há recuperação de rascunho após recarga.
- G corrigiu contexto antigo ao abrir a raiz do Histórico, seleção de vistas do Perfil e duas alterações de contexto no mesmo evento. Navegação móvel mantém cinco destinos: uma linha com texto normal, distribuição intencional 3+2 com texto muito ampliado. Resumo documental distingue por rever, revistos, avisos e excluídos.

## Arquitetura e serviços

Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript / react-native-web, componentes e tokens existentes. SessionGate/AuthProvider, rotas permitidas e contexto do navegador sem conteúdo clínico no URL. FastAPI/Starlette, Argon2id, sessões revogáveis por cookie HttpOnly/SameSite Strict, Origin/CSRF e versões/If-Match. SQLite experimental local por dono, originais e proveniência preservados. PyMuPDF/parser determinístico e Ollama local qwen3-vl:4b no backend/loopback, com fila limitada e revisão humana. Sem nova dependência, cloud, modelo ou migração neste sprint.

A base normal é `.local/pulso.sqlite3`; G utilizou apenas bases isoladas dentro de `tmp`, sem limpar/alterar a base normal. Modo demo exige `synthetic-only`, base temporária e contexto confirmado pelo servidor. O prefixo histórico `/demo` não concede acesso público.

## Última validação executada — G

Validação posterior de reorientação (mais recente que G): **62 TypeScript e typecheck aprovados; 11 percursos Chromium no Metro real (4 produto + 7 navegação); 9 regressões visuais; 8 percursos demonstrativos isolados; 1 revisão densa de 25 propostas**. Avisos de texto no Hub/Histórico reproduzidos e corrigidos, com teste de consola. Comandos, repetições e limitações em [VALIDATION.md](VALIDATION.md). Launcher: integração curta inicial aprovada; ensaio expandido de 2 horas **iniciado, ainda não concluído nesta atualização**, em `tmp/product-stability.log`. Não tratar disponibilidade HTTP como prova de ausência de todas as falhas. Sessão habitual relançada em processo independente; 8081/8000 respondem e novo estado indica ready. Base preservada, apenas verificação de leitura.

- **110 API**, **62 TypeScript**, **2 de estrutura** aprovados.
- **64 testes Chromium distintos aprovados no conjunto da execução e repetições direcionadas**: 36 demonstrativos isolados e 28 na entrada autenticada/pública. Não passaram todos à primeira tentativa; causas e logs em [VALIDATION.md](VALIDATION.md).
- Configuração adicional de **25 resultados** aprovada; caso normal de 15 também aprovado. Propostas controladas exercitam UI/guarda real, não qualidade de inferência. PDF conhecido percorre o parser real; imagem permite introdução manual com Ollama desligado.
- Arranque real `scripts/dev.mjs` + percurso de PDF autenticado aprovado em 8000/8081, com SQLite temporária. Typecheck final, pip check e exportação web aprovados.
- Dois testes opcionais de inferência real omitidos. Sem carga, GPU, reinstalação do Ollama, ensaio nativo, leitor de ecrã ou zoom real. Histórico de carga/benchmark continua em [LOAD_TEST.md](LOAD_TEST.md) e [VALIDATION.md](VALIDATION.md), sem repetir nem extrapolar resultados.

## Demonstrativo e limitações

Apenas identidades, fotografias e documentos inteiramente fictícios. Confirmação pelo utilizador não equivale a validação clínica. Não existem diagnóstico, metas terapêuticas, partilha de produção, integração institucional, cloud ou papéis profissionais operacionais. E-mail/recuperação continuam locais de desenvolvimento; não há prova externa de titularidade. Medicação/calendário estruturados e formulário SpO₂ continuam pendentes.

Câmara nativa preparada em código, sem ensaio físico/emulador de sessão, permissões e ficheiros. Suporte operacional comprovado nesta entrega: web Chromium local. Uma página por captura, PDFs até três páginas, limites de tamanho existentes. Original lateral oferece texto e acesso ao PDF, sem renderizador novo. Rascunhos não persistem em disco; fila volátil não coordena múltiplos processos. Parser conhecido não cobre todos os documentos/analitos. Sem certificação WCAG ou validação clínica/regulatória.

## Problemas conhecidos, por prioridade

1. **P0 antes de dados reais:** auditoria independente de segurança/privacidade, proteção em repouso/transporte, finalidade/retenção e avaliação clínica/regulatória pendentes. Nenhuma autorização para dados reais.
2. **P1 fidelidade:** data HDL e extra incompleta históricas têm regressões determinísticas, mas JSON bruto histórico não existe: não atribuir causa exata nem alegar benchmark de inferência corrigido. Evidência visual não verificada exige revisão humana; catálogo/parser têm cobertura limitada.
3. **P1 acessibilidade/móvel:** leitor de ecrã, zoom real e dispositivos Android/iOS pendentes; 23 fichas aguardam revisão profissional. Texto ampliado pode exigir mais deslocação vertical.
4. **P1 identidade / P2 operação:** e-mail/recuperação reais e integração móvel por concluir; limites de capacidade sustentada não demonstrados. Avisos de depreciação PyMuPDF/Starlette mantidos e não corrigidos através de atualização oportunista.

## Próximos três objetivos

Novo feedback de 09/11/2026 tem prioridade sobre a ordem anterior. Contexto relevante recuperado de BrainStorm e feedback entregues ao mesmo ChatGPT Work, com revisão dos checkpoints. Work não inspecionou diretamente ficheiros/vídeo: recebeu resumo anonimizado. Pesquisa e prompt estão ligados acima; a implementação efetiva está discriminada nesta ficha.

1. Validar início de sessão Windows e retoma real com o supervisor; acompanhar os novos logs. Ensaio antigo de duas horas cancelado por timeout; não repetir carga nem considerar estabilidade prolongada demonstrada. Causa exata da perda dos processos históricos não estabelecida.
2. Validar fotografia sintética com inferência local real, separadamente e com fila existente; sessão expirada/conflitos e tarefas reais de revisão. O fallback manual testado não prova reconhecimento da imagem.
3. Avaliar a nova composição com o utilizador e refinar Hub/página pública/descoberta com critérios de tarefa e zoom/leitor de ecrã. Android e interpretação de radiografias continuam fora desta implementação.

Continuação: **P0 documental, primeiro incremento visual e recuperação local implementados; validação real de login Windows/retoma e estabilidade prolongada pendentes.** Consultar [VALIDATION.md](VALIDATION.md) e [GUIA_WINDOWS.md](GUIA_WINDOWS.md). Não repetir G, carga ou iniciar Android automaticamente. Os parágrafos anteriores de 09/11 são histórico; o antigo ensaio já terminou por timeout.
