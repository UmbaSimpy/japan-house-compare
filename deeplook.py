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

Run:  python deeplook.py <suumo url> [--office tokyo] [--rate 1.525] [--down 10] [--years 35] [--tax 0.25]      local
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
LOAN = {"rate": 1.525, "down": 10.0, "years": 35, "tax": 0.25}   # Loan tab defaults (loan.js); the issue body overrides them

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
SRC_JA = {"MLIT 修繕積立金ガイドライン (2024)": "国土交通省 修繕積立金ガイドライン（2024年改訂）", "MLIT 住宅ローン減税": "国土交通省 住宅ローン減税",
          "MLIT 省エネ性能表示制度": "国土交通省 省エネ性能表示制度", "今昔マップ (old maps)": "今昔マップ on the web",
          "不動産情報ライブラリ (prices, zoning, school districts)": "国土交通省 不動産情報ライブラリ",
          "SUUMO used condos (daily snapshot)": "SUUMO 中古マンション（毎日取得）"}

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
# Every user-facing text is T(en, ja); plain strings (numbers, names) are shown as-is in both languages.
def T(en, ja):
    return {"en": en, "ja": ja}


def yj(v):
    """円 (Japanese style)."""
    return "–" if v is None else f"{round(v):,}円"


def mj(v):
    """万円 → '4,880万円' / '1億2,000万円'."""
    if v is None:
        return "–"
    v = round(v)
    return f"{v // 10000}億{v % 10000:,}万円" if v >= 10000 and v % 10000 else f"{v // 10000}億円" if v >= 10000 else f"{v:,}万円"


def ppm_en(v):
    return f"¥{v / 1000:,.0f}k/m²"


def ppm_ja(v):
    return f"{v / 10000:,.1f}万円/㎡"


def lang(x, l):
    return x.get(l, x.get("en", "")) if isinstance(x, dict) else (x or "")


# Which explanation (deeplook/glossary.js) belongs to a finding: first match on the English heading, per section
GKEY = {
    "A": [("Much cheaper", "cheap"), ("comparable flats|/m²$", "ppm"), ("Comparison set", "ppm"), ("other unit", "same"),
          ("Price history|On our radar", "history"), ("min walk to", "walk"), ("Actual sale prices", "sold")],
    "B": [("^Repair fund", "repair"), ("^Management fee", "mgmt"), ("Other fixed monthly", "extras"), ("/month", "monthly"), ("buying costs", "buycost")],
    "C": [("Land rights|Leasehold", "rights"), ("Zoning", "zoning"), ("Other restrictions", "restrict"), ("Planned roads", "plan")],
    "D": [("耐震基準適合証明書", "seismicCert"), ("seismic standard", "seismic"), ("isolation", "isolation"), ("^Structure", "struct"),
          ("30-year chance", "quake"), ("^Ground", "ground")],
    "E": [("^River flood", "flood"), ("^Storm surge", "surge"), ("^Tsunami", "tsunami"), ("[Ll]andslide", "slide"), ("Liquefaction", "liq"),
          ("Area context", "areahz"), ("Old maps", "oldmap")],
    "F": [("door-to-door|route lookup", "commute"), ("crowding", "crowd"), ("Commuter bus", "bus"), (r"line\(s\) listed", "lines")],
    "G": [("^Management:", "mgmtType"), ("units$", "units"), ("^Age", "major"), ("^Builder", "builder"), ("Key documents", "docs")],
    "H": [("^Floor", "floor"), ("Balcony faces", "facing"), ("Corner", "corner"), ("m² \\(", "area"), ("Renovation", "reform")],
    "I": [("[Ee]nergy label", "energy"), ("designed to", "era"), ("glazing|Window type", "glazing"), ("Energy supply|Gas type", "gas"),
          ("^Equipment", "equip"), ("tax credit", "taxcredit")],
    "J": [("^Parking", "parking"), ("[Bb]icycle", "bike")],
    "K": [("school district", "school"), ("^(Elementary|Junior|Kindergarten|Daycare:|Park|Supermarket|Clinic|Station)", "near"),
          ("Daycare waitlist", "daycare"), ("^Crime", "crime"), ("Paediatrics", "peds"), ("^Noise", "noise"), ("Main roads", "roads")],
    "L": [("^Population", "population"), ("flats for sale in the area", "supply"), ("Area projects", "projects"), ("Long walk", "farwalk"),
          ("Old-standard", "oldstd"), ("Land-price", "landprice")],
    "M": [("Seller is a company|Sold through an agent", "deal"), ("liability|免責", "liability"), ("[Ii]nspection", "inspection"),
          ("Disclosure", "disclosure"), ("Handover", "handover")],
}


def gkey(sec, head):
    h = head.get("en", "") if isinstance(head, dict) else str(head or "")
    return next((k for rx, k in GKEY.get(sec, []) if re.search(rx, h)), None)


class Report:
    def __init__(self):
        self.sections = []

    def section(self, key, title, intro=""):
        self.cur = {"key": key, "title": title, "intro": intro, "items": [], "src": []}
        self.sections.append(self.cur)

    def add(self, level, head, detail="", cmp="", ask=None, g=None):
        self.cur["items"].append({"level": level, "head": head, "detail": detail, "cmp": cmp, "ask": ask, "g": g or gkey(self.cur["key"], head)})

    def src(self, *keys_or_pairs):
        for k in keys_or_pairs:
            p = SRC[k] if isinstance(k, str) else k
            if p not in self.cur["src"]:
                self.cur["src"].append(p)


