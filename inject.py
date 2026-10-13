#!/usr/bin/env python3
"""
Reads listings.json (from scraper.py), deduplicates, normalises, scores every house,
writes listings_clean.json and embeds the data into suumo-compare.html
(`const listings = [...]`, `const hsGroups = [...]`, `const history = [...]`).
Also tracks per-listing price history (house_price_history.json) and attaches
liquefaction risk (hazard.py) and the assigned public schools (schools.py).

Scores are computed here only — the site and notify.py both read them (DATA_LOG item 24;
until then the browser scored houses within the visible set).

SCORING (100 pts)
  VALUE     25  Price vs what similar houses cost — regression of log(price) on
                log(building m²), log(land m²), age, age², walk, non-wood frame,
                leasehold, station and area — residual percentile-ranked across all areas.
                A plot over 1,000 m² is a shared development site → area median land.
  ACCESS    20  Door-to-station minutes: ≤5=20 ≤10=16 ≤15=12 ≤20=8 ≤30=4 (bus = ride + 15).
  CONDITION 20  Age ≤5=12 ≤10=9 ≤20=6 ≤30=3, older 1, built before 1982 (旧耐震) 0
                · RC 8 / Steel 6 / Wood 4 · renovated +3.
  SPACE     20  Building floor area percentile 14 + land area percentile 6 (unknown/shared land = 3).
  EXTRAS    15  Parking 1 car +5 / 2+ +8 · owned land +5 · city gas +2;
                liquefaction risk high −4 / somewhat high −2 (see hazard.py).
"""

import json
import math
import re
import statistics
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path

import hazard
import schools
from inject_mansion import percentile_ranks, solve

# ── Load ─────────────────────────────────────────────
with open("listings.json", encoding="utf-8") as f:
    raw = json.load(f)
TODAY = date.today()
today = TODAY.isoformat()
AREAS = json.loads(Path("areas.json").read_text(encoding="utf-8"))
AREA = {a["key"]: a for a in AREAS}
SHIN_TAISHIN_YEAR = 1982
HOUSE_LIQ_PENALTY = {"high": 4, "mid": 2}

# ── Price history per SUUMO listing (nc id) ──────────
# {nc_id: [[date, price万], ...]} — a point is added only when the price changes.
PRICE_FILE = Path("house_price_history.json")
price_hist = json.loads(PRICE_FILE.read_text(encoding="utf-8")) if PRICE_FILE.exists() else {}


def nc_of(url):
    m = re.search(r"nc_(\d+)", url or "")
    return m.group(1) if m else url


for d in raw:
    hist = price_hist.setdefault(nc_of(d["suumoUrl"]), [])
    if not hist or hist[-1][1] != d["price"]:
        hist.append([today, d["price"]])
current = {nc_of(d["suumoUrl"]) for d in raw}
price_hist = {k: v for k, v in price_hist.items() if k in current}   # drop sold/withdrawn
PRICE_FILE.write_text(json.dumps(price_hist, indent=1), encoding="utf-8")

# ── Deduplicate the same home listed by several agents ──
groups = {}
for d in raw:
    groups.setdefault((d.get("areaKey"), d["price"], d["areaM2"], d.get("landM2")), []).append(d)
data = []
for dupes in groups.values():
    best = sorted(dupes, key=lambda r: (r.get("imageUrl") is None, r.get("firstSeen") or today))[0]
    data.append({**best, "agents": len(dupes), "firstSeen": min(r.get("firstSeen") or today for r in dupes),
                 "seeded": any(r.get("seeded") for r in dupes)})
print(f"Kept {len(data)} unique listings (removed {len(raw)-len(data)} duplicates)")


# ── Normalise helpers ─────────────────────────────────
def fullwidth_to_ascii(text):
    """Convert fullwidth ASCII chars (ＪＲ) to normal ASCII."""
    return unicodedata.normalize("NFKC", text or "")


def clean_layout(text):
    """Return a clean layout string like 4LDK."""
    text = fullwidth_to_ascii(text or "")
    m = re.search(r"(\d+[SLDK]+)", text)
    if not m:
        return "?"
    raw_l = m.group(1)
    digit = re.match(r"\d+", raw_l).group(0)
    suffix = re.sub(r"[^SLDK]", "", raw_l[len(digit):])
    cleaned = ""
    for ch in suffix:                     # collapse duplicate letters (LLDKK → LDK)
        if not cleaned or cleaned[-1] != ch:
            cleaned += ch
    return digit + cleaned


def _normalize_img(url):
    """Normalize SUUMO resize API URLs to a consistent display size."""
    if not url:
        return None
    if "resizeImage" in url:
        url = re.sub(r"&?w=\d+", "", url)
        url = re.sub(r"&?h=\d+", "", url)
        url = url.rstrip("&?") + "&w=640&h=480"
    return url


