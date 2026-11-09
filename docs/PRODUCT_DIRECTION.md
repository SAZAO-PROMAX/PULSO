# PULSO — reorientação de produto e prompt de execução

09/11/2026. **Briefing e proposta, não implementação nem nova versão.** Base inspecionada: `005849fc2658269f99fa11872b5ffd0273799883`, v0.7.4 experimental. Estado técnico em PROJECT_STATUS.md; diagnóstico Android em MOBILE_VALIDATION.md. Pesquisa pública realizada nesta data, sem contas, pagamentos, ensaios práticos dos concorrentes ou pretensão de cobrir todo o mercado. Work recebeu contexto técnico/histórico e feedback para aprofundar esta investigação; a investigação abaixo integra a análise local e a direção convergente recebida do Work, mantendo as fontes primárias identificadas.

## Mudança de direção pedida pelo utilizador

O objetivo passa a ser uma experiência pessoal de saúde com tarefas concluídas e feedback útil, não reduzir tudo a caixas/formulários. Quer menus alinhados, desktop com melhor utilização do espaço, interações/animações intencionais, identidade própria e estabilidade. A prioridade relatada continua a ser importar → rever → guardar → **abrir os gráficos dessa análise**, para os parâmetros laboratoriais, não apenas tensão. O pedido atual substitui a antiga decisão guardar → detalhe. Detalhe/original devem continuar acessíveis. Nascimento obrigatório mantém-se; modos não alteram permissões.

Pede também futura interpretação de radiografia. Preservar este objetivo na investigação, distinguindo três produtos: guardar/visualizar imagem, ler e explicar o relatório escrito, e inferir achados nos píxeis. O último tem exigências próprias de evidência, finalidade, avaliação clínica e revisão profissional; não pode ser anunciado como função validada do modelo genérico atual.

## Evidência local: vídeo e código

Vídeo fornecido: 2m36s. Inspeção por amostragem de fotogramas a cada 12 s e de 2 s entre40–56s; **não foi feita transcrição nem escuta integral do áudio**. Fotogramas ficam apenas em tmp; não publicar vídeo, imagens, dados da conta ou documentos mostrados.

| Evidência | Observação | Consequência / grau de certeza |
|---|---|---|
| ~12–24s,52–54s | 5 propostas,5por rever,0revistos,0avisos; ação verde Confirmar e guardar visível | Impedimento de revisão é pouco acionável. Não equivale a erro demonstrado de persistência |
| Lista compacta | Ação visível é Editar; marcar revisto está dentro do editor | Revisão humana está escondida numa ação que parece só servir para correções |
| Código DocumentImport.confirm/confirmRows | Recusa linha não revista; erro apresentado antes do corpo da revisão | Possível erro longe do clique, sem foco/scroll de recuperação adequado. Reproduzir em browser isolado antes de declarar corrigido |
| App.saved | Documento confirmado abre detalhe/Histórico | Contradiz o NOVO destino pedido; comportamento anterior foi intencional, não falha histórica |
| ~30–46s | Vistas de tensão e vários controlos verdes de igual peso | Há interação, mas sem hierarquia e com demasiadas opções expostas |
| ~144s | Colesterol total selecionado,0resultados e estado vazio | Não prova falta de gráfico: não foi confirmado conjunto de resultados para esse parâmetro. Não inventar pontos |
| Desktop | Faixa central, espaço lateral amplo; controlos ocupam largura excessiva | Inferência de desenho: adaptar a densidade por tarefa, não alargar indiscriminadamente Perfil/artigos |
| Servidor | Utilizador volta a relatar paragens; consulta atual encontra launcher/Metro em execução | Falha intermitente ainda sem reprodução/causa demonstrada. Relatório anterior de recuperação não garante uptime |
| Logs existentes | Avisos “Unexpected text node” associados a History/RecordViews | Pista técnica a reproduzir separadamente; não concluir que derrubou a API/servidor |

Os testes anteriores comprovam percursos programados que sabiam abrir Editar e marcar cada linha; não demonstram que a ação era descobrível para uma pessoa. Sucesso técnico e sucesso de tarefa são critérios diferentes.

## Comparação representativa de concorrentes e referências

As capacidades abaixo são descritas nas fontes oficiais, não certificadas/testadas por nós. “Não comprovado” não significa “não existe”. Não verificados preços atuais, disponibilidade de todas as funções em Portugal, acessibilidade real ou segurança interna. Não transportar claims clínicos/de conformidade para o PULSO.

