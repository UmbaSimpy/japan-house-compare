#!/usr/bin/env python3
"""Area-level school facts (info only, never scored) → data/school_info.json. Method: data/DATA_LOG.md item 20.

Automated from official PDFs (cached in data/cache/schools/pdf, gitignored):
  1. National achievement test 2025 (全国学力・学習状況調査 R7, grade 6 + grade 9), average correct rate vs national (public):
     - Saitama prefecture's per-municipality summaries (consenting cities)  pref.saitama.lg.jp/f2214/gakutyou/r7shichousonkekka.html
     - MEXT 都道府県・指定都市別ノート: designated cities (Chiba, Yokohama, Kawasaki, Saitama) and the prefecture
       figure used as a labelled fallback where a city publishes nothing comparable.
     Value shown: mean of (city − national) over 国語/算数/理科 (ES) and 国語/数学 (JHS; JHS science is an IRT score).
  2. Tokyo: share of public-elementary graduates (March 2025) going to PRIVATE junior high, by ward/city —
     東京都教育委員会 公立学校統計調査報告書 R7【公立学校卒業者(令和6年度)の進路状況調査編】 第1表.
Hand-curated (sources in SOURCES below):
  3. School-choice system per municipality (Tokyo board R8 table + city pages).
  4. Chiba public high-school district (学区); Tokyo / Kanagawa / Saitama / Ibaraki 普通科 = prefecture-wide.

  python school_info.py
"""
import json
import re
import urllib.request
from pathlib import Path

import pypdf

PDF = Path("data/cache/schools/pdf")
OUT = Path("data/school_info.json")
UA = {"User-Agent": "Mozilla/5.0 (japan-house-compare research; official open data)"}

SAITAMA = "https://www.pref.saitama.lg.jp/documents/271593/"
SAITAMA_FILES = {"11100": "0000saitama02.pdf", "11203": "01kawaguti02.pdf", "11221": "04souka02.pdf",
                 "11224": "06toda02.pdf", "11222": "47koshigaya02.pdf", "11234": "49yashio02.pdf",
                 "11237": "50misato02.pdf"}
MEXT_CITY = "https://www.mext.go.jp/content/20250930-mxt_chousa02-000043165-07.pdf"   # 指定都市別ノート
MEXT_PREF = "https://www.mext.go.jp/content/20250930-mxt_chousa02-000043165-04.pdf"   # 都道府県別（指定都市を含む）
TOKYO_GRAD = "https://www.kyoiku.metro.tokyo.lg.jp/documents/d/kyoiku/r7-houkokusho-sotsugo"
DESIGNATED = {"さいたま市": "11100", "千葉市": "12100", "横浜市": "14100", "川崎市": "14130"}
PREF_NAME = {"08": "茨城県", "11": "埼玉県", "12": "千葉県", "13": "東京都", "14": "神奈川県"}

# 3. School choice (学校選択制). kind: none | adjacent | free | partial | unknown ; e = elementary, j = junior high
#    Tokyo: 東京都教育委員会「令和8年度 公立小・中学校における学校選択制等の実施状況」(2026-02-27).
TOKYO_R8 = "https://www.kyoiku.metro.tokyo.lg.jp/documents/d/kyoiku/2026-02-27-132752-298"
CHOICE = {
    "13101": ("none", "free", ""), "13102": ("partial", "free", "ES: 特認校 5 + 特定地域選択制"),
    "13103": ("adjacent", "free", ""), "13104": ("none", "free", ""), "13105": ("none", "free", ""),
    "13106": ("none", "free", ""), "13107": ("adjacent", "free", ""),
    "13108": ("free", "free", "ES: within ~2 km walk"), "13109": ("adjacent", "free", "義務教育学校 also free"),
    "13110": ("none", "adjacent", "ES adjacent choice suspended since 2019"), "13113": ("none", "free", ""),
    "13116": ("adjacent", "adjacent", ""), "13118": ("adjacent", "free", ""), "13119": ("adjacent", "free", ""),
    "13120": ("none", "free", ""), "13121": ("adjacent", "free", ""),
    "13123": ("free", "free", "ES: within ~1.2 km walk"),
    "13202": ("adjacent", "adjacent", "only if the chosen school is closer"),
    "13209": ("adjacent", "free", "ES: free within 1.5 km"), "13208": ("none", "free", ""),
    **{c: ("none", "none", "") for c in ("13112", "13111", "13114", "13115", "13117", "13122", "13204", "13203",
                                         "13210", "13225", "13206", "13224")},
    "11224": ("none", "free", "JHS free choice (MEXT case study; 2024 intake, no lotteries)"),
    "12207": ("adjacent", "adjacent", "adjacent zone within walking distance (since 2004; R7 guide)"),
    "12227": ("partial", "none", "特定地域選択制 for the 南小 zone only"),
    "14100": ("partial", "partial", "only 特別調整通学区域 (border streets) and 通学区域特認校"),
}
CHOICE_SRC = {"13": TOKYO_R8, "11224": "https://www.mext.go.jp/a_menu/shotou/gakko-sentaku/index.htm",
              "12207": "https://www.city.matsudo.chiba.jp/kosodate/gakkou/", "12227": "https://www.city.urayasu.lg.jp/",
              "14100": "https://www.city.yokohama.lg.jp/kosodate-kyoiku/kyoiku/sesaku/tsugaku/"}

