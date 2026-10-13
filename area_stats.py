#!/usr/bin/env python3
"""Live listing snapshot for every study area (track A — runs daily in GitHub Actions).

For each of the 77 municipalities in data/locations.json:
  • used condos (SUUMO 中古マンション, bs=011): total listings, and every listing ≥ 90 m²
    (de-duplicated: the same unit posted by several agents counts once — key = name + m² + price)
    → count, median price, median ¥/m², count under ¥80M, count under ¥80M built ≥ 2000
  • new condos (SUUMO 新築マンション, bs=010): developer projects on sale (cards with
    「間取りタイプ別価格」) vs. never-occupied units resold by agents (新築未入居)

Writes  area-stats.js                 const AREA_STATS = {generated, areas:{id:{…}}}
        area-listings.js              const AREA_LISTINGS — every de-duplicated ≥90 m² unit per area (light list in
                                      the map panel; all prices, flagged against UNDER), lazy-loaded by the map
        data/area_listings_state.json first-seen date + first price per SUUMO id → "new" / "price cut" badges
        data/area_stats_history.json  {id: {date: [n90, median90, u80, projects, u80modern, n90modern, m2price90modern, u80w, n90w, m2price90w]}}
                                      (last 180 days; the last three since 2026-10-13)
  • monthly fees (管理費 + 修繕積立金) for the watchlist areas only, from today's mansions.json (the
    condo scraper reads each listing's detail page; runs before this step): AREA_STATS.areas[id].fees

The study scores in data/locations.json are NOT changed by this (they are track B, frozen at the
study date) — the map shows these numbers as "live now" next to the study values.
Method notes: data/DATA_LOG.md (item 4).
"""
import json
from collections import Counter
import re
import statistics
import sys
import time
import unicodedata
from datetime import date, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = ("https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs={bs}&ta={ta}&sc={sc}"
       "&kb=1&kt=9999999&mb={mb}&mt=9999999&tj=0&cnb=0&cn=9999999&srch_navi=1&pc=100&page={page}")
OUT_JS = Path("area-stats.js")
OUT_LIST = Path("area-listings.js")                 # light 90 m²+ lists for every area (map panel)
STATE = Path("data/area_listings_state.json")       # {ncId: [firstSeen, firstPrice万, lastSeen]}, "_seeded": {area: date}
NC_RE = re.compile(r"(/ms/chuko/.*?/)nc_(\d+)/")    # SUUMO needs the full path (short /nc_ URLs 404)
HIST = Path("data/area_stats_history.json")
DELAY = 1.0
MAX_PAGES = 12
UNDER = 8000            # 万円 — the study's affordability line for a ~¥10M household

S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
                  "Accept-Language": "ja", "Referer": "https://suumo.jp/"})


def nfkc(t):
    return unicodedata.normalize("NFKC", t or "")


def get(url):
    for i in range(3):
        try:
            r = S.get(url, timeout=30)
            r.raise_for_status(); r.encoding = "utf-8"
            time.sleep(DELAY)
            return r.text
        except requests.RequestException as e:
            print("  warn", e, file=sys.stderr); time.sleep(4 * (i + 1))
    return None


def price(t):          # → 万円
    t = nfkc(t).split("～")[0].split("~")[0]
    m = re.search(r"(?:(\d+)億)?\s*(\d+)?万", t)
    if m and (m.group(1) or m.group(2)):
        return int(m.group(1) or 0) * 10000 + int(m.group(2) or 0)
    m = re.search(r"(\d+)億", t)
    return int(m.group(1)) * 10000 if m else None


def m2(t):
    m = re.search(r"([\d.]+)\s*m", nfkc(t)); return float(m.group(1)) if m else None


def year(t):
    m = re.search(r"(\d{4})年", t or ""); return int(m.group(1)) if m else None


def hits(soup):
    e = soup.select_one(".pagination_set-hit")
    return int(re.sub(r"\D", "", e.get_text())) if e else 0


