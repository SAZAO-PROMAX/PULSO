"""Baseline congelada para o estudo humano. Entrada: JSON com source e destination."""
import json
import re
import sys
from datetime import datetime
from decimal import Decimal
from pathlib import Path

VERSION = "normalized-1.0"

CATALOG = Path(__file__).resolve().parents[2] / "packages/shared/laboratory.json"
PARAMETERS = json.loads(CATALOG.read_text(encoding="utf-8"))["parameters"]
ALIASES = {alias.lower(): p["id"] for p in PARAMETERS for alias in (p["id"], *p["aliases"])}
FIELDS = ("parameter", "value", "unit", "collectionDate", "reportDate", "method", "context", "provenance", "confirmation")


def normalize(field, value):
    if field == "parameter":
        return ALIASES.get(value.lower())
    if field == "value":
        return Decimal(value.replace(",", ".")) if re.fullmatch(r"[+-]?\d+(?:[.,]\d+)?", value) else None
    if field in ("collectionDate", "reportDate"):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.strptime(value, fmt).date()
            except ValueError:
                continue
        return None
    if field == "unit":
        return value.strip().replace("µ", "u").casefold()
    if field in ("method", "context"):
        return " ".join(value.casefold().split())
    return value


def classify(source, destination):
    findings = {}
    for field in FIELDS:
        left, right = source.get(field, {}), destination.get(field, {})
        a = normalize(field, left["value"]) if left.get("state") == "known" else None
        b = normalize(field, right["value"]) if right.get("state") == "known" else None
        if a is None or (right.get("state") == "known" and b is None):
            findings[field] = "ambiguous"
        elif a != b:
            findings[field] = "loss"
    states = findings.values()
    outcome = "loss" if "loss" in states else "ambiguous" if findings else "equivalent"
    return {"outcome": outcome, "fields": findings}


if __name__ == "__main__":
    pair = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    if pair.get("synthetic") is not True:
        raise SystemExit("Só pares sintéticos.")
    print(json.dumps(classify(pair["source"], pair["destination"]), indent=2))
