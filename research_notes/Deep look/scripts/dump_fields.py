"""Dump every th/td (and dt/dd) pair plus headings from saved SUUMO pages → one text file per page."""
import re
import sys
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup

RAW, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(exist_ok=True)
n = lambda t: re.sub(r"\s+", " ", unicodedata.normalize("NFKC", t or "")).strip()
for f in sorted(RAW.glob("*.html")):
    soup = BeautifulSoup(f.read_text(encoding="utf-8"), "html.parser")
    for s in soup(["script", "style", "noscript"]):
        s.decompose()
    lines, seen = [], set()
    for th in soup.find_all(["th", "dt"]):
        td = th.find_next_sibling(["td", "dd"])
        if not td:
            continue
        k, v = n(th.get_text(" ")), n(td.get_text(" "))
        if (k, v) in seen or not k:
            continue
        seen.add((k, v))
        lines.append(f"[{k}] {v[:400]}")
    heads = [n(h.get_text(" "))[:80] for h in soup.find_all(["h1", "h2", "h3"]) if n(h.get_text(" "))]
    # feature-chip lists (特徴ピックアップ etc.)
    chips = [n(li.get_text(" ")) for ul in soup.select("ul") for li in ul.find_all("li", recursive=False)
             if 2 <= len(n(li.get_text(" "))) <= 25]
    (OUT / (f.stem + ".txt")).write_text(
        "## HEADINGS\n" + "\n".join(dict.fromkeys(heads)) + "\n\n## FIELDS\n" + "\n".join(lines)
        + "\n\n## SHORT LIST ITEMS\n" + " | ".join(dict.fromkeys(chips)), encoding="utf-8")
    print(f.stem, len(lines), "fields")
