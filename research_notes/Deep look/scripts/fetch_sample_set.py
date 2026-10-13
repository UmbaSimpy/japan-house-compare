"""Fetch a spread of SUUMO listing main pages (condos across areas/ages + houses) for fill-rate analysis."""
import json
import random
import sys
import time
from pathlib import Path

import requests

PROJ = Path(r"D:\Cartella Privata\Claude\japan-house-compare")
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
S = requests.Session()
S.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
random.seed(7)
ms = json.load(open(PROJ / "mansions.json", encoding="utf-8"))
pick = []
for band in [(0, 1982), (1982, 2000), (2000, 2010), (2010, 2030)]:
    pool = [m for m in ms if band[0] <= (m.get("builtYear") or 0) < band[1] and (m.get("areaM2") or 0) >= 70]
    by_area = {}
    for m in pool:
        by_area.setdefault(m["areaKey"], []).append(m)
    keys = sorted(by_area)
    random.shuffle(keys)
    for k in keys[:10]:
        pick.append(("ms", random.choice(by_area[k])["suumoUrl"]))
hs = json.load(open(PROJ / "listings.json", encoding="utf-8"))
pick += [("house", h["suumoUrl"]) for h in random.sample(hs, min(15, len(hs)))]
print(len(pick), "pages")
for kind, url in pick:
    nc = url.rstrip("/").split("/")[-1]
    f = OUT / f"{kind}_{nc}.html"
    if f.exists():
        continue
    try:
        r = S.get(url, timeout=30)
        if r.status_code == 200:
            f.write_text(r.text, encoding="utf-8")
        print(kind, nc, r.status_code)
    except Exception as e:
        print(kind, nc, "ERR", e)
    time.sleep(2)
