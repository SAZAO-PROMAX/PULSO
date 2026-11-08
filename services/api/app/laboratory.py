"""Small shared, explicit catalogue. No fuzzy medical name matching."""
import json
import re
import unicodedata
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path
CATALOG=json.loads((Path(__file__).resolve().parents[3]/"packages/shared/laboratory.json").read_text(encoding="utf-8"))
PARAMETERS={p["id"]:p for p in CATALOG["parameters"]}
def norm(value):
    return " ".join("".join(c for c in unicodedata.normalize("NFKD",value or "") if not unicodedata.combining(c)).casefold().split())
def parameter_id(name):
    return next((p["id"] for p in PARAMETERS.values() if norm(name) in {norm(a) for a in p["aliases"]}),None)
def normalized_unit(parameter,unit):
    key=(unit or "").replace("µ","u").replace("μ","u").strip().casefold()
    return next((u for u in PARAMETERS.get(parameter,{}).get("units",[]) if u.casefold()==key),None)
def numeric(raw):
    if not isinstance(raw,str) or not re.fullmatch(r"[+-]?\d+(?:[.,]\d+)?",raw.strip()): return None
    try:
        value=Decimal(raw.strip().replace(",","."))
        return float(value) if value.is_finite() else None
    except (InvalidOperation,OverflowError): return None
def iso_date(raw):
    if not raw:return None
    try:
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}",raw):return date.fromisoformat(raw).isoformat()
        if re.fullmatch(r"\d{2}/\d{2}/\d{4}",raw):
            d,m,y=map(int,raw.split("/"));return date(y,m,d).isoformat()
    except ValueError:pass
    return None
