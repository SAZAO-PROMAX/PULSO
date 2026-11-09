# v0.7.4 em curso — B2: navegação de Registar, 09/11/2026

Base `3ef956c`. **59 TypeScript e 16 Chromium aprovados, zero falhas esperadas neste lote.** Typecheck/exportação web aprovados. Logs tmp/v074-b2-unit.log e tmp/v074-block-b2-public.log; repetição final direcionada em tmp/v074-block-b2-final.log. O primeiro ensaio do cancelamento de recarga esperava uma navegação que tinha sido cancelada; o rascunho permanecia no snapshot. O teste passou a limitar essa espera a três segundos e verificar explicitamente o campo preservado.

- Rotas de Registar só aceitam passos/categorias/tipos explícitos do catálogo. Rejeitam parâmetros desconhecidos, tipos planeados, travessias e URLs externas. Sem dados/nomes documentais no URL. A mesma autenticação protege ligações diretas.
- Voltar/Avançar do navegador conserva o formulário e o documento. Ir a Histórico/Início e regressar retoma o rascunho, sem confirmar ou reextrair. Um componente de registo fica montado dentro da Shell da conta; é desmontado ao terminar sessão/mudar de dono. Não há armazenamento de rascunhos em disco ou localStorage.
- Aviso beforeunload existe apenas com documento/fotografia/alterações por guardar. Cancelar a recarga conserva os campos; terminar sessão limpa a memória privada e Voltar não revela o documento. A recarga aceite continua a perder o rascunho, por decisão explícita no aviso do navegador.
- Câmara sintética: pré-visualização mantida entre separadores; streams encerradas quando a câmara fica oculta. Reabrir exige ação para ligar novamente vídeo. Permissão apenas por ação explícita; qualidade da fotografia e confirmação humana dos resultados mantidas.
- Chromium completo conserva as regressões de autenticação, permissões recusadas, importação, persistência, três modos e layouts. A versão executável continua 0.7.3 até acabar o sprint; não se declara uma v0.7.4 completa.

**Limites:** B2 cobre Registar na web, não todo o bloco B. B3 deverá tratar detalhes/artigos/acontecimentos/perfil e proteção de edições fora de Registar antes de iniciar C. BackHandler Android foi acrescentado em código; sem dispositivo/emulador, sem alegar gestos iOS verificados. Backend/pipeline/SQLite não foram alterados; não se repetiram API completa, Ollama real, carga ou 1.000 contas. Caso difícil HDL continua pendente de D.

Repetir a suite pública com as variáveis/portas do comando A abaixo: `npx.cmd playwright test --reporter=line`. Usar um terminal reservado aos testes e fechá-lo antes do arranque normal para não herdar EXPO_PUBLIC_API_URL de teste. A base normal/serviços existentes foram preservados. Artefactos permanecem em tmp, fora do Git.

---

# v0.7.4 em curso — bloco B1, 09/11/2026

Checkpoint anterior A: `8f33c82`. B1 corrige a navegação **dentro de Registar**, não todo o bloco B. Versão executável mantém 0.7.3 até conclusão da v0.7.4.

Antes/depois reproduzido: a escolha de categoria perdia foco; agora foca o título de tipos e depois o formulário. Voltar desmontava o formulário e apagava seleção/correções; agora mantém uma única instância oculta em memória, retoma sem reextrair e nunca grava automaticamente. Cabeçalhos/Voltar usam foco e seta com nome acessível. Tensão usa a mesma preservação local. Trocar de tipo/câmara/acontecimento com um rascunho exige descartar explicitamente; formulário vazio não exige confirmação. Escape fecha o diálogo e restitui foco; Continuar a editar reabre o formulário. Não foram retiradas confirmações de resultados, qualidade da fotografia, permissões de câmara ou eliminações.

A revisão ainda tem os mesmos 35 campos para cinco resultados: **bloco C não iniciado**. Pipeline e regras de confirmação não foram alterados. O caso difícil HDL/data/proposta extra não foi repetido nem declarado corrigido. B2 continua necessário para Voltar/Avançar global, proteção ao sair pela navegação principal/recarregar e outros detalhes/artigos. Uma falha esperada explícita mantém a reprodução do histórico do navegador; não a contar como funcionalidade aprovada.

Testes desta etapa:

- `npm.cmd test --prefix apps/mobile`: 58 aprovados, tmp/v074-unit.log. Typecheck aprovado depois das alterações finais. Exportação web executada pela suite Chromium.
- Novo ficheiro percorre Tab/Shift+Tab, Enter/Espaço, seletor de ficheiro ativado por Enter (ficheiro fornecido ao evento Playwright, sem automatizar o diálogo nativo do Windows), correção/revisão deliberada de cinco linhas, gravação única, detalhe/gráfico e persistência após recarga. Sem cliques nem focus() nesse percurso integral. Outros cenários usam fill() para preparar dados e não são declarados integralmente por teclado.
- Rascunho conserva nome/ficheiro, valor corrigido e marca de revisão; contador confirma uma só extração e zero gravações ao voltar. Tensão conserva valor. Campo de texto + Enter não confirma resultados; guardar sem revisão é bloqueado antes de enviar POST.
- Diálogo em 320/390/768/1100/1280 px sem overflow horizontal observado; capturas tmp/v074-draft-dialog-{390,1280}.png, 390 revista visualmente. Sem ensaio de zoom real/texto ampliado do novo diálogo, leitor de ecrã ou Android/iOS.
- Regressões existentes de câmara, seletor, autenticação/recusa de cookie, sessão expirada, guarda/detalhe/evolução e três modos foram repetidas em bases temporárias. Ficheiros public-* agora respeitam a porta API de teste.

Ocorrências durante B1: o primeiro ensaio encontrou foco perdido após descarte e depois interferência no retorno da câmara; ambos corrigidos e repetidos. Um lote inicial de 15 cenários excedeu o limite normal de criação de contas. Não se alterou a aplicação/limite: o novo ficheiro usa uma conta sintética, sessões separadas e só o último percurso guarda resultados; a suite completa fica no limite existente de dez registos. Nenhuma limpeza da base normal ou pedido de escrita nela.

Comando completo, na mesma configuração PowerShell de A abaixo: `npx.cmd playwright test --reporter=line`. Artefactos ficam em tmp; não publicar capturas/documentos/bases. **Resultado final:** 15 cenários Chromium aprovados e uma falha esperada do histórico do navegador (Playwright apresenta 16 passed por incluir essa falha esperada); 58 TypeScript aprovados, total de 73 aprovações reais. Log tmp/v074-block-b1-public.log. Sem testes API completos repetidos porque o backend não foi alterado; a regressão Chromium usa API real isolada. Sem inferência real, carga, 1.000 contas ou alterações a modelos/SQLite.

---

# v0.7.4 em curso — bloco A, 09/11/2026

Base: `1c6e0cc`. Inspeção da documentação, DocumentImport/RegisterHub, rotas/Shell, controlos, modal educativo e hybrid concluída. Sem gravação do utilizador disponível/analisada; reprodução baseada no pedido escrito.

Ensaio Chromium autenticado, contas sintéticas, SQLite nova em tmp, web 8784/API 8014, Ollama desligado. Instância normal 8081/8000 mantida. A configuração Playwright aceita PULSO_TEST_WEB_PORT/PULSO_TEST_API_PORT; exportação com cache renovada para não reutilizar a URL da API de outra execução. A primeira tentativa restrita não concluiu; a primeira exportação isolada conservou URL antiga e falhou na sessão, antes dos percursos. Corrigida a configuração do ensaio e adicionada interdição de pedidos do navegador a outras portas loopback.

