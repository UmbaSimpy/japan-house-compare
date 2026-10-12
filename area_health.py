"""Paediatric care access per study area  →  data/area_health.json

Track B (manual refresh — run only when the user asks). Method + checks: data/DATA_LOG.md (item 6a).

Source: 国土数値情報 医療機関データ P04 (2020, latest edition; CC BY 4.0), prefectures 08/11/12/13/14:
  P04_001 = 1 病院 / 2 診療所 / 3 歯科診療所; P04_004–006 = 診療科目 (free text).
  The 診療科目 field is space-separated and abbreviated (内 = 内科, 小 = 小児科, 小外 = 小児外科 …).
  A facility "offers paediatrics" when a token is in GENERAL_PEDS (小児科 / 小 / 小児 / 小児内科 / 漢方小児科)
  or starts with 「小児科」 (e.g. 小児科（新生児）); surgical/dental/eye/skin/ENT tokens
  (小外, 小児外科, 小歯, 小児眼科, 小児皮膚科 …) alone do not count. Separators: full-width space, 、, ．
  "Dedicated" (proxy for a 小児科 clinic, as opposed to an internal-medicine GP that also sees children)
  = offers paediatrics AND (the facility name contains 小児/こども/子ども/子供/キッズ/チャイルド and not 内科,
  OR the first listed department is paediatrics). Department order alone is not enough: Chiba lists
  departments in a fixed order (内 first), e.g. 「くやま小児科医院 | ア 小」.
Children: 2020 census 500 m mesh, ages 0–14 (same cells / assignment as area_hazard.py).

Per area:
  peds          facilities offering 小児科 inside the municipality (hospitals + clinics)
  pedsDedicated of which dedicated paediatric clinics (see above)
  per10k        peds per 10,000 children aged 0–14 living in the area
  kidsNear1km   % of children (mesh-weighted) whose cell centre is ≤1 km from any 小児科 facility
                (facilities in neighbouring municipalities count — people cross borders)
  kidsNearDedicated1km  same, for dedicated paediatric facilities
Run: python area_health.py
"""
import json
import re
import math
import time
import zipfile
from collections import defaultdict
from pathlib import Path

import area_hazard as AH   # mesh cells, mesh_box, in_rings, boundaries handling

P04 = Path("data/cache/p04")
PREFS = ["08", "11", "12", "13", "14"]
# spellings of general paediatrics found in the 2020 data (token census in DATA_LOG item 6a);
# each municipality abbreviates differently (e.g. Nerima/Itabashi write 「小児」, Chiba 「小」)
GENERAL_PEDS = {"小児科", "小", "小児", "小児内科", "漢方小児科"}
KIDS_NAME = re.compile("小児|こども|子ども|子供|キッズ|チャイルド|ｷｯｽﾞ")


def facilities():
    out = []
    for p in PREFS:
        z = zipfile.ZipFile(P04 / f"P04-20_{p}.zip")
        name = next(n for n in z.namelist() if n.endswith(".geojson"))
        for f in json.loads(z.read(name).decode("utf-8"))["features"]:
            pr = f["properties"]
            if str(pr.get("P04_001")) not in ("1", "2"):
                continue
            subj = " ".join(str(pr.get(k) or "") for k in ("P04_004", "P04_005", "P04_006"))
            depts = [d for d in subj.replace("　", " ").replace("、", " ").replace("．", " ").split() if d]
            peds = [d in GENERAL_PEDS or d.startswith("小児科") for d in depts]
            if not any(peds):
                continue
            lon, lat = f["geometry"]["coordinates"][:2]
            nm = str(pr.get("P04_002") or "")
            dedicated = peds[0] or (bool(KIDS_NAME.search(nm)) and "内科" not in nm)
            out.append((lat, lon, str(pr["P04_001"]), dedicated, nm))
    return out


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def main():
    fac = facilities()
    print("paediatric facilities in 5 prefectures:", len(fac), "(dedicated:", sum(f[3] for f in fac), ")")
    grid = defaultdict(list)                      # ~1.1 km buckets for nearest-search
    for f in fac:
        grid[(int(f[0] * 90), int(f[1] * 90))].append(f)

    bnd = json.load(open("data/boundaries.json", encoding="utf-8"))
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    names = {a["nameJa"]: a["id"] for a in loc["areas"]}
    polys = []
    for f in bnd["features"]:
        if f["name"] in names:
            pts = [c for poly in f["poly"] for c in poly[0]]
            polys.append((names[f["name"]], f["poly"], (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts))))

    def area_of(lat, lon):
        for aid, poly, (x0, y0, x1, y1) in polys:
            if x0 <= lon <= x1 and y0 <= lat <= y1 and any(AH.in_rings(lon, lat, p) for p in poly):
                return aid
        return None

    count = defaultdict(lambda: [0, 0, 0])        # peds, pedsDedicated, hospitals
    for f in fac:
        aid = area_of(f[0], f[1])
        if aid:
            c = count[aid]; c[0] += 1; c[1] += f[3]; c[2] += f[2] == "1"

    kids = defaultdict(int); near = defaultdict(float); nearF = defaultdict(float)
    for k, pop, kc in AH.mesh_cells():
        s, w, n, e = AH.mesh_box(k); c = ((s + n) / 2, (w + e) / 2)
        aid = area_of(*c)
        if not aid or not kc:
            continue
        kids[aid] += kc
        gy, gx = int(c[0] * 90), int(c[1] * 90)
        cand = [f for dy in (-1, 0, 1) for dx in (-1, 0, 1) for f in grid.get((gy + dy, gx + dx), [])]
        d_any = min((km(c, f) for f in cand), default=9)
        d_first = min((km(c, f) for f in cand if f[3]), default=9)
        near[aid] += kc * (d_any <= 1.0); nearF[aid] += kc * (d_first <= 1.0)

    out = {}
    for a in loc["areas"]:
        aid = a["id"]; c = count[aid]; kd = kids[aid]
        out[aid] = {"peds": c[0], "pedsDedicated": c[1], "pedsHospitals": c[2], "kids2020": kd,
                    "per10k": round(c[0] / kd * 1e4, 1) if kd else None,
                    "dedicatedPer10k": round(c[1] / kd * 1e4, 1) if kd else None,
                    "kidsNear1km": round(near[aid] / kd * 100, 1) if kd else None,
                    "kidsNearDedicated1km": round(nearF[aid] / kd * 100, 1) if kd else None}
        print(f"{aid:22} {out[aid]}")
    json.dump({"generated": time.strftime("%Y-%m-%d"), "source": "国土数値情報 医療機関データ P04 (2020), CC BY 4.0; 2020 census 500 m mesh (0–14)",
               "method": __doc__.strip(), "areas": out}, open("data/area_health.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("wrote data/area_health.json")


if __name__ == "__main__":
    main()
