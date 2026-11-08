import json
from pathlib import Path
from datetime import date

CATALOG=json.loads((Path(__file__).resolve().parents[3]/'packages/shared/registration.json').read_text(encoding='utf-8'))
CATEGORIES={c['id']:c for c in CATALOG['categories']}
SPECIALTIES={s['id'] for s in CATALOG['specialties']}

def validate_classification(document):
    category=document.get('category');exam_type=document.get('examType')
    if category is not None:
        if not isinstance(category,str) or category not in CATEGORIES:raise ValueError('Categoria desconhecida.')
        if not isinstance(exam_type,str) or exam_type not in {t['id'] for t in CATEGORIES[category]['types'] if t['mode'] not in {'planned','pressure'}}:raise ValueError('Tipo de exame incompatível com a categoria.')
    elif exam_type is not None:raise ValueError('Seleciona a categoria do tipo de exame.')
    specialties=document.get('specialties',[])
    if not isinstance(specialties,list) or len(specialties)>len(SPECIALTIES) or any(not isinstance(s,str) or s not in SPECIALTIES for s in specialties) or len(set(specialties))!=len(specialties):raise ValueError('Especialidades inválidas.')
    when=document.get('examDate')
    if when is not None:
        if not isinstance(when,str) or len(when)!=10 or date.fromisoformat(when).isoformat()!=when:raise ValueError('Data do exame inválida. Usa AAAA-MM-DD ou deixa vazio.')
