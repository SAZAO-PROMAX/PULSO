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
from .pdf_parser import MAX_BYTES
from .data_routes import router as data_router
import os

app = FastAPI(title="PULSO — demonstração", version="0.0.1")
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get('PULSO_WEB_ORIGINS','http://localhost:8081,http://127.0.0.1:8081,http://127.0.0.1:8765').split(','), allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Content-Type", "X-Pulso-Demo", "X-Pulso-Profile"])
app.include_router(data_router)

@app.get('/demo/sample.pdf')
def sample_pdf():
    return FileResponse(Path(__file__).resolve().parents[3] / 'data/synthetic/laboratorio-demo.pdf', media_type='application/pdf', filename='laboratorio-demo.pdf')

@app.post('/demo/extract')
async def extract(request: Request):
    if request.headers.get('x-pulso-demo') != 'synthetic-only' or request.headers.get('content-type') != 'application/pdf':
        raise HTTPException(400, 'Importação apenas para PDFs inteiramente fictícios.')
    payload = bytearray()
    async for chunk in request.stream():
        payload.extend(chunk)
        if len(payload) > MAX_BYTES:
            raise HTTPException(413, 'Limite de 512 KB excedido.')
    # Isolated parser with a hard wall-clock limit. No filenames supplied by client.
    try:
        # Windows reload uses a Selector loop without asyncio subprocess support.
        completed = await asyncio.to_thread(subprocess.run,
            [sys.executable, '-m', 'services.api.app.pdf_parser'],
            input=bytes(payload), capture_output=True, timeout=8,
            cwd=Path(__file__).resolve().parents[3])
        parsed = json.loads(completed.stdout)
    except (subprocess.TimeoutExpired, ValueError, OSError):
        raise HTTPException(422, 'Não foi possível processar o PDF dentro dos limites.')
    if not parsed.get('ok'):
        raise HTTPException(422, parsed.get('error', 'PDF não suportado.'))
    return parsed['data']

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    mode: Literal["synthetic-demo"] = "synthetic-demo"

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()