# 4. Chiba public HS districts (千葉県 県立高校 学区; apply in own + adjacent districts)
CHIBA_HS = {1: "Chiba city", 2: "Ichikawa, Funabashi, Matsudo, Narashino, Yachiyo, Urayasu",
            3: "Noda, Kashiwa, Nagareyama, Abiko, Kamagaya",
            4: "Narita, Sakura, Yotsukaido, Yachimata, Inzai, Shiroi, Tomisato, Shisui, Sakae",
            9: "Kisarazu, Ichihara, Kimitsu, Futtsu, Sodegaura"}
CHIBA_HS_OF = {"12100": 1, "12203": 2, "12204": 2, "12207": 2, "12216": 2, "12221": 2, "12227": 2, "12224": 3,
               "12217": 3, "12220": 3, "12212": 4, "12231": 4, "12232": 4, "12219": 9, "12229": 9, "12206": 9}
CHIBA_HS_SRC = "https://www.pref.chiba.lg.jp/kyouiku/seisaku/miryoku/gakku/"


def fetch(url, name):
    PDF.mkdir(parents=True, exist_ok=True)
    f = PDF / name
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
    return pypdf.PdfReader(f)


def nums(line):
    return [float(x) for x in line.split()] if re.fullmatch(r"[\d. ]+", line.strip()) else None


def diff(rows, n):
    """rows = [[city, pref?, national] or [city, national]] → mean(city − national) over the first n subjects."""
    return round(sum(r[0] - r[-1] for r in rows[:n]) / n, 1)


def saitama():
    out = {}
    for code, fn in SAITAMA_FILES.items():
        r = fetch(SAITAMA + fn, fn)
        es = [n for n in map(nums, r.pages[0].extract_text().split("\n")) if n and len(n) == 3][:3]
        jh = [n for n in map(nums, r.pages[1].extract_text().split("\n")) if n and len(n) == 3][:2]
        out[code] = {"es": diff(es, 3), "jhs": diff(jh, 2), "src": "saitama"}
    return out


def mext(url, fn, names):
    """Per-page means from the MEXT notes; row 4 of the distribution block = 平均正答率 (city, national pairs)."""
    out = {}
    for p in fetch(url, fn).pages:
        L = p.extract_text().split("\n")
        h = next((l for l in L if "全国（公立）" in l and not l.startswith("全国")), None)
        if not h or h.split()[0] not in names:
            continue
        rows = [l.split() for l in L[L.index(h) + 1:L.index(h) + 9] if re.match(r"\d", l.strip())]
        mean = rows[3]
        jhs = any("中学校" in l for l in L[:4])
        vals = [float(mean[0]), float(mean[1]), float(mean[2]), float(mean[3])] + ([] if jhs else [float(mean[4]), float(mean[5])])
        pairs = [[vals[i], vals[i + 1]] for i in range(0, len(vals), 2)]
        out.setdefault(h.split()[0], {})["jhs" if jhs else "es"] = diff(pairs, len(pairs))
    return out


