"""One local SQLite database, atomic snapshots per demo profile. No production identity."""
import base64
import hashlib
import json
import math
import os
import re
import sqlite3
from .laboratory import PARAMETERS as LAB_PARAMETERS
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from fastapi import HTTPException

ROOT = Path(__file__).resolve().parents[3]
PARAMETERS = {"glucose","ldl","creatinine","hemoglobin","hba1c","systolic","diastolic","heart_rate","spo2"}
PARAMETERS.update(LAB_PARAMETERS)
STATES = {"user_declared","user_confirmed","professional_verified","extracted_pending"}

def timestamp(value):
    if not isinstance(value,str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})",value):
        raise ValueError("Data/hora inválida ou sem fuso.")
    datetime.fromisoformat(value.replace("Z","+00:00"))

def text(value):
    return isinstance(value,str) and bool(value.strip())

def validate(owner,data):
    if not isinstance(data,dict) or data.get("schemaVersion")!=1 or not isinstance(data.get("documents"),list) or not isinstance(data.get("results"),list):
        raise ValueError("Estrutura de dados inválida.")
    if len(data["documents"])>200 or len(data["results"])>5000:
        raise ValueError("Limite de demonstração excedido.")
    for collection in (data["documents"],data["results"]):
        ids=set()
        for item in collection:
            if not isinstance(item,dict) or item.get("ownerId")!=owner or item.get("synthetic") is not True or not text(item.get("id")) or item["id"] in ids:
                raise ValueError("Perfil, identificador ou marcação fictícia inválida.")
            ids.add(item["id"])
    docs={d["id"]:d for d in data["documents"]}
    hashes=set()
    for d in docs.values():
        if not (d.get("laboratory") is None or text(d.get("laboratory"))) or not text(d.get("title")): raise ValueError("Documento sem título ou origem inválida.")
        if d.get("issuedAt") is not None:timestamp(d["issuedAt"])
        timestamp(d.get("importedAt"))
        original=d.get("original",{})
        if not all(text(original.get(k)) for k in ("text","fileName","mediaType")): raise ValueError("Original em falta.")
        if "dataUrl" in original:
            url=original["dataUrl"]
            media=original.get('mediaType')
            if media not in {'application/pdf','image/png','image/jpeg'} or not isinstance(url,str) or len(url)>2900000 or not url.startswith('data:'+media+';base64,'): raise ValueError("Original inválido.")
            try: raw=base64.b64decode(url.split(",",1)[1],validate=True)
            except Exception as exc: raise ValueError("Original PDF inválido.") from exc
            signature={'application/pdf':b'%PDF-','image/png':b'\x89PNG\r\n\x1a\n','image/jpeg':b'\xff\xd8\xff'}[media]
            if not raw.startswith(signature) or len(raw)>2*1024*1024: raise ValueError("Original inválido.")
            if d.get("sha256")!=hashlib.sha256(raw).hexdigest(): raise ValueError("Hash não corresponde ao PDF original.")
            # Manual entry must not bypass the same document/resource limits as inference.
            from .hybrid import open_source
            with open_source(raw,media):pass
        if d.get("sha256"):
            if d["sha256"] in hashes: raise ValueError("Documento repetido.")
            hashes.add(d["sha256"])
    for r in data["results"]:
        if r.get("parameter") not in PARAMETERS or r.get("status") not in STATES or not isinstance(r.get("unit"),str):
            raise ValueError("Parâmetro, unidade ou confirmação inválida.")
        value=r.get("value")
        if value is not None and (isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value)):
            raise ValueError("Valor inválido.")
        if r.get("measuredAt") is not None: timestamp(r["measuredAt"])
        if r.get("source")=="manual":
            if r.get("documentId") is not None or not text(r.get("sessionId")) or r["status"]!="user_declared": raise ValueError("Origem manual inválida.")
        elif r.get("documentId") not in docs:
            raise ValueError("Resultado sem documento do mesmo perfil.")
        for key in ("method","context","referenceText"):
            if r.get(key) is not None and not isinstance(r[key],str): raise ValueError("Metadados inválidos.")
        evidence=r.get('evidence')
        if evidence is not None:
            if not isinstance(evidence,dict):raise ValueError('Evidência inválida.')
            page=evidence.get('page')
            if page is not None and (isinstance(page,bool) or not isinstance(page,int) or page<1):raise ValueError('Página inválida.')
            if any(not isinstance(evidence.get(k),str) for k in ('excerpt','extractedValue','extractedUnit')):raise ValueError('Evidência inválida.')
    return data

def seed(owner):
    data=json.loads((ROOT/"data/synthetic/clinical.json").read_text(encoding="utf-8-sig"))
    data["documents"]=[d for d in data["documents"] if d["ownerId"]==owner]
    data["results"]=[r for r in data["results"] if r["ownerId"]==owner]
    legacy=json.loads((ROOT/"data/synthetic/observations.json").read_text(encoding="utf-8-sig"))
    for row in legacy:
        if row["ownerId"]==owner:
            data["results"].append(dict(id=row["id"],ownerId=owner,synthetic=True,parameter="systolic" if row["parameter"]=="systolic_pressure" else "diastolic",
                value=row["value"],unit=row["unit"],measuredAt=row["measuredAt"],documentId=None,source="manual",sessionId=row["sessionId"],method="registo manual",context="domiciliário",referenceText=None,status="user_declared"))
    return validate(owner,data)

