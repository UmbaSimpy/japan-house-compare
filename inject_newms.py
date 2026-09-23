#!/usr/bin/env python3
"""
Reads newms.json (scraper_newms.py), builds one item per developer project and
one per building of never-occupied units (新築未入居), scores them and embeds
`const newMansions = [...]` into suumo-compare.html.

New condos often lack a single price (ranges, 予定, 未定) or fees, so every part
of the score works with what is known and falls back to a neutral value.

SCORING (100 pts)
  VALUE     25  New-build premium: median ¥/m² of the priced unit types vs the
                median ¥/m² of used condos ≤15 years old near the same station
                (≥5 samples, else the same area). 0% → 20, +10% → 15, +20% → 11,
                +43% → 0, −10% → 25. Unknown → 12.
  ACCESS    20  Door-to-station minutes (same scale as used condos).
  CERTAINTY 15  Prices announced (all 6 / some 3 / none 0) · fees announced 3 ·
                move-in: now 6, ≤6 mo 5, ≤12 4, ≤18 3, ≤24 2, later 1.
  RUNNING   15  Monthly fees per m², counting the repair fund at no less than
                ¥250/m² (new buildings start low and step up to guideline
                levels). ≤¥300/m² → 15, ≥¥600/m² → 0. Unknown → 7.
  SPACE     10  Largest unit type: 50 m² → 0, 100 m² → 10.
  PROJECT   15  Major-7 developer +3 · ≥300 units +2 / ≥100 +1 · parking for
                ≥50% of units +2 / ≥30% +1 · seismic isolation (免震) +2 ·
                ZEH / energy label +2 · tower (≥20F) +1 · leasehold −3 ·
                liquefaction high −2 / somewhat high −1. Kept within 0–15.

DEMAND SIGNALS (informational, newms_track.json)
  Sell-through  units still listed per day → sold since tracking began, last
                7 days, pace per week, estimated weeks to sell out.
  Phases        prices per unit type recorded per sales phase (第N期M次 /
                最終期 / 先着順); when a new phase is priced, the change vs the
                previous phase is computed on matching unit types.
"""

import json
import re
import statistics as st
from collections import Counter
from datetime import date
from pathlib import Path

import hazard
from inject_mansion import clean_name, bldg_keys, AREAS, AREA_JA, AREA_GROUP, LIQ_PENALTY

SRC   = Path("newms.json")
CLEAN = Path("newms_clean.json")
USED  = Path("mansions_clean.json")
HTML  = Path("suumo-compare.html")

MAJOR7 = ["住友不動産", "大京", "東急不動産", "東京建物", "野村不動産", "三井不動産レジデンシャル", "三菱地所レジデンス"]
REPAIR_FLOOR_PER_M2 = 250      # ¥/m²·month the repair fund realistically rises to (MLIT guideline range)


def parse_access(text):
    """First station in a 交通 string → (line, station, walk, bus)."""
    t = text or ""
    m = re.search(r"([^\s「」()（）]+?)\s*「([^」]+)」\s*駅?\s*(?:徒)?歩\s*(\d+)\s*分", t)
    if m:
        return m.group(1).lstrip("(0123456789)"), m.group(2), int(m.group(3)), False
    b = re.search(r"「([^」]+)」.*?バス\s*(\d+)\s*分.*?歩\s*(\d+)\s*分", t)
    if b:
        return "", b.group(1), int(b.group(2)) + int(b.group(3)) + 5, True
    return "", "", 99, False


def mid(pair):
    lo, hi = pair if pair else (None, None)
    return None if lo is None else (lo + (hi if hi is not None else lo)) / 2


def months_until(ym, today):
    y, m = ym
    if y == "now":
        return 0
    if not y:
        return None
    return max(0, (y - today.year) * 12 + (m or 6) - today.month)


def benchmarks(used):
    by_station, by_group = {}, {}
    for d in used:
        if (d["age"] if d["age"] is not None else 99) <= 15:
            by_station.setdefault((d["areaKey"], d["station"]), []).append(d["ppm"])
            by_group.setdefault(d["group"], []).append(d["ppm"])
    return by_station, by_group


