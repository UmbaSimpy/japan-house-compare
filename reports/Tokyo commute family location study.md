# Bayside Chiba wins the family space race

> **Correction 2026-10-12 (buses).** This report says highway buses are "mostly unattainable" and lists 幕張 as having no Tokyo Station bus. That is wrong. Three Chiba commuter routes were missed:
> - **京成 新浦安 → 東京駅**: 10 morning arrivals by 9:30, ¥730.
> - **マイタウンライナー ベイエリア線** (平和交通 + あすか交通), serving 幕張ベイタウン, 検見川浜, 稲毛海岸 and 稲毛: 4 morning buses, 6 evening buses (3 of them 17:30–21:30).
> - **マイタウンライナー おゆみ野・ちはら台線**: 4 morning, 4 evening.
>
> So the two top-ranked bay areas, Urayasu and Mihama, do have a seated bus alternative to the Keiyo line. The map data has the corrected bus scores: Urayasu total 67.5, Mihama rank 5 → 4. The scores and figures in the body below are the original ones. Details are in `data/DATA_LOG.md` item 8 and in `research_notes/…/commuter_buses.md`.

**Urayasu (浦安市, Shin-Urayasu) is the best single answer for this family. It scores 69.4/100, five points clear of the field.** It is the only municipality that combines all three of the family's main needs. The commute is 20 minutes to Tokyo Station with no transfer, on the least-crowded trunk line in the study (JR Keiyo, 123%). Daycare for 0–2-year-olds has been free since April 2026 with no waitlist. And a quarter of all used-condo listings are 90 m² or larger. The catch is price: a modern (built 2000 or later) 90–110 m² unit asks about **¥80M**, and the city has no equivalent of Tokyo's ¥5,000/month 018 child payment. The next tier splits by priority. **Chiba-shi Mihama-ku (Makuhari Bay Town)** gives cheaper modern large units (about ¥68M) and a Costco 10–15 minutes away, but charges about ¥54k/month for daycare. **Ichikawa** is 19 minutes from Tokyo with free 0–2 daycare from September 2026, but has Chiba's worst after-school (学童) waitlist. **Funabashi** has the largest pool of modern ≥90 m² units under ¥80M in the whole region. The 23 wards win on childcare: fees are ¥0 everywhere, there is cash on top, and many wards have zero waitlists. But only the outer-east wards (Edogawa, Arakawa, Katsushika, Adachi) and Nerima have any 90 m² stock under ¥80M; the central wards ask ¥120M–¥420M. The ideal of a highway bus is mostly unattainable. Only Kisarazu runs frequent buses to Tokyo Station in both directions, and its market had zero ≥90 m² condo listings, so wanting a bus commute and wanting a large condo point to different places. These conclusions survive reweighting: Urayasu stays first in five of six alternative weightings tested.

## 1. A 100-point rubric weights space 30, commute and childcare 25 each

Every municipality gets six sub-scores, each on a 0–100 scale. The total is the weighted average, so it is also out of 100. The weights follow the brief. Space carries the most weight because the family named it the priority. Commute and childcare come next as daily necessities. Growth matters for resale and for the future amenity base. The highway bus and Costco count as bonuses, not requirements.

| Criterion | Weight | Formula and thresholds | Main inputs |
|---|---|---|---|
| Commute | 25 | E = station-to-station minutes to Tokyo Stn or Otemachi (whichever is better) + 5 per transfer. Score = 100 × (80 − E)/65, clamped (E ≤ 15 → 100; E ≥ 80 → 0). Adjust for the main line's FY2025 peak crowding: ≥158% −5, 150–157% −2, ≤125% +5. Adjust for the 1-month pass: >¥30k −5, >¥45k −10. | Yahoo!乗換案内 arrive-by-08:45 on Wed 2026-10-14; MLIT 混雑率 FY2025 |
| Bus bonus | 5 | 50 × min(AM arrivals ≤9:30, 9)/9 + 50 × min(PM departures 17:30–21:30, 9)/9. Multiply by 0.6 if the scheduled ride is more than 15 min slower than rail. | Operator timetables 2024–2026 |
| Childcare | 25 | Fee 35 × (1 − first-child 0–2 monthly fee / ¥65,000). Tokyo cash 10 (018サポート + 赤ちゃんファースト = 8, plus up to 2 for verified ward cash ≥¥100k). 2026 daycare waitlist 30: 0 → 30, 1–9 → 24, 10–29 → 18, 30–59 → 12, 60–99 → 6, ≥100 → 0. 学童 waitlist 15: 0 → 15, 1–49 → 10, 50–149 → 5, ≥150 → 0. Medical 5: to age 18 with ¥0 → 5, ¥200 → 4, ¥300 → 3.5, to 15/¥500 → 2.5, ¥600/day → 2. Lunch 5: elementary + junior high free → 5, partial → 3, 3rd child only → 2, paid → 1. | Tokyo/prefectural waitlist tables, municipal fee tables, CFA 学童 survey |
| Space | 30 | 0.4 × Price + 0.3 × Count + 0.3 × AffordableShare. Price = 100 × (ln ¥150M − ln P)/(ln ¥150M − ln ¥40M), clamped. P = geometric mean of the all-age 90–105 m² median and the built-≥2000 90–110 m² median. Count = 100 × min(1, ≥90 m² listings under ¥80M / 40). AffordableShare = 100 × min(1, those listings ÷ all used listings / 15%). | SUUMO 中古マンション crawl, 2026-10-12, de-duplicated |
| Growth | 10 | Population change 2020→25: −4% → 0, +8% → 35. IPSS 2050 vs 2020: −15% → 0, +15% → 30. Residential land 5-yr change: +5% → 0, +45% → 20. 0–14 share: 9% → 0, 15% → 10. Pipeline adjustment −3 to +5. Clamped 0–100. | 2025 census, IPSS 2023, 2026 公示地価, project news |
| Costco | 5 | Estimated drive minutes to the nearest Kanto warehouse: ≤15 → 100, ≥75 → 0, linear in between. | Store list + haversine × 1.35 road model |

**The ¥80M line is the writer's assumption, not a sourced rule.** It stands in for what a household earning about ¥10M can typically borrow. A family with a larger budget should lean on the price and share columns instead. The fee formula uses a dual-income ¥10M household (市町村民税所得割 about ¥285k). At that income the household sits just under the ¥301k bracket edge in most suburban fee tables ([Chiba-shi R8 fee table](https://www.city.chiba.jp/kodomomirai/yojikyoiku/unei/documents/r8_riyousyafutanngaku.pdf)).

**Missing data is never silently scored as zero.** Each substitution is recorded in the area's `dataFlags` field in `locations.json`.

| Gap | How it is handled |
|---|---|
| 0–2 fee not extracted (13 suburbs, e.g. Kashiwa, Inzai, Matsudo) | Median of the confirmed paying cities in the same prefecture: Chiba ¥54,900, Saitama ¥60,000, Ibaraki ¥50,500. `annualBenefitYen` stays null. |
| 2026 waitlist not published (Ibaraki) | 2025 value used |
| 学童 waitlist known only as "<50" | Placed in the 1–49 band |
| Medical copay not extracted (Saitama cities) | Mid value (3.5/5) |
| Junior-high lunch status unknown | Mid value (2/5) |
| Fewer than 3 large-unit listings in a price sample | That median is replaced by the 70–80 m² ¥/m² × 95 estimate |
| つくば号 trip counts unknown | Imputed 5 AM / 5 PM trips |
| Aoba's 東名江田 bus timetable not obtained | Scored 0, flagged as unverified |

Two zeros are evidence-based absences rather than gaps. The first is the bus score where operator and terminal route lists show no Tokyo Station route. The second is the space count for Kisarazu and Sodegaura, where the crawl found no ≥90 m² listings at all.

**The shortlist takes the top 28 by total among areas whose space sub-score is at least 10.** Nine central wards outscore part of that list but have essentially no 90–100 m² unit under ¥120M: Minato, Koto, Shinagawa, Taito, Chiyoda, Toshima, Bunkyo, Chuo and Shinjuku. They stay ranked in the data but do not reach the shortlist, because space is the stated priority.

## 2. What the data says about childcare, housing, rail and growth

### Free 0–2 daycare is worth about ¥1 million a year, and Tokyo no longer has a monopoly

