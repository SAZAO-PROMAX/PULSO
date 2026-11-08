# Estado atual do PULSO

**Fecho da v0.6:** etapas de integridade, fila, organização e contas/perfil implementadas; 111 testes aprovados. Histórico anterior preservado nos checkpoints `cca50b2`, `6586bbe` e `2252aed`. O resumo abaixo será substituído pela ficha consolidada no commit de entrega; o estado atual confirmado está em [VALIDATION.md](VALIDATION.md).

Ponto de entrada para continuar o trabalho em Codex, ChatGPT ou Work. Resumo do estado local confirmado; os relatórios ligados abaixo conservam os detalhes e a evidência.

## Versão e referência Git

- **Atualização:** 08/11/2026, 13:31, Europe/Lisbon.
- **Versão funcional local:** PULSO **v0.5**, experimental, segundo o README e as alterações existentes. A versão técnica de `apps/mobile/package.json` continua `0.0.1`; não foi criada outra versão nesta tarefa documental.
- **Branch:** `main`. **Commit de referência verificado:** `30b933bdd08e13723514a987a62a650afe1a7d01` — integração local Ollama v0.4, de 08/11/2026.
- **Estado da entrega:** v0.5, ensaio de carga e esta atualização documental têm alterações locais ainda sem commit. O commit acima é a base Git, não um commit que já contenha essas alterações. Não há confirmação de publicação destes incrementos. Ao retomar, verificar `git status` e `git log -1`; não assumir que a cópia no GitHub contém o estado local.

## Realmente implementado

- Hub único, navegação pelas cinco áreas, resumos por perfil e estados vazios; tema claro/escuro, persistido no navegador.
- Histórico, gráficos interativos por parâmetro/período, consulta de data/unidade/origem/documento, lista textual por teclado e explicações de exclusão. Unidades, métodos e amostras incompatíveis permanecem separados.
- Registo manual de tensão com revisão, gravação, correção e eliminação; sistólica/diastólica independentes e gráficos de frequência cardíaca/SpO₂ a partir dos registos existentes.
- Importação de PDF/PNG/JPEG **sintéticos**, parser determinístico e extração Ollama local quando necessária; revisão/correção/exclusão de propostas, confirmação explícita, original e proveniência preservados. Há introdução manual e funcionamento limitado sem Ollama.
- SQLite real pela API, migração da antiga cópia do navegador, edição/eliminação transacionais e versões anteriores de correções. Rascunhos não confirmados continuam temporários.
- Aprender: 23 fichas locais, seis categorias, pesquisa e explicações partilhadas entre páginas/formulários. Revisão editorial identificada; consulta dos textos não exige Internet, mantendo o serviço web local ativo. Fontes externas só abrem por ação explícita.
- Gerador de carga isolado, com base temporária, patamares, métricas e provas de concorrência; não é uma funcionalidade disponibilizada ao utilizador da aplicação.

Detalhes: [Hub, educação e acessibilidade](UX_LEARN.md), [extração local](LOCAL_EXTRACTION.md) e [guia Windows](GUIA_WINDOWS.md).

## Arquitetura e serviços

| Camada | Em utilização |
|---|---|
| Interface | Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript; versão web Windows verificada, com react-native-web. |
| Arranque | `dev.cmd` na raiz inicia os serviços locais; interface normalmente em `http://localhost:8081`. |
| API | FastAPI/Pydantic, em `127.0.0.1:8000`; `ApiRepository` é a fonte ativa dos registos do frontend. |
| Persistência | SQLite única em `.local/pulso.sqlite3`, snapshots JSON por perfil; não PostgreSQL. |
| Documentos | PyMuPDF e parser conhecido; originais/evidência persistidos na mesma SQLite após confirmação. |
| Inferência | Backend → Ollama em loopback, porta 11434, modelo permitido `qwen3-vl:4b`. Sem modelo no frontend ou serviço cloud. |
| Preferência web | Apenas tema em localStorage; não é a persistência clínica ativa. |

Estas são configurações/implementações verificadas, não uma sondagem contínua de disponibilidade. Ver [arquitetura](ARCHITECTURE.md).

## Demonstrativo, incompleto ou não implementado

- Só dois perfis fictícios; não existem contas autenticadas nem isolamento de produção. Todos os documentos/registos utilizados têm de ser fictícios, apesar de a gravação local funcionar.
- Medicação e consultas continuam em preparação; sem calendário completo, gestão avançada, partilha ou integrações institucionais reais.
- Leituras de SpO₂ existentes podem ser consultadas; não há confirmação de um formulário domiciliário dedicado de SpO₂ nesta entrega. Múltiplas leituras na mesma sessão de tensão continuam futuras.
- Android/iOS físicos não verificados; seletor documental nativo não implementado e tema nativo apenas de sessão. Biblioteca local não equivale a uma aplicação instalada para funcionar sem o servidor.
- Protocolo de usabilidade preparado, **sem recrutamento ou sessões realizadas**. Sem diagnóstico, triagem, alertas clínicos, objetivos terapêuticos automáticos ou chatbot médico.