def used(ta, sc, name):
    h = get(URL.format(bs="011", ta=ta, sc=sc, mb=0, page=1))
    if h is None:
        raise RuntimeError("total fetch failed")
    total = hits(BeautifulSoup(h, "html.parser"))
    units, raw = {}, 0
    for p in range(1, MAX_PAGES + 1):
        h = get(URL.format(bs="011", ta=ta, sc=sc, mb=90, page=p))
        if h is None:
            raise RuntimeError(f"90m2 page {p} failed")
        cards = BeautifulSoup(h, "html.parser").select("div.property_unit")
        for u in cards:
            d = {dt.get_text(strip=True): dt.find_next_sibling("dd").get_text(" ", strip=True)
                 for dt in u.find_all("dt") if dt.find_next_sibling("dd")}
            if d.get("所在地") and name not in nfkc(d["所在地"]):
                continue
            pr, a = price(d.get("販売価格", "")), m2(d.get("専有面積", ""))
            if not pr or not a or a < 90:
                continue
            raw += 1
            bname = re.sub(r"\s+", "", nfkc(d.get("物件名", "")))
            link = u.find("a", href=NC_RE)
            m = NC_RE.search(link["href"]) if link else None
            nc = (m.group(2), m.group(1)) if m else None      # (id, path prefix)
            k = (bname, round(a, 1), pr)
            if k in units:                      # same unit from another agent → remember its id too
                if nc: units[k][3].append(nc)
                continue
            st = re.search(r"「(.+?)」", nfkc(d.get("沿線・駅", "")))
            wk = re.search(r"歩\s*(\d+)\s*分", nfkc(d.get("沿線・駅", "")))
            lay = re.search(r"\d+[SLDK]+|ワンルーム", nfkc(d.get("間取り", "")))
            units[k] = (pr, a, year(d.get("築年月", "")), [nc] if nc else [],
                        nfkc(d.get("物件名", "")).strip()[:40], lay.group(0) if lay else "",
                        st.group(1) if st else "", int(wk.group(1)) if wk else None, "バス" in nfkc(d.get("沿線・駅", "")))
        if len(cards) < 100:
            break
    v = list(units.values())
    mod = [x for x in v if (x[2] or 0) >= 2000]
    wv = [(x, age_w(x[2])) for x in v if age_w(x[2]) > 0]      # space v3: age-weighted stock
    return {
        "total": total, "raw90": raw, "n90": len(v),
        "median90": int(statistics.median(x[0] for x in v) * 10000) if v else None,
        "median90to105": int(statistics.median(x[0] for x in v if x[1] <= 105) * 10000) if any(x[1] <= 105 for x in v) else None,
        "n90to105": sum(x[1] <= 105 for x in v),
        "m2price90": int(statistics.median(x[0] / x[1] for x in v) * 10000) if v else None,
        "u80": sum(x[0] < UNDER for x in v),
        "u80modern": sum(x[0] < UNDER and (x[2] or 0) >= 2000 for x in v),
        "n90modern": len(mod),                # scored stock (space v2): ≥90 m², built 2000+
        "m2price90modern": int(statistics.median(x[0] / x[1] for x in mod) * 10000) if mod else None,
        "u80w": round(sum(w for x, w in wv if x[0] < UNDER), 1),     # scored (v3): weighted count under ¥80M
        "n90w": round(sum(w for _, w in wv), 1),
        "m2price90w": int(wmedian([(x[0] / x[1], w) for x, w in wv]) * 10000) if wv else None,
        "_units": v,                          # popped by main() → area-listings.js
    }


# Space v3 (build_locations.AGE_W): 2000+ = 1 · 1990s = 0.6 · 1983–89 = 0.3 · older/unknown = 0
AGE_W = ((2000, 1.0), (1990, 0.6), (1983, 0.3))


def age_w(y):
    return next((w for y0, w in AGE_W if y and y >= y0), 0.0)


def wmedian(pairs):
    pairs = sorted(p for p in pairs if p[1] > 0)
    tot, acc = sum(w for _, w in pairs), 0.0
    for val, w in pairs:
        acc += w
        if acc >= tot / 2:
            return val
    return None


PRICE_RE = re.compile(r"(?:(\d+)億)?(\d+)万円|(\d+)億円")


def project_row(href, nm, t):
    """New-condo project card → [path, name, priceMin万, priceMax万, m²min, m²max, station, walk, bus, delivery, units].
    Prices/areas span every phase and plan type on the card; None when SUUMO says 価格未定."""
    pr = [int(m[2]) * 10000 if m[2] else int(m[0] or 0) * 10000 + int(m[1]) for m in PRICE_RE.findall(t)]
    pr = [v for v in pr if 1000 <= v <= 100000]
    m2 = [float(x) for x in re.findall(r"(\d+(?:\.\d+)?)m 2", t)]
    m2 = [x for x in m2 if 15 <= x <= 300]
    st = re.search(r"交通 (\S+)(?: (?:徒歩(\d+)分|(バス)))?", t)
    dl = re.search(r"引渡時期 (\S+)", t)
    un = re.search(r"総戸数\s*(\d+)", t)
    return [href, nm, min(pr) if pr else None, max(pr) if pr else None, min(m2) if m2 else None, max(m2) if m2 else None,
            st[1].split("/")[-1] if st else None, int(st[2]) if st and st[2] else None, bool(st and st[3]),
            dl[1].replace("予定", "") if dl else None, int(un[1]) if un else None]


