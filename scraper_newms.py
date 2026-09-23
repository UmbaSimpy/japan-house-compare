#!/usr/bin/env python3
"""
SUUMO new-condo (新築マンション) scraper — areas from areas.json ("ms" type).

SUUMO's 新築 category mixes two kinds of listing:
  • project — a developer's building on sale / about to go on sale. Prices are
    often a range, "予定" (planned) or "未定" (TBD); sold in phases (第1期2次…).
    We read its 物件概要 page (property/) and its unit-type list (rooms/).
  • unit    — a single completed-but-never-occupied unit (新築未入居) resold by
    an agent. Same page layout as a used condo, so we reuse that parser.

Projects are re-read every run (prices/phases change); unit details are cached.
Output: newms.json (raw) — cleaned & scored by inject_newms.py.
"""

import json
import re
import sys
import time
import unicodedata
from datetime import date
from pathlib import Path

from bs4 import BeautifulSoup

import scraper_mansion as sm
from scraper import BASE_URL, DELAY, fetch, build_data_dict, first_match, extract_price, extract_access

AREAS_FILE = Path("areas.json")
CACHE_FILE = Path("newms_cache.json")
OUT_JSON   = Path("newms.json")
INDEX_TMPL = "https://suumo.jp/ms/shinchiku/chiba/{slug}/"
NC_RE      = re.compile(r"/ms/shinchiku/[^/]+/(sc_[^/]+)/nc_(\d+)/")
MAX_PAGES  = 10


def nfkc(t):
    return unicodedata.normalize("NFKC", t or "")


# ── money / ranges ────────────────────────────────────
def man_values(text):
    """All 万円 amounts in a string: '4100万円～1億2480万円' → [4100, 12480]."""
    t = nfkc(text).replace(",", "")
    return [int(o or 0) * 10000 + int(m or 0)
            for o, m in re.findall(r"(?:(\d+)億)?(\d+)?万円", t) if o or m]


def yen_range(text):
    """'1万8100円～2万1100円／月' → (18100, 21100); '金額未定'/'-' → (None, None)."""
    t = nfkc(text).replace(",", "")
    vals = [int(m or 0) * 10000 + int(y or 0)
            for m, y in re.findall(r"(?:(\d+)万)?(\d+)?円", t) if m or y]
    return (min(vals), max(vals)) if vals else (None, None)


def m2_range(text):
    vals = [float(v) for v in re.findall(r"([\d.]+)\s*m\s*2?", nfkc(text))]
    return (min(vals), max(vals)) if vals else (None, None)


def year_month(text):
    """'2028年3月下旬予定' → (2028, 3); '即引渡可' → ('now', None)."""
    t = nfkc(text)
    if re.search(r"即|相談", t):
        return "now", None
    m = re.search(r"(\d{4})年(?:(\d{1,2})月)?", t)
    return (int(m.group(1)), int(m.group(2) or 6)) if m else (None, None)


# ── index cards ───────────────────────────────────────
def parse_cards(html, slug):
    soup = BeautifulSoup(html, "html.parser")
    for card in soup.select("div.cassette-content"):
        a = card.find("a", href=NC_RE)
        if not a:
            continue
        m = NC_RE.search(a["href"])
        if m.group(1) != slug:          # empty areas show neighbouring cities' projects
            continue
        text = card.get_text(" ", strip=True)
        img = card.find("img", rel=True) or card.find("img", src=re.compile("suumo"))
        yield m.group(2), {
            "url": BASE_URL + m.group(0),
            "text": nfkc(text)[:1500],
            "image": (img.get("rel") or img.get("src")) if img else None,
            "kind": "project" if ("間取りタイプ別価格" in text or "価格未定" in text or "販売予定" in text) else "unit",
        }


def crawl_index(slug):
    found = {}
    for page in range(1, MAX_PAGES + 1):
        html = fetch(INDEX_TMPL.format(slug=slug) + (f"?page={page}" if page > 1 else ""))
        if not html:
            raise RuntimeError(f"index fetch failed: {slug} page {page}")
        cards = dict(parse_cards(html, slug))
        new = {k: v for k, v in cards.items() if k not in found}
        found.update(new)
        time.sleep(DELAY)
        if not new or not re.search(r'page=' + str(page + 1), html):
            break
    return found


