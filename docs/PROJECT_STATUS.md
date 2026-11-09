# Estado atual do PULSO

Resumo de continuidade. Evidência e matriz de parâmetros em [VALIDATION.md](VALIDATION.md); comandos em [GUIA_WINDOWS.md](GUIA_WINDOWS.md).

## Sprint ativo — v0.7.4 em curso, 09/11/2026

Versão executável continua **0.7.3**; não declarar a v0.7.4 concluída. Base `1c6e0cc`; commit de atualização consultável por `git log -1 -- docs/PROJECT_STATUS.md`.

Bloco A: reprodução em contas sintéticas/DB temporária e portas 8784/8014, sem alterar a base normal. Três defeitos confirmados: perda de foco ao escolher categoria, rascunho descartado ao voltar, histórico do navegador sem passos internos. Enter/Espaço funcionam nos botões ensaiados. Revisão mostra 35 campos para cinco resultados; confirmação humana não pode ser ignorada. Um cenário aprovado/três falhas esperadas de reprodução; detalhes e comando em VALIDATION.md. Sem nova inferência, carga ou testes nativos.

Próximos três objetivos desta execução sequencial: (1) bloco B — navegação contextual, preservação de rascunhos e foco/teclado, incluindo Voltar/Avançar; (2) bloco C — revisão compacta com edição contextual, sem reduzir validações; (3) blocos D–G — regressões de fidelidade/estados, confirmações/contexto visual e testes finais. Concluir/testar cada bloco antes do seguinte; preservar os defeitos como testes até resolver. Estado anterior abaixo mantém funcionalidades e limites existentes.

## Versão e Git

- **Atualização:** 09/11/2026, Europe/Lisbon. **Versão:** v0.7.3 experimental, frontend/Expo/API `0.7.3`.
- **Branch:** main. **Base desta entrega:** `69620efc938986d4129dff16ff16d4a588e5d1ed`, última correção publicada da v0.7.2. Esta ficha acompanha a entrega final; consultar `git log -1 -- docs/PROJECT_STATUS.md` para o commit correspondente, sem inventar um hash futuro.
- **Repositório:** https://github.com/SAZAO-PROMAX/PULSO. Confirmar estado local/remoto ao retomar. Publicar versões está autorizado, sem force push e sem dados/segredos.

## Funcionalidades realmente implementadas

