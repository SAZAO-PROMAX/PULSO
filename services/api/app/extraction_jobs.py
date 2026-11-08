"""Bounded, process-local queue. Restart discards pending work; no persistence here."""
import asyncio
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
import uuid
from fastapi import HTTPException
from .hybrid import open_source

processing_slot=asyncio.Semaphore(1)

async def process_document(payload,mime):
    try:
        completed=await asyncio.to_thread(subprocess.run,[sys.executable,'-m','services.api.app.hybrid',mime],
            input=payload,capture_output=True,timeout=285,cwd=Path(__file__).resolve().parents[3])
        parsed=json.loads(completed.stdout)
    except (subprocess.TimeoutExpired,ValueError,OSError):
        raise HTTPException(422,'Não foi possível processar o documento dentro dos limites.')
    if not parsed.get('ok'):raise HTTPException(422,parsed.get('error','Documento não suportado.'))
    return parsed['data']

def validate_source(payload,mime):
    try:
        with open_source(payload,mime):pass
    except Exception as exc:raise HTTPException(422,'Documento inválido ou fora dos limites de tamanho, páginas ou dimensões.') from exc

class ExtractionQueue:
    def __init__(self,processor=process_document,capacity=5,wait_seconds=60,retention=300,max_completed=20):
        self.processor=processor;self.capacity=capacity;self.wait_seconds=wait_seconds
        self.retention=retention;self.max_completed=max_completed;self.jobs={};self.task=None;self.receiving=0

    def cleanup(self):
        now=time.monotonic()
        for job in self.jobs.values():
            if job['state']=='queued' and now-job['created']>self.wait_seconds:
                job.update(state='error',error='O tempo de espera terminou. Tenta novamente.',payload=b'',finished=now)
        completed=sorted((j for j in self.jobs.values() if j['state'] not in {'queued','processing'}),key=lambda j:j.get('finished',j['created']))
        remove={j['id'] for j in completed if now-j.get('finished',j['created'])>self.retention}
        remove.update(j['id'] for j in completed[:max(0,len(completed)-self.max_completed)])
        for job_id in remove:self.jobs.pop(job_id,None)

    def submit(self,owner,payload,mime):
        self.cleanup();digest=hashlib.sha256(payload).hexdigest()
        duplicate=next((j for j in self.jobs.values() if j['owner']==owner and j['digest']==digest and j['mime']==mime and j['state'] in {'queued','processing','ready'}),None)
        if duplicate:return self.snapshot(duplicate)
        if sum(j['state'] in {'queued','processing'} for j in self.jobs.values())>=self.capacity:
            raise HTTPException(429,'A fila de leitura está cheia. Aguarda alguns segundos e tenta novamente.',headers={'Retry-After':'5'})
        job_id=uuid.uuid4().hex
        job=dict(id=job_id,owner=owner,digest=digest,mime=mime,payload=payload,state='queued',created=time.monotonic())
        self.jobs[job_id]=job
        if self.task is None or self.task.done():self.task=asyncio.create_task(self.run())
        return self.snapshot(job)

    def snapshot(self,job):
        pending=[j['id'] for j in self.jobs.values() if j['state']=='queued']
        return {k:job[k] for k in ('id','state','result','error') if k in job}|{'position':pending.index(job['id'])+1 if job['id'] in pending else None}

    def get(self,owner,job_id):
        self.cleanup();job=self.jobs.get(job_id)
        if not job or job['owner']!=owner:raise HTTPException(404,'Pedido indisponível. Pode ter expirado ou o servidor ter reiniciado. Nada foi guardado; podes repetir a importação.')
        return job

    def cancel(self,owner,job_id):
        job=self.get(owner,job_id)
        if job['state']!='queued':raise HTTPException(409,'O pedido já começou ou terminou. Só é possível cancelar pedidos em espera.')
        job.update(state='cancelled',payload=b'',finished=time.monotonic())
        return self.snapshot(job)

    async def run(self):
        while True:
            self.cleanup()
            job=next((j for j in self.jobs.values() if j['state']=='queued'),None)
            if job is None:return
            async with processing_slot:
                self.cleanup()
                if job['state']!='queued':continue
                job['state']='processing'
                try:job.update(result=await self.processor(job['payload'],job['mime']),state='ready')
                except asyncio.CancelledError:
                    job.update(state='error',error='O serviço de leitura foi interrompido. Nada foi guardado.');raise
                except HTTPException as exc:job.update(error=str(exc.detail),state='error')
                except Exception:job.update(error='A leitura não foi concluída. Tenta novamente ou introduz os dados manualmente.',state='error')
                finally:job.update(payload=b'',finished=time.monotonic())

queue=ExtractionQueue()