`public-navigation-review.spec.ts`: quatro cenários executados; **um aprovado e três falhas esperadas que reproduzem defeitos**, não quatro funcionalidades corrigidas. Log tmp/v074-block-a-isolated.log. Checkpoint A não altera produto:

- Enter e Espaço ativam os botões de Registar/categorias ensaiados. Ao escolher categoria o controlo desaparece e o foco não acompanha o título de tipos: defeito reproduzido.
- Documento selecionado/nome alterado → Voltar às categorias → mesmo tipo: rascunho perdido sem aviso, reproduzido.
- Voltar do navegador após selecionar tipo salta para o Hub; passos internos não constam do histórico, reproduzido.
- PDF conhecido devolve cinco propostas com 35 campos de linha permanentes. Enter no valor não envia confirmação. Guardar sem linhas revistas é recusado sem POST de confirmação. Captura sintética tmp/v074-review-before-390.png.

Os testes marcados test.fail explicitam pendências; remover a marcação apenas quando o comportamento esperado passar. Não foram repetidos carga, 1.000 contas nem inferência real. Caso difícil HDL/data/proposta extra continua como regressão histórica, sem alegar diagnóstico novo da causa. Android/iOS não ensaiados.

Repetir em PowerShell, apps/mobile:

```powershell
$env:Path='C:\Program Files\nodejs;'+$env:Path
$env:PULSO_TEST_PUBLIC='true'
$env:PULSO_TEST_API_PORT='8014'
$env:PULSO_TEST_WEB_PORT='8784'
$env:EXPO_PUBLIC_API_URL='http://127.0.0.1:8014'
npx.cmd playwright test public-navigation-review.spec.ts --reporter=line
```

Esta configuração de portas é usada pelo novo ficheiro; suites históricas com URLs literais precisam das portas originais ou de adaptação explícita. Não reutilizar serviços existentes.

---

# Validação atual — v0.7.3

Atualização: 09/11/2026, Europe/Lisbon. Evidência apenas sintética; não é validação clínica ou certificação.

## Aplicação e câmara

**211 testes distintos aprovados:** 100 API, 58 TypeScript, 36 Chromium demonstrativos isolados, 9 Chromium na configuração normal, 2 de estrutura e 6 dos geradores/métricas. Typecheck e pip check aprovados; exportação web exercitada pelo Playwright. Dois testes Chromium opcionais de Ollama real não foram executados; inferência real foi medida separadamente abaixo. Logs tmp/v073-{api,unit-final,public-final,demo-final,harness,foundation}.log.

Registar oferece Digitalizar exame / Importar ficheiro / Registar medição; categorias preservadas no passo seguinte. Nova captura web pede vídeo sem áudio por ação explícita, mostra pré-visualização, exige conferência de qualidade, permite repetir/cancelar, fecha as tracks e segue para classificação/DocumentImport. Ficheiro alternativo permanece disponível em contexto sem câmara ou permissão recusada. Documento não laboratorial (ECG sintético) é guardado com original/proveniência e zero resultados, sem chamar a extração. Casos de importação/revisão/correção/guardar/detalhe/gráfico, sessão/cookie/logout e isolamento passam pela regressão existente.

Teste de câmara usa canvas/MediaStream sintéticos no Chromium, nunca a webcam pessoal. Verifica permissão recusada, API ausente, limites de layout 320/390/768/1100/1280, foco na revisão/classificação e retorno ao cancelar. Movimento reduzido e os três modos mantêm a cobertura existente. Capturas tmp/v073-camera-preview-{390,1280}.png. Teste físico, NVDA/VoiceOver e zoom real pendentes; sem certificação WCAG.

Native: expo-image-picker ~57.0.21 e expo-crypto ~57.0.4 compatíveis com SDK 57. Câmara/galeria com preview/aceitar/repetir, hash local e JPEG sem metadados APP1/APP13/comentários, sem recomprimir os bytes dos píxeis depois do JPEG fornecido pelo SDK. Configuração bloqueia microfone; nenhuma permissão de localização/reconhecimento facial. Exportações JavaScript Android/iOS aprovadas (tmp/v073-android.log e tmp/v073-ios.log); configuração inspecionada com expo config --type introspect. Android declara RECORD_AUDIO com tools:node=remove; iOS sem NSMicrophoneUsageDescription. **Não houve dispositivo/emulador**, nem foi validada a integração nativa completa de sessão, Origin/cookies, transporte e API local. A disponibilização operacional comprovada é a web; exportação JS não prova câmara nativa.

Limite intencional: uma página por fotografia, 2 MB e 12 MP; PDFs mantêm até 3 páginas. Sem botão de múltiplas fotografias, rotação, recorte, melhoria automática ou garantia de legibilidade. Fotografias nativas grandes podem ser recusadas sem redução automática. Uploads comuns preservam o original integral; sanitização de metadados de todos os ficheiros e retenção das caches do SDK ainda exigem revisão antes de dados reais. Captura nativa guarda hash do JPEG entregue pelo SDK antes da remoção de metadados; não é hash de um RAW de sensor nem prova independente de qualidade.

## Contas e capacidade

1.000 contas de fixture e seus snapshots foram verificados através da autorização normal; 10 logins HTTP, 3.000 acessos cruzados recusados, persistência após reinício e 1.000 revogações aprovados. Registo HTTP das 1.000 contas não executado; nenhuma autenticação foi desativada. Coorte, cenários, recursos, comandos e tabela de carga ficam unicamente em [LOAD_TEST.md](LOAD_TEST.md), sem os duplicar aqui.

## Fidelidade documental

Gerador reutiliza os casos/ground truth previamente definidos em benchmark_extraction.py e o mesmo módulo hybrid. Adiciona imagem de baixo contraste, reflexo, recorte, fonte itálica simulada, inglês e data ambígua. Itálico de computador não é manuscrito humano. Expected JSON é escrito antes de invocar o modelo. Nunca se usa a resposta do modelo como referência.

Com Ollama desligado: **21 documentos, 98 resultados esperados na fonte, 10 recuperados pelo parser conhecido e 88 sem proposta automática**; o estado manual_required explica a necessidade de introdução/revisão manual. São limites do parser, não 88 erros de persistência. O caso misto recuperou os cinco analitos digitais conhecidos; os outros três ficaram sem proposta. Os casos degradados podem ocultar informação; fonte original e imagem degradada não são equivalentes.

Amostra real sequencial: **7 documentos únicos**, 35 resultados esperados; 36 propostas, 34 associações completas (parâmetro/valor/unidade/data/página), nenhuma omissão ou divergência de valor/unidade/página/documento observada nos resultados associados, uma data não coincidente e uma proposta extra não mapeada. 14 propostas sem verificação textual independente. Há seis chamadas ao modelo e um documento resolvido pelo parser; dois processamentos adicionais repetiram o caso difícil e a fotografia, totalizando oito chamadas reais ao modelo em nove processamentos (sete documentos únicos). Modelo local existente qwen3-vl:4b, Ollama 0.40.15, concorrência 1, prazo do lote 300 s; lote principal 72,66 s. Nenhum modelo novo instalado e nenhum documento guardado na base.

