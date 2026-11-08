# Teste de carga PULSO — 08/11/2026

## Comparação curta v0.6 — escrita

Mesma máquina/percurso de sete pedidos, pausa 0,3 s, rampa 2 s e 8 s a carga plena por patamar; Ollama desligado, base temporária. Referência v0.5 capturada antes de modificar a API (`tmp/v06-before`), com cópia do hash normal preservada. A v0.6 acrescenta If-Match às mesmas operações; não foram removidas verificações ou alterado o percurso para favorecer resultados.

| Clientes | Antes RPS | Antes p95 ms | V0.6 RPS | V0.6 p95 ms |
|---|---:|---:|---:|---:|
| 1 | 18,79 | 17,9 | 19,06 | 18,2 |
| 25 | 90,54 | 743,8 | 201,55 | 102,8 |
| 50 | 76,80 | 1673,6 | 200,18 | 272,2 |

Transações de leitura deixaram de reservar o escritor; escrita síncrona saiu do event loop. A tentativa intermédia apenas com threads melhorou p95 mas agravou p99 a 50 clientes para 7855 ms: não foi considerada aprovada. Admissão ordenada no event loop evita ocupar o pool de threads a disputar o único escritor SQLite, mantendo BEGIN IMMEDIATE/versões no banco. Ensaio final (`tmp/v06-fair-write`) aprovou os objetivos provisórios em 1/25/50, sem erros inesperados ou divergência de dados; a base normal manteve hash. Resultados são curtos, uma amostra por configuração, sem causalidade isolada por profiling nem equivalência a produção. Não foi repetido o ensaio sustentado de dez minutos nesta comparação. A fila de importação é verificada separadamente; não confundir desempenho de escrita com capacidade de inferência.

O restante relatório conserva o ensaio histórico v0.5, incluindo os problemas então reproduzidos (agora com regressões e correções v0.6).

Ensaio HTTP local executado, sem alterações funcionais à aplicação. Windows, Ryzen 7 260 (8 núcleos/16 processadores lógicos observados), 32 GB de RAM declarados. Gerador e API na mesma máquina, com serviços normais de desenvolvimento mantidos ativos. Não representa utilizadores reais, contas autenticadas, milhares de navegadores ou capacidade de produção.

## Resultado e condições

Maior patamar que cumpriu os critérios provisórios nos cinco cenários curtos: **25 utilizadores simulados**. Ensaio sustentado misto: **602,57 s**, 70 709 pedidos, 117,34 pedidos/s, p95 271,7 ms, p99 736,9 ms; critérios provisórios de estabilidade **cumpridos**. Isto não garante disponibilidade de importação: pedidos recusados são tratados separadamente abaixo.

Objetivos definidos antes do ensaio: erros inesperados ≤1%, p95 ≤1500 ms, p99 ≤5000 ms, pelo menos um percurso completo e nenhuma falha de percurso/integridade. Interrupção antecipada: ≥10 erros inesperados e >5%, três sondagens de saúde falhadas, limites de memória ou sinais de perda/duplicação. A progressão também termina no primeiro patamar que não cumpre os objetivos. São objetivos exploratórios, não requisitos clínicos nem SLA.

Patamares de 12 s a carga plena, rampa de 2 s, depois drenagem dos pedidos em curso; pausa de 0,3 s ±20% entre percursos. É um ritmo acelerado de stress, não tempo humano de preencher/rever formulários. Leituras também têm pausa entre Hub/histórico. Mistura: cada utilizador alterna uma escrita e duas leituras. Uma escrita inclui criar tensão, repetir o mesmo pedido, corrigir, consultar e eliminar os três resultados.

A API só aceita demo-a/demo-b. Os clientes repartem-se entre esses dois perfis, sem criar utilizadores nem contornar validações. Leitura do Hub/histórico/gráficos usa o mesmo endpoint de snapshot, sem medir desenho dos gráficos ou JavaScript no navegador. Todos os pedidos de extração principais usam o PDF sintético suportado e Ollama desligado.

## Resultados por cenário

Latências em milissegundos, por pedido, incluindo recusas previstas; percentis pelo método nearest-rank (p50 como medida central). Pontos decimais nas tabelas refletem os dados exportados. HTTP 403/404 esperados no cenário de isolamento não são falhas. RPS inclui rampa/drenagem; sondagens auxiliares e verificações finais de integridade ficam fora dos contadores.

