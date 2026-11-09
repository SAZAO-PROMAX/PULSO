# Arquitetura atual — PULSO v0.7.1
Frontend Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript estrito, com react-native-web. Backend Python/FastAPI/Pydantic e PyMuPDF. Stack mantida.

## Interface
App.tsx mantém a shell, navegação e dashboard. src/ui.tsx reúne cores, tema e componentes comuns (texto, cartão, botão, campo).
ClinicalPanel seleciona parâmetro e período; TimelineChart mantém a geometria nativa dos gráficos. RecordViews partilha detalhe/original entre histórico e gráfico. Forms gere os fluxos de tensão e revisão de PDF. O seletor de ficheiros tem implementação web e mensagem explícita na versão nativa.
App carrega dados por perfil, cancela apresentação de respostas tardias e atualiza o repositório visual após gravação. O foco web regressa ao título após navegação. A fonte legacy observationsFor foi removida; os dados antigos são migrados para o repositório comum.

## Dados e persistência — estabilização
ApiRepository é a única fonte ativa do frontend. SQLite da biblioteca Python padrão, num único ficheiro .local/pulso.sqlite3, guarda snapshots JSON versionados por perfil. Não há dependência SQL adicional ou PostgreSQL operacional.
GET /demo/profiles/{owner}/data lê a base. POST confirm/pressure gravam com confirmação do backend; PATCH e DELETE gerem registos e documentos. BEGIN IMMEDIATE, validação integral e commit/rollback protegem consistência e concorrência. A eliminação de exame remove os resultados associados na mesma transação; uma medição pode ser removida sem apagar o original.
A migração localStorage é só leitura e remoção após confirmação da API, uma vez por perfil. Se a base já tiver alterações, uma migração conflitante é recusada sem sobrescrever dados. A base nunca é reposta por estar vazia: apenas a ação explícita de reset reinstala as fixtures. Originais, hash, evidência e versões anteriores das correções são preservados; PDFs permanecem na base.
O prefixo histórico /demo está protegido por sessão no funcionamento normal. X-Pulso-Profile não autentica contas; estas são ligadas à sessão/dono. Perfis demo só são aceites com configuração explícita e base temporária dentro de tmp.

## Incremento v0.6

Contas individuais experimentais existem agora, mantendo a mesma SQLite e ApiRepository. `accounts.py` acrescenta tabelas de utilizadores, sessões opacas revogáveis, hashes de tokens temporários e contadores de tentativas; não cria outra base. Donos `user-<UUID>` exigem sessão válida e correspondência ao utilizador, com Origin/CSRF em mutações. demo-a/demo-b continuam num espaço público fictício, sem conversão/migração automática para contas. A frase de ausência de contas acima descreve a estabilização anterior.

Frontend: AuthProvider guarda utilizador/CSRF apenas em memória; cookie HttpOnly contém a sessão, nunca localStorage. api.ts centraliza host e pedidos com credenciais; frontend/API usam o mesmo hostname. O menu circular de perfil permanece no cabeçalho fixo; AccountPanel reutiliza componentes/tema e liga ao Histórico. Avatar PNG/JPEG é validado/redimensionado/reencodificado em PNG pelo backend e guardado como BLOB privado na tabela da conta; só `/auth/avatar` da própria sessão o devolve, sem URL pública ou acesso ao modelo.

Documentos/resultados mantêm schemaVersion 1 e recebem `version` por registo (dados antigos assumem 1). PATCH/DELETE exigem If-Match; alteração de resultado também incrementa o documento pai para proteger eliminação em cascata. Confirmação/edição continuam transacionais. Leituras usam transação de leitura; a escrita é admitida por uma fila de exclusão no event loop antes do worker de I/O, sem ocupar todas as threads a disputar SQLite. BEGIN IMMEDIATE continua a autoridade entre processos.