| Documento | Esperados | Propostas | Completos | Data divergente/ausente | Extras | Sem verificação textual | s |
|---|---:|---:|---:|---:|---:|---:|---:|
| known_deterministic | 5 | 5 | 5 | 0 | 0 | 0 | 0.41 |
| fifteen_rows | 15 | 16 | 14 | 1 | 1 | 2 | 38.59 |
| injection | 3 | 3 | 3 | 0 | 0 | 0 | 6.21 |
| photo | 3 | 3 | 3 | 0 | 0 | 3 | 6.95 |
| tilted | 3 | 3 | 3 | 0 | 0 | 3 | 7.20 |
| low_contrast | 3 | 3 | 3 | 0 | 0 | 3 | 6.79 |
| cropped | 3 | 3 | 3 | 0 | 0 | 3 | 6.18 |

| Parâmetro | Esperados na amostra | Completos | Data ausente/divergente | Sem verificação textual |
|---|---:|---:|---:|---:|
| glucose | 7 | 7 | 0 | 4 |
| ldl | 7 | 7 | 0 | 4 |
| creatinine | 7 | 7 | 0 | 4 |
| hemoglobin | 2 | 2 | 0 | 0 |
| hba1c | 2 | 2 | 0 | 0 |
| cholesterol_total | 1 | 1 | 0 | 0 |
| hdl | 1 | 0 | 1 | 1 |
| triglycerides | 1 | 1 | 0 | 0 |
| ferritin | 1 | 1 | 0 | 0 |
| tsh | 1 | 1 | 0 | 0 |
| ft4 | 1 | 1 | 0 | 0 |
| vitamin_d | 1 | 1 | 0 | 0 |
| urea | 1 | 1 | 0 | 0 |
| sodium | 1 | 1 | 0 | 0 |
| potassium | 1 | 1 | 0 | 0 |

O documento fifteen_rows é a regressão difícil conservada no corpus. Na repetição detalhada (27,06 s), HDL manteve valor/unidade corretos mas data nula; a proposta extra estava não mapeada e sem valor numérico. Não se afirma que foi inventado um número. A ureia tinha aviso de amostra sem evidência. Esses campos exigem conferência/correção ou exclusão explícita; nenhuma proposta foi automaticamente confirmada. Não foi alterado o pipeline para melhorar o benchmark. Correções humanas efetivamente realizadas no benchmark: zero; os fluxos UI de correção/confirmação são ensaiados separadamente.

As quatro fotografias/imagens frontal, inclinada, de baixo contraste e recortada acertaram os campos esperados nesta amostra, mas as 12 propostas visuais continuam sem conferência textual independente. O recorte retirou colunas laterais, não demonstra recuperação de números ocultos. Instruções maliciosas não produziram ações externas nem o valor extra pedido no documento. Reflexos, idioma inglês, data ambígua, fonte itálica e restantes casos foram exercitados apenas com o motor desligado nesta entrega; não há suporte real demonstrado a manuscritos, idiomas arbitrários ou todas as degradações.

Catálogo de dados/gráficos: **19 parâmetros**, incluindo quatro vitais; o corpus laboratorial tem 15 analitos. CRUD/unidades/aliases/proveniência e UI dos 19 continuam cobertos pela matriz partilhada abaixo e testes executados. A amostra real não prova todos os aliases, unidades alternativas, métodos/amostras ou documentos para cada parâmetro. O teste de métricas distingue data ausente, extra, omissão e evidência visual. Relatórios detalhados por documento/parâmetro em tmp/v073-doc-{disabled,real,repeat,resource}/results.json; ficheiros de referência/casos ficam em tmp e os geradores no Git.

Repetição (pasta nova; Ctrl+C ou prazo máximo interrompe, sem alterar a base):

```powershell
.\.venv\Scripts\python.exe scripts/document_reliability.py --mode disabled --max-seconds 120 --output tmp/doc-repeticao-off
.\.venv\Scripts\python.exe scripts/document_reliability.py --mode real --only known_deterministic photo tilted injection fifteen_rows low_contrast cropped --max-seconds 300 --output tmp/doc-repeticao-real
```

Não executar inferência real e carga simultaneamente. O deadline limita subprocessos próprios; não termina o serviço Ollama partilhado. A repetição fotográfica com --sample-gpu durou 9,98 s e acertou os três resultados, ainda visualmente não verificados. Dez amostras de nvidia-smi (aproximadamente uma por segundo) observaram máximo de 5214 MiB de memória GPU total em uso e 95% de utilização, numa RTX 5050 Laptop de 8151 MiB. É amostragem desse caso, não pico absoluto nem garantia de margem sustentada. Tempos/contadores de tokens do modelo constam do JSON. Não confundir este ensaio local com validação clínica, auditoria de segurança, sincronização cloud ou capacidade de produção.

Os comandos de regressão partilhados e a matriz histórica abaixo continuam aplicáveis; acrescentar os novos testes dos geradores via unittest discover. Todos os relatórios anteriores são históricos, não novos ensaios.

## Histórico — redesign v0.7.2, 08/11/2026

Correção pontual da seleção de documentos, ainda na v0.7.2: **68 testes aprovados** — 56 TypeScript, 5 Chromium na configuração normal (`public-entry`/`public-picker`) e 7 dos fluxos de PDF, imagem manual e documento sem extração (`flows`, `local-extraction`, `register`). Typecheck e exportação web aprovados. O novo teste percorre escolha, troca pelo seletor, arrasto, formato/tamanho inválidos preservando a seleção anterior, bloqueio durante leitura, falha sem perda do ficheiro e cancelamento. Verifica nome único dentro da área, indicação de não guardado, ausência de texto solto em View, movimento reduzido e 320/1100 px. Capturas fictícias locais em `tmp/picker-selected-{320,1100}.png`; animações finalizadas para a captura. Animação de entrada dura 160 ms, não representa progresso de upload. Sem pré-visualização automática do PDF nem mudanças à extração, autenticação ou persistência; testes com DB temporária e Ollama desligado, sem consultar/limpar a base normal. API/inferência real não repetidas nesta correção. Logs: `tmp/picker-unit.log`, `tmp/picker-public-final.log`, `tmp/picker-flows-final.log`; repetir na mesma configuração Playwright da secção abaixo, selecionando estes ficheiros. Em `DocumentImport`, uma condição textual vazia foi convertida para booleana para evitar aviso React Native. Ensaios físicos/leitor de ecrã continuam pendentes.

Regressão completa anterior do redesign (não repetida integralmente nesta correção):

**202 testes distintos aprovados:** 100 API, 56 TypeScript, 36 Chromium em demonstração explicitamente isolada, 5 Chromium na configuração normal sem demonstração, 2 de estrutura e 3 do gerador. Dois Chromium opcionais de inferência real omitidos. Typecheck, pip check e exportação web aprovados, sem novas dependências. Logs locais: `tmp/v072-api.log`, `tmp/v072-unit-final.log`, `tmp/v072-demo-release.log`, `tmp/v072-public-release.log`. Todos os testes escrevem apenas em bases temporárias. Nenhuma limpeza da base normal; nenhuma nova inferência GPU, carga ou exportação nativa.