def build_items(raw, today):
    # ── projects: one item each ──
    items = []
    for r in (x for x in raw if x["kind"] == "project"):
        line, station, walk, bus = parse_access(r.get("access"))
        types = r.get("types") or []
        items.append({
            "key": r["ncId"], "kind": "project", "ncIds": [r["ncId"]],
            "name": r["name"], "areaKey": r["areaKey"], "address": r["address"],
            "line": line, "station": station, "walk": walk, "bus": bus,
            "url": r["url"], "image": r["image"], "cardText": r["cardText"],
            "totalUnits": r["totalUnits"], "unitsOnSale": r["unitsOnSale"],
            "bldgFloors": r["bldgFloors"], "structure": r["structure"],
            "priceMin": r["priceMin"], "priceMax": r["priceMax"], "priceBand": r["priceBand"],
            "schedule": r["schedule"],
            "completion": r["completion"], "completed": r["completed"],
            "delivery": r["delivery"], "deliveryText": r["deliveryText"],
            "mgmtFee": r["mgmtFee"], "repairFund": r["repairFund"],
            "repairUpfront": r["repairUpfront"], "mgmtUpfront": r["mgmtUpfront"], "otherFees": r["otherFees"],
            "areaRange": r["areaRange"], "layoutRange": r["layoutRange"],
            "parkingSpaces": r["parkingSpaces"], "parkingFee": r["parkingFee"],
            "mgmtType": r["mgmtType"], "landRights": r["landRights"], "energy": r["energy"],
            "developers": r["developers"], "types": types,
            "firstSeen": r["firstSeen"], "seeded": r["seeded"],
            "history": [[h[0], h[1], h[2]] for h in r["history"]],
        })

    # ── never-occupied units: one item per building ──
    # Agents title these freely ("【手数料ゼロ】…タワー 西 29階") and even disagree on the
    # unit count, so group on address + building height, falling back to the cleaned name.
    units = [x for x in raw if x["kind"] == "unit"]
    keys = bldg_keys({u["name"] for u in units})
    groups = {}
    for u in units:
        addr = re.search(r"所在地\s*(\D+\d+)", u["cardText"] or "")      # to the 丁目 ("若葉3-1-13" → "若葉3")
        ident = f'b:{addr.group(1)}:{u["bldgFloors"]}' if addr and u.get("bldgFloors") else keys[u["name"]]
        groups.setdefault(f'{u["areaKey"]}:{ident}', []).append(u)
    for bkey, us in groups.items():
        dedup = {}
        for u in sorted(us, key=lambda u: u["firstSeen"]):
            dedup.setdefault((u["floor"], u["areaM2"], u["price"]), u)
        us = sorted(dedup.values(), key=lambda u: (u["price"] or 0))
        first = us[0]
        addr = re.search(r"所在地\s*(\S+)", first["cardText"] or "")     # unit pages carry it only on the card
        acc = (first.get("access") or [""])[0]
        line, station, walk, bus = parse_access(acc)
        prices = [u["price"] for u in us if u["price"]]
        fee = lambda k: (min(u[k] for u in us if u.get(k)), max(u[k] for u in us if u.get(k))) \
            if any(u.get(k) for u in us) else (None, None)
        built = next((u.get("builtYear") for u in us if u.get("builtYear")), None) or next(
            (int(m.group(1)) for u in us for m in [re.search(r"(\d{4})年\d{1,2}月(?:築|完成|竣工)", u["cardText"] or "")] if m), None)
        items.append({
            "key": bkey, "kind": "unsold", "ncIds": [u["ncId"] for u in us],
            "name": Counter(clean_name(u["name"]) or u["name"] for u in us).most_common(1)[0][0],
            "areaKey": first["areaKey"],
            "address": addr.group(1) if addr else "",
            "line": line, "station": station, "walk": walk, "bus": bus,
            "url": first["url"], "image": next((u["image"] for u in us if u["image"]), None),
            "cardText": " ".join(u["cardText"] or "" for u in us),       # every agent's blurb (免震, ZEH…)
            "totalUnits": first.get("totalUnits"), "unitsOnSale": len(us),
            "bldgFloors": first.get("bldgFloors"), "structure": first.get("structure"),
            "priceMin": min(prices) if prices else None, "priceMax": max(prices) if prices else None, "priceBand": None,
            "schedule": None, "completion": [built, None], "completed": True,
            "delivery": ["now", None], "deliveryText": None,
            "mgmtFee": fee("mgmtFee"), "repairFund": fee("repairFund"),
            "repairUpfront": (None, None), "mgmtUpfront": (None, None), "otherFees": None,
            "areaRange": (min(u["areaM2"] for u in us), max(u["areaM2"] for u in us)),
            "layoutRange": None,
            "parkingSpaces": None, "parkingFee": fee("parkingFee"),
            "mgmtType": None, "landRights": first.get("landRights", "owned"), "energy": None, "developers": [],
            "types": [{"name": f'{u["floor"]}F' if u["floor"] else "?", "layout": u["layout"] or "?", "m2": u["areaM2"],
                       "priceText": None, "priceMin": u["price"], "priceMax": u["price"], "firstCome": False,
                       "rooms": [{"no": None, "floor": u["floor"], "price": u["price"]}], "roomCount": 1,
                       "corner": "角" in (u["cardText"] or ""), "facing": u.get("facing"), "url": u["url"]} for u in us],
            "firstSeen": min(u["firstSeen"] for u in us), "seeded": all(u["seeded"] for u in us),
            "history": [],
        })
    return items