def tokyo_private():
    """第1表 状況別卒業者数 (小学校): per ward → (graduates, to private JHS). Numbers ≥1000 are printed as '1 380'; the
    split is resolved by requiring 計 = 男 + 女 for every triple."""
    r = fetch(TOKYO_GRAD, "tokyo_sotsugo_r7.pdf")
    page = next(i for i, p in enumerate(r.pages) if "第１表" in p.extract_text() and "千 代 田 区" in p.extract_text())

    def seg(t, out=()):
        if not t:
            return list(out) if (len(out) - 2) % 3 == 0 else None
        c = [(int(t[0]), 1)]
        if len(t) > 1 and len(t[1]) == 3 and len(t[0]) <= 2:
            c.insert(0, (int(t[0] + t[1]), 2))
        for v, k in c:
            o = out + (v,)
            if len(o) >= 5 and (len(o) - 2) % 3 == 0 and o[-3] != o[-2] + o[-1]:
                continue
            res = seg(t[k:], o)
            if res:
                return res
        return None

    out = {}
    for line in (r.pages[page].extract_text() + "\n" + r.pages[page + 2].extract_text()).split("\n"):
        m = re.match(r"^((?:\S ){1,4}[区市町村])\s+(.*)$", line)
        if not m:
            continue
        v = seg(tuple(x if x != "－" else "0" for x in m.group(2).split()))
        if v and len(v) >= 23:
            tri = [v[2 + 3 * k] for k in range(7)]          # 卒業者, 都内中学校等, 区市町村立, …, 私立
            out.setdefault(m.group(1).replace(" ", ""), (tri[0], tri[6]))
    tot = sum(g for g, p in out.values()), sum(p for g, p in out.values())
    return out, round(tot[1] / tot[0] * 100, 1)


def main():
    loc = json.load(open("data/locations.json", encoding="utf-8"))
    bnd = {f["name"]: f["code"] for f in json.load(open("data/boundaries.json", encoding="utf-8"))["features"]}
    sai = saitama()
    city = mext(MEXT_CITY, "mext_r7_cities.pdf", set(DESIGNATED))
    pref = mext(MEXT_PREF, "mext_r7_prefs.pdf", set(PREF_NAME.values()))
    tk, tk_all = tokyo_private()
    areas = {}
    for a in loc["areas"]:
        code = bnd[a["nameJa"]]
        mc = "14130" if code[:4] == "1413" else code[:3] + "00" if code[:3] in ("111", "121", "141") else code
        cityname = next((k for k, v in DESIGNATED.items() if v == mc), None)
        if mc in sai:
            test = {**sai[mc], "level": "city"}
        elif cityname in city:
            test = {**city[cityname], "src": "mext", "level": "city"}
        else:
            test = {**pref[PREF_NAME[code[:2]]], "src": "mext", "level": "pref"}
        name = a["nameJa"]
        priv = tk.get(name) if code[:2] == "13" else None
        ch = CHOICE.get(mc)
        areas[a["id"]] = {
            "test": test,
            "privateJHS": round(priv[1] / priv[0] * 100, 1) if priv else None,
            "choice": {"e": ch[0], "j": ch[1], "note": ch[2],
                       "src": CHOICE_SRC.get(mc) or CHOICE_SRC.get(code[:2])} if ch else {"e": "unknown", "j": "unknown", "note": "", "src": None},
            "hsDistrict": CHIBA_HS_OF.get(mc) if code[:2] == "12" else 0,
        }
    OUT.write_text(json.dumps({
        "generated": __import__("datetime").date.today().isoformat(),
        "sources": {"test": [MEXT_CITY, MEXT_PREF, "https://www.pref.saitama.lg.jp/f2214/gakutyou/r7shichousonkekka.html"],
                    "privateJHS": TOKYO_GRAD, "choice": TOKYO_R8, "hs": CHIBA_HS_SRC},
        "tokyoPrivateJHS": tk_all, "chibaHS": CHIBA_HS, "areas": areas}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"school_info.json: {len(areas)} areas; Tokyo private-JHS overall {tk_all}%")
    for k, v in areas.items():
        print(f"  {k:20} test {v['test']['level']:4} ES {v['test']['es']:+.1f} JHS {v['test']['jhs']:+.1f}  priv {v['privateJHS']}  choice {v['choice']['e']}/{v['choice']['j']}  HS {v['hsDistrict']}")


if __name__ == "__main__":
    main()