def analyse(raw, office_id="tokyo", rate=None):
    rate = LOAN["rate"] if rate is None else rate
    L = listing(raw)
    md = read_js("map-data.js")
    areas = md.get("areas", [])
    A = area_of(L["address"], areas)
    aid = A["id"] if A else None
    an, aj = (A["nameEn"], A["nameJa"]) if A else ("", "")
    al = read_js("area-listings.js").get("areas", {})
    peers_doc = load_json(PEERS, {"rows": []})
    P = [dict(zip(peers_doc.get("cols", []), r)) for r in peers_doc.get("rows", [])]
    state = load_json("data/area_listings_state.json", {}).get("ids", {})
    cmx = load_json("data/commute_matrix.json", {})
    noise = load_json("data/area_noise.json", {})
    offices = {o["id"]: o for o in cmx.get("offices", [])}
    office = offices.get(office_id) or offices.get("tokyo") or {"id": "tokyo", "query": "東京", "en": "Tokyo Stn", "ja": "東京"}
    oe, oj = office.get("en", "the office"), office.get("ja", "勤務先")
    y0 = date.today().year
    age = y0 - L["year"] if L["year"] else None
    price, m2 = L["price"], L["m2"]
    ppm = price / m2 * 10000 if price and m2 else None                 # ¥/m²
    R = Report()
    facts = {}

    # ---------- A. price ----------
    R.section("A", T("Is the price fair?", "価格は妥当か"),
              T("Asking price per m² against similar flats for sale now. Contract prices are usually a few % lower than asking.",
                "現在売りに出ている類似物件との㎡単価（売出価格）の比較。成約価格は通常、売出価格より数%低くなります。"))
    rows = (al.get(aid) or {}).get("rows", []) if aid else []
    own = {raw["id"]}
    area_rows = [r for r in rows if str(r[0]).split("/")[-1] not in own and r[2] and r[3]]
    band = [r for r in area_rows if L["year"] and r[5] and abs(r[5] - L["year"]) <= 5]
    if ppm and band:
        vals = [r[2] / r[3] * 10000 for r in band]
        p_ = pct(vals, ppm)
        n = len(band) + 1
        lv = "good" if p_ <= 25 else "watch" if p_ >= 80 else "ok"
        if ppm < min(vals):
            h = T(f"{ppm_en(ppm)} — the cheapest of {n} comparable flats", f"{ppm_ja(ppm)} — 類似物件{n}件の中で最も割安")
        elif ppm > max(vals):
            h = T(f"{ppm_en(ppm)} — the most expensive of {n} comparable flats", f"{ppm_ja(ppm)} — 類似物件{n}件の中で最も割高")
        else:
            h = T(f"{ppm_en(ppm)} — cheaper than {100 - p_}% of {len(band)} comparable flats", f"{ppm_ja(ppm)} — 類似物件{len(band)}件の{100 - p_}%より割安")
        all_med = med([r[2] / r[3] * 10000 for r in area_rows])
        R.add(lv, h,
              T(f"Comparable = 90 m²+ used condos for sale now in {an}, built {L['year'] - 5}–{L['year'] + 5}.",
                f"比較対象＝{aj}で現在売出中の専有面積90㎡以上の中古マンション（築{L['year'] - 5}〜{L['year'] + 5}年）。"),
              T(f"Median {ppm_en(med(vals))} · range {ppm_en(min(vals))}–{ppm_en(max(vals))} · all ages in the area: median {ppm_en(all_med)} ({len(area_rows)} flats)",
                f"中央値 {ppm_ja(med(vals))}・範囲 {ppm_ja(min(vals))}〜{ppm_ja(max(vals))}・エリア全体（築年問わず）の中央値 {ppm_ja(all_med)}（{len(area_rows)}件）"))
        if p_ <= 15:
            R.add("ask", T("Much cheaper than its peers — find out why", "類似物件よりかなり安い — 理由を確認"),
                  T("Typical reasons: low floor, poor orientation, a view blocked by a newer building, an upcoming levy, a structural or legal issue, a stigma (告知事項), or a seller in a hurry.",
                    "よくある理由：低層階、方角、新しい建物による眺望・日照の悪化、修繕一時金の予定、構造・法令上の問題、告知事項（心理的瑕疵）、売り急ぎ。"),
                  ask=T("Why is it priced below similar flats? How long has it been on the market and has the price changed?",
                        "類似物件より安い理由は何ですか？売出しからどのくらい経ち、価格改定はありましたか？"))
        if m2 and m2 < 90:
            R.add("info", T("Comparison set is 90 m²+ flats", "比較対象は90㎡以上の物件"),
                  T("This flat is smaller; small units usually cost more per m².", "本物件はそれより狭く、一般に狭い住戸ほど㎡単価は高くなります。"))
    elif ppm:
        R.add("info", T(ppm_en(ppm), ppm_ja(ppm)),
              T("No comparable 90 m²+ listings of a similar age in our area data.", "当サイトのエリアデータに、築年の近い90㎡以上の比較物件がありません。") if aid
              else T("This municipality is outside the 77 study areas — no peer data.", "この市区町村は調査対象77エリア外のため、比較データがありません。"))
    same = [r for r in area_rows if bname(r[1]) == bname(raw["name"])] + \
           [p for p in P if bname(p["name"]) == bname(raw["name"]) and str(p["id"]) not in own]
    if same:
        vals = []
        for r in same:
            vals.append((r[2], r[3]) if isinstance(r, list) else (r["price万"], r["m2"]))
        vals = sorted({(a, b) for a, b in vals if a and b and (a, round(b, 1)) != (price, round(m2 or 0, 1))})   # same unit via another agent
        if vals:
            R.add("info", T(f"{len(vals)} other unit(s) in the same building on sale", f"同じマンションの他の住戸が{len(vals)}件売出中"),
                  T(" · ".join(f"{fmt_man(a)} for {b} m² ({ppm_en(a / b * 10000)})" for a, b in vals[:6]),
                    "・".join(f"{mj(a)}（{b}㎡、{ppm_ja(a / b * 10000)}）" for a, b in vals[:6])))
    st = state.get(raw["id"])
    hist = next((p["priceHistory"] for p in P if str(p["id"]) == raw["id"] and p.get("priceHistory")), None)
    if hist and len(hist) > 1:
        R.add("info", T(f"Price history: first seen {hist[0][0]} at {fmt_man(hist[0][1])}", f"価格履歴：{hist[0][0]}に{mj(hist[0][1])}で初掲載"),
              T(" → ".join(f"{d}: {fmt_man(v)}" for d, v in hist), " → ".join(f"{d}：{mj(v)}" for d, v in hist)))
    elif st:
        R.add("info", T(f"On our radar since {st[0]} (first price {fmt_man(st[1])})", f"当サイトでの初確認：{st[0]}（当初価格 {mj(st[1])}）"))
    walks = [r[7] for r in area_rows if r[7] is not None and not r[8]]
    acc0 = L["access"][0] if L["access"] else None
    if acc0 and walks and not acc0["bus"]:
        p_ = pct(walks, acc0["walk"])
        R.add("good" if p_ <= 25 else "watch" if p_ >= 75 else "ok",
              T(f"{acc0['walk']} min walk to {acc0['station']} — closer than {100 - p_}% of the area's large flats",
                f"{acc0['station']}駅 徒歩{acc0['walk']}分 — エリア内の90㎡以上物件の{100 - p_}%より駅に近い"),
              cmp=T(f"Area median {med(walks):.0f} min (90 m²+ listings, walk access only)", f"エリア中央値 徒歩{med(walks):.0f}分（90㎡以上・徒歩物件のみ）"))
    R.add("info", T("Actual sale prices nearby: not yet included", "周辺の成約価格：未対応"),
          T("Needs the MLIT 不動産情報ライブラリ API key (transaction prices by district).", "国土交通省「不動産情報ライブラリ」のAPIキー取得後に、地区別の取引価格を追加します。"))
    R.src(("SUUMO used condos (daily snapshot)", "https://suumo.jp/ms/chuko/"), "reinfo")

    # ---------- B. costs ----------
    R.section("B", T("What it really costs", "実際にかかる費用"),
              T("Monthly running costs, how the fees compare, and the one-off costs of buying.", "毎月の費用、管理費・修繕積立金の水準比較、購入時の諸費用。"))
    rp_m2 = L["repair"] / m2 if L["repair"] and m2 else None
    mg_m2 = L["mgmt"] / m2 if L["mgmt"] and m2 else None
    agep = [p for p in P if L["year"] and p.get("year") and abs(p["year"] - L["year"]) <= 5 and p.get("m2")]
    floor_area = L["units"] * m2 * 1.25 if L["units"] and m2 else None    # rough: units × this unit's size × common areas
    gi = 4 if (L["floors"] or 0) >= 20 else 0 if not floor_area or floor_area < 5000 else 1 if floor_area < 10000 else 2 if floor_area < 20000 else 3
    g = GUIDE[gi]
    gja = ["20階未満・延床5,000㎡未満", "20階未満・延床5,000〜10,000㎡", "20階未満・延床10,000〜20,000㎡", "20階未満・延床20,000㎡以上", "20階以上"][gi]
    if rp_m2:
        rp_peers = [p["repair"] / p["m2"] for p in agep if p.get("repair")]
        lv = "good" if rp_m2 >= g[2] else "watch" if rp_m2 >= g[2] * 0.6 else "risk"
        near = floor_area and 4000 <= floor_area < 6500 and (L["floors"] or 0) < 20
        fa = format(round(floor_area, -2), ",.0f") if floor_area else ""
        low = rp_m2 < g[1]
        R.add(lv, T(f"Repair fund {fmt_yen(L['repair'])}/month = ¥{rp_m2:.0f}/m²", f"修繕積立金 月{yj(L['repair'])}（{rp_m2:.0f}円/㎡）"),
              T(f"MLIT guideline for a building like this ({g[0]}{', floor area estimated ~' + fa + ' m²' if fa else ''}): average ¥{g[1]}/m², ⅔ of buildings ¥{g[2]}–{g[3]}. "
                + (f"(The floor area is a rough estimate near the 5,000 m² line — the smaller band's average is ¥{GUIDE[0][1]}/m².) " if near else "")
                + (f"At the guideline average this flat would pay ≈ {fmt_yen(g[1] * m2)}/month (+{fmt_yen(g[1] * m2 - L['repair'])}). "
                   "A fund below the guideline usually means future increases or a one-off levy (一時金)." if low else ""),
                f"国土交通省「マンションの修繕積立金に関するガイドライン」の目安（{gja}{'、延床面積は約' + fa + '㎡と推定' if fa else ''}）：平均{g[1]}円/㎡、事例の3分の2が{g[2]}〜{g[3]}円/㎡。"
                + (f"（延床面積は概算で5,000㎡の境界付近のため、5,000㎡未満の区分では平均{GUIDE[0][1]}円/㎡。）" if near else "")
                + (f"ガイドライン平均なら本住戸は月約{yj(g[1] * m2)}（現在より+{yj(g[1] * m2 - L['repair'])}）。目安を下回る場合、将来の値上げや一時金徴収の可能性が高くなります。" if low else "")),
              T(f"Peers built ±5 years ({len(rp_peers)} watchlist condos): median ¥{med(rp_peers):.0f}/m², middle half ¥{q(rp_peers, .25):.0f}–{q(rp_peers, .75):.0f} → this flat is at the {pct(rp_peers, rp_m2)}th percentile.",
                f"築年±5年の比較物件（{len(rp_peers)}件）：中央値{med(rp_peers):.0f}円/㎡、中位50%は{q(rp_peers, .25):.0f}〜{q(rp_peers, .75):.0f}円/㎡ → 本物件は下から{pct(rp_peers, rp_m2)}%の位置。") if rp_peers else "",
              ask=T("Please share the 長期修繕計画 and the current repair-fund balance. Are increases or a 一時金 planned?",
                    "長期修繕計画書と修繕積立金の現在の残高を見せてください。値上げや一時金の予定はありますか？"))
        facts["repairPerM2"] = round(rp_m2)
    else:
        R.add("ask", T("Repair fund not stated", "修繕積立金の記載なし"), ask=T("What is the monthly 修繕積立金?", "修繕積立金は月額いくらですか？"))
    if mg_m2:
        mg_peers = [p["mgmt"] / p["m2"] for p in agep if p.get("mgmt")]
        ub = None
        if L["units"]:
            ub = (0, 60) if L["units"] <= 60 else (61, 150) if L["units"] <= 150 else (151, 99999)
            mg_peers_u = [p["mgmt"] / p["m2"] for p in agep if p.get("mgmt") and p.get("units") and ub[0] <= p["units"] <= ub[1]]
        else:
            mg_peers_u = []
        ref = mg_peers_u if len(mg_peers_u) >= 8 else mg_peers
        pp = pct(ref, mg_m2)
        sz = (f"{ub[0]}–{ub[1] if ub[1] < 9999 else ''}" if ub and ref is mg_peers_u else "")
        R.add("watch" if pp and pp >= 85 else "ok",
              T(f"Management fee {fmt_yen(L['mgmt'])}/month = ¥{mg_m2:.0f}/m²" + (f" ({L['mgmtType']})" if L["mgmtType"] else ""),
                f"管理費 月{yj(L['mgmt'])}（{mg_m2:.0f}円/㎡）" + (f"（{L['mgmtType']}）" if L["mgmtType"] else "")),
              T("Small buildings cost more per flat; staffed (常駐) management costs more than visiting (巡回).",
                "小規模マンションほど1戸あたりの負担は大きく、常駐管理は巡回管理より高くなります。"),
              T(f"Peers of similar age{' and size (' + sz + ' units)' if sz else ''}: median ¥{med(ref):.0f}/m² → {pp}th percentile ({len(ref)} condos)",
                f"築年{'・規模（' + sz + '戸）' if sz else ''}の近い比較物件：中央値{med(ref):.0f}円/㎡ → 下から{pp}%の位置（{len(ref)}件）") if ref else "")
    extras = sum(v for _, v in L["extras"])
    if L["extras"]:
        R.add("info", T(f"Other fixed monthly charges {fmt_yen(extras)}", f"その他の毎月の費用 {yj(extras)}"),
              T(" · ".join(f"{k} {fmt_yen(v)}" for k, v in L["extras"]), "・".join(f"{k} {yj(v)}" for k, v in L["extras"])))
    pk = yens(L["parking"] or "")
    pk_area = [p["parkingFee"] for p in P if A and p.get("areaKey") == A.get("tracked") and p.get("parkingFee")]
    dn, yrs, txp = LOAN["down"], int(LOAN["years"]), LOAN["tax"]
    loan = price * 10000 * (1 - dn / 100) if price else None
    ann = lambda P, r, n: P * (r / 1200) / (1 - (1 + r / 1200) ** -n) if r else P / n
    pay = ann(loan, rate, yrs * 12) if loan else None
    up1 = ann(loan, rate + 1, yrs * 12) - pay if loan else None
    ptax = price * 10000 * txp / 100 / 12 if price else 0
    fees = (L["mgmt"] or 0) + (L["repair"] or 0) + extras
    monthly = sum(v for v in (pay, L["mgmt"], L["repair"], extras, ptax) if v)
    facts.update(monthlyLoan=round(pay) if pay else None, monthlyFees=fees, monthlyAllIn=round(monthly), up1=round(up1) if up1 else None)
    if pay:
        R.add("info", T(f"≈ {fmt_yen(monthly)}/month all-in (before parking) · +1% rate: +{fmt_yen(up1)}",
                        f"毎月の総額 約{yj(monthly)}（駐車場代を除く）・金利+1%で+{yj(up1)}"),
              T(f"Loan {fmt_yen(pay)} ({dn:g}% down, {yrs} years, {rate:.3g}% — your Loan tab settings) + fees {fmt_yen(fees)} + property tax ≈ {fmt_yen(ptax)} ({txp:g}% of price / year, estimate)"
                + (f" · parking would add {fmt_yen(pk[0])}+" if pk else ""),
                f"住宅ローン返済 {yj(pay)}（頭金{dn:g}%・{yrs}年・金利{rate:.3g}%：「住宅ローン」タブの設定）＋管理費等 {yj(fees)}＋固定資産税等 約{yj(ptax)}（価格の年{txp:g}%で概算）"
                + (f"・駐車場を借りると +{yj(pk[0])}〜" if pk else "")),
              ask=T("What was the last 固定資産税・都市計画税 bill for this unit?", "この住戸の固定資産税・都市計画税（年額）はいくらですか？"))
    if price:
        agent = (price * 10000 * 0.03 + 60000) * 1.1 if L["deal"] in ("仲介", None) else 0
        lo, hi = agent + price * 10000 * 0.03, agent + price * 10000 * 0.05
        facts["buyCosts"] = [round(lo), round(hi)]
        reno = age and age >= 25
        R.add("info", T(f"One-off buying costs ≈ {fmt_yen(lo)}–{fmt_yen(hi)}", f"購入時の諸費用 約{yj(lo)}〜{yj(hi)}"),
              T((f"Agent fee (仲介手数料, 3% + ¥60k + tax) {fmt_yen(agent)}" if agent else "Sold directly by the owner company (売主): no agent fee")
                + " · plus registration tax and scrivener, loan fees and guarantee, fire + earthquake insurance, stamp duty, pro-rated property tax and fees: typically 3–5% of the price."
                + (" Budget for renovation separately." if reno else ""),
                (f"仲介手数料（物件価格×3%＋6万円＋消費税）{yj(agent)}" if agent else "売主物件のため仲介手数料なし")
                + "。ほかに登録免許税・司法書士報酬、ローン事務手数料・保証料、火災保険・地震保険、印紙税、固定資産税・管理費等の日割り精算などで、物件価格の3〜5%程度。"
                + ("リフォーム費用は別途見込んでください。" if reno else "")))
    R.src("guide", ("SUUMO", raw["url"]))

    # ---------- C. land & legal ----------
    R.section("C", T("Land rights and legal limits", "権利関係・法令上の制限"))
    rights = L["rights"] or ""
    if not rights:
        R.add("ask", T("Land rights not stated", "敷地の権利形態の記載なし"), ask=T("Is the land 所有権 (freehold)?", "敷地の権利は所有権ですか？"))
    elif "借地" in rights:
        R.add("risk", T(f"Leasehold land: {rights}", f"借地：{rights}"),
              T("You pay ground rent, the lease has an end date (定期借地 = the building is demolished at the end), banks lend less and resale is harder.",
                "地代の支払いがあり、契約期間に終わりがあります（定期借地権は期間満了時に建物を解体）。住宅ローンが組みにくく、売却もしにくくなります。"),
              ask=T("Ground rent, remaining lease term, dismantling reserve (解体準備金) and renewal terms?", "地代の額、残存期間、解体準備金、更新条件を教えてください。"))
    else:
        R.add("good", T(f"Land rights: {rights}", f"敷地の権利形態：{rights}"),
              T("Freehold share of the land (normal for condos).", "敷地の所有権（共有持分）。マンションとして一般的です。"))
    if L["zoning"]:
        com = re.search(r"商業|近隣商業|準工業|工業", L["zoning"])
        R.add("watch" if com else "ok", T(f"Zoning: {L['zoning']}", f"用途地域：{L['zoning']}"),
              T("Commercial / industrial zones allow tall buildings, shops and works next door — views and sun can change.",
                "商業系・工業系の地域では隣地に高い建物や店舗・工場が建つ可能性があり、眺望や日照が変わることがあります。") if com
              else T("Residential zoning limits what can be built nearby.", "住居系の用途地域のため、周辺に建てられる建物は制限されます。"))
    else:
        R.add("ask", T("Zoning (用途地域) not stated", "用途地域の記載なし"),
              T("Check the zoning of the plot and the neighbouring blocks (city zoning map).", "敷地と周辺街区の用途地域を自治体の都市計画図で確認してください。"))
    if L["restrict"]:
        R.add("watch", T(f"Other restrictions: {L['restrict']}", f"その他制限事項：{L['restrict']}"))
    R.add("info", T("Planned roads, district plans, filled-land and building-coverage checks: not yet automated", "都市計画道路・地区計画・盛土・建ぺい率等の確認：未対応"),
          T("With the MLIT API key the report will add 都市計画道路, 地区計画 and 用途地域 of the surrounding blocks.",
            "不動産情報ライブラリのAPIキー取得後に、都市計画道路・地区計画・周辺の用途地域を追加します。"))
    R.src("reinfo")

    # ---------- D. earthquake & building ----------
    R.section("D", T("Earthquake safety", "地震への備え"))
    if L["year"]:
        ym = L["year"] * 100 + (L["month"] or 6)
        mo = f"{L['month']:02d}" if L["month"] else "?"
        if any("耐震基準適合" in t for t in raw["tags"]):
            R.add("good", T("耐震基準適合証明書 mentioned", "耐震基準適合証明書の記載あり"),
                  T("The building meets current seismic rules (also unlocks the tax credit).", "現行の耐震基準を満たしています（住宅ローン控除の要件にもなります）。"))
        if ym >= 198304:
            R.add("good", T(f"Built {L['year']}-{mo} — current seismic standard (新耐震)", f"{L['year']}年{L['month'] or '?'}月築 — 新耐震基準"),
                  T("The rule depends on the building-permit date (from June 1981); completion from spring 1983 is almost always new-standard.",
                    "新耐震基準かどうかは建築確認日（1981年6月1日以降）で決まります。1983年春以降の竣工であれば、ほぼ確実に新耐震です。"))
        elif ym >= 198106:
            R.add("watch", T(f"Built {L['year']}-{mo} — may be old OR new seismic standard", f"{L['year']}年{L['month'] or '?'}月築 — 旧耐震・新耐震のどちらの可能性も"),
                  T("Completed close to the 1981 change: it depends on the 建築確認 (permit) date.", "1981年の基準改正直後の竣工のため、建築確認日で判断が分かれます。"),
                  ask=T("When was the 建築確認 issued? Is there a 耐震診断 or 耐震基準適合証明書?", "建築確認日はいつですか？耐震診断の結果や耐震基準適合証明書はありますか？"))
        else:
            R.add("risk", T(f"Built {L['year']} — old seismic standard (旧耐震)", f"{L['year']}年築 — 旧耐震基準"),
                  T("Designed before June 1981. Many such buildings are fine, but loans, tax credit and resale are harder unless retrofitted.",
                    "1981年6月より前の基準で設計。問題のない建物も多いものの、耐震改修がなければ住宅ローン・住宅ローン控除・売却で不利になります。"),
                  ask=T("Has a 耐震診断 been done? Results and any retrofit (耐震改修) plans?", "耐震診断は実施済みですか？結果と耐震改修の予定を教えてください。"))
    if any(re.search("免震|制震", t) for t in raw["tags"] + [raw["feat"]]):
        R.add("good", T("Seismic isolation or damping mentioned (免震/制震)", "免震・制震構造の記載あり"))
    if L["struct"]:
        R.add("info", T(f"Structure: {L['struct']}, {L['floors'] or '?'} floors", f"構造：{L['struct']}造 {L['floors'] or '?'}階建"),
              T("RC/SRC are the norm for condos.", "マンションではRC造・SRC造が一般的です。"))
    lat, lon = raw["lat"], raw["lng"]
    J = jshis(lat, lon) if lat and lon else {}
    if J.get("p"):
        p6l, p6u, p5u = J["p"]["55"], J["p"]["60"], J["p"]["50"]
        qs = [a["hazard"]["quake30"] for a in areas if (a.get("hazard") or {}).get("quake30") is not None]
        rank = sum(v < p6l for v in qs) + 1
        R.add("risk" if p6l >= 70 else "watch" if p6l >= 50 else "ok",
              T(f"30-year chance of shaking ≥ 6-lower here: {p6l:.0f}% (≥ 6-upper: {p6u:.0f}%)", f"今後30年間に震度6弱以上の揺れに見舞われる確率：{p6l:.0f}%（6強以上：{p6u:.0f}%）"),
              T(f"≥ 5-upper: {p5u:.0f}%. Modern buildings are designed for this; the risk is contents, lifts, pipes and the days without water or power.",
                f"震度5強以上：{p5u:.0f}%。新耐震の建物はこの揺れを想定して設計されていますが、家具の転倒、エレベーター・配管の損傷、断水・停電の期間がリスクです。"),
              T(f"Study areas (population-weighted, ≥ 6-lower): median {med(qs):.0f}%, range {min(qs):.0f}–{max(qs):.0f}% → rank {rank} of {len(qs) + 1} from the safest",
                f"調査対象エリア（人口加重、6弱以上）：中央値{med(qs):.0f}%、範囲{min(qs):.0f}〜{max(qs):.0f}% → 安全な方から{len(qs) + 1}中{rank}位") if qs else "")
        facts["quake6l"] = round(p6l)
    if J.get("ground"):
        gd = J["ground"]
        soft = gd["arv"] >= 1.4
        R.add("risk" if gd["arv"] >= 1.6 else "watch" if soft else "good",
              T(f"Ground: {gd['name']} — shaking amplified ×{gd['arv']:.2f}", f"地盤：{gd['name']} — 表層地盤増幅率 {gd['arv']:.2f}"),
              T(f"Soft ground amplifies shaking (AVS30 {gd['avs']:.0f} m/s; about 1.6 or more counts as soft). Ask how the building is founded (piles to bearing stratum?).",
                f"軟らかい地盤ほど揺れが増幅されます（AVS30＝{gd['avs']:.0f}m/s、増幅率1.6以上が揺れやすい目安）。建物の基礎（支持層まで杭が届いているか）を確認してください。"),
              ask=T("What kind of foundation does the building have (支持層までの杭基礎)?", "建物の基礎の種類は何ですか（支持層までの杭基礎か）？") if soft else None)
    R.src("jshis")

    # ---------- E. water & ground ----------
    R.section("E", T("Water and ground", "浸水・地盤"),
              T("Depth bands are the maximum assumed scenario (想定最大規模) at SUUMO's map point; SUUMO's point is approximate, so the worst value within ~100 m is shown too.",
                "浸水深は想定最大規模。SUUMOの地図位置は概略のため、地点の値に加えて半径約100m内の最大値も表示しています。"))
    H = {}
    if lat and lon:
        try:
            H = hazards(lat, lon)
        except SystemExit as e:
            R.add("info", T("Hazard tiles could not be read", "ハザードマップを取得できませんでした"), str(e))
        except Exception as e:
            R.add("info", T("Hazard tiles could not be read", "ハザードマップを取得できませんでした"), str(e)[:120])
    band_en = {0: "none", 1: "< 0.5 m", 2: "0.5–3 m", 3: "3 m or more"}
    band_ja = {0: "なし", 1: "0.5m未満", 2: "0.5〜3m", 3: "3m以上"}
    fl = L["floor"] or 1
    for k, nm, nj in (("flood", "River flood", "洪水（河川）"), ("surge", "Storm surge", "高潮"), ("tsunami", "Tsunami", "津波")):
        if k not in H:
            continue
        at, mx = H[k]["at"], H[k]["max"]
        if mx == 0:
            R.add("good", T(f"{nm}: outside the mapped zone", f"{nj}：浸水想定区域外"))
            continue
        wet = lambda d: (d >= 3 and fl <= 2) or (d >= 1 and fl <= 1)
        unit_wet = wet(at) or wet(mx)
        R.add("risk" if wet(at) or (k == "tsunami" and at >= 2) else "watch",
              T(f"{nm}: {band_en[at]} at the point" + (f" (up to {band_en[mx]} nearby)" if mx > at else ""),
                f"{nj}：地点の想定浸水深 {band_ja[at]}" + (f"（周辺では最大{band_ja[mx]}）" if mx > at else "")),
              T(f"The flat is on floor {fl}: {'it could be flooded' if unit_wet else 'it stays dry'}, but entrances, parking, lifts and the building's electrical room may not. "
                "Expect days without lifts/water if the electrical room floods.",
                f"住戸は{fl}階のため{'浸水するおそれがあります' if unit_wet else '住戸自体は浸水しにくい'}ものの、エントランス・駐車場・エレベーター・電気室は浸水する可能性があります。"
                "電気室が浸水するとエレベーターや給水が数日止まることがあります。"),
              ask=T("Where are the electrical room (電気室), water pumps and parking — basement or ground floor? Any flood barriers (止水板)?",
                    "電気室・給水ポンプ・駐車場は地下ですか、1階ですか？止水板などの浸水対策はありますか？"))
    if "slide" in H and H["slide"]["max"]:
        red = H["slide"]["max"] == 2
        R.add("risk" if red else "watch", T("Landslide warning zone " + ("(red, special)" if red else "(yellow)") + " within ~100 m",
                                            "半径約100m以内に土砂災害" + ("特別警戒区域（レッドゾーン）" if red else "警戒区域（イエローゾーン）")))
    elif "slide" in H:
        R.add("good", T("No landslide zone within ~100 m", "半径約100m以内に土砂災害警戒区域なし"))
    lq = H.get("liq", {}).get("at")
    lfm = H.get("landform", {})
    LQ = {"high": ("risk", "high", "高い"), "mid": ("watch", "medium", "中程度"), "low": ("ok", "low", "低い"), "vlow": ("good", "very low", "非常に低い"),
          "fillUpland": ("watch", "fill on upland (collapse risk in quakes/rain, not liquefaction)", "台地上の盛土（液状化ではなく、地震・豪雨時の崩落に注意）")}
    if lq in LQ:
        lv, te, tj = LQ[lq]
        R.add(lv, T(f"Liquefaction tendency: {te}", f"液状化の傾向：{tj}"),
              T(f"Landform: {lfm.get('artificial') or '–'} on {lfm.get('natural') or '–'} (国土地理院). Condo towers on piles usually stand, but roads, pipes, gas and sewers around them can fail for weeks (as in Urayasu 2011).",
                f"地形分類：{lfm.get('natural') or '–'}の上の{lfm.get('artificial') or '–'}（国土地理院）。杭基礎のマンション自体は残ることが多いものの、周辺の道路・上下水道・ガスが数週間使えなくなることがあります（2011年の浦安市など）。"),
              ask=T("Was the building or site damaged in 2011 (東日本大震災)? Ground improvement?", "東日本大震災で建物や敷地に被害はありましたか？地盤改良はされていますか？") if lq in ("high", "mid") else None)
    if A and A.get("hazard"):
        hz = A["hazard"]
        R.add("info", T(f"Area context ({an})", f"エリアの状況（{aj}）"),
              cmp=T(f"{hz.get('waterAny', 0):.0f}% of residents live in some water zone · {hz.get('liqHigh', 0):.0f}% on high-liquefaction ground · {hz.get('landslide', 0):.1f}% in landslide zones",
                    f"住民の{hz.get('waterAny', 0):.0f}%が何らかの浸水想定区域内・{hz.get('liqHigh', 0):.0f}%が液状化しやすい地盤・{hz.get('landslide', 0):.1f}%が土砂災害警戒区域内"))
    R.add("info", T("Old maps", "旧版地図"),
          T("Check what the site was before (sea, paddy, river) on 今昔マップ; past disaster records and 大規模盛土 maps come with the MLIT API key.",
            "今昔マップで以前の土地利用（海・水田・河川など）を確認してください。災害履歴と大規模盛土造成地はAPIキー取得後に追加します。"))
    R.src("portal", "landform", "konjaku")

    # ---------- F. commute ----------
    R.section("F", T(f"Commute to {oe}", f"{oj}への通勤"),
              T(f"Yahoo!乗換案内, next Wednesday, arrive by 08:45, IC fare, no paid express. Door-to-door = access to the station + train + {WALK_OFFICE} min at the office end.",
                f"Yahoo!乗換案内（次の水曜日、8:45着、IC運賃、有料特急なし）。ドアツードア＝駅までのアクセス＋乗車時間＋勤務先側の徒歩{WALK_OFFICE}分。"))
    C = commute(L["access"], office) if L["access"] else []
    ok = [c for c in C if c.get("door") is not None]
    mx = cmx.get("matrix", {})
    area_door = sorted(v[office["id"]][0] + WALK_HOME + WALK_OFFICE for v in mx.values() if v.get(office["id"]))
    for c in C:
        if c.get("door") is None:
            R.add("info", T(f"{c['station']} ({c['line']}): route lookup failed", f"{c['station']}駅（{c['line']}）：経路を取得できませんでした"), c.get("error") or c.get("url", ""))
            continue
        rk = pct(area_door, c["door"]) if area_door else None
        R.add("good" if c["door"] <= 45 else "watch" if c["door"] >= 70 else "ok",
              T(f"{c['station']} ({c['line']}): {c['door']} min door-to-door, {c['xfer']} transfer{'s' if c['xfer'] != 1 else ''}",
                f"{c['station']}駅（{c['line']}）：ドアツードア{c['door']}分・乗換{c['xfer']}回"),
              T((f"Walk {c['walk']} min + bus {c['bus']} min + ~3 min wait" if c["viaBus"] else f"Walk {c['access']} min") + f" + train {c['min']} min"
                + (f" · 1-month commuter pass {fmt_yen(c['pass1m'])}" if c.get("pass1m") else ""),
                (f"徒歩{c['walk']}分＋バス{c['bus']}分＋待ち約3分" if c["viaBus"] else f"徒歩{c['access']}分") + f"＋乗車{c['min']}分"
                + (f"・通勤定期（1か月）{yj(c['pass1m'])}" if c.get("pass1m") else "")),
              T(f"Faster than {100 - rk}% of the 77 study areas' typical door-to-door ({WALK_HOME} min walk at home)",
                f"調査対象77エリアの標準的なドアツードア（自宅側徒歩{WALK_HOME}分）の{100 - rk}%より速い") if rk is not None else "")
    if ok:
        facts["commute"] = min(c["door"] for c in ok)
    if A and (A.get("commute") or {}).get("crowding"):
        R.add("info", T(f"Rush-hour crowding on the area's main line: {A['commute']['crowdingLine']}", f"エリアの主要路線の混雑率：{A['commute']['crowdingLine']}"),
              T("MLIT peak-hour 混雑率 (150% = can read a newspaper folded; 180% = pressed together).",
                "国土交通省のピーク時混雑率（150%＝新聞を折りたたんで読める程度、180%＝体が触れ合う程度）。"))
    if A and (A.get("bus") or {}).get("available"):
        b = A["bus"]
        R.add("good", T("Commuter bus to Tokyo Station runs from this area", "このエリアから東京駅方面への通勤バスあり"),
              T(f"{b.get('route')} · {b.get('morningCount')} morning runs, fare ¥{b.get('fare')}", f"{b.get('route')}・朝{b.get('morningCount')}便・運賃{b.get('fare')}円"))
    if len(L["access"]) >= 2:
        nl = len({a["line"] for a in L["access"]})
        R.add("good" if nl >= 2 else "info", T(f"{nl} different line(s) listed", f"利用可能な路線：{nl}路線"),
              T("A second line is a fallback when one line stops (Keiyo line is often stopped by wind).",
                "1路線が止まった時の代替手段になります（京葉線は強風で運転見合わせが多い路線です）。"))
    R.src("yahoo")

    # ---------- G. management ----------
    R.section("G", T("Building management and condition", "管理・建物の状態"))
    mt = L["mgmtType"] or ""
    if mt:
        lv = "risk" if "自主" in mt else "watch" if "巡回" in mt else "ok"
        R.add(lv, T(f"Management: {mt}", f"管理形態：{mt}"),
              {"risk": T("Self-managed (自主管理): no management company — quality depends entirely on residents.", "自主管理：管理会社がなく、管理の質は区分所有者次第です。"),
               "watch": T("Visiting only (巡回): nobody on site most days.", "巡回管理：管理員が常にいるわけではありません。"),
               "ok": T("常駐 = resident manager, 日勤/通勤 = manager on weekdays.", "常駐＝管理員が住み込み、日勤・通勤＝平日の日中に管理員が勤務。")}[lv])
    if L["units"]:
        R.add("watch" if L["units"] < 30 else "ok", T(f"{L['units']} units", f"総戸数{L['units']}戸"),
              T("Small buildings split fixed costs (lifts, repairs) among fewer owners → higher fees and bigger levies.",
                "小規模マンションはエレベーターや修繕などの固定費を少ない戸数で負担するため、管理費・修繕積立金や一時金が高くなりがちです。") if L["units"] < 30
              else T("Enough owners to share fixed costs.", "固定費を分担できる戸数があります。"))
    if age is not None:
        cyc = [(12, 15, "1st major repair (外壁・屋上防水)", "1回目の大規模修繕（外壁・屋上防水）"), (24, 30, "2nd major repair", "2回目の大規模修繕"),
               (36, 45, "3rd major repair (often pipes, lifts, windows)", "3回目の大規模修繕（給排水管・エレベーター・サッシなどを含むことが多い）")]
        due = [c for c in cyc if c[0] - 2 <= age <= c[1] + 3]
        R.add("ask" if due else "info", T(f"Age {age} years" + (f" — {due[0][2]} due around now" if due else ""), f"築{age}年" + (f" — {due[0][3]}の時期" if due else "")),
              T("Major repairs come every ~12–15 years. Ask whether the last one was done on time and paid from the fund (not by a levy or loan).",
                "大規模修繕はおおむね12〜15年ごと。前回が計画どおり実施され、一時金や借入ではなく積立金で賄えたかを確認してください。"),
              ask=T("When was the last 大規模修繕, what did it cover and how was it paid? What is planned next?", "前回の大規模修繕はいつ、どんな工事で、費用はどう賄いましたか？次回の予定は？"))
    R.add("ask" if not L["builder"] else "info", T(f"Builder: {L['builder'] or 'not stated'}", f"施工会社：{L['builder'] or '記載なし'}"),
          ask=None if L["builder"] else T("Who built it (施工会社)?", "施工会社はどこですか？"))
    R.add("ask", T("Key documents decide this section", "この項目は重要書類で判断"),
          T("重要事項調査報告書 (fund balance, arrears, loans of the association), 総会議事録 (last 2–3 years), 長期修繕計画, 管理規約・使用細則.",
            "重要事項調査報告書（積立金残高・滞納・管理組合の借入）、総会議事録（直近2〜3年分）、長期修繕計画書、管理規約・使用細則。"),
          ask=T("Can I see the 重要事項調査報告書 and the last 2–3 years of 総会議事録?", "重要事項調査報告書と直近2〜3年分の総会議事録を見せてください。"))

    # ---------- H. unit ----------
    R.section("H", T("The flat itself", "住戸そのもの"))
    tags = raw["tags"]
    if L["floor"] and L["floors"]:
        top = L["floor"] >= L["floors"]
        R.add("watch" if L["floor"] == 1 or top else "ok", T(f"Floor {L['floor']} of {L['floors']}", f"{L['floors']}階建の{L['floor']}階"),
              T("Top floor: hotter in summer, roof leaks are possible.", "最上階：夏は暑くなりやすく、屋上からの雨漏りの可能性も。") if top
              else T("Ground floor: damp, insects, security.", "1階：湿気・虫・防犯面に注意。") if L["floor"] == 1
              else T("Middle floor: neighbours above and below insulate.", "中間階：上下階の住戸があり、断熱面で有利。"))
    if L["facing"]:
        R.add("good" if re.search("南", L["facing"]) else "info", T(f"Balcony faces {L['facing']}", f"主要採光面：{L['facing']}向き"))
    if any("角住戸" in t for t in tags):
        R.add("good", T("Corner unit (角住戸)", "角住戸"), T("More windows and light; slightly more heat loss.", "窓が多く明るい反面、熱は逃げやすくなります。"))
    if m2:
        if L["m2basis"] != "内法":
            reg = m2 * 0.94
            R.add("info", T(f"{m2} m² ({L['m2basis'] or 'basis not stated'}) ≈ {reg:.1f} m² registered", f"専有面積{m2}㎡（{L['m2basis'] or '算定方法の記載なし'}）→ 登記面積は約{reg:.1f}㎡"),
                  T("The tax rules (mortgage credit ≥ 50 m²) use the registered 内法 area, about 5–8% smaller than the advertised 壁芯 area.",
                    "住宅ローン控除などの床面積要件（50㎡以上）は登記簿上の内法面積で判定され、広告の壁芯面積より5〜8%程度小さくなります。"))
        else:
            R.add("info", T(f"{m2} m² (内法 = registered area)", f"専有面積{m2}㎡（内法＝登記面積）"))
    if L["reform"]:
        R.add("info", T(f"Renovation: {L['reform']}", f"リフォーム：{L['reform']}"))

    # ---------- I. energy ----------
    R.section("I", T("Energy, windows and running cost", "省エネ性能・窓・光熱費"),
              T("Energy labels are only required for new buildings (from April 2024): used flats almost never show them, so proxies are used.",
                "省エネ性能表示は2024年4月以降の新築が対象のため、中古ではほぼ表示がありません。築年や設備から推定します。"))
    if any(L[k] for k in ("energy", "insul", "utilCost")):
        R.add("good", T("Energy label shown", "省エネ性能の表示あり"), f"{L['energy'] or ''} {L['insul'] or ''} {L['utilCost'] or ''}")
    else:
        R.add("ask", T("No energy label (normal for used flats)", "省エネ性能の表示なし（中古では一般的）"),
              ask=T("Is there a 住宅性能評価書, BELS or 長期優良住宅 certificate?", "住宅性能評価書、BELS、長期優良住宅の認定などはありますか？"))
    if L["year"]:
        y = L["year"]
        era = (T("before the first insulation rules (1980)", "断熱基準ができる前（1980年以前）") if y < 1981
               else T("1980 rules (旧省エネ, weak)", "旧省エネ基準（1980年、断熱性能は低い）") if y < 1993
               else T("1992 rules (新省エネ)", "新省エネ基準（1992年）") if y < 2000
               else T("1999 rules (次世代省エネ, ~today's 等級4)", "次世代省エネ基準（1999年、現在の断熱等級4相当）") if y < 2015
               else T("2013+ rules", "2013年以降の省エネ基準"))
        R.add("good" if y >= 2001 else "watch", T(f"Likely designed to {era['en']}", f"設計時の基準は{era['ja']}と推定"),
              T("Era is only a hint: condos were not required to meet the energy standard until 2025.", "あくまで目安です。省エネ基準への適合義務化は2025年からです。"))
    glaze = [t for t in tags if re.search("複層|ペア|二重|Low-?E|断熱サッシ", t)] + re.findall(r"ペアガラス|複層ガラス|二重サッシ|Low-?E", raw["feat"])
    if glaze:
        g_ = ", ".join(dict.fromkeys(glaze))
        R.add("good", T(f"Double glazing mentioned: {g_}", f"複層ガラス等の記載あり：{g_}"))
    else:
        R.add("ask", T("Window type not stated", "窓（サッシ・ガラス）の仕様の記載なし"),
              T("In condos the window frames are common property: you usually cannot replace them yourself; inner windows (内窓) are allowed and subsidised.",
                "マンションのサッシは共用部分のため、通常は個人で交換できません。内窓（二重窓）の設置は可能なことが多く、補助金の対象にもなります。"),
              ask=T("Are the windows single or double glazed? Were sashes replaced in a major repair?", "窓は単板ガラスですか、複層ガラスですか？大規模修繕でサッシは交換されましたか？"))
    gas = [t for t in tags if re.search("都市ガス|プロパン|オール電化", t)]
    lpg = not gas or "プロパン" in gas[0]
    R.add("good" if gas and "プロパン" not in gas[0] else "watch" if gas else "ask",
          T(f"Energy supply: {', '.join(gas)}", f"エネルギー：{'、'.join(gas)}") if gas else T("Gas type not stated", "ガスの種類の記載なし"),
          T("Propane (LPG) costs much more than city gas.", "プロパンガスは都市ガスより料金がかなり高くなります。") if lpg else "",
          ask=None if gas else T("City gas or propane? Electricity contract (high-voltage bulk 一括受電)?", "都市ガスですか、プロパンガスですか？電気は一括受電ですか？"))
    eco = [t for t in tags if re.search("省エネ給湯|エコジョーズ|エネファーム|太陽光|床暖房", t)]
    if eco:
        R.add("info", T("Equipment: " + ", ".join(eco), "設備：" + "、".join(eco)))
    if L["year"]:
        ok82 = L["year"] >= 1982
        reg_ok = m2 and (m2 * (0.94 if L["m2basis"] != "内法" else 1)) >= 50
        R.add("good" if ok82 and reg_ok else "watch",
              T("Mortgage tax credit: " + ("eligible" if ok82 and reg_ok else "check eligibility"), "住宅ローン控除：" + ("対象" if ok82 and reg_ok else "要件を要確認")),
              T(("Built 1982 or later ✓" if ok82 else "Built before 1982: needs a 耐震基準適合証明書") + " · "
                + ("registered area ≥ 50 m² ✓" if reg_ok else "registered area may be under 50 m²") + ". "
                "Without an energy certificate a used home falls in the basic tier: 0.7% of the loan balance up to ¥20M for 10 years (max ¥140k/year). "
                "With a 省エネ基準適合 certificate it is 13 years; ZEH-level / 長期優良 raises the cap to ¥35M.",
                ("1982年以降の建築 ✓" if ok82 else "1982年より前の建築：耐震基準適合証明書が必要") + "・"
                + ("登記面積50㎡以上 ✓" if reg_ok else "登記面積が50㎡未満の可能性") + "。"
                "省エネ性能の証明がない中古住宅は「その他の住宅」：年末残高の0.7%、借入限度額2,000万円、控除期間10年（年最大14万円）。"
                "省エネ基準適合の証明があれば控除期間13年、ZEH水準・認定長期優良住宅なら限度額3,500万円。"))
    R.src("label", "tax")

    # ---------- J. parking ----------
    R.section("J", T("Parking and mobility", "駐車場・駐輪場"))
    ptxt = L["parking"] or ""
    if not ptxt:
        R.add("ask", T("Parking not stated", "駐車場の記載なし"),
              ask=T("Is there parking? Fee, waiting list, type (flat / mechanical) and height limit?", "駐車場はありますか？料金、空き状況、平置き・機械式の別、高さ制限を教えてください。"))
    elif re.search("(?<!空)無|なし", ptxt) and not pk and not re.search("空無|空きなし", ptxt):
        R.add("risk", T(f"Parking: {ptxt}", f"駐車場：{ptxt}"),
              T("No parking in the building: you will need a monthly car park nearby.", "敷地内に駐車場がないため、近隣の月極駐車場を借りる必要があります。"))
    else:
        mech = re.search("機械", ptxt + " ".join(tags))
        full = re.search("空無|空きなし|空き待ち|キャンセル待ち", ptxt)
        R.add("watch" if full else "good", T(f"Parking: {ptxt}", f"駐車場：{ptxt}"),
              T(("Currently full — ask about the waiting list. " if full else "")
                + ("Mechanical parking is expensive to maintain and replace (often a big item in the repair plan); check the height and weight limits for your car." if mech else ""),
                ("現在満車のため、空き待ちの状況を確認してください。" if full else "")
                + ("機械式駐車場は維持・更新費が高く、長期修繕計画の大きな負担になりがちです。車の高さ・重量制限も確認を。" if mech else "")),
              T(f"Area watchlist listings with on-site parking: median {fmt_yen(med(pk_area))}/month ({len(pk_area)} listings)",
                f"エリア内の敷地内駐車場の月額：中央値{yj(med(pk_area))}（{len(pk_area)}件）") if pk_area else "",
              ask=T("Is a space available now? How long is the waiting list?", "現在空きはありますか？空き待ちは何台ですか？") if full else None)
    if any("駐輪" in t or "バイク" in t for t in tags):
        R.add("info", T("Bicycle / bike parking mentioned", "駐輪場・バイク置場の記載あり"))
    R.add("ask", T("Bicycle parking for child seats, EV charging", "子ども乗せ自転車の駐輪・EV充電"),
          ask=T("Bicycle parking: spaces available and fee? Large (child-seat) bikes allowed?", "駐輪場の空きと料金は？子ども乗せ自転車（大型）は置けますか？"))

    # ---------- K. neighbourhood ----------
    R.section("K", T("Family life around it", "子育て・周辺環境"),
              T("Nearby facilities from SUUMO's 周辺環境 tab; area figures from the location study.", "周辺施設はSUUMOの「周辺環境」より、エリアの数値は当サイトのエリア調査より。"))
    K = raw["kankyo"]
    for cat, label, lj in (("小学校", "Elementary school", "小学校"), ("中学校", "Junior high", "中学校"), ("幼稚園・保育園", "Kindergarten / daycare", "幼稚園・保育園"),
                           ("保育園", "Daycare", "保育園"), ("公園", "Park", "公園"), ("スーパー", "Supermarket", "スーパー"),
                           ("病院", "Clinic / hospital", "病院・クリニック"), ("駅", "Station", "駅")):
        xs = sorted((k for k in K if k["cat"] == cat), key=lambda k: k["m"])
        if xs:
            x = xs[0]
            R.add("info", T(f"{label}: {x['name']} — {x['walk']} min ({x['m']} m)", f"{lj}：{x['name']} — 徒歩{x['walk']}分（{x['m']}m）"))
    R.add("ask", T("Assigned school district", "通学区域（学区）"),
          T("The school you are assigned to (学区) is not always the nearest one.", "指定される学校は、最寄りの学校とは限りません。"),
          ask=T("Which elementary and junior-high school is this address assigned to (通学区域)?", "この住所の通学区域の小学校・中学校はどこですか？"))
    if A:
        cc, cr, hl = (A.get("childcare") or {}), A.get("crime"), A.get("health")
        if cc:
            w = cc.get("waitlist2026", "–")
            R.add("good" if not cc.get("waitlist2026") else "watch", T(f"Daycare waitlist ({an}): {w} (2026)", f"待機児童数（{aj}）：{w}人（2026年）"),
                  cmp=T(f"0–2 daycare fee ~{fmt_yen(cc.get('daycare0to2Monthly'))}/month · child medical subsidy to age {cc.get('medicalAge', '–')}",
                        f"0〜2歳の保育料 約{yj(cc.get('daycare0to2Monthly'))}/月・子ども医療費助成 {cc.get('medicalAge', '–')}歳まで"))
        if cr:
            safe = sorted((a["crime"]["safetyIndex"] for a in areas if (a.get("crime") or {}).get("safetyIndex") is not None), reverse=True)
            rk = safe.index(cr["safetyIndex"]) + 1 if cr.get("safetyIndex") in safe else None
            R.add("good" if rk and rk <= len(safe) / 3 else "watch" if rk and rk > 2 * len(safe) / 3 else "ok",
                  T(f"Crime: #{rk}/{len(safe)} safest study area" if rk else "Crime", f"治安：調査対象{len(safe)}エリア中 安全な方から{rk}位" if rk else "治安"),
                  cmp=T(f"Burglary {cr.get('burglaryPer10k')}/10k residents · violent {cr.get('violentPer10k')}/10k · all {cr.get('totalPer1k')}/1k ({cr.get('year')})",
                        f"侵入窃盗 人口1万人あたり{cr.get('burglaryPer10k')}件・粗暴犯 1万人あたり{cr.get('violentPer10k')}件・刑法犯全体 千人あたり{cr.get('totalPer1k')}件（{cr.get('year')}年）"))
        if hl:
            R.add("info", T(f"Paediatrics: {hl.get('peds')} clinics in the area ({hl.get('per10k')} per 10k children)",
                            f"小児科：エリア内{hl.get('peds')}施設（子ども1万人あたり{hl.get('per10k')}）"))
        nz = (noise.get("areas") or {}).get(A["id"], {}).get("flags", [])
        for n_ in nz:
            R.add("watch" if n_.get("level") != "con" else "info", T(f"Noise: {n_.get('kind')}", f"騒音：{n_.get('kind')}"), n_.get("note", ""))
    R.add("info", T("Main roads and rail lines next door", "近くの幹線道路・線路"),
          T("Check on the visit and on the map: traffic noise, trucks at night, train noise.", "内見時と地図で確認：車の騒音、夜間のトラック、電車の音。"))

    # ---------- L. resale ----------
    R.section("L", T("Resale and future value", "資産価値・売却のしやすさ"))
    if A:
        dm = (A.get("demographics") or {})
        if dm.get("ipss2050") is not None:
            c25, p50 = dm.get("change2020to2025") or 0, dm["ipss2050"]
            R.add("good" if p50 > -5 else "watch" if p50 < -15 else "ok",
                  T(f"Population {an}: {c25:+}% 2020–25, projected {p50:+}% by 2050 (社人研)", f"人口（{aj}）：2020→25年 {c25:+}%、2050年推計 {p50:+}%（社人研）"),
                  T("Shrinking areas see weaker resale and fewer services.", "人口が減る地域では、売却価格や生活サービスが弱くなりがちです。"))
        if area_rows:
            R.add("info", T(f"{len(area_rows) + 1} large (90 m²+) flats for sale in the area now", f"エリア内で90㎡以上の物件が現在{len(area_rows) + 1}件売出中"),
                  T("Many similar listings = easy to compare, but also competition when you sell.", "類似物件が多いと比較しやすい反面、売却時には競合になります。"))
        pl = (A.get("pipeline") or {}).get("projects", [])
        if pl:
            R.add("info", T("Area projects: " + "; ".join(p["name"] for p in pl[:4]), "エリアの開発計画：" + "、".join(p.get("nameJa") or p["name"] for p in pl[:4])))
    if L["access"] and L["access"][0]["walk"] > 15 and not L["access"][0]["bus"]:
        R.add("watch", T("Long walk to the station", "駅から遠い"),
              T("Flats more than 15 min from a station are harder to resell, especially as the population ages.", "駅徒歩15分を超える物件は、高齢化が進むほど売却しにくくなります。"))
    if L["year"] and L["year"] < 1982:
        R.add("watch", T("Old-standard building", "旧耐震の建物"),
              T("Fewer buyers can get a loan or tax credit → slower resale.", "住宅ローンや控除を使える買い手が限られ、売却に時間がかかりがちです。"))
    R.add("info", T("Land-price trend at the nearest official point (公示地価): with the MLIT API key", "最寄りの地価公示地点の推移：APIキー取得後に追加"))

    # ---------- M. contract ----------
    R.section("M", T("Contract terms", "契約条件"))
    if L["deal"] == "売主":
        R.add("good", T("Seller is a company (売主)", "取引態様：売主（宅建業者）"),
              T("No agent fee; a company seller must give at least 2 years of defect liability.", "仲介手数料はかかりません。宅建業者が売主の場合、契約不適合責任は引渡しから2年以上が義務です。"))
    elif L["deal"] == "仲介":
        R.add("info", T("Sold through an agent (仲介)", "取引態様：仲介"),
              T("Agent fee applies. Individual sellers often limit defect liability to ~3 months.", "仲介手数料がかかります。個人の売主の場合、契約不適合責任は引渡しから3か月程度に限定されることが多いです。"),
              ask=T("How long is the seller's 契約不適合責任, and is equipment excluded?", "売主の契約不適合責任の期間は？設備は免責ですか？"))
    txt = raw["feat"] + " " + (L["restrict"] or "")
    if re.search(r"契約不適合責任.{0,10}免責|瑕疵担保.{0,10}免責", txt):
        R.add("risk", T("Seller's liability for defects excluded (免責)", "契約不適合責任が免責"))
    if any(re.search("瑕疵|保証", t) for t in tags) or re.search(r"瑕疵保険|インスペクション|建物状況調査", txt):
        R.add("good", T("Inspection or defect insurance mentioned", "建物状況調査または瑕疵保険の記載あり"))
    else:
        R.add("ask", T("No inspection mentioned", "建物状況調査の記載なし"),
              T("An independent inspection (インスペクション, ~¥50–100k) and 既存住宅売買瑕疵保険 protect you and can be a loan/tax condition.",
                "第三者による建物状況調査（インスペクション、5〜10万円程度）と既存住宅売買瑕疵保険は買主を守り、ローンや税制の要件になる場合もあります。"),
              ask=T("Can I arrange an inspection (インスペクション) before signing?", "契約前に建物状況調査（インスペクション）を実施できますか？"))
    if re.search(r"告知事項|心理的", txt):
        R.add("risk", T("Disclosure notice (告知事項) mentioned", "告知事項の記載あり"), T("Ask exactly what happened.", "具体的な内容を確認してください。"))
    R.add("ask", T("Disclosures", "告知事項"),
          ask=T("Any 告知事項 (incidents, leaks, disputes with neighbours, asbestos survey)?", "告知事項（事件・事故、漏水、近隣トラブル、アスベスト調査の有無など）はありますか？"))
    R.add("info", T(f"Handover: {L['handover'] or '–'}", f"引渡し時期：{L['handover'] or '–'}"))

    return L, A, office, R, facts, H, J, C


