#!/usr/bin/env python3
"""Deep look — in-depth analysis of ONE SUUMO used-condo listing  →  deeplook/<ncId>.html (+ .json, index.json)

What a quick look at the listing card does not show: true monthly + one-off costs, fee levels vs peers and
the MLIT guideline, land rights, seismic standard, shaking / ground / water / liquefaction at the point,
the real commute from the listing's stations, building-management signals, energy proxies, parking,
the neighbourhood (area study data) and contract terms — each compared with similar flats, the area and
the other study areas where that makes sense. Ends with the documents to request, questions for the
agent and a visit checklist. Research + design: reports/Deep look - research and design.md.

Sources (all public, no key): SUUMO detail pages (main / 物件概要 / 周辺環境); ハザードマップポータル raster
tiles + 国土地理院 地形分類 (via area_hazard.py); J-SHIS 確率論的地震動予測地図 Y2024 + 表層地盤 V4;
Yahoo!乗換案内 (via commute_matrix.py); our own data: area-listings.js, data/condo_peers.json,
map-data.js, data/area_listings_state.json, data/area_noise.json, data/commute_matrix.json.

Run:  python deeplook.py <suumo url> [--office tokyo] [--rate 1.0]      local
      python deeplook.py --ci                                              GitHub Action (env ISSUE_BODY / IN_URL)
      python deeplook.py --peers                                           mansions.json → data/condo_peers.json
"""
import argparse
import html
import json
import math
import os
import re
import statistics
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

OUT = Path("deeplook")
PEERS = Path("data/condo_peers.json")
SITE = "https://umbasimpy.github.io/japan-house-compare/"
URL_RE = re.compile(r"https://suumo\.jp/ms/chuko/[a-z0-9_]+/sc_[a-z0-9_]+/nc_(\d+)/?")
JSHIS_P = "https://www.j-shis.bosai.go.jp/map/api/pshm/Y2024/AVR/TTL_MTTL/meshinfo.geojson?position={lon},{lat}&epsg=4326"
JSHIS_G = "https://www.j-shis.bosai.go.jp/map/api/sstrct/V4/meshinfo.geojson?position={lon},{lat}&epsg=4326"
WALK_HOME, WALK_OFFICE = 10, 5          # same defaults as the map's office picker
# MLIT マンションの修繕積立金に関するガイドライン (R6-06 revision): ¥/m²/month by size — (label, avg, low, high)
GUIDE = [("under 20 floors, floor area < 5,000 m²", 335, 235, 430),
         ("under 20 floors, 5,000–10,000 m²", 252, 170, 320),
         ("under 20 floors, 10,000–20,000 m²", 271, 200, 330),
         ("under 20 floors, ≥ 20,000 m²", 255, 190, 325),
         ("20 floors or more", 338, 240, 410)]
SRC = {
    "guide": ("MLIT 修繕積立金ガイドライン (2024)", "https://www.mlit.go.jp/jutakukentiku/house/content/001747009.pdf"),
    "jshis": ("J-SHIS 地震ハザードステーション", "https://www.j-shis.bosai.go.jp/map/"),
    "portal": ("ハザードマップポータル (重ねるハザードマップ)", "https://disaportal.gsi.go.jp/maps/"),
    "landform": ("国土地理院 地形分類", "https://maps.gsi.go.jp/"),
    "yahoo": ("Yahoo!乗換案内", "https://transit.yahoo.co.jp/"),
    "tax": ("MLIT 住宅ローン減税", "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk2_000017.html"),
    "label": ("MLIT 省エネ性能表示制度", "https://www.mlit.go.jp/shoene-label/index.html"),
    "konjaku": ("今昔マップ (old maps)", "https://ktgis.net/kjmapw/"),
    "reinfo": ("不動産情報ライブラリ (prices, zoning, school districts)", "https://www.reinfolib.mlit.go.jp/"),
}

S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
                  "Accept-Language": "ja", "Referer": "https://suumo.jp/"})


# ── small helpers ───────────────────────────────────────────────
def nfkc(t):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", t or "")).strip()


def yen(t):
    """'1万6200円' → 16200 · '7500円' → 7500 · '1万円' → 10000 (first amount only)."""
    m = re.search(r"(?:(\d+)万)?(\d+)?円", (t or "").replace(",", ""))
    if not m or not (m.group(1) or m.group(2)):
        return None
    return int(m.group(1) or 0) * 10000 + int(m.group(2) or 0)


def yens(t):
    return [v for v in (yen(x) for x in re.findall(r"(?:\d+万)?\d*円", (t or "").replace(",", ""))) if v]


def man(t):
    """'4880万円' / '1億2000万円' → 万円."""
    m = re.search(r"(?:(\d+)億)?(\d+)万円|(\d+)億円", (t or "").replace(",", ""))
    if not m:
        return None
    return int(m.group(3)) * 10000 if m.group(3) else int(m.group(1) or 0) * 10000 + int(m.group(2))


def pct(vals, x):
    """Percentile of x among vals (share below + half the ties)."""
    vals = [v for v in vals if v is not None]
    if not vals or x is None:
        return None
    return round(100 * (sum(v < x for v in vals) + 0.5 * sum(v == x for v in vals)) / len(vals))


def med(vals):
    vals = [v for v in vals if v is not None]
    return statistics.median(vals) if vals else None


def q(vals, p):
    vals = sorted(v for v in vals if v is not None)
    if not vals:
        return None
    k = (len(vals) - 1) * p
    return vals[int(k)] + (vals[min(int(k) + 1, len(vals) - 1)] - vals[int(k)]) * (k - int(k))


def fmt_yen(v):
    return "–" if v is None else f"¥{round(v):,}"


def fmt_man(v):
    """万円 → '¥48.8M'."""
    return "–" if v is None else f"¥{v / 100:,.1f}M"


def read_js(path):
    p = Path(path)
    if not p.exists():
        return {}
    txt = p.read_text(encoding="utf-8")
    return json.loads(txt[txt.index("{", txt.index(" = ")):txt.rstrip().rstrip(";").rindex("}") + 1])


def load_json(path, default=None):
    p = Path(path)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


def get(url):
    for attempt in range(3):
        try:
            r = S.get(url, timeout=30)
            if r.status_code == 200:
                return r.text
            if r.status_code == 404:
                return None
        except requests.RequestException:
            pass
        time.sleep(3 + attempt * 5)
    return None


# ── SUUMO pages ─────────────────────────────────────────────────
def fields(soup):
    out = {}
    for th in soup.find_all(["th", "dt"]):
        td = th.find_next_sibling(["td", "dd"])
        if not td:
            continue
        k = re.sub(r"\s*ヒント$|[:：]$", "", nfkc(th.get_text(" "))).strip()
        v = nfkc(td.get_text(" "))
        if k and k not in out:
            out[k] = v
    return out


def blank(v):
    return v is None or v in ("", "-", "－", "―")


def parse_access(t):
    out = []
    for seg in re.split(r"\[ ?乗り換え案内 ?\]", t or ""):
        m = re.search(r"(.+?)「(.+?)」\s*(?:バス\s*(\d+)\s*分\s*(.*?))?\s*歩\s*(\d+)\s*分", seg)
        if m:
            out.append({"line": m.group(1).strip(), "station": m.group(2), "bus": int(m.group(3)) if m.group(3) else None,
                        "stop": (m.group(4) or "").strip() or None, "walk": int(m.group(5))})
    return out


KANKYO_CATS = ["幼稚園・保育園", "高校・高専", "ショッピングセンター", "ドラッグストア", "ホームセンター", "総合病院", "病院",
               "コンビニ", "公園", "中学校", "小学校", "駅", "スーパー", "銀行", "郵便局", "役所", "図書館", "保育園", "幼稚園",
               "大学", "学校", "飲食店", "その他"]


def parse_kankyo(text):
    t = nfkc(text)
    cats = "|".join(map(re.escape, KANKYO_CATS))
    out = []
    for m in re.finditer(rf"(?<!\S)({cats}) ((?:(?!まで\d)[^:]){{1,40}}?) ?:徒歩(\d+)分\((\d+)m\)", t):
        out.append({"cat": m.group(1), "name": m.group(2).strip(), "walk": int(m.group(3)), "m": int(m.group(4))})
    return out


