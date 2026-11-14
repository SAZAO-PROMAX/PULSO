# Ensaio de fidelidade v1 — execução sintética

Regras `fidelity-1.0.1`. 30 pares estruturados; família C reservada para avaliação (10), A/B desenvolvimento (20).
A reserva é por ordem de campos/layout sintético; não é validação cega, externa ou de OCR.

A verdade de referência está em truth.json, declarada na autoria sem chamar o comparador.
O mesmo autor preparou casos e implementação: existe risco de favorecer as regras. Não medir generalização por estes resultados.

## Resultados por abordagem

| Conjunto | Abordagem | Acertos/classes | Perdas críticas omitidas | Falsos alertas em equivalentes | Abstenções |
|---|---|---:|---:|---:|---:|
| all | pulso | 30/30 | 0 | 0 | 10 |
| all | simple | 12/30 | 0 | 8 | 0 |
| all | structure | 12/30 | 10 | 0 | 2 |
| all | reference | 10/30 | 10 | 0 | 0 |
| development | pulso | 20/20 | 0 | 0 | 6 |
| development | simple | 8/20 | 0 | 6 | 0 |
| development | structure | 8/20 | 7 | 0 | 1 |
| development | reference | 7/20 | 7 | 0 | 0 |
| evaluation | pulso | 10/10 | 0 | 0 | 4 |
| evaluation | simple | 4/10 | 0 | 2 | 0 |
| evaluation | structure | 4/10 | 3 | 0 | 1 |
| evaluation | reference | 3/10 | 3 | 0 | 0 |

Gravidade crítica significa risco de perda de fidelidade no ensaio, não urgência clínica.
A baseline simples compara literalmente os mesmos nove campos, distingue ausência/desconhecido e ignora processedAt tal como PULSO.
A baseline de estrutura é validate_record v1 (Python/biblioteca padrão), contrato nativo local com campos opcionais; não compara origem/destino.
Não foi introduzido FHIR, perfil, Inferno ou Firely; a comparação com um validador de interfaces institucionais continua pendente.

## Resultados por caso

| Caso | Família/conjunto | Referência | PULSO | Simples | Estrutura | Campos corretos |
|---|---|---|---|---|---|---|
| E01 — Idêntico | A/development | equivalent | equivalent | equivalent | equivalent | sim |
| E02 — Data DD/MM/AAAA | B/development | equivalent | equivalent | loss | equivalent | sim |
| E03 — Decimal vírgula/ponto | C/evaluation | equivalent | equivalent | loss | equivalent | sim |
| E04 — Alias de parâmetro | A/development | equivalent | equivalent | loss | equivalent | sim |
| E05 — Maiúsculas da unidade | B/development | equivalent | equivalent | loss | equivalent | sim |
| E06 — Símbolo micro | C/evaluation | equivalent | equivalent | loss | equivalent | sim |
| E07 — Espaçamento do método | A/development | equivalent | equivalent | loss | equivalent | sim |
| E08 — Maiúsculas da amostra | B/development | equivalent | equivalent | loss | equivalent | sim |
| E09 — Instante de processamento diferente | C/evaluation | equivalent | equivalent | equivalent | equivalent | sim |
| E10 — Representações combinadas | A/development | equivalent | equivalent | loss | equivalent | sim |
| L01 — Emissão no campo da colheita | B/development | loss | loss | loss | equivalent | sim |
| L02 — Colheita omitida | C/evaluation | loss | loss | loss | equivalent | sim |
| L03 — Valor alterado | A/development | loss | loss | loss | equivalent | sim |
| L04 — Parâmetro trocado | B/development | loss | loss | loss | equivalent | sim |
| L05 — Unidade alterada sem conversão declarada | C/evaluation | loss | loss | loss | equivalent | sim |
| L06 — Método alterado | A/development | loss | loss | loss | equivalent | sim |
| L07 — Amostra trocada | B/development | loss | loss | loss | equivalent | sim |
| L08 — Ligação ao original perdida | C/evaluation | loss | loss | loss | equivalent | sim |
| L09 — Estado de confirmação perdido | A/development | loss | loss | loss | equivalent | sim |
| L10 — Emissão alterada | B/development | loss | loss | loss | equivalent | sim |
| A01 — Método já desconhecido na origem | C/evaluation | ambiguous | ambiguous | equivalent | equivalent | sim |
| A02 — Colheita já desconhecida na origem | A/development | ambiguous | ambiguous | equivalent | equivalent | sim |
| A03 — Amostra desconhecida | B/development | ambiguous | ambiguous | equivalent | equivalent | sim |
| A04 — Origem documental desconhecida | C/evaluation | ambiguous | ambiguous | equivalent | equivalent | sim |
| A05 — Unidade desconhecida | A/development | ambiguous | ambiguous | equivalent | equivalent | sim |
| A06 — Parâmetro e unidade não identificados | B/development | ambiguous | ambiguous | equivalent | equivalent | sim |
| A07 — Resultado com qualificador | C/evaluation | ambiguous | ambiguous | equivalent | ambiguous | sim |
| A08 — Precisão temporal não suportada | A/development | ambiguous | ambiguous | equivalent | ambiguous | sim |
| A09 — Destino afirma método que a origem não confirma | B/development | ambiguous | ambiguous | loss | equivalent | sim |
| A10 — Campo ausente desde a origem | C/evaluation | ambiguous | ambiguous | equivalent | equivalent | sim |

