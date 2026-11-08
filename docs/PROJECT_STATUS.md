# Estado atual do PULSO

Resumo de continuidade para Codex, ChatGPT e Work. Usar os relatórios ligados para evidência e reprodução; não duplicar os seus detalhes aqui.

## Versão e Git

- **Atualizado:** 08/11/2026 (Europe/Lisbon).
- **Versão:** PULSO **v0.7.1**, experimental; frontend/Expo e API identificados como `0.7.1`.
- **Branch:** `main`. **Base Git desta correção:** `309247c3a0ecdb0e9ae1d7d1800c0e716152752c` (entrega v0.7). Esta ficha acompanha a correção da transição após confirmar um exame; consultar `git log -1 -- docs/PROJECT_STATUS.md` para o commit de entrega.
- **Repositório oficial:** https://github.com/SAZAO-PROMAX/PULSO. Confirmar `git status` e a correspondência HEAD/origin/main ao retomar. Checkpoints anteriores preservam v0.5/carga, integridade/fila e organização documental; não assumir que resultados históricos descrevem a versão atual.

## Sprint de simplificação — em curso

Bloco A: entrada pública e gate de sessão implementados; endpoints de saúde exigem autenticação no funcionamento normal. Demo apenas com configuração explícita e SQLite dentro de tmp; reposição exige confirmação do dono demo. Nenhuma limpeza da base normal. Testes focados: 81 API e fluxo público no launcher real aprovados. Blocos seguintes ainda pendentes neste checkpoint.

## Funcionalidades realmente implementadas

- Hub único adaptativo: modos Simples/Equilibrado/Detalhado, prioridades explícitas de áreas, resumos expansíveis e ajuda opcional. Mesmos dados/permissões nos três modos; sem inferir capacidade ou modo pela idade.
- Onboarding opcional retomável de sete passos; conclusão/progresso, tema sistema/claro/escuro, tamanho de texto, contraste, movimento e ajuda persistem no JSON da conta na mesma SQLite, com versão/CSRF. Tema anónimo mantém a chave local anterior.
- Cinco áreas e Aprender com 23 fichas locais, pesquisa/categorias e explicações partilhadas, sem nova revisão clínica nesta versão.
- Após confirmar resultados de um exame, a interface abre automaticamente a evolução dos seus parâmetros, seleciona o ponto importado quando comparável e reposiciona foco/rolagem. Original acessível; valores incompletos permanecem no Histórico com motivo de exclusão. Tensão, acontecimentos e documentos sem extração mantêm destino no Histórico.
- Gráficos individuais ou painéis combinados com eixo temporal comum e escalas/unidades próprias; séries por método/amostra separadas. Períodos de 7/30/90 dias, 6 meses, 1/2/5 anos, histórico completo e personalizado UTC inclusivo. Desenho denso limitado; lista paginada conserva todos os pontos, origem/original e motivos de exclusão. Sem conversões, interpolação de valores ou diagnóstico.
- Acontecimentos fictícios: oito tipos, datas/duração, descrição/instituição, referências a documentos do mesmo dono, estados autodeclarado/documentado sem validação clínica. Criar/rever/guardar, pesquisar/filtrar, editar/eliminar com versão, histórico de edições e marcadores agrupados no gráfico. Eliminar exame retira ligações ativas atomicamente; eliminar acontecimento preserva exames/medições. Sem causalidade inferida.
- Tensão manual com revisão/persistência. Repetição de ID com conteúdo equivalente é idempotente; conteúdo diferente dá conflito. Editar/eliminar exige versão atual; conflito mantém os campos e requer decisão explícita.
- Registar: oito categorias, pesquisa, tipos e atalhos. Só sangue suportado segue para extração/revisão de resultados; outros tipos guardam documentos sem interpretação ou medições automáticas.
- Histórico pesquisável por categoria/tipo/especialidade/período, com metadados editáveis e várias especialidades no mesmo documento. Reclassificar não duplica original nem altera resultados/gráficos. Documentos antigos sem categoria continuam em Todos os registos.
- Importação sintética PDF/PNG/JPEG: validação, parser conhecido ou Ollama local, propostas corrigíveis e confirmação humana antes de guardar. Fila limitada com estados reais, deduplicação e cancelamento em espera; uma extração de cada vez.
- Contas individuais experimentais: registo/login/logout, data de nascimento obrigatória no registo/atualização do perfil, outros campos opcionais, condições autodeclaradas/interesses, oito avatares com pré-visualização/iniciais e fotografia sintética privada, substituível/removível. Sessões e autorização ligam os dados à conta; nova conta não herda os perfis demo. Menu de perfil fixo e Histórico reutilizado.
- Recuperação/verificação/alteração de e-mail com códigos locais temporários de uso único. **Sem serviço ou envio real de e-mail; confirmação de desenvolvimento não prova titularidade externa.**

