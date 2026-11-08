import pytest
@pytest.fixture(autouse=True)
def isolated_test_database(tmp_path,monkeypatch):
    monkeypatch.setenv('PULSO_DB_PATH',str(tmp_path/'test.sqlite3'))
    monkeypatch.setenv('PULSO_TEST_MODE','synthetic-only')
