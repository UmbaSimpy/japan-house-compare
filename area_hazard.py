"""Population-weighted natural-hazard exposure per study area  →  data/area_hazard.json

Track B (manual refresh — run only when the user asks). Method + sources: data/PARAMETERS.md, data/DATA_LOG.md.

  1. Residents: 2020 census 500 m mesh population (e-Stat 地域メッシュ統計 T001141, 4th-level mesh),
     cells assigned to an area by cell centre ∈ municipality polygon (data/boundaries.json).
  2. For every populated cell, sample a 4×4 grid of points (125 m apart) on these open layers
     (ハザードマップポータル, 「オープンデータ」〇, attribution 国土交通省/都道府県):
       flood   洪水浸水想定区域（想定最大規模）     01_flood_l2_shinsuishin_data
       surge   高潮浸水想定区域（想定最大規模）     03_hightide_l2_shinsuishin_data
       tsunami 津波浸水想定（想定最大規模）         04_tsunami_newlegend_data
       slide   土砂災害警戒区域 急傾斜地/土石流/地すべり 05_*keikaikuiki
     and a 2×2 grid on 国土地理院 地形分類 vector tiles for liquefaction tendency (same mapping as hazard.py).
     (Prefectural 液状化危険度 maps are NOT open data on the portal → not used.)
  3. Earthquake: J-SHIS 確率論的地震動予測地図 (Y2024, 平均ケース・全地震) 30-year probability of
     震度6弱以上 at the 5 most populated cells, population-weighted.
  4. Every share = population-weighted share of residents whose sample points fall in the zone.

Tiles are cached under data/cache/ (git-ignored) so re-runs are cheap.
Run: python area_hazard.py            (≈20–40 min first time)
"""
import io, json, math, os, sys, time, zipfile
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path

import requests
from PIL import Image

import hazard  # reuse landform code table + liquefaction-level mapping

Z = 14
CACHE = Path("data/cache"); CACHE.mkdir(parents=True, exist_ok=True)
MESH1 = ["5239", "5240", "5339", "5340", "5439", "5440"]
MESH_URL = "https://www.e-stat.go.jp/gis/statmap-search/data?statsId=T001141&code={code}&downloadType=2"
RASTER = {
    "flood":   "https://disaportal.gsi.go.jp/data/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png",
    "surge":   "https://disaportal.gsi.go.jp/data/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png",
    "tsunami": "https://disaportal.gsi.go.jp/data/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png",
    "slide_k": "https://disaportal.gsi.go.jp/data/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png",
    "slide_d": "https://disaportal.gsi.go.jp/data/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png",
    "slide_j": "https://disaportal.gsi.go.jp/data/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png",
}
# shinsui_legend3.png (portal legend image) → depth band
DEPTH = {(255, 255, 179): 1, (247, 245, 169): 1,            # < 0.5 m
         (248, 225, 166): 2, (255, 216, 192): 2,            # 0.5–3 m
         (255, 183, 183): 3, (255, 145, 145): 3,            # 3–10 m
         (242, 133, 201): 3, (220, 122, 220): 3}            # 10 m +
JSHIS = "https://www.j-shis.bosai.go.jp/map/api/pshm/Y2024/AVR/TTL_MTTL/meshinfo.geojson?position={lon},{lat}&epsg=4326"

S = requests.Session(); S.headers["User-Agent"] = "japan-house-compare area study (personal research)"


# ── population mesh ─────────────────────────────────────────────
def mesh_cells():
    cells = []
    for code in MESH1:
        f = CACHE / f"mesh_{code}.zip"
        if not f.exists():
            r = S.get(MESH_URL.format(code=code), timeout=60); r.raise_for_status()
            f.write_bytes(r.content); time.sleep(1)
        with zipfile.ZipFile(f) as z:
            txt = z.read(z.namelist()[0]).decode("cp932")
        for line in txt.splitlines()[2:]:
            p = line.split(",")
            if not p[0].isdigit() or len(p[0]) != 9:
                continue
            pop = int(p[4]) if p[4].strip().isdigit() else 0
            kids = int(p[7]) if len(p) > 7 and p[7].strip().isdigit() else 0
            if pop:
                cells.append((p[0], pop, kids))
    return cells