Ver [guia Windows](GUIA_WINDOWS.md), [arquitetura](ARCHITECTURE.md), [extração](LOCAL_EXTRACTION.md) e [conteúdos educativos](UX_LEARN.md).

Perfil v0.6.1: pesquisa local por nome/sinónimos, condições frequentes e nomes adicionados manualmente; seleções removíveis sem prefixos repetidos. Não é catálogo completo de doenças nem classificação clínica. Contas antigas sem nascimento mantêm acesso/dados e recebem pedido para completar o perfil. Sem personalização clínica automática.

Correção v0.6.1: o arranque deixou de forçar API num hostname diferente do navegador; login só apresenta a conta após confirmar o cookie numa consulta à sessão. Cookies recusados produzem erro explícito.

## Arquitetura e serviços

| Camada | Estado confirmado |
|---|---|
| Interface | Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript e react-native-web; Windows web verificado. Tokens/ThemeProvider comuns, sem biblioteca visual paralela. |
| Arranque | `dev.cmd`; interface normalmente em `http://localhost:8081`, FastAPI em `127.0.0.1:8000`. Usar o mesmo hostname frontend/API para cookies. |
| Persistência | Uma SQLite `.local/pulso.sqlite3`: snapshots por dono e tabelas de contas/sessões/tokens/limites. Sem base paralela ou PostgreSQL. |
| Dados | ApiRepository único; snapshots schemaVersion 1 com events opcional, transações/If-Match e admissão ordenada de escrita. Preferências no JSON da conta. Sem migração destrutiva ou segunda base. |
| Identidade | FastAPI/Starlette + argon2-cffi/Argon2id; cookie HttpOnly/SameSite, sessão opaca revogável, CSRF/Origin e limites de tentativas. Tokens de acesso fora de localStorage; perfis demo separados. |
| Documentos/imagens | PyMuPDF existente; originais preservados na SQLite. Fotografia de perfil validada/reduzida/reencodificada e privada, sem Ollama. |
| Inferência | Backend → Ollama loopback, porta 11434, apenas `qwen3-vl:4b`; sem cloud, novo modelo ou aumento de concorrência GPU. |

Configuração não é uma sondagem contínua de disponibilidade. Não iniciar vários workers: a fila/semaforo de extração são locais ao processo.

## Demonstrativo, incompleto ou não validado

- Todos os nomes, contas, fotografias e documentos têm de ser fictícios. demo-a/demo-b continuam públicos no loopback e não são contas autenticadas.
- Lista de condições é local e não exaustiva; integração de classificação oficial completa permanece pendente. É possível adicionar nomes ausentes, sem códigos ou diagnóstico.
- Calendário e medicação estruturada continuam em preparação; documentos de prescrição/consulta já podem ser guardados. Sem instituições reais, partilha, Arquivar, diagnóstico, alertas clínicos ou metas automáticas.
- Sem formulário domiciliário dedicado de SpO₂ ou múltiplas leituras de tensão numa sessão; gráficos existentes mantidos.
- Android/iOS: exportações JavaScript concluídas; sem ensaio físico/emulador, APK/IPA, EAS ou publicação. Seletores/câmara nativos, sessões/transporte no dispositivo e persistência anónima por implementar/validar. Biblioteca não é instalação offline independente.
- Sincronização central e papéis Clinical/Partner/Care são apenas especificação em ARCHITECTURE.md; sem concessão profissional, partilha clínica ou cloud implementadas.
- Protocolo de usabilidade apenas preparado, sem participantes recrutados/ensaiados; leitores de ecrã reais e zoom nativo pendentes.

## Problemas e limitações por prioridade

