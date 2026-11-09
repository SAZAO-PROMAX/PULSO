import unittest
from scripts.profile_reliability import fixture,canonical
from services.api.app.store import validate
class CohortFixtures(unittest.TestCase):
 def test_reproducible_unique_owners_and_valid_references(self):
  owners=set()
  for i in range(10):
   owner,profile,data,band=fixture(i,730);self.assertEqual(canonical(data),canonical(fixture(i,730)[2]));self.assertNotIn(owner,owners);owners.add(owner);validate(owner,data)
  self.assertNotEqual(fixture(1,730)[0],fixture(1,731)[0])
 def test_histories_are_diverse_and_contain_explicit_absences(self):
  samples=[fixture(i,730)[2] for i in range(10)];self.assertEqual(len(samples[0]['documents']),0);self.assertGreater(max(len(s['documents']) for s in samples),30);self.assertTrue(any(r['value'] is None for s in samples for r in s['results']));self.assertTrue(any(r['measuredAt'] is None for s in samples for r in s['results']));self.assertTrue(any(s['events'] for s in samples))
