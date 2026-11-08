# Decisões — 07/11/2026
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
