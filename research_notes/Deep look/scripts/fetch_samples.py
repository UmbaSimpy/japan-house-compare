"""Fetch sample SUUMO listing pages + every sub-tab they link to, into an isolated raw folder."""
import re
import sys
import time
from pathlib import Path

import requests

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
S = requests.Session()
S.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

SAMPLES = {
    "ms_used_2010": "https://suumo.jp/ms/chuko/chiba/sc_chibashimihama/nc_21658849/",
    "ms_used_1975": "https://suumo.jp/ms/chuko/chiba/sc_chibashimihama/nc_78512697/",
    "house_used": "https://suumo.jp/chukoikkodate/chiba/sc_chibashimihama/nc_20822036/",
    "ms_new": "https://suumo.jp/ms/shinchiku/chiba/sc_chibashimihama/nc_67736149/",
}
for key, url in SAMPLES.items():
    f = OUT / f"{key}__main.html"
    if f.exists():
        class R: pass
        r = R(); r.text = f.read_text(encoding="utf-8"); r.status_code = "cached"
    else:
        r = S.get(url, timeout=30)
        f.write_text(r.text, encoding="utf-8")
    print(key, r.status_code, len(r.text))
    nc = re.search(r"nc_\d+", url)[0]
    subs = sorted(set(re.findall(r'href="(?:https://suumo\.jp)?(/[^"]*' + nc + r'/[a-z_]+/)', r.text)))
    print("   tabs:", subs)
    for s in subs:
        time.sleep(1.5)
        rr = S.get("https://suumo.jp" + s, timeout=30)
        name = s.rstrip("/").split("/")[-1]
        (OUT / f"{key}__{name}.html").write_text(rr.text, encoding="utf-8")
        print("   ", name, rr.status_code, len(rr.text))
    time.sleep(1.5)