# ── project pages ─────────────────────────────────────
def parse_rooms(html):
    """Unit types from rooms/: name, layout, m², price text, individual rooms."""
    soup = BeautifulSoup(html, "html.parser")
    types = []
    for li in soup.select("li.floor_cassette_list-item"):
        info = li.select_one(".floor_cassette_info")
        if not info:
            continue
        name = info.select_one(".floor_cassette_info-typename")
        txts = [nfkc(x.get_text(" ", strip=True)) for x in info.select(".floor_cassette_info-txt")]
        price_el = info.select_one(".floor_cassette_info-txt_emphasis")
        price_txt = nfkc(price_el.get_text(" ", strip=True)) if price_el else ""
        rooms = []
        for tr in info.select("table tr"):
            tds = [nfkc(td.get_text(" ", strip=True)) for td in tr.find_all("td")]
            if len(tds) == 2:
                fl = re.search(r"(\d+)F", tds[0])
                pv = man_values(tds[1])
                rooms.append({"no": tds[0].split("(")[0].strip(), "floor": int(fl.group(1)) if fl else None,
                              "price": pv[0] if pv else None})
        extra = nfkc(li.get_text(" ", strip=True))
        prices = man_values(price_txt.split("、")[-1]) if "未定" not in price_txt.split("、")[-1] else []
        more = re.search(r"すべての部屋を見る\((\d+)\)", extra)      # text is NFKC-normalised
        types.append({
            "name": nfkc(name.get_text(strip=True)) if name else "?",
            "layout": txts[0] if txts else "?",
            "m2": m2_range(" ".join(txts))[0],
            "priceText": price_txt,
            "priceMin": min(prices) if prices else None,
            "priceMax": max(prices) if prices else None,
            "firstCome": "先着順" in price_txt,
            "rooms": rooms,
            "roomCount": int(more.group(1)) if more else len(rooms) or None,
            "corner": "角住戸" in extra,
            "facing": (re.search(r"(?:^|\s)([東西南北]{1,2}(?:/[東西南北]{1,2})*)(?=\s)", extra) or [None, None])[1],
        })
    return types


def scrape_project(url):
    prop = fetch(url + "property/")
    time.sleep(DELAY)
    rooms_html = fetch(url + "rooms/")
    if not prop:
        return None
    soup = BeautifulSoup(prop, "html.parser")
    d = build_data_dict(soup)
    g = lambda *k: nfkc(first_match(d, *k)).strip()
    price_txt = g("価格", "予定価格")
    prices = man_values(price_txt) if "未定" not in price_txt else []
    comp_y, comp_m = year_month(g("完成時期"))
    dlv_y, dlv_m = year_month(g("引渡可能時期"))
    parking = g("駐車場")
    spaces = re.search(r"(\d+)台", parking)
    pfee = yen_range(parking)
    bldg = g("構造・階建て")
    floors = re.search(r"(\d+)階(?:地下\d+階)?建", bldg)
    units = re.search(r"(\d+)戸", g("総戸数"))
    on_sale = re.search(r"(\d+)戸", g("今回販売戸数"))
    title = nfkc(soup.title.get_text()) if soup.title else ""
    devs = [x.strip() for x in re.split(r"\s*\|\s*", g("不動産会社ガイド")) if x.strip()]
    if not devs:   # the guide row only renders on some pages — fall back to the page text
        m = re.search(r"不動産会社ガイド\s+(.+?)\s+関連サイト", nfkc(soup.get_text(" ", strip=True)))
        devs = [x.strip() for x in m.group(1).split("|")] if m else []
    return {
        "name": re.sub(r"^【SUUMO】\s*|^.*?\s-\s|\s*[|｜].*$", "", re.sub(r"^【SUUMO】\s*", "", title)).strip(),
        "address": re.sub(r"（地番）|\s*地図を見る", "", g("所在地")).strip(),
        "access": g("交通"),
        "totalUnits": int(units.group(1)) if units else None,
        "unitsOnSale": int(on_sale.group(1)) if on_sale else None,
        "priceText": price_txt or None,
        "priceMin": min(prices) if prices else None,
        "priceMax": max(prices) if prices else None,
        "priceBand": g("最多価格帯", "予定最多価格帯").strip(" -") or None,
        "schedule": g("販売スケジュール")[:200] or None,
        "completion": [comp_y, comp_m], "completed": "済" in g("完成時期"),
        "delivery": [dlv_y, dlv_m], "deliveryText": g("引渡可能時期") or None,
        "mgmtFee": yen_range(g("管理費")), "repairFund": yen_range(g("修繕積立金")),
        "repairUpfront": yen_range(g("修繕積立基金")), "mgmtUpfront": yen_range(g("管理準備金")),
        "otherFees": g("その他諸経費", "諸費用")[:120] or None,
        "areaRange": m2_range(g("専有面積")), "balconyRange": m2_range(g("その他面積")),
        "layoutRange": g("間取り") or None,
        "parkingSpaces": int(spaces.group(1)) if spaces and "敷地内" in parking else None,
        "parkingFee": pfee, "parkingText": parking[:120] or None,
        "structure": "SRC" if "SRC" in bldg else "RC" if "RC" in bldg else "Steel" if "S造" in bldg else "?",
        "bldgFloors": int(floors.group(1)) if floors else None,
        "mgmtType": g("管理形態") or None,
        "landRights": "leased" if re.search(r"借地|地上権", g("敷地の権利形態")) else "owned",
        "energy": " ".join(x for x in (g("エネルギー消費性能"), g("断熱性能")) if x and x != "-") or None,
        "builder": g("施工").strip(" -") or None,
        "developers": devs,
        "types": parse_rooms(rooms_html) if rooms_html else [],
    }


