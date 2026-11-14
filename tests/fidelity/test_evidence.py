from copy import deepcopy
import hashlib
from pathlib import Path
import unittest
from unittest.mock import patch

from services.fidelity import run


class FieldEvidence(unittest.TestCase):
    def setUp(self):
        pairs, self.truth = run.load_corpus()
        self.p = deepcopy(pairs[0])
        self.content = (run.CORPUS / "sources/E01.txt").read_bytes()
        self.enterContext(patch.object(Path, "read_bytes", side_effect=lambda: self.content))

    def replace_value_line(self, line):
        ref = self.p["evidence"]["value"]
        self.content = self.content.replace(ref["excerpt"].encode(), line.encode())
        self.p["sourceSha256"] = hashlib.sha256(self.content).hexdigest()
        ref["excerpt"] = line

    def report(self):
        row, = run.evaluate([self.p], self.truth)
        return row, run.html_report([row])

    def test_unit_only_cannot_support_value(self):
        self.p["evidence"]["value"] = self.p["evidence"]["unit"]
        row, page = self.report()
        self.assertEqual(row["pulso"], "ambiguous")
        self.assertIn("o excerto não identifica este campo", page)
        self.assertFalse(row["fieldsCorrect"])

    def test_missing_all_evidence_still_renders(self):
        self.p.pop("evidence")
        row, page = self.report()
        self.assertEqual(row["pulso"], "ambiguous")
        self.assertIn("Prova ausente", page)
        self.assertIn("value: 90", page)

    def test_actual_line_contradicts_structured_value(self):
        self.replace_value_line("value: 900")
        self.p["destination"].pop("value")
        row, page = self.report()
        self.assertEqual(row["pulso"], "ambiguous")
        self.assertIn("Prova contraditória", page)

    def test_one_line_can_support_value_and_unit(self):
        self.replace_value_line("value: 90,00 mg/dL")
        self.p["evidence"]["unit"] = self.p["evidence"]["value"]
        row, _ = self.report()
        self.assertTrue(row["fieldsCorrect"])
        self.assertEqual(row["pulso"], "equivalent")

    def test_excerpt_must_match_original_at_positive_line(self):
        for replacement in ({"excerpt": "value: 99"}, {"line": 0}, {"line": 555}, {"documentId": "other"}):
            with self.subTest(replacement=replacement), patch.dict(self.p["evidence"]["value"], replacement):
                row, page = self.report()
                self.assertEqual(row["pulso"], "ambiguous")
                self.assertIn("Prova", page)
