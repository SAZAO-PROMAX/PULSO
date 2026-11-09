"""Document fidelity regressions, synthetic only; no inference or normal database."""
import pymupdf
import pytest
from services.api.app.hybrid import validated_candidate,date_supported,extract_document
from services.api.app.local_ollama import RawResult,RawPage
from scripts.benchmark_extraction import pdf,table,ground_truth

@pytest.mark.parametrize('proposed,text,excerpt,expected',[
 (None,'Data: 2026-11-08','',None),
 ('2026-11-08','Sem data','',None),
 ('2026-11-080','Data: 2026-11-08','',None),
 ('2026-11-08','Data: 2026-11-080','',None),
 ('2026-11-08','Data: 08/11/2026','','2026-11-08'),
 ('2026-11-08','2026-11-08\n2026-10-05','',None),
 ('2026-11-08','HDL | 52 | mg/dL | 2026-11-08\n2026-10-05','HDL | 52 | mg/dL | 2026-11-08','2026-11-08'),
])
def test_dates_need_unambiguous_document_support(proposed,text,excerpt,expected):
 assert date_supported(proposed,text,excerpt)==expected

def test_hdl_rejected_date_and_empty_extra_are_retained_not_repaired():
 source=pdf([table(list(range(15)))],small=True)
 class Engine:
  def extract(self,text,image):
   assert image is None and '2026-11-08' in text
   return RawPage(results=[RawResult(original_parameter='Colesterol HDL',original_value='52',unit='mg/dL',report_date='2026-11-080',excerpt='Colesterol HDL | 52 | mg/dL'),RawResult()]),{}
 result=extract_document(source,'application/pdf',Engine())
 assert ground_truth('fifteen_rows')[3]==('hdl',52.0,'mg/dL')
 hdl,extra=result['candidates']
 assert hdl['date'] is None and hdl['sourceFields']['reportDate']=='2026-11-080'
 assert hdl['value']=='52' and hdl['unit']=='mg/dL' and hdl['page']==1
 assert extra['parameter'] is None and extra['value']=='' and extra['normalizedUnit'] is None
 assert all(r['reviewState']=='pending' for r in result['candidates'])
 assert result['sha256'] and 'Data do relatorio' in result['text']

def test_repeated_evidence_and_visual_reading_do_not_become_text_proof():
 line='Glicose | 98,5 | mg/dL | hexoquinase | plasma'
 raw=RawResult(original_parameter='Glicose',original_value='98,5',unit='mg/dL',excerpt=line,method='hexoquinase',specimen='plasma')
 assert validated_candidate(raw,None,line,'ollama_text',{})['verification']=='text_verified'
 assert validated_candidate(raw,None,line+'\n'+line,'ollama_text',{})['verification']=='source_unverified'
 assert validated_candidate(raw,None,'','ollama_vision',{})['verification']=='visual_unverified'
 for name,value,unit in [('Cabeçalho',None,None),('Desconhecido','9','mg/dL'),('Glicose','ND','mg/dL'),('Glicose','0,92','g/dL')]:
  r=RawResult(original_parameter=name,original_value=value,unit=unit,excerpt='')
  candidate=validated_candidate(r,None,line,'ollama_text',{})
  assert candidate['reviewState']=='pending' and candidate['issues']
  assert candidate['value']==(value or '') and candidate['unit']==(unit or '')


def test_method_substring_is_not_a_method_match():
 line='Glicose | 98,5 | mg/dL | indireto | plasma'
 raw=RawResult(original_parameter='Glicose',original_value='98,5',unit='mg/dL',method='direto',specimen='plasma',excerpt=line)
 candidate=validated_candidate(raw,None,line,'ollama_text',{})
 assert candidate['method'] is None and candidate['sourceFields']['method']=='direto'
 assert candidate['verification']=='text_verified' and 'Método sem evidência textual.' in candidate['issues']