A: entrada pública sem pedidos clínicos, verificação neutra, rota privada/retorno interno permitido, conta vazia, cookie recusado, logout/Voltar e sessão ausente sem dados anteriores. Endpoints /demo protegidos no normal, mesmo com cabeçalhos falsos; modo demonstrativo recusa DB normal. Reposição exige confirmação do dono demo e preserva a conta de ensaio. O cliente depende do contexto confirmado pelo servidor, não de uma flag de compilação. Um desvio de retorno à rota no teste da compilação estática foi corrigido e o percurso repetido na suite normal.

B: exame com resultados e documento sem extração abrem detalhe após persistência; tensão abre o registo, acontecimentos a cronologia. Evolução é ação no exame. Edição mantém contexto/filtros, conflito mantém campos; exclusão regressa à lista e preserva recursos não abrangidos. Testes de acontecimentos aguardam confirmação de gravação antes de ler a versão, evitando uma leitura prematura no próprio teste. C: catálogo de 19 parâmetros percorrido na API/modelo e UI; matriz abaixo, sem alegar reconhecimento universal por IA. D: Hub sem barra clínica repetida, estado vazio único, resumos expansíveis e tensão mesmo sem exames. Categorias/período em seletores, Mais filtros e remoção individual/limpeza sem alterar predicados. Aprender mantém pesquisa/23 fichas e nomes acessíveis, com ações curtas. Perfil limitado a 760 px, avatar/conta e data DD/MM/AAAA ↔ ISO; nascimento obrigatório preservado. Navegação superior desktop/inferior móvel, com espaço reservado no layout e seleção também sublinhada.

E: 320, 390, 768, 1100 e 1280 px nos três modos; teclado/foco/modais, contraste de texto/campos/tokens e zoom CSS 200% na regressão. Novo teste de seletores/filtros por teclado, calendário pt-PT e estados com apenas tensão/acontecimentos. Teste geométrico de cabeçalho, navegação e rodapé nas quatro páginas, com texto muito grande em tema escuro. Capturas comparáveis antes/depois com a mesma conta e exame inteiramente fictícios: `tmp/v072-before-{Início,Histórico,Aprender,Perfil}-{390,1280}.png` e `tmp/v072-after-*.png`, incluindo Hub vazio. Sem sobreposição detetada nesses casos; não é auditoria de todos os elementos. Inventário visual em [UX_LEARN.md](UX_LEARN.md). As quatro capturas documentais existentes foram atualizadas pela suite; restantes artefactos ficam fora do Git.

Erros encontrados: percursos antigos dos testes ainda procuravam as áreas/acontecimentos diretamente no Hub e foram adaptados aos caminhos reais, sem remover verificações. A revisão identificou estados vazios indevidos com apenas tensão no Hub ou apenas acontecimentos no Histórico; corrigidos na apresentação e cobertos por teste. A reposição manual da demonstração falhava por não enviar a confirmação do perfil exigida pela API; o cliente passou a enviá-la após a confirmação explícita já existente. Testado apenas com perfil fictício/DB em tmp; a proibição no ambiente pessoal mantém-se. Nenhuma alteração à persistência, autorização, regras de comparabilidade ou extração. Mantêm-se avisos de depreciação existentes. Leitor de ecrã real, zoom real, dispositivos físicos e participantes pendentes; sem certificação WCAG ou auditoria clínica/segurança independente.

Comandos PowerShell na raiz (parar previamente o servidor normal, sem terminar processos desconhecidos):

```powershell
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/repeat-v072
.\.venv\Scripts\python.exe -m pip check
node --test tests/foundation.test.mjs
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_load_runner.py -v
Push-Location apps/mobile
$env:PULSO_TEST_PUBLIC = 'false'
npm.cmd run test:web
$env:PULSO_TEST_PUBLIC = 'true'
npm.cmd run test:web
Remove-Item Env:PULSO_TEST_PUBLIC
Pop-Location
```

Pytest configura modo de teste e DB temporária; para os testes demo o basetemp deve estar dentro de tmp, como no comando. Playwright exporta a interface para tmp e configura o servidor com base única descartável; a suite pública desativa o bypass demonstrativo. O frontend normal não importa FixtureRepository ou o conjunto clínico de fixtures, e contas novas não leem seed demonstrativo. Avisos de depreciação existentes continuam; auditoria histórica de dependências não foi reavaliada.

## Registo histórico — correção de transição v0.7.1 (destino anterior, substituído neste sprint)


Correção do destino após confirmação de resultados: DocumentImport comunica o documento/parâmetros apenas depois da gravação confirmada pela API; App recarrega a revisão atual e abre Análises ao sangue, em vez do Histórico. Foco/rolagem vão para o resumo da análise e TimelineChart seleciona o respetivo ponto quando comparável. No modo combinado só os parâmetros importados começam ativos. Os históricos anteriores comparáveis e o original são preservados; campos em falta não geram pontos. Documentos sem extração, tensão e acontecimentos continuam no Histórico.

**146 testes distintos aprovados:** 74 API, 34 TypeScript, 33 Chromium, 2 de estrutura e 3 do gerador. Typecheck, pip check e exportação web aprovados. Dois Chromium opcionais de inferência real omitidos. Logs locais: `tmp/v071-api.log`, `tmp/v071-unit.log`, `tmp/v071-browser-final.log`, `tmp/v071-export.log`; seis fluxos também passaram antes com o launcher real em `tmp/pdf-redirect-focused.log`. Testes só com SQLite temporária e documentos sintéticos, sem consultar/repor dados da conta normal.

Regressões: confirmar com a página no fim da revisão abre e foca o destino no topo, seleciona a glicose corrigida e mantém origem/original; falha 503 mantém o formulário sem avanço; conta autenticada preserva isolamento; confirmar só LDL com método ausente abre LDL e explica a exclusão, sem selecionar um ponto antigo como se fosse novo; modo combinado ativa só o parâmetro desse PDF. Introdução manual sem Ollama, persistência/recarga, documentos sem resultados, tensão e restantes fluxos preservados. Testes do destino antigo foram atualizados mantendo verificações de valores/persistência. Sem alterações funcionais da API/persistência, novas dependências, nova inferência/carga ou exportações nativas nesta correção; API apenas atualiza a identificação de versão. Na revisão do lock, corrigidas duas versões de metadados (@expo/expo-modules-macros-plugin e source-map) alteradas indevidamente na v0.7; conferidas com os pacotes instalados e os URLs/integridades já existentes, sem instalar/atualizar bibliotecas.

Repetir com os comandos web/API/estrutura abaixo, substituindo a pasta temporária de pytest por uma nova (por exemplo `tmp/v071-repeat`). Android/iOS continuam limitados à evidência de exportação JS da v0.7, sem dispositivo físico, leitor real ou validação clínica.

## Registo histórico — v0.7


**145 testes distintos aprovados:** 74 API, 34 TypeScript, 32 Chromium, 2 de estrutura e 3 do gerador de carga. Dois Chromium opcionais de inferência real omitidos. Typecheck, pip check, exportação web e exportações JavaScript Android/iOS concluídos. Sem novas dependências ou inferência GPU/carga real. Logs locais em `tmp/v07-api-release.log`, `tmp/v07-unit-release.log`, `tmp/v07-web-final.log`, `tmp/v07-web-export-final.log`, `tmp/v07-android-export.log` e `tmp/v07-ios-export.log`. Bases temporárias; base normal não foi reposta nem usada pelos testes.

