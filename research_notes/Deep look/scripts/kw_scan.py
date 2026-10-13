"""Scan visible text of saved pages for buyer-relevant keywords; print short context snippets."""
import re
import sys
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup

RAW = Path(sys.argv[1])
pat = sys.argv[2] if len(sys.argv) > 2 else None
KW = (pat.split(",") if pat else
      ["特徴ピックアップ", "ペアガラス", "複層ガラス", "二重サッシ", "Low-E", "断熱", "床暖房", "食器洗", "浴室乾燥", "宅配", "オートロック",
       "耐震", "免震", "制震", "管理形態", "管理会社", "長期修繕", "大規模修繕", "修繕履歴", "ペット", "駐輪", "バイク", "トランクルーム",
       "ZEH", "BELS", "省エネ", "住宅性能評価", "長期優良", "フラット35", "住宅ローン控除", "既存住宅売買瑕疵", "インスペクション",
       "接道", "私道", "セットバック", "再建築", "建ぺい率", "容積率", "地目", "都市計画", "用途地域", "借地", "定期借地", "地代",
       "告知事項", "心理的", "瑕疵", "アスベスト", "ハザード", "浸水", "液状化", "土砂", "眺望", "日当たり", "角部屋", "最上階",
       "リノベ", "リフォーム履歴", "給湯", "エコジョーズ", "エネファーム", "太陽光", "都市ガス", "プロパン", "オール電化", "下水", "浄化槽"])
for f in sorted(RAW.glob("*.html")):
    soup = BeautifulSoup(f.read_text(encoding="utf-8"), "html.parser")
    for s in soup(["script", "style", "noscript", "header", "footer"]):
        s.decompose()
    txt = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", soup.get_text(" ")))
    hits = []
    for k in KW:
        for m in list(re.finditer(re.escape(k), txt))[:2]:
            hits.append(f"  {k}: …{txt[max(0, m.start() - 40):m.end() + 70]}…")
    print(f"=== {f.stem} ({len(hits)} hits)")
    print("\n".join(hits))