| Produto / relação | Evidência pública | Padrão útil para PULSO | Limite / o que não copiar |
|---|---|---|---|
| [SNS24](https://www.sns24.gov.pt/pt/todos-os-servicos/digitais/) — referência institucional PT | Exames/resultados, medições, resumo e serviços | Organizar entradas por tarefa reconhecível, contexto português | Não fingir integração SNS nem equivaler contas experimentais à identidade oficial |
| [My CUF](https://www.cuf.pt/noticias/my-cuf-gerir-sua-saude-nunca-foi-tao-facil) — portal de prestador | Revisão2026 destaca menos passos, exames/histórico e acesso web/app | Fazer a tarefa principal chegar ao resultado, acesso consistente | Rede CUF não é agregação independente multi-instituição; comparar esta limitação com a ambição PULSO |
| [MY LUZ, folheto2026](https://www.hospitaldaluz.pt/Portals/_default/SiteData/GlobalAssets/Documentos/1.%20Hospital%20da%20Luz/folheto-my-luz-pt-2026.pdf) — portal PT | Documentos externos, resultados, medições e Monitor de Saúde | Documento e monitorização têm de se ligar no percurso | Não anunciar integrações Apple/HealthConnect, consulta médica ou partilha já implementadas |
| [+Lusíadas](https://www.lusiadas.pt/resultados-exames) — portal PT | Relatórios, imagens de imagiologia e download no mesmo acesso | Tornar original/relatório fácil de encontrar junto ao exame | Mostrar uma radiografia não é diagnosticá-la; não copiar partilha externa nesta fase |
| [Guava](https://guavahealth.com/article/getting-your-records-into-guava) — concorrente funcional mais próximo | Importa PDF/fotos, reúne registos e apresenta biomarcadores; também descreve imagem DICOM | Exame entra numa biblioteca pesquisável e alimenta evolução, com correção | Integrações referidas sobretudo nos EUA; não presumir conectividade PT, nem copiar health scores ou IA indiscriminadamente |
| [WHOOP trends](https://www.whoop.com/us/en/thelocker/track-progress-with-new-trend-views/) — referência de interação | Vistas semanais/mensais/6meses de métricas | Gráfico como destino de exploração, seleção temporal curta | Wearable/performance não equivale a laboratório; não copiar scores/metas clínicas |
| [Oura](https://support.ouraring.com/hc/en-us/articles/360058599753-How-to-Use-the-Oura-App) — referência de hierarquia | Today/Vitals/MyHealth, atalhos e contexto temporal, atualizada07/10/2026 | Separar “o que entrou”, “evolução” e “contexto”; divulgação progressiva | Baselines/recomendações deles não autorizam inferência causal ou personalizada no PULSO |
| [Withings](https://support.withings.com/hc/en-us/articles/20922327698577-Withings-App-Online-Dashboard-Available-Measurements) — referência web/vitais | Dashboard web com tipos de medições documentados | Desktop útil para explorar medições e histórico | Nem todas as funções móveis são equivalentes na web; não prometer compatibilidade sem ensaio |
| [Bearable](https://bearable.app/) — acompanhamento autodeclarado | Registo de sintomas, relatórios e vistas de tendências | Introdução rápida, resumos e continuidade de contexto | Correlação apresentada por produto não deve virar causalidade clínica automática |
| [CareClinic](https://careclinic.io/) — gestão pessoal ampla | Diário, medições, documentos e preparação da consulta | Relacionar tarefas do dia com registos e histórico | Catálogo enorme não é objetivo do próximo sprint; não copiar publicidade de resultados clínicos |
| [InsideTracker BRU](https://developer.insidetracker.com/docs/blood-result-upload) — referência de processamento de análises | Upload assíncrono, estados e resultado publicado como sinal de conclusão | Distinguir ficheiro recebido, proposta disponível e resultados efetivamente guardados | É documentação de integração, não ensaio UX; não herdar limites/tipos/objetivos deles |
| [Qure qXR](https://www.qure.ai/product/qxr) — referência clínica especializada, não concorrente pessoal equivalente | Assistência a leitura de RX torácico, finalidade específica e evidência declarada | Delimitar modalidade, achados e protocolo de avaliação da frente imagiológica | Claims comerciais não validam Qwen nem o PULSO; não transplantar taxas de desempenho |

[Guava FAQ](https://guavahealth.com/faq) descreve app/web e entradas de diversas fontes; [MY LUZ](https://www.hospitaldaluz.pt/odivelas/pt/para-clientes/my-luz) também documenta acesso web/app. Conclusão de produto (inferência): a diferenciação viável do PULSO é **continuidade entre documento, dado confirmado, evolução e preparação da consulta em português**, com proveniência compreensível. Não basta competir por número de ecrãs ou uma cor semelhante à WHOOP. Integração real de instituições continua futura.

## Norte de desenho proposto

- **Página pública:** explicar em segundos a tarefa e mostrar um percurso exemplar claramente sintético; entrada/autenticação fáceis. Não criar uma landing paralela ou publicar cloud para disfarçar o estado local.
- **Hub desktop:** cabeçalho/nav centrados no viewport; área de trabalho com largura própria para dashboard, conteúdo principal e coluna contextual. Último exame confirmado, parâmetros recentes reais, atividade e ação adicionar; sem preencher vazios com dados falsos. Perfil/artigos continuam com largura de leitura adequada.
- **Revisão:** original ao lado; tabela parâmetro/valor/unidade/data/estado; ação explícita “Conferi” junto à linha e Editar para correção. Pendências e progresso reais, próxima linha clara. Confirmação final perto do resumo; avisos/erros junto à ação e foco no impedimento. Não pré-marcar valores nem transformar avisos em revisão automática.
- **Após guardar:** sucesso só após API confirmar; abrir evolução do exame e primeiro parâmetro confirmado elegível, destacar os pontos importados e oferecer restantes parâmetros. Original e detalhe a uma ação; dados sem comparabilidade continuam visíveis com motivo. Um ponto é um ponto, não tendência.
- **Exploração:** índice de parâmetros pesquisável com contagem/data/unidade reais; painel temporal e lista acessível. Selecionar período/ponto/origem e voltar sem perder contexto. Métodos/amostras/unidades incompatíveis mantêm séries separadas.
- **Movimento:** seleção/entrada de documento, mudança de painel e realce do ponto podem ter transições discretas (~150–250ms como proposta); movimento reduzido elimina-as. Sem contadores clínicos interpolados, progresso inventado ou animações a atrasar a confirmação.
- **Identidade:** reduzir uso indiscriminado de lima e botões secundários de largura total; lima para ação dominante/seleção. Ritmo editorial, ícones consistentes, tipografia/hierarquia claras; não acrescentar bibliotecas só para efeito visual.

## Prompt de execução recolhido do Work

O prompt integral está em [NEXT_SPRINT_PROMPT.md](NEXT_SPRINT_PROMPT.md), recolhido diretamente da resposta Work. O utilizador não precisa de o copiar de volta para o Codex. O âmbito é a implementação sequencial do fluxo documental, estabilidade e núcleo visual, com validação por tarefa e sem diagnóstico imagiológico improvisado. É uma proposta de execução, não uma nova versão implementada.

## Critérios de entrega propostos (não resultados de testes)

1. Um utilizador sem conhecer a implementação consegue perceber o que rever e chegar ao gráfico; contar cliques e observar o percurso, não estipular número fictício como medido.
2. Guardar rejeitado mostra razão junto à ação e localiza a pendência; guardar bem-sucedido sai da revisão para evolução sem novo clique em menu.
3. Todos os resultados guardados do exame continuam em histórico/detalhe; cada analito suportado é selecionável e tem gráfico ou motivo explícito de exclusão.
4. Navegação centra à mesma coordenada horizontal nas larguras desktop; não há Perfil isolado por quebra acidental no móvel; ampliação pode fazer reflow intencional.
5. Animação comunica uma mudança real e desaparece em movimento reduzido. Não mede “qualidade” pelo número de efeitos.
6. Serviços demonstram prontidão, logs de saída e encerramento correto; ensaio de estabilidade tem duração/ambiente/resultados efetivos. Falha não se resolve a apagar a SQLite.
7. Avaliação visual e de tarefa pode chumbar a entrega apesar de suites verdes; resultados técnicos anteriores não são invalidados, mas não substituem essa avaliação.

## Limite clínico e investigação

A [orientação MDCG2025-6](https://health.ec.europa.eu/latest-updates/mdcg-2025-6-faq-interplay-between-medical-devices-regulation-vitro-diagnostic-medical-devices-2025-06-19_en) trata a relação de software médico e IA; a finalidade pretendida é relevante para o enquadramento. Isto é uma referência para avaliação especializada, não determinação jurídica do PULSO. Qure é uma referência de solução clínica específica; a sua documentação não valida um modelo local genérico. Sem qualquer teste sobre radiografias reais nesta tarefa.

## Entrega desta investigação

Criados este briefing e o pedido Work; vídeo inspecionado localmente de forma amostrada e código consultado. Nenhuma alteração funcional nem nova versão nesta fase. Não foram repetidas suites/carga/inferência; não alegar que o bloqueio já foi corrigido. Work recebeu o feedback/estado e devolveu investigação de 14 produtos e um prompt de execução. A direção recebida converge na tarefa trazer exame→conferir→evolução, com sete padrões e prioridades P0/P1. Não acedeu diretamente ao repositório/vídeo: recebeu observações anonimizadas desta inspeção. O prompt separado foi recolhido integralmente em NEXT_SPRINT_PROMPT.md, evitando a truncatura do relatório longo. Não se executaram alterações funcionais a partir dele nesta fase.