`registration.json` partilha categorias/tipos/especialidades entre frontend e backend. Metadados opcionais (`category`, `examType`, `specialties`, `examDate`) não mudam os resultados. Documentos sem extração usam o mesmo modelo/original/validação/SQLite e não criam medições. Classificação antiga ausente permanece visível em Todos os registos. A fila limitada de extração é local ao processo e partilha uma única vaga com o endpoint síncrono anterior; limites e reinício em LOCAL_EXTRACTION.md.
Unidades/métodos/amostras agrupam séries conservadoramente; só etiquetas lexicais seguras são normalizadas, sem converter valores. Exclusões e contagens são visíveis, e originais continuam intactos. Sem deduplicação por data: duas medições legítimas no mesmo dia mantêm IDs distintos.
Campos desconhecidos/pendentes não são inventados. Datas documentais sem hora mantêm datePrecision=day (instante técnico ao meio-dia UTC para ordenação, nunca apresentado como hora clínica).
## Extração documental v0.4 — implementada
POST /demo/extract aceita PDF/PNG/JPEG sintético (2 MB, 3 páginas, 12 MP por imagem, 30 000 caracteres totais). Subprocesso sem ficheiros temporários, limite global 285 s, uma extração por vez; cliente 300 s. Cada página usa PyMuPDF e o parser conhecido primeiro, ou Ollama por texto/visão quando necessário. Página com texto acima de 12 000 caracteres segue para introdução manual. Imagens são renderizadas com aresta máxima de 1280 px. O parser antigo continua com os seus limites próprios.
local_ollama.py usa REST httpx local com esquema Pydantic, sem ferramentas, proxies ou redirecionamentos; 90 s por chamada, resposta até 512 KB, contexto 8192, geração 4096 tokens. hybrid.py valida associações texto/valor/unidade e datas; JSON válido não basta. Visão não tem OCR independente e mantém sinalização para conferência humana.
GET /demo/extraction/status verifica disponibilidade/modelo sem aceder a dados. O frontend não escolhe servidor/modelo e nunca contacta Ollama diretamente. Apenas confirmação explícita chama a persistência existente; originais PDF/PNG/JPEG, evidência extraída e valores confirmados permanecem na mesma SQLite por perfil.
DocumentImport reutiliza a revisão e permite associação de parâmetro, correção de valor/unidade/data/origem/página, exclusão e introdução manual. Campos e erros ficam disponíveis após falhas recuperáveis; rascunhos não sobrevivem ao fecho/recarregamento. Histórico e gráficos usam o mesmo repositório; todos os parâmetros do catálogo partilhado têm seletor. Dados sem método/amostra/data permanecem no histórico com motivo de exclusão.
GET /demo/profiles/{owner}/preview/{result_id} verifica âmbito e recalcula uma região textual única no PDF guardado, devolvendo PNG sem cache. Não usa coordenadas do modelo nem altera o original.
Sem autenticação de produção: X-Pulso-Profile é só âmbito demonstrativo. Configuração, evidência, limites e fontes em LOCAL_EXTRACTION.md.
## Limites e evolução
Hub.tsx reutiliza os componentes visuais e as rotas de App; hubData.ts calcula apenas contagens/cronologia por perfil. learning/content.ts é um catálogo educativo estático, sem dependência dos valores clínicos. LearningProvider/InfoButton/MedicalTerm são partilhados por resultados, gráficos e formulários; LearnScreen oferece pesquisa/categorias/fichas. Conteúdo e referências não são guardados como medições nem interpretam o estado clínico. Sem novo backend/DB/dependência. Detalhes em UX_LEARN.md.
Sem PostgreSQL/SQLAlchemy/Alembic, contas auditadas para produção, auditoria completa de acessos, gestão de chaves de encriptação, serviço automatizado de backups ou sincronização. Escritas da API são transacionais; não há sincronização externa.
Registos confirmados podem ser corrigidos ou eliminados no Histórico, com validação no backend; revisões da extração original ficam preservadas. Cancelar uma revisão não guarda resultados. Rascunhos não persistem entre reinícios.
Instituições, objetivos clínicos, OCR independente e interpretação clínica continuam fora do âmbito.
Documentos originais, acesso por recurso, encriptação e migrações de servidor terão de ser implementados antes de dados reais. Ver SECURITY.md.

## Correção PDF Windows
Parser executado por subprocess.run numa thread (asyncio.to_thread), compatível com event loop Selector usado por reload no Windows. Timeout e isolamento de processo preservados. Exemplo estático também em apps/mobile/public; download não requer API. Script scripts/start.ps1 inicia API e frontend. Estados de envio/espera extração derivam de eventos XMLHttpRequest; conclusão é apenas após resposta de gravação da API.

## Educação e preferências v0.5
Preferências v0.5: `preferences.web.ts` persiste apenas tema em localStorage; resolução por plataforma mantém `preferences.ts` nativo com aviso de sessão, sem nova dependência. Dados clínicos continuam exclusivamente no repositório/API existente. Catálogo educativo tipado separa estado editorial, revisão clínica e evidência profissional; `LearningProvider` continua único. A lista textual do gráfico e os motivos de exclusão derivam das mesmas medições/regras do desenho, sem fonte paralela.

## Arranque independente
package.json raiz encaminha npm run dev para scripts/dev.mjs. dev.cmd encontra Node instalado sem PATH do Codex; scripts/start.ps1 delega no mesmo launcher. Portas ocupadas são recusadas, sem reutilizar APIs antigas. Logs visíveis, --reload no backend e Metro normal. Ctrl+C termina apenas os processos filhos iniciados pelo launcher. Ver GUIA_WINDOWS.md para LAN e limites do QR.


