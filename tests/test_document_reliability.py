import unittest
from scripts.document_reliability import evaluate
class DocumentaryMetrics(unittest.TestCase):
 def test_wrong_date_extra_omission_and_visual_evidence_are_independent(self):
  expected=[dict(parameter='glucose',value=1.25,unit='mg/dL',date='2026-11-08',page=1),dict(parameter='ldl',value=2,unit='mg/dL',date=None,page=1)]
  observed=dict(sha256='expected',candidates=[dict(parameter='glucose',value='1,25',normalizedUnit='mg/dL',date=None,page=1,verification='visual_unverified',issues=['review']),dict(parameter='creatinine',value='3',normalizedUnit='mg/dL',date=None,page=1,verification='visual_unverified',issues=['review'])])
  counts,by=evaluate(observed,expected,'expected');self.assertEqual(counts['wrong_date'],1);self.assertEqual(counts['extra'],1);self.assertEqual(counts['omitted'],1);self.assertEqual(counts['not_independently_verified'],2);self.assertEqual(by['ldl']['omitted'],1);self.assertEqual(counts.get('correct_all_fields',0),0)
