# Area map: data log (method, checks, limitations)

This is the audit trail for every data addition to the Area map. Each entry records what was added, how the numbers were produced, which checks were run and what is known to be weak. `PARAMETERS.md` is the field reference; this file explains *why the numbers can be trusted, and how far*.

Rule (user-confirmed): track B data (study, hazard, commute matrix) is refreshed **only when the user asks**. Listings (track A) refresh daily via GitHub Actions.

---

## 1. Hazard / safety sub-score (2026-10-12)

**What it adds:** a `hazard` block per area in `data/locations.json` and a 7th sub-score, `scores.hazard`, where higher means safer. It appears on the map as the **Safety** layer, a bar in the detail panel, 🌊 pros/cons/info items and a deep link to the official 重ねるハザードマップ.

**Weights changed** (user choice "Hazard 10, trim space"): space 30→25, childcare 25→20, hazard 0→10. Commute 25, growth 10, bus 5 and Costco 5 are unchanged.

### Method (`area_hazard.py` → `data/area_hazard.json`)
1. **Who is exposed:** 2020 census population on the 500 m grid (e-Stat 地域メッシュ統計 T001141, 4th-level mesh, 1st-level meshes 5239/5240/5339/5340/5439/5440). A cell belongs to an area when its centre falls inside the N03 municipal polygon (`data/boundaries.json`). In total, 11,167 populated cells.
2. **What is sampled:** a 4×4 grid of points 125 m apart in every populated cell, on the following z14 raster tiles of the ハザードマップポータル. All are listed as オープンデータ 〇 (attribution: 国土交通省 / 都道府県).
   - Flood, 洪水浸水想定区域（想定最大規模）: `01_flood_l2_shinsuishin_data`
   - Storm surge, 高潮浸水想定区域（想定最大規模）: `03_hightide_l2_shinsuishin_data`
   - Tsunami, 津波浸水想定: `04_tsunami_newlegend_data`
   - Landslide, 土砂災害警戒区域 急傾斜地 / 土石流 / 地すべり: `05_*keikaikuiki`. Yellow (250,230,0) = 警戒区域; red (250,40,0) = 特別警戒区域.
3. **Depth bands** are read from the portal legend (`shinsui_legend3`): <0.5 m, 0.5–3 m and ≥3 m. Exact RGB values are in the `DEPTH` table of the script.
4. **Ground:** 国土地理院 地形分類 vector tiles (artificial layer first, then natural), sampled on a 2×2 grid per cell. The landform-to-level table is the same one `hazard.py` uses.
   - **Correction made during this work:** GSI's own text for 盛土地・埋立地 says liquefaction is "非常に強い" *in lowlands*, while on hills and plateaus the risk is collapse of the fill.
   - So fill whose natural landform is upland (level vlow/low) is counted as `fillUpland`, not as liquefaction "high".
   - Without this fix, Yokohama-Tsuzuki showed 40% "high"; with it, 19% high plus 20.5% upland fill.
5. **Earthquake:** J-SHIS 確率論的地震動予測地図 2024 (Y2024, average case, all earthquakes). The value is the 30-year probability of 震度6弱 or more (`T30_I55_PS`) at the 5 most populated cells of each area, weighted by population. Responses are cached in `data/cache/jshis.json`.
6. **Output:** every share is the % of residents whose sample points fall in the zone.
   - Water: `waterAny`, `waterMid`, `waterDeep` take the deepest of the three water layers. `flood`, `floodDeep`, `surge` and `tsunami` are per layer.
   - Ground: `liqHigh`, `liqMid`, `fillUpland` and `liqRated` (the share that is classified at all).
   - `landslide`, `landslideRed` and `quake30`.

### Score (`build_locations.py → hazard_score`)
`hazard = water 40 + ground 25 + landslide 10 + earthquake 25`, clamped 0–100.
- **Water:** 40 × (1 − (0.25·shallow + 0.6·0.5–3 m + 1.0·≥3 m)/100)
- **Ground:** 25 × (1 − (liqHigh + 0.4·liqMid + 0.4·fillUpland)/100)
- **Landslide:** 10 × (1 − min(1, (landslide + landslideRed)/10))
- **Earthquake:** linear from 40% → 25 points down to 85% → 0 points.

