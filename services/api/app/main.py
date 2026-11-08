from typing import Literal
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import asyncio
import json
import sys
import subprocess
from .hybrid import MAX_UPLOAD, MIMES
from .local_ollama import LocalOllama, EngineError
from .data_routes import router as data_router
import os

app = FastAPI(title="PULSO — demonstração", version="0.0.1")
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get('PULSO_WEB_ORIGINS','http://localhost:8081,http://127.0.0.1:8081,http://127.0.0.1:8765').split(','), allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Content-Type", "X-Pulso-Demo", "X-Pulso-Profile"])
app.include_router(data_router)
extraction_lock=asyncio.Semaphore(1)

@app.get('/demo/extraction/status')
def extraction_status():
    try:return LocalOllama().status()
    except EngineError:return {"available":False,"enabled":False,"model":"qwen3-vl:4b","reason":"invalid_config"}

@app.get('/demo/sample.pdf')
def sample_pdf():
    return FileResponse(Path(__file__).resolve().parents[3] / 'data/synthetic/laboratorio-demo.pdf', media_type='application/pdf', filename='laboratorio-demo.pdf')

@app.post('/demo/extract')
async def extract(request: Request):
    mime=request.headers.get('content-type')
    if request.headers.get('x-pulso-demo') != 'synthetic-only' or mime not in MIMES:
        raise HTTPException(400, 'Importação apenas para PDF, PNG ou JPEG inteiramente fictícios.')
    if extraction_lock.locked():raise HTTPException(429,'Já existe uma extração em curso. Aguarda e tenta novamente.')
    payload = bytearray()
    async for chunk in request.stream():
        payload.extend(chunk)
        if len(payload) > MAX_UPLOAD:
            raise HTTPException(413, 'Limite de 2 MB excedido.')
    # Isolated parser with a hard wall-clock limit. No filenames supplied by client.
    try:
        # Windows reload uses a Selector loop without asyncio subprocess support.
        async with extraction_lock:
            completed = await asyncio.to_thread(subprocess.run,
                [sys.executable, '-m', 'services.api.app.hybrid',mime],
                input=bytes(payload), capture_output=True, timeout=285,
                cwd=Path(__file__).resolve().parents[3])
        parsed = json.loads(completed.stdout)
    except (subprocess.TimeoutExpired, ValueError, OSError):
        raise HTTPException(422, 'Não foi possível processar o documento dentro dos limites.')
    if not parsed.get('ok'):
        raise HTTPException(422, parsed.get('error', 'Documento não suportado.'))
    return parsed['data']

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    mode: Literal["synthetic-demo"] = "synthetic-demo"

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()