# ── output ──────────────────────────────────────────────────────
LV = {"risk": (T("Risk", "リスク"), 0), "watch": (T("Check", "要確認"), 1), "ask": (T("Ask", "質問"), 2),
      "ok": (T("OK", "問題なし"), 3), "good": (T("Good", "良い点"), 4), "info": (T("Info", "参考"), 5)}
DOCS = [("重要事項調査報告書", T("management report: fund balance, arrears, association loans, planned works", "管理に関する報告書：積立金残高、滞納状況、管理組合の借入、予定工事")),
        ("長期修繕計画書", T("long-term repair plan and planned fund increases", "修繕工事の計画と積立金の値上げ予定")),
        ("総会議事録（直近2〜3年分）", T("minutes: disputes, leaks, levies, problems being discussed", "トラブル、漏水、一時金、検討中の課題")),
        ("管理規約・使用細則", T("rules: pets, renovation, flooring, short-term rental, parking", "ペット、リフォーム、床材、民泊、駐車場のルール")),
        ("修繕履歴", T("repair history, incl. pipes and windows", "給排水管やサッシを含む修繕の履歴")),
        ("登記簿謄本（登記事項証明書）", T("registered owner and area, mortgages on the property", "所有者、登記面積、抵当権の設定状況")),
        ("固定資産税の納税通知書・評価証明書", T("property tax amount", "固定資産税・都市計画税の額")),
        ("建築確認済証・検査済証", T("permit date (seismic standard) and completion inspection", "建築確認日（耐震基準の判定）と完了検査")),
        ("建物状況調査（インスペクション）報告書", T("if one was done; otherwise arrange your own", "実施済みなら入手、未実施なら自分で手配")),
        ("付帯設備表・物件状況報告書（告知書）", T("what equipment stays; known defects", "引き継ぐ設備と、売主が把握している不具合"))]