def new(ta, sc, name):
    projects, units, rows = {}, 0, {}
    for p in range(1, 4):
        h = get(URL.format(bs="010", ta=ta, sc=sc, mb=0, page=p))
        if h is None:
            raise RuntimeError(f"new page {p} failed")
        cards = BeautifulSoup(h, "html.parser").select("div.property_unit")
        for u in cards:
            a = u.find("a", href=re.compile(r"/nc_\d+/"))
            t = nfkc(u.get_text(" ", strip=True))
            if "所在地" in t and name not in t:      # guard: empty areas can show neighbouring cities
                continue
            if "間取りタイプ別価格" in t:
                nm = u.select_one(".property_unit-title, h2")
                key = a["href"] if a else len(projects)
                projects[key] = nfkc(nm.get_text(" ", strip=True))[:60] if nm else ""
                if a and projects[key]:
                    rows[key] = project_row(a["href"], projects[key], t)
            else:
                units += 1
        if len(cards) < 100:
            break
    return {"projects": len(projects), "projectNames": sorted(set(v for v in projects.values() if v))[:12], "newUnits": units,
            "_new": sorted(rows.values(), key=lambda r: (r[2] is None, r[2] or 0))}


def area_codes():
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    bnd = {f["name"]: f["code"] for f in json.load(open("data/boundaries.json", encoding="utf-8"))["features"]}
    return [(a["id"], bnd[a["nameJa"]], a["nameJa"]) for a in loc["areas"]]


def fees():
    """Median monthly 管理費 + 修繕積立金 of watchlist condos ≥90 m² (scored stock = built 2000+; all ages as context)."""
    src = Path("mansions.json")
    if not src.exists():
        return {}
    sc = {a["key"]: a["sc"] for a in json.load(open("areas.json", encoding="utf-8"))}
    sid = {code: aid for aid, code, _ in area_codes()}
    groups = {}
    for m in json.loads(src.read_text(encoding="utf-8")):
        aid = sid.get(sc.get(m.get("areaKey")))
        f = (m.get("mgmtFee") or 0) + (m.get("repairFund") or 0)
        if aid and f and (m.get("areaM2") or 0) >= 90:
            groups.setdefault(aid, []).append((f, m["areaM2"], m.get("builtYear") or 0))
    out = {}
    for aid, xs in groups.items():
        mod = [x for x in xs if x[2] >= 2000]
        med = lambda v: round(statistics.median(v)) if v else None
        out[aid] = {"n": len(mod), "monthly": med([x[0] for x in mod]), "perM2": med([x[0] / x[1] for x in mod]),
                    "nAll": len(xs), "monthlyAll": med([x[0] for x in xs]), "perM2All": med([x[0] / x[1] for x in xs])}
    return out


def read_js(path):
    if not path.exists():
        return {}
    txt = path.read_text(encoding="utf-8")
    start = txt.index("{", txt.index(" = "))           # skip the header comment
    return json.loads(txt[start:txt.rstrip().rstrip(";").rindex("}") + 1])


def light_list(units, state, aid, today):
    """{base, rows} for area-listings.js; row = [ncId, name, price万, m², layout, year, station, walk, bus, firstSeen, was万|null].
    firstSeen = earliest sighting of any of the unit's agent ids; was = highest first price seen if the unit is now cheaper."""
    seeded = state["_seeded"].setdefault(aid, today)          # first run for an area: nothing is "new"
    rows = []
    base = Counter(pre for u in units for _, pre in u[3]).most_common(1)
    base = base[0][0] if base else ""
    for pr, a, yr, ncs, nm, lay, st, wk, bus in sorted(units, key=lambda x: x[0]):
        link = (ncs[0][0] if ncs[0][1] == base else ncs[0][1] + ncs[0][0]) if ncs else None
        ncs = [n for n, _ in ncs]
        for nc in ncs:
            s = state["ids"].setdefault(nc, [today, pr, today])
            s[2] = today
        seen = [state["ids"][nc] for nc in ncs]
        first = min((s[0] for s in seen), default=today)
        was = max((s[1] for s in seen), default=pr)
        rows.append([link, nm, pr, round(a, 1), lay, yr, st, wk, bus,
                     None if first <= seeded else first, was if was > pr else None])
    return {"base": base, "rows": rows}


