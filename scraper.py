#!/usr/bin/env python3
"""
SUUMO Property Scraper
Target: used single-family homes in Mihama-ku, Chiba
"""

import json
import time
import re
import sys
from datetime import datetime

import requests
from bs4 import BeautifulSoup

# ── CONFIG ────────────────────────────────────────────
BASE_URL   = "https://suumo.jp"
INDEX_URL  = "https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=021&ta=12&jspIdFlg=patternShikugun&sc=12106&kb=1&kt=9999999&tb=0&tt=9999999&hb=0&ht=9999999&ekTjCd=&ekTjNm=&tj=0&cnb=0&cn=9999999&srch_navi=1"
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
MAX_PAGES  = 3     # index pages to crawl (10/page default → ~27 total listings)
OUT_JSON   = "listings.json"

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

# ── INDEX PAGE PARSING ────────────────────────────────
# Match any Chiba ward — sc_chibashi*/nc_* — so one scraper works for all wards
LISTING_RE = re.compile(r"/chukoikkodate/chiba/(sc_chiba[^/]+)/nc_(\d+)/")

WARD_SLUG = None   # auto-detected from the most common ward on page 1

def get_listing_urls(html, ward_filter=None):
    soup = BeautifulSoup(html, "html.parser")
    seen = set()
    urls = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        m = LISTING_RE.search(href)
        if not m:
            continue
        ward = m.group(1)
        if ward_filter and ward != ward_filter:
            continue
        full = BASE_URL + href if href.startswith("/") else href
        clean = re.sub(r"\?.*", "", full)
        if clean not in seen:
            seen.add(clean)
            urls.append(clean)
    return urls


def detect_ward(html):
    """Return the most common ward slug on the page (= the target ward)."""
    from collections import Counter
    soup = BeautifulSoup(html, "html.parser")
    wards = []
    for a in soup.find_all("a", href=True):
        m = LISTING_RE.search(a["href"])
        if m:
            wards.append(m.group(1))
    if not wards:
        return None
    return Counter(wards).most_common(1)[0][0]

def get_next_page_url(html, current_page):
    soup = BeautifulSoup(html, "html.parser")
    # Try explicit next link text
    for a in soup.find_all("a", href=True):
        text = a.get_text(strip=True)
        if text in ("次へ", "次のページ", ">", "›"):
            href = a["href"]
            return (BASE_URL + href) if href.startswith("/") else href
    # Fallback: append &page=N (INDEX_URL already has query params)
    next_page = current_page + 1
    return f"{INDEX_URL}&page={next_page}"

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
def scrape_detail(url, idx):
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
    age        = extract_age(first_match(d, "完成時期（築年月）", "完成時期(築年月)", "築年月", "建築年月", "竣工年月", "築年数"))
    layout     = extract_layout(first_match(d, "間取り", "間取")) or "?"
    line, sta, walk = extract_access(first_match(d, "交通", "アクセス", "沿線・駅"))
    structure, floors = extract_structure(first_match(d, "構造・工法", "構造", "建物構造", "建物の構造"))
    address    = extract_address(d)
    parking    = extract_parking(d, text)
    reno       = has_renovation(d, text)
    cgas       = has_city_gas(d)
    rights     = land_rights(d)
    image_url  = extract_image_url(soup, url)
    # debug: uncomment to inspect parsed fields
    # import pprint; pprint.pprint(d)

    return {
        "id":          idx,
        "price":       price,
        "area":        "Mihama-ku",
        "address":     address or "Mihama-ku, Chiba",
        "layout":      layout,
        "areaM2":      floor_area,
        "landM2":      land_area,
        "age":         age,
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
    }

def main():
    print("[SUUMO] Scraper -- Mihama-ku, Chiba")
    print(f"  Index URL : {INDEX_URL}")
    print(f"  Max pages : {MAX_PAGES}  (~{MAX_PAGES*20} listings)")
    print(f"  Delay     : {DELAY}s between requests")
    print("-" * 54)

    # ── Collect all listing URLs ───────────────────
    global WARD_SLUG
    all_urls = []
    current_url = INDEX_URL
    for page in range(1, MAX_PAGES + 1):
        print(f"\n[page {page}/{MAX_PAGES}] {current_url}")
        html = fetch(current_url)
        if not html:
            break

        # Auto-detect target ward from page 1
        if page == 1:
            WARD_SLUG = detect_ward(html)
            print(f"  [ward] Target ward detected: {WARD_SLUG}")

        urls = get_listing_urls(html, ward_filter=WARD_SLUG)
        before = len(all_urls)
        for u in urls:
            if u not in all_urls:
                all_urls.append(u)
        new_count = len(all_urls) - before
        print(f"  +{new_count} new URLs  (total {len(all_urls)})")
        if new_count == 0:
            print("  [stop] No new URLs on this page — reached end of results")
            break
        current_url = get_next_page_url(html, page)
        time.sleep(DELAY)

    print(f"\n[OK] {len(all_urls)} unique listing URLs collected")
    print("-" * 54)

    # ── Scrape each detail page ────────────────────
    results = []
    for i, url in enumerate(all_urls):
        nc = re.search(r"nc_(\d+)", url)
        nc_id = nc.group(1) if nc else "?"
        print(f"[{i+1:>3}/{len(all_urls)}] nc_{nc_id} ... ", end="", flush=True)
        prop = scrape_detail(url, i + 1)
        if prop and prop["areaM2"]:
            results.append(prop)
            print(f"OK  Y{prop['price']:,}man  {prop['layout']}  {prop['areaM2']}m2  {prop['walk']}min")
        else:
            print("SKIP (missing data)")
        time.sleep(DELAY)

    print(f"\n[OK] Scraped {len(results)}/{len(all_urls)} properties")

    # ── Save JSON ──────────────────────────────────
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"[SAVED] {OUT_JSON}")

    # ── Quick stats ────────────────────────────────
    if results:
        prices = [r["price"] for r in results]
        areas  = [r["areaM2"] for r in results if r["areaM2"]]
        walks  = [r["walk"] for r in results if r["walk"] < 99]
        print(f"\nStats:")
        print(f"  Price : Y{min(prices):,}man - Y{max(prices):,}man  (avg Y{sum(prices)//len(prices):,}man)")
        if areas:
            print(f"  Area  : {min(areas):.0f}-{max(areas):.0f} m2")
        if walks:
            print(f"  Walk  : {min(walks)}-{max(walks)} min  (avg {sum(walks)//len(walks)} min)")

    return results

if __name__ == "__main__":
    main()
