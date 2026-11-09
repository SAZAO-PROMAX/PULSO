"""Bounded per-page extraction, deterministic first; proposals never write to the database."""
import base64
import hashlib
import json
import re
import sys
import time
from datetime import datetime, timezone
import pymupdf
from .pdf_parser import parse_pdf
from .laboratory import parameter_id, normalized_unit, numeric, iso_date, norm
from .local_ollama import LocalOllama, EngineError

MAX_UPLOAD=2*1024*1024
MAX_PAGES=3
MAX_TEXT=30000
MIMES={"application/pdf":"pdf","image/png":"png","image/jpeg":"jpeg"}
VERSION="pulso-hybrid-0.4-d1"

def row_supported(raw,excerpt):
    if not raw.original_parameter or not raw.original_value or not raw.unit:return False
    # Only the result column immediately following the analyte is accepted, not a reference column.
    name=re.escape(raw.original_parameter.strip())
    value=re.escape(raw.original_value.strip())
    unit=re.escape(raw.unit.strip())
    return bool(re.match(r"^\s*"+name+r"(?:\s*\|\s*|\s+)"+value+r"(?:\s*\|\s*|\s+)"+unit+r"(?:\s|\||$)",excerpt,re.I))

def date_supported(raw,text,excerpt=''):
    result=iso_date(raw)
    if not result:return None
    def tokens(source):
        return {iso_date(match.group()) for match in re.finditer(r"(?<![0-9])(?:[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}/[0-9]{2}/[0-9]{4})(?![0-9])",source)}-{None}
    dates=tokens(text)
    if result not in dates:return None
    # A row-local date or one unambiguous date in the source; never borrow another row's date.
    if dates=={result} or (excerpt and excerpt in text and text.count(excerpt)==1 and result in tokens(excerpt)):return result
    return None

def validated_candidate(raw,page,text,method,metrics):
    issues=[];parameter=parameter_id(raw.original_parameter)
    if not parameter:issues.append("Parâmetro não identificado no catálogo: associar ou excluir.")
    unit=normalized_unit(parameter,raw.unit)
    if not unit:issues.append("Unidade ausente ou não reconhecida: rever sem conversão automática.")
    excerpt=raw.excerpt or ""
    exact=bool(text and excerpt and len(excerpt)<=1500 and excerpt in text)
    backed=exact and len(excerpt)<=350 and excerpt.count("\n")<=2 and row_supported(raw,excerpt) and text.count(excerpt)==1
    verification="text_verified" if backed else "visual_unverified" if method=="ollama_vision" else "source_unverified"
    if not backed:issues.append("Valor/associação não verificável por texto independente. Conferir no original.")
    value=numeric(raw.original_value)
    if value is None:issues.append("Valor ausente ou decimal ambíguo.")
    reference=raw.reference_interval
    if method!="ollama_vision" and reference and (not exact or reference not in excerpt):
        reference=None;issues.append("Referência sem evidência exata na linha.")
    def source_field(value,label,source=None):
        if value is None:return None
        if method=="ollama_vision":return value
        if re.search(r"(?<!\w)"+re.escape(value)+r"(?!\w)",text if source is None else source,re.I):return value
        issues.append(label+" sem evidência textual.");return None
    collection=iso_date(raw.collection_date) if method=="ollama_vision" else date_supported(raw.collection_date,text,excerpt)
    report=iso_date(raw.report_date) if method=="ollama_vision" else date_supported(raw.report_date,text,excerpt)
    if (raw.collection_date and not collection) or (raw.report_date and not report):issues.append("Data ausente, inválida ou sem evidência.")
    date=collection or report
    if not date:issues.append("Data por preencher na revisão.")
    region=None
    if backed and page is not None:
        boxes=page.search_for(excerpt)
        if len(boxes)==1:
            b=boxes[0];region={"x0":b.x0,"y0":b.y0,"x1":b.x1,"y1":b.y1,"units":"pdf-points"}
    return {"parameter":parameter,"originalParameter":raw.original_parameter,"value":raw.original_value or "",
        "numericValue":value if backed else None,"unit":raw.unit or "","normalizedUnit":unit,
        "referenceText":reference,"method":source_field(raw.method,"Método",excerpt if exact else ''),"context":source_field(raw.specimen,"Amostra",excerpt if exact else ''),
        "sourceFields":{"collectionDate":raw.collection_date,"reportDate":raw.report_date,"method":raw.method,"context":raw.specimen},
        "date":date,"collectionDate":collection,"reportDate":report,"dateKind":"collection" if collection else "report" if report else None,
        "laboratory":source_field(raw.laboratory,"Laboratório"),"page":page.number+1 if page is not None else 1,"excerpt":excerpt,
        "region":region,"verification":verification,"extractionMethod":method,"model":metrics.get("model"),
        "modelDigest":metrics.get("modelDigest"),"ollamaVersion":metrics.get("ollamaVersion"),"reviewState":"pending",
        "issues":issues}