def new_projects(rows, state, aid, today):
    """Append firstSeen (null on an area's first run) to each new-condo project row; state["proj"][path] = [first, last]."""
    seeded = state.setdefault("_pseeded", {}).setdefault(aid, today)
    out = []
    for r in rows:
        s = state.setdefault("proj", {}).setdefault(r[0], [today, today])
        s[1] = today
        out.append(r + [None if s[0] <= seeded else s[0]])
    return out


def main():
    prev = read_js(OUT_JS).get("areas", {})
    prev_list = read_js(OUT_LIST).get("areas", {})
    state = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}
    state.setdefault("ids", {}); state.setdefault("_seeded", {})
    hist = json.loads(HIST.read_text(encoding="utf-8")) if HIST.exists() else {}
    today = date.today().isoformat()
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
    out, lists, failed = {}, {}, []
    for aid, code, name in area_codes():
        if only and aid not in only:
            if aid in prev: out[aid] = prev[aid]
            if aid in prev_list: lists[aid] = prev_list[aid]
            continue
        ta, sc = code[:2], code
        try:
            rec = {**used(ta, sc, name), **new(ta, sc, name), "date": today}
            lists[aid] = light_list(rec.pop("_units"), state, aid, today)
            lists[aid]["newp"] = new_projects(rec.pop("_new"), state, aid, today)
            print(f"{aid:22} total {rec['total']:5}  ≥90m² {rec['n90']:4} (raw {rec['raw90']})  "
                  f"median {rec['median90'] and rec['median90'] // 10**6}M  <80M {rec['u80']:3}  new projects {rec['projects']}", flush=True)
        except Exception as e:
            failed.append(aid); print(f"{aid:22} FAILED {e}", flush=True)
            if aid in prev:
                out[aid] = {**prev[aid], "stale": True}
            if aid in prev_list:
                lists[aid] = prev_list[aid]
            continue
        h = hist.setdefault(aid, {})
        # [n90, median90, u80, projects, u80modern, n90modern, m2price90modern, u80w, n90w, m2price90w] — the last
        # three (age-weighted, space v3) feed the 30-day smoothing of the space score (DATA_LOG items 12, 22)
        h[today] = [rec["n90"], rec["median90"], rec["u80"], rec["projects"],
                    rec["u80modern"], rec["n90modern"], rec["m2price90modern"], rec["u80w"], rec["n90w"], rec["m2price90w"]]
        for d in sorted(h)[:-180]:
            del h[d]
        # change vs the latest snapshot at least 7 / 30 days old: [Δ n90, Δ u80, Δ projects]
        for key, days in (("d7", 7), ("d30", 30)):
            ref = [d for d in sorted(h) if (date.fromisoformat(today) - date.fromisoformat(d)).days >= days]
            r = h[ref[-1]] if ref else None
            rec[key] = [rec["n90"] - r[0], rec["u80"] - r[2], rec["projects"] - r[3]] if r else None
        out[aid] = rec
    fee = fees()
    for aid, rec in out.items():
        rec.pop("fees", None)
        if aid in fee:
            rec["fees"] = fee[aid]
    if len(failed) > len(out) / 2:
        raise SystemExit(f"too many failures ({len(failed)}) — keeping the previous file")
    OUT_JS.write_text("/* generated daily by area_stats.py — do not edit */\nconst AREA_STATS = " +
                      json.dumps({"generated": today, "areas": out, "failed": failed}, ensure_ascii=False, separators=(",", ":")) + ";\n",
                      encoding="utf-8")
    HIST.write_text(json.dumps(hist, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    OUT_LIST.write_text("/* generated daily by area_stats.py — do not edit. Per area {base: SUUMO path, rows}; row: [ncId (or path+ncId when not under base), name, price万, m², layout, year, station, "
                        "walk, bus, firstSeen|null, was万|null]; newp = new-condo projects [path, name, priceMin万, priceMax万, m²min, m²max, station, walk, bus, delivery, units, firstSeen|null] */\nconst AREA_LISTINGS = " +
                        json.dumps({"generated": today, "under": UNDER, "areas": lists}, ensure_ascii=False, separators=(",", ":")) + ";\n",
                        encoding="utf-8")
    cutoff = (date.fromisoformat(today) - timedelta(days=30)).isoformat()   # forget ids unseen for 30 days
    state["ids"] = {k: v for k, v in state["ids"].items() if v[2] >= cutoff}
    state["proj"] = {k: v for k, v in state.get("proj", {}).items() if v[1] >= cutoff}
    STATE.write_text(json.dumps(state, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT_JS}: {len(out)} areas, {len(failed)} failed; {OUT_LIST}: {sum(len(v['rows']) for v in lists.values())} units")


if __name__ == "__main__":
    main()
