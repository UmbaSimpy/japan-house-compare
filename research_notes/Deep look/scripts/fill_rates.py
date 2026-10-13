"""Fill rates of SUUMO detail-page fields, feature tags and free-text keywords across the sample set."""
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup

D = Path(sys.argv[1])
n = lambda t: re.sub(r"\s+", " ", unicodedata.normalize("NFKC", t or "")).strip()
SKIP = re.compile(r"借りる|を買う|建てる|リフォームする|売る|住まいの相談|メール|半角|お名前|ご住所|お問い合わせ内容|^その他$|サポート|料金発生|関連リンク|不動産会社ガイド|担当者より|免許|取引|情報提供|次回更新|会社概要|問い合わせ先|お問い合せ先|探す|関連サイト|関連エリア")
KW = {"pair glass": r"ペアガラス|複層ガラス|二重サッシ|Low-?E|断熱サッシ|樹脂サッシ|内窓|二重窓",
      "seismic": r"耐震|免震|制震|新耐震|耐震基準適合",
      "repair history": r"大規模修繕|修繕履歴|外壁塗装|長期修繕計画",
      "mgmt company": r"管理会社",
      "inspection": r"インスペクション|建物状況調査|既存住宅売買瑕疵|瑕疵保険",
      "energy cert": r"BELS|ZEH|省エネ性能ラベル|長期優良|住宅性能評価|低炭素",
      "loan deduction": r"住宅ローン控除|住宅ローン減税|フラット35",
      "liability waiver": r"契約不適合責任.{0,10}免責|瑕疵担保.{0,10}免責",
      "disclosure": r"告知事項|心理的瑕疵",
      "asbestos": r"アスベスト|石綿",
      "setback": r"セットバック|再建築不可|接道",
      "gas/sewer": r"都市ガス|プロパン|LPガス|本下水|浄化槽|オール電化",
      "reno detail": r"\d{4}年\d{1,2}月.{0,6}(リフォーム|リノベ)"}
fields, tags, kw, nfiles = Counter(), Counter(), Counter(), Counter()
filled = Counter()
for f in sorted(D.glob("*.html")):
    kind = f.stem.split("_")[0]
    nfiles[kind] += 1
    soup = BeautifulSoup(f.read_text(encoding="utf-8"), "html.parser")
    for s in soup(["script", "style", "noscript"]):
        s.decompose()
    seen = set()
    for th in soup.find_all("th"):
        td = th.find_next_sibling("td")
        if not td:
            continue
        k = re.sub(r"\s*ヒント$", "", n(th.get_text(" ")))
        if not k or SKIP.search(k) or k in seen or len(k) > 20:
            continue
        seen.add(k)
        fields[(kind, k)] += 1
        if n(td.get_text(" ")) not in ("-", "", "－"):
            filled[(kind, k)] += 1
    h = soup.find(string=re.compile("特徴ピックアップ"))
    if h:
        box = h.find_parent().find_next("div", class_="mt10")
        for t in n(box.get_text(" ")).split(" / ") if box else []:
            tags[(kind, t)] += 1
    txt = n(soup.get_text(" "))
    for k, p in KW.items():
        if re.search(p, txt):
            kw[(kind, k)] += 1
for kind in nfiles:
    N = nfiles[kind]
    print(f"\n######## {kind}: {N} pages")
    print("FIELDS (present / filled):")
    for (kk, k), c in sorted(fields.items(), key=lambda x: -x[1]):
        if kk == kind and c >= 2:
            print(f"  {k}: {c}/{N} present, {filled[(kk, k)]} filled")
    print("TAGS (特徴ピックアップ):")
    print("  " + " | ".join(f"{t} {c}" for (kk, t), c in tags.most_common() if kk == kind))
    print("FREE-TEXT KEYWORDS (pages mentioning):")
    print("  " + " | ".join(f"{k} {kw[(kind, k)]}" for k in KW))