| Cenário | Clientes | Pedidos | RPS | p50 | p95 | p99 | Recusas 429/409 | Estável* |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Leituras | 1 | 46 | 3.20 | 5.2 | 7.2 | 9.5 | 0 | Sim |
| Escritas | 1 | 273 | 19.17 | 7.7 | 10.2 | 11.3 | 0 | Sim |
| PDF | 1 | 72 | 5.00 | 9.5 | 454.6 | 477.5 | 0 | Sim |
| Misto | 1 | 99 | 6.81 | 7.1 | 9.9 | 10.4 | 0 | Sim |
| Isolamento | 1 | 172 | 12.28 | 3.1 | 4.8 | 6.0 | 0 | Sim |
| Leituras | 10 | 424 | 29.05 | 5.1 | 18.3 | 33.1 | 0 | Sim |
| Escritas | 10 | 1568 | 108.61 | 24.4 | 123.3 | 208.2 | 0 | Sim |
| PDF | 10 | 473 | 32.81 | 4.3 | 433.3 | 455.6 | 353 | Sim |
| Misto | 10 | 880 | 60.29 | 7.6 | 45.9 | 113.7 | 0 | Sim |
| Isolamento | 10 | 1632 | 113.75 | 4.3 | 8.7 | 21.6 | 0 | Sim |
| Leituras | 25 | 1060 | 72.53 | 6.5 | 28.8 | 48.2 | 0 | Sim |
| Escritas | 25 | 1449 | 94.40 | 106.9 | 624.8 | 1801.4 | 0 | Sim |
| PDF | 25 | 1108 | 76.74 | 5.2 | 17.6 | 450.9 | 984 | Sim |
| Misto | 25 | 1681 | 115.66 | 16.7 | 207.6 | 663.4 | 0 | Sim |
| Isolamento | 25 | 3408 | 235.63 | 11.4 | 78.0 | 135.3 | 0 | Sim |
| Leituras | 50 | 2082 | 142.18 | 8.6 | 37.7 | 131.2 | 0 | Sim |
| Escritas | 50 | 1393 | 85.50 | 223.0 | 1575.9 | 4876.1 | 0 | Não |
| Misto · 10 min | 25 | 70709 | 117.34 | 23.1 | 271.7 | 736.9 | 0 | Sim |

*Estabilidade de latência/integridade dos pedidos, não percentagem de importações atendidas. Com 50 clientes, leituras cumpriram os objetivos, mas escritas tiveram p95 de 1575,9 ms e p99 de 4876,1 ms. A subida parou nesse ponto: PDF/misto/isolamento a 50 e todos os cenários a 100/250/500/1000 **não executados**. Não é uma determinação do máximo absoluto da máquina.

### Recusas, erros e integridade

- PDF, 1 cliente(s): 18 percursos completos; 0 HTTP 429 (0.0% dos pedidos). HTTP 409: 0. Percentis baixos podem refletir recusas rápidas, não extração rápida.
- PDF, 10 cliente(s): 30 percursos completos; 353 HTTP 429 (74.6% dos pedidos). HTTP 409: 0. Percentis baixos podem refletir recusas rápidas, não extração rápida.
- PDF, 25 cliente(s): 31 percursos completos; 984 HTTP 429 (88.8% dos pedidos). HTTP 409: 0. Percentis baixos podem refletir recusas rápidas, não extração rápida.
- Erros HTTP inesperados/transportes: **0**. Códigos, contagens por operação, exemplos de falha e amostras estão em `tmp/load-main-v1/results.json`. Não houve 503/bloqueio SQLite ou timeout observado nesta execução.
- Todas as verificações finais por fase **aprovadas**. Validado esquema, proprietário, IDs/vínculos e `PRAGMA integrity_check`; após limpar os registos criados, snapshots iguais aos iniciais. Sem duplicação ou perda de escritas reconhecidas observada nos percursos ensaiados.
- Base normal: SHA-256 antes/depois **idêntico** (`358fce814e3853d0749a75db6f5299f19e79bc866e28b419eda28f3dd903200a`). Servidor de ensaio **terminado**. Porta 8877 e `tmp/load-main-v1/load.sqlite3`; sem reset/escrita na base normal.
- Isolamento: cabeçalho de outro perfil recusado com 403; consultar pré-visualização/editar documento/eliminar resultado inexistentes no perfil B devolve 404. Não há autenticação real: alguém pode escolher o cabeçalho demo-a e obter esse perfil. O ensaio não demonstra autorização de produção.

## Recursos observados

