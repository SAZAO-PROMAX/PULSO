from pathlib import Path
import pymupdf
import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app.pdf_parser import parse_pdf, MAX_BYTES
from scripts.create_sample_pdf import LINES

def pdf(lines=LINES, pages=1):
    doc = pymupdf.open()
    for _ in range(pages):
        page = doc.new_page()
        page.insert_text((45, 55), "\n".join(lines), fontsize=10)
    payload = doc.tobytes()
    doc.close()
    return payload

def test_known_pdf_exact_values_units_date_and_evidence():
    parsed = parse_pdf(pdf())
    assert parsed["laboratory"] == "Laboratorio Demo Pulso"
    assert parsed["date"] == "2026-11-07"
    assert [(r["parameter"], r["value"], r["unit"]) for r in parsed["candidates"]] == [
        ("glucose", "98,5", "mg/dL"), ("ldl", "106", "mg/dL"),
        ("creatinine", "0,92", "mg/dL"), ("hemoglobin", "13,7", "g/dL"), ("hba1c", "5,4", "%")]
    assert all(r["page"] == 1 and r["excerpt"] and not r["issues"] for r in parsed["candidates"])
    assert len(parsed["sha256"]) == 64

def test_missing_ambiguous_and_unsupported_unit_are_pending_not_invented():
    lines = LINES[:5] + ["Glicose | ? | xyz | | hexoquinase | plasma"]
    row = parse_pdf(pdf(lines))["candidates"][0]
    assert row["value"] == "?" and row["unit"] == "xyz" and row["referenceText"] is None
    assert len(row["issues"]) == 2

@pytest.mark.parametrize("lines", [
    ["PULSO SYNTHETIC LAB V1", "Laboratorio: Laboratorio Demo X", "Glicose | 90 | mg/dL | | m | plasma"],
    ["PULSO SYNTHETIC LAB V1", "Laboratorio: Laboratorio Demo X", "Data: 2026-02-30", "Glicose | 90 | mg/dL | | m | plasma"],
    ["Documento real ou layout desconhecido"],
])
def test_rejects_missing_date_invalid_date_or_unknown_layout(lines):
    with pytest.raises(ValueError):
        parse_pdf(pdf(lines))

def test_duplicates_are_flagged():
    parsed = parse_pdf(pdf(LINES + [LINES[5]]))
    assert sum("Parâmetro repetido" in " ".join(r["issues"]) for r in parsed["candidates"]) == 2

def test_rejects_invalid_large_encrypted_and_scanned_pdfs():
    for payload in [b"not pdf", b"%PDF-" + b"0" * MAX_BYTES, pdf(pages=4), pdf([])]:
        with pytest.raises(ValueError):
            parse_pdf(payload)
    doc = pymupdf.open(stream=pdf(), filetype="pdf")
    encrypted = doc.tobytes(encryption=pymupdf.PDF_ENCRYPT_AES_256, user_pw="test", owner_pw="test")
    with pytest.raises(ValueError):
        parse_pdf(encrypted)

def test_api_rejects_without_optin_or_wrong_content_and_parses_known_pdf():
    client = TestClient(app)
    assert client.post("/demo/extract", content=pdf()).status_code == 400
    response = client.post("/demo/extract", content=pdf(), headers={"Content-Type":"application/pdf","X-Pulso-Demo":"synthetic-only"})
    assert response.status_code == 200
    assert len(response.json()["candidates"]) == 5
    assert client.post("/demo/extract", content=b"%PDF-"+b"0"*MAX_BYTES, headers={"Content-Type":"application/pdf","X-Pulso-Demo":"synthetic-only"}).status_code == 413
