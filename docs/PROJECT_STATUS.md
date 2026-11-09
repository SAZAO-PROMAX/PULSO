# Estado atual do PULSO

Atualização: **09/11/2026, Europe/Lisbon**. Versão executável: **0.7.4 experimental** (Expo/frontend/API). Blocos A–G concluídos para o âmbito web ensaiado; não iniciar uma nova versão automaticamente.

Branch `main`; entrega G publicada: `c093695a23d5378ddd5c2f6e7039080a6126ceec`. Na verificação anterior de 09/11/2026, HEAD, origin/main e GitHub coincidiam nesse commit, assim como os últimos commits dos documentos. Antes deste novo checkpoint, fetch confirmou ausência de divergência remota; as duas alterações documentais locais da preparação foram preservadas e incluídas. Repositório oficial: https://github.com/SAZAO-PROMAX/PULSO.

Checkpoint pós-entrega — recuperação web/Android, 09/11/2026: [MOBILE_VALIDATION.md](MOBILE_VALIDATION.md) contém os resultados atuais, ferramentas e proposta de sessão nativa. Serviços estavam parados; launcher e web verificados sem reinstalar dependências da aplicação. JDK/Android Studio/SDK36/ADB/Emulator instalados, AVD Android16 e Expo Go57.0.9 executados; página pública PULSO abriu. API temporária em loopback alcançada via ADB reverse; login nativo recusado por Origin na UI. Não contornar esta proteção. **Sessão nativa e percursos privados Android continuam bloqueados; PDF/visualizador nativos não implementados.** Versão permanece 0.7.4. Obter o commit deste checkpoint com `git log -1 -- docs/PROJECT_STATUS.md`; a preparação documental anterior está incluída, sem inventar hash futuro.

Verificações deste checkpoint: 1 percurso Playwright autenticado isolado aprovado, 2 testes API de segurança aprovados, página pública normal sem pageerror, diagnóstico de arranque/UI/transporte Android no emulador. Sem suite completa, carga, inferência ou dispositivo físico. API/Metro de teste e emulador encerrados; web normal mantida para utilização interativa. Próxima ordem: contrato nativo seguro/testado → seleção/consulta PDF → percursos privados/acessibilidade/cache. Não foi demonstrada segurança de uma nova autenticação nativa; aplicar o limite do Bloco 3 e retomar desse ponto.

## Implementado e verificado

- Entrada pública e área pessoal autenticada, contas inicialmente vazias, logout/revogação; sem fallback demonstrativo público. Nascimento obrigatório. Perfil, preferências explícitas, temas e modos Simples/Equilibrado/Detalhado partilham as mesmas autorizações.
- Hub, Histórico com filtros, gráficos interativos de parâmetros laboratoriais/vitais, tensão domiciliária, acontecimentos versionados e 23 artigos Aprender. Origem/documento acessíveis; unidades, métodos e amostras incompatíveis continuam separados.
- Registar: ficheiro ou câmara experimental, classificação e importação PDF/PNG/JPEG sintética. Seleção e estado real dentro da área de documento. Revisão compacta, editor contextual, original, correções/exclusões e confirmação humana explícita antes da persistência. Guardar abre o detalhe e dá acesso à evolução.
- Rascunho em memória ao mudar de contexto, sem reextração automática; Voltar/Avançar, aviso de perda quando há alterações e recuperação de foco na web. Logout desmonta a memória privada. Não há recuperação de rascunho após recarga.
- G corrigiu contexto antigo ao abrir a raiz do Histórico, seleção de vistas do Perfil e duas alterações de contexto no mesmo evento. Navegação móvel mantém cinco destinos: uma linha com texto normal, distribuição intencional 3+2 com texto muito ampliado. Resumo documental distingue por rever, revistos, avisos e excluídos.

## Arquitetura e serviços

Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript / react-native-web, componentes e tokens existentes. SessionGate/AuthProvider, rotas permitidas e contexto do navegador sem conteúdo clínico no URL. FastAPI/Starlette, Argon2id, sessões revogáveis por cookie HttpOnly/SameSite Strict, Origin/CSRF e versões/If-Match. SQLite experimental local por dono, originais e proveniência preservados. PyMuPDF/parser determinístico e Ollama local qwen3-vl:4b no backend/loopback, com fila limitada e revisão humana. Sem nova dependência, cloud, modelo ou migração neste sprint.

A base normal é `.local/pulso.sqlite3`; G utilizou apenas bases isoladas dentro de `tmp`, sem limpar/alterar a base normal. Modo demo exige `synthetic-only`, base temporária e contexto confirmado pelo servidor. O prefixo histórico `/demo` não concede acesso público.

## Última validação executada — G

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

1. Validar acessibilidade com leitor de ecrã/zoom real e percursos em dispositivos Android/iOS, antes de alegar suporte nativo.
2. Aprofundar avaliação documental independente com novos casos sintéticos/ground truth, mantendo evidência, confirmação humana e limitações históricas explícitas.
3. Preparar auditoria de identidade, recuperação, privacidade e segurança antes de qualquer utilização com dados reais; nenhuma implementação futura autorizada implicitamente.

Continuação: **G encerrado no âmbito web experimental.** Consultar [VALIDATION.md](VALIDATION.md) para comandos/resultados e [GUIA_WINDOWS.md](GUIA_WINDOWS.md) para utilização. Atualizar esta ficha após o próximo sprint, sem duplicar relatórios nem guardar dados pessoais/segredos.