def mesh_box(k):
    """9-digit 4th-level mesh → (south, west, north, east)."""
    lat = int(k[0:2]) / 1.5 + int(k[4]) * (5 / 60) + int(k[6]) * (30 / 3600)
    lon = int(k[2:4]) + 100 + int(k[5]) * (7.5 / 60) + int(k[7]) * (45 / 3600)
    q = int(k[8]); dlat, dlon = 15 / 3600, 22.5 / 3600
    lat += dlat if q in (3, 4) else 0
    lon += dlon if q in (2, 4) else 0
    return lat, lon, lat + dlat, lon + dlon


# ── geometry ────────────────────────────────────────────────────
def in_rings(lon, lat, rings):
    inside = False
    for ring in rings:
        for i in range(len(ring)):
            x1, y1 = ring[i]; x2, y2 = ring[i - 1]
            if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
                inside = not inside
    return inside


def pix(lat, lon, z=Z):
    n = 256 * 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


# ── raster tiles (disk-cached) ──────────────────────────────────
def raster_file(layer, x, y):
    """Download once; returns the PNG path, or None where the layer has no data (portal answers 404)."""
    f = CACHE / "tiles" / layer / f"{Z}_{x}_{y}.png"
    miss = f.with_suffix(".none")
    if f.exists():
        return f
    if miss.exists():
        return None
    f.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(3):
        try:
            r = S.get(RASTER[layer].format(z=Z, x=x, y=y), timeout=30); break
        except requests.RequestException:
            time.sleep(2 + attempt * 3)
    else:
        raise SystemExit(f"tile fetch failed {layer} {x} {y}")
    time.sleep(0.05)
    if r.ok and r.content[:4] == b"\x89PNG":
        f.write_bytes(r.content); return f
    if r.status_code == 404:
        miss.touch(); return None
    raise SystemExit(f"tile HTTP {r.status_code} {layer} {x} {y}")


@lru_cache(maxsize=600)
def raster(layer, x, y):
    f = raster_file(layer, x, y)
    return Image.open(f).convert("RGBA") if f else None


