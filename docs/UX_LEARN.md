# Hub e Aprender — 08/11/2026

Implementação sobre a aplicação Expo/React Native existente, com pré-visualização web no Windows. Sem nova dependência, router, base de dados, motor de IA ou integração externa. Dados dos registos continuam inteiramente fictícios.

## Inspeção e alterações

O Hub estava diretamente em App.tsx; já existiam cinco áreas, tema claro/escuro, histórico, gráficos interativos e revisão de documentos. Aprender apresentava apenas uma mensagem, sem catálogo, pesquisa ou glossário. Os termos médicos apareciam nos seletores, títulos dos gráficos, resultados, revisão de importação e campos da tensão. O fluxo v0.4 de extração local e a SQLite foram preservados.

O Hub foi extraído para um único componente, removendo o bloco anterior de App.tsx. Reutiliza Card, T, Button e as rotas existentes. Tem saudação, ações de exame/medição, contagens por perfil, cinco áreas, documentos recentes, últimos parâmetros datados, última tensão e destaque educativo. Exames são ordenados pela importação, preservando separadamente a data do relatório. Sistólica e diastólica só aparecem juntas se forem da mesma sessão e instante, com a mesma unidade; não se inventa uma medição conjunta. Estados vazios não mostram dados de outro perfil nem compromissos fictícios como agendamentos.

Em largura reduzida há mais espaço útil lateral. A navegação mantém os cinco destinos; com ampliação grande, a sua altura é limitada e as opções podem ser percorridas verticalmente, para não ocupar a maior parte da área de leitura. O foco dos títulos de página mantém-se programático para anúncio em leitores de ecrã; os botões continuam com foco visível do navegador.

ClinicalPanel, TimelineChart e ResultDetail mantêm a lógica de séries, datas, unidades, referência, proveniência e acesso ao original. Os gráficos reforçam o último valor e a respetiva data/origem, mantendo pontos selecionáveis e a lista acessível. Nenhuma cor representa uma classificação de risco. Não houve alteração às regras de comparabilidade nem à persistência.

## Ícones e navegação

MedicalTerm e InfoButton usam o mesmo catálogo educativo e LearningProvider. O botão «i» tem área mínima de 44 × 44, nome acessível e abertura por clique/toque/teclado. Em desktop, a explicação é um popover modal junto ao termo, limitado à janela; em largura reduzida, um painel modal inferior com conteúdo rolável e fecho sempre no cabeçalho. Escape/fecho devolvem foco ao botão de origem. Não depende de hover. Abrir/fechar não desmonta nem limpa os campos do formulário.

O cartão curto apresenta definição e utilidade, fonte e estado de revisão. A ficha completa contém seis secções, fontes e revisão. Pode abrir a ficha completa ou a área de evolução do parâmetro. Está ligado ao parâmetro selecionado, gráficos, detalhe/histórico de resultados, cabeçalhos da revisão documental e campos de sistólica/diastólica/pulsação. Termos desconhecidos não recebem uma explicação inventada.

Aprender tem pesquisa sem distinção de acentos, aliases (incluindo HbA1c e SpO₂), seis categorias, destaque do dia e fichas com termos relacionados. A seleção diária depende apenas da data, nunca de resultados ou condições. Os filtros mantêm-se quando se abre uma ficha e se volta à lista. A ligação «Ver histórico deste parâmetro» abre a área correta com esse parâmetro selecionado. Saúde geral e prevenção abre a biblioteca com o filtro Prevenção.

## Conteúdo implementado e limites clínicos

23 tópicos locais: os 15 parâmetros laboratoriais do catálogo v0.4; sistólica, diastólica, frequência cardíaca e SpO₂; e quatro guias: medir tensão, preparar uma consulta, levar uma lista de medicação e compreender um relatório. Categorias: Análises ao sangue, Tensão arterial, Saúde respiratória, Medicação, Consultas, Prevenção.

Modelo tipado em learning/content.ts: id, slug, termo, título, categoria, resumo, aliases, secções, relações, fontes, data de revisão editorial, estado de publicação, estado de revisão clínica e parâmetro associado quando aplicável. Só conteúdos publicados aparecem na pesquisa e nos ícones. As fichas não têm acesso a resultados, doenças, contas ou Ollama. Não usam valores do utilizador, intervalos personalizados, classificações de risco ou conselhos terapêuticos.

