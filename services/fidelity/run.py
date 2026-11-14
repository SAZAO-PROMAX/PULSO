"""CLI reproduzível sem dependências, servidor, base de dados ou rede."""
import argparse
from collections import Counter
import hashlib
from html import escape
import json
from pathlib import Path
import time

from .compare import RULE_VERSION, compare, simple_compare, validate_record

ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / "data/synthetic/fidelity"
NAMES = {"equivalent": "equivalente", "loss": "perda", "ambiguous": "revisão"}


def load_corpus():
    pairs = json.loads((CORPUS / "pairs.json").read_text(encoding="utf-8"))
    truth = json.loads((CORPUS / "truth.json").read_text(encoding="utf-8"))
    if len({p["id"] for p in pairs}) != len(pairs) or {p["id"] for p in pairs} != {t["id"] for t in truth}:
        raise ValueError("IDs do corpus/oráculo inválidos.")
    for pair in pairs:
        if pair.get("synthetic") is not True:
            raise ValueError("Só pares explicitamente sintéticos.")
    return pairs, {t["id"]: t for t in truth}


def read_original(pair, directory=None):
    directory = CORPUS if directory is None else directory
    # No corpus v1, a associação caso–ficheiro é fixa e independente dos excertos.
    name = f"sources/{pair['id']}.txt"
    path = (directory / name).resolve()
    if not path.is_relative_to((directory / "sources").resolve()):
        raise ValueError("Fonte fora do corpus.")
    content = path.read_bytes()
    if hashlib.sha256(content).hexdigest() != pair["sourceSha256"]:
        raise ValueError(f"Fonte alterada: {pair['id']}")
    return name, content.decode("utf-8")


def location_errors(pair, name, original):
    errors = {}
    lines = original.splitlines()
    for field, ref in (pair.get("evidence") or {}).items():
        if (not isinstance(ref, dict) or ref.get("file") != name or ref.get("page") != 1
                or ref.get("documentId") != f"synthetic-{pair['id']}"):
            errors[field] = "Prova insuficiente: documento ou página não correspondem à origem."
            continue
        number = ref.get("line")
        if number is None and field not in pair["source"]:
            continue
        if type(number) is not int or not 1 <= number <= len(lines):
            errors[field] = "Prova insuficiente: linha indisponível no original."
        elif lines[number - 1] != ref.get("excerpt"):
            errors[field] = "Prova contraditória: o excerto difere da linha do original."
    return errors


def evaluate(pairs, truth):
    rows = []
    for p in pairs:
        name, original = read_original(p)
        result = compare(p["source"], p["destination"], p.get("evidence") or {}, location_errors(p, name, original))
        structural = validate_record(p["source"]) + validate_record(p["destination"])
        simple = simple_compare(p["source"], p["destination"])
        actual_fields = {f["field"]: f["state"] for f in result["findings"] if f["state"] != "equivalent"}
        oracle = truth[p["id"]]
        rows.append({"id": p["id"], "title": p["title"], "split": p["split"], "layoutFamily": p["layoutFamily"],
                     "expected": oracle["outcome"], "expectedFields": oracle["fields"],
                     "pulso": result["outcome"], "simple": simple["outcome"],
                     "structure": "ambiguous" if structural else "equivalent",
                     "structuralErrors": structural, "simpleDifferences": simple["differences"], "original": original,
                     "fieldsCorrect": actual_fields == oracle["fields"], "result": result})
    return rows


def metrics(rows, approach):
    confusion = Counter((r["expected"], r[approach]) for r in rows)
    return {"cases": len(rows), "correct": sum(r["expected"] == r[approach] for r in rows),
            "criticalMisses": sum(r["expected"] == "loss" and r[approach] != "loss" for r in rows),
            "falseAlertsOnEquivalent": sum(r["expected"] == "equivalent" and r[approach] != "equivalent" for r in rows),
            "abstentions": sum(r[approach] == "ambiguous" for r in rows),
            "confusion": {f"{a}->{b}": n for (a, b), n in sorted(confusion.items())}}