def depth_at(layer, lat, lon):
    px, py = pix(lat, lon)
    img = raster(layer, int(px // 256), int(py // 256))
    if img is None:
        return 0
    c = img.getpixel((int(px % 256), int(py % 256)))
    if c[3] < 128:
        return 0
    best = min(DEPTH, key=lambda d: sum((a - b) ** 2 for a, b in zip(d, c[:3])))
    return DEPTH[best] if sum((a - b) ** 2 for a, b in zip(best, c[:3])) < 900 else 1  # unknown colour = shallow


def slide_at(lat, lon):
    """0 none · 1 警戒区域 (yellow 250,230,0) · 2 特別警戒区域 (red 250,40,0)."""
    best = 0
    px, py = pix(lat, lon)
    for layer in ("slide_k", "slide_d", "slide_j"):
        img = raster(layer, int(px // 256), int(py // 256))
        if img is not None:
            c = img.getpixel((int(px % 256), int(py % 256)))
            if c[3] >= 128:
                best = max(best, 2 if c[1] < 135 else 1)
    return best


# ── landform (liquefaction tendency) ────────────────────────────
def landform_file(layer, x, y):
    f = CACHE / "tiles" / layer / f"{Z}_{x}_{y}.json"
    if not f.exists():
        f.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(3):
            try:
                r = S.get(hazard.GSI_TILE.format(layer=layer, z=Z, x=x, y=y), timeout=90); break
            except requests.RequestException:
                time.sleep(3 + attempt * 5)
        else:
            raise SystemExit(f"landform fetch failed {layer} {x} {y}")
        if not (r.ok or r.status_code == 404):
            raise SystemExit(f"landform HTTP {r.status_code} {layer} {x} {y}")
        feats = [{"c": str(ft["properties"].get("code")), "g": ft["geometry"]} for ft in r.json().get("features", [])] if r.ok else []
        f.write_text(json.dumps(feats, separators=(",", ":")), encoding="utf-8"); time.sleep(0.05)
    return f


@lru_cache(maxsize=48)                 # cells are processed area by area → good locality
def landform_index(layer, x, y):
    feats = json.loads(landform_file(layer, x, y).read_text(encoding="utf-8"))
    grid = defaultdict(list)            # 16×16 buckets (16 px each) inside the tile
    clamp = lambda v: min(15, max(0, int(v // 16)))
    for ft in feats:
        g = ft["g"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"] if g["type"] == "MultiPolygon" else []
        for p in polys:
            xs = [c[0] for c in p[0]]; ys = [c[1] for c in p[0]]
            bb = (min(xs), min(ys), max(xs), max(ys))
            px0, py0 = pix(bb[3], bb[0]); px1, py1 = pix(bb[1], bb[2])   # NW, SE corners
            for gx in range(clamp(px0 - x * 256), clamp(px1 - x * 256) + 1):
                for gy in range(clamp(py0 - y * 256), clamp(py1 - y * 256) + 1):
                    grid[(gx, gy)].append((ft["c"], p, bb))
    return grid


def _landform_hit(layer, lat, lon):
    px, py = pix(lat, lon)
    tx, ty, gx, gy = int(px // 256), int(py // 256), int(px % 256 // 16), int(py % 256 // 16)
    for code, poly, (x0, y0, x1, y1) in landform_index(layer, tx, ty).get((gx, gy), []):
        if x0 <= lon <= x1 and y0 <= lat <= y1 and in_rings(lon, lat, poly):
            return hazard._landform_codes.get(code, ("?", None))
    return None


def liq_at(lat, lon):
    """Liquefaction tendency at a point: 'high' | 'mid' | 'low' | 'vlow' | 'fillUpland' | None (unrated).

    Artificial layer first (as hazard.py). GSI's own text for 盛土地・埋立地 says the liquefaction
    tendency is very strong *in lowlands*; on hills/plateaus the risk is fill collapse in rain/quakes.
    So fill whose natural landform (layer 1) is upland (vlow/low) is returned as 'fillUpland', not 'high'.
    """
    art, nat = hazard.SOURCES["gsi_landform"]["layers"]
    a = _landform_hit(art, lat, lon)
    n = _landform_hit(nat, lat, lon)
    if a and (a[1] is not None or a[0] == "水部"):
        if a[0] == "盛土地･埋立地" and n and n[1] in ("vlow", "low"):
            return "fillUpland"
        return a[1]
    if n and (n[1] is not None or n[0] == "水部"):
        return n[1]
    return None


_QF = CACHE / "jshis.json"
_Q = json.loads(_QF.read_text(encoding="utf-8")) if _QF.exists() else {}
def quake(lat, lon):
    key = f"{lat:.5f},{lon:.5f}"
    if key in _Q:
        return _Q[key]
    for attempt in range(3):
        try:
            r = S.get(JSHIS.format(lat=lat, lon=lon), timeout=40)
            p = r.json()["features"][0]["properties"]
            time.sleep(0.3)
            _Q[key] = float(p["T30_I55_PS"])
            _QF.write_text(json.dumps(_Q), encoding="utf-8")
            return _Q[key]
        except Exception:
            time.sleep(3)
    return None


def main():
    hazard._load_codes()
    bnd = json.load(open("data/boundaries.json", encoding="utf-8"))
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    only = set(sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None
    names = {a["nameJa"]: a["id"] for a in loc["areas"] if not only or a["id"] in only}
    polys = []
    for f in bnd["features"]:
        if f["name"] in names:
            pts = [c for poly in f["poly"] for c in poly[0]]
            polys.append((names[f["name"]], f["poly"], (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts))))

    cells = defaultdict(list)            # area id → [(lat0, lon0, lat1, lon1, pop, kids)]
    for k, pop, kids in mesh_cells():
        s, w, n, e = mesh_box(k); clat, clon = (s + n) / 2, (w + e) / 2
        for aid, poly, (x0, y0, x1, y1) in polys:
            if x0 <= clon <= x1 and y0 <= clat <= y1 and any(in_rings(clon, clat, p) for p in poly):
                cells[aid].append((s, w, n, e, pop, kids)); break
    print("cells assigned:", sum(len(v) for v in cells.values()), "areas:", len(cells), flush=True)

    # prefetch raster tiles in parallel (polite: 4 workers)
    need = set()
    for cs in cells.values():
        for s, w, n, e, *_ in cs:
            for la in (s, n):
                for lo in (w, e):
                    px, py = pix(la, lo); need.add((int(px // 256), int(py // 256)))
    jobs = [(layer, x, y) for layer in RASTER for x, y in need]
    print("raster tiles:", len(jobs), flush=True)
    with ThreadPoolExecutor(4) as ex:
        for i, _ in enumerate(ex.map(lambda j: raster_file(*j), jobs)):
            if i % 500 == 0: print("  raster", i, flush=True)
    lf_jobs = [(layer, x, y) for layer in hazard.SOURCES["gsi_landform"]["layers"] for x, y in need]
    print("landform tiles:", len(lf_jobs), flush=True)
    with ThreadPoolExecutor(4) as ex:
        for i, _ in enumerate(ex.map(lambda j: landform_file(*j), lf_jobs)):
            if i % 100 == 0: print("  landform", i, flush=True)

    out = {}
    for n_area, (aid, cs) in enumerate(sorted(cells.items())):
        tot = sum(c[4] for c in cs)
        acc = defaultdict(float)
        for s, w, n, e, pop, kids in cs:
            pts = [(s + (n - s) * (i + .5) / 4, w + (e - w) * (j + .5) / 4) for i in range(4) for j in range(4)]
            wpt = pop / len(pts)
            for la, lo in pts:
                d = {L: depth_at(L, la, lo) for L in ("flood", "surge", "tsunami")}
                dmax = max(d.values())
                acc["any"] += wpt * (dmax > 0); acc["deep"] += wpt * (dmax >= 3); acc["mid"] += wpt * (dmax == 2)
                acc["flood"] += wpt * (d["flood"] > 0); acc["floodDeep"] += wpt * (d["flood"] >= 3)
                acc["surge"] += wpt * (d["surge"] > 0); acc["tsunami"] += wpt * (d["tsunami"] > 0)
                sl = slide_at(la, lo)
                acc["slide"] += wpt * (sl > 0); acc["slideRed"] += wpt * (sl == 2)
            lpts = [(s + (n - s) * (i + .5) / 2, w + (e - w) * (j + .5) / 2) for i in range(2) for j in range(2)]
            for la, lo in lpts:
                lv = liq_at(la, lo)
                acc["liqRated"] += pop / 4 * (lv is not None)
                acc["liqHigh"] += pop / 4 * (lv == "high"); acc["liqMid"] += pop / 4 * (lv == "mid")
                acc["fillUpland"] += pop / 4 * (lv == "fillUpland")
        top = sorted(cs, key=lambda c: -c[4])[:5]
        qs = [(quake((c[0] + c[2]) / 2, (c[1] + c[3]) / 2), c[4]) for c in top]
        qs = [(q, p) for q, p in qs if q is not None]
        pct = lambda k: round(acc[k] / tot * 100, 1)
        out[aid] = {
            "pop2020mesh": tot, "cells": len(cs),
            "waterAny": pct("any"), "waterMid": pct("mid"), "waterDeep": pct("deep"),
            "flood": pct("flood"), "floodDeep": pct("floodDeep"), "surge": pct("surge"), "tsunami": pct("tsunami"),
            "landslide": pct("slide"), "landslideRed": pct("slideRed"),
            "liqHigh": pct("liqHigh"), "liqMid": pct("liqMid"), "liqRated": pct("liqRated"), "fillUpland": pct("fillUpland"),
            "quake30": round(sum(q * p for q, p in qs) / sum(p for _, p in qs) * 100, 1) if qs else None,
        }
        print(f"[{n_area+1}/{len(cells)}] {aid}: {out[aid]}", flush=True)

    if only:
        print("--only run: not writing data/area_hazard.json"); return
    json.dump({"generated": time.strftime("%Y-%m-%d"), "method": __doc__.strip(), "areas": out},
              open("data/area_hazard.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("wrote data/area_hazard.json", len(out))


if __name__ == "__main__":
    main()