Textos originais curtos em português europeu, com fontes portuguesas e internacionais identificadas em cada ficha. Língua, consulta editorial e limitações da referência aparecem no interface. Não são carregadas ao abrir a ficha; abrem apenas por ação do utilizador. Ligações web usam noopener/noreferrer e não transportam valores ou identificadores clínicos. O registo da revisão v0.5 abaixo identifica a exceção da ureia e referências históricas.

**Revisão editorial das fontes: 08/11/2026. Revisão clínica independente pendente**, indicada em todas as fichas e cartões. A publicação é educativa e experimental; não corresponde a aprovação por profissionais portugueses. Não foram copiados intervalos numéricos, metas terapêuticas ou algoritmos das fontes.

Resultado medido, referência do laboratório, histórico pessoal e explicação educativa continuam distintos. Não existe implementação de objetivos clínicos individuais neste sprint. O intervalo laboratorial não é apresentado como objetivo. Educação não garante que um resultado seja seguro ou «normal para uma doença».

## Verificação e utilização

Arranque na raiz com `.\dev.cmd`; abrir http://localhost:8081. No Hub: Adicionar exame/medição, áreas ou Aprender hoje. Nos gráficos/resultados: botão «i». Na navegação: Aprender → pesquisar/escolher categoria → Ler → termos relacionados ou histórico. Educação funciona mesmo se a API estiver indisponível; registos continuam a depender da API.

Comandos PowerShell (parar antes o servidor normal para os testes de navegador):

```powershell
& 'C:\Program Files\nodejs\npm.cmd' --prefix apps/mobile run typecheck
& 'C:\Program Files\nodejs\npm.cmd' --prefix apps/mobile test
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/pytest-ux-local
& 'C:\Program Files\nodejs\node.exe' --test tests/foundation.test.mjs
Set-Location apps/mobile
& 'C:\Program Files\nodejs\npx.cmd' expo export --platform web
& 'C:\Program Files\nodejs\npm.cmd' run test:web
```

Resultados finais e limites dos ensaios registados em VALIDATION.md. Playwright usa SQLite temporária, sem repor a base normal. Não foi executada uma avaliação clínica nem um estudo de usabilidade com pessoas acima dos 55 anos.

## Manutenção e próximos passos

Criados Hub.tsx/hubData.ts, learning/content.ts/Learning.tsx, testes learning.test.ts/learning.spec.ts e este registo. Evoluídos App, ui, ClinicalPanel, TimelineChart, RecordViews, Forms e DocumentImport; teste de gestão passou a localizar o cartão pelo papel funcional, preservando as verificações de editar/eliminar. Não há uma segunda versão do Hub ou do glossário. Capturas de testes novas ficam em tmp; as quatro capturas documentais existentes foram atualizadas.

Prioridades seguintes: revisão clínica independente, confirmação da referência da ureia e ensaios de leitura/navegação com utilizadores e leitor de ecrã. Sem certificação de acessibilidade; zoom CSS 200% não substitui ensaio de zoom nativo/tecnologias de apoio. Android/iOS físicos não testados. Biblioteca local, sem CMS, favoritos, progresso persistido ou sincronização; pesquisas não são guardadas. Medicação e calendário continuam em preparação. O tema persiste na versão web desde v0.5; na nativa continua temporário. A escolha de fontes externas implica acesso à Internet; a consulta dos textos no PULSO funciona localmente.

## Revisão v0.5 — linguagem, fontes e estado editorial

Revistos os 23 tópicos existentes, sem criar catálogo paralelo. Todos têm seis secções curtas, fontes e revisão editorial de 08/11/2026; **todos os 23 continuam pendentes de revisão clínica independente**. A data é da consulta/revisão editorial, não uma data de publicação inventada. Revisão assistida por software não equivale a validação por profissional. `editorialStatus` admite rascunho/revisto; `clinicalReview` é independente. O estado profissional exige nome, qualificação, data e ligação de evidência; a verificação estrutural desses campos não autentica credenciais. Nenhuma ficha tem essa evidência ou esse estado.