## Problemas conhecidos, por prioridade

| Prioridade | Estado confirmado / ação necessária |
|---|---|
| **P0 — impede dados reais** | Sem autenticação/autorização de produção ou encriptação apropriada. Cabeçalho de perfil não prova identidade. Manter exclusivamente dados fictícios. |
| **P1 — gravação enganadora** | Repetir o ID de uma sessão de tensão com valores diferentes devolve sucesso sem aplicar os novos valores. Reproduzido; ainda não corrigido. |
| **P1 — edição concorrente** | Duas edições do mesmo resultado são aceites; a última escrita prevalece, sem aviso de conflito. Versões anteriores preservadas, mas sem precondição de versão. |
| **P1 — validação educativa** | As 23 fichas aguardam revisão clínica independente; referência da ureia não confirmada e fontes históricas têm limitações explícitas. Não apresentar revisão editorial como validação médica. |
| **P2 — importação/carga** | Um extrator por processo; a 25 clientes, 88,8% dos pedidos do cenário PDF receberam 429. Escritas a 50 clientes ultrapassaram o objetivo provisório de p95. Não há demonstração de capacidade de produção. |
| **P2 — acessibilidade e uso** | Zoom real, NVDA, TalkBack/VoiceOver, dispositivos físicos e ensaios com participantes pendentes. Não há certificação WCAG. |
| **P2 — dependências/entrega** | Auditoria histórica de dependências não foi reavaliada; avisos de depreciação documentados permanecem. Alterações locais v0.5/carga ainda sem commit/publicação confirmada. |

Provas e reprodução: [relatório de carga](LOAD_TEST.md). Pendências editoriais: [UX_LEARN.md](UX_LEARN.md). Não foram corrigidos problemas funcionais nesta atualização.

## Últimas verificações registadas — 08/11/2026

| Âmbito | Resultado efetivamente registado |
|---|---|
| Funcional v0.5 | **92 aprovados:** 25 TypeScript, 23 Chromium, 42 API e 2 de estrutura. Typecheck/exportação web aprovados. Dois testes opcionais de inferência no navegador não repetidos nessa suite. |
| Carga HTTP | Patamares curtos 1/10/25; leituras/escritas a 50, interrompendo a subida pelo objetivo de latência. Ensaio misto: 25 clientes nos dois perfis, 600 s a carga plena, 70 709 pedidos, p95 272 ms, p99 737 ms, zero erros inesperados; verificações de integridade finais aprovadas. |
| Segurança do gerador | Três testes unitários aprovados; compilação Python e smoke dos cinco cenários aprovados. Prazo máximo e recusa de porta ocupada ensaiados. |
| Inferência separada | Um PDF sintético, uma extração local sequencial: cerca de 10 s, três propostas esperadas, todas pendentes; sem gravar resultados. Não é um benchmark de capacidade nem validação clínica. |

Fontes: [VALIDATION.md](VALIDATION.md) e [LOAD_TEST.md](LOAD_TEST.md). Carga acelerada de API, com gerador e servidor na mesma máquina; não simula centenas de navegadores nem utilizadores autenticados. Patamares 100–1000 não executados. A base normal manteve o hash no ensaio isolado; artefactos técnicos ficam em `tmp`, fora do Git. **Os testes acima são os últimos registados, não foram repetidos nesta tarefa exclusivamente documental.**

## Segurança e validação clínica

Aplicação experimental, sem aprovação para produção, certificação WCAG, validação clínica independente ou demonstração de conformidade legal. Não guardar dados reais. Confirmação pelo utilizador não equivale a validação médica. Texto/valor/unidade e proveniência são verificados conservadoramente; imagens não têm OCR independente e exigem conferência do original. Inferência local pode errar e não elimina os riscos de conteúdo não fiável. Nunca inferir garantias de segurança clínica, diagnósticos ou alterações de tratamento. Ver [SECURITY.md](SECURITY.md).

## Próximos três objetivos propostos

1. **Integridade de gravação:** distinguir repetição idêntica de ID com conteúdo alterado e definir deteção de edições concorrentes, com regressões essenciais antes de publicar a correção.
2. **Importação e estabilidade:** melhorar espera/repetição limitada e mensagens de indisponibilidade; medir custos SQLite/validação e repetir carga com pausas mais próximas do uso humano, sem substituir a arquitetura sem evidência.
3. **Validação para ensaios controlados:** revisão profissional das fichas/fontes e execução do [protocolo de usabilidade/acessibilidade](USABILITY_PROTOCOL.md), incluindo leitores de ecrã e zoom real. Manter apenas dados sintéticos até cumprir as condições de segurança.

## Continuidade entre ferramentas

Ler este ficheiro e `AGENTS.md` ao retomar; consultar os relatórios ligados para detalhes. Após cada sprint, atualizar aqui apenas mudanças, prioridades, testes realmente executados e referência Git/publicação; incluir a ficha no commit de entrega quando apropriado. A autorização permanente para commit/push de novas versões está em `AGENTS.md`. Não duplicar relatórios nem copiar dados pessoais, segredos ou conteúdo clínico para esta ficha.