GRAD_POOL = [
    "linear-gradient(140deg,#e8c46a 0%,#d4703a 100%)",
    "linear-gradient(140deg,#1a3f6b 0%,#2f6fb0 100%)",
    "linear-gradient(140deg,#5a9e6a 0%,#a8d8a0 100%)",
    "linear-gradient(140deg,#7a5fb0 0%,#c0a0d8 100%)",
    "linear-gradient(140deg,#c84b31 0%,#64616e 100%)",
    "linear-gradient(140deg,#38b8b8 0%,#a0e0e0 100%)",
    "linear-gradient(140deg,#7a2e2e 0%,#b86060 100%)",
    "linear-gradient(140deg,#6a9e2e 0%,#c8e068 100%)",
    "linear-gradient(140deg,#1a3a70 0%,#3a70b8 100%)",
    "linear-gradient(140deg,#8a4a1e 0%,#d09060 100%)",
    "linear-gradient(140deg,#2e6a5a 0%,#60b8a0 100%)",
    "linear-gradient(140deg,#5a1a6a 0%,#a060c0 100%)",
]

# House details from scraper.house_details (DATA_LOG item 21)
HOUSE_EXTRA = ("roadM", "roads", "frontM", "privateRoad", "bcr", "far", "zoning", "energyStars", "insulation",
               "utilityYen", "feat", "covered", "fibre")

# ── Clean each listing ────────────────────────────────
cleaned = []
for i, d in enumerate(data):
    a = AREA.get(d.get("areaKey"), {})
    by = d.get("builtYear")
    age = max(0, TODAY.year - by) if by else d.get("age", 0)
    nc = nc_of(d.get("suumoUrl"))
    hist = price_hist.get(nc, [])
    cleaned.append({
        "id":         i + 1,
        "ncId":       nc,
        "price":      d["price"],
        "area":       a.get("name", d.get("areaName", "")),
        "areaJa":     a.get("nameJa"),
        "areaKey":    d.get("areaKey"),
        "group":      a.get("group", d.get("areaKey")),
        "address":    fullwidth_to_ascii(d.get("address", "")),
        "layout":     clean_layout(d.get("layout", "")),
        "areaM2":     d["areaM2"],
        "landM2":     d.get("landM2"),
        "builtYear":  by,
        "age":        age,
        "station":    fullwidth_to_ascii(d.get("station", "–")),
        "line":       fullwidth_to_ascii(d.get("line", "–")),
        "walk":       d.get("walk", 99),
        "structure":  d.get("structure", "Wood"),
        "floors":     d.get("floors", "?"),
        "parking":    d.get("parking", 0),
        "renovation": d.get("renovation", False),
        "landRights": d.get("landRights", "owned"),
        "cityGas":    d.get("cityGas", True),
        **{k: d.get(k) for k in HOUSE_EXTRA},
        "isNew":      False,
        "ppm":        round(d["price"] / d["areaM2"], 1),              # 万円/m² of floor area
        "agents":     d.get("agents", 1),
        "firstSeen":  d.get("firstSeen") or today,
        "daysListed": None if d.get("seeded") else (TODAY - date.fromisoformat(d.get("firstSeen") or today)).days,
        "priceHistory": hist,
        "priceChange":  d["price"] - hist[0][1] if hist else 0,
        "suumoUrl":   d.get("suumoUrl", "https://suumo.jp"),
        "imageUrl":   _normalize_img(d.get("imageUrl")),
        "grad":       GRAD_POOL[i % len(GRAD_POOL)],
    })

# ── Liquefaction risk + schools ───────────────────────
hazard.annotate(cleaned, AREAS, lambda d: d["areaKey"])
schools.annotate(cleaned)          # assigned public ES / JHS (info only, DATA_LOG item 20)


# ── Scoring ───────────────────────────────────────────
def access_pts(w):
    return 20 if w <= 5 else 16 if w <= 10 else 12 if w <= 15 else 8 if w <= 20 else 4 if w <= 30 else 0


def fair_price_residuals(rows, land):
    """log(price) − expected log(price) from similar houses. Negative = cheaper than peers."""
    stations = [s for s, c in Counter(r["station"] for r in rows).items() if c >= 15 and s not in ("–", "")]
    areas = sorted({r["areaKey"] for r in rows})[1:]           # area dummies (first = baseline)

    def feats(r, ld):
        a = r["age"] if r["builtYear"] else 30
        return ([1.0, math.log(r["areaM2"]), math.log(ld), a / 10, (a / 10) ** 2, min(r["walk"], 40) / 10,
                 0.0 if r["structure"] == "Wood" else 1.0, 1.0 if r["landRights"] == "leased" else 0.0]
                + [1.0 if r["station"] == s else 0.0 for s in stations]
                + [1.0 if r["areaKey"] == ak else 0.0 for ak in areas])
    X = [feats(r, ld) for r, ld in zip(rows, land)]
    y = [math.log(r["price"]) for r in rows]
    if len(rows) < 3 * len(X[0]):          # too few points to fit — plain ¥/m² instead
        ppm = [math.log(r["price"] / r["areaM2"]) for r in rows]
        mean = sum(ppm) / len(ppm)
        return [v - mean for v in ppm]
    k = len(X[0])
    XtX = [[sum(x[i] * x[j] for x in X) + (0.01 if i == j and i else 0) for j in range(k)] for i in range(k)]
    Xty = [sum(x[i] * yy for x, yy in zip(X, y)) for i in range(k)]
    beta = solve(XtX, Xty)
    return [yy - sum(b * xi for b, xi in zip(beta, x)) for x, yy in zip(X, y)]


