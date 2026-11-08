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
## PDF — fluxo real e limitado
GET /demo/sample.pdf fornece o único PDF de exemplo.
POST /demo/extract recebe bytes application/pdf com cabeçalho X-Pulso-Demo: synthetic-only. Limite streaming 512 KB; subprocesso isolado do parser com prazo de 8 segundos; cliente cancela aos 12 segundos.
PyMuPDF extrai texto selecionável de até 3 páginas, rejeitando cifrados/corrompidos/layout desconhecido. Parser só aceita PULSO SYNTHETIC LAB V1, metadados inequívocos e linhas delimitadas de cinco parâmetros. Não há OCR/LLM/serviço externo.
Devolve candidatos, problemas, página/linha, texto, data, laboratório, hash SHA-256 e versão do parser. Ainda não são resultados guardados.
A UI permite corrigir valor/unidade/método/amostra, excluir linhas e marcar cada linha como revista. A confirmação final preserva evidência extraída e grava apenas as linhas selecionadas com estado confirmado pelo utilizador.
Snapshot SQLite inclui original PDF base64. Abertura usa URL Blob temporária; não há URLs públicas ou partilha.
API com persistência SQLite, limitada a loopback no arranque normal; CORS só para origens locais explícitas. /health e /docs mantidos.
Sem autenticação ou autorização real: perfis são demonstrativos. O parser isolado tem prazo e limites de entrada/saída, mas não constitui isolamento de produção para ficheiros hostis.

## Limites e evolução
Sem PostgreSQL/SQLAlchemy/Alembic, contas de produção, auditoria de acessos, gestão de chaves, backups ou sincronização. Escritas da API são transacionais; não há sincronização externa.
Registos confirmados podem ser corrigidos ou eliminados no Histórico, com validação no backend; revisões da extração original ficam preservadas. Cancelar uma revisão não guarda resultados. Rascunhos não persistem entre reinícios.
Instituições, objetivos clínicos, OCR e interpretação são futuros e não foram implementados.
Documentos originais, acesso por recurso, encriptação e migrações de servidor terão de ser implementados antes de dados reais. Ver SECURITY.md.

## Correção PDF Windows
Parser executado por subprocess.run numa thread (asyncio.to_thread), compatível com event loop Selector usado por reload no Windows. Timeout e isolamento de processo preservados. Exemplo estático também em apps/mobile/public; download não requer API. Script scripts/start.ps1 inicia API e frontend. Estados de envio/espera extração derivam de eventos XMLHttpRequest; conclusão é apenas após resposta de gravação da API.

## Arranque independente
package.json raiz encaminha npm run dev para scripts/dev.mjs. dev.cmd encontra Node instalado sem PATH do Codex; scripts/start.ps1 delega no mesmo launcher. Portas ocupadas são recusadas, sem reutilizar APIs antigas. Logs visíveis, --reload no backend e Metro normal. Ctrl+C termina apenas os processos filhos iniciados pelo launcher. Ver GUIA_WINDOWS.md para LAN e limites do QR.