### Pros/cons thresholds (`map.js → mpPoints`)
| Rule | Pro | Con | Info |
|---|---|---|---|
| Residents in any water zone | ≤10% | ≥50% | otherwise |
| Residents in ≥3 m zones | — | ≥15% | — |
| Liquefaction-prone ground | high+mid ≤10% | high ≥35% | otherwise |
| Upland fill | — | — | ≥8% |
| Landslide zones | — | red ≥0.5% | any ≥1% |
| 30-year quake probability (震度6弱+) | ≤50% | ≥75% | otherwise |

### Checks run
- **Legend coverage:** every opaque pixel in the cached flood, surge and tsunami tiles matches a legend colour, so there are 0 unknown colours. Landslide tiles contain only the yellow/red pair (plus anti-aliasing).
- **Population sanity:** mesh population divided by 2025 census population has a median of 0.98, ranging from 0.80 (Saitama-Chuo, a small ward where boundary cells fall to neighbours) to 1.09 (Saitama-Omiya). The total is 21.23M against 21.59M. The ratios differ because the grid is 2020 data, cells are assigned by centre point, and populations changed between 2020 and 2025.
- **Known-geography spot checks:**
  - Urayasu and Chiba-Mihama (reclaimed land) have 94–97% high liquefaction and 94–95% storm-surge exposure. This matches the 2011 Urayasu liquefaction and the prefectural 高潮 maps.
  - Adachi and Arakawa have 96–97% of residents in flood zones, with about 60% at ≥3 m. This matches the 荒川 max-scenario map.
  - Tachikawa, Nerima and Toshima (Musashino plateau) score as the safest areas (≥90).
- **Unrated ground:** at least 85.7% of residents in every area are on classified landform. Nothing falls below the 60% flag threshold.
- **J-SHIS:** values were returned for all 77 areas, ranging from 24.3% to 89.3%.

### Rank impact (old 6-score ranks → new 7-score ranks)
- Urayasu stays #1 (69.4 → 65.2).
- Areas that rise are on firm ground: Kashiwa 4→2, Funabashi 6→3, Toshima 26→10, Bunkyo 28→13.
- Areas that fall are low-lying wards: Arakawa 5→14, Katsushika 7→21, Edogawa 8→23, Koto 14→28.
- Shortlist: Suginami and Setagaya join; Misato and Toda drop out.
- Part of every move comes from the space/childcare trim, not from hazard alone.

### Limitations (read before relying on it)
- **Rare events:** the water layers are 想定最大規模 scenarios (roughly 1-in-1000-year rain or surge). They describe the worst case, not the typical case. Upper-floor condos stay dry, but lobby, electrical rooms, lifts and access can be cut off for days in deep, long-lasting zones.
- **No pluvial flooding:** inland flooding (内水) is not included because the portal's coverage is patchy.
- **Liquefaction is landform-based:** it shows tendency, not a site survey. Prefectural 液状化危険度 maps are not open data on the portal and are not used. Always check the city map for a specific building.
- **Coarse grid:** the 500 m population grid and 125 m sampling blur small pockets of risk. The score describes an *area*, not an address.
- **Tsunami coverage** depends on each prefecture's published scenario. Tokyo Bay inner-coast values are small by design of those scenarios.

### How to re-run
```
python area_hazard.py --only urayasu,chiba-mihama   # quick test, prints but does not write
python area_hazard.py                               # all areas (tiles cached in data/cache/, ~5 min warm, ~40 min cold)
python -I "research_notes/Tokyo commute family location study/scripts/build_locations.py"
python build_map.py
```

