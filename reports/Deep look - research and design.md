# Deep look: what one listing can tell you beyond the quick look

*Research and design for an in-depth single-property analysis tool. 2026-10-13. No code was changed on the site.*

## Summary

- **SUUMO gives more than the listing card, but much of it is optional.** Every listing has price, size, floor, build date, fees, land rights, zoning and approximate coordinates. Many items an agent can fill in are usually blank:
  - Energy labels: 0 of 52 sampled listings.
  - Builder: half of the condos.
  - Double glazing: tagged on 5 of 40 condos and 6 of 12 houses.
  - Seismic certificates: 1 of 40 condos.
  - A missing tag means "not stated", not "not present".
- **Most of the hidden risks come from other public data, keyed on the listing's coordinates:**
  - flood, storm-surge and tsunami depth
  - liquefaction and reclaimed land
  - ground amplification
  - 30-year shaking probability
  - zoning, planned roads, school districts and filled land
  - actual sale prices nearby

  Most of this is free and we already use part of it. The rest comes from MLIT's 不動産情報ライブラリ API, which needs a free API key that you must apply for.
- **Comparison is what turns a number into a judgement.** The worked example below shows it:
  - The repair fund looks alarming against the government guideline but is normal for the local market.
  - The price looks ordinary but is the cheapest of its 15 peers.
- **Some things are never online.** The repair-fund balance, arrears, the long-term repair plan, the management minutes, the real window type and the neighbours. The tool should end with the exact documents and questions to request from the agent.

## 1. How this was checked

- **Full page sets for 4 listings,** with every sub-tab (物件概要, 周辺環境, 設備, 会社, plans):
  - a 2010 used condo
  - a 1975 used condo
  - a 2012 used house
  - a new condo project (all in Mihama)
- **A fill-rate sample:** 40 used-condo main pages (10 areas × 4 build-age bands) and 12 used houses, fetched 2026-10-13.
- **Scripts and outputs:** `research_notes/Deep look/`. Fill rates: `fill_rates_2026-10-13.txt`. Field dumps: `sample_fields_*.txt`, with agent contact details removed.
- **External checks:**
  - MLIT 修繕積立金ガイドライン (2024 revision)
  - 不動産情報ライブラリ API catalogue
  - 2026 mortgage tax-credit rules
  - 省エネ性能表示制度
  - point lookups on the hazard portal tiles, GSI landform and J-SHIS (hazard and ground)

## 2. What SUUMO provides

### Always there (used condo and house main page)

| Field | Notes for the analysis |
|---|---|
| 価格, 専有/建物/土地面積, 間取り | Condo area is 壁芯 (to wall centre). The 登記 area (内法) is ~5–8% smaller, and the tax rules use 登記 |
| 所在階, 構造・階建て, 向き, その他面積 (balcony) | floor position, structure (RC/SRC/S/木造) |
| 完成時期(築年月) | seismic standard (新耐震 = building permit from 1981-06; wooden houses also 2000-06), tax credit (built 1982+) |
| 管理費 **with 管理形態** (e.g. 委託(通勤)), 修繕積立金 | 40/40. The management type is inside the fee text |
| 敷地/土地の権利形態 | 所有権 / 所有権の共有 / 借地権 / 定期借地権 |
| 交通 | up to 3 stations with walk or bus minutes |
| 駐車場 | 29/40 filled: on-site or nearby, fee range, 空無 (waitlist) |
| 用途地域 | 35/40 condos, 12/12 houses |
| 引渡可能時期 | |
| Coordinates | `lat`/`lng` in the page script. The page says it is approximate (付近住所) |
| 取引態様 | 売主 / 仲介 / 代理. Decides whether a ~3% + ¥60k agent fee applies |
| 特徴ピックアップ | standard tag list, see below |
| 物件の特徴 + photo captions | free text; occasionally reform dates, pets, management notes |

### Houses only

| Field | Fill | Why it matters |
|---|---|---|
| 私道負担・道路 | 12/12 | road width and direction; private-road share; re-building needs ≥2 m frontage on a ≥4 m road |
| 建ぺい率・容積率 | 11/12 | check whether the house exceeds them (違反 or 既存不適格: loan and resale problems) |
| その他制限事項 | 6/12 | e.g. "22条区域, 第一種高度地区(31m), **宅地造成工事規制区域**", "設備の契約不適合責任免責" |
| その他概要 | 12/12 | 公営水道 / 本下水 / 都市ガス vs プロパン / 浄化槽 |
| 地目 | 1/12 | rarely given |

