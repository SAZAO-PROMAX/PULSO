# Checkpoint — recuperação web e primeiro diagnóstico Android, 09/11/2026

Versão **0.7.4**, sem alteração funcional, de dependências da aplicação, autenticação ou base normal. Base Git `c093695`; este checkpoint inclui e preserva PROJECT_STATUS.md modificado e MOBILE_VALIDATION.md não rastreado que estavam locais. Identificador desta atualização: `git log -1 -- docs/MOBILE_VALIDATION.md`.

## Resultado por bloco

- **A/B web recuperada:** no início 8000/8081 estavam livres, sem servidores; Node 26.13.0, npm 11.20.0, Python 3.15.2 e dependências existentes operacionais. Não foi demonstrada regressão de código. `dev.cmd`/`scripts/dev.mjs` arrancaram API/frontend. HTTP 200 em /health e página inicial; Chromium carregou a página pública sem erros JavaScript não tratados. Login/sessão/Hub/Registar/importação/detalhe/gráfico passaram num percurso Playwright com SQLite temporária. Não foram usadas credenciais pessoais nem realizados testes/reposições na base normal. O servidor normal ficou reservado à utilização interativa.
- **C ferramentas instaladas:** Android Studio 2026.2.2.8; Microsoft OpenJDK 17.0.21.21 (java 17.0.21.0.2); Command-line Tools 23.0 / Android CLI 1.1.16717390; Platform Tools 37.0.1 / adb 1.0.41; Emulator 37.2.13; Platform Android 36 r2, Build Tools 36.0.0 e imagem AOSP Android 36 x86_64 r2. Versões de compilação confirmadas no React Native instalado. SDK em `$env:USERPROFILE\Android\Sdk`; ANDROID_HOME/JAVA_HOME e entradas SDK do PATH de utilizador configurados. Abrir novo terminal para herdar variáveis. Sem reinstalar Node/Python/Expo ou instalar dependências npm. Licença Android aceite explicitamente pelo utilizador; hashes conferidos por winget e arquivo das ferramentas conferido contra o repositório oficial.
- **D canal verificado em emulador:** não havia Android físico ligado. Criado AVD `PULSO_API36`, perfil Pixel 7, Android 16/API 36, WHPX já disponível; sem ativar funcionalidades Windows. ADB reverse da porta 8014 → API de teste em 127.0.0.1:8014 respondeu HTTP 200. Alias 10.0.2.2 também respondeu, sem alterar bind. `/auth/test-context` confirmou enabled=false; o rótulo histórico synthetic-demo em /health não prova modo demonstrativo. Nunca encaminhada a API normal 8000 para testes Android.
- **Primeiro arranque Android real em emulador:** Expo Go **57.0.9**, projeto SDK 57, Metro local 8082; bundle nativo carregado e página pública PULSO inspecionada com UIAutomator. Não é uma build APK própria do PULSO, nem ensaio físico. Aviso SafeAreaView deprecated observado; sem corrigir dependências oportunisticamente.
- **E diagnóstico de autenticação:** pedido sem Origin recebeu 403; a tentativa no formulário Android, com conta fictícia preparada na API temporária, mostrou “Origem do pedido não permitida”. Hub privado ausente. **Login nativo bloqueado, não aprovado.** Nenhuma Origin forjada, CSRF removida ou autorização contornada. Proposta abaixo; não implementar um segundo login improvisado.
- **F/G pendentes:** seleção PDF, visualizador PDF, revisão/guarda/histórico/gráficos privados Android e câmara privada não testados/implementados neste checkpoint. Sessão nativa segura é pré-requisito do percurso integrado. Aplicada a regra do Bloco 3 de terminar com proposta/diagnóstico quando a segurança da integração ainda não está demonstrada.

Ensaio: API loopback 8014, SQLite `tmp/android-first.sqlite3`, inferência desligada, demo desativada; Metro 8082 e emulador próprios. Encaminhamentos 8014/8082 removidos, emulador, Metro e API de teste encerrados no fim; servidor web normal preservado. Nenhuma imagem/documento médico real. Artefactos UI apenas em tmp, fora do Git. Ficheiros temporários do SDK/instaladores não são artefactos da aplicação.

## Contrato nativo proposto — não implementado