TRACK = Path("newms_track.json")    # per item: stock snapshots + prices per sales phase (committed)
PHASE_RE = re.compile(r"第(\d+)期(?:(\d+)次)?|最終期")


def detect_phase(it):
    """Current sales phase from the schedule / unit price texts: ('1-2', '第1期2次'), ('fc', '先着順')…"""
    texts = [it.get("schedule") or ""] + [t.get("priceText") or "" for t in it["types"]]
    found = []
    for s in texts:
        for m in PHASE_RE.finditer(s):
            found.append((999, 0, "final", "最終期") if m.group(0) == "最終期" else
                         (int(m.group(1)), int(m.group(2) or 0), f"{m.group(1)}-{m.group(2) or 0}", m.group(0)))
    if found:
        return max(found)[2:]
    if any("先着順" in s for s in texts):
        return "fc", "先着順"
    return None, None


def track(items, today):
    """Record stock (units still listed) and per-phase unit prices; derive sell-through and
    phase-to-phase price change. One snapshot per day; history only grows when values change."""
    data = json.loads(TRACK.read_text(encoding="utf-8")) if TRACK.exists() else {}
    iso = today.isoformat()
    for it in items:
        rec = data.setdefault(it["key"], {"stock": [], "phases": {}})
        rooms = [t["roomCount"] for t in it["types"] if t.get("roomCount")]
        remaining = it["unitsOnSale"] if it["unitsOnSale"] is not None else (sum(rooms) if rooms else None)
        snap = [remaining, len(it["types"])]
        stock = rec["stock"]
        if stock and stock[-1][0] == iso:
            stock[-1] = [iso, *snap]                 # re-run on the same day: keep the latest
        elif not stock or stock[-1][1:] != snap:
            stock.append([iso, *snap])

        key, label = detect_phase(it)
        if key:
            ph = rec["phases"].setdefault(key, {"label": label, "first": iso, "typePrices": {}, "ppm": None})
            ph["last"] = iso
            for t in it["types"]:
                if t["priceMin"] and t["m2"]:
                    ph["typePrices"].setdefault(t["name"], round(mid((t["priceMin"], t["priceMax"])) / t["m2"], 2))
            if ph["ppm"] is None and ph["typePrices"]:
                ph["ppm"] = round(st.median(ph["typePrices"].values()), 1)

        # ── derived: sell-through ──
        known = [(date.fromisoformat(d), r) for d, r, _ in stock if r is not None]
        it["stockNow"] = remaining
        it["typesListed"] = len(it["types"])
        it["trackSince"] = stock[0][0]
        it["sold"] = it["soldWeek"] = it["pacePerWeek"] = it["sellOutWeeks"] = None
        if len(known) >= 2 and remaining is not None:
            first_d, first_r = known[0]
            days = (today - first_d).days
            it["sold"] = max(0, first_r - remaining)
            week_ago = [r for d, r in known if (today - d).days >= 7]
            it["soldWeek"] = max(0, (week_ago[-1] if week_ago else first_r) - remaining)
            if days >= 3:
                it["pacePerWeek"] = round(it["sold"] / days * 7, 1)
                it["sellOutWeeks"] = round(remaining / it["pacePerWeek"]) if it["pacePerWeek"] else None

        # ── derived: phase-to-phase price change (like-for-like unit types first) ──
        order = sorted(rec["phases"].items(), key=lambda kv: kv[1]["first"])
        it["phase"] = label
        it["phases"] = [{"label": p["label"], "first": p["first"], "ppm": p["ppm"]} for _, p in order]
        it["phaseChange"] = it["phaseMatched"] = None
        priced = [p for _, p in order if p["typePrices"]]
        if len(priced) >= 2:
            prev, cur = priced[-2], priced[-1]
            common = [n for n in cur["typePrices"] if n in prev["typePrices"]]
            if len(common) >= 2:
                it["phaseChange"] = round(st.mean(cur["typePrices"][n] / prev["typePrices"][n] - 1 for n in common) * 100, 1)
                it["phaseMatched"] = len(common)
            elif prev["ppm"] and cur["ppm"]:
                it["phaseChange"] = round((cur["ppm"] / prev["ppm"] - 1) * 100, 1)
            it["phasePrev"] = prev["label"]

    live = {it["key"] for it in items}
    TRACK.write_text(json.dumps({k: v for k, v in data.items() if k in live}, ensure_ascii=False, indent=1),
                     encoding="utf-8")


