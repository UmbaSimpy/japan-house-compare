# Model review and area potential (2026-10-13)

**Question asked by the user:**
- Are we missing something?
- Can some parameters be refined?
- Which areas have potential in the near future?

**Inputs:**
- The current study data: `data/locations.json` (space v2, 2000 cutoff kept by the user).
- The 2026-10-12 SUUMO crawl (`condo_raw/raw.json`) and the live area stats (`area-stats.js`, 2026-10-12).
- Watchlist listing fees (`mansions.json`).
- Web checks dated 2026-10-13.

The scripts that produced every number here are recorded in `data/DATA_LOG.md` item 10. **Nothing in the scoring was changed by this review.** The refinements in §2 are proposals for the user to choose from.

## Summary

- **The top of the ranking is solid.** When the seven weights are shaken randomly (each ×0.5–2), Urayasu, Matsudo and Funabashi stay top-3/top-5 in most draws. Mihama, Arakawa, Ichikawa and Narashino stay in the top ~15. Below about rank 20 the order is mostly noise.
- **Biggest blind spot: the station is not the front door.** Commute is measured from the main station. The flats that the space score counts are often far from it:
  - Urayasu: 0 of 36 qualifying flats are within 10 min walk. The median is 23 min, or a bus.
  - Toda: 25 min. Mitaka: 26 min. Tachikawa: 18 min. Adachi: 17 min.
  - With door-to-door time, Toda, Chiba-Wakaba, Koganei and Yachiyo leave the shortlist.
- **Second blind spot: line reliability.** The JR Keiyo line (Urayasu, Mihama, Narashino, south Funabashi) stops in strong wind. MLIT publishes per-line delay days (FY2024, released 2026-04-10). We do not use it yet.
- **The ¥80M line matters more than any weight.** Kept at ¥70–100M, the top 5 hardly move, but 3–4 shortlist places at the bottom change. A budget control in ⚙ Personalise would let you see your own line live.
- **Near-term potential:**
  - **Rising now:** Matsudo, Chiba-Chuo, Inzai and Adachi. They are still affordable, with land +7–9% in the last year and new supply.
  - **Modern stock is coming:** Chiba-Chuo (491-unit tower, 2026), Katsushika (京成立石 towers 2029–31), Adachi (北千住 east-exit redevelopment, planned 2026-06), and Mihama, where the 768-unit tower handed over 2026-02 will feed resales.
  - **Dated transport fixes:** the Tozai line 南砂町 rebuild (FY2031) helps Urayasu, Ichikawa and Funabashi. TX 8-car trains arrive in the early 2030s.
- **Headwinds:**
  - Narashino: the 津田沼 redevelopment is paused about 10 years.
  - Bay-side new towns (Mihama, Hanamigawa, Inage, Wakaba): IPSS projects −14% to −16% population by 2050.
  - Yachiyo: no relief on 東葉高速 fares.

## 1. How solid is the ranking?

**Method:** each of the 7 weights is multiplied by a random factor (log-normal, sd 0.4, so most draws fall between ×0.5 and ×2), then renormalised. Totals and the shortlist (space ≥10, top 28) are recomputed. 3,000 draws.

| Area | Rank now | Median rank | 80% range | P(top 10) | P(shortlisted) |
|---|---|---|---|---|---|
| 浦安 | 1 | 1 | 1–5 | 97% | 100% |
| 松戸 | 2 | 3 | 2–16 | 79% | 100% |
| 船橋 | 3 | 4 | 1–24 | 68% | 100% |
| 美浜 | 5 | 7 | 4–21 | 62% | 100% |
| 荒川 | 7 | 10 | 4–26 | 54% | 95% |
| 市川 | 9 | 12 | 7–21 | 37% | 99% |
| 習志野 | 11 | 14 | 6–31 | 37% | 100% |
| 川崎区 | 13 | 17 | 6–33 | 28% | 97% |
| 千葉中央 | 15 | 17 | 6–33 | 33% | 100% |
| 足立 | 16 | 19 | 9–35 | 16% | 95% |
| 稲毛 | 18 | 18 | 9–32 | 15% | 100% |
| 印西 | 23 | 23 | 3–51 | 31% | 81% |
| 立川 | 25 | 23 | 8–45 | 19% | 90% |
| 町田 | 29 | 30 | 9–51 | 13% | 80% |
| 戸田 / 小金井 / 稲城 / 八千代 | 39–42 | 40–45 | ~16–60 | ≤2% | 44–58% |

**Reading:**
- The **ten watchlist areas are all ≥95% likely to be shortlisted.** The weights don't decide them.
- Inzai and Machida swing widely because they are excellent on space and poor on commute: your weights decide them.
- The last 6–8 shortlist places are coin flips.
- Minato, Shinagawa, Toshima, Bunkyo and Chiyoda rank high overall but never pass the space gate. That is intended.

