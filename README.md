# PULSO v0.7.2 — aplicação experimental
React Native/Expo com pré-visualização web no Windows. Apenas dados inteiramente fictícios.

## Começar
Na raiz, executar .\dev.cmd ou npm.cmd run dev. Seguir o [Guia Windows](docs/GUIA_WINDOWS.md). A interface abre normalmente em localhost:8081; a API de extração em 127.0.0.1:8000.
Sem sessão, a entrada é pública; iniciar sessão é obrigatório para o ambiente pessoal. No Hub, usar Adicionar exame ou Adicionar medição. Guardar abre o detalhe; a evolução tem acesso no próprio exame.

## Funcional
- Página pública, verificação neutra de sessão, ambiente pessoal protegido e contas novas vazias. Logout desmonta os dados privados.
- Hub com ações principais, filtros compactos no Histórico e biblioteca Aprender editorial. Navegação superior no desktop e inferior no telemóvel. Perfil por grupos, largura limitada e data DD/MM/AAAA; nascimento obrigatório, guardado em ISO.
- Experiência Simples/Equilibrado/Detalhado, preferências de acessibilidade/tema por conta e onboarding opcional retomável; as cinco áreas continuam no seletor de evolução, sem alterar permissões.
- Gráficos individuais ou painéis combinados com tempo alinhado e escalas independentes; nove períodos incluindo personalizado e lista acessível paginada.
- Acontecimentos fictícios com revisão, documentos associados, histórico de edição, versões e marcadores/duração nos gráficos; sem causalidade automática.
- Contas individuais experimentais: registo/login/logout, sessão no servidor, nascimento obrigatório e restantes campos opcionais, avatar/fotografia privada e demonstrações exclusivas de testes isolados. Recuperação/verificação por código local de desenvolvimento; nenhum e-mail real é enviado.
- Registar com oito categorias e tipos; documentos não laboratoriais são guardados sem extração. Histórico com pesquisa, categoria/tipo/especialidade/período e classificação editável sem duplicar originais.
- IDs de tensão idempotentes só com conteúdo equivalente; edições/eliminações com versão esperada e conflito explícito, mantendo os campos no formulário.
- Importação com fila limitada em memória, estados reais, cancelamento em espera e uma extração de cada vez.
- Dashboard e cinco áreas, navegação existente preservada, estilos comuns e modo claro/escuro.
- Hub com resumos por perfil, ações rápidas, evolução recente e Aprender hoje. Biblioteca educativa local com pesquisa, seis categorias e 23 fichas; ícones informativos em parâmetros/resultados/formulários, sem interpretação individual dos valores.
- Histórico, resumo e gráficos usam o mesmo repositório local; as duas medições antigas foram migradas explicitamente como registos manuais.
- Gráficos laboratoriais, sistólica/diastólica independentes e SpO₂, sem diagnósticos.
- Registo manual de tensão, revisão e persistência por perfil.
- PDF, PNG ou JPEG sintético → parser determinístico quando possível → Ollama local para texto/layout ou visão quando necessário → revisão/correção/exclusão → confirmação → SQLite, histórico e gráficos.
- Catálogo partilhado de 15 parâmetros; evidência por página, métodos/modelo/versão, campos ausentes explícitos, originais preservados e destaque de regiões textuais inequívocas.
- Persistência real SQLite pela API em .local/pulso.sqlite3, com migração da cópia antiga do navegador, originais preservados, edição e eliminação transacionais.

## Limites
Contas com autenticação experimental local não equivalem a segurança auditada de produção. SQLite não tem encriptação apropriada para dados reais; HTTP apenas em loopback, sem serviço de e-mail real. Não usar identidade, fotografia ou documentos reais. O prefixo histórico /demo exige autenticação normal; bypass demonstrativo só em modo explícito com base dentro de tmp, nunca na base normal.
Sem sincronização, IA clínica, alertas ou integrações reais. A leitura visual usa Qwen3-VL local e exige conferência humana; não há OCR independente para validar imagens. Documentos de prescrição/consulta já podem ser guardados; calendário e gestão estruturada de medicação continuam em preparação. As 23 fichas aguardam revisão clínica independente. Android/iOS e leitores de ecrã reais não verificados; seletor documental nativo não implementado. Fila perde pedidos pendentes ao reiniciar; não suporta coordenação entre vários processos.
As preferências da conta persistem no serviço local; apenas o tema anónimo persiste neste navegador, sem dados clínicos. Na versão nativa anónima o tema é temporário; integração da sessão nativa e seletores ainda por validar. Edição de medição/exame e eliminação já funcionam no Histórico. Múltiplas leituras na mesma sessão continuam futuras.
Este incremento reutiliza PyMuPDF, httpx e Pydantic já instalados; não acrescenta dependências. Ollama e qwen3-vl:4b são serviços/modelos locais separados. Limites: 2 MB, 3 páginas, 12 MP por imagem, uma extração de cada vez. Sem Ollama, continuam disponíveis o parser conhecido, a introdução manual e os registos existentes.

## Documentação
[Estado atual e continuidade entre ferramentas](docs/PROJECT_STATUS.md): versão local, referência Git, prioridades e últimas verificações confirmadas.
[PRD](docs/PRD_v0.2.md), [Arquitetura](docs/ARCHITECTURE.md), [Segurança](docs/SECURITY.md), [Decisões](docs/DECISIONS.md), [Validação](docs/VALIDATION.md).
[Integração local v0.4, medições e limitações](docs/LOCAL_EXTRACTION.md).
[Hub e Aprender](docs/UX_LEARN.md): conteúdo implementado, fontes, funcionamento e limitações.
[Protocolo de usabilidade](docs/USABILITY_PROTOCOL.md): tarefas e grelha em branco, ensaios humanos e leitores de ecrã ainda por executar.
SPRINT_0.md, SPRINT_1.md e REVIEW_2026-11-07.md registam estados históricos; para o estado atual usar este README e o Guia Windows.
O PRD recuperado contém secções 1–15; o final da secção 16 estava truncado e não foi inventado.