def markdown(rows, hashes, reference=None):
    text = ["# Ensaio de fidelidade v1 — execução sintética", "",
            f"Regras `{RULE_VERSION}`. 30 pares estruturados; família C reservada para avaliação (10), A/B desenvolvimento (20).",
            "A reserva é por ordem de campos/layout sintético; não é validação cega, externa ou de OCR.", "",
            "A verdade de referência está em truth.json, declarada na autoria sem chamar o comparador.",
            "O mesmo autor preparou casos e implementação: existe risco de favorecer as regras. Não medir generalização por estes resultados.", "",
            "## Resultados por abordagem", "",
            "| Conjunto | Abordagem | Acertos/classes | Perdas críticas omitidas | Falsos alertas em equivalentes | Abstenções |",
            "|---|---|---:|---:|---:|---:|"]
    for split in ("all", "development", "evaluation"):
        subset = rows if split == "all" else [r for r in rows if r["split"] == split]
        for approach in (("pulso", "simple", "structure", "reference") if reference else ("pulso", "simple", "structure")):
            m = metrics(subset, approach)
            text.append(f"| {split} | {approach} | {m['correct']}/{m['cases']} | {m['criticalMisses']} | {m['falseAlertsOnEquivalent']} | {m['abstentions']} |")
    text += ["", "Gravidade crítica significa risco de perda de fidelidade no ensaio, não urgência clínica.",
             "A baseline simples compara literalmente os mesmos nove campos, distingue ausência/desconhecido e ignora processedAt tal como PULSO.",
             "A baseline de estrutura é validate_record v1 (Python/biblioteca padrão), contrato nativo local com campos opcionais; não compara origem/destino.",
             "Não foi introduzido FHIR, perfil, Inferno ou Firely; a comparação com um validador de interfaces institucionais continua pendente.", "",
             "## Resultados por caso", "",
             "| Caso | Família/conjunto | Referência | PULSO | Simples | Estrutura | Campos corretos |",
             "|---|---|---|---|---|---|---|"]
    for r in rows:
        text.append(f"| {r['id']} — {r['title']} | {r['layoutFamily']}/{r['split']} | {r['expected']} | {r['pulso']} | {r['simple']} | {r['structure']} | {'sim' if r['fieldsCorrect'] else 'NÃO'} |")
    if reference:
        text += ["", f"Validador de referência executado: {reference['tool']} **{reference['version']}**, contrato **{reference['contract']}**.",
                 reference["limits"], "Sem FHIR/perfil. Valida cada lado separadamente, sem importar regras do comparador.",
                 "Nas baselines estruturais, equivalent significa apenas aceite pela estrutura, sem garantir equivalência semântica; ambiguous significa rejeitado para revisão.", "",
                 "| Caso | Referência estrutural |", "|---|---|"]
        text.extend(f"| {r['id']} | {r['reference']} |" for r in rows)
    text += ["", "## Conclusões e limites", "",
             "- Erro adicional face à estrutura: colheita substituída por emissão, embora ambas sejam datas válidas. A comparação simples também deteta esta troca; não há ganho de deteção de perdas críticas sobre essa baseline neste corpus.",
             "- Falsos alertas evitados: diferenças de vírgula/ponto, alias do catálogo, espaços, maiúsculas, micro e datas explícitas equivalentes. Não são efetuadas conversões de unidades nem inferências clínicas.",
             "- Campos desconhecidos já na origem exigem revisão, mesmo quando os dois lados são literalmente iguais. processedAt é guardado intacto, separado da data clínica.",
             "- Não foi medido tempo humano, esforço real de configuração, redução de 30%, procura, orçamento ou piloto. Duração de execução da máquina não representa tempo de investigação.",
             "- Zero perdas omitidas neste conjunto é um resultado limitado aos pares escritos. As famílias não representam interfaces de parceiros; o comparador recebe campos já estruturados, sem descobrir mapeamentos ou alinhar documentos/resultados.",
             "- A referência à linha do original é verificável por hash/excerto; não é assinatura externa nem prova de que a extração é correta. Dois campos confirmados iguais não provam comparabilidade clínica.",
             "- Corpus não cobre conversões físicas, arredondamentos, perfis institucionais, múltiplos resultados por documento nem linguagem arbitrária. Não usar com dados reais.", "",
             "## Reproduzir", "", "```powershell", ".\\ensaio.cmd", "# Para incluir a referência explicitamente, com a venv da aplicação instalada:",
             ".\\.venv\\Scripts\\python.exe -m services.fidelity.run --check --demo --reference",
             ".\\.venv\\Scripts\\python.exe -m unittest discover -s tests/fidelity -v", "node --test tests/fidelity/sync.test.mjs", "```", "",
             "Saída determinística: results.json, report.md e demo.html em tmp/fidelity. runtime.json contém tempos reais variáveis.",
             "CI: --check falha se a classe ou os campos diferirem do oráculo; encontrar as perdas deliberadas não é uma falha do ensaio.", "",
             "## Identificação dos dados", ""]
    text.extend(f"- {name}: `{digest}`" for name, digest in sorted(hashes.items()))
    return "\n".join(text) + "\n"