### Open question for the listing pipeline
`hazard.py`, which labels SUUMO listings, uses the same landform table and still treats *all* 盛土地 as liquefaction "high". This affects listings on plateau new towns (Chiba New Town, Midori-ku). The `area_hazard.liq_at` upland-fill rule should be ported there on the next listing-hazard refresh. Not changed yet, because `hazard_cache.json` is track B and refreshes only on request.

---

## 2. Personal weights with live re-rank (2026-10-12)

**What it adds:** the **⚙ Personalise** chip on the map, with seven sliders (0–50, step 5, one per sub-score). Moving a slider recomputes total, rank and shortlist instantly. A reset button restores the study weights. Preferences live in the browser only (`localStorage` key `mpPrefs`) and never reach the server.

**Method (`map-tools.js → mpRescore`):**
- `total = Σ wₖ·sₖ / Σ wₖ`, the same formula as `build_locations.py`. Only the weights change; the sub-scores stay the study values.
- Shortlist = the top `shortlistSize` (28) by total, among areas with `space ≥ spaceGate` (10), as in the study.
- At the default weights with no office set, the page shows the stored study values (`a._0`) instead of recomputing, so there is no rounding drift.

**Checks:** at the default weights, totals, ranks and shortlist flags equal `data/locations.json` by construction (stored values). Dragging hazard to 50 moved low-lying wards down live, the list rows re-sorted without replaying the entry animation, and the setting survived a reload. Test prefs were cleared afterwards.

**Limitation:** a weight of 0 removes that score from the total but the bar is still shown in the detail panel (labelled with its weight %).

## 3. Area comparison, 2–3 areas (2026-10-12)

**What it adds:** a ⇄ toggle on every list row and in the detail view, plus a tray at the bottom. **Compare** opens a side-by-side table: scores, commute (including the chosen office), childcare (including paediatrics from item 6a), housing (study and live counts), hazards (including aircraft noise from 6b), growth and Costco. The pros/cons lists sit underneath.

**Method:** the table only reads existing fields; no new data is involved. Each row is tagged `hi` (higher is better), `lo` (lower is better) or untagged. The best value is tinted green and the worst red; ties and untagged rows get no tint.

**Transparency additions:**
- Housing rows show the sample size (`n=`) and the price actually used by the space score.
- Kashiwa's ¥15M 90–105 m² median is real: it comes from large 1970s–80s 団地 stock. The `n=` makes that visible next to the much higher modern-unit median.

**Checks:** works on desktop and at 375 px mobile width (the table scrolls horizontally inside the modal, the page itself does not). Esc and backdrop both close it, and the console shows no errors.

## 4. Live listing counts per area (2026-10-12) — track A, daily

**What it adds:**
- `area_stats.py` runs in the daily GitHub Action (step `id: as`, `continue-on-error`, 25-min timeout) and writes `area-stats.js` plus `data/area_stats_history.json` (180 days).
- On the map: a **Listings now** layer (count of 90 m²+ under ¥80M), 🏢 info items (live counts, 7/30-day change, new-condo projects on sale), and three compare rows.
- The study scores are **not** changed by live data. The study stays frozen at its date; live numbers are shown next to it.

**Method:**
- SUUMO 中古マンション search per municipality (`ta`/`sc` from the N03 code). The total comes from the `.pagination_set-hit` count; the ≥90 m² pages are read at 100 cards per page, up to 12 pages.
- A card is dropped when its 所在地 does not contain the municipality name, because SUUMO pads small result sets with neighbouring cities.
- Duplicates (the same unit listed by several agents) are removed by the key building-name + m² + price.
- New condos (`bs=010`): cards that contain 「間取りタイプ別価格」 are developer **projects**; the rest are 新築未入居 resale units.

**Checks:**
- Chiba-Mihama test: 39 under ¥80M against the study's 41 a few days earlier, with identical totals.
- First full run (2026-10-12): 77/77 areas, 0 failures.
- Fail-safe: a failed area keeps its previous values marked `stale: true`, and the whole file is kept if more than half the areas fail.