A/B: preferências isoladas/versionadas por conta, preservadas ao editar perfil, modos sem alterar dados/permissões, onboarding de sete passos/conclusão/recarga, áreas prioritárias e contraste. C: comparação por painéis alinhados, unidades e métodos separados, ativação de parâmetros, períodos, datas inclusivas/inválidas, calendário em fim de mês, duplicados legítimos e desenho limitado com fonte completa. D: CRUD de acontecimentos, datas/duração, estados sem validação profissional fabricada, conflitos, isolamento, associação/original e remoção atómica de referências documentais. Acontecimento eliminado não elimina exames/resultados. Fluxos antigos de contas, PDF/tensão, fila, versões e histórico mantidos.

Uma regressão de teclado foi identificada na primeira suite: o novo atalho antecedia a pesquisa em Registar. Corrigida reutilizando a zona de ações do RegisterHub; suite final sem falhas. Testes do launcher real por bloco também aprovados (onboarding, perfil, gráficos e acontecimentos); na revisão final, sete casos de onboarding/gráficos/acontecimentos/PDF/tensão/foco/zoom CSS passaram novamente (`tmp/v07-launcher-final.log`). Não são testes distintos adicionais. Contraste dos tokens verificado para texto ≥4,5 e limites ≥3 nos dois temas; verificações de navegador para foco/erros/modais/listas e layout mantidas. Capturas novas revistas a 320/1100 px, com modos/texto ampliado; suites cobrem também 390/1280 e zoom CSS 200%. Sem zoom real, leitor de ecrã real, dispositivos físicos, ensaio humano, auditoria de segurança ou certificação WCAG.

E: exportações JS Android/iOS verificam o grafo de módulos, não login/ficheiros/câmara/dispositivos. Nenhum APK/IPA/EAS/loja foi criado. Auditoria, lacunas e especificações de sincronização/papéis em ARCHITECTURE.md. F: protocolo atualizado sem participantes ou resultados inventados. Continuam avisos de depreciação Starlette/httpx/PyMuPDF e NO_COLOR; auditoria histórica de dependências não reavaliada.

Comandos PowerShell na raiz; parar o servidor normal antes de Playwright, sem terminar processos desconhecidos:

```powershell
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/v07-repeat
.\.venv\Scripts\python.exe -m pip check
node --test tests/foundation.test.mjs
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_load_runner.py -v
Push-Location apps/mobile
npx.cmd expo export --platform web
npm.cmd run test:web
npx.cmd expo export --platform android --output-dir ../../tmp/v07-android-repeat
npx.cmd expo export --platform ios --output-dir ../../tmp/v07-ios-repeat
Pop-Location
```

## Registo histórico — v0.6.1


## Otimização do perfil — mesma v0.6.1

**124 testes distintos aprovados:** 62 API, 28 TypeScript, 29 Chromium, 2 de estrutura e 3 do gerador; typecheck/exportação web aprovados, 2 Chromium de inferência real omitidos. Quatro casos repetidos com o launcher real, incluindo perfil. Logs locais `tmp/profile-api-release.log`, `tmp/profile-unit.log`, `tmp/profile-web-release.log`, `tmp/profile-export.log` e `tmp/profile-launcher.log`. Sem acesso aos conteúdos da base normal, migração, nova inferência ou carga.

Regressões: nascimento obrigatório/ausente/inválido/futuro/bissexto no servidor e interface; conta antiga sem data entra e completa perfil sem recriação; condições por ID e nomes livres, limites e duplicados; pesquisa sem acentos/por sinónimo, seleção/remoção, interesses, avatar por teclado e persistência após recarga. As condições continuam autodeclaradas, não diagnósticos. Suite integrada mantém isolamento de contas, fotografia privada, PDF e tensão. Capturas locais do perfil revistas a 320 px escuro e 1100 px claro, sem transbordo horizontal. Não houve ensaio humano ou leitor de ecrã real.

Comandos adicionais (PowerShell, raiz; testes web exigem parar primeiro o PULSO normal):

```powershell
.\.venv\Scripts\python.exe -m pytest services/api/tests -q --basetemp=tmp/profile-api-repeat
npm.cmd run typecheck --prefix apps/mobile
npm.cmd test --prefix apps/mobile
Push-Location apps/mobile
npx.cmd expo export --platform web
npm.cmd run test:web
$env:PULSO_TEST_LAUNCHER = 'true'
npx.cmd playwright test e2e/profile.spec.ts e2e/accounts.spec.ts e2e/login.spec.ts
Remove-Item Env:PULSO_TEST_LAUNCHER
Pop-Location
```

### Correção anterior de sessão


Correção de login: o arranque real forçava API em `127.0.0.1` para interface em `localhost`; reproduzido antes da correção com falha de hostname. O arranque preserva agora a escolha automática pelo hostname do navegador; login confirma a sessão antes de mostrar a conta. Cookie HttpOnly/SameSite, Origin e CSRF mantidos. Sem alterações à base normal ou às contas existentes.

**113 distintos aprovados:** 54 API, 26 TypeScript, 28 Chromium, 2 de estrutura e 3 do gerador. Typecheck e exportação web aprovados; 2 Chromium opcionais de inferência real omitidos. Logs locais `tmp/v061-api.log`, `tmp/v061-browser.log`, `tmp/v061-export.log`. Sem inferência real ou novo ensaio de carga.

Três casos também passaram com Metro/arranque real: sessão e recarga com hostname consistente, cookie recusado sem falsa autenticação, fluxo integrado de contas. Logs `tmp/login-launcher-fixed.log` e reprodução anterior `tmp/login-before.log`. Contas fictícias e SQLite temporária. Para repetir, parar o PULSO normal e executar em `apps/mobile`:

```powershell
$env:PULSO_TEST_LAUNCHER = 'true'
npx.cmd playwright test e2e/login.spec.ts e2e/accounts.spec.ts
Remove-Item Env:PULSO_TEST_LAUNCHER
```

## Entrega anterior — v0.6, 08/11/2026

Entrega: **54 testes API, 26 TypeScript, 26 Chromium, 2 de estrutura e 3 do gerador de carga aprovados (111 distintos)**. Dois Chromium opcionais de inferência real omitidos; não incluídos na contagem. Typecheck, exportação web e pip check aprovados. Logs locais em tmp/v06-api-release.log e tmp/v06-web-release.log; testes não usam a base normal. Não houve inferência GPU real nesta v0.6; pipeline/modelo preservados, parser sem Ollama exercitado. Validação adicional do menu de perfil por teclado no teste integrado de contas.

Contas: Argon2id, rotação/expiração/revogação de sessão, cookie HttpOnly/SameSite, CSRF/Origin, limites de tentativas, respostas de login/recuperação sem enumeração explícita, tokens temporários de uso único/expiração e alteração de e-mail pendente. Perfil autodeclarado/versionado; imagens sintéticas PNG/JPEG com MIME/assinatura, limite, redução e remoção de metadados; acesso de outra conta recusado. Navegador: criar duas contas fictícias, avatar e fotografia (substituir/remover), PDF corrigido/revisto/confirmado, tensão, histórico/gráfico, logout e novo login/recarga com dados recuperados; conta nova sem dados demo herdados. Nenhum token de acesso em localStorage; fotografia privada em blob da própria conta.

