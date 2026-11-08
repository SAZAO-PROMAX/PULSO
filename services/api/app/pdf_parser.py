"""Only the versioned, synthetic PULSO text layout. Never OCR or remote services."""
import hashlib
import json
import re
import sys
from datetime import datetime
import pymupdf

MAX_BYTES = 512 * 1024
UNITS = {"glucose": ["mg/dL", "mmol/L"], "ldl": ["mg/dL", "mmol/L"],
         "creatinine": ["mg/dL", "umol/L"], "hemoglobin": ["g/dL", "g/L"], "hba1c": ["%", "mmol/mol"]}
LABELS = {"Glicose": "glucose", "Colesterol LDL": "ldl", "Creatinina": "creatinine",
          "Hemoglobina": "hemoglobin", "HbA1c": "hba1c"}
VERSION = "pulso-synthetic-text-1"

def parse_pdf(payload: bytes) -> dict:
    if len(payload) > MAX_BYTES or not payload.startswith(b"%PDF-"):
        raise ValueError("PDF inválido ou maior que 512 KB.")
    try:
        doc = pymupdf.open(stream=payload, filetype="pdf")
    except Exception as exc:
        raise ValueError("Não foi possível abrir o PDF.") from exc
    with doc:
        if doc.needs_pass or doc.page_count < 1 or doc.page_count > 3:
            raise ValueError("PDF cifrado ou com mais de 3 páginas não suportado.")
        pages = [page.get_text() for page in doc]
    if sum(map(len, pages)) > 30000:
        raise ValueError("Texto do PDF excede o limite.")
    text = "\n".join(pages)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines or lines[0] != "PULSO SYNTHETIC LAB V1":
        raise ValueError("Só é aceite o modelo PULSO sintético com texto selecionável. OCR não disponível.")
    labs = [line.removeprefix("Laboratorio: ") for line in lines if line.startswith("Laboratorio: ")]
    dates = [line.removeprefix("Data: ") for line in lines if line.startswith("Data: ")]
    if len(labs) != 1 or not labs[0].startswith("Laboratorio Demo ") or len(dates) != 1:
        raise ValueError("Laboratório ou data ausente/ambíguo.")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", dates[0]):
        raise ValueError("Data inválida. Usar AAAA-MM-DD.")
    datetime.strptime(dates[0], "%Y-%m-%d")
    candidates = []
    for page_number, page in enumerate(pages, 1):
        for line in page.splitlines():
            if "|" not in line:
                continue
            fields = [x.strip() for x in line.split("|")]
            if len(fields) != 6 or fields[0] not in LABELS:
                raise ValueError("Linha não suportada ou ambígua no modelo sintético.")
            label, raw_value, unit, reference, method, context = fields
            parameter = LABELS[label]
            issues = []
            if not re.fullmatch(r"\d+(?:[.,]\d+)?", raw_value):
                issues.append("Valor ausente ou ambíguo: corrigir ou excluir.")
            if unit not in UNITS[parameter]:
                issues.append("Unidade não suportada: corrigir ou excluir.")
            if not method or not context:
                issues.append("Método ou amostra ausente: preencher ou excluir.")
            candidates.append({"parameter": parameter, "value": raw_value, "unit": unit,
                               "referenceText": reference or None, "method": method, "context": context,
                               "page": page_number, "excerpt": line, "issues": issues})
    if not candidates or len(candidates) > 30:
        raise ValueError("Sem parâmetros suportados ou demasiadas linhas.")
    for row in candidates:
        if sum(c["parameter"] == row["parameter"] for c in candidates) > 1:
            row["issues"].append("Parâmetro repetido: escolher apenas uma linha para confirmar.")
    return {"parserVersion": VERSION, "sha256": hashlib.sha256(payload).hexdigest(),
            "laboratory": labs[0], "date": dates[0], "text": text, "candidates": candidates}

if __name__ == "__main__":
    try:
        print(json.dumps({"ok": True, "data": parse_pdf(sys.stdin.buffer.read(MAX_BYTES + 1))}))
    except Exception:
        print(json.dumps({"ok": False, "error": "PDF não suportado. Verificar modelo, texto, data e limites (512 KB / 3 páginas)."}))
