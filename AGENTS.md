# PULSO — instruções de trabalho
Ler docs/PRD_v0.2.md, docs/ARCHITECTURE.md, docs/SECURITY.md e docs/DECISIONS.md antes de alterar o projeto.
Apenas dados sintéticos. Não usar serviços externos de interpretação de exames, dados reais, diagnósticos ou recomendações terapêuticas.
Âmbito v0.4 autorizado em 08/11/2026: extração híbrida com Ollama local qwen3-vl:4b, apenas no backend e loopback, sem ferramentas/acesso à base pelo modelo. Esta decisão substitui a proibição de LLMs na extração do PRD v0.2; mantém revisão humana obrigatória e validação independente. Preservar o parser determinístico e o funcionamento sem Ollama.
Implementar incrementalmente a Sprint 0 em docs/SPRINT_0.md. Não assumir que pastas com README são aplicações.
Distinguir requisitos, implementações e testes efetivamente executados. Registar comandos, resultados e limitações.
Preservar proveniência, unidades e estados de confirmação. Testar isolamento de perfis e regras de comparabilidade quando forem implementados.
Não publicar nem adicionar segredos. Manter documentação e comandos reproduzíveis atualizados.