Registar/Histórico e integridade mantêm os ensaios dos checkpoints abaixo. Menu de perfil fixo, largura 320 revista; suites também cobrem 390/1100/1280, temas e zoom CSS 200%. NVDA voltou a não ser encontrado no PATH/locais/processos habituais nesta execução; sem ensaio com leitor real, zoom nativo, Android/iOS físicos, estudo com pessoas, auditoria independente de autenticação ou validação clínica. Não declarar certificação WCAG, capacidade de produção ou segurança para dados reais. E-mail é modo de desenvolvimento sem envio nem prova de titularidade externa.

Medição curta antes/depois e prova real da fila em LOAD_TEST.md: amostras isoladas, não repetição do ensaio de dez minutos nem teste de carga de login/contas. Problema de latência p99 na tentativa intermédia foi identificado e corrigido antes da entrega. Avisos Starlette/httpx, PyMuPDF/ByteString e NO_COLOR/FORCE_COLOR mantêm-se; auditoria histórica de dependências não repetida. Novas dependências limitadas a argon2-cffi e as suas três transitivas.

## Checkpoints da v0.6

Checkpoint Registar/Histórico: **48 API, 26 TypeScript e 25 Chromium aprovados** (2 opcionais omitidos); typecheck/exportação aprovados. Classificação validada, documento sem resultados, especialidades múltiplas, alteração de categoria sem duplicar original/alterar resultados, pesquisa/filtros/persistência e ausência de chamadas de extração no fluxo documental. Captura Registar a 320 px revista em tmp. Admissão ordenada de escrita manteve atomicidade e melhorou os percentis no ensaio curto; ver LOAD_TEST.md. Contas/perfil ainda em implementação neste checkpoint.

Checkpoint de integridade/fila: **46 testes API, 26 TypeScript e 24 Chromium aprovados**; 2 Chromium opcionais de inferência omitidos. Typecheck e exportação web aprovados. Regressões: ID de tensão repetido com conteúdo equivalente/diferente, data equivalente com fuso, ausência de ressurreição após eliminação parcial, duas edições com a mesma versão (uma 200/uma 409), precondição obrigatória, versão do documento pai, manutenção da evidência, formulário desatualizado com campos preservados e decisão explícita. Fila: limite/deduplicação/FIFO/cancelamento/expiração/âmbito e confirmação não automática; parser sem Ollama. Testes anteriores mantidos. Detalhes da fila em LOCAL_EXTRACTION.md. Os ensaios de desempenho comparáveis estão em atualização em LOAD_TEST.md.

## Registo histórico — v0.5

Executado em Windows: **25 testes TypeScript, 23 Chromium, 42 API e 2 de fundação — 92 aprovados**. Typecheck e exportação web Expo aprovados. Playwright: `23 passed, 2 skipped`; os dois opcionais de inferência real não foram repetidos nesta v0.5, sem alteração ao motor. Comandos reproduzíveis em [UX_LEARN.md](UX_LEARN.md); logs desta execução em `tmp/v05-browser.log` e `tmp/v05-api.log` (temporários, fora do Git).

Novos testes: preferência apenas não clínica, armazenamento bloqueado, fechar/reabrir processo Chromium conservando tema; diálogo nomeado com foco inicial, ciclo Tab, Escape e retorno; estados dos botões; erros associados aos campos; foco e contraste calculado de texto/campo nos dois temas; lista textual de medições por teclado; motivo real de data ausente mantendo o registo no histórico; biblioteca com pedidos externos bloqueados e fonte solicitada só depois do clique. Catálogo verifica seis secções/23 fichas, fontes, revisão editorial e ausência de revisão clínica inventada. Testes anteriores de PDF/correção/confirmação/recarga/original/gráfico, tensão, edição/eliminação, isolamento e migração preservados e aprovados.

Responsividade verificada pelas suites existentes em 320, 390, 1100 e 1280 px, incluindo tema escuro, modal, navegação, formulário e artigo com **zoom CSS 200%**. Não é zoom real do navegador. Tentativa de acesso ao Chrome pelo controlo nativo terminou por tempo de espera da autorização, antes de observar/controlar a página: nenhum ensaio de zoom real foi concluído. NVDA não encontrado nos locais habituais, PATH, registo de instalação/processos consultados; não foi instalado. Nenhum leitor de ecrã real, TalkBack, VoiceOver, dispositivo físico ou participante humano foi ensaiado. Não há certificação WCAG nem revisão clínica independente. O [protocolo](USABILITY_PROTOCOL.md) contém passos e grelha em branco, não resultados.

Base normal `.local` preservada; testes API/Chromium usaram bases temporárias. Sem dependências novas. Avisos não bloqueantes Starlette/httpx, PyMuPDF/ByteString e NO_COLOR/FORCE_COLOR mantêm-se. Auditoria de dependências histórica não foi reavaliada nem declarada resolvida. Não houve commit ou push deste sprint. Limites e inventário de alterações em [UX_LEARN.md](UX_LEARN.md).

## Registo histórico — Hub e Aprender, 08/11/2026

Typecheck e exportação web Expo aprovados. Testes executados neste sprint: **23 TypeScript, 18 Chromium, 42 API e 2 de fundação — 85 aprovados**. Os 2 testes opcionais com inferência real não foram repetidos nem incluídos nesta contagem; backend/Ollama não foram alterados.

Novos ensaios verificam contagens/isolamento no Hub e associação de tensão só na mesma sessão; catálogo/fontes/relações; pesquisa com acentos e aliases; categorias, fichas e termos relacionados; popover por teclado, Escape e restituição do foco; retorno ao parâmetro certo no histórico; modal a 320 px sem perder o formulário; biblioteca sem API; largura 390/1280, temas e navegação em artigo com ampliação CSS de 200%. Fluxos anteriores de importação/correção/confirmação, gráfico/original, tensão, edição/eliminação e isolamento continuam a passar.

Capturas revistas visualmente: Hub desktop/móvel, Aprender escuro, modal de 320 px e ficha ampliada. Código e dados educativos em [UX_LEARN.md](UX_LEARN.md). Conteúdos experimentais com revisão editorial datada e **revisão clínica independente pendente**. Sem certificação de acessibilidade, leitor de ecrã, ensaio com utilizadores ou dispositivo físico. Avisos não bloqueantes de depreciação Starlette/httpx e PyMuPDF/ByteString e NO_COLOR/FORCE_COLOR; sem dependências novas. Base normal preservada; testes usaram bases temporárias.

As secções seguintes são registos históricos.

# Validação Sprint 0 — 07/11/2026
Ambiente: Windows, Node 24.22.1, npm 11.19.1, Python 3.15.2. Expo 57.0.32, React Native 0.86.3 e React 19.2.3. Dependências Python em requirements-dev.txt, frontend no package-lock.json.

## Executado
- node --test tests/foundation.test.mjs: 2 aprovados.
- python -m pytest services/api/tests: 3 aprovados. Aviso de depreciação Starlette/TestClient sobre httpx; não afeta os resultados observados, acompanhar atualização futura.
- API Uvicorn iniciada em 127.0.0.1:8000; pedido HTTP real a /health devolveu status ok e mode synthetic-demo.
- npm.cmd run typecheck: aprovado após configurar tipos Node para os testes.
- npm.cmd test: 3 aprovados (navegação, troca de perfil, perfil desconhecido).
- npx.cmd expo install --check: dependências compatíveis com Expo.
- npx.cmd expo export --platform web: aprovado, bundle web gerado.
- npm.cmd run test:web: 1 aprovado em Chromium, viewport 390x844. Abre as cinco áreas, percorre separadores e confirma histórico vazio no perfil B após trocar do A. Sem erros JavaScript de página nesse fluxo.
- Captura docs/sprint0-mobile.png revista visualmente: títulos, cinco cartões e navegação legíveis, sem sobreposição observada nesse viewport.

