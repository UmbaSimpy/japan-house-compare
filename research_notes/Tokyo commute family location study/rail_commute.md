# Rail commute to Tokyo Station / Otemachi from candidate municipalities (as of Oct 2026)

Method note (applies to all tables below):
- **Times, transfers, IC fares and 1-month commuter pass (定期) prices** come from Yahoo!乗換案内, queried 2026-10-12 for **Wednesday 2026-10-14, arrive by 08:45**, IC fare, paid limited expresses/Shinkansen/buses excluded, normal walking speed. For each station two searches were run (to 東京 and to 大手町(東京都)); of the up-to-3 routes Yahoo returns, the shortest is reported. Example query: [Yahoo!乗換案内 船橋→東京, arrive 08:45](https://transit.yahoo.co.jp/search/result?from=%E8%88%B9%E6%A9%8B&to=%E6%9D%B1%E4%BA%AC&y=2026&m=10&d=14&hh=08&m1=4&m2=5&type=4&ticket=ic). Same URL pattern for every station (only `from`/`to` change).
- Times are **station platform to Tokyo/Otemachi platform** (including transfer walks). Door-to-station is not knowable per municipality; the "door est." column adds a flat **+10 min** (≈8 min walk + platform) and is my assumption, not sourced.
- Yahoo prices already reflect the **JR East fare revision of 2026-03-14** and the **Seibu revision of 2026-03-14** (search date is after both).
- Crowding = **MLIT 都市鉄道の混雑率調査 FY2025 (令和7年度) results, published 2026-07-28** — the latest release. Figures are the peak 1-hour rate at each line's single most-crowded measured section, which is often not the section a given municipality's riders pass through. [MLIT press release](https://www.mlit.go.jp/report/press/tetsudo04_hh_000139.html); [資料2 主要31区間](https://www.mlit.go.jp/report/press/content/002015141.pdf); [資料3 最混雑区間 全路線](https://www.mlit.go.jp/report/press/content/002015142.pdf).
- 1M = 1-month commuter pass (通勤定期), ¥. "x0/x1/x2" = number of transfers.

## Q1. What is the fastest realistic weekday 8:00–9:00 arrival commute per municipality?

### Takeaway
Within ~30 min station-to-station with 0 transfers, the best places are the inner wards plus Musashi-Kosugi/Kawasaki/Shin-Kawasaki (18–21 min), Ichikawa/Shin-Urayasu (19–20), Urawa (26), Funabashi (26), Matsudo (27), Tsudanuma/Yokohama (30), Saitama-Shintoshin (31) and Omiya/Kaihin-Makuhari/Kichijoji (33–34). Tsukuba (71–75), Kisarazu (80), Hashimoto/Minami-Osawa (73–77) and Sakura/Inzai (57–63) are the slowest. Commuter passes range from ¥5,890 (inner JR) to ¥52,410 (Tsukuba via TX). TX, Hokuso and Toyo Rapid cost 2–3× JR for the same distance.

### Cited Findings

All rows in the five tables come from Yahoo!乗換案内 (see the method note and [example query](https://transit.yahoo.co.jp/search/result?from=%E8%88%B9%E6%A9%8B&to=%E6%9D%B1%E4%BA%AC&y=2026&m=10&d=14&hh=08&m1=4&m2=5&type=4&ticket=ic)). Crowding comes from [MLIT FY2025 資料3](https://www.mlit.go.jp/report/press/content/002015142.pdf).

#### Tokyo – 23 wards

| Ward | Station | → Tokyo Stn (min / xfer / 1M ¥) | → Otemachi (min / xfer / 1M ¥) | Main line used | Line peak crowding FY2025 |
|---|---|---|---|---|---|
| Chiyoda | 市ケ谷 | 13 / 1 / 5,890 | 10 / 1 / 11,750 | JR 総武緩行→中央快速 | 中央緩行 93%; 中央快速 158% |
| Chuo | 月島 | 15 / 1 / 7,140 | 13 / 1 / 11,880 | Metro 有楽町→丸ノ内 | 有楽町 153% |
| Minato | 田町 | 9 / 0 / 5,890 | 18 / 0 / 7,940 | JR 山手 | 山手 135–136%; 京浜東北(大井町→品川) 159% |
| Shinjuku | 四ツ谷 | 9 / 0 / 6,240 | 13 / 0 / 7,490 | JR 中央快速 / Metro 丸ノ内 | 中央快速 158% |
| Bunkyo | 茗荷谷 | 12 / 0 / 7,490 | 11 / 0 / 7,490 | Metro 丸ノ内 | 丸ノ内 154% (新大塚→茗荷谷, i.e. this station) |
| Taito | 上野 | 5 / 0 / 5,890 | 15 / 1 / 7,320 | JR 上野東京ライン | — |
| Sumida | 錦糸町 | 8 / 0 / 5,890 | 13 / 0 / 7,660 | JR 総武快速 / 半蔵門 | 総武快速 160% (新小岩→錦糸町) |
| Koto | 豊洲 | 18 / 1 / 7,320 | 18 / 1 / 11,570 | Metro 有楽町 | 有楽町 153% |
| Koto | 門前仲町 | 15 / 1 / 7,140 | 7 / 0 / 7,140 | Metro 東西 | 東西 160% (木場→門前仲町) |
| Shinagawa | 大井町 | 17 / 0 / 6,240 | 28 / 1 / 12,700 | JR 京浜東北 | 京浜東北 159% (大井町→品川) |
| Shinagawa | 武蔵小山 | 32 / 1 / 12,830 | 23 / 0 / 14,330 | 東急目黒→三田直通 | 東急目黒 133% |
| Meguro | 中目黒 | 26 / 1 / 8,170 | 26 / 1 / 8,170 | Metro 日比谷 | 東横 124%; 日比谷 163% (northern section) |
| Meguro | 学芸大学 | 35 / 2 / 13,160 | 34 / 1 / 14,770 | 東急東横 | 東横 124% |
| Ota | 蒲田 | 24 / 0 / 7,840 | 35 / 1 / 14,180 | JR 京浜東北 | 京浜東北 159% |
| Setagaya | 三軒茶屋 | 27 / 2 / 14,610 | 24 / 0 / 14,770 | 田園都市→半蔵門 | 田園都市 138% |
| Setagaya | 二子玉川 | 39 / 2 / 16,400 | 36 / 0 / 16,560 | 田園都市→半蔵門 | 田園都市 138% |
| Setagaya | 経堂 | 33 / 1 / 14,150 | 28 / 0 / 14,150 | 小田急→千代田直通 | 小田急小田原 150% |
| Shibuya | 恵比寿 | 23 / 1 / 7,990 | 23 / 1 / 7,990 | Metro 日比谷 | 日比谷 163% |
| Nakano | 中野 | 20 / 0 / 7,840 | 22 / 0 / 8,330 | JR 中央快速 / 東西 | 中央快速 158% (中野→新宿) |
| Suginami | 荻窪 | 27 / 0 / 10,480 | 30 / 0 / 14,220 | JR 中央快速 | 中央快速 158% |
| Toshima | 池袋 | 18 / 0 / 7,990 | 16 / 0 / 7,990 | Metro 丸ノ内 | 丸ノ内 154% |
| Kita | 赤羽 | 17 / 0 / 7,840 | 30 / 1 / 14,470 | JR 高崎/宇都宮 (上野東京ライン) | 京浜東北 158% (川口→赤羽); 埼京 167% |
| Arakawa | 日暮里 | 13 / 0 / 5,890 | 20 / 1 / 12,400 | JR 山手/京浜東北 | — |
| Itabashi | 成増 | 37 / 1 / 17,840 | 35 / 1 / 17,840 | 東武東上→丸ノ内 | 東上 131% |
| Nerima | 練馬 | 37 / 1 / 15,050 | 35 / 1 / 15,050 | 西武有楽町→副都心→丸ノ内 | 西武池袋 130% |
| Nerima | 石神井公園 | 42 / 1 / 16,430 | 40 / 1 / 16,430 | 西武池袋→副都心→丸ノ内 | 西武池袋 130% |
| Adachi | 北千住 | 24 / 1 / 7,840 | 20 / 0 / 8,170 | Metro 千代田 / JR 常磐 | 千代田 150%; 東武伊勢崎 142% (小菅→北千住) |
| Katsushika | 新小岩 | 13 / 0 / 6,240 | 24 / 1 / 12,870 | JR 総武快速 | 総武快速 160% |
| Katsushika | 金町 | 37 / 1 / 15,160 | 30 / 0 / 14,410 | JR 常磐緩行→千代田直通 | 常磐緩行 128%; 千代田 150% |
| Edogawa | 西葛西 | 28 / 1 / 8,170 | 20 / 0 / 7,990 | Metro 東西 | 東西 160% |
| Edogawa | 小岩 | 21 / 1 / 7,840 | 33 / 2 / 14,470 | JR 総武緩行→快速 | 総武緩行 151%; 快速 160% |

#### Tokyo – Tama area

| Municipality | Station | → Tokyo Stn | → Otemachi | Main line | Crowding FY2025 |
|---|---|---|---|---|---|
| Musashino | 吉祥寺 | 33 / 0 / 13,120 | 36 / 0 / 14,570 | JR 中央快速 (東西線 direct also) | 中央快速 158% |
| Mitaka | 三鷹 | 35 / 0 / 13,120 | 39 / 0 / 14,570 | JR 中央快速 / 東西線 direct | 中央快速 158% |
| Chofu | 調布 | 53 / 1 / 18,060 | 52 / 2 / 22,910 | 京王→JR (新宿) | 京王 145% (下高井戸→明大前) |
| Fuchu | 府中 | 62 / 1 / 19,600 | 61 / 2 / 24,450 | 京王→JR | 京王 145% |
| Koganei | 武蔵小金井 | 44 / 0 / 15,600 | 51 / 1 / 16,170 | JR 中央快速 | 中央快速 158% |
| Kokubunji | 国分寺 | 47 / 0 / 18,450 | 54 / 1 / 18,810 | JR 中央快速 | 中央快速 158% |
| Tachikawa | 立川 | 57 / 0 / 21,290 | 64 / 1 / 21,450 | JR 中央快速 | 中央快速 158%; 多摩モノレール 148% |
| Machida | 町田 | 58 / 2 / 21,270 | 53 / 1 / 21,270 | 小田急→千代田 | 小田急 150% |
| Tama | 多摩センター | 68 / 2 / 21,270 | 62 / 1 / 21,270 | 小田急多摩→千代田 | 小田急多摩 77%; 小田急本線 150% |
| Inagi | 稲城 | 64 / 1 / 19,600 | 65 / 3 / 24,450 | 京王相模原→JR | 京王相模原 101%; 京王 145% |
| Inagi | 若葉台 | 67 / 1 / 21,170 | 68 / 3 / 26,020 | 京王相模原→JR | same |
| Hachioji (south Osawa) | 南大沢 | 73 / 2 / 22,370 | 73 / 1 / 27,220 | 京王相模原→京王→JR / 半蔵門 | same |
| *Added:* Nishi-Tokyo | 田無 | 54 / 2 / 18,550 | 46 / 1 / 18,380 | 西武新宿→東西 (高田馬場) | 西武新宿 148% |
| *Added:* Komae | 狛江 | 42 / 2 / 17,070 | 35 / 2 / 16,370 | 小田急→千代田 | 小田急 150% |

#### Chiba

| Municipality | Station | → Tokyo Stn | → Otemachi | Main line | Crowding FY2025 |
|---|---|---|---|---|---|
| Chiba-Mihama | 海浜幕張 | 34 / 0 / 18,450 | 55 / 1 / 17,130 | JR 京葉快速 | 京葉 123% |
| Chiba-Mihama | 検見川浜 | 37 / 0 / 18,720 | 60 / 2 / 25,520 | JR 京葉快速 | 京葉 123% |
| Chiba-Chuo | 千葉 | 41 / 0 / 21,580 | 51 / 1 / 28,210 | JR 総武快速 | 総武快速 160%; 千葉モノレール 157% |
| Chiba-Inage | 稲毛 | 37 / 0 / 20,450 | 47 / 1 / 27,080 | JR 総武快速 | 総武快速 160% |
| Chiba-Hanamigawa | 幕張本郷 | 38 / 1 / 15,600 | 51 / 2 / 22,230 | 総武緩行→快速 | 総武快速 160% |
| Chiba-Hanamigawa | 新検見川 | 43 / 1 / 18,720 | 56 / 2 / 25,080 | 総武緩行→快速 | 総武快速 160% |
| Chiba-Midori | 鎌取 | 53 / 1 / 24,880 | 63 / 2 / 31,510 | JR 外房→総武快速 | 総武快速 160% |
| Chiba-Wakaba | 都賀 | 49 / 0 / 23,750 | 61 / 1 / 30,380 | JR 総武本線快速 | 総武快速 160% |
| Narashino | 津田沼 | 30 / 0 / 15,600 | 40 / 1 / 22,230 | JR 総武快速 | 総武快速 160% |
| Funabashi | 船橋 | 26 / 0 / 13,120 | 36 / 1 / 19,750 | JR 総武快速 | 総武快速 160%; 東武野田 123% (新船橋→船橋) |
| Funabashi | 西船橋 | 29 / 0 / 13,120 | 38 / 0 / 9,290 | JR 武蔵野/京葉 · Metro 東西 | 東西 160% |
| Ichikawa | 市川 | 19 / 0 / 10,480 | 29 / 1 / 17,110 | JR 総武快速 | 総武快速 160% |
| Ichikawa | 本八幡 | 27 / 1 / 10,480 | 36 / 2 / 17,110 | JR 総武緩行→快速 | 総武緩行 151% |
| Urayasu | 新浦安 | 20 / 0 / 10,480 | 33 / 2 / 14,640 | JR 京葉快速 | 京葉 123% |
| Urayasu | 浦安 | 33 / 1 / 8,680 | 25 / 0 / 8,680 | Metro 東西 | 東西 160% |
| Matsudo | 松戸 | 27 / 0 / 13,120 | 35 / 0 / 16,010 | JR 常磐快速 / 緩行→千代田 | 常磐快速 142%; 京成松戸線 117% |
| Kashiwa | 柏 | 36 / 0 / 18,720 | 45 / 1 / 21,290 | JR 常磐快速 | 常磐快速 142% |
| Kashiwa | 柏の葉キャンパス | 52 / 1 / 31,660 | 54 / 1 / 31,990 | TX→JR/千代田 | TX 151% (青井→北千住) |
| Nagareyama | 流山おおたかの森 | 49 / 1 / 28,180 | 51 / 1 / 30,110 | TX | TX 151%; 東武野田 102% |
| Inzai | 千葉ニュータウン中央 | 57 / 2 / 47,160 | 59 / 1 / 44,600 | 北総→京成押上→半蔵門 | 北総 90%; 京成押上 157% |
| Inzai | 印西牧の原 | 61 / 2 / 49,260 | 63 / 1 / 46,600 | 北総 | same |
| Shiroi | 西白井 | 49 / 2 / 40,020 | 51 / 1 / 37,820 | 北総 | same |
| Yachiyo | 八千代緑が丘 | 51 / 1 / 34,640 | 52 / 0 / 30,810 | 東葉高速→東西 direct | 東葉 105%; 東西 160% |
| Yachiyo | 勝田台 | 53 / 1 / 26,390 | 64 / 0 / 36,180 | 京成→JR総武快速 (船橋) | 京成本線 137% |
| Sakura | 佐倉 (JR) | 61 / 0 / 28,440 | 72 / 1 / 35,070 | JR 総武本線快速 | 総武快速 160% |
| Sakura | ユーカリが丘 | 58 / 1 / 26,390 | 73 / 2 / 33,700 | 京成→JR (船橋) | 京成本線 137% |
| Kisarazu | 木更津 | 80 / 0 / 37,460 | 90 / 1 / 44,090 | JR 内房快速 (総武快速直通) | 総武快速 160% |
| Sodegaura | 袖ケ浦 | 74 / 0 / 34,170 | 84 / 1 / 40,800 | JR 内房快速 | same |
| Ichihara | 五井 | 60 / 0 / 26,960 | 70 / 1 / 33,590 | JR 内房快速 | same |
| Kamagaya | 新鎌ヶ谷 | 45 / 2 / 37,080 | 47 / 1 / 35,030 | 北総→京成押上 | 北総 90%; 京成押上 157% |
| Abiko | 我孫子 | 41 / 0 / 21,290 | 50 / 1 / 23,770 | JR 常磐快速 | 常磐快速 142% |

#### Ibaraki

| Municipality | Station | → Tokyo Stn | → Otemachi | Main line | Crowding FY2025 |
|---|---|---|---|---|---|
| Tsukuba | つくば | 74 / 1 / 52,410 | 75 / 1 / 50,030 | TX 区間快速 | TX 151% |
| Tsukuba | 研究学園 | 71 / 1 / 50,530 | 72 / 1 / 50,030 | TX | TX 151% |
| Moriya | 守谷 | 56 / 1 / 39,230 | 57 / 1 / 38,410 | TX 区間快速 (JR 常磐線 to 上野 alt.) | TX 151% |
| Tsukubamirai | みらい平 | 61 / 1 / 43,000 | 62 / 1 / 42,490 | TX | TX 151% |
| Toride | 取手 | 52 / 1 / 23,750 | 56 / 1 / 26,890 | JR 常磐 (快速/中電) | 常磐快速 142% |

#### Saitama

| Municipality | Station | → Tokyo Stn | → Otemachi | Main line | Crowding FY2025 |
|---|---|---|---|---|---|
| Saitama-Urawa | 浦和 | 26 / 0 / 13,120 | 39 / 1 / 19,750 | JR 上野東京ライン (高崎/宇都宮) | 京浜東北 158%; 宇都宮 120% / 高崎 131% |
| Saitama-Omiya | 大宮 | 34 / 0 / 17,970 | 48 / 1 / 24,600 | JR 上野東京ライン | 高崎 131% (宮原→大宮) |
| Saitama-Chuo | さいたま新都心 | 31 / 0 / 15,600 | 44 / 1 / 22,230 | JR 上野東京ライン | same |
| Saitama-Minami | 武蔵浦和 | 38 / 1 / 13,120 | 48 / 1 / 18,470 | JR 埼京→上野東京ライン | 埼京 167% (板橋→池袋); 武蔵野 156% |
| Saitama-Midori | 東浦和 | 49 / 1 / 15,600 | 53 / 2 / 17,970 | JR 武蔵野→京浜東北 | 武蔵野 156% (東浦和→南浦和) |
| Saitama-Midori | 浦和美園 | 55 / 1 / 32,230 | 56 / 1 / 27,690 | 埼玉高速→南北/丸ノ内 | 埼玉高速 118%; 南北 156% |
| Kawaguchi | 川口 | 30 / 1 / 10,480 | 35 / 1 / 13,730 | JR 京浜東北 | 京浜東北 158% (川口→赤羽) |
| Toda | 戸田公園 | 32 / 1 / 10,480 | 41 / 1 / 15,830 | JR 埼京 | 埼京 167% |
| Warabi | 蕨 | 35 / 1 / 10,480 | 41 / 1 / 15,330 | JR 京浜東北 | 京浜東北 158% |
| Koshigaya | 越谷レイクタウン | 61 / 1 / 21,290 | 59 / 2 / 24,810 | JR 武蔵野 | 武蔵野 156% |
| Koshigaya | 新越谷 | 46 / 2 / 25,110 | 46 / 1 / 19,900 | 東武スカイツリーライン→千代田/日比谷 | 東武伊勢崎 142% |
| Misato | 三郷中央 | 41 / 1 / 26,850 | 42 / 1 / 24,050 | TX | TX 151% |
| Misato | 新三郷 | 56 / 2 / 18,720 | 56 / 1 / 21,290 | JR 武蔵野→常磐 | 武蔵野 156% |
| Yashio | 八潮 | 37 / 1 / 24,570 | 38 / 1 / 20,270 | TX | TX 151% |
| Soka | 草加 | 40 / 2 / 23,230 | 40 / 1 / 18,020 | 東武スカイツリーライン→千代田 | 東武伊勢崎 142% |
| Asaka | 朝霞台 / 北朝霞 | 46 / 1 / 20,250 | 44 / 1 / 20,250 | 東武東上→丸ノ内 (池袋) | 東上 131% |
| Asaka | 朝霞 | 43 / 1 / 18,860 | 41 / 1 / 18,860 | 東武東上→丸ノ内 | 東上 131% |
| *Added:* Wako | 和光市 | 40 / 1 / 18,600 | 38 / 1 / 18,600 | 東武東上 / 有楽町・副都心 始発 | 東上 131% |
| *Added:* Tokorozawa | 所沢 | 60 / 1 / 22,970 | 58 / 1 / 22,970 | 西武池袋→丸ノ内 | 西武池袋 130% |

#### Kanagawa

| Municipality | Station | → Tokyo Stn | → Otemachi | Main line | Crowding FY2025 |
|---|---|---|---|---|---|
| Kawasaki-Nakahara | 武蔵小杉 | 18 / 0 / 10,480 | 31 / 1 / 17,110 | JR 横須賀 | 横須賀 138% (武蔵小杉→西大井); 南武 156% |
| Kawasaki-Nakahara | 元住吉 | 37 / 1 / 15,470 | 39 / 2 / 17,910 | 東急東横→JR (武蔵小杉) | 東横 124% |
| Kawasaki-Takatsu | 溝の口 | 44 / 1 / 13,120 | 41 / 0 / 17,420 | 田園都市→半蔵門 direct | 田園都市 138%; 南武 156% |
| Kawasaki-Kawasaki | 川崎 | 20 / 0 / 10,480 | 31 / 1 / 17,110 | JR 東海道 (上野東京ライン) | 東海道 159% (川崎→品川) |
| Kawasaki-Saiwai | 新川崎 | 21 / 0 / 10,480 | 32 / 1 / 17,110 | JR 横須賀 | 横須賀 138% |
| Kawasaki-Saiwai | 鹿島田 | 30 / 0 / 10,480 | 42 / 2 / 19,750 | walk to 新川崎 + 横須賀 | 横須賀 138%; 南武 156% |
| Kawasaki-Miyamae | 宮前平 | 53 / 2 / 17,260 | 50 / 0 / 17,420 | 田園都市→半蔵門 | 田園都市 138% |
| *Added:* Kawasaki-Asao | 新百合ヶ丘 | 49 / 2 / 18,650 | 44 / 1 / 18,650 | 小田急→千代田 | 小田急 150% |
| *Added:* Kawasaki-Tama | 登戸 | 39 / 2 / 16,720 | 34 / 1 / 16,720 | 小田急→千代田 | 小田急 150%; 南武 156% |
| Yokohama-Kohoku | 日吉 | 38 / 1 / 15,470 | 40 / 1 / 18,770 | 東急目黒→三田 direct | 東急目黒 133% |
| Yokohama-Kohoku | 新横浜 | 46 / 1 / 21,670 | 48 / 1 / 22,700 | 東急新横浜線→三田 | 新横浜線 62%; 横浜線 140% |
| Yokohama-Kohoku | 綱島 | 42 / 1 / 17,260 | 44 / 2 / 18,770 | 東急東横 | 東横 124% |
| Yokohama-Tsuzuki | センター南 | 58 / 2 / 26,030 | 64 / 1 / 29,330 | ブルー/グリーンライン→東急 | 横浜市4号 134% |
| Yokohama-Aoba | たまプラーザ | 53 / 2 / 18,570 | 49 / 0 / 18,730 | 田園都市→半蔵門 direct | 田園都市 138% |
| Yokohama-Aoba | 青葉台 | 60 / 2 / 19,340 | 56 / 0 / 19,500 | 田園都市→半蔵門 direct | 田園都市 138% |
| Yokohama-Kanagawa | 東神奈川 | 38 / 1 / 15,600 | 47 / 2 / 22,230 | JR 京浜東北→東海道 | 京浜東北 159% |
| Yokohama-Nishi | 横浜 | 30 / 0 / 15,600 | 40 / 1 / 22,230 | JR 東海道 | 東海道 159% |
| *Added:* Yokohama-Totsuka | 戸塚 | 40 / 0 / 22,590 | 52 / 1 / 29,220 | JR 東海道 | 東海道 159% |
| *Added:* Yokohama-Tsurumi | 鶴見 | 31 / 1 / 13,120 | 40 / 2 / 19,750 | JR 京浜東北→東海道 | 東海道 159% |
| *Added:* Sagamihara-Midori | 橋本 | 77 / 2 / 23,150 | 77 / 1 / 28,000 | 京王相模原 (JR 横浜線 alt.) | 京王 145% |

#### JR fare revision of 2026-03-14 (affects every JR pass above)
- JR East raised fares on 2026-03-14: average +7.1% overall, +7.8% on ordinary fares, **+12.0% on commuter passes** and +4.9% on student passes. The cheaper 電車特定区間 and 山手線内 fare zones in Tokyo were merged into the standard 幹線 fare, so inner-Tokyo passes rose most. Some reports say passes inside the Yamanote loop rose about 22%, or more than 20% in places — [Travel Watch](https://travel.watch.impress.co.jp/docs/news/1645631.html); [All About](https://allabout.co.jp/gm/gc/513159/); [JR East application PDF](https://www.jreast.co.jp/2026unchin-kaitei/assets/pdf/shinsei.pdf)
- Reported examples: the 1-month pass rose ¥1,550 for 東京–新宿 and ¥960 for 東京–横浜 — [All About](https://allabout.co.jp/gm/gc/513159/)
- The discount rate on 6-month commuter passes was also revised — [JR East press 2024-12-06](https://www.jreast.co.jp/press/2024/20241206_ho02.pdf)
- Seibu also revised fares on 2026-03-14. Coverage gave 池袋–所沢 IC fare ¥356→¥402 — [tetsudo.com calendar](https://www.tetsudo.com/event/calendar/20260314/). The ¥356→¥402 figure came from a Travel Watch article I saw only as a search snippet, so the exact article URL is unverified.

### Inferences
- **Fastest 0-transfer commutes under 35 min (station-to-station):** 上野 5, 錦糸町 8, 田町/四ツ谷 9, 新小岩 13, 大井町 17, **武蔵小杉 18, 市川 19, 川崎 20, 新浦安 20, 新川崎 21**, 蒲田 24, **浦和 26, 船橋 26, 松戸 27**, 荻窪 27, **津田沼 30, 横浜 30, さいたま新都心 31, 吉祥寺 33, 海浜幕張 34, 大宮 34**. Door-to-desk is roughly +10 min at home and +5–10 min at the office.
- **Otemachi beats Tokyo Station** for places on through-running subway lines: 田園都市 (たまプラーザ 49 vs 53 min, with no transfer), 小田急→千代田 (町田 53 vs 58), 東西線 (浦安 25 vs 33, 西葛西 20 vs 28, 八千代緑が丘 52 with no transfer), 常磐緩行→千代田 (金町 30 vs 37) and 東武→千代田 (草加/新越谷). For Tokyo-Station JR lines (総武快速, 常磐, 東海道/横須賀, 上野東京ライン) Tokyo Station is 10–14 min faster.
- **Pass-cost outliers:** TX, Hokuso and Toyo Rapid. A 1-month pass from つくば costs ¥52,410, from 千葉ニュータウン中央 ¥44,600–47,160 and from 柏の葉キャンパス ¥31,660, against ¥21,290 from 柏 or 我孫子 on JR. Many employers cap commuting allowances (non-taxable to ¥150,000/month, but company rules vary), so check your own employer's cap.
- **Best time per yen** (JR, 0 transfers, ≤35 min, ≤¥18,500/month): 市川, 新浦安, 武蔵小杉, 川崎, 新川崎, 船橋, 浦和, 松戸, 津田沼, 横浜 and 海浜幕張.
- Yahoo's arrive-by search shows the latest-departing trains, which in a few cases are not the fastest service. For example, 千葉's quickest 総武快速 is about 38–41 min and 佐倉's is about 55–61 min. Treat ±5 min as noise.

### Gaps
- No door-to-station times: these depend on the specific address. The +10 min used here is an assumption.
- I did not run NAVITIME or Jorudan cross-checks (Jorudan blocks scripted access). SUUMO/LIFULL "東京駅30分圏" articles were not consulted.
- Crowding figures are each line's single worst section, not the exact section each municipality's riders use. For example, the 日比谷線 163% is measured at 三ノ輪→入谷 (north side) and does not describe 中目黒/恵比寿 inbound.

## Q2. Which have a seated/reserved commuter option, and at what price?

### Takeaway
Seated options are of three kinds. (1) **JR Green cars** on 総武快速/横須賀, 常磐快速/中電, 東海道, 宇都宮/高崎 and, since 2025, 中央快速/青梅: ¥750 one way with Suica up to 50 km and ¥1,000 up to 100 km, so about ¥15,000/month for 20 inbound trips. Green seats are unreserved. (2) **Private reserved liners**: 京成 Morning Liner (¥250–950 by distance), 京王ライナー (¥500 ticketless from Oct 2026), THライナー (¥580–680 as of 2020), TJライナー (≈¥470), S-TRAIN (fee not confirmed). (3) **JR limited expresses usable with a pass plus express ticket**: さざなみ from 木更津/五井/蘇我, ときわ from 柏, しおさい/成田エクスプレス from 千葉/佐倉. Starting stations (始発) give free seating at no cost.

### Cited Findings
- **JR Green car (普通列車グリーン料金):** Suica pre-purchase ¥750 up to 50 km, ¥1,000 up to 100 km, ¥1,550 over 100 km. Paper tickets or on-board purchase cost ¥1,010 / ¥1,260 / ¥1,810, ¥260 more — [Traffic News](https://trafficnews.jp/post/529815); [Financial Field](https://financial-field.com/living/entry-411535)
- **Chuo Rapid/Ome Green car** became a paid service on 2025-03-15. It runs on Chuo Rapid 東京–大月 and Ome Line 立川–青梅. Tokyo–Hachioji costs ¥750 with Suica — [Traffic News](https://trafficnews.jp/post/529815); [Financial Field](https://financial-field.com/living/entry-411535)
- Coverage of the 2026-03-14 JR East revision reports that limited express and Green fees were **left unchanged**. Ordinary fares, commuter passes, Green commuter passes (グリーン定期券) and FREX Shinkansen passes changed — [JR East press 2025-10-08](https://www.jreast.co.jp/press/2025/20251008_ho03.pdf) (as summarised in search results; I did not read the PDF directly)
- **京成 Morning Liner / Evening Liner:** these use Skyliner cars with all seats reserved. Since the Nov 2024 timetable change the fee depends on distance: ¥250 up to 20 km, ¥450 for 21–40 km, ¥500 for 41–48 km, ¥600 for 49–65 km, ¥950 for 66–70 km (previously a flat ¥450) — [Impress Watch](https://www.watch.impress.co.jp/img/ipw/docs/1633/498/html/keisei_01_o.jpg.html); [鉄道チャンネル](https://tetsudo-ch.com/12983805.html)
- Morning Liner stops: 成田空港, 空港第2ビル, 京成成田, **京成佐倉, 八千代台, 京成船橋**, 青砥, 日暮里, 京成上野. It does **not** stop at ユーカリが丘 — [路線図ドットコム](https://rosen-zu.net/keisei/keisei_morning_evening-top/keisei_morning_evening-rosenzu/keisei_morning_evening/)
- The "Morning PASS" (all 4 morning liners for 1 month) cost ¥8,150 in 2022. I could not confirm the current price — [鉄道チャンネル](https://tetsudo-ch.com/12328072.html)
- **京王ライナー:** the seat fee was ¥410. From **2026-10-01** weekday fees are ¥500 ticketless or ¥600 from a ticket machine, and a weekday-only ¥400 standing (立席) option was added on some trains — [鉄道チャンネル](https://tetsudo-ch.com/13036234.html); [tabiris](https://tabiris.com/?p=65648)
- Upbound Keio Liners allow boarding only along the line and drop-off only at 明大前/新宿. The 京王八王子 branch stops at 北野, 高幡不動, 聖蹟桜ヶ丘, 分倍河原 and **府中**. The 橋本 branch stops at 橋本, **南大沢, 京王多摩センター** and 京王永山 — [Traffic News](https://trafficnews.jp/post/79595/2)
- The March 2025 timetable added 2 weekday morning upbound Keio Liners: 京王八王子 dep 08:46 and 橋本 dep 08:14 — [Traffic News](https://trafficnews.jp/post/520893)
- **THライナー** (東武 久喜 → Hibiya line 霞ケ関/恵比寿): ¥580–680 at launch in 2020, for example ¥680 from 久喜, 東武動物公園 or 春日部 to Hibiya-line stations. Boarding without a reservation adds ¥200 — [Traffic News](https://trafficnews.jp/post/94013/2); [Tokyo Metro TH Liner page](http://www.tokyometro.jp/th-liner/index.html) (fare table is an image; not read)
- **S-TRAIN** runs weekday mornings from 所沢 to 豊洲 via the Yurakucho line, all seats reserved, with a ¥200 surcharge if bought on board. In Seibu's July 2023 fee revision, S-TRAIN fees were **kept unchanged** because of multi-operator through-running. I did not find the current fee — [Tokyo Metro S-TRAIN page](http://www.tokyometro.jp/s-train/index.html); [鉄道チャンネル](https://tetsudo-ch.com/12869351.html)
- **TJライナー** (東武東上線): reserved-seat fee ¥470 for upbound trains toward 池袋 (¥370 downbound), from an undated Tobu page — [Tobu TJ Liner](https://www.tobu.co.jp/railway/tj/tj_station/)
- **特急さざなみ**: runs weekdays only, morning upbound and evening downbound, between 東京 and 君津, and serves commuters. Total fare plus reserved express from 東京: 蘇我 ¥1,570, **五井 ¥2,060, 木更津 ¥2,430**, 君津 ¥2,620. The ticketless express fee is ¥100 cheaper — [jr-group.jp (third-party fare site)](https://jr-group.jp/sazanami-ryokin/); [新幹線研究所 timetable](https://shinkansenkenkyu.com/time-sazanami/)
- **特急ときわ** stops at 柏 but not 我孫子 or 取手. Example: ときわ92号 leaves 柏 at 08:30 and reaches 上野 at 08:58. It was listed as Friday-only through 9/25, so check operating days. All seats are reserved, or you can buy a 座席未指定券. A えきねっと ticketless express ticket works with a commuter pass as the base fare — [JR East timetable](https://timetables.jreast.co.jp/2610/train/185/187771.html); [えきねっと FAQ](https://secure.okbiz.jp/eki-net/faq/show/1865)

### Inferences
- **Monthly cost of a guaranteed or near-guaranteed seat on top of the pass** (20 inbound trips): JR Green ≈ ¥15,000 (≤50 km) or ¥20,000 (≤100 km). Keio Liner ≈ ¥10,000 at ¥500. Keisei Morning Liner ≈ ¥9,000–12,000 at ¥450–600 each, or about ¥8,150 with a monthly PASS if still sold. さざなみ from 木更津: express portion ≈ ¥2,430 total fare+express minus the regular fare, which works out to roughly ¥20,000+/month. I did not find the exact express-only fee.
- Distances to 京成上野 are my estimates, not checked against Keisei's tariff. 京成船橋 (~25 km) and 八千代台 (~37 km) fall in the ¥450 band and 京成佐倉 (~51 km) in the ¥600 band. Note that the Keisei liner ends at Ueno/Nippori, not Tokyo Station.
- **Municipalities with a reasonable seated option** (my judgement):
  - Chiba-shi: 総武快速 Green; 千葉 is the starting station for many 総武快速 trains; しおさい/成田エクスプレス.
  - 津田沼: some 総武快速 start here.
  - Funabashi/Ichikawa: Green, crowded.
  - Sakura: Green, plus Keisei Morning Liner from 京成佐倉.
  - Yachiyo: Morning Liner at 八千代台; 東葉勝田台 is a starting station.
  - 五井/袖ケ浦/木更津: Green, plus さざなみ.
  - Kashiwa: Green, plus ときわ.
  - Abiko/Toride: Green; 取手 is a starting station.
  - Tsukuba: TX starting station, but **no reserved or Green service on TX**.
  - Urawa/Omiya/Shintoshin: Green on 宇都宮/高崎.
  - Kawasaki/Musashi-Kosugi/Yokohama/Totsuka: Green on 東海道/横須賀.
  - Chuo line (Kichijoji–Tachikawa): Green; 三鷹 is the starting station for 東西線 and 中央緩行.
  - Fuchu/Tama Center/Minami-Osawa: Keio Liner to 新宿, then about 10 min on the 中央快速.
  - Wako: 有楽町/副都心 starting station.
  - Tokorozawa: S-TRAIN to 有楽町線.
  - 中目黒 / 北千住: 日比谷線 starting stations.
- **No seated option except luck:** 田園都市 line (たまプラーザ, 青葉台, 宮前平, 溝の口), 京浜東北 and 埼京 stations, 武蔵野 line (東浦和, 越谷レイクタウン, 新三郷), 東武スカイツリーライン local stations (草加, 新越谷; THライナー stops are unconfirmed), and Hokuso (except 印西牧の原, where some trains start).

### Gaps
- I could not confirm current (2026) S-TRAIN, THライナー and TJライナー fees, or the Keisei Morning PASS price. The official fare tables are images.
- I found no current data on Odakyu's morning メトロ/Romancecar commuter services (モーニングウェイ to 千代田線/大手町) or their price.
- I did not obtain the 成田エクスプレス / しおさい express fee for 千葉–東京 or 佐倉–東京, or the number of morning trains.
- I did not confirm whether a Tokyu 田園都市 Q SEAT service runs inbound in the morning.
- 始発 (starting-station) claims are from general knowledge of operations, not from 2026 timetables. Verify on station timetables.

## Q3. Which lines are most crowded (top congestion sections)?

### Takeaway
In FY2025 (MLIT, published 2026-07-28) Tokyo-area crowding rose again: the average of the 31 main sections went from **139% in FY2024 to 143%**. The worst heavy-rail sections are **埼京 167%, 日比谷 163%, 総武快速 160%, 東西 160%, 東海道 159%, 京浜東北 158–159%, 中央快速 158%, 京成押上 157%, 南武 156%, 武蔵野 156%, 南北 156%**. The least crowded lines that matter for this study are 北総 90%, 東葉 105%, 京王相模原 101%, 新横浜線 62% and 小田急多摩 77%.

### Cited Findings
- Tokyo-area average for the 31 main sections: **143% in FY2025, 139% in FY2024** (+4 pts). Osaka 117%, Nagoya 126%. The rate is the average over the peak 1 hour, measured mainly on day(s) in Oct–Nov 2025. Tokyo Metro switched to a 5-weekday average from FY2025 — [MLIT press release](https://www.mlit.go.jp/report/press/tetsudo04_hh_000139.html); [資料2](https://www.mlit.go.jp/report/press/content/002015141.pdf)
- **Most-crowded sections FY2025 (Tokyo area, ≥145%)** — [MLIT 資料3](https://www.mlit.go.jp/report/press/content/002015142.pdf); [資料2](https://www.mlit.go.jp/report/press/content/002015141.pdf):

| Rank | Line | Section | Time | Rate |
|---|---|---|---|---|
| 1 | JR 埼京 | 板橋→池袋 | 7:51–8:51 | **167%** |
| 2 | Metro 日比谷 | 三ノ輪→入谷 | 7:50–8:50 | 163% |
| 3 | JR 総武快速 | 新小岩→錦糸町 | 7:31–8:31 | 160% |
| 3 | Metro 東西 | 木場→門前仲町 | 7:50–8:50 | 160% |
| 5 | JR 東海道 | 川崎→品川 | 7:39–8:39 | 159% |
| 5 | JR 京浜東北 | 大井町→品川 | 7:35–8:35 | 159% |
| 7 | JR 京浜東北 | 川口→赤羽 | 7:20–8:20 | 158% |
| 7 | JR 中央快速 | 中野→新宿 | 7:35–8:35 | 158% |
| 9 | 京成押上 | 京成曳舟→押上 | 7:40–8:40 | 157% |
| 10 | JR 南武 | 武蔵中原→武蔵小杉 | 7:30–8:30 | 156% |
| 10 | JR 武蔵野 | 東浦和→南浦和 | 7:05–8:05 | 156% |
| 10 | Metro 南北 | 駒込→本駒込 | 8:00–9:00 | 156% |
| 13 | Metro 丸ノ内 | 新大塚→茗荷谷 | 8:00–9:00 | 154% |
| 14 | Metro 銀座 | 赤坂見附→溜池山王 | 8:00–9:00 | 153% |
| 14 | Metro 有楽町 | 東池袋→護国寺 | 7:45–8:45 | 153% |
| 16 | 都営新宿 | 西大島→住吉 | 7:40–8:40 | 152% |
| 17 | つくばエクスプレス | 青井→北千住 | 7:29–8:29 | 151% |
| 17 | JR 総武緩行 | 錦糸町→両国 | 7:34–8:34 | 151% |
| 19 | 小田急小田原 | 世田谷代田→下北沢 | 7:35–8:35 | 150% |
| 19 | Metro 千代田 | 町屋→西日暮里 | 7:45–8:45 | 150% |
| 21 | 西武新宿 | 下落合→高田馬場 | 7:41–8:41 | 148% |
| 22 | 都営大江戸 | 中井→東中野 | 7:50–8:50 | 147% |
| 23 | 都営三田 | 西巣鴨→巣鴨 | 7:40–8:40 | 146% |
| 24 | 京王 | 下高井戸→明大前 | 7:45–8:45 | 145% |

- **Other lines relevant to the candidate list (FY2025)** — [MLIT 資料3](https://www.mlit.go.jp/report/press/content/002015142.pdf):
  - 東武伊勢崎 (スカイツリーライン) 小菅→北千住 142%
  - 常磐快速 三河島→日暮里 142% (includes 中電)
  - 横浜線 小机→新横浜 140%
  - 横須賀 武蔵小杉→西大井 138%
  - 田園都市 池尻大橋→渋谷 138%
  - 京成本線 大神宮下→京成船橋 137%
  - 山手 135–136%
  - 横浜市4号(グリーンライン) 134%
  - 東急目黒 133%
  - 高崎 宮原→大宮 131%
  - 東武東上 北池袋→池袋 131%
  - 西武池袋 130%
  - 常磐緩行 亀有→綾瀬 128%
  - 小田急江ノ島 125%
  - 井の頭 125%
  - 東横 124%
  - 京葉 葛西臨海公園→新木場 123%
  - 東武野田 新船橋→船橋 123%
  - 宇都宮 土呂→大宮 120%
  - 京急 120%
  - 埼玉高速 118%
  - りんかい 118%
  - 京成松戸線 前原→新津田沼 117%
  - 相鉄 116%
  - 東葉高速 東海神→西船橋 105%
  - 西武有楽町 102%
  - 東武野田 初石→流山おおたかの森 102%
  - 京王相模原 京王多摩川→調布 101%
  - 中央緩行 93%
  - 北総 新柴又→京成高砂 90%
  - 小田急多摩 77%
  - 東急新横浜線 62%
- **Non-heavy-rail feeders** — [MLIT 資料3](https://www.mlit.go.jp/report/press/content/002015142.pdf):
  - 日暮里・舎人ライナー 176% (赤土小学校前→西日暮里), the highest of any Tokyo-area line
  - 千葉都市モノレール 157% (千葉公園→千葉)
  - 多摩都市モノレール 148% (泉体育館→立飛)
  - ニューシャトル 127%
- A press summary also highlighted 日比谷 163% and 東西 160% — [鉄道チャンネル](https://tetsudo-ch.com/13033751.html)

### Inferences
- Rough crowding guide: 150% means you can open a newspaper; 180% means you can fold one and read it; 200% means bodies touch but you can read a magazine. This guide is the MLIT/railway-industry rule of thumb, from general knowledge rather than the sources above.
- **Crowding penalty by corridor for family-location purposes:** the 総武快速 corridor (船橋, 市川, 津田沼, 千葉), the 東西線 corridor (浦安, 西葛西, 西船橋, 八千代 via 東葉) and the 京浜東北/埼京 corridor (川口, 蕨, 戸田, 赤羽) run at 158–167%. 京葉 (新浦安, 海浜幕張) at 123%, 常磐快速 at 142% and 横須賀 at 138% (武蔵小杉, 新川崎) are noticeably less crowded for similar times. This makes **新浦安 / 海浜幕張 (京葉)** and **武蔵小杉 / 新川崎 (横須賀)** relatively better on crowding, though 武蔵小杉's 横須賀 platform has well-known boarding congestion that the figures do not capture.
- TX (151%) is crowded at the Tokyo end. A starting station (つくば, 守谷) gives a seat, but riders from 柏の葉 or 八潮 board crowded trains.
- Tokyo crowding has risen for several years since the pandemic low (139→143 in one year), so later years may be worse.

### Gaps
- MLIT does not publish per-station or per-direction crowding beyond each line's single worst section. Section-specific crowding (e.g., 総武快速 at 船橋) is not available from this source.
- I did not pull a FY2024 per-line comparison table; only the 31-section average change (139→143) is cited.
