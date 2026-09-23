#!/usr/bin/env python3
"""
Liquefaction risk (液状化危険度) per listing address.

SUUMO only publishes addresses down to 丁目 level, so for each address we:
  1. Geocode it with the GSI address API (free, no key) → 丁目 centre point
     (or 番 block point when the agent gave a fuller address).
  2. Sample the hazard-map tiles on a 25 m grid within SAMPLE_RADIUS_M (丁目)
     or BLOCK_RADIUS_M (番) of that point — the 50 m mesh cells around it.
  3. Store the share of each risk level; the dominant level is the headline.

Source per area is set in areas.json ("liquefaction": "<source key>").
  chiba_city — 千葉市地震ハザードマップ「液状化危険度」 (50 m mesh, 4 levels,
               FY2016 survey, scenario: 千葉市直下地震 M7.3):
               https://www.city.chiba.jp/other/j_hazardmap/
               The newer FY2025 web map (other/jf_hazardmap/) forbids data
               extraction in its terms, so it is only linked to ("verify"),
               never read. © City of Chiba — derived levels for personal use.
Areas without a source get no rating (shown as "not rated" on the site).

Results are cached in hazard_cache.json (committed), so only new addresses
cost network requests.
"""

import io
import json
import math
import re
import time
import unicodedata
import urllib.parse
from collections import Counter
from pathlib import Path

import requests
from PIL import Image

CACHE_FILE      = Path("hazard_cache.json")
GEOCODE_URL     = "https://msearch.gsi.go.jp/address-search/AddressSearch?q={q}"
SAMPLE_RADIUS_M = 200   # 丁目-level address (centre point only)
BLOCK_RADIUS_M  = 80    # address resolved to a 番 (block) — much tighter
SAMPLE_STEP_M   = 25
ZOOM            = 16

SOURCES = {
    "chiba_city": {
        "label": "千葉市 液状化危険度 (FY2016)",
        # official current map, centred on the listing (user opens & views it)
        "verify": "https://www.city.chiba.jp/other/jf_hazardmap/map.html?lay=saigai-02&lat={lat}&lng={lon}&zoom=16",
        "url":   "https://www.city.chiba.jp/other/j_hazardmap/wmts/kiken_ekijouka/{z}/{x}/{y}.png",
        # legend colour → level
        "colors": {(255, 128, 0): "high", (255, 255, 64): "mid",
                   (0, 164, 143): "low", (128, 255, 255): "vlow"},
    },
}
LEVEL_ORDER = ["high", "mid", "low", "vlow"]

session = requests.Session()
session.headers["User-Agent"] = "japan-house-compare (personal research)"
_tiles = {}


def _tile(src, x, y):
    key = (src, x, y)
    if key not in _tiles:
        r = session.get(SOURCES[src]["url"].format(z=ZOOM, x=x, y=y), timeout=20)
        _tiles[key] = Image.open(io.BytesIO(r.content)).convert("RGBA") if r.ok and r.content[:4] == b"\x89PNG" else None
        time.sleep(0.2)
    return _tiles[key]


def _classify(rgba, colors):
    if rgba[3] < 128:
        return None
    best = min(colors, key=lambda c: sum((a - b) ** 2 for a, b in zip(c, rgba[:3])))
    return colors[best] if sum((a - b) ** 2 for a, b in zip(best, rgba[:3])) < 3000 else None


def _pixel(lat, lon):
    n = 256 * 2 ** ZOOM
    px = (lon + 180) / 360 * n
    py = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return int(px), int(py)


def geocode(address):
    q = urllib.parse.quote(unicodedata.normalize("NFKC", address))
    r = session.get(GEOCODE_URL.format(q=q), timeout=20)
    r.raise_for_status()
    hits = r.json()
    time.sleep(0.3)
    if not hits:
        return None
    lon, lat = hits[0]["geometry"]["coordinates"]
    return {"lat": lat, "lon": lon, "matched": hits[0]["properties"]["title"]}


def sample(src, lat, lon, radius=SAMPLE_RADIUS_M):
    colors = SOURCES[src]["colors"]
    m_per_deg_lat = 111_320
    m_per_deg_lon = 111_320 * math.cos(math.radians(lat))
    steps = int(radius / SAMPLE_STEP_M)
    counts = Counter()
    for i in range(-steps, steps + 1):
        for j in range(-steps, steps + 1):
            dx, dy = i * SAMPLE_STEP_M, j * SAMPLE_STEP_M
            if dx * dx + dy * dy > radius ** 2:
                continue
            px, py = _pixel(lat + dy / m_per_deg_lat, lon + dx / m_per_deg_lon)
            img = _tile(src, px // 256, py // 256)
            if img is None:
                continue
            level = _classify(img.getpixel((px % 256, py % 256)), colors)
            if level:
                counts[level] += 1
    total = sum(counts.values())
    if not total:
        return None
    dist = {lv: round(counts[lv] / total * 100) for lv in LEVEL_ORDER if counts[lv]}
    return {"level": counts.most_common(1)[0][0], "dist": dist}


def lookup(address, src, cache):
    """Return the liquefaction record for an address (cached)."""
    key = f"{src}|{address}"
    if key not in cache:
        rec = {"src": SOURCES[src]["label"]}
        try:
            geo = geocode(address)
            if geo:
                rec.update(geo)
                radius = BLOCK_RADIUS_M if "番" in geo["matched"] else SAMPLE_RADIUS_M
                s = sample(src, geo["lat"], geo["lon"], radius)
                rec["radius"] = radius
                if s:
                    rec.update(s)
        except Exception as e:           # network hiccup → retry next run
            print(f"  [hazard] {address}: {e}")
            return None
        cache[key] = rec
    return cache[key]


def annotate(listings, areas, area_of):
    """Attach d['liq'] = {level, dist, src} to each listing.
    area_of(d) → the area key the listing belongs to."""
    cache = json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() else {}
    src_by_area = {a["key"]: a.get("liquefaction") for a in areas}
    for d in listings:
        src = src_by_area.get(area_of(d))
        rec = lookup(d["address"], src, cache) if src in SOURCES and d.get("address") else None
        d["liq"] = ({"level": rec["level"], "dist": rec["dist"], "src": rec["src"],
                     "matched": rec.get("matched"), "radius": rec.get("radius"),
                     "verify": SOURCES[src]["verify"].format(lat=rec["lat"], lon=rec["lon"])}
                    if rec and rec.get("level") else None)
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    rated = sum(1 for d in listings if d["liq"])
    print(f"Liquefaction: {rated}/{len(listings)} listings rated "
          f"{dict(Counter(d['liq']['level'] for d in listings if d['liq']))}")


if __name__ == "__main__":      # quick manual check: python hazard.py 千葉県千葉市美浜区高浜４
    import sys
    print(lookup(sys.argv[1], "chiba_city", {}))
