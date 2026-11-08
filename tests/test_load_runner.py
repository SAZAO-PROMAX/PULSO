"""Test safety boundaries of the harness without starting servers or using real data."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('load_runner', ROOT/'scripts/load_test.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class LoadRunnerSafety(unittest.TestCase):
    def test_refuses_normal_database_and_existing_output(self):
        with self.assertRaises(ValueError): runner.safe_output(ROOT/'.local')
        with self.assertRaises(ValueError): runner.safe_output(ROOT/'tmp')
        with tempfile.TemporaryDirectory(dir=ROOT/'tmp') as directory:
            with self.assertRaises(ValueError): runner.safe_output(Path(directory))

    def test_percentiles_use_observed_samples_and_empty_is_unknown(self):
        self.assertIsNone(runner.percentile([], .95))
        self.assertEqual(runner.percentile([100, 1, 50, 20], .5), 20)
        self.assertEqual(runner.percentile([100, 1, 50, 20], .95), 100)

    def test_fixture_must_stay_inside_synthetic_directory(self):
        with self.assertRaises(ValueError): runner.synthetic_pdf('.local/pulso.sqlite3')
        self.assertTrue(runner.synthetic_pdf('data/synthetic/laboratorio-demo.pdf').startswith(b'%PDF-'))


if __name__ == '__main__': unittest.main()