**Limitations:**
- `d7`/`d30` trends appear only once history at least 7 or 30 days old exists, from about 2026-10-19 onward.
- Asking prices, not sale prices.
- De-duplication can merge two genuinely identical units in one building, which slightly undercounts.

## 5. Commute to your own office (2026-10-12) — user-chosen

**User decision:** the office is an input chosen on the map, not a fixed answer.

**What it adds:**
- An office picker inside ⚙ Personalise: 38 hubs grouped by district (Marunouchi … Shinjuku, Yokohama, Omiya, Makuhari, Chiba).
- When an office is set, each area's commute sub-score is recomputed for that office.
- The detail view shows minutes, transfers, the office's commuter pass and a door-to-door estimate, plus a Yahoo!乗換案内 link for the user's own check. Compare shows the same values.
- The walking-minute inputs (home → station, station → office) only feed the door-to-door figure and **do not change the score**, because the study's commute score is station-to-station.

**Method (`commute_matrix.py → data/commute_matrix.json`, track B):**
- Yahoo!乗換案内 from each area's home station to every hub: weekday (Wed 2026-10-14), arrive by 08:45, IC fare, no paid expresses. This is the same method as the study's Tokyo/Otemachi values.
- The values are read from the page's `__NEXT_DATA__` JSON (summaryInfo: totalTime, transferCount, teiki 1-month).
- The fastest route is kept; ties go to fewer transfers.
- Each answer is validated: the route's first and last station must match the query.
- Ambiguous names are pinned to a prefecture (府中→府中(東京都), 大宮→大宮(埼玉県), …). 柏(千葉県) resolves to a *bus stop*, so plain 柏 is used.
- **Score**, the same as `commute_score` in the study: `eff = min + 5·transfers`; `100·(80−eff)/65`, clamped; crowding adjustment from the home line (≥158% −5, ≥150% −2, ≤125% +5); pass > ¥45k −10, > ¥30k −5.

**Checks:**
- `--check` re-queried Tokyo and Otemachi for all 77 areas: every area was within 3 min of the study except Kashiwa, which had resolved to the bus stop (fixed).
- In the browser, office = Tokyo Stn reproduces the study commute scores for 76/77 areas. Chiba-Chuo gives 55 instead of 53.5 because the study used a slower 1-transfer variant.
- Full-run results are under *Full run* below.

**Limitations:**
- One home station per area, the study's representative station. Outlying parts of large cities can be 10–20 min worse.
- Hubs are station-level; buildings 10 min from a station are covered only by the walk input.
- Crowding uses the home line's study value and ignores the office-side line.
- Bus routes still end at the Tokyo Station area, so the bus score does not change with the office.

### Full run (2026-10-12, search date Wed 2026-10-14)
- **Coverage:** 77 homes × 38 hubs = 2,926 routes, all resolved: 0 failed, 0 unvalidated (first and last station matched the query on every route).
- **Agreement with the study:** for Tokyo Stn and Otemachi, 0 areas differ from the study's rail minutes by more than 3 min.
- **Spot checks:**
  - Funabashi → Shinjuku 41 min, 2 transfers.
  - Urayasu → Tokyo 20 min, direct.
  - Tama → Shinjuku 47 min, direct.
  - Kashiwa → Otemachi 45 min, 1 transfer.
  - Yokohama-Kohoku → Shibuya 25 min, direct.
- **Edge case:** when the hub *is* the home station (e.g. Chiba-Mihama → 海浜幕張), the value is 0 min / ¥0, so the commute score is 100. This is correct for someone working at that station. The walk inputs still add the door-to-door minutes.
- **Runtime:** about 70 min at ~40 queries/min (1.6 s pause between requests).

## 7. Listings per area: light list for all 77 + watchlist of 12 (2026-10-12)

**User decisions:**
- Every area gets a *light* list.
- Show all prices, flagged against ¥80M.
- Full tracking covers the 10 best-scored areas.
- The daily Telegram message is paused.

