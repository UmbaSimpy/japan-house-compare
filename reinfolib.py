#!/usr/bin/env python3
"""MLIT 不動産情報ライブラリ (reinfolib) API client — the point lookups behind Deep look (DATA_LOG item 25).

Key: REINFOLIB_API_KEY from the environment (GitHub Actions secret) or the gitignored .env (secrets_env.py).
Without a key every function returns None and Deep look says so instead of failing.
Terms: https://www.reinfolib.mlit.go.jp/help/apiManual/ — show 「このサービスは、国土交通省不動産情報ライブラリの
API機能を使用していますが、提供情報の最新性、正確性、完全性等が保証されたものではありません」 wherever results appear.

APIs used
  XIT001  不動産価格（取引価格・成約価格）情報 by municipality / year      → sales()
  XPT002  地価公示・地価調査のポイント (tile, by year)                     → land_prices()
  XKT002  用途地域 · XKT014 防火・準防火地域 · XKT023 地区計画
  XKT030  都市計画道路 · XKT003 立地適正化計画                             → planning()
  XKT020  大規模盛土造成地 · XKT016 災害危険区域 · XKT021 地すべり防止地区
  XKT022  急傾斜地崩壊危険区域                                             → ground()
  XKT004  小学校区 · XKT005 中学校区                                       → school_zones()
Tile APIs take z/x/y (z 13–15 here); responses are cached in data/cache/reinfolib/ (gitignored).
"""
import hashlib
import json
import math
import re
import statistics
import time
import unicodedata
from datetime import date
from pathlib import Path

import requests

from secrets_env import secret

API = "https://www.reinfolib.mlit.go.jp/ex-api/external/"
CACHE = Path("data/cache/reinfolib")
CACHE_DAYS = 30
NOTICE = ("このサービスは、国土交通省不動産情報ライブラリのAPI機能を使用していますが、"
          "提供情報の最新性、正確性、完全性等が保証されたものではありません。")
REVGEO = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat={lat}&lon={lon}"
S = requests.Session()


def key():
    return secret("REINFOLIB_API_KEY")


def call(code, **params):
    """GET one API (cached). Returns parsed JSON or raises."""
    k = key()
    if not k:
        raise RuntimeError("REINFOLIB_API_KEY not configured")
    tag = hashlib.sha1(json.dumps([code, sorted(params.items())]).encode()).hexdigest()[:16]
    f = CACHE / f"{code}_{tag}.json"
    if f.exists() and time.time() - f.stat().st_mtime < CACHE_DAYS * 86400:
        return json.loads(f.read_text(encoding="utf-8"))
    for i in range(3):
        r = S.get(API + code, params=params, headers={"Ocp-Apim-Subscription-Key": k}, timeout=60)
        if r.status_code == 200:
            break
        time.sleep(2 * (i + 1))
    r.raise_for_status()
    j = r.json()
    CACHE.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(j, ensure_ascii=False), encoding="utf-8")
    time.sleep(0.3)
    return j


# ── geometry ────────────────────────────────────────────────────
def tile_of(lat, lon, z):
    n = 2 ** z
    return int((lon + 180) / 360 * n), int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)


def m_per_deg(lat):
    return 111320 * math.cos(math.radians(lat)), 110540


def tiles_around(lat, lon, z, r_m):
    mx, my = m_per_deg(lat)
    xs, ys = set(), set()
    for dy in (-r_m, r_m):
        for dx in (-r_m, r_m):
            x, y = tile_of(lat + dy / my, lon + dx / mx, z)
            xs.add(x); ys.add(y)
    return [(x, y) for x in range(min(xs), max(xs) + 1) for y in range(min(ys), max(ys) + 1)]


def features(code, lat, lon, r_m=0, z=15, **params):
    """Features of every tile within r_m. Polygons are clipped at tile edges, so one feature can come back
    as several pieces — keep them all (callers dedupe by name)."""
    out = []
    for x, y in tiles_around(lat, lon, z, max(r_m, 1)):
        out += call(code, response_format="geojson", z=z, x=x, y=y, **params).get("features", [])
    return out


def uniq(seq):
    return list(dict.fromkeys(x for x in seq if x))


def _xy(lat, lon, lat0, lon0):
    mx, my = m_per_deg(lat0)
    return (lon - lon0) * mx, (lat - lat0) * my