**Problema observado:** `/auth/login` exige Origin da web; RN/XHR não tem contrato nativo explícito. O servidor rejeitou a tentativa real no emulador. `credentials: include` não comprova cookie jar persistente, revogação ou proteção ao voltar do background. Criar um cabeçalho Origin fictício não resolve a identidade nem a segurança.

**Solução candidata para revisão:** reutilizar contas, Argon2id, limites, dono/versões e repositório; introduzir um canal de sessão nativa explicitamente separado do cookie web. Login nativo dedicado com JSON limitado e rate limiting, token opaco aleatório com apenas digest no servidor, validade absoluta e revogação; credencial guardada exclusivamente em armazenamento protegido do SO (expo-secure-store compatível, com backup tratado), nunca AsyncStorage/logs/URLs. O cliente envia Authorization explicitamente; nonce de mutação ligado à sessão continua obrigatório. Leitura/autorização por recurso e If-Match mantêm-se iguais. Não aceitar combinações ambíguas cookie/bearer, sessões web no canal nativo ou o inverso; não identificar um cliente seguro por um mero X-Pulso-Native. Endpoints nativos não devem aceitar requisições de browser com Origin, nem abrir CORS globalmente. Uma sessão nativa não comprova autenticidade/integridade do dispositivo ou ausência de malware.

**Ciclo de vida:** confirmar sessão antes da shell; revalidar em relançamento e AppState active; invalidar respostas de sessão antiga. Logout revoga no servidor, apaga credencial protegida e desmonta dados/rascunhos; falha de rede no logout não pode ser apresentada como revogação confirmada. Expiração/recuperação/troca de conta têm de revogar acessos e limpar cache. Token não é dado clínico e não deve ser copiado para histórico de navegação ou relatório.

**Impacto e ameaças:** web mantém cookie HttpOnly/SameSite/Origin/CSRF inalterados; backend precisará distinguir o canal no registo/lookup/revogação das sessões e cobrir todos os endpoints, incluindo XHR, extração, fotografia e originais. É uma alteração estrutural, ainda não aplicada à SQLite. Token explícito impede dependência de cookies ambiente para clientes nativos; nonce/versão/dono e recusa de canais ambíguos mitigam submissões indevidas, replay após revogação e confusão entre contas/canais. Credenciais continuam sujeitas a roubo num dispositivo comprometido; esta proposta não constitui auditoria ou solução de produção.

**Transporte:** HTTP apenas no canal local de desenvolvimento explicitamente configurado e ligado à base temporária; HTTPS obrigatório num futuro ambiente fora deste ensaio. Não adicionar exceções cleartext amplas em builds de distribuição, portas públicas, cloud, permissões todas as origens ou bypasses de teste.

**Provas necessárias antes de aprovar integração:** login/rotação/expiração/revogação, SecureStore e backup, restauro/background, CSRF/Origin web intactos, recusa de credencial errada/canal misto/nonce ausente, isolamento de dados/trabalhos/originais entre A/B, conflitos If-Match, upload XHR e reinício/falha de rede. Primeiro em SQLite temporária e emulador; depois telefone físico e cache/teclado/TalkBack. Só então avançar para PDF nativo com versões do SDK 57 selecionadas por expo install. Visualizador externo requer ação informada e avaliação de retenção/partilha; não implementado silenciosamente.

## Verificações executadas / comandos de continuação

- `node scripts/dev.mjs --check`: ambiente encontrado e portas livres inicialmente.
- Playwright `public-entry.spec.ts --grep 'conta autenticada importa PDF'`, com PULSO_TEST_PUBLIC=true/PULSO_TEST_LAUNCHER=true e base temporária do config: **1 aprovado**; sem suite completa.
- Chromium contra página pública normal: visível, **0 pageerror**, sem registo/login automático nessa base.
- `pytest services/api/tests/test_accounts.py -q -k 'native_transport_without_origin or accounts_sessions_csrf_isolation' --basetemp=tmp/pytest-android-contract`: **2 aprovados**, 13 não selecionados; 2 avisos de depreciação conhecidos. Inclui isolamento, escrita autorizada, persistência, CSRF e recusa após logout; teste novo fixa a recusa sem Origin. Não são testes de autenticação nativa bem-sucedida.
- `java -version`, `adb --version`, `adb devices`, inventário SDK e `emulator -accel-check`: executados. Dispositivo físico ausente; boot Android, canal HTTP e UI/login recusado verificados em emulador.
- `git diff --check`: aprovado. Sem carga, inferência Ollama, suite completa ou alteração da versão.

