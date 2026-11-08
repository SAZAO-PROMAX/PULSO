# PULSO — instruções de trabalho
Ao retomar, ler docs/PROJECT_STATUS.md, quando existir, como resumo de continuidade; confirmar o estado real do Git e consultar os relatórios ligados, sem tratar planos como funcionalidades implementadas.
Ler docs/PRD_v0.2.md, docs/ARCHITECTURE.md, docs/SECURITY.md e docs/DECISIONS.md antes de alterar o projeto.
Apenas dados sintéticos. Não usar serviços externos de interpretação de exames, dados reais, diagnósticos ou recomendações terapêuticas.
Âmbito v0.4 autorizado em 08/11/2026: extração híbrida com Ollama local qwen3-vl:4b, apenas no backend e loopback, sem ferramentas/acesso à base pelo modelo. Esta decisão substitui a proibição de LLMs na extração do PRD v0.2; mantém revisão humana obrigatória e validação independente. Preservar o parser determinístico e o funcionamento sem Ollama.
Implementar incrementalmente a Sprint 0 em docs/SPRINT_0.md. Não assumir que pastas com README são aplicações.
Distinguir requisitos, implementações e testes efetivamente executados. Registar comandos, resultados e limitações.
Preservar proveniência, unidades e estados de confirmação. Testar isolamento de perfis e regras de comparabilidade quando forem implementados.
Não publicar nem adicionar segredos. Manter documentação e comandos reproduzíveis atualizados.

## Publicação de novas versões — autorização permanente do utilizador, 08/11/2026
Ao concluir uma nova versão da aplicação, criar um commit e fazer push para o repositório oficial https://github.com/SAZAO-PROMAX/PULSO.git, sem pedir novamente autorização. Esta autorização mantém-se até o utilizador a alterar; respeitar qualquer instrução específica de não publicar numa tarefa.
Antes do commit/push, executar as verificações adequadas e rever os ficheiros incluídos e o .gitignore: nunca publicar segredos, .env, bases locais, uploads, documentos reais, modelos ou artefactos temporários. Incluir apenas alterações pertinentes e não descartar trabalho existente.
Verificar branch, origin e diferenças remotas antes de integrar. Nunca usar push --force sem autorização explícita. Se houver autenticação em falta, pedir que o utilizador a conclua pelo método oficial; se existir um conflito que não possa ser resolvido com segurança dentro do âmbito, explicar o bloqueio. Não declarar publicação concluída sem verificar o push. No final de cada versão, indicar branch, commit e resultado do push.

## Continuidade após cada sprint
Atualizar docs/PROJECT_STATUS.md de forma concisa e incluí-lo no commit de entrega quando apropriado. Registar versão local/publicada, funcionalidades reais/demonstrativas, arquitetura, problemas priorizados, últimos testes efetivamente executados, limites de segurança/validação clínica, próximos três objetivos, data e commit Git de referência. Identificar alterações ainda sem commit e não inventar o hash de um commit futuro. Ligar os relatórios existentes em vez de os duplicar. Nunca guardar dados pessoais, segredos ou conteúdo clínico nesta ficha.
