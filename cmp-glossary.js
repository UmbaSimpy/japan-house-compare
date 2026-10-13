/* Compare views — explanations behind the ⓘ buttons (bilingual).
   a.<key>  = Area comparison rows (map-tools.js → mpCmpRows; key = map.cmp.r.<key>, sub.<layer>, total)
   l.<key>  = Listings comparison rows (app.js → cmpRows; key = row.<key> / cat.<k> / total)
   l.<kind>.<key> overrides l.<key> for one kind (house | ms | new).
   Each entry: what = what it is, why = why it matters, read = how to read it, tip = what to do. Each field is [English, 日本語].
   The popup title is the row label itself. Numbers here describe the scoring code; keep them in sync with
   data/PARAMETERS.md, build_locations.py, inject_mansion.py, inject_newms.py and app.js → scoreSet. */
window.CMPG = {
/* ══════════════ AREA COMPARISON ══════════════ */
'a.total': {
  what: [`The weighted total of the seven sub-scores, each 0–100. Default weights: Space 25, Commute 25, Childcare 20, Natural hazards 10, Growth 10, Bus 5, Costco 5. If you changed weights or picked an office in ⚙ Personalise, your settings are used (a badge says so).`,
         `7つのサブスコア（各0〜100）の加重合計です。標準の重み：広さ25・通勤25・子育て20・災害10・成長性10・バス5・コストコ5。⚙「カスタマイズ」で重みや勤務先を変えた場合はその設定で計算します（バッジで表示）。`],
  why: [`One number lets you rank 77 municipalities quickly, but it hides trade-offs: a great commute can mask expensive housing.`,
        `77の市区町村を素早く並べるための1つの数字ですが、トレードオフが隠れます。通勤が良くても住宅が高い、などです。`],
  read: [`Gaps of less than about 3 points are within the noise of the data. Look at which sub-scores create the gap.`,
         `3点程度未満の差はデータの誤差の範囲です。どのサブスコアが差を生んでいるかを見てください。`],
  tip: [`If your priorities differ (e.g. no car → Costco 0), change the weights; the ranking updates live.`,
        `優先順位が違う場合（例：車なし→コストコ0）は重みを変えてください。順位はすぐに更新されます。`] },
'a.rank': {
  what: [`Position among all scored areas by total score. Areas with almost no 90 m²+ condo stock at a reachable price (Space below 10) are kept "below the space gate" and not shortlisted.`,
         `総合スコアによる全エリア中の順位です。手の届く価格の90㎡以上のマンションがほとんどないエリア（広さ10未満）は「広さの足切り」となり候補リストから外れます。`],
  read: [`Ranks exaggerate small differences: #5 and #9 may be only 1–2 points apart. Compare the totals, not the ranks.`,
         `順位は小さな差を大きく見せます。5位と9位の差が1〜2点しかないこともあるので、順位より合計点を比べてください。`] },
'a.sub.space': {
  what: [`Large condos you could actually buy. Listings ≥90 m² count by build year: 2000+ = 1, 1990s = 0.6, 1983–89 = 0.3, older = 0. 50% Price: weighted median ¥/m² of those × 100 m², on a log scale (¥30M = 100 … ¥150M = 0). 50% Choice: how many of them are under ¥80M (or your budget): 100·ln(1+n)/ln 61, so 60+ listings = 100.`,
         `実際に買える広いマンションの評価です。90㎡以上の物件を築年で重み付けして数えます（2000年以降＝1、1990年代＝0.6、1983〜89年＝0.3、それ以前＝0）。50%は価格：それらの重み付き㎡単価中央値×100㎡（対数目盛り、3,000万円＝100…1億5,000万円＝0）。50%は選択肢：8,000万円（または設定した予算）未満の件数、100·ln(1+n)/ln61で60件以上＝100。`],
  why: [`For a family needing 90–100 m², the question is not the average price but whether suitable flats exist in your budget, and how many you can choose from.`,
        `90〜100㎡が必要な家族にとって大事なのは平均価格ではなく、予算内に条件に合う物件があるか、何件から選べるかです。`],
  read: [`The count is smoothed over 30 days of daily SUUMO data, so one day's swings don't move it. A low Choice part with a good Price part means few large flats are listed, not that they're expensive.`,
         `件数はSUUMOの日次データの30日中央値で平滑化しているので、1日の変動では動きません。価格は良いのに選択肢が低い場合は、高いのではなく大きな物件の掲載が少ないという意味です。`],
  tip: [`Move the ⚙ budget slider to see how the Choice part changes at your real budget.`,
        `⚙の予算スライダーを動かすと、実際の予算での選択肢スコアを確認できます。`] },
'a.sub.commute': {
  what: [`Train time to Tokyo Stn / Otemachi (or your chosen office): effective minutes E = minutes + 5 per transfer; score = 100·(80 − E)/65, so 15 effective minutes = 100 and 80 = 0. Then: peak crowding ≥158% −5, ≥150% −2, ≤125% +5; monthly pass over ¥30k −5, over ¥45k −10.`,
         `東京駅／大手町（または選んだ勤務先）までの電車時間です。実効時間E＝乗車分＋乗換1回につき5分。スコア＝100·(80−E)/65（実効15分＝100、80分＝0）。さらに混雑率158%以上−5、150%以上−2、125%以下＋5、定期代3万円超−5、4.5万円超−10。`],
  why: [`A daily commute is the cost you pay most often: 20 minutes each way is about 160 hours a year.`,
        `通勤は最も頻繁に払うコストです。片道20分の差は年間約160時間になります。`],
  read: [`Station to station only. Walking to and from the station is not included; the area-level score assumes a home near the main station.`,
         `駅から駅までの時間です。駅までの徒歩は含まず、エリアの主要駅近くに住む前提です。`],
  tip: [`Pick your office in ⚙ Personalise: the score then uses the train time to that office.`,
        `⚙「カスタマイズ」で勤務先を選ぶと、その勤務先までの時間でスコアを計算します。`] },
'a.sub.childcare': {
  what: [`Points out of 100: 0–2 daycare fee 35 (free = 35, ¥65k+/month = 0) · Tokyo cash benefits 10 · daycare waitlist 30 (0 = 30 … 100+ = 0) · 学童 waitlist 15 · child medical copay 5 · free school lunch 5.`,
         `100点満点：0〜2歳の保育料35（無料＝35、月6.5万円以上＝0）・東京都の現金給付10・待機児童30（0人＝30…100人以上＝0）・学童の待機15・子ども医療費の自己負担5・給食費無償化5。`],
  why: [`With children aged 0–2, getting a nursery place and its fee are the biggest local differences between municipalities.`,
        `0〜2歳の子どもがいる場合、保育園に入れるかどうかとその費用が、自治体間で最も大きな差になります。`],
  read: [`Tokyo areas score high because 0–2 daycare for the first child has been free in Tokyo since 2025-09 and Tokyo pays extra cash (018サポート). An * on a fee means the city's table wasn't found and the prefecture median is used.`,
         `東京都は2025年9月から第1子の0〜2歳保育料が無償で、018サポートなどの現金給付もあるため高得点になります。保育料の＊は自治体の表が見つからず県の中央値を使っていることを示します。`] },
'a.sub.hazard': {
  what: [`Higher = safer. Water 40 (residents in max-scenario flood / storm-surge / tsunami zones, deeper zones weigh more) + Ground 25 (liquefaction-prone landforms) + Landslide 10 + Earthquake 25 (30-year probability of 震度6弱+, 40% = 25 … 85% = 0).`,
         `高いほど安全です。水害40（想定最大規模の洪水・高潮・津波区域の居住者、深いほど重く）＋地盤25（液状化しやすい地形）＋土砂災害10＋地震25（30年以内に震度6弱以上の確率、40%＝25…85%＝0）。`],
  why: [`A home is a 30-year commitment. Hazards affect safety, insurance, and resale value after a disaster.`,
        `住まいは30年単位の選択です。災害リスクは安全・保険料・災害後の資産価値に影響します。`],
  read: [`It is an area average weighted by where people live. Your actual building can be much safer or worse than the area: check the exact address in Deep look.`,
         `居住人口で重み付けしたエリア平均です。実際の建物はエリア平均よりずっと安全なことも危険なこともあるので、Deep lookで住所ごとに確認してください。`] },
'a.sub.growth': {
  what: [`Population change 2020→25 (35) + IPSS 2050 projection (30) + residential land-price change over 5 years (20) + share of children 0–14 (10), plus or minus points for rail and redevelopment projects in the pipeline register (−3 … +5).`,
         `人口増減2020→25（35）＋社人研2050年推計（30）＋住宅地地価の5年変化（20）＋0〜14歳の割合（10）に、鉄道・再開発プロジェクトの加減点（−3〜＋5）。`],
  why: [`Growing areas keep shops, schools and clinics open and support resale value. Shrinking ones risk the opposite over a 30-year loan.`,
        `人口が増えるエリアは店・学校・医療が維持され、売却価格も支えられます。減少エリアは30年ローンの間に逆のリスクがあります。`],
  read: [`Growth often comes with rising prices and more competition for daycare: a high score is good for value, not always for affordability.`,
         `成長は価格上昇や保育園の競争を伴うことが多く、資産価値には良くても買いやすさには不利なことがあります。`] },
'a.sub.bus': {
  what: [`Weekday highway / commuter buses to Tokyo Station: 50·(morning arrivals by 9:30)/9 + 50·(evening departures 17:30–21:30)/9, capped at 9 each. ×0.6 if the bus is more than 15 minutes slower than the train. 0 = no usable route.`,
         `東京駅への平日の高速・通勤バス：50×（9:30までの到着便数）/9＋50×（17:30〜21:30の出発便数）/9（各9便で上限）。電車より15分以上遅い場合は×0.6。0＝使える路線なし。`],
  why: [`A bus gives a guaranteed seat (sleep or work) and a backup when trains stop.`,
        `バスは確実に座れ（寝る・仕事ができる）、電車が止まった時の代替にもなります。`] },
'a.sub.costco': {
  what: [`Estimated drive time to the nearest Costco: ≤15 min = 100, ≥75 min = 0, linear in between.`,
         `最寄りのコストコまでの推定運転時間：15分以内＝100、75分以上＝0、その間は直線的。`],
  read: [`An estimate (straight-line distance × 1.35 at 18–30 km/h), not a routed time. Set its weight to 0 if you don't drive.`,
         `直線距離×1.35を時速18〜30kmで割った推定で、実際のルート検索ではありません。車を使わないなら重みを0にしてください。`] },
'a.office': {
  what: [`Train time from the area's main station to your chosen office, arriving by 08:45 on a weekday (Yahoo!乗換案内, IC fare, no paid express), with the number of transfers. "Door-to-door" adds your walking minutes from ⚙ Personalise.`,
         `エリアの主要駅から選んだ勤務先まで、平日8:45着の電車時間（Yahoo!乗換案内、IC運賃、有料特急なし）と乗換回数です。「ドアtoドア」は⚙で設定した徒歩時間を加えたものです。`],
  why: [`This is your real daily commute, so it matters more than the generic Tokyo Station figure.`,
        `実際の毎日の通勤なので、一般的な東京駅までの時間より重要です。`],
  read: [`Every transfer costs time and the risk of losing your seat or connection; the score adds 5 minutes per transfer.`,
         `乗換は時間がかかり、座席や接続を失うリスクがあります。スコアでは乗換1回につき5分を加えています。`],
  tip: [`Try the trip once at rush hour before buying.`, `購入前に一度、ラッシュ時間に実際に乗ってみてください。`] },
'a.officePass': {
  what: [`1-month commuter pass (通勤定期) from the area's main station to your office.`, `主要駅から勤務先までの1か月通勤定期代です。`],
  why: [`Most employers pay it (通勤手当, tax-free up to ¥150k/month), but some cap the allowance, and it shows how far you really are.`,
        `多くの会社が通勤手当で支給します（月15万円まで非課税）が、上限を設ける会社もあります。実際の距離感の目安にもなります。`] },
'a.toTokyo': {
  what: [`Station-to-station train time from the area's main station to Tokyo Station or Otemachi (whichever is better), arriving by 08:45 on a weekday, with transfers. The line below shows the station used and the destination.`,
         `エリアの主要駅から東京駅または大手町（早い方）まで、平日8:45着の駅間の乗車時間と乗換回数です。下の行は使った駅と行き先です。`],
  why: [`Tokyo Station / Otemachi is the study's reference office location. It sets the default commute score.`,
        `東京駅・大手町はこの調査の基準となる勤務地で、標準の通勤スコアを決めます。`],
  read: [`Add 5–15 minutes on each side for walking. A flat 20 minutes from the station can erase the advantage of a fast line.`,
         `前後の徒歩に5〜15分ずつ足してください。駅から徒歩20分の物件では速い路線の利点がなくなります。`],
  tip: [`If you work elsewhere, pick your office in ⚙ Personalise.`, `勤務先が違う場合は⚙「カスタマイズ」で選んでください。`] },
'a.crowding': {
  what: [`Peak-hour crowding rate (混雑率) of the busiest section of the area's main line (MLIT, FY2025). 100% = all seats and straps taken; 150% = you can open a newspaper; 180% = only a folded newspaper or phone; 200% = bodies pressed together.`,
         `主要路線の最混雑区間のピーク時混雑率（国交省、2025年度）。100%＝座席・つり革がすべて埋まる、150%＝新聞を広げて読める、180%＝折りたたんだ新聞・スマホなら可、200%＝体が触れ合い圧迫感がある。`],
  why: [`Crowding decides whether a 40-minute ride is tolerable, and whether you can travel with a stroller.`,
        `混雑は40分の乗車に耐えられるか、ベビーカーで乗れるかを左右します。`],
  read: [`It measures the busiest section, which may not be your part of the line. Score: ≥158% −5, ≥150% −2, ≤125% +5.`,
         `最混雑区間の値なので、自分が乗る区間とは違うことがあります。スコア：158%以上−5、150%以上−2、125%以下＋5。`],
  tip: [`A station where trains start (始発駅) lets you sit even on a crowded line.`, `始発駅なら混雑路線でも座れます。`] },
'a.pass': {
  what: [`1-month commuter pass (通勤定期) from the area's main station to Tokyo / Otemachi.`, `主要駅から東京・大手町までの1か月通勤定期代です。`],
  why: [`Usually paid by the employer, but caps exist, and far-out areas cost more for weekend trips too.`,
        `通常は会社負担ですが上限がある場合もあり、遠いエリアは休日の外出費も高くなります。`],
  read: [`Score: over ¥30k −5, over ¥45k −10.`, `スコア：3万円超−5、4.5万円超−10。`] },
'a.bus': {
  what: [`Weekday highway / commuter buses to Tokyo Station: morning arrivals by 9:30 / evening departures 17:30–21:30.`,
         `東京駅行きの平日の高速・通勤バス：9:30までの朝の到着便数／17:30〜21:30の夕方の出発便数。`],
  why: [`A seat every day and a backup when trains stop. Over the Aqualine or the Wangan expressway a bus can beat the train.`,
        `毎日座れ、電車が止まった時の代替にもなります。アクアラインや湾岸線ではバスが電車より速いこともあります。`],
  read: [`Fewer than about 3 buses → backup only. 9 or more → practical for daily use. Ride times vary with traffic.`,
         `3便未満程度は予備手段、9便以上なら毎日使えます。所要時間は渋滞で変わります。`],
  tip: [`Check the operator's current timetable. Routes are being cut because of driver shortages.`, `運行会社の最新時刻表を確認してください。運転手不足で減便が続いています。`] },
'a.daycare': {
  what: [`Monthly fee for a first child aged 0–2 at a licensed nursery (認可保育所), for a dual income of about ¥10M. In Tokyo it has been free since 2025-09. * = the city's table wasn't found; the prefecture median is shown.`,
         `世帯年収約1,000万円（共働き）で認可保育所に通う第1子（0〜2歳）の月額保育料です。東京都は2025年9月から無償。＊＝自治体の表が見つからず県の中央値を表示。`],
  why: [`Ages 3–5 are free nationwide (幼保無償化), so only ages 0–2 differ. Two children at ~¥55k each is over ¥1M a year.`,
        `3〜5歳は全国で無償なので、差が出るのは0〜2歳だけです。2人で月5.5万円ずつなら年100万円を超えます。`],
  read: [`The fee depends on your 住民税所得割. Second children are often half price or free.`, `保育料は住民税の所得割で決まります。第2子は半額か無料のことが多いです。`],
  tip: [`Look up your bracket in the city's fee table using your 住民税決定通知書.`, `住民税決定通知書の所得割額で自治体の保育料表の階層を確認してください。`] },
'a.waitlist': {
  what: [`Official number of children waiting for a licensed nursery place on 1 April (待機児童; 2026, or 2025 if 2026 isn't published).`,
         `4月1日時点の待機児童数（2026年、未公表なら2025年）。`],
  why: [`Whether you get a place matters more than the fee. Without one, one parent may have to stop working.`,
        `入れるかどうかは保育料より重要です。入れなければ片方の親が仕事を続けられないこともあります。`],
  read: [`0 doesn't mean every nursery has room: the official count excludes "hidden" waiting families (e.g. those who applied only to one nursery). Popular stations and 1-year-old classes are the hardest.`,
         `0でもどの園にも空きがあるわけではありません。公式の数字は「隠れ待機児童」（特定の園だけを希望した家庭など）を除きます。人気駅の園や1歳児クラスが最も入りにくいです。`],
  tip: [`Ask the city's 保育課 for 入所保留 counts by age and district. April entry at age 0 is usually easiest.`, `市の保育課に年齢別・地区別の入所保留数を聞いてください。0歳の4月入所が通常最も入りやすいです。`] },
'a.gakudo': {
  what: [`Children waiting for a municipal after-school club place (学童, 放課後児童クラブ). "<50" = only known to be below 50 (the national list shows only 50+).`,
         `放課後児童クラブ（学童）の待機児童数。「<50」＝50人未満とだけ分かっている（国の一覧は50人以上のみ掲載）。`],
  why: [`From first grade school ends around 14:00 and nursery-style care stops: "the first-grade wall" (小1の壁).`, `小学1年生から下校が14時頃になり、保育園のような預け先がなくなります（小1の壁）。`],
  tip: [`Check the private 学童 options and fees near your candidate school.`, `候補の小学校の近くの民間学童と料金も確認してください。`] },
'a.pedsNear': {
  what: [`Share of children 0–14 living within 1 km (straight line) of a dedicated paediatric clinic. Below: dedicated clinics · all facilities offering 小児科 (国土数値情報 P04, 2020).`,
         `専門の小児科から直線1km以内に住む0〜14歳の割合。下段：小児科専門・小児科を標榜する全施設（国土数値情報 P04、2020年）。`],
  why: [`Small children see a doctor often: fevers, and about 15 vaccinations before age 2.`, `小さい子どもは発熱や、2歳までに約15回ある予防接種などで頻繁に受診します。`],
  read: [`Higher = more families can walk to a paediatrician. The data is from 2020, so clinics may have opened or closed since.`, `高いほど小児科に歩いて行ける家庭が多いということです。2020年のデータなので開院・閉院がありえます。`],
  tip: [`Check clinics near the flat itself, and the area's night and holiday clinic (休日夜間急病診療所). #8000 is the child-health phone line.`, `物件周辺の小児科と休日夜間急病診療所も確認してください。子ども医療電話相談は#8000です。`] },
'a.pedsPer10k': {
  what: [`Facilities offering 小児科 per 10,000 children in the municipality.`, `子ども1万人あたりの小児科を標榜する施設数。`],
  read: [`Higher = easier to book. It includes internal-medicine clinics that also see children.`, `高いほど予約が取りやすい目安です。子どもも診る内科を含みます。`] },
'a.medical': {
  what: [`Child medical-expense subsidy (子ども医療費助成): the age it covers up to, and the copay per visit.`, `子ども医療費助成の対象年齢と1回あたりの自己負担額。`],
  read: [`Almost every area now covers children to 18, so the difference is the copay (¥0–600 per visit). It's worth only 5 points.`, `ほぼ全域で18歳まで対象なので、差は自己負担（1回0〜600円）だけです。配点は5点です。`] },
'a.median': {
  what: [`Median asking price of used 90–105 m² condos of any age (study crawl); n = number of listings.`, `築年数を問わない90〜105㎡の中古マンションの売出価格中央値（調査時点）。n＝件数。`],
  why: [`The typical price of a family-size flat in the area.`, `エリアのファミリー向け住戸の典型的な価格です。`],
  read: [`These are asking prices. Contract prices are usually lower, and the gap is large in the 23 wards. A small n makes the median unreliable.`, `売出価格です。成約価格は通常これより低く、23区では差が大きいです。nが小さいと中央値は不安定です。`] },
'a.scorePrice': {
  what: [`The Price half of the Space score: weighted median ¥/m² of listings ≥90 m², × 100 m². Weights by build year: 2000+ = 1, 1990s = 0.6, 1983–89 = 0.3, older = 0. Below: total weight (n) · points.`, `広さスコアの「価格」部分：90㎡以上の物件の重み付き㎡単価中央値×100㎡。重みは築年で、2000年以降＝1、1990年代＝0.6、1983〜89年＝0.3、それ以前＝0。下段：重みの合計（n）・点数。`],
  why: [`Newer means better insulation, sound-proofing and a longer remaining life; 1983+ guarantees the new seismic code. A 1990s flat is a real option, so it counts, but less than a 2000s one.`, `新しいほど断熱・遮音・残りの寿命の点で有利で、1983年以降築なら新耐震基準です。1990年代の物件も現実的な選択肢なので数えますが、2000年代より軽く扱います。`],
  read: [`Log scale: ¥30M = 100 pts … ¥150M = 0. Fewer than 3 listings is flagged as a thin sample.`, `対数目盛り：3,000万円＝100点…1億5,000万円＝0点。3件未満はサンプル不足として表示されます。`] },
'a.pool': {
  what: [`The Choice half of the Space score: listings ≥90 m² under ¥80M (or your budget), age-weighted (2000+ = 1, 1990s = 0.6, 1983–89 = 0.3, older = 0). Below: points (60+ listings = 100), and the date when the live budget count is used.`,
         `広さスコアの「選択肢」部分：90㎡以上・8,000万円（または予算）未満の件数（築年で重み付け：2000年以降＝1、1990年代＝0.6、1983〜89年＝0.3、それ以前＝0）。下段：点数（60件以上＝100）と、予算設定時は件数の日付。`],
  why: [`It tells you how many realistic options you'd have today, and so how much choice and bargaining power.`, `今日現実に選べる物件数、つまり選択の幅と交渉力を示します。`],
  read: [`Smoothed over 30 days of SUUMO data. One building with several units can inflate it.`, `SUUMOデータの30日中央値です。1棟で複数戸が出ていると件数が膨らむことがあります。`] },
'a.poolAll': {
  what: [`90 m²+ listings under ¥80M of any age, including buildings before 2000 (and some before 1982, old seismic code).`, `築年数を問わない90㎡以上・8,000万円未満の件数。2000年以前（一部は1982年以前の旧耐震）を含みます。`],
  read: [`A big gap from the scored count means much of the cheap stock is old. Pre-1983 flats count 0 in the score: lower price, but higher repair costs and loan/tax-credit limits for the old seismic code.`, `新しめの件数との差が大きいと、安い物件の多くが古いということです。価格は安くても修繕費が高く、1982年以前築はローン控除などに制限があります。`] },
'a.share': {
  what: [`Share of all used-condo listings in the area that are 90 m² or larger.`, `エリアの中古マンション掲載のうち90㎡以上の割合。`],
  read: [`Shows whether large flats are normal here or rare. It is information only and isn't scored any more.`, `広い住戸が一般的か珍しいかを示します。参考値で、現在はスコアに含みません。`] },
'a.liveN': {
  what: [`Today's SUUMO count, de-duplicated: 90 m²+ under ¥80M / all 90 m²+ listings, with the date.`, `今日のSUUMO掲載数（重複除去）：90㎡以上・8,000万円未満／90㎡以上の全件と日付。`],
  read: [`Not scored; it moves day to day. Use it to see whether the market is busy right now.`, `スコアには含まれず、日々変わります。今の市場の動きを見るのに使ってください。`] },
'a.liveMedian': {
  what: [`Today's median asking price of 90–105 m² listings on SUUMO (n = listings).`, `今日のSUUMOの90〜105㎡の売出価格中央値（n＝件数）。`],
  read: [`Compare it with the study median above to see the price direction. With small n it jumps around.`, `上の調査時点の中央値と比べると価格の方向が分かります。nが小さいと大きく変動します。`] },
'a.projects': {
  what: [`New-condo projects (新築分譲) on sale on SUUMO now, with up to three names.`, `現在SUUMOで販売中の新築マンションのプロジェクト数（最大3件の名前）。`],
  why: [`New supply gives more options and shows developers' confidence in the area.`, `新規供給は選択肢を増やし、デベロッパーがそのエリアに期待していることを示します。`],
  read: [`Not coloured: more isn't always better. New flats usually cost noticeably more than recent used ones.`, `多ければ良いとは限らないので色分けしていません。新築は通常、築浅の中古よりかなり高いです。`] },
'a.fees': {
  what: [`Median monthly 管理費 + 修繕積立金 of watchlist condos ≥90 m² built 2000+, and per m². * = any age (no modern listing). Only watchlist areas have it.`, `ウォッチリストの90㎡以上・2000年以降築マンションの管理費＋修繕積立金の月額中央値と㎡単価。＊＝築年問わず（新しめの物件がない場合）。ウォッチリストのエリアのみ。`],
  why: [`Fees are paid for as long as you own the flat and usually rise. ¥40k/month is ¥480k a year.`, `管理費等は所有している間ずっと払い、通常は上がっていきます。月4万円なら年48万円です。`],
  read: [`A low repair fund now often means steep increases later. MLIT's guideline average is about ¥250–340/m² per month.`, `今の修繕積立金が安いと後で大きく上がることが多いです。国交省ガイドラインの平均は月約250〜340円/㎡です。`] },
'a.land': {
  what: [`Average official residential land price (公示地価) in ¥/m², and its change over 5 years.`, `住宅地の公示地価の平均（円/㎡）と5年間の変化率。`],
  why: [`The trend shows demand for the area and supports future resale value.`, `推移はエリアの需要を示し、将来の売却価格を支えます。`],
  read: [`Not coloured: high land is a cost now but signals value. The trend counts in Growth.`, `高い地価は今のコストですが価値の裏付けでもあるため色分けしていません。推移は成長性スコアに入ります。`] },
'a.water': {
  what: [`Share of residents (2020 census mesh) living inside the maximum-scenario flood, storm-surge or tsunami zones (ハザードマップポータル).`, `想定最大規模の洪水・高潮・津波の浸水想定区域に住む人の割合（2020年国勢調査メッシュ、ハザードマップポータル）。`],
  why: [`It affects evacuation, flood insurance (水災補償) and whether the building is cut off in a flood.`, `避難、火災保険の水災補償、浸水時に建物が孤立するかどうかに関わります。`],
  read: [`The maximum scenario is a roughly 1,000-year event. In a condo on the 3rd floor or higher, the risk is losing power, elevators, water and car parks for days rather than a flooded flat.`, `想定最大規模はおおむね1,000年に1度の規模です。3階以上のマンションでは住戸の浸水より、停電・エレベーター停止・断水・駐車場の浸水が数日続くリスクになります。`],
  tip: [`Check the exact address in Deep look, and where the building's electrical room is (a basement is a risk).`, `Deep lookで住所ごとに確認し、建物の電気室の位置（地下はリスク）も確認してください。`] },
'a.deep': {
  what: [`Share of residents in zones where the maximum-scenario water depth is 3 m or more (the second floor is under water).`, `想定最大の浸水深が3m以上（2階が浸水）の区域に住む人の割合。`],
  why: [`Deep zones also stay flooded longer, sometimes for weeks (浸水継続時間).`, `深い区域は浸水が長く続くこともあり、数週間に及ぶ場合があります（浸水継続時間）。`] },
'a.liq': {
  what: [`Share of residents on landforms with a high or somewhat high liquefaction tendency: reclaimed land, former rivers and marshes, fill (国土地理院 地形分類).`, `液状化しやすい（高い・やや高い）地形に住む人の割合。埋立地・旧河道・旧湿地・盛土など（国土地理院 地形分類）。`],
  why: [`In 2011, condos on piles in Urayasu stood, but roads, water and sewage pipes broke and some services were down for weeks.`, `2011年の浦安では杭基礎のマンションは無事でしたが、道路・上下水道が壊れ、数週間使えない設備もありました。`],
  read: [`It rates the ground type, not a quake scenario. Big condos are usually piled into firm ground; houses are more exposed.`, `地盤の種類の評価で、地震の想定ではありません。大きなマンションは通常、支持層まで杭を打っています。戸建てはより影響を受けます。`],
  tip: [`Ask whether the building is piled to the bearing layer (支持層までの杭基礎), and check the city's liquefaction map.`, `支持層までの杭基礎かどうかを確認し、市の液状化マップも見てください。`] },
'a.slide': {
  what: [`Share of residents inside landslide warning zones (土砂災害警戒区域, yellow) or special warning zones (特別警戒区域, red).`, `土砂災害警戒区域（イエロー）・特別警戒区域（レッド）に住む人の割合。`],
  read: [`Usually small. It matters only if your building is on or below a slope.`, `通常は小さい値です。建物が斜面の上や下にある場合にだけ重要です。`] },
'a.quake': {
  what: [`Probability of shaking of 震度6弱 or stronger within 30 years at the area's most populated spots (J-SHIS 2024).`, `エリアの人口の多い地点で、30年以内に震度6弱以上の揺れに見舞われる確率（J-SHIS 2024）。`],
  read: [`High almost everywhere in Kanto (60–85%); differences mostly reflect soft ground. The building matters more than the area: new seismic code, good management, piles.`, `関東ではほぼ全域で高く（60〜85%）、差は主に地盤の柔らかさです。エリアより建物（新耐震・管理状態・杭）の方が重要です。`] },
'a.noise': {
  what: [`Aircraft noise flags: Haneda approach and departure routes (including the 2020 routes over central Tokyo) and military airfields. ✈ = noticeable, ✈✈ = a real concern.`, `航空機騒音の目印：羽田の到着・出発ルート（2020年からの都心ルートを含む）と自衛隊・米軍の飛行場。✈＝気になる程度、✈✈＝要注意。`],
  read: [`No measured noise levels (Lden) per area are available as open data, so these are flags from route maps.`, `エリアごとの騒音レベル（Lden）はオープンデータがないため、ルート図からの目印です。`],
  tip: [`Visit when the routes are in use. Haneda's south-wind arrivals over central Tokyo run about 15:00–19:00.`, `ルートの運用時間に現地を訪れてください。羽田の南風時の都心上空の到着便は15時〜19時頃です。`] },
'a.burg': {
  what: [`Home break-ins (空き巣 + 忍込み) per 10,000 residents, 2025 police counts. Below: number of cases.`, `住宅への侵入窃盗（空き巣＋忍込み）の人口1万人あたり件数（2025年、警察）。下段：件数。`],
  why: [`It's the crime that most directly affects a home.`, `住まいに最も直接関わる犯罪です。`],
  read: [`It includes houses. A condo with auto-lock, cameras and higher floors carries much lower risk.`, `戸建てを含みます。オートロック・防犯カメラ・上層階のマンションはリスクがずっと低いです。`] },
'a.viol': {
  what: [`Violent crime (凶悪犯 + 粗暴犯: robbery, assault, intimidation…) per 10,000 residents, 2025. Saitama doesn't publish it per city.`, `凶悪犯＋粗暴犯（強盗・暴行・脅迫など）の人口1万人あたり件数（2025年）。埼玉県は市町村別を公表していません。`],
  read: [`It clusters around nightlife and big stations; residential districts of the same ward are usually much calmer.`, `繁華街や大きな駅の周辺に集中します。同じ区でも住宅地はたいていずっと静かです。`] },
'a.crimeAll': {
  what: [`All recorded crime (刑法犯) per 1,000 residents, 2025.`, `刑法犯の認知件数（人口1,000人あたり、2025年）。`],
  read: [`Mostly theft (bicycles, shoplifting). Shopping and office hubs look bad because crimes involving visitors are divided by residents.`, `大半は自転車盗・万引きなどの窃盗です。商業・オフィス街は来訪者の事件を居住人口で割るため高く出ます。`] },
'a.pop': {
  what: [`Population change between the 2020 and 2025 censuses.`, `2020年と2025年の国勢調査の人口増減率。`],
  why: [`Growing areas get new schools, shops and services; shrinking ones lose them over time.`, `人口が増えるエリアには学校・店・サービスが増え、減るエリアでは時間とともに失われます。`] },
'a.ipss': {
  what: [`Official projection of population change from 2020 to 2050 (国立社会保障・人口問題研究所, 2023).`, `2020年から2050年の人口増減の公式推計（社人研、令和5年推計）。`],
  why: [`It's the long view: the market you'll sell into in 20–25 years.`, `20〜25年後に売る時の市場を示す長期の見通しです。`] },
'a.kids': {
  what: [`Share of residents aged 0–14 (2020 census).`, `0〜14歳の人口の割合（2020年国勢調査）。`],
  read: [`Many families mean playmates, parks and child services, but also more competition for nursery places.`, `子育て世帯が多いと遊び相手・公園・子育てサービスが充実しますが、保育園の競争も激しくなります。`] },
'a.costco': {
  what: [`Estimated drive time to the nearest Costco (straight line × 1.35 at 18–30 km/h, not a routed time), and its name.`, `最寄りのコストコまでの推定運転時間（直線距離×1.35、時速18〜30km、ルート検索ではありません）と店舗名。`] },

/* ══════════════ LISTINGS COMPARISON ══════════════ */
'l.district': {
  what: [`Which municipality and district the listing is in.`, `物件がある市区町村・地区。`],
  tip: [`Open the Area map to see that area's commute, childcare and hazard data.`, `エリアマップでそのエリアの通勤・子育て・災害データを確認できます。`] },
'l.price': {
  what: [`Current asking price.`, `現在の売出価格。`],
  read: [`Used homes are often sold a few percent below asking, more if the listing is old or has been cut already.`, `中古は売出価格から数%下がって成約することが多く、掲載期間が長い物件や値下げ済みの物件ではさらに下がることがあります。`] },
'l.ppm': {
  what: [`Price per m² of floor area (万円/m²). "~" = approximate, from a price range.`, `専有面積1㎡あたりの価格（万円/㎡）。「~」は価格帯から計算した概算。`],
  why: [`It lets you compare value between flats of different sizes.`, `広さの違う物件の割安・割高を比べられます。`],
  read: [`Compare it within the same area and similar ages; station distance and age move it a lot.`, `同じエリア・同じくらいの築年数で比べてください。駅距離や築年数で大きく変わります。`] },
'l.vsSimilar': {
  what: [`How the asking ¥/m² compares with what a statistical model expects for this flat, given its area or station, age, walk time, floor, tower or not, renovation and elevator, fitted on all tracked condos.`, `追跡中の全マンションから作った統計モデルで、エリア・駅・築年数・徒歩分・階数・タワーかどうか・リフォーム・エレベーターを考慮した「予想㎡単価」と比べた割安・割高。`],
  why: [`It spots bargains and overpriced listings that raw ¥/m² hides.`, `単純な㎡単価では見えない割安物件・割高物件を見つけられます。`],
  read: [`Negative = cheaper than expected. A cheap flat can have reasons the model can't see: view, condition, high fees, leasehold, a noisy road.`, `マイナス＝予想より安い。ただし眺望・状態・高い管理費・借地権・騒音など、モデルに見えない理由で安いこともあります。`],
  tip: [`Request a Deep look before visiting a flat that looks unusually cheap.`, `特に安く見える物件は、見学前にDeep lookで確認してください。`] },
'l.monthly': {
  what: [`All-in monthly cost: loan payment (by default 10% down, 35 years, the current variable rate from the Loan tab) + 管理費 + 修繕積立金 + property tax estimate (0.25% of the price per year ÷ 12).`, `月々の総額：ローン返済（標準は頭金10%・35年・ローンタブの現在の変動金利）＋管理費＋修繕積立金＋固定資産税等の見積（価格の年0.25%÷12）。`],
  why: [`A cheaper flat with high fees can cost more per month than a dearer one with low fees.`, `安くても管理費が高い物件は、高くて管理費の安い物件より毎月の負担が大きいことがあります。`],
  tip: [`Set your own down payment and rate in the Loan tab; every all-in figure updates.`, `ローンタブで頭金と金利を設定すると、すべての総額が更新されます。`] },
'l.priceChange': {
  what: [`Change in asking price since the tracker first saw the listing.`, `追跡開始時からの売出価格の変化。`],
  read: [`A cut shows a seller who is willing to move; a second cut often follows if it still doesn't sell.`, `値下げは売主が柔軟であることを示します。それでも売れなければ再値下げが続くことが多いです。`] },
'l.area': {
  what: [`Floor area (専有面積), measured to the wall centres (壁芯), with the tsubo equivalent.`, `専有面積（壁芯面積）と坪数。`],
  read: [`The registered area (内法) is about 6% smaller. For condos it must be at least 50 m² for the home-loan tax credit.`, `登記簿の面積（内法）は約6%小さくなります。マンションの住宅ローン控除には登記面積50㎡以上が必要です。`] },
'l.new.area': {
  what: [`Range of unit sizes in the project (smallest–largest type).`, `プロジェクトの住戸の広さの範囲（最小〜最大タイプ）。`],
  read: [`Coloured by the largest type. Check that a 90 m²+ plan is actually still available in the current phase.`, `最大タイプで色分けしています。90㎡以上のプランが今期の販売に本当に含まれているか確認してください。`] },
'l.land': {
  what: [`Land area (土地面積) with the tsubo equivalent.`, `土地面積と坪数。`],
  why: [`It decides parking, garden space and what you could rebuild later (建ぺい率 / 容積率 limits).`, `駐車場や庭、将来の建て替えの大きさ（建ぺい率・容積率）を左右します。`] },
'l.balcony': {
  what: [`Balcony area. It's not included in the floor area and is legally a common area you have exclusive use of.`, `バルコニー面積。専有面積には含まれず、法的には専用使用権のある共用部分です。`],
  read: [`Useful for laundry and plants. In a fire it is also the evacuation route, so you can't block it.`, `洗濯や植物に便利です。火災時の避難経路でもあるので、物を置いてふさぐことはできません。`] },
'l.layout': {
  what: [`Layout, e.g. 3LDK = three rooms plus a living-dining-kitchen. S = storage room (納戸) without a legal window.`, `間取り（例：3LDK＝3部屋＋リビング・ダイニング・キッチン）。S＝採光が基準に満たない納戸。`],
  read: [`For two children, 3LDK or more is typical. Coloured by the number of rooms.`, `子ども2人なら3LDK以上が一般的です。部屋数で色分けしています。`] },
'l.built': {
  what: [`Year of completion and age.`, `竣工年と築年数。`],
  why: [`Age drives repair needs, insulation, seismic standard and loan conditions.`, `築年数は修繕の必要性・断熱性能・耐震基準・ローン条件に影響します。`],
  read: [`Before 1982 = old seismic code (no home-loan tax credit without a certificate). Buildings from 2000 on also have better sound and heat insulation.`, `1982年より前は旧耐震（証明書がなければ住宅ローン控除なし）。2000年以降は遮音・断熱性能もさらに良くなっています。`] },
'l.age': {
  what: [`Age of the house.`, `建物の築年数。`],
  read: [`Wooden houses lose most of their book value in about 20–25 years (tax life 22 years), so you are mostly paying for the land after that.`, `木造住宅は約20〜25年（法定耐用年数22年）で建物の評価がほぼなくなり、その後は主に土地の価格です。`] },
'l.seismic': {
  what: [`Seismic code: 新耐震 (building permit from June 1981 onward; the site uses built ≥1982) or 旧耐震 (older).`, `耐震基準：新耐震（1981年6月以降の建築確認、当サイトでは1982年以降築で判定）か旧耐震か。`],
  why: [`Old-code buildings suffered most in the 1995 Kobe earthquake. It also decides the home-loan tax credit and some loans.`, `1995年の阪神・淡路大震災で被害が大きかったのは旧耐震の建物です。住宅ローン控除や一部のローンの可否も決まります。`],
  tip: [`For buildings finished 1981–1983, check the permit date (建築確認日), not the completion year.`, `1981〜1983年竣工の物件は、竣工年ではなく建築確認日を確認してください。`] },
'l.reno': {
  what: [`Whether the flat is listed as renovated (リフォーム / リノベーション). For condos, renovation counts only if the building is at least 10 years old.`, `リフォーム・リノベーション済みかどうか。マンションでは築10年以上の場合のみ評価します。`],
  read: [`It can mean anything from new wallpaper to new pipes and kitchen.`, `壁紙の張り替えだけのことも、配管やキッチンまで新しくしたこともあります。`],
  tip: [`Ask what was done and when, and whether the water pipes (給排水管) were replaced.`, `いつ何をしたか、給排水管を交換したかを聞いてください。`] },
'l.structure': {
  what: [`Building structure: RC / SRC (reinforced concrete) for condos; wood, steel or RC for houses.`, `建物の構造：マンションはRC・SRC（鉄筋コンクリート）、戸建ては木造・鉄骨・RC。`],
  read: [`RC is more fire-resistant and quieter. For houses the score ranks RC > steel > wood.`, `RCは耐火性・遮音性が高いです。戸建てのスコアはRC＞鉄骨＞木造の順です。`] },
'l.house.structure': {
  what: [`Structure and number of storeys.`, `構造と階数。`],
  read: [`Score: RC 8 · steel 6 · wood 4 points (in Condition). Wood is normal for houses and cheaper to build and repair.`, `スコア（状態）：RC 8・鉄骨6・木造4点。戸建ては木造が一般的で、建築・修繕費も安めです。`] },
'l.floor': {
  what: [`Which floor the flat is on.`, `住戸の階数。`],
  why: [`Higher floors get more light and a better view, less street noise and insects, and stay dry in floods.`, `上の階ほど日当たり・眺望が良く、騒音や虫が少なく、浸水の心配もありません。`],
  read: [`They cost more and depend on the elevator after a quake. Points in Extras: ≥10F 3, ≥4F 2, ≥2F 1.`, `価格は高く、地震後はエレベーター頼みになります。設備ポイント：10階以上3、4階以上2、2階以上1。`] },
'l.bldgFloors': {
  what: [`Total storeys of the building.`, `建物の階数。`],
  read: [`Towers (20F+) offer views and shared facilities, but repair costs are higher and you rely on elevators.`, `タワー（20階以上）は眺望や共用施設がありますが、修繕費が高く、エレベーターへの依存も大きくなります。`] },
'l.units': {
  what: [`Total number of homes in the building.`, `建物の総戸数。`],
  read: [`More units spread the fixed costs (lower fees per home, a manager on site). Very large buildings make it harder for owners to agree on repairs. 50+ units = +1 in Extras.`, `戸数が多いと固定費が分散され（1戸あたりの管理費が安く、管理人が常駐）、多すぎると修繕の合意形成が難しくなります。50戸以上で設備＋1。`] },
'l.facing': {
  what: [`Direction the main balcony faces.`, `主なバルコニーの向き。`],
  read: [`South-facing gets the most winter sun and costs a little more in Japan. +2 in Extras.`, `南向きは冬の日当たりが最も良く、日本では少し高めです。設備＋2。`] },
'l.fees': {
  what: [`管理費 + 修繕積立金 per month.`, `管理費＋修繕積立金の月額。`],
  why: [`You pay them as long as you own the flat, on top of the loan.`, `所有している間、ローンとは別にずっと払います。`] },
'l.mgmt': {
  what: [`Management fee (管理費): pays the management company, cleaning, common-area electricity and insurance. It's spent, not saved.`, `管理費：管理会社・清掃・共用部の電気代・保険などに使われ、積み立てではありません。`],
  read: [`It rises with labour costs. Very low fees in a large building can mean minimal service.`, `人件費とともに上がります。大きな建物で極端に安い場合は、サービスが最小限の可能性があります。`] },
'l.new.mgmt': {
  what: [`Management fee (管理費) range across unit types.`, `住戸タイプごとの管理費の範囲。`] },
'l.repair': {
  what: [`Repair fund (修繕積立金): saved by all owners for major repairs (大規模修繕, about every 12–15 years: exterior, waterproofing, pipes, elevators).`, `修繕積立金：大規模修繕（約12〜15年ごとの外壁・防水・配管・エレベーターなど）のために全所有者で積み立てるお金。`],
  why: [`If it's too low, expect sharp increases or a one-off levy (一時金) of hundreds of thousands of yen.`, `安すぎると、大幅な値上げや数十万円の一時金が見込まれます。`] },
'l.new.repair': {
  what: [`Starting repair fund (修繕積立金) range. New buildings start low and step up several times (段階増額).`, `当初の修繕積立金の範囲。新築は低く始まり、何度か段階的に上がります（段階増額）。`] },
'l.feesM2': {
  what: [`Monthly fees divided by floor area.`, `月額の管理費等を専有面積で割った値。`],
  read: [`Compares fees fairly between sizes. In the Fees score the cheapest tracked condo gets 15 and the most expensive 0.`, `広さが違っても公平に比べられます。管理費スコアは追跡中で最も安い物件が15点、最も高い物件が0点です。`] },
'l.repairM2': {
  what: [`Repair fund divided by floor area, per month.`, `修繕積立金を専有面積で割った月額。`],
  read: [`MLIT's guideline average is about ¥250–340/m² (depending on building size). Below ¥170 is tagged as low: increases are likely.`, `国交省ガイドラインの平均は建物規模により約250〜340円/㎡です。170円未満は「低い」と表示し、値上げの可能性が高いです。`],
  tip: [`Ask for the long-term repair plan (長期修繕計画) and when the next increase is due.`, `長期修繕計画と次の値上げ時期を確認してください。`] },
'l.station': {
  what: [`Nearest station and line, as stated in the listing.`, `掲載されている最寄り駅と路線。`],
  tip: [`Check the commute from that station on the Area map or in Deep look.`, `その駅からの通勤はエリアマップかDeep lookで確認してください。`] },
'l.walk': {
  what: [`Walk time to the station as listed (industry rule: 80 m per minute, straight along roads).`, `掲載の駅徒歩分（業界ルール：道路距離80m＝1分）。`],
  read: [`The real walk is often longer (signals, crossings, stairs). Access score: ≤5 min 20 · ≤10 16 · ≤15 12 · ≤20 8 · ≤30 4.`, `実際は信号・横断・階段で長くなりがちです。交通スコア：5分以内20・10分以内16・15分以内12・20分以内8・30分以内4。`] },
'l.bus': {
  what: [`Whether the listing needs a bus to reach the station.`, `駅までバスが必要かどうか。`],
  read: [`A bus adds waiting time and makes the commute less reliable, and bus-access flats resell for less.`, `バスは待ち時間が増え、通勤が不安定になります。売却時の価格も低めです。`] },
'l.address': {
  what: [`Address, usually only to the 丁目 (block) level.`, `住所（通常は丁目まで）。`],
  tip: [`Hazard checks use the 丁目 centre; ask the agent for the exact building to check it precisely.`, `災害リスクは丁目の中心で判定しています。正確な建物を不動産会社に聞いて確認してください。`] },
'l.liq': {
  what: [`Liquefaction risk around the address: the City of Chiba hazard map (50 m mesh, M7.3 quake under the city) or GSI landform data elsewhere. The level shown is the most common one around the address.`, `住所周辺の液状化危険度：千葉市地震ハザードマップ（50mメッシュ、千葉市直下M7.3）、それ以外は国土地理院の地形分類。周辺で最も多いレベルを表示。`],
  why: [`Liquefaction tilts houses and breaks roads and pipes. Condos on piles usually stand, but the surroundings can be damaged.`, `液状化は戸建てを傾け、道路や配管を壊します。杭基礎のマンションは通常無事ですが、周辺が被害を受けます。`],
  read: [`Penalty: condos high −2 / mid −1 in Extras; houses high −4 / mid −2.`, `減点：マンションは設備で高−2・やや高−1、戸建ては高−4・やや高−2。`] },
'l.elev': {
  what: [`Whether the building has an elevator.`, `エレベーターの有無。`],
  read: [`Essential with a stroller. Low-rise buildings (up to 5 floors) sometimes have none. +2 in Extras.`, `ベビーカーでは必須です。5階以下の建物にはないこともあります。設備＋2。`] },
'l.pet': {
  what: [`Whether the building rules (管理規約) allow pets.`, `管理規約でペットが飼えるかどうか。`],
  read: [`Even if you have no pet now, it affects who can buy from you later. +1 in Extras.`, `今飼っていなくても、将来の買い手の幅に影響します。設備＋1。`] },
'l.parking': {
  what: [`Parking: on-site, on-site but full (waitlist), in the building, nearby, or none.`, `駐車場：敷地内・敷地内（空き待ち）・建物内・近隣・なし。`],
  read: [`"Full" means you may wait months or years for a space. Houses: 0 / 1 / 2+ cars = 0 / 5 / 8 points.`, `「空き待ち」は数か月〜数年待つことがあります。戸建て：0台・1台・2台以上＝0・5・8点。`] },
'l.parkingFee': {
  what: [`Monthly parking fee (cheapest space).`, `駐車場の月額（最安の区画）。`],
  read: [`Mechanical (機械式) spaces are cheaper to rent but cost the building a lot to maintain.`, `機械式は賃料が安めですが、建物側の維持費が高くつきます。`] },
'l.rights': {
  what: [`Land rights: 所有権 = you own a share of the land; 借地権 (leasehold) = you rent the land for a fixed term.`, `土地の権利：所有権＝土地の持分を所有、借地権＝期間を決めて土地を借りる。`],
  why: [`Leasehold is cheaper but you pay ground rent, loans are harder, and resale value falls as the term runs out.`, `借地権は安い代わりに地代がかかり、ローンが組みにくく、期間が減るほど売却価格も下がります。`],
  read: [`Leasehold = −3 points.`, `借地権は−3点。`] },
'l.gas': {
  what: [`City gas (都市ガス) or propane (LP gas).`, `都市ガスかプロパンガス（LPガス）か。`],
  read: [`Propane often costs 1.5–2× more for the same use. +2 points for city gas.`, `プロパンは同じ使用量で1.5〜2倍高いことが多いです。都市ガスは＋2点。`] },
'l.listed': {
  what: [`Days since the tracker first saw the listing. "Not tracked" = it was already on sale when tracking started.`, `追跡開始から何日掲載されているか。「追跡外」＝追跡開始時にすでに販売中だった物件。`],
  read: [`Long-listed homes usually leave more room to negotiate.`, `掲載期間が長い物件ほど、値段交渉の余地があることが多いです。`] },
'l.agents': {
  what: [`How many agents list this same unit (merged into one row).`, `同じ住戸を掲載している不動産会社の数（1行にまとめています）。`],
  read: [`Several agents means the seller allows any agent to sell (一般媒介), and you can pick the agent you prefer.`, `複数の会社が掲載している場合は一般媒介で、好きな会社を選べます。`] },
'l.sameBldg': {
  what: [`Other units for sale in the same building.`, `同じ建物で売りに出ている他の住戸数。`],
  read: [`Useful for price comparison. Many at once can just mean a big building, or owners leaving: ask why.`, `価格の比較に使えます。同時に多いのは大きな建物なだけのことも、住民が離れていることもあるので理由を聞いてください。`] },
'l.total': {
  what: [`Sum of the category scores, out of 100.`, `カテゴリースコアの合計（100点満点）。`],
  read: [`Some parts are ranked against all tracked listings (value, fees, space), so scores shift a little as listings come and go.`, `一部（割安度・管理費・広さ）は追跡中の全物件との比較なので、物件の増減で少し変わります。`] },
/* listing score categories, per kind */
'l.house.cat.value': {
  what: [`Value 25: ¥/m² ranked between the cheapest (25) and the most expensive (0) tracked house.`, `割安度25：追跡中の戸建ての㎡単価で、最安＝25点〜最高＝0点。`] },
'l.house.cat.access': {
  what: [`Access 20: walk to the station. ≤5 min 20 · ≤10 16 · ≤15 12 · ≤20 8 · ≤30 4.`, `交通20：駅徒歩。5分以内20・10分以内16・15分以内12・20分以内8・30分以内4。`] },
'l.house.cat.condition': {
  what: [`Condition 20: age (≤5 years 12 · ≤10 9 · ≤20 6 · ≤30 3 · older 1) + structure (RC 8 · steel 6 · wood 4) + renovated 3.`, `状態20：築年数（5年以内12・10年以内9・20年以内6・30年以内3・それ以上1）＋構造（RC 8・鉄骨6・木造4）＋リフォーム3。`] },
'l.house.cat.space': {
  what: [`Space 20: floor area ranked between the smallest (0) and the largest (20) tracked house.`, `広さ20：追跡中の戸建ての延床面積で、最小＝0点〜最大＝20点。`] },
'l.house.cat.extras': {
  what: [`Extras 15: parking (1 car 5, 2+ cars 8) + owned land 5 + city gas 2, minus liquefaction (high 4, somewhat high 2).`, `設備15：駐車（1台5・2台以上8）＋所有権5＋都市ガス2、液状化で減点（高4・やや高2）。`] },
'l.ms.cat.value': {
  what: [`Value 25: based on "vs similar condos": the tracked condo that is cheapest relative to the model gets 25, the most overpriced 0.`, `割安度25：「類似物件比」に基づき、モデル比で最も割安な物件が25点、最も割高な物件が0点。`] },
'l.ms.cat.access': {
  what: [`Access 20: walk to the station. ≤5 min 20 · ≤10 16 · ≤15 12 · ≤20 8 · ≤30 4.`, `交通20：駅徒歩。5分以内20・10分以内16・15分以内12・20分以内8・30分以内4。`] },
'l.ms.cat.condition': {
  what: [`Condition 20: age on the new seismic code (≤5 years 16 · ≤10 14 · ≤15 12 · ≤20 10 · ≤30 7 · older 4); old seismic code 0; +4 if renovated (age ≥10).`, `状態20：新耐震の築年数（5年以内16・10年以内14・15年以内12・20年以内10・30年以内7・それ以上4）、旧耐震は0、リフォーム済み（築10年以上）＋4。`] },
'l.ms.cat.running': {
  what: [`Fees 15: fees per m² ranked among tracked condos (cheapest 15, most expensive 0; unknown 7).`, `管理費等15：追跡中のマンションの㎡あたり管理費等で、最安15点〜最高0点（不明は7点）。`],
  read: [`Cheap fees score well, but a very low repair fund is a warning sign: check "Repair fund per m²".`, `安いほど高得点ですが、修繕積立金が極端に低いのは要注意です。「修繕積立金/㎡」を確認してください。`] },
'l.ms.cat.space': {
  what: [`Space 10: floor area ranked among tracked condos (largest 10).`, `広さ10：追跡中のマンションの専有面積の順位（最大10点）。`] },
'l.ms.cat.extras': {
  what: [`Extras 10: floor (≥10F 3, ≥4F 2, ≥2F 1) · south-facing 2 · elevator 2 · parking 1 · pets 1 · 50+ units 1; leasehold −3; liquefaction high −2, somewhat high −1.`, `設備10：階数（10階以上3・4階以上2・2階以上1）・南向き2・エレベーター2・駐車場1・ペット可1・50戸以上1。借地権−3、液状化（高−2・やや高−1）。`] },
'l.new.cat.value': {
  what: [`Value 25: new-build premium vs recent used condos (≤15 years) near the same station. 0% → 20, +10% → 15, +20% → 11, +43% → 0, −10% → 25. Unknown → 12.`, `割安度25：同じ駅周辺の築15年以内の中古との新築プレミアム。0%→20、＋10%→15、＋20%→11、＋43%→0、−10%→25。不明→12。`] },
'l.new.cat.access': {
  what: [`Access 20: walk to the station, same scale as used condos.`, `交通20：駅徒歩（中古と同じ基準）。`] },
'l.new.cat.certainty': {
  what: [`Certainty 15: prices announced (all 6 / some 3 / none 0) + fees announced 3 + move-in (now 6, ≤6 months 5, ≤12 4, ≤18 3, ≤24 2, later 1).`, `確実性15：価格公表（全6・一部3・なし0）＋管理費等公表3＋入居時期（即6・6か月以内5・12か月以内4・18か月以内3・24か月以内2・それ以降1）。`],
  why: [`With a new project you buy from plans. The less that's fixed, the more can still change.`, `新築は図面で買います。決まっていないことが多いほど、まだ変わる可能性があります。`] },
'l.new.cat.running': {
  what: [`Fees 15: fees per m², counting the repair fund at no less than ¥250/m². ≤¥300/m² → 15, ≥¥600/m² → 0. Unknown → 7.`, `管理費等15：㎡あたり管理費等（修繕積立金は最低250円/㎡として計算）。300円/㎡以下→15、600円/㎡以上→0。不明→7。`] },
'l.new.cat.space': {
  what: [`Space 10: largest unit type, 50 m² → 0 … 100 m² → 10.`, `広さ10：最大住戸タイプ、50㎡→0…100㎡→10。`] },
'l.new.cat.project': {
  what: [`Project 15: Major-7 developer +3 · 300+ units +2 / 100+ +1 · parking for ≥50% of units +2 / ≥30% +1 · seismic isolation +2 · ZEH / energy label +2 · tower +1 · leasehold −3 · liquefaction −2 / −1.`, `プロジェクト15：メジャー7＋3・300戸以上＋2／100戸以上＋1・駐車場設置率50%以上＋2／30%以上＋1・免震＋2・ZEH等＋2・タワー＋1・借地権−3・液状化−2／−1。`] },
/* new-condo rows */
'l.nwPriceFrom': {
  what: [`Cheapest announced unit price across the sales phases.`, `販売期をまたいだ公表済みの最低価格。`],
  read: [`It's usually a small, low-floor unit. Look at the type you'd actually buy.`, `通常は狭い低層階の住戸です。実際に買うタイプの価格を見てください。`] },
'l.nwPriceTo': {
  what: [`Most expensive announced unit price.`, `公表済みの最高価格。`] },
'l.nwBandRow': {
  what: [`Most common price band (最多価格帯) published by the developer.`, `デベロッパーが公表している最多価格帯。`] },
'l.nwPremiumRow': {
  what: [`How much more the project's median ¥/m² is than used condos ≤15 years old near the same station (5+ samples, else the whole area).`, `プロジェクトの㎡単価中央値が、同じ駅周辺（5件未満ならエリア全体）の築15年以内の中古よりどれだけ高いか。`],
  why: [`Some premium is normal (latest specs, no wear, no agent fee), but a large one means you lose money as soon as it becomes "used".`, `ある程度のプレミアムは普通です（最新設備・新品・仲介手数料なし）が、大きいと「中古」になった途端に価値が下がります。`],
  read: [`0% = priced like a recent used flat. Over about +30% is expensive for the area.`, `0%＝築浅中古と同水準。＋30%程度を超えるとエリアとしては高めです。`] },
'l.nwStatus': {
  what: [`Whether prices are set for all unit types, some, or none yet (価格未定).`, `価格がすべてのタイプで決定・一部決定・未定のどれか。`] },
'l.nwMoveIn': {
  what: [`Months until you can move in (引渡し).`, `入居（引渡し）までの月数。`],
  read: [`A long wait means paying rent meanwhile, and the loan rate is the one at handover, not today's.`, `待ち期間が長いとその間の家賃がかかり、ローン金利は今ではなく引渡し時の金利です。`] },
'l.nwCompletion': {
  what: [`Completion date (竣工) of the building.`, `建物の竣工時期。`],
  read: [`Completed buildings let you see the actual flat, view and light before buying.`, `完成済みなら、実物の住戸・眺望・日当たりを見てから買えます。`] },
'l.nwScheduleRow': {
  what: [`Sales schedule text from the listing (registration, lottery, contract dates).`, `掲載の販売スケジュール（登録受付・抽選・契約日など）。`] },
'l.nwPhase': {
  what: [`Current sales phase (第N期, 最終期, 先着順…).`, `現在の販売期（第N期・最終期・先着順など）。`],
  read: [`Developers often raise prices in later phases if earlier ones sold well. 先着順 (first come) usually means slower sales.`, `前の期がよく売れると、後の期は値上げされることが多いです。先着順は販売が鈍いことが多いです。`] },
'l.nwPhaseChange': {
  what: [`Price change for matching unit types compared with the previous phase.`, `前の期と比べた、同じタイプの価格の変化。`],
  read: [`Rising prices = strong demand and little room to negotiate.`, `値上がり＝需要が強く、交渉の余地は小さいです。`] },
'l.nwStock': {
  what: [`Units still listed on SUUMO.`, `SUUMOにまだ掲載されている住戸数。`] },
'l.nwSoldWeek': {
  what: [`Units that disappeared from the listing in the last 7 days (counted as sold).`, `過去7日で掲載から消えた住戸数（販売済みとみなす）。`],
  read: [`A unit taken off the listing isn't always sold, so treat it as a trend.`, `掲載から外れても売れたとは限らないので、傾向として見てください。`] },
'l.nwPace': {
  what: [`Average units sold per week since tracking began.`, `追跡開始からの1週間あたりの平均販売戸数。`],
  read: [`Fast pace = popular project, and prices may rise in the next phase.`, `ペースが速いと人気物件で、次の期で値上がりすることがあります。`] },
'l.nwTypesRow': {
  what: [`Number of floor-plan types (間取りタイプ) on sale.`, `販売中の間取りタイプの数。`] },
'l.nwEffRow': {
  what: [`Monthly fees per m², counting the repair fund at no less than ¥250/m².`, `㎡あたりの月額管理費等（修繕積立金は最低250円/㎡として計算）。`],
  why: [`New buildings start with a low repair fund that steps up to guideline levels within years, so the advertised fees understate the real cost.`, `新築は修繕積立金が低く始まり数年でガイドライン水準まで上がるため、広告の管理費等は実際の負担より低く見えます。`] },
'l.nwUpfront': {
  what: [`One-off payments at handover: repair-fund deposit (修繕積立基金) + management reserve (管理準備金).`, `引渡し時の一時金：修繕積立基金＋管理準備金。`],
  read: [`Often ¥300k–1M. It's cash you need on top of the down payment.`, `30万〜100万円程度が多く、頭金とは別に現金が必要です。`] },
'l.nwKindRow': {
  what: [`Developer project (分譲, sold by the developer) or 新築未入居 (completed, never lived in, usually sold through an agent).`, `分譲（デベロッパーが販売）か新築未入居（完成済み・未入居、通常は仲介で販売）か。`],
  read: [`新築未入居 can be cheaper and ready now, but an agent fee may apply.`, `新築未入居は安く、すぐ入居できることがありますが、仲介手数料がかかる場合があります。`] },
'l.nwUnits': {
  what: [`Units on sale in the current phase.`, `今期の販売戸数。`] },
'l.nwParkingRatio': {
  what: [`Parking spaces ÷ total units (駐車場設置率).`, `駐車場の台数÷総戸数（駐車場設置率）。`],
  read: [`Below about 50% in the suburbs means a waitlist for a space is likely.`, `郊外で50%程度を下回ると、駐車場の空き待ちになる可能性が高いです。`] },
'l.nwDev': {
  what: [`Developer(s) (売主). Major 7 = 住友不動産, 大京, 東急不動産, 東京建物, 野村不動産, 三井不動産レジデンシャル, 三菱地所レジデンス.`, `売主（デベロッパー）。メジャー7＝住友不動産・大京・東急不動産・東京建物・野村不動産・三井不動産レジデンシャル・三菱地所レジデンス。`],
  why: [`The brand affects resale value, after-sales service and which company manages the building.`, `ブランドは売却価格・アフターサービス・管理会社に影響します。`] },
'l.nwIso': {
  what: [`Seismic isolation (免震): rubber bearings under the building reduce shaking inside.`, `免震構造：建物の下の積層ゴムなどで室内の揺れを小さくします。`],
  read: [`Much safer for people and furniture than a standard earthquake-resistant (耐震) building, but the bearings add maintenance cost.`, `一般的な耐震構造より人や家具の安全性はずっと高いですが、免震装置の維持費がかかります。`] },
};

