#!/usr/bin/env python3
"""
SUUMO used-house (中古一戸建て) scraper — every area in areas.json whose "types" include "house".
An area may set "houseMinM2" (SUUMO hb= filter, building floor area): the 2026-10-12/13
watchlist areas track 100 m²+ only, the same line as the Houses map (DATA_LOG item 24).

Daily flow (same as scraper_mansion.py, cheap on SUUMO):
  1. Crawl the index pages (100 listings/page) → current price, sizes, build year, station, photo.
  2. Fetch the detail page ONLY for listings not yet in house_cache.json (structure, parking,
     road, zoning, features …) and cache it. At most MAX_DETAILS per run; the rest come next run.
  3. Track first-seen date in the cache (price history: inject.py → house_price_history.json).
Output: listings.json (raw, merged) — cleaned & scored by inject.py.
"""

import json
import os
import time
import re
import sys
import unicodedata
from datetime import date, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ── CONFIG ────────────────────────────────────────────
BASE_URL   = "https://suumo.jp"
AREAS_FILE = "areas.json"
INDEX_TMPL = ("https://suumo.jp/jj/bukken/ichiran/JJ012FC001/?ar={ar}&bs=021&ta={ta}&sc={sc}"
              "&kb=1&kt=9999999&tb=0&tt=9999999&hb={hb}&ht=9999999&cnb=0&cn=9999999&pc=100&pn={page}")