### New condos (property + rooms tabs)

- **One-off fees:** 管理準備金 and 修繕積立基金, e.g. ¥385k–827k at the example project.
- **Monthly fees** per plan range.
- **Parking:** number of spaces and type, e.g. "98台, 平置き".
- **Bicycle and bike parking:** count and fee.
- **Site area, building and floor area, total units, 管理形態.**
- **Schedule and phase prices.**
- **Plan list** with area and price per plan. Prices are often 未定.

### Optional and mostly blank

| Field | Fill | Comment |
|---|---|---|
| エネルギー消費性能 / 断熱性能 / 目安光熱費 | **0/52** | The label is only expected for buildings permitted from 2024-04. Used homes almost never have it |
| 施工 (builder) | 20/40 condos, 1/12 houses | ask |
| リフォーム | ~half | sometimes with date and scope |
| 敷地面積 (condo) | 0/40 | |
| 諸費用 | 16/40 | internet, CATV and similar fixed monthly charges |

### Feature tags (特徴ピックアップ): opt-in, so absence ≠ no

- **Buyer-relevant tags seen in the sample:**
  - 複層ガラス / 全居室複層ガラスか複層サッシ: 5/40 condos, 6/12 houses
  - 耐震基準適合証明書: 1
  - フラット35・S適合: 3
  - 瑕疵保証付: 1
  - 建築確認完了検査済証: 1
  - 省エネ給湯器: 5
  - 太陽光: 1
  - 都市ガス: 10/12 houses
  - 前道6m以上: 8/12
  - 整形地
  - 区画整理地内
  - 24時間有人管理: 4
  - 最上階・上階なし
  - 角住戸
  - 前面棟無
  - ペット相談: 21/40
  - 駐車2台可
  - 平面/自走式駐車場
- **Tags are a positive signal only.** The tool should say "not stated: ask" rather than "no".

### 周辺環境 tab

Named nearby facilities with walking distance: schools, daycares, hospitals, supermarkets, parks, station, ward office. It is filled for every listing checked.

## 3. What a first-time buyer should check, and where the data comes from

Key: **S** = SUUMO, **X** = external public data (automatable), **K** = needs the MLIT API key, **A** = only from the agent or documents, **V** = only on a visit.

Comparison baselines we already hold:
- `area-listings.js`: every 90 m²+ used condo in 77 areas, daily.
- `mansions.json`: ~2,000 watchlist condos with fees, parking, builder and price history.
- Area study data: hazard, crime, noise, paediatrics, childcare, growth.

### A. Is the price fair?
- **¥/m² vs comparable flats** (S + our lists): same area, ±5 years of build, 90 m²+; also the same building.
- **Price history:** first seen, price cuts, days on market (our light list and caches).
- **Actual sale prices** nearby (K, XIT001/XPT001). Asking prices in the 23 wards run well above contract (REINS).
- **Why is it cheap?** If it is far below its peers, list the likely reasons: floor, orientation, hazard, fees, land rights.

### B. True monthly and one-off costs
- **Monthly:**
  - 管理費 and 修繕積立金 per m², vs peers and vs the **MLIT guideline**. For <20 floors and <5,000 m² floor area: average ¥335/m²/month, ⅔ of cases ¥235–430.
  - A fund far below the guideline usually means **future increases or a one-off levy**.
  - For new condos, check the 段階増額 (step-up) plan. The 2024 guideline says the start should be ≥0.6× and the end ≤1.1× of the even amount.
- **Other recurring:** parking fee and availability; fixed internet or CATV charges; 機械式駐車場 maintenance (a heavy burden on old buildings).
- **Property tax:** estimate from land price and building age (X/K); ask for the 固定資産税 amount (A).
- **Purchase costs:**
  - agent fee (none if 売主)
  - registration and scrivener fees
  - 不動産取得税
  - loan fees
  - fire and earthquake insurance (the premium depends on prefecture and structure)
  - typically **6–9% of price** for a used home via an agent
- **Old units:** renovation budget.

