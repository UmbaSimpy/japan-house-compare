#!/usr/bin/env python3
"""Detached-house snapshot for every study area — input of the Houses area map (DATA_LOG item 19).

For each of the 77 municipalities in data/locations.json (SUUMO, same area codes as area_stats.py):
  • used houses (中古一戸建て, bs=021) with building ≥100 m² and age ≤30 years (cn=30), every page;
  • new houses  (新築一戸建て, bs=020) with building ≥100 m², every page. A new-build card can list
    several homes ("4980万円・5790万円", "70.19m²・100m²"); when the price / land / building lists have the
    same length they are paired into one row per home, otherwise the card counts as one home
    (lowest price, largest building).
  Suitable stock (scored) = building ≥100 m² AND built 2000+ (all new builds qualify).
  • feature counts with SUUMO's own search filters, building ≥100 m² (used: cn=25 ≈ built 2001+; new: all):
    2-car parking, 3+ cars, solar, 長期優良住宅, 低炭素住宅, 住宅性能評価書, inspection, 瑕疵保険,
    low-rise residential zone, 3+ storeys. Shares are "listings that advertise X" (agents fill these in).

Writes  data/house_stats.json      {generated, method, areas:{id:{…}}}
        area-house-listings.js     const AREA_HOUSES = {generated, areas:{id:{rows}}} — light list of suitable homes
                                   row = [path, price万, bldg m², land m², year (0 = new build), station, walk, bus, layout]
Usage:  python house_stats.py [id,id,…]      (no ids = all areas; others are kept from the last run)
"""
import json
import re
import statistics
import sys
import time
import unicodedata
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = ("https://suumo.jp/jj/bukken/ichiran/JJ012FC001/?ar=030&bs={bs}&ta={ta}&sc={sc}"
       "&kb=1&kt=9999999&tb=0&tt=9999999&hb=100&ht=9999999&cnb=0&cn={cn}&pc={pc}&pn={page}{x}")
OUT = Path("data/house_stats.json")
OUT_LIST = Path("area-house-listings.js")
DELAY = 1.0
MAX_PAGES = 20
MIN_BLDG = 100          # m² building floor area (user choice 2026-10-13)
MIN_YEAR = 2000         # 2000 wood-frame code (ground survey, metal joints, wall balance)
UNDER = 8000            # 万円 — same ¥80M line as the condo map
FEATURES = {            # SUUMO search-filter codes (research_notes/Houses and schools/suumo_house_fields.md)
    "park2": "&cj=031", "park3": "&cj=032", "solar": "&ksg=202", "longLife": "&ksg=141", "lowCarbon": "&ksg=298",
    "perfCert": "&kka=313", "inspected": "&kka=301", "defectIns": "&kha=304", "lowRise": "&rt=139", "storey3": "&ks=122",
}
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
                  "Accept-Language": "ja", "Referer": "https://suumo.jp/"})
NFKC = lambda t: unicodedata.normalize("NFKC", t or "")


def get(url):
    for i in range(3):
        try:
            r = S.get(url, timeout=30)
            r.raise_for_status(); r.encoding = "utf-8"
            time.sleep(DELAY)
            return r.text
        except requests.RequestException as e:
            print("  warn", e, file=sys.stderr); time.sleep(4 * (i + 1))
    raise RuntimeError("fetch failed: " + url)


def prices(t):          # → [万円, …] in card order
    out = []
    for m in re.finditer(r"(?:(\d+)億)?\s*(\d+)?万円|(\d+)億円", NFKC(t)):
        v = int(m.group(3)) * 10000 if m.group(3) else int(m.group(1) or 0) * 10000 + int(m.group(2) or 0)
        if 300 <= v <= 100000:
            out.append(v)
    return out


def areas_m2(t):
    return [float(x) for x in re.findall(r"([\d.]+)\s*m\s*2", NFKC(t)) if 20 <= float(x) <= 2000]