VISIT = [T("Water stains on ceilings, around windows and under the sink; black mould on window frames (condensation = single glazing / poor insulation)",
           "天井・窓まわり・シンク下の水染み、サッシの黒カビ（結露が多い＝単板ガラスや断熱不足のサイン）"),
         T("Common areas: entrance, bins, bike parking, notice board (it shows how the building is run)", "共用部：エントランス、ゴミ置場、駐輪場、掲示板（管理状態がわかります）"),
         T("Noise from above and from the street with windows closed and open; train/road at rush hour", "窓を閉めた時・開けた時の上階や外の音、朝夕の電車・道路の音"),
         T("Phone signal and internet type (光配線方式?)", "携帯電波とインターネットの方式（光配線方式か）"),
         T("Water pressure and how long hot water takes; check all equipment works", "水圧、お湯が出るまでの時間、設備がすべて動くか"),
         T("Sun at different times; what stands or could be built in front of the balcony", "時間帯ごとの日当たり、バルコニー前に何が建っている（建ちうる）か"),
         T("Walk to the station at commute time; how the route feels at night", "通勤時間帯に駅まで歩く、夜道の雰囲気"),
         T("Where the electrical room, pumps and parking are (flood exposure)", "電気室・ポンプ・駐車場の位置（浸水リスク）")]
