# Arquitetura atual — PULSO v0.2
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
Sem PostgreSQL/SQLAlchemy/Alembic, contas de produção, auditoria de acessos, gestão de chaves, backups ou sincronização. Escritas da API são transacionais; não há sincronização externa.
Registos confirmados podem ser corrigidos ou eliminados no Histórico, com validação no backend; revisões da extração original ficam preservadas. Cancelar uma revisão não guarda resultados. Rascunhos não persistem entre reinícios.
Instituições, objetivos clínicos, OCR independente e interpretação clínica continuam fora do âmbito.
Documentos originais, acesso por recurso, encriptação e migrações de servidor terão de ser implementados antes de dados reais. Ver SECURITY.md.

## Correção PDF Windows
Parser executado por subprocess.run numa thread (asyncio.to_thread), compatível com event loop Selector usado por reload no Windows. Timeout e isolamento de processo preservados. Exemplo estático também em apps/mobile/public; download não requer API. Script scripts/start.ps1 inicia API e frontend. Estados de envio/espera extração derivam de eventos XMLHttpRequest; conclusão é apenas após resposta de gravação da API.

## Educação e preferências v0.5
Preferências v0.5: `preferences.web.ts` persiste apenas tema em localStorage; resolução por plataforma mantém `preferences.ts` nativo com aviso de sessão, sem nova dependência. Dados clínicos continuam exclusivamente no repositório/API existente. Catálogo educativo tipado separa estado editorial, revisão clínica e evidência profissional; `LearningProvider` continua único. A lista textual do gráfico e os motivos de exclusão derivam das mesmas medições/regras do desenho, sem fonte paralela.

## Arranque independente
package.json raiz encaminha npm run dev para scripts/dev.mjs. dev.cmd encontra Node instalado sem PATH do Codex; scripts/start.ps1 delega no mesmo launcher. Portas ocupadas são recusadas, sem reutilizar APIs antigas. Logs visíveis, --reload no backend e Metro normal. Ctrl+C termina apenas os processos filhos iniciados pelo launcher. Ver GUIA_WINDOWS.md para LAN e limites do QR.