### C. Land rights and legal limits
- **Condo:** 所有権 or 所有権の共有 is normal. 借地権 and 定期借地権 mean land rent, an end date and a dismantling reserve, so resale and loans are harder (S).
- **House** (S, then K and A):
  - frontage and road width, private-road share, セットバック, 再建築不可
  - over-built 建ぺい/容積
  - 市街化調整区域
  - 宅地造成規制区域, 高度地区, 防火地域
  - **a planned city road (都市計画道路) crossing the plot** (K, XKT030)
  - 地区計画 (K)
  - boundary survey (境界確定) and encroachments (A)
- **What can be built next door:** the 用途地域 of the surrounding blocks (K, XKT002). Commercial zones allow tall buildings that can take the view and the sun.

### D. Earthquake safety
- **Build date:** the 新耐震 rule depends on the building-permit date (from 1981-06), so completion in 1982–83 needs checking (A: 確認済証). Wooden houses: the 2000 standard.
- **Structure and tags:** 免震 / 制震.
- **Shaking and ground (X, J-SHIS):**
  - 30-year probability of 震度6弱+ and 6強+
  - **surface ground amplification** (ARV: about 1.6 or more = soft, prone to stronger shaking)
  - ground type (埋立地 etc.)
- **Older buildings:** 耐震診断 results (A). A 耐震基準適合証明書 also unlocks the tax credit for pre-1982 buildings.

### E. Water and ground
- **Depth at the point (X, hazard portal):** flood, storm surge, tsunami. Judge it against the **floor** and against where the building's electrical room, water tank and parking are (A).
- **Ground:**
  - liquefaction tendency from GSI landform, which separates reclaimed former water from upland fill (X)
  - **large filled land** (大規模盛土造成地) (K, XKT020)
  - landslide zones (X)
  - past disasters (K, XST001)
  - old maps showing former paddies or sea (manual: 今昔マップ)

### F. What the nearest line really means for the commute
- **Door to door:**
  - walk or bus minutes from the listing (S)
  - train time, transfers and pass cost to **your** office (X, Yahoo, as in the office picker)
  - first and last trains; whether a 始発 (seat) is possible
- **Reliability and crowding:** MLIT delay data per line (遅延の見える化) and MLIT peak crowding per section (混雑率) (X).
- **Alternatives:** 2沿線以上 tag, bus fallback. Station passenger trend (K, XKT015).

### G. Building management and condition (condos)
- **From SUUMO:** 管理形態 (常駐 / 日勤 / 通勤 / 巡回 / 自主管理); total units (small buildings mean higher cost per unit); builder.
- **Age vs the major-repair cycle:**
  - 1st 大規模修繕 at ~12–15 years
  - 2nd at ~24–30
  - 3rd often includes pipes and lifts
  - Was it done, and was it paid from the fund or by a levy and loan? (A)
- **Only via the agent's 重要事項調査報告書 (A):**
  - fund balance
  - arrears
  - loans of the management association
  - planned work
  - the last 2–3 years of general-meeting minutes
  - 管理規約: pets, flooring sound rating, renovation rules, short-term rental ban

### H. The unit itself
- **Position:** floor and corner (top floor = heat and leaks; ground floor = damp and security); orientation; 前面棟無; balcony (S).
- **Windows** (S tags, photos, A):
  - single vs double glazing
  - sash replacement rules: sashes are common property in condos, so you usually cannot change them yourself
- **Size:** 壁芯 vs 登記 area, which matters for tax thresholds at 50 m².
- **On the visit (V):** ceiling height, layout changeability, water pressure, smells, noise.

### I. Energy and running cost
- **Labels** are almost never available for used homes. Use proxies:
  - build era
  - glazing tags
  - top-floor or corner exposure
  - **gas type: 都市ガス vs プロパン (LPG is markedly more expensive)**
  - オール電化, 太陽光, 省エネ給湯器
- **Ask for** 住宅性能評価書 / BELS / 長期優良.
- **The 2026 tax credit tiers depend on it.** A used home with no certificate: ¥20M cap, 10 years. 省エネ基準適合: ¥20M, 13 years. ZEH-level or 長期優良: ¥35M, 13 years. Floor area ≥50 m² (登記) and built 1982+ (or certified) are required.