UI = {"back": T("← Deep look", "← 物件ディープ分析"), "print": T("Print / save as PDF", "印刷・PDF保存"), "suumo": T("Open on SUUMO", "SUUMOで見る"),
      "price": T("Price", "価格"), "size": T("Size", "専有面積・間取り"), "built": T("Built", "築年"), "floor": T("Floor", "所在階"),
      "fees": T("Fees", "管理費等"), "station": T("Station", "最寄駅"), "door": T("Door-to-door", "ドアツードア"), "buy": T("Buying costs", "諸費用"),
      "first": T("Check first", "まず確認すること"), "strong": T("Strengths", "良い点"), "nothing": T("Nothing flagged", "特になし"),
      "srcs": T("Sources:", "出典："), "askh": T("Ask the agent", "不動産会社への質問"), "docs": T("Documents to request", "取り寄せる書類"),
      "visit": T("On the visit", "内見でのチェック"),
      "ghint": T("Tap ⓘ next to any item for what it means, why it matters and what to do.", "各項目の ⓘ をタップすると、意味・重要な理由・確認すべきことが表示されます。")}


def esc(s):
    return html.escape(str(s or ""))


def tx(x):
    """Bilingual text → two spans (CSS shows one); plain strings as-is."""
    if isinstance(x, dict):
        return f'<span class="en">{esc(x.get("en"))}</span><span class="ja">{esc(x.get("ja"))}</span>'
    return esc(x)


