"""No demo bypass on the normal database, even if a flag is accidentally set."""
import os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def synthetic_test_mode():
    if os.getenv('PULSO_TEST_MODE')!='synthetic-only' or not os.getenv('PULSO_DB_PATH'):return False
    path=Path(os.environ['PULSO_DB_PATH']).resolve()
    return path.is_relative_to((ROOT/'tmp').resolve()) and path.suffix in {'.db','.sqlite','.sqlite3'}
