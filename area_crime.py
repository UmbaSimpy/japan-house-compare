"""Recorded crime per study area (official police statistics, 令和7年 = 2025)  →  data/area_crime.json

Track B (manual refresh — run only when the user asks). Method + checks: data/DATA_LOG.md (item 11).
Info only: shown as pros/cons/info and in Compare, never part of the total score.

Sources (認知件数 = offences recorded by the police where they happened, calendar year 2025):
  Tokyo     警視庁「区市町村の町丁別、罪種別及び手口別認知件数」R7.csv (cp932, one row per 丁目 plus a
            「<区市>計」 row per municipality — we read the 計 rows)
  Kanagawa  神奈川県警「市区町村別 刑法犯認知件数」c0030_67.pdf — p.1 罪名別 (総数/凶悪犯/粗暴犯),
            p.3 窃盗手口別 (空き巣/忍込み). Values transcribed below (10 study wards).
  Saitama   埼玉県警「令和7年 市区町村別刑法犯認知件数」r7keihoukansityouson.pdf — 総数 + 空き巣/忍込み;
            Saitama does not publish 凶悪犯/粗暴犯 per municipality → violent = null. Transcribed below.
  Chiba     千葉県警「市区町村別 罪種・手口別 認知件数（令和7年）」000071144.pdf — parsed with PyMuPDF
            into data/cache/crime/chiba_r7_parsed.json (column mapping by x position; DATA_LOG item 11).
  Ibaraki   茨城県警 statistics pages are offline (site moved to /kenkei/, every PDF 404, no archive copy).
            Tsukuba total only, from the police 「市町村別刑法犯認知件数（令和7年12月末 暫定）」 table as
            quoted by search results; Moriya / Tsukubamirai = null. Retry at the next refresh.

Per area:
  total            all 刑法犯 recorded
  totalPer1k       total per 1,000 residents (pop2025 from data/locations.json)
  burglary         空き巣 + 忍込み (break-ins into homes while empty / while asleep)
  burglaryPer10k   per 10,000 residents
  violent          凶悪犯 (murder, robbery, arson, rape) + 粗暴犯 (assault, injury, threats, extortion)
  violentPer10k    per 10,000 residents
  safetyIndex      0–100 map-layer value (100 = safest), log-scaled between fixed bounds:
                   burglary 0.2 → 100 … 3.0 → 0 per 10k; violent 2.5 → 100 … 25 → 0 per 10k;
                   index = 60% burglary + 40% violent (burglary only where violent is missing,
                   null where burglary is missing). Info only — never enters the total score.
Caveat: offences are counted where they happen, so commercial/nightlife hubs (Chiyoda, Shinjuku,
Shibuya, Toshima, Kawasaki-ku, Chiba Chuo-ku, Omiya, Yokohama Nishi-ku) look worse per resident than
they are for a family living in a residential part of them. Burglary is the most residential measure.
Run: python area_crime.py
"""
import csv
import json
import math
from datetime import date
from pathlib import Path

CACHE = Path("data/cache/crime")
OUT = Path("data/area_crime.json")

SRC = {
    "Tokyo": ("警視庁 区市町村の町丁別、罪種別及び手口別認知件数 令和7年",
              "https://www.keishicho.metro.tokyo.lg.jp/about_mpd/jokyo_tokei/jokyo/ninchikensu.html"),
    "Kanagawa": ("神奈川県警察 市区町村別 刑法犯認知件数 令和7年",
                 "https://www.police.pref.kanagawa.jp/assets/entry/c0030_67.pdf"),
    "Saitama": ("埼玉県警察 令和7年 市区町村別刑法犯認知件数",
                "https://www.police.pref.saitama.lg.jp/documents/27624/r7keihoukansityouson.pdf"),
    "Chiba": ("千葉県警察 市区町村別 罪種・手口別 認知件数 令和7年",
              "https://www.police.pref.chiba.jp/keisoka/safe-life_crime_statisticsA-03.html"),
    "Ibaraki": ("茨城県警察 市町村別刑法犯認知件数 令和7年12月末（暫定）— site offline, Tsukuba total only",
                "https://www.pref.ibaraki.jp/kenkei/"),
}

# Kanagawa c0030_67.pdf: (総数, 凶悪犯, 粗暴犯, 空き巣, 忍込み)
KANAGAWA = {
    "yokohama-kanagawa": (1200, 10, 66, 7, 1),
    "yokohama-nishi":    (1539, 26, 147, 6, 1),
    "yokohama-kohoku":   (1763, 17, 96, 31, 2),
    "yokohama-aoba":     (930, 2, 75, 19, 5),
    "yokohama-tsuzuki":  (976, 9, 50, 8, 1),
    "kawasaki-kawasaki": (2489, 18, 191, 17, 9),
    "kawasaki-saiwai":   (1051, 8, 86, 7, 0),
    "kawasaki-nakahara": (1083, 5, 85, 6, 1),
    "kawasaki-takatsu":  (1175, 9, 89, 7, 0),
    "kawasaki-miyamae":  (772, 2, 49, 7, 1),
}
# Saitama r7keihoukansityouson.pdf: (総数 R7, 空き巣 R7, 忍込み R7)
SAITAMA = {
    "saitama-omiya":  (1793, 7, 6),
    "saitama-chuo":   (617, 9, 0),
    "saitama-urawa":  (924, 13, 2),
    "saitama-minami": (958, 11, 2),
    "saitama-midori": (862, 17, 2),
    "kawaguchi":      (4417, 46, 36),
    "soka":           (1906, 44, 42),
    "koshigaya":      (3256, 48, 29),
    "toda":           (1143, 7, 3),
    "yashio":         (883, 11, 12),
    "misato":         (1214, 10, 6),
}
IBARAKI_TOTAL = {"tsukuba": 1769}   # 暫定; burglary/violent not available
BOUNDS = {"burglaryPer10k": (0.2, 3.0), "violentPer10k": (2.5, 25.0)}   # (→100, →0), log scale


