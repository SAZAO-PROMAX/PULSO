"""Comparação conservadora de campos, independente da verdade de referência."""
from copy import deepcopy
from datetime import datetime
from decimal import Decimal, InvalidOperation
import re

from services.api.app.laboratory import PARAMETERS, parameter_id, normalized_unit, iso_date

RULE_VERSION = "fidelity-1.0.1"
FIELDS = ("parameter", "value", "unit", "collectionDate", "reportDate", "method",
          "context", "provenance", "confirmation")
ABSENT = {"state": "absent"}
LABELS = {"equivalent": "Equivalente", "altered": "Alteração", "omitted": "Omissão",
          "review": "Revisão necessária", "unknown_source": "Desconhecido na origem"}


def text_key(value):
    # Só equivalência lexical; não adivinhar métodos, amostras ou identificadores.
    return " ".join(value.casefold().split())


def canonical(field, value, record):
    if not isinstance(value, str) or not value.strip():
        return None
    if field == "parameter":
        return value if value in PARAMETERS else parameter_id(value)
    if field == "unit":
        p = record.get("parameter", {})
        pid = canonical("parameter", p.get("value"), record) if p.get("state") == "known" else None
        return normalized_unit(pid, value)
    if field == "value":
        if not re.fullmatch(r"[+-]?\d+(?:[.,]\d+)?", value.strip()):
            return None
        try:
            number = Decimal(value.strip().replace(",", "."))
            return number if number.is_finite() else None
        except InvalidOperation:
            return None
    if field in ("collectionDate", "reportDate"):
        # Um dia não implica um instante nem um fuso. Não truncar timestamps.
        return iso_date(value)
    if field in ("method", "context"):
        return text_key(value)
    if field == "confirmation":
        return value if value in ("extracted_pending", "user_confirmed", "user_declared") else None
    if field == "provenance":
        return value  # IDs são sensíveis a maiúsculas.
    raise ValueError(field)


def validate_record(record):
    """Baseline de estrutura local v1; não é validador FHIR nem consulta a origem."""
    errors = []
    if not isinstance(record, dict):
        return ["Registo deve ser um objeto."]
    for field, cell in record.items():
        if field not in (*FIELDS, "processedAt"):
            errors.append(f"Campo não suportado: {field}")
            continue
        if not isinstance(cell, dict) or cell.get("state") not in ("known", "unknown"):
            errors.append(f"{field}: estado inválido")
            continue
        if cell["state"] == "unknown":
            if cell.get("value") is not None:
                errors.append(f"{field}: desconhecido com valor")
        elif field == "processedAt":
            try:
                stamp = datetime.fromisoformat(cell.get("value", "").replace("Z", "+00:00"))
                if stamp.tzinfo is None:
                    raise ValueError()
            except (ValueError, TypeError, AttributeError):
                errors.append("processedAt: instante com fuso obrigatório")
        elif canonical(field, cell.get("value"), record) is None:
            errors.append(f"{field}: valor não suportado")
    # Campos opcionais no contrato de transporte: ausência é válida na estrutura,
    # mas pode representar uma perda quando comparada com a origem.
    return errors


def finding(field, source, destination, state, reason, evidence):
    return {"field": field, "expected": deepcopy(source), "received": deepcopy(destination),
            "state": state, "severity": "critical" if state in ("altered", "omitted") else
            "review" if state in ("review", "unknown_source") else "info",
            "reason": reason, "evidence": deepcopy(evidence), "rule": f"{RULE_VERSION}/{field}/{state}"}


def evidence_limit(field, cell, ref, record):
    """Gramática do ensaio: campo: texto, ou value: número unidade."""
    if not isinstance(ref, dict) or not isinstance(ref.get("excerpt"), str):
        return "Prova ausente: falta um excerto para este campo."
    if cell.get("state") == "absent":
        return None  # A ausência na origem continua sempre por rever.
    if type(ref.get("line")) is not int or ref["line"] < 1:
        return "Prova insuficiente: linha não identificada."
    label, separator, payload = ref["excerpt"].partition(":")
    payload = payload.strip()
    joint = re.fullmatch(r"([+-]?\d+(?:[.,]\d+)?)\s+([^\s:;|]+)", payload)
    parameter = canonical("parameter", record.get("parameter", {}).get("value"), record)
    units = PARAMETERS.get(parameter, {}).get("units", ())
    if separator and label == "value" and joint and joint.group(2) in units and field in ("value", "unit"):
        token = joint.group(1 if field == "value" else 2)
    elif separator and label == field:
        token = payload
    else:
        return "Prova insuficiente: o excerto não identifica este campo."
    expected = cell.get("value") if cell.get("state") == "known" else "[DESCONHECIDO]"
    if token == expected:
        return None
    if field == "value":
        actual = canonical(field, token, {})
        if actual is not None and actual == canonical(field, expected, {}):
            return None
    return "Prova contraditória: o conteúdo atribuído ao campo difere da origem estruturada."


def compare(source, destination, evidence, location_errors=None):
    findings = []
    for field in FIELDS:
        left, right = source.get(field, ABSENT), destination.get(field, ABSENT)
        ls, rs = left.get("state"), right.get("state")
        ref = evidence.get(field)
        limit = (location_errors or {}).get(field) or evidence_limit(field, left, ref, source)
        if limit:
            state, reason = "review", limit
        elif ls != "known":
            state, reason = "unknown_source", "A origem não confirma este campo; não declarar equivalência nem inventar o valor."
        elif rs == "absent":
            state, reason = "omitted", "Campo conhecido na origem e ausente no destino."
        elif rs == "unknown":
            state, reason = "omitted", "Campo conhecido na origem passou a desconhecido no destino."
        elif rs != "known":
            state, reason = "review", "Estado do destino não reconhecido."
        else:
            a, b = canonical(field, left.get("value"), source), canonical(field, right.get("value"), destination)
            if a is None or b is None:
                state, reason = "review", "Representação não suportada: preservar e pedir revisão."
            elif a == b:
                state, reason = "equivalent", "Igualdade ou equivalência lexical explícita, sem conversão de unidades."
            else:
                state, reason = "altered", "Campo recebido diferente da origem; não são inferidas conversões nem equivalência clínica."
                if field == "collectionDate" and b == canonical("reportDate", source.get("reportDate", {}).get("value"), source):
                    reason = "A data recebida na colheita coincide com a emissão da origem: possível troca de datas."
        findings.append(finding(field, left, right, state, reason, evidence.get(field)))
    outcome = "loss" if any(f["severity"] == "critical" for f in findings) else \
              "ambiguous" if any(f["severity"] == "review" for f in findings) else "equivalent"
    return {"ruleVersion": RULE_VERSION, "outcome": outcome, "findings": findings,
            "requiresReview": any(f["severity"] == "review" for f in findings),
            "source": deepcopy(source), "destination": deepcopy(destination),
            "processingNote": "processedAt é transporte técnico; não substitui colheita nem emissão."}


def simple_compare(source, destination):
    """Baseline honesta: igualdade literal com ausência distinta de desconhecido.

    Detecta alterações/omissões de campos. Igualdade de dois desconhecidos é
    aceita como igualdade de transporte; não avalia suficiência da evidência.
    """
    differences = [field for field in FIELDS if source.get(field, ABSENT) != destination.get(field, ABSENT)]
    return {"outcome": "loss" if differences else "equivalent", "differences": differences}
