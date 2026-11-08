import json
import base64
import pymupdf
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import Response
from . import store
router=APIRouter(prefix="/demo/profiles")
def scope(request,owner):
    if owner not in {"demo-a","demo-b"} or request.headers.get("x-pulso-profile")!=owner:
        raise HTTPException(403,"Seleciona o perfil de demonstração correto. Isto não é autenticação de produção.")
async def body(request):
    payload=bytearray()
    async for chunk in request.stream():
        payload.extend(chunk)
        if len(payload)>8*1024*1024: raise HTTPException(413,"Dados excedem o limite local.")
    try:
        value=json.loads(payload)
        if not isinstance(value,dict): raise ValueError()
        return value
    except (ValueError,TypeError): raise HTTPException(422,"Pedido inválido.")
@router.get("/{owner}/data")
def get_data(owner:str,request:Request):
    scope(request,owner);return store.load(owner)

@router.get("/{owner}/preview/{result_id}")
def preview(owner:str,result_id:str,request:Request):
    scope(request,owner)
    data=store.load(owner)
    row=next((r for r in data['results'] if r['id']==result_id),None)
    evidence=(row or {}).get('evidence') or {}
    doc=next((d for d in data['documents'] if row and d['id']==row.get('documentId')),None)
    if not doc or evidence.get('verification')!='text_verified' or not evidence.get('region'):
        raise HTTPException(404,'Sem região textual fiável para destacar. Consulta o original.')
    original=doc['original']
    try:
        if original['mediaType']!='application/pdf':raise ValueError()
        raw=base64.b64decode(original['dataUrl'].split(',',1)[1],validate=True)
        with pymupdf.open(stream=raw,filetype='pdf') as pdf:
            page_number=evidence.get('page')
            if not isinstance(page_number,int) or not 1<=page_number<=min(3,len(pdf)):raise ValueError()
            page=pdf[page_number-1]
            excerpt=evidence.get('excerpt')
            if not isinstance(excerpt,str) or not 0<len(excerpt)<=350:raise ValueError()
            # Recompute on the stored original; never trust coordinates supplied by a model/client.
            boxes=page.search_for(excerpt)
            if len(boxes)!=1:raise ValueError()
            page.add_highlight_annot(boxes[0])
            scale=min(2,1280/max(page.rect.width,page.rect.height))
            pix=page.get_pixmap(matrix=pymupdf.Matrix(scale,scale),alpha=False)
            return Response(pix.tobytes('png'),media_type='image/png',headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
    except Exception:
        raise HTTPException(422,'Não foi possível destacar uma região inequívoca. Consulta o original.')
@router.post("/{owner}/migrate")
async def migrate(owner:str,request:Request):
    scope(request,owner);return store.migrate(owner,await body(request))
@router.post("/{owner}/confirm")
async def confirm(owner:str,request:Request):
    scope(request,owner);return store.confirm(owner,await body(request))
@router.post("/{owner}/pressure")
async def pressure(owner:str,request:Request):
    scope(request,owner);return store.pressure(owner,await body(request))
@router.post("/{owner}/reset")
def reset(owner:str,request:Request):
    scope(request,owner);return store.reset(owner)
@router.patch("/{owner}/{kind}/{item_id}")
async def edit(owner:str,kind:str,item_id:str,request:Request):
    scope(request,owner)
    if kind not in {"document","result"}: raise HTTPException(404)
    return store.manage(owner,kind,item_id,await body(request))
@router.delete("/{owner}/{kind}/{item_id}")
def delete(owner:str,kind:str,item_id:str,request:Request):
    scope(request,owner)
    if kind not in {"document","result"}: raise HTTPException(404)
    return store.manage(owner,kind,item_id)
