# PULSO — prompt de execução recolhido do ChatGPT Work

09/11/2026. Prompt original recolhido do Work; **execução iniciada, não integralmente concluída**. P0 documental, primeira composição Hub/evolução e lifecycle já implementados; resultados/pendências em [PROJECT_STATUS.md](PROJECT_STATUS.md) e [VALIDATION.md](VALIDATION.md). Relatório, vídeo amostrado e fontes em [PRODUCT_DIRECTION.md](PRODUCT_DIRECTION.md). O texto abaixo preserva a proposta histórica e não deve ser executado novamente desde o início nem tratado como prova de conclusão.

```text
Implementa a próxima melhoria do PULSO no repositório existente:
https://github.com/SAZAO-PROMAX/PULSO

Mantém Codex sol6.1 medium e o nível atual.
Não alteres modelo/nível silenciosamente.
Interface, documentação e comunicação em PT-PT.

MISSÃO
Entregar um percurso funcional e visualmente coeso:
documento → extração → revisão humana → gravação confirmada →
evolução → detalhe/original.

A qualidade da tarefa pode chumbar a entrega mesmo com suites verdes.
Não reduzir o trabalho a trocar estilos, acrescentar cartões ou fazer
passar testes.

CONTINUIDADE
Base comunicada: main, checkpoint
005849fc2658269f99fa11872b5ffd0273799883, v0.7.4 experimental.

Antes de editar:
- verificar checkout, alterações locais e instruções aplicáveis;
- ler docs/PRODUCT_DIRECTION.md, docs/PROJECT_STATUS.md e VALIDATION.md
  nos caminhos existentes;
- preservar alterações do utilizador;
- confirmar no código os contratos, catálogo, rotas e scripts.
O PRD v0.2 é histórico.

Preservar a stack existente:
Expo 57 / React Native 0.86.3 / React 19.2.3 / react-native-web;
FastAPI; SQLite local;
PyMuPDF + Ollama/Qwen3-VL 4B exclusivamente local no backend.
Não atualizar dependências sem necessidade demonstrada.

SEGURANÇA E LIMITES
Só dados sintéticos.
Nunca testar na base normal .local/pulso.sqlite3.
Usar bases temporárias e servidores de teste em loopback, com proteção
contra configuração acidental para a base normal.

Preservar:
autenticação obrigatória; cookie HttpOnly/SameSite Strict;
CSRF/Origin; sessões revogáveis; isolamento por dono;
versões/If-Match; proveniência; confirmação humana.
Nascimento obrigatório; modo não altera permissões.

Não publicar serviços, acrescentar cloud, serviço permanente,
tarefas agendadas ou alterar firewall.
Não introduzir diagnóstico, health-score, integrações institucionais
não existentes ou interpretação de radiografias.
Preservar código útil; não refazer tudo.

DIAGNÓSTICO — FACTOS E HIPÓTESES SEPARADOS
Observações de vídeo fornecidas pelo utilizador, não inspeção tua:
cinco propostas por rever; Conferi escondido dentro de Editar;
Confirmar e guardar verde com zero revistas; possível erro distante.
Isto demonstra uma armadilha de revisão.
Não demonstra falha de persistência/API.

Colesterol total com zero resultados é um estado vazio observado.
Não inventar dados nem classificá-lo como bug sem verificar.

Segundo inspeção reportada, App.saved mantém destino detalhe/Histórico.
Verificar no código. A decisão atual substitui a anterior:
gravação bem-sucedida de análise → resultados/gráficos.

8000/8081 e processos foram encontrados ativos numa consulta recente.
Isso não prova estabilidade nem exclui queda intermitente.
Unexpected text node “History” nos logs é uma pista a investigar;
não é causa demonstrada da queda.

P0 — REVISÃO, GRAVAÇÃO E RESULTADO

1. Reproduzir o percurso
Executar PDF com texto e fotografia de folha inteiramente sintética
pelo parser local real. A fotografia deve ter condições plausíveis
de perspetiva/iluminação.

Distinguir:
extração → conferência → validação → pedido → commit →
resposta → leitura dos dados persistidos → navegação.

Separar ensaios reais do parser de testes com propostas controladas.
Não apresentar propostas controladas como prova de precisão do modelo.

Instrumentar com identificador de operação, etapa, duração e erro.
Não registar conteúdo do documento, valores clínicos, nomes, emails,
cookies, tokens ou corpos de pedidos.

2. Tornar a revisão explícita
Cada linha apresenta valor/unidade e contexto disponível, evidência,
Conferi, Editar e Excluir como ações distintas.
Conferi não exige abrir editor.
Edição material invalida a conferência dessa linha.
Exclusões explícitas e reversíveis antes de guardar.

Mostrar progresso coerente e próxima pendência junto da ação final.
O CTA orienta para conferir o próximo resultado enquanto houver
impedimentos; guardar exige confirmação final explícita.
Erro junto à ação, com foco/scroll para a linha que impede avançar.
Sem aceitação global indiscriminada nem autoaceitação do LLM.
Garantir operação completa por teclado.

3. Guardar e mostrar evolução
Só apresentar sucesso após confirmação efetiva do backend.
Usar identificadores persistidos e carregar os dados guardados.
Abrir resultados/gráficos com a análise recém-guardada identificada.

Cobrir todos os analitos e vitais suportados no catálogo real.
“Todos acessíveis” não significa unidades diferentes no mesmo eixo.
Usar lista pesquisável e painéis por parâmetro.

Um resultado produz um ponto, não uma evolução inventada.
Separar métodos, amostras e unidades incompatíveis.
Não converter automaticamente intervalo laboratorial em diagnóstico.
Cada ponto permite recuperar detalhe, contexto e original/evidência.

Documento sem resultados numéricos:
abrir original/cronologia, sem fabricar gráficos.
Distinguir vazio, período sem dados, excluído, não suportado e
ausência de resultados comparáveis.

Se o commit resultar mas a leitura do gráfico falhar:
informar que ficou guardado e repetir só a leitura.
Duplo clique, timeout, retry, recarga e voltar não podem duplicar.
Falhas API, sessão expirada e conflito de versão preservam o trabalho
e oferecem recuperação segura.

4. Preservar contexto
Explorar gráficos não deve destruir o rascunho.
Ao importar outro documento, explicar continuar/substituir.
Nunca substituir silenciosamente.
Distinguir rascunho de registo persistido.

P0 — LIFECYCLE WINDOWS
Investigar parent process, terminal, processos filhos, reload,
suspensão/retoma, códigos de saída, portas e logs.

Separar falha frontend, API, parser e encerramento de processo.
Corrigir apenas causas demonstradas; reportar hipóteses abertas.

Disponibilizar arranque, estado e paragem documentados.
Logs locais com rotação e sem conteúdo privado.
Se exige terminal aberto, tornar essa dependência explícita.
Parar apenas processos pertencentes à sessão PULSO.

Ensaio de estabilidade: duas horas reais em ambiente de teste,
com atividade/inatividade e verificações periódicas.
Reportar duração efetiva, início/fim, falhas e condições.
Suspensão/retoma deve ser observada separadamente.
Não inventar uptime; se incompleto, marcar critério pendente.
Manter atualizações de progresso durante o ensaio.

P1 — EXPERIÊNCIA COESA
Aplicar à revisão, resultados, Hub, Histórico e Perfil.

- Tokens partilhados de tipografia, espaçamento, cor e estados.
- Navegação desktop geometricamente centrada independentemente
  das larguras da marca e do avatar.
- Contentor de trabalho amplo e responsivo.
- Revisão: resultados + original/evidência.
- Resultados: lista pesquisável + gráfico + contexto.
- Perfil e artigos: largura confortável de leitura.
- Mobile: sequência vertical e ações sem ocultar campos/foco.
- Hub: próxima tarefa, rascunho pendente, atividade recente e evolução.
- Preservar cinco áreas e funcionalidades úteis existentes.
- Uma ação principal; evitar vários verdes concorrentes.
- Transições funcionais de aproximadamente 150–250 ms,
  ajustáveis após avaliação e com reduced-motion.
- Sem progresso falso, métricas fictícias ou animação permanente.
- Estados claros de carregamento, parcial, erro, vazio e sucesso.
- Referência WCAG 2.2 AA; foco, contraste, zoom 200%,
  alvos confortáveis e alternativa tabular aos gráficos.
Não alegar conformidade integral sem auditoria.

VALIDAÇÃO
Cobrir:
- PDF e fotografia pelo parser real;
- todos os parâmetros suportados;
- zero/um/vários resultados;
- ausências, exclusões, ambiguidades e incompatibilidades;
- teclado, foco e erro junto da ação;
- duplo clique, timeout, retry e recarga;
- falha API, sessão expirada e If-Match;
- isolamento entre utilizadores;
- ponto → detalhe → original;
- rascunho preservado;
- 390/768/1280/1440/1920 px, zoom e reduced-motion.

Executar checks proporcionais à amplitude das alterações.
Não reutilizar contagens históricas como validação da versão nova.
Reportar testes distintos, repetições, omissões e limitações.

Demonstrar três tarefas completas com dados sintéticos:
A. importar → conferir → guardar → resultados;
B. comparar resultados compatíveis → recuperar original;
C. sair para explorar → retomar rascunho sem perda.

Avaliar clareza, esforço, erros e recuperação nessas tarefas.
Uma suite verde não anula um percurso confuso ou incompleto.

P2 — APENAS DOCUMENTAR
Android: sessão nativa segura e PDF/visualizador próprios;
não remover Origin/CSRF para contornar 403.
Imagiologia: investigação separada para relatório textual e pixels;
sem imagens reais ou diagnóstico por modelo genérico.

ENTREGA
Atualizar continuidade e validação com o estado efetivo.
Apresentar causas demonstradas, alterações, evidência das tarefas,
testes/omissões, estabilidade real, limitações e comandos
de arranque/estado/paragem.

Concluir P0 e o núcleo P1 antes de anunciar melhoria pronta.
Não afirmar produto validado, precisão clínica ou correções executadas
sem evidência correspondente.
```