LAND_SHARED_M2 = 1000      # a stated plot this large is the whole development's site (団地/terrace), not this house's
med_land = {}
for r in cleaned:
    if r["landM2"] and r["landM2"] <= LAND_SHARED_M2:
        med_land.setdefault(r["areaKey"], []).append(r["landM2"])
med_land = {k: statistics.median(v) for k, v in med_land.items()}
land = [r["landM2"] if r["landM2"] and r["landM2"] <= LAND_SHARED_M2 else med_land.get(r["areaKey"]) or r["areaM2"] for r in cleaned]
resid = fair_price_residuals(cleaned, land) if cleaned else []
val_rank = percentile_ranks(resid)
size_rank = percentile_ranks([r["areaM2"] for r in cleaned])
land_rank = percentile_ranks([r["landM2"] if r["landM2"] and r["landM2"] <= LAND_SHARED_M2 else None for r in cleaned])

for i, r in enumerate(cleaned):
    value = round(25 * (1 - val_rank[i]))
    access = access_pts(r["walk"])
    a = r["age"]
    age_s = 0 if (r["builtYear"] or 9999) < SHIN_TAISHIN_YEAR else 12 if a <= 5 else 9 if a <= 10 else 6 if a <= 20 else 3 if a <= 30 else 1
    str_s = 8 if r["structure"] in ("RC", "SRC") else 6 if r["structure"] == "Steel" else 4
    reno_s = 3 if r["renovation"] else 0
    condition = min(20, age_s + str_s + reno_s)
    lr = land_rank[i] if land_rank[i] is not None else 0.5
    space = round(14 * size_rank[i] + 6 * lr)
    park_s = 0 if r["parking"] == 0 else 5 if r["parking"] == 1 else 8
    rights_s = 5 if r["landRights"] == "owned" else 0
    gas_s = 2 if r["cityGas"] else 0
    liq_p = HOUSE_LIQ_PENALTY.get((r.get("liq") or {}).get("level"), 0)
    extras = max(0, min(15, park_s + rights_s + gas_s) - liq_p)
    r["vsExpected"] = round((math.exp(resid[i]) - 1) * 100)
    r["scores"] = {"value": value, "access": access, "condition": condition, "space": space, "extras": extras,
                   "total": value + access + condition + space + extras}
    r["why"] = {"expectedPrice": round(r["price"] / math.exp(resid[i])), "valueBeat": round(val_rank[i] * 100),
                "sizeBeat": round(size_rank[i] * 100), "landBeat": None if land_rank[i] is None else round(land_rank[i] * 100),
                "n": len(cleaned), "ageScore": age_s, "strScore": str_s, "renoBonus": reno_s,
                "parkScore": park_s, "rightsScore": rights_s, "gasScore": gas_s, "liqPenalty": liq_p}

# Save cleaned version too (notify.py reads it)
with open("listings_clean.json", "w", encoding="utf-8") as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=2)
print("Saved listings_clean.json")

# ── Inject into HTML ──────────────────────────────────
html = Path("suumo-compare.html").read_text(encoding="utf-8")
hs_groups = []
for a in AREAS:
    g = a.get("group", a["key"])
    if "house" in a.get("types", ["house"]) and g not in [x["key"] for x in hs_groups]:
        hs_groups.append({"key": g, "name": a.get("groupName", a["name"]),
                          "nameJa": a.get("groupNameJa", a.get("nameJa")), "color": a.get("color", "#888888")})
history = json.loads(Path("history.json").read_text(encoding="utf-8")) if Path("history.json").exists() else []
for marker, value in (("const listings = ", cleaned), ("const hsGroups = ", hs_groups), ("const history = ", history)):
    js = json.dumps(value, ensure_ascii=False)
    new, n = re.subn(re.escape(marker) + r"\[[\s\S]*?\];\n", lambda _: f"{marker}{js};\n", html, count=1)
    if not n:
        raise SystemExit(f"injection failed for {marker.strip()}")
    html = new
Path("suumo-compare.html").write_text(html, encoding="utf-8")
print(f"Injected {len(cleaned)} houses in {len(hs_groups)} areas into suumo-compare.html")

# ── Quick summary ─────────────────────────────────────
if cleaned:
    print(f"  Price : Y{min(d['price'] for d in cleaned):,} - Y{max(d['price'] for d in cleaned):,} man")
    for d in sorted(cleaned, key=lambda d: -d["scores"]["total"])[:5]:
        print(f"  {d['scores']['total']:>3}  {d['areaKey']:10} Y{d['price']:,}man {d['areaM2']}m2 land {d['landM2']} "
              f"({d['vsExpected']:+}% vs similar)  {d['walk']}min  built {d['builtYear']}")
