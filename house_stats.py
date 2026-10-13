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
        area-house-stats.js        const AREA_HOUSE_STATS = {generated, areas:{id:{u80, nSuit, nNew, median100to130,
                                   medianPrice, date, d7, d30}}} — small, loaded with the page ("Listings now" layer)
        data/house_stats_history.json  {id: {date: [nSuit, u80, priceForScore, n100to130]}} — 30-day smoothing of the
                                   house space score at the next study rebuild (build_locations.py, DATA_LOG item 23)
Daily (GitHub Action, DATA_LOG item 23, user: "the house map should be handled like the apartments one"):
  • lists and prices for every area, oldest snapshot first, until --max-minutes (the rest keep yesterday's data);
  • feature-filter counts (22 requests per area) only for the FEAT_PER_RUN areas with the oldest counts → each
    area is re-counted about weekly.
Usage:  python house_stats.py [id,id,…] [--max-minutes N] [--all-features] [--rebuild-only]
        (no ids = all areas; others are kept from the last run; --rebuild-only re-writes the outputs without fetching)
"""
import json
import re
import statistics
import sys
import time
import unicodedata
from datetime import date, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = ("https://suumo.jp/jj/bukken/ichiran/JJ012FC001/?ar=030&bs={bs}&ta={ta}&sc={sc}"
       "&kb=1&kt=9999999&tb=0&tt=9999999&hb=100&ht=9999999&cnb=0&cn={cn}&pc={pc}&pn={page}{x}")
OUT = Path("data/house_stats.json")
OUT_LIST = Path("area-house-listings.js")
OUT_JS = Path("area-house-stats.js")
HIST = Path("data/house_stats_history.json")
FEAT_PER_RUN = 11       # areas whose feature counts are refreshed per run (77 / 7 ≈ weekly)
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


def price_for_score(rec):
    """build_locations HOUSE space price: median of 100–130 m² homes, all suitable if fewer than 3."""
    return rec.get("median100to130") if (rec.get("n100to130") or 0) >= 3 else rec.get("medianPrice")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opt = lambda k: k in sys.argv
    max_min = next((float(sys.argv[i + 1]) for i, a in enumerate(sys.argv) if a == "--max-minutes"), None)
    prev = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"areas": {}}
    m = re.search(r"=\s*(\{.*\});?\s*$", OUT_LIST.read_text(encoding="utf-8"), re.S) if OUT_LIST.exists() else None
    prev_list = json.loads(m.group(1)) if m else {"areas": {}}
    hist = json.loads(HIST.read_text(encoding="utf-8")) if HIST.exists() else {}
    only = args[0].split(",") if args else None
    today = date.today().isoformat()
    t0 = time.time()
    P = prev["areas"]
    codes = sorted(area_codes(), key=lambda c: P.get(c[0], {}).get("date", ""))          # oldest snapshot first
    feat_due = {c[0] for c in sorted(codes, key=lambda c: P.get(c[0], {}).get("featureDate") or P.get(c[0], {}).get("date", ""))
                [:len(codes) if opt("--all-features") else FEAT_PER_RUN]}
    out, lists, failed, kept = {}, {}, [], []
    for aid, code, name in codes:
        late = max_min is not None and time.time() - t0 > max_min * 60
        if opt("--rebuild-only") or (only and aid not in only) or late:
            if aid in P: out[aid] = P[aid]
            if aid in prev_list["areas"]: lists[aid] = prev_list["areas"][aid]
            if late: kept.append(aid)
            continue
        ta = code[:2]
        try:
            u, ut = used_rows(ta, code, name)
            n, nt = new_rows(ta, code, name)
            suit, rec = stats(u + n)
            if aid in feat_due or not P.get(aid, {}).get("featureShare"):
                feats = {**feature_counts(ta, code, name), "featureDate": today}
            else:
                feats = {k: P[aid].get(k) for k in ("featureCounts", "featureShare", "featureBase", "featureDate")}
            rec.update({"usedHits100": ut, "newHits100": nt, **feats, "date": today})
            out[aid] = rec
            lists[aid] = {"rows": sorted(suit, key=lambda r: r[1])}
            print(f"{aid:22} suitable {rec['nSuit']:4} (new {rec['nNew']:4})  <80M {rec['u80']:4}  median {rec['medianPrice'] and rec['medianPrice'] // 10**6}M  "
                  f"land {rec['medianLand']}  walk {rec['medianWalk']}  park2 {(rec.get('featureShare') or {}).get('park2')}%"
                  f"{'  (features refreshed)' if aid in feat_due else ''}", flush=True)
        except Exception as e:
            failed.append(aid); print(f"{aid:22} FAILED {e}", flush=True)
            if aid in P: out[aid] = {**P[aid], "stale": True}
            if aid in prev_list["areas"]: lists[aid] = prev_list["areas"][aid]
    # history (one row per area per snapshot date) + 7/30-day change, as area_stats.py does for condos
    small = {}
    for aid, rec in out.items():
        h = hist.setdefault(aid, {})
        if rec.get("date") and not rec.get("stale"):
            h[rec["date"]] = [rec["nSuit"], rec["u80"], price_for_score(rec), rec.get("n100to130")]
        for d in sorted(h)[:-180]:
            del h[d]
        cur = h.get(rec.get("date")) or [rec.get("nSuit"), rec.get("u80")]
        delta = {}
        for key, days in (("d7", 7), ("d30", 30)):
            ref = [d for d in sorted(h) if rec.get("date") and (date.fromisoformat(rec["date"]) - date.fromisoformat(d)).days >= days]
            delta[key] = [cur[0] - h[ref[-1]][0], cur[1] - h[ref[-1]][1]] if ref else None
        small[aid] = {"u80": rec.get("u80"), "nSuit": rec.get("nSuit"), "nNew": rec.get("nNew"),
                      "median100to130": rec.get("median100to130"), "medianPrice": rec.get("medianPrice"),
                      "date": rec.get("date"), "stale": bool(rec.get("stale")), **delta}
    method = {"minBldg": MIN_BLDG, "minYear": MIN_YEAR, "under": UNDER, "features": FEATURES, "featurePerRun": FEAT_PER_RUN,
              "note": "SUUMO 中古/新築一戸建て, building ≥100 m²; suitable = built 2000+ (all new builds). Feature shares = listings matching SUUMO's filter ÷ all ≥100 m² listings (used built ≈2001+, new all); re-counted about weekly (featureDate)."}
    gen = max((r.get("date") or "" for r in out.values()), default=today)
    OUT.write_text(json.dumps({"generated": gen, "method": method, "areas": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT_LIST.write_text("const AREA_HOUSES = " + json.dumps({"generated": gen, "areas": lists}, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    OUT_JS.write_text("/* generated daily by house_stats.py — do not edit. Detached houses ≥100 m², built 2000+ or new, per study area. */\n"
                      "const AREA_HOUSE_STATS = " + json.dumps({"generated": gen, "areas": small}, ensure_ascii=False, separators=(",", ":")) + ";\n",
                      encoding="utf-8")
    HIST.write_text(json.dumps(hist, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"done: {len(out)} areas, failed {failed}, kept from last run (time cap) {len(kept)}")
    return 1 if failed and len(failed) > len(out) // 4 else 0


if __name__ == "__main__":
    sys.exit(main())
