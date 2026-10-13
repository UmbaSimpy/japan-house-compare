# Area map: parameters, sources and refresh method

This file lists every input behind the **Area map** tab: what each field means, where it comes from, how it was fetched and when it goes stale. Use it whenever the map needs a refresh. Method details, checks and limitations for each addition are in `data/DATA_LOG.md`.

## Two update tracks

| Track | What | How it updates | Who triggers |
|---|---|---|---|
| **A. Listings** (automatic) | SUUMO used/new condos and houses, price history, Telegram, **and the map's live area counts** (`area_stats.py` → `area-stats.js`) | GitHub Actions `.github/workflows/daily-scrape.yml`, daily 05:00 UTC | Automatic |
| **B. Area study** (manual) | Everything else on the Area map (this file): study, area hazard (`area_hazard.py`), office commute matrix (`commute_matrix.py`), paediatrics (`area_health.py`), aircraft noise (`data/area_noise.json`), crime (`area_crime.py`) + listing liquefaction (`hazard.py`, `hazard_cache.json`) | Re-research + rebuild locally, then commit | **The user asks for it** (e.g. "refresh the area study"). Never run on a schedule. |

Track B data changes slowly (yearly policies, annual statistics). The suggested cadence is in the last column of each table.

**Exception: the pipeline register (`data/pipeline.json`) is swept every month** (user decision 2026-10-13), using the fixed method in DATA_LOG item 13 and `python pipeline_check.py`. Two automations (user chose both, 2026-10-13):
- GitHub Action `.github/workflows/monthly-pipeline.yml` runs on the 1st at 09:00 JST. It sends a Telegram summary of due rows and new-condo projects (`pipeline_check.py --telegram`) and changes nothing.
- The Claude desktop scheduled task `japan-house-pipeline-sweep` runs on the 1st at 11:00. It does the full sweep, rebuilds and commits locally, and never pushes. It runs only while the app is open, or at the next launch.

## Pipeline (track B)

```
research_notes/Tokyo commute family location study/*.md        ← research notes with sources
research_notes/.../condo_raw/{summary,raw,land}.json           ← SUUMO crawl + land prices
        │  scripts/build_locations.py   (scores + rubric; inputs transcribed in its tables)
        ▼
data/locations.json                                            ← one record per municipality
data/boundaries.json   (build_map.py --fetch-boundaries)       ← municipality polygons
data/map_extras.json   (hand-maintained)                       ← Costco, Tokyo Stn, bus stops
data/area_hazard.json  (area_hazard.py)                        ← hazard exposure → read by build_locations.py (scored)
data/commute_matrix.json (commute_matrix.py)                   ← home stn → 38 office hubs (office picker)
data/area_health.json  (area_health.py)                        ← paediatrics (info only)
data/area_noise.json   (hand-curated)                          ← aircraft noise flags (info only)
data/area_crime.json   (area_crime.py)                         ← police crime counts 2025 (info only)
data/pipeline.json     (hand-curated, monthly sweep)           ← rail/redevelopment register → read by build_locations.py (growth)
data/area_stats_history.json (track A)                         ← 30-day median of space inputs → read by build_locations.py
        │  python build_map.py
        ▼
map-data.js  → loaded by suumo-compare.html / index.html → map.js + map-tools.js render it
area-stats.js (track A, daily: area_stats.py)                  ← live SUUMO counts per area (not scored)
reports/Tokyo commute family location study.md                 ← human-readable report
```

Refresh steps:
1. Update the relevant research note(s) with new figures and their sources.
2. Edit the matching table in `scripts/build_locations.py`. For housing, re-run `scripts/crawl.py` → `analyze.py`. For land prices, run `land.py`.
3. `python -I "research_notes/Tokyo commute family location study/scripts/build_locations.py"` rewrites `data/locations.json`.
4. `python build_map.py` rewrites `map-data.js`.
5. Optionally regenerate the report tables with `scripts/make_tables.py`.
6. Bump the `?v=` on the script tags in `suumo-compare.html`, copy it to `index.html`, commit and push.

## Scoring (weights in `data/locations.json` → `weights`)

