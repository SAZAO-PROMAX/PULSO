import json
from fastapi import APIRouter, Request, HTTPException
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
