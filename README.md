# PULSO v0.2 — aplicação experimental
React Native/Expo com pré-visualização web no Windows. Apenas dados inteiramente fictícios.

## Começar
Na raiz, executar .\dev.cmd ou npm.cmd run dev. Seguir o [Guia Windows](docs/GUIA_WINDOWS.md). A interface abre normalmente em localhost:8081; a API de extração em 127.0.0.1:8000.
No dashboard, usar Adicionar exame ou Adicionar medição. Nas áreas, selecionar parâmetro/período e consultar pontos, origem e documento.

## Funcional
- Dashboard e cinco áreas, navegação existente preservada, estilos comuns e modo claro/escuro.
- Histórico, resumo e gráficos usam o mesmo repositório local; as duas medições antigas foram migradas explicitamente como registos manuais.
- Gráficos laboratoriais, sistólica/diastólica independentes e SpO₂, sem diagnósticos.
- Registo manual de tensão, revisão e persistência por perfil.
- PDF sintético de layout único → extração determinística local → revisão/correção/exclusão → confirmação → histórico/gráfico e original preservado.
- Persistência real SQLite pela API em .local/pulso.sqlite3, com migração da cópia antiga do navegador, originais preservados, edição e eliminação transacionais.

## Limites
Sem autenticação de produção, SQL, sincronização, OCR, IA clínica, alertas ou integrações reais. Medicação/consultas e biblioteca clínica são áreas em preparação, com estados vazios. Android/iOS não verificados; seletor PDF nativo não implementado.
Dados locais não são encriptados nem adequados para dados reais. A API verifica âmbito por perfil demonstrativo, sem autenticação de produção.
A preferência de tema não persiste após recarregar. Edição de medição/exame e eliminação já funcionam no Histórico. Múltiplas leituras na mesma sessão continuam futuras.
A única dependência nova deste incremento é PyMuPDF no backend. O frontend mantém as dependências existentes.

## Documentação
[PRD](docs/PRD_v0.2.md), [Arquitetura](docs/ARCHITECTURE.md), [Segurança](docs/SECURITY.md), [Decisões](docs/DECISIONS.md), [Validação](docs/VALIDATION.md).
SPRINT_0.md, SPRINT_1.md e REVIEW_2026-11-07.md registam estados históricos; para o estado atual usar este README e o Guia Windows.
O PRD recuperado contém secções 1–15; o final da secção 16 estava truncado e não foi inventado.