| Sub-score | Weight | Formula (full text in `locations.json` → `rubric`) |
|---|---|---|
| space | 25 | **v2 (2026-10-13):** only listings ≥90 m² built 2000+ count. 0.5·Price (median ¥/m² of those × 100 m²; log ¥30M=100 … ¥150M=0; none → 0) + 0.5·Choice (those under ¥80M; 100·ln(1+n)/ln 61, 60+=100). Constants `SPACE_*` in build_locations.py. v1 (0.4 blended price + 0.3 count/40 + 0.3 share) retired, DATA_LOG item 9 |
| commute | 25 | E = minutes + 5/transfer; 100·(80−E)/65; crowding ±5; pass >¥30k −5, >¥45k −10 |
| childcare | 20 | fee 35 + Tokyo cash 10 + daycare waitlist 30 + 学童 15 + medical 5 + lunch 5 |
| growth | 10 | population 2020→25 (35) + IPSS 2050 (30) + land 5y (20) + child share (10) ± pipeline |
| bus | 5 | 50·AM/9 + 50·PM/9 (×0.6 if >15 min slower than rail) |
| costco | 5 | ≤15 min = 100 … ≥75 min = 0 |
| hazard | 10 | water 40 + ground 25 + landslide 10 + earthquake 25 (higher = safer; DATA_LOG item 1) |

Weights changed 2026-10-12 (user choice "Hazard 10, trim space"): space 30→25, childcare 25→20, hazard 0→10. Users can override weights and choose an office on the map (⚙ Personalise, stored in their browser only); the stored study values are what everyone sees by default.

Shortlist = top 28 by total among areas with space ≥ 10. Missing data is imputed and the substitution is written to each area's `dataFlags`; it is never silently scored 0.

Pros/cons/info on the map are **derived in `map.js` → `mpPoints()`** from the fields below with fixed thresholds (e.g. commute ≤30 min = pro, ≥50 = con). Change the thresholds there, not in the data.

## Field reference (`data/locations.json` → `areas[]`)

### Identity / geometry
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| id, nameEn, nameJa, pref, type | Municipality (区/市, 政令市 wards separate) | — | hand list in `build_locations.py` | when adding areas |
| lat, lng | Label point (main station / office) | general knowledge | hand | — |
| poly (map-data.js) | Boundary polygon | 国土数値情報 行政区域 N03 (2021-01-01), 1% simplified via github.com/smartnews-smri/japan-topography | `build_map.py --fetch-boundaries` (matched by name `N03_003+N03_004`) | only if boundaries change (mergers) |

### commute
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| station, destination, minToTokyo, transfers | Best of Tokyo Stn / Otemachi, weekday arrive-by 08:45, station-to-station | Yahoo!乗換案内 | Scripted queries, Wed 2026-10-14, IC fare, no paid expresses (see `rail_commute.md`) | yearly / after timetable revisions (March) |
| effectiveMin | minutes + 5 per transfer | derived | — | — |
| passMonthly | 1-month 通勤定期 | Yahoo!乗換案内 (includes JR 2026-03-14 fare revision) | same query | after fare revisions |
| crowding, crowdingLine | Peak 混雑率 of the main line's worst section | MLIT 都市鉄道の混雑率 FY2025 (published 2026-07-28) | PDF tables | yearly (MLIT publishes each July) |

### bus (null = no commuter-usable route found)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| route, morningCount (arr. ≤9:30), eveningCount (dep. 17:30–21:30), rideMin, fare, passMonthly | Weekday highway bus to Tokyo Station | Operator timetables: 日東交通, 京成バス, 小湊鉄道, JRバス関東/関東鉄道 (つくば号), **平和交通/あすか交通 (マイタウンライナー; timetables are images)**; Kisarazu city 金田BT PDF. **Completeness check:** Jorudan 乗換案内 高速バス情報 per-prefecture index (`mb.jorudan.co.jp/os/bexp/area/12-13/` etc.; needs a JS browser) | 1) list every route in the Jorudan index for 千葉/埼玉/神奈川/茨城/東京→東京, 2) read each Tokyo-Station route on the operator page (see `commuter_buses.md`, each row dated). Do not rely on the big groups' lists alone (DATA_LOG item 8) | every 6 months (driver shortage → cuts) |
| map_extras.json → busOrigins | Stop coordinates for the dashed lines | approximate | hand | when routes change |