Para usar a web sem Codex: numa janela PowerShell própria, raiz do projeto, `.\dev.cmd`; manter aberta, esperar Metro e abrir http://localhost:8081/. Ctrl+C nessa janela termina os filhos desse launcher. Fechar o terminal ou concluir os servidores de teste não mantém um serviço permanente. Não lançar uma segunda instância para resolver porta ocupada; usar a janela que já está a servir. Guia atualizado em GUIA_WINDOWS.md.

Para retomar diagnóstico Android, abrir novo PowerShell com ANDROID_HOME/JAVA_HOME já herdados, iniciar `emulator -avd PULSO_API36 -port 5556 -no-snapshot` numa janela própria. Iniciar API com PULSO_DB_PATH resolvida para tmp e LLM_EXTRACTION_ENABLED=false em 8014, bind127.0.0.1; `adb -s emulator-5556 reverse tcp:8014 tcp:8014`. Metro nativo usa EXPO_PUBLIC_API_URL=http://127.0.0.1:8014 e porta8082, `npx.cmd expo start --android --localhost --port 8082`. Não reutilizar a base normal para testes. Parar com Ctrl+C nas respetivas janelas e remover apenas os reverses deste ensaio; `adb -s emulator-5556 emu kill` termina apenas o emulador criado. Nenhum destes passos comprova login nativo enquanto o contrato acima estiver pendente.