Validador de referência executado: Pydantic **2.14.3**, contrato **fidelity-record-1**.
Apenas estrutura de células; campos clínicos são strings de transporte, sem semântica de origem.
Sem FHIR/perfil. Valida cada lado separadamente, sem importar regras do comparador.
Nas baselines estruturais, equivalent significa apenas aceite pela estrutura, sem garantir equivalência semântica; ambiguous significa rejeitado para revisão.

| Caso | Referência estrutural |
|---|---|
| E01 | equivalent |
| E02 | equivalent |
| E03 | equivalent |
| E04 | equivalent |
| E05 | equivalent |
| E06 | equivalent |
| E07 | equivalent |
| E08 | equivalent |
| E09 | equivalent |
| E10 | equivalent |
| L01 | equivalent |
| L02 | equivalent |
| L03 | equivalent |
| L04 | equivalent |
| L05 | equivalent |
| L06 | equivalent |
| L07 | equivalent |
| L08 | equivalent |
| L09 | equivalent |
| L10 | equivalent |
| A01 | equivalent |
| A02 | equivalent |
| A03 | equivalent |
| A04 | equivalent |
| A05 | equivalent |
| A06 | equivalent |
| A07 | equivalent |
| A08 | equivalent |
| A09 | equivalent |
| A10 | equivalent |

## Conclusões e limites

- Erro adicional face à estrutura: colheita substituída por emissão, embora ambas sejam datas válidas. A comparação simples também deteta esta troca; não há ganho de deteção de perdas críticas sobre essa baseline neste corpus.
- Falsos alertas evitados: diferenças de vírgula/ponto, alias do catálogo, espaços, maiúsculas, micro e datas explícitas equivalentes. Não são efetuadas conversões de unidades nem inferências clínicas.
- Campos desconhecidos já na origem exigem revisão, mesmo quando os dois lados são literalmente iguais. processedAt é guardado intacto, separado da data clínica.
- Não foi medido tempo humano, esforço real de configuração, redução de 30%, procura, orçamento ou piloto. Duração de execução da máquina não representa tempo de investigação.
- Zero perdas omitidas neste conjunto é um resultado limitado aos pares escritos. As famílias não representam interfaces de parceiros; o comparador recebe campos já estruturados, sem descobrir mapeamentos ou alinhar documentos/resultados.
- A referência à linha do original é verificável por hash/excerto; não é assinatura externa nem prova de que a extração é correta. Dois campos confirmados iguais não provam comparabilidade clínica.
- Corpus não cobre conversões físicas, arredondamentos, perfis institucionais, múltiplos resultados por documento nem linguagem arbitrária. Não usar com dados reais.

## Reproduzir

```powershell
.\ensaio.cmd
# Para incluir a referência explicitamente, com a venv da aplicação instalada:
.\.venv\Scripts\python.exe -m services.fidelity.run --check --demo --reference
.\.venv\Scripts\python.exe -m unittest discover -s tests/fidelity -v
node --test tests/fidelity/sync.test.mjs
```

Saída determinística: results.json, report.md e demo.html em tmp/fidelity. runtime.json contém tempos reais variáveis.
CI: --check falha se a classe ou os campos diferirem do oráculo; encontrar as perdas deliberadas não é uma falha do ensaio.

## Identificação dos dados

- pairs.json: `ea5f1cc318e18d720be2088f136e9cb26b1c0ab088f6956b3d6e1f49ece18804`
- truth.json: `ccfbd010cfb579c332c8061d0f14469b144766db2a18ae5bbd8bae491e3a5035`
