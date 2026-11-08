# Sprint 1 — resultados sintéticos e gráficos
Implementado sobre a aplicação Expo/React Native existente. Âmbito definido pelo pedido de 07/11/2026: esta sprint antecipa resultados/gráficos previstos para fases posteriores no PRD. O onboarding completo não foi implementado nem dado como concluído.

## Análise antes das alterações
Lidos AGENTS.md, PRD v0.2, arquitetura, segurança e decisões. Inspecionados App.tsx, modelo de navegação, dependências e testes.
Stack mantida: Expo 57, React Native 0.86.3, React 19.2.3, TypeScript estrito; pré-visualização web com react-native-web. Não é uma aplicação React DOM independente.
Reutilizados: painel A minha saúde, cinco entradas de navegação, cartões, cores, perfis, botões e estrutura responsiva. Sem alterações nas dependências.
FastAPI permanece com /health; não havia banco operacional. Foi adotada a alternativa de fixtures solicitada.

## Dados e integração futura
data/synthetic/clinical.json: schemaVersion 1; 3 documentos e 25 resultados inteiramente fictícios (incluindo um pendente e um sem valor).
MedicalDocument contém proprietário, laboratório de origem, datas de emissão/importação e conteúdo original TXT fictício com nome e tipo.
Result contém parâmetro, valor anulável, unidade original, data com fuso, método, contexto/amostra, referência textual original, estado de confirmação e documentId.
O adaptador assíncrono ClinicalRepository.load(ownerId) devolve documentos/resultados do perfil. FixtureRepository valida os vínculos e devolve uma cópia. Um futuro adaptador HTTP poderá implementar o mesmo contrato, com validação e autorização no servidor.
Não há SQL, migrações, persistência ou novos endpoints clínicos. O conteúdo original está embebido na fixture, não num serviço de armazenamento. Consultar original abre esse TXT fictício dentro do cartão.

## Comparabilidade
Agrupamento conservador pela combinação exata de parâmetro, unidade, método e contexto. Sem conversões ou equivalência de métodos inferida. Ordenação por instante UTC; apresentação de datas em Europe/Lisbon.
Resultados pendentes, sem valor/data/unidade/método/contexto utilizáveis ficam fora dos gráficos, com contagem visível. Nada é imputado ou corrigido no original.
Referências pertencem a cada resultado/documento, não são usadas para classificar segurança ou colorir o gráfico.
Séries diferentes ficam em cartões separados. Pontos com datas coincidentes conservam identidade, mesmo sobrepostos; a lista abaixo permite selecionar cada resultado.
Eixos usam amplitude observada e datas proporcionais. Linhas ligam apenas pontos existentes; não representam valores intermédios.

## Onde abrir
Executar o arranque do GUIA_WINDOWS.md. No perfil A:
- Início → Análises ao sangue: Glicose, LDL, Creatinina, Hemoglobina e Hemoglobina glicada.
- Início → Tensão arterial: sistólica, diastólica e frequência cardíaca.
- Início → Saúde respiratória: SpO₂ e frequência cardíaca.
Selecionar um ponto ou uma linha da lista para ver data, valor/unidade, origem, referência, confirmação e documento original.
Trocar para perfil B para verificar os estados vazios. Carregamento assíncrono e erro com botão Tentar novamente foram implementados. Não existem botões de falha simulada na interface.

## Ficheiros
Criados:
- data/synthetic/clinical.json
- apps/mobile/src/clinical/data.ts
- apps/mobile/src/clinical/TimelineChart.tsx
- apps/mobile/src/clinical/ClinicalPanel.tsx
- apps/mobile/tests/clinical.test.ts
- apps/mobile/e2e/clinical.spec.ts
- docs/SPRINT_1.md e capturas sprint1-390.png / sprint1-1100.png

Alterados: App.tsx (integração sem substituir o painel), README.md, GUIA_WINDOWS.md, ARCHITECTURE.md, DECISIONS.md e VALIDATION.md. A captura da Sprint 0 foi atualizada pelo teste existente.
package.json/package-lock.json, backend e fixtures do histórico inicial não foram alterados. ZIP de fontes atualizado.

## Verificação e limites
11 testes TypeScript/lógica, 4 testes Chromium, 2 testes da fundação e 3 da API aprovados; typecheck e exportação web aprovados.
Ver VALIDATION.md para comandos e limites. Não executados Android/iOS, leitores de ecrã ou revisão completa de acessibilidade. Carregamento/erro/repetição têm implementação, mas não foram forçados nos testes de navegador.
Os gráficos foram verificados com 1–3 pontos por série. Muitos pontos podem sobrepor-se; há seleção alternativa pela lista, mas não há paginação, zoom ou agregação.
O Histórico original continua a mostrar as duas observações da Sprint 0; novos resultados estão nas áreas indicadas, sem migração silenciosa.
Isolamento demonstrativo de apresentação, não autenticação: as fixtures de ambos os perfis fazem parte do bundle. Dados reais exigem backend com autenticação/autorização por recurso, armazenamento de documentos, auditoria e política de retenção.
Sem OCR, IA, diagnóstico, alertas ou ligações institucionais.

