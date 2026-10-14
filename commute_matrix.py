"""Commute matrix: each study area's home station → a list of office hubs  →  data/commute_matrix.json

Track B (manual refresh — run only when the user asks). Method + checks: data/DATA_LOG.md (item 5).

Same method as the location study's Tokyo/Otemachi figures (research_notes/.../rail_commute.md):
Yahoo!乗換案内, weekday (Wed) arrive-by 08:45, IC fare, no paid expresses, normal walking speed;
of the routes Yahoo returns the fastest (min total time, then fewer transfers) is kept.
Values: total minutes (departure → arrival incl. transfers), transfers, 1-month 通勤定期 (¥).
Each answer is validated: first/last station names of the route must match the query.

Run:  python commute_matrix.py                 (≈2 s per query, resumes from the JSON cache)
      python commute_matrix.py --check         (only re-query 東京/大手町 and compare with locations.json)
"""
import json, re, sys, time, unicodedata
from pathlib import Path
from urllib.parse import urlencode

import requests

DATE = dict(y=2026, m=10, d=14)          # a Wednesday; keep in sync with rail_commute.md
OUT = Path("data/commute_matrix.json")
CACHE = Path("data/cache/commute_raw.json")

# Office hubs offered in the map's "Your office" picker: (id, Yahoo query name, EN label, JA label, district)
OFFICES = [
    ("tokyo", "東京", "Tokyo Stn", "東京", "Marunouchi"),
    ("otemachi", "大手町(東京都)", "Otemachi", "大手町", "Marunouchi"),
    ("nihombashi", "日本橋(東京都)", "Nihombashi", "日本橋", "Nihombashi"),
    ("kanda", "神田(東京都)", "Kanda", "神田", "Kanda"),
    ("akihabara", "秋葉原", "Akihabara", "秋葉原", "Kanda"),
    ("jimbocho", "神保町", "Jimbocho", "神保町", "Kanda"),
    ("ginza", "銀座", "Ginza", "銀座", "Ginza"),
    ("yurakucho", "有楽町", "Yurakucho", "有楽町", "Ginza"),
    ("shimbashi", "新橋", "Shimbashi", "新橋", "Shimbashi"),
    ("shiodome", "汐留", "Shiodome", "汐留", "Shimbashi"),
    ("kasumigaseki", "霞ケ関(東京都)", "Kasumigaseki", "霞ケ関", "Toranomon"),
    ("toranomon", "虎ノ門ヒルズ", "Toranomon Hills", "虎ノ門ヒルズ", "Toranomon"),
    ("roppongi", "六本木一丁目", "Roppongi-itchome", "六本木一丁目", "Roppongi"),
    ("hamamatsucho", "浜松町", "Hamamatsucho", "浜松町", "Shiba"),
    ("tamachi", "田町(東京都)", "Tamachi", "田町", "Shiba"),
    ("shinagawa", "品川", "Shinagawa", "品川", "Shinagawa"),
    ("osaki", "大崎", "Osaki", "大崎", "Shinagawa"),
    ("gotanda", "五反田", "Gotanda", "五反田", "Shinagawa"),
    ("tennozu", "天王洲アイル", "Tennozu Isle", "天王洲アイル", "Shinagawa"),
    ("shibuya", "渋谷", "Shibuya", "渋谷", "Shibuya"),
    ("ebisu", "恵比寿(東京都)", "Ebisu", "恵比寿", "Shibuya"),
    ("shinjuku", "新宿", "Shinjuku", "新宿", "Shinjuku"),
    ("tochomae", "都庁前", "Nishi-Shinjuku (Tochomae)", "都庁前（西新宿）", "Shinjuku"),
    ("iidabashi", "飯田橋", "Iidabashi", "飯田橋", "Iidabashi"),
    ("ikebukuro", "池袋", "Ikebukuro", "池袋", "Ikebukuro"),
    ("ueno", "上野", "Ueno", "上野", "Ueno"),
    ("kitasenju", "北千住", "Kita-Senju", "北千住", "Kita-Senju"),
    ("kinshicho", "錦糸町", "Kinshicho", "錦糸町", "Kinshicho"),
    ("toyosu", "豊洲", "Toyosu", "豊洲", "Bay area"),
    ("nakano", "中野(東京都)", "Nakano", "中野", "Nakano"),
    ("tachikawa", "立川", "Tachikawa", "立川", "Tama"),
    ("kawasaki", "川崎", "Kawasaki", "川崎", "Kanagawa"),
    ("musashikosugi", "武蔵小杉", "Musashi-Kosugi", "武蔵小杉", "Kanagawa"),
    ("yokohama", "横浜", "Yokohama", "横浜", "Kanagawa"),
    ("minatomirai", "みなとみらい", "Minatomirai", "みなとみらい", "Kanagawa"),
    ("shinyokohama", "新横浜", "Shin-Yokohama", "新横浜", "Kanagawa"),
    ("omiya", "大宮(埼玉県)", "Omiya", "大宮", "Saitama"),
    ("kaihinmakuhari", "海浜幕張", "Kaihin-Makuhari", "海浜幕張", "Chiba"),
    ("chiba", "千葉", "Chiba", "千葉", "Chiba"),
]
# Home stations whose plain name is ambiguous on Yahoo
HOME_QUERY = {"府中": "府中(東京都)", "中野": "中野(東京都)", "大宮": "大宮(埼玉県)", "田町": "田町(東京都)",  # 柏(千葉県) resolves to a bus stop → plain 柏
              "恵比寿": "恵比寿(東京都)", "川口": "川口(埼玉県)", "市川": "市川(千葉県)"}

