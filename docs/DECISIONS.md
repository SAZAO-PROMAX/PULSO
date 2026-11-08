# Decisões — 07/11/2026
## Sprint UX e Aprender — 08/11/2026
Preservar Expo, cinco áreas, navegação, componentes de gráficos e ApiRepository. Evoluir Hub numa implementação única e criar catálogo educativo local tipado, com fontes, data editorial e revisão clínica pendente. Um único componente informativo acessível por toque/teclado, com popover modal em desktop e painel inferior em largura reduzida. Sem dependências novas, conteúdo personalizado, IA educativa ou CRUD de medicação/calendário. A biblioteca funciona sem a API, mantendo dados laboratoriais e educação separados. Implementação e limitações em UX_LEARN.md.

> Estado atual: decisões históricas abaixo; atualização v0.4 no final.
| ID | Decisão | Origem/estado |
|---|---|---|
| D01 | Portugal primeiro; foco em acessibilidade e maiores de 55 anos | PRD |
| D02 | Cinco áreas, sem health score | PRD |
| D03 | Onboarding sem obrigatoriedade de declarar doenças | PRD |
| D04 | Extração determinística/OCR local, revisão obrigatória, sem LLM | PRD |
| D05 | Sem alvos seguros gerados por diagnóstico declarado | PRD |
| D06 | Expo/TypeScript e FastAPI/Python; PostgreSQL futuro | Stack proposta no PRD, ainda não instalada |
| D07 | Dados exclusivamente sintéticos; sem integração SNS real | PRD |
| D08 | Cuidador e instituições sem acesso global por defeito | BrainStorm |
| D09 | Entrega atual é fundação documental; Sprint 0 ainda por executar | Decisão operacional desta preparação |
| D10 | Não inventar o final truncado do PRD | Limitação da recuperação |

## Em aberto
Versões compatíveis de Expo/Node/Python e dependências; alojamento, autenticação, armazenamento e retenção; modelo comercial validado; revisão de conteúdos educativos; avaliação clínica/regulatória.
B2C e B2B2C são hipóteses, não receitas comprovadas.

## Ambiente de desenvolvimento atualizado
Windows/PowerShell no ASUS TUF A16 é o ambiente principal, por indicação do utilizador. Começar pela web e verificar Android numa etapa posterior. O guia Mac foi substituído por GUIA_WINDOWS.md. A stack de produto mantém-se.

## Implementação Sprint 0
Expo 57 (React Native 0.86.3 / React 19.2.3), Node 24.22.1 e Python 3.15.2. Dependências reproduzíveis por package-lock.json e requirements-dev.txt. API limitada a estado operacional; JSON local na interface; não existe autenticação. Onboarding completo fica na Sprint 1. Revisão Android e acessibilidade ampliada ainda pendentes.

## Sprint 1 — âmbito atualizado pelo utilizador
Em 07/11/2026, resultados clínicos sintéticos e gráficos passam a ser o âmbito da Sprint 1, antecipando módulos do plano original. Onboarding completo continua pendente. Preservada a interface Expo; escolhido repositório de fixtures assíncrono por não existir banco operacional. Sem conversão automática de unidades; métodos/contextos diferentes separados; referências e originais preservados. Sem nova dependência de gráficos: Views e Pressables React Native, incluindo lista acessível dos pontos.

## Integração funcional e otimização da interface
Mantida a stack e navegação. Criados tokens claro/escuro e componentes comuns, seletor de parâmetro/período e histórico único. Persistência apenas web localStorage por perfil, sem fingir backend de dados. Migração explícita das duas leituras antigas; sem duplicação. Nova dependência PyMuPDF 1.28.2 justificada por extração determinística de PDFs sintéticos com texto. Parser isolado com limites e confirmação humana antes de gravar. PDF original, hash, parser e linha/valor extraídos preservados. Sem OCR, IA, dados reais ou partilha. Uso local numa janela; sem proteção de concorrência entre separadores. Histórico das sprints anteriores não representa o estado atual.

## Estabilização
SQLite local é a única persistência ativa, com transações e migração da cópia antiga; não é PostgreSQL. Sem novas dependências. Sem login existente, não criar infraestrutura de autenticação neste sprint: âmbito por perfil no backend é demonstrativo. Editar/eliminar no Histórico existente, nunca Arquivar. Root npm run dev e dev.cmd substituem o arranque dependente do Codex; não matar servidores desconhecidos nem reutilizar só por /health. Checkpoints em STABILIZATION.md; sem commit de trabalho preexistente.

## v0.4 — 08/11/2026
O pedido explícito do utilizador substitui D04: permite extração híbrida exclusivamente local com qwen3-vl:4b, sem interpretação clínica. Mantêm-se parser determinístico, SQLite única, confirmação humana e funcionamento sem Ollama. Adaptador REST httpx existente, sem SDK nem dependência nova; URL/modelo fixados por lista permitida, sem ferramentas/proxies/redirecionamentos. Seleção por página; visão apenas quando necessária. Não existe OCR independente: resultados visuais são sempre assinalados como não verificados por texto.
Catálogo JSON partilhado: 12 parâmetros pedidos mais ureia/sódio/potássio para ensaiar um relatório de 15 parâmetros distintos. Só nomes/unidades, sem faixas clínicas ou códigos LOINC/UCUM inventados. Métodos/amostras/datas ausentes não são preenchidos para forçar gráficos. Destaque só com região textual inequívoca, recalculada no original guardado. Rascunhos continuam em memória; não são dados confirmados. Detalhes e evidência em LOCAL_EXTRACTION.md.