## 2. What the model misses: refinement proposals

Ranked by how much each would change the result, and whether the data already exists.

### 2a. Door-to-door commute (high impact, data in hand)

**Today:** commute = station → Tokyo Station. Space counts modern 90 m²+ flats wherever they are in the municipality.

**Check:** for every qualifying flat, SUUMO gives the access (徒歩 N分, or バス N分 + 停歩). Bus is counted as ride + stop walk + 5 min wait. Median access per area:

| Area | Median access to station (qualifying flats) | Within 10 min walk | Bus-only |
|---|---|---|---|
| 浦安 | **23 min** | 0 / 36 | 14 |
| 松戸 | 15 | 3 / 13 | 2 |
| 船橋 | 14 | 14 / 41 | 5 |
| 美浜 | 15 | 11 / 43 | 0 |
| 足立 | 17 | 7 / 25 | 0 |
| 立川 | 18 | 1 / 9 | 5 |
| 三鷹 | 26 (2 flats) | 0 / 2 | 1 |
| 戸田 | **25** | 0 / 9 | 2 |
| 印西 | 5.5 | 18 / 18 | 0 |
| 川崎区, 中原, 江戸川, 杉並 | 6–7 | most | — |

**Test scenario:** commute penalised by (median access − 10 min).
- Urayasu stays #2. Mihama goes 5 → 8, Adachi 16 → 24, Mitaka 19 → 37, Tachikawa 25 → 36.
- **Off the shortlist:** Toda, Chiba-Wakaba, Koganei, Yachiyo.
- **On:** Kawasaki-Saiwai, Yokohama-Kohoku, Kashiwa, Itabashi.

**Proposal:** add access time to the commute: E = station minutes + 5/transfer + (median access of qualifying flats − 10).
- Show "flats here are typically N min from the station" in the tooltip.
- Effort: small (`build_locations.py` + tooltip).

### 2b. Line reliability (medium impact, data published)

The Keiyo line is the commute line for 4 shortlisted areas and is known for wind suspensions. The 2024 cut of 通勤快速 was only partly reversed (morning 快速 ×2 restored 2024-09; the 2026-03 timetable had no change). The 東西線 (Urayasu/Ichikawa 行徳・妙典) is regularly among the most delay-prone lines in Tokyo.

- **Source:** MLIT 東京圏の鉄道路線の遅延「見える化」, FY2024 edition published 2026-04-10. It gives delay-certificate days per 20 weekdays for 46 lines, split into small (<10 min) and large (≥30 min) delays.
- **Proposal:** a −0…−5 reliability adjustment on commute, like the crowding one, from those per-line days. Also an info line in the tooltip.
- Effort: medium (one PDF table, then map line → area).

### 2c. Budget line (¥80M) and single-crawl noise (medium impact)

**Choice** counts flats under ¥80M. Re-running space at other lines:

| Budget | Top 10 change | Shortlist out | Shortlist in |
|---|---|---|---|
| ¥70M | Chiba wards move up (美浜 #3, 千葉中央, 川崎区 top 10) | 杉並, 世田谷, 大田, 江戸川 | 八潮, 柏, 板橋, 浦和 |
| ¥90M | 江東, 足立 enter the top 10 | 小金井, 稲城, 八千代 | 江東, 武蔵野, 幸区 |
| ¥100M | 中野, 杉並 enter the top 10 | 戸田, 小金井, 稲城, 八千代 | 中野, 江東, 武蔵野, 幸区 |

Chiba-Wakaba is on the shortlist because of **one** ¥24M listing. A single crawl makes small counts jumpy.

**Proposals:**
- **Budget slider in ⚙ Personalise.** The light list (`area-listings.js`, daily, all 77 areas) already holds every 90 m²+ unit with price and year, so the browser can recompute Choice for any budget. No new scraping. Effort: medium (map-tools.js).
- **Smooth the counts:** on the next study refresh, compute space from a 30-day union of the light-list history instead of one day's crawl. Effort: small.

### 2d. Running costs (low–medium impact, watchlist only)

Fees (管理費 + 修繕積立金) for 90 m²+ flats built 2000+ in the watchlist:

| Area | Monthly fees (median) | ¥/m² | Over 35 years |
|---|---|---|---|
| 印西 | ¥32,000 | 320 | ¥13.4M |
| 浦安 | ¥36,800 | 324 | ¥15.5M |
| 船橋 | ¥38,400 | 347 | ¥16.1M |
| 美浜 | ¥45,400 | 440 | ¥19.1M |
| 市川 | ¥46,900 | 462 | ¥19.7M |

The spread is about ¥15k a month, or about ¥6M over a loan. That is second-order next to price (P ranges ¥39M–¥83M), and tower-heavy areas pay more. SUUMO index cards don't show fees, so this cannot be scored for all 77 areas.

**Proposal:** add "fees ¥/m²" as an info row for watchlist areas, plus a monthly cost estimate (loan + fees) on the Apartments tab.

### 2e. Market heat (free, needs time)

The light list already records first-seen dates and first prices for every unit, daily. After about 60–90 days (from 2026-12) it can give each area's **share of units with a price cut** and **median days on market**. These are real demand signals (sold or withdrawn, not asking). Proposal: add as info then, and use it in "potential".

### 2f. Smaller gaps (info only, if wanted)

| Item | Source | Note |
|---|---|---|
| Crime per 1,000 residents | 警視庁 区市町村別 / 千葉・埼玉・神奈川・茨城県警 municipal counts | Large differences between central wards and suburbs; easy to add as info |
| Nursery entry difficulty (入所保留) | municipal pages | Inconsistent publishing; feasible for the ~10 watchlist areas only |
| Night/holiday paediatric ER (小児救急) | prefectural 救急医療 lists | P04 has no hours (DATA_LOG 6a) |
| Park area per resident | 都市公園 statistics / municipal | Low priority |
| International / English-friendly schools | — | Only if relevant to you |

## 3. Near-future potential

The table combines the 2026 land-price change, population trend, new-condo projects on sale now (live), and web-checked projects. **Potential** means things likely to raise convenience, modern supply or value within ~5–8 years.

### Rising now (still affordable, momentum visible)

| Area (rank) | 100 m² modern | Land 1-yr / 5-yr | Pop 2020→25 | Projects on sale | Why |
|---|---|---|---|---|---|
| 松戸 (2) | ¥40M | +8.7% / +23% | −0.4% | 3 | Cheapest modern 100 m² near the top; land catching up with Ichikawa. 新拠点ゾーン (station-front) still at planning stage; no 2026 update found |
| 千葉市中央 (15) | ¥48M | +7.5% / +26% | **+7.2%** | 10 | 千葉駅 area redevelopment; 三越跡 23-storey, 491 units (completion planned summer 2026); top net inflow in region |
| 印西 (23) | ¥39M | +6.9% / +20% | **+7.5%** (IPSS 2050 +17%) | 1 | Growing new town, everything walkable (median 5.5 min); weak on commute (64 min) |
| 足立 (16) | ¥78M | +8.6% / +26% | +1.0% | 9 | 北千住駅前 redevelopment city-planned 2026-06 (100 m+ tower on the station); TX 8-car (六町/青井) |
| 船橋 (3) | ¥48M | +5.0% / +27% | +1.4% | **12** | Most choice in the region (36 modern under ¥80M), steady supply; 南船橋 south-exit already done (2023) |

### Modern stock is coming (Space should rise as new buildings become resales)

| Area | What | When |
|---|---|---|
| 葛飾 (now 0 modern 90 m²+) | 京成立石 3 redevelopment towers (北口 started 2025-11) | 2029–31 |
| 千葉市中央 | 三越跡 tower 491 units + Brillia Tower 千葉 on sale | 2026– |
| 美浜 | 幕張ベイパーク ライズゲートタワー, 768 units handed over 2026-02; ~4,500-unit new town | resales from ~2027 |
| 足立 / 荒川 | 北千住 east exit; クレストタワー西日暮里 on sale | late 2020s–2030s |
| 柏 (off list: 1 modern under ¥80M) | パークタワー柏の葉キャンパス on sale; TX 8-car | early 2030s |

### Transport with dates (confirmed status 2026)

| Project | Areas helped | Status |
|---|---|---|
| 東西線 南砂町 2-platform rebuild (fewer delays) | 浦安, 市川 (行徳/妙典), 船橋 (西船橋) | Completion FY2031 (Tokyo Metro) |
| TX 8-car trains | 流山, 柏の葉, 守谷, つくば, 八潮, 足立 | Early 2030s; platform work FY2026 |
| 羽田空港アクセス線 | さいたま 浦和/大宮/中央 | FY2031 |
| 川崎 アリーナシティ (amenity) | 川崎区 | Opening 2028-10 |
| 有楽町線 豊洲–住吉 | 江東 | Mid-2030s |

### Watch only (speculative or long-dated)

- **京葉線–りんかい線 through-running:** JR East's president spoke positively about through-running in general (2026-08). Nothing is decided. If it happens, it would give the Keiyo areas one-seat rides toward 大崎/新宿.
- **北千葉道路** (外環–成田): 3.5 km became national-managed 2026-04; no opening date.
- **臨海地下鉄** (Tokyo–Ariake): target 2040.
- **多摩モノレール to 町田:** 2040s.
- **JFE 扇島:** partial use 2028 (logistics/hydrogen, not housing).

### Headwinds

- **習志野:** the 津田沼南口 redevelopment is paused; the mall partly reopens around autumn 2028 for about 10 years.
- **Bay-side new towns** (美浜 −14%, 花見川 −14%, 若葉 −16%, 稲毛 −5% by 2050): they are aging. Fine for a 10–15-year family horizon; weaker for resale after that.
- **八千代:** 東葉高速 fares remain about 2× Keisei; requests to the national government have not led to a cut.
- **Lagging land prices** (青葉 +2.6%, 多摩 +3.2%, 町田 +3.5%, 佐倉 +3.0%): good value, slower appreciation.

### Watchlist implications

The new watchlist (top 10 shortlisted, set 2026-10-13) already covers the "rising now" group except Inzai, which is still in the original four. Candidates to **add later if wanted:**
- 葛飾 or 柏, when their new towers enter the resale market.
- 千葉市中央 is already in.

## 4. Proposed next steps (pick any)

1. **Door-to-door commute** (2a). Recommended first: data in hand, biggest effect.
2. **Budget slider** in ⚙ Personalise, plus 30-day smoothing (2c).
3. **Reliability adjustment** from MLIT 遅延の見える化 (2b).
4. **Pipeline adjustments** in the growth score:
   - Add 足立 (北千住), 葛飾 (立石), 美浜/中央 (new towers), and 浦安/市川 (東西線 FY2031).
   - Keep 習志野 −3.
5. **Info rows:** fees (watchlist), crime.
6. **Market heat** (2e): automatic once 60–90 days of light-list history exist.

## Sources (web checks 2026-10-13)

- MLIT 遅延の見える化 FY2024 — https://www.mlit.go.jp/report/press/tetsudo01_hh_000247.html
- 京葉線 2026-03 timetable (only 4 short Kaihin-Makuhari runs cut) — https://trafficnews.jp/post/616213 ; 2024 快速 changes — https://www.jreast.co.jp/press/2024/chiba/20240530_c01.pdf
- 京葉線–りんかい線 discussion — https://tabiris.com/?p=65456 ; https://trafficnews.jp/post/123846/2
- 東西線 南砂町 completion FY2031 — https://trafficnews.jp/post/552149 ; https://www.tokyometro.jp/news/images_h/metroNews260428_1.pdf
- 北千住駅前地区 再開発 (city-planned 2026-06) — https://trafficnews.jp/post/678671
- 京成立石 redevelopment (北口 started 2025-11, completion FY2029) — https://trafficnews.jp/post/132239
- 千葉駅東口 / 三越跡 tower — https://www.kenbiya.com/ar/ns/region/shutoken/7872.html ; https://www.city.chiba.jp/toshi/toshi/keikaku/documents/granddesign.pdf
- 幕張ベイパーク ライズゲートタワー (handover 2026-02) — https://www.city.chiba.jp/sogoseisaku/miraitoshi/makuhari/makuharishintoshinbaytown.html
- 津田沼南口 paused, partial reopening ~2028 — https://travel.watch.impress.co.jp/docs/news/2094222.html
- 東葉高速 fares — https://bunshun.jp/articles/-/80320 ; https://www.city.yachiyo.lg.jp/uploaded/attachment/16135.pdf
- 京成松戸線 (ex-新京成) fares unchanged after the 2025-04 merger — https://www.tetsudo.com/column/1204/
- 北千葉道路 — https://kuruma-news.jp/post/1059557
- 都心部・臨海地域地下鉄 — https://www.toshiseibi.metro.tokyo.lg.jp/bunyabetsu/kotsu_butsuryu/pdf/kentoukai_06gaiyou.pdf
- 多摩モノレール 町田 (2040s) — https://www.city.machida.tokyo.jp/kurashi/sumai/kotsu/keikaku/kyougikai.files/suke.pdf
- 川崎 アリーナシティ 2028-10, 京急川崎西口 — https://www.city.kawasaki.jp/500/cmsfiles/contents/0000146/146413/NL4.pdf
- JFE 扇島 先導エリア 2028 — https://www.city.kawasaki.jp/590/cmsfiles/contents/0000183/183568/gaiyouban.pdf
- 松戸 新拠点ゾーン (planning) — https://www.city.matsudo.chiba.jp/shisei/toshiseubi/machizukuriiinkai.files/keikaku_an.pdf
- Earlier pipeline research: `research_notes/Tokyo commute family location study/demographics_development.md` Q2