/* ══════════════ AREA COMPARISON — detached houses (aH.* overrides a.* in house mode) + schools ══════════════
   Numbers mirror build_locations.py (HOUSE_WEIGHTS, hazard_score_house), house_stats.py, school_info.py, schools.py. */
Object.assign(window.CMPG, {
'aH.total': {
  what: [`House-mode total of the seven sub-scores. Default weights: Space 25, Commute 20, Childcare 20, Natural hazards 15, Growth 10, Bus 5, Costco 5. Hazards weigh more than for apartments because a house sits on its own lot.`,
         `一戸建てモードの7つのサブスコアの加重合計。標準の重み：広さ25・通勤20・子育て20・災害15・成長性10・バス5・コストコ5。一戸建ては土地の上に直接建つため、マンションより災害の比重を高くしています。`],
  read: [`Apartment and house totals are separate rankings; don't compare a house total with an apartment total.`,
         `マンションと一戸建ての合計点は別々のランキングです。両者を直接比べないでください。`] },
'aH.sub.space': {
  what: [`Detached houses you could actually buy: floor ≥100 m², built 2000 or later, or new. 50% Price: median asking price of such houses with 100–130 m² floor (log scale ¥30M = 100 … ¥150M = 0). 50% Choice: how many suitable houses are under ¥80M (or your budget): 100·ln(1+n)/ln 61.`,
         `実際に買える一戸建て：延床100㎡以上で2000年以降築、または新築。50%は価格：延床100〜130㎡の物件の売出価格中央値（対数目盛り、3,000万円＝100…1億5,000万円＝0）。50%は選択肢：8,000万円（または設定予算）未満の件数、100·ln(1+n)/ln61。`],
  why: [`Plot size is not filtered: in Tokyo many houses sit on 60–90 m² plots as 3-storey homes, which is shown separately.`,
        `土地面積では絞り込んでいません。東京では60〜90㎡の土地に3階建てが多く、その割合は別に表示します。`],
  tip: [`New builds (建売) dominate the counts in the suburbs; check the plot and the road width on each listing.`,
        `郊外では新築（建売）が件数の大半を占めます。物件ごとに土地面積と前面道路の幅を確認してください。`] },
'aH.sub.commute': {
  what: [`The apartment commute score minus 1.5 points for every minute the median suitable house is beyond a 10-minute walk from a station (at most −15).`,
         `マンションの通勤スコアから、条件に合う一戸建ての駅徒歩中央値が10分を超える1分ごとに1.5点を引きます（最大−15）。`],
  why: [`Houses are usually further from stations than condos; 20 minutes of walking each way adds up like a longer train ride.`,
        `一戸建てはマンションより駅から遠いのが普通です。片道20分の徒歩は電車が長いのと同じように効いてきます。`] },
'aH.sub.hazard': {
  what: [`House version of the hazard score: water 40 × (1 − (0.5·shallow + 0.85·0.5–3 m + 1.0·≥3 m)/100); ground 30 × (1 − (liquefaction high + 0.4·mid + 0.5·upland fill)/100); landslide 10; earthquake 20 (J-SHIS 40% → 20 … 85% → 0).`,
         `一戸建て版の災害スコア：浸水40×(1−(0.5·浅い＋0.85·0.5〜3m＋1.0·3m以上)/100)、地盤30×(1−(液状化高＋0.4·中＋0.5·台地の盛土)/100)、土砂10、地震20（J-SHIS 40%→20…85%→0）。`],
  why: [`A ground floor floods even in shallow water, and liquefaction tilts a house on its own foundation; condo upper floors avoid both.`,
        `1階は浅い浸水でも被害を受け、液状化では基礎ごと傾きます。マンションの上階はどちらも避けられます。`],
  tip: [`On each listing check the 重ねるハザードマップ at the exact address and ask for the ground survey (地盤調査) result.`,
        `物件ごとに住所で「重ねるハザードマップ」を確認し、地盤調査の結果を尋ねてください。`] },
'a.hPrice': {
  what: [`Median asking price of suitable houses (floor ≥100 m², built 2000+ or new) with 100–130 m² of floor. Falls back to all suitable sizes when fewer than 3 such houses are listed.`,
         `条件に合う一戸建て（延床100㎡以上・2000年以降築または新築）のうち延床100〜130㎡の売出価格中央値。該当が3件未満なら全サイズの中央値を使います。`],
  read: [`It is a typical family-size house, not the cheapest one. Asking prices; new builds often sell 2–5% below asking.`,
         `最安値ではなく標準的な家族向けサイズの価格です。売出価格で、新築は2〜5%程度値引きされることがよくあります。`] },
'a.hPool': {
  what: [`Number of suitable houses under ¥80M (or your budget) — the Choice half of Space.`, `8,000万円（または設定予算）未満の条件に合う一戸建ての件数。広さスコアの「選択肢」部分です。`] },
'a.hAll': {
  what: [`All suitable houses listed (any price), with the number that are new builds.`, `価格を問わず条件に合う一戸建ての掲載件数（うち新築）。`] },
'a.hLand': {
  what: [`Median plot (土地面積) of suitable houses, and the share on plots under 100 m².`, `条件に合う一戸建ての土地面積の中央値と、土地100㎡未満の割合。`],
  why: [`Plot size decides parking, garden, sunlight and future resale/rebuild options. Under ~100 m² usually means a narrow 3-storey house.`,
        `土地の広さは駐車場・庭・日当たり、将来の売却や建て替えに影響します。100㎡未満はたいてい狭小の3階建てです。`] },
'a.hBldg': { what: [`Median floor area (延床面積) of suitable houses.`, `条件に合う一戸建ての延床面積の中央値。`] },
'a.hWalk': {
  what: [`Median walking time to the nearest station of suitable houses (bus-only listings excluded), with the share that SUUMO lists as bus access.`,
         `条件に合う一戸建ての最寄り駅までの徒歩時間の中央値（バス便は除く）と、バス便の割合。`] },
'a.hPark2': {
  what: [`Share of ≥100 m² houses that SUUMO tags as having parking for 2 cars (駐車2台以上).`, `100㎡以上の一戸建てのうち、SUUMOで「駐車2台以上」のもの割合。`],
  read: [`Whether the space is covered (carport / built-in garage) is not a SUUMO filter; check each listing's photos and 設備 text.`,
         `屋根付き（カーポート・ビルトインガレージ）かどうかはSUUMOの条件にないため、写真や設備欄で確認してください。`] },
'a.hSolar': {
  what: [`Share of ≥100 m² houses with solar panels (太陽光発電システム).`, `100㎡以上の一戸建てのうち太陽光発電ありの割合。`],
  why: [`Tokyo requires solar on most new houses from April 2025, so central-Tokyo shares are rising.`, `東京都は2025年4月から多くの新築住宅に太陽光設置を義務化しており、都内の割合は上がっています。`] },
'a.hLongLife': {
  what: [`Share of ≥100 m² houses certified 長期優良住宅 (long-life quality housing: insulation, quake resistance, maintenance plan).`,
         `100㎡以上の一戸建てのうち長期優良住宅（断熱・耐震・維持保全計画などの認定）の割合。`],
  why: [`Gives a larger mortgage tax deduction limit and lower property tax for some years; usually a sign of better build quality.`,
        `住宅ローン控除の限度額が大きく、固定資産税の減額期間も長くなります。品質の目安にもなります。`] },
'a.hPerfCert': {
  what: [`Share with a 住宅性能評価書 (third-party performance evaluation: quake grade, insulation grade, etc.).`, `住宅性能評価書（耐震等級・断熱等級などの第三者評価）がある割合。`] },
'a.hLowRise': {
  what: [`Share of houses in a 低層住居専用地域 (category 1/2 low-rise residential zone).`, `第一種・第二種低層住居専用地域にある割合。`],
  why: [`These zones ban tall buildings and most shops: quieter streets and protected sunlight, but fewer shops within walking distance.`,
        `高い建物や多くの店舗が建てられないため静かで日当たりが守られますが、徒歩圏の店は少なめです。`] },
'a.hStorey3': {
  what: [`Share of ≥100 m² houses with 3 or more storeys.`, `100㎡以上の一戸建てのうち3階建て以上の割合。`],
  read: [`High shares mean small plots: more stairs with toddlers, often a 1st-floor garage and no garden.`, `割合が高いほど敷地が狭いということです。小さな子との階段の上り下りが増え、1階が車庫で庭がないことが多いです。`] },
'a.schTest': {
  what: [`2025 national achievement test (全国学力・学習状況調査, grade 6 and grade 9): the city's average correct-answer rate minus the national average, averaged over subjects (grade 6: Japanese, maths, science; grade 9: Japanese, maths). Source: Saitama prefecture's per-city summaries, MEXT designated-city notes; prefecture value when the city publishes nothing comparable.`,
         `2025年度全国学力・学習状況調査（小6・中3）：市の平均正答率と全国平均の差を教科で平均したもの（小6は国語・算数・理科、中3は国語・数学）。出典は埼玉県の市町村別概要、文科省の指定都市別ノート。市の値がない場合は都道府県の値。`],
  why: [`It is the only official, comparable academic signal. There is no official ranking of individual public schools.`, `公式で比較できる唯一の学力の指標です。個々の公立校の公式ランキングはありません。`],
  read: [`±2 points is small. City averages hide large differences between schools, and family background explains much of the gap.`, `±2ポイントは小さな差です。市の平均は学校間の大きな差を隠しており、差の多くは家庭環境で説明されます。`],
  tip: [`Visit the assigned school (学校公開) and ask the city for that school's own results if it publishes them.`, `指定校の学校公開に行き、学校別の結果を公表していれば市に確認してください。`] },
'a.schPriv': {
  what: [`Tokyo only: share of March 2025 public-elementary graduates who entered a private junior high (東京都 公立学校統計調査 進路状況調査編).`, `東京都のみ：2025年3月の公立小卒業者のうち私立中学に進学した割合（東京都 公立学校統計調査 進路状況調査編）。`],
  read: [`Above ~30% means many classmates sit entrance exams (中学受験) and use cram schools from grade 4; the local junior high has fewer high achievers.`, `30%程度を超えると、多くの同級生が中学受験をして4年生頃から塾に通います。地元の公立中には成績上位層が少なくなります。`] },
'a.schChoice': {
  what: [`Whether families may pick a public school other than the zoned one when entering (学校選択制): free choice, adjacent zones, or none. Tokyo: Tokyo board table for April 2026 entry; elsewhere city pages.`,
         `入学時に指定校以外の公立校を選べるか（学校選択制）：自由選択・隣接校・なし。東京都は令和8年度の都教委の一覧、その他は市のページ。`],
  read: [`Popular schools hold lotteries. 'Not found' means we found no system — the zoned school applies, with 指定校変更 only for specific reasons.`, `人気校は抽選になります。「確認できず」は制度が見つからないという意味で、指定校に通い、特別な理由があれば指定校変更を申請します。`] },
'a.schKids': {
  what: [`Children aged 0–14 (2020 census) per public elementary school in the area.`, `エリア内の公立小学校1校あたりの0〜14歳人口（2020年国勢調査）。`],
  read: [`High values point to big schools; fast-growing areas can still have prefab classrooms. It is not a class-size figure.`, `値が大きいほど大規模校の傾向です。人口急増地ではプレハブ教室のこともあります。学級人数ではありません。`] },
'a.schNear': {
  what: [`Share of children 0–14 living within 800 m (straight line) of a public elementary school.`, `公立小学校から直線800m以内に住む0〜14歳の割合。`],
  why: [`Children walk to school alone from age 6; there are no school buses in these cities.`, `6歳から一人で歩いて通学し、これらの市にスクールバスはありません。`] },
'a.schHS': {
  what: [`Where public high-school applications are allowed. Chiba has 9 districts (apply in your own and adjacent ones); Tokyo, Kanagawa, Saitama and Ibaraki 普通科 are prefecture-wide.`,
         `公立高校に出願できる範囲。千葉県は9学区（自分と隣接学区に出願可）、東京・神奈川・埼玉・茨城の普通科は県（都）内全域です。`] },
'a.schZone': {
  what: [`Whether the city's school-zone map is in the national open data (国土数値情報 A27/A32, 2023). If yes, listing pages show the assigned elementary and junior high; if not (Funabashi, Shinagawa, Arakawa, Moriya), the nearest school is shown instead.`,
         `市の通学区域が国の公開データ（国土数値情報 A27/A32、2023年）にあるか。あれば物件ページに指定の小・中学校を表示し、ない場合（船橋・品川・荒川・守谷）は最寄り校を表示します。`] },
});