def hits(soup, name):
    """Result count, or 0 when SUUMO shows neighbouring areas instead of an empty result."""
    e = soup.select_one(".pagination_set-hit")
    if not e:
        return 0
    first = soup.select_one("div.property_unit")
    if first and "所在地" in first.get_text() and name not in NFKC(first.get_text()):
        return 0
    return int(re.sub(r"\D", "", e.get_text()) or 0)


def cards(bs, ta, sc, name, cn):
    rows, total = [], None
    for p in range(1, MAX_PAGES + 1):
        soup = BeautifulSoup(get(URL.format(bs=bs, ta=ta, sc=sc, cn=cn, pc=100, page=p, x="")), "html.parser")
        if total is None:
            total = hits(soup, name)
            if total == 0:
                return [], 0
        cs = soup.select("div.property_unit")
        for u in cs:
            d = {dt.get_text(strip=True): dt.find_next_sibling("dd").get_text(" ", strip=True)
                 for dt in u.find_all("dt") if dt.find_next_sibling("dd")}
            if d.get("所在地") and name not in NFKC(d["所在地"]):
                continue
            a = u.find("a", href=re.compile(r"/nc_\d+/"))
            rows.append((a["href"] if a else "", d))
        if len(cs) < 100:
            break
    return rows, total


def access(d):
    t = NFKC(d.get("沿線・駅", ""))
    st = re.search(r"「(.+?)」", t)
    wk = re.search(r"歩\s*(\d+)\s*分", t)
    return st.group(1) if st else "", int(wk.group(1)) if wk else None, "バス" in t


def used_rows(ta, sc, name):
    raw, total = cards("021", ta, sc, name, 30)
    seen, out = set(), []
    for href, d in raw:
        pr, ld, bd = prices(d.get("販売価格", "")), areas_m2(d.get("土地面積", "")), areas_m2(d.get("建物面積", ""))
        y = re.search(r"(\d{4})年", d.get("築年月", ""))
        if not pr or not bd:
            continue
        row = [href, pr[0], bd[0], ld[0] if ld else None, int(y.group(1)) if y else None, *access(d),
               (re.search(r"\d+[SLDK+]+", NFKC(d.get("間取り", ""))) or [""])[0]]
        k = (NFKC(d.get("所在地", "")), row[2], row[3], row[1])       # same home from several agents
        if k in seen:
            continue
        seen.add(k); out.append(row)
    return out, total


def new_rows(ta, sc, name):
    raw, total = cards("020", ta, sc, name, 9999999)
    out = []
    for href, d in raw:
        pr, ld, bd = prices(d.get("販売価格", "")), areas_m2(d.get("土地面積", "")), areas_m2(d.get("建物面積", ""))
        if not pr or not bd:
            continue
        st, wk, bus = access(d)
        lay = (re.search(r"\d+[SLDK+]+", NFKC(d.get("間取り", ""))) or [""])[0]
        if len(pr) == len(bd) and (not ld or len(ld) == len(pr)) and "～" not in d.get("販売価格", ""):
            for i in range(len(pr)):
                out.append([href, pr[i], bd[i], ld[i] if ld else None, 0, st, wk, bus, lay])
        else:
            out.append([href, min(pr), max(bd), max(ld) if ld else None, 0, st, wk, bus, lay])
    return out, total


def feature_counts(ta, sc, name):
    res = {}
    for bs, cn, tag in (("021", 25, "u"), ("020", 9999999, "n")):
        base = hits(BeautifulSoup(get(URL.format(bs=bs, ta=ta, sc=sc, cn=cn, pc=10, page=1, x="")), "html.parser"), name)
        res[tag] = {"base": base}
        for k, x in FEATURES.items():
            res[tag][k] = hits(BeautifulSoup(get(URL.format(bs=bs, ta=ta, sc=sc, cn=cn, pc=10, page=1, x=x)), "html.parser"), name) if base else 0
    both = {k: res["u"][k] + res["n"][k] for k in res["u"]}
    share = {k: round(100 * both[k] / both["base"], 1) if both["base"] else None for k in FEATURES}
    return {"featureCounts": res, "featureShare": share, "featureBase": both["base"]}