def sub(v, key):
    if v is None:
        return None
    lo, hi = BOUNDS[key]
    return 100 * max(0.0, min(1.0, (math.log(hi) - math.log(max(v, 1e-6))) / (math.log(hi) - math.log(lo))))


def safety(b, v):
    sb, sv = sub(b, "burglaryPer10k"), sub(v, "violentPer10k")
    if sb is None:
        return None
    return round(sb if sv is None else 0.6 * sb + 0.4 * sv, 1)


def tokyo():
    rows = list(csv.reader(open(CACHE / "tokyo_R7.csv", encoding="cp932")))
    h = rows[0]
    col = {k: h.index(k) for k in ("総合計", "凶悪犯計", "粗暴犯計", "侵入窃盗空き巣", "侵入窃盗忍込み")}
    out = {}
    for r in rows[1:]:
        if r[0].endswith("計") and r[0][-2] in "区市町村":
            v = {k: int(r[i]) for k, i in col.items()}
            out[r[0][:-1]] = (v["総合計"], v["凶悪犯計"], v["粗暴犯計"], v["侵入窃盗空き巣"], v["侵入窃盗忍込み"])
    return out


def chiba():
    d = json.load(open(CACHE / "chiba_r7_parsed.json", encoding="utf-8"))
    return {k.replace("ヶ", "ケ"): (v["total"], v["violentSerious"], v["assault"], v["akisu"], v["shinobi"])
            for k, v in d.items()}


def main():
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    tk, cb = tokyo(), chiba()
    areas, missing = {}, []
    for a in loc["areas"]:
        pid, pref, ja = a["id"], a["pref"], a["nameJa"]
        pop = a["demographics"]["pop2025"]
        tot = vio = bur = None
        if pref == "Tokyo":
            t, k1, k2, b1, b2 = tk[ja]
            tot, vio, bur = t, k1 + k2, b1 + b2
        elif pref == "Kanagawa":
            t, k1, k2, b1, b2 = KANAGAWA[pid]
            tot, vio, bur = t, k1 + k2, b1 + b2
        elif pref == "Saitama":
            t, b1, b2 = SAITAMA[pid]
            tot, bur = t, b1 + b2
        elif pref == "Chiba":
            key = ja.replace("千葉市", "").replace("ヶ", "ケ")
            t, k1, k2, b1, b2 = cb[key]
            tot, vio, bur = t, k1 + k2, b1 + b2
        elif pref == "Ibaraki":
            tot = IBARAKI_TOTAL.get(pid)
        if tot is None:
            missing.append(ja)
        r1 = lambda n, per: None if n is None else round(n / pop * per, 2)
        areas[pid] = {
            "total": tot, "totalPer1k": r1(tot, 1000),
            "burglary": bur, "burglaryPer10k": r1(bur, 10000),
            "violent": vio, "violentPer10k": r1(vio, 10000),
            "safetyIndex": safety(r1(bur, 10000), r1(vio, 10000)),
            "year": 2025, "provisional": pref == "Ibaraki" or None,
            "src": SRC[pref][1],
        }
        areas[pid] = {k: v for k, v in areas[pid].items() if v is not None or k in ("total", "burglary", "violent",
                      "totalPer1k", "burglaryPer10k", "violentPer10k", "safetyIndex")}
    out = {"generated": date.today().isoformat(),
           "source": "Official police 刑法犯認知件数 2025 (令和7年) per municipality: "
                     + "; ".join(f"{p}: {n}" for p, (n, _) in SRC.items())
                     + ". Rates use pop2025. Info only — not scored.",
           "sources": {p: {"name": n, "url": u} for p, (n, u) in SRC.items()},
           "areas": areas}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{OUT}: {len(areas)} areas; no data: {', '.join(missing) or '-'}")
    for pid, v in sorted(areas.items(), key=lambda kv: (kv[1]["safetyIndex"] if kv[1]["safetyIndex"] is not None else 999)):
        print(f'{pid:20s} tot/1k {v["totalPer1k"]!s:>6}  burg/10k {v["burglaryPer10k"]!s:>5}  viol/10k {v["violentPer10k"]!s:>5}  index {v["safetyIndex"]}')


if __name__ == "__main__":
    main()
