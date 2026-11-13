"""Validador estrutural existente, sem FHIR: Pydantic já fixado pela aplicação.

Contrato nativo fidelity-record-1: células tipadas e campos opcionais. A biblioteca
valida a estrutura, sem regras PULSO e sem acesso ao outro lado do par ou oráculo.
"""
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, StrictStr, ValidationError
import pydantic


class Known(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: Literal["known"]
    value: StrictStr


class Unknown(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: Literal["unknown"]
    value: None


Cell = Annotated[Known | Unknown, Field(discriminator="state")]


class Record(BaseModel):
    model_config = ConfigDict(extra="forbid")
    parameter: Cell | None = None
    value: Cell | None = None
    unit: Cell | None = None
    collectionDate: Cell | None = None
    reportDate: Cell | None = None
    method: Cell | None = None
    context: Cell | None = None
    provenance: Cell | None = None
    confirmation: Cell | None = None
    processedAt: Cell | None = None


def validate(record):
    # Explicit null record fields are not the same as absent fields in this contract.
    if any(value is None for value in record.values()):
        return False
    try:
        Record.model_validate(record, strict=True)
        return True
    except ValidationError:
        return False


def metadata():
    return {"tool": "Pydantic", "version": pydantic.__version__, "contract": "fidelity-record-1",
            "fhirVersion": None, "profile": None,
            "limits": "Apenas estrutura de células; campos clínicos são strings de transporte, sem semântica de origem."}
