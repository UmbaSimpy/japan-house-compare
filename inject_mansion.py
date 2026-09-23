#!/usr/bin/env python3
"""
Reads mansions.json (from scraper_mansion.py), deduplicates, derives metrics,
scores every condo, writes mansions_clean.json and embeds the data into
suumo-compare.html (`const mansions = [...]` / `const mansionHistory = [...]`).

Scores are computed here only — the site and notify.py both read them,
so there is a single source of truth.

SCORING (100 pts)
  VALUE     25  Price/m² vs what similar condos cost (age, walk, station,
                tower, renovated, elevator) — regression residual,
                percentile-ranked.
  ACCESS    20  Door-to-station minutes: ≤5=20 ≤10=16 ≤15=12 ≤20=8 ≤30=4.
  CONDITION 20  Age: ≤5y=16 ≤10=14 ≤15=12 ≤20=10 ≤30=7, older but built
                1982+ (新耐震)=4, pre-1982=0.  Renovated +4.
  RUNNING   15  Monthly 管理費+修繕積立金 per m², percentile (cheaper wins).
  SPACE     10  Floor area, percentile.
  EXTRAS    10  Floor ≥10F +3 / ≥4F +2 / ≥2F +1, south-ish +2, elevator +2,
                on-site parking +1, pets OK +1, ≥50 units +1; leasehold −3,
                liquefaction risk high −2 / somewhat high −1 (see hazard.py).
"""

import json
import math
import re
from collections import Counter
from datetime import date
from pathlib import Path

import hazard

SRC      = Path("mansions.json")
CLEAN     = Path("mansions_clean.json")
HISTORY   = Path("mansion_history.json")
HTML      = Path("suumo-compare.html")
AREA_JA   = {a["key"]: a.get("nameJa") for a in json.loads(Path("areas.json").read_text(encoding="utf-8"))}
SHIN_TAISHIN_YEAR = 1982   # 新耐震 (post-June-1981 code); also the 住宅ローン控除 cut-off


def age_of(year, month, today):
    if not year:
        return None
    return max(0, today.year - year - (1 if today.month < (month or 1) else 0))


def percentile_ranks(values):
    """Map each value to its rank in [0,1] (0 = smallest). None stays None."""
    present = sorted(v for v in values if v is not None)
    n = len(present)
    if n <= 1:
        return [0.5 if v is not None else None for v in values]
    out = []
    for v in values:
        if v is None:
            out.append(None)
            continue
        lo = sum(1 for x in present if x < v)
        eq = sum(1 for x in present if x == v)
        out.append((lo + (eq - 1) / 2) / (n - 1))
    return out


# ── Fair-price model: log(万/m²) ~ age, age², walk, tower, station ──
def solve(A, b):
    """Gaussian elimination for a small dense system."""
    n = len(A)
    M = [row[:] + [b[i]] for i, row in enumerate(A)]
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[p] = M[p], M[c]
        if abs(M[c][c]) < 1e-12:
            continue
        for r in range(n):
            if r != c:
                f = M[r][c] / M[c][c]
                M[r] = [x - f * y for x, y in zip(M[r], M[c])]
    return [M[i][n] / M[i][i] if abs(M[i][i]) > 1e-12 else 0.0 for i in range(n)]


def fair_price_residuals(rows):
    """Return log-residuals (actual − expected price/m²). Negative = cheaper than peers."""
    stations = [s for s, c in Counter(r["station"] for r in rows).items() if c >= 15]

    def feats(r):
        a = r["age"] if r["age"] is not None else 30
        return ([1.0, a / 10, (a / 10) ** 2, min(r["walk"], 40) / 10,
                 1.0 if (r["bldgFloors"] or 0) >= 20 else 0.0,
                 1.0 if r["renovation"] else 0.0,
                 1.0 if r["elevator"] else 0.0]
                + [1.0 if r["station"] == s else 0.0 for s in stations])

    X = [feats(r) for r in rows]
    y = [math.log(r["ppm"]) for r in rows]
    if len(rows) < 3 * len(X[0]):          # too few points to fit — plain ¥/m² instead
        mean = sum(y) / len(y)
        return [v - mean for v in y]
    k = len(X[0])
    XtX = [[sum(x[i] * x[j] for x in X) + (0.01 if i == j and i else 0) for j in range(k)] for i in range(k)]
    Xty = [sum(x[i] * yy for x, yy in zip(X, y)) for i in range(k)]
    beta = solve(XtX, Xty)
    return [yy - sum(b * xi for b, xi in zip(beta, x)) for x, yy in zip(X, y)]


def access_pts(w):
    return 20 if w <= 5 else 16 if w <= 10 else 12 if w <= 15 else 8 if w <= 20 else 4 if w <= 30 else 0