Object.assign(window.CMPG, {
'l.schES': {
  what: [`The public elementary school whose zone (通学区域) contains the listing's 丁目 centre, from the national school-zone data (国土数値情報 A27, 2023), with the straight-line distance. Where the city's zones are not in the data (Funabashi, Shinagawa, Arakawa, Moriya) the nearest school is shown and marked.`,
         `物件の丁目の中心が含まれる通学区域の公立小学校（国土数値情報 A27、2023年）と直線距離。通学区域がデータにない市（船橋・品川・荒川・守谷）は最寄り校を表示し、その旨を示します。`],
  why: [`From age 6 children walk to school alone, and the zone decides the school unless the city has a choice system.`, `6歳から一人で歩いて通学し、学校選択制がなければ通学区域で学校が決まります。`],
  read: [`'or …' means another zone boundary is within 150 m: SUUMO addresses stop at the 丁目, so the exact lot can fall in either zone. Walking distance is usually 1.2–1.4× the straight line.`,
         `「または…」は150m以内に別の学区の境界があるという意味です。SUUMOの住所は丁目までなので、実際の敷地はどちらの学区にもなり得ます。徒歩距離は直線の1.2〜1.4倍程度です。`],
  tip: [`Before signing, give the full address to the city's 学務課 (or check its 通学区域 page) and walk the route at 8 am.`, `契約前に正確な住所を市区町村の学務課に伝えて確認し（または通学区域のページ）、朝8時に通学路を歩いてみてください。`] },
'l.schJHS': {
  what: [`The public junior high school for the listing's zone (国土数値情報 A32, 2023), with the straight-line distance. Many Tokyo wards let you choose another junior high (see the area map's Schools card).`,
         `物件の通学区域の公立中学校（国土数値情報 A32、2023年）と直線距離。東京の多くの区では他の中学校を選べます（エリアマップの「公立学校」カード参照）。`] },
});