**Light list (`area_stats.py` → `area-listings.js`, track A, daily):**
- **Data:** every de-duplicated 90 m²+ used-condo card the script already fetched. Each row holds: name, price, m², layout, year, station, walk/bus, the SUUMO link (full path, because short `/nc_` URLs return 404), first-seen date and first price.
- **Badges:** first-seen data comes from `data/area_listings_state.json`, which records each SUUMO id's first sighting and first price.
  - *NEW* = first seen within the last 7 days. It never applies on an area's first run (the area's `_seeded` date).
  - *↓ price cut* = the unit is now cheaper than the highest first price seen among its agent ids.
  - Ids unseen for 30 days are pruned.
- **Map:** shown in the area panel (Overall or Housing tab). Controls: All / Under ¥80M, five sort orders, show 12 or all. The file is lazy-loaded on first open.
- **Cost:** no extra SUUMO requests. The file is about 0.4 MB.
- **Limitation:** the de-duplication key is name + m² + price. Two agents listing the same unit at different prices show as two rows.

**Watchlist (full scored pipeline, Apartments tab):**
- Added the top-10 *shortlisted* areas not already tracked: Urayasu, Kashiwa, Funabashi, Ichikawa, Inage-ku, Tama and Arakawa.
- Minato, Shinagawa and Toshima are in the overall top 10, but they fail the space gate (0–1 units of 90 m²+ under ¥80M), so they were not added.
- New areas use `minM2: 80` (SUUMO `mb=80`). That is about 750 listings, against about 3,500 at all sizes, which would roughly triple the 1.7 MB page.
- Liquefaction source `gsi_landform`.
- Seeded locally (detail pages fetched once), so the daily Action only fetches new listings. The condo step timeout went 40 → 60 min and the area-stats timeout 25 → 35 min.

**Telegram:**
- `TELEGRAM_DAILY: 'off'` in the workflow. `notify.py` still builds the message (printed in the Actions log) and still persists known-listing state, so re-enabling won't flood.
- `❌ FAILED` alerts are still sent.
- To be simplified before it is re-enabled.

## 6. Missing information (2026-10-12)

### 6a. Paediatric care access — `area_health.py → data/area_health.json` (track B, info only, not scored)

**Source:** 国土数値情報 医療機関データ P04, 2020 edition. This is the latest published edition: the 2021+ URLs return 404. Licence CC BY 4.0; prefectures 08/11/12/13/14. Children = 2020 census 500 m mesh, ages 0–14.

**How a facility counts as paediatric:**
- 診療科目 is abbreviated and **spelled differently by each municipality**, so a token census was run over all 5 prefectures:
  - 小児科 3,967; 小 2,950; 小児 462; 小児皮膚科 180; 小児外科 97; 小外 90; …
- General paediatrics = a token in {小児科, 小, 小児, 小児内科, 漢方小児科} or starting with 小児科.
- Surgical, dental, eye, skin and ENT tokens alone do not count.
- **Bug caught:** the first version matched only 小児科 and 小. Nerima had 8 facilities for 90k children and Itabashi 16, because those wards write 「小児」. After the fix the counts are 173 and 134.

**"Dedicated" paediatric clinic** (as opposed to a GP that also sees children):
- Rule: paediatrics is listed first, **or** the facility name contains 小児/こども/子ども/子供/キッズ/チャイルド without 内科.
- Department order alone is unreliable: Chiba lists departments in a fixed order with 内 first. Example: 「くやま小児科医院 | ア 小」.

**Per area:**
- `peds`, `pedsDedicated` and `pedsHospitals`: facilities inside the municipal polygon.
- `per10k`: peds per 10k children.
- `kidsNear1km` and `kidsNearDedicated1km`: % of children whose mesh-cell centre is ≤1 km straight-line from such a facility. Facilities across the border count.

**Distribution (77 areas):**
- per10k: median 15.1 (6.5 Tsukubamirai … 49.3 Chiyoda).
- kidsNearDedicated1km: median 84%. Lowest are Sodegaura 0%, Ichihara ~6%, Inzai 9%, Kisarazu and Tsukubamirai; most wards are ≥90%.