## v0.5 — linguagem, educação e acessibilidade
Reutilizar o único Hub, catálogo de 23 fichas e LearningProvider. Separar revisão editorial de revisão clínica com evidência profissional, sem atribuir aprovação artificial. Fontes históricas/não confirmadas têm notas visíveis; nenhum limiar ou objetivo terapêutico foi introduzido. Popover curto/ficha completa partilham conteúdo. Lista de pontos e motivos de exclusão complementam o gráfico sem mudar comparabilidade. Corrigir estados web, foco, bordas e associação de erros nos componentes existentes, sem dependências.
Persistir só tema no localStorage web; adaptador nativo mantém sessão e informa a limitação, pois os fluxos suportados/verificados são web Windows. Não existiam outras preferências próprias de acessibilidade. Criar apenas um protocolo de usabilidade, com recrutamento planeado e grelha vazia; não inventar ensaios humanos. Zoom real/NVDA/dispositivos físicos ficam explicitamente pendentes. Não alterar pipeline Ollama, SQLite ou arquitetura de extração.

## v0.6 — integridade, organização e contas experimentais
IDs iguais com conteúdo diferente devolvem 409; datas equivalentes com fusos diferentes são idempotentes. Versão por documento/resultado e If-Match obrigatório para editar/eliminar; resultado alterado incrementa documento pai. Migração aditiva de campos, sem apagar originais/dados anteriores. Admissão de escrita ordenada no event loop após medição de p99; manter SQLite transacional e snapshots, sem PostgreSQL.
Fila de extração local limitada e volátil, uma vaga de processamento partilhada com o endpoint anterior. Não aumentar concorrência GPU ou workers. Catálogo organizacional partilhado; especialidades múltiplas por documento, sem copiar ficheiros. Documentos não laboratoriais não passam pela extração nem geram medições. Classificação não interfere na comparabilidade dos resultados.
Contas usam a mesma SQLite e ApiRepository, sem converter perfis demo. Primitivas FastAPI/Starlette, sessões opacas revogáveis, Argon2id via argon2-cffi (nova dependência direta justificada para hashing), CSRF/Origin e limites de tentativas. Sem JWT/localStorage de acesso, serviço externo pago ou segunda persistência. Correio em desenvolvimento com emissão local privilegiada de códigos de uso único; não simular envio nem titularidade externa. Fotografia sintética privada é reencodificada pelo PyMuPDF existente; sem Pillow, reconhecimento facial ou Ollama. Contas experimentais não autorizam dados reais nem constituem auditoria de segurança.


## v0.6.1 — sessão no arranque Windows
Remover o hostname da API forçado pelo launcher e reutilizar a seleção existente pelo hostname do navegador, preservando configuração explícita. Confirmar o cookie via consulta à sessão antes de aplicar login à interface; sem relaxar SameSite, Origin ou CSRF. Acrescentar modo de regressão Playwright com o launcher real e SQLite temporária, além da exportação estática. Sem migração ou alteração de contas/dados existentes.


## v0.6.1 — otimização do perfil, 08/11/2026
Nascimento obrigatório em novos registos e atualizações de perfil, validado no frontend/backend (1900 até hoje, calendário real). Não inventar datas nem alterar contas antigas: login mantém acesso e o Hub pede completar o campo. Sem nova personalização clínica. Condições continuam opcionais/autodeclaradas; catálogo local partilhado com nomes/sinónimos, atalhos frequentes e nomes livres limitados para não excluir condições ausentes. A lista não é completa nem usa códigos clínicos. Não integrar serviços externos na pesquisa ou enviar dados do perfil. Um catálogo oficial completo requer integração/distribuição própria; [API da OMS](https://icd.who.int/icdapi) consultada, sem credenciais ou chamadas clínicas incorporadas.
Reutilizar componentes/temas: eliminar prefixos repetidos, apresentar selecionadas removíveis, calendário web e um Avatar comum para pré-visualização/cabeçalho. Oito opções locais, sem biblioteca ou imagens geradas; fotografia privada mantém prioridade até remoção explícita. Preservar SQLite, versões/If-Match, sessões, CSRF e contas existentes; nenhuma dependência nova.


## v0.7 em desenvolvimento — checkpoint A/B/C, 08/11/2026
Reutilizar os tokens/componentes e persistir experiência no JSON da conta na mesma SQLite, com sessão/CSRF/If-Match. Modo não altera autorização; tema local anónimo é separado da preferência da conta. Tema sistema e redução de movimento do sistema são respeitados. Onboarding opcional de sete passos, retomável; condições usam o seletor existente e não geram objetivos. Hub único com ordem por áreas prioritárias, resumos expansíveis no modo Simples e acesso aos mesmos destinos.
Comparações usam TimelineChart em painéis com eixo temporal comum, escalas/unidades independentes e grupos de comparabilidade intactos. Períodos personalizados incluem dias UTC completos. Desenho limitado preserva extremos por bloco, com todos os pontos na lista paginada. Nenhuma conversão, valor em falta ou causalidade é inferida. Testes iniciais: 14 API de contas, onboarding/perfil/gráficos no launcher real e typecheck; resultados finais serão registados em VALIDATION.md.
