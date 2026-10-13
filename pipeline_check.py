"""Monthly pipeline sweep helper for data/pipeline.json (growth adjustment, track B).

Prints a markdown checklist so the monthly search is the same every time and nothing is skipped:
  1. register rows to re-check (every row, oldest 'checked' first) + rows whose 'date' or 'until' is due
  2. watch-list items (promote to a register row when they reach a scoring status)
  3. new-condo project names from AREA_STATS that were not seen at the previous sweep
     (seen list: data/pipeline_seen.json; --mark saves the current names after the sweep)
  4. fixed sources to read
  5. the per-area query loop (all study areas, two queries each) with areas that have no row first
The search itself is done by hand / by Claude with web search; the method is in the project memory
(project_japan_house_compare.md, "Monthly pipeline sweep") and data/DATA_LOG.md item 13.

Run:  python pipeline_check.py            → checklist on stdout
      python pipeline_check.py --mark     → also record today's condo project names as seen
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

REG = Path("data/pipeline.json")
SEEN = Path("data/pipeline_seen.json")
LOC = Path("data/locations.json")
STATS = Path("area-stats.js")

SOURCES = [
    ("Rail — MLIT 鉄道局 press releases (licences, 事業認可)", "https://www.mlit.go.jp/report/press/tetsudo.html"),
    ("Rail — 東京都 都市整備局 鉄道新線・延伸", "https://www.toshiseibi.metro.tokyo.lg.jp/kiban/tetsudo"),
    ("Rail — operator press: JR東日本, 東京メトロ, 都営, 東武, 京成, 京王, 小田急, 東急, 相鉄, 京急, TX(首都圏新都市鉄道), "
     "東葉高速, 北総, 埼玉高速, 横浜市交通局, 多摩モノレール, 新京成→京成松戸線", ""),
    ("Rail — tabiris 新線・延伸まとめ (catch-all)", "https://tabiris.com/"),
    ("Rail — 乗りものニュース / 鉄道コム news", "https://trafficnews.jp/category/train"),
    ("Redevelopment — 東京都 市街地再開発事業 一覧", "https://www.toshiseibi.metro.tokyo.lg.jp/machizukuri/saikaihatsu"),
    ("Redevelopment — 横浜市 市街地再開発事業 一覧", "https://www.city.yokohama.lg.jp/kurashi/machizukuri-kankyo/toshiseibi/saikaihatsu/"),
    ("Redevelopment — 川崎市 / さいたま市 / 千葉市 再開発ページ", ""),
    ("Redevelopment — 千葉県 / 埼玉県 / 神奈川県 都市計画審議会 議案 (都市計画決定)", ""),
    ("Redevelopment — 千葉県・埼玉県 市街地再開発組合 設立認可 press", ""),
    ("Redevelopment — 健美家 首都圏 再開発ニュース", "https://www.kenbiya.com/ar/ns/region/shutoken/"),
    ("Roads — 関東地方整備局 press (北千葉道路, 外環, 圏央道)", "https://www.ktr.mlit.go.jp/"),
]


def load_js(p):
    s = p.read_text(encoding="utf-8")
    return json.loads(s[s.index("{"):s.rstrip().rstrip(";").rindex("}") + 1])


def main():
    mark = "--mark" in sys.argv
    reg = json.loads(REG.read_text(encoding="utf-8"))
    loc = json.loads(LOC.read_text(encoding="utf-8"))
    names = {a["id"]: a["nameJa"] for a in loc["areas"]}
    today = date.today().isoformat()
    ym, year = today[:7], today[:4]
    out = [f"# Pipeline sweep {today}", ""]

    # 1. register rows
    rows = sorted(reg["projects"], key=lambda p: p.get("checked", ""))
    out += [f"## 1. Register rows ({len(rows)}) — re-check status, date, source; set 'checked' to {today}", ""]
    for p in rows:
        flags = []
        if p.get("until") and p["until"] < ym:
            flags.append(f"AGED OUT since {p['until']} — delete or keep for history")
        elif p.get("until") and p["until"][:4] <= year:
            flags.append(f"ages out {p['until']}")
        yrs = [int(y) for y in re.findall(r"(20\d\d)", str(p.get("date", "")))]
        if yrs and max(yrs) < int(year) and p["status"] not in ("open", "completed"):
            flags.append(f"all dates ({max(yrs)}) passed — opened/completed? delayed?")
        areas = ", ".join(f"{a} {v:+d}" for a, v in p["pts"].items())
        out.append(f"- [ ] **{p.get('nameJa') or p['name']}** ({p['kind']}, {p['status']}, {p.get('date', '?')}) "
                   f"checked {p.get('checked', 'never')} — {areas}" + (f"  ⚠ {'; '.join(flags)}" if flags else ""))
    out.append("")

    # 2. watch list
    out += ["## 2. Watch list — promote to a register row once it reaches a scoring status (rubric)", ""]
    for w in reg.get("watch", []):
        out.append(f"- [ ] {w['name']} — {w.get('why', '')} ({', '.join(w.get('areas', []))})")
    out.append("")

    # 3. new condo projects
    seen = json.loads(SEEN.read_text(encoding="utf-8")) if SEEN.exists() else {}
    now = {}
    if STATS.exists():
        st = load_js(STATS)
        now = {aid: sorted(set(v.get("projectNames") or [])) for aid, v in st["areas"].items()}
    out += ["## 3. New-condo projects not seen at the last sweep (SUUMO 新築, from AREA_STATS) — "
            "≥300 homes or a station-front tower → look up and score as redevelopment", ""]
    new = {aid: [n for n in v if n not in seen.get(aid, [])] for aid, v in now.items()}
    new = {k: v for k, v in new.items() if v}
    if not seen:
        out.append("- (first run: no previous list — every current project is listed; run with --mark afterwards)")
    for aid, v in sorted(new.items()):
        out.append(f"- [ ] {names.get(aid, aid)}: {' / '.join(v)}")
    if seen and not new:
        out.append("- none")
    out.append("")

    # 4. fixed sources
    out += ["## 4. Fixed sources (read every month, look for anything touching a study area)", ""]
    out += [f"- [ ] {n}" + (f" — {u}" if u else "") for n, u in SOURCES]
    out.append("")

    # 5. per-area query loop
    covered = {a for p in reg["projects"] for a in p["pts"]} | {a for w in reg.get("watch", []) for a in w.get("areas", [])}
    order = sorted(names, key=lambda a: (a in covered, a))
    out += [f"## 5. Per-area search ({len(order)} areas; areas with no register/watch row first)", ""]
    for aid in order:
        ja = names[aid]
        tag = "" if aid in covered else " **(no row yet)**"
        out.append(f"- [ ] {ja}{tag}: 「{ja} 再開発 {year}」 · 「{ja} 新駅 OR 延伸 OR 都市計画決定」")
    out.append("")
    out.append("After the sweep: edit data/pipeline.json (rubric!), set top-level 'checked', run "
               "research_notes/…/scripts/build_locations.py then build_map.py, compare shortlist/watchlist, "
               "log in data/DATA_LOG.md item 13, and run `python pipeline_check.py --mark`.")
    sys.stdout.reconfigure(encoding="utf-8")
    print("\n".join(out))

    if mark:
        SEEN.write_text(json.dumps(now, ensure_ascii=False, indent=1) + "\n",
                        encoding="utf-8")
        print(f"\n(marked {sum(map(len, now.values()))} project names as seen → {SEEN})", file=sys.stderr)


if __name__ == "__main__":
    main()
