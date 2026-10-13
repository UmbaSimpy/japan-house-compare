# SUUMO detached-house data: what is available (checked 2026-10-13)

## Detail page (中古一戸建て `/chukoikkodate/…/nc_ID/`, 新築 `/ikkodate/…/nc_ID/`, + `bukkengaiyo/`)
Table rows: 価格, 間取り, 土地面積 (登記/実測), 建物面積, 私道負担・道路 (road width + direction, e.g. 北東6ｍ幅), 完成時期(築年月),
建ぺい率・容積率, 引渡可能時期, 土地の権利形態, 構造・工法 (木造2階建 / 軸組 / 2x4…), **エネルギー消費性能** (★ rating, 削減率 %),
**断熱性能** (等級 x/7), **目安光熱費** (yen/year when given), 施工 (builder), リフォーム, 用途地域 (zoning e.g. １種中高, 準工業),
地目, その他制限事項 (高度地区, 22条区域, 宅地造成工事規制区域…), その他概要 (設備: 公営水道, 本下水, 都市ガス; 建築確認番号).
Mostly blank (“-”) on used houses; filled on new builds.

**特徴ピックアップ** tag list (same vocabulary as the search filters below) e.g. 太陽光発電システム, EV車充電設備, 省エネ給湯器,
複層ガラス, 設計住宅性能評価書, 地盤調査済, 建築確認完了検査済証, 角地, 前道６ｍ以上, 整形地, 土地50坪以上, 庭１０坪以上, 南庭,
修繕・点検の記録, 新築時・増改築時の設計図, 小学校 徒歩10分以内, 平坦地, 都市ガス.
Free text sometimes mentions カーポート / ビルトインガレージ / 光ファイバー / インターネット — not a structured field.

## Search filters (used houses, ar=030 bs=021; codes usable in list URLs → per-area counts)
cj=031 駐車場2台可 · cj=032 駐車場3台以上可 · cj=310 ハイルーフ駐車場
ksg=141 長期優良住宅 · ksg=298 低炭素住宅 · ksg=201 オール電化 · ksg=202 太陽光発電システム · ksg=203 省エネ給湯器
kka=313 住宅性能評価書あり · kka=299 完了検査済証あり · kka=300 耐震基準適合証明書あり · kka=301 インスペクション済み
kka=302 設計図あり · kka=303 修繕・点検の記録あり · kha=304 瑕疵保険（国交省指定法人） · kha=305 瑕疵保証（会社独自）
ksy=306 フラット３５・Ｓ適合 · rr=307/314/315/263 リフォーム種類 · kr=A 所有権 · kr=C 定期借地権 · ks=121/122 2階 / 3階以上
mh=151 南向き · kk=186 都市ガス · sn=166 床暖房 · sn=167 バリアフリー · sn=168 2世帯住宅 · bl=222 庭10坪以上 · bl=221 南庭
rt=131 高台 · rt=132 角地 · rt=133 整形地 · rt=139 低層住居専用地域 · sk=271 隣の建物との間隔が広い
sk=274 スーパー徒歩10分 · sk=311 総合病院徒歩10分 · sk=312 小学校徒歩10分 · st=293 即引渡可 · er=111 始発駅
No filter for: covered parking, internet/fibre, ZEH (check new-build list), 耐震等級 (only via 性能評価書).
