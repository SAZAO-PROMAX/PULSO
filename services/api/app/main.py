from typing import Literal
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import asyncio
from .hybrid import MAX_UPLOAD, MIMES
from .local_ollama import LocalOllama, EngineError
from .data_routes import router as data_router
from .data_routes import scope
from .extraction_jobs import queue,processing_slot,process_document,validate_source
from .accounts import router as accounts_router
import os

app = FastAPI(title="PULSO — experimental", version="0.6.0")
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get('PULSO_WEB_ORIGINS','http://localhost:8081,http://127.0.0.1:8081,http://127.0.0.1:8765').split(','), allow_credentials=True,allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Content-Type", "X-Pulso-Demo", "X-Pulso-Profile", "If-Match", "X-Pulso-CSRF"])
app.include_router(data_router)
app.include_router(accounts_router)

@app.middleware('http')
async def private_responses(request,call_next):
    response=await call_next(request)
    if request.url.path.startswith(('/auth/','/demo/profiles/','/demo/extractions')):
        response.headers['Cache-Control']='no-store';response.headers['X-Content-Type-Options']='nosniff'
    return response
extraction_lock=processing_slot

@app.get('/demo/extraction/status')
def extraction_status():
    try:return LocalOllama().status()
    except EngineError:return {"available":False,"enabled":False,"model":"qwen3-vl:4b","reason":"invalid_config"}

@app.get('/demo/sample.pdf')
def sample_pdf():
    return FileResponse(Path(__file__).resolve().parents[3] / 'data/synthetic/laboratorio-demo.pdf', media_type='application/pdf', filename='laboratorio-demo.pdf')

async def upload(request):
    payload=bytearray()
    try:
        async with asyncio.timeout(15):
            async for chunk in request.stream():
                payload.extend(chunk)
                if len(payload)>MAX_UPLOAD:raise HTTPException(413,'Limite de 2 MB excedido.')
    except TimeoutError:raise HTTPException(408,'O envio excedeu o tempo permitido. Tenta novamente.')
    return bytes(payload)

@app.post('/demo/extract')
async def extract(request: Request):
    mime=request.headers.get('content-type')
    if request.headers.get('x-pulso-demo') != 'synthetic-only' or mime not in MIMES:
        raise HTTPException(400, 'Importação apenas para PDF, PNG ou JPEG inteiramente fictícios.')
    if extraction_lock.locked():raise HTTPException(429,'Já existe uma extração em curso. Aguarda e tenta novamente.')
    # Reserve before receiving: concurrent streamed uploads cannot create an
    # unbounded hidden wait list behind this compatibility endpoint.
    async with extraction_lock:return await process_document(await upload(request),mime)

@app.post('/demo/extractions',status_code=202)
async def submit_extraction(request:Request):
    owner=request.headers.get('x-pulso-profile');scope(request,owner)
    mime=request.headers.get('content-type')
    if request.headers.get('x-pulso-demo')!='synthetic-only' or mime not in MIMES:raise HTTPException(400,'Seleciona apenas um documento inteiramente fictício num formato suportado.')
    queue.cleanup()
    if queue.receiving+sum(j['state'] in {'queued','processing'} for j in queue.jobs.values())>=queue.capacity:
        raise HTTPException(429,'A fila de leitura está cheia. Aguarda alguns segundos e tenta novamente.',headers={'Retry-After':'5'})
    queue.receiving+=1
    try:
        payload=await upload(request)
        await asyncio.to_thread(validate_source,payload,mime)
        return queue.submit(owner,payload,mime)
    finally:queue.receiving-=1

@app.get('/demo/extractions/{job_id}')
async def extraction_job(job_id:str,request:Request):
    owner=request.headers.get('x-pulso-profile');scope(request,owner)
    return queue.snapshot(queue.get(owner,job_id))

@app.delete('/demo/extractions/{job_id}')
async def cancel_extraction(job_id:str,request:Request):
    owner=request.headers.get('x-pulso-profile');scope(request,owner)
    return queue.cancel(owner,job_id)

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    mode: Literal["synthetic-demo"] = "synthetic-demo"

@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()