## v0.7 — experiência, gráficos e acontecimentos
Preferências de experiência residem no JSON da própria conta (mesma tabela/SQLite), separadas de credenciais e autorização. `/auth/preferences` exige sessão, Origin, CSRF e If-Match; edição do perfil preserva as preferências. Defaults aditivos para contas anteriores, sem atribuição de modo pela idade. ThemeProvider partilhado aplica tokens, escala, contraste e movimento; modo/tema persistem por conta, tema anónimo usa a chave local anterior. Onboarding de sete passos persiste progresso/conclusão e reutiliza controlos de preferências/condições. Hub único, sem gestão de estado ou páginas paralelas.
Gráficos combinados são painéis TimelineChart com domínio temporal comum, escalas e unidades independentes; buildSeries mantém métodos/amostras separados. Períodos relativos/calendário e personalizado UTC não alteram dados. Desenho denso preserva extremos por bloco, com todos os pontos na lista paginada de 50.
`events.py` valida acontecimentos no snapshot do perfil, `events` opcional para snapshots antigos. CRUD utiliza scope, admissão de escrita, transação e versões existentes. Histórico de edição guardado; associação documental é por ID do mesmo dono. Eliminar documento atualiza referências e versões dos acontecimentos atomicamente, sem apagar o acontecimento; apagar acontecimento preserva documentos/resultados. Estados autodeclarado/documentado, nunca validação profissional por escolha do utilizador. Marcadores por dia UTC e faixas de duração têm detalhe e alternativa textual. DocumentView foi extraído e reutilizado, sem duplicar originais.

## Auditoria multiplataforma v0.7 — alcance e pendências

| Área | Web Windows | Android/iOS |
|---|---|---|
| React Native, navegação, gráficos e modais | Fluxos automatizados em Chromium | Pacotes JS exportáveis; sem ensaio de execução físico/emulador |
| Documentos/fotografia | Seletores web funcionais | Fallback explícito; seletores nativos/câmara não implementados |
| Sessões | Cookie, CSRF, mesmo hostname e login/recarga testados | Cookie jar, armazenamento seguro, origens e transporte por validar em build nativa |
| Preferências | Conta na SQLite; tema anónimo local | Conta preparada via API; preferência anónima apenas sessão; tamanhos/sistema por testar fisicamente |
| Rede/extração | API/Ollama em loopback do computador | `127.0.0.1` refere-se ao próprio telemóvel; não equivale ao computador, nem disponibiliza Ollama ao utente |
| Builds/lojas | Exportação web local | Sem perfis EAS, identificadores de produção, assinatura ou publicação; exportação JS não é APK/IPA |

Nenhuma API foi exposta à Internet, nenhuma cloud ou ferramenta móvel nova instalada. Instalar/publicar EAS e testar câmera/ficheiros/VoiceOver/TalkBack exigem fase própria. `userInterfaceStyle=automatic` prepara o tema nativo; não constitui ensaio nativo.

## Arquitetura-alvo de sincronização — especificação, não implementação
Uma conta deverá usar um backend central autenticado em HTTPS para Personal web/Android/iOS; base de produção e armazenamento de originais serão escolhidos após requisitos, medição e revisão de segurança. A SQLite local e o Ollama deste computador não são o serviço central definitivo. Importar no móvel deverá guardar documento e propostas no backend; só confirmação humana cria resultados. Web lê a mesma fonte, com autorização por recurso. Correções mantêm versões/proveniência, conflitos exigem reconciliação explícita; exclusões usam tombstones/cursor para retirar cópias autorizadas. Identidade, dono, IDs, unidades e confirmação permanecem consistentes. Não existe atualmente sincronização offline/cloud/cursor, nem cache clínica móvel; qualquer futura cache exige minimização, proteção em repouso, expiração e limpeza por conta. Não enviar dados reais ou publicar portas para demonstrar esta especificação.

## Papéis futuros — especificação, não portais implementados

| Papel | Âmbito a autorizar no backend |
|---|---|
| Utente / Personal | Recursos próprios, registos e revogação de delegações futuras |
| Médico / Clinical | Pacientes explicitamente autorizados, finalidade/tempo definidos e credencial profissional verificada |
| Enfermeiro/técnico / Partner | Operações específicas por competência, recurso e instituição verificados; mínimo necessário |
| Cuidador / Care | Conta própria; recursos expressamente delegados, prazo e revogação |
| Administrador | Operação autorizada; sem acesso indiscriminado ao conteúdo médico |