**Map rules:** ≥90% of children within 1 km of a dedicated clinic is a 👶 pro; <50% (rounded) is a con; anything else is info. Compare has two rows.

**Limitations:**
- 2020 data; clinics have opened and closed since.
- Straight-line distance, not walking distance.
- No opening hours, night or holiday coverage (小児救急), or waiting times.
- Very small central wards (Chiyoda) look extreme because few children live there.

### 6b. Aircraft noise — `data/area_noise.json` (hand-curated, track B, info only, not scored)

**What it is:** municipality-level flags with a source URL each, not a noise contour. Altitudes are quoted only where an official page states them.

**Haneda new routes** (operating since 2020-03; MLIT 羽田空港のこれから lists per-municipality route maps):
- **South-wind arrivals:** 15:00–19:00, about 3 h on south-wind days (~40% of the year), up to 44/h.
  - **Con** (low, about 1 km or less):
    - Shinjuku: ward page gives about 915–1,040 m.
    - Minato: ward map gives about 600–750 m in fine weather.
    - Shibuya, Meguro, Shinagawa and Ota: downstream of Shinjuku on the descent, so lower.
  - **Info** (higher): Nakano, Toshima, Nerima, Itabashi, Kita, Kawaguchi, Toda, and Saitama city. MLIT has one map for the whole city, so all five Saitama study wards are flagged.
- **North-wind departures** along the 荒川 (7:00–11:30 and 15:00–19:00): Koto and Edogawa (river edge), and Katsushika at about 1,200–1,950 m per the ward page.
- **B-runway departures** over the waterfront: Kawasaki-ku.
- **Conventional routes over Chiba:** areas that host an MLIT Haneda noise-monitoring station (Urayasu, Ichikawa, Funabashi, Chiba-Chuo, Chiba-Midori, Sakura, Kisarazu) are flagged as info.

**Military airfields:**
- Shimofusa (JMSDF): Kashiwa, Kamagaya, Shiroi and Funabashi, based on the 2023-10 joint mayors' request.
- Atsugi: the 第一種区域 touches Machida only at 金森5・6丁目.
- Camp Kisarazu: the JGSDF Osprey interim deployment was due to move to Saga by mid-Aug 2025.
- Tachikawa: JGSDF airfield in the city, with Yokota about 5 km west. Yokota's 第一種区域 coverage of Tachikawa was **not confirmed**.

**Not found, not claimed:** exact per-ward Lden values. MLIT's results per station are not published as open data I could retrieve. Narita affects none of the 77 areas.

**Limitations:** areas without a flag only mean "nothing found in these sources". Road and rail noise is not covered. Re-check MOD 第一種区域 revisions; Atsugi's zones are being revised for about autumn 2027.

### 6c. New-condo projects per area
Covered by item 4: `projects` and `projectNames` are live and refresh daily.

### 6d. Gaps — documented, not filled
- **School quality:** Japan publishes no per-school results. 全国学力・学習状況調査 results are released at prefecture level; municipal release is optional and uneven, so there is no comparable source for 77 areas. Not added, to avoid a misleading proxy.
- **Nursery entry difficulty beyond 待機児童:** the counts of applicants put on hold (入所保留/不承諾) are the better signal. Each municipality publishes them in its own format, and many don't publish them at all. The study's `waitlist2025`/`waitlist2026` (official 待機児童) remains the only comparable measure. Candidate for a later manual pass on the shortlist only.

## 8. Bus coverage correction: 3 missed Chiba routes (2026-10-12, user report)

