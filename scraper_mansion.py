#!/usr/bin/env python3
"""
SUUMO used-condo (中古マンション) scraper.
Areas come from areas.json — add an entry there to track another ward/city.

Daily flow (cheap on SUUMO):
  1. Crawl the index pages (100 listings/page) → current price, size, layout,
     station, build date, photo for every listing.
  2. Crawl the index again with SUUMO's pet / elevator filters → feature flags.
  3. Fetch the detail page ONLY for listings not yet in mansion_cache.json
     (fees, floor, units, facing, parking, reno …) and cache it.
  4. Track first-seen date and price history in the cache.
Output: mansions.json (raw, merged) — cleaned & scored by inject_mansion.py.
"""

import json
import re
import sys
import time
import unicodedata
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup

from scraper import BASE_URL, DELAY, fetch, build_data_dict, first_match, extract_price, extract_access

AREAS_FILE = Path("areas.json")
CACHE_FILE = Path("mansion_cache.json")
OUT_JSON   = Path("mansions.json")
MAX_PAGES  = 20    # safety cap per area (100 listings/page)

INDEX_TMPL = ("https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar={ar}&bs=011&ta={ta}"
              "&jspIdFlg=patternShikugun&sc={sc}&kb=1&kt=9999999&mb=0&mt=9999999"
              "&ekTjCd=&ekTjNm=&tj=0&cnb=0&cn=9999999&srch_navi=1&pc=100")
FLAG_QUERIES = {"pet": "&st=292", "elevator": "&cp=251"}   # SUUMO checkbox filters

NC_RE = re.compile(r"/ms/chuko/[^/]+/(sc_[^/]+)/nc_(\d+)/")


def nfkc(t):
    return unicodedata.normalize("NFKC", t or "")


# ── INDEX ─────────────────────────────────────────────
def parse_units(html, slug):
    """Yield (nc_id, card dict) for each listing card on an index page."""
    soup = BeautifulSoup(html, "html.parser")
    for unit in soup.select("div.property_unit"):
        a = unit.find("a", href=NC_RE)
        if not a:
            continue
        m = NC_RE.search(a["href"])
        if m.group(1) != slug:
            continue
        card = {}
        for dt in unit.find_all("dt"):
            dd = dt.find_next_sibling("dd")
            if dd:
                card[dt.get_text(strip=True)] = dd.get_text(" ", strip=True)
        img = unit.find("img", rel=re.compile(m.group(2)))
        card["_img"] = img["rel"] if img else None
        card["_url"] = BASE_URL + m.group(0)
        yield m.group(2), card


def crawl_index(base_url, slug):
    """Return {nc_id: card} for every page of an index search."""
    found = {}
    for page in range(1, MAX_PAGES + 1):
        html = fetch(f"{base_url}&page={page}")
        if not html:
            raise RuntimeError(f"index fetch failed: page {page}")
        units = dict(parse_units(html, slug))
        new = {k: v for k, v in units.items() if k not in found}
        found.update(new)
        print(f"  page {page}: {len(units)} cards (+{len(new)}, total {len(found)})")
        time.sleep(DELAY)
        if len(units) < 100 or not new:
            break
    return found


# ── DETAIL FIELD PARSERS ──────────────────────────────
def parse_yen(text):
    """'1万1000円／月' → 11000, '5000円／月' → 5000, '-' → None."""
    t = nfkc(text).replace(",", "")
    m = re.search(r"(?:(\d+)万)?(\d+)?円", t)
    if not m or not (m.group(1) or m.group(2)):
        return None
    return int(m.group(1) or 0) * 10000 + int(m.group(2) or 0)


def parse_m2(text):
    m = re.search(r"([\d.]+)\s*m\s*2?", nfkc(text))
    return float(m.group(1)) if m else None


def parse_built(text):
    """Return (year, month) from '1979年2月'."""
    m = re.search(r"(\d{4})年(?:(\d{1,2})月)?", nfkc(text))
    return (int(m.group(1)), int(m.group(2) or 1)) if m else (None, None)


def parse_floor(d):
    """Return (unit floor, building floors, structure)."""
    combo = nfkc(first_match(d, "所在階/構造・階建"))
    unit  = nfkc(first_match(d, "所在階")) or combo.split("/")[0]
    bldg  = nfkc(first_match(d, "構造・階建て", "構造・階建")) or combo
    fm = re.search(r"(\d+)階", unit)
    bm = re.search(r"(\d+)階(?:地下\d+階)?建", bldg)
    structure = "SRC" if "SRC" in bldg else "RC" if "RC" in bldg else "Steel" if re.search(r"S造|鉄骨", bldg) else "?"
    return (int(fm.group(1)) if fm else None, int(bm.group(1)) if bm else None, structure)


def parse_parking(text):
    t = nfkc(text).strip()
    if t in ("", "-"):
        return "unknown", None
    if re.search(r"空無|空き?なし|満車|空車待ち|キャンセル待ち", t):
        return "full", parse_yen(t)          # parking exists, just no vacancy right now (waitlist)
    if t in ("無", "なし"):
        return "none", None
    fee = parse_yen(t)
    if "敷地内" in t:
        return "onsite", fee
    if re.search(r"近隣|周辺|敷地外", t):
        return "nearby", fee
    return "other", fee


