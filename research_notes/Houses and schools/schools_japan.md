# How public schools are assigned and "ranked" in Japan — research notes (2026-10-13)

## 1. Assignment: the address decides the school
- Each municipal board of education (教育委員会) draws **通学区域** (attendance zones) and names one elementary (小学校) and one junior-high (中学校) school per address (指定校). New first-graders get a 就学通知書 around January. (city.toyama.lg.jp, city.suzuka.lg.jp, city.minoh.lg.jp)
- Exceptions, all by application and at the board's discretion: **指定校変更** (another school in the same municipality — siblings, parent's work, moving mid-year, special-needs class), **区域外就学** (school in another municipality). Not guaranteed. (city.ikeda.osaka.jp, city.shinjuku.lg.jp)
- **学校選択制** (school choice) exists in some Tokyo wards and Tama cities: free choice, block choice, adjacent-zone choice, 特認校. The Tokyo board publishes a yearly table by ward (latest R8 = 2026: kyoiku.metro.tokyo.lg.jp/documents/d/kyoiku/2026-02-27-132752-298). Wards without it as of 2024-03 (secondary source coeteco.jp): Suginami, Katsushika, Setagaya, Kita, Ota, Nakano. Popular schools hold lotteries; capacity limits apply.
- **Open data for zones:** 国土数値情報 **A27 小学校区 / A32 中学校区, 2023 edition** (published 2024-06), GeoJSON/Shapefile, attributes: municipality code, operator, **school code, school name, address**. All 5 prefectures present. Caveats: some municipalities missing; zones are revised and may be out of date; ±25 m accuracy; "not an official source — confirm with the city". Licence CC BY 4.0 with per-municipality terms. (nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-A27-2023.html)
- School locations: 国土数値情報 P29 学校.

## 2. "Rankings": there is no official ranking of public elementary / junior-high schools
- The national achievement test (**全国学力・学習状況調査**, grades 6 and 9, every April) is published by MEXT at **prefecture and designated-city level**. From 2014 the rules let municipal boards publish **school-level** results at their own discretion, with conditions (no ranking tables, context). Most boards in our areas publish only the municipality average vs. the national / prefectural average. (mext.go.jp gakuryoku-chousa; 2013 policy change reported by 赤旗 2013-11-30)
- Municipal-level results we can use: Saitama prefecture publishes per-municipality results for consenting cities (pref.saitama.lg.jp/f2214/gakutyou/r7shichousonkekka.html); Chiba city, Yokohama, Saitama city publish their own summaries; Tokyo wards publish their own (and the Tokyo board's 児童・生徒の学力向上を図るための調査, grades 5/8) — usually as "ward vs Tokyo vs national" percentages in PDFs.
- 2025 prefecture results: Tokyo is the top prefecture on average (61% vs Okinawa 50.5%) — i.e. differences inside Kanto are small at area level.
- Private review sites (**みんなの学校情報 / minkou.jp**) show parent star ratings per school (often 5–20 reviews per school, subjective, unstable). Usable as a **link**, not as data.
- **偏差値** rankings exist for **high schools** (entrance-exam difficulty) and private junior highs, not for public elementary/JH. They describe intake, not teaching quality.

## 3. Signals parents actually use (and that have official data)
| Signal | What it says | Source / availability |
|---|---|---|
| Municipality average on the national test vs national | academic level of the area's public schools | Saitama per city; other cities' own PDFs; heterogeneous |
| % of public-elementary graduates going to private/national junior high (中学受験率) | how many families opt out of local JH (high in central Tokyo: wards ~20% avg 2021, Tama ~10%) | Tokyo board 公立学校統計調査報告書 進路状況調査編 (by ward; FY2025 final due late Oct 2026). Other prefectures: not per city |
| School choice system | whether you're locked into the zone school | Tokyo board yearly table; other cities' pages |
| School size / crowding | mega-schools and prefab classrooms in fast-growing areas (Nagareyama, waterfront towers) | Tokyo 公立学校統計 CSV (by ward); per-school counts only on city pages |
| Distance to the assigned school | walking safety for a 6-year-old (no school buses in cities) | A27/A32 + P29 + listing location |
| Public high-school access | Tokyo/Kanagawa/Saitama: prefecture-wide for 普通科. **Chiba: 9 districts, apply in own + adjacent districts** (1 = Chiba city; 2 = Ichikawa, Funabashi, Matsudo, Narashino, Yachiyo, Urayasu; 3 = Noda, Kashiwa, Nagareyama, Abiko, Kamagaya; 4 = Narita, Sakura, Inzai, Shiroi…) | pref.chiba.lg.jp/kyouiku/seisaku/miryoku/gakku/ ; Ibaraki — to verify |

## 4. Proposal (not scored, flagged as info like crime)
- **Area level (both maps):** Schools card + map layer: national-test level vs national (where published), 中学受験率 (Tokyo), school-choice system, Chiba HS district, avg school size / growth, share of children within 1 km of an elementary school. Missing = "not published", never imputed.
- **Listing level (Houses, Apartments, Deep look):** assigned elementary + junior high from A27/A32 (point-in-polygon at the listing's 丁目 point; flag when within ~150 m of a zone boundary or when the city has school choice), distance, links to the school site / city zone page / minkou reviews. Always "confirm with the city's 学務課".