def condition_pts(r):
    a, y = r["age"], r["builtYear"] or 0
    if a is None:
        base = 4
    elif y < SHIN_TAISHIN_YEAR:
        base = 0
    else:
        base = 16 if a <= 5 else 14 if a <= 10 else 12 if a <= 15 else 10 if a <= 20 else 7 if a <= 30 else 4
    return min(20, base + (4 if r["renovation"] else 0))


LIQ_PENALTY = {"high": 2, "mid": 1}   # piled RC building usually survives; grounds/utilities don't


def extras_pts(r):
    """Return (points, [[code, param, pts], ...]); the site turns codes into
    translated explanations (i18n.js → ex.<code>)."""
    f = r["floor"] or 0
    items = [["floor", f or None, 3 if f >= 10 else 2 if f >= 4 else 1 if f >= 2 else 0]]
    if r["facing"] and "南" in r["facing"]:
        items.append(["south", r["facing"], 2])
    if r["elevator"]:
        items.append(["elevator", None, 2])
    if r["parking"] == "onsite":
        items.append(["parking", None, 1])
    if r["pet"]:
        items.append(["pet", None, 1])
    if (r["totalUnits"] or 0) >= 50:
        items.append(["units", r["totalUnits"], 1])
    if r["landRights"] == "leased":
        items.append(["leased", None, -3])
    liq = r.get("liq")
    if liq and liq["level"] in LIQ_PENALTY:
        items.append(["liq", liq["level"], -LIQ_PENALTY[liq["level"]]])
    return max(0, min(10, sum(p for *_, p in items))), items


SMALL_KANA = str.maketrans("ァィゥェォャュョッヮ", "アイウエオヤユヨツワ")


def clean_name(name):
    """Strip agent prefixes / marketing / SUUMO's '...' truncation from a building name."""
    n = re.sub(r"^Asobi\+\s*", "", name)
    n = re.sub(r"\s+\S*(駅|徒歩|向き|リノベ|リフォーム)[\s\S]*$", "", n)
    n = re.sub(r"・?\d+階.*$|[(（]最上階[)）]", "", n)
    return n.replace("...", "").replace("…", "").strip()


def bldg_keys(names):
    """Map raw names → canonical building key. Truncated names resolve to the
    longest other name they are a prefix of."""
    base = {n: re.sub(r"\s+", "", clean_name(n)).translate(SMALL_KANA).lower() for n in names}
    full = set(base.values())
    out = {}
    for n, k in base.items():
        if "..." in n or "…" in n:
            longer = [f for f in full if f != k and f.startswith(k)]
            k = max(longer, key=len) if longer else k
        out[n] = k
    return out


