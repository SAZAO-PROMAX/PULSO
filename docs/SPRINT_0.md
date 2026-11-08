# Sprint 0 — implementação experimental entregue
## Pedido para copiar para o Codex
Lê AGENTS.md e os documentos em docs. Implementa a Sprint 0 do PULSO com dados exclusivamente fictícios.
Confirma primeiro as versões compatíveis nas documentações oficiais. Usa React Native/Expo/TypeScript estrito e Python/FastAPI/Pydantic, num backend modular.
Cria um scaffold mínimo em apps/mobile, com scripts typecheck e test e lockfile. Cria requirements-dev.txt com versões controladas e API em services/api/app/main.py, com endpoint /health sem dados clínicos.
Implementa navegação base Início, Histórico, Registar, Aprender e Perfil; o painel “A minha saúde” deve permitir aceder às cinco áreas, com estados vazios e indicação visível de demonstração.
Usa apenas os dois perfis sintéticos fornecidos. Não adicionar login de produção, uploads reais, OCR, base de dados remota, recomendações ou alvos clínicos. Trocar de perfil não pode mostrar dados do anterior.
Mantém medicação e consultas como demonstração de interface. Não considerar a Sprint 1 concluída.
Inclui testes relevantes para /health, navegação e isolamento dos perfis. Executa os testes e typecheck disponíveis; regista falhas, não executados e limitações de plataforma em docs/VALIDATION.md.
Usa Windows/PowerShell como ambiente principal. Atualiza GUIA_WINDOWS.md com comandos reais e reproduzíveis. No final, mostra o que foi implementado, o que falta e como eu próprio posso verificar no Windows. Não publiques o projeto.

## Aceitação prevista
- Instalação limpa documentada com versões e lockfiles.
- API /health responde sem informação pessoal.
- Aplicação inicia e permite navegar nos cinco separadores e cinco áreas.
- Dados e indicação de demonstração visíveis; dois perfis isolados.
- Sem diagnóstico, score de saúde ou classificação automática de segurança.
- Testes e typecheck executados, com resultado explícito.
- Verificação manual de texto ampliado, labels e contraste registada; teste Android separado da web.
- Nenhum requisito AC-01 a AC-18 é dado como cumprido sem evidência própria.

## Fora desta sprint
Importação/OCR, confirmação de extrações, gráficos clínicos, exportações completas, PostgreSQL, produção, integrações institucionais e dados reais.


## Estado
Código e verificação web entregues. Ver VALIDATION.md para resultados, limites e verificações manuais pendentes. A Sprint 1 não está concluída.