### childcare
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| daycare0to2Monthly | 1st-child 0–2 認可 fee, ¥10M dual income (所得割 ≈ ¥285k) | Tokyo: 東京都 第1子無償化 (2025-09). Others: city fee tables (千葉市 R8, 船橋, 流山, つくば, さいたま市, 川口, 草加, 横浜, 川崎); Urayasu (free 2026-04), Ichikawa (free 2026-09) | PDF fee tables | yearly (April) |
| daycare0to2MonthlyImputed | Prefecture median used when the table wasn't found | derived | — | replace with real value when found |
| waitlist2025 / waitlist2026 | 待機児童 (April 1) | Tokyo 表4 (2025, 2026); Chiba/Saitama/Kanagawa prefectural lists R8; こども家庭庁 R7 Excel | PDF/Excel | yearly (published Aug–Sep) |
| gakudoWaitlist | 学童 waitlist | Tokyo 学童 R8 速報 (2026-05); CFA 放課後児童クラブ 2025-05-01 (lists ≥50 only) | PDF | yearly (Dec) |
| medicalAge / medicalCopay | 子ども医療費助成 upper age / ¥ per visit | Chiba pref list; Tokyo city pages; goo住宅 (some Tama) | web | yearly |
| lunchFree | 給食費無償化 status | municipal pages; national elementary support from 2026-04 | web | yearly |
| cashExtras | Tokyo 018サポート + 赤ちゃんファースト + ward extras | 東京都福祉局; comparison sites (ward extras partly unverified) | web | yearly |
| annualBenefitYen | Tokyo cash − 12 months of fees for two 0–2 children | derived | — | — |

### housing
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| median90to105, n90to105 | Median asking price of 90–105 m² used condos | SUUMO 中古マンション | `scripts/crawl.py` (`ar=030&bs=011&ta={pref}&sc={JIS}&mb=90`), de-dup by building+area+price | every 3–6 months |
| median90to110new, nNew | Same, built ≥2000, 90–110 m² | same | same | same |
| share90plus | 90 m²+ listings ÷ all used listings (%) | same | same | same |
| count90under80M / …Built2000 | 90 m²+ listings under ¥80M (and built ≥2000) | same | same | same |
| modern90Count, modern90Under, modern90PpmMedian | **Scored (space v2):** listings ≥90 m² built ≥2000 (any price / under ¥80M) and their median ¥/m² | same (`raw.json` l90, de-dup) | `build_locations.py` raw_stats | same |
| priceUsedForScore, spacePricePts, spaceChoicePts | modern 100 m² price (= ppm × 100) and the two space parts, shown in the map tooltip | derived | same | same |
| usedListingsTotal | All used-condo listings | same | same | same |
| landPrice, landChange5y, landYoY2026 | 公示地価 residential average | MLIT via トチノカチ | `scripts/land.py` | yearly (published March) |

Caveat: these are asking prices. In the 23 wards, 80–100 m² asking prices run ~49% above contract (REINS FY2025).

### demographics / growth
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| pop2025, change2020to2025 | 2025 census, final count (2026-09-29) | 統計局 via uub.jp | web table | every 5 years (next: 2030 census) |
| ipss2050 | IPSS 令和5年推計, 2020→2050 % | 国立社会保障・人口問題研究所 via uub.jp | web table | when IPSS republishes (~5 years) |
| childShare | 0–14 share (2020 census) | uub.jp | web | swap in 2025-census values when published |
| pipeline adj. (in growth score) | Sum of project points from the register, clamped −3…+5; `pipeline.pts` + `pipeline.projects[]` per area | `data/pipeline.json` (one row per project, URL sources per row; rubric inside the file) | monthly sweep: `pipeline_check.py` checklist + web search (DATA_LOG item 13) | **monthly** |