def build(raw, today):
    keys = bldg_keys({r["name"] for r in raw})
    for r in raw:
        r["bldgKey"] = keys[r["name"]]
        r["name"] = clean_name(r["name"]) or r["name"]

    # ── Deduplicate the same unit listed by several agents ──
    groups = {}
    for r in raw:
        key = (r["bldgKey"], r["floor"], r["areaM2"], r["price"])
        groups.setdefault(key, []).append(r)
    rows = []
    for dupes in groups.values():
        best = sorted(dupes, key=lambda r: (r["imageUrl"] is None, r["firstSeen"]))[0]
        rows.append({**best, "agents": len(dupes),
                     "firstSeen": min(r["firstSeen"] for r in dupes),
                     "seeded": any(r["seeded"] for r in dupes)})

    # Agents occasionally mistype the build year — trust the building's consensus
    years = {}
    for r in rows:
        years.setdefault(r["bldgKey"], Counter())[r["builtYear"]] += 1
    for r in rows:
        (mode, n), = years[r["bldgKey"]].most_common(1)
        if mode and n >= 2 and r["builtYear"] != mode:
            r["builtYear"] = mode

    bldg_count = Counter(r["bldgKey"] for r in rows)
    for r in rows:
        r["age"]        = age_of(r["builtYear"], r["builtMonth"], today)
        r["shinTaishin"] = (r["builtYear"] or 0) >= SHIN_TAISHIN_YEAR
        r["ppm"]        = r["price"] / r["areaM2"]                       # 万円/m²
        fees = (r["mgmtFee"] or 0) + (r["repairFund"] or 0)
        r["fees"]       = fees or None                                  # 円/月
        r["feesPerM2"]  = round(fees / r["areaM2"]) if fees else None
        r["repairPerM2"] = round(r["repairFund"] / r["areaM2"]) if r["repairFund"] else None
        r["sameBldg"]   = bldg_count[r["bldgKey"]] - 1
        first = r["priceHistory"][0][1] if r["priceHistory"] else r["price"]
        r["priceCut"]   = max(0, first - r["price"])
        r["priceChange"] = r["price"] - first                           # 万円, <0 = cheaper now
        r["daysListed"] = None if r["seeded"] else (today - date.fromisoformat(r["firstSeen"])).days

    resid = fair_price_residuals(rows)
    val_rank  = percentile_ranks(resid)
    run_rank  = percentile_ranks([r["feesPerM2"] for r in rows])
    size_rank = percentile_ranks([r["areaM2"] for r in rows])
    fee_vals  = sorted(r["feesPerM2"] for r in rows if r["feesPerM2"])
    med_fees  = fee_vals[len(fee_vals) // 2] if fee_vals else None

    out = []
    for i, r in enumerate(rows):
        value     = round(25 * (1 - val_rank[i]))
        running   = 7 if run_rank[i] is None else round(15 * (1 - run_rank[i]))
        space     = round(10 * size_rank[i])
        access    = access_pts(r["walk"])
        condition = condition_pts(r)
        extras, extra_items = extras_pts(r)
        total = value + access + condition + running + space + extras
        # Inputs behind each score, for the hover explanations on the site
        why = {
            "expectedPpm": round(r["ppm"] / math.exp(resid[i]), 1),
            "valueBeat":   round(val_rank[i] * 100),        # % of listings that are a better deal
            "feesBeat":    None if run_rank[i] is None else round(run_rank[i] * 100),
            "medFeesPerM2": med_fees,
            "sizeBeat":    round(size_rank[i] * 100),        # % of listings smaller than this
            "extras":      extra_items,
            "n":           len(rows),
        }
        out.append({
            "id": i + 1,
            "ncId": r["ncId"], "area": r["areaName"], "areaJa": AREA_JA.get(r["areaKey"]), "areaKey": r["areaKey"],
            "name": r["name"], "bldgKey": r["bldgKey"], "address": r["address"],
            "price": r["price"], "areaM2": r["areaM2"], "layout": r["layout"],
            "ppm": round(r["ppm"], 1), "vsExpected": round((math.exp(resid[i]) - 1) * 100),
            "builtYear": r["builtYear"], "age": r["age"], "shinTaishin": r["shinTaishin"],
            "structure": r["structure"], "floor": r["floor"], "bldgFloors": r["bldgFloors"],
            "totalUnits": r["totalUnits"], "facing": r["facing"],
            "mgmtFee": r["mgmtFee"], "repairFund": r["repairFund"], "fees": r["fees"],
            "feesPerM2": r["feesPerM2"], "repairPerM2": r["repairPerM2"],
            "station": r["station"], "line": r["line"], "walk": r["walk"], "bus": r["bus"],
            "access": r["access"],
            "parking": r["parking"], "parkingFee": r["parkingFee"],
            "renovation": r["renovation"], "renoNote": r["renoNote"],
            "landRights": r["landRights"], "pet": r["pet"], "elevator": r["elevator"],
            "balconyM2": r["balconyM2"], "sameBldg": r["sameBldg"], "agents": r["agents"],
            "priceCut": r["priceCut"], "priceChange": r["priceChange"], "priceHistory": r["priceHistory"],
            "daysListed": r["daysListed"], "firstSeen": r["firstSeen"],
            "liq": r.get("liq"), "why": why,
            "suumoUrl": r["suumoUrl"], "imageUrl": r["imageUrl"] and re.sub(r"&w=\d+&h=\d+", "&w=640&h=480", r["imageUrl"].replace("&amp;", "&")),
            "scores": {"value": value, "access": access, "condition": condition,
                       "running": running, "space": space, "extras": extras, "total": total},
        })
    return out


def main():
    if not SRC.exists():
        print(f"{SRC} missing — keeping previously embedded condo data")
        return
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    hazard.annotate(raw, json.loads(Path("areas.json").read_text(encoding="utf-8")), lambda d: d["areaKey"])
    clean = build(raw, date.today())
    CLEAN.write_text(json.dumps(clean, ensure_ascii=False, indent=1), encoding="utf-8")

    history = json.loads(HISTORY.read_text(encoding="utf-8")) if HISTORY.exists() else []
    html = HTML.read_text(encoding="utf-8")
    html = re.sub(r"const mansions = \[[\s\S]*?\];\n",
                  lambda _: f"const mansions = {json.dumps(clean, ensure_ascii=False)};\n", html, count=1)
    html = re.sub(r"const mansionHistory = \[[\s\S]*?\];\n",
                  lambda _: f"const mansionHistory = {json.dumps(history, ensure_ascii=False)};\n", html, count=1)
    HTML.write_text(html, encoding="utf-8")

    print(f"Injected {len(clean)} condos into {HTML}")
    top = sorted(clean, key=lambda d: -d["scores"]["total"])[:5]
    for d in top:
        print(f"  {d['scores']['total']:>3}  {d['name'][:24]:24} ¥{d['price']:,}万 {d['areaM2']}m² "
              f"{d['ppm']}万/m² ({d['vsExpected']:+}%)  {d['walk']}min  built {d['builtYear']}")


if __name__ == "__main__":
    main()