### J. Parking and mobility
- **Condos:** on-site or nearby, fee vs the area (S + our data), waitlist (空無), mechanical vs flat (S), high-roof spaces.
- **Houses:** 2-car space.
- **Bicycles:** bike parking for children's bikes (new-condo data). EV charging (A).

### K. Family life around the home
- **Schools:** the **assigned** elementary and junior-high school district (K, XKT004/005), which is not always the nearest school.
- **Childcare:** daycares nearby (S tab, K XKT007) and the area waitlist (our study).
- **Everyday:** parks, paediatrics (our area data), supermarkets (S tab).
- **Safety and noise:** crime (our area data); noise from aircraft (our data) and from main roads or rail lines nearby (X: distance to lines and major roads).
- **Future:** 250 m-mesh population projection (K, XKT013); inside the city's **居住誘導区域** (K, XKT003), where future services are concentrated.

### L. Resale and future value
- station distance and size vs what the area's buyers want (our lists)
- number of comparable listings (liquidity)
- area growth score and pipeline (our study)
- land-price trend at the nearest 公示地価 point (K, XPT002)

### M. Contract terms
- **取引態様 (S):** 売主 means no agent fee and usually a warranty; 仲介 means an agent fee.
- **Seller warranty:** 契約不適合責任 免責 (S text, A). Individual sellers often limit it to 3 months or exclude equipment.
- **Inspection and insurance:** 既存住宅売買瑕疵保険, インスペクション report (tags and A).
- **Disclosures:** 告知事項 (psychological defects), asbestos survey for old buildings (A).

## 4. Worked example: ヴィークコート検見川浜 (Mihama, 2010, 91.56 m², ¥48.8M)

**What the quick look shows:**
- 4LDK, south-east corner on the 3rd of 5 floors, 8 min to 検見川浜.
- Floor heating, disposer, mist sauna, pets allowed.
- Fees ¥31,300/month; on-site parking.

**What the deep look adds** (all from the sources above, run on 2026-10-13):

| Topic | Finding | Read |
|---|---|---|
| Price | ¥533k/m², the **lowest of 15** Mihama 90 m²+ flats built 2005–15 (median ¥602k, range 533–757). The walk is better than 85% of the area's large flats (median 15 min) | Good value, or a reason the card doesn't show. Ask how long it has been listed and about past price changes |
| Repair fund | ¥15,100 = **¥165/m²**: below the median for this age in our watchlist data (¥196), and **far below the MLIT guideline** (¥235–430, average ¥335) | Normal locally, but the whole market is under-saving. At the guideline average it would be ~¥30,700 (+¥15,600/month). Ask for the 長期修繕計画, fund balance, and whether the 1st 大規模修繕 (due ~2022–25) is done and how it was paid |
| Management fee | ¥16,200 = ¥177/m², exactly the median for small (≤60-unit) buildings of this age. 委託(通勤), 50 units | Fine |
| Other monthly | internet ¥1,260 + CATV ¥420; parking ¥7,500–10,000 (Mihama median ¥7,350) | Parking slightly above the area |
| Ground | GSI landform: **reclaimed former sea** (盛土地・埋立地 on 旧水部), liquefaction tendency **high**. J-SHIS: 埋立地, amplification **1.80**, AVS30 201 m/s (soft) | The building is RC on piles (typical), but streets, pipes and gas can fail after a big quake. Ask about the foundation |
| Shaking | 30-yr probability of 震度6弱+ **73%**, 6強+ **23%**; 新耐震 (2010) | Building standard is fine; contents and lifts matter |
| Water | max-scenario flood **0.5–3 m** and storm surge **0.5–3 m** at the point; no tsunami zone | The 3rd-floor flat stays dry, but the entrance, parking and possibly the electrical room may not. Ask where the 電気室 and pumps are |
| Transaction | 仲介: agent fee ≈ ¥1.68M incl. tax; total buying costs ~6–9% ≈ ¥2.9–4.4M | Budget it |
| Tax credit | built 2010 ✓, 91.56 m² ✓; no energy certificate stated → "other used home" tier (¥20M cap, 10 years) unless a 省エネ基準適合 certificate can be obtained (13 years) | Ask the agent |
| Windows / energy | label "-", no double-glazing tag | Unknown: ask, and check on the visit |
| Builder | not stated | Ask |

None of this is visible on the card. Several items, the repair fund and the price, only make sense **because** of the comparison.