@contextmanager
def connection():
    path=Path(os.environ.get("PULSO_DB_PATH",str(ROOT/".local/pulso.sqlite3")))
    path.parent.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(path,timeout=10)
    try:
        db.execute("CREATE TABLE IF NOT EXISTS profiles(owner TEXT PRIMARY KEY, payload TEXT NOT NULL, changed INTEGER NOT NULL DEFAULT 0, migrated INTEGER NOT NULL DEFAULT 0)")
        db.commit()
        db.execute("BEGIN IMMEDIATE")
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally: db.close()

def load_in(db,owner):
    row=db.execute("SELECT payload FROM profiles WHERE owner=?",(owner,)).fetchone()
    if row: return json.loads(row[0])
    data=seed(owner)
    db.execute("INSERT INTO profiles(owner,payload) VALUES (?,?)",(owner,json.dumps(data,ensure_ascii=False)))
    return data

def load(owner):
    with connection() as db: return load_in(db,owner)

def mutate(owner,operation):
    try:
        with connection() as db:
            data=load_in(db,owner)
            result=operation(data)
            validate(owner,data)
            db.execute("UPDATE profiles SET payload=?,changed=1 WHERE owner=?",(json.dumps(data,ensure_ascii=False),owner))
            return result
    except ValueError as exc: raise HTTPException(422,str(exc)) from exc
    except sqlite3.Error as exc: raise HTTPException(503,"Não foi possível guardar na base local. Os campos não foram descartados; tenta novamente.") from exc

def migrate(owner,data):
    try:
        validate(owner,data)
        with connection() as db:
            load_in(db,owner)
            changed,migrated=db.execute("SELECT changed,migrated FROM profiles WHERE owner=?",(owner,)).fetchone()
            if migrated: return {"migrated":True}
            if changed: raise HTTPException(409,"Já existem alterações na base local. A cópia antiga do navegador foi preservada; é necessária reconciliação antes de migrar.")
            db.execute("UPDATE profiles SET payload=?,changed=1,migrated=1 WHERE owner=?",(json.dumps(data,ensure_ascii=False),owner))
            return {"migrated":True}
    except ValueError as exc: raise HTTPException(422,str(exc)) from exc

def confirm(owner,body):
    doc=body.get("document");rows=body.get("results")
    if not isinstance(doc,dict) or not isinstance(rows,list) or not rows or any(r.get("status")!="user_confirmed" or r.get("documentId")!=doc.get("id") for r in rows):
        raise HTTPException(422,"Confirmação explícita inválida.")
    def operation(data):
        if any(d.get("sha256") and d.get("sha256")==doc.get("sha256") for d in data["documents"]):
            existing=next(d for d in data["documents"] if d.get("sha256")==doc.get("sha256"))
            if existing["id"]==doc.get("id"):
                old_rows=[r for r in data["results"] if r.get("documentId")==existing["id"]]
                if old_rows==rows and all(existing.get(k)==v for k,v in doc.items() if k!='importedAt'):
                    return {"saved":True}
                raise HTTPException(409,"O exame já foi guardado com outros dados. Consulta o Histórico.")
            raise HTTPException(409,"Este PDF já está guardado neste perfil.")
        data["documents"].append(doc);data["results"].extend(rows)
        return {"saved":True}
    return mutate(owner,operation)

def pressure(owner,body):
    sid=body.get("id");date=body.get("date")
    if not text(sid): raise HTTPException(422,"Identificador da leitura em falta.")
    try: timestamp(date)
    except (ValueError,TypeError) as exc: raise HTTPException(422,"Data/hora inválida.") from exc
    fields=[("systolic",body.get("systolic")),("diastolic",body.get("diastolic"))]
    if body.get("heartRate"): fields.append(("heart_rate",body["heartRate"]))
    if any(not isinstance(v,str) or not re.fullmatch(r"\d{1,3}",v) or not 1<=int(v)<=999 for _,v in fields):
        raise HTTPException(422,"Preenche valores inteiros de 1 a 999; pulsação é opcional.")
    def operation(data):
        if any(r.get("sessionId")==sid for r in data["results"]): return {"saved":True}
        for parameter,value in fields:
            data["results"].append(dict(id=sid+"-"+parameter,ownerId=owner,synthetic=True,parameter=parameter,value=int(value),
                unit="bpm" if parameter=="heart_rate" else "mmHg",measuredAt=date,documentId=None,source="manual",sessionId=sid,
                method="registo manual",context="domiciliário",referenceText=None,status="user_declared",createdAt=datetime.now(timezone.utc).isoformat(timespec="seconds")))
        return {"saved":True}
    return mutate(owner,operation)

def manage(owner,kind,item_id,patch=None):
    def operation(data):
        collection=data["documents" if kind=="document" else "results"]
        item=next((x for x in collection if x["id"]==item_id),None)
        if item is None: raise HTTPException(404,"Registo não encontrado neste perfil.")
        if patch is None:
            collection.remove(item)
            if kind=="document": data["results"]=[r for r in data["results"] if r.get("documentId")!=item_id]
        else:
            allowed={"title","laboratory"} if kind=="document" else {"value","unit","measuredAt","method","context","referenceText"}
            if not patch or set(patch)-allowed: raise HTTPException(422,"Campos não editáveis.")
            previous={key:item.get(key) for key in allowed}
            item.update(patch)
            item.setdefault("previousVersions",[]).append({"changedAt":datetime.now(timezone.utc).isoformat(timespec="seconds"),"fields":previous})
        return {"saved":True}
    return mutate(owner,operation)

def reset(owner):
    with connection() as db:
        load_in(db,owner)
        db.execute("UPDATE profiles SET payload=?,changed=1,migrated=1 WHERE owner=?",(json.dumps(seed(owner),ensure_ascii=False),owner))
    return {"saved":True}
