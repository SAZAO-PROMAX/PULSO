from copy import deepcopy
import contextlib
import io
import json
from unittest import TestCase
from unittest.mock import patch

from services.fidelity import run, study
from services.fidelity.normalized import VERSION, classify


class Consistency(TestCase):
    def test_normalized_tables_execute_all_pairs(self):
        pairs, truth = run.load_corpus()
        rows = run.evaluate(pairs, truth)
        self.assertEqual(VERSION, "normalized-1.0")
        for pair, row in zip(pairs, rows):
            self.assertEqual(row["normalized"], classify(pair["source"], pair["destination"])["outcome"])
            self.assertEqual(row["normalized"], truth[pair["id"]]["outcome"])
        report = run.markdown(rows, {})
        self.assertIn("| all | normalized | 30/30 |", report)
        self.assertIn("| PULSO | Normalizado |", report)

    def test_study_entrypoints_share_inputs_and_implementation(self):
        pairs, _ = run.load_corpus()
        packet = deepcopy(pairs[0])
        packet["id"] = "I01"
        text = json.dumps(packet)
        captured = {}
        def remember_script(source, destination):
            captured["script"] = (source, destination)
            return classify(source, destination)
        def remember_pulso(source, destination, evidence, errors):
            captured["pulso"] = (source, destination)
            return run.compare(source, destination, evidence, errors)
        for tool in ("script", "pulso"):
            with patch("sys.argv", ["study", tool, "packet.json"]), patch.object(study.Path, "read_text", return_value=text), patch.object(study, "read_original", return_value=("sources/I01.txt", "original comum")), patch.object(study, "location_errors", return_value={}), patch.object(study, "classify", side_effect=remember_script), patch.object(study, "compare", side_effect=remember_pulso), patch.object(study.Path, "write_text"), patch.object(study.Path, "mkdir"), contextlib.redirect_stdout(io.StringIO()):
                study.main()
        self.assertEqual(captured["script"], captured["pulso"])
        self.assertEqual(captured["script"], (packet["source"], packet["destination"]))
