"""Isolated loopback load journeys; no production code or database changes."""
import argparse
import asyncio
import base64
from collections import Counter
import ctypes
from ctypes import wintypes
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import random
import socket
import sqlite3
import subprocess
import sys
import time
import uuid

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def percentile(values, p):
    return sorted(values)[max(0, math.ceil(len(values) * p) - 1)] if values else None


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None


def safe_output(path):
    path = path.resolve()
    if not path.is_relative_to((ROOT / 'tmp').resolve()) or path.exists():
        raise ValueError('A pasta de saída tem de ser nova e estar dentro de tmp.')
    path.mkdir(parents=True)
    return path


def synthetic_pdf(path):
    fixture = (ROOT / path).resolve()
    if not fixture.is_relative_to((ROOT / 'data/synthetic').resolve()) or fixture.suffix.lower() != '.pdf':
        raise ValueError('A fixture tem de ser um PDF dentro de data/synthetic.')
    raw = fixture.read_bytes()
    if not raw.startswith(b'%PDF-') or len(raw) > 2*1024*1024:
        raise ValueError('PDF sintético inválido ou superior a 2 MB.')
    return raw


def process_resources(pid):
    """Windows process RSS/CPU time; excludes parser subprocesses. No dependencies."""
    if os.name != 'nt':
        return {}
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.OpenProcess.restype = wintypes.HANDLE
    kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    kernel.GetProcessTimes.argtypes = [wintypes.HANDLE] + [ctypes.POINTER(wintypes.FILETIME)] * 4
    class Memory(ctypes.Structure):
        _fields_ = [('cb', wintypes.DWORD), ('faults', wintypes.DWORD)] + [(n, ctypes.c_size_t) for n in ('peak', 'rss', 'ppq', 'pq', 'pnpq', 'npq', 'page', 'peakpage')]
    class SystemMemory(ctypes.Structure):
        _fields_ = [('length', wintypes.DWORD), ('load', wintypes.DWORD)] + [(n, ctypes.c_ulonglong) for n in ('total', 'available', 'totalpage', 'availpage', 'totalvirtual', 'availvirtual', 'extended')]
    handle = kernel.OpenProcess(0x410, False, pid)
    if not handle:
        return {}
    try:
        mem = Memory(); mem.cb = ctypes.sizeof(mem)
        psapi = ctypes.WinDLL('psapi')
        psapi.GetProcessMemoryInfo.argtypes = [wintypes.HANDLE, ctypes.POINTER(Memory), wintypes.DWORD]
        ok = psapi.GetProcessMemoryInfo(handle, ctypes.byref(mem), mem.cb)
        times = [wintypes.FILETIME() for _ in range(4)]
        valid = kernel.GetProcessTimes(handle, *[ctypes.byref(t) for t in times])
        cpu = sum((t.dwHighDateTime << 32) + t.dwLowDateTime for t in times[2:]) / 1e7 if valid else None
        system = SystemMemory(); system.length = ctypes.sizeof(system)
        available = system.available if kernel.GlobalMemoryStatusEx(ctypes.byref(system)) else None
        return {'rss_mb': mem.rss / 1048576 if ok else None, 'cpu_seconds': cpu, 'available_mb': available / 1048576 if available else None}
    finally:
        kernel.CloseHandle(handle)


def windows_python_child(pid):
    """venv's Windows redirector starts a real Python child; measure that child."""
    if os.name != 'nt': return pid
    class Entry(ctypes.Structure):
        _fields_ = [('size', wintypes.DWORD), ('usage', wintypes.DWORD), ('pid', wintypes.DWORD), ('heap', ctypes.c_size_t),
                    ('module', wintypes.DWORD), ('threads', wintypes.DWORD), ('parent', wintypes.DWORD), ('priority', wintypes.LONG), ('flags', wintypes.DWORD), ('exe', wintypes.WCHAR * 260)]
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
    kernel.Process32FirstW.argtypes = [wintypes.HANDLE, ctypes.POINTER(Entry)]
    kernel.Process32NextW.argtypes = [wintypes.HANDLE, ctypes.POINTER(Entry)]
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    handle = kernel.CreateToolhelp32Snapshot(2, 0)
    try:
        entry = Entry(); entry.size = ctypes.sizeof(entry)
        ok = kernel.Process32FirstW(handle, ctypes.byref(entry))
        while ok:
            if entry.parent == pid and entry.exe.lower().startswith('python'): return entry.pid
            ok = kernel.Process32NextW(handle, ctypes.byref(entry))
    finally: kernel.CloseHandle(handle)
    return pid