def scrape(url):
    nc = URL_RE.match(url).group(1)
    base = URL_RE.match(url).group(0).rstrip("/") + "/"
    main = get(base)
    if main is None:
        raise SystemExit("listing page not found (sold or removed?)")
    gaiyo = get(base + "bukkengaiyo/") or ""
    time.sleep(1)
    kankyo = get(base + "kankyo/") or ""
    ms, gs = BeautifulSoup(main, "html.parser"), BeautifulSoup(gaiyo, "html.parser")
    f = {**fields(ms), **fields(gs)}
    lat = re.search(r"lat\s*[:=]\s*'([\d.]+)'", main)
    lng = re.search(r"lng\s*[:=]\s*'([\d.]+)'", main)
    tags = []
    h = ms.find(string=re.compile("特徴ピックアップ"))
    if h:
        box = h.find_parent().find_next("div", class_="mt10")
        tags = [x for x in (nfkc(t) for t in (nfkc(box.get_text(" ")).split(" / ") if box else [])) if x]
    for s in ms(["script", "style", "noscript"]):
        s.decompose()
    text = nfkc(ms.get_text(" "))
    i = text.find("物件の特徴", text.find("物件の特徴") + 5)
    feat = text[i:i + 2500] if i > 0 else ""
    title = nfkc((ms.find("h1") or ms.find("title")).get_text(" "))
    name = re.split(r"\s+(?:\d+億)?\d*万?円|\s*[|｜]", title)[0].strip()
    ksoup = BeautifulSoup(kankyo, "html.parser")
    for s in ksoup(["script", "style", "noscript"]):
        s.decompose()
    return {"id": nc, "url": base, "name": name, "f": f, "tags": tags, "feat": feat,
            "lat": float(lat.group(1)) if lat else None, "lng": float(lng.group(1)) if lng else None,
            "kankyo": parse_kankyo(ksoup.get_text(" ")), "fetched": date.today().isoformat()}


def listing(raw):
    """Normalise the SUUMO field dict into the numbers the analysis uses."""
    f = raw["f"]
    g = lambda *ks: next((f[k] for k in ks if k in f and not blank(f[k])), None)
    built = re.search(r"(\d{4})年(\d{1,2})月", g("完成時期(築年月)", "築年月") or "")
    area = g("専有面積") or ""
    am = re.search(r"([\d.]+)\s*m", area)
    st = g("構造・階建て") or ""
    mg = g("管理費") or ""
    mtype = re.search(r"\(([^()]*(?:\([^()]*\))?[^()]*)\)\s*$", mg)
    floor = re.search(r"(\d+)階", g("所在階") or "")
    units = re.search(r"(\d+)戸", g("総戸数") or "")
    extras = []
    for part in re.split(r"[、,]", g("諸費用") or ""):
        if yen(part):
            extras.append((part.split(":")[0].split("：")[0].strip(), yen(part)))
    deal = g("取引態様") or ""
    return {
        "price": man(g("価格") or ""), "m2": float(am.group(1)) if am else None,
        "m2basis": "内法" if "内法" in area else "壁芯" if "壁芯" in area else None,
        "layout": g("間取り"), "balcony": g("その他面積"), "handover": g("引渡可能時期"),
        "year": int(built.group(1)) if built else None, "month": int(built.group(2)) if built else None,
        "floor": int(floor.group(1)) if floor else None, "facing": g("向き"),
        "struct": (re.match(r"[A-Zａ-ｚ一-龥・造]+", st) or [None])[0] if st else None,
        "floors": int(re.search(r"(\d+)階建", st).group(1)) if re.search(r"(\d+)階建", st) else None,
        "basement": "地下" in st,
        "mgmt": yen(mg), "mgmtType": mtype.group(1) if mtype else None,
        "repair": yen(g("修繕積立金") or ""), "repairBase": yen(g("修繕積立基金") or ""),
        "extras": extras, "units": int(units.group(1)) if units else None,
        "rights": g("敷地の権利形態", "土地の権利形態"), "zoning": g("用途地域"),
        "parking": g("駐車場"), "deal": "売主" if "売主" in deal else "代理" if "代理" in deal else "仲介" if "仲介" in deal else None,
        "builder": g("施工"), "reform": g("リフォーム"), "restrict": g("その他制限事項"),
        "energy": g("エネルギー消費性能"), "insul": g("断熱性能"), "utilCost": g("目安光熱費"),
        "address": g("所在地", "住所"), "access": parse_access(g("交通") or ""),
        "siteArea": g("敷地面積"), "infoDate": g("情報提供日"),
    }


# ── our data ────────────────────────────────────────────────────
def area_of(address, areas):
    best = None
    for a in areas:
        if a["nameJa"] in (address or "") and (best is None or len(a["nameJa"]) > len(best["nameJa"])):
            best = a
    return best