| Fichas auditadas | Fontes e resultado editorial | Pendência |
|---|---|---|
| Glicose; HbA1c; hemoglobina; creatinina | MedlinePlus, páginas específicas identificadas no catálogo. HbA1c também DGS 033/2011, atualizada em 06/12/2012, apenas terminologia/interferências. Explicada glicemia; creatinina isolada não exclui problemas renais. | Revisão profissional de cada ficha; norma histórica não usada para limites/metas. |
| Colesterol total; LDL; HDL; triglicéridos | MedlinePlus; LDL/HDL com páginas próprias. Removida qualquer leitura simplista de risco individual. | Adequação clínica/linguística portuguesa por profissional. |
| Ferritina; TSH; T4 livre; vitamina D | MedlinePlus, páginas específicas. TSH contextualizada sem associação automática a diagnóstico; T4 livre distinta de total. | Revisão profissional; sem indicação automática de testes/suplementos. |
| Ureia | Referência laboratorial herdada não confirmada durante a consulta; marcada «não verificada», com nota visível e conteúdo prudente. | Confirmar/substituir por fonte institucional específica e rever a ficha antes de qualquer utilização clínica. |
| Sódio; potássio | MedlinePlus, páginas específicas; contexto da amostra/medicamentos e ausência de limites de segurança. | Revisão profissional. |
| Sistólica; diastólica | NHS, mesma referência identificada para técnica/contexto; tensão e pressão explicadas como designações da mesma medição. | Revisão profissional; sem classificação automática. |
| Frequência cardíaca | MedlinePlus, artigo sobre pulsação; bpm explicado. | Revisão profissional, sem diagnóstico de ritmo. |
| SpO₂ | MHRA, limitações de oximetria, incluindo pigmentação/movimento/sensor. | Revisão profissional; sem alvos ou garantia de segurança. |
| Medir tensão | Fundação Portuguesa de Cardiologia e NHS; data de revisão da página portuguesa não identificada, explicitamente assinalada. | Técnica completa e adequação por profissional. |
| Lista de medicação | INFARMED, brochura de março de 2009, apenas esclarecimento do folheto; FDA, comunicação com farmacêutico. | Atualização de referência portuguesa específica; sem recomendar alterações terapêuticas. |
| Preparar consulta | DGS Literacia em saúde, substitui ligação NIH anterior. | Revisão por profissional e ensaio de compreensão. |
| Ler relatório | MedlinePlus e OMS Literacia em saúde. Resultado, referência, histórico e educação distinguidos. | Revisão profissional; objetivos individualizados não implementados. |