/* ── House listing details (DATA_LOG item 21) ── */
Object.assign(window.CMPG, {
'l.road': {
  what: [`Width of the road in front of the plot, and the frontage (接道: how many metres of the plot touch that road). "2 roads" = corner or two-sided plot.`, `敷地が接する道路の幅と、その道路に接する長さ（接道）。「2方向」は角地または二方向道路。`],
  why: [`By law a house must touch a road at least 4 m wide for at least 2 m. A narrower road means a setback (セットバック) when rebuilding; a frontage under 2 m means no rebuild at all (再建築不可). Wider roads also mean easier parking and more light.`, `建築基準法では幅4m以上の道路に2m以上接する必要があります。4m未満ならセットバック、接道2m未満は再建築不可。道路が広いほど駐車しやすく採光も良くなります。`],
  read: [`6 m is a typical new-town road. Under 4 m is flagged on the card.`, `6mはニュータウンの一般的な道路幅。4m未満はカードに表示します。`],
  tip: [`Ask whether the road is public (公道) or private (私道) and whether a setback is needed.`, `公道か私道か、セットバックの要否を確認しましょう。`] },
'l.zoning': {
  what: [`The city-planning zone (用途地域) of the plot, e.g. 1種低層 = Category 1 low-rise residential.`, `敷地の用途地域（例：1種低層＝第一種低層住居専用地域）。`],
  why: [`It decides what can be built next door. Low-rise residential zones (1種/2種低層) keep neighbours to about 10 m high and ban shops and apartment blocks; 中高 and 住居 zones allow mid-rise flats; 準工業 allows small factories.`, `隣に何が建つかが決まります。低層住居専用地域は高さ約10mまでで、店舗やマンションは建ちません。中高層・住居地域では中層マンション、準工業地域では小規模な工場も建てられます。`] },
'l.bcrFar': {
  what: [`建ぺい率 (building coverage: the largest share of the plot the building may cover) / 容積率 (floor-area ratio: the largest total floor area as a share of the plot).`, `建ぺい率（敷地に対する建築面積の上限）／容積率（敷地に対する延床面積の上限）。`],
  read: [`50% / 100% on a 150 m² plot = up to 75 m² footprint and 150 m² total floor area. It limits how big a future rebuild or extension can be.`, `150㎡の敷地で50%／100%なら、建築面積75㎡・延床150㎡まで。将来の建て替えや増築の大きさを決めます。`] },
'l.covered': {
  what: [`Whether the agent mentions a carport, garage or built-in garage in the listing text.`, `掲載文にカーポート・ガレージ・ビルトインガレージの記載があるか。`],
  read: [`Read from the agent's free text, so "not advertised" may still have one: check the photos. A carport can usually be added later (about ¥300–600k).`, `掲載文から読み取るため、「記載なし」でもある場合があります。写真で確認を。カーポートは後付けも可能（約30〜60万円）。`] },
'l.fibre': {
  what: [`Whether the listing text mentions fibre (光回線 / 光ファイバー) or free internet.`, `掲載文に光回線・光ファイバー・インターネット無料の記載があるか。`],
  read: [`Rarely advertised for houses. Almost every street in the Tokyo area has fibre (NTT フレッツ光 and others); check the address on the provider's coverage page.`, `一戸建てではほとんど記載されません。首都圏ではほぼ全域で光回線が使えます。住所で提供エリアを確認しましょう。`] },
'l.solar': {
  what: [`Solar panels advertised (特徴: 太陽光発電システム).`, `太陽光発電システムの記載。`],
  read: [`A 4–5 kW system saves roughly ¥80–120k a year. Ask the panel age (inverters last about 15 years) and whether the FIT sale contract transfers to you.`, `4〜5kWで年8〜12万円程度の効果。パネルの設置年（パワコンは約15年）とFIT売電契約の引継ぎを確認しましょう。`] },
'l.certs': {
  what: [`Quality papers the agent lists: 長期優良住宅 (long-life certified), 住宅性能評価書 (official performance report), ground survey, completion certificate (検査済証), defect insurance, Flat 35S.`, `長期優良住宅・住宅性能評価書・地盤調査・検査済証・瑕疵保険・フラット35Sなど、掲載されている書類。`],
  why: [`They prove the house was built and inspected to a standard, raise the mortgage tax-credit cap (長期優良: ¥45M for families with children) and help resale. A missing 検査済証 can block some loans.`, `基準どおりに建てられ検査されたことの証明になり、住宅ローン減税の上限（長期優良は子育て世帯で4,500万円）や売却にも有利です。検査済証がないとローンが組めない場合もあります。`],
  tip: [`Ask for copies of every certificate and the design drawings before signing.`, `契約前にすべての証明書と設計図書のコピーをもらいましょう。`] },
'l.energy': {
  what: [`Energy label (★, shown for new builds since 2024), insulation grade (断熱等級 1–7) and estimated energy cost when given; otherwise the eco features the agent ticked.`, `省エネ性能ラベル（★、2024年以降の新築）、断熱等級（1〜7）、目安光熱費。記載がなければ掲載された省エネ設備。`],
  read: [`Used houses almost never show a label. Grade 4 = 1999 standard, 5 = ZEH level, 6–7 = much warmer. Double glazing and an eco water heater are the minimum to expect from a 2000s house.`, `中古住宅ではほぼ表示されません。等級4＝1999年基準、5＝ZEH水準、6〜7＝さらに高断熱。2000年代の住宅なら複層ガラスと省エネ給湯器が最低限の目安です。`] },
});