def deterministic_candidate(row,result,page):
    from .local_ollama import RawResult
    raw=RawResult(original_parameter=row["excerpt"].split("|")[0].strip(),original_value=row["value"],unit=row["unit"],
        reference_interval=row["referenceText"],report_date=result["date"],laboratory=result["laboratory"],
        method=row["method"],specimen=row["context"],excerpt=row["excerpt"])
    # The known format validates its document-level date/lab; keep its established parameter.
    c=validated_candidate(raw,page,page.get_text(),"deterministic",{})
    c.update(parameter=row["parameter"],date=result["date"],reportDate=result["date"],dateKind="report",
             laboratory=result["laboratory"],issues=row["issues"],verification="text_verified",numericValue=numeric(row["value"]))
    c["page"]=row["page"]
    return c

def open_source(payload,mime):
    """Shared document gate for extraction AND manual confirmation; caller closes it."""
    if mime not in MIMES or len(payload)>MAX_UPLOAD:raise ValueError("Tipo não suportado ou documento maior que 2 MB.")
    if mime=="application/pdf" and not payload.startswith(b"%PDF-"):raise ValueError("PDF inválido.")
    if mime=="image/png" and not payload.startswith(b"\x89PNG\r\n\x1a\n"):raise ValueError("PNG inválido.")
    if mime=="image/jpeg" and not payload.startswith(b"\xff\xd8\xff"):raise ValueError("JPEG inválido.")
    try:
        source=pymupdf.open(stream=payload,filetype=MIMES[mime])
        if mime!="application/pdf":
            profiles=source[0].get_image_info()
            if not profiles or any(p['width']*p['height']>12000000 for p in profiles):
                source.close();raise ValueError("Imagem excede 12 megapíxeis.")
            converted=source.convert_to_pdf();source.close();source=pymupdf.open(stream=converted,filetype="pdf")
    except Exception as exc:raise ValueError("Não foi possível abrir o documento.") from exc
    try:
        if source.needs_pass or not 1<=len(source)<=MAX_PAGES:raise ValueError("Documento cifrado ou com mais de 3 páginas.")
        for page in source:
            if not (0<page.rect.width<=6000 and 0<page.rect.height<=6000):raise ValueError("Dimensões de página não suportadas.")
            if any(p['width']*p['height']>12000000 for p in page.get_image_info()):raise ValueError('Imagem incorporada excede 12 megapíxeis.')
        if sum(len(p.get_text()) for p in source)>MAX_TEXT:raise ValueError('Texto excede o limite de processamento.')
        return source
    except Exception:
        source.close();raise