## Limites e pendências
Não executados Android/iOS, testes com leitores de ecrã, ampliação real a 200%, usabilidade com pessoas ou revisão clínica. Labels e estados selecionados foram implementados; certificação de acessibilidade não foi realizada.
O isolamento testado é apenas de apresentação local entre perfis fictícios. Ambos os conjuntos de dados são incluídos no bundle; não há autenticação/autorização de produção.
API e interface são independentes nesta sprint. Não há armazenamento, uploads, interpretação ou edição de registos. Não considerar os AC-01 a AC-18 do MVP integralmente cumpridos nem a Sprint 1 concluída.

## Dependências e ocorrências
npm audit reportou 4 avisos moderados na cadeia Expo/fingerprint/glob/minimatch, sem avisos altos/críticos. Não foi aplicado o downgrade incompatível sugerido por audit --force. Registar para revisão de dependências antes de expansão ou distribuição; esta entrega é local com dados fictícios.
O npm assinalou o script de instalação esbuild não aprovado; os testes tsx e a exportação passaram sem o aprovar.
A primeira instalação revelou versões incompatíveis; corrigidas através de expo install --fix. A primeira compilação web revelou falta de watchFolders para JSON fora de apps/mobile; corrigida em metro.config.js. Repetições finais aprovadas.
Testes API sem permissões de ligação local ficaram bloqueados; a execução autorizada passou. Descargas e testes de navegador também precisaram de autorização neste ambiente.
Não foi criado commit nem feita publicação. Alterações já preparadas pelo utilizador no Git foram preservadas.

Reinstalação npm.cmd ci pelo lockfile: aprovada; typecheck, 3 testes de lógica e expo install --check repetidos após reinstalar, todos aprovados.

## Sprint 1 — 07/11/2026
Executado: npm.cmd run typecheck aprovado; npm.cmd test: 11 aprovados (8 de dados clínicos e 3 de navegação); expo export --platform web aprovado; npm.cmd run test:web: 4 aprovados, incluindo seleção de ponto, documento original, perfil vazio, respiração e tensão em Chromium a 390/1100px. node --test tests/foundation.test.mjs: 2 aprovados. pytest services/api/tests -q: 3 aprovados, mantendo aviso de depreciação httpx. Total: 20 testes aprovados.
A primeira exportação foi bloqueada por permissões ao atualizar dist; repetida com autorização, aprovada. Sem alterações em dependências. Avisos de dependências da Sprint 0 não foram reavaliados nesta sprint.
Captura mobile revista visualmente: títulos, cartão, escala e linha temporal legíveis, navegação preservada. Android/iOS, leitor de ecrã e ampliação real continuam não verificados. Carregamento/erro/repetição implementados, sem ensaio forçado no navegador. Sem teste de backend de dados clínicos: ainda não existe. Detalhes em SPRINT_1.md.

## Otimização de interface e integração funcional — estado atual
Executado em Windows, 07/11/2026, com a stack existente. Inspeção inicial incluiu o PRD, regras, arquitetura e o relatório de revisão fornecido. Nenhuma reconstrução da aplicação ou substituição da stack.

Resultados finais:
- npm.cmd run typecheck: aprovado após corrigir a tipagem do foco web.
- npm.cmd test: 16 aprovados (cronologia, valores/unidades, ausências, comparabilidade, proprietário/documento, proveniência, persistência, falha de quota, idempotência, revisão e correção).
- python -m pytest services/api/tests -q: 11 aprovados. Inclui saída campo a campo do PDF, vírgula decimal, unidade desconhecida, valor/data ausente ou ambígua, duplicados, formato inválido, cifrado, layout desconhecido e limites de tamanho/páginas.
- npm.cmd run test:web: 8 aprovados em Chromium. Inclui importar → corrigir → rever cada linha → confirmar → recarregar → histórico/gráfico/original; tensão → rever → guardar → recarregar → gráfico; troca de perfil; falha de armazenamento e repetição; modos claro/escuro; largura 320; foco e Tab; ampliação CSS de 200%. Testes de gráficos a 390/1100 px preservados e adaptados ao seletor, com verificação do período.
- node --test tests/foundation.test.mjs: 2 aprovados.
- expo export --platform web: aprovado.
Total: 37 testes aprovados. Ampliação CSS não é um ensaio manual do zoom nativo do navegador. Não foi feita certificação de acessibilidade, ensaio de leitor de ecrã, estudo com utilizadores, teste Android/iOS ou revisão clínica.

Evidência visual: captura escura de 320 px e capturas dos gráficos revistas; PDF de exemplo renderizado e revisto sem texto cortado. Não foi alegado impacto de usabilidade com pessoas.
Ocorrências corrigidas: o primeiro ensaio integral encontrou uma API antiga na porta 8000, só com /health; foi parada e o fluxo repetido com a API atual. Um teste de tensão assumia apenas uma série de método e foi adaptado para preservar a separação entre fixtures e registos manuais. A tipagem de tabIndex no componente de texto foi corrigida antes da aprovação final.
Avisos não bloqueantes: depreciações Starlette/httpx e PyMuPDF/ByteString; avisos NO_COLOR/FORCE_COLOR da ferramenta. Auditoria de dependências da Sprint 0 não foi repetida nesta entrega; os quatro avisos moderados anteriores não foram declarados resolvidos.

Funcionalidade real: persistência web em localStorage; API stateless extrai o layout PDF sintético; histórico/dashboard/gráficos leem a mesma fonte. Snapshot por perfil inclui PDF original, hash, parser e evidência. Não há PostgreSQL, autenticação, encriptação local, sincronização ou proteção contra escrita concorrente entre separadores. Apenas uma janela de escrita, apenas dados fictícios. Perfis são separação demonstrativa, não controlo de acesso de produção.
Não implementados: OCR, IA, alertas, partilha/instituições, edição de resultados já confirmados, múltiplas leituras na mesma sessão, calendário/medicação funcionais ou biblioteca clínica revista. Rascunhos não são persistidos; cancelar não grava. Duplicados PDF no mesmo perfil são recusados com mensagem explícita.
Ficheiros centrais: App.tsx, src/ui.tsx, src/clinical/{data,repository,RecordViews,ClinicalPanel,TimelineChart,Forms,importData,PdfPicker}. API: main.py e pdf_parser.py; uma amostra laboratorio-demo.pdf e script para a regenerar. Atualizados os testes úteis existentes, adicionados apenas testes de persistência, parser e fluxos. Removida a função observationsFor e a sua fonte paralela na interface; as duas leituras antigas continuam na migração explícita.
Documentação de utilização atualizada em GUIA_WINDOWS.md; arquitetura e segurança atualizadas. Nenhum commit, publicação ou partilha de dados realizado.

Os dois testes de gráfico/período foram repetidos com o relógio do navegador fixado em 07/11/2026, aprovados, para manter o teste estável ao longo do calendário. O prazo do parser foi testado por limites funcionais de entrada, não por ensaio de exaustão de recursos. Servidores de revisão iniciados localmente em 8081/8000; o arranque Expo desta sessão usa CI (sem observação automática de alterações), podendo ser reiniciado com o comando normal do guia para desenvolvimento contínuo.