def enrich(items, used, today):
    by_station, by_group = benchmarks(used)
    for it in items:
        it["group"] = AREA_GROUP.get(it["areaKey"])
        it["area"] = next(a["name"] for a in AREAS if a["key"] == it["areaKey"])
        it["areaJa"] = AREA_JA.get(it["areaKey"])

        # ¥/m² from priced unit types (midpoint of a type's range)
        ppms = [mid((t["priceMin"], t["priceMax"])) / t["m2"] for t in it["types"] if t["priceMin"] and t["m2"]]
        approx = False
        if not ppms and it["priceMin"] and it["areaRange"][0]:
            ppms, approx = [mid((it["priceMin"], it["priceMax"])) / mid(it["areaRange"])], True
        it["ppm"] = round(st.median(ppms), 1) if ppms else None
        it["ppmApprox"] = approx
        priced = sum(1 for t in it["types"] if t["priceMin"])
        it["priceStatus"] = ("set" if it["priceMin"] and (not it["types"] or priced == len(it["types"]))
                             else "partial" if it["priceMin"] or priced else "tbd")

        # benchmark: recent used condos near the same station, else the whole area
        near = by_station.get((it["areaKey"], it["station"]), [])
        pool, scope = (near, "station") if len(near) >= 5 else (by_group.get(it["group"], []), "area")
        it["bench"] = {"ppm": round(st.median(pool), 1) if pool else None, "n": len(pool), "scope": scope}
        it["premium"] = (round((it["ppm"] / it["bench"]["ppm"] - 1) * 100)
                         if it["ppm"] and it["bench"]["ppm"] else None)

        area_mid = mid(it["areaRange"])
        mg, rp = mid(it["mgmtFee"]), mid(it["repairFund"])
        it["feesKnown"] = mg is not None
        it["fees"] = round(mg + (rp or 0)) if mg is not None else None
        it["repairPerM2"] = round(rp / area_mid) if rp and area_mid else None
        it["feesPerM2Eff"] = (round(mg / area_mid + max(it["repairPerM2"] or 0, REPAIR_FLOOR_PER_M2))
                              if mg is not None and area_mid else None)
        up = [x for x in (mid(it["repairUpfront"]), mid(it["mgmtUpfront"])) if x]
        it["upfront"] = round(sum(up)) if up else None
        it["monthsToMove"] = months_until(it["delivery"], today)
        it["parkingRatio"] = (round(it["parkingSpaces"] / it["totalUnits"], 2)
                              if it["parkingSpaces"] and it["totalUnits"] else None)
        it["major"] = [d for d in it["developers"] if any(m in d for m in MAJOR7)]
        blob = (it["cardText"] or "") + " " + (it["energy"] or "")
        it["seismicIso"] = "免震" in blob
        it["zeh"] = bool(re.search(r"ZEH|省エネ|断熱等級[67]", blob))
        it["maxM2"] = max([t["m2"] for t in it["types"] if t["m2"]] + [it["areaRange"][1] or 0])
        first_min = next((h[1] for h in it["history"] if h[1]), None)
        it["priceChange"] = (it["priceMin"] - first_min) if it["priceMin"] and first_min else 0
        it["priceAnnounced"] = (len(it["history"]) >= 2 and it["history"][-2][1] is None and it["history"][-1][1] is not None)
        it["daysListed"] = None if it["seeded"] else (today - date.fromisoformat(it["firstSeen"])).days


