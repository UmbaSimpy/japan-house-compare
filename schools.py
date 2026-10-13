#!/usr/bin/env python3
"""Public schools: assigned (zoned) elementary + junior high per listing, and school facts per study area.
Info only — never scored (user decision 2026-10-13). Method + checks: data/DATA_LOG.md item 20.

Sources (国土数値情報, CC BY 4.0 with per-municipality terms; downloaded to data/cache/schools/, gitignored):
  A27 小学校区 2023 / A32 中学校区 2023 (published 2024-06): zone polygons + school code, name, address.
      Designated cities (Chiba, Yokohama, Kawasaki, Saitama) are coded at city level (12100 …).
      NOT in the national data (2021 and 2023): Funabashi 12204, Shinagawa 13109, Arakawa 13118, Moriya 08224
      → nearest public school is shown instead, flagged "zone map not published".
      Zones are approximate (±25 m) and can be out of date; always "confirm with the city's 学務課".
  P29 学校 2023: school points. P29_003 16001 小学校 / 16002 中学校 / 16014 義務教育学校; P29_006 3 = municipal.

  python schools.py build     → data/schools.json (compact zones + points for the study region, committed)
                               → data/area_schools.json (per-area counts + walking access; merged with the
                                 hand-curated data/school_info.json by build_map.py)
  import schools; schools.annotate(listings)   → d["school"] for listings that have d["geo"] (hazard.annotate)
"""
import glob
import json
import math
import sys
from collections import defaultdict
from pathlib import Path

CACHE = Path("data/cache/schools")
OUT = Path("data/schools.json")
OUT_AREA = Path("data/area_schools.json")
PREFS = ["08", "11", "12", "13", "14"]
NEAR_M = 150          # SUUMO addresses stop at the 丁目 → also test points this far away for a second zone
KIND = {"16001": "e", "16002": "j", "16014": "ej"}


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def in_ring(x, y, ring):
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def in_poly(x, y, poly):          # poly = [outer, hole, …]
    return in_ring(x, y, poly[0]) and not any(in_ring(x, y, h) for h in poly[1:])


def _dp(pts, tol):
    """Douglas–Peucker on an open polyline (degrees; tol ≈ 12 m — the zones themselves are ±25 m)."""
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-12
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x2 * y1 - y2 * x1) / L
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return _dp(pts[:i + 1], tol)[:-1] + _dp(pts[i:], tol)


def simplify(ring, tol=0.00012):
    sys.setrecursionlimit(10000)
    pts = [[x, y] for x, y in ring]
    if len(pts) > 3 and pts[0] == pts[-1]:
        pts = pts[:-1]
    far = max(range(len(pts)), key=lambda k: (pts[k][0] - pts[0][0]) ** 2 + (pts[k][1] - pts[0][1]) ** 2)
    r = _dp(pts[:far + 1], tol)[:-1] + _dp(pts[far:] + [pts[0]], tol)      # closed ring → two open halves
    out = []
    for x, y in r:
        p = [round(x, 4), round(y, 4)]
        if not out or p != out[-1]:
            out.append(p)
    return out if len(out) >= 4 else None


def region_boxes():
    bnd = json.load(open("data/boundaries.json", encoding="utf-8"))
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    names = {a["nameJa"]: a["id"] for a in loc["areas"]}
    out = []
    for f in bnd["features"]:
        if f["name"] in names:
            pts = [c for poly in f["poly"] for c in poly[0]]
            out.append((names[f["name"]], f["poly"], (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts))))
    return out, loc