**Trigger:** the user lives in Makuhari and takes the マイタウンライナー ベイエリア線 (https://heiwakotsu.com/timefare_mtl_bayarea.htm). The study had marked 幕張 as "no Tokyo Station bus".

**Root cause:** the first sweep read only the big groups' route lists (京成, 小湊, 日東, JRバス関東). It never checked the independents 平和交通 and あすか交通. It also skipped Keisei's 新浦安 commuter route because Keisei files it under "東京ディズニーリゾート".

**Method (re-sweep):**
1. Read Jorudan 乗換案内 高速バス情報 per-prefecture indexes, updated 2026-09-03: 千葉～東京 (43 routes), 埼玉～東京 (2), 神奈川～東京 (6), 茨城～東京 (19), 東京都内 (6). Every route with a weekday Tokyo Station terminal was checked on the operator's own timetable.
2. Also checked all Keisei 904xx route pages and the Tobu highway list.
3. Read the 平和交通 timetables, which are images: `timefare_mtl_bayarea/20261001_bayarea.png` and `timefare_mtl_chihara/20260301_chihara.png`. Read Keisei 90401 (HTML timetable, 2024-05-27).
4. Counted with the rubric unchanged: A = arrivals at Tokyo Station by ~9:30; P = departures 17:30–21:30. The ×0.6 slower-than-rail rule is applied with a representative mid-route ride time.

**Changes (`build_locations.py` BUS table → `data/locations.json`, stops in `data/map_extras.json`):**

| Area | Route | A / P | ride used | bus score | total | rank |
|---|---|---|---|---|---|---|
| 浦安 | 京成 東京駅～TDR・新浦安地区 | 10(→9) / 5 | 45 (rail 20) | 0 → 46.7 | 65.2 → 67.5 | 1 → 1 |
| 美浜 | マイタウンライナー ベイエリア線 | 4 / 3 | 65 (rail 34) | 0 → 23.3 | 61.3 → 62.5 | 5 → 4 |
| 稲毛 | same, 稲毛ルート (was ちばきたライナー 1/1) | 2 / 3 | 75 (rail 37) | 6.7 → 16.7 | 59.0 → 59.5 | 11 → 10 |
| 若葉 | おゆみ野・ちはら台線 from 大宮町 (was 千城台 1/1) | 4 / 4 | 70 (rail 49) | 6.7 → 26.7 | 51.0 → 52.0 | 49 → 45 |
| 緑 | おゆみ野・ちはら台線 | 4 / 4 | 85 (rail 58) | 0 → 26.7 | 45.6 → 46.9 | 67 → 66 |
| 市原 | おゆみ野・ちはら台線 from ちはら台 (was 鶴舞 1/2) | 4 / 4 | 100 (rail 60) | 16.7 → 26.7 | 41.6 → 42.1 | 75 → 75 |

The shortlist is unchanged. Only neighbours shifted by one place (港区 4 → 5, 豊島区 10 → 11, and four areas around rank 45–49). When an area has two routes, the **better** one is scored and the other is named in `route`. Counts are not summed, because the stops are far apart.

**Checks:** diffed `locations.json` before and after; only these 6 bus records and the dependent totals and ranks changed. The Mihama timetable was read directly from the operator image: 4 inbound (5:12/5:47/6:02/6:27 starts) and 6 outbound (Tokyo 18:50 … 0:00).

**Limitations:**
- The 平和交通 sheet is headed 2025-02-01, although its file name says 2026-10-01; the operator page links it as the current timetable.
- No commuter pass is listed for any of the three routes. Keisei 90401 says 回数券・定期券は販売しておりません.
- The 17:30–21:30 evening window is the study rubric. Late buses (Mihama 21:50/22:50/0:00, Urayasu 21:40/22:10/23:10) are recorded in the notes but not counted.
- Ride times are the morning peak and vary 2× along each route.
- **Not scored** (destination rule = Tokyo Station): 小湊 学園前・海浜幕張・南船橋 → 新宿, and 幕張メッセ → 東京/秋葉原 (event-only).
- The 柏の葉・おおたかの森 → 東京駅 line (2021) is no longer listed anywhere and is treated as discontinued.

**Next refresh:** re-run the Jorudan index sweep, not just the operator pages, every 6 months, or when the user asks. Details and per-route stop lists are in `research_notes/…/commuter_buses.md` → "Correction 2026-10-12".