HEADERS    = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ja,en-US;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xhtml;q=0.9,*/*;q=0.8",
    "Referer": "https://suumo.jp/",
}
DELAY      = 1.2   # seconds between requests
MAX_PAGES  = 20    # safety cap per area (100 listings/page)
MAX_DETAILS = int(os.environ.get("HOUSE_MAX_DETAILS", 300))  # detail pages per run (a new area's first crawl is hundreds)
OUT_JSON   = "listings.json"
CACHE_FILE = Path("house_cache.json")

# ── FETCH ─────────────────────────────────────────────
session = requests.Session()
session.headers.update(HEADERS)

def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            r = session.get(url, timeout=20)
            r.raise_for_status()
            r.encoding = "utf-8"
            return r.text
        except Exception as e:
            print(f"  [warn] Attempt {attempt+1}/{retries} failed: {e}")
            time.sleep(3 * (attempt + 1))
    print(f"  [err] Could not fetch {url}")
    return None

# ── DETAIL PAGE PARSING ───────────────────────────────
def build_data_dict(soup):
    """Build a flat key→value dict from all th/td and dt/dd pairs.
    Strips the ' ヒント' tooltip suffix SUUMO appends to th keys."""
    d = {}
    for th in soup.find_all("th"):
        td = th.find_next_sibling("td")
        if td:
            key = th.get_text(" ", strip=True).replace(" ヒント", "").strip()
            val = td.get_text(" ", strip=True)
            if key not in d:
                d[key] = val
    for dt in soup.find_all("dt"):
        dd = dt.find_next_sibling("dd")
        if dd:
            key = dt.get_text(" ", strip=True).replace(" ヒント", "").strip()
            val = dd.get_text(" ", strip=True)
            if key not in d:
                d[key] = val
    return d

def first_match(d, *keys):
    for k in keys:
        if k in d:
            return d[k]
    return ""

# ── FIELD EXTRACTORS ──────────────────────────────────
def extract_price(d):
    """Return price in 万円 as int.
    Handles: 4,280万円 / 1億円 / 1億990万円 / 2億5,000万円
    1億 = 10,000万, so 1億990万 → 10,990万."""
    raw = first_match(d, "販売価格", "価格", "売買価格", "物件価格")
    oku_m = re.search(r"(\d+)億", raw)
    man_m = re.search(r"([\d,]+)万円", raw)
    if oku_m or man_m:
        oku = int(oku_m.group(1)) * 10000 if oku_m else 0
        man = int(man_m.group(1).replace(",", "")) if man_m else 0
        return oku + man
    # Bare 円 amount (no 万 or 億)
    m = re.search(r"([\d,]+)円", raw)
    if m:
        return int(m.group(1).replace(",", "")) // 10000
    return None

def extract_m2(text):
    # SUUMO renders m² as "m 2" (with space) in scraped text
    m = re.search(r"([\d.]+)\s*m\s*2", text or "")
    return float(m.group(1)) if m else None

def extract_age(text):
    year_m = re.search(r"(\d{4})年", text or "")
    if year_m:
        return max(0, datetime.now().year - int(year_m.group(1)))
    age_m = re.search(r"築(\d+)年", text or "")
    if age_m:
        return int(age_m.group(1))
    return 0

def extract_layout(text):
    m = re.search(r"\d[SLDK]+", text or "")
    return m.group(0) if m else None

def extract_access(text):
    """Return (line, station, walk_minutes) from first access line."""
    line_text = (text or "").split("\n")[0].split("／")[0].strip()
    # Pattern: line「station」歩Nmin  OR  line station 歩Nmin
    m = re.search(r"(.+?)「(.+?)」.*?歩(\d+)分", line_text)
    if m:
        return m.group(1).strip(), m.group(2).strip(), int(m.group(3))
    # Bus fallback
    m = re.search(r"(.+?)「(.+?)」.*?バス(\d+)分", line_text)
    if m:
        return m.group(1).strip(), m.group(2).strip(), int(m.group(3)) + 15
    # Bare pattern without 「」
    m = re.search(r"(.+?)\s+(\S+駅?).*?歩(\d+)分", line_text)
    if m:
        return m.group(1).strip(), m.group(2).strip(), int(m.group(3))
    return "–", "–", 99

def extract_structure(text):
    if not text:
        return "Wood", "?"
    if "鉄骨鉄筋" in text or "SRC" in text:
        s = "SRC"
    elif "鉄筋コンクリート" in text or "RC" in text:
        s = "RC"
    elif "鉄骨" in text:
        s = "Steel"
    else:
        s = "Wood"
    m = re.search(r"(\d+)階建", text)
    floors = f"{m.group(1)}F" if m else "2F"
    return s, floors

def extract_parking(d, page_text):
    raw = first_match(d, "駐車場", "駐車スペース", "車庫", "駐車台数")
    if raw:
        if re.search(r"無|なし", raw):
            return 0
        m = re.search(r"(\d+)台", raw)
        if m:
            return int(m.group(1))
        if raw.strip() not in ("-", "−", "―", ""):
            return 1
    m = re.search(r"駐車(?:場|スペース)?[：:\s]*(\d+)台", page_text)
    return int(m.group(1)) if m else 0

def has_renovation(d, page_text):
    kw = ["リノベーション済", "リフォーム済", "改装済", "改築済", "renovation"]
    # Check specific fields first (avoids nav-bar false positives)
    reno_val = first_match(d, "リフォーム", "リノベーション", "改装・改築", "その他概要・特記事項")
    if any(k in reno_val for k in kw):
        return True
    # Check fields dict values for explicit completion markers
    for v in d.values():
        if any(k in v for k in kw):
            return True
    return False

def has_city_gas(d):
    raw = first_match(d, "ガス", "ガス・給湯", "設備・条件")
    if "都市ガス" in raw:
        return True
    if re.search(r"プロパン|LP", raw):
        return False
    return True  # default

def land_rights(d):
    raw = first_match(d, "権利種別", "土地の権利形態", "所有形態")
    return "leased" if re.search(r"借地|地上権", raw) else "owned"

def extract_address(d):
    raw = first_match(d, "所在地", "住所", "物件所在地")
    return re.sub(r"\s+", " ", raw).strip()

def extract_image_url(soup, url):
    """Return the main photo URL from the listing page.
    SUUMO embeds images in src= or rel= attributes (two CDN patterns).
    We look for the first image whose URL contains the nc_ ID."""
    nc_m = re.search(r"nc_(\d+)", url)
    if not nc_m:
        return None
    nc_id = nc_m.group(1)
    html = str(soup)
    # Try src= first (lazy-loaded thumbnail), then rel= (modal full-size)
    for attr in ("src", "rel"):
        m = re.search(rf'{attr}="([^"]*{nc_id}[^"]*\.jpg[^"]*)"', html)
        if m:
            return m.group(1).replace("&amp;", "&")
    return None

# ── HOUSE DETAILS (DATA_LOG item 21) ──────────────────
# 特徴ピックアップ tag → key. Agents tick these, so a missing tag means "not advertised", not "absent".
FEAT_TAGS = [
    ("solar", "太陽光発電"), ("ev", "EV車充電"), ("longLife", "長期優良住宅"), ("perfCert", "住宅性能評価書"),
    ("groundSurvey", "地盤調査済"), ("inspCert", "完了検査済証"), ("flat35s", "フラット３５"), ("defectIns", "瑕疵保険"),
    ("ecoHeater", "省エネ給湯器"), ("doubleGlaze", "複層"), ("allElectric", "オール電化"), ("floorHeat", "床暖房"),
    ("park2", "駐車２台可"), ("highRoof", "ハイルーフ駐車場"), ("corner", "角地"), ("rectLot", "整形地"), ("flatLand", "平坦地"),
    ("road6", "前道６ｍ以上"), ("land50", "土地50坪以上"), ("southGarden", "南庭"), ("garden", "庭"), ("repairLog", "修繕・点検の記録"),
    ("plans", "設計図"), ("catv", "CATV"), ("quiet", "閑静な住宅地"), ("ecoMeasures", "省エネルギー対策"),
]
ZEN = str.maketrans("０１２３４５６７８９．", "0123456789.")


def feature_tags(soup):
    h = soup.find("h3", string=re.compile("特徴ピックアップ"))
    box = h.find_parent("div").find_next_sibling("div") if h else None
    raw = [t.strip() for t in box.get_text().split("/")] if box else []
    keys = []
    for k, kw in FEAT_TAGS:
        if any(kw in t for t in raw) and k not in keys:
            if k == "garden" and all(("南庭" in t) or ("庭" not in t) for t in raw):
                continue
            keys.append(k)
    return keys


def sales_text(soup):
    """Agent's PR block (catch line + description) — the only place carports / fibre are mentioned."""
    p = soup.select_one("p.fs14")
    return p.parent.get_text(" ", strip=True) if p and p.parent else ""


def house_details(d, soup):
    road = first_match(d, "私道負担・道路").translate(ZEN)
    widths = [float(x) for x in re.findall(r"(\d+(?:\.\d+)?)ｍ幅", road)]
    fronts = [float(x) for x in re.findall(r"接道幅(\d+(?:\.\d+)?)ｍ", road)]
    bcr = re.findall(r"(\d+)％", first_match(d, "建ぺい率・容積率"))
    zone = first_match(d, "用途地域").translate(ZEN).strip()
    energy = first_match(d, "エネルギー消費性能")
    ins = re.search(r"等級\s*(\d)", first_match(d, "断熱性能").translate(ZEN))
    util = re.search(r"([\d,]+)\s*円", first_match(d, "目安光熱費").translate(ZEN))
    pr = sales_text(soup).translate(ZEN)
    feat = feature_tags(soup)
    park_txt = re.search(r"(\d)\s*台(?:分|駐車|並列|縦列|可|まで)|駐車(?:場|スペース)?\s*(\d)\s*台", pr)
    return {
        "roadM": max(widths) if widths else None,
        "roads": len(widths),
        "frontM": max(fronts) if fronts else None,
        "privateRoad": bool(re.match(r"\s*有", road)),
        "bcr": int(bcr[0]) if len(bcr) >= 1 else None,
        "far": int(bcr[1]) if len(bcr) >= 2 else None,
        "zoning": None if zone in ("", "-") else zone,
        "energyStars": energy.count("★") or None,
        "insulation": int(ins.group(1)) if ins else None,
        "utilityYen": int(util.group(1).replace(",", "")) if util else None,
        "feat": feat,
        "parkingText": int(next(g for g in park_txt.groups() if g)) if park_txt else None,
        "covered": bool(re.search(r"(?:カーポート|ガレージ|屋根付き?駐車(?:場|スペース)?)\s*(?:\d台分?\s*)?(?:付|有|あり|完備|設置)|ビルトインガレージ|インナーガレージ", pr)),
        "fibre": bool(re.search(r"(?:光ファイバー|光回線|光インターネット|インターネット)\s*(?:無料|対応|使い放題|完備|導入|引込)", pr)),
    }

# ── GRADIENT PALETTE ─────────────────────────────────
GRADS = [
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

# ── MAIN SCRAPE ───────────────────────────────────────
def scrape_detail(url, idx, area_name):
    html = fetch(url)
    if not html:
        return None
    soup = BeautifulSoup(html, "html.parser")
    d    = build_data_dict(soup)
    text = soup.get_text(" ")

    price = extract_price(d)
    if not price:
        return None

    floor_area = extract_m2(first_match(d, "建物面積", "専有面積", "床面積"))
    land_area  = extract_m2(first_match(d, "土地面積", "敷地面積"))
    built_txt  = first_match(d, "完成時期（築年月）", "完成時期(築年月)", "築年月", "建築年月", "竣工年月", "築年数")
    age        = extract_age(built_txt)
    by         = re.search(r"(\d{4})年", built_txt or "")
    layout     = extract_layout(first_match(d, "間取り", "間取")) or "?"
    line, sta, walk = extract_access(first_match(d, "交通", "アクセス", "沿線・駅"))
    structure, floors = extract_structure(first_match(d, "構造・工法", "構造", "建物構造", "建物の構造"))
    address    = extract_address(d)
    parking    = extract_parking(d, text)
    reno       = has_renovation(d, text)
    cgas       = has_city_gas(d)
    rights     = land_rights(d)
    image_url  = extract_image_url(soup, url)
    extra      = house_details(d, soup)
    if extra["parkingText"]:
        parking = max(parking, extra["parkingText"])
    if "park2" in extra["feat"]:
        parking = max(parking, 2)
    # debug: uncomment to inspect parsed fields
    # import pprint; pprint.pprint(d)

    return {
        "id":          idx,
        "price":       price,
        "area":        area_name,
        "address":     address or area_name,
        "layout":      layout,
        "areaM2":      floor_area,
        "landM2":      land_area,
        "age":         age,
        "builtYear":   int(by.group(1)) if by else None,
        "station":     sta,
        "line":        line,
        "walk":        walk,
        "structure":   structure,
        "floors":      floors,
        "parking":     parking,
        "renovation":  reno,
        "landRights":  rights,
        "cityGas":     cgas,
        "isNew":       False,
        "suumoUrl":    url,
        "imageUrl":    image_url,
        "grad":        GRADS[idx % len(GRADS)],
        **{k: v for k, v in extra.items() if k != "parkingText"},
    }

CARD_RE = re.compile(r"/chukoikkodate/[^/]+/(sc_[^/]+)/nc_(\d+)/")


def crawl_index(area):
    """{nc_id: card dict} for every listing card of one area (cards of neighbouring wards dropped)."""
    cards = {}
    for page in range(1, MAX_PAGES + 1):
        url = INDEX_TMPL.format(**area, hb=area.get("houseMinM2", 0), page=page)
        html = fetch(url)
        if html is None:
            raise RuntimeError(f"index page {page} failed")
        units = BeautifulSoup(html, "html.parser").select("div.property_unit")
        for u in units:
            a = u.find("a", href=CARD_RE)
            if not a:
                continue
            m = CARD_RE.search(a["href"])
            if m.group(1) != area["slug"]:
                continue
            card = {dt.get_text(strip=True): dt.find_next_sibling("dd").get_text(" ", strip=True)
                    for dt in u.find_all("dt") if dt.find_next_sibling("dd")}
            img = u.find("img", rel=True)
            card["_img"] = img["rel"] if img else None
            card["_url"] = BASE_URL + m.group(0)
            cards[m.group(2)] = card
        print(f"  page {page}: {len(units)} cards (total {len(cards)})", flush=True)
        if len(units) < 100:
            break
        time.sleep(DELAY)
    return cards


def card_fields(c):
    """Fields that change or are cheap to read from the index card (price is the daily truth)."""
    y = re.search(r"(\d{4})年", c.get("築年月", ""))
    return {
        "price":     extract_price({"販売価格": unicodedata.normalize("NFKC", c.get("販売価格", ""))}),
        "areaM2":    extract_m2(c.get("建物面積")),
        "landM2":    extract_m2(c.get("土地面積")),
        "builtYear": int(y.group(1)) if y else None,
    }


def row(nc, entry, area):
    det, cf = entry["detail"], entry["card"]
    return {
        **det,
        "price":     cf["price"],
        "areaM2":    det.get("areaM2") or cf["areaM2"],
        "landM2":    det.get("landM2") or cf["landM2"],
        "builtYear": det.get("builtYear") or cf["builtYear"],
        "imageUrl":  det.get("imageUrl") or cf["img"],
        "suumoUrl":  cf["url"],
        "ncId":      nc,
        "areaKey":   area["key"],
        "areaName":  area["name"],
        "firstSeen": entry["firstSeen"],
        "seeded":    entry.get("seeded", False),
    }


def main():
    with open(AREAS_FILE, encoding="utf-8") as f:
        areas = [a for a in json.load(f) if "house" in a.get("types", ["house"])]
    cache = json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() else {}
    today = date.today().isoformat()
    known_areas = {e.get("area") for e in cache.values()}
    print(f"[SUUMO houses] {len(areas)} areas, cache {len(cache)}")
    results, keep, failed, budget = [], set(), [], MAX_DETAILS

    for area in areas:
        print(f"[{area['key']}] {area['name']} (building >= {area.get('houseMinM2', 0)} m2)", flush=True)
        try:
            cards = crawl_index(area)
        except RuntimeError as e:
            print(f"  FAILED {e} — keeping yesterday's listings for this area")
            failed.append(area["key"])
            for nc, entry in cache.items():
                if entry.get("area") == area["key"] and entry.get("card"):
                    keep.add(nc)
                    results.append(row(nc, entry, area))
            continue
        seeding = area["key"] not in known_areas      # area's first crawl: firstSeen dates are not real
        todo = [nc for nc in cards if nc not in cache]
        print(f"  {len(cards)} listings, {len(todo)} need detail pages", flush=True)
        for i, nc in enumerate(todo, 1):
            if budget <= 0:
                break
            budget -= 1
            det = scrape_detail(cards[nc]["_url"], 0, area["name"])
            ok = bool(det and det.get("areaM2"))
            print(f"  [{i:>3}/{len(todo)}] nc_{nc} {'OK' if ok else 'FAIL'}", flush=True)
            if ok:
                for k in ("id", "grad", "isNew", "area"):
                    det.pop(k, None)
                cache[nc] = {"detail": det, "area": area["key"], "firstSeen": today, "seeded": seeding}
            time.sleep(DELAY)

        for nc, card in cards.items():
            if nc not in cache:
                continue            # detail failed or over budget — next run
            entry = cache[nc]
            cf = card_fields(card)
            if not cf["price"]:
                continue
            entry["lastSeen"] = today
            entry["card"] = {**cf, "url": card["_url"], "img": card["_img"]}
            keep.add(nc)
            results.append(row(nc, entry, area))
        CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")   # progress survives a crash
        time.sleep(DELAY)

    cache = {k: v for k, v in cache.items() if k in keep}      # drop sold/withdrawn
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"[SAVED] {len(results)} houses -> {OUT_JSON}; cache {len(cache)}; failed areas {failed}; "
          f"detail budget left {budget}")
    if not results:
        sys.exit("No houses scraped")
    return results


if __name__ == "__main__":
    main()