def html_report(rows, study=False):
    esc = lambda value: escape(json.dumps(value, ensure_ascii=False))
    parts = ["<!doctype html><html lang='pt-PT'><meta charset='utf-8'><meta name='viewport' content='width=device-width'>",
             "<title>PULSO — Fidelidade sintética</title><style>body{font:17px system-ui;max-width:1100px;margin:auto;padding:24px;color:#17283a;background:#f6f8fa}h1{font-size:32px}article{background:white;border:1px solid #a6b4c0;border-radius:12px;padding:20px;margin:20px 0}table{border-collapse:collapse;width:100%;font-size:15px}td,th{border:1px solid #a6b4c0;text-align:left;padding:10px;vertical-align:top;overflow-wrap:anywhere}summary{cursor:pointer;padding:12px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#174f94}:focus-visible{outline:3px solid #174f94;outline-offset:3px}@media(max-width:700px){table,tbody,tr,td,th{display:block}thead{display:none}}</style>",
             "<h1>PULSO · Fidelidade origem–destino</h1><p>Ensaio offline, inteiramente sintético. Sem diagnóstico ou ligação à base habitual.</p>",
             ]
    if not study:
        parts += ['<p>Demonstração: <a href="#E01">Conservado</a> · <a href="#L01">Alterado</a> · <a href="#L02">Omitido</a> · <a href="#A01">Desconhecido</a></p>']
    for r in rows:
        review_note = " Há campos por rever." if r["result"]["requiresReview"] else ""
        comparison = "" if study else f" Comparação simples: {NAMES[r['simple']]}. Família {escape(r['layoutFamily'])}."
        parts += [f"<article id='{r['id']}'><h2>{escape(r['id'] + ' · ' + r['title'])}</h2>",
                  f"<p>Conclusão: <strong>{NAMES[r['pulso']]}</strong>. {comparison}{review_note}</p>",
                  "<table><thead><tr><th>Campo</th><th>Origem</th><th>Recebido</th><th>Conclusão / regra / fonte</th></tr></thead><tbody>"]
        for f in r["result"]["findings"]:
            ev = f["evidence"]
            evtext = f"{ev.get('documentId')}, página {ev.get('page')}, linha {ev.get('line')}: {ev.get('excerpt')}" if isinstance(ev, dict) else "Evidência não disponível"
            parts.append(f"<tr><th>{escape(f['field'])}</th><td>{esc(f['expected'])}</td><td>{esc(f['received'])}</td><td><b>{escape(f['state'])}</b> ({escape(f['severity'])})<br>{escape(f['reason'])}<details><summary>Evidência e regra</summary><p>{escape(evtext)}</p><code>{escape(f['rule'])}</code></details></td></tr>")
        original = r["original"]
        parts += ["</tbody></table><details><summary>Original sintético completo</summary><pre>" + escape(original) + "</pre></details>",
                  "<details><summary>Registos integrais recebidos (incluindo processamento)</summary><pre>" + esc({"source": r["result"]["source"], "destination": r["result"]["destination"]}) + "</pre></details></article>"]
    return "\n".join(parts) + "</html>\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--demo", action="store_true")
    parser.add_argument("--reference", action="store_true", help="Executar Pydantic instalado na venv da aplicação, sem instalar nada.")
    parser.add_argument("--out", type=Path, default=ROOT / "tmp/fidelity")
    args = parser.parse_args()
    # Nunca sobrescrever relatórios em diretórios arbitrários nem ficheiros da aplicação.
    out = args.out.resolve()
    if not out.is_relative_to(ROOT / "tmp"):
        parser.error("A saída deve ficar dentro de tmp deste checkout.")
    start = time.perf_counter()
    pairs, truth = load_corpus()
    rows = evaluate(pairs, truth)
    reference = None
    if args.reference:
        from .reference import metadata, validate
        reference = metadata()
        for row, pair in zip(rows, pairs):
            row["reference"] = "equivalent" if validate(pair["source"]) and validate(pair["destination"]) else "ambiguous"
    hashes = {name: hashlib.sha256((CORPUS / name).read_bytes()).hexdigest() for name in ("pairs.json", "truth.json")}
    out.mkdir(parents=True, exist_ok=True)
    (out / "results.json").write_text(json.dumps({"ruleVersion": RULE_VERSION, "corpusHashes": hashes, "referenceValidator": reference, "rows": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    (out / "report.md").write_text(markdown(rows, hashes, reference), encoding="utf-8", newline="\n")
    (out / "demo.html").write_text(html_report(rows), encoding="utf-8", newline="\n")
    elapsed = time.perf_counter() - start
    (out / "runtime.json").write_text(json.dumps({"elapsedSeconds": elapsed, "humanReviewSeconds": None}) + "\n", encoding="utf-8")
    for approach in (("pulso", "simple", "structure", "reference") if reference else ("pulso", "simple", "structure")):
        print(approach, json.dumps(metrics(rows, approach), ensure_ascii=False))
    if args.demo:
        for r in rows:
            if r["id"] not in ("E01", "L01", "L02", "A01"):
                continue
            print(f"\n{r['id']} {r['title']}: {NAMES[r['pulso']]}")
            for f in r["result"]["findings"]:
                if f["state"] != "equivalent" or f["field"] in ("collectionDate", "reportDate"):
                    print(f"  {f['field']}: {f['expected']} -> {f['received']} | {f['state']} | {f['reason']}")
                    print("  Evidência:", f["evidence"], "Regra:", f["rule"])
    print(f"Relatórios: {out.relative_to(ROOT)}; execução: {elapsed:.4f}s (não é tempo de revisão humana)")
    failed = any(r["pulso"] != r["expected"] or not r["fieldsCorrect"] for r in rows)
    return 1 if args.check and failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