/* ── ⓘ button + popup ──
   cgI('a.pool') → button HTML, or '' if there's no entry. Several keys = first one found. */
function cgI(...keys) {
  const k = keys.find(x => window.CMPG[x]);
  if (!k) return '';
  const g = window.CMPG[k], l = LANG === 'ja' ? 1 : 0, s = (g.what || g.why)[l];
  const tip = s.length > 140 ? s.slice(0, 138) + '…' : s;
  return `<button type="button" class="cgi" data-cg="${k}" title="${tip.replace(/"/g, '&quot;')}" aria-label="${LANG === 'ja' ? '説明' : 'Explain'}"></button>`;
}
(function () {
  const LB = { what: ['What it is', '何のこと？'], why: ['Why it matters', 'なぜ重要？'], read: ['How to read it', '読み方'], tip: ['What to do', '確認・対策'] };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let pop, last;
  function hide() { if (pop && !pop.hidden) { pop.hidden = true; last && last.focus(); } }
  function show(btn) {
    const g = window.CMPG[btn.dataset.cg]; if (!g) return;
    if (!pop) {
      pop = document.createElement('div'); pop.className = 'cgp'; pop.hidden = true;
      pop.innerHTML = '<div role="dialog" aria-modal="true"><button type="button" class="x" aria-label="close">×</button><div class="b"></div></div>';
      document.body.appendChild(pop);
      pop.addEventListener('click', e => { e.stopPropagation(); if (e.target === pop || e.target.closest('.x')) hide(); });
    }
    const l = LANG === 'ja' ? 1 : 0, th = btn.closest('th');
    const title = th ? th.textContent.replace(/\s+/g, ' ').trim() : '';
    pop.querySelector('.b').innerHTML = `<h3>${esc(title)}</h3>` +
      ['what', 'why', 'read'].filter(f => g[f]).map(f => `<h4>${LB[f][l]}</h4><p>${esc(g[f][l])}</p>`).join('') +
      (g.tip ? `<div class="cgtip"><h4>${LB.tip[l]}</h4><p>${esc(g.tip[l])}</p></div>` : '');
    pop.hidden = false; last = btn; pop.querySelector('.x').focus();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('.cgi');
    if (b) { e.preventDefault(); e.stopPropagation(); show(b); }
  }, true);
  // capture phase: Escape closes the popup before the compare dialog's own Escape handler sees it
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && pop && !pop.hidden) { e.stopPropagation(); hide(); } }, true);
})();
