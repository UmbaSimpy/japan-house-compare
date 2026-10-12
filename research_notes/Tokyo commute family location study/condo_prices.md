# Condo (マンション) prices and large-unit (≥90 m²) availability by municipality: Tokyo commuting area (data as of 2025–Oct 2026)

Method note for the report writer. The per-municipality numbers below come from a **live crawl of SUUMO 中古マンション search results on 2026-10-12**, run by this researcher with the same query SUUMO's own site uses. For each municipality the crawl took (a) the total used-condo listing count, (b) every listing with 専有面積 ≥90 m² (SUUMO filter `mb=90`), and (c) every listing between 70 and 80 m² (`mb=70&mt=80`), as a comparison band roughly equal to Tokyo Kantei's 70 m² benchmark. The query template is `https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=011&ta={pref}&sc={JIS code}&mb=90&mt=9999999&pc=100` (example for Minato: [SUUMO Minato ≥90 m²](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=011&ta=13&jspIdFlg=patternShikugun&sc=13103&kb=1&kt=9999999&mb=90&mt=9999999&ekTjCd=&ekTjNm=&tj=0&cnb=0&cn=9999999&srch_navi=1&pc=100)).
- Listings were de-duplicated by (building name, rounded area, price), because the same unit is often listed by more than one agent.
- These are **asking prices (売出価格), not contract prices**. REINS FY2025 data show that 23-ward asking ¥/m² (168.95万) runs about 26% above contract ¥/m² (134.54万). For 80–100 m² units in the wards the gap is about 49% (228.10万 asking vs 153.09万 contract) ([REINS NMW 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)). Outside the wards the gap is small: Saitama 43.31 vs 44.05, Chiba 39.87 vs 40.31. Treat 23-ward asking medians as an upper bound.
- Land prices are the 2026 地価公示 residential-use averages per municipality, aggregated by トチノカチ from MLIT data ([e.g. Urayasu page](https://totinokati.com/kakaku/place/12227/kouji/); the URL pattern is `/kakaku/place/{JIS}/kouji/`). The averages are not "standard-plot" values, and the set of survey points changes slightly from year to year.
- LIFULL HOME'S 相場 pages could not be collected in bulk because they sit behind a bot-challenge (AWS WAF "challenge" response). That challenge was not bypassed. Only one HOME'S page (Minato) was read before the block.
- Tokyo Kantei publishes only prefecture/major-city aggregates publicly, and no ward-level 70 m² table was found (see Gaps).

## Q1: Per-municipality condo price, new-condo price, trend, 90–100 m² price, large-unit availability, land price

### Takeaway
A 90–100 m² used condo asks a median of roughly ¥140M–¥420M in the central/west-central 23 wards. It asks about ¥70–100M in the outer wards (Nerima, Adachi, Edogawa, Suginami, Ota). Prices then fall to about ¥55–80M in Yokohama's northern wards, Kawasaki's suburban wards, Urayasu and Makuhari. In Chiba NT, Tsukuba, Funabashi, Matsudo, Kashiwa (old stock), southern Saitama and Chiba-shi's inland wards the median is ¥15–50M. In every suburb, units built after 2000 cost about 20–60% more than the all-age median.

### Cited Findings

**Main table**: SUUMO used-condo listings crawled 2026-10-12 ([SUUMO search](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)) and 2026 公示地価 residential averages ([トチノカチ](https://totinokati.com/kakaku/13/kouji/)).
- 万円 = ¥10,000, so 5,000万円 = ¥50M.
- "n" is the number of de-duplicated listings behind the median.
- "95 m² × 70–80 m² unit price" is the median ¥/m² of the 70–80 m² band times 95. It is a second estimate of a 95 m² unit's price that is less distorted by the old stock in the large-unit band.
- In the bucket column, "(thin)" means fewer than 5 listings.

| Municipality | SUUMO used listings (all) | ≥90 m² listings: raw / dedup | ≥90 m² share | ≥100 m² (dedup) | Median ask 90–105 m², all ages (万円) [n] | Median ¥/m² 90–105 m² (万) | Median ask 90–110 m², built ≥2000 (万円) [n] | Median ¥/m² 70–80 m² (万) [n] | 95 m² × 70–80 m² unit price (万円) | 公示地価 住宅地 2026 avg (万円/m²) | Land YoY 2026 | Land 5-yr (2021→2026) | 90–100 m² bucket (all-age median) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 千代田区 (Chiyoda) | 648 | 122 / 83 | 18.8% | 55 | 42,000 [38] | 446.2 | 43,245 [42] | 367.9 [46] | 34,953 | 372 | +11.0% | +29.9% | >¥120M |
| 中央区 (Chuo) | 2240 | 131 / 112 | 5.8% | 50 | 24,350 [82] | 249.5 | 26,650 [78] | 224.6 [461] | 21,340 | 176 | +13.7% | +45.6% | >¥120M |
| 港区 (Minato) | 3397 | 648 / 503 | 19.1% | 380 | 36,000 [214] | 365.4 | 43,450 [230] | 320.5 [366] | 30,449 | 294 | +16.3% | +45.2% | >¥120M |
| 新宿区 (Shinjuku) | 2183 | 131 / 85 | 6.0% | 50 | 22,480 [42] | 234.3 | 24,800 [37] | 231.9 [188] | 22,030 | 110 | +11.8% | +37.6% | >¥120M |
| 文京区 (Bunkyo) | 1163 | 66 / 43 | 5.7% | 26 | 18,480 [23] | 185.1 | 25,800 [11] | 193.5 [102] | 18,379 | 141 | +15.1% | +44.1% | >¥120M |
| 台東区 (Taito) | 1048 | 26 / 14 | 2.5% | 9 | 11,740 [6] | 117.5 | 23,980 [3] | 165.1 [54] | 15,685 | 116 | +14.3% | +34.7% | ¥80–120M |
| 墨田区 (Sumida) | 763 | 16 / 15 | 2.1% | 9 | 17,500 [7] | 189.5 | 17,500 [6] | 128.7 [54] | 12,231 | 60.5 | +13.2% | +37.9% | >¥120M |
| 江東区 (Koto) | 2163 | 124 / 88 | 5.7% | 43 | 12,800 [57] | 138.0 | 14,800 [47] | 167.4 [447] | 15,907 | 67.3 | +11.8% | +36.8% | >¥120M |
| 品川区 (Shinagawa) | 1592 | 108 / 73 | 6.8% | 46 | 22,380 [34] | 238.0 | 28,990 [23] | 206.5 [186] | 19,620 | 122 | +14.1% | +46.0% | >¥120M |
| 目黒区 (Meguro) | 1177 | 108 / 62 | 9.2% | 39 | 14,500 [29] | 154.2 | 18,850 [10] | 203.1 [99] | 19,292 | 134 | +13.9% | +45.1% | >¥120M |
| 大田区 (Ota) | 1233 | 54 / 29 | 4.4% | 10 | 10,245 [24] | 106.8 | 10,480 [13] | 106.8 [127] | 10,146 | 61.9 | +7.8% | +25.0% | ¥80–120M |
| 世田谷区 (Setagaya) | 2173 | 243 / 185 | 11.2% | 94 | 13,780 [103] | 141.8 | 15,490 [71] | 158.6 [294] | 15,066 | 75.9 | +7.7% | +21.8% | >¥120M |
| 渋谷区 (Shibuya) | 1754 | 250 / 195 | 14.3% | 132 | 31,800 [93] | 334.5 | 35,500 [68] | 302.7 [140] | 28,752 | 179 | +14.0% | +42.4% | >¥120M |
| 中野区 (Nakano) | 898 | 45 / 30 | 5.0% | 19 | 9,790 [14] | 104.0 | 13,300 [6] | 171.9 [85] | 16,331 | 76.1 | +9.1% | +32.6% | ¥80–120M |
| 杉並区 (Suginami) | 1116 | 68 / 37 | 6.1% | 18 | 8,880 [26] | 95.4 | 9,630 [16] | 124.7 [119] | 11,846 | 70.9 | +8.5% | +29.1% | ¥80–120M |
| 豊島区 (Toshima) | 1225 | 29 / 23 | 2.4% | 13 | 23,230 [14] | 231.1 | 23,480 [12] | 155.2 [122] | 14,746 | 90.7 | +12.8% | +44.2% | >¥120M |
| 北区 (Kita) | 680 | 16 / 12 | 2.4% | 5 | 10,980 [7] | 121.6 | 25,300 [6] | 109.7 [90] | 10,423 | 72.6 | +11.6% | +41.2% | ¥80–120M |
| 荒川区 (Arakawa) | 556 | 13 / 13 | 2.3% | 8 | 8,249 [6] | 88.1 | 8,980 [5] | 112.6 [76] | 10,701 | 72.3 | +11.9% | +37.4% | ¥80–120M |
| 板橋区 (Itabashi) | 1229 | 29 / 20 | 2.4% | 11 | 7,340 [12] | 73.6 | 11,000 [7] | 98.1 [145] | 9,321 | 54.9 | +8.6% | +27.5% | ¥50–80M |
| 練馬区 (Nerima) | 1046 | 86 / 56 | 8.2% | 16 | 7,480 [41] | 75.3 | 7,490 [9] | 102.2 [156] | 9,709 | 46.9 | +6.4% | +22.0% | ¥50–80M |
| 足立区 (Adachi) | 1198 | 45 / 36 | 3.8% | 16 | 7,180 [21] | 74.4 | 7,180 [15] | 73.8 [155] | 7,010 | 40.5 | +8.6% | +26.4% | ¥50–80M |
| 葛飾区 (Katsushika) | 676 | 7 / 3 | 1.0% | 0 | 4,280 [3] | 46.6 | – [0] | 91.8 [98] | 8,721 | 38.1 | +5.5% | +18.9% | <¥50M (thin) |
| 江戸川区 (Edogawa) | 948 | 75 / 40 | 7.9% | 18 | 6,989 [30] | 74.5 | 9,085 [12] | 86.0 [203] | 8,169 | 43.0 | +5.5% | +19.3% | ¥50–80M |
| 武蔵野市 (Musashino) | 269 | 32 / 23 | 11.9% | 12 | 14,980 [19] | 158.2 | 17,280 [14] | 133.5 [34] | 12,683 | 66.5 | +5.4% | +20.9% | >¥120M |
| 三鷹市 (Mitaka) | 281 | 14 / 4 | 5.0% | 1 | 7,398 [3] | 78.7 | 7,355 [2] | 98.3 [65] | 9,342 | 48.3 | +4.9% | +16.8% | ¥50–80M (thin) |
| 調布市 (Chofu) | 291 | 5 / 4 | 1.7% | 2 | 4,539 [2] | 49.6 | – [0] | 85.9 [68] | 8,156 | 42.6 | +6.2% | +24.8% | <¥50M (thin) |
| 府中市 (Fuchu) | 325 | 18 / 9 | 5.5% | 3 | 5,799 [7] | 61.0 | 5,799 [7] | 68.9 [64] | 6,549 | 35.3 | +4.5% | +20.7% | ¥50–80M |
| 小金井市 (Koganei) | 171 | 7 / 6 | 4.1% | 3 | 5,590 [4] | 58.1 | 8,590 [2] | 108.9 [30] | 10,342 | 38.7 | +4.7% | +14.3% | ¥50–80M (thin) |
| 立川市 (Tachikawa) | 261 | 16 / 13 | 6.1% | 5 | 4,644 [10] | 49.1 | 4,644 [8] | 67.7 [55] | 6,427 | 30.6 | +7.3% | +22.0% | <¥50M |
| 町田市 (Machida) | 326 | 53 / 36 | 16.3% | 13 | 4,130 [28] | 44.2 | 4,935 [16] | 67.1 [66] | 6,379 | 16.6 | +3.5% | +8.7% | <¥50M |
| 多摩市 (Tama-shi) | 260 | 56 / 52 | 21.5% | 16 | 2,780 [39] | 29.4 | 7,450 [4] | 48.4 [61] | 4,599 | 19.9 | +3.2% | +11.1% | <¥50M |
| 稲城市 (Inagi) | 140 | 53 / 42 | 37.9% | 27 | 5,480 [18] | 58.4 | 5,980 [9] | 67.6 [10] | 6,424 | 26.3 | +3.6% | +15.8% | ¥50–80M |
| 千葉市美浜区 (Chiba-Mihama) | 483 | 84 / 58 | 17.4% | 18 | 5,780 [49] | 62.7 | 6,780 [35] | 58.1 [143] | 5,520 | 19.4 | +5.8% | +19.4% | ¥50–80M |
| 千葉市中央区 (Chiba-Chuo) | 430 | 18 / 17 | 4.2% | 6 | 3,830 [14] | 39.8 | 4,380 [9] | 48.3 [81] | 4,587 | 16.1 | +7.5% | +25.5% | <¥50M |
| 千葉市稲毛区 (Chiba-Inage) | 288 | 30 / 18 | 10.4% | 5 | 2,490 [13] | 27.1 | 5,980 [7] | 27.7 [85] | 2,631 | 17.6 | +5.9% | +20.7% | <¥50M |
| 千葉市花見川区 (Chiba-Hanamigawa) | 149 | 26 / 10 | 17.4% | 5 | 3,690 [10] | 36.4 | 4,880 [4] | 23.1 [22] | 2,199 | 14.9 | +5.0% | +13.6% | <¥50M |
| 千葉市緑区 (Chiba-Midori) | 98 | 5 / 5 | 5.1% | 0 | 1,850 [5] | 20.0 | – [0] | 29.2 [38] | 2,776 | 8.1 | +6.3% | +18.5% | <¥50M |
| 千葉市若葉区 (Chiba-Wakaba) | 90 | 9 / 7 | 10.0% | 3 | 1,680 [6] | 18.6 | 2,480 [1] | 23.9 [24] | 2,269 | 9.5 | +7.2% | +21.7% | <¥50M |
| 習志野市 (Narashino) | 308 | 24 / 23 | 7.8% | 5 | 2,680 [19] | 29.5 | 4,680 [7] | 44.9 [68] | 4,261 | 20.4 | +5.8% | +24.4% | <¥50M |
| 船橋市 (Funabashi) | 1102 | 102 / 68 | 9.3% | 23 | 3,490 [52] | 35.3 | 3,980 [31] | 45.6 [204] | 4,329 | 19.6 | +5.0% | +27.2% | <¥50M |
| 市川市 (Ichikawa) | 679 | 41 / 23 | 6.0% | 10 | 4,830 [18] | 50.4 | 6,180 [9] | 58.9 [136] | 5,596 | 30.9 | +6.8% | +41.1% | <¥50M |
| 浦安市 (Urayasu) | 171 | 44 / 44 | 25.7% | 33 | 7,380 [19] | 71.2 | 8,000 [13] | 65.7 [21] | 6,244 | 39.6 | +3.2% | +35.9% | ¥50–80M |
| 松戸市 (Matsudo) | 721 | 22 / 15 | 3.1% | 2 | 3,980 [14] | 40.0 | 3,930 [12] | 37.9 [141] | 3,598 | 16.7 | +8.7% | +23.0% | <¥50M |
| 柏市 (Kashiwa) | 458 | 43 / 34 | 9.4% | 11 | 1,500 [26] | 16.2 | 9,210 [3] | 46.0 [129] | 4,374 | 13.8 | +7.0% | +32.9% | <¥50M |
| 流山市 (Nagareyama) | 179 | 15 / 9 | 8.4% | 9 | 7,500 [2] | 75.0 | 7,500 [3] | 63.3 [65] | 6,011 | 19.6 | +13.8% | +52.8% | ¥50–80M (thin) |
| 印西市 (Inzai) | 128 | 52 / 48 | 40.6% | 18 | 2,999 [36] | 30.2 | 4,430 [14] | 27.3 [18] | 2,593 | 4.7 | +6.9% | +20.0% | <¥50M |
| 白井市 (Shiroi) | 75 | 34 / 31 | 45.3% | 21 | 1,590 [13] | 16.3 | – [0] | 25.3 [7] | 2,404 | 7.7 | +10.6% | +24.6% | <¥50M |
| 八千代市 (Yachiyo) | 169 | 22 / 18 | 13.0% | 4 | 3,299 [17] | 34.8 | 2,420 [4] | 34.8 [33] | 3,310 | 11.6 | +3.6% | +7.8% | <¥50M |
| 佐倉市 (Sakura) | 101 | 29 / 24 | 28.7% | 8 | 2,890 [19] | 30.0 | 2,980 [9] | 26.6 [21] | 2,524 | 6.7 | +3.0% | +7.7% | <¥50M |
| 木更津市 (Kisarazu) | 9 | 0 / 0 | 0.0% | 0 | – [0] | – | – [0] | 52.1 [1] | 4,948 | 4.0 | +3.7% | +15.9% | no data |
| 袖ケ浦市 (Sodegaura) | 5 | 0 / 0 | 0.0% | 0 | – [0] | – | – [0] | 69.3 [2] | 6,579 | 5.6 | +3.8% | +20.3% | no data |
| 市原市 (Ichihara) | 50 | 4 / 4 | 8.0% | 1 | 1,180 [3] | 12.6 | 3,210 [1] | 17.7 [18] | 1,677 | 5.4 | +3.6% | +14.1% | <¥50M (thin) |
| 鎌ケ谷市 (Kamagaya) | 45 | 3 / 3 | 6.7% | 0 | 1,980 [3] | 20.3 | – [0] | 24.8 [13] | 2,352 | 10.5 | +7.5% | +16.1% | <¥50M (thin) |
| つくば市 (Tsukuba) | 62 | 20 / 16 | 32.3% | 10 | 4,520 [9] | 49.8 | 5,890 [12] | 55.9 [26] | 5,313 | 8.5 | +9.2% | +35.9% | <¥50M |
| 守谷市 (Moriya) | 12 | 8 / 5 | 66.7% | 3 | 4,580 [3] | 47.7 | 4,580 [3] | 61.9 [1] | 5,876 | 13.0 | +11.6% | +51.1% | <¥50M (thin) |
| つくばみらい市 (Tsukubamirai) | 7 | 1 / 1 | 14.3% | 0 | 1,350 [1] | 13.8 | 1,350 [1] | 47.4 [2] | 4,504 | 5.6 | +5.7% | +46.0% | <¥50M (thin) |
| さいたま市浦和区 (Saitama-Urawa) | 403 | 23 / 17 | 5.7% | 5 | 8,335 [14] | 84.0 | 11,890 [8] | 107.0 [103] | 10,165 | 41.5 | +4.3% | +19.1% | ¥80–120M |
| さいたま市大宮区 (Saitama-Omiya) | 313 | 14 / 10 | 4.5% | 7 | 9,990 [8] | 105.6 | 11,950 [8] | 113.0 [61] | 10,739 | 33.8 | +4.6% | +31.0% | ¥80–120M |
| さいたま市中央区 (Saitama-Chuo) | 156 | 8 / 8 | 5.1% | 0 | 5,899 [8] | 63.8 | 9,990 [1] | 59.8 [35] | 5,683 | 30.8 | +3.3% | +16.3% | ¥50–80M |
| さいたま市南区 (Saitama-Minami) | 361 | 14 / 11 | 3.9% | 7 | 3,980 [9] | 42.4 | 3,680 [7] | 67.4 [64] | 6,402 | 29.5 | +3.1% | +15.8% | <¥50M |
| さいたま市緑区 (Saitama-Midori) | 85 | 18 / 8 | 21.2% | 4 | 4,630 [6] | 51.1 | 5,850 [7] | 52.5 [16] | 4,984 | 18.7 | +2.2% | +10.5% | <¥50M |
| 川口市 (Kawaguchi) | 1128 | 47 / 30 | 4.2% | 15 | 5,680 [16] | 62.2 | 5,980 [9] | 63.6 [245] | 6,039 | 26.6 | +4.5% | +22.3% | ¥50–80M |
| 戸田市 (Toda) | 255 | 25 / 18 | 9.8% | 5 | 4,440 [14] | 45.3 | 3,898 [9] | 59.5 [48] | 5,654 | 31.4 | +5.9% | +26.7% | <¥50M |
| 越谷市 (Koshigaya) | 275 | 52 / 24 | 18.9% | 9 | 4,398 [23] | 43.2 | 6,390 [9] | 42.0 [51] | 3,986 | 14.9 | +3.5% | +12.8% | <¥50M |
| 三郷市 (Misato) | 161 | 20 / 19 | 12.4% | 6 | 1,585 [14] | 16.9 | 3,075 [2] | 35.5 [33] | 3,370 | 12.1 | +1.9% | +6.7% | <¥50M |
| 八潮市 (Yashio) | 49 | 10 / 4 | 20.4% | 2 | 2,690 [4] | 26.7 | 2,690 [3] | 43.0 [14] | 4,085 | 13.7 | +3.8% | +13.3% | <¥50M (thin) |
| 草加市 (Soka) | 394 | 25 / 8 | 6.3% | 0 | 4,330 [8] | 44.0 | 4,380 [4] | 60.8 [66] | 5,777 | 15.9 | +5.4% | +17.6% | <¥50M |
| 川崎市中原区 (Kawasaki-Nakahara) | 453 | 16 / 14 | 3.5% | 7 | 13,500 [11] | 145.4 | 15,240 [10] | 153.2 [130] | 14,552 | 46.8 | +4.7% | +18.3% | >¥120M |
| 川崎市高津区 (Kawasaki-Takatsu) | 369 | 30 / 23 | 8.1% | 14 | 7,730 [16] | 78.0 | 8,799 [11] | 86.2 [113] | 8,189 | 36.0 | +4.8% | +15.5% | ¥50–80M |
| 川崎市宮前区 (Kawasaki-Miyamae) | 610 | 55 / 35 | 9.0% | 14 | 5,980 [30] | 65.0 | 7,698 [13] | 72.1 [140] | 6,846 | 29.2 | +6.7% | +17.8% | ¥50–80M |
| 川崎市川崎区 (Kawasaki-Kawasaki) | 384 | 21 / 18 | 5.5% | 5 | 5,180 [15] | 55.0 | 6,180 [11] | 84.0 [66] | 7,981 | 33.5 | +4.7% | +16.4% | ¥50–80M |
| 川崎市幸区 (Kawasaki-Saiwai) | 272 | 22 / 13 | 8.1% | 5 | 9,440 [12] | 97.6 | 13,630 [8] | 99.7 [82] | 9,471 | 38.6 | +4.9% | +18.5% | ¥80–120M |
| 横浜市港北区 (Yokohama-Kohoku) | 656 | 59 / 48 | 9.0% | 28 | 6,499 [29] | 67.9 | 7,880 [12] | 94.6 [114] | 8,986 | 37.6 | +4.1% | +18.1% | ¥50–80M |
| 横浜市都筑区 (Yokohama-Tsuzuki) | 273 | 59 / 47 | 21.6% | 21 | 6,795 [34] | 68.1 | 7,480 [13] | 86.4 [67] | 8,206 | 30.5 | +3.8% | +13.9% | ¥50–80M |
| 横浜市青葉区 (Yokohama-Aoba) | 563 | 75 / 51 | 13.3% | 32 | 5,980 [26] | 61.3 | 6,480 [23] | 67.1 [138] | 6,374 | 33.6 | +2.6% | +12.7% | ¥50–80M |
| 横浜市神奈川区 (Yokohama-Kanagawa) | 493 | 23 / 18 | 4.7% | 6 | 4,780 [14] | 50.2 | 10,390 [4] | 90.7 [96] | 8,619 | 33.4 | +5.1% | +21.0% | <¥50M |
| 横浜市西区 (Yokohama-Nishi) | 454 | 28 / 23 | 6.2% | 7 | 20,500 [20] | 219.2 | 20,500 [20] | 173.6 [78] | 16,494 | 37.6 | +15.0% | +34.3% | >¥120M |

**Used-condo contract benchmarks by sub-region (REINS, FY2025 = Apr 2025–Mar 2026).** These are contract prices; the SUUMO table above is asking prices.

| Region | Contract ¥/m² FY2025 (万) | YoY | Avg contract price (万円) | Avg size (m²) | Contract ¥/m² FY2020 (万) | 5-yr change |
|---|---|---|---|---|---|---|
| 東京都区部 (23 wards) | 134.54 | +13.2% | 7,642 | 56.80 | 83.76 | +60.6% |
| 多摩 (Tama) | 56.26 | +1.9% | 3,747 | 66.60 | 42.72 | +31.7% |
| 横浜・川崎 | 66.17 | +4.2% | 4,335 | 65.52 | 50.00 | +32.3% |
| 神奈川他 | 42.88 | −0.2% | 2,902 | 67.67 | 32.68 | +31.2% |
| 埼玉県 | 44.05 | +1.9% | 2,977 | 67.58 | 33.29 | +32.3% |
| 千葉県 | 40.31 | +0.4% | 2,904 | 72.04 | 29.71 | +35.7% |
| 首都圏 (all) | 84.63 | +8.4% | 5,322 | 62.88 | 56.14 | +50.7% |

- FY2025 figures: [REINS 首都圏不動産流通市場の動向 2025年度, p.8](https://www.reins.or.jp/sf_202504-202603.pdf). FY2020 figures: [REINS 2020年度, p.8](https://www.reins.or.jp/pdf/trend/sf/sf_202004-202103.pdf). The 5-yr % is this researcher's calculation from the two tables.
- REINS changed its aggregation rules in FY2020, but the change concerns houses/land with unset zoning, not condos ([REINS 2020年度](https://www.reins.or.jp/pdf/trend/sf/sf_202004-202103.pdf)).
- FY2025 Kanto-wide contracts reached a record 49,314 (+24.1%), and contract ¥/m² rose for the 13th straight year ([REINS FY2025](https://www.reins.or.jp/sf_202504-202603.pdf)).

**Contract prices of large units specifically (REINS FY2025, contracts by size band)**, from [REINS 表13 専有面積帯別](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf):

| Region | 80–100 m² ¥/m² (万) | 80–100 m² avg price (万円) | 100–120 m² ¥/m² | 100–120 m² avg price (万円) | 70–80 m² ¥/m² (for comparison) |
|---|---|---|---|---|---|
| 都区部 | 153.09 | 13,299 | 192.95 | 20,649 | 134.95 |
| 東京都 (all) | 125.69 | 10,919 | 153.41 | 16,391 | 117.48 |
| 多摩 | 52.64 | 4,567 | 45.45 | 4,835 | 65.59 |
| 神奈川県 | 57.95 | 5,004 | 56.47 | 6,020 | 65.56 |
| 埼玉県 | 42.18 | 3,620 | 36.29 | 3,816 | 51.77 |
| 千葉県 | 40.19 | 3,494 | 39.45 | 4,186 | 44.71 |
| 首都圏 | 79.57 | 6,898 | 95.83 | 10,207 | 82.09 |

- Average build age of contracted 80–100 m² units is 25.45 years Kanto-wide and 23.40 years in the 23 wards ([REINS 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)).

**New condos (新築).**
- 2025 calendar-year averages from 不動産経済研究所 ([nippon.com, 2026-01-28](https://www.nippon.com/ja/japan-data/h02685/)):
  - 東京23区: 1億3,613万円 (+21.8%; 8,064 units)
  - 都心6区: 1億9,503万円
  - 東京都下: 6,690万円 (+13.7%; another report gives 6,699万)
  - 神奈川県: 7,165万円 (+11.4%)
  - 埼玉県: 6,420万円 (+15.8%)
  - 千葉県: 5,842万円 (+2.7%)
  - 首都圏: 9,182万円 (+17.4%; 21,962 units, the lowest supply since 1973)
- H1-2025 ¥/m² by area ([秋田魁/共同 2025-07-17](https://www.sakigake.jp/news/article/20250717CO0095/), figures as relayed in search results and not re-read in full):
  - 23区: 201.5万/m² (avg 1億3,064万)
  - 都下: 111.8万 (6,835万)
  - 神奈川: 103.9万 (6,957万)
  - 埼玉: 95.8万 (6,551万)
  - 千葉: 80.2万 (5,738万)
  - 首都圏: 135.0万
- FY2025 (Apr 2025–Mar 2026): the 23-ward new-condo average was 1億3,784万円 (+18.5%), as relayed in search results ([sbbit 2026-04-22](https://www.sbbit.jp/article/refers/184939)).
- 2025 new-condo average by ward (LIFULL HOME'S listings, Jan–May 2025, units ≥30 m²), from [LIFULL 2025年マーケット市況振り返り p.8](https://lifull.com/doc/2026/01/20e749ab9bdf406f2ae3f6c53171d5ec.pdf). Format: avg price / ¥/m² / avg size.
  - 港区: 3億5,080万 / 424万 / 81.83 m²
  - 中央区: 2億7,482万 / 332万
  - 渋谷区: 2億4,507万 / 351万
  - 千代田区: 2億832万 / 321万
  - 豊島区: 1億6,936万 / 247万
  - 新宿区: 1億6,751万 / 226万
  - 品川区: 1億6,443万 / 258万
  - 中野区: 1億6,380万 / 243万
  - 世田谷区: 1億5,888万 / 193万 / 78.17 m²
  - 目黒区: 1億5,079万 / 200万
  - 文京区: 1億4,510万 / 205万
  - 杉並区: 1億2,907万 / 182万
  - 大田区: 1億2,404万 / 175万
  - 北区: 1億1,027万 / 164万
  - 台東区: 1億477万 / 184万
  - 江東区: 1億275万 / 169万
  - 荒川区: 9,700万 / 164万
  - 板橋区: 9,460万 / 134万
  - 江戸川区: 8,034万 / 109万
  - 練馬区: 7,554万 / 124万
  - 足立区: 7,433万 / 116万
  - 葛飾区: 7,030万 / 140万
  - 墨田区: 5,060万 / 112万 / 45.15 m²
  - 23区 overall: 1億4,402万 / 207万 / 66.67 m²
- The same LIFULL report gives 2025 used-condo averages (70 m²-equivalent, Jan–Nov 2025) of 1億429万円 for the 23 wards, 1億6,940万 for the 都心6区, and 3,516万 for 都下 ([LIFULL 2025 review p.12](https://lifull.com/doc/2026/01/20e749ab9bdf406f2ae3f6c53171d5ec.pdf)).

**Tokyo Kantei 70 m² (asking-price basis), latest available:**
- 23区 Dec 2025: 11,960万円, the 20th straight monthly rise ([mec-h.com relaying 東京カンテイ](https://www.mec-h.com/news/32)).
- 東京都 Nov 2025: 9,781万円; 首都圏 Nov 2025: 6,249万円 ([nomu.com Kantei report 2025-12-22](https://www.nomu.com/mansion/library/trend/report/70m2_20251222.html)).
- 23区 May 2026: 1億2,849万円 (+27.4% YoY; 首都圏 7,360万) ([熊本日日/共同](https://kumanichi.com/articles/2005817)).
- 2025 calendar-year 23-ward asking average: 1億393万円 per 70 m² (+34.6%, the largest rise on record). This figure was relayed via a search summary citing Nikkei/Kantei and not opened directly ([search-summary source list incl. nomu.com](https://www.nomu.com/mansion/library/trend/report/70m2_20250623.html)).

**LIFULL HOME'S Minato page (updated 2026-10-01)**
- 70 m² average asking price (past 3 months): 港区 17,843万円, 千代田区 18,533万, 中央区 14,155万, 新宿区 10,104万, 文京区 11,154万, 台東区 9,274万, 墨田区 7,822万.
- HOME'S Minato listings: 146 at 90–110 m² and 120 at ≥110 m² ([HOME'S 港区 価格相場](https://www.homes.co.jp/mansion/chuko/tokyo/minato-city/price/)).

### Inferences
- **Asking prices (SUUMO) vs contract prices (REINS) for a 95 m² unit.**
  - SUUMO asking medians match REINS contract levels outside the 23 wards. Examples: Chiba-shi Mihama 5,780万 vs Chiba-prefecture 80–100 m² contract average 3,494万. Mihama sits above the prefecture average, which is plausible for Makuhari/Kemigawahama. Yokohama Aoba 5,980万 vs Kanagawa average 5,004万.
  - Inside the wards, asking medians for big units (e.g. Setagaya 13,780万, Koto 12,800万) are close to the REINS 23-ward 80–100 m² contract average of 13,299万. Central wards (Minato, Chiyoda, Shibuya) are dominated by luxury towers; their asking medians of 3–4億 are not typical contract levels.
- **Same-age ¥/m² premium for size.** In the suburbs, large units sell at lower ¥/m² than 70–80 m² units because large units are mostly older (1980s–90s 公団/社宅-style blocks). In the 23 wards they sell at a premium (153 vs 135万/m²). The "built ≥2000" column is therefore the better guide for a family wanting a modern 90–100 m² unit:
  - Urayasu ≈8,000万
  - Mihama ≈6,780万
  - Aoba ≈6,480万
  - Tsuzuki ≈7,480万
  - Kohoku ≈7,880万
  - Inzai ≈4,430万
  - Tsukuba ≈5,890万
  - Funabashi ≈3,980万
  - Kawaguchi ≈5,980万
  - Setagaya ≈1億5,490万
  - Koto ≈1億4,800万
  - Nerima ≈7,490万
  - Edogawa ≈9,085万
- **New-condo premium outside the 23 wards.** Regional new-condo ¥/m² (H1 2025: 都下 111.8万, 神奈川 103.9万, 埼玉 95.8万, 千葉 80.2万) is roughly 2× the regional used contract ¥/m² (多摩 56.3, 神奈川 59.3, 埼玉 44.1, 千葉 40.3). A new 95 m² unit would therefore cost about ¥76–106M in the suburbs. That is an estimate of ¥/m² × 95, not an observed price.

### Gaps
- **No municipality-level used-condo 5-year price change** from a primary source. Kantei's ward/city tables are not public in text form; マンションレビュー's city pages returned 404 at the guessed URL; and HOME'S is bot-protected. The 5-year trend is therefore given at REINS sub-region level (contract ¥/m²), plus municipality-level land-price 5-year change as a proxy.
- **No municipality-level new-condo averages outside the 23 wards** for 2025–2026 (不動産経済研究所 publishes city tables only in paid reports). Only prefecture/area averages are available.
- The SUUMO crawl is a single-day snapshot of asking prices. Medians with n<5 (flagged "thin") are not reliable.
- Kisarazu and Sodegaura had zero ≥90 m² listings and only 9 and 5 used listings in total.
- SUUMO 専有面積 is usually 壁芯. A few 90.0x m² listings may be 89 m² 内法.

## Q2: Where does a 90–100 m² condo cost under ¥50M, ¥50–80M, ¥80–120M and over ¥120M?

### Takeaway
- **Over ¥120M**: the central and west-central 23 wards, plus Musashino, Kawasaki-Nakahara (Musashi-Kosugi) and Yokohama-Nishi (Minato Mirai).
- **¥80–120M**: the mid-ring wards (Ota, Nakano, Suginami, Kita, Arakawa) and Urawa/Omiya.
- **¥50–80M**: the outer wards (Nerima, Adachi, Edogawa, Itabashi) and most of Tama, Yokohama-north, Kawasaki-suburban, Urayasu and Makuhari.
- **Under ¥50M**: almost all of Chiba-ken, Ibaraki and southern Saitama, but much of that stock is pre-2000. Modern (≥2000) units in Urayasu, Mihama, Ichikawa and Tsukuba push into the ¥50–80M band.

### Cited Findings
All rows below are SUUMO asking-price medians for de-duplicated 90–105 m² listings, all ages, crawled 2026-10-12 ([SUUMO used-condo search](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)). Brackets give the median for 90–110 m² units built ≥2000 ("modern") where n≥3.

- **Over ¥120M (12,000万+)**
  - 千代田区: 42,000万 (modern 43,245)
  - 港区: 36,000 (modern 43,450)
  - 渋谷区: 31,800 (35,500)
  - 中央区: 24,350 (26,650)
  - 豊島区: 23,230 (23,480)
  - 新宿区: 22,480 (24,800)
  - 品川区: 22,380 (28,990)
  - 横浜市西区: 20,500 (20,500)
  - 文京区: 18,480 (25,800)
  - 墨田区: 17,500 (n=7, tower-skewed; modern 17,500)
  - 武蔵野市: 14,980 (17,280)
  - 目黒区: 14,500 (18,850)
  - 世田谷区: 13,780 (15,490)
  - 川崎市中原区: 13,500 (15,240)
  - 江東区: 12,800 (14,800)
- **¥80–120M (8,000–12,000万)**
  - 台東区: 11,740 (n=6)
  - 北区: 10,980 (n=7; modern 25,300 = tower skew)
  - 大田区: 10,245 (modern 10,480)
  - さいたま市大宮区: 9,990 (modern 11,950)
  - 中野区: 9,790 (modern 13,300)
  - 川崎市幸区: 9,440 (modern 13,630)
  - 杉並区: 8,880 (modern 9,630)
  - さいたま市浦和区: 8,335 (modern 11,890)
  - 荒川区: 8,249 (modern 8,980)
- **¥50–80M (5,000–8,000万)**
  - 川崎市高津区: 7,730 (modern 8,799)
  - 流山市: 7,500 (n=2, thin; Otakanomori)
  - 練馬区: 7,480 (modern 7,490)
  - 三鷹市: 7,398 (thin)
  - 浦安市: 7,380 (modern 8,000)
  - 板橋区: 7,340 (modern 11,000)
  - 足立区: 7,180 (modern 7,180)
  - 江戸川区: 6,989 (modern 9,085)
  - 横浜市都筑区: 6,795 (modern 7,480)
  - 横浜市港北区: 6,499 (modern 7,880)
  - 川崎市宮前区: 5,980 (modern 7,698)
  - 横浜市青葉区: 5,980 (modern 6,480)
  - さいたま市中央区: 5,899
  - 府中市: 5,799 (modern 5,799)
  - 千葉市美浜区: 5,780 (modern 6,780)
  - 川口市: 5,680 (modern 5,980)
  - 小金井市: 5,590 (thin)
  - 稲城市: 5,480 (modern 5,980)
  - 川崎市川崎区: 5,180 (modern 6,180)
- **Under ¥50M (<5,000万)**
  - 市川市: 4,830 (modern 6,180)
  - 横浜市神奈川区: 4,780 (modern 10,390, n=4)
  - 立川市: 4,644 (modern 4,644)
  - さいたま市緑区: 4,630 (modern 5,850)
  - 守谷市: 4,580 (thin)
  - 調布市: 4,539 (thin)
  - つくば市: 4,520 (modern 5,890)
  - 戸田市: 4,440 (modern 3,898)
  - 越谷市: 4,398 (modern 6,390)
  - 草加市: 4,330 (modern 4,380)
  - 葛飾区: 4,280 (thin, all pre-2000)
  - 町田市: 4,130 (modern 4,935)
  - 松戸市: 3,980 (modern 3,930)
  - さいたま市南区: 3,980 (modern 3,680)
  - 千葉市中央区: 3,830 (modern 4,380)
  - 千葉市花見川区: 3,690 (modern 4,880)
  - 船橋市: 3,490 (modern 3,980)
  - 八千代市: 3,299
  - 印西市: 2,999 (modern 4,430)
  - 佐倉市: 2,890 (modern 2,980)
  - 多摩市: 2,780 (modern 7,450, n=4)
  - 八潮市: 2,690 (thin)
  - 習志野市: 2,680 (modern 4,680)
  - 千葉市稲毛区: 2,490 (modern 5,980)
  - 鎌ケ谷市: 1,980 (thin)
  - 千葉市緑区: 1,850 (all pre-2000)
  - 千葉市若葉区: 1,680
  - 白井市: 1,590 (all pre-2000)
  - 三郷市: 1,585
  - 柏市: 1,500 (old 北柏ライフタウン stock; modern 柏の葉 units 9,210, n=3)
  - つくばみらい市: 1,350 (n=1)
  - 市原市: 1,180 (thin)
  - 木更津市 / 袖ケ浦市: no ≥90 m² listings
- **Cross-check via the 70–80 m² unit price × 95.** This approach yields the same bands for most places. The exceptions are wards whose large-unit stock is older or cheaper per m² than their 70 m² stock: 中野区 (16,331 vs 9,790), 台東区 (15,685), 墨田区 (12,231), 杉並区 (11,846), 葛飾区 (8,721), 横浜市神奈川区 (8,619), 小金井市 (10,342) ([SUUMO crawl](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)).
- **Region-level contract benchmarks** (REINS FY2025, 80–100 m² average contract price) ([REINS 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)):
  - 23区: 13,299万
  - 東京都: 10,919万
  - 神奈川: 5,004万
  - 多摩: 4,567万
  - 埼玉: 3,620万
  - 千葉: 3,494万
- **Price distribution of all used-condo contracts, FY2025** ([REINS 表7 価格帯別](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_7.pdf)):
  - 首都圏: 11.0% of contracts were above 1億円 (9.1% at 1–2億, 1.9% above 2億)
  - 都区部: 22.3% (18.2% + 4.1%)
  - 埼玉県: 0.8%

### Inferences
- **Under ¥50M with modern stock.** Inside a reasonable commute, the realistic options are Funabashi, Inzai (Chiba NT), Tsukuba (TX), Koshigaya, Kawaguchi/Toda, Matsudo and inland Chiba-shi. Urayasu, Makuhari (Mihama), Ichikawa and Yokohama-north are mostly ¥55–80M for post-2000 units.
- **Asking vs contract in the 23 wards.** For the ¥80–120M band, ward asking medians probably overstate contract prices by 20–50% (see the asking/contract gap in Q1). Some ">¥120M" wards (Setagaya, Koto, Meguro) may therefore trade at about ¥100–120M for older 90 m² units.

### Gaps
- 90–100 m² contract prices per municipality (MLIT 不動産情報ライブラリ) were not pulled. The API needs a key, and the old 土地総合情報システム API is retired. Contract-price validation is therefore only at REINS sub-region level.
- Thin samples (n<5) are flagged: Chofu, Koganei, Mitaka, Katsushika, Nagareyama, Moriya, Yashio, Kamagaya, Ichihara, Tsukubamirai.

## Q3: Where are large (≥90 m²) units actually available in quantity?

### Takeaway
- **By absolute count (dedup ≥90 m² listings, 2026-10-12):** Minato (503), Shibuya (195), Setagaya (185), Chuo (112), Koto (88), Shinjuku (85), Chiyoda (83), Shinagawa (73), Funabashi (68), Meguro (62), Mihama (58), Nerima (56) and Tama-shi (52) lead.
- **By share of each municipality's stock:** Chiba NT (Inzai 41%, Shiroi 45%), Inagi (38%), Tsukuba (32%), Sakura (29%), Urayasu (26%), Tsuzuki (22%), Tama (21.5%), Saitama-Midori (21%) and Makuhari/Mihama (17%) stand out.
- **Large AND under ¥80M:** Funabashi, Tama-shi, Inzai, Aoba, Tsuzuki, Inagi, Mihama, Machida, Kohoku, Kashiwa, Shiroi and Nerima each have 30–63 such listings.
- Region-wide, ≥100 m² units are only about 3% of contracts.

### Cited Findings
- **≥90 m² share of each municipality's SUUMO used listings (raw hits / total), 2026-10-12** ([SUUMO search, mb=90 filter](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)):
  - 守谷市: 67% (8/12, thin)
  - 白井市: 45% (34/75)
  - 印西市: 41% (52/128)
  - 稲城市: 38% (53/140)
  - つくば市: 32% (20/62)
  - 佐倉市: 29% (29/101)
  - 浦安市: 26% (44/171)
  - 横浜市都筑区: 22% (59/273)
  - 多摩市: 21.5% (56/260)
  - さいたま市緑区: 21% (18/85)
  - 八潮市: 20% (10/49)
  - 港区: 19.1% (648/3,397)
  - 越谷市: 19% (52/275)
  - 千代田区: 18.8%
  - 千葉市美浜区: 17.4% (84/483)
  - 千葉市花見川区: 17.4%
  - 町田市: 16.3%
  - 渋谷区: 14.3%
  - 横浜市青葉区: 13.3%
  - 八千代市: 13.0%
  - 三郷市: 12.4%
  - 武蔵野市: 11.9%
  - 世田谷区: 11.2%
- **Lowest ≥90 m² shares:**
  - 葛飾区: 1.0%
  - 調布市: 1.7%
  - 墨田区: 2.1%
  - 荒川区: 2.3%
  - 豊島区, 北区, 板橋区: 2.4% each
  - 台東区: 2.5%
  - 松戸市: 3.1%
  - 川崎市中原区: 3.5%
  - 足立区: 3.8%
  - さいたま市南区: 3.9%
  - 木更津市, 袖ケ浦市: 0%
- **Dedup ≥90 m² listings priced under ¥80M, and of those built ≥2000** ([SUUMO crawl](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)):

  | Municipality | Under ¥80M | of which built ≥2000 |
  |---|---|---|
  | 船橋市 | 63 | 36 |
  | 多摩市 | 51 | 3 |
  | 印西市 | 48 | 18 |
  | 横浜市青葉区 | 42 | 24 |
  | 横浜市都筑区 | 41 | 13 |
  | 稲城市 | 41 | 12 |
  | 千葉市美浜区 | 41 | 26 |
  | 町田市 | 35 | 16 |
  | 横浜市港北区 | 34 | 7 |
  | 柏市 | 32 | 1 |
  | 白井市 | 31 | 0 |
  | 練馬区 | 31 | 6 |
  | 川崎市宮前区 | 27 | 7 |
  | 江戸川区 | 27 | 2 |
  | 佐倉市 | 24 | 10 |
  | 越谷市 | 24 | 9 |
  | 習志野市 | 22 | 7 |
  | 戸田市 | 18 | 9 |
  | 浦安市 | 17 | 9 |
  | 足立区 | 17 | 12 |
  | 松戸市 | 15 | 13 |
  | つくば市 | 12 | 9 |
  | 世田谷区 | 13 (of 185) | 3 |

  Across all 77 municipalities, 2,874 dedup ≥90 m² listings were found, of which 1,042 were under ¥80M.
- **Example large-unit estates seen in the crawl** ([SUUMO crawl](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)):
  - Urayasu: パークシティ東京ベイ新浦安 130.93 m² at 13,280万 (2004); シーガーデン新浦安 110–122 m² at 8,480–8,580万 (2005); プラウド新浦安 118–124 m² at 7,980–10,980万 (2008); 入船 estates 97–99 m² at 4,580–6,280万 (1981–82)
  - Makuhari/Mihama: セントラルパーク・ウエスト 90 m² at 5,499–5,699万 (1999); パティオスエリスト 112 m² at 6,290万 (2006); 幕張ベイパーク 92 m² at 10,480万 (2023)
  - Chiba NT: ヴェレーナシティ千葉ニュータウン中央 95 m² at 5,680万 (2022); レイディアントシティ 115 m² at 3,680万 (2009)
  - Tsukuba: ルネつくばローレルコート 109 m² at 12,000万 (2023); サーパスつくば研究学園 128 m² at 11,000万 (2007); レーベン研究学園 91 m² at 4,520万 (2017)
  - Aoba: エル・クラッシィ 90 m² at 7,480万 (2005); グリーンシティたまプラーザ 101 m² at 12,000万 (1983)
- **Region-wide share of large units in contracts and new listings, FY2025** ([REINS 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)):
  - 首都圏 contracts: 80–100 m² = 12.6% (6,236 of 49,314); ≥100 m² = 3.0% (1,472)
  - 都区部: 80–100 = 8.3%; ≥100 = 2.6% (561 of 21,723)
  - 多摩: 14.8% / 3.7%
  - 神奈川: 15.1% / 3.2%
  - 埼玉: 13.6% / 1.6%
  - 千葉: 21.7% / 4.9% (highest)
  - New listings (新規登録) in the 23 wards: ≥100 m² = 3.9% (3,483 of 88,277)
- **The large-unit share is shrinking.** 80–100 m² units were 15.5% of Kanto contracts in FY2020 but 12.6% in FY2025. In the 23 wards the share went from 10.5% to 8.3% ([REINS 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)).
- **New-build sizes stay small.** Average new-condo size in the 23 wards was 66.67 m² in Jan–May 2025, and only Minato (81.83), Chuo (82.87), Setagaya (78.17) and Meguro (77.88) averaged near 80 m² ([LIFULL 2025 review](https://lifull.com/doc/2026/01/20e749ab9bdf406f2ae3f6c53171d5ec.pdf)).
- **HOME'S cross-check for Minato:** 146 listings at 90–110 m² and 120 at ≥110 m² (updated 2026-10-01). This is consistent with SUUMO's 648 raw / 503 dedup ≥90 m² ([HOME'S 港区](https://www.homes.co.jp/mansion/chuko/tokyo/minato-city/price/)).

### Inferences
- **The user's examples are confirmed as the places where big units are both common and sub-¥80M:**
  - Urayasu (Shin-Urayasu): about a quarter of listings are ≥90 m², but mostly ¥60–110M
  - Makuhari Bay Town / Mihama
  - Chiba NT: Inzai and Shiroi, where 40–45% of listings are ≥90 m², but Shiroi's stock is all pre-2000
  - Tsukuba: 32%, a small market of 62 listings in total
  - Aoba and Tsuzuki (港北NT): 13–22%
- Tama NT (Tama-shi, Inagi) and Machida are equally rich in large units. Tama-shi's large stock is overwhelmingly 1970s–90s (only 4 of 52 built ≥2000).
- **Large units in the 23 wards are numerous only because those markets are huge.** Their shares are 5–19%, and the units are priced in the luxury segment (Minato/Shibuya/Chiyoda). The exceptions with a larger mid-priced pool are Setagaya (185 ≥90 m², 13 under ¥80M), Nerima (56, 31 under ¥80M) and Edogawa (40, 27 under ¥80M).
- Funabashi has the single largest pool of modern (≥2000) ≥90 m² units under ¥80M (36). Mihama (26) and Aoba (24) follow.

### Gaps
- No public dataset gives the share of ≥90 m² units in the total housing stock (all units, not just listings) per municipality. The 住宅・土地統計調査 has floor-area bands for 共同住宅 by municipality, but it was not retrieved within this budget. Listing share is used as the proxy.
- Listing counts change daily. This is a single snapshot (2026-10-12).

## Q4: What are the trends in each area?

### Takeaway
- **Used-condo prices, FY2020→FY2025 (REINS contract ¥/m²):** the 23 wards rose by about 61%; Tama, Saitama, Chiba, Kanagawa and Yokohama/Kawasaki each rose by about 31–36%.
- **The suburbs flattened in FY2025:** +0.4% for Chiba, +1.9% for Tama and Saitama, +4.2% for Yokohama/Kawasaki, against +13.2% for the wards.
- **By May 2026** the Kanto-wide average had its first YoY fall in 73 months (a mix effect), while ward asking prices (Kantei) were still +27% YoY.
- **Land prices** rose most in the central wards and in Nagareyama, Moriya, Tsukubamirai, Ichikawa and Urayasu over 2021–2026, and least in Misato, Sakura, Yachiyo and Machida.

### Cited Findings
- **Contract ¥/m² by sub-region, FY2020 → FY2025, with FY2025 YoY** ([REINS FY2025](https://www.reins.or.jp/sf_202504-202603.pdf); [REINS FY2020](https://www.reins.or.jp/pdf/trend/sf/sf_202004-202103.pdf)):
  - 都区部: 83.76 → 134.54万 (+60.6%; FY2025 YoY +13.2%)
  - 多摩: 42.72 → 56.26 (+31.7%; +1.9%)
  - 横浜川崎: 50.00 → 66.17 (+32.3%; +4.2%)
  - 神奈川他: 32.68 → 42.88 (+31.2%; −0.2%)
  - 埼玉: 33.29 → 44.05 (+32.3%; +1.9%)
  - 千葉: 29.71 → 40.31 (+35.7%; +0.4%)
  - 首都圏: 56.14 → 84.63 (+50.7%; +8.4%)
- **New-listing (asking) ¥/m², FY2025 YoY** ([REINS FY2025](https://www.reins.or.jp/sf_202504-202603.pdf)):
  - 都区部: 168.95万 (+31.4%)
  - 多摩: 56.72 (+9.0%)
  - 横浜川崎: 63.85 (+9.1%)
  - 埼玉: 43.31 (+4.2%)
  - 千葉: 39.87 (+3.6%)
- **May 2026 (REINS monthly)** ([東急リバブル market report 2026-05](https://www.livable.co.jp/shiritai/column/fudosan-market-report/202605/)):
  - Kanto-wide contract ¥/m² was 80.78万 (−3.9% YoY), the first fall in 73 months since April 2020. The report attributes the fall to fewer high-priced ward contracts.
  - Regional YoY: 区部 +2.0%, 多摩 +7.4%, 横浜川崎 +6.4%, 埼玉 +9.7%, 千葉 +0.6%
  - Inventory: 45,804 (+3.4%)
- **Tokyo Kantei 70 m² (asking):**
  - 23区 May 2026: 1億2,849万 (+27.4% YoY, 25 consecutive monthly records) ([熊本日日/共同](https://kumanichi.com/articles/2005817))
  - 23区 Dec 2025: 11,960万 ([mec-h.com](https://www.mec-h.com/news/32))
- **New condos 2025 YoY** ([nippon.com/不動産経済研究所](https://www.nippon.com/ja/japan-data/h02685/)): 23区 +21.8%, 都下 +13.7%, 埼玉 +15.8%, 神奈川 +11.4%, 千葉 +2.7%.
- **Ward-level new-condo ¥/m² change, Jan–May 2025 vs the prior period** ([LIFULL](https://lifull.com/doc/2026/01/20e749ab9bdf406f2ae3f6c53171d5ec.pdf)):
  - Largest rises: 葛飾 +55.3%, 港 +42.5%, 大田 +40.2%, 中央 +39.0%, 中野 +35.1%, 荒川 +31.1%, 豊島 +30.5%
  - Falls: 北区 −12.2%, 墨田 −0.7%
- **Residential land, 公示地価 2021→2026 (5-yr) and 2026 YoY, by municipality** ([トチノカチ per-municipality pages, MLIT data](https://totinokati.com/kakaku/12/kouji/)):
  - Strongest:
    - 流山市: +52.8% (YoY +13.8%)
    - 守谷市: +51.1% (+11.6%)
    - つくばみらい市: +46.0%
    - 品川区: +46.0%
    - 中央区: +45.6%
    - 港区: +45.2% (YoY +16.3%)
    - 目黒区: +45.1%
    - 豊島区: +44.2%
    - 文京区: +44.1%
    - 渋谷区: +42.4%
    - 北区: +41.2%
    - 市川市: +41.1%
    - 浦安市: +35.9% (but only +3.2% YoY in 2026)
    - つくば市: +35.9%
    - 横浜市西区: +34.3% (YoY +15.0%)
    - 柏市: +32.9%
    - さいたま市大宮区: +31.0%
  - Weakest:
    - 三郷市: +6.7%
    - 佐倉市: +7.7%
    - 八千代市: +7.8%
    - 町田市: +8.7%
    - さいたま市緑区: +10.5%
    - 多摩市: +11.1%
    - 横浜市青葉区: +12.7% (YoY +2.6%)
    - 越谷市: +12.8%
    - 八潮市: +13.3%
    - 千葉市花見川区: +13.6%
    - 横浜市都筑区: +13.9%
  - 千葉市美浜区: +19.4% (YoY +5.8%)
  - 印西市: +20.0% (YoY +6.9%)
  - 世田谷区: +21.8%
  - 練馬区: +22.0%

### Inferences
- **Two-speed market.** Ward condos (+60% in 5 years, still double-digit asking growth in 2026) have pulled far away from the suburbs (+31–36%, near-flat in FY2025). The ward-to-suburb price gap for a 95 m² unit is therefore still widening. Suburbs with big-unit stock (Aoba, Tsuzuki, Tama, Machida, Sakura, Yachiyo, Misato) show the slowest land appreciation (+7–14% over 5 years), which signals lower capital-gain potential but also lower downside.
- **Momentum suburbs.** TX corridor (Nagareyama, Moriya, Tsukubamirai, Tsukuba, Kashiwa-no-ha), Ichikawa/Urayasu and Musashi-Kosugi/Minato Mirai have land momentum close to the central wards'. Urayasu's 2026 YoY slowed to +3.2%.
- **May 2026 regional signals.** The suburban YoY figures (Saitama +9.7%, Tama +7.4%, Yokohama/Kawasaki +6.4%) suggest that buyers priced out of the wards are shifting demand outward. That is the report's interpretation of a mix effect, and a single month.

### Gaps
- No municipality-level used-condo price index for 5 years. Land-price change is a proxy only. Condo prices have outpaced land prices in the wards (contract ¥/m² +60% vs ward land +20–45%).
- 2026 calendar-year data are partial (through May–Oct depending on source). The 2026 公示地価 (as of 2026-01-01) is the latest land data; the 2026 基準地価 (published Sept 2026) was not checked.