def extract_document(payload,mime,engine=None):
    source=open_source(payload,mime)
    with source:
        texts=[p.get_text(sort=True) for p in source]
        known=None
        if mime=="application/pdf":
            try:known=parse_pdf(payload)
            except ValueError:pass
        rows=[];pages=[];warnings=[];metrics=[];started=time.monotonic()
        for index,page in enumerate(source):
            text=texts[index]
            deterministic=[r for r in known["candidates"] if r["page"]==index+1] if known else []
            blocks=[{"bbox":list(b[:4]),"text":b[4]} for b in page.get_text("blocks") if len(b)>6 and b[6]==0]
            # Image regions alongside digital results are treated as mixed, never silently skipped.
            mixed=bool(text.strip() and any(b[6]==1 and (b[2]-b[0])*(b[3]-b[1])>page.rect.get_area()*0.15 for b in page.get_text("blocks")))
            if deterministic and not mixed:
                rows.extend(deterministic_candidate(r,known,page) for r in deterministic)
                pages.append({"page":index+1,"method":"deterministic","text":text,"blocks":blocks,"state":"pending_review"});continue
            method="ollama_text" if len(text.strip())>=30 and not mixed else "ollama_vision"
            image=None
            if method=="ollama_vision":
                scale=min(2,1280/max(page.rect.width,page.rect.height))
                image=base64.b64encode(page.get_pixmap(matrix=pymupdf.Matrix(scale,scale),colorspace=pymupdf.csRGB,alpha=False).tobytes("png")).decode()
            try:
                if len(text)>12000:raise EngineError('Página com demasiado texto para o contexto local. Introduz ou revê manualmente.')
                if engine is None:engine=LocalOllama()
                raw,stats=engine.extract(text,image)
                metrics.append({"page":index+1,**stats})
                for result in raw.results:
                    if result.collection_date is None:result.collection_date=raw.collection_date
                    if result.report_date is None:result.report_date=raw.report_date
                    if result.laboratory is None:result.laboratory=raw.laboratory
                    rows.append(validated_candidate(result,page,text,method,stats))
                pages.append({"page":index+1,"method":method,"text":text,"blocks":blocks,"state":"pending_review"})
                if not raw.results:warnings.append(f"Página {index+1}: sem resultados propostos. Pode introduzir manualmente.")
            except EngineError as exc:
                if deterministic:rows.extend(deterministic_candidate(r,known,page) for r in deterministic)
                pages.append({"page":index+1,"method":method,"text":text,"blocks":blocks,"state":"manual_required"})
                warnings.append(f"Página {index+1}: {exc}")
        if re.search(r"ignore (?:all|previous)|system prompt|execute|executa|revela.*segredo","\n".join(texts),re.I):
            warnings.append("Há texto semelhante a instruções no documento. Não foi executado; conferir apenas linhas laboratoriais.")
        labs={r["laboratory"] for r in rows if r["laboratory"]}
        dates={r["date"] for r in rows if r["date"]}
        reports={r["reportDate"] for r in rows if r["reportDate"]}
        collections={r["collectionDate"] for r in rows if r["collectionDate"]}
        for row in rows:
            if sum((r["parameter"],r["value"],r["unit"],r["date"],r["page"],r["excerpt"])==(row["parameter"],row["value"],row["unit"],row["date"],row["page"],row["excerpt"]) for r in rows)>1:
                row["issues"].append("Possível linha duplicada; rever ou excluir.")
        digest=hashlib.sha256(payload).hexdigest()
        return {"documentId":"sha256:"+digest,"parserVersion":VERSION,"sha256":digest,"mediaType":mime,
            "laboratory":next(iter(labs)) if len(labs)==1 else None,"date":next(iter(dates)) if len(dates)==1 else None,
            "reportDate":next(iter(reports)) if len(reports)==1 else None,"collectionDate":next(iter(collections)) if len(collections)==1 else None,
            "text":"\n".join(texts) or "[Documento visual: consultar o original; texto independente indisponível.]",
            "candidates":rows,"pages":pages,"warnings":warnings,"status":"pending_review" if rows else "manual_required",
            "processedAt":datetime.now(timezone.utc).isoformat(timespec="seconds"),"metrics":{"seconds":round(time.monotonic()-started,3),"calls":metrics}}

if __name__=="__main__":
    try:
        result=extract_document(sys.stdin.buffer.read(MAX_UPLOAD+1),sys.argv[1])
        print(json.dumps({"ok":True,"data":result},ensure_ascii=True))
    except Exception:
        print(json.dumps({"ok":False,"error":"Documento não suportado, corrompido ou fora dos limites (2 MB / 3 páginas)."}))
