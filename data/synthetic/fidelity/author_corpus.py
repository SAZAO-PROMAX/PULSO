"""Autoria do corpus v1. Oráculos declarados aqui, sem importar comparadores.

Regerar altera ficheiros versionados: rever as diferenças, nunca ajustar a
verdade automaticamente para fazer passar o comparador.
"""
from copy import deepcopy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def known(value):
    return {"state": "known", "value": value}


UNKNOWN = {"state": "unknown", "value": None}

# Rótulos e campos esperados escritos antes da execução; não derivados das regras.
SPECS = [
    ("E01", "equivalent", "Idêntico", {}, {}, {}),
    ("E02", "equivalent", "Data DD/MM/AAAA", {}, {"collectionDate": "05/11/2026"}, {}),
    ("E03", "equivalent", "Decimal vírgula/ponto", {"value": "90,0"}, {"value": "90.00"}, {}),
    ("E04", "equivalent", "Alias de parâmetro", {}, {"parameter": "Glicemia"}, {}),
    ("E05", "equivalent", "Maiúsculas da unidade", {}, {"unit": " MG/DL "}, {}),
    ("E06", "equivalent", "Símbolo micro", {"parameter": "creatinine", "unit": "umol/L"}, {"unit": "µmol/L"}, {}),
    ("E07", "equivalent", "Espaçamento do método", {}, {"method": "  HEXOQUINASE  "}, {}),
    ("E08", "equivalent", "Maiúsculas da amostra", {}, {"context": " SORO "}, {}),
    ("E09", "equivalent", "Instante de processamento diferente", {}, {"processedAt": "2026-11-09T10:00:00Z"}, {}),
    ("E10", "equivalent", "Representações combinadas", {}, {"parameter": "Glucose", "value": "090.00", "reportDate": "07/11/2026"}, {}),
    ("L01", "loss", "Emissão no campo da colheita", {}, {"collectionDate": "2026-11-07"}, {"collectionDate": "altered"}),
    ("L02", "loss", "Colheita omitida", {}, {"collectionDate": "@absent"}, {"collectionDate": "omitted"}),
    ("L03", "loss", "Valor alterado", {}, {"value": "900"}, {"value": "altered"}),
    ("L04", "loss", "Parâmetro trocado", {}, {"parameter": "ldl"}, {"parameter": "altered"}),
    ("L05", "loss", "Unidade alterada sem conversão declarada", {}, {"unit": "mmol/L"}, {"unit": "altered"}),
    ("L06", "loss", "Método alterado", {}, {"method": "Enzimático"}, {"method": "altered"}),
    ("L07", "loss", "Amostra trocada", {}, {"context": "Plasma"}, {"context": "altered"}),
    ("L08", "loss", "Ligação ao original perdida", {}, {"provenance": "@absent"}, {"provenance": "omitted"}),
    ("L09", "loss", "Estado de confirmação perdido", {}, {"confirmation": "extracted_pending"}, {"confirmation": "altered"}),
    ("L10", "loss", "Emissão alterada", {}, {"reportDate": "2026-11-08"}, {"reportDate": "altered"}),
    ("A01", "ambiguous", "Método já desconhecido na origem", {"method": "@unknown"}, {}, {"method": "unknown_source"}),
    ("A02", "ambiguous", "Colheita já desconhecida na origem", {"collectionDate": "@unknown"}, {}, {"collectionDate": "unknown_source"}),
    ("A03", "ambiguous", "Amostra desconhecida", {"context": "@unknown"}, {}, {"context": "unknown_source"}),
    ("A04", "ambiguous", "Origem documental desconhecida", {"provenance": "@unknown"}, {}, {"provenance": "unknown_source"}),
    ("A05", "ambiguous", "Unidade desconhecida", {"unit": "@unknown"}, {}, {"unit": "unknown_source"}),
    ("A06", "ambiguous", "Parâmetro e unidade não identificados", {"parameter": "@unknown", "unit": "@unknown"}, {}, {"parameter": "unknown_source", "unit": "unknown_source"}),
    ("A07", "ambiguous", "Resultado com qualificador", {"value": "<90"}, {}, {"value": "review"}),
    ("A08", "ambiguous", "Precisão temporal não suportada", {"collectionDate": "2026-11-05T08:00:00Z"}, {}, {"collectionDate": "review"}),
    ("A09", "ambiguous", "Destino afirma método que a origem não confirma", {"method": "@unknown"}, {"method": "Hexoquinase"}, {"method": "unknown_source"}),
    ("A10", "ambiguous", "Campo ausente desde a origem", {"reportDate": "@absent"}, {}, {"reportDate": "unknown_source"}),
]


def update(record, changes):
    for field, value in changes.items():
        if value == "@absent":
            record.pop(field, None)
        else:
            record[field] = deepcopy(UNKNOWN) if value == "@unknown" else known(value)


def main():
    cases, truth = [], []
    for index, (case_id, outcome, title, source_changes, destination_changes, fields) in enumerate(SPECS):
        family = ("A", "B", "C")[index % 3]
        split = "evaluation" if family == "C" else "development"
        source = {"parameter": known("glucose"), "value": known("90"), "unit": known("mg/dL"),
                  "collectionDate": known("2026-11-05"), "reportDate": known("2026-11-07"),
                  "method": known("Hexoquinase"), "context": known("Soro"),
                  "provenance": known(f"synthetic-{case_id}"), "confirmation": known("user_confirmed"),
                  "processedAt": known("2026-11-08T10:00:00Z")}
        update(source, source_changes)
        destination = deepcopy(source)
        update(destination, destination_changes)
        order = list(source)
        if family == "B":
            order.reverse()
        elif family == "C":
            order = order[4:] + order[:4]
        lines = [f"FAMÍLIA {family} — DOCUMENTO INTEIRAMENTE SINTÉTICO — {case_id}"]
        evidence = {}
        for field in order:
            cell = source[field]
            line = f"{field}: {cell['value'] if cell['state'] == 'known' else '[DESCONHECIDO]'}"
            lines.append(line)
            evidence[field] = {"documentId": f"synthetic-{case_id}", "page": 1,
                               "line": len(lines), "excerpt": line, "file": f"sources/{case_id}.txt"}
        path = ROOT / "sources" / f"{case_id}.txt"
        path.parent.mkdir(parents=True, exist_ok=True)
        content = "\n".join(lines) + "\n"
        path.write_text(content, encoding="utf-8", newline="\n")
        for field in source_changes:
            if source_changes[field] == "@absent":
                evidence[field] = {"documentId": f"synthetic-{case_id}", "page": 1, "line": None,
                                   "excerpt": "Campo ausente no documento sintético integral.", "file": f"sources/{case_id}.txt"}
        cases.append({"id": case_id, "synthetic": True, "title": title, "layoutFamily": family,
                      "split": split, "source": source, "destination": destination, "evidence": evidence,
                      "sourceSha256": hashlib.sha256(content.encode()).hexdigest()})
        truth.append({"id": case_id, "outcome": outcome, "fields": fields})
    for name, value in (("pairs.json", cases), ("truth.json", truth)):
        (ROOT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