## 5. Proposed tool

**Input:**
- A SUUMO listing URL (used condo first, then house, then new condo).
- Later, a "🔍 Deep look" button on every listing in the Apartments tab and the map light list.

**Steps:**
1. **Fetch** 2–6 pages per listing: main, 物件概要, 周辺環境; for new projects also property and rooms.
2. **Parse** the fields, tags, free-text keywords (glazing, seismic, warranty waiver, repairs, gas, disclosures) and coordinates.
3. **Enrich:**
   - Hazards: the point versions of our area code (flood/surge/tsunami/landslide tiles, GSI landform, J-SHIS shaking + ground).
   - Commute: Yahoo from the listing's stations to your office.
   - Area data: crime, noise, paediatrics, childcare, growth.
   - With the API key: zoning around the plot, planned roads, 居住誘導区域, school districts, filled land, disaster history, nearest land-price point, nearby sale prices.
4. **Compare** against:
   - same-area peers (age band, size) from the daily lists
   - same building (other units, history)
   - the watchlist fee data
   - the MLIT guideline
   - houses: nearby sale prices, since our house data covers Mihama only
5. **Output** one page per listing with traffic-light sections A–M. Each finding shows its number, the comparison and a source link. The page ends with:
   - **the documents to request:** 重要事項調査報告書, 長期修繕計画, 総会議事録 ×2–3 years, 管理規約・使用細則, 修繕履歴, 耐震診断 (pre-1982), インスペクション報告, 登記簿, 確認済証/検査済証, 境界確認書 (houses)
   - **the questions to ask the agent**
   - **a visit checklist**

**Where it runs (proposed phases):**
1. **Local:** a `deeplook.py <url>` script that I run when you send a link. The page goes to the site under `deeplook/`.
2. **GitHub Action with a URL input.** You can start it from the GitHub app on your phone. It commits the page and sends a Telegram link. SUUMO already works from GitHub's servers for the daily scrape.
3. **Automatic deep look** for new watchlist listings that pass your filters (e.g. 90 m²+, under budget, top score).

**Limits:**
- SUUMO's coordinates are approximate, so point hazards should also be checked over a ~100 m radius (the listing code already samples a radius).
- Fill-in fields depend on the agent.
- The documents in the A list can only be judged once you have them. A later step could read the PDFs you receive and check them.

## 6. Decisions needed

1. **MLIT 不動産情報ライブラリ API key.**
   - Free. Apply with name, email and purpose at reinfolib.mlit.go.jp; issued within ~5 business days.
   - I can't create accounts. Once you have it, I'll store it as a GitHub secret and locally.
   - Without it, sections C, K and L lose zoning, planned roads, school districts, filled land and actual prices.
2. **Scope of version 1:** used condos only (the most data and the most common case), or condos and houses together.
3. **Output:** a separate page per listing (recommended: printable and shareable with your partner or a bank) or a panel inside the site.

## Sources

- SUUMO listing pages (sample of 56 pages, 2026-10-13); field dumps in `research_notes/Deep look/`
- MLIT [マンションの修繕積立金に関するガイドライン (2024 revision)](https://www.mlit.go.jp/jutakukentiku/house/content/001747009.pdf), figures as quoted by [Yokohama City](https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/jutaku/manportal/manage/rule/deposit.html) and [Hiroshima City](https://www.city.hiroshima.lg.jp/uploaded/attachment/223561.pdf); [MLIT press release](https://www.mlit.go.jp/report/press/house03_hh_000204.html)
- [不動産情報ライブラリ API manual](https://www.reinfolib.mlit.go.jp/help/apiManual/) (35 APIs; header `Ocp-Apim-Subscription-Key`)
- 2026 mortgage tax credit: [MLIT](https://www.mlit.go.jp/report/press/content/001447132.pdf), [Money Forward summary](https://biz.moneyforward.com/establish/basic/81693/) (check against the 国税庁 page before relying on it)
- [省エネ性能表示制度 (MLIT)](https://www.mlit.go.jp/shoene-label/index.html)
- J-SHIS APIs: probabilistic hazard `pshm/Y2024` and surface ground `sstrct/V4`; GSI ハザードマップポータル raster tiles; GSI 地形分類 vector tiles (as in `area_hazard.py`)
