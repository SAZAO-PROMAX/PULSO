"""Create a source-only ZIP, without local tools, secrets or dependencies."""
from pathlib import Path
import os
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
excluded = {'.git', '.tools', '.venv', 'node_modules', 'dist', '__pycache__', '.pytest_cache', '.expo', 'test-results', 'playwright-report', 'tmp', '.local'}
with ZipFile(root / 'PULSO-starter-v0.2.zip', 'w', ZIP_DEFLATED) as archive:
    for folder, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in excluded]
        for name in files:
            if name.endswith(('.zip', '.log', '.pem', '.key')) or name.startswith('.env'):
                continue
            path = Path(folder) / name
            archive.write(path, path.relative_to(root))
print('PULSO-starter-v0.2.zip atualizado (apenas fontes).')


