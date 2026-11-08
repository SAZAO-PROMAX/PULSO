"""One known synthetic PDF layout for local integration tests."""
from pathlib import Path
import pymupdf

LINES = [
    "PULSO SYNTHETIC LAB V1",
    "Laboratorio: Laboratorio Demo Pulso",
    "Data: 2026-11-07",
    "Documento inteiramente ficticio - sem validade clinica.",
    "",
    "Parametro | Valor | Unidade | Referencia | Metodo | Amostra",
    "Glicose | 98,5 | mg/dL | 70-110 mg/dL | hexoquinase | plasma",
    "Colesterol LDL | 106 | mg/dL | exemplo ficticio | direto | soro",
    "Creatinina | 0,92 | mg/dL | 0,6-1,2 mg/dL | enzimatico | soro",
    "Hemoglobina | 13,7 | g/dL | 12-16 g/dL | fotometria | sangue total",
    "HbA1c | 5,4 | % | 4-6 % | HPLC | sangue total",
]
# The header is explanatory, not an analyte line.
LINES.remove("Parametro | Valor | Unidade | Referencia | Metodo | Amostra")
if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    (root / 'tmp').mkdir(exist_ok=True)
    target = root / "data/synthetic/laboratorio-demo.pdf"
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((45, 55), "\n".join(LINES), fontsize=10)
    doc.save(target)
    page.get_pixmap().save(root / "tmp/pdf-preview.png")
    print(target)