### costco
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| nearest, km, driveMin | Nearest warehouse, straight line ×1.35, 18–30 km/h model | Store list: hubmedia, Wikipedia (costco.co.jp finder didn't load) | haversine estimate (not routed) | when a store opens (none announced in Kanto to 2027) |
| map_extras.json → costco | Warehouse coordinates | OpenStreetMap | hand | same |

### hazard (`data/area_hazard.json`, scored)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| waterAny / waterMid / waterDeep, flood, floodDeep, surge, tsunami | % of residents in max-scenario water zones (any, 0.5–3 m, ≥3 m) | ハザードマップポータル open-data raster tiles (z14) | `area_hazard.py`, 4×4 samples per populated 500 m cell | when MLIT/prefectures publish new 想定 maps (check yearly) |
| liqHigh / liqMid / fillUpland / liqRated | landform-based liquefaction tendency; fill on hills counted separately | 国土地理院 地形分類 vector tiles | same script, 2×2 samples per cell | rarely (GSI updates landform data slowly) |
| landslide / landslideRed | % in 土砂災害警戒区域 / 特別警戒区域 | ハザードマップポータル `05_*keikaikuiki` | same | yearly (zones are added continuously) |
| quake30 | 30-yr P(震度6弱+) | J-SHIS Y2024 `T30_I55_PS` API | 5 most-populated cells per area | when J-SHIS publishes a new year |
| pop2020mesh, cells | weighting population | e-Stat 2020 census 500 m mesh T001141 | zip download (cached) | after the 2025 census mesh is released |

### commute matrix (`data/commute_matrix.json`, office picker)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| matrix[area][office] = [min, transfers, 1-month pass ¥] | home station → office hub, arrive by 08:45 Wed | Yahoo!乗換案内 | `commute_matrix.py` parses `__NEXT_DATA__`; validated first/last station; cached in `data/cache/commute_raw.json` | after a timetable revision (JR: every March) — bump `DATE` and delete the cache |
| offices | 38 hubs (id, Yahoo name, EN/JA label, district) | hand list in `commute_matrix.py` | — | add hubs on request |

### live area counts (`area-stats.js`, track A, not scored)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| total, n90, raw90, median90, median90to105, n90to105, m2price90, u80, u80modern | used-condo listings, de-duplicated (name+m²+price) | SUUMO 中古マンション search per municipality | `area_stats.py` (daily Action) | daily |
| projects, projectNames, newUnits | new-condo projects on sale vs 新築未入居 resales | SUUMO 新築マンション search | same | daily |
| d7, d30 | change in [n90, u80, projects] vs the latest snapshot ≥7/30 days old | `data/area_stats_history.json` (180 days) | same | daily |
| `area-listings.js` → areas[id].newp | every new-condo (分譲) project on sale: [path, name, priceMin万, priceMax万, m²min, m²max, station, walk, bus, delivery, units, firstSeen]; ranges span all phases/plan types, null price = 価格未定; firstSeen in `area_listings_state.json` → `proj` (null on an area's first run) | same SUUMO 新築 cards as `projects` (no extra requests) | `area_stats.py → project_row()` | daily |
| fees {n, monthly, perM2, nAll, monthlyAll, perM2All} | median 管理費+修繕積立金 per month and per m² of watchlist used condos ≥90 m² built 2000+ (`All` = any age, used when no modern listing) | `mansions.json` (detail pages, watchlist areas only) | `area_stats.py → fees()` | daily |
| history rows (`area_stats_history.json`) | [n90, median90, u80, projects, u80modern, n90modern, m2price90modern]; the last three since 2026-10-13 | same | same | daily (180 days kept) |
| `area-listings.js` → areas[id] = {base, rows} | light list: every de-duplicated 90 m²+ unit, all prices (flag vs ¥80M); row = [ncId, name, price万, m², layout, year, station, walk, bus, firstSeen, was万] | same SUUMO cards (no extra requests) + `data/area_listings_state.json` (first seen / first price per id) | same | daily |

Watchlist (full scored pipeline, Apartments tab) = the areas in `areas.json`; since 2026-10-12 also the top-10 shortlisted areas with `minM2: 80`. See DATA_LOG item 7.

### health (`data/area_health.json`, info only)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| peds, pedsDedicated, pedsHospitals, per10k, dedicatedPer10k | facilities offering general 小児科 in the municipality; dedicated = name/first-department rule | 国土数値情報 P04 医療機関 2020 (CC BY 4.0) | `area_health.py` (zips cached in `data/cache/p04/`) | when MLIT publishes a newer P04 edition (2020 is latest as of 2026-10) |
| kidsNear1km, kidsNearDedicated1km | % of children 0–14 within 1 km (straight line) | P04 + 2020 census mesh | same | same |

### crime (`data/area_crime.json`, info only, not scored)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| total, totalPer1k | all 刑法犯 recorded in the municipality, per 1,000 residents (pop2025) | Tokyo: 警視庁 町丁別 CSV R7; Kanagawa: c0030_67.pdf; Saitama: r7keihoukansityouson.pdf; Chiba: 000071144.pdf; Ibaraki: Tsukuba total only (site offline) | `area_crime.py` (Tokyo CSV + Chiba PDF parsed; Kanagawa/Saitama transcribed in the script); raw files cached in `data/cache/crime/` (gitignored) | yearly (police publish the calendar year in Feb–Mar) |
| burglary, burglaryPer10k | 空き巣 + 忍込み (home break-ins), per 10,000 residents | same | same | same |
| violent, violentPer10k | 凶悪犯 + 粗暴犯, per 10,000; null in Saitama (not published per city) and Ibaraki | same | same | same |
| safetyIndex | Crime map layer, 0–100 (100 = safest): 60% burglary (log 0.2→100 … 3.0→0) + 40% violent (log 2.5→100 … 25→0); burglary only where violent is null | derived | same | same |

Shown as a card on every area's detail page (`mpCrimeHTML`: rate, cases, rank among areas with data), plus pros/cons rows, the Crime layer and Compare. Never scored (user decision 2026-10-13).

Pros/cons thresholds (`map.js`): burglary ≤0.5/10k pro, ≥1.5 con; violent ≤3.5/10k pro, ≥10 con; all-crime ≥10/1k shown as a commercial-hub note.

### noise (`data/area_noise.json`, info only, hand-curated)
| Field | Meaning | Source | Fetch method | Refresh |
|---|---|---|---|---|
| flags[] {kind, level con/info, note, url} | aircraft routes / military airfields affecting the municipality | MLIT 羽田空港のこれから, ward pages, MOD 防衛局 pages (URL per flag) | manual research | when routes or 第一種区域 change (Atsugi revision ~autumn 2027) |

### Personalise: budget slider (browser only, DATA_LOG item 12)
| Setting | Meaning | Default / range |
|---|---|---|
| budget (万円) | Re-computes **Choice** live from `area-listings.js`: n = rows with m² ≥90, built ≥2000, price < budget; Choice = 100·ln(1+n)/ln 61; space = ½ study Price + ½ new Choice | 8,000 (= study `SPACE_BUDGET`); 5,000–15,000, step 500; stored in the browser only |

### Space smoothing (build_locations.py, DATA_LOG item 12)
| Constant | Meaning | Value |
|---|---|---|
| SMOOTH_DAYS | window: median of the daily history values for u80modern, n90modern and m2price90modern | 30 days |
| SMOOTH_MIN_DAYS | below this many days with the new fields, the study crawl values are used (flag in `dataFlags` when smoothing applies) | 10 |

### Deep look (`deeplook.py`, DATA_LOG item 15)
| Parameter | Meaning | Value / source |
|---|---|---|
| GUIDE | MLIT 修繕積立金ガイドライン R6 (¥/m²/month avg, ⅔ range) by size | <20F & <5,000 m² 335 (235–430) · 5,000–10,000 m² 252 (170–320) · 10,000–20,000 m² 271 (200–330) · ≥20,000 m² 255 (190–325) · 20F+ 338 (240–410) |
| floor-area estimate | units × this unit's m² × 1.25 | rough; note when 4,000–6,500 m² |
| price peers | 90 m²+ listings in the same area built ±5 years | `area-listings.js` |
| fee peers | watchlist condos built ±5 years (管理費 also by units ≤60 / 61–150 / 151+) | `data/condo_peers.json` (daily, from mansions.json) |
| repair-fund level | ≥ guideline low = good · ≥ 0.6× low = watch · below = risk | |
| seismic standard | completion ≥1983-04 new · 1981-06–1983-03 check permit · earlier old | 建築基準法 1981-06-01 |
| shaking | J-SHIS Y2024 AVR TTL_MTTL T30_I45/50/55/60_PS; ≥6弱 ≥70% risk, ≥50% watch | ranked vs study `hazard.quake30` |
| ground | J-SHIS sstrct V4 ARV: ≥1.6 risk, ≥1.4 watch | |
| hazard radius | centre point + worst of a 5×5 grid over ±100 m | SUUMO point is approximate |
| commute | Yahoo next Wednesday arrive 08:45, IC, no paid express; door = access + train + 5 min; bus adds 3 min wait | vs study areas with 10 min home walk |
| loan example | 100% of price, 35 years, rate from the Apartments tab (default 1.0%) | |
| buying costs | 仲介: (3% + ¥60k) × 1.1 + 3–5% other; 売主: 3–5% | |
| registered area | 壁芯 × 0.94 | tax-credit ≥50 m² check |

### Loan (`loan.js`, DATA_LOG item 16)
| Parameter | Meaning | Value / source |
|---|---|---|
| default loan | used for every all-in monthly figure until the user changes it | 10% down · 35 years · 1.525% variable (SMBC, no PR needed) · equal payments · no bonus |
| property tax | 固定資産税 + 都市計画税 estimate | 0.25% of the price per year (used condo ≈ 0.2–0.3%) |
| buying costs | cash at purchase | 7% of the price (used flat via an agent 6–9%; from a developer ≈ 4%) |
| rate-rise figure | on cards | payment at rate + 1 point minus today's payment (not shown for full-term fixed) |
| comfortable limit | Loan tab | all-in ≤ 25% of take-home pay; take-home ≈ 75% of gross |
| comfortable price | Loan tab | the price where all-in ≤ that limit at today's rate + 1.5 points |
| bank limit | Loan tab | all loan payments ≤ 30 / 35% of gross at a screening rate of 3.0 / 3.5 / 4.0% |
| tax credit | 0.7% × min(year-end balance, cap) | used home: no certificate ¥20M / 10 years; energy ¥20M (child ¥30M) / 13 years; ZEH / long-life ¥35M (child ¥45M) / 13 years |
| rate update | presets and lender table | `data/loan_rates.json`, written on the 2nd of each month by `loan_rates.py` from official lender pages (DATA_LOG item 17) |
| preset rules | v_np · v_low · v_net · f10 · flat35 | SMBC variable · lowest megabank variable · median online-bank variable · median 10-year fixed · JHF most-common Flat 35 |
| rate checks | loan_rates.py | keep last value if a source fails, is outside 0.1–8%, or moves > 0.6 pt (needs `accept`) |
| bank discounts kept by hand | loan_rates.py `MANUAL_DISCOUNT` | Yokohama 2.08 from its standard variable rate (re-check when the bank changes its plan) |
| manual lenders | Mizuho, AEON, SBI Shinsei | their sites block automated reading; check in a browser monthly and update `banks.<id>` in the JSON |

## Known gaps to fill on the next refresh
- Deep look: MLIT 不動産情報ライブラリ API key (user to apply) → sale prices, zoning around the plot, planned roads, school districts, 大規模盛土, disaster history, 公示地価.
- Crime: Ibaraki police statistics pages are offline (Tsukuba total only; Moriya, Tsukubamirai none). Saitama publishes no violent-crime figures per city.
- 0–2 fees for 13 suburbs (imputed): Kashiwa, Inzai, Matsudo, Narashino, Shiroi, Yachiyo, Sakura, Kisarazu, Sodegaura, Ichihara, Kamagaya, Moriya, Toda, Koshigaya, Misato, Yashio.
- Saitama cities' medical copay; つくば号 weekday timetable; 東名江田 bus timetable.
- City-level new-condo supply (paid 不動産経済研究所 data); 2025-census child share.
- ~~Hazard layers for all 77 areas~~ — done 2026-10-12 (`area_hazard.py`). Port the upland-fill rule to `hazard.py` (listings) on its next refresh.
- School quality (no comparable public source) and nursery entry difficulty beyond 待機児童 (入所保留 counts, inconsistent publishing) — see DATA_LOG 6d.
- Per-ward aircraft-noise levels (Lden) — not available as open data.