def scrape_detail(url):
    html = fetch(url)
    if not html:
        return None
    d = build_data_dict(BeautifulSoup(html, "html.parser"))
    floor, bldg_floors, structure = parse_floor(d)
    parking_text = nfkc(first_match(d, "駐車場")).strip()
    parking, parking_fee = parse_parking(parking_text)
    reno = nfkc(first_match(d, "リフォーム"))
    units = re.search(r"(\d+)戸", nfkc(first_match(d, "総戸数")))
    balcony = re.search(r"バルコニー面積[:：]?\s*([\d.]+)", nfkc(first_match(d, "その他面積")))
    return {
        "mgmtFee":     parse_yen(first_match(d, "管理費")),
        "repairFund":  parse_yen(first_match(d, "修繕積立金")),
        "totalUnits":  int(units.group(1)) if units else None,
        "floor":       floor,
        "bldgFloors":  bldg_floors,
        "structure":   structure,
        "facing":      nfkc(first_match(d, "向き")).strip(" -") or None,
        "parking":     parking,
        "parkingFee":  parking_fee,
        "parkingText": parking_text[:80] or None,
        "renovation":  bool(reno) and reno.strip() not in ("-", "無"),
        "renoNote":    re.sub(r"\s*※.*", "", reno)[:80] if reno.strip() not in ("", "-") else None,
        "landRights":  "leased" if re.search(r"借地|地上権", first_match(d, "敷地の権利形態")) else "owned",
        "builder":     nfkc(first_match(d, "施工")).strip(" -") or None,
        "balconyM2":   float(balcony.group(1)) if balcony else None,
        "access":      [nfkc(x).strip() for x in re.split(r"\s*\[ 乗り換え案内 \]\s*", first_match(d, "交通")) if x.strip()][:3],
    }


# ── MERGE CARD + DETAIL ───────────────────────────────
def card_fields(card):
    access = card.get("沿線・駅", "")
    line, sta, walk = extract_access(access)
    bus = re.search(r"バス(\d+)分.*?歩(\d+)分", nfkc(access))
    if bus:   # door-to-station: bus ride + walk to stop + ~5 min waiting
        walk = int(bus.group(1)) + int(bus.group(2)) + 5
    year, month = parse_built(card.get("築年月", ""))
    layout = re.search(r"\d+[SLDK]+|ワンルーム", nfkc(card.get("間取り", "")))
    return {
        "name":      nfkc(card.get("物件名", "")).strip(),
        "price":     extract_price({"価格": card.get("販売価格", "")}),
        "address":   nfkc(card.get("所在地", "")).strip(),
        "areaM2":    parse_m2(card.get("専有面積", "")),
        "layout":    layout.group(0).replace("ワンルーム", "1R") if layout else "?",
        "builtYear": year,
        "builtMonth": month,
        "line":      nfkc(line),
        "station":   nfkc(sta),
        "walk":      walk,
        "bus":       bool(bus),
        "suumoUrl":  card["_url"],
        "imageUrl":  card["_img"],
    }


def main():
    areas = [a for a in json.loads(AREAS_FILE.read_text(encoding="utf-8")) if "ms" in a.get("types", ["ms"])]
    cache = json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() else {}
    today = date.today().isoformat()
    known_areas = {e.get("area") for e in cache.values()}
    results = []
    seen_ids = set()

    for area in areas:
        base = INDEX_TMPL.format(**area)
        print(f"[SUUMO condos] {area['name']}")
        cards = crawl_index(base, area["slug"])
        flags = {}
        for flag, q in FLAG_QUERIES.items():
            print(f" flag: {flag}")
            flags[flag] = set(crawl_index(base + q, area["slug"]))

        seeding = area["key"] not in known_areas   # area's first scrape: firstSeen dates are not real
        todo = [nc for nc in cards if nc not in cache]
        print(f" {len(cards)} listings, {len(todo)} need detail pages")
        for i, nc in enumerate(todo, 1):
            det = scrape_detail(cards[nc]["_url"])
            print(f"  [{i:>3}/{len(todo)}] nc_{nc} {'OK' if det else 'FAIL'}")
            if det:
                cache[nc] = {"detail": det, "area": area["key"], "firstSeen": today, "seeded": seeding, "priceHistory": []}
            time.sleep(DELAY)

        for nc, card in cards.items():
            if nc not in cache:
                continue            # detail failed — retry tomorrow
            base_rec = card_fields(card)
            if not base_rec["price"] or not base_rec["areaM2"]:
                continue
            entry = cache[nc]
            hist = entry["priceHistory"]
            if not hist or hist[-1][1] != base_rec["price"]:
                hist.append([today, base_rec["price"]])
            entry["lastSeen"] = today
            seen_ids.add(nc)
            results.append({
                "ncId": nc,
                "areaKey": area["key"],
                "areaName": area["name"],
                **base_rec,
                **entry["detail"],
                "pet": nc in flags["pet"],
                "elevator": nc in flags["elevator"],
                "firstSeen": entry["firstSeen"],
                "seeded": entry.get("seeded", False),
                "priceHistory": hist,
            })

    # Drop sold/withdrawn listings from the cache
    cache = {k: v for k, v in cache.items() if k in seen_ids}
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT_JSON.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[SAVED] {len(results)} condos → {OUT_JSON}; cache {len(cache)} entries")
    if not results:
        sys.exit("No condos scraped")


if __name__ == "__main__":
    main()