def build_peers():
    src = load_json("mansions.json")
    if src is None:
        raise SystemExit("mansions.json not found (run scraper_mansion.py first)")
    rows = [[m["ncId"], m.get("areaKey"), m.get("name"), m.get("price"), m.get("areaM2"), m.get("builtYear"),
             m.get("mgmtFee"), m.get("repairFund"), m.get("totalUnits"), m.get("parkingFee"), m.get("floor"),
             m.get("bldgFloors"), m.get("station"), m.get("walk"), m.get("firstSeen"), m.get("priceHistory")]
            for m in src]
    PEERS.write_text(json.dumps({"generated": date.today().isoformat(), "source": "mansions.json (watchlist condos)",
                                 "cols": ["id", "areaKey", "name", "price万", "m2", "year", "mgmt", "repair", "units",
                                          "parkingFee", "floor", "bldgFloors", "station", "walk", "firstSeen", "priceHistory"],
                                 "rows": rows}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("wrote", PEERS, len(rows), "rows")


def bname(s):
    return re.sub(r"[\s　・()（）]|[A-ZＡ-Ｚ]棟$", "", nfkc(s or ""))


# ── point lookups ───────────────────────────────────────────────
def jshis(lat, lon):
    out = {}
    try:
        p = S.get(JSHIS_P.format(lat=lat, lon=lon), timeout=40).json()["features"][0]["properties"]
        out["p"] = {k: float(p[f"T30_I{k}_PS"]) * 100 for k in ("45", "50", "55", "60")}
    except Exception as e:
        out["pErr"] = str(e)[:80]
    try:
        g = S.get(JSHIS_G.format(lat=lat, lon=lon), timeout=40).json()["features"][0]["properties"]
        out["ground"] = {"name": g.get("JNAME"), "arv": float(g["ARV"]), "avs": float(g["AVS"])}
    except Exception as e:
        out["gErr"] = str(e)[:80]
    return out


def hazards(lat, lon):
    """Centre value + worst value in a ~±100 m grid (SUUMO's map point is approximate)."""
    import area_hazard as ah
    import hazard
    hazard._load_codes()
    dlat, dlon = 100 / 111000, 100 / (111000 * math.cos(math.radians(lat)))
    grid = [(lat + i * dlat / 2, lon + j * dlon / 2) for i in (-2, -1, 0, 1, 2) for j in (-2, -1, 0, 1, 2)]
    out = {}
    for layer in ("flood", "surge", "tsunami"):
        vals = [ah.depth_at(layer, a, b) for a, b in grid]
        out[layer] = {"at": ah.depth_at(layer, lat, lon), "max": max(vals)}
    sl = [ah.slide_at(a, b) for a, b in grid]
    out["slide"] = {"at": ah.slide_at(lat, lon), "max": max(sl)}
    lq = [ah.liq_at(a, b) for a, b in grid[::2]]
    out["liq"] = {"at": ah.liq_at(lat, lon), "any": sorted({x for x in lq if x})}
    lf = ah._landform_hit(hazard.SOURCES["gsi_landform"]["layers"][0], lat, lon)
    ln = ah._landform_hit(hazard.SOURCES["gsi_landform"]["layers"][1], lat, lon)
    out["landform"] = {"artificial": lf[0] if lf else None, "natural": ln[0] if ln else None}
    return out


def next_wednesday():
    d = date.today() + timedelta(days=1)
    while d.weekday() != 2:
        d += timedelta(days=1)
    return d


def commute(stations, office):
    import commute_matrix as cm
    d = next_wednesday()
    cm.DATE = dict(y=d.year, m=d.month, d=d.day)
    out = []
    for s in stations[:3]:
        frm = cm.HOME_QUERY.get(s["station"], s["station"])
        try:
            r = cm.query(frm, office["query"]) if cm.norm(frm) != cm.norm(office["query"]) else {"min": 0, "xfer": 0, "pass1m": 0, "ok": True}
        except Exception as e:
            r = {"error": str(e)[:80]}
        access = (s["bus"] or 0) + s["walk"] + (3 if s["bus"] else 0)      # +3 min average bus wait
        r.update(station=s["station"], line=s["line"], access=access, viaBus=bool(s["bus"]), walk=s["walk"], bus=s["bus"],
                 door=(access + r["min"] + WALK_OFFICE) if r.get("ok") else None, date=d.isoformat())
        out.append(r)
    return out


# ── analysis ────────────────────────────────────────────────────
class Report:
    def __init__(self):
        self.sections = []

    def section(self, key, title, intro=""):
        self.cur = {"key": key, "title": title, "intro": intro, "items": [], "src": []}
        self.sections.append(self.cur)

    def add(self, level, head, detail="", cmp="", ask=None):
        self.cur["items"].append({"level": level, "head": head, "detail": detail, "cmp": cmp, "ask": ask})

    def src(self, *keys_or_pairs):
        for k in keys_or_pairs:
            p = SRC[k] if isinstance(k, str) else k
            if p not in self.cur["src"]:
                self.cur["src"].append(p)


def analyse(raw, office_id="tokyo", rate=1.0):
    L = listing(raw)
    md = read_js("map-data.js")
    areas = md.get("areas", [])
    A = area_of(L["address"], areas)
    aid = A["id"] if A else None
    al = read_js("area-listings.js").get("areas", {})
    peers_doc = load_json(PEERS, {"rows": []})
    P = [dict(zip(peers_doc.get("cols", []), r)) for r in peers_doc.get("rows", [])]
    state = load_json("data/area_listings_state.json", {}).get("ids", {})
    cmx = load_json("data/commute_matrix.json", {})
    noise = load_json("data/area_noise.json", {})
    offices = {o["id"]: o for o in cmx.get("offices", [])}
    office = offices.get(office_id) or offices.get("tokyo") or {"id": "tokyo", "query": "東京", "en": "Tokyo Stn"}
    y0 = date.today().year
    age = y0 - L["year"] if L["year"] else None
    price, m2 = L["price"], L["m2"]
    ppm = price / m2 * 10000 if price and m2 else None                 # ¥/m²
    R = Report()
    facts = {}

    # ---------- A. price ----------
    R.section("A", "Is the price fair?", "Asking price per m² against similar flats for sale now. Contract prices are usually a few % lower than asking.")
    rows = (al.get(aid) or {}).get("rows", []) if aid else []
    own = {raw["id"]}
    area_rows = [r for r in rows if str(r[0]).split("/")[-1] not in own and r[2] and r[3]]
    band = [r for r in area_rows if L["year"] and r[5] and abs(r[5] - L["year"]) <= 5]
    if ppm and band:
        vals = [r[2] / r[3] * 10000 for r in band]
        p_ = pct(vals, ppm)
        lv = "good" if p_ <= 25 else "watch" if p_ >= 80 else "ok"
        R.add(lv, f"¥{ppm / 1000:,.0f}k/m² — " + (f"the cheapest of {len(band) + 1} comparable flats" if ppm < min(vals)
              else f"the most expensive of {len(band) + 1} comparable flats" if ppm > max(vals)
              else f"cheaper than {100 - p_}% of {len(band)} comparable flats"),
              f"Comparable = 90 m²+ used condos for sale now in {A['nameEn']}, built {L['year'] - 5}–{L['year'] + 5}.",
              f"Median ¥{med(vals) / 1000:,.0f}k/m² · range ¥{min(vals) / 1000:,.0f}k–{max(vals) / 1000:,.0f}k · all ages in the area: median ¥{med([r[2] / r[3] * 10000 for r in area_rows]) / 1000:,.0f}k/m² ({len(area_rows)} flats)")
        if p_ <= 15:
            R.add("ask", "Much cheaper than its peers — find out why",
                  "Typical reasons: low floor, poor orientation, a view blocked by a newer building, an upcoming levy, a structural or legal issue, a stigma (告知事項), or a seller in a hurry.",
                  ask="Why is it priced below similar flats? How long has it been on the market and has the price changed?")
        if m2 and m2 < 90:
            R.add("info", "Comparison set is 90 m²+ flats", "This flat is smaller; small units usually cost more per m².")
    elif ppm:
        R.add("info", f"¥{ppm / 1000:,.0f}k/m²", "No comparable 90 m²+ listings of a similar age in our area data." if aid else "This municipality is outside the 77 study areas — no peer data.")
    same = [r for r in area_rows if bname(r[1]) == bname(raw["name"])] + \
           [p for p in P if bname(p["name"]) == bname(raw["name"]) and str(p["id"]) not in own]
    if same:
        vals = []
        for r in same:
            vals.append((r[2], r[3]) if isinstance(r, list) else (r["price万"], r["m2"]))
        vals = sorted({(a, b) for a, b in vals if a and b and (a, round(b, 1)) != (price, round(m2 or 0, 1))})   # same unit via another agent
        if vals:
            R.add("info", f"{len(vals)} other unit(s) in the same building on sale",
                  " · ".join(f"{fmt_man(a)} for {b} m² (¥{a / b * 10:,.0f}k/m²)" for a, b in vals[:6]))
    st = state.get(raw["id"])
    hist = next((p["priceHistory"] for p in P if str(p["id"]) == raw["id"] and p.get("priceHistory")), None)
    if hist and len(hist) > 1:
        R.add("info", f"Price history: first seen {hist[0][0]} at {fmt_man(hist[0][1])}",
              " → ".join(f"{d}: {fmt_man(v)}" for d, v in hist))
    elif st:
        R.add("info", f"On our radar since {st[0]} (first price {fmt_man(st[1])})")
    walks = [r[7] for r in area_rows if r[7] is not None and not r[8]]
    acc0 = L["access"][0] if L["access"] else None
    if acc0 and walks and not acc0["bus"]:
        p_ = pct(walks, acc0["walk"])
        R.add("good" if p_ <= 25 else "watch" if p_ >= 75 else "ok",
              f"{acc0['walk']} min walk to {acc0['station']} — closer than {100 - p_}% of the area's large flats",
              cmp=f"Area median {med(walks):.0f} min (90 m²+ listings, walk access only)")
    R.add("info", "Actual sale prices nearby: not yet included", "Needs the MLIT 不動産情報ライブラリ API key (transaction prices by district).")
    R.src(("SUUMO used condos (daily snapshot)", "https://suumo.jp/ms/chuko/"), "reinfo")

    # ---------- B. costs ----------
    R.section("B", "What it really costs", "Monthly running costs, how the fees compare, and the one-off costs of buying.")
    rp_m2 = L["repair"] / m2 if L["repair"] and m2 else None
    mg_m2 = L["mgmt"] / m2 if L["mgmt"] and m2 else None
    agep = [p for p in P if L["year"] and p.get("year") and abs(p["year"] - L["year"]) <= 5 and p.get("m2")]
    floor_area = L["units"] * m2 * 1.25 if L["units"] and m2 else None    # rough: units × this unit's size × common areas
    g = GUIDE[4] if (L["floors"] or 0) >= 20 else GUIDE[0] if not floor_area or floor_area < 5000 else \
        GUIDE[1] if floor_area < 10000 else GUIDE[2] if floor_area < 20000 else GUIDE[3]
    if rp_m2:
        rp_peers = [p["repair"] / p["m2"] for p in agep if p.get("repair")]
        lv = "good" if rp_m2 >= g[2] else "watch" if rp_m2 >= g[2] * 0.6 else "risk"
        R.add(lv, f"Repair fund {fmt_yen(L['repair'])}/month = ¥{rp_m2:.0f}/m²",
              f"MLIT guideline for a building like this ({g[0]}"
              f"{', floor area estimated ~' + format(round(floor_area, -2), ',.0f') + ' m²' if floor_area else ''}): "
              f"average ¥{g[1]}/m², ⅔ of buildings ¥{g[2]}–{g[3]}. "
              + (f"(The floor area is a rough estimate near the 5,000 m² line — the smaller band's average is ¥{GUIDE[0][1]}/m².) " if floor_area and 4000 <= floor_area < 6500 and (L["floors"] or 0) < 20 else "")
              + (f"At the guideline average this flat would pay ≈ {fmt_yen(g[1] * m2)}/month (+{fmt_yen(g[1] * m2 - L['repair'])}). "
                 "A fund below the guideline usually means future increases or a one-off levy (一時金)." if rp_m2 < g[1] else ""),
              f"Peers built ±5 years ({len(rp_peers)} watchlist condos): median ¥{med(rp_peers):.0f}/m², middle half ¥{q(rp_peers, .25):.0f}–{q(rp_peers, .75):.0f} → this flat is at the {pct(rp_peers, rp_m2)}th percentile." if rp_peers else "",
              ask="Please share the 長期修繕計画 and the current repair-fund balance. Are increases or a 一時金 planned?")
        facts["repairPerM2"] = round(rp_m2)
    else:
        R.add("ask", "Repair fund not stated", ask="What is the monthly 修繕積立金?")
    if mg_m2:
        mg_peers = [p["mgmt"] / p["m2"] for p in agep if p.get("mgmt")]
        if L["units"]:
            ub = (0, 60) if L["units"] <= 60 else (61, 150) if L["units"] <= 150 else (151, 99999)
            mg_peers_u = [p["mgmt"] / p["m2"] for p in agep if p.get("mgmt") and p.get("units") and ub[0] <= p["units"] <= ub[1]]
        else:
            mg_peers_u = []
        ref = mg_peers_u if len(mg_peers_u) >= 8 else mg_peers
        pp = pct(ref, mg_m2)
        R.add("watch" if pp and pp >= 85 else "ok", f"Management fee {fmt_yen(L['mgmt'])}/month = ¥{mg_m2:.0f}/m²"
              + (f" ({L['mgmtType']})" if L["mgmtType"] else ""),
              "Small buildings cost more per flat; staffed (常駐) management costs more than visiting (巡回).",
              (f"Peers of similar age{' and size (' + str(ub[0]) + '–' + (str(ub[1]) if ub[1] < 9999 else '') + ' units)' if ref is mg_peers_u else ''}: "
               f"median ¥{med(ref):.0f}/m² → {pp}th percentile ({len(ref)} condos)") if ref else "")
    extras = sum(v for _, v in L["extras"])
    if L["extras"]:
        R.add("info", f"Other fixed monthly charges {fmt_yen(extras)}", " · ".join(f"{k} {fmt_yen(v)}" for k, v in L["extras"]))
    pk = yens(L["parking"] or "")
    pk_area = [p["parkingFee"] for p in P if A and p.get("areaKey") == A.get("tracked") and p.get("parkingFee")]
    loan = price * 10000 if price else None
    r_m = rate / 100 / 12
    pay = loan * r_m / (1 - (1 + r_m) ** -420) if loan and r_m else (loan / 420 if loan else None)
    monthly = sum(v for v in (pay, L["mgmt"], L["repair"], extras) if v)
    facts.update(monthlyLoan=round(pay) if pay else None, monthlyFees=(L["mgmt"] or 0) + (L["repair"] or 0) + extras)
    if pay:
        R.add("info", f"≈ {fmt_yen(monthly)}/month before parking and property tax",
              f"Loan {fmt_yen(pay)} (100% of price, 35 years, {rate:.2f}% variable — the Apartments tab default) + fees {fmt_yen((L['mgmt'] or 0) + (L['repair'] or 0) + extras)}"
              + (f" · parking would add {fmt_yen(pk[0])}+" if pk else ""),
              ask="What was the last 固定資産税・都市計画税 bill for this unit?")
    if price:
        agent = (price * 10000 * 0.03 + 60000) * 1.1 if L["deal"] in ("仲介", None) else 0
        other_lo, other_hi = price * 10000 * 0.03, price * 10000 * 0.05
        facts["buyCosts"] = [round(agent + other_lo), round(agent + other_hi)]
        R.add("info", f"One-off buying costs ≈ {fmt_yen(agent + other_lo)}–{fmt_yen(agent + other_hi)}",
              (f"Agent fee (仲介手数料, 3% + ¥60k + tax) {fmt_yen(agent)}" if agent else "Sold directly by the owner company (売主): no agent fee")
              + " · plus registration tax and scrivener, loan fees and guarantee, fire + earthquake insurance, stamp duty, pro-rated property tax and fees: typically 3–5% of the price."
              + (" Budget for renovation separately." if age and age >= 25 else ""))
    R.src("guide", ("SUUMO listing", raw["url"]))

    # ---------- C. land & legal ----------
    R.section("C", "Land rights and legal limits")
    rights = L["rights"] or ""
    if not rights:
        R.add("ask", "Land rights not stated", ask="Is the land 所有権 (freehold)?")
    elif "借地" in rights:
        R.add("risk", f"Leasehold land: {rights}",
              "You pay ground rent, the lease has an end date (定期借地 = the building is demolished at the end), banks lend less and resale is harder.",
              ask="Ground rent, remaining lease term, dismantling reserve (解体準備金) and renewal terms?")
    else:
        R.add("good", f"Land rights: {rights}", "Freehold share of the land (normal for condos).")
    if L["zoning"]:
        lv = "watch" if re.search(r"商業|近隣商業|準工業|工業", L["zoning"]) else "ok"
        R.add(lv, f"Zoning: {L['zoning']}",
              "Commercial / industrial zones allow tall buildings, shops and works next door — views and sun can change." if lv == "watch"
              else "Residential zoning limits what can be built nearby.")
    else:
        R.add("ask", "Zoning (用途地域) not stated", "Check the zoning of the plot and the neighbouring blocks (city zoning map).")
    if L["restrict"]:
        R.add("watch", f"Other restrictions: {L['restrict']}")
    R.add("info", "Planned roads, district plans, filled-land and building-coverage checks: not yet automated",
          "With the MLIT API key the report will add 都市計画道路, 地区計画 and 用途地域 of the surrounding blocks.")
    R.src("reinfo")

    # ---------- D. earthquake & building ----------
    R.section("D", "Earthquake safety")
    if L["year"]:
        ym = L["year"] * 100 + (L["month"] or 6)
        if any("耐震基準適合" in t for t in raw["tags"]):
            R.add("good", "耐震基準適合証明書 mentioned", "The building meets current seismic rules (also unlocks the tax credit).")
        if ym >= 198304:
            R.add("good", f"Built {L['year']}-{L['month'] or '?':>02} — current seismic standard (新耐震)",
                  "The rule depends on the building-permit date (from June 1981); completion from spring 1983 is almost always new-standard.")
        elif ym >= 198106:
            R.add("watch", f"Built {L['year']}-{L['month']:02d} — may be old OR new seismic standard",
                  "Completed close to the 1981 change: it depends on the 建築確認 (permit) date.",
                  ask="When was the 建築確認 issued? Is there a 耐震診断 or 耐震基準適合証明書?")
        else:
            R.add("risk", f"Built {L['year']} — old seismic standard (旧耐震)",
                  "Designed before June 1981. Many such buildings are fine, but loans, tax credit and resale are harder unless retrofitted.",
                  ask="Has a 耐震診断 been done? Results and any retrofit (耐震改修) plans?")
    if any(re.search("免震|制震", t) for t in raw["tags"] + [raw["feat"]]):
        R.add("good", "Seismic isolation or damping mentioned (免震/制震)")
    if L["struct"]:
        R.add("info", f"Structure: {L['struct']}, {L['floors'] or '?'} floors", "RC/SRC are the norm for condos.")
    lat, lon = raw["lat"], raw["lng"]
    J = jshis(lat, lon) if lat and lon else {}
    if J.get("p"):
        p6l, p6u = J["p"]["55"], J["p"]["60"]
        qs = [a["hazard"]["quake30"] for a in areas if (a.get("hazard") or {}).get("quake30") is not None]
        rank = sum(v < p6l for v in qs) + 1
        R.add("risk" if p6l >= 70 else "watch" if p6l >= 50 else "ok",
              f"30-year chance of shaking ≥ 6-lower here: {p6l:.0f}% (≥ 6-upper: {p6u:.0f}%)",
              f"≥ 5-upper: {J['p']['50']:.0f}%. Modern buildings are designed for this; the risk is contents, lifts, pipes and the days without water or power.",
              f"Study areas (population-weighted, ≥ 6-lower): median {med(qs):.0f}%, range {min(qs):.0f}–{max(qs):.0f}% → rank {rank} of {len(qs) + 1} from the safest" if qs else "")
        facts["quake6l"] = round(p6l)
    if J.get("ground"):
        gd = J["ground"]
        R.add("risk" if gd["arv"] >= 1.6 else "watch" if gd["arv"] >= 1.4 else "good",
              f"Ground: {gd['name']} — shaking amplified ×{gd['arv']:.2f}",
              f"Soft ground amplifies shaking (AVS30 {gd['avs']:.0f} m/s; about 1.6 or more counts as soft). Ask how the building is founded (piles to bearing stratum?).",
              ask="What kind of foundation does the building have (支持層までの杭基礎)?" if gd["arv"] >= 1.4 else None)
    R.src("jshis")

    # ---------- E. water & ground ----------
    R.section("E", "Water and ground", "Depth bands are the maximum assumed scenario (想定最大規模) at SUUMO's map point; SUUMO's point is approximate, so the worst value within ~100 m is shown too.")
    H = {}
    if lat and lon:
        try:
            H = hazards(lat, lon)
        except SystemExit as e:
            R.add("info", "Hazard tiles could not be read", str(e))
        except Exception as e:
            R.add("info", "Hazard tiles could not be read", str(e)[:120])
    band = {0: "none", 1: "< 0.5 m", 2: "0.5–3 m", 3: "3 m or more"}
    fl = L["floor"] or 1
    for k, nm in (("flood", "River flood"), ("surge", "Storm surge"), ("tsunami", "Tsunami")):
        if k not in H:
            continue
        at, mx = H[k]["at"], H[k]["max"]
        if mx == 0:
            R.add("good", f"{nm}: outside the mapped zone")
            continue
        wet = lambda d: (d >= 3 and fl <= 2) or (d >= 1 and fl <= 1)
        unit_wet = wet(at) or wet(mx)
        R.add("risk" if wet(at) or (k == "tsunami" and at >= 2) else "watch",
              f"{nm}: {band[at]} at the point" + (f" (up to {band[mx]} nearby)" if mx > at else ""),
              (f"The flat is on floor {fl}: {'it could be flooded' if unit_wet else 'it stays dry'}, but entrances, parking, lifts and the building's electrical room may not. "
               "Expect days without lifts/water if the electrical room floods."),
              ask="Where are the electrical room (電気室), water pumps and parking — basement or ground floor? Any flood barriers (止水板)?")
    if "slide" in H and H["slide"]["max"]:
        R.add("risk" if H["slide"]["max"] == 2 else "watch", "Landslide warning zone " + ("(red, special)" if H["slide"]["max"] == 2 else "(yellow)") + " within ~100 m")
    elif "slide" in H:
        R.add("good", "No landslide zone within ~100 m")
    lq = H.get("liq", {}).get("at")
    lfm = H.get("landform", {})
    LQ = {"high": ("risk", "high"), "mid": ("watch", "medium"), "low": ("ok", "low"), "vlow": ("good", "very low"),
          "fillUpland": ("watch", "fill on upland (collapse risk in quakes/rain, not liquefaction)")}
    if lq in LQ:
        lv, txt = LQ[lq]
        R.add(lv, f"Liquefaction tendency: {txt}",
              f"Landform: {lfm.get('artificial') or '–'} on {lfm.get('natural') or '–'} (国土地理院). Condo towers on piles usually stand, but roads, pipes, gas and sewers around them can fail for weeks (as in Urayasu 2011).",
              ask="Was the building or site damaged in 2011 (東日本大震災)? Ground improvement?" if lq in ("high", "mid") else None)
    if A and A.get("hazard"):
        hz = A["hazard"]
        R.add("info", f"Area context ({A['nameEn']})",
              cmp=f"{hz.get('waterAny', 0):.0f}% of residents live in some water zone · {hz.get('liqHigh', 0):.0f}% on high-liquefaction ground · {hz.get('landslide', 0):.1f}% in landslide zones")
    R.add("info", "Old maps", "Check what the site was before (sea, paddy, river) on 今昔マップ; past disaster records and 大規模盛土 maps come with the MLIT API key.")
    R.src("portal", "landform", "konjaku")

    # ---------- F. commute ----------
    R.section("F", f"Commute to {office.get('en', 'the office')}",
              f"Yahoo!乗換案内, next Wednesday, arrive by 08:45, IC fare, no paid express. Door-to-door = access to the station + train + {WALK_OFFICE} min at the office end.")
    C = commute(L["access"], office) if L["access"] else []
    ok = [c for c in C if c.get("door") is not None]
    mx = cmx.get("matrix", {})
    area_door = sorted(v[office["id"]][0] + WALK_HOME + WALK_OFFICE for v in mx.values() if v.get(office["id"]))
    for c in C:
        if c.get("door") is None:
            R.add("info", f"{c['station']} ({c['line']}): route lookup failed", c.get("error") or c.get("url", ""))
            continue
        rk = pct(area_door, c["door"]) if area_door else None
        R.add("good" if c["door"] <= 45 else "watch" if c["door"] >= 70 else "ok",
              f"{c['station']} ({c['line']}): {c['door']} min door-to-door, {c['xfer']} transfer{'s' if c['xfer'] != 1 else ''}",
              (f"Walk {c['walk']} min + bus {c['bus']} min + ~3 min wait" if c['viaBus'] else f"Walk {c['access']} min") + f" + train {c['min']} min"
              + (f" · 1-month commuter pass {fmt_yen(c['pass1m'])}" if c.get("pass1m") else ""),
              f"Faster than {100 - rk}% of the 77 study areas' typical door-to-door ({WALK_HOME} min walk at home)" if rk is not None else "")
    if ok:
        facts["commute"] = min(c["door"] for c in ok)
    if A and (A.get("commute") or {}).get("crowding"):
        R.add("info", f"Rush-hour crowding on the area's main line: {A['commute']['crowdingLine']}", "MLIT peak-hour 混雑率 (150% = can read a newspaper folded; 180% = pressed together).")
    if A and (A.get("bus") or {}).get("available"):
        b = A["bus"]
        R.add("good", "Commuter bus to Tokyo Station runs from this area", f"{b.get('route')} · {b.get('morningCount')} morning runs, fare ¥{b.get('fare')}")
    if len(L["access"]) >= 2:
        R.add("good" if len({a["line"] for a in L["access"]}) >= 2 else "info",
              f"{len({a['line'] for a in L['access']})} different line(s) listed",
              "A second line is a fallback when one line stops (Keiyo line is often stopped by wind).")
    R.src("yahoo")

    # ---------- G. management ----------
    R.section("G", "Building management and condition")
    mt = L["mgmtType"] or ""
    if mt:
        lv = "risk" if "自主" in mt else "watch" if "巡回" in mt else "ok"
        R.add(lv, f"Management: {mt}",
              {"risk": "Self-managed (自主管理): no management company — quality depends entirely on residents.",
               "watch": "Visiting only (巡回): nobody on site most days.",
               "ok": "常駐 = resident manager, 日勤/通勤 = manager on weekdays."}[lv])
    if L["units"]:
        R.add("watch" if L["units"] < 30 else "ok", f"{L['units']} units",
              "Small buildings split fixed costs (lifts, repairs) among fewer owners → higher fees and bigger levies." if L["units"] < 30
              else "Enough owners to share fixed costs.")
    if age is not None:
        cyc = [(12, 15, "1st major repair (外壁・屋上防水)"), (24, 30, "2nd major repair"), (36, 45, "3rd major repair (often pipes, lifts, windows)")]
        due = [c for c in cyc if c[0] - 2 <= age <= c[1] + 3]
        R.add("ask" if due else "info", f"Age {age} years" + (f" — {due[0][2]} due around now" if due else ""),
              "Major repairs come every ~12–15 years. Ask whether the last one was done on time and paid from the fund (not by a levy or loan).",
              ask="When was the last 大規模修繕, what did it cover and how was it paid? What is planned next?")
    R.add("ask" if not L["builder"] else "info", f"Builder: {L['builder'] or 'not stated'}", ask=None if L["builder"] else "Who built it (施工会社)?")
    R.add("ask", "Key documents decide this section", "重要事項調査報告書 (fund balance, arrears, loans of the association), 総会議事録 (last 2–3 years), 長期修繕計画, 管理規約・使用細則.",
          ask="Can I see the 重要事項調査報告書 and the last 2–3 years of 総会議事録?")

    # ---------- H. unit ----------
    R.section("H", "The flat itself")
    tags = raw["tags"]
    if L["floor"] and L["floors"]:
        top = L["floor"] >= L["floors"]
        R.add("watch" if L["floor"] == 1 or top else "ok", f"Floor {L['floor']} of {L['floors']}",
              "Top floor: hotter in summer, roof leaks are possible." if top else "Ground floor: damp, insects, security." if L["floor"] == 1 else "Middle floor: neighbours above and below insulate.")
    if L["facing"]:
        R.add("good" if re.search("南", L["facing"]) else "info", f"Balcony faces {L['facing']}")
    if any("角住戸" in t for t in tags):
        R.add("good", "Corner unit (角住戸)", "More windows and light; slightly more heat loss.")
    if m2:
        reg = m2 * 0.94 if L["m2basis"] != "内法" else m2
        R.add("info", f"{m2} m² ({L['m2basis'] or 'basis not stated'}) ≈ {reg:.1f} m² registered" if L["m2basis"] != "内法" else f"{m2} m² (内法 = registered area)",
              "The tax rules (mortgage credit ≥ 50 m²) use the registered 内法 area, about 5–8% smaller than the advertised 壁芯 area.")
    if L["reform"]:
        R.add("info", f"Renovation: {L['reform']}")

    # ---------- I. energy ----------
    R.section("I", "Energy, windows and running cost", "Energy labels are only required for new buildings (from April 2024): used flats almost never show them, so proxies are used.")
    if any(L[k] for k in ("energy", "insul", "utilCost")):
        R.add("good", "Energy label shown", f"{L['energy'] or ''} {L['insul'] or ''} {L['utilCost'] or ''}")
    else:
        R.add("ask", "No energy label (normal for used flats)", ask="Is there a 住宅性能評価書, BELS or 長期優良住宅 certificate?")
    if L["year"]:
        era = ("before the first insulation rules (1980)" if L["year"] < 1981 else "1980 rules (旧省エネ, weak)" if L["year"] < 1993
               else "1992 rules (新省エネ)" if L["year"] < 2000 else "1999 rules (次世代省エネ, ~today's 等級4)" if L["year"] < 2015 else "2013+ rules")
        R.add("good" if L["year"] >= 2001 else "watch", f"Likely designed to {era}", "Era is only a hint: condos were not required to meet the energy standard until 2025.")
    glaze = [t for t in tags if re.search("複層|ペア|二重|Low-?E|断熱サッシ", t)] + re.findall(r"ペアガラス|複層ガラス|二重サッシ|Low-?E", raw["feat"])
    if glaze:
        R.add("good", "Double glazing mentioned: " + ", ".join(dict.fromkeys(glaze)))
    else:
        R.add("ask", "Window type not stated",
              "In condos the window frames are common property: you usually cannot replace them yourself; inner windows (内窓) are allowed and subsidised.",
              ask="Are the windows single or double glazed? Were sashes replaced in a major repair?")
    gas = [t for t in tags if re.search("都市ガス|プロパン|オール電化", t)]
    R.add("good" if gas and "プロパン" not in gas[0] else "watch" if gas else "ask",
          f"Energy supply: {', '.join(gas)}" if gas else "Gas type not stated", "Propane (LPG) costs much more than city gas." if not gas or "プロパン" in gas[0] else "",
          ask=None if gas else "City gas or propane? Electricity contract (high-voltage bulk 一括受電)?")
    eco = [t for t in tags if re.search("省エネ給湯|エコジョーズ|エネファーム|太陽光|床暖房", t)]
    if eco:
        R.add("info", "Equipment: " + ", ".join(eco))
    if L["year"]:
        ok82 = L["year"] >= 1982
        reg_ok = m2 and (m2 * (0.94 if L["m2basis"] != "内法" else 1)) >= 50
        R.add("good" if ok82 and reg_ok else "watch",
              "Mortgage tax credit: " + ("eligible" if ok82 and reg_ok else "check eligibility"),
              ("Built 1982 or later ✓" if ok82 else "Built before 1982: needs a 耐震基準適合証明書") + " · "
              + ("registered area ≥ 50 m² ✓" if reg_ok else "registered area may be under 50 m²") + ". "
              "Without an energy certificate a used home falls in the basic tier: 0.7% of the loan balance up to ¥20M for 10 years (max ¥140k/year). "
              "With a 省エネ基準適合 certificate it is 13 years; ZEH-level / 長期優良 raises the cap to ¥35M.")
    R.src("label", "tax")

    # ---------- J. parking ----------
    R.section("J", "Parking and mobility")
    ptxt = L["parking"] or ""
    if not ptxt:
        R.add("ask", "Parking not stated", ask="Is there parking? Fee, waiting list, type (flat / mechanical) and height limit?")
    elif re.search("(?<!空)無|なし", ptxt) and not pk and not re.search("空無|空きなし", ptxt):
        R.add("risk", f"Parking: {ptxt}", "No parking in the building: you will need a monthly car park nearby.")
    else:
        mech = re.search("機械", ptxt + " ".join(tags))
        full = re.search("空無|空きなし|空き待ち|キャンセル待ち", ptxt)
        R.add("watch" if full else "good", f"Parking: {ptxt}",
              ("Currently full — ask about the waiting list. " if full else "")
              + ("Mechanical parking is expensive to maintain and replace (often a big item in the repair plan); check the height and weight limits for your car." if mech else ""),
              f"Area watchlist listings with on-site parking: median {fmt_yen(med(pk_area))}/month ({len(pk_area)} listings)" if pk_area else "",
              ask="Is a space available now? How long is the waiting list?" if full else None)
    if any("駐輪" in t or "バイク" in t for t in tags):
        R.add("info", "Bicycle / bike parking mentioned")
    R.add("ask", "Bicycle parking for child seats, EV charging", ask="Bicycle parking: spaces available and fee? Large (child-seat) bikes allowed?")

    # ---------- K. neighbourhood ----------
    R.section("K", "Family life around it", "Nearby facilities from SUUMO's 周辺環境 tab; area figures from the location study.")
    K = raw["kankyo"]
    for cat, label in (("小学校", "Elementary school"), ("中学校", "Junior high"), ("幼稚園・保育園", "Kindergarten / daycare"),
                       ("保育園", "Daycare"), ("公園", "Park"), ("スーパー", "Supermarket"), ("病院", "Clinic / hospital"), ("駅", "Station")):
        xs = sorted((k for k in K if k["cat"] == cat), key=lambda k: k["m"])
        if xs:
            R.add("info", f"{label}: {xs[0]['name']} — {xs[0]['walk']} min ({xs[0]['m']} m)")
    R.add("ask", "Assigned school district", "The school you are assigned to (学区) is not always the nearest one.",
          ask="Which elementary and junior-high school is this address assigned to (通学区域)?")
    if A:
        cc, cr, hl = (A.get("childcare") or {}), A.get("crime"), A.get("health")
        if cc:
            R.add("good" if not cc.get("waitlist2026") else "watch", f"Daycare waitlist ({A['nameEn']}): {cc.get('waitlist2026', '–')} (2026)",
                  cmp=f"0–2 daycare fee ~{fmt_yen(cc.get('daycare0to2Monthly'))}/month · child medical subsidy to age {cc.get('medicalAge', '–')}")
        if cr:
            safe = sorted((a["crime"]["safetyIndex"] for a in areas if (a.get("crime") or {}).get("safetyIndex") is not None), reverse=True)
            rk = safe.index(cr["safetyIndex"]) + 1 if cr.get("safetyIndex") in safe else None
            R.add("good" if rk and rk <= len(safe) / 3 else "watch" if rk and rk > 2 * len(safe) / 3 else "ok",
                  f"Crime: #{rk}/{len(safe)} safest study area" if rk else "Crime",
                  cmp=f"Burglary {cr.get('burglaryPer10k')}/10k residents · violent {cr.get('violentPer10k')}/10k · all {cr.get('totalPer1k')}/1k ({cr.get('year')})")
        if hl:
            R.add("info", f"Paediatrics: {hl.get('peds')} clinics in the area ({hl.get('per10k')} per 10k children)")
        nz = (noise.get("areas") or {}).get(A["id"], {}).get("flags", [])
        for n_ in nz:
            R.add("watch" if n_.get("level") != "con" else "info", f"Noise: {n_.get('kind')}", n_.get("note", ""))
    R.add("info", "Main roads and rail lines next door", "Check on the visit and on the map: traffic noise, trucks at night, train noise.")

    # ---------- L. resale ----------
    R.section("L", "Resale and future value")
    if A:
        dm = (A.get("demographics") or {})
        R.add("good" if (dm.get("ipss2050") or -99) > -5 else "watch" if (dm.get("ipss2050") or 0) < -15 else "ok",
              f"Population {A['nameEn']}: {dm.get('change2020to2025', '–'):+}% 2020–25, projected {dm.get('ipss2050', '–'):+}% by 2050 (社人研)" if dm.get("ipss2050") is not None else "Population trend: –",
              "Shrinking areas see weaker resale and fewer services.")
        if area_rows:
            R.add("info", f"{len(area_rows) + 1} large (90 m²+) flats for sale in the area now", "Many similar listings = easy to compare, but also competition when you sell.")
        pl = (A.get("pipeline") or {}).get("projects", [])
        if pl:
            R.add("info", "Area projects: " + "; ".join(p["name"] for p in pl[:4]))
    if L["access"] and L["access"][0]["walk"] > 15 and not L["access"][0]["bus"]:
        R.add("watch", "Long walk to the station", "Flats more than 15 min from a station are harder to resell, especially as the population ages.")
    if L["year"] and L["year"] < 1982:
        R.add("watch", "Old-standard building", "Fewer buyers can get a loan or tax credit → slower resale.")
    R.add("info", "Land-price trend at the nearest official point (公示地価): with the MLIT API key")

    # ---------- M. contract ----------
    R.section("M", "Contract terms")
    if L["deal"] == "売主":
        R.add("good", "Seller is a company (売主)", "No agent fee; a company seller must give at least 2 years of defect liability.")
    elif L["deal"] == "仲介":
        R.add("info", "Sold through an agent (仲介)", "Agent fee applies. Individual sellers often limit defect liability to ~3 months.",
              ask="How long is the seller's 契約不適合責任, and is equipment excluded?")
    txt = raw["feat"] + " " + (L["restrict"] or "")
    if re.search(r"契約不適合責任.{0,10}免責|瑕疵担保.{0,10}免責", txt):
        R.add("risk", "Seller's liability for defects excluded (免責)")
    if any(re.search("瑕疵|保証", t) for t in tags) or re.search(r"瑕疵保険|インスペクション|建物状況調査", txt):
        R.add("good", "Inspection or defect insurance mentioned")
    else:
        R.add("ask", "No inspection mentioned", "An independent inspection (インスペクション, ~¥50–100k) and 既存住宅売買瑕疵保険 protect you and can be a loan/tax condition.",
              ask="Can I arrange an inspection (インスペクション) before signing?")
    if re.search(r"告知事項|心理的", txt):
        R.add("risk", "Disclosure notice (告知事項) mentioned", "Ask exactly what happened.")
    R.add("ask", "Disclosures", ask="Any 告知事項 (incidents, leaks, disputes with neighbours, asbestos survey)?")
    R.add("info", f"Handover: {L['handover'] or '–'}")

    return L, A, office, R, facts, H, J, C


# ── output ──────────────────────────────────────────────────────
LV = {"risk": ("Risk", 0), "watch": ("Check", 1), "ask": ("Ask", 2), "ok": ("OK", 3), "good": ("Good", 4), "info": ("Info", 5)}
DOCS = [("重要事項調査報告書", "management report: fund balance, arrears, association loans, planned works"),
        ("長期修繕計画", "long-term repair plan and planned fund increases"),
        ("総会議事録 (last 2–3 years)", "minutes: disputes, leaks, levies, problems being discussed"),
        ("管理規約・使用細則", "rules: pets, renovation, flooring, short-term rental, parking"),
        ("修繕履歴", "repair history, incl. pipes and windows"),
        ("登記簿謄本", "registered owner and area, mortgages on the property"),
        ("固定資産税 納税通知書 / 評価証明", "property tax amount"),
        ("建築確認済証・検査済証", "permit date (seismic standard) and completion inspection"),
        ("インスペクション報告書", "if one was done; otherwise arrange your own"),
        ("付帯設備表・物件状況報告書", "what equipment stays; known defects")]
VISIT = ["Water stains on ceilings, around windows and under the sink; black mould on window frames (condensation = single glazing / poor insulation)",
         "Common areas: entrance, bins, bike parking, notice board (it shows how the building is run)",
         "Noise from above and from the street with windows closed and open; train/road at rush hour",
         "Phone signal and internet type (光配線方式?)",
         "Water pressure and how long hot water takes; check all equipment works",
         "Sun at different times; what stands or could be built in front of the balcony",
         "Walk to the station at commute time; how the route feels at night",
         "Where the electrical room, pumps and parking are (flood exposure)"]


def esc(s):
    return html.escape(str(s or ""))


def render(raw, L, A, office, R, facts, rate):
    counts = {k: sum(i["level"] == k for s in R.sections for i in s["items"]) for k in LV}
    top = [(s["key"], i) for s in R.sections for i in s["items"] if i["level"] in ("risk", "watch")]
    good = [(s["key"], i) for s in R.sections for i in s["items"] if i["level"] == "good"]
    asks = list(dict.fromkeys(i["ask"] for s in R.sections for i in s["items"] if i.get("ask")))
    kv = [("Price", fmt_man(L["price"])), ("Size", f"{L['m2']} m² · {L['layout'] or ''}"),
          ("Built", f"{L['year'] or '–'}" + (f" ({date.today().year - L['year']} yrs)" if L["year"] else "")),
          ("Floor", f"{L['floor'] or '–'} / {L['floors'] or '–'}"), ("Fees", f"{fmt_yen((L['mgmt'] or 0) + (L['repair'] or 0))}/mo"),
          ("Station", (f"{L['access'][0]['station']} " + (f"bus {L['access'][0]['bus']} + " if L['access'][0]['bus'] else '') + f"walk {L['access'][0]['walk']} min") if L["access"] else "–"),
          ("Door-to-door", f"{facts['commute']} min to {office.get('en')}" if facts.get("commute") else "–"),
          ("Buying costs", f"{fmt_yen(facts['buyCosts'][0])}–{fmt_yen(facts['buyCosts'][1])}" if facts.get("buyCosts") else "–")]
    item = lambda i: (f'<div class="it {i["level"]}"><span class="lv">{LV[i["level"]][0]}</span><div><b>{esc(i["head"])}</b>'
                      + (f'<p>{esc(i["detail"])}</p>' if i["detail"] else "") + (f'<p class="cmp">{esc(i["cmp"])}</p>' if i["cmp"] else "") + "</div></div>")
    secs = []
    for s in R.sections:
        its = sorted(s["items"], key=lambda i: LV[i["level"]][1])
        src = "".join(f'<a href="{esc(u)}" target="_blank" rel="noopener">{esc(n)}</a>' for n, u in s["src"])
        secs.append(f'<section id="s{s["key"]}"><h2><span>{s["key"]}</span>{esc(s["title"])}</h2>'
                    + (f'<p class="intro">{esc(s["intro"])}</p>' if s["intro"] else "") + "".join(item(i) for i in its)
                    + (f'<p class="src">Sources: {src}</p>' if src else "") + "</section>")
    title = f"Deep look: {raw['name']}"
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<style>
:root{{--bg:#fff;--fg:#1c1828;--mut:#5a566e;--line:#e3e0ea;--card:#faf9fc;--risk:#c62828;--watch:#d98a00;--ask:#2f6fd6;--ok:#6b7a8f;--good:#2e7d32;--info:#8a8698}}
@media (prefers-color-scheme:dark){{:root:not(.print){{--bg:#111118;--fg:#eeeaf4;--mut:#a8a4b8;--line:#2a2836;--card:#191922}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI","Hiragino Sans","Yu Gothic UI",sans-serif}}
main{{max-width:900px;margin:0 auto;padding:16px}}a{{color:var(--ask)}}
.bar{{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}}.bar a,.bar button{{font:inherit;font-size:.85rem;padding:6px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);text-decoration:none;cursor:pointer}}
h1{{font-size:1.45rem;margin:.2em 0}}.sub{{color:var(--mut);font-size:.85rem}}
.kv{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:14px 0}}.kv div{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 10px}}.kv small{{display:block;color:var(--mut);font-size:.72rem}}
.cnt{{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}}.cnt span{{font-size:.8rem;padding:2px 8px;border-radius:10px;color:#fff}}
.sum{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}@media(max-width:640px){{.sum{{grid-template-columns:1fr}}}}
.sum ul{{margin:4px 0;padding-left:18px}}.sum li{{margin:2px 0}}.sum h3{{margin:.4em 0 .2em;font-size:1rem}}
section{{border-top:2px solid var(--line);margin-top:18px;padding-top:6px;break-inside:auto}}
h2{{font-size:1.1rem;display:flex;gap:8px;align-items:center;margin:.4em 0}}h2 span{{display:inline-grid;place-items:center;width:1.6em;height:1.6em;border-radius:50%;background:var(--fg);color:var(--bg);font-size:.8rem}}
.intro{{color:var(--mut);font-size:.85rem;margin:.2em 0 .6em}}
.it{{display:grid;grid-template-columns:4.2em 1fr;gap:8px;padding:6px 0;border-bottom:1px dashed var(--line);break-inside:avoid}}.it p{{margin:.15em 0;font-size:.88rem}}.it .cmp{{color:var(--mut)}}
.lv{{font-size:.7rem;font-weight:700;text-transform:uppercase;text-align:center;border-radius:6px;padding:2px 0;color:#fff;height:fit-content;margin-top:2px}}
.risk .lv,.cnt .risk{{background:var(--risk)}}.watch .lv,.cnt .watch{{background:var(--watch)}}.ask .lv,.cnt .ask{{background:var(--ask)}}.ok .lv,.cnt .ok{{background:var(--ok)}}.good .lv,.cnt .good{{background:var(--good)}}.info .lv,.cnt .info{{background:var(--info)}}
.src{{font-size:.75rem;color:var(--mut)}}.src a{{margin-right:10px}}
ol.q li,ul.docs li,ul.visit li{{margin:3px 0;font-size:.9rem}}.foot{{color:var(--mut);font-size:.75rem;margin-top:24px}}
@media print{{@page{{size:A4;margin:12mm 11mm}}body{{font-size:9.5pt;line-height:1.4;background:#fff;color:#000}}.noprint{{display:none!important}}main{{max-width:none;padding:0}}
 a{{color:#000;text-decoration:none}}section{{break-inside:auto}}h2{{break-after:avoid}}.it{{padding:3px 0}}.it,.kv div,.sum>div{{break-inside:avoid}}
 *{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}.kv div{{background:#f6f6f6}}#sQ{{break-before:page}}}}
</style></head><body><main>
<div class="bar noprint"><a href="../index.html#deeplook">← Deep look</a><button onclick="window.print()">Print / save as PDF</button><a href="{esc(raw['url'])}" target="_blank" rel="noopener">Open on SUUMO</a></div>
<h1>{esc(raw['name'])}</h1>
<div class="sub">{esc(L['address'])}{(' · ' + esc(A['nameEn'])) if A else ''} · SUUMO {esc(raw['id'])} · analysed {raw['fetched']} · commute to {esc(office.get('en'))} · loan rate {rate:.2f}%</div>
<div class="kv">{''.join(f'<div><small>{k}</small>{esc(v)}</div>' for k, v in kv)}</div>
<div class="cnt">{''.join(f'<span class="{k}">{LV[k][0]} {counts[k]}</span>' for k in LV if counts[k])}</div>
<div class="sum"><div><h3>Check first</h3><ul>{''.join(f'<li><b>{k}</b> {esc(i["head"])}</li>' for k, i in top[:8]) or '<li>Nothing flagged</li>'}</ul></div>
<div><h3>Strengths</h3><ul>{''.join(f'<li><b>{k}</b> {esc(i["head"])}</li>' for k, i in good[:8]) or '<li>–</li>'}</ul></div></div>
{''.join(secs)}
<section id="sQ"><h2><span>?</span>Ask the agent</h2><ol class="q">{''.join(f'<li>{esc(a)}</li>' for a in asks)}</ol>
<h2><span>📄</span>Documents to request</h2><ul class="docs">{''.join(f'<li><b>{esc(a)}</b> — {esc(b)}</li>' for a, b in DOCS)}</ul>
<h2><span>👀</span>On the visit</h2><ul class="visit">{''.join(f'<li>{esc(v)}</li>' for v in VISIT)}</ul></section>
<p class="foot">Automated analysis from public data on {raw['fetched']} — not professional advice. SUUMO fields are entered by the agent; a missing item means "not stated", not "absent". Hazard depths are the maximum assumed scenarios. Method: reports/Deep look - research and design.md.</p>
</main></body></html>"""


def run(url, office_id="tokyo", rate=1.0):
    m = URL_RE.match((url or "").strip())
    if not m:
        raise SystemExit("not a SUUMO used-condo URL (expected https://suumo.jp/ms/chuko/…/nc_<id>/)")
    raw = scrape(m.group(0))
    L, A, office, R, facts, H, J, C = analyse(raw, office_id, rate)
    OUT.mkdir(exist_ok=True)
    (OUT / f"{raw['id']}.html").write_text(render(raw, L, A, office, R, facts, rate), encoding="utf-8")
    (OUT / f"{raw['id']}.json").write_text(json.dumps({"raw": raw, "listing": L, "area": A["id"] if A else None, "office": office.get("id"),
                                                       "facts": facts, "hazard": H, "jshis": J, "commute": C,
                                                       "sections": R.sections}, ensure_ascii=False, indent=1), encoding="utf-8")
    idx = load_json(OUT / "index.json", {"items": []})
    counts = {k: sum(i["level"] == k for s in R.sections for i in s["items"]) for k in ("risk", "watch", "ask", "good")}
    entry = {"id": raw["id"], "name": raw["name"], "area": A["nameEn"] if A else None, "areaId": A["id"] if A else None,
             "price": L["price"], "m2": L["m2"], "year": L["year"], "date": raw["fetched"], "office": office.get("id"),
             "url": raw["url"], "counts": counts, "commute": facts.get("commute"),
             "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    idx["items"] = [entry] + [i for i in idx["items"] if i["id"] != raw["id"]]
    idx["generated"] = raw["fetched"]
    (OUT / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT}/{raw['id']}.html · {counts}")
    return entry


def telegram(text):
    tok, chat = os.environ.get("TELEGRAM_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not tok or not chat:
        return
    data = urllib.parse.urlencode({"chat_id": chat, "text": text, "disable_web_page_preview": "true"}).encode()
    try:
        urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage", data, timeout=20)
    except Exception as e:
        print("telegram failed:", e)


def ci():
    """GitHub Action entry: URL/options from the issue body (or workflow inputs); writes step outputs."""
    body = os.environ.get("ISSUE_BODY") or ""
    url = os.environ.get("IN_URL") or (URL_RE.search(body).group(0) if URL_RE.search(body) else "")
    om = re.search(r"office\s*[:=]\s*([a-z]+)", body)
    rm = re.search(r"rate\s*[:=]\s*([\d.]+)", body)
    office = os.environ.get("IN_OFFICE") or (om.group(1) if om else "tokyo")
    try:
        rate = float(os.environ.get("IN_RATE") or (rm.group(1) if rm else 1.0))
    except ValueError:
        rate = 1.0
    out = {}
    try:
        e = run(url, office, rate)
        link = f"{SITE}deeplook/{e['id']}.html"
        c = e["counts"]
        out = {"id": e["id"], "link": link,
               "msg": f"Deep look ready: {e['name']} — {c['risk']} risk, {c['watch']} to check, {c['ask']} questions. {link}"}
    except SystemExit as ex:
        out = {"id": "", "link": "", "msg": f"Deep look failed: {ex}"}
    except Exception as ex:
        out = {"id": "", "link": "", "msg": f"Deep look crashed: {type(ex).__name__}: {str(ex)[:200]}"}
    print(out["msg"])
    telegram(out["msg"])
    gh = os.environ.get("GITHUB_OUTPUT")
    if gh:
        with open(gh, "a", encoding="utf-8") as fh:
            for k, v in out.items():
                fh.write(f"{k}={v.replace(chr(10), ' ')}\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("url", nargs="?")
    ap.add_argument("--office", default="tokyo")
    ap.add_argument("--rate", type=float, default=1.0)
    ap.add_argument("--ci", action="store_true")
    ap.add_argument("--peers", action="store_true")
    a = ap.parse_args()
    if a.peers:
        build_peers()
    elif a.ci:
        ci()
    elif a.url:
        run(a.url, a.office, a.rate)
    else:
        ap.print_help()
