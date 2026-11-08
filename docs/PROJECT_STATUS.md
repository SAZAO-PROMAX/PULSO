# Estado atual do PULSO

Resumo de continuidade. Evidência e matriz de parâmetros em [VALIDATION.md](VALIDATION.md); comandos em [GUIA_WINDOWS.md](GUIA_WINDOWS.md).

## Versão e Git

- **Atualização:** 08/11/2026, Europe/Lisbon. **Versão:** v0.7.1 experimental, frontend/Expo/API `0.7.1`.
- **Branch:** main. **Base desta entrega:** `2258446e4163da55a315a1d9cf9b5805eb7638dc`, checkpoint da simplificação, após os checkpoints A/B/C. Esta ficha acompanha a entrega final; consultar `git log -1 -- docs/PROJECT_STATUS.md` para o commit correspondente, sem inventar um hash futuro.
- **Repositório:** https://github.com/SAZAO-PROMAX/PULSO. Confirmar estado local/remoto ao retomar. Publicar versões está autorizado, sem force push e sem dados/segredos.

## Funcionalidades realmente implementadas

- Página pública curta: entrar, criar conta, recuperar acesso e informação de privacidade. Enquanto verifica a sessão, mostra estado neutro. Sem sessão não monta o ambiente privado nem pede dados clínicos.
- Área pessoal exige sessão verificada; endpoints de saúde verificam sessão/CSRF/Origin e dono. Rotas internas usam lista explícita, sem redirecionamentos externos. Logout revoga a sessão, desmonta dados privados e regressa à entrada pública; respostas 401 antigas não invalidam uma sessão mais recente.
- Novas contas inicializam diretamente sem documentos, medições ou acontecimentos. Fixtures clínicas estão fora do código da aplicação, num auxiliar de testes. **Nenhuma limpeza da base normal foi efetuada**; contas/registos/preferências anteriores foram preservados.
- Demo-a/demo-b só são utilizáveis com contexto de teste confirmado pelo servidor, flag explícita e base resolvida dentro de tmp. A opção de compilação não autoriza acesso. Reposição exige confirmação do perfil e não altera outras contas; não há reposição global no ambiente pessoal.
- Guardar exame, com ou sem extração, abre o detalhe; a evolução fica a um botão de distância. Tensão abre o registo guardado; acontecimento abre a cronologia. Edição conserva o detalhe e filtros; eliminação retira o registo e volta à lista. Erros/conflitos preservam campos e não apresentam sucesso antecipado.
- Hub compacto com ações principais, cinco áreas e resumos só quando existem dados. Registar mostra quatro categorias iniciais, pesquisa e todas as oito categorias por expansão. Histórico tem pesquisa, ordem cronológica e filtros recolhidos, incluindo origem. Estados vazios têm ações específicas.
- Três modos partilham dados/permissões. Preferências de tema/sistema, texto, contraste, movimento e ajuda persistem na conta. Onboarding de sete passos continua opcional/retomável, com conclusão rápida após escolher modo. Perfil organizado por Conta, Informação de saúde, Aparência e Privacidade.
- Nascimento **continua obrigatório**, por confirmação explícita do utilizador neste sprint; não é utilizado para inferir competências, modo ou limites clínicos. Condições opcionais/autodeclaradas: lista local não exaustiva e adição manual. Oito avatares e fotografia fictícia privada.
- Gráficos de 15 parâmetros laboratoriais e quatro vitais; unidades/métodos/amostras incompatíveis separados. Comparação por painéis alinhados, períodos e intervalo personalizado, pontos/origem/original, exclusões explícitas e lista completa paginada. Opções avançadas recolhidas por defeito no modo Equilibrado.
- Acontecimentos versionados, referências documentais, histórico de edição, marcadores/duração e alternativa textual. Sem causalidade automática. Eliminar acontecimento preserva exames; eliminar exame retira referências ativas atomicamente.
- Importação sintética PDF/PNG/JPEG: parser conhecido ou Ollama local, revisão/correção e confirmação humana antes de persistir. Fila limitada, uma extração de cada vez. Aprender mantém 23 fichas, sem nova revisão clínica nesta entrega.

## Arquitetura em utilização

