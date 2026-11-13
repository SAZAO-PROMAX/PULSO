from copy import deepcopy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import unittest

from services.fidelity.compare import compare, simple_compare, validate_record
from services.fidelity.run import CORPUS, ROOT, evaluate, html_report, load_corpus, metrics


class FidelityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pairs, cls.truth = load_corpus()

    def example(self):
        return deepcopy(self.pairs[0])

    def test_oracle_per_case_and_field(self):
        for row in evaluate(self.pairs, self.truth):
            with self.subTest(case=row["id"]):
                self.assertEqual(row["pulso"], row["expected"])
                self.assertTrue(row["fieldsCorrect"])

    def test_corpus_partition_and_balance(self):
        self.assertEqual(len(self.pairs), 30)
        self.assertEqual({s: sum(t["outcome"] == s for t in self.truth.values()) for s in ("equivalent", "loss", "ambiguous")},
                         {"equivalent": 10, "loss": 10, "ambiguous": 10})
        self.assertEqual(sum(p["split"] == "evaluation" for p in self.pairs), 10)
        self.assertEqual({p["layoutFamily"] for p in self.pairs if p["split"] == "evaluation"}, {"C"})
        self.assertFalse({p["layoutFamily"] for p in self.pairs if p["split"] == "development"} & {"C"})

    def test_no_input_mutation_including_raw_processing(self):
        p = self.example()
        before = deepcopy(p)
        result = compare(p["source"], p["destination"], p["evidence"])
        self.assertEqual(p, before)
        result["source"]["value"]["value"] = "999"
        self.assertEqual(p, before)
        self.assertIn("processedAt", result["destination"])

    def test_decimal_precision_no_float_rounding(self):
        p = self.example()
        p["source"]["value"]["value"] = "9007199254740992"
        p["destination"]["value"]["value"] = "9007199254740993"
        self.assertEqual(compare(p["source"], p["destination"], p["evidence"])["outcome"], "loss")

    def test_unsupported_values_not_silently_equal(self):
        for value in ("NaN", "Infinity", "<90", "90 mg/dL", ""):
            with self.subTest(value=value):
                p = self.example()
                p["source"]["value"]["value"] = p["destination"]["value"]["value"] = value
                self.assertEqual(compare(p["source"], p["destination"], p["evidence"])["outcome"], "ambiguous")

    def test_missing_and_unknown_destination_are_losses_from_known_source(self):
        p = self.example()
        del p["destination"]["method"]
        result = compare(p["source"], p["destination"], p["evidence"])
        self.assertEqual(next(f for f in result["findings"] if f["field"] == "method")["received"], {"state": "absent"})
        p["destination"]["method"] = {"state": "unknown", "value": None}
        self.assertEqual(compare(p["source"], p["destination"], p["evidence"])["outcome"], "loss")

    def test_identical_values_without_evidence_require_review(self):
        p = self.example()
        self.assertEqual(compare(p["source"], p["destination"], {})["outcome"], "ambiguous")

    def test_provenance_ids_case_sensitive_and_methods_not_guessed(self):
        for field, value in (("provenance", "SYNTHETIC-E01"), ("method", "Enzimático"), ("context", "Plasma")):
            p = self.example()
            p["destination"][field]["value"] = value
            self.assertEqual(compare(p["source"], p["destination"], p["evidence"])["outcome"], "loss")

    def test_processing_never_supplies_clinical_date(self):
        p = self.example()
        del p["destination"]["collectionDate"]
        p["destination"]["processedAt"]["value"] = "2026-11-05T12:00:00Z"
        result = compare(p["source"], p["destination"], p["evidence"])
        self.assertEqual(result["outcome"], "loss")

    def test_invalid_calendar_date_not_accepted(self):
        p = self.example()
        for side in ("source", "destination"):
            p[side]["collectionDate"]["value"] = "2026-02-30"
        self.assertEqual(compare(p["source"], p["destination"], p["evidence"])["outcome"], "ambiguous")
        self.assertTrue(validate_record(p["source"]))

    def test_unit_conversion_not_inferred(self):
        p = self.example()
        p["destination"]["unit"]["value"] = "mmol/L"
        p["destination"]["value"]["value"] = "5"
        self.assertEqual(compare(p["source"], p["destination"], p["evidence"])["outcome"], "loss")

    def test_baselines_receive_same_fields_and_can_detect_all_losses(self):
        rows = evaluate(self.pairs, self.truth)
        self.assertEqual(metrics(rows, "simple")["criticalMisses"], 0)
        self.assertEqual(metrics(rows, "structure")["criticalMisses"], 10)
        p = self.example()
        del p["destination"]["method"]
        self.assertEqual(simple_compare(p["source"], p["destination"])["differences"], ["method"])

    def test_html_escapes_source_content(self):
        rows = evaluate(self.pairs[:1], self.truth)
        rows[0]["title"] = "<script>alert(1)</script>"
        rows[0]["result"]["findings"][0]["expected"]["value"] = "<img src=x onerror=alert(1)>"
        page = html_report(rows)
        self.assertNotIn("<script>", page)
        self.assertNotIn("<img", page)
        self.assertIn("&lt;script&gt;", page)

    def test_sources_match_known_fields_and_unknowns(self):
        for p in self.pairs:
            for field, cell in p["source"].items():
                if field == "processedAt":
                    continue
                value = cell["value"] if cell["state"] == "known" else "[DESCONHECIDO]"
                self.assertEqual(p["evidence"][field]["excerpt"], f"{field}: {value}")

    def test_truth_changes_cause_ci_failure_not_self_fulfilling(self):
        truth = deepcopy(self.truth)
        truth["L01"]["outcome"] = "equivalent"
        rows = evaluate(self.pairs, truth)
        row = next(r for r in rows if r["id"] == "L01")
        self.assertNotEqual(row["pulso"], row["expected"])

    def test_cli_outputs_repeat_exactly_and_rejects_normal_database_directory(self):
        command = [sys.executable, "-m", "services.fidelity.run", "--check"]
        database = ROOT / ".local/pulso.sqlite3"
        database_before = hashlib.sha256(database.read_bytes()).hexdigest() if database.exists() else None
        before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in CORPUS.rglob("*") if p.is_file() and "__pycache__" not in str(p)}
        subprocess.run(command, cwd=ROOT, check=True, capture_output=True)
        outputs = {name: (ROOT / "tmp/fidelity" / name).read_bytes() for name in ("results.json", "report.md", "demo.html")}
        subprocess.run(command, cwd=ROOT, check=True, capture_output=True)
        self.assertEqual(outputs, {name: (ROOT / "tmp/fidelity" / name).read_bytes() for name in outputs})
        self.assertEqual(before, {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in before})
        result = subprocess.run(command + ["--out", str(ROOT / ".local")], cwd=ROOT, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(database_before, hashlib.sha256(database.read_bytes()).hexdigest() if database.exists() else None)


if __name__ == "__main__":
    unittest.main()
