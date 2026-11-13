import importlib.util
import unittest


@unittest.skipUnless(importlib.util.find_spec("pydantic"), "Referência requer a venv já fixada da aplicação.")
class ReferenceTests(unittest.TestCase):
    def test_reference_rejects_malformed_cells_but_not_semantic_date_swaps(self):
        from services.fidelity.reference import validate
        self.assertFalse(validate({"value": {"state": "known", "value": 90}}))
        self.assertFalse(validate({"value": {"state": "unknown", "value": "90"}}))
        self.assertFalse(validate({"value": None}))
        self.assertTrue(validate({"collectionDate": {"state": "known", "value": "2026-11-07"}}))

    def test_all_pairs_are_structure_valid_under_reference_contract(self):
        from services.fidelity.run import load_corpus
        from services.fidelity.reference import validate
        pairs, _ = load_corpus()
        for pair in pairs:
            with self.subTest(case=pair["id"]):
                self.assertTrue(validate(pair["source"]))
                self.assertTrue(validate(pair["destination"]))
