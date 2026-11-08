# Arquitetura atual — PULSO v0.6
Frontend Expo 57 / React Native 0.86.3 / React 19.2.3 / TypeScript estrito, com react-native-web. Backend Python/FastAPI/Pydantic e PyMuPDF. Stack mantida.

## Interface
App.tsx mantém a shell, navegação e dashboard. src/ui.tsx reúne cores, tema e componentes comuns (texto, cartão, botão, campo).
ClinicalPanel seleciona parâmetro e período; TimelineChart mantém a geometria nativa dos gráficos. RecordViews partilha detalhe/original entre histórico e gráfico. Forms gere os fluxos de tensão e revisão de PDF. O seletor de ficheiros tem implementação web e mensagem explícita na versão nativa.
App carrega dados por perfil, cancela apresentação de respostas tardias e atualiza o repositório visual após gravação. O foco web regressa ao título após navegação. A fonte legacy observationsFor foi removida; os dados antigos são migrados para o repositório comum.

## Dados e persistência — estabilização
ApiRepository é a única fonte ativa do frontend. SQLite da biblioteca Python padrão, num único ficheiro .local/pulso.sqlite3, guarda snapshots JSON versionados por perfil. Não há dependência SQL adicional ou PostgreSQL operacional.
GET /demo/profiles/{owner}/data lê a base. POST confirm/pressure gravam com confirmação do backend; PATCH e DELETE gerem registos e documentos. BEGIN IMMEDIATE, validação integral e commit/rollback protegem consistência e concorrência. A eliminação de exame remove os resultados associados na mesma transação; uma medição pode ser removida sem apagar o original.
A migração localStorage é só leitura e remoção após confirmação da API, uma vez por perfil. Se a base já tiver alterações, uma migração conflitante é recusada sem sobrescrever dados. A base nunca é reposta por estar vazia: apenas a ação explícita de reset reinstala as fixtures. Originais, hash, evidência e versões anteriores das correções são preservados; PDFs permanecem na base.
O backend verifica o perfil do pedido e os proprietários dos recursos. O cabeçalho X-Pulso-Profile é um âmbito demonstrativo, não autenticação. Não existem contas reais.

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
