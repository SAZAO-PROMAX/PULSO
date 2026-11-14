"""Apresenta um único pacote sintético sem carregar títulos, classes ou oráculos do ensaio."""
import argparse
import json
from pathlib import Path
import re

from .compare import compare
from .run import ROOT, html_report, location_errors, read_original
from .normalized import classify


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tool", choices=["pulso", "script"])
    parser.add_argument("packet", type=Path)
    args = parser.parse_args()
    pair = json.loads(args.packet.read_text(encoding="utf-8"))
    if pair.get("synthetic") is not True or not re.fullmatch(r"I0[1-6]", pair.get("id", "")):
        parser.error("Esperado pacote sintético I01–I06.")
    name, original = read_original(pair, args.packet.resolve().parent)
    if args.tool == "script":
        print(json.dumps(classify(pair["source"], pair["destination"]), indent=2))
        return
    result = compare(pair["source"], pair["destination"], pair.get("evidence") or {},
                     location_errors(pair, name, original))
    row = dict(id=pair["id"], title="Investigação", pulso=result["outcome"], original=original, result=result)
    output = ROOT / "tmp/study" / (pair["id"] + ".html")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html_report([row], study=True), encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