Since September 2025, the base 認可 fee for every child aged 0–2 has been ¥0 in all 23 wards and the Tama cities, regardless of income or birth order. It is officially an interim measure that lasts "until the national government implements it" ([Tokyo 少子化対策2025](https://www.spt.metro.tokyo.lg.jp/kodomoseisaku/book/2025-02_tokyo_syoshika2025/pageindices/index30.html); [Koto](https://www.city.koto.lg.jp/280308/daiissimusyouka.html)). Tokyo also pays **¥5,000/month per child** under 018サポート and a **¥130,000 gift** for births from January 2026 to March 2027 ([Tokyo 福祉局](https://www.fukushi.metro.tokyo.lg.jp/documents/d/fukushi/2026-07-02-093829-831)). Most suburbs charge this family **¥54,000–61,000/month** for the first child: Chiba-shi ¥54,330 ([Chiba-shi R8](https://www.city.chiba.jp/kodomomirai/yojikyoiku/unei/documents/r8_riyousyafutanngaku.pdf)), Funabashi ¥54,900 ([Funabashi](https://www.city.funabashi.lg.jp/kodomo/hoiku/002/hoikuryouhyou_d/fil/hyoujunhoikuryou.pdf)), Saitama-shi ¥55,000 ([Saitama-shi](https://www.city.saitama.lg.jp/003/001/015/001/p100639_d/fil/tebiki.pdf)), Yokohama ¥60,000 ([Yokohama](https://www.city.yokohama.lg.jp/kosodate-kyoiku/hoiku-yoji/shisetsu/riyou/riyouryo/riyouryosantei/default20190319.files/0070_20260123.pdf)) and Kawasaki ¥60,500 ([Kawasaki](https://www.city.kawasaki.jp/450/cmsfiles/contents/0000030/30711/hoikuryoukingakuhyou.pdf)). Tsukuba is the cheapest paying city at ¥45,000 ([Tsukuba](https://www.city.tsukuba.lg.jp/material/files/group/65/R08hoikushogoannai.pdf)). In a year when both children are in 0–2 classes, the gap against Tokyo reaches about **¥1.0–1.2M**.

Two Chiba cities have closed this gap. **Urayasu made all 0–2 classes free from 2026-04-01**, with no conditions ([Urayasu](https://www.city.urayasu.lg.jp/kodomo/hoiku/hoikuen/1047820.html)). **Ichikawa made the first child free from September 2026** with no income limit ([Ichikawa](https://www.city.ichikawa.lg.jp/page/7252.html); [NHK](https://news.web.nhk/newsweb/na/nb-1000128949)). Both also give free school lunch through junior high. They still lack 018サポート, about ¥120k/year for two children. That arbitrage is the main reason both rank in the top three. The neighbouring prefectures' own programmes do not help a ¥10M household. Saitama's prefectural scheme covers only the third child onward ([Saitama Pref.](https://www.pref.saitama.lg.jp/b0616/hoiku-jinzai/tashisetai.html)).

Inside Tokyo, **getting a place has replaced price as the differentiator**. The Tokyo-wide waitlist rose from **339 to 1,113** between April 2025 and April 2026 ([Tokyo 表4 2026](https://www.metro.tokyo.lg.jp/documents/d/tosei/20260828_05_04)). The three worst municipalities in Japan were all in Tokyo: Setagaya 166, Adachi 106 and Kita 103 ([Kumanichi/Kyodo](https://kumanichi.com/articles/2029860)). Edogawa jumped from 0 to 75 and Machida to 90. After-school care is the second trap. In the 2026 preliminary count, Suginami has 372 children waiting and Katsushika 320 ([Tokyo 学童 R8](https://www.fukushi.metro.tokyo.lg.jp/documents/d/fukushi/080501sokuhou)). In the suburbs, Ichikawa (283), Koshigaya (208), Saitama-shi (197) and Funabashi (157) carry the largest 学童 queues ([CFA 2025](https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/69799c33-85cb-44f6-8c70-08ed3a292ab5/c253a682/20251222_policies_kosodateshien_houkago-jidou_80.pdf)).

A zero headline waitlist can hide demand. The national survey counts parents on parental leave, parents waiting only for a specific nursery, and parents who paused their job search separately. Those "hidden" queues were **2,472 in Yokohama, 1,139 in Saitama-shi, 632 in Funabashi (530 of them waiting only for a specific nursery) and 582 in Chiba-shi**, against 32 in Urayasu ([CFA R7 Excel](https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/b0a8057b-34bf-4c20-84fb-ae592708ca9b/1aa96453/20250828_policies_hoiku_torimatome_r7_04.xlsx)).

### Only 1,042 large listings across 77 areas ask under ¥80M

The SUUMO crawl of 2026-10-12 found **2,874 de-duplicated used-condo listings of 90 m² or more** across the 77 study areas. **Only 1,042 asked under ¥80M** ([SUUMO search](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)). Those affordable large units sit in a few places. The biggest pools are Funabashi (63), Tama-shi (51), Inzai (48), Yokohama-Aoba (42), Mihama, Inagi and Tsuzuki (41 each), Machida (35) and Kohoku (34). Counting only units built since 2000 changes the order: **Funabashi leads with 36, then Mihama 26 and Aoba 24.** Much of the cheap large stock in Tama-shi (3 of 51 modern), Kashiwa (1 of 32) and Shiroi (0 of 31) consists of 1970s–90s danchi-style blocks.

The large-unit stock is shrinking, and new condos are not replacing it. Units of 80–100 m² fell from 15.5% to 12.6% of Kanto used-condo contracts between FY2020 and FY2025, and units of 100 m² or more are only 3% ([REINS 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)). New condos in the 23 wards averaged just **66.67 m²** in early 2025 ([LIFULL](https://lifull.com/doc/2026/01/20e749ab9bdf406f2ae3f6c53171d5ec.pdf)). Total Kanto new supply in 2025 was **21,962 units, the lowest since 1973**. The 2026 forecast shifts supply outward, to 都下 (+45.5%) and Chiba (+13.7%) ([不動産経済研究所](https://www.fudousankeizai.co.jp/share/mansion/654/ss2025.pdf)).

Prices split into two speeds. Ward contract ¥/m² rose **60.6% in five years**, against roughly 31–36% in every suburban region. In FY2025 the suburbs were almost flat: Chiba +0.4%, Saitama and Tama +1.9% ([REINS FY2025](https://www.reins.or.jp/sf_202504-202603.pdf)).

Read ward asking prices with care. For 80–100 m² units in the 23 wards, REINS shows asking ¥/m² about **49% above contract ¥/m²**. Outside the wards the two are nearly equal ([REINS 表13](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf)). Ward medians in the tables are therefore upper bounds.

### Rail beats the bus everywhere except the Aqua-Line corridor

Under 35 minutes with no transfer, the fastest suburban stations are:
- 武蔵小杉: 18 min
- 市川: 19 min
- 新浦安 and 川崎: 20 min
- 浦和 and 船橋: 26 min
- 松戸: 27 min
- 津田沼 and 横浜: 30 min
- さいたま新都心: 31 min
- 海浜幕張: 34 min

All times are from the Yahoo!乗換案内 arrive-by-08:45 searches ([example query](https://transit.yahoo.co.jp/search/result?from=%E8%88%B9%E6%A9%8B&to=%E6%9D%B1%E4%BA%AC&y=2026&m=10&d=14&hh=08&m1=4&m2=5&type=4&ticket=ic)). Crowding separates stations with similar times. The 総武快速 and 東西線 corridors peak at **160%** and 埼京 at **167%**, while **京葉 runs at 123%** and 横須賀 at 138% ([MLIT FY2025](https://www.mlit.go.jp/report/press/content/002015142.pdf)). That is a concrete reason to prefer Shin-Urayasu or Kaihin-Makuhari over Ichikawa or Funabashi.

Commuter passes vary just as much. TX, Hokuso and Toyo Rapid cost two to three times JR for the same distance. A pass from Chiba New Town costs **¥44,600** and one from Tsukuba **¥50,530**, against ¥10,480 from Shin-Urayasu. JR passes themselves rose about **12%** in the 2026-03-14 fare revision ([Travel Watch](https://travel.watch.impress.co.jp/docs/news/1645631.html)). A seat can be bought on JR lines: Suica Green cars cost ¥750 for up to 50 km, about ¥15,000 a month ([Traffic News](https://trafficnews.jp/post/529815)).

The bus ideal largely fails. BT東京八重洲 lists no commuter routes from Saitama, Tama, Kanagawa or Ibaraki ([Wikipedia BT八重洲](https://ja.wikipedia.org/wiki/バスターミナル東京八重洲)). **Only Kisarazu and neighbouring Kimitsu have buses frequent enough to commute on in both directions.** From 木更津駅西口, 9 buses reach Yaesu by 9:29 and 9 return between 17:30 and 21:30. The fare is ¥1,500, or ¥54,000 for a monthly pass ([日東交通](https://www.nitto-kotsu.co.jp/at-%e6%9c%a8%e6%9b%b4%e6%b4%a5%e6%9d%b1%e4%ba%ac%e7%b7%9a%ef%bc%882026-1-01%ef%bd%9e%ef%bc%89/)). The 金田BT park-and-ride adds **26 departures between 05:00 and 07:59** ([Kisarazu PDF](https://www.city.kisarazu.lg.jp/material/files/group/11/20260516kaneda.pdf)).

Sodegaura runs 3 morning and 5 evening buses, which can lose **10–25 minutes** to Aqua-Line congestion ([小湊](https://www.kominato-bus.com/highway/high/sodegaura-tokyo.html)). A single accident closed the upbound Aqua-Line on 2026-10-01 ([じもはる](https://jimoharu.net/aqualine-jiko-kousokubus-konran-20261001/)). Elsewhere service is token: 1–2 buses from Sakura ([京成 ユーカリが丘](https://www.keiseibus.co.jp/express-bus/90404-2/)), Chiba-Wakaba ([京成 千城台](https://www.keiseibus.co.jp/express-bus/90402-2/)) and the ちばきたライナー ([京成](https://www.keiseibus.co.jp/express-bus/90420-2/)). The つくば号 takes 85–105 minutes, slower than TX ([Wikipedia つくば号](https://ja.wikipedia.org/wiki/つくば号)).

### Growth and Costco both lean to the eastern suburbs

Growth is concentrated in three places:
- Central and east Tokyo
- The TX/Hokuso corridor: Tsukuba +11.2%, Nagareyama +7.6% and Inzai +7.5% between 2020 and 2025 ([uub.jp census compilation](https://uub.jp/cdr/j/zogen.html); [統計局](https://www.stat.go.jp/data/kokusei/2025/kekka/pdf/summary.pdf))
- Station-redevelopment wards: Chiba-Chuo +7.2% and Mihama +4.9%

The old new towns are shrinking: Tama-shi −3.7%, Ichihara −3.6%, Sakura −3.0%, Machida −2.5% and Aoba −1.3%.

IPSS projects that by 2050 Nagareyama will be 20.9% larger than in 2020 and Inzai 16.8% larger. It projects Mihama and Hanamigawa 14.4% smaller and Sakura 19.6% smaller ([IPSS via uub.jp](https://uub.jp/cdr/j/f.html)). Families with children are leaving the 23 wards as a whole, mostly because of housing costs ([LIFULL HOME'S総研](https://biz.homes.jp/column/topics-00337)).

Few transport upgrades will open before 2032. Those that will are the TX 8-car trains (early 2030s; [Traffic News](https://trafficnews.jp/post/657379)) and the Haneda access line (FY2031; [Traffic News](https://trafficnews.jp/post/670785)). The Shin-Yokohama line is already open. Two flagship redevelopments have stalled: Tsudanuma South ([Impress](https://www.watch.impress.co.jp/docs/news/2094343.html)) and Nakano Sunplaza ([coki](https://coki.jp/article/news/49071)).

Costco geography is fixed for now. Kanto has **14 warehouses, none in the 23 wards, and none announced through 2027** ([hubmedia](https://hubmedia.co.jp/costco/costco-store/japan-all-costco-stores/); [kenbox tracker](https://kenbox.jp/costco-newopen/)). That rewards Makuhari, Chiba New Town, Shin-Misato, Kawasaki and Kisarazu, and leaves Saitama-shi and the western wards 50–85 minutes from the nearest store.

## 3. Twenty-eight municipalities pass the space gate; Urayasu leads by five points

The shortlist below shows each sub-score (0–100) with its weight in brackets. "# (overall)" is the rank among all 77 municipalities. Gaps in the numbering are high-scoring central wards that miss the space gate. The full 77-row ranking is in the appendix. Source: `data/locations.json` (this study).

| # (overall) | Municipality | Pref | Total | Commute (25) | Bus (5) | Childcare (25) | Space (30) | Growth (10) | Costco (5) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Urayasu 浦安市 | Chiba | **69.4** | 97.3 | 0.0 | 85 | 52.9 | 46.0 | 66.7 |
| 2 | Chiba Mihama 千葉市美浜区 | Chiba | **64.2** | 75.8 | 0.0 | 56.2 | 73.4 | 42.0 | 100.0 |
| 3 | Ichikawa 市川市 | Chiba | **62.7** | 88.8 | 0.0 | 73.5 | 48.3 | 44.8 | 62.5 |
| 4 | Kashiwa 柏市 | Chiba | **61.6** | 67.7 | 0.0 | 46.9 | 78.0 | 57.7 | 75.0 |
| 5 | Arakawa 荒川区 | Tokyo | **61.0** | 100.0 | 0.0 | 86 | 21.2 | 64.9 | 33.3 |
| 6 | Funabashi 船橋市 | Chiba | **60.9** | 78.1 | 0.0 | 28.9 | 81.4 | 49.1 | 95.8 |
| 7 | Katsushika 葛飾区 | Tokyo | **60.5** | 95.0 | 0.0 | 83 | 30.3 | 46.1 | 45.8 |
| 8 | Edogawa 江戸川区 | Tokyo | **60.0** | 87.3 | 0.0 | 76 | 45.1 | 39.6 | 33.3 |
| 9 | Inzai 印西市 | Chiba | **59.9** | 17.6 | 0.0 | 49.4 | 100.0 | 81.0 | 100.0 |
| 10 | Tama 多摩市 | Tokyo | **59.3** | 18.0 | 0.0 | 81 | 96.1 | 13.8 | 87.5 |
| 11 | Narashino 習志野市 | Chiba | **59.2** | 71.9 | 0.0 | 44.9 | 70.8 | 38.0 | 100.0 |
| 13 | Inagi 稲城市 | Tokyo | **58.2** | 16.9 | 0.0 | 75 | 89.2 | 55.3 | 58.3 |
| 15 | Kawasaki Kawasaki 川崎市川崎区 | Kanagawa | **57.9** | 87.3 | 0.0 | 50.9 | 48.6 | 37.5 | 100.0 |
| 17 | Matsudo 松戸市 | Chiba | **57.3** | 81.5 | 0.0 | 52.4 | 55.4 | 34.0 | 75.0 |
| 18 | Chiba Inage 千葉市稲毛区 | Chiba | **57.0** | 61.2 | 6.7 | 56.2 | 64.6 | 33.5 | 91.7 |
| 19 | Machida 町田市 | Tokyo | **56.4** | 31.8 | 0.0 | 68 | 84.1 | 20.3 | 83.3 |
| 20 | Chiba Chuo 千葉市中央区 | Chiba | **56.0** | 55.0 | 0.0 | 56.2 | 59.9 | 64.1 | 75.0 |
| 21 | Adachi 足立区 | Tokyo | **55.9** | 90.3 | 0.0 | 58 | 37.9 | 45.7 | 58.3 |
| 22 | Misato 三郷市 | Saitama | **55.9** | 50.3 | 0.0 | 48.2 | 77.9 | 29.5 | 100.0 |
| 25 | Nakano 中野区 | Tokyo | **55.1** | 87.3 | 0.0 | 98 | 12.2 | 50.8 | 0.0 |
| 27 | Toda 戸田市 | Saitama | **54.7** | 61.2 | 0.0 | 51.2 | 66.4 | 49.7 | 33.3 |
| 30 | Shiroi 白井市 | Chiba | **54.5** | 29.9 | 0.0 | 47.9 | 93.2 | 27.0 | 87.5 |
| 31 | Yokohama Kohoku 横浜市港北区 | Kanagawa | **54.2** | 56.9 | 0.0 | 53.7 | 58.3 | 52.8 | 75.0 |
| 32 | Nerima 練馬区 | Tokyo | **53.7** | 61.5 | 0.0 | 76 | 50.2 | 42.7 | 0.0 |
| 34 | Ota 大田区 | Tokyo | **52.7** | 81.2 | 0.0 | 70 | 17.6 | 46.7 | 100.0 |
| 35 | Mitaka 三鷹市 | Tokyo | **52.5** | 64.2 | 0.0 | 98 | 22.2 | 40.3 | 25.0 |
| 36 | Yokohama Aoba 横浜市青葉区 | Kanagawa | **52.4** | 47.7 | 0.0 | 53.7 | 71.5 | 26.4 | 58.3 |
| 37 | Chiba Hanamigawa 千葉市花見川区 | Chiba | **52.1** | 51.9 | 6.7 | 56.2 | 59.1 | 19.7 | 100.0 |

Ranked but excluded by the space gate: Minato #12 (58.9), Koto #14 (58.0), Shinagawa #16 (57.6), Taito #23, Chiyoda #24, Toshima #26, Bunkyo #28, Chuo #29 and Shinjuku #33. Notable low ranks are Tsukuba #42 (50.0), Nagareyama #56 (47.9; only 9 de-duplicated ≥90 m² listings), Kisarazu #76 and Sodegaura #77.

**The leaders hold up under sensitivity tests.** Five alternative weightings were re-run, plus a modern-stock variant described below:

| Variant | Result |
|---|---|
| Space counts only buildings from 2000 or later | Urayasu, Mihama and Funabashi rise to the top three. Kashiwa (78→42) and Tama-shi (96→44) fall out of the top ten because their cheap large stock is old. Edogawa's space score drops 45→22. |
| Childcare raised to 35 or commute to 35 | Urayasu stays first. Minato, Arakawa, Shinagawa and Koto climb to positions 2–6, which shows how much of the central wards' appeal is childcare plus proximity rather than space. |
| Space raised to 40, commute cut to 15 | Inzai (68.1), Tama-shi and Inagi lead, with Urayasu fourth. |
| Growth and Costco removed | Urayasu still leads, followed by Tama, Mihama and Kashiwa. |

**Urayasu is first in five of the six variants.** The exception is the space-heavy weighting, where it finishes fourth.

## 4. Profiles of the top contenders and best picks by persona

### Urayasu (浦安市): the only all-rounder

From 新浦安 it is **20 minutes to Tokyo Station with no transfer**, on the Keiyo line at **123%** peak crowding, with a ¥10,480 monthly pass. All 0–2 classes have been free since April 2026, and school lunch through junior high is free. The 2026 daycare waitlist is 0. Children's medical care is ¥0 to age 18 ([Chiba medical list](https://www.pref.chiba.lg.jp/jika/boshi/kodomo-iryo/documents/joseinaiyou.pdf)).

Housing is the tension. **25.7% of listings are ≥90 m², but the modern median is about ¥80M** (13 units built since 2000). Only 17 large units ask under ¥80M, and 9 of those are modern. The crawl's examples run from 1981–82 入船 estates at 97–99 m² for ¥45.8–62.8M up to パークシティ東京ベイ新浦安 at 130.93 m² for ¥132.8M ([SUUMO](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=011&ta=12&sc=12227&mb=90&mt=9999999&pc=100)).

Land rose 35.9% over five years but only **3.2% in 2026**, a sign the momentum is fading ([トチノカチ](https://totinokati.com/kakaku/13/kouji/)). Population is flat (+0.8%), IPSS projects −4.4% by 2050, and Makuhari Costco is 30–40 minutes away.

### Chiba-shi Mihama-ku (千葉市美浜区): most modern space for the money with a short commute

From 海浜幕張 it is **34 minutes with no transfer**, also on the 123% Keiyo line, for ¥18,450 a month. The ward offers **41 large units under ¥80M, 26 of them modern**, with a modern 90–110 m² median of **¥67.8M**. Examples include セントラルパーク・ウエスト at 90 m² for about ¥55M (1999), パティオスエリスト at 112 m² for ¥62.9M (2006), and the new 幕張ベイパーク at 92 m² for ¥104.8M.

Daycare costs **¥54,330/month** for the first child, and the second child pays half. The city waitlist has been zero for seven years, but 673 children were 入所待ち in April 2026 ([Chiba-shi press](https://www.city.chiba.jp/sogoseisaku/shichokoshitsu/hisho/hodo/documents/20260424-4.pdf)). Costco Makuhari is 10–15 minutes away. Population grew 4.9% on the back of Makuhari Bay Park, but IPSS still projects **−14.4% by 2050**.

### Ichikawa (市川市): fastest suburb with Tokyo-level fees

市川 is **19 minutes to Tokyo with no transfer**, with a ¥10,480 pass, but the 総武快速 runs at 160%. Daycare for the first child is free from September 2026 and lunch is free. However, the **学童 waitlist of 283 is the worst in Chiba** ([CFA](https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/69799c33-85cb-44f6-8c70-08ed3a292ab5/c253a682/20251222_policies_kosodateshien_houkago-jidou_80.pdf)), which matters from age 6.

Large units are scarce: only 6% of listings are ≥90 m². The modern median is ¥61.8M (n=9), and 17 units ask under ¥80M. Land rose 41.1% in five years, among the fastest in the suburbs.

### Kashiwa (柏市): scores well, but on old stock

From 柏 it is **36 minutes with no transfer** on the Joban Rapid (142%), and the ときわ limited express and Green cars offer seats. TX from 柏の葉キャンパス takes 52 minutes and the pass costs ¥31,660.

The space score of 78 is inflated. Kashiwa's ≥90 m² median is **¥15M**, driven by 1980s 北柏 estates, and only one of its 32 sub-¥80M large units is modern. The three modern 柏の葉 units ask a median ¥92.1M. The 0–2 fee was not extracted (the next bracket up is ¥61,300), so an imputed ¥54,900 is used, and the 学童 waitlist is 147. Land rose 32.9% in five years, and the TX 8-car upgrade is coming.

### Funabashi (船橋市): the deepest modern large-unit market

From 船橋 it is **26 minutes to Tokyo with no transfer**, with a ¥13,120 pass. Funabashi offers **63 large units under ¥80M, 36 of them modern**, the most in the region. The all-age median is ¥34.9M and the modern median ¥39.8M. Costco Makuhari is 15–20 minutes away, and the city had **+4,029 net in-migration** in 2025 ([HRI](https://www.yokohama-ri.co.jp/html/report/pdf/column260519_endo.pdf)).

Childcare is its weak score (29). Daycare costs ¥54,900 a month, the waitlist fell from 34 to 12, 530 families wait only for a specific nursery, and the 学童 queue is 157. That is the price of being Funabashi.

### Edogawa (江戸川区): the 23-ward ward with room

From 西葛西 it is **20 minutes to Otemachi with no transfer** on the Tozai line (160%). Edogawa has Tokyo's free fees and cash, an infant allowance of ¥13,000/month at age 0 ([hoken-minaoshi-lab](https://www.hoken-minaoshi-lab.jp/article/tokyo_child_support/)), and **zero 学童 waitlist**. Large-unit supply is real: 40 de-duplicated listings, 27 under ¥80M, and an all-age median of ¥69.9M. But only 2 of those 27 are modern, and the modern median is ¥90.9M. The 2026 daycare waitlist jumped from **0 to 75**.

### Arakawa (荒川区) and Katsushika (葛飾区): childcare and commute, little space

日暮里 and 新小岩 are both **13 minutes to Tokyo**, and both wards have Tokyo's free childcare. Arakawa's daycare waitlist is 14 with zero 学童 waiting. Katsushika has a zero daycare waitlist but **320** children waiting for 学童.

Both rank high mostly on commute and childcare. Arakawa has only 13 large listings (median about ¥82M). **Katsushika has just 3 large listings, all built before 2000.** Choose either only if 80–85 m² is acceptable.

### Inzai (印西市): maximum space per yen

Inzai scores a **perfect 100 on space**: 41% of listings are ≥90 m², 48 ask under ¥80M (18 modern), and the modern median is **¥44.3M**. Examples include ヴェレーナシティ千葉ニュータウン中央 at 95 m² for ¥56.8M (2022). Residential land costs ¥47,000/m².

It is a strong growth story. Population rose 7.5% between 2020 and 2025, IPSS projects +16.8% by 2050, and Inzai has the highest child share in the study (16.4%). School lunch has been free since 2024-09 ([Inzai](https://www.city.inzai.lg.jp/0000018326.html)). Costco Chiba New Town is 5–10 minutes away, and the city reports being Chiba's top-ranked "住みよさ" city ([千葉日報](https://www.chibanippo.co.jp/prtimes/1638491)).

The commute is the cost: **59 minutes to Otemachi with one transfer and a ¥44,600 pass**. On the positive side, the Hokuso line runs at only 90% crowding.

### Tama (多摩市) and Inagi (稲城市): Tokyo subsidies at suburban prices

Both cities sit in the Tama New Town area and get Tokyo's free fees and 018 cash. Large units are common. In Tama-shi, 21.5% of listings are ≥90 m² at a median of **¥27.8M**, but only 4 are modern. In Inagi, 37.9% are ≥90 m², with a modern median of ¥59.8M.

The downsides:
- **Commute:** 62–64 minutes with a transfer. The ¥500 Keio Liner seat from 多摩センター helps ([鉄道チャンネル](https://tetsudo-ch.com/13036234.html)).
- **学童:** waitlists above 100 in both cities.
- **Medical:** ¥200 per visit from school age.
- **Decline in Tama-shi:** population −3.7% between 2020 and 2025 in an ageing new town that Tokyo is regenerating ([東京都](https://www.toshiseibi.metro.tokyo.lg.jp/machizukuri/kozo_seibi/tamanew/saisei)). Inagi is still growing (+2.1%, IPSS +8.6%).

### Narashino (習志野市) and Kawasaki-ku (川崎市川崎区): fast, Costco-adjacent, mid-priced

From 津田沼 it is 30 minutes with no transfer, some Sobu Rapid trains start there, and Costco Makuhari is 10 minutes away. Narashino has 22 large units under ¥80M with a modern median of ¥46.8M. The Tsudanuma South redevelopment is paused.

From 川崎 it is **20 minutes**, Costco is about 10 minutes away, and there are 15 large units under ¥80M (10 modern). But Kawasaki charges **¥60,500/month** for daycare, and child medical care currently covers only to junior-high age, with ¥500 per visit from 4th grade ([Kawasaki committee](https://www.city.kawasaki.jp/980/cmsfiles/contents/0000175/175701/20251009-1%281%29.pdf)).

### Best picks by persona

| Persona | Best pick | Runner-up | Why | Main trade-off |
|---|---|---|---|---|
| Balanced family (default weights) | **Urayasu (Shin-Urayasu)** | Chiba Mihama | 20 min, 123% line; free 0–2 daycare; 26% of stock ≥90 m² | Modern 95 m² about ¥80M; no 018 cash |
| Bus commuter | **Kisarazu** (金田 / 駅西口) | Sodegaura | 9 AM + 9 PM buses from the station plus 26 early departures from 金田BT; ¥54,000/month pass | **Zero ≥90 m² condo listings**: a house or smaller condo only; Aqua-Line delays. Condo-insisting bus fans should take a Keiyo-line seat from 海浜幕張 or a Green car instead |
| Max space per yen | **Inzai (Chiba NT)** | Funabashi | Modern 90–110 m² median ¥44M; 41% of listings ≥90 m²; Costco 5–10 min | 59 min + ¥44,600 pass. Funabashi gives 36 modern large units under ¥80M at 26 min |
| Best childcare (any price) | **Chiyoda / Shinagawa / Shibuya / Nakano / Toshima** | Mitaka, Musashino | Fee ¥0, 018 cash, 2026 waitlist 0 and 学童 0–5 | 95 m² asks ¥98M (Nakano) to ¥420M (Chiyoda) |
| Best childcare with space | **Urayasu** | Mitaka, Nerima | Tokyo-level fees outside Tokyo; Nerima has 31 large units under ¥80M | Mitaka has only 4 de-duplicated large listings; Nerima is 40 min effective, with 学童 51 |
| Stay inside the 23 wards with room | **Edogawa** | Nerima, Adachi | 27 large units under ¥80M; 20 min to Otemachi; 学童 0 | Daycare waitlist 75 (Adachi 106); mostly pre-2000 stock |
| Costco regulars | **Chiba Mihama** | Narashino, Funabashi | 10–20 min to 幕張; good modern stock | ¥54–55k/month daycare |
| Growth / appreciation | **Inzai** | Tsukuba, Nagareyama | Population +7.5–11.2% and projected growth to 2050 | Nagareyama has only 9 large listings (median ¥75M); TX passes ¥28–51k |
| Kanagawa side | **Yokohama-Kohoku (Hiyoshi)** | Yokohama-Aoba | 34 large units under ¥80M; Shin-Yokohama line; Costco 25–35 min | ¥60,000/month daycare; Aoba is shrinking (−1.3%) |
| Price no object | **Koto (Monzen-nakacho/Toyosu)** | Minato | 7 min to Otemachi; childcare 93/100; 88 large listings | Modern 95 m² about ¥148M (Koto) / ¥435M (Minato) |

## 5. Caveats that could change the decision

**Prices are asking prices from a single day.** Ward asking prices for large units run about 49% above contract prices, and medians with fewer than five listings (Nagareyama, Moriya, Mitaka, Katsushika, Chofu) are fragile. The modern-stock sensitivity test shows that Kashiwa's and Tama-shi's space scores rest on 1970s–90s buildings.

**The childcare numbers apply to one household profile.** The fee formula assumes a ¥10M dual-income household. A single earner on the same income crosses the ¥301k bracket and pays about ¥3–5k/month more. Thirteen suburban fees are imputed.

**Tokyo's fee advantage may not last.** Tokyo describes 0–2 free daycare as lasting only until a national scheme exists, and it applies only until each child turns three. Over two closely spaced children, the cumulative fee gap against a ¥54k city is roughly **¥2M** (the writer's estimate). That is an order of magnitude smaller than the ¥20–25M price gap between a modern 95 m² unit in Edogawa and one in Mihama. **Waitlist access is the more durable differentiator.**

**Several figures are estimates rather than measurements:**
- Commute times are station-to-station. Add about 10 minutes at each end.
- MLIT crowding is each line's single worst section, not necessarily the one a given rider uses.
- Costco times are modelled (straight line × 1.35, 18–30 km/h), not routed.
- Bus stop-to-municipality mapping for the Keisei inland routes is inferred.

**Some things were not assessed at all:**
- Flood, liquefaction and other hazards. Bayside Urayasu and Mihama, and the riverside eastern wards, deserve a hazard-map check before buying.
- Municipality-level new-condo supply. It sits in paid databooks, so the growth score proxies development with population, IPSS and land prices.
- Several municipalities with rail data but no condo or childcare data: Nishi-Tokyo, Komae, Wako, Tokorozawa, Kawasaki Tama/Asao, Totsuka, Tsurumi, Abiko, Toride, Hachioji (Minami-Osawa) and Kimitsu. They are left out of the ranking and the JSON rather than scored on partial data.

## Conclusion

The search has shifted. In 2023 the Tokyo boundary was the obvious childcare line. In 2026, Urayasu and Ichikawa sell Tokyo-level daycare at Chiba prices, so **the decisive variables are now large-unit supply and daycare access, not fees**. The best family locations are where 1980s–2000s planners built big flats next to a fast, uncrowded line. That describes Shin-Urayasu and Makuhari on the Keiyo line, and Funabashi's deep resale market. It does not describe the central wards, where new supply averages 67 m², or the bus-served Aqua-Line towns, which have no condo stock to speak of.

For the interactive map, the most useful layers are the `space` and `childcare` sub-scores and the `count90under80MBuilt2000` field. The three shift independently, and Kashiwa and Tama-shi show how a single blended score can hide old stock. Before buying, the first checks are a nursery-specific 入園 outlook and a hazard map for the chosen street.

## Appendix: full data tables and sources

### All 77 municipalities ranked

Abbreviations: Com = commute, Child = childcare, Grow = growth, Cost = Costco, Short = shortlisted. Sub-scores are 0–100. Source: `data/locations.json` (this study).

| # | Municipality | Total | Com | Bus | Child | Space | Grow | Cost | Short |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Urayasu 浦安市 | 69.4 | 97 | 0 | 85 | 53 | 46 | 67 | ✓ |
| 2 | Chiba Mihama 千葉市美浜区 | 64.2 | 76 | 0 | 56 | 73 | 42 | 100 | ✓ |
| 3 | Ichikawa 市川市 | 62.7 | 89 | 0 | 74 | 48 | 45 | 62 | ✓ |
| 4 | Kashiwa 柏市 | 61.6 | 68 | 0 | 47 | 78 | 58 | 75 | ✓ |
| 5 | Arakawa 荒川区 | 61.0 | 100 | 0 | 86 | 21 | 65 | 33 | ✓ |
| 6 | Funabashi 船橋市 | 60.9 | 78 | 0 | 29 | 81 | 49 | 96 | ✓ |
| 7 | Katsushika 葛飾区 | 60.5 | 95 | 0 | 83 | 30 | 46 | 46 | ✓ |
| 8 | Edogawa 江戸川区 | 60.0 | 87 | 0 | 76 | 45 | 40 | 33 | ✓ |
| 9 | Inzai 印西市 | 59.9 | 18 | 0 | 49 | 100 | 81 | 100 | ✓ |
| 10 | Tama 多摩市 | 59.3 | 18 | 0 | 81 | 96 | 14 | 88 | ✓ |
| 11 | Narashino 習志野市 | 59.2 | 72 | 0 | 45 | 71 | 38 | 100 | ✓ |
| 12 | Minato 港区 | 58.9 | 100 | 0 | 95 | 0 | 85 | 33 |  |
| 13 | Inagi 稲城市 | 58.2 | 17 | 0 | 75 | 89 | 55 | 58 | ✓ |
| 14 | Koto 江東区 | 58.0 | 95 | 0 | 93 | 8 | 81 | 12 |  |
| 15 | Kawasaki Kawasaki 川崎市川崎区 | 57.9 | 87 | 0 | 51 | 49 | 38 | 100 | ✓ |
| 16 | Shinagawa 品川区 | 57.6 | 92 | 0 | 98 | 1 | 66 | 67 |  |
| 17 | Matsudo 松戸市 | 57.3 | 82 | 0 | 52 | 55 | 34 | 75 | ✓ |
| 18 | Chiba Inage 千葉市稲毛区 | 57.0 | 61 | 7 | 56 | 65 | 34 | 92 | ✓ |
| 19 | Machida 町田市 | 56.4 | 32 | 0 | 68 | 84 | 20 | 83 | ✓ |
| 20 | Chiba Chuo 千葉市中央区 | 56.0 | 55 | 0 | 56 | 60 | 64 | 75 | ✓ |
| 21 | Adachi 足立区 | 55.9 | 90 | 0 | 58 | 38 | 46 | 58 | ✓ |
| 22 | Misato 三郷市 | 55.9 | 50 | 0 | 48 | 78 | 30 | 100 | ✓ |
| 23 | Taito 台東区 | 55.5 | 100 | 0 | 87 | 0 | 80 | 17 |  |
| 24 | Chiyoda 千代田区 | 55.1 | 95 | 0 | 99 | 0 | 60 | 12 |  |
| 25 | Nakano 中野区 | 55.1 | 87 | 0 | 98 | 12 | 51 | 0 | ✓ |
| 26 | Toshima 豊島区 | 55.0 | 96 | 0 | 98 | 1 | 59 | 4 |  |
| 27 | Toda 戸田市 | 54.7 | 61 | 0 | 51 | 66 | 50 | 33 | ✓ |
| 28 | Bunkyo 文京区 | 54.6 | 98 | 0 | 87 | 2 | 76 | 4 |  |
| 29 | Chuo 中央区 | 54.5 | 93 | 0 | 82 | 0 | 94 | 25 |  |
| 30 | Shiroi 白井市 | 54.5 | 30 | 0 | 48 | 93 | 27 | 88 | ✓ |
| 31 | Yokohama Kohoku 横浜市港北区 | 54.2 | 57 | 0 | 54 | 58 | 53 | 75 | ✓ |
| 32 | Nerima 練馬区 | 53.7 | 62 | 0 | 76 | 50 | 43 | 0 | ✓ |
| 33 | Shinjuku 新宿区 | 53.6 | 95 | 0 | 93 | 1 | 57 | 12 |  |
| 34 | Ota 大田区 | 52.7 | 81 | 0 | 70 | 18 | 47 | 100 | ✓ |
| 35 | Mitaka 三鷹市 | 52.5 | 64 | 0 | 98 | 22 | 40 | 25 | ✓ |
| 36 | Yokohama Aoba 横浜市青葉区 | 52.4 | 48 | 0 | 54 | 72 | 26 | 58 | ✓ |
| 37 | Chiba Hanamigawa 千葉市花見川区 | 52.1 | 52 | 7 | 56 | 59 | 20 | 100 | ✓ |
| 38 | Sumida 墨田区 | 51.7 | 95 | 0 | 81 | 0 | 68 | 17 |  |
| 39 | Suginami 杉並区 | 51.6 | 76 | 0 | 83 | 23 | 48 | 0 |  |
| 40 | Kawasaki Saiwai 川崎市幸区 | 50.4 | 91 | 0 | 51 | 14 | 57 | 100 |  |
| 41 | Shibuya 渋谷区 | 50.0 | 75 | 0 | 100 | 0 | 50 | 25 |  |
| 42 | Tsukuba つくば市 | 50.0 | 0 | 33 | 54 | 71 | 85 | 100 |  |
| 43 | Sakura 佐倉市 | 49.7 | 24 | 13 | 51 | 88 | 8 | 58 |  |
| 44 | Tachikawa 立川市 | 49.6 | 30 | 0 | 70 | 55 | 46 | 67 |  |
| 45 | Yokohama Tsuzuki 横浜市都筑区 | 49.6 | 18 | 0 | 54 | 82 | 45 | 46 |  |
| 46 | Kita 北区 | 49.3 | 97 | 0 | 68 | 3 | 58 | 25 |  |
| 47 | Moriya 守谷市 | 49.3 | 22 | 0 | 51 | 70 | 79 | 46 |  |
| 48 | Yashio 八潮市 | 49.1 | 56 | 0 | 30 | 59 | 49 | 96 |  |
| 49 | Musashino 武蔵野市 | 48.9 | 67 | 0 | 98 | 8 | 45 | 17 |  |
| 50 | Koganei 小金井市 | 48.6 | 50 | 0 | 80 | 30 | 45 | 50 |  |
| 51 | Setagaya 世田谷区 | 48.5 | 86 | 0 | 68 | 12 | 47 | 33 |  |
| 52 | Yachiyo 八千代市 | 48.5 | 33 | 0 | 40 | 75 | 40 | 75 |  |
| 53 | Chiba Wakaba 千葉市若葉区 | 48.4 | 43 | 7 | 56 | 61 | 20 | 62 |  |
| 54 | Meguro 目黒区 | 48.3 | 70 | 0 | 93 | 0 | 52 | 46 |  |
| 55 | Itabashi 板橋区 | 48.3 | 62 | 0 | 80 | 25 | 49 | 12 |  |
| 56 | Nagareyama 流山市 | 47.9 | 38 | 0 | 49 | 39 | 97 | 96 |  |
| 57 | Kawasaki Nakahara 川崎市中原区 | 47.8 | 95 | 0 | 51 | 6 | 56 | 75 |  |
| 58 | Kawaguchi 川口市 | 47.6 | 64 | 0 | 46 | 44 | 41 | 50 |  |
| 59 | Kawasaki Miyamae 川崎市宮前区 | 47.0 | 46 | 0 | 51 | 53 | 45 | 46 |  |
| 60 | Tsukubamirai つくばみらい市 | 46.8 | 14 | 0 | 49 | 66 | 85 | 54 |  |
| 61 | Koshigaya 越谷市 | 46.8 | 45 | 0 | 31 | 67 | 34 | 88 |  |
| 62 | Saitama Chuo さいたま市中央区 | 46.3 | 75 | 0 | 40 | 43 | 42 | 8 |  |
| 63 | Kawasaki Takatsu 川崎市高津区 | 46.3 | 60 | 0 | 51 | 38 | 46 | 54 |  |
| 64 | Soka 草加市 | 45.7 | 54 | 0 | 41 | 48 | 34 | 88 |  |
| 65 | Saitama Midori さいたま市緑区 | 45.0 | 38 | 0 | 40 | 57 | 62 | 46 |  |
| 66 | Saitama Urawa さいたま市浦和区 | 44.9 | 83 | 0 | 40 | 24 | 58 | 25 |  |
| 67 | Saitama Minami さいたま市南区 | 44.6 | 52 | 0 | 40 | 53 | 49 | 17 |  |
| 68 | Yokohama Kanagawa 横浜市神奈川区 | 44.3 | 52 | 0 | 54 | 34 | 45 | 62 |  |
| 69 | Kamagaya 鎌ケ谷市 | 44.1 | 36 | 0 | 51 | 56 | 28 | 58 |  |
| 70 | Chiba Midori 千葉市緑区 | 43.1 | 29 | 0 | 56 | 54 | 37 | 38 |  |
| 71 | Fuchu 府中市 | 41.5 | 20 | 0 | 70 | 40 | 40 | 62 |  |
| 72 | Yokohama Nishi 横浜市西区 | 40.7 | 72 | 0 | 54 | 1 | 62 | 54 |  |
| 73 | Ichihara 市原市 | 40.1 | 26 | 17 | 51 | 59 | 9 | 29 |  |
| 74 | Chofu 調布市 | 40.0 | 34 | 0 | 70 | 24 | 49 | 38 |  |
| 75 | Saitama Omiya さいたま市大宮区 | 39.8 | 71 | 0 | 40 | 15 | 72 | 8 |  |
| 76 | Kisarazu 木更津市 | 33.6 | 0 | 100 | 39 | 34 | 38 | 96 |  |
| 77 | Sodegaura 袖ケ浦市 | 32.0 | 0 | 44 | 51 | 25 | 45 | 100 |  |

### Commute and bus

Rail figures come from Yahoo!乗換案内, arrive by 08:45 on 2026-10-14, IC fares, with paid expresses excluded ([example](https://transit.yahoo.co.jp/search/result?from=%E8%88%B9%E6%A9%8B&to=%E6%9D%B1%E4%BA%AC&y=2026&m=10&d=14&hh=08&m1=4&m2=5&type=4&ticket=ic)). Crowding is the MLIT FY2025 peak-hour rate on the main line's worst section ([MLIT 資料3](https://www.mlit.go.jp/report/press/content/002015142.pdf)). "Eff. min" adds 5 minutes per transfer. Bus data comes from operator pages: [日東交通 木更津線](https://www.nitto-kotsu.co.jp/at-%e6%9c%a8%e6%9b%b4%e6%b4%a5%e6%9d%b1%e4%ba%ac%e7%b7%9a%ef%bc%882026-1-01%ef%bd%9e%ef%bc%89/), [小湊 袖ケ浦線](https://www.kominato-bus.com/highway/high/sodegaura-tokyo.html), [小湊 勝浦線](https://www.kominato-bus.com/highway/high/katsuura-tokyo.html), [京成 ユーカリが丘](https://www.keiseibus.co.jp/express-bus/90404-2/), [京成 千城台](https://www.keiseibus.co.jp/express-bus/90402-2/), [京成 ちばきたライナー](https://www.keiseibus.co.jp/express-bus/90420-2/), [つくば号](https://ja.wikipedia.org/wiki/つくば号) and [東名ハイウェイバス](https://trafficnews.jp/post/80561/2).

| Municipality | Station → dest. | Min / xfer | Eff. min | 1-mo pass ¥ | Line peak crowding FY2025 | Bus (AM/PM, ride, fare) |
|---|---|---|---|---|---|---|
| Urayasu 浦安市 | 新浦安 → Tokyo | 20 / 0 | 20 | 10,480 | JR京葉 123% | – |
| Chiba Mihama 千葉市美浜区 | 海浜幕張 → Tokyo | 34 / 0 | 34 | 18,450 | JR京葉 123% | – |
| Ichikawa 市川市 | 市川 → Tokyo | 19 / 0 | 19 | 10,480 | JR総武快速 160% | – |
| Kashiwa 柏市 | 柏 → Tokyo | 36 / 0 | 36 | 18,720 | JR常磐快速 142% | – |
| Arakawa 荒川区 | 日暮里 → Tokyo | 13 / 0 | 13 | 5,890 | not measured | – |
| Funabashi 船橋市 | 船橋 → Tokyo | 26 / 0 | 26 | 13,120 | JR総武快速 160% | – |
| Katsushika 葛飾区 | 新小岩 → Tokyo | 13 / 0 | 13 | 6,240 | JR総武快速 160% | – |
| Edogawa 江戸川区 | 西葛西 → Otemachi | 20 / 0 | 20 | 7,990 | Metro東西 160% | – |
| Inzai 印西市 | 千葉ニュータウン中央 → Otemachi | 59 / 1 | 64 | 44,600 | 京成押上 157% (北総 90%) | – |
| Tama 多摩市 | 多摩センター → Otemachi | 62 / 1 | 67 | 21,270 | 小田急本線 150% (多摩線 77%) | – |
| Narashino 習志野市 | 津田沼 → Tokyo | 30 / 0 | 30 | 15,600 | JR総武快速 160% | – |
| Minato 港区 | 田町 → Tokyo | 9 / 0 | 9 | 5,890 | JR山手 135–136% | – |
| Inagi 稲城市 | 稲城 → Tokyo | 64 / 1 | 69 | 19,600 | 京王 145% (相模原線 101%) | – |
| Koto 江東区 | 門前仲町 → Otemachi | 7 / 0 | 7 | 7,140 | Metro東西 160% | – |
| Kawasaki Kawasaki 川崎市川崎区 | 川崎 → Tokyo | 20 / 0 | 20 | 10,480 | JR東海道 159% | – |
| Shinagawa 品川区 | 大井町 → Tokyo | 17 / 0 | 17 | 6,240 | JR京浜東北 159% | – |
| Matsudo 松戸市 | 松戸 → Tokyo | 27 / 0 | 27 | 13,120 | JR常磐快速 142% | – |
| Chiba Inage 千葉市稲毛区 | 稲毛 → Tokyo | 37 / 0 | 37 | 20,450 | JR総武快速 160% | 1/1, ~60–67 min, ¥1100 |
| Machida 町田市 | 町田 → Otemachi | 53 / 1 | 58 | 21,270 | 小田急 150% | – |
| Chiba Chuo 千葉市中央区 | 千葉 → Tokyo | 41 / 0 | 41 | 21,580 | JR総武快速 160% | – |
| Adachi 足立区 | 北千住 → Otemachi | 20 / 0 | 20 | 8,170 | Metro千代田 150% | – |
| Misato 三郷市 | 三郷中央 → Tokyo | 41 / 1 | 46 | 26,850 | TX 151% | – |
| Taito 台東区 | 上野 → Tokyo | 5 / 0 | 5 | 5,890 | not measured | – |
| Chiyoda 千代田区 | 市ケ谷 → Otemachi | 10 / 1 | 15 | 11,750 | JR中央快速 158% | – |
| Nakano 中野区 | 中野 → Tokyo | 20 / 0 | 20 | 7,840 | JR中央快速 158% | – |
| Toshima 豊島区 | 池袋 → Otemachi | 16 / 0 | 16 | 7,990 | Metro丸ノ内 154% | – |
| Toda 戸田市 | 戸田公園 → Tokyo | 32 / 1 | 37 | 10,480 | JR埼京 167% | – |
| Bunkyo 文京区 | 茗荷谷 → Otemachi | 11 / 0 | 11 | 7,490 | Metro丸ノ内 154% | – |
| Chuo 中央区 | 月島 → Otemachi | 13 / 1 | 18 | 11,880 | Metro有楽町 153% | – |
| Shiroi 白井市 | 西白井 → Otemachi | 51 / 1 | 56 | 37,820 | 京成押上 157% (北総 90%) | – |
| Yokohama Kohoku 横浜市港北区 | 日吉 → Tokyo | 38 / 1 | 43 | 15,470 | 東急目黒 133% | – |
| Nerima 練馬区 | 練馬 → Otemachi | 35 / 1 | 40 | 15,050 | 西武池袋 130% | – |
| Shinjuku 新宿区 | 四ツ谷 → Tokyo | 9 / 0 | 9 | 6,240 | JR中央快速 158% | – |
| Ota 大田区 | 蒲田 → Tokyo | 24 / 0 | 24 | 7,840 | JR京浜東北 159% | – |
| Mitaka 三鷹市 | 三鷹 → Tokyo | 35 / 0 | 35 | 13,120 | JR中央快速 158% | – |
| Yokohama Aoba 横浜市青葉区 | たまプラーザ → Otemachi | 49 / 0 | 49 | 18,730 | 東急田園都市 138% | 東名江田 stop, timetable not obtained |
| Chiba Hanamigawa 千葉市花見川区 | 幕張本郷 → Tokyo | 38 / 1 | 43 | 15,600 | JR総武快速 160% | 1/1, 67 min, ¥1100 |
| Sumida 墨田区 | 錦糸町 → Tokyo | 8 / 0 | 8 | 5,890 | JR総武快速 160% | – |
| Suginami 杉並区 | 荻窪 → Tokyo | 27 / 0 | 27 | 10,480 | JR中央快速 158% | – |
| Kawasaki Saiwai 川崎市幸区 | 新川崎 → Tokyo | 21 / 0 | 21 | 10,480 | JR横須賀 138% | – |
| Shibuya 渋谷区 | 恵比寿 → Tokyo | 23 / 1 | 28 | 7,990 | Metro日比谷 163% | – |
| Tsukuba つくば市 | 研究学園 → Tokyo | 71 / 1 | 76 | 50,530 | TX 151% | ?/?, 85–105 min, ¥1260 |
| Sakura 佐倉市 | 佐倉 → Tokyo | 61 / 0 | 61 | 28,440 | JR総武快速 160% | 2/2, 77–107 min, ¥1400 |
| Tachikawa 立川市 | 立川 → Tokyo | 57 / 0 | 57 | 21,290 | JR中央快速 158% | – |
| Yokohama Tsuzuki 横浜市都筑区 | センター南 → Tokyo | 58 / 2 | 68 | 26,030 | 横浜市グリーンライン 134% | – |
| Kita 北区 | 赤羽 → Tokyo | 17 / 0 | 17 | 7,840 | JR高崎 131% (京浜東北 158%, 埼京 167%) | – |
| Moriya 守谷市 | 守谷 → Tokyo | 56 / 1 | 61 | 39,230 | TX 151% | – |
| Yashio 八潮市 | 八潮 → Tokyo | 37 / 1 | 42 | 24,570 | TX 151% | – |
| Musashino 武蔵野市 | 吉祥寺 → Tokyo | 33 / 0 | 33 | 13,120 | JR中央快速 158% | – |
| Koganei 小金井市 | 武蔵小金井 → Tokyo | 44 / 0 | 44 | 15,600 | JR中央快速 158% | – |
| Setagaya 世田谷区 | 三軒茶屋 → Otemachi | 24 / 0 | 24 | 14,770 | 東急田園都市 138% | – |
| Yachiyo 八千代市 | 八千代緑が丘 → Otemachi | 52 / 0 | 52 | 30,810 | Metro東西 160% (東葉 105%) | – |
| Chiba Wakaba 千葉市若葉区 | 都賀 → Tokyo | 49 / 0 | 49 | 23,750 | JR総武快速 160% | 1/1, 77 min, ¥1200 |
| Meguro 目黒区 | 中目黒 → Tokyo | 26 / 1 | 31 | 8,170 | Metro日比谷 163% (north section) | – |
| Itabashi 板橋区 | 成増 → Otemachi | 35 / 1 | 40 | 17,840 | 東武東上 131% | – |
| Nagareyama 流山市 | 流山おおたかの森 → Tokyo | 49 / 1 | 54 | 28,180 | TX 151% | – |
| Kawasaki Nakahara 川崎市中原区 | 武蔵小杉 → Tokyo | 18 / 0 | 18 | 10,480 | JR横須賀 138% | – |
| Kawaguchi 川口市 | 川口 → Tokyo | 30 / 1 | 35 | 10,480 | JR京浜東北 158% | – |
| Kawasaki Miyamae 川崎市宮前区 | 宮前平 → Otemachi | 50 / 0 | 50 | 17,420 | 東急田園都市 138% | – |
| Tsukubamirai つくばみらい市 | みらい平 → Tokyo | 61 / 1 | 66 | 43,000 | TX 151% | – |
| Koshigaya 越谷市 | 新越谷 → Otemachi | 46 / 1 | 51 | 19,900 | 東武スカイツリーライン 142% | – |
| Saitama Chuo さいたま市中央区 | さいたま新都心 → Tokyo | 31 / 0 | 31 | 15,600 | JR高崎 131% | – |
| Kawasaki Takatsu 川崎市高津区 | 溝の口 → Otemachi | 41 / 0 | 41 | 17,420 | 東急田園都市 138% | – |
| Soka 草加市 | 草加 → Otemachi | 40 / 1 | 45 | 18,020 | 東武スカイツリーライン 142% | – |
| Saitama Midori さいたま市緑区 | 東浦和 → Tokyo | 49 / 1 | 54 | 15,600 | JR武蔵野 156% | – |
| Saitama Urawa さいたま市浦和区 | 浦和 → Tokyo | 26 / 0 | 26 | 13,120 | JR高崎 131% (京浜東北 158%) | – |
| Saitama Minami さいたま市南区 | 武蔵浦和 → Tokyo | 38 / 1 | 43 | 13,120 | JR埼京 167% | – |
| Yokohama Kanagawa 横浜市神奈川区 | 東神奈川 → Tokyo | 38 / 1 | 43 | 15,600 | JR京浜東北/東海道 159% | – |
| Kamagaya 鎌ケ谷市 | 新鎌ヶ谷 → Otemachi | 47 / 1 | 52 | 35,030 | 京成押上 157% (北総 90%) | – |
| Chiba Midori 千葉市緑区 | 鎌取 → Tokyo | 53 / 1 | 58 | 24,880 | JR総武快速 160% | – |
| Fuchu 府中市 | 府中 → Tokyo | 62 / 1 | 67 | 19,600 | 京王 145% | – |
| Yokohama Nishi 横浜市西区 | 横浜 → Tokyo | 30 / 0 | 30 | 15,600 | JR東海道 159% | – |
| Ichihara 市原市 | 五井 → Tokyo | 60 / 0 | 60 | 26,960 | JR総武快速 160% | 1/2, 75 min, ¥1700 |
| Chofu 調布市 | 調布 → Tokyo | 53 / 1 | 58 | 18,060 | 京王 145% | – |
| Saitama Omiya さいたま市大宮区 | 大宮 → Tokyo | 34 / 0 | 34 | 17,970 | JR高崎 131% | – |
| Kisarazu 木更津市 | 木更津 → Tokyo | 80 / 0 | 80 | 37,460 | JR総武快速 160% | 9/9, 64–74 (+Aqua-Line delays) min, ¥1500 |
| Sodegaura 袖ケ浦市 | 袖ケ浦 → Tokyo | 74 / 0 | 74 | 34,170 | JR総武快速 160% | 3/5, 50–60 (+10–25 Aqua-Line delay) min, ¥1500 |

### Childcare

Sources by column:
- **Tokyo waitlists:** [Tokyo 表4 2026](https://www.metro.tokyo.lg.jp/documents/d/tosei/20260828_05_04) and [2025](https://www.metro.tokyo.lg.jp/documents/d/tosei/20250829_17_03a). 学童 figures are the 2026-05 preliminary count ([Tokyo 学童 R8](https://www.fukushi.metro.tokyo.lg.jp/documents/d/fukushi/080501sokuhou)). Tokyo medical copays come from [goo住宅](https://house.goo.ne.jp/chiiki/kurashi/tsuuin/tokyo.html) plus municipal pages.
- **Suburban waitlists:** [Chiba R8](https://www.pref.chiba.lg.jp/jika/hoikusho/jouhou/documents/r080401itiran.pdf), [Saitama R8](https://www.pref.saitama.lg.jp/documents/286861/shityousonnbetu20260827kai.pdf) and [Kanagawa R8](https://www.pref.kanagawa.jp/documents/136348/taikijidoubessi.pdf). Ibaraki uses the 2025 figure from [CFA R7](https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/b0a8057b-34bf-4c20-84fb-ae592708ca9b/1aa96453/20250828_policies_hoiku_torimatome_r7_04.xlsx).
- **Suburban 学童:** [CFA 2025-05-01](https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/69799c33-85cb-44f6-8c70-08ed3a292ab5/c253a682/20251222_policies_kosodateshien_houkago-jidou_80.pdf).
- **Fees:** [Chiba-shi](https://www.city.chiba.jp/kodomomirai/yojikyoiku/unei/documents/r8_riyousyafutanngaku.pdf), [Funabashi](https://www.city.funabashi.lg.jp/kodomo/hoiku/002/hoikuryouhyou_d/fil/hyoujunhoikuryou.pdf), [Nagareyama](https://www.city.nagareyama.chiba.jp/_res/projects/default_project/_page_/001/001/167/kizyunngaku.pdf), [Tsukuba](https://www.city.tsukuba.lg.jp/material/files/group/65/R08hoikushogoannai.pdf), [Tsukubamirai](https://www.city.tsukubamirai.lg.jp/data/doc/1681286151_doc_31_0.pdf), [Saitama-shi](https://www.city.saitama.lg.jp/003/001/015/001/p100639_d/fil/tebiki.pdf), [Kawaguchi](https://www.city.kawaguchi.lg.jp/soshiki/01080/050/4/35870.html), [Soka](https://www.city.soka.saitama.jp/cont/s1603/020/010/010/02.html), [Yokohama](https://www.city.yokohama.lg.jp/kosodate-kyoiku/hoiku-yoji/shisetsu/riyou/riyouryo/riyouryosantei/default20190319.files/0070_20260123.pdf) and [Kawasaki](https://www.city.kawasaki.jp/450/cmsfiles/contents/0000030/30711/hoikuryoukingakuhyou.pdf).
- **Chiba medical:** [Chiba Pref.](https://www.pref.chiba.lg.jp/jika/boshi/kodomo-iryo/documents/joseinaiyou.pdf).

"Annual net ¥" means Tokyo-only cash (018 × 2 = ¥120,000) minus 12 months of first-child plus second-child 0–2 fees, in a year when both children are in 0–2 classes. Imputed fees are shown but not used for this column.

| Municipality | 0–2 fee ¥/mo (1st child) | 待機 2025→2026 | 学童 待機 | Medical (age, copay/visit) | School lunch | Annual net ¥ (2 kids 0–2) |
|---|---|---|---|---|---|---|
| Urayasu 浦安市 | 0 | 0→0 | <50 | to 18, ¥0 | Elementary + junior high free | +0 |
| Chiba Mihama 千葉市美浜区 | 54,330 | 0→0 | 0 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -977,880 |
| Ichikawa 市川市 | 0 | 0→0 | 283 | to 18, ¥300 | Elementary + junior high free | +0 |
| Kashiwa 柏市 | n/a (imputed 54,900) | 0→0 | 147 | to 18, ¥300 | Elementary free; junior high partly subsidised | – |
| Arakawa 荒川区 | 0 | 11→14 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Funabashi 船橋市 | 54,900 | 34→12 | 157 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -988,200 |
| Katsushika 葛飾区 | 0 | 0→0 | 320 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Edogawa 江戸川区 | 0 | 0→75 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Inzai 印西市 | n/a (imputed 54,900) | 0→0 | 76 | to 18, ¥200 | Elementary + junior high free | – |
| Tama 多摩市 | 0 | 2→6 | 105 | to 18, ¥200 | Elementary + junior high free | +120,000 |
| Narashino 習志野市 | n/a (imputed 54,900) | 5→8 | <50 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | – |
| Minato 港区 | 0 | 0→0 | 36 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Inagi 稲城市 | 0 | 16→28 | 102 | to 18, ¥200 | Elementary + junior high free | +120,000 |
| Koto 江東区 | 0 | 0→0 | 43 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Kawasaki Kawasaki 川崎市川崎区 | 60,500 | 0→0 | 0 | to 15, ¥500 | Elementary free/supported FY2026; junior high paid | -1,089,000 |
| Shinagawa 品川区 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Matsudo 松戸市 | n/a (imputed 54,900) | 0→0 | <50 | to 18, ¥200 | Elementary free; junior high partly subsidised | – |
| Chiba Inage 千葉市稲毛区 | 54,330 | 0→0 | 0 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -977,880 |
| Machida 町田市 | 0 | 40→90 | 45 | to 18, ¥200 | Elementary + junior high free | +120,000 |
| Chiba Chuo 千葉市中央区 | 54,330 | 0→0 | 0 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -977,880 |
| Adachi 足立区 | 0 | 7→106 | 88 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Misato 三郷市 | n/a (imputed 60,000) | 0→0 | <50 | to 18, n/a | n/a | – |
| Taito 台東区 | 0 | 0→5 | 48 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Chiyoda 千代田区 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Nakano 中野区 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Toshima 豊島区 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Toda 戸田市 | n/a (imputed 60,000) | 18→0 | <50 | to 18, n/a | Elementary + junior high free | – |
| Bunkyo 文京区 | 0 | 4→6 | 19 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Chuo 中央区 | 0 | 0→4 | 118 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Shiroi 白井市 | n/a (imputed 54,900) | 2→2 | <50 | to 18, ¥300 | Junior high free (elementary national support) | – |
| Yokohama Kohoku 横浜市港北区 | 60,000 | 0→0 | 0 | to 18, ¥0 | Elementary free/supported FY2026; junior high paid | -1,068,000 |
| Nerima 練馬区 | 0 | 0→21 | 51 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Shinjuku 新宿区 | 0 | 0→0 | 5 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Ota 大田区 | 0 | 0→48 | 139 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Mitaka 三鷹市 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Yokohama Aoba 横浜市青葉区 | 60,000 | 0→0 | 0 | to 18, ¥0 | Elementary free/supported FY2026; junior high paid | -1,068,000 |
| Chiba Hanamigawa 千葉市花見川区 | 54,330 | 0→0 | 0 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -977,880 |
| Sumida 墨田区 | 0 | 5→17 | 5 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Suginami 杉並区 | 0 | 0→0 | 372 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Kawasaki Saiwai 川崎市幸区 | 60,500 | 0→0 | 0 | to 15, ¥500 | Elementary free/supported FY2026; junior high paid | -1,089,000 |
| Shibuya 渋谷区 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Tsukuba つくば市 | 45,000 | 0→n/a | <50 | to 18, ¥600/day | Elementary free/supported FY2026; junior high paid | -810,000 |
| Sakura 佐倉市 | n/a (imputed 54,900) | 0→0 | <50 | to 18, ¥200 | Elementary free FY2026; junior high free only for 3rd child+ | – |
| Tachikawa 立川市 | 0 | 8→45 | 142 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Yokohama Tsuzuki 横浜市都筑区 | 60,000 | 0→0 | 0 | to 18, ¥0 | Elementary free/supported FY2026; junior high paid | -1,068,000 |
| Kita 北区 | 0 | 18→103 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Moriya 守谷市 | n/a (imputed 50,500) | 0→n/a | <50 | to 18, ¥600/day | Elementary free/supported FY2026; junior high paid | – |
| Yashio 八潮市 | n/a (imputed 60,000) | 15→12 | 86 | to 18, n/a | Elementary free/supported FY2026; junior high paid | – |
| Musashino 武蔵野市 | 0 | 0→0 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Koganei 小金井市 | 0 | 6→10 | 32 | to 18, ¥200 | Elementary + junior high free | +120,000 |
| Setagaya 世田谷区 | 0 | 47→166 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Yachiyo 八千代市 | n/a (imputed 54,900) | 16→9 | 130 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | – |
| Chiba Wakaba 千葉市若葉区 | 54,330 | 0→0 | 0 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -977,880 |
| Meguro 目黒区 | 0 | 0→0 | 28 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Itabashi 板橋区 | 0 | 7→35 | 0 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Nagareyama 流山市 | 59,900 | 0→0 | <50 | to 18, ¥200 | Elementary free FY2026; junior high free only for 3rd child+ | -1,078,200 |
| Kawasaki Nakahara 川崎市中原区 | 60,500 | 0→0 | 0 | to 15, ¥500 | Elementary free/supported FY2026; junior high paid | -1,089,000 |
| Kawaguchi 川口市 | 60,000 | 9→7 | 0 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -1,080,000 |
| Kawasaki Miyamae 川崎市宮前区 | 60,500 | 0→0 | 0 | to 15, ¥500 | Elementary free/supported FY2026; junior high paid | -1,089,000 |
| Tsukubamirai つくばみらい市 | 56,000 | 0→n/a | <50 | to 18, ¥600/day | n/a | -1,008,000 |
| Koshigaya 越谷市 | n/a (imputed 60,000) | 3→2 | 208 | to 18, n/a | Elementary free/supported FY2026; junior high paid | – |
| Saitama Chuo さいたま市中央区 | 55,000 | 0→0 | 197 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -990,000 |
| Kawasaki Takatsu 川崎市高津区 | 60,500 | 0→0 | 0 | to 15, ¥500 | Elementary free/supported FY2026; junior high paid | -1,089,000 |
| Soka 草加市 | 60,000 | 26→5 | <50 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -1,080,000 |
| Saitama Midori さいたま市緑区 | 55,000 | 0→0 | 197 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -990,000 |
| Saitama Urawa さいたま市浦和区 | 55,000 | 0→0 | 197 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -990,000 |
| Saitama Minami さいたま市南区 | 55,000 | 0→0 | 197 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -990,000 |
| Yokohama Kanagawa 横浜市神奈川区 | 60,000 | 0→0 | 0 | to 18, ¥0 | Elementary free/supported FY2026; junior high paid | -1,068,000 |
| Kamagaya 鎌ケ谷市 | n/a (imputed 54,900) | 0→0 | <50 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | – |
| Chiba Midori 千葉市緑区 | 54,330 | 0→0 | 0 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | -977,880 |
| Fuchu 府中市 | 0 | 13→38 | 50 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Yokohama Nishi 横浜市西区 | 60,000 | 0→0 | 0 | to 18, ¥0 | Elementary free/supported FY2026; junior high paid | -1,068,000 |
| Ichihara 市原市 | n/a (imputed 54,900) | 0→0 | <50 | to 18, ¥300 | Elementary free FY2026; junior high free only for 3rd child+ | – |
| Chofu 調布市 | 0 | 8→32 | 94 | to 18, ¥0 | Elementary + junior high free | +120,000 |
| Saitama Omiya さいたま市大宮区 | 55,000 | 0→0 | 197 | to 18, n/a | Elementary free/supported FY2026; junior high paid | -990,000 |
| Kisarazu 木更津市 | n/a (imputed 54,900) | 14→19 | <50 | to 18, ¥200 | Elementary free FY2026; junior high free only for 3rd child+ | – |
| Sodegaura 袖ケ浦市 | n/a (imputed 54,900) | 0→0 | <50 | to 18, ¥200 | Elementary free FY2026; junior high free only for 3rd child+ | – |

### Housing and land

The source is a SUUMO used-condo crawl on 2026-10-12, de-duplicated by building, area and price. The query template is `suumo.jp/jj/bukken/ichiran/JJ010FJ001/?ar=030&bs=011&ta={pref}&sc={JIS}&mb=90` ([SUUMO](https://suumo.jp/jj/bukken/ichiran/JJ010FJ001/)). All prices are asking prices in 万円 (¥10,000). Land figures are 2026 公示地価 residential averages compiled by [トチノカチ](https://totinokati.com/kakaku/13/kouji/) from MLIT data. Contract-price benchmarks come from [REINS](https://www.reins.or.jp/pdf/trend/nmw/NMW_2025_1_13.pdf).

| Municipality | Used listings | ≥90 m² share | Median 90–105 m² 万円 [n] | Median 90–110 m² built≥2000 万円 [n] | ≥90 m² under ¥80M (built≥2000) | Land ¥/m² 2026 | Land 5-yr |
|---|---|---|---|---|---|---|---|
| Urayasu 浦安市 | 171 | 25.7% | 7,380 [19] | 8,000 [13] | 17 (9) | 396,000 | +35.9% |
| Chiba Mihama 千葉市美浜区 | 483 | 17.4% | 5,780 [49] | 6,780 [35] | 41 (26) | 194,000 | +19.4% |
| Ichikawa 市川市 | 679 | 6.0% | 4,830 [18] | 6,180 [9] | 17 (6) | 309,000 | +41.1% |
| Kashiwa 柏市 | 458 | 9.4% | 1,500 [26] | 9,210 [3] | 32 (1) | 138,000 | +32.9% |
| Arakawa 荒川区 | 556 | 2.3% | 8,249 [6] | 8,980 [5] | 4 (1) | 723,000 | +37.4% |
| Funabashi 船橋市 | 1,102 | 9.3% | 3,490 [52] | 3,980 [31] | 63 (36) | 196,000 | +27.2% |
| Katsushika 葛飾区 | 676 | 1.0% | 4,280 [3] | – [0] | 3 (0) | 381,000 | +18.9% |
| Edogawa 江戸川区 | 948 | 7.9% | 6,989 [30] | 9,085 [12] | 27 (2) | 430,000 | +19.3% |
| Inzai 印西市 | 128 | 40.6% | 2,999 [36] | 4,430 [14] | 48 (18) | 47,000 | +20.0% |
| Tama 多摩市 | 260 | 21.5% | 2,780 [39] | 7,450 [4] | 51 (3) | 199,000 | +11.1% |
| Narashino 習志野市 | 308 | 7.8% | 2,680 [19] | 4,680 [7] | 22 (7) | 204,000 | +24.4% |
| Minato 港区 | 3,397 | 19.1% | 36,000 [214] | 43,450 [230] | 0 (0) | 2,940,000 | +45.2% |
| Inagi 稲城市 | 140 | 37.9% | 5,480 [18] | 5,980 [9] | 41 (12) | 263,000 | +15.8% |
| Koto 江東区 | 2,163 | 5.7% | 12,800 [57] | 14,800 [47] | 6 (1) | 673,000 | +36.8% |
| Kawasaki Kawasaki 川崎市川崎区 | 384 | 5.5% | 5,180 [15] | 6,180 [11] | 15 (10) | 335,000 | +16.4% |
| Shinagawa 品川区 | 1,592 | 6.8% | 22,380 [34] | 28,990 [23] | 1 (0) | 1,220,000 | +46.0% |
| Matsudo 松戸市 | 721 | 3.1% | 3,980 [14] | 3,930 [12] | 15 (13) | 167,000 | +23.0% |
| Chiba Inage 千葉市稲毛区 | 288 | 10.4% | 2,490 [13] | 5,980 [7] | 17 (7) | 176,000 | +20.7% |
| Machida 町田市 | 326 | 16.3% | 4,130 [28] | 4,935 [16] | 35 (16) | 166,000 | +8.7% |
| Chiba Chuo 千葉市中央区 | 430 | 4.2% | 3,830 [14] | 4,380 [9] | 17 (10) | 161,000 | +25.5% |
| Adachi 足立区 | 1,198 | 3.8% | 7,180 [21] | 7,180 [15] | 17 (12) | 405,000 | +26.4% |
| Misato 三郷市 | 161 | 12.4% | 1,585 [14] | 3,075 [2] | 19 (2) | 121,000 | +6.7% |
| Taito 台東区 | 1,048 | 2.5% | 11,740 [6] | 23,980 [3] | 0 (0) | 1,160,000 | +34.7% |
| Chiyoda 千代田区 | 648 | 18.8% | 42,000 [38] | 43,245 [42] | 0 (0) | 3,720,000 | +29.9% |
| Nakano 中野区 | 898 | 5.0% | 9,790 [14] | 13,300 [6] | 4 (1) | 761,000 | +32.6% |
| Toshima 豊島区 | 1,225 | 2.4% | 23,230 [14] | 23,480 [12] | 1 (0) | 907,000 | +44.2% |
| Toda 戸田市 | 255 | 9.8% | 4,440 [14] | 3,898 [9] | 18 (9) | 314,000 | +26.7% |
| Bunkyo 文京区 | 1,163 | 5.7% | 18,480 [23] | 25,800 [11] | 2 (0) | 1,410,000 | +44.1% |
| Chuo 中央区 | 2,240 | 5.8% | 24,350 [82] | 26,650 [78] | 0 (0) | 1,760,000 | +45.6% |
| Shiroi 白井市 | 75 | 45.3% | 1,590 [13] | – [0] | 31 (0) | 77,000 | +24.6% |
| Yokohama Kohoku 横浜市港北区 | 656 | 9.0% | 6,499 [29] | 7,880 [12] | 34 (7) | 376,000 | +18.1% |
| Nerima 練馬区 | 1,046 | 8.2% | 7,480 [41] | 7,490 [9] | 31 (6) | 469,000 | +22.0% |
| Shinjuku 新宿区 | 2,183 | 6.0% | 22,480 [42] | 24,800 [37] | 1 (0) | 1,100,000 | +37.6% |
| Ota 大田区 | 1,233 | 4.4% | 10,245 [24] | 10,480 [13] | 7 (1) | 619,000 | +25.0% |
| Mitaka 三鷹市 | 281 | 5.0% | 7,398 [3] | 7,355 [2] | 3 (1) | 483,000 | +16.8% |
| Yokohama Aoba 横浜市青葉区 | 563 | 13.3% | 5,980 [26] | 6,480 [23] | 42 (24) | 336,000 | +12.7% |
| Chiba Hanamigawa 千葉市花見川区 | 149 | 17.4% | 3,690 [10] | 4,880 [4] | 10 (4) | 149,000 | +13.6% |
| Sumida 墨田区 | 763 | 2.1% | 17,500 [7] | 17,500 [6] | 0 (0) | 605,000 | +37.9% |
| Suginami 杉並区 | 1,116 | 6.1% | 8,880 [26] | 9,630 [16] | 9 (2) | 709,000 | +29.1% |
| Kawasaki Saiwai 川崎市幸区 | 272 | 8.1% | 9,440 [12] | 13,630 [8] | 4 (1) | 386,000 | +18.5% |
| Shibuya 渋谷区 | 1,754 | 14.3% | 31,800 [93] | 35,500 [68] | 0 (0) | 1,790,000 | +42.4% |
| Tsukuba つくば市 | 62 | 32.3% | 4,520 [9] | 5,890 [12] | 12 (9) | 85,000 | +35.9% |
| Sakura 佐倉市 | 101 | 28.7% | 2,890 [19] | 2,980 [9] | 24 (10) | 67,000 | +7.7% |
| Tachikawa 立川市 | 261 | 6.1% | 4,644 [10] | 4,644 [8] | 13 (9) | 306,000 | +22.0% |
| Yokohama Tsuzuki 横浜市都筑区 | 273 | 21.6% | 6,795 [34] | 7,480 [13] | 41 (13) | 305,000 | +13.9% |
| Kita 北区 | 680 | 2.4% | 10,980 [7] | 25,300 [6] | 3 (1) | 726,000 | +41.2% |
| Moriya 守谷市 | 12 | 66.7% | 4,580 [3] | 4,580 [3] | 5 (5) | 130,000 | +51.1% |
| Yashio 八潮市 | 49 | 20.4% | 2,690 [4] | 2,690 [3] | 4 (3) | 137,000 | +13.3% |
| Musashino 武蔵野市 | 269 | 11.9% | 14,980 [19] | 17,280 [14] | 5 (1) | 665,000 | +20.9% |
| Koganei 小金井市 | 171 | 4.1% | 5,590 [4] | 8,590 [2] | 5 (1) | 387,000 | +14.3% |
| Setagaya 世田谷区 | 2,173 | 11.2% | 13,780 [103] | 15,490 [71] | 13 (3) | 759,000 | +21.8% |
| Yachiyo 八千代市 | 169 | 13.0% | 3,299 [17] | 2,420 [4] | 18 (5) | 116,000 | +7.8% |
| Chiba Wakaba 千葉市若葉区 | 90 | 10.0% | 1,680 [6] | 2,480 [1] | 7 (1) | 95,000 | +21.7% |
| Meguro 目黒区 | 1,177 | 9.2% | 14,500 [29] | 18,850 [10] | 0 (0) | 1,340,000 | +45.1% |
| Itabashi 板橋区 | 1,229 | 2.4% | 7,340 [12] | 11,000 [7] | 10 (2) | 549,000 | +27.5% |
| Nagareyama 流山市 | 179 | 8.4% | 7,500 [2] | 7,500 [3] | 8 (2) | 196,000 | +52.8% |
| Kawasaki Nakahara 川崎市中原区 | 453 | 3.5% | 13,500 [11] | 15,240 [10] | 4 (2) | 468,000 | +18.3% |
| Kawaguchi 川口市 | 1,128 | 4.2% | 5,680 [16] | 5,980 [9] | 17 (7) | 266,000 | +22.3% |
| Kawasaki Miyamae 川崎市宮前区 | 610 | 9.0% | 5,980 [30] | 7,698 [13] | 27 (7) | 292,000 | +17.8% |
| Tsukubamirai つくばみらい市 | 7 | 14.3% | 1,350 [1] | 1,350 [1] | 1 (1) | 56,000 | +46.0% |
| Koshigaya 越谷市 | 275 | 18.9% | 4,398 [23] | 6,390 [9] | 24 (9) | 149,000 | +12.8% |
| Saitama Chuo さいたま市中央区 | 156 | 5.1% | 5,899 [8] | 9,990 [1] | 7 (0) | 308,000 | +16.3% |
| Kawasaki Takatsu 川崎市高津区 | 369 | 8.1% | 7,730 [16] | 8,799 [11] | 15 (5) | 360,000 | +15.5% |
| Soka 草加市 | 394 | 6.3% | 4,330 [8] | 4,380 [4] | 8 (4) | 159,000 | +17.6% |
| Saitama Midori さいたま市緑区 | 85 | 21.2% | 4,630 [6] | 5,850 [7] | 8 (7) | 187,000 | +10.5% |
| Saitama Urawa さいたま市浦和区 | 403 | 5.7% | 8,335 [14] | 11,890 [8] | 9 (3) | 415,000 | +19.1% |
| Saitama Minami さいたま市南区 | 361 | 3.9% | 3,980 [9] | 3,680 [7] | 10 (6) | 295,000 | +15.8% |
| Yokohama Kanagawa 横浜市神奈川区 | 493 | 4.7% | 4,780 [14] | 10,390 [4] | 10 (1) | 334,000 | +21.0% |
| Kamagaya 鎌ケ谷市 | 45 | 6.7% | 1,980 [3] | – [0] | 3 (0) | 105,000 | +16.1% |
| Chiba Midori 千葉市緑区 | 98 | 5.1% | 1,850 [5] | – [0] | 5 (0) | 81,000 | +18.5% |
| Fuchu 府中市 | 325 | 5.5% | 5,799 [7] | 5,799 [7] | 8 (6) | 353,000 | +20.7% |
| Yokohama Nishi 横浜市西区 | 454 | 6.2% | 20,500 [20] | 20,500 [20] | 1 (0) | 376,000 | +34.3% |
| Ichihara 市原市 | 50 | 8.0% | 1,180 [3] | 3,210 [1] | 4 (1) | 54,000 | +14.1% |
| Chofu 調布市 | 291 | 1.7% | 4,539 [2] | – [0] | 4 (0) | 426,000 | +24.8% |
| Saitama Omiya さいたま市大宮区 | 313 | 4.5% | 9,990 [8] | 11,950 [8] | 4 (2) | 338,000 | +31.0% |
| Kisarazu 木更津市 | 9 | 0.0% | – [0] | – [0] | 0 (0) | 40,000 | +15.9% |
| Sodegaura 袖ケ浦市 | 5 | 0.0% | – [0] | – [0] | 0 (0) | 56,000 | +20.3% |

### Demographics and Costco

Census data comes from the 2025 census as compiled by [uub.jp](https://uub.jp/cdr/j/zogen.html) and checked against the [統計局 summary](https://www.stat.go.jp/data/kokusei/2025/kekka/pdf/summary.pdf). Projections are IPSS 令和5年推計 via [uub.jp](https://uub.jp/cdr/j/f.html), and the 0–14 share is from the [2020 census](https://uub.jp/cdr/j/child.html). Costco locations come from [hubmedia](https://hubmedia.co.jp/costco/costco-store/japan-all-costco-stores/) and [Wikipedia](https://ja.wikipedia.org/wiki/コストコ). Drive times are modelled estimates. The Koganei, Yokohama-Kanagawa and Yokohama-Nishi times were computed by the writer using the same method.

| Municipality | Pop. 2025 | 2020→25 | IPSS 2050 vs 2020 | 0–14 share 2020 | Nearest Costco | Drive min (est.) |
|---|---|---|---|---|---|---|
| Urayasu 浦安市 | 172,707 | +0.8% | -4.4% | 12.6% | 幕張 | 35 |
| Chiba Mihama 千葉市美浜区 | 156,222 | +4.9% | -14.4% | 12.2% | 幕張 | 12.5 |
| Ichikawa 市川市 | 494,354 | -0.5% | -2.7% | 11.5% | 幕張 | 37.5 |
| Kashiwa 柏市 | 435,302 | +2.1% | +2.1% | 12.5% | 新三郷 | 30 |
| Arakawa 荒川区 | 226,291 | +4.1% | +6.3% | 11.2% | 新三郷 | 55 |
| Funabashi 船橋市 | 651,663 | +1.4% | +1.4% | 12.5% | 幕張 | 17.5 |
| Katsushika 葛飾区 | 467,267 | +3.1% | -0.5% | 11.4% | 新三郷 | 47.5 |
| Edogawa 江戸川区 | 704,696 | +1.0% | -2.7% | 12.4% | 幕張 | 55 |
| Inzai 印西市 | 110,339 | +7.5% | +16.8% | 16.4% | 千葉ニュータウン | 7.5 |
| Tama 多摩市 | 141,575 | -3.7% | -8.9% | 11.3% | 多摩境 | 22.5 |
| Narashino 習志野市 | 175,706 | -0.3% | -0.5% | 12.6% | 幕張 | 10 |
| Minato 港区 | 272,478 | +4.6% | +20.0% | 13.3% | 川崎 | 55 |
| Inagi 稲城市 | 95,120 | +2.1% | +8.6% | 14.1% | 多摩境 | 40 |
| Koto 江東区 | 553,502 | +5.6% | +13.0% | 12.7% | 川崎 / 幕張 (near-tie) | 67.5 |
| Kawasaki Kawasaki 川崎市川崎区 | 233,357 | +0.2% | +1.8% | 10.7% | 川崎 | 10 |
| Shinagawa 品川区 | 426,005 | +0.8% | +10.1% | 11.1% | 川崎 | 35 |
| Matsudo 松戸市 | 496,374 | -0.4% | -4.5% | 11.4% | 新三郷 | 30 |
| Chiba Inage 千葉市稲毛区 | 160,432 | -0.1% | -5.0% | 11.6% | 幕張 | 20 |
| Machida 町田市 | 420,385 | -2.5% | -5.7% | 11.9% | 座間 | 25 |
| Chiba Chuo 千葉市中央区 | 226,907 | +7.2% | +1.0% | 10.3% | 幕張 | 30 |
| Adachi 足立区 | 701,667 | +1.0% | +2.3% | 10.9% | 新三郷 | 40 |
| Misato 三郷市 | 140,568 | -1.1% | -1.1% | 12.8% | 新三郷 | 12.5 |
| Taito 台東区 | 228,046 | +7.9% | +15.7% | 8.8% | 新三郷 | 65 |
| Chiyoda 千代田区 | 66,270 | -0.6% | +19.7% | 13.5% | 川崎 | 67.5 |
| Nakano 中野区 | 354,853 | +2.9% | +4.9% | 8.4% | 川崎 | 77.5 |
| Toshima 豊島区 | 305,516 | +1.3% | +9.2% | 8.8% | 新三郷 | 72.5 |
| Toda 戸田市 | 139,232 | -1.2% | +7.0% | 14.2% | 新三郷 | 55 |
| Bunkyo 文京区 | 249,800 | +4.1% | +13.1% | 11.7% | 新三郷 | 72.5 |
| Chuo 中央区 | 181,841 | +7.5% | +24.7% | 13.7% | 川崎 | 60 |
| Shiroi 白井市 | 60,932 | -2.4% | -10.5% | 13.8% | 千葉ニュータウン | 22.5 |
| Yokohama Kohoku 横浜市港北区 | 363,598 | +1.4% | +5.3% | 12.1% | 川崎 | 30 |
| Nerima 練馬区 | 760,819 | +1.1% | +0.3% | 11.4% | 新三郷 | 85 |
| Shinjuku 新宿区 | 361,357 | +3.4% | +4.2% | 8.4% | 川崎 | 67.5 |
| Ota 大田区 | 758,181 | +1.4% | +2.7% | 10.3% | 川崎 | 15 |
| Mitaka 三鷹市 | 194,892 | -0.3% | +3.6% | 12.0% | 多摩境 | 60 |
| Yokohama Aoba 横浜市青葉区 | 306,583 | -1.3% | -6.2% | 12.6% | 座間 | 40 |
| Chiba Hanamigawa 千葉市花見川区 | 177,630 | +0.2% | -14.4% | 10.5% | 幕張 | 12.5 |
| Sumida 墨田区 | 285,038 | +4.8% | +9.2% | 10.3% | 新三郷 | 65 |
| Suginami 杉並区 | 597,038 | +1.0% | +4.7% | 10.0% | 川崎 | 77.5 |
| Kawasaki Saiwai 川崎市幸区 | 175,700 | +2.7% | +8.2% | 13.4% | 川崎 | 12.5 |
| Shibuya 渋谷区 | 238,826 | -2.1% | +9.6% | 9.4% | 川崎 | 60 |
| Tsukuba つくば市 | 268,832 | +11.2% | +6.0% | 14.3% | つくば | 10 |
| Sakura 佐倉市 | 163,765 | -3.0% | -19.6% | 11.0% | 千葉ニュータウン | 40 |
| Tachikawa 立川市 | 189,304 | +3.1% | -2.6% | 11.9% | 多摩境 | 35 |
| Yokohama Tsuzuki 横浜市都筑区 | 214,025 | +0.4% | +2.9% | 14.9% | 座間 / 川崎 (tie) | 47.5 |
| Kita 北区 | 367,827 | +3.6% | +1.0% | 10.3% | 新三郷 | 60 |
| Moriya 守谷市 | 70,199 | +2.6% | +11.4% | 15.1% | 新三郷 / つくば (near-tie) | 47.5 |
| Yashio 八潮市 | 93,410 | +0.1% | +9.3% | 12.1% | 新三郷 | 17.5 |
| Musashino 武蔵野市 | 150,528 | +0.3% | +5.8% | 11.5% | 入間 | 65 |
| Koganei 小金井市 | 128,953 | +2.3% | +2.3% | 11.8% | 多摩境 (est.) | 45 |
| Setagaya 世田谷区 | 954,737 | +1.2% | +4.6% | 11.5% | 川崎 | 55 |
| Yachiyo 八千代市 | 204,904 | +2.7% | -2.0% | 12.8% | 千葉NT / 幕張 (tie) | 30 |
| Chiba Wakaba 千葉市若葉区 | 145,508 | -1.0% | -15.6% | 10.6% | 幕張 | 37.5 |
| Meguro 目黒区 | 286,082 | -0.7% | +3.6% | 10.9% | 川崎 | 47.5 |
| Itabashi 板橋区 | 595,972 | +2.0% | +3.5% | 10.3% | 新三郷 | 67.5 |
| Nagareyama 流山市 | 215,086 | +7.6% | +20.9% | 15.6% | 新三郷 | 17.5 |
| Kawasaki Nakahara 川崎市中原区 | 269,570 | +2.2% | +9.6% | 12.9% | 川崎 | 30 |
| Kawaguchi 川口市 | 591,712 | -0.4% | +0.9% | 12.2% | 新三郷 | 45 |
| Kawasaki Miyamae 川崎市宮前区 | 235,603 | +0.8% | +2.2% | 13.6% | 川崎 | 47.5 |
| Tsukubamirai つくばみらい市 | 52,100 | +4.5% | +13.0% | 14.7% | つくば | 42.5 |
| Koshigaya 越谷市 | 341,497 | -0.0% | -3.3% | 12.7% | 新三郷 | 22.5 |
| Saitama Chuo さいたま市中央区 | 103,818 | +0.5% | +0.8% | 12.3% | 新三郷 | 70 |
| Kawasaki Takatsu 川崎市高津区 | 236,857 | +1.1% | +5.1% | 12.5% | 川崎 | 42.5 |
| Soka 草加市 | 251,360 | +1.2% | -7.5% | 11.7% | 新三郷 | 22.5 |
| Saitama Midori さいたま市緑区 | 132,357 | +3.1% | +13.2% | 15.1% | 新三郷 | 47.5 |
| Saitama Urawa さいたま市浦和区 | 169,446 | +2.8% | +6.4% | 13.7% | 新三郷 | 60 |
| Saitama Minami さいたま市南区 | 196,185 | +2.4% | +3.0% | 13.4% | 新三郷 | 65 |
| Yokohama Kanagawa 横浜市神奈川区 | 252,260 | +2.0% | +1.0% | 10.9% | 川崎 (writer est.) | 37.5 |
| Kamagaya 鎌ケ谷市 | 109,081 | -0.8% | -6.1% | 11.4% | 千葉ニュータウン | 40 |
| Chiba Midori 千葉市緑区 | 128,147 | -1.0% | -1.5% | 14.0% | 幕張 | 52.5 |
| Fuchu 府中市 | 263,084 | +0.1% | -1.0% | 12.6% | 多摩境 | 37.5 |
| Yokohama Nishi 横浜市西区 | 108,145 | +3.1% | +8.9% | 10.9% | 川崎 / 金沢シーサイド (writer est.) | 42.5 |
| Ichihara 市原市 | 259,897 | -3.6% | -23.0% | 11.2% | 幕張 / 木更津 (tie) | 57.5 |
| Chofu 調布市 | 245,306 | +1.1% | +4.4% | 11.8% | 多摩境 | 52.5 |
| Saitama Omiya さいたま市大宮区 | 125,285 | +6.4% | +6.0% | 12.1% | 新三郷 | 70 |
| Kisarazu 木更津市 | 137,069 | +0.7% | -1.7% | 12.6% | 木更津 | 17.5 |
| Sodegaura 袖ケ浦市 | 65,079 | +1.9% | -2.6% | 13.5% | 木更津 | 12.5 |

### FLAGS (shortlist)
- 1 Urayasu: 学童 waitlist only known as <50 (2025 CFA list): banded 10/15; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 2 Chiba Mihama: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 3 Ichikawa: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 4 Kashiwa: 0–2 fee not extracted: imputed prefecture median ¥54,900; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 5 Arakawa: crowding not measured by MLIT for this line: no crowding adjustment
- 6 Funabashi: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 7 Katsushika: built≥2000 90–110 m² sample <3: price blends all-age median with 70–80 m² unit price × 95
- 8 Edogawa: 
- 9 Inzai: 0–2 fee not extracted: imputed prefecture median ¥54,900; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 10 Tama: 
- 11 Narashino: 0–2 fee not extracted: imputed prefecture median ¥54,900; 学童 waitlist only known as <50 (2025 CFA list): banded 10/15; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 12 Minato: 
- 13 Inagi: 
- 14 Koto: 
- 15 Kawasaki Kawasaki: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 16 Shinagawa: 
- 17 Matsudo: 0–2 fee not extracted: imputed prefecture median ¥54,900; 学童 waitlist only known as <50 (2025 CFA list): banded 10/15; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 18 Chiba Inage: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 19 Machida: 
- 20 Chiba Chuo: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 21 Adachi: 
- 22 Misato: 0–2 fee not extracted: imputed prefecture median ¥60,000; 学童 waitlist only known as <50 (2025 CFA list): banded 10/15; medical copay not extracted: mid value imputed; junior-high lunch status unknown: mid value imputed; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule); built≥2000 90–110 m² sample <3: price blends all-age median with 70–80 m² unit price × 95
- 23 Taito: crowding not measured by MLIT for this line: no crowding adjustment
- 24 Chiyoda: Chiyoda cash amounts conflict between aggregators
- 25 Nakano: 
- 26 Toshima: 
- 27 Toda: 0–2 fee not extracted: imputed prefecture median ¥60,000; 学童 waitlist only known as <50 (2025 CFA list): banded 10/15; medical copay not extracted: mid value imputed; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 28 Bunkyo: 
- 29 Chuo: 
- 30 Shiroi: 0–2 fee not extracted: imputed prefecture median ¥54,900; 学童 waitlist only known as <50 (2025 CFA list): banded 10/15; municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule); built≥2000 90–110 m² sample <3: price blends all-age median with 70–80 m² unit price × 95
- 31 Yokohama Kohoku: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 32 Nerima: 
- 34 Ota: 
- 35 Mitaka: built≥2000 90–110 m² sample <3: price blends all-age median with 70–80 m² unit price × 95
- 36 Yokohama Aoba: bus route exists but weekday timetable not obtained: scored 0 (unverified, conservative); municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
- 37 Chiba Hanamigawa: municipal cash extras not systematically surveyed (Tokyo-only 018/gift = 0 by rule)