def build():
    boxes, loc = region_boxes()
    X0 = min(b[2][0] for b in boxes) - .05; Y0 = min(b[2][1] for b in boxes) - .05
    X1 = max(b[2][2] for b in boxes) + .05; Y1 = max(b[2][3] for b in boxes) + .05
    pts = {}
    for p in PREFS:
        f = glob.glob(str(CACHE / f"P29-23_{p}_GML" / "**" / "*.geojson"), recursive=True)[0]
        for x in json.load(open(f, encoding="utf-8"))["features"]:
            pr = x["properties"]
            k = KIND.get(pr["P29_003"])
            if not k or pr["P29_006"] != "3":
                continue
            lon, lat = x["geometry"]["coordinates"][:2]
            if X0 <= lon <= X1 and Y0 <= lat <= Y1:
                pts[pr["P29_002"]] = [pr["P29_004"], round(lat, 5), round(lon, 5), k, pr["P29_001"], pr["P29_005"]]
    zones = {}
    for k, kind in (("A27", "e"), ("A32", "j")):
        rows = []
        for p in PREFS:
            for x in json.load(open(CACHE / f"{k}-23_{p}_GML" / f"{k}-23_{p}.geojson", encoding="utf-8"))["features"]:
                pr, g = x["properties"], x["geometry"]
                polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
                polys = [[r for r in (simplify(ring) for ring in poly) if r] for poly in polys]
                polys = [p_ for p_ in polys if p_ and len(p_[0]) >= 3]
                if not polys:
                    continue
                xs = [c[0] for poly in polys for c in poly[0]]; ys = [c[1] for poly in polys for c in poly[0]]
                bb = [min(xs), min(ys), max(xs), max(ys)]
                if not any(bb[0] <= b[2][2] and bb[2] >= b[2][0] and bb[1] <= b[2][3] and bb[3] >= b[2][1] for b in boxes):
                    continue        # keep zones overlapping a study area's bounding box only
                rows.append([pr[k + "_003"], pr[k + "_004"], pr[k + "_001"], bb, polys])
        zones[kind] = rows
    OUT.write_text(json.dumps({"source": "国土数値情報 A27/A32 2023 (school zones), P29 2023 (schools); CC BY 4.0, per-municipality terms",
                               "missingZones": ["12204", "13109", "13118", "08224"], "points": pts, "zones": zones},
                              ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"schools.json: {len(pts)} public schools, zones e={len(zones['e'])} j={len(zones['j'])}, {OUT.stat().st_size // 1024} KB")
    area_stats(boxes, loc, pts, zones)


def area_stats(boxes, loc, pts, zones):
    import area_hazard as AH
    def area_of(lat, lon):
        for aid, poly, (x0, y0, x1, y1) in boxes:
            if x0 <= lon <= x1 and y0 <= lat <= y1 and any(AH.in_rings(lon, lat, p) for p in poly):
                return aid
        return None
    cnt = defaultdict(lambda: {"e": 0, "j": 0, "ej": 0})
    grid = defaultdict(list)
    for code, (nm, lat, lon, k, mc, ad) in pts.items():
        a = area_of(lat, lon)
        if a:
            cnt[a][k] += 1
        if "e" in k:
            grid[(int(lat * 90), int(lon * 90))].append((lat, lon))
    kids, near8, near12 = defaultdict(int), defaultdict(float), defaultdict(float)
    for key, pop, kc in AH.mesh_cells():
        s, w, n, e = AH.mesh_box(key); c = ((s + n) / 2, (w + e) / 2)
        a = area_of(*c)
        if not a or not kc:
            continue
        gy, gx = int(c[0] * 90), int(c[1] * 90)
        d = min((km(c, p) for dy in (-1, 0, 1) for dx in (-1, 0, 1) for p in grid.get((gy + dy, gx + dx), [])), default=9)
        kids[a] += kc; near8[a] += kc * (d <= 0.8); near12[a] += kc * (d <= 1.2)
    zoned = {z[2] for z in zones["e"]}
    bnd = {f["name"]: f["code"] for f in json.load(open("data/boundaries.json", encoding="utf-8"))["features"]}
    out = {}
    for a in loc["areas"]:
        aid, code = a["id"], bnd[a["nameJa"]]
        c, kd = cnt[aid], kids[aid]
        city = "14130" if code[:4] == "1413" else code[:3] + "00" if code[:3] in ("111", "121", "141") else code   # designated-city wards
        out[aid] = {"es": c["e"] + c["ej"], "jhs": c["j"] + c["ej"], "combined": c["ej"],
                    "kidsPerES": round(kd / (c["e"] + c["ej"])) if c["e"] + c["ej"] else None,
                    "kidsNearES800": round(near8[aid] / kd * 100, 1) if kd else None,
                    "kidsNearES1200": round(near12[aid] / kd * 100, 1) if kd else None,
                    "zoneData": code in zoned or city in zoned}
    OUT_AREA.write_text(json.dumps({"source": "P29 2023 public schools; A27/A32 2023 zone coverage; 2020 census 500 m mesh (0–14, straight-line distance)",
                                    "areas": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print("area_schools.json:", sum(v["zoneData"] for v in out.values()), "areas with zone maps of", len(out))


_DATA = None


def _load():
    global _DATA
    if _DATA is None:
        _DATA = json.loads(OUT.read_text(encoding="utf-8"))
    return _DATA


def lookup(lat, lon):
    """→ {"e": {...}, "j": {...}} for a point (丁目 centre)."""
    D = _load()
    off = NEAR_M / 111_320
    probes = [(lat, lon)] + [(lat + off * math.sin(t), lon + off * math.cos(t) / math.cos(math.radians(lat)))
                             for t in (i * math.pi / 4 for i in range(8))]
    res = {}
    for kind in ("e", "j"):
        hits = []
        for i, (y, x) in enumerate(probes):
            for code, nm, mc, (x0, y0, x1, y1), polys in D["zones"][kind]:
                if x0 <= x <= x1 and y0 <= y <= y1 and any(in_poly(x, y, p) for p in polys):
                    if code not in [h[0] for h in hits]:
                        hits.append((code, nm, i == 0))
                    break
        main = next((h for h in hits if h[2]), hits[0] if hits else None)
        if main:
            p = D["points"].get(main[0])
            res[kind] = {"name": main[1], "code": main[0], "src": "zone",
                         "m": round(km((lat, lon), p[1:3]) * 1000) if p else None,
                         "alt": [h[1] for h in hits if h[0] != main[0]][:2]}
        else:     # no zone map here → nearest public school of that level
            best = min(((km((lat, lon), (v[1], v[2])), c, v) for c, v in D["points"].items() if kind in v[3]), default=None)
            if best and best[0] < 3:
                res[kind] = {"name": best[2][0], "code": best[1], "src": "nearest", "m": round(best[0] * 1000), "alt": []}
    return res


def annotate(listings):
    n = 0
    for d in listings:
        g = d.get("geo")
        d["school"] = lookup(g["lat"], g["lon"]) if g else None
        n += bool(d["school"])
    print(f"Schools: {n}/{len(listings)} listings matched")


if __name__ == "__main__":
    if sys.argv[1:] == ["build"]:
        build()
    elif len(sys.argv) == 3:
        print(lookup(float(sys.argv[1]), float(sys.argv[2])))