- Página pública curta: entrar, criar conta, recuperar acesso e informação de privacidade. Enquanto verifica a sessão, mostra estado neutro. Sem sessão não monta o ambiente privado nem pede dados clínicos.
- Área pessoal exige sessão verificada; endpoints de saúde verificam sessão/CSRF/Origin e dono. Rotas internas usam lista explícita, sem redirecionamentos externos. Logout revoga a sessão, desmonta dados privados e regressa à entrada pública; respostas 401 antigas não invalidam uma sessão mais recente.
- Novas contas inicializam diretamente sem documentos, medições ou acontecimentos. Fixtures clínicas estão fora do código da aplicação, num auxiliar de testes. **Nenhuma limpeza da base normal foi efetuada**; contas/registos/preferências anteriores foram preservados.
- Demo-a/demo-b só são utilizáveis com contexto de teste confirmado pelo servidor, flag explícita e base resolvida dentro de tmp. A opção de compilação não autoriza acesso. Reposição exige confirmação do perfil e não altera outras contas; não há reposição global no ambiente pessoal.
- Guardar exame, com ou sem extração, abre o detalhe; a evolução fica a um botão de distância. Tensão abre o registo guardado; acontecimento abre a cronologia. Edição conserva o detalhe e filtros; eliminação retira o registo e volta à lista. Erros/conflitos preservam campos e não apresentam sucesso antecipado.
- Hub com duas ações principais, estado vazio único e resumos persistidos, incluindo quando só existe tensão. As cinco áreas mantêm acesso em Ver evolução, sem segunda barra no Hub. Registar preserva as oito categorias e acontecimentos. Histórico reutiliza a mesma pesquisa/classificação: seletores de categoria/período, Mais filtros para tipo/especialidade/origem e filtros ativos removíveis. Estado vazio não se sobrepõe a acontecimentos existentes.
- Três modos partilham dados/permissões. Preferências de tema/sistema, texto, contraste, movimento e ajuda persistem na conta. Onboarding de sete passos continua opcional/retomável, com conclusão rápida após escolher modo. Perfil organizado por Conta, Informação de saúde, Aparência e Privacidade, com avatar/conta, largura máxima de 760 px e primeiros passos como ação secundária. Data apresentada em DD/MM/AAAA, mantida em ISO na API/base.
- Nascimento **continua obrigatório**, por confirmação explícita do utilizador neste sprint; não é utilizado para inferir competências, modo ou limites clínicos. Condições opcionais/autodeclaradas: lista local não exaustiva e adição manual. Oito avatares e fotografia fictícia privada.
- Navegação superior a partir de 900 px e inferior nas larguras menores, reservando espaço no layout. Tema discreto, estados selecionados também sublinhados, ações secundárias sem contorno e seletores partilhados. Aprender mantém as 23 fichas, cartões editoriais/resumo limitado e ação curta com nome acessível completo.
- Gráficos de 15 parâmetros laboratoriais e quatro vitais; unidades/métodos/amostras incompatíveis separados. Comparação por painéis alinhados, períodos e intervalo personalizado, pontos/origem/original, exclusões explícitas e lista completa paginada. Opções avançadas recolhidas por defeito no modo Equilibrado.
- Acontecimentos versionados, referências documentais, histórico de edição, marcadores/duração e alternativa textual. Sem causalidade automática. Eliminar acontecimento preserva exames; eliminar exame retira referências ativas atomicamente.
- Registar começa por Digitalizar exame / Importar ficheiro / Registar medição. Captura web de uma página com vídeo sem áudio, preview, repetição, conferência explícita de qualidade e classificação antes do mesmo DocumentImport. Câmara recusada/ausente oferece ficheiro; tracks encerram ao cancelar/concluir. ECG/outros documentos não laboratoriais são guardados sem extração estruturada.
- Seleção de documento ocupa a própria área de importação: nome, formato, tamanho, estado real e indicação de que ainda não foi guardado. Troca/cancelamento no mesmo bloco, animação breve com movimento reduzido respeitado e rejeição de formato/tamanho inválidos sem perder a seleção válida anterior.
- Importação sintética PDF/PNG/JPEG: parser conhecido ou Ollama local, revisão/correção e confirmação humana antes de persistir. Fila limitada, uma extração de cada vez. Aprender mantém 23 fichas, sem nova revisão clínica nesta entrega.

## Arquitetura em utilização

| Camada | Estado confirmado |
|---|---|
| Interface | Expo 57, React Native 0.86.3, React 19.2.3, TypeScript/react-native-web; componentes e tokens existentes, sem biblioteca visual nova; expo-image-picker ~57.0.21 e expo-crypto ~57.0.4 para aquisição/hash nativos. |
| Entrada/navegação | SessionGate/PublicEntry, rotas hash permitidas e uma Shell privada; AuthProvider mantém sessão/CSRF em memória. |
| Backend | FastAPI/Starlette, Argon2id, cookie HttpOnly/SameSite Strict, proteção Origin/CSRF e versões/If-Match. Prefixo histórico /demo não significa acesso público. |
| Persistência | Mesma SQLite .local/pulso.sqlite3; snapshots por dono, contas/sessões/preferências, transações e admissão ordenada. Sem migração destrutiva ou segunda base. |
| Documentos/IA | PyMuPDF e Ollama loopback/qwen3-vl:4b; originais preservados, sem novo modelo ou expansão da finalidade. |

## Demonstrativo, não suportado ou não validado

- Apenas identidades, fotografias e documentos fictícios; sem validação clínica, diagnóstico, metas terapêuticas ou partilha de produção.
- Parser determinístico conhecido cobre cinco analitos; catálogo/validação não garantem extração de todos os PDFs. A matriz distingue parser, modelo, API e UI; inferência real dos 19 parâmetros não foi ensaiada neste sprint.
- Correio continua em desenvolvimento, sem envio real nem prova externa de titularidade. Recuperação/verificação por operador local privilegiado.
- Sem formulário domiciliário de SpO₂, calendário/medicação estruturados, cloud, integrações institucionais ou papéis profissionais implementados. Especificações futuras em ARCHITECTURE.md.
- Câmara/galeria nativas implementadas em código com Expo, preview/aceitar/repetir e remoção de metadados JPEG. Exportações JS Android/iOS v0.7.3 aprovadas e permissões inspecionadas; **sem ensaio físico/emulador nem integração completa de sessão/Origin/cookies/API local comprovada**. Suporte operacional verificado nesta entrega: web. Sem publicação em lojas.
- Uma página por digitalização; PDFs até 3 páginas. Sem rotação/recorte/melhoria automática ou garantia de legibilidade. Fotografias >2 MB/12 MP são recusadas. Metadados de uploads comuns/cache do SDK exigem revisão própria antes de dados reais.
- Formulários não persistem após recarga; detalhes selecionados não têm URL individual. Fila de extração é volátil e não coordena vários processos.