## Correção do fluxo PDF — 07/11/2026
Implementado: seletor visual com tema e drop, seleção antes do envio, nome/cancelamento/substituição, estados por eventos reais de transferência/resposta, repetição de erros, revisão de data/laboratório, referência visível e original acessível antes de confirmar. Reutilizados repositório local, validações, deduplicação e gráficos. Exemplo copiado para public/laboratorio-demo.pdf; manter esta cópia sincronizada ao regenerar a fixture.
Diagnóstico: uma instância com --reload no Windows devolvia 500 ao criar subprocesso assíncrono; navegador reportava ausência de CORS nessa resposta. Corrigido com subprocess.run em asyncio.to_thread, timeout de 8 segundos e cwd explícito. Reiniciada a instância local para carregar a alteração. As restrições de sockets do sandbox também impediram verificações iniciais; testes finais executados com autorização fora do sandbox.
Executados: npm.cmd run typecheck aprovado; npm.cmd test 16 aprovados; .venv/Scripts/python.exe -m pytest services/api/tests -q 11 aprovados (avisos de depreciação Starlette/httpx e PyMuPDF/ByteString); npx.cmd expo export --platform web aprovado; npm.cmd run test:web 8 aprovados. Primeiras execuções web tiveram 7 aprovados/1 falha PDF com a instância anterior; repetição final passou após reinício. Teste PDF verifica extração, correção, confirmação, persistência após reload, gráfico, original e isolamento de perfil. GET localhost:8081/laboratorio-demo.pdf: 200 application/pdf.
Limites: processamento é síncrono por pedido; após upload a UI aguarda extração/resposta, sem percentagens ou telemetria de etapas internas. Gravação é localStorage, não no servidor. Não testados manualmente drop, leitor de ecrã ou Android; zoom testado é CSS, não zoom real do navegador. Script start.ps1 criado; os comandos constituintes foram executados, mas o ciclo completo desse script até Ctrl+C não foi ensaiado. Sem OCR, dados reais ou publicação.

## Estabilização — resultado final atual
17 testes de dados/navegação, 17 testes API/PDF/SQLite, 10 testes Chromium e 2 da estrutura aprovados (46). TypeScript e exportação web aprovados; git diff --check sem erros. Repetição direcionada detetou e corrigiu uma fixture de testes que só repunha a base no primeiro ficheiro; agora cada teste usa fixture automática, execução sequencial e base temporária. Nenhum teste utiliza a base .local do utilizador.
Arranque por dev.cmd executado duas vezes com Node de Program Files, HTTP 200 em 8081 e API em 8000. Segunda instância devolve erro 1; Ctrl+C liberta ambas as portas. Uma sessão fictícia com 2 observações persistiu após parar e reiniciar os processos, numa base temporária. Não foi literalmente encerrado o Codex durante a tarefa; o launcher testado não usa executáveis do runtime do Codex e funciona no terminal independente.
Etapas 1–4 e 6 implementadas/verificadas. Etapa 5 inspecionada: não havia login, pelo que não foi criado sistema complexo. Âmbito de perfil no backend não substitui autenticação; contas reais, sessões/revogação e autorização de produção continuam pendentes. QR/LAN documentados, sem ensaio físico, sem alterações de firewall e sem Tunnel/backend público.
Checkpoints por etapa em STABILIZATION.md. Sem commits: index preexistente com trabalho alheio e identidade Git ausente. Nenhum reset Git, publicação ou serviço pago.
Limites: SQLite contém snapshots versionados por perfil, não schema relacional de produção; dados apenas fictícios, sem encriptação/autenticação. Migrações conflitantes preservam ambas as cópias e exigem reconciliação posterior; rascunhos não confirmados continuam temporários. PDFs continuam limitados ao modelo determinístico suportado, sem OCR. Não foi implementado Arquivar.
## v0.4 — 08/11/2026, estado atual

Typecheck/exportação aprovados; 42 testes API, 20 TypeScript, 2 de fundação, 11 Chromium normais e 2 Chromium com Ollama real aprovados (77 distintos). Suite normal omite os 2 de inferência, que foram executados separadamente. Benchmark adicional: 15 documentos sintéticos/80 associações esperadas; 81 propostas, uma extra/não reconhecida e uma data não resolvida no caso denso, com revisão humana obrigatória. Hardware, tempos, recursos, comparação com parser anterior, comandos e limitações em [LOCAL_EXTRACTION.md](LOCAL_EXTRACTION.md). Secções anteriores são registos históricos, não estado atual. Não foi feita publicação deste incremento.


## Matriz funcional do catálogo — sprint de simplificação

Auditoria programática em bases temporárias: 19 testes API, 19 testes do modelo de gráficos e um percurso de navegador que seleciona os 19 parâmetros e confere unidade/proveniência do ponto. A = aprovado; F = falhou; NS = não suportado nesta via; NT = não testado. CRUD/proveniência abaixo refere-se à API com a unidade principal; unidades alternativas foram verificadas no catálogo, sem conversão ou alegação de UI repetida para cada uma. Inclui persistência, datas repetidas/diferentes, decimal com vírgula, valores/data ausentes, unidades/métodos/amostras distintos e edição/eliminação. UI de editar/eliminar é partilhada e testada nos fluxos comuns, não repetida para cada parâmetro.

| Parâmetro | Alias/unidade de extração | API CRUD/origem | Modelo gráfico | Seleção UI/origem | Parser PDF conhecido | Formulário domiciliário |
|---|---|---|---|---|---|---|
| Glicose | A | A | A | A | A | NS |
| Hemoglobina glicada | A | A | A | A | A | NS |
| Colesterol total | A | A | A | A | NS | NS |
| Colesterol HDL | A | A | A | A | NS | NS |
| Colesterol LDL | A | A | A | A | A | NS |
| Triglicéridos | A | A | A | A | NS | NS |
| Creatinina | A | A | A | A | A | NS |
| Hemoglobina | A | A | A | A | A | NS |
| Ferritina | A | A | A | A | NS | NS |
| TSH | A | A | A | A | NS | NS |
| T4 livre | A | A | A | A | NS | NS |
| Vitamina D | A | A | A | A | NS | NS |
| Ureia | A | A | A | A | NS | NS |
| Sódio | A | A | A | A | NS | NS |
| Potássio | A | A | A | A | NS | NS |
| Tensão sistólica | NS (unidade A no modelo) | A | A | A | NS | A |
| Tensão diastólica | NS (unidade A no modelo) | A | A | A | NS | A |
| Frequência cardíaca | NS (unidade A no modelo) | A | A | A | NS | A |
| SpO₂ | NS (unidade A no modelo) | A | A | A | NS | NS |

Extração real por Ollama de cada parâmetro: NT nesta auditoria; o catálogo de aliases/unidades e a validação determinística de propostas não provam reconhecimento de qualquer PDF. Parser conhecido limitado aos cinco analitos indicados; os restantes requerem introdução/revisão manual ou extração local posteriormente validada. SpO₂ não tem formulário domiciliário dedicado. A matriz não valida resultados clínicos. Logs: `tmp/entry-c-api.log`, `tmp/entry-c-unit.log`, `tmp/entry-c-browser.log`. Nenhum problema de integridade/isolamento novo encontrado nestes testes.