def score(it):
    extras = []
    prem = it["premium"]
    value = 12 if prem is None else max(0, min(25, round(20 - 0.47 * prem)))
    w = it["walk"]
    access = 20 if w <= 5 else 16 if w <= 10 else 12 if w <= 15 else 8 if w <= 20 else 4 if w <= 30 else 0
    m = it["monthsToMove"]
    move = 6 if m == 0 else 5 if m is not None and m <= 6 else 4 if m is not None and m <= 12 else \
        3 if m is not None and m <= 18 else 2 if m is not None and m <= 24 else 1
    certainty = min(15, {"set": 6, "partial": 3, "tbd": 0}[it["priceStatus"]] + (3 if it["feesKnown"] else 0) + move)
    f = it["feesPerM2Eff"]
    running = 7 if f is None else max(0, min(15, round(15 * (600 - f) / 300)))
    space = max(0, min(10, round((it["maxM2"] - 50) / 5)))
    if it["major"]:
        extras.append(["major", ", ".join(it["major"]), 3])
    if (it["totalUnits"] or 0) >= 100:
        extras.append(["units", it["totalUnits"], 2 if it["totalUnits"] >= 300 else 1])
    if it["parkingRatio"] is not None and it["parkingRatio"] >= 0.3:
        extras.append(["parkingRatio", round(it["parkingRatio"] * 100), 2 if it["parkingRatio"] >= 0.5 else 1])
    if it["seismicIso"]:
        extras.append(["seismicIso", None, 2])
    if it["zeh"]:
        extras.append(["zeh", None, 2])
    if (it["bldgFloors"] or 0) >= 20:
        extras.append(["tower", it["bldgFloors"], 1])
    if it["landRights"] == "leased":
        extras.append(["leased", None, -3])
    liq = it.get("liq")
    if liq and liq["level"] in LIQ_PENALTY:
        extras.append(["liq", liq["level"], -LIQ_PENALTY[liq["level"]]])
    project = max(0, min(15, sum(p for *_, p in extras)))
    it["scores"] = {"value": value, "access": access, "certainty": certainty, "running": running,
                    "space": space, "project": project,
                    "total": value + access + certainty + running + space + project}
    it["why"] = {"move": move, "extras": extras}


def main():
    if not SRC.exists():
        print(f"{SRC} missing — keeping previously embedded new-condo data")
        return
    today = date.today()
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    used = json.loads(USED.read_text(encoding="utf-8")) if USED.exists() else []
    items = build_items(raw, today)
    hazard.annotate(items, AREAS, lambda d: d["areaKey"])
    enrich(items, used, today)
    track(items, today)
    for it in items:
        score(it)
        it.pop("cardText", None)
        it["image"] = it["image"] and re.sub(r"&w=\d+&h=\d+", "&w=640&h=480", it["image"].replace("&amp;", "&"))
    items.sort(key=lambda it: -it["scores"]["total"])
    CLEAN.write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")

    html = HTML.read_text(encoding="utf-8")
    html = re.sub(r"const newMansions = \[[\s\S]*?\];\n",
                  lambda _: f"const newMansions = {json.dumps(items, ensure_ascii=False)};\n", html, count=1)
    if f"const newMansions = {json.dumps(items, ensure_ascii=False)};" not in html:
        raise SystemExit("injection failed for const newMansions")
    HTML.write_text(html, encoding="utf-8")
    print(f"Injected {len(items)} new-condo items into {HTML}")
    for it in items:
        print(f"  {it['scores']['total']:>3}  {it['kind']:7} {it['name'][:26]:26} "
              f"{it['priceMin']}–{it['priceMax']}万 {it['ppm']}万/m² prem {it['premium']}% "
              f"status {it['priceStatus']} move {it['monthsToMove']}mo {it['scores']}")


if __name__ == "__main__":
    main()