Fontes portuguesas/institucionais consultadas: [DGS — literacia](https://www.dgs.pt/paginas-de-sistema/saude-de-a-a-z/literacia-em-saude.aspx), [SNS 24 — exames e resultados](https://www.sns24.gov.pt/pt/servico/exames-e-resultados/), [INFARMED — folheto informativo, 2009](https://www.infarmed.pt/documents/15786/1228470/Siaba_mais_Folheto_Informativo.pdf/229c3f0f-542a-467b-982a-c753dc51a427?version=1.1), [OMS — literacia](https://www.who.int/news-room/fact-sheets/detail/health-literacy), [ESC — orientação de tensão arterial](https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/elevated-blood-pressure-and-hypertension/), [Fundação Portuguesa de Cardiologia](https://www.fpcardiologia.pt/como-medir-pressao-arterial/). SNS 24/ESC foram consultados para contexto: não há integração, reprodução de tabelas/algoritmos, adoção de limites ou alegação de conformidade clínica com orientações. URLs exatos de cada ficha estão no catálogo; não há validação contínua de links.

Interface revista: «tensão arterial», «colheita», «resultado laboratorial», «intervalo de referência», «hemoglobina glicada», «saturação periférica de oxigénio», «resultado pendente de confirmação», mensagens de guardar/erro e indisponibilidade do serviço local. Termos técnicos acessíveis pelo catálogo comum. Não existe login real para rever; perfis continuam fictícios. Confirmação do utilizador e exemplo fictício de verificação profissional não significam validação clínica.

## Acessibilidade e preferências v0.5

Auditoria dirigida por [WCAG 2.2](https://www.w3.org/TR/WCAG22/), sem declaração de conformidade global. Problemas encontrados e correções:

| Componente | Problema | Correção/verificação |
|---|---|---|
| Button, TimelineChart | `aria-selected` em botão, sem papel compatível | `aria-pressed` nos seletores; ações sem estado artificial; verificado no navegador. |
| ui/Field | Bordas claras insuficientes, foco dependia do estilo padrão | Token `control` distinto de divisórias; foco visível de 3 px. Contraste de campo/foco e texto medido em ambos os temas. Não é auditoria de cada píxel de todas as páginas. |
| Forms/Field | Erros globais sem ligação inequívoca ao campo | `aria-invalid`, descrição ligada ao erro, preservação de valores e foco no primeiro campo inválido. Valida formato, não segurança clínica. |
| Learning | Foco inicial/nome do diálogo e explicação demasiado longa | Nome ligado ao título, fecho focado, ciclo Tab, Escape/retorno; cartão curto e artigo completo partilham catálogo. |
| TimelineChart | Alternativa textual pouco estruturada | Título, descrição, datas/unidade, lista nomeada com origem/documento e botões por teclado. Detalhe selecionado anunciado sem diagnóstico. |
| ClinicalPanel | Valores incompletos podiam parecer ausência de registos | Motivos de exclusão e contagens visíveis; originais continuam no Histórico. |
| Documento web | Língua não explícita | `lang=pt-PT`, hierarquia h1/h2/h3 no conteúdo educativo. |

Tema: `preferences.web.ts` guarda só `pulso.theme.v1` (`light`/`dark`) em localStorage, por origem/navegador. Reinício real de processo Chromium com perfil temporário passou; domínio/porta diferentes têm preferências distintas. Limpeza/bloqueio de armazenamento impede persistência, com aviso sem perda dos dados clínicos na SQLite. `preferences.ts` nativo mantém sessão e avisa da limitação. Não existiam preferências próprias de tamanho, modo simples ou contraste; não foi criado outro sistema. Zoom/tamanho do sistema continuam geridos pelo navegador/sistema.

Novos ficheiros v0.5: dois adaptadores de preferências, testes de preferências/acessibilidade e [protocolo único de usabilidade](USABILITY_PROTOCOL.md). Motor de extração, base, dependências e regras clínicas de comparabilidade intactos. Resultados executados e limites em [VALIDATION.md](VALIDATION.md). Zoom real, NVDA e dispositivos físicos permanecem pendentes, não substituídos por Playwright. Ensaios humanos apenas planeados.

### Inventário de ficheiros desta entrega v0.5

- Criados: `apps/mobile/src/preferences.ts`, `preferences.web.ts`, `apps/mobile/tests/preferences.test.ts`, `apps/mobile/e2e/accessibility.spec.ts`, `docs/USABILITY_PROTOCOL.md`.
- Evoluídos sobre o sprint UX ainda não publicado: `apps/mobile/App.tsx`, `src/ui.tsx`, `src/Hub.tsx`, `src/learning/content.ts`, `src/learning/Learning.tsx`; `src/clinical/ClinicalPanel.tsx`, `TimelineChart.tsx`, `Forms.tsx`, `RecordViews.tsx`, `DocumentImport.tsx`, `PdfPicker.web.tsx`, `data.ts`, `repository.ts` (todos sob `apps/mobile`). `hubData.ts` preserva a implementação do sprint UX.
- Testes adaptados: `apps/mobile/tests/learning.test.ts`, `persistence.test.ts`, `apps/mobile/e2e/learning.spec.ts`, `clinical.spec.ts`, `local-extraction.spec.ts`; os restantes testes existentes foram preservados. `manage.spec.ts` já tinha a adaptação do sprint UX.
- Documentação atualizada: `README.md`, `apps/mobile/README.md`, `docs/UX_LEARN.md`, `VALIDATION.md`, `GUIA_WINDOWS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DECISIONS.md`. As quatro capturas documentais existentes foram regeneradas pela suite; novos artefactos ficam em `tmp`.

O estado Git inclui também os ficheiros novos do Hub/Aprender do sprint anterior, ainda sem commit. Não representam uma reconstrução adicional nesta v0.5.


## Incremento v0.7
Os mesmos componentes educativos e 23 fichas são usados nos três modos, sem conteúdo clínico novo ou revisão profissional alegada. ThemeProvider aplica tokens/escala/contraste; ajuda guiada é opcional e não deriva da idade. Hub reordena áreas por escolha explícita e mantém resumos expansíveis no modo Simples. Preferências/onboarding, gráficos alinhados e acontecimentos estão descritos em ARCHITECTURE.md; resultados finais em VALIDATION.md. Mantêm-se as limitações editoriais/clínicas anteriores.