| Camada | Estado confirmado |
|---|---|
| Interface | Expo 57, React Native 0.86.3, React 19.2.3, TypeScript/react-native-web; componentes e tokens existentes, sem biblioteca visual nova. |
| Entrada/navegação | SessionGate/PublicEntry, rotas hash permitidas e uma Shell privada; AuthProvider mantém sessão/CSRF em memória. |
| Backend | FastAPI/Starlette, Argon2id, cookie HttpOnly/SameSite Strict, proteção Origin/CSRF e versões/If-Match. Prefixo histórico /demo não significa acesso público. |
| Persistência | Mesma SQLite .local/pulso.sqlite3; snapshots por dono, contas/sessões/preferências, transações e admissão ordenada. Sem migração destrutiva ou segunda base. |
| Documentos/IA | PyMuPDF e Ollama loopback/qwen3-vl:4b; originais preservados, sem novo modelo ou expansão da finalidade. |

## Demonstrativo, não suportado ou não validado

- Apenas identidades, fotografias e documentos fictícios; sem validação clínica, diagnóstico, metas terapêuticas ou partilha de produção.
- Parser determinístico conhecido cobre cinco analitos; catálogo/validação não garantem extração de todos os PDFs. A matriz distingue parser, modelo, API e UI; inferência real dos 19 parâmetros não foi ensaiada neste sprint.
- Correio continua em desenvolvimento, sem envio real nem prova externa de titularidade. Recuperação/verificação por operador local privilegiado.
- Sem formulário domiciliário de SpO₂, calendário/medicação estruturados, cloud, integrações institucionais ou papéis profissionais implementados. Especificações futuras em ARCHITECTURE.md.
- Android/iOS sem ensaio físico/emulador; seletores/câmara/sessões móveis pendentes. Exportações JS da v0.7 são evidência histórica e não apps instaladas/publicadas.
- Formulários não persistem após recarga; detalhes selecionados não têm URL individual. Fila de extração é volátil e não coordena vários processos.

## Problemas conhecidos por prioridade

1. **P0 antes de dados reais:** auditoria independente de autenticação/privacidade, transporte e proteção em repouso apropriados, finalidade/retenção e avaliação clínica/regulatória competentes pendentes.
2. **P1 acessibilidade/conteúdo:** leitores reais, zoom real e ensaios humanos pendentes; 23 fichas aguardam revisão profissional. Sem certificação WCAG.
3. **P1 identidade/móvel:** entrega/verificação real de e-mail, recuperação auditada e integração de sessão/ficheiros em dispositivos por concluir.
4. **P2 capacidade/manutenção:** snapshots SQLite, fila volátil e cargas autenticadas/históricos grandes por medir; avisos de depreciação e auditoria histórica de dependências não reavaliados.

## Última validação — 08/11/2026

**198 testes distintos aprovados:** 100 API, 55 TypeScript, 34 Chromium em contexto demonstrativo isolado, 4 Chromium na aplicação normal sem demonstração, 2 de estrutura e 3 do gerador. Dois testes opcionais de inferência real omitidos. Typecheck, pip check e exportação web aprovados. Sem carga/inferência GPU ou exportação nativa nova.

Catálogo completo percorrido programaticamente: 19 casos API, 19 casos do modelo e seleção/proveniência dos 19 no navegador. Matriz e limites em VALIDATION.md. Verificados cinco tamanhos (320/390/768/1100/1280), três modos, contraste dos tokens, teclado/foco/modais e zoom CSS 200%. Capturas antes/depois revistas, inteiramente fictícias; artefactos e bases em tmp, fora do Git. Não houve leitores reais, zoom real, participantes ou certificação.

## Próximos três objetivos

1. Rever independentemente autenticação, privacidade, recuperação de conta e requisitos de proteção antes de qualquer dado real.
2. Executar o protocolo humano de usabilidade/acessibilidade, com leitores reais e zoom, e concluir revisão profissional dos conteúdos.
3. Validar sessão, armazenamento e seletores em dispositivos Android/iOS antes de builds/distribuição; manter sincronização/portais apenas como especificação até revisão própria.

## Continuidade

Atualizar concisamente no fim de cada sprint e incluir no commit de entrega. Reutilizar os relatórios existentes. Nunca guardar dados pessoais, tokens, documentos clínicos ou bases no relatório/Git. Distinguir sempre testes executados de planos e certificação.