Fontes oficiais consultadas: [Expo/Android](https://docs.expo.dev/workflow/android-studio-emulator/), [React Native/ambiente](https://reactnative.dev/docs/set-up-your-environment), [Android Studio/licença](https://developer.android.com/studio/install), [ADB reverse](https://developer.android.com/develop/ui/views/layout/webapps/access-local-server), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/), [DocumentPicker](https://docs.expo.dev/versions/latest/sdk/document-picker/). As páginas latest podem mostrar SDK mais recente; não atualizar o projeto 57 com base nelas.

**Continuação:** implementar/rever contrato nativo com as provas acima; depois PDF/consulta original; depois percursos privados/acessibilidade/cache no emulador e telefone. Checkpoint de ambiente/diagnóstico, sem declarar primeira implementação Android completa.

---

## Histórico — preparação documental antes da instalação

# PULSO v0.7.4 — protocolo de primeira validação móvel

**09/11/2026. Preparação por inspeção, sem execução nativa.** Versão permanece 0.7.4. Não é uma nova entrega funcional. Estado web/testes anteriores em [VALIDATION.md](VALIDATION.md); resumo em [PROJECT_STATUS.md](PROJECT_STATUS.md). Esta matriz complementa a auditoria histórica de [ARCHITECTURE.md](ARCHITECTURE.md), sem a transformar em suporte móvel comprovado.

## Entrega confirmada

No início desta tarefa: árvore limpa, branch `main`, HEAD e `origin/main` após fetch iguais a `c093695a23d5378ddd5c2f6e7039080a6126ceec`. `git ls-remote origin refs/heads/main` confirmou o mesmo commit no GitHub. Última alteração de PROJECT_STATUS.md e VALIDATION.md: esse mesmo commit G. Origin: https://github.com/SAZAO-PROMAX/PULSO.git. Não houve alterações locais anteriores a preservar, integração, force push ou nova publicação nesta verificação.

## Inventário confirmado no código

| Área / fonte | Existe | Limite para ensaio móvel |
|---|---|---|
| `App.tsx`, `AuthProvider.tsx` | SessionGate aguarda sessão/contexto; shell por identidade; login confirma sessão; logout revoga, limpa CSRF/utilizador e desmonta shell; 401 ignora respostas de geração antiga | Cookie jar nativo, reinício e regresso do background não ensaiados. Revalidação `pageshow` é só web; não há tratamento AppState equivalente |
| `api.ts`, `repository.ts`, `accounts.py` | `credentials: include`, cookie HttpOnly/SameSite Strict, CSRF em memória, Origin exata nas escritas, If-Match e autorização por dono | Nenhum adaptador nativo explícito de cookies/Origin. Origin ausente é recusada pelo servidor. Login também passa por validação Origin; viabilidade nativa ainda não comprovada |
| `api.ts`, `scripts/dev.mjs` | URL configurável; sem hostname web, default 127.0.0.1:8000; launcher liga API em loopback | Num telefone o loopback é do telefone. Transporte HTTP nativo, políticas da build e alcance da API por confirmar; o QR não resolve este contrato |
| `CameraCapture.tsx`, `app.json` | expo-image-picker; permissão de câmara só ao pedir captura, preview, repetir, aceitação explícita, alternativa galeria/cancelar; microfone desativado na configuração | Sem teste físico. Falta verificar permissões permanentes/limitadas, cancelamento, background e retorno tardio do seletor. Prop `visible` não é usada pelo adaptador nativo |
| `inputDocument.ts`, `documentDigest.ts` | JPEG/base64, limites 2 MB/12 MP, hash expo-crypto, remoção APP1/APP13/comentários | Não é garantia de eliminação de toda a metadata/cache do SDK. Câmara/galeria assumem JPEG; formatos e resolução reais têm de ser ensaiados |
| `PdfPicker.tsx` | Seletor nativo reutiliza galeria, aviso explícito de PDF nativo indisponível | **Importar PDF nativamente não está implementado.** Não marcar aprovado; imagem é o percurso nativo previsto |
| `DocumentImport.tsx` | Mesma revisão, exclusão, confirmação e API; captura fornece InputDocument/dataUrl | XHR envia ArrayBuffer, usa AbortController/Response; compatibilidade do runtime nativo por verificar. Não existe autorização nativa alternativa. Com Ollama desligado, fotografia segue introdução manual, não extração visual automática |
| `DocumentView.tsx` | Imagem original renderizada nativamente e texto disponível | Abrir PDF original usa apenas web/Blob/window; não há visualizador PDF nativo |
| `RegisterHub.tsx`, `editNavigation.ts`, `routes.ts` | BackHandler Android em Registar, modais de descarte, formulários mantidos em memória; detalhes têm voltar interno | Histórico contextual assenta em browser history na web; não existe stack/gestos iOS equivalentes comprovados. Saída global nativa com edição mostra aviso para guardar/cancelar; não oferece o mesmo descarte global web |
| `RegisterHub.tsx`, `AuthProvider.tsx` | Logout/troca de dono desmontam rascunhos; sem cache clínica persistente implementada; aborto/cancelamento de extração no desmontar | Cache de ficheiros do image-picker/SO não é eliminada explicitamente pelo app; limpeza privada após captura/logout exige inspeção no dispositivo. Não prometer eliminação física/segura |
| `ui.tsx`, formulários/gráficos | Papéis/rótulos, estados, alvos, escala/tema e redução de movimento; lista alternativa dos pontos | TalkBack/VoiceOver, teclado virtual/externo, foco após erro e safe areas não ensaiados. Field nativo é TextInput, sem gestão geral de teclado numérico/próximo nem KeyboardAvoidingView |
| Perfil/fotografia | Avatares predefinidos partilhados | AvatarPicker nativo é aviso/fallback; AuthProvider só carrega fotografia privada na web |

Exportações JavaScript Android/iOS aprovadas **na v0.7.3**, conforme VALIDATION.md. Não são APK/IPA, instalação nem teste de permissões/sessões. Não se repetiu exportação nativa na v0.7.4 ou nesta inspeção. Web Chromium responsiva tem a evidência G; não é Chrome Android/Safari iPhone físico.

## Ambiente observado / ferramentas necessárias

Windows atual: Node detetado. `adb`, `emulator`, `java`, `gradle`, `xcodebuild` não detetados no PATH; SDK/adb/emulator também não encontrados em LOCALAPPDATA/Android/Sdk, variáveis ANDROID_HOME/ANDROID_SDK_ROOT/JAVA_HOME não definidas. Sem processos adb/emulator detetados. Isto não exclui instalação noutro diretório; dispositivos USB não foram enumerados sem adb. Não existem pastas de projeto `apps/mobile/android` ou `ios` no checkout; não foi executado prebuild.

- Android: SDK/platform-tools e runtime/build compatíveis com o SDK Expo do projeto; telefone físico com câmara e depuração USB autorizada para fotografar. Emulador serve para UI/rede/permissões com câmara sintética configurada; não substitui qualidade/rotação/captura física. Verificar compatibilidade do cliente Expo antes de escolher Expo Go ou development build; nenhum instalado/gerado nesta tarefa.
- iOS: iPhone para captura real; Mac com Xcode para simulador/build local. O Windows atual não fornece simulador iOS local. Acesso a Mac/dispositivo compatível permanece por organizar; não propor build cloud paga como requisito.
- Web móvel: Chrome Android e Safari iOS reais; acesso local seguro e controlado previamente preparado. O getUserMedia web exige o contexto seguro que o próprio código verifica; HTTP por IP LAN pode permitir ficheiro e recusar câmara. Desktop Chromium é a referência já ensaiada.
- Acessibilidade: TalkBack, VoiceOver, texto do SO aumentado, teclado virtual e externo quando disponível; zoom real nos browsers. Só dados sintéticos, sem fotografias de pessoas/exames reais.

Nenhuma ferramenta foi instalada, nenhum emulador/dispositivo iniciado, nenhuma firewall alterada, nenhum serviço exposto nesta tarefa.

## Bloqueios e proposta antes de alterar arquitetura

| Prioridade | Bloqueio confirmado ou risco a verificar | Complexidade qualitativa |
|---|---|---|
| P0 para ensaio integrado nativo | Contrato de sessão: servidor rejeita escrita sem Origin web permitida; cliente não define contrato nativo; cookie jar/renovação/revogação ainda sem prova | Média–alta; requer proposta de segurança e ensaio, sem remover Origin/CSRF globalmente nem fingir uma origem web |
| P0 para telefone | Loopback default não chega ao PC; API permanece ligada apenas a 127.0.0.1 | Baixa–média para preparar canal local USB/emulador e configurar URL; média para validar transporte/cookies por runtime |
| P1 | PDF nativo e visualizador original ausentes | Média; requer âmbito próprio. Neste protocolo marcar indisponível, não implementar |
| P1 | Navegação/contexto/saída com rascunho e retorno de background diferem da web | Média; avaliar comportamentos existentes antes de escolher qualquer biblioteca/stack |
| P1 privacidade | Retenção de ficheiros no cache do SDK/SO sem política de limpeza comprovada | Média; medir criação/remoção e isolamento por conta antes de desenhar limpeza |
| P1 acessibilidade | Leitores, teclado virtual, ampliação, foco/gestos e safe areas sem prova física | Baixa–média para medir; correções podem variar conforme o resultado |
| P2 | Fotografia do perfil e formatos da galeria sem suporte nativo equivalente completo | Baixa–média; não bloqueia ensaio com avatar predefinido/JPEG |

**Proposta, não implementação:** começar com API de teste em loopback/SQLite em tmp e estudar canal USB local para Android ou acesso do emulador ao host sem bind público; manter Ollama no PC e desligado no primeiro ensaio. Antes de login nativo, desenhar e rever como um cliente não-browser comprova sessão, conserva/revoga cookies e cumpre proteção das mutações. Preservar o comportamento web e autorização por recurso. Não basta acrescentar uma Origin arbitrária ou permitir todas as origens. Se exigir alteração do protocolo de autenticação, apresentar a proposta específica para aprovação antes de a executar. Para iOS definir canal local equivalente com Mac/dispositivo, sem abrir API à Internet. Nenhum destes canais foi criado/testado aqui.

## Matriz proposta (não executada nesta tarefa)

Legenda: **P** pendente; **B** bloqueado por pré-requisito; **N/D** não implementado/não aplicável. Evidência G é anterior, em Chromium desktop com viewport móvel; não atribuir esse resultado ao browser físico.

| ID / cenário e critério observável | Android físico / emulador | iOS físico / simulador | Web móvel física | Desktop web |
|---|---|---|---|---|
| 01 Login válido/incorreto, relançar, expirar: shell só com sessão confirmada, sem dados anteriores | B contrato/rede | B contrato/rede/ferramentas | P canal local; referência G | G aprovado; repetir só para comparar ambiente |
| 02 Abrir câmara por ação; permitir/recusar/recusa permanente: alternativa e sem bloquear app | P após runtime disponível | P após runtime disponível | P contexto seguro; G stream/recusa sintéticos | G sintético; câmara física P |
| 03 Fotografar folha de exame inteiramente fictícia; orientação/legibilidade/limites, sem áudio | P físico; emulador simulado | P físico; simulador só onde suportado | P físico | P câmara física |
| 04 Preview/repetir/cancelar/aceitar; apenas a captura aceite segue; ocultar/background não deixa captura ativa | P | P | P; G sintético | G sintético |
| 05 Importar JPEG/PNG, cancelar seletor, >2 MB/formato inválido; seleção válida não desaparece | P JPEG; outros formatos a verificar | P JPEG; outros formatos a verificar | P; G ficheiros | G aprovado |
| 05b Importar PDF e consultar original PDF | N/D | N/D | P; G browser | G aprovado |
| 06 Rever/corrigir valor/unidade/data, excluir incompleta, avisos claros; sem guardar automaticamente | B integração; UI P | B integração; UI P | P; G 15/25 controlados | G aprovado |
| 07 Confirmar explicitamente e guardar uma vez; falha rede conserva revisão, repetir sem duplicar; If-Match conflitante recusa | B integração | B integração | P; G/API referência | G/API aprovados |
| 08 Histórico/detalhe/gráfico, original, data/unidade/método e recarga sem perda dos confirmados | B integração; imagem original P | B integração; imagem original P | P; G referência | G aprovado |
| 09 Logout, voltar, relançar e background: privado não reaparece; sessão revogada no servidor | B integração | B integração | P; G referência | G aprovado |
| 10 Conta B tenta IDs de documento/medição/trabalho de A: recusa, sem original/fotografia/resultados; rascunho de A ausente | B integração | B integração | P; G/API referência | G/API aprovados |
| 11 Voltar interno/Android, gestos iOS quando suportados, cancelar modal e saída com rascunho; foco e sem perda silenciosa | P/B integração | P/B integração | P; G referência | G aprovado |
| 12 Offline/API indisponível/401 durante revisão, ficheiro inválido: sem sucesso falso, sem confirmação insegura | B integração | B integração | P; G/API referência | G/API aprovados |
| 13 Leitor de ecrã, texto grande, teclado aberto, rotação/safe areas, controlo final visível | P TalkBack | P VoiceOver | P leitores/zoom real | G viewport/escala; leitor/zoom real P |
| 14 Inspecionar cache antes/depois de cancelar/guardar/logout/trocar conta: registar retenção sem recolher conteúdo pessoal | P | P | P cache/URLs/streams | G memória/URLs; inspeção adicional P |

Fotografias não terão extração automática no primeiro ensaio com Ollama desligado: usar revisão/introdução manual existente. PDF web conhecido pode usar parser determinístico. Nenhum estado manual deve ser apresentado como inferência bem-sucedida.

## Ordem e registo do ensaio

1. Preparar ferramentas/canal local e confirmar API isolada em tmp, sem reutilizar a base normal; manter portas próprias e Ollama desligado. Registar versão do SO/runtime e commit, sem serial do dispositivo ou conta pessoal.
2. Resolver por proposta o contrato nativo de sessão/transporte. Primeiro teste mínimo: login → sessão → leitura própria → mutação com CSRF/versão → logout → acesso recusado; conta B não lê A. Se falhar, interromper ensaio integrado, sem desligar proteções.
3. Android: UI/câmara/preview/galeria e erros locais; depois percurso imagem → revisão manual → confirmação → histórico, com falhas de rede e rascunhos. Emulador pode preceder telefone, sem o substituir.
4. Web móvel física com acesso local seguro; comparar o PDF conhecido e a câmara com desktop G. Depois iOS no ambiente apropriado, repetindo os mesmos critérios, sem assumir equivalência.
5. Leitores/teclado/texto ampliado, background e cache/logout. Abrir apenas correções reproduzíveis e estimar o âmbito antes de implementar.

Para cada linha registar dispositivo/classe (sem identificador pessoal), SO/runtime, commit, fixture sintética, pré-condições, esperado, observado, resultado aprovado/falhou/bloqueado/omitido e evidência técnica sem cookies/credenciais/documentos. Interromper se houver acesso cruzado, perda silenciosa ou confirmação não deliberada. Não apagar resultados da base normal para repetir.

Nesta tarefa executaram-se apenas leitura de código/documentação, consultas Git/fetch/ls-remote e inventário de ferramentas/ficheiros. **Zero ensaios físicos, zero suite completa, zero carga/inferência.** Não há alterações funcionais nem mudança de versão. Os documentos desta preparação ficam locais, por rever; não foi criado novo commit nem feito push nesta tarefa.