def gi(k):
    """ⓘ button that opens the explanation for glossary key k (deeplook/glossary.js)."""
    return f'<button type="button" class="gi" data-g="{k}" aria-label="?">i</button>' if k else ""


def render(raw, L, A, office, R, facts, rate):
    counts = {k: sum(i["level"] == k for s in R.sections for i in s["items"]) for k in LV}
    top = [(s["key"], i) for s in R.sections for i in s["items"] if i["level"] in ("risk", "watch")]
    good = [(s["key"], i) for s in R.sections for i in s["items"] if i["level"] == "good"]
    asks, seen = [], set()
    for s in R.sections:
        for i in s["items"]:
            a = i.get("ask")
            if a and lang(a, "en") not in seen:
                seen.add(lang(a, "en")); asks.append(a)
    yrs = date.today().year - L["year"] if L["year"] else None
    a0 = L["access"][0] if L["access"] else None
    kvg = ["ppm", "area", "seismic", "floor", "repair", "walk", "commute", "buycost"]
    kv = [(UI["price"], T(fmt_man(L["price"]), mj(L["price"]))),
          (UI["size"], T(f"{L['m2']} m² · {L['layout'] or ''}", f"{L['m2']}㎡・{L['layout'] or ''}")),
          (UI["built"], T(f"{L['year'] or '–'}" + (f" ({yrs} yrs)" if yrs is not None else ""), f"{L['year'] or '–'}年" + (f"（築{yrs}年）" if yrs is not None else ""))),
          (UI["floor"], T(f"{L['floor'] or '–'} / {L['floors'] or '–'}", f"{L['floor'] or '–'}階／{L['floors'] or '–'}階建")),
          (UI["fees"], T(f"{fmt_yen((L['mgmt'] or 0) + (L['repair'] or 0))}/mo", f"月{yj((L['mgmt'] or 0) + (L['repair'] or 0))}")),
          (UI["station"], T(f"{a0['station']} " + (f"bus {a0['bus']} + " if a0["bus"] else "") + f"walk {a0['walk']} min",
                            f"{a0['station']}駅 " + (f"バス{a0['bus']}分＋" if a0["bus"] else "") + f"徒歩{a0['walk']}分") if a0 else "–"),
          (UI["door"], T(f"{facts['commute']} min to {office.get('en')}", f"{office.get('ja', '')}まで{facts['commute']}分") if facts.get("commute") else "–"),
          (UI["buy"], T(f"{fmt_yen(facts['buyCosts'][0])}–{fmt_yen(facts['buyCosts'][1])}", f"{yj(facts['buyCosts'][0])}〜{yj(facts['buyCosts'][1])}") if facts.get("buyCosts") else "–")]
    item = lambda i: (f'<div class="it {i["level"]}"><span class="lv">{tx(LV[i["level"]][0])}</span><div><b>{tx(i["head"])}</b>{gi(i.get("g"))}'
                      + (f'<p>{tx(i["detail"])}</p>' if i["detail"] else "") + (f'<p class="cmp">{tx(i["cmp"])}</p>' if i["cmp"] else "") + "</div></div>")
    secs = []
    for s in R.sections:
        its = sorted(s["items"], key=lambda i: LV[i["level"]][1])
        src = "".join(f'<a href="{esc(u)}" target="_blank" rel="noopener">{tx(T(n, SRC_JA.get(n, n)))}</a>' for n, u in s["src"])
        secs.append(f'<section id="s{s["key"]}"><h2><span>{s["key"]}</span>{tx(s["title"])}{gi("sec" + s["key"])}</h2>'
                    + (f'<p class="intro">{tx(s["intro"])}</p>' if s["intro"] else "") + "".join(item(i) for i in its)
                    + (f'<p class="src">{tx(UI["srcs"])} {src}</p>' if src else "") + "</section>")
    te, tj = f"Deep look: {raw['name']}", f"物件ディープ分析：{raw['name']}"
    area_t = T(f" · {A['nameEn']}", f"・{A['nameJa']}") if A else ""
    sub = T(f" · SUUMO {raw['id']} · analysed {raw['fetched']} · commute to {office.get('en')} · loan {rate:.3g}%, {LOAN['down']:g}% down, {int(LOAN['years'])} years",
            f"・SUUMO {raw['id']}・{raw['fetched']}分析・通勤先 {office.get('ja', '')}・金利{rate:.3g}%・頭金{LOAN['down']:g}%・{int(LOAN['years'])}年")
    foot = T(f"Automated analysis from public data on {raw['fetched']} — not professional advice. SUUMO fields are entered by the agent; a missing item means \"not stated\", not \"absent\". Hazard depths are the maximum assumed scenarios. Method: reports/Deep look - research and design.md.",
             f"{raw['fetched']}時点の公開データによる自動分析で、専門家の助言ではありません。SUUMOの項目は不動産会社が入力しており、記載がないことは「なし」ではなく「未記載」を意味します。浸水深は想定最大規模です。分析方法：reports/Deep look - research and design.md。")
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(te)}</title><link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="icon" href="../favicon.ico" sizes="any"><link rel="apple-touch-icon" href="../apple-touch-icon.png">
<script>(function(){{var l='en';try{{if(localStorage.getItem('lang')==='ja')l='ja'}}catch(e){{}}var q=new URLSearchParams(location.search).get('lang');if(q==='ja'||q==='en')l=q;
document.documentElement.lang=l;if(l==='ja')document.documentElement.classList.add('ja');}})();</script>
<style>
:root{{--bg:#fff;--fg:#1c1828;--mut:#5a566e;--line:#e3e0ea;--card:#faf9fc;--risk:#c62828;--watch:#d98a00;--ask:#2f6fd6;--ok:#6b7a8f;--good:#2e7d32;--info:#8a8698}}
@media (prefers-color-scheme:dark){{:root{{--bg:#111118;--fg:#eeeaf4;--mut:#a8a4b8;--line:#2a2836;--card:#191922}}}}
html:not(.ja) .ja,html.ja .en{{display:none}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI","Hiragino Sans","Yu Gothic UI",sans-serif}}
main{{max-width:900px;margin:0 auto;padding:16px}}a{{color:var(--ask)}}
.bar{{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}}.bar a,.bar button{{font:inherit;font-size:.85rem;padding:6px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);text-decoration:none;cursor:pointer}}
.lang{{margin-left:auto;display:inline-flex}}.lang button{{border-radius:0}}.lang button:first-child{{border-radius:8px 0 0 8px}}.lang button:last-child{{border-radius:0 8px 8px 0;border-left:0}}
.lang button.on{{background:var(--fg);color:var(--bg);border-color:var(--fg)}}
h1{{font-size:1.45rem;margin:.2em 0}}.sub{{color:var(--mut);font-size:.85rem}}
.kv{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:14px 0}}.kv div{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 10px}}.kv small{{display:block;color:var(--mut);font-size:.72rem}}
.cnt{{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}}.cnt>span{{font-size:.8rem;padding:2px 8px;border-radius:10px;color:#fff}}
.sum{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}@media(max-width:640px){{.sum{{grid-template-columns:1fr}}}}
.sum ul{{margin:4px 0;padding-left:18px}}.sum li{{margin:2px 0}}.sum h3{{margin:.4em 0 .2em;font-size:1rem}}
section{{border-top:2px solid var(--line);margin-top:18px;padding-top:6px;break-inside:auto}}
h2{{font-size:1.1rem;display:flex;gap:8px;align-items:center;margin:.4em 0}}h2>span:first-child{{display:inline-grid;place-items:center;width:1.6em;height:1.6em;flex:none;border-radius:50%;background:var(--fg);color:var(--bg);font-size:.8rem}}
.intro{{color:var(--mut);font-size:.85rem;margin:.2em 0 .6em}}
.it{{display:grid;grid-template-columns:4.6em 1fr;gap:8px;padding:6px 0;border-bottom:1px dashed var(--line);break-inside:avoid}}.it p{{margin:.15em 0;font-size:.88rem}}.it .cmp{{color:var(--mut)}}
.lv{{font-size:.7rem;font-weight:700;text-transform:uppercase;text-align:center;border-radius:6px;padding:2px 0;color:#fff;height:fit-content;margin-top:2px}}
.risk .lv,.cnt .risk{{background:var(--risk)}}.watch .lv,.cnt .watch{{background:var(--watch)}}.ask .lv,.cnt .ask{{background:var(--ask)}}.ok .lv,.cnt .ok{{background:var(--ok)}}.good .lv,.cnt .good{{background:var(--good)}}.info .lv,.cnt .info{{background:var(--info)}}
.src{{font-size:.75rem;color:var(--mut)}}.src a{{margin-right:10px}}
ol.q li,ul.docs li,ul.visit li{{margin:3px 0;font-size:.9rem}}.foot{{color:var(--mut);font-size:.75rem;margin-top:24px}}
.gi{{display:inline-grid;place-items:center;width:1.25em;height:1.25em;margin-left:6px;padding:0;border-radius:50%;border:1px solid var(--mut);background:none;color:var(--mut);font:italic 700 .72rem/1 Georgia,serif;cursor:pointer;vertical-align:.12em;flex:none}}
.gi:hover,.gi:focus-visible{{border-color:var(--ask);color:var(--ask);outline:none}}h2 .gi{{font-size:.68rem}}.kv .gi{{font-size:.62rem;margin-left:4px}}
.ghint{{color:var(--mut);font-size:.78rem;margin:0 0 4px}}
.gp{{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,8,20,.45)}}.gp[hidden]{{display:none}}
.gp>div{{background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:12px;max-width:560px;width:100%;max-height:85vh;overflow:auto;padding:18px 20px 16px;box-shadow:0 12px 40px rgba(0,0,0,.3)}}
.gp h3{{margin:0 28px 10px 0;font-size:1.1rem}}.gp h4{{margin:12px 0 2px;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:var(--mut)}}.gp p{{margin:0;font-size:.92rem;line-height:1.6}}
.gp .x{{float:right;font:inherit;font-size:1.3rem;line-height:1;border:0;background:none;color:var(--mut);cursor:pointer;margin:-6px -8px 0 0;padding:4px 8px}}
.gp .gtip{{margin-top:12px;padding:8px 10px;border-radius:8px;background:var(--card);border-left:3px solid var(--good)}}
@media print{{@page{{size:A4;margin:12mm 11mm}}:root{{--bg:#fff;--fg:#000;--mut:#555;--line:#ddd;--card:#f6f6f6}}body{{font-size:9.5pt;line-height:1.4}}.noprint{{display:none!important}}main{{max-width:none;padding:0}}
 a{{color:#000;text-decoration:none}}section{{break-inside:auto}}h2{{break-after:avoid}}.it{{padding:3px 0}}.it,.kv div,.sum>div{{break-inside:avoid}}
 *{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}#sQ{{break-before:page}}.gi,.gp{{display:none!important}}}}
</style></head><body><main>
<div class="bar noprint"><a href="../index.html#deeplook">{tx(UI["back"])}</a><button onclick="window.print()">{tx(UI["print"])}</button><a href="{esc(raw['url'])}" target="_blank" rel="noopener">{tx(UI["suumo"])}</a>
<span class="lang"><button type="button" data-l="en">EN</button><button type="button" data-l="ja">日本語</button></span></div>
<h1>{esc(raw['name'])}</h1>
<p class="ghint noprint">{tx(UI["ghint"])}</p>
<div class="sub">{esc(L['address'])}{tx(area_t)}{tx(sub)}</div>
<div class="kv">{''.join(f'<div><small>{tx(k)}{gi(g)}</small>{tx(v)}</div>' for (k, v), g in zip(kv, kvg))}</div>
<div class="cnt">{''.join(f'<span class="{k}">{tx(LV[k][0])} {counts[k]}</span>' for k in LV if counts[k])}{gi("levels")}</div>
<div class="sum"><div><h3>{tx(UI["first"])}</h3><ul>{''.join(f'<li><b>{k}</b> {tx(i["head"])}</li>' for k, i in top[:8]) or f'<li>{tx(UI["nothing"])}</li>'}</ul></div>
<div><h3>{tx(UI["strong"])}</h3><ul>{''.join(f'<li><b>{k}</b> {tx(i["head"])}</li>' for k, i in good[:8]) or '<li>–</li>'}</ul></div></div>
{''.join(secs)}
<section id="sQ"><h2><span>?</span>{tx(UI["askh"])}{gi("askAgent")}</h2><ol class="q">{''.join(f'<li>{tx(a)}</li>' for a in asks)}</ol>
<h2><span>📄</span>{tx(UI["docs"])}{gi("docsList")}</h2><ul class="docs">{''.join(f'<li><b>{esc(a)}</b> — {tx(b)}</li>' for a, b in DOCS)}</ul>
<h2><span>👀</span>{tx(UI["visit"])}{gi("visit")}</h2><ul class="visit">{''.join(f'<li>{tx(v)}</li>' for v in VISIT)}</ul></section>
<p class="foot">{tx(foot)}</p>
</main>
<div class="gp" id="gp" hidden role="dialog" aria-modal="true"><div><button type="button" class="x" aria-label="close">×</button><div id="gpb"></div></div></div>
<script src="glossary.js"></script>
<script>(function(){{var TT={{en:{json.dumps(te, ensure_ascii=False)},ja:{json.dumps(tj, ensure_ascii=False)}}};
function set(l){{var h=document.documentElement;h.classList.toggle('ja',l==='ja');h.lang=l;document.title=TT[l];
document.querySelectorAll('.lang button').forEach(function(b){{b.classList.toggle('on',b.dataset.l===l)}});try{{localStorage.setItem('lang',l)}}catch(e){{}}}}
set(document.documentElement.classList.contains('ja')?'ja':'en');
document.querySelectorAll('.lang button').forEach(function(b){{b.onclick=function(){{set(b.dataset.l);gt()}}}});
/* ⓘ explanations (glossary.js): hover = one-line summary, click = full popup */
var G=window.DLG||{{}},gp=document.getElementById('gp'),gb=document.getElementById('gpb'),last=null;
var LB={{what:['What it is','何のこと？'],why:['Why it matters','なぜ重要？'],read:['How to read this result','結果の読み方'],tip:['What to do','確認・対策']}};
function L(){{return document.documentElement.classList.contains('ja')?1:0}}
function e(s){{return String(s).replace(/[&<>"]/g,function(c){{return{{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c]}})}}
function gt(){{document.querySelectorAll('.gi').forEach(function(b){{var g=G[b.dataset.g];if(!g){{b.hidden=true;return}}var w=(g.what||g.why)[L()];b.title=w.length>140?w.slice(0,138)+'…':w}})}}
function show(k){{var g=G[k];if(!g)return;var l=L();gb.innerHTML='<h3>'+e(g.t[l])+'</h3>'+['what','why','read'].filter(function(f){{return g[f]}}).map(function(f){{return '<h4>'+LB[f][l]+'</h4><p>'+e(g[f][l])+'</p>'}}).join('')+(g.tip?'<div class="gtip"><h4>'+LB.tip[l]+'</h4><p>'+e(g.tip[l])+'</p></div>':'');gp.hidden=false;gp.querySelector('.x').focus()}}
function hide(){{gp.hidden=true;if(last)last.focus()}}
document.addEventListener('click',function(ev){{var b=ev.target.closest('.gi');if(b){{ev.preventDefault();last=b;show(b.dataset.g);return}}if(ev.target===gp||ev.target.closest('.gp .x'))hide()}});
document.addEventListener('keydown',function(ev){{if(ev.key==='Escape'&&!gp.hidden)hide()}});
gt();}})();</script>
</body></html>"""


def run(url, office_id="tokyo", rate=None):
    rate = LOAN["rate"] if rate is None else rate
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
    entry = {"id": raw["id"], "name": raw["name"], "area": A["nameEn"] if A else None, "areaJa": A["nameJa"] if A else None, "areaId": A["id"] if A else None,
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
    office = os.environ.get("IN_OFFICE") or (om.group(1) if om else "tokyo")
    for k, lo, hi in (("rate", 0, 10), ("down", 0, 100), ("years", 5, 50), ("tax", 0, 2)):   # Loan tab settings in the issue body
        mm = re.search(rf"\b{k}\s*[:=]\s*([\d.]+)", body)
        try:
            v = float(os.environ.get("IN_" + k.upper()) or (mm.group(1) if mm else LOAN[k]))
            if lo <= v <= hi:
                LOAN[k] = v
        except ValueError:
            pass
    rate = LOAN["rate"]
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
    ap.add_argument("--rate", type=float, default=LOAN["rate"])
    ap.add_argument("--down", type=float, default=LOAN["down"])
    ap.add_argument("--years", type=int, default=LOAN["years"])
    ap.add_argument("--tax", type=float, default=LOAN["tax"])
    ap.add_argument("--ci", action="store_true")
    ap.add_argument("--peers", action="store_true")
    a = ap.parse_args()
    LOAN.update(rate=a.rate, down=a.down, years=a.years, tax=a.tax)
    if a.peers:
        build_peers()
    elif a.ci:
        ci()
    elif a.url:
        run(a.url, a.office, a.rate)
    else:
        ap.print_help()