def med(xs):
    xs = [x for x in xs if x is not None]
    return statistics.median(xs) if xs else None


def stats(rows):
    suit = [r for r in rows if r[2] >= MIN_BLDG and (r[4] == 0 or (r[4] or 0) >= MIN_YEAR)]
    walk = [r[6] for r in suit if r[6] is not None and not r[7]]
    std = [r for r in suit if r[2] <= 130]
    return suit, {
        "nSuit": len(suit), "nNew": sum(r[4] == 0 for r in suit), "nUsed": sum(r[4] != 0 for r in suit),
        "u80": sum(r[1] < UNDER for r in suit),
        "medianPrice": int(med(r[1] for r in suit) * 10000) if suit else None,
        "median100to130": int(med(r[1] for r in std) * 10000) if std else None, "n100to130": len(std),
        "medianBldg": med(r[2] for r in suit), "medianLand": med(r[3] for r in suit),
        "medianLandU80": med(r[3] for r in suit if r[1] < UNDER),
        "landUnder100": round(100 * sum((r[3] or 0) < 100 for r in suit) / len(suit), 1) if suit else None,
        "medianWalk": med(walk), "busShare": round(100 * sum(bool(r[7]) for r in suit) / len(suit), 1) if suit else None,
        "walk15Share": round(100 * sum(r[6] is not None and not r[7] and r[6] <= 15 for r in suit) / len(suit), 1) if suit else None,
    }


def area_codes():
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    bnd = {f["name"]: f["code"] for f in json.load(open("data/boundaries.json", encoding="utf-8"))["features"]}
    return [(a["id"], bnd[a["nameJa"]], a["nameJa"]) for a in loc["areas"]]


def main():
    prev = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"areas": {}}
    m = re.search(r"=\s*(\{.*\});?\s*$", OUT_LIST.read_text(encoding="utf-8"), re.S) if OUT_LIST.exists() else None
    prev_list = json.loads(m.group(1)) if m else {"areas": {}}
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
    today = date.today().isoformat()
    out, lists, failed = {}, {}, []
    for aid, code, name in area_codes():
        if only and aid not in only:
            if aid in prev["areas"]: out[aid] = prev["areas"][aid]
            if aid in prev_list["areas"]: lists[aid] = prev_list["areas"][aid]
            continue
        ta = code[:2]
        try:
            u, ut = used_rows(ta, code, name)
            n, nt = new_rows(ta, code, name)
            suit, rec = stats(u + n)
            rec.update({"usedHits100": ut, "newHits100": nt, **feature_counts(ta, code, name), "date": today})
            out[aid] = rec
            lists[aid] = {"rows": sorted(suit, key=lambda r: r[1])}
            print(f"{aid:22} suitable {rec['nSuit']:4} (new {rec['nNew']:4})  <80M {rec['u80']:4}  median {rec['medianPrice'] and rec['medianPrice'] // 10**6}M  "
                  f"land {rec['medianLand']}  walk {rec['medianWalk']}  park2 {rec['featureShare']['park2']}%  solar {rec['featureShare']['solar']}%", flush=True)
        except Exception as e:
            failed.append(aid); print(f"{aid:22} FAILED {e}", flush=True)
            if aid in prev["areas"]: out[aid] = {**prev["areas"][aid], "stale": True}
            if aid in prev_list["areas"]: lists[aid] = prev_list["areas"][aid]
    method = {"minBldg": MIN_BLDG, "minYear": MIN_YEAR, "under": UNDER, "features": FEATURES,
              "note": "SUUMO 中古/新築一戸建て, building ≥100 m²; suitable = built 2000+ (all new builds). Feature shares = listings matching SUUMO's filter ÷ all ≥100 m² listings (used built ≈2001+, new all)."}
    OUT.write_text(json.dumps({"generated": today, "method": method, "areas": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT_LIST.write_text("const AREA_HOUSES = " + json.dumps({"generated": today, "areas": lists}, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"done: {len(out)} areas, failed {failed}")
    return 1 if failed and len(failed) > len(out) // 4 else 0


if __name__ == "__main__":
    sys.exit(main())