- API: RSS entre 86.3 e 99.9 MB; CPU amostrada máxima 97.6% de um núcleo (não percentagem global dos 16 processadores lógicos).
- Gerador: RSS entre 88.6 e 97.0 MB; CPU amostrada máxima 90.5% de um núcleo (não percentagem global dos 16 processadores lógicos).
- RAM disponível mínima observada: 13144 MB; maior tamanho amostrado do ficheiro SQLite: 126976 bytes.
- Amostras reais a cada 2 s em `resources-actual.ndjson`. O lançador venv do Windows inicialmente foi confundido com a API: amostras `server` embebidas em results.json do ensaio principal foram descartadas; a recolha externa corrigida começou nos patamares iniciais e cobriu o ensaio sustentado. O gerador final já identifica o filho Python correto, verificado no smoke final. Os limites automáticos de RSS do ensaio principal liam o lançador; a memória real foi acompanhada separadamente e ficou muito abaixo dos limites. Não se alega validação desses limites por injeção de falha.
- Não contabiliza todos os subprocessos curtos de parsing, GPU ou toda a memória do sistema. Ensaio finito e amostragem não provam ausência de fugas; outras aplicações não foram encerradas.

## Problemas reproduzidos e prioridades

1. **Prioridade alta — confirmação enganadora de tensão com ID repetido e payload diferente.** POST pressure com o mesmo ID, primeiro sistólica 128 e depois 140: ambos HTTP 200/saved=true, mas continua guardado 128. Repetição idêntica é idempotente; repetição diferente deve ser distinguida de sucesso. Reproduzido separadamente em `tmp/load-probes-v1/probes.json` e no smoke final. Não corrigido, conforme âmbito desta tarefa.
2. **Concorrência de edição — última escrita prevalece sem aviso.** Dois PATCH ao mesmo resultado com 130/131 devolvem 200; fica um valor e são preservadas duas versões anteriores. Sem precondição de versão/ETag não existe deteção de edição desatualizada. Isto descreve a política observada, não corrupção da transação. Priorizar decisão explícita antes de múltiplos dispositivos.
3. **Disponibilidade de importação limitada.** Um extrator por processo devolve 429 sob concorrência; as recusas dominam a carga de PDF. Avaliar espera/repetição limitada e comunicação ao utilizador antes de aumentar concorrência ou adicionar infraestrutura.
4. **Latência de escrita.** O p95 ultrapassou o objetivo a 50 clientes. Leitura e escrita usam BEGIN IMMEDIATE; há validação/reescrita integral do snapshot e operações síncronas em rotas async. São contribuidores plausíveis identificados no código, não causalidade isolada por profiling. Medir estes custos e carga realista antes de mudar a base/arquitetura.

## Repetir e parar

Na raiz, PowerShell, com dependências existentes na `.venv`:

```powershell
.\.venv\Scripts\python.exe scripts/load_test.py --users 1 10 25 50 100 250 500 1000 --duration 12 --ramp 2 --pause 0.3 --soak 600 --max-seconds 1800 --port 8877
.\.venv\Scripts\python.exe scripts/load_test.py --probes-only --port 8878
.\.venv\Scripts\python.exe scripts/load_test.py --inference-only --port 8878 --max-seconds 360
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_load_runner.py -v
```

A saída é uma pasta nova sob tmp, configurável por `--output`; portas ocupadas e destinos fora de tmp/já existentes são recusados. `--fixture` só aceita PDF sintético sob data/synthetic. Ctrl+C preserva resultados parciais e termina o servidor criado. Prazo global por `--max-seconds`. Para carga humana mais espaçada, usar por exemplo `--pause 3`, sem comparar diretamente a capacidade com esta carga acelerada.

## Verificações e limites

Gerador: três testes de fronteiras/percentis aprovados e compilação Python aprovada; smoke final com os cinco cenários e as provas de colisão passou. Prazo global de 2 s ensaiado: código 124, servidor terminado, resultados parciais preservados e hash normal igual; porta 8877 ocupada recusada antes de criar pasta/base. Ctrl+C está implementado no mesmo caminho de limpeza, mas não foi ensaiado manualmente no teclado. Código funcional da aplicação, SQLite normal, frontend, dependências e Ollama não foram alterados. Não se repetiu a suite funcional completa por não haver alteração de produto; o teste de carga não a substitui.

Inferência real separada: uma extração sequencial de PDF sintético com qwen3-vl:4b/Ollama 0.40.15; HTTP 200, 9,99 s, três propostas com os três valores/unidades esperados. Todas ficaram pendentes de revisão; base de ensaio inalterada. Não é teste de capacidade do modelo nem validação clínica; sem paralelismo de inferências. Artefacto em `tmp/load-inference-v1/inference.json`.

Ficheiros desta tarefa: `scripts/load_test.py`, `scripts/README.md`, `tests/test_load_runner.py` e este relatório. Artefactos em tmp, excluídos do Git. Sem publicação, push, dados reais ou extrapolação para utilizadores registados/diários. Perfis/BD pequenos, apenas um processo Uvicorn e ficheiro sintético conhecido: não cobre históricos grandes, redes móveis, browsers concorrentes, autenticação ou várias instâncias do servidor.