| Prioridade | Pendência confirmada |
|---|---|
| **P0 — antes de dados reais** | Sem auditoria independente de autenticação/privacidade, TLS/encriptação local apropriada ou validação clínica. Contas experimentais não autorizam utilização real/produção. |
| **P1 — identidade** | Correio só em desenvolvimento; operador local privilegiado emite códigos. Entrega/verificação real de e-mail, procedimentos de recuperação e resistência a abuso precisam de avaliação antes de produção. |
| **P1 — clínica** | As 23 fichas aguardam revisão profissional; referência da ureia não confirmada e fontes históricas têm notas explícitas. Imagens clínicas sem OCR independente exigem conferência do original. |
| **P2 — extração** | Fila em memória (cinco vagas, espera limitada), perdida em reinício; pode recusar excesso de carga. Não coordena múltiplos processos. |
| **P2 — capacidade** | SQLite ainda reescreve snapshots e valida documentos. Só pequenas cargas demonstrativas comparáveis foram repetidas; login em massa, históricos grandes e carga de várias contas não foram medidos. |
| **P2 — acessibilidade/manutenção** | Leitores de ecrã reais, dispositivos físicos, zoom nativo e ensaios humanos pendentes. Avisos de depreciação permanecem; auditoria histórica de dependências não foi reavaliada. |

Os dois problemas de integridade do ensaio v0.5 foram corrigidos com regressões. O relatório antigo conserva a reprodução histórica; não os tratar como ainda abertos sem nova evidência.

## Últimas verificações — 08/11/2026

- **146 distintos aprovados na v0.7.1:** 74 API, 34 TypeScript, 33 Chromium, 2 de estrutura e 3 do gerador. Typecheck, pip check e exportação web aprovados; 2 Chromium opcionais de inferência real omitidos. Seis fluxos focados também passaram com o launcher real antes da suite final. Verificados destino/foco/rolagem, ponto importado, falha sem avanço/perda de campos, parâmetro LDL isolado com método ausente, persistência/isolamento e documentos sem resultados. Bases temporárias; sem nova inferência/carga ou exportação nativa nesta correção. Exportações JS Android/iOS da v0.7 são evidência histórica. Detalhes em VALIDATION.md.
- Fluxo de duas contas fictícias novamente verificado: registo/login, perfil/condições autodeclaradas, avatar/fotografia, PDF confirmado, tensão, histórico/gráfico, logout e recarga/novo login com dados recuperados; acesso da outra conta recusado. Menu por teclado/Escape/foco e cabeçalho permanente verificados.
- Regressões de ID/versão, edição concorrente, originais, classificação e fila aprovadas. Preferências isoladas por conta, onboarding, modos sem alteração de dados, períodos, séries e acontecimentos com documentos/conflitos verificados. Parser sem Ollama testado; motor/modelo preservados.
- Contraste dos tokens texto/controlos nos dois temas, foco/teclado/modais e layout a 320/390/1100/1280 px verificados. Capturas novas revistas; zoom CSS 200% continua diferente de zoom real. Sem certificação WCAG, leitor real ou validação clínica.
- Na entrega anterior, sem repetição nesta correção: escrita curta comparável a 50 clientes: p95 de aproximadamente 1674 ms para 272 ms; zero erros inesperados e integridade final preservada. Uma amostra curta, dois perfis demo, não capacidade de produção.
- Prova real da fila: cinco trabalhos aceites até ao limite, dois excedentes recusados, um cancelado e quatro prontos, sem gravação automática. Não é benchmark de inferência. O ensaio histórico de dez minutos/25 clientes não foi repetido nesta v0.6.

Evidência/comandos: [VALIDATION.md](VALIDATION.md) e [LOAD_TEST.md](LOAD_TEST.md). Artefactos/SQLite de ensaio ficam em `tmp`, fora do Git; não copiar dados ou códigos para esta ficha. Leitores de ecrã não ensaiados nesta v0.7; a pesquisa histórica de NVDA não o encontrou, sem nova instalação. Sem certificação WCAG ou teste físico.

## Próximos três objetivos propostos

1. Rever independentemente autenticação/privacidade, procedimentos de recuperação e entrega/verificação de e-mail; definir os requisitos de transporte/encriptação antes de qualquer dado real.
2. Ensaiar autenticação/armazenamento/ficheiros em dispositivos Android/iOS, definir builds EAS e validar a arquitetura de sincronização antes de qualquer cloud; exportação JS não comprova funcionamento nativo.
3. Executar o [protocolo de usabilidade/acessibilidade](USABILITY_PROTOCOL.md) comparando modos, leitores reais e zoom; concluir revisão profissional dos conteúdos. Capacidade/recuperação da fila continuam pendentes, sem extrapolar ensaios históricos.

## Continuidade

Ler esta ficha e AGENTS.md ao retomar. Atualizar concisamente no fim de cada sprint e incluir no commit de entrega; ligar relatórios em vez de os duplicar. Commit/push de novas versões estão autorizados, com revisão dos ficheiros e sem force push. Nunca guardar dados pessoais, segredos, tokens ou conteúdo clínico nesta ficha. Limites de segurança detalhados em [SECURITY.md](SECURITY.md).