S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
                  "Accept-Language": "ja"})


def norm(s):
    s = unicodedata.normalize("NFKC", s or "")
    return re.sub(r"\(.*?\)|（.*?）", "", s).replace("ヶ", "ケ").strip()


def query(frm, to):
    params = dict(**{"from": frm, "to": to}, **DATE, hh="08", m1="4", m2="5", type="4", ticket="ic",
                  expkind="1", ws="3", s="0", al="1", shin="0", ex="0", hb="1", lb="1", sr="1")
    url = "https://transit.yahoo.co.jp/search/result?" + urlencode(params)
    for attempt in range(3):
        try:
            r = S.get(url, timeout=30)
            if r.ok:
                break
        except requests.RequestException:
            pass
        time.sleep(5 + attempt * 10)
    else:
        return {"error": "http", "url": url}
    time.sleep(1.6)
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text, re.S)
    if not m:
        return {"error": "nodata", "url": url}
    feats = json.loads(m.group(1))["props"]["pageProps"].get("naviSearchParam", {}).get("featureInfoList") or []
    routes = []
    for f in feats:
        s = f["summaryInfo"]; edges = f.get("edgeInfoList") or []
        hh, mm = re.search(r"(\d+)時間", s["totalTime"]), re.search(r"(\d+)分", s["totalTime"])
        mins = (int(hh.group(1)) * 60 if hh else 0) + (int(mm.group(1)) if mm else 0)
        teiki = {t["month"]: int(t["price"].replace(",", "")) for t in (s.get("teiki") or []) if t.get("price")}
        routes.append({"min": mins, "xfer": int(s["transferCount"]), "fare": int(s["totalPrice"].replace(",", "") or 0),
                       "pass1m": teiki.get("1"), "first": edges[0]["stationName"] if edges else None,
                       "last": edges[-1]["stationName"] if edges else None,
                       "lines": [e.get("railName") for e in edges[:-1] if e.get("railName")]})
    if not routes:
        return {"error": "noroute", "url": url}
    best = min(routes, key=lambda x: (x["min"], x["xfer"]))
    ok = norm(best["first"]) == norm(frm) and norm(best["last"]) == norm(to)
    return {**best, "ok": ok, "url": url}


def main():
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    homes = {a["id"]: a["commute"]["station"] for a in loc["areas"]}
    cache = json.load(open(CACHE, encoding="utf-8")) if CACHE.exists() else {}
    offices = OFFICES[:2] if "--check" in sys.argv else OFFICES
    todo = [(aid, st, o) for aid, st in homes.items() for o in offices if f"{aid}|{o[0]}" not in cache or "--check" in sys.argv]
    print(len(todo), "queries", flush=True)
    for i, (aid, st, o) in enumerate(todo):
        frm = HOME_QUERY.get(st, st)
        if norm(frm) == norm(o[1]):
            res = {"min": 0, "xfer": 0, "fare": 0, "pass1m": 0, "ok": True, "same": True}
        else:
            res = query(frm, o[1])
        cache[f"{aid}|{o[0]}"] = res
        if i % 20 == 0 or not res.get("ok"):
            print(i, aid, st, "→", o[1], {k: res.get(k) for k in ("min", "xfer", "pass1m", "ok", "first", "last", "error")}, flush=True)
            CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
    CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")

    # reproducibility check against the study's Tokyo/Otemachi numbers
    diffs = []
    for a in loc["areas"]:
        c = a["commute"]; key = "tokyo" if c["destination"] == "Tokyo" else "otemachi"
        r = cache.get(f"{a['id']}|{key}")
        if r and r.get("min") is not None and abs(r["min"] - c["minToTokyo"]) > 3:
            diffs.append((a["id"], c["station"], key, c["minToTokyo"], r["min"]))
    print("study vs matrix (>3 min apart):", len(diffs)); [print("  ", d) for d in diffs]
    if "--check" in sys.argv:
        return

    bad = [k for k, v in cache.items() if not v.get("ok")]
    print("unvalidated/failed:", len(bad), bad[:20])
    m = {aid: {o[0]: ([cache[f"{aid}|{o[0]}"]["min"], cache[f"{aid}|{o[0]}"]["xfer"], cache[f"{aid}|{o[0]}"].get("pass1m")]
                      if cache.get(f"{aid}|{o[0]}", {}).get("ok") else None) for o in OFFICES} for aid in homes}
    OUT.write_text(json.dumps({
        "generated": time.strftime("%Y-%m-%d"), "searchDate": "{y}-{m:02d}-{d:02d}".format(**DATE),
        "method": "Yahoo!乗換案内, weekday arrive-by 08:45, IC fare, no paid expresses; fastest route; value = [minutes, transfers, 1-month pass ¥]",
        "offices": [{"id": o[0], "query": o[1], "en": o[2], "ja": o[3], "district": o[4]} for o in OFFICES],
        "homes": homes, "matrix": m, "studyDiffs": diffs, "failed": bad,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
