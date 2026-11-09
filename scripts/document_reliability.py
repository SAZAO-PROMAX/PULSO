"""Independent synthetic documentary truth, same bounded extraction pipeline; never stores clinical data."""
import argparse,hashlib,json,os,subprocess,sys,time,threading
from pathlib import Path
from collections import Counter,defaultdict
import pymupdf
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from scripts.benchmark_extraction import cases,ground_truth,pdf,table,image,scan
from scripts.load_test import safe_output
from services.api.app.laboratory import numeric

def corpus():
 for name,mime,raw,count in cases():
  expected=ground_truth(name);dates=['2026-11-07']*5 if name=='known_deterministic' else ['2026-11-08']*3+['2026-10-05']*3 if name in {'multi_page','repeated_dates'} else [None] if name=='missing_fields' else ['2026-11-07']*5+['2026-11-08']*3 if name=='mixed' else ['2026-11-08']*count
  pages=[1]*3+[2]*3 if name in {'multi_page','repeated_dates'} else [1]*5+[2]*3 if name=='mixed' else [1]*count
  yield name,mime,raw,[dict(parameter=p,value=v,unit=u,date=d,page=pg) for (p,v,u),d,pg in zip(expected,dates,pages)]
 # Source truth precedes controlled image degradation; concealed rows remain expected source rows.
 base=pdf([table([0,4,6])]);truth=[dict(parameter=p,value=v,unit=u,date='2026-11-08',page=1) for p,v,u in ground_truth('photo')]
 for name in ['low_contrast','glare','cropped','italic_simulated','english','ambiguous_date']:
  doc=pymupdf.open(stream=base,filetype='pdf');page=doc[0]
  if name=='low_contrast':page.draw_rect(page.rect,color=None,fill=(1,1,1),fill_opacity=.82,overlay=True)
  if name=='glare':page.draw_rect(pymupdf.Rect(120,85,530,115),color=None,fill=(1,1,1),overlay=True)
  if name in {'italic_simulated','english','ambiguous_date'}:
   doc.close();doc=pymupdf.open();page=doc.new_page();lines=table([0,4,6])
   if name=='english':lines=[line.replace('Glicose','Glucose').replace('Creatinina','Creatinine') for line in lines]
   if name=='ambiguous_date':lines=[line.replace('2026-11-08','03/04/26') for line in lines]
   page.insert_text((32,40),'\n'.join(lines),fontname='tiit' if name=='italic_simulated' else 'helv',fontsize=10)
  clip=pymupdf.Rect(0,0,210,page.rect.height) if name=='cropped' else page.rect;raw=page.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),clip=clip,alpha=False).tobytes('png');doc.close()
  expected=[{**r,'date':None} for r in truth] if name=='ambiguous_date' else truth
  yield name,'image/png',raw,expected

def evaluate(result,expected,sha):
 remaining=[dict(r) for r in expected];counts=Counter(expected=len(expected));by=defaultdict(Counter)
 for e in expected:by[e['parameter']]['expected']+=1
 for r in result['candidates']:
  p=r['parameter'] or 'unmapped';obs=dict(parameter=p,value=numeric(r['value']),unit=r['normalizedUnit'],date=r['date'],page=r['page']);candidate=next((e for e in remaining if e==obs),None) or next((e for e in remaining if (e['parameter'],e['value'],e['unit'])==(p,obs['value'],obs['unit'])),None) or next((e for e in remaining if e['parameter']==p),None)
  if candidate is None:counts['extra']+=1;by[p]['extra']+=1
  else:
   remaining.remove(candidate);perfect=True
   for key,label in [('value','wrong_value'),('unit','wrong_unit'),('date','wrong_date'),('page','wrong_page')]:
    if obs[key]!=candidate[key]:counts[label]+=1;by[p][label]+=1;perfect=False
   if perfect:counts['correct_all_fields']+=1;by[p]['correct_all_fields']+=1
  if r.get('verification')!='text_verified':counts['not_independently_verified']+=1;by[p]['not_independently_verified']+=1
  if r.get('issues'):counts['requires_review']+=1;by[p]['requires_review']+=1
  if result.get('sha256')!=sha:counts['wrong_document']+=1;by[p]['wrong_document']+=1
 counts['omitted']=len(remaining);counts['proposed']=len(result['candidates'])
 for e in remaining:by[e['parameter']]['omitted']+=1
 return dict(counts),{p:dict(c) for p,c in by.items()}

def sample_gpu(stop,samples):
 while not stop.is_set():
  try:
   response=subprocess.run(['nvidia-smi','--query-gpu=memory.used,utilization.gpu','--format=csv,noheader,nounits'],capture_output=True,text=True,timeout=2)
   if response.returncode==0:
    memory,utilization=response.stdout.splitlines()[0].split(',');samples.append(dict(memory_mib=float(memory.strip()),utilization_percent=float(utilization.strip())))
  except (OSError,ValueError,IndexError,subprocess.TimeoutExpired):pass
  stop.wait(1)

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--mode',choices=['disabled','real'],default='disabled');parser.add_argument('--only',nargs='*');parser.add_argument('--sample-gpu',action='store_true');parser.add_argument('--max-seconds',type=float,default=240);parser.add_argument('--output',required=True);args=parser.parse_args();out=safe_output(ROOT/args.output);started=time.monotonic();report={'mode':args.mode,'cases':[],'ground_truth':'fixed synthetic source before inference; glare/crop can conceal expected source rows; italic is a computer font, not human handwriting','manual_corrections_performed':0};env=dict(os.environ,LLM_EXTRACTION_ENABLED='true' if args.mode=='real' else 'false')
 for name,mime,raw,expected in corpus():
  if args.only and name not in args.only:continue
  remaining=args.max_seconds-(time.monotonic()-started)
  if remaining<=0:report['deadline_reached']=True;break
  suffix={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'}[mime];(out/(name+'.'+suffix)).write_bytes(raw);(out/(name+'-expected.json')).write_text(json.dumps(expected,indent=2),encoding='utf-8');sha=hashlib.sha256(raw).hexdigest();before=time.monotonic();gpu_samples=[];stop=threading.Event();sampler=threading.Thread(target=sample_gpu,args=(stop,gpu_samples),daemon=True)
  if args.sample_gpu:sampler.start()
  try:
   child=subprocess.run([sys.executable,'-m','services.api.app.hybrid',mime],input=raw,capture_output=True,cwd=ROOT,env=env,timeout=min(180,remaining));payload=json.loads(child.stdout)
   if not payload.get('ok'):raise ValueError(payload.get('error','extract failed'))
   result=payload['data'];counts,parameters=evaluate(result,expected,sha);row=dict(case=name,mime=mime,seconds=round(time.monotonic()-before,2),counts=counts,parameters=parameters,gpu_samples=gpu_samples,observations=[{k:r.get(k) for k in ('parameter','value','normalizedUnit','date','page','verification','issues')} for r in result['candidates']],page_methods=[{'page':p['page'],'method':p['method'],'state':p['state']} for p in result['pages']],metrics=result['metrics'],warnings=result['warnings']);report['cases'].append(row);print(json.dumps(row,ensure_ascii=True),flush=True)
  except subprocess.TimeoutExpired:report['cases'].append(dict(case=name,error='deadline'));report['deadline_reached']=True;break
  except Exception as exc:report['cases'].append(dict(case=name,error=str(exc)))
  finally:
   stop.set()
   if args.sample_gpu:sampler.join(timeout=3)
  (out/'results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
 report['elapsed_seconds']=round(time.monotonic()-started,2);(out/'results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
if __name__=='__main__':main()