## Problemas conhecidos por prioridade

1. **P0 antes de dados reais:** auditoria independente de autenticação/privacidade, transporte e proteção em repouso apropriados, finalidade/retenção e avaliação clínica/regulatória competentes pendentes.
2. **P1 acessibilidade/conteúdo:** leitores reais, zoom real e ensaios humanos pendentes; 23 fichas aguardam revisão profissional. Sem certificação WCAG.
3. **P1 identidade/móvel:** entrega/verificação real de e-mail, recuperação auditada e integração de sessão/Origin/cookies/API e ficheiros em dispositivos por concluir; câmara ainda sem teste físico.
4. **P2 fidelidade/capacidade:** no corpus denso, HDL ficou sem data e houve proposta extra não mapeada/sem valor; revisão humana mantida. Coorte autenticada ensaiada, mas só carga curta: 100 clientes marginalmente dentro do p95; 250 ultrapassaram o objetivo. Sem capacidade sustentada/produção demonstrada. Avisos de depreciação e dependências continuam por revisão própria.

## Última validação — atualização 09/11/2026

**211 testes distintos aprovados:** 100 API, 58 TypeScript, 36 Chromium demonstrativos isolados, 9 na configuração normal, 2 de estrutura e 6 dos geradores/métricas. Typecheck, pip check, exportação web e exportações JavaScript Android/iOS aprovados. Dois testes Chromium opcionais de inferência real omitidos; benchmark real separado efetivamente executado.

Coorte: 1.000 contas de fixture, 13.700 documentos e 45.504 resultados; 1.000 percursos autenticados/snapshots/reinício/revogações e 3.000 recusas cruzadas, sem divergência. Só 10 logins HTTP, sem 1.000 registos/logins pela API. Base normal inalterada e servidor de ensaio encerrado. Carga curta 1/10/25/50/100/250; parar a 250 por p95, sem tentar 500/1.000. Recursos, durações e limites em [LOAD_TEST.md](LOAD_TEST.md).

Corpus documental: 21 casos sem motor (parser limitado); 7 documentos únicos com o motor local, mais repetições do caso difícil e de uma fotografia com amostragem GPU. 35 resultados esperados, 36 propostas, 34 associações completas; HDL sem data e proposta extra incompleta, sem omissões ou divergência de valor/unidade nos resultados associados. 14 propostas sem conferência textual independente. Métricas por documento/parâmetro, tempos, testes efetivos e limitações em [VALIDATION.md](VALIDATION.md). Pipeline não alterado para favorecer o benchmark.

Capturas/geradores/DB de ensaio em tmp, ignorados pelo Git; comparação web e foco/teclado verificados. Sem leitor de ecrã real, zoom real, dispositivo físico ou certificação. O benchmark não transforma confirmação humana em validação médica.

## Próximos três objetivos

1. Validar a aquisição e integração de sessão/transporte/ficheiros em Android/iOS físico ou emulador, mantendo as guardas de autorização; estabilizar limites de fotografia antes de considerar várias páginas.
2. Expandir regressões documentais independentes para datas ausentes, propostas extra, reflexos/recortes e revisão clínica/editorial, sem remover casos difíceis ou inferir segurança clínica.
3. Rever independentemente autenticação/privacidade e medir carga sustentada/históricos grandes; não avançar para dados reais/cloud sem proteção e avaliação apropriadas.

## Continuidade

Atualizar concisamente no fim de cada sprint e incluir no commit de entrega. Reutilizar os relatórios existentes. Nunca guardar dados pessoais, tokens, documentos clínicos ou bases no relatório/Git. Distinguir sempre testes executados de planos e certificação.