def _seg_d(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def _in_ring(x, y, ring):
    inside = False
    for i in range(len(ring)):
        (x1, y1), (x2, y2) = ring[i - 1], ring[i]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def dist_m(geom, lat, lon):
    """Metres from the point to the geometry; 0 inside a polygon."""
    t, c = geom["type"], geom["coordinates"]
    if t == "Point":
        x, y = _xy(c[1], c[0], lat, lon)
        return math.hypot(x, y)
    if t in ("LineString", "MultiLineString"):
        lines = [c] if t == "LineString" else c
        best = 1e9
        for ln in lines:
            pts = [_xy(b, a, lat, lon) for a, b in ln]
            best = min([best] + [_seg_d((0, 0), pts[i], pts[i + 1]) for i in range(len(pts) - 1)])
        return best
    polys = [c] if t == "Polygon" else c
    best = 1e9
    for poly in polys:
        rings = [[_xy(b, a, lat, lon) for a, b in ring] for ring in poly]
        if _in_ring(0, 0, rings[0]) and not any(_in_ring(0, 0, h) for h in rings[1:]):
            return 0.0
        for ring in rings:
            best = min([best] + [_seg_d((0, 0), ring[i], ring[i + 1]) for i in range(len(ring) - 1)])
    return best


def near(code, lat, lon, r_m, z=15, **params):
    """[(distance m, properties)] for features within r_m, nearest first."""
    hits = [(dist_m(f["geometry"], lat, lon), f["properties"]) for f in features(code, lat, lon, r_m, z, **params)]
    return sorted([h for h in hits if h[0] <= r_m], key=lambda h: h[0])


# ── high-level lookups (None = no key / failed) ─────────────────
def _safe(fn):
    def w(*a, **k):
        if not key():
            return None
        try:
            return fn(*a, **k)
        except Exception as e:                    # never break a report over an optional source
            print(f"reinfolib.{fn.__name__} failed: {e}")
            return {"error": str(e)[:120]}
    w.__name__ = fn.__name__
    return w


def muni_code(lat, lon):
    """5-digit municipality code (ward level in designated cities) from GSI's reverse geocoder."""
    try:
        return S.get(REVGEO.format(lat=lat, lon=lon), timeout=30).json()["results"]["muniCd"]
    except Exception:
        return None


def num(t):
    m = re.search(r"[\d,]+(?:\.\d+)?", unicodedata.normalize("NFKC", str(t or "")))
    return float(m.group(0).replace(",", "")) if m else None


@_safe
def sales(lat, lon, kind="中古マンション等", m2=None, year=None, years_back=2, district=None):
    """Recorded sale prices of comparable properties in the municipality, last `years_back` full years + this year.
    Both price series: 成約価格 (REINS contracts, 02) and 取引価格 (MLIT buyer survey, 01)."""
    city = muni_code(lat, lon)
    if not city:
        return {"error": "municipality not found"}
    y0 = date.today().year
    rows = []
    for y in range(y0 - years_back, y0 + 1):
        for pc in ("01", "02"):
            try:
                rows += call("XIT001", year=str(y), city=city, priceClassification=pc).get("data", [])
            except requests.HTTPError:
                pass                              # the current year can be empty (404) early on
    out = []
    for r in rows:
        if r.get("Type") != kind:
            continue
        a, p = num(r.get("Area")), num(r.get("TradePrice"))
        by = num(r.get("BuildingYear"))
        if not a or not p or "以上" in str(r.get("Area")):
            continue
        out.append({"ppm": p / a, "price": p, "m2": a, "year": int(by) if by and by > 1900 else None,
                    "district": r.get("DistrictName"), "period": r.get("Period"),
                    "contract": r.get("PriceCategory", "").startswith("成約")})
    comp = [r for r in out if (not m2 or 0.7 * m2 <= r["m2"] <= 1.3 * m2) and (not year or (r["year"] and abs(r["year"] - year) <= 10))]
    dist = [r for r in comp if district and r["district"] and r["district"] in district]
    stat = lambda rs: None if not rs else {"n": len(rs), "med": statistics.median(r["ppm"] for r in rs),
                                           "q1": _q([r["ppm"] for r in rs], .25), "q3": _q([r["ppm"] for r in rs], .75)}
    periods = sorted({r["period"] for r in comp if r["period"]})
    return {"city": city, "all": stat(out), "comp": stat(comp), "district": stat(dist), "districtRows": dist[:8],
            "nContract": sum(r["contract"] for r in comp), "periods": [periods[0], periods[-1]] if periods else None}


def _q(vals, p):
    v = sorted(vals)
    return v[min(len(v) - 1, int(p * (len(v) - 1) + .5))]


@_safe
def land_prices(lat, lon, r_m=1500, years=10, use="住宅地"):
    """Nearest official land-price points (公示 0 / 調査 1) of the given use, with their price history."""
    y0 = date.today().year
    pts = []
    for y in (y0, y0 - 1):
        try:
            fs = features("XPT002", lat, lon, r_m, z=13, year=str(y))
        except requests.HTTPError:
            continue
        pts = sorted([(dist_m(f["geometry"], lat, lon), f) for f in fs
                      if f["properties"].get("use_category_name_ja") == use], key=lambda h: h[0])
        pts = list({h[1]["properties"].get("standard_lot_number_ja"): h for h in reversed(pts) if h[0] <= r_m}.values())
        pts = sorted(pts, key=lambda h: h[0])[:2]
        if pts:
            break
    res = []
    for d, f in pts:
        p = f["properties"]
        plon, plat = f["geometry"]["coordinates"]
        hist = {}
        for yy in range(y0 - years, y0 + 1):
            try:
                for g in features("XPT002", plat, plon, 50, z=15, year=str(yy)):
                    if g["properties"].get("standard_lot_number_ja") == p.get("standard_lot_number_ja"):
                        hist[yy] = num(g["properties"].get("u_current_years_price_ja"))
            except requests.HTTPError:
                pass
        res.append({"dist": round(d), "id": p.get("standard_lot_number_ja"), "address": p.get("location"),
                    "type": "公示" if str(p.get("land_price_type")) == "0" else "調査", "station": p.get("nearest_station_name_ja"),
                    "stationDist": p.get("u_road_distance_to_nearest_station_name_ja"),
                    "zoning": p.get("regulations_use_category_name_ja"), "area": p.get("u_cadastral_ja"),
                    "price": num(p.get("u_current_years_price_ja")), "yoy": num(p.get("year_on_year_change_rate")),
                    "asOf": p.get("target_year_name_ja"), "history": dict(sorted(hist.items()))})
    return {"points": res}


@_safe
def planning(lat, lon):
    """Zoning at the point + other zones within 100 m, fire zone, district plan, planned roads, 立地適正化."""
    zones = near("XKT002", lat, lon, 100)
    here = zones[0][1] if zones and zones[0][0] <= 15 else None      # ≤ 15 m: the map point may sit on a road edge
    around = sorted({p.get("use_area_ja") for d, p in zones if p.get("use_area_ja")} - {here and here.get("use_area_ja")})
    fire = near("XKT014", lat, lon, 0)
    plans = near("XKT023", lat, lon, 30)
    roads = near("XKT030", lat, lon, 150)
    opt = near("XKT003", lat, lon, 0)
    return {
        "zoning": here and {"use": here.get("use_area_ja"), "bcr": here.get("u_building_coverage_ratio_ja"),
                            "far": here.get("u_floor_area_ratio_ja")},
        "zonesAround": around,
        "fire": fire[0][1].get("fire_prevention_ja") if fire else None,
        "districtPlans": uniq(p.get("plan_name") for _, p in plans)[:3],
        "roadDist": round(roads[0][0]) if roads else None,
        "locOpt": sorted({p.get("kubun_name_ja") for _, p in opt if p.get("kubun_name_ja")}),
    }


@_safe
def ground(lat, lon, r_m=100):
    """Large fill (大規模盛土造成地) and designated slope / landslide / disaster zones within r_m."""
    fill = near("XKT020", lat, lon, r_m)
    seen, rows = set(), []
    for d, p in fill:
        k = p.get("embankment_number") or p.get("_id")
        if k not in seen:
            seen.add(k)
            rows.append({"dist": round(d), "type": p.get("embankment_classification"), "no": p.get("embankment_number")})
    out = {"fill": rows[:3]}
    for code, k in (("XKT016", "disasterZone"), ("XKT021", "landslideArea"), ("XKT022", "steepSlope")):
        try:
            h = near(code, lat, lon, r_m)
            out[k] = round(h[0][0]) if h else None
        except Exception:
            out[k] = None
    return out


@_safe
def school_zones(lat, lon):
    e = near("XKT004", lat, lon, 0)
    j = near("XKT005", lat, lon, 0)
    return {"e": e[0][1].get("A27_004_ja") if e else None, "j": j[0][1].get("A32_004_ja") if j else None}


if __name__ == "__main__":
    import sys
    la, lo = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (35.63855, 140.074478)
    for fn in (planning, ground, school_zones, land_prices, sales):
        print(fn.__name__, json.dumps(fn(la, lo), ensure_ascii=False)[:600])