# ── main ──────────────────────────────────────────────
def main():
    areas = [a for a in json.loads(AREAS_FILE.read_text(encoding="utf-8")) if "ms" in a.get("types", ["ms"])]
    cache = json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() else {}
    known_areas = {e.get("area") for e in cache.values()}
    today = date.today().isoformat()
    out, seen = [], set()

    for area in areas:
        cards = crawl_index(area["slug"])
        seeding = area["key"] not in known_areas
        print(f"[SUUMO new condos] {area['name']}: {sum(c['kind'] == 'project' for c in cards.values())} projects, "
              f"{sum(c['kind'] == 'unit' for c in cards.values())} never-occupied units")
        for nc, card in cards.items():
            entry = cache.setdefault(nc, {"area": area["key"], "firstSeen": today, "seeded": seeding, "history": []})
            if card["kind"] == "project":
                det = scrape_project(card["url"])          # re-read every run: prices/phases change
                time.sleep(DELAY)
                if not det:
                    continue
                snap = [det["priceMin"], det["priceMax"], det["unitsOnSale"]]
            else:
                if "detail" not in entry:                    # never-occupied unit: same layout as a used condo
                    entry["detail"] = sm.scrape_detail(card["url"])
                    time.sleep(DELAY)
                if not entry["detail"]:
                    cache.pop(nc)
                    continue
                price = man_values(re.search(r"\d[\d,億]*万円", card["text"]).group(0))[0] \
                    if re.search(r"\d[\d,億]*万円", card["text"]) else None
                name = re.split(r"\s*追加\s*", card["text"])[0].strip()
                # "3LDK / 71.78m2" — the first m² after the layout slash (agent blurbs mention
                # storage rooms etc. earlier in the text)
                sz = re.search(r"\d[SLDK][^\s/]*\s*/\s*([\d.]+)\s*m", card["text"])
                area_m2 = float(sz.group(1)) if sz else m2_range(card["text"])[1]
                det = {**entry["detail"], "name": name, "price": price, "areaM2": area_m2,
                       "layout": (re.search(r"\d[SLDK]+[^\s/]*", card["text"]) or [None])[0]}
                snap = [price, price, 1]
            hist = entry["history"]
            if not hist or hist[-1][1:] != snap:
                hist.append([today, *snap])
            entry["lastSeen"] = today
            seen.add(nc)
            out.append({"ncId": nc, "kind": card["kind"], "areaKey": area["key"], "areaName": area["name"],
                        "url": card["url"], "image": card["image"], "cardText": card["text"],
                        "firstSeen": entry["firstSeen"], "seeded": entry["seeded"], "history": hist, **det})
            print(f"  {card['kind']:7} nc_{nc} {det.get('name', '')[:30]}")

    cache = {k: v for k, v in cache.items() if k in seen}
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[SAVED] {len(out)} new-condo listings → {OUT_JSON}")


if __name__ == "__main__":
    main()