Negar por defeito; não atribuir papel profissional por opção no perfil. Prever identidade/credenciais verificadas, concessão por recurso/finalidade, auditoria de acessos sem conteúdo clínico, revogação no servidor e invalidação de cópias quando aplicável. Modo Simples/Equilibrado/Detalhado nunca modifica concessões. Não há portais, delegação ou partilha clínica de produção nesta versão.


## Entrada e navegação na simplificação v0.7.1
SessionGate aguarda AuthProvider e separa PublicEntry da Shell privada. A verificação do contexto demonstrativo é feita pelo servidor, sem confiar na compilação do cliente; testes usam a mesma interface com backend explicitamente isolado. Rotas hash permitidas em routes.ts retomam apenas destinos internos conhecidos. No modo normal não há seletor/reset de perfis demo. AuthProvider revoga/limpa sessão e ignora respostas antigas; ApiRepository continua único, sem cache clínica persistente no navegador.
Novas contas recebem snapshot vazio diretamente em store.seed, sem ler fixtures. FixtureRepository foi movido para auxiliar de testes; dados sintéticos de ensaio não integram o modelo clínico carregado pela aplicação. Não foram removidos dados da base normal nem criadas migrações de limpeza.
Callback SavedRecord identifica documento, sessão de tensão ou acontecimento após confirmação do backend. Histórico abre o detalhe correspondente; edição atualiza-o preservando filtros e conflitos, eliminação regressa à lista. Evolução documental é uma ação no detalhe, mantendo ClinicalPanel/TimelineChart existentes. Modos partilham componentes/dados; filtros, métodos, períodos e catálogo completo usam divulgação progressiva. Perfil e onboarding reutilizam os mesmos controlos; há conclusão rápida após escolher modo.


## v0.7.3 — aquisição de uma página e ensaios isolados
RegisterHub mantém as categorias mas coloca Digitalizar/Importar/Medir no primeiro passo. CameraCapture.web usa getUserMedia apenas por ação explícita, canvas JPEG sem EXIF, preview e conferência pelo utilizador; alternative File volta ao mesmo fluxo. CameraCapture nativo usa expo-image-picker ~57.0.21 (SDK instalado), JPEG/base64 e conferência explícita. InputDocument é o adaptador estrutural de File/JPEG nativo; documentDigest.web usa Web Crypto e o adaptador nativo expo-crypto ~57.0.4. DocumentImport continua único, com initialDocument, classificação, validação/hash, fila e confirmação já existentes. O SDK fornece JPEG; a remoção posterior de metadados não recomprime os píxeis. capture guarda origem/página e, no nativo, hash do JPEG antes da remoção; original contém exatamente os bytes usados na extração/guarda. Não é preservação de RAW de sensor.
Sem múltiplas fotografias, crop/rotação/correções automáticas. Capture.pages=1; o mesmo backend mantém 2 MB/12 MP/3 páginas PDF e validação de assinatura. Falta ensaio nativo de sessão/Origin/cookies, transporte para a API local e seletores/retenção de cache em dispositivos; exportações JS não resolvem isso. A sincronização futura mantém a especificação anterior: mesma conta, API central segura, autorização por recurso e originais protegidos; não existe sincronização cloud/produção nem publicação móvel nesta entrega. Não expor localhost para experimentar.
profile_reliability.py usa apenas API loopback própria e SQLite nova em tmp; fixtures internas de contas/sessões são explicitamente distinguidas de 10 logins HTTP. Todas as leituras/escritas HTTP usam as guardas normais. document_reliability.py avalia o mesmo hybrid em subprocessos limitados, com expected anterior à inferência e artefactos em tmp, sem guardar resultados clínicos. Detalhes/limites em LOAD_TEST.md e VALIDATION.md.

Referências técnicas consultadas para aquisição: [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) e [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia); versões efetivas confirmadas no bundledNativeModules.json do SDK instalado.


## v0.7.4 em curso — memória e rotas de Registar
A Shell conserva uma única instância de RegisterHub após abertura, escondida noutros separadores, sempre dentro da identidade autenticada. Logout/troca de dono desmonta-a; uma gravação confirmada limpa o rascunho. Sem persistência automática, localStorage ou novo backend. Rotas /record/categories, /record/types/{categoria}, /record/form/{categoria}/{tipo} e /record/camera são validadas pelo catálogo; não contêm dados do documento. O componente acompanha hashchange e mantém o rascunho ao voltar; uma mudança para outro formulário com alterações exige descarte. beforeunload sinaliza risco real de perda. Câmara oculta conserva preview mas fecha streams. Fluxos de detalhes/edições fora de Registar e ensaios nativos permanecem pendentes em PROJECT_STATUS.md.