class Load:
    def __init__(self, args, out, process):
        self.args, self.out, self.process = args, out, process
        self.base = f'http://127.0.0.1:{args.port}'
        self.db = out / 'load.sqlite3'
        self.stop = asyncio.Event()
        self.rows = []
        self.raw = synthetic_pdf(args.fixture)
        self.baseline = {}
        self.server_pid = process.pid

    async def request(self, client, metrics, method, path, *, owner=None, expected=(200,), controlled=(), **kwargs):
        start = time.perf_counter()
        label = path.split('/')[-1] if '/result/' not in path else 'result'
        headers = kwargs.pop('headers', {})
        if owner:
            headers['X-Pulso-Profile'] = owner
        response = None
        try:
            response = await client.request(method, path, headers=headers, **kwargs)
            code = str(response.status_code)
            kind = 'ok' if response.status_code in expected else 'controlled' if response.status_code in controlled else 'unexpected'
        except httpx.HTTPError as exc:
            code, kind = type(exc).__name__, 'unexpected'
        latency = (time.perf_counter() - start) * 1000
        metrics['latencies'].append(latency)
        metrics['http'][code] += 1
        metrics['outcomes'][kind] += 1
        metrics['operations'][method + ' ' + label] += 1
        if kind == 'unexpected' and len(metrics['examples']) < 8:
            metrics['examples'].append({'method': method, 'path': path, 'status': code, 'detail': response.text[:250] if response is not None else code})
        if kind == 'unexpected':
            raise RuntimeError(code)
        return response

    async def read(self, client, m, owner):
        r = await self.request(client, m, 'GET', f'/demo/profiles/{owner}/data', owner=owner)
        data = r.json()
        from services.api.app.store import validate
        validate(owner, data)
        return data

    async def write(self, client, m, owner):
        sid = 'load-' + uuid.uuid4().hex
        prefix = f'/demo/profiles/{owner}'
        payload = dict(id=sid, date='2026-11-08T10:00:00Z', systolic='128', diastolic='78', heartRate='72')
        await self.request(client, m, 'POST', prefix + '/pressure', owner=owner, json=payload)
        await self.request(client, m, 'POST', prefix + '/pressure', owner=owner, json=payload)  # idempotent replay
        await self.request(client, m, 'PATCH', prefix + '/result/' + sid + '-systolic', owner=owner, json={'value': 129})
        data = await self.read(client, m, owner)
        rows = [r for r in data['results'] if r.get('sessionId') == sid]
        assert len(rows) == 3 and next(r for r in rows if r['parameter'] == 'systolic')['value'] == 129, 'Lost/duplicated write'
        for row in rows:
            await self.request(client, m, 'DELETE', prefix + '/result/' + row['id'], owner=owner)

    async def document(self, client, m, owner):
        r = await self.request(client, m, 'POST', '/demo/extract', content=self.raw, headers={'Content-Type': 'application/pdf', 'X-Pulso-Demo': 'synthetic-only'}, controlled=(429,))
        if r.status_code == 429:
            return False
        p = r.json(); did = 'load-doc-' + uuid.uuid4().hex
        doc = dict(id=did, ownerId=owner, synthetic=True, title='PDF inteiramente fictício — carga', laboratory=p['laboratory'], issuedAt=None,
                   importedAt='2026-11-08T10:00:00Z', sha256=p['sha256'], original=dict(fileName='laboratorio-demo.pdf', mediaType='application/pdf', text=p['text'], dataUrl='data:application/pdf;base64,' + base64.b64encode(self.raw).decode()))
        # Explicit synthetic review/correction; no model output auto-confirmation.
        row = dict(id=did + '-glucose', ownerId=owner, synthetic=True, parameter='glucose', value=99, unit='mg/dL', measuredAt='2026-11-08T10:00:00Z',
                   documentId=did, method=None, context=None, referenceText=None, status='user_confirmed')
        prefix = f'/demo/profiles/{owner}'
        response = await self.request(client, m, 'POST', prefix + '/confirm', owner=owner, json={'document': doc, 'results': [row]}, controlled=(409,))
        if response.status_code == 409:
            return False  # same fixture/hash, intentionally shared profile
        data = await self.read(client, m, owner)
        assert sum(r['id'] == row['id'] and r['value'] == 99 for r in data['results']) == 1
        assert next(d for d in data['documents'] if d['id'] == did)['original']['dataUrl'] == doc['original']['dataUrl']
        await self.request(client, m, 'DELETE', prefix + '/document/' + did, owner=owner)
        return True

    async def isolation(self, client, m, owner):
        other = 'demo-b' if owner == 'demo-a' else 'demo-a'
        await self.request(client, m, 'GET', f'/demo/profiles/{other}/data', owner=owner, expected=(403,))
        await self.request(client, m, 'DELETE', '/demo/profiles/demo-b/result/glucose-0', owner='demo-b', expected=(404,))
        await self.request(client, m, 'PATCH', '/demo/profiles/demo-b/document/doc-0', owner='demo-b', json={'title': 'Tentativa fictícia'}, expected=(404,))
        await self.request(client, m, 'GET', '/demo/profiles/demo-b/preview/glucose-0', owner='demo-b', expected=(404,))

    async def integrity(self, client):
        from services.api.app.store import validate
        state = {}
        for owner in ('demo-a', 'demo-b'):
            r = await client.get(f'/demo/profiles/{owner}/data', headers={'X-Pulso-Profile': owner})
            r.raise_for_status(); data = r.json(); validate(owner, data); state[owner] = data
        with sqlite3.connect(self.db, timeout=15) as db:
            assert db.execute('PRAGMA integrity_check').fetchall() == [('ok',)]
        return state

    async def probes(self, client):
        """Document existing collision semantics; never repair application behavior."""
        prefix = '/demo/profiles/demo-b'; headers = {'X-Pulso-Profile':'demo-b'}
        sid = 'probe-' + uuid.uuid4().hex
        payload = dict(id=sid,date='2026-11-08T10:00:00Z',systolic='128',diastolic='78',heartRate='72')
        first = await client.post(prefix+'/pressure',headers=headers,json=payload);first.raise_for_status()
        replay = await client.post(prefix+'/pressure',headers=headers,json={**payload,'systolic':'140'})
        data = (await client.get(prefix+'/data',headers=headers)).json()
        stored = next(r for r in data['results'] if r['id']==sid+'-systolic')
        patches = await asyncio.gather(*[client.patch(prefix+'/result/'+sid+'-systolic',headers=headers,json={'value':value}) for value in (130,131)])
        current = (await client.get(prefix+'/data',headers=headers)).json()
        edited = next(r for r in current['results'] if r['id']==sid+'-systolic')
        result = {'changed_idempotent_payload':{'http':replay.status_code,'response':replay.json(),'sent':140,'stored':stored['value']},
                  'concurrent_same_result':{'http':[p.status_code for p in patches],'stored':edited['value'],'previous_versions':len(edited.get('previousVersions',[])),
                                            'note':'No version precondition; last committed edit wins. Response order is not a commit ordering guarantee.'}}
        for row in current['results']:
            if row.get('sessionId')==sid:
                response = await client.delete(prefix+'/result/'+row['id'],headers=headers);response.raise_for_status()
        result['baseline_restored'] = await self.integrity(client)==self.baseline
        (self.out/'probes.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
        print('Collision probes:',json.dumps(result),flush=True)

    async def phase(self, client, name, users, duration):
        m = dict(latencies=[], http=Counter(), outcomes=Counter(), operations=Counter(), examples=[], journeys=Counter(), samples=[], failures=[])
        started = time.perf_counter(); deadline = started + duration + self.args.ramp
        stop = asyncio.Event(); active = 0; peak = 0

        async def worker(index):
            nonlocal active, peak
            await asyncio.sleep(self.args.ramp * index / max(users, 1))
            owner = 'demo-a' if index % 2 == 0 else 'demo-b'
            active += 1; peak = max(peak, active)
            cycle = index
            try:
                while time.perf_counter() < deadline and not stop.is_set():
                    try:
                        scenario = name if name != 'mixed' else ('writes' if cycle % 3 == 0 else 'reads')
                        cycle += 1
                        if scenario == 'reads':
                            await self.read(client, m, owner)
                            await asyncio.sleep(self.args.pause)
                            await self.read(client, m, owner)  # revisit history/graph source
                        elif scenario == 'writes': await self.write(client, m, owner)
                        elif scenario == 'documents':
                            if not await self.document(client, m, owner):
                                m['journeys']['controlled'] += 1
                                await asyncio.sleep(self.args.pause * (0.8 + random.random() * 0.4))
                                continue
                        else: await self.isolation(client, m, owner)
                        m['journeys']['completed'] += 1
                    except (RuntimeError, AssertionError, ValueError, KeyError) as exc:
                        m['journeys']['failed'] += 1
                        if len(m['failures']) < 8: m['failures'].append(str(exc))
                    total = len(m['latencies'])
                    if total >= 20 and m['outcomes']['unexpected'] >= 10 and m['outcomes']['unexpected'] / total > .05:
                        stop.set()
                    if m['journeys']['failed'] >= 3 and m['failures'] and any('Lost/duplicated' in f for f in m['failures']): stop.set()
                    await asyncio.sleep(self.args.pause * (0.8 + random.random() * 0.4))
            finally: active -= 1

        async def monitor():
            previous = None; consecutive_health_errors = 0
            while not stop.is_set():
                sample = {'seconds': round(time.perf_counter() - started, 2), 'active': active, 'database_bytes': self.db.stat().st_size if self.db.exists() else 0,
                          'server': process_resources(self.server_pid), 'generator': process_resources(os.getpid())}
                if previous:
                    elapsed = sample['seconds'] - previous['seconds']
                    for role in ('server', 'generator'):
                        a, b = previous[role].get('cpu_seconds'), sample[role].get('cpu_seconds')
                        if a is not None and b is not None and elapsed > 0: sample[role]['cpu_one_core_percent'] = round(100 * (b - a) / elapsed, 2)
                m['samples'].append(sample); previous = sample
                s = sample['server']
                reason = None
                if (s.get('rss_mb') or 0) > 4096 or (s.get('available_mb') is not None and s['available_mb'] < 2048): reason = 'memory_limit'
                recent = [p['server'].get('rss_mb') for p in m['samples'][-6:]]
                if len(recent) == 6 and all(v is not None for v in recent) and all(a < b for a, b in zip(recent, recent[1:])) and recent[-1] - recent[0] > 256: reason = 'continuous_memory_growth'
                try:
                    health = await client.get('/health', timeout=3)
                    consecutive_health_errors = 0 if health.status_code == 200 else consecutive_health_errors + 1
                except httpx.HTTPError: consecutive_health_errors += 1
                if consecutive_health_errors >= 3: reason = 'health_unavailable'
                if reason:
                    m['failures'].append(reason); stop.set()
                await asyncio.sleep(2)

        watcher = asyncio.create_task(monitor())
        try:
            await asyncio.gather(*(worker(i) for i in range(users)))
        finally:
            stop.set(); watcher.cancel()
            await asyncio.gather(watcher, return_exceptions=True)
        elapsed = time.perf_counter() - started
        integrity = False
        try: integrity = await self.integrity(client) == self.baseline
        except Exception as exc: m['failures'].append('integrity: ' + str(exc))
        p95, p99 = percentile(m['latencies'], .95), percentile(m['latencies'], .99)
        failures = m['outcomes']['unexpected'] / max(1, len(m['latencies']))
        row = dict(scenario=name, users=users, peak_users=peak, duration_seconds=round(elapsed, 2), measured_full_load_seconds=round(max(0, min(duration, elapsed-self.args.ramp)),2),
                   requests=len(m['latencies']), rps=round(len(m['latencies']) / elapsed, 2), p50_ms=percentile(m['latencies'], .5), p95_ms=p95, p99_ms=p99,
                   unexpected_fraction=failures, http=dict(m['http']), outcomes=dict(m['outcomes']), operations=dict(m['operations']), journeys=dict(m['journeys']),
                   examples=m['examples'], failures=m['failures'], integrity=integrity, samples=m['samples'])
        row['stable'] = bool(integrity and failures <= .01 and p95 is not None and p95 <= 1500 and p99 <= 5000 and m['journeys']['completed'] > 0 and not m['journeys']['failed'] and not m['failures'])
        self.rows.append(row); self.save()
        print(json.dumps({k: row[k] for k in ('scenario','users','duration_seconds','requests','rps','p95_ms','unexpected_fraction','integrity','stable')}, ensure_ascii=False), flush=True)
        return row['stable']

    def save(self):
        (self.out / 'results.json').write_text(json.dumps({'config': vars(self.args), 'rows': self.rows}, ensure_ascii=False, indent=2), encoding='utf-8')

    async def run(self):
        async with httpx.AsyncClient(base_url=self.base, trust_env=False, follow_redirects=False, timeout=15, limits=httpx.Limits(max_connections=2100, max_keepalive_connections=1100)) as client:
            for _ in range(60):
                if self.process.poll() is not None: raise RuntimeError('Servidor terminou; consultar server.log')
                try:
                    if (await client.get('/health')).status_code == 200: break
                except httpx.HTTPError: pass
                await asyncio.sleep(.25)
            else: raise RuntimeError('Servidor de ensaio não respondeu')
            status = (await client.get('/demo/extraction/status')).json()
            if self.args.inference_only:
                assert status.get('enabled') and status.get('available'), 'Ollama local indisponível; nenhum ensaio de inferência executado'
                from scripts.benchmark_extraction import pdf, table
                payload = pdf([table([0,4,6])])  # same existing synthetic benchmark generator
                before = await self.integrity(client)
                started = time.perf_counter()
                response = await client.post('/demo/extract',content=payload,headers={'Content-Type':'application/pdf','X-Pulso-Demo':'synthetic-only'},timeout=300)
                response.raise_for_status(); data = response.json()
                rows = data['candidates']
                result = {'seconds':time.perf_counter()-started,'http':response.status_code,'engine':status,
                          'methods':dict(Counter(r['extractionMethod'] for r in rows)), 'candidates':len(rows),
                          'expected':[['glucose',98.5,'mg/dL'],['ldl',106.0,'mg/dL'],['creatinine',.92,'mg/dL']],
                          'observed':[[r['parameter'],r['numericValue'],r['unit']] for r in rows],
                          'all_pending':all(r['reviewState']=='pending' for r in rows),'metrics':data['metrics'],
                          'database_unchanged':await self.integrity(client)==before}
                result['expected_matches'] = sorted(result['expected'])==sorted(result['observed'])
                (self.out/'inference.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
                print('Single local inference:',json.dumps(result),flush=True)
                assert result['expected_matches'] and result['all_pending'] and result['database_unchanged'] and result['methods'].get('ollama_text')==3
                return None
            assert status['enabled'] is False, 'Ollama must be disabled'
            self.server_pid = windows_python_child(self.process.pid)
            print('Measured server PID:', self.server_pid, flush=True)
            self.baseline = await self.integrity(client)
            await self.probes(client)
            if self.args.probes_only: return None
            stable = None
            for users in self.args.users:
                if users >= 500:
                    resource = process_resources(self.server_pid)
                    if stable is None or stable < 250 or (resource.get('available_mb') or 0) < 4096: break
                passed = True
                for scenario in self.args.scenarios:
                    if not await self.phase(client, scenario, users, self.args.duration):
                        passed = False; break
                if not passed: break
                stable = users
            if stable is not None and self.args.soak > 0:
                # A failed journey may leave its own test rows behind. Record first,
                # then restore only this owned temporary server before the soak.
                if await self.integrity(client) != self.baseline:
                    for owner in ('demo-a','demo-b'):
                        response = await client.post(f'/demo/profiles/{owner}/reset',headers={'X-Pulso-Profile':owner})
                        response.raise_for_status()
                    assert await self.integrity(client) == self.baseline
                    print('Temporary baseline restored after failed phase; see recorded integrity result.',flush=True)
                await self.phase(client, 'mixed', stable, self.args.soak)
            return stable


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--users', type=int, nargs='+', default=[1,10,25,50,100,250,500,1000])
    parser.add_argument('--scenarios', nargs='+', choices=['reads','writes','documents','mixed','isolation'], default=['reads','writes','documents','mixed','isolation'])
    parser.add_argument('--duration', type=float, default=12)
    parser.add_argument('--ramp', type=float, default=2)
    parser.add_argument('--pause', type=float, default=.3)
    parser.add_argument('--soak', type=float, default=600)
    parser.add_argument('--max-seconds', type=float, default=1800)
    parser.add_argument('--port', type=int, default=8877)
    parser.add_argument('--fixture', default='data/synthetic/laboratorio-demo.pdf')
    parser.add_argument('--probes-only', action='store_true')
    parser.add_argument('--inference-only', action='store_true', help='Uma única extração local sequencial, sem guardar resultados; não executa carga.')
    parser.add_argument('--output', default='tmp/load-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
    args = parser.parse_args()
    if not (1 <= min(args.users) <= max(args.users) <= 1000) or args.users != sorted(set(args.users)) or args.pause < .05 or min(args.duration,args.ramp,args.max_seconds) <= 0 or args.soak < 0:
        parser.error('Valores inválidos; utilizadores crescentes 1–1000, pausa ≥0,05 e durações positivas.')
    if not 1024 <= args.port <= 65535 or args.port in (8000,8081,8765): parser.error('Usar uma porta própria, por exemplo 8877.')
    synthetic_pdf(args.fixture)  # fail before starting any child process
    # Refuse an occupied port, never reuse or kill another process.
    with socket.socket() as sock:
        if os.name == 'nt': sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        sock.bind(('127.0.0.1',args.port))
    out = safe_output(ROOT / args.output)
    normal = ROOT / '.local/pulso.sqlite3'; before = digest(normal)
    env = dict(os.environ, PULSO_DB_PATH=str(out / 'load.sqlite3'), LLM_EXTRACTION_ENABLED='true' if args.inference_only else 'false')
    print('ISOLATED:', out, 'port', args.port, 'Ollama: single probe only' if args.inference_only else 'Ollama disabled; 2 shared demo profiles', flush=True)
    print('Provisional SLO: unexpected <=1%, p95<=1500ms, p99<=5000ms, no integrity/flow failures. Stop: >5% and >=10 unexpected, 3 failed health probes, RAM limits.',flush=True)
    exit_code = 0
    with (out / 'server.log').open('w', encoding='utf-8') as log:
        process = subprocess.Popen([sys.executable,'-m','uvicorn','services.api.app.main:app','--host','127.0.0.1','--port',str(args.port),'--no-access-log'],cwd=ROOT,env=env,stdout=log,stderr=log)
        load = Load(args,out,process)
        try:
            stable = asyncio.run(asyncio.wait_for(load.run(), timeout=args.max_seconds))
            if not args.probes_only and not args.inference_only: print('Largest all-scenario stable users:',stable,flush=True)
        except (KeyboardInterrupt, TimeoutError) as exc:
            exit_code = 130 if isinstance(exc,KeyboardInterrupt) else 124
            print('Interrupted/deadline: partial results preserved.',flush=True)
        finally:
            if process.poll() is None:
                process.terminate()
                try: process.wait(timeout=10)
                except subprocess.TimeoutExpired: process.kill(); process.wait()
            load.save()
            (out/'isolation.json').write_text(json.dumps({'normal_db_sha256_before':before,'normal_db_sha256_after':digest(normal),'normal_db_unchanged':before==digest(normal),'test_database':str(load.db),'server_stopped':process.poll() is not None,'at':datetime.now(timezone.utc).isoformat()},indent=2),encoding='utf-8')
    return exit_code


if __name__ == '__main__':
    raise SystemExit(main())
