/* ═══════════════════════════════════════════════
   TRANSLATIONS  (English default · 日本語)
   t(key, ...args) → string. Entries are plain strings or functions.
   Static markup uses data-i18n / data-i18n-ph / data-i18n-title attributes.
════════════════════════════════════════════════ */
const I18N = {
  en: {
    // ── chrome ──
    logoMain: 'Property Compare', logoSub: 'Japan Real Estate', source: 'Data source:',
    tabApartments: 'Apartments', tabHouses: 'Houses', tabTrends: 'Trends',
    themeTitle: 'Toggle light/dark mode', langTitle: 'Language',
    hdrCount: (n, kind) => `<strong>${n}</strong> ${kind === 'ms' ? 'apartment' : 'house'}${n !== 1 ? 's' : ''}`,

    // ── filters ──
    layout: 'Layout', only: 'Only', sort: 'Sort', loan: 'Loan %', area: 'Area', all: 'All',
    loanTitle: 'Loan rate for the all-in monthly figures. Down payment, years, parking and the rest are in the Loan tab.',
    searchPh: 'Building, station, address…', reset: 'Reset', any: 'Any',
    minSize: 'Min size', maxPrice: 'Max price', maxWalk: 'Max walk', builtFrom: 'Built from',
    fmtMinM2: v => `${v} m²+`, fmtMaxPrice: v => `≤ ¥${v / 100}M`, fmtMaxWalk: v => `≤ ${v} min`, fmtYearFrom: v => `${v}+`,
    tShin: '新耐震 1982+', tShinTitle: 'Built 1982 or later: new seismic code, qualifies for the mortgage tax deduction',
    tWalk10: 'Walk ≤10 min', tElev: 'Elevator', tPet: 'Pets OK',
    tLiqLow: 'Low liquefaction', tLiqLowTitle: 'Hide listings whose area is rated high or somewhat-high liquefaction risk',
    tCut: 'Price dropped', tNew: 'New this week', tNewTitle: 'First seen in the last 7 days',
    sScore: 'Score: Best First', sDefault: 'Default', sValue: 'Best deal vs similar',
    sPriceAsc: 'Price: Low → High', sPriceDesc: 'Price: High → Low', sPpm: '¥/m²: Low → High',
    sMonthly: 'All-in monthly: Low → High', sFees: 'Fees/m²: Low → High', sArea: 'Area: Largest First',
    sAge: 'Age: Newest First', sWalk: 'Station: Nearest First', sListed: 'Recently listed', sDrop: 'Biggest price drop',

    // ── results ──
    housesShown: 'houses shown', apartmentsShown: 'apartments shown',
    medianNote: (m, ts) => `Median ${m}万/m² · ${ts}万/tsubo`,
    showMore: (k, rest) => `Show ${k} more (${rest} remaining)`,
    emptyHouses: 'No houses match your filters', emptyMs: 'No apartments match your filters',

    // ── money / units ──
    price: man => '¥' + (man * 10000).toLocaleString('en-US'),
    priceShort: man => '¥' + (man / 100).toFixed(man % 100 ? 1 : 0) + 'M',
    yen: v => '¥' + Math.round(v).toLocaleString('en-US'),
    tsubo: v => `${v} tsubo`, ageY: n => `${n}y`, units: n => `${n} units`, balcony: v => `balcony ${v}m²`,
    newBuild: 'New build', yearsOld: n => n === 1 ? '1 year old' : `${n} years old`,
    stationName: s => `${s} Station`, walkMin: n => `<strong>${n} min</strong> walk`, busWalkMin: n => `<strong>${n} min</strong> bus+walk`,
    minShort: n => `${n} min`, perM2: v => `${v}/m²`, floorN: n => `${n}F`,
    storeys: s => s, bldgFloorsN: n => `${n}F`,
    structure: s => s,
    facing: f => f ? [...f].map(c => ({ '北': 'N', '南': 'S', '東': 'E', '西': 'W' })[c] || c).join('') : '—',
    yes: 'Yes', no: 'No', none: '—',

    // ── card ──
    taxNote: 'Tax included · 10% consumption tax',
    floorArea: 'Floor Area', landArea: 'Land Area', buildingAge: 'Building Age', structureLbl: 'Structure',
    built: 'Built', feesMonth: 'Fees / month', estMonthly: 'Est. monthly', building: 'Building', facingLbl: 'Facing',
    scoreBreakdown: 'Score Breakdown', viewSuumo: 'View on SUUMO', badgeNew: 'New', photoAlt: 'Property photo',
    cmpAdd: '+ Compare', cmpAdded: '✓ Comparing',
    cat: { value: 'Value', access: 'Access', condition: 'Cond.', running: 'Fees', space: 'Space', extras: 'Extras', certainty: 'Certain', project: 'Project' },
    catLong: { value: 'Value', access: 'Access', condition: 'Condition', running: 'Fees', space: 'Space', extras: 'Extras', certainty: 'Certainty', project: 'Project', total: 'Total score' },
    dealBelow: v => `${v}% below similar`, dealAbove: v => `${v}% above similar`, dealFair: 'in line with similar',

    // ── tags ──
    tagReno: 'Renovated', tagParkingN: n => `${n} Parking`, tagLeasehold: 'Leasehold', tagNoGas: 'No City Gas',
    tagOldSeismic: '旧耐震', tagOldSeismicTitle: 'Built before 1982: old seismic code, no mortgage tax deduction',
    tagLowRepair: 'Low repair fund', tagLowRepairTitle: v => `Repair fund ¥${v}/m²/mo is below guideline: expect increases or a lump-sum levy`,
    tagNoElev: f => `No elevator · ${f}F`, tagPets: 'Pets OK', tagParkingFrom: fee => fee ? `Parking from ${I18N.en.yen(fee)}` : 'Parking',
    tagParkingTitle: 'On-site parking; cheapest listed fee', tagNoParking: 'No parking',
    tagParkingFull: fee => `Parking: waitlist${fee ? ' · ' + I18N.en.yen(fee) : ''}`,
    tagParkingFullTitle: 'The building has parking but no space is free right now (空無) — ask to join the waitlist',
    tagParkingBldg: fee => `Parking in building${fee ? ' · from ' + I18N.en.yen(fee) : ''}`,
    tagParkingBldgTitle: 'Other listings in this building confirm on-site parking; this one does not say whether a space is free',
    tagInBldg: n => `+${n} in building`, tagAgents: n => `${n} agents`, tagListed: d => `Listed ${d}d ago`,
    liqTag: lv => `Liquefaction: ${I18N.en.liq[lv]}`, liqNA: 'Liquefaction: n/a',
    liq: { high: 'high', mid: 'somewhat high', low: 'low', vlow: 'very low' },

    // ── tooltips ──
    tipTotal: (total, rows) => `<div class="tip-h">Total score ${total} / 100</div>Sum of the categories:<ul class="tip-list">${rows}</ul>
      <div class="tip-note">Green ≥ 75 · amber 55–74 · red &lt; 55. Hover each bar for how it is calculated.</div>`,
    tipPrice: (rows, total, pct, since) => `<div class="tip-h">Price history</div><ul class="tip-list">${rows}</ul>
      <div class="tip-note">Total: ${total} (${pct}) since first tracked on ${since}. Changes are recorded from the daily scrape.</div>`,
    tipLiqNA: `<div class="tip-h">Liquefaction: not rated</div>No hazard source is configured for this area yet (areas.json → "liquefaction").`,
    tipLiq: c => `<div class="tip-h">Liquefaction risk: ${c.level} <span class="tip-note">${c.jp}</span></div>
      Share of the 50 m hazard-map cells within ${c.radius} m of ${c.place}
      (${c.block ? 'block-level address' : '丁目 centre; SUUMO gives no exact lot'}):
      ${c.bar}<ul class="tip-list">${c.rows}</ul>
      <div class="tip-note"><b>What it means:</b> ${c.house
        ? 'Wooden houses on shallow foundations can tilt and need costly re-levelling (common in Mihama in 2011).'
        : 'A piled RC building usually stays level, but grounds, pipes, parking and roads around it can be damaged, and repairs hit the reserve fund.'}
      Score: Extras −${c.penalty}.</div>
      <div class="tip-note">Source: ${c.src}, scenario 千葉市直下地震 M7.3. The bay-side wards are reclaimed land; the long 2011 shaking liquefied some “low” areas there too (e.g. 美浜区磯辺), so treat levels as relative.
      <b>Click to check the official current (FY2025) map at this spot.</b></div>`,
    tipLiqLandform: c => `<div class="tip-h">Liquefaction tendency: ${c.level}</div>
      Ground types within ${c.radius} m of ${c.place}
      (${c.block ? 'block-level address' : '丁目 centre; SUUMO gives no exact lot'}):
      <ul class="tip-list">${c.forms}</ul>${c.bar}<ul class="tip-list">${c.rows}</ul>
      <div class="tip-note"><b>How it's rated:</b> GSI's landform map says how prone each ground type is to liquefaction —
      fill / reclaimed land, old river channels and ponds: very strong → <i>high</i>; lowlands, shallow valleys: strong → <i>somewhat high</i>;
      plateau: weak → <i>low</i>; hills and cut land → <i>very low</i>. ${c.house
        ? 'Wooden houses on shallow foundations are the most exposed.'
        : 'A piled RC building usually stays level; grounds, pipes and roads are what get damaged.'} Score: Extras −${c.penalty}.</div>
      <div class="tip-note">Source: ${c.src} (landform-based, coarser than a city quake-scenario map — no city map is usable here).
      <b>Click to open the GSI landform map at this spot.</b></div>`,
    tipMonthly: c => `<div class="tip-h">Estimated monthly cost</div><ul class="tip-list">
      <li><span>Loan ${c.price}, ${c.years}y @ ${c.rate}%</span><span>${c.loan}</span></li>
      <li><span>管理費 + 修繕積立金</span><span>${c.fees}</span></li>
      <li><b>Total</b><b>${c.total}</b></li></ul>
      <div class="tip-note">Assumes no down payment (full price borrowed). Change the rate in the filter bar.
      Excludes property tax (固定資産税), insurance, parking and purchase costs (~6–8% of price).</div>`,
    accessScale: 'Scale: ≤5 min 20 · ≤10 16 · ≤15 12 · ≤20 8 · ≤30 4 · more 0.',

    msValue: c => `<div class="tip-h">Value ${c.s}/25 — price vs similar condos</div>
      This flat asks <b>${c.ppm}万/m²</b>. Condos like it (${c.traits}) typically ask <b>~${c.exp}万/m²</b>,
      so it is <b>${Math.abs(c.v) < 3 ? 'about fair' : Math.abs(c.v) + '% ' + (c.v < 0 ? 'cheaper' : 'dearer')}</b>.<br>
      ${c.beat}% of the ${c.n} tracked condos are a better deal → 25 × ${100 - c.beat}% ≈ ${c.s}.
      <div class="tip-note">Model: regression of log(¥/m²) on age, age², walk time, floor, station, area, tower (20F+), renovation (10y+ buildings) and elevator, fitted on all tracked condos. A big discount can also mean something the model can't see (condition, view, noise), so check why.</div>`,
    traits: { built: y => `built ${y}`, walk: (m, st, bus) => `${m} min${bus ? ' by bus' : ''} to ${st}`, tower: 'tower', reno: 'renovated', elev: 'elevator', noElev: 'no elevator' },
    msAccess: c => `<div class="tip-h">Access ${c.s}/20 — station distance</div>
      ${c.walk} min to ${c.station} (${c.line})${c.bus ? ': bus ride + walk to the stop + ~5 min wait' : ' on foot'}.
      <div class="tip-note">${I18N.en.accessScale}</div>`,
    msCondition: c => `<div class="tip-h">Condition ${c.s}/20 — age & seismic code</div>
      <ul class="tip-list"><li><span>Built ${c.year} (${c.age}y, ${c.shin ? '新耐震' : '旧耐震'})</span><span>${c.base}/16</span></li>
      <li><span>Renovated${c.note ? ': ' + c.note : ''}</span><span>+${c.reno}</span></li></ul>
      <div class="tip-note">Age: ≤5y 16 · ≤10 14 · ≤15 12 · ≤20 10 · ≤30 7 · older but 1982+ 4 · pre-1982 0.
      Pre-1982 buildings follow the old seismic code (旧耐震) and don't qualify for the mortgage tax deduction (住宅ローン控除).</div>`,
    msRunningNA: s => `<div class="tip-h">Fees ${s}/15</div>No fee data on SUUMO → neutral 7/15.`,
    msRunning: c => `<div class="tip-h">Fees ${c.s}/15 — monthly running cost</div>
      <ul class="tip-list"><li><span>管理費 (management)</span><span>${c.mgmt}</span></li>
      <li><span>修繕積立金 (repair fund)</span><span>${c.repair}</span></li>
      <li><b>Per m²</b><b>¥${c.perM2}/m²</b></li></ul>
      Median is ¥${c.med}/m². ${c.pct}% of condos cost more per m² → 15 × ${c.pct}% ≈ ${c.s}.
      <div class="tip-note">You pay these for as long as you own the flat, and they usually rise. A very low repair fund
      (under ¥${c.low}/m²; this one is ¥${c.repairM2}/m²) is often cheap now, costly later.</div>`,
    msSpace: c => `<div class="tip-h">Space ${c.s}/10 — floor area</div>
      ${c.m2} m² (${c.tsubo} tsubo${c.balc ? `, + ${c.balc} m² balcony` : ''}).
      Larger than ${c.beat}% of tracked condos → 10 × ${c.beat}% ≈ ${c.s}.
      <div class="tip-note">Floor area is usually 壁芯 (to the wall centre); the 登記 (registered) figure is ~5–8% smaller.</div>`,
    msExtras: (s, rows) => `<div class="tip-h">Extras ${s}/10</div><ul class="tip-list">${rows}</ul>
      <div class="tip-note">Floor ≥10F +3 / ≥4F +2 / ≥2F +1 · south-facing +2 · elevator +2 · on-site parking +1 · pets +1 · ≥50 units +1 ·
      leasehold −3 · liquefaction high −2 / somewhat high −1. Result kept within 0–10.</div>`,
    ex: {
      floor: f => `Floor ${f ?? '?'}F`, south: f => `South-facing (${I18N.en.facing(f)})`, elevator: 'Elevator',
      parking: p => ({ full: 'Parking (waitlist)', building: 'Parking in building' })[p] || 'On-site parking', pet: 'Pets allowed', units: n => `${n} units (≥50)`, leased: 'Leasehold land',
      liq: lv => `Liquefaction risk ${I18N.en.liq[lv]}`,
    },

    hValue: c => `<div class="tip-h">Value ${c.s}/25 — price per m²</div>
      This house: <b>${c.ppm}/m²</b> of floor area. Among the ${c.n} houses shown it ranges
      ${c.min}–${c.max}/m²: cheapest gets 25, dearest 0, linear in between.
      <div class="tip-note">Relative to the houses currently visible, so it shifts when you filter.</div>`,
    hAccess: c => `<div class="tip-h">Access ${c.s}/20 — station distance</div>
      ${c.walk} min walk to ${c.station} (${c.line}).<div class="tip-note">${I18N.en.accessScale}</div>`,
    hCondition: c => `<div class="tip-h">Condition ${c.s}/20 — age & build</div>
      <ul class="tip-list"><li><span>Age ${c.age}y</span><span>${c.ageS}/12</span></li>
      <li><span>Structure ${c.str}</span><span>${c.strS}/8</span></li>
      <li><span>Renovated</span><span>+${c.reno}</span></li></ul>
      <div class="tip-note">Age: ≤5y 12 · ≤10 9 · ≤20 6 · ≤30 3 · older 1. Structure: RC 8 · Steel 6 · Wood 4. Renovation +3. Capped at 20.
      Wooden houses lose most of their building value in ~20–25 years in Japan; the land keeps its value.</div>`,
    hSpace: c => `<div class="tip-h">Space ${c.s}/20 — floor area</div>
      ${c.m2} m² (${c.tsubo} tsubo). Among the ${c.n} houses shown: ${c.min}–${c.max} m².
      Largest 20, smallest 0, linear.<div class="tip-note">Relative to the houses currently visible.</div>`,
    hExtras: c => `<div class="tip-h">Extras ${c.s}/15</div><ul class="tip-list">
      <li><span>Parking ${c.park} car${c.park === 1 ? '' : 's'}</span><span>+${c.parkS}</span></li>
      <li><span>Land ${c.owned ? 'owned (所有権)' : 'leasehold'}</span><span>+${c.rightsS}</span></li>
      <li><span>${c.gas ? 'City gas' : 'Propane gas'}</span><span>+${c.gasS}</span></li>
      <li><span>Liquefaction ${c.liq}</span><span>${c.liqP ? '−' + c.liqP : '0'}</span></li></ul>
      <div class="tip-note">Parking 1 car +5, 2+ cars +8 · owned land +5 · city gas +2 (cheaper than propane) · liquefaction high −4 / somewhat high −2. Result kept within 0–15.</div>`,

    // ── compare ──
    // ── new condos ──
    cat_used: 'Used', cat_new: 'New',
    nwCatNote: 'New = developer projects (often priced in phases) + never-occupied units (新築未入居)',
    nwPriced: 'Price announced', nwPricedTitle: 'Hide projects whose prices are still 未定 (TBD)',
    nwReady: 'Ready to move in', nwReadyTitle: 'Completed — handover now',
    nwProjects: 'Developer projects', nwProjectsTitle: 'Buildings sold by the developer, usually in phases',
    nwUnsold: 'Never-occupied units', nwUnsoldTitle: '新築未入居: completed units resold by an agent before anyone lived in them',
    nwMajor: 'Major developer', nwMajorTitle: 'Major-7: 住友不動産・大京・東急不動産・東京建物・野村不動産・三井不動産レジデンシャル・三菱地所レジデンス',
    nwSortPrice: 'Price from: Low → High', nwSortPremium: 'Smallest new-build premium', nwSortMove: 'Move-in: Soonest',
    nwShown: 'new-condo listings shown', nwMoveBy: 'Move in within',
    nwFmtMove: v => v === 0 ? 'now' : `${v} mo`,
    nwPriceTBD: 'Price TBD', nwTBD: 'TBD', nwNone: 'None', nwMoveNow: 'Now',
    nwMoveAt: (y, m, mo) => `${y}/${m ?? '?'} (${mo} mo)`,
    nwBand: v => `Most units: ${v}`,
    nwPremium: p => `${p >= 0 ? '+' : ''}${p}% vs recent used nearby`,
    nwNoPremium: 'Premium vs used: prices not announced yet',
    nwKind: { presale: 'Pre-sale', onsale: 'On sale', unsold: 'Never occupied' },
    nwMoveIn: 'Move-in', nwUnits: 'Units on sale', nwTotal: 'total', nwUpfront: 'Upfront (one-time)',
    nwUpfrontTip: '<div class="tip-h">Upfront one-time payments</div>修繕積立基金 (repair-fund lump sum) + 管理準備金 (management reserve), paid at handover on top of the price and purchase costs. Usually ¥300k–1.5M for a new project; a never-occupied resale unit normally has none (the first owner paid it).',
    nwSpaces: ' spaces', nwDev: 'Developer', nwSchedule: 'Sales:',
    nwTypes: (n, kind) => kind === 'unsold' ? `${n} units for sale` : `${n} unit types`,
    nwColFloor: 'Floor', nwColType: 'Type',
    nwAnnounced: 'Prices just announced', nwPriceHist: 'Price history', nwMajorTag: 'Major developer',
    nwLowRepair: 'Repair fund starts low',
    nwLowRepairTip: v => `<div class="tip-h">Low starting repair fund</div>¥${v}/m²/month — well below the MLIT guideline (about ¥250–340). New buildings start low to look affordable and step it up (段階増額), often 2–4× within 10–20 years.`,
    nwSales: 'Sales progress', nwSortPace: 'Selling fastest',
    nwPhaseLine: (label, prev, ch) => `Phase: <b>${label === '先着順' ? 'first-come sales (先着順)' : label}</b>` +
      (ch != null ? ` · <span class="${ch > 0 ? 'deal-bad' : 'deal-good'}">${ch > 0 ? '+' : ''}${ch}% vs ${prev}</span>` : ''),
    nwStockLine: c => c.stock == null ? `${c.types} unit types listed` :
      c.pace != null ? `<b>${c.stock}</b> left · ${c.sold} sold since ${c.since} · <b>${c.pace}/wk</b>${c.sellOut ? ` · sells out in ~${c.sellOut} wk` : ''}`
      : c.sold != null ? `<b>${c.stock}</b> left · ${c.sold} sold since ${c.since}` : `<b>${c.stock}</b> left · tracking since ${c.since}`,
    nwSalesTip: `<div class="tip-h">Demand signals</div><ul class="tip-list">
      <li><span><b>Sell-through</b></span><span></span></li></ul>Units still listed are recorded every day; the drop is what sold. A fast pace (several a week) means the project is in demand — expect less negotiation and fewer good units left.
      <ul class="tip-list"><li><span><b>Phase prices</b></span><span></span></li></ul>Developers price in phases (第1期, 第2期…, then 最終期 or first-come 先着順). Prices for the same unit type rising between phases means strong demand; flat or lower means they need buyers — the best time to negotiate options or extras.
      <div class="tip-note">Both need a few days of history. Tracking started on the date shown; pace appears after 3 days.</div>`,
    nwIso: 'Seismic isolation', nwNoneInArea: 'No new condos for sale in this area right now',
    nwStatus: { set: 'All prices set', partial: 'Some prices set', tbd: 'Prices TBD' },
    nwCompleted: y => `Completed ${y ?? ''}`,
    nwValueTip: c => `<div class="tip-h">Value ${c.s}/25 — new-build premium</div>` +
      (c.ppm ? `Median of the priced units: <b>${c.approx ? '~' : ''}${c.ppm}万/m²</b>${c.approx ? ' (estimated from the price and size ranges)' : ''}.`
             : 'No prices announced yet → neutral 12/25.') +
      (c.bench.ppm ? `<br>Used condos ≤15 years old ${c.bench.scope === 'station' ? 'near ' + c.station : 'in ' + c.area} (${c.bench.n}): median <b>${c.bench.ppm}万/m²</b>` +
        (c.prem != null ? ` → premium <b>${c.prem >= 0 ? '+' : ''}${c.prem}%</b>.` : '.') : '') +
      `<div class="tip-note">Premium 0% → 20 · +10% → 15 · +20% → 11 · +43% → 0 · −10% → 25. New builds usually cost 10–25% more than a nearly-new resale — zero wear, latest specs, first pick of units — but that premium tends to disappear once you move in.</div>`,
    nwCertaintyTip: c => `<div class="tip-h">Certainty ${c.s}/15 — how much is still unknown</div><ul class="tip-list">
      <li><span>Prices: ${I18N.en.nwStatus[c.status]}</span><span>${{ set: 6, partial: 3, tbd: 0 }[c.status]}</span></li>
      <li><span>Fees announced</span><span>${c.fees ? 3 : 0}</span></li>
      <li><span>Move-in: ${c.when}</span><span>${c.move}</span></li></ul>
      <div class="tip-note">Pre-sale projects publish prices phase by phase (第1期, 第2期…); before that you can only register interest. Move-in: now 6 · ≤6 mo 5 · ≤12 4 · ≤18 3 · ≤24 2 · later 1.</div>`,
    nwRunningTip: c => `<div class="tip-h">Fees ${c.s}/15 — monthly running cost</div><ul class="tip-list">
      <li><span>管理費 (management)</span><span>${c.mgmt}</span></li><li><span>修繕積立金 (repair fund)</span><span>${c.repair}</span></li>
      <li><span>Upfront lump sums</span><span>${c.upfront}</span></li></ul>` +
      (c.eff ? `Scored on <b>¥${c.eff}/m²</b>: management + repair fund counted at no less than ¥250/m².` : 'Fees not announced → neutral 7/15.') +
      `<div class="tip-note">New buildings start the repair fund low (here ¥${c.repairM2 ?? '?'}/m²) and step it up, so the starting fee understates the real cost. ≤¥300/m² → 15, ≥¥600/m² → 0.</div>`,
    nwSpaceTip: c => `<div class="tip-h">Space ${c.s}/10</div>Unit sizes ${c.range[0] ?? '?'}–${c.range[1] ?? '?'} m²; largest ${c.max} m² → (largest − 50) ÷ 5.
      <div class="tip-note">Projects offer several sizes, so this rewards the option to go big — check the type table for what is actually still available.</div>`,
    nwProjectTip: (s, rows) => `<div class="tip-h">Project ${s}/15</div><ul class="tip-list">${rows || '<li><span>No bonuses</span><span>0</span></li>'}</ul>
      <div class="tip-note">Major-7 developer +3 · ≥300 units +2 / ≥100 +1 · parking for ≥50% of units +2 / ≥30% +1 · seismic isolation +2 · ZEH +2 · tower +1 · leasehold −3 · liquefaction high −2 / somewhat high −1. Kept within 0–15.</div>`,
    nwEx: { major: v => `Major developer (${v})`, units: n => `${n} units`, parkingRatio: p => `Parking for ${p}% of units`,
            seismicIso: 'Seismic isolation (免震)', zeh: 'ZEH / energy label', tower: n => `Tower (${n}F)`,
            leased: 'Leasehold land', liq: lv => `Liquefaction ${I18N.en.liq[lv]}` },
    allAreas: 'All areas', cmpTray: n => `${n} / 3 selected`, cmpNow: 'Compare now', cmpClear: 'Clear', cmpTitle: 'Comparison',
    cmpNeedTwo: 'Select at least 2 listings', cmpMax: 'You can compare up to 3 listings. Remove one first.',
    cmpSwitched: kind => `Compare list reset: ${kind === 'ms' ? 'apartments' : 'houses'} can't be compared with ${kind === 'ms' ? 'houses' : 'apartments'}.`,
    cmpLegend: '<b class="cmp-g">Green</b> = better, <b class="cmp-r">red</b> = worse among the selected. No colour = equal, not comparable or a matter of taste.',
    cmpDiffOnly: 'Differences only', cmpRemove: 'Remove', cmpClose: 'Close', cmpWins: n => `${n} better`,
    cmpHouseScoreNote: 'House scores are computed against all tracked houses here, so they can differ slightly from the filtered grid.',
    sec: { district: 'Area', timing: 'Timing', demand: 'Demand', price: 'Price & value', size: 'Size & layout', building: 'Building', costs: 'Running costs', access: 'Location & access',
           risk: 'Risk', features: 'Features & extras', listing: 'Listing', scores: 'Scores' },
    row: {
      district: 'Area', nwPriceFrom: 'Price from', nwPriceTo: 'Price up to', nwBandRow: 'Most common price band',
      nwPremiumRow: 'Premium vs recent used', nwStatus: 'Price status', nwTypesRow: 'Unit types / units', nwMoveIn: 'Move-in',
      nwCompletion: 'Completion', nwScheduleRow: 'Sales schedule', nwEffRow: 'Fees per m² (repair ≥ ¥250)', nwUpfront: 'Upfront lump sums',
      nwPhase: 'Sales phase', nwPhaseChange: 'Price change vs previous phase', nwStock: 'Units still listed',
      nwSoldWeek: 'Sold in last 7 days', nwPace: 'Sales pace (per week)',
      nwKindRow: 'Listing type', nwUnits: 'Units on sale', nwParkingRatio: 'Parking per unit', nwDev: 'Developer', nwIso: 'Seismic isolation',
      price: 'Price', ppm: '¥ per m²', vsSimilar: 'vs similar condos', monthly: 'All-in monthly (loan + fees + tax)', priceChange: 'Price change',
      area: 'Floor area', land: 'Land area', balcony: 'Balcony', layout: 'Layout', built: 'Built', age: 'Age', seismic: 'Seismic code',
      structure: 'Structure', floor: 'Floor', bldgFloors: 'Building height', units: 'Total units', facing: 'Facing',
      fees: 'Fees / month', mgmt: '管理費 (management)', repair: '修繕積立金 (repair fund)', feesM2: 'Fees per m²', repairM2: 'Repair fund per m²',
      station: 'Station', walk: 'To station', bus: 'Needs bus', liq: 'Liquefaction risk', elev: 'Elevator', pet: 'Pets allowed',
      parking: 'Parking', parkingFee: 'Parking fee (from)', reno: 'Renovated', rights: 'Land rights', gas: 'City gas',
      agents: 'Agents listing it', listed: 'Days listed', sameBldg: 'Other units in building', address: 'Address',
    },
    seismicNew: '新耐震 (1982+)', seismicOld: '旧耐震 (pre-1982)', rightsOwned: 'Owned (所有権)', rightsLeased: 'Leasehold',
    parkingKind: { onsite: 'On-site', full: 'On-site (waitlist)', building: 'In building', nearby: 'Nearby', other: 'Other', none: 'None', unknown: 'Not stated' },
    parkingCars: n => n ? `${n} car${n > 1 ? 's' : ''}` : 'None',
    notTracked: 'since tracking began',

    // ── trends ──
    trHouses: 'Houses', trApartments: 'Apartments', avgPrice: 'Average Price', avgPriceSub: '万円 · Mihama-ku listings',
    numListings: 'Number of Listings', uniqueProps: 'Unique properties tracked', medianPpm: 'Median Price per m²',
    medianPpmSub: '万円/m² · less skewed by mix than avg price', uniqueCondos: 'Unique condos tracked',
    latestAvg: 'Latest avg', latestCount: 'Latest count', latestMedian: 'Latest median', vsPrev: 'vs prev',
    collecting: 'Collecting data — check back tomorrow', listingsUnit: 'listings',
  },

  ja: {
    logoMain: '物件比較', logoSub: '日本の不動産', source: 'データ元：',
    tabApartments: '中古マンション', tabHouses: '中古一戸建て', tabTrends: '推移',
    themeTitle: 'ライト／ダーク切替', langTitle: '言語',
    hdrCount: (n, kind) => `<strong>${n}</strong>件の${kind === 'ms' ? 'マンション' : '一戸建て'}`,

    layout: '間取り', only: '絞り込み', sort: '並び替え', loan: '金利 %', area: 'エリア', all: 'すべて',
    loanTitle: '毎月の総額の計算に使う金利。頭金・返済期間・駐車場代などは「住宅ローン」タブで設定できます。',
    searchPh: '建物名・駅・住所…', reset: 'リセット', any: '指定なし',
    minSize: '最低面積', maxPrice: '上限価格', maxWalk: '駅徒歩', builtFrom: '築年',
    fmtMinM2: v => `${v}m²以上`, fmtMaxPrice: v => `${I18N.ja.priceMan(v)}以下`, fmtMaxWalk: v => `${v}分以内`, fmtYearFrom: v => `${v}年以降`,
    tShin: '新耐震（1982年以降）', tShinTitle: '1982年以降の建築：新耐震基準で、住宅ローン控除の対象',
    tWalk10: '駅徒歩10分以内', tElev: 'エレベーター', tPet: 'ペット可',
    tLiqLow: '液状化リスク低', tLiqLowTitle: '液状化の危険度が「高い」「やや高い」エリアの物件を除外',
    tCut: '値下げあり', tNew: '今週の新着', tNewTitle: '過去7日以内に初掲載',
    sScore: 'スコアが高い順', sDefault: '標準', sValue: '相場より割安な順',
    sPriceAsc: '価格が安い順', sPriceDesc: '価格が高い順', sPpm: '㎡単価が安い順',
    sMonthly: '毎月の総額が安い順', sFees: '㎡あたり管理費等が安い順', sArea: '面積が広い順',
    sAge: '築年数が新しい順', sWalk: '駅から近い順', sListed: '新着順', sDrop: '値下げ幅が大きい順',

    housesShown: '件の一戸建てを表示', apartmentsShown: '件のマンションを表示',
    medianNote: (m, ts) => `中央値 ${m}万円/㎡・坪単価 ${ts}万円`,
    showMore: (k, rest) => `さらに${k}件表示（残り${rest}件）`,
    emptyHouses: '条件に合う一戸建てはありません', emptyMs: '条件に合うマンションはありません',

    priceMan: man => {
      const oku = Math.floor(man / 10000), rest = man % 10000;
      return oku ? `${oku}億${rest ? rest.toLocaleString('ja-JP') + '万' : ''}円` : `${man.toLocaleString('ja-JP')}万円`;
    },
    price: man => I18N.ja.priceMan(man), priceShort: man => I18N.ja.priceMan(man),
    yen: v => Math.round(v).toLocaleString('ja-JP') + '円',
    tsubo: v => `${v}坪`, ageY: n => `築${n}年`, units: n => `総戸数${n}戸`, balcony: v => `バルコニー${v}m²`,
    newBuild: '新築', yearsOld: n => `築${n}年`,
    stationName: s => `${s}駅`, walkMin: n => `徒歩<strong>${n}分</strong>`, busWalkMin: n => `バス＋徒歩<strong>${n}分</strong>`,
    minShort: n => `${n}分`, perM2: v => `${v}/㎡`, floorN: n => `${n}階`,
    storeys: s => String(s).replace(/(\d+)F/, '$1階建'), bldgFloorsN: n => `${n}階建`,
    structure: s => ({ Wood: '木造', Steel: '鉄骨造', RC: 'RC造', SRC: 'SRC造' })[s] || s,
    facing: f => f || '—',
    yes: 'あり', no: 'なし', none: '—',

    taxNote: '税込',
    floorArea: '面積', landArea: '土地面積', buildingAge: '築年数', structureLbl: '構造',
    built: '築年月', feesMonth: '管理費・修繕積立金', estMonthly: '月々の目安', building: '建物', facingLbl: '向き',
    scoreBreakdown: 'スコア内訳', viewSuumo: 'SUUMOで見る', badgeNew: '新着', photoAlt: '物件写真',
    cmpAdd: '＋ 比較', cmpAdded: '✓ 比較中',
    cat: { value: '割安度', access: '交通', condition: '状態', running: '管理費', space: '広さ', extras: 'その他', certainty: '確実性', project: '物件' },
    catLong: { value: '割安度', access: '交通', condition: '状態（築年・耐震）', running: '管理費等', space: '広さ', extras: '設備・その他', certainty: '確実性', project: 'プロジェクト', total: '総合スコア' },
    dealBelow: v => `相場より${v}%割安`, dealAbove: v => `相場より${v}%割高`, dealFair: '相場並み',

    tagReno: 'リフォーム済', tagParkingN: n => `駐車${n}台`, tagLeasehold: '借地権', tagNoGas: '都市ガスなし',
    tagOldSeismic: '旧耐震', tagOldSeismicTitle: '1982年以前の建築：旧耐震基準、住宅ローン控除の対象外',
    tagLowRepair: '修繕積立金が低い', tagLowRepairTitle: v => `修繕積立金 ${v}円/㎡・月は目安を下回る：将来の値上げや一時金の可能性`,
    tagNoElev: f => `エレベーターなし・${f}階`, tagPets: 'ペット可', tagParkingFrom: fee => fee ? `駐車場 ${I18N.ja.yen(fee)}〜` : '駐車場あり',
    tagParkingTitle: '敷地内駐車場（最低料金）', tagNoParking: '駐車場なし',
    tagParkingFull: fee => `駐車場：空き待ち${fee ? '・' + I18N.ja.yen(fee) : ''}`,
    tagParkingFullTitle: '駐車場はあるが現在空きなし（空無）。空き待ちの登録が必要です',
    tagParkingBldg: fee => `駐車場あり（建物）${fee ? '・' + I18N.ja.yen(fee) + '〜' : ''}`,
    tagParkingBldgTitle: '同じ建物の他の物件で敷地内駐車場を確認。この物件は空き状況の記載なし',
    tagInBldg: n => `同じ建物に他${n}件`, tagAgents: n => `${n}社が掲載`, tagListed: d => `掲載${d}日目`,
    liqTag: lv => `液状化：${I18N.ja.liq[lv]}`, liqNA: '液状化：評価なし',
    liq: { high: '高い', mid: 'やや高い', low: '低い', vlow: '極めて低い' },

    tipTotal: (total, rows) => `<div class="tip-h">総合スコア ${total} / 100</div>各項目の合計：<ul class="tip-list">${rows}</ul>
      <div class="tip-note">緑 75以上・黄 55〜74・赤 55未満。各バーにカーソルを合わせると計算方法が表示されます。</div>`,
    tipPrice: (rows, total, pct, since) => `<div class="tip-h">価格の推移</div><ul class="tip-list">${rows}</ul>
      <div class="tip-note">${since}の初回記録から ${total}（${pct}）。毎日の取得時に価格変更を記録しています。</div>`,
    tipLiqNA: `<div class="tip-h">液状化：評価なし</div>このエリアにはハザードマップのデータ元がまだ設定されていません（areas.json → "liquefaction"）。`,
    tipLiq: c => `<div class="tip-h">液状化の危険度：${c.level}</div>
      ${c.place} の周辺${c.radius}m以内にある50mメッシュの割合
      （${c.block ? '番地レベルの住所' : '丁目の中心点。SUUMOには正確な地番がありません'}）：
      ${c.bar}<ul class="tip-list">${c.rows}</ul>
      <div class="tip-note"><b>意味：</b>${c.house
        ? '浅い基礎の木造住宅は傾き、修正に多額の費用がかかることがあります（2011年の美浜区で多発）。'
        : '杭基礎のRC造建物自体は傾きにくいものの、敷地・配管・駐車場・道路が被害を受け、修繕積立金に影響します。'}
      スコア：その他 −${c.penalty}。</div>
      <div class="tip-note">出典：${c.src}、想定地震は千葉市直下地震（M7.3）。湾岸部は埋立地で、2011年の長い揺れでは「低い」地域（例：美浜区磯辺）でも液状化が起きたため、相対的な目安としてご覧ください。
      <b>クリックすると、この地点の最新（令和7年度）公式マップを開きます。</b></div>`,
    tipLiqLandform: c => `<div class="tip-h">液状化の発生傾向：${c.level}</div>
      ${c.place} の周辺${c.radius}m以内の地形
      （${c.block ? '番地レベルの住所' : '丁目の中心点。SUUMOには正確な地番がありません'}）：
      <ul class="tip-list">${c.forms}</ul>${c.bar}<ul class="tip-list">${c.rows}</ul>
      <div class="tip-note"><b>評価方法：</b>国土地理院の地形分類が示す地形ごとの液状化の発生傾向を使用 ―
      盛土地・埋立地・旧河道・旧水部：非常に強い → <i>高い</i>、低地・浅い谷：強い → <i>やや高い</i>、
      台地：弱い → <i>低い</i>、山地・切土地 → <i>極めて低い</i>。${c.house
        ? '浅い基礎の木造住宅が最も影響を受けやすい。'
        : '杭基礎のRC造建物自体は傾きにくく、被害を受けるのは敷地・配管・道路です。'}スコア：その他 −${c.penalty}。</div>
      <div class="tip-note">出典：${c.src}（地形に基づく評価で、市の地震想定マップより粗い目安。この地域では利用できる市のマップがありません）。
      <b>クリックすると、この地点の地理院地図（地形分類）を開きます。</b></div>`,
    tipMonthly: c => `<div class="tip-h">月々の支払い目安</div><ul class="tip-list">
      <li><span>ローン ${c.price}・${c.years}年・金利${c.rate}%</span><span>${c.loan}</span></li>
      <li><span>管理費＋修繕積立金</span><span>${c.fees}</span></li>
      <li><b>合計</b><b>${c.total}</b></li></ul>
      <div class="tip-note">頭金なし（全額借入）を想定。金利は絞り込みバーで変更できます。
      固定資産税・保険・駐車場代・諸費用（価格の約6〜8%）は含みません。</div>`,
    accessScale: '基準：5分以内 20・10分以内 16・15分以内 12・20分以内 8・30分以内 4・それ以上 0',

    msValue: c => `<div class="tip-h">割安度 ${c.s}/25 ― 似た物件との価格比較</div>
      この物件は <b>${c.ppm}万円/㎡</b>。似た条件のマンション（${c.traits}）の相場は <b>約${c.exp}万円/㎡</b> なので、
      <b>${Math.abs(c.v) < 3 ? 'ほぼ相場並み' : Math.abs(c.v) + '%' + (c.v < 0 ? '割安' : '割高')}</b>です。<br>
      掲載中${c.n}件のうち、これより割安なのは${c.beat}% → 25 × ${100 - c.beat}% ≈ ${c.s}。
      <div class="tip-note">モデル：全掲載物件を対象に、㎡単価（対数）を築年数・築年数²・駅徒歩・所在階・駅・エリア・タワー（20階以上）・リフォーム（築10年以上）・エレベーターで回帰。大幅に割安な場合は、モデルでは分からない理由（室内状態・眺望・騒音など）がないか確認してください。</div>`,
    traits: { built: y => `${y}年築`, walk: (m, st, bus) => `${st}まで${bus ? 'バス含め' : '徒歩'}${m}分`, tower: 'タワー', reno: 'リフォーム済', elev: 'エレベーターあり', noElev: 'エレベーターなし' },
    msAccess: c => `<div class="tip-h">交通 ${c.s}/20 ― 駅までの距離</div>
      ${c.station}（${c.line}）まで${c.bus ? `バス＋徒歩で${c.walk}分（乗車時間＋バス停まで徒歩＋待ち約5分）` : `徒歩${c.walk}分`}。
      <div class="tip-note">${I18N.ja.accessScale}</div>`,
    msCondition: c => `<div class="tip-h">状態 ${c.s}/20 ― 築年数と耐震基準</div>
      <ul class="tip-list"><li><span>${c.year}年築（築${c.age}年・${c.shin ? '新耐震' : '旧耐震'}）</span><span>${c.base}/16</span></li>
      <li><span>リフォーム${c.note ? '：' + c.note : ''}</span><span>+${c.reno}</span></li></ul>
      <div class="tip-note">築年数：5年以内 16・10年 14・15年 12・20年 10・30年 7・それ以上（1982年以降）4・1982年以前 0。
      1982年以前の建物は旧耐震基準で、住宅ローン控除の対象外です。</div>`,
    msRunningNA: s => `<div class="tip-h">管理費等 ${s}/15</div>SUUMOに管理費の記載なし → 中間値 7/15。`,
    msRunning: c => `<div class="tip-h">管理費等 ${c.s}/15 ― 毎月のランニングコスト</div>
      <ul class="tip-list"><li><span>管理費</span><span>${c.mgmt}</span></li>
      <li><span>修繕積立金</span><span>${c.repair}</span></li>
      <li><b>㎡あたり</b><b>${c.perM2}円/㎡</b></li></ul>
      中央値は${c.med}円/㎡。これより㎡あたりが高い物件は${c.pct}% → 15 × ${c.pct}% ≈ ${c.s}。
      <div class="tip-note">所有している限り毎月かかり、通常は値上がりします。修繕積立金が極端に低い場合
      （${c.low}円/㎡未満。この物件は${c.repairM2}円/㎡）は、今は安くても将来負担が増えがちです。</div>`,
    msSpace: c => `<div class="tip-h">広さ ${c.s}/10 ― 専有面積</div>
      ${c.m2}m²（${c.tsubo}坪${c.balc ? `・バルコニー${c.balc}m²` : ''}）。
      掲載物件の${c.beat}%より広い → 10 × ${c.beat}% ≈ ${c.s}。
      <div class="tip-note">専有面積は通常「壁芯」表記で、登記簿面積は5〜8%ほど小さくなります。</div>`,
    msExtras: (s, rows) => `<div class="tip-h">設備・その他 ${s}/10</div><ul class="tip-list">${rows}</ul>
      <div class="tip-note">所在階 10階以上 +3／4階以上 +2／2階以上 +1・南向き +2・エレベーター +2・敷地内駐車場 +1・ペット可 +1・総戸数50戸以上 +1・
      借地権 −3・液状化 高い −2／やや高い −1。0〜10の範囲に収めます。</div>`,
    ex: {
      floor: f => `所在階 ${f ?? '?'}階`, south: f => `南向き（${f}）`, elevator: 'エレベーター',
      parking: p => ({ full: '駐車場（空き待ち）', building: '駐車場あり（建物）' })[p] || '敷地内駐車場', pet: 'ペット可', units: n => `総戸数${n}戸（50戸以上）`, leased: '借地権',
      liq: lv => `液状化の危険度 ${I18N.ja.liq[lv]}`,
    },

    hValue: c => `<div class="tip-h">割安度 ${c.s}/25 ― ㎡単価</div>
      この物件は建物面積あたり <b>${c.ppm}/㎡</b>。表示中の${c.n}件では ${c.min}〜${c.max}/㎡：最安が25、最高が0、その間は比例。
      <div class="tip-note">表示中の物件に対する相対値のため、絞り込むと変わります。</div>`,
    hAccess: c => `<div class="tip-h">交通 ${c.s}/20 ― 駅までの距離</div>
      ${c.station}（${c.line}）まで徒歩${c.walk}分。<div class="tip-note">${I18N.ja.accessScale}</div>`,
    hCondition: c => `<div class="tip-h">状態 ${c.s}/20 ― 築年数と構造</div>
      <ul class="tip-list"><li><span>築${c.age}年</span><span>${c.ageS}/12</span></li>
      <li><span>構造 ${c.str}</span><span>${c.strS}/8</span></li>
      <li><span>リフォーム</span><span>+${c.reno}</span></li></ul>
      <div class="tip-note">築年数：5年以内 12・10年 9・20年 6・30年 3・それ以上 1。構造：RC 8・鉄骨 6・木造 4。リフォーム +3。上限20。
      日本の木造住宅は20〜25年ほどで建物の価値がほぼなくなり、土地の価値が残ります。</div>`,
    hSpace: c => `<div class="tip-h">広さ ${c.s}/20 ― 建物面積</div>
      ${c.m2}m²（${c.tsubo}坪）。表示中の${c.n}件では ${c.min}〜${c.max}m²。最も広い物件が20、最も狭い物件が0、その間は比例。
      <div class="tip-note">表示中の物件に対する相対値です。</div>`,
    hExtras: c => `<div class="tip-h">設備・その他 ${c.s}/15</div><ul class="tip-list">
      <li><span>駐車場 ${c.park}台</span><span>+${c.parkS}</span></li>
      <li><span>${c.owned ? '所有権' : '借地権'}</span><span>+${c.rightsS}</span></li>
      <li><span>${c.gas ? '都市ガス' : 'プロパンガス'}</span><span>+${c.gasS}</span></li>
      <li><span>液状化 ${c.liq}</span><span>${c.liqP ? '−' + c.liqP : '0'}</span></li></ul>
      <div class="tip-note">駐車場1台 +5、2台以上 +8・所有権 +5・都市ガス +2（プロパンより安い）・液状化 高い −4／やや高い −2。0〜15の範囲に収めます。</div>`,

    // ── new condos ──
    cat_used: '中古', cat_new: '新築',
    nwCatNote: '新築＝分譲中のプロジェクト（期ごとに価格発表）＋新築未入居の住戸',
    nwPriced: '価格発表済み', nwPricedTitle: '価格が未定の物件を除外',
    nwReady: '即入居可', nwReadyTitle: '完成済み・すぐ引渡し',
    nwProjects: '分譲プロジェクト', nwProjectsTitle: 'デベロッパーが期ごとに販売する物件',
    nwUnsold: '新築未入居', nwUnsoldTitle: '完成後、誰も住んでいない住戸を仲介会社が販売',
    nwMajor: '大手デベロッパー', nwMajorTitle: 'メジャーセブン：住友不動産・大京・東急不動産・東京建物・野村不動産・三井不動産レジデンシャル・三菱地所レジデンス',
    nwSortPrice: '価格（下限）が安い順', nwSortPremium: '新築プレミアムが小さい順', nwSortMove: '入居が早い順',
    nwShown: '件の新築物件を表示', nwMoveBy: '入居まで',
    nwFmtMove: v => v === 0 ? '即入居' : `${v}か月以内`,
    nwPriceTBD: '価格未定', nwTBD: '未定', nwNone: 'なし', nwMoveNow: '即入居可',
    nwMoveAt: (y, m, mo) => `${y}年${m ?? '?'}月（${mo}か月後）`,
    nwBand: v => `最多価格帯：${v}`,
    nwPremium: p => `近隣の築浅中古より${p >= 0 ? '+' : ''}${p}%`,
    nwNoPremium: '価格未発表のため中古との比較不可',
    nwKind: { presale: '販売予定', onsale: '販売中', unsold: '新築未入居' },
    nwMoveIn: '入居時期', nwUnits: '販売戸数', nwTotal: '戸（総戸数）', nwUpfront: '一時金',
    nwUpfrontTip: '<div class="tip-h">引渡し時の一時金</div>修繕積立基金＋管理準備金。価格・諸費用とは別に引渡し時に支払います。新築プロジェクトでは通常30万〜150万円程度。新築未入居の再販住戸では通常不要（最初の所有者が支払済み）。',
    nwSpaces: '台', nwDev: '売主', nwSchedule: '販売：',
    nwTypes: (n, kind) => kind === 'unsold' ? `販売中 ${n}戸` : `間取りタイプ ${n}種`,
    nwColFloor: '階', nwColType: 'タイプ',
    nwAnnounced: '価格発表', nwPriceHist: '価格の推移', nwMajorTag: '大手デベロッパー',
    nwLowRepair: '修繕積立金が当初低め',
    nwLowRepairTip: v => `<div class="tip-h">当初の修繕積立金が低い</div>${v}円/㎡・月。国交省ガイドライン（約250〜340円）を大きく下回ります。新築は割安に見せるため低く設定し、段階的に値上げ（10〜20年で2〜4倍が多い）するのが一般的です。`,
    nwSales: '販売状況', nwSortPace: '売れ行きが速い順',
    nwPhaseLine: (label, prev, ch) => `販売期：<b>${label}</b>` +
      (ch != null ? ` ・ <span class="${ch > 0 ? 'deal-bad' : 'deal-good'}">${prev}比 ${ch > 0 ? '+' : ''}${ch}%</span>` : ''),
    nwStockLine: c => c.stock == null ? `掲載中の間取りタイプ ${c.types}種` :
      c.pace != null ? `残り<b>${c.stock}戸</b> ・ ${c.since}以降${c.sold}戸成約 ・ <b>週${c.pace}戸</b>${c.sellOut ? ` ・ 約${c.sellOut}週で完売見込み` : ''}`
      : c.sold != null ? `残り<b>${c.stock}戸</b> ・ ${c.since}以降${c.sold}戸成約` : `残り<b>${c.stock}戸</b> ・ ${c.since}から記録中`,
    nwSalesTip: `<div class="tip-h">需要のサイン</div><ul class="tip-list">
      <li><span><b>売れ行き</b></span><span></span></li></ul>掲載中の戸数を毎日記録し、減った分を成約とみなします。週に数戸のペースで減っていれば人気物件で、値引き交渉の余地や良い住戸は少なくなります。
      <ul class="tip-list"><li><span><b>期ごとの価格</b></span><span></span></li></ul>新築は期ごと（第1期・第2期…最終期、または先着順）に価格を発表します。同じタイプの価格が期を追って上がれば需要が強く、据え置き・値下げなら買い手が必要な状況で、オプションやサービスの交渉がしやすい時期です。
      <div class="tip-note">どちらも数日分の記録が必要です。記録開始日を表示し、ペースは3日後から表示します。</div>`,
    nwIso: '免震', nwNoneInArea: 'このエリアでは現在販売中の新築マンションはありません',
    nwStatus: { set: '全住戸価格決定', partial: '一部価格決定', tbd: '価格未定' },
    nwCompleted: y => `${y ?? ''}年完成済`,
    nwValueTip: c => `<div class="tip-h">割安度 ${c.s}/25 ― 新築プレミアム</div>` +
      (c.ppm ? `価格発表済み住戸の中央値：<b>${c.approx ? '約' : ''}${c.ppm}万円/㎡</b>${c.approx ? '（価格帯と面積帯から推定）' : ''}。`
             : '価格未発表のため中間値 12/25。') +
      (c.bench.ppm ? `<br>${c.bench.scope === 'station' ? c.station + '周辺' : c.area}の築15年以内の中古（${c.bench.n}件）：中央値 <b>${c.bench.ppm}万円/㎡</b>` +
        (c.prem != null ? ` → プレミアム <b>${c.prem >= 0 ? '+' : ''}${c.prem}%</b>。` : '。') : '') +
      `<div class="tip-note">プレミアム 0% → 20・+10% → 15・+20% → 11・+43% → 0・−10% → 25。新築は築浅中古より10〜25%高いのが一般的（未使用・最新仕様・住戸を選べる）ですが、入居後はこの上乗せ分が消えやすい点に注意。</div>`,
    nwCertaintyTip: c => `<div class="tip-h">確実性 ${c.s}/15 ― まだ分からないこと</div><ul class="tip-list">
      <li><span>価格：${I18N.ja.nwStatus[c.status]}</span><span>${{ set: 6, partial: 3, tbd: 0 }[c.status]}</span></li>
      <li><span>管理費等の発表</span><span>${c.fees ? 3 : 0}</span></li>
      <li><span>入居：${c.when}</span><span>${c.move}</span></li></ul>
      <div class="tip-note">販売予定の物件は期ごと（第1期・第2期…）に価格を発表し、それまでは要望書の受付のみです。入居：即 6・6か月以内 5・12か月 4・18か月 3・24か月 2・それ以上 1。</div>`,
    nwRunningTip: c => `<div class="tip-h">管理費等 ${c.s}/15 ― 毎月のランニングコスト</div><ul class="tip-list">
      <li><span>管理費</span><span>${c.mgmt}</span></li><li><span>修繕積立金</span><span>${c.repair}</span></li>
      <li><span>一時金</span><span>${c.upfront}</span></li></ul>` +
      (c.eff ? `評価は <b>${c.eff}円/㎡</b>：管理費＋修繕積立金（最低250円/㎡として計算）。` : '管理費未発表のため中間値 7/15。') +
      `<div class="tip-note">新築は修繕積立金を低く始めて段階的に上げるため（この物件は${c.repairM2 ?? '?'}円/㎡）、当初の金額は実際の負担を過小に見せます。300円/㎡以下 → 15、600円/㎡以上 → 0。</div>`,
    nwSpaceTip: c => `<div class="tip-h">広さ ${c.s}/10</div>住戸面積 ${c.range[0] ?? '?'}〜${c.range[1] ?? '?'}m²、最大${c.max}m² →（最大−50）÷5。
      <div class="tip-note">複数の広さから選べるため、広い住戸を選べる余地を評価しています。実際に残っている住戸はタイプ表で確認してください。</div>`,
    nwProjectTip: (s, rows) => `<div class="tip-h">プロジェクト ${s}/15</div><ul class="tip-list">${rows || '<li><span>加点なし</span><span>0</span></li>'}</ul>
      <div class="tip-note">メジャーセブン +3・総戸数300戸以上 +2／100戸以上 +1・駐車場設置率50%以上 +2／30%以上 +1・免震 +2・ZEH +2・タワー +1・借地権 −3・液状化 高い −2／やや高い −1。0〜15の範囲。</div>`,
    nwEx: { major: v => `大手デベロッパー（${v}）`, units: n => `総戸数${n}戸`, parkingRatio: p => `駐車場設置率${p}%`,
            seismicIso: '免震構造', zeh: 'ZEH・省エネ表示', tower: n => `タワー（${n}階建）`,
            leased: '借地権', liq: lv => `液状化 ${I18N.ja.liq[lv]}` },
    allAreas: 'すべてのエリア', cmpTray: n => `${n} / 3件を選択中`, cmpNow: '比較する', cmpClear: 'クリア', cmpTitle: '物件比較',
    cmpNeedTwo: '2件以上選択してください', cmpMax: '比較できるのは最大3件です。先に1件外してください。',
    cmpSwitched: kind => `比較リストをリセットしました：${kind === 'ms' ? 'マンション' : '一戸建て'}と${kind === 'ms' ? '一戸建て' : 'マンション'}は比較できません。`,
    cmpLegend: '<b class="cmp-g">緑</b>＝選択中の中で有利、<b class="cmp-r">赤</b>＝不利。色なし＝同じ・比較不可・好みによる項目。',
    cmpDiffOnly: '違いのみ表示', cmpRemove: '外す', cmpClose: '閉じる', cmpWins: n => `有利 ${n}項目`,
    cmpHouseScoreNote: '一戸建てのスコアはここでは全物件を基準に計算しているため、絞り込み中の一覧と少し異なる場合があります。',
    sec: { district: 'エリア', timing: '時期', demand: '需要', price: '価格・割安度', size: '広さ・間取り', building: '建物', costs: 'ランニングコスト', access: '立地・交通',
           risk: 'リスク', features: '設備・その他', listing: '掲載情報', scores: 'スコア' },
    row: {
      district: 'エリア', nwPriceFrom: '価格（下限）', nwPriceTo: '価格（上限）', nwBandRow: '最多価格帯',
      nwPremiumRow: '築浅中古との比較', nwStatus: '価格の状況', nwTypesRow: 'タイプ数・戸数', nwMoveIn: '入居時期',
      nwCompletion: '完成時期', nwScheduleRow: '販売スケジュール', nwEffRow: '㎡あたり管理費等（修繕250円以上）', nwUpfront: '一時金',
      nwPhase: '販売期', nwPhaseChange: '前期からの価格変化', nwStock: '掲載中の戸数',
      nwSoldWeek: '直近7日の成約', nwPace: '売れ行き（週あたり）',
      nwKindRow: '物件の種類', nwUnits: '販売戸数', nwParkingRatio: '駐車場設置率', nwDev: '売主', nwIso: '免震',
      price: '価格', ppm: '㎡単価', vsSimilar: '似た物件との比較', monthly: '毎月の総額（ローン＋管理費等＋税）', priceChange: '価格変更',
      area: '面積', land: '土地面積', balcony: 'バルコニー', layout: '間取り', built: '築年', age: '築年数', seismic: '耐震基準',
      structure: '構造', floor: '所在階', bldgFloors: '建物の階数', units: '総戸数', facing: '向き',
      fees: '管理費・修繕積立金（月）', mgmt: '管理費', repair: '修繕積立金', feesM2: '㎡あたり管理費等', repairM2: '㎡あたり修繕積立金',
      station: '最寄駅', walk: '駅まで', bus: 'バス利用', liq: '液状化の危険度', elev: 'エレベーター', pet: 'ペット',
      parking: '駐車場', parkingFee: '駐車場料金（最低）', reno: 'リフォーム', rights: '土地の権利', gas: '都市ガス',
      agents: '掲載会社数', listed: '掲載日数', sameBldg: '同じ建物の他の物件', address: '所在地',
    },
    seismicNew: '新耐震（1982年以降）', seismicOld: '旧耐震（1982年以前）', rightsOwned: '所有権', rightsLeased: '借地権',
    parkingKind: { onsite: '敷地内', full: '敷地内（空き待ち）', building: '建物にあり', nearby: '近隣', other: 'その他', none: 'なし', unknown: '記載なし' },
    parkingCars: n => n ? `${n}台` : 'なし',
    notTracked: '記録開始以前から掲載',

    trHouses: '中古一戸建て', trApartments: '中古マンション', avgPrice: '平均価格', avgPriceSub: '万円・美浜区の掲載物件',
    numListings: '掲載件数', uniqueProps: '重複を除いた物件数', medianPpm: '㎡単価の中央値',
    medianPpmSub: '万円/㎡・物件構成の偏りを受けにくい指標', uniqueCondos: '重複を除いたマンション数',
    latestAvg: '最新の平均', latestCount: '最新の件数', latestMedian: '最新の中央値', vsPrev: '前回比',
    collecting: 'データ収集中 ― 明日以降にご確認ください', listingsUnit: '件',
  },
};

let LANG = 'en';
try { if (localStorage.getItem('lang') === 'ja') LANG = 'ja'; } catch (e) {}

function t(key, ...args) {
  const path = key.split('.');
  let v = I18N[LANG], fb = I18N.en;
  for (const p of path) { v = v?.[p]; fb = fb?.[p]; }
  if (v === undefined) v = fb;                 // fall back to English
  return typeof v === 'function' ? v(...args) : (v ?? key);
}

/* ── Area map (map.js) ── */
I18N.en.tabMap = 'Area map';
I18N.ja.tabMap = 'エリアマップ';
I18N.en.map = {
  title: 'Where to live', sub: 'Commute to Tokyo Stn / Otemachi · kids 0–2 · condo 90 m²+',
  analysed: (n, s) => `<b>${n}</b> areas analysed · <b>${s}</b> shortlisted`,
  layers: { total: 'Overall', commute: 'Commute', childcare: 'Childcare', space: 'Space', growth: 'Growth', costco: 'Costco', bus: 'Bus', hazard: 'Safety', crime: 'Crime', live: 'Listings now' },
  layerDesc: {
    total: (w, custom) => `Weighted total of the seven sub-scores (${w}${custom ? ' — your weights' : ''}).`,
    commuteOffice: o => `Weekday 08:45-arrival train time to your office (${o}) from each area's main station (+5 min per transfer), adjusted for home-line crowding and pass price.`,
    live: 'Live count of used condos ≥90 m² under ¥80M on SUUMO (de-duplicated), refreshed daily. Not part of the score.',
    crime: 'Low-crime index from official police counts for 2025 (警視庁 / prefectural police): 60% home burglaries (空き巣 + 忍込み) per 10k residents, 40% violent crime (凶悪犯 + 粗暴犯) per 10k. Higher = safer. Saitama publishes no violent figures per city (burglary only there); Moriya and Tsukubamirai have no data. Not part of the score.',
    hazard: 'Natural-hazard exposure of residents: max-scenario flood / storm-surge / tsunami depth, liquefaction-prone landform, landslide zones, 30-yr quake probability. Higher = safer.',
    commute: 'Weekday 08:45-arrival train time to Tokyo Stn/Otemachi (+5 min per transfer), adjusted for line crowding and pass price.',
    childcare: '0–2 daycare fee, Tokyo cash benefits, daycare and 学童 waitlists, child medical copay, free school lunch.',
    space: 'Large condos you could actually buy, counted by age (age-weighted: 2000+ = 1, 1990s = 0.6, 1983–89 = 0.3, older = 0). 50% Price: what a 100 m² flat costs (weighted median ¥/m² of listings ≥90 m²). 50% Choice: how many of those listings are under ¥80M. Pre-1983 buildings are shown but not scored.',
    growth: 'Population change 2020→25, IPSS 2050 projection, land-price trend, child share, pipeline projects.',
    costco: 'Estimated drive time to the nearest Costco warehouse (≤15 min = 100, ≥75 min = 0).',
    bus: 'Weekday highway buses to Tokyo Station usable for commuting (morning in, evening out).',
  },
  shortOnly: 'Shortlist only', showCostco: 'Costco', showBus: 'Bus routes', showRanks: 'Ranks',
  legendLow: 'weaker', legendHigh: 'stronger', notAnalysed: 'not analysed', belowGate: 'below space gate', outsideTop: n => `outside top ${n}`,
  outsideTopTip: n => `Not in the top ${n} by total score. Space passes the gate (enough buyable 90 m²+ stock); the other parts of the score keep it lower — see the bars.`,
  back: 'All areas', rankOf: (r, n) => `#${r} of ${n}`, layerRank: (r, l) => `#${r} in ${l}`, overallRank: r => `overall #${r}`, shortlisted: 'Shortlisted', gated: 'Below space gate',
  gatedTip: 'Scores well overall but has almost no 90 m²+ condo stock at a reachable price.',
  total: 'Total', weight: w => `weight ${w}`, sortedBy: l => `Ranked by ${l}`,
  pros: 'Pros', cons: 'Cons', info: 'Info', nothing: 'Nothing in this category.',
  cats: { all: 'All', commute: 'Commute', bus: 'Bus', childcare: 'Childcare', housing: 'Housing', growth: 'Growth', costco: 'Costco', hazard: 'Hazards', crime: 'Crime', data: 'Data notes' },
  sp: {
    head: (v, pp, cp) => `Space ${v} = ½ × Price ${pp} + ½ × Choice ${cp}`,
    price: (p, n, thin) => `Price ${p} for 100 m²: weighted median ¥/m² of listings ≥90 m² (weight ${n}; age-weighted: 2000+ = 1, 1990s = 0.6, 1983–89 = 0.3, older = 0), × 100${thin ? ' (thin sample)' : ''}. Scale: ¥30M = 100 pts … ¥150M = 0`,
    priceNone: 'Price: no listing ≥90 m² built 1983+ → 0 pts',
    choice: u => `Choice: ${u} (age-weighted) of those listings under ¥80M. Scale: 0 = 0, 10 = 58, 20 = 74, 60+ = 100 pts`,
    old: (n, m) => `All ages: ${n} listings ≥90 m² under ¥80M, ${m} of them built 2000+ (full weight); 1990s count 0.6, 1983–89 0.3, older 0`,
    src: 'SUUMO asking prices, crawl 2026-10-12, de-duplicated',
    short: (p, pp, u, cp) => `Price ${p}/100 m² → ${pp} pts · Choice ${u} under ¥80M → ${cp} pts`,
    row: (p, u) => `${p}/100 m² · ${u} under ¥80M`,
    budgetLive: d => `(your budget, SUUMO listings ${d})`,
  },
  crime: {
    title: 'Crime (police, 2025)', notScored: 'not in score', idx: (r, n) => `#${r}/${n} safest`,
    burg: 'Home burglaries', viol: 'Violent crime', all: 'All recorded crime',
    cases: n => `${n.toLocaleString()} cases`, rankTip: (r, n) => `#${r} lowest of ${n} areas (bar = share of areas with more crime)`,
    notPub: 'not published per city', noData: 'no official data',
    note: 'Per resident, counted where the crime happened. Home burglaries (空き巣 + 忍込み) are the best guide for families.',
    hub: 'Commercial hub: commuters and shoppers inflate the per-resident rates; home burglaries are the better guide for residents.',
  },
  kpi: { commute: 'to Tokyo', office: o => `to ${o}`, large: 'modern 100 m²', daycare: '0–2 daycare', costco: 'to Costco' },
  pers: {
    button: 'Personalise', office: 'Your office', officeDefault: 'Tokyo Stn / Otemachi (study default)',
    walkHome: 'Walk home → station (min)', walkOffice: 'Walk station → office (min)',
    officeNote: d => `Train times from each area's main station, Yahoo!乗換案内 arrive-by 08:45 on ${d}. Walking minutes only change the door-to-door estimate, not the score.`,
    noMatrix: 'Office matrix not built yet — run commute_matrix.py.',
    weights: 'Weights', reset: 'Reset', weightsNote: 'Totals, ranks and the shortlist update live. Saved in this browser only.',
    budget: 'Budget', budgetLbl: 'Max price',
    budgetNote: 'Space “Choice” counts listings ≥90 m² under this price (age-weighted: 2000+ = 1, 1990s = 0.6, 1983–89 = 0.3), from today’s SUUMO list. The price half of Space is unchanged. At ¥80M the study snapshot is used.',
  },
  cmp: {
    add: 'Compare', in: 'In comparison', tray: n => `Compare ${n}/3`, go: 'Compare', title: 'Area comparison',
    custom: 'your weights / office', best: 'best', worst: 'worst', open: 'Open on map', remove: 'Remove',
    xfer: n => n ? `${n} transfer${n > 1 ? 's' : ''}` : 'direct',
    pedsSub: (d, all) => `${d} dedicated · ${all} total`, noiseNone: 'none found',
    noise_hanedaS: 'Haneda arrivals (low)',
    noise_hanedaSHigh: 'Haneda arrivals (high)',
    noise_hanedaN: 'Haneda departures (Arakawa)',
    noise_hanedaB: 'Haneda B departures',
    noise_hanedaChiba: 'Haneda routes over Chiba',
    noise_shimofusa: 'Shimofusa air base',
    noise_atsugi: 'Atsugi (edge only)',
    noise_kisarazu: 'Camp Kisarazu',
    noise_tachikawa: 'Tachikawa airfield',
    sec: { scores: 'Scores', commute: 'Commute', childcare: 'Childcare', housing: 'Housing (asking prices)', hazard: 'Natural hazards', crime: 'Crime (police, 2025)', growth: 'Growth', costco: 'Costco' },
    r: { rank: 'Rank', office: o => `To ${o}`, officePass: 'Pass to office (1 month)', door: 'door-to-door', toTokyo: 'To Tokyo Stn / Otemachi',
      crowding: 'Peak crowding', pass: 'Pass to Tokyo (1 month)', bus: 'Commuter buses AM / PM', daycare: '0–2 daycare / month',
      waitlist: 'Daycare waitlist', gakudo: '学童 waitlist', pedsNear: 'Kids ≤1 km from a paediatric clinic', pedsPer10k: '小児科 facilities / 10k kids', medical: 'Child medical (age · ¥/visit)', median: '90–105 m² median',
      modern: 'Built 2000+ 90–110 m² median', scorePrice: 'Modern 100 m² price (scored)', pool: 'Modern 90 m²+ under ¥80M (scored)', poolAll: '90 m²+ under ¥80M, any age', share: 'Share of listings 90 m²+', land: 'Residential land',
      liveN: '90 m²+ under ¥80M — live / all ≥90', liveMedian: '90–105 m² median — live', projects: 'New-condo projects on sale', fees: 'Monthly fees 管理費+修繕 (watchlist)',
      water: 'Residents in flood/surge/tsunami zones', deep: 'Residents in ≥3 m zones', liq: 'Liquefaction-prone ground', slide: 'Landslide zones',
      quake: '30-yr P(震度6弱+)', noise: 'Aircraft noise', burg: 'Home burglaries / 10k residents', viol: 'Violent crime / 10k residents', crimeAll: 'All recorded crime / 1k residents', pop: 'Population 2020→25', ipss: 'IPSS 2050', kids: 'Share aged 0–14', costco: 'Costco drive' },
  },
  np: {
    title: 'New developments on sale', sum: (b, n) => `${b} with plans of 90 m²+ · ${n} new this month`,
    tba: 'Price TBA', big: '90 m²+', deliv: d => `ready ${d.replace(/(\d{4})年(\d{1,2})月(上旬|中旬|下旬|末)?/, (m, y, mo, p) => (p === '上旬' ? 'early ' : p === '中旬' ? 'mid ' : p ? 'late ' : '') + new Date(y, mo - 1).toLocaleString('en', { month: 'short' }) + ' ' + y)}`, units: n => `${n} homes`, none: 'No new-condo projects on sale right now.',
    note: u => `Developer projects on SUUMO, all phases (prices and sizes span every plan; refreshed daily).${u ? ` Plus ${u} completed-but-unsold new unit${u === 1 ? '' : 's'} (新築未入居).` : ''}`,
    suumo: 'All on SUUMO',
  },
  ls: {
    title: 'For sale now · 90 m²+', sum: (u, n, c) => `${u} under ¥80M · ${n} new this week · ${c} price cuts`,
    all: 'All prices', under: 'Under ¥80M', sort: 'Sort', sorts: { price: 'Price ↑', size: 'Size ↓', ppm: '¥/m² ↑', year: 'Newest building', new: 'Newly listed' },
    okTip: 'Under the ¥80M budget line', overTip: 'Over the ¥80M budget line', new: 'NEW', wasTip: p => `First seen at ${p}`,
    walk: m => `${m} min walk`, bus: 'bus', more: n => `Show all ${n}`, less: 'Show fewer',
    loading: 'Loading listings…', failed: 'Listings could not be loaded.', none: 'No listing data for this area yet.', noneUnder: 'Nothing under ¥80M right now.',
    note: d => `SUUMO used condos, one row per unit (same unit from several agents merged), updated daily — ${d}. Asking prices; the badge compares with the ¥80M line.`,
    watch: 'This area is on the watchlist: the Apartments tab has the full scored list (80 m²+).',
  },
  sources: 'Sources', openListings: 'Open tracked listings for this area',
  free: 'Free', min: 'min', perMonth: '/mo', unknown: '—',
  prefs: { Tokyo: 'Tokyo', Chiba: 'Chiba', Saitama: 'Saitama', Kanagawa: 'Kanagawa', Ibaraki: 'Ibaraki' },
  types: { ku: 'ward', shi: 'city' },
  tokyoStation: 'Tokyo Station', costcoTip: (n, y) => `Costco ${n} (since ${y})`, busTip: n => `Commuter bus stop: ${n} → Tokyo Stn`,
  dest: { Tokyo: 'Tokyo Stn', Otemachi: 'Otemachi' },
  yenM: v => `¥${(v / 1e6).toFixed(v >= 1e8 ? 0 : 1)}M`,
  yen: v => `¥${Math.round(v).toLocaleString('en')}`,
  foot: 'Study date 2026-10-12. Asking prices from SUUMO; childcare for a ¥10M dual-income family. Boundaries: 国土数値情報 N03.',
  r: {
    commuteTime: (m, st, tr, dest) => `${m} min to ${dest} from ${st}` + (tr ? `, ${tr} transfer${tr > 1 ? 's' : ''}` : ', no transfer'),
    crowdLow: l => `Comfortable line at peak: ${l}`, crowdHigh: l => `Very crowded at peak: ${l}`, crowdMid: l => `Peak crowding ${l}`,
    passHigh: y => `Expensive commuter pass: ${y}/month`, pass: y => `1-month commuter pass ${y}`,
    busGood: (r, m, e) => `Commuter bus: ${m} morning / ${e} evening runs — ${r}`,
    busThin: (r, m, e) => `Token bus only (${m ?? '?'} AM / ${e ?? '?'} PM): ${r}`,
    busUnverified: r => `Bus route exists, timetable unverified: ${r}`,
    busFare: (f, p, ride) => `Bus ride ${ride} min · fare ${f}` + (p ? ` · pass ${p}/month` : ''),
    busNone: 'No weekday commuter bus to Tokyo Station',
    dayFree: '0–2 認可 daycare is free', dayFee: (y, est) => `0–2 daycare ≈ ${y}/month (1st child)` + (est ? ' — estimate' : ''),
    feeNote: s => `Fee note: ${s}`,
    wait0: 'No daycare waitlist (Apr 2026)', waitHigh: n => `Daycare waitlist: ${n} children (Apr 2026)`, waitSome: n => `Daycare waitlist: ${n} (Apr 2026)`,
    gakudo0: 'No after-school (学童) waitlist', gakudoHigh: n => `After-school (学童) waitlist: ${n}`, gakudoSome: n => `After-school (学童) waitlist: ${n}`,
    gakudoSmall: 'After-school (学童) waitlist under 50',
    medGood: 'Child medical free up to age 18', medCopay: (a, c) => `Child medical to age ${a}, ¥${c}/visit`,
    medShort: (a, c) => `Child medical only to age ${a}` + (c ? `, ¥${c}/visit` : ''),
    lunchFree: 'Free school lunch through junior high', lunch: s => `School lunch: ${s}`,
    tokyoCash: 'Tokyo cash: ¥5,000/month per child (018) + ¥130k birth gift', extras: s => `Local extras: ${s}`,
    peds: (near, ded, all, p10k) => `${near}% of children live ≤1 km from a dedicated paediatric clinic (${ded} dedicated · ${all} facilities offering 小児科 · ${p10k} per 10k children; MLIT data 2020)`,
    shareHigh: s => `${s}% of used listings are 90 m²+`, shareLow: s => `Only ${s}% of listings are 90 m²+`,
    poolBig: (n, m) => `${n} listings of 90 m²+ under ¥80M (${m} built 2000+)`, poolSmall: n => `Only ${n} listings of 90 m²+ under ¥80M`,
    poolMid: (n, m) => `${n} listings of 90 m²+ under ¥80M (${m} built 2000+)`,
    priceLow: p => `Large condos are affordable: 90–105 m² median ${p}`, priceHigh: p => `Large condos are expensive: 90–105 m² median ${p}`,
    price: p => `90–105 m² median asking price ${p}`, modern: (p, n) => `Built-2000+ 90–110 m² median ${p} (n=${n})`,
    modernHigh: (p, n) => `Modern large units are pricey: built-2000+ 90–110 m² median ${p} (n=${n})`,
    modernLow: (p, n) => `Modern large units are cheap: built-2000+ 90–110 m² median ${p} (n=${n})`,
    noLarge: 'No 90 m²+ condo listings found (Oct 2026)',
    spNone: 'No condo ≥90 m² built 1983+ listed: large flats here are old-seismic-code buildings',
    spChoiceBig: (u, q) => `Plenty of choice: ${u} age-weighted listings ≥90 m² under ¥80M (${q} at any price)`,
    spChoiceSmall: (u, q) => `Little choice: only ${u} age-weighted listing${u === 1 ? '' : 's'} ≥90 m² under ¥80M (${q} at any price)`,
    spChoice: (u, q) => `${u} age-weighted listings ≥90 m² under ¥80M (${q} at any price)`,
    spPriceLow: p => `Large flats are affordable: ~${p} for 100 m² (age-weighted)`,
    spPriceHigh: p => `Large flats are expensive: ~${p} for 100 m² (age-weighted)`,
    spPrice: p => `100 m² flat ~${p} (age-weighted)`,
    spOld: (n, m) => `All ages: ${n} listings ≥90 m² under ¥80M, ${n - m} of them built before 2000 (count 0.6 if 1990s, 0.3 if 1983–89, 0 if older)`,
    land: (y, c) => `Residential land ${y}/m²` + (c != null ? ` (${c > 0 ? '+' : ''}${c}% in 5 years)` : ''),
    popUp: c => `Growing: population +${c}% (2020→25)`, popDown: c => `Shrinking: population ${c}% (2020→25)`, pop: c => `Population ${c > 0 ? '+' : ''}${c}% (2020→25)`,
    ipssUp: c => `Projected +${c}% by 2050 (IPSS)`, ipssDown: c => `Projected ${c}% by 2050 (IPSS)`, ipss: c => `Projected ${c > 0 ? '+' : ''}${c}% by 2050 (IPSS)`,
    kidsHigh: s => `Family area: ${s}% of residents are 0–14`, kids: s => `${s}% of residents are 0–14`,
    pipe: (n, p, done) => `${p <= 0 ? 'Setback' : done ? 'Recent' : 'Coming'}: ${n} (${p > 0 ? '+' : ''}${p} growth pts)`,
    costcoNear: (n, m) => `Costco ${n} ≈ ${m} min drive`, costcoFar: (n, m) => `Nearest Costco (${n}) ≈ ${m} min drive`, costco: (n, m) => `Costco ${n} ≈ ${m} min drive`,
    waterLow: p => `Mostly outside flood zones: ${p}% of residents in any max-scenario flood/surge/tsunami zone`,
    waterHigh: p => `${p}% of residents live in a max-scenario flood/surge/tsunami zone`,
    water: p => `${p}% of residents in a max-scenario flood/surge/tsunami zone`,
    waterDeep: p => `${p}% of residents in zones that could flood 3 m or deeper`,
    waterMix: (f, s, ts) => `Flood ${f}% · storm surge ${s}% · tsunami ${ts}% of residents (≈1/1000-yr scenarios)`,
    liqHigh: p => `Liquefaction-prone ground: ${p}% of residents on reclaimed land/former wetland`,
    liqLow: p => `Firm ground: only ${p}% of residents on liquefaction-prone landform`,
    liq: p => `${p}% of residents on liquefaction-prone landform`,
    fillUpland: p => `${p}% of residents on fill over hills/valleys (collapse risk in quakes — check the city's 大規模盛土造成地 map)`,
    slideRed: p => `${p}% of residents in a landslide special warning zone (red)`,
    slide: p => `${p}% of residents in a landslide warning zone`,
    quakeHigh: p => `High quake probability: ${p}% chance of 震度6弱+ in 30 years`,
    quakeLow: p => `Lower quake probability: ${p}% chance of 震度6弱+ in 30 years`,
    quake: p => `${p}% chance of 震度6弱+ in 30 years`,
    burgLow: (r, n) => `Few home burglaries: ${r} per 10k residents (${n} 空き巣/忍込み in 2025, police data)`,
    burgHigh: (r, n) => `Many home burglaries: ${r} per 10k residents (${n} 空き巣/忍込み in 2025, police data)`,
    burg: (r, n) => `Home burglaries: ${r} per 10k residents (${n} 空き巣/忍込み in 2025, police data)`,
    violLow: (r, n) => `Little violent crime: ${r} per 10k residents (${n} 凶悪犯/粗暴犯 in 2025)`,
    violHigh: (r, n) => `High violent crime: ${r} per 10k residents (${n} 凶悪犯/粗暴犯 in 2025), concentrated in station and nightlife districts`,
    viol: (r, n) => `Violent crime: ${r} per 10k residents (${n} 凶悪犯/粗暴犯 in 2025)`,
    violNA: 'Violent crime: not published per city by this prefecture\u2019s police',
    crimeTotal: (r, n) => `All recorded crime: ${r} per 1,000 residents (${n} in 2025)`,
    crimeHub: (r, n) => `All recorded crime: ${r} per 1,000 residents (${n} in 2025), inflated by commuters and shoppers in a commercial hub; burglary is the better guide for residents`,
    crimeNA: 'Crime: no official per-city figures available (Ibaraki police statistics site offline)',
    crimeSrc: 'Police crime statistics',
    fees: (y, m2, n) => `Running costs: median ${y}/month 管理費 + 修繕積立金 (¥${m2}/m²) across ${n} listed condos ≥90 m² built 2000+`,
    feesAll: (y, m2, n) => `Running costs: median ${y}/month 管理費 + 修繕積立金 (¥${m2}/m²) across ${n} listed condos ≥90 m² (none built 2000+ listed)`,
    hazardMap: 'Open the official hazard map here', noiseSrc: 'Aircraft-noise source',
    noise_hanedaS: 'Aircraft noise: Haneda new arrival route overhead at low altitude (south wind, 15–19 h, ~3 h/day)',
    noise_hanedaSHigh: 'Aircraft noise: Haneda new arrival route overhead, higher than over central Tokyo (south wind, 15–19 h)',
    noise_hanedaN: 'Aircraft noise: Haneda new departure route along the Arakawa (north wind, 7–11:30 & 15–19 h)',
    noise_hanedaB: 'Aircraft noise: Haneda B-runway departures over the waterfront (south wind)',
    noise_hanedaChiba: 'Aircraft noise: under Haneda’s conventional routes over Chiba (MLIT monitoring station in the city)',
    noise_shimofusa: 'Aircraft noise: JMSDF Shimofusa air base training flights',
    noise_atsugi: 'Aircraft noise: Atsugi sound-proofing zone reaches only 金森5・6丁目',
    noise_kisarazu: 'Aircraft noise: JGSDF Camp Kisarazu (helicopters; V-22 depot)',
    noise_tachikawa: 'Aircraft noise: JGSDF Tachikawa airfield (helicopters); USAF Yokota ≈5 km west',
    door: (m, h, o) => `Door-to-door ≈ ${m} min (incl. ${h} + ${o} min walking)`,
    officeMissing: 'No train time to your office for this area (query failed) — Tokyo figures used',
    yahoo: o => `Check the route to ${o} on Yahoo!乗換案内`,
    liveNow: (d, n, u, m, k) => `Live on SUUMO (${d}): ${n} used condos ≥90 m², ${u} under ¥80M` + (m ? ` · 90–105 m² median ${m} (n=${k})` : ''),
    liveTrend: (days, dn, du) => `Last ${days} days: ${dn >= 0 ? '+' : ''}${dn} listings ≥90 m² (${du >= 0 ? '+' : ''}${du} under ¥80M)`,
    newProjects: (n, names) => `${n} new-condo project${n > 1 ? 's' : ''} on sale now: ${names}`,
    noNewProjects: u => `No new-condo project on sale now` + (u ? ` (${u} never-occupied units resold)` : ''),
  },
};
I18N.ja.map = {
  title: '住む場所を探す', sub: '東京駅・大手町へ通勤 ・ 0〜2歳児 ・ 90㎡以上のマンション',
  analysed: (n, s) => `<b>${n}</b>エリアを分析 ・ <b>${s}</b>エリアを候補に選定`,
  layers: { total: '総合', commute: '通勤', childcare: '子育て', space: '広さ', growth: '成長性', costco: 'コストコ', bus: 'バス', hazard: '安全性', crime: '治安', live: '現在の掲載' },
  layerDesc: {
    total: (w, custom) => `7つのサブスコアの加重合計（${w}${custom ? '・カスタム配点' : ''}）。`,
    commuteOffice: o => `各エリアの代表駅から勤務先（${o}）まで平日8:45着の所要時間（乗換1回＝+5分）。混雑率と定期代で補正。`,
    live: 'SUUMOに掲載中の90㎡以上・8,000万円未満の中古マンション数（重複除去、毎日更新）。スコアには含まない。',
    crime: '警察の2025年認知件数（警視庁・各県警）による治安指数：住宅侵入（空き巣＋忍込み）人口1万人あたり 60%、凶悪犯＋粗暴犯 人口1万人あたり 40%。高いほど安全。埼玉県は市町村別の凶悪犯・粗暴犯を公表していないため侵入のみ。守谷市・つくばみらい市はデータなし。スコアには含まない。',
    hazard: '住民の災害リスク：想定最大規模の洪水・高潮・津波の浸水深、液状化しやすい地形、土砂災害警戒区域、30年地震確率。高いほど安全。',
    commute: '平日8:45着で東京駅／大手町までの所要時間（乗換1回＝+5分）。混雑率と定期代で補正。',
    childcare: '0〜2歳の保育料、東京都の給付、待機児童・学童待機、子ども医療費の自己負担、給食費無償化。',
    space: '実際に買える広いマンション（築年で重み付け：2000年以降＝1、1990年代＝0.6、1983〜89年＝0.3、それ以前＝0）。50％ 価格：100㎡の価格（90㎡以上の掲載の重み付き㎡単価中央値×100）。50％ 選択肢：そのうち8,000万円未満の件数（重み付き）。1983年より前の物件は表示のみで採点しない。',
    growth: '人口増減（2020→25）、社人研2050年推計、地価の推移、年少人口割合、開発計画。',
    costco: '最寄りのコストコまでの推定車移動時間（15分以内＝100、75分以上＝0）。',
    bus: '通勤に使える平日の東京駅行き高速バス（朝の上り・夕方の下り）。',
  },
  shortOnly: '候補のみ', showCostco: 'コストコ', showBus: 'バス路線', showRanks: '順位',
  legendLow: '弱い', legendHigh: '強い', notAnalysed: '分析対象外', belowGate: '広さ基準未満', outsideTop: n => `上位${n}位圏外`,
  outsideTopTip: n => `総合点で上位${n}位に入っていません。広さ基準（買える90㎡以上の在庫）は満たしていますが、他の項目の点数が低めです（バーを参照）。`,
  back: '全エリア', rankOf: (r, n) => `${n}エリア中 ${r}位`, layerRank: (r, l) => `${l} ${r}位`, overallRank: r => `総合 ${r}位`, shortlisted: '候補', gated: '広さ基準未満',
  gatedTip: '総合点は高いが、手の届く価格の90㎡以上のマンションがほぼない。',
  total: '総合', weight: w => `配点 ${w}`, sortedBy: l => `${l}順`,
  pros: '長所', cons: '短所', info: '情報', nothing: 'このカテゴリーには項目がありません。',
  cats: { all: 'すべて', commute: '通勤', bus: 'バス', childcare: '子育て', housing: '住宅', growth: '成長性', costco: 'コストコ', hazard: '災害リスク', crime: '治安', data: 'データ注記' },
  sp: {
    head: (v, pp, cp) => `広さ ${v} ＝ ½×価格 ${pp} ＋ ½×選択肢 ${cp}`,
    price: (p, n, thin) => `価格：100㎡で ${p}（90㎡以上の掲載の重み付き㎡単価中央値×100、重み合計${n}・築年で重み付け：2000年以降＝1、1990年代＝0.6、1983〜89年＝0.3、それ以前＝0）${thin ? '・件数少' : ''}。3,000万円＝100点〜1.5億円＝0点`,
    priceNone: '価格：90㎡以上・1983年以降築の掲載なし → 0点',
    choice: u => `選択肢：そのうち8,000万円未満が${u}件（築年で重み付け）。0件＝0・10件＝58・20件＝74・60件以上＝100点`,
    old: (n, m) => `築年問わず：8,000万円未満の90㎡以上 ${n}件（うち2000年以降築 ${m}件＝重み1、1990年代0.6、1983〜89年0.3、それ以前0）`,
    src: 'SUUMO売出価格、2026-10-12取得、重複除去',
    short: (p, pp, u, cp) => `価格 ${p}/100㎡ → ${pp}点・選択肢 ${u}件 → ${cp}点`,
    row: (p, u) => `${p}/100㎡・8,000万円未満 ${u}件`,
    budgetLive: d => `（あなたの予算、SUUMO掲載 ${d}）`,
  },
  crime: {
    title: '治安（警察 2025年）', notScored: 'スコア対象外', idx: (r, n) => `${n}中 安全な方から${r}位`,
    burg: '住宅侵入', viol: '凶悪犯・粗暴犯', all: '刑法犯総数',
    cases: n => `${n.toLocaleString()}件`, rankTip: (r, n) => `${n}地域中 少ない方から${r}位（バー＝これより犯罪が多い地域の割合）`,
    notPub: '市町村別の公表なし', noData: '公式データなし',
    note: '人口あたり、発生地で計上。家族には住宅侵入（空き巣＋忍込み）が最も参考になる。',
    hub: '商業地：通勤・買物客のため人口あたりの値が高め。居住者には住宅侵入の方が目安になる。',
  },
  kpi: { commute: '東京まで', office: o => `${o}まで`, large: '築浅100㎡', daycare: '0〜2歳 保育料', costco: 'コストコまで' },
  pers: {
    button: 'カスタマイズ', office: '勤務先', officeDefault: '東京駅／大手町（調査の既定）',
    walkHome: '自宅→駅 徒歩（分）', walkOffice: '駅→勤務先 徒歩（分）',
    officeNote: d => `各エリアの代表駅からの乗車時間（Yahoo!乗換案内、${d} 8:45着）。徒歩分数はドアtoドアの目安のみに反映し、スコアには影響しません。`,
    noMatrix: '勤務先マトリクス未作成（commute_matrix.py を実行）。',
    weights: '配点', reset: 'リセット', weightsNote: '総合点・順位・候補がすぐに更新されます。設定はこのブラウザにのみ保存。',
    budget: '予算', budgetLbl: '上限価格',
    budgetNote: '広さの「選択肢」は、この価格未満の90㎡以上の物件数（築年で重み付け：2000年以降＝1、1990年代＝0.6、1983〜89年＝0.3、本日のSUUMO掲載）で再計算。広さの価格部分は変わりません。8,000万円では調査時点の値を使用。',
  },
  cmp: {
    add: '比較', in: '比較中', tray: n => `比較 ${n}/3`, go: '比較する', title: 'エリア比較',
    custom: 'カスタム配点／勤務先', best: '最良', worst: '最下位', open: '地図で開く', remove: '外す',
    xfer: n => n ? `乗換${n}回` : '乗換なし',
    pedsSub: (d, all) => `専門 ${d}・計 ${all}`, noiseNone: '該当なし',
    noise_hanedaS: '羽田到着（低高度）',
    noise_hanedaSHigh: '羽田到着（高高度）',
    noise_hanedaN: '羽田出発（荒川沿い）',
    noise_hanedaB: '羽田B滑走路出発',
    noise_hanedaChiba: '羽田従来経路（千葉）',
    noise_shimofusa: '下総航空基地',
    noise_atsugi: '厚木（一部のみ）',
    noise_kisarazu: '木更津駐屯地',
    noise_tachikawa: '立川飛行場',
    sec: { scores: 'スコア', commute: '通勤', childcare: '子育て', housing: '住宅（売出価格）', hazard: '災害リスク', crime: '治安（警察 2025）', growth: '成長性', costco: 'コストコ' },
    r: { rank: '順位', office: o => `${o}まで`, officePass: '勤務先までの定期（1か月）', door: 'ドアtoドア', toTokyo: '東京駅／大手町まで',
      crowding: 'ピーク混雑率', pass: '東京までの定期（1か月）', bus: '通勤バス 朝／夕', daycare: '0〜2歳 保育料／月',
      waitlist: '待機児童', gakudo: '学童の待機', pedsNear: '小児科専門まで1km以内の子ども', pedsPer10k: '小児科施設／子ども1万人', medical: '子ども医療費（年齢・1回）', median: '90〜105㎡ 中央値',
      modern: '2000年以降築 90〜110㎡ 中央値', scorePrice: '築浅100㎡の価格（採点）', pool: '築浅90㎡以上・8,000万円未満（採点）', poolAll: '90㎡以上・8,000万円未満（築年問わず）', share: '90㎡以上の掲載割合', land: '住宅地価',
      liveN: '90㎡以上・8,000万円未満（現在）／90㎡以上全体', liveMedian: '90〜105㎡ 中央値（現在）', projects: '販売中の新築プロジェクト', fees: '管理費＋修繕積立金（ウォッチ対象）',
      water: '洪水・高潮・津波区域の住民', deep: '浸水3m以上の住民', liq: '液状化しやすい地盤', slide: '土砂災害警戒区域',
      quake: '30年 震度6弱以上', noise: '航空機騒音', burg: '住宅侵入／人口1万', viol: '凶悪犯・粗暴犯／人口1万', crimeAll: '刑法犯総数／人口千', pop: '人口 2020→25', ipss: '社人研 2050', kids: '年少人口割合', costco: 'コストコまで車' },
  },
  np: {
    title: '販売中の新築マンション', sum: (b, n) => `90㎡以上の間取りあり ${b}件・今月の新着 ${n}件`,
    tba: '価格未定', big: '90㎡+', deliv: d => `引渡 ${d}`, units: n => `総戸数${n}`, none: '現在販売中の新築プロジェクトはありません。',
    note: u => `SUUMO掲載の分譲プロジェクト（全期・全タイプの価格と面積の幅、毎日更新）。${u ? `ほかに新築未入居 ${u}戸。` : ''}`,
    suumo: 'SUUMOで一覧',
  },
  ls: {
    title: '販売中・90㎡以上', sum: (u, n, c) => `8,000万円未満 ${u}件・今週の新着 ${n}件・値下げ ${c}件`,
    all: 'すべての価格', under: '8,000万円未満', sort: '並び替え', sorts: { price: '価格の安い順', size: '広い順', ppm: '㎡単価の安い順', year: '築浅順', new: '新着順' },
    okTip: '予算ライン8,000万円未満', overTip: '予算ライン8,000万円超', new: '新着', wasTip: p => `初回掲載時 ${p}`,
    walk: m => `徒歩${m}分`, bus: 'バス', more: n => `${n}件すべて表示`, less: '表示を減らす',
    loading: '物件を読み込み中…', failed: '物件を読み込めませんでした。', none: 'このエリアの物件データはまだありません。', noneUnder: '現在8,000万円未満の物件はありません。',
    note: d => `SUUMOの中古マンション（複数業者の同一住戸は1件に統合）、毎日更新 — ${d}。価格は売出価格。バッジは8,000万円ラインとの比較。`,
    watch: 'このエリアはウォッチリスト対象：「マンション」タブに80㎡以上のスコア付き一覧があります。',
  },
  sources: '出典', openListings: 'このエリアの追跡中の物件を見る',
  free: '無料', min: '分', perMonth: '/月', unknown: '—',
  prefs: { Tokyo: '東京都', Chiba: '千葉県', Saitama: '埼玉県', Kanagawa: '神奈川県', Ibaraki: '茨城県' },
  types: { ku: '区', shi: '市' },
  tokyoStation: '東京駅', costcoTip: (n, y) => `コストコ ${n}（${y}開業）`, busTip: n => `通勤バス停：${n} → 東京駅`,
  dest: { Tokyo: '東京駅', Otemachi: '大手町' },
  yenM: v => `${Math.round(v / 1e4).toLocaleString('ja')}万円`,
  yen: v => `${Math.round(v).toLocaleString('ja')}円`,
  foot: '調査日 2026-10-12。価格はSUUMOの売出価格、子育て費用は世帯年収1,000万円の共働き世帯で試算。境界：国土数値情報 N03。',
  r: {
    commuteTime: (m, st, tr, dest) => `${st}から${dest}まで${m}分` + (tr ? `（乗換${tr}回）` : '（乗換なし）'),
    crowdLow: l => `ピーク時も比較的空いている：${l}`, crowdHigh: l => `ピーク時の混雑が激しい：${l}`, crowdMid: l => `ピーク時混雑率 ${l}`,
    passHigh: y => `定期代が高い：月${y}`, pass: y => `1か月定期 ${y}`,
    busGood: (r, m, e) => `通勤バス：朝${m}本・夕${e}本 ― ${r}`,
    busThin: (r, m, e) => `バスは僅少（朝${m ?? '?'}本・夕${e ?? '?'}本）：${r}`,
    busUnverified: r => `バス路線はあるが時刻表未確認：${r}`,
    busFare: (f, p, ride) => `バス所要${ride}分・運賃${f}` + (p ? `・定期 月${p}` : ''),
    busNone: '東京駅への平日通勤バスなし',
    dayFree: '0〜2歳の認可保育料が無料', dayFee: (y, est) => `0〜2歳の保育料 約${y}/月（第1子）` + (est ? '（推計）' : ''),
    feeNote: s => `保育料メモ：${s}`,
    wait0: '待機児童ゼロ（2026年4月）', waitHigh: n => `待機児童 ${n}人（2026年4月）`, waitSome: n => `待機児童 ${n}人（2026年4月）`,
    gakudo0: '学童の待機なし', gakudoHigh: n => `学童の待機 ${n}人`, gakudoSome: n => `学童の待機 ${n}人`,
    gakudoSmall: '学童の待機は50人未満',
    medGood: '子ども医療費 18歳まで無料', medCopay: (a, c) => `子ども医療費 ${a}歳まで・1回${c}円`,
    medShort: (a, c) => `子ども医療費の助成は${a}歳まで` + (c ? `・1回${c}円` : ''),
    lunchFree: '小中学校の給食費が無料', lunch: s => `給食費：${s}`,
    tokyoCash: '東京都の給付：018サポート月5,000円/人＋出産時13万円分', extras: s => `独自の給付：${s}`,
    peds: (near, ded, all, p10k) => `子どもの${near}%が小児科専門クリニックから1km以内（専門 ${ded}・小児科あり ${all}施設・子ども1万人あたり ${p10k}；国土数値情報2020）`,
    shareHigh: s => `中古掲載の${s}%が90㎡以上`, shareLow: s => `90㎡以上は掲載の${s}%のみ`,
    poolBig: (n, m) => `8,000万円未満の90㎡以上が${n}件（うち2000年以降築${m}件）`, poolSmall: n => `8,000万円未満の90㎡以上は${n}件のみ`,
    poolMid: (n, m) => `8,000万円未満の90㎡以上が${n}件（うち2000年以降築${m}件）`,
    priceLow: p => `広い物件が手頃：90〜105㎡の中央値 ${p}`, priceHigh: p => `広い物件が高い：90〜105㎡の中央値 ${p}`,
    price: p => `90〜105㎡の売出価格中央値 ${p}`, modern: (p, n) => `2000年以降築・90〜110㎡の中央値 ${p}（${n}件）`,
    modernHigh: (p, n) => `築浅の広い物件は高め：2000年以降築・90〜110㎡の中央値 ${p}（${n}件）`,
    modernLow: (p, n) => `築浅の広い物件が割安：2000年以降築・90〜110㎡の中央値 ${p}（${n}件）`,
    noLarge: '90㎡以上のマンション掲載なし（2026年10月）',
    spNone: '90㎡以上・1983年以降築の掲載なし：広い物件は旧耐震の建物のみ',
    spChoiceBig: (u, q) => `選択肢が多い：90㎡以上で8,000万円未満が${u}件（築年で重み付け、価格問わず${q}件）`,
    spChoiceSmall: (u, q) => `選択肢が少ない：90㎡以上で8,000万円未満は${u}件のみ（築年で重み付け、価格問わず${q}件）`,
    spChoice: (u, q) => `90㎡以上で8,000万円未満が${u}件（築年で重み付け、価格問わず${q}件）`,
    spPriceLow: p => `広い物件が手頃：100㎡で約${p}（築年で重み付け）`,
    spPriceHigh: p => `広い物件が高い：100㎡で約${p}（築年で重み付け）`,
    spPrice: p => `100㎡で約${p}（築年で重み付け）`,
    spOld: (n, m) => `築年問わず：8,000万円未満の90㎡以上 ${n}件、うち2000年より前の築 ${n - m}件（1990年代は0.6、1983〜89年は0.3、それ以前は0で計算）`,
    land: (y, c) => `住宅地 ${y}/㎡` + (c != null ? `（5年で${c > 0 ? '+' : ''}${c}%）` : ''),
    popUp: c => `人口増加：+${c}%（2020→25）`, popDown: c => `人口減少：${c}%（2020→25）`, pop: c => `人口 ${c > 0 ? '+' : ''}${c}%（2020→25）`,
    ipssUp: c => `2050年推計 +${c}%（社人研）`, ipssDown: c => `2050年推計 ${c}%（社人研）`, ipss: c => `2050年推計 ${c > 0 ? '+' : ''}${c}%（社人研）`,
    kidsHigh: s => `子育て世帯が多い：年少人口 ${s}%`, kids: s => `年少人口 ${s}%`,
    pipe: (n, p, done) => `${p <= 0 ? '停滞' : done ? '最近完成・開業' : '計画・進行中'}：${n}（成長性 ${p > 0 ? '+' : ''}${p}点）`,
    costcoNear: (n, m) => `コストコ${n}まで車で約${m}分`, costcoFar: (n, m) => `最寄りのコストコ（${n}）まで車で約${m}分`, costco: (n, m) => `コストコ${n}まで車で約${m}分`,
    waterLow: p => `浸水リスクは小さい：想定最大規模の洪水・高潮・津波区域に住む住民は${p}%`,
    waterHigh: p => `住民の${p}%が想定最大規模の洪水・高潮・津波の浸水区域に居住`,
    water: p => `想定最大規模の洪水・高潮・津波の浸水区域に住む住民 ${p}%`,
    waterDeep: p => `住民の${p}%が浸水深3m以上の区域に居住`,
    waterMix: (f, s, ts) => `洪水${f}%・高潮${s}%・津波${ts}%（いずれも想定最大規模）`,
    liqHigh: p => `液状化しやすい地盤：住民の${p}%が埋立地・旧湿地などに居住`,
    liqLow: p => `地盤が比較的強い：液状化しやすい地形に住む住民は${p}%`,
    liq: p => `液状化しやすい地形に住む住民 ${p}%`,
    fillUpland: p => `住民の${p}%が丘陵・谷の盛土地に居住（地震時の滑動崩落リスク：市の大規模盛土造成地マップを確認）`,
    slideRed: p => `住民の${p}%が土砂災害特別警戒区域（レッド）に居住`,
    slide: p => `住民の${p}%が土砂災害警戒区域に居住`,
    quakeHigh: p => `地震確率が高い：30年以内に震度6弱以上 ${p}%`,
    quakeLow: p => `地震確率は比較的低い：30年以内に震度6弱以上 ${p}%`,
    quake: p => `30年以内に震度6弱以上の確率 ${p}%`,
    burgLow: (r, n) => `住宅侵入が少ない：人口1万人あたり ${r}件（2025年 空き巣・忍込み ${n}件、警察統計）`,
    burgHigh: (r, n) => `住宅侵入が多い：人口1万人あたり ${r}件（2025年 空き巣・忍込み ${n}件、警察統計）`,
    burg: (r, n) => `住宅侵入：人口1万人あたり ${r}件（2025年 空き巣・忍込み ${n}件、警察統計）`,
    violLow: (r, n) => `凶悪犯・粗暴犯が少ない：人口1万人あたり ${r}件（2025年 ${n}件）`,
    violHigh: (r, n) => `凶悪犯・粗暴犯が多い：人口1万人あたり ${r}件（2025年 ${n}件）、主に駅前・繁華街`,
    viol: (r, n) => `凶悪犯・粗暴犯：人口1万人あたり ${r}件（2025年 ${n}件）`,
    violNA: '凶悪犯・粗暴犯：この県警は市町村別に公表していない',
    crimeTotal: (r, n) => `刑法犯総数：人口千人あたり ${r}件（2025年 ${n}件）`,
    crimeHub: (r, n) => `刑法犯総数：人口千人あたり ${r}件（2025年 ${n}件）。通勤・買物客の多い商業地のため高め、居住者には住宅侵入の方が目安になる`,
    crimeNA: '治安：市町村別の公式データなし（茨城県警の統計ページが閲覧不可）',
    crimeSrc: '警察の犯罪統計',
    fees: (y, m2, n) => `維持費：管理費＋修繕積立金の中央値 月${y}（㎡あたり ¥${m2}）、2000年以降築・90㎡以上の掲載 ${n}件`,
    feesAll: (y, m2, n) => `維持費：管理費＋修繕積立金の中央値 月${y}（㎡あたり ¥${m2}）、90㎡以上の掲載 ${n}件（2000年以降築なし）`,
    hazardMap: '公式ハザードマップで確認', noiseSrc: '航空機騒音の出典',
    noise_hanedaS: '航空機騒音：羽田新ルート到着機が低高度で通過（南風時15〜19時のうち約3時間）',
    noise_hanedaSHigh: '航空機騒音：羽田新ルート到着機が通過（都心より高い高度、南風時15〜19時）',
    noise_hanedaN: '航空機騒音：羽田新ルート出発機が荒川沿いを北上（北風時7〜11:30・15〜19時）',
    noise_hanedaB: '航空機騒音：羽田B滑走路の出発機が臨海部を通過（南風時）',
    noise_hanedaChiba: '航空機騒音：羽田の従来経路下（市内に国交省の騒音測定局あり）',
    noise_shimofusa: '航空機騒音：海上自衛隊下総航空基地の訓練飛行',
    noise_atsugi: '航空機騒音：厚木の第一種区域は金森5・6丁目のみ',
    noise_kisarazu: '航空機騒音：陸上自衛隊木更津駐屯地（ヘリ・V-22整備拠点）',
    noise_tachikawa: '航空機騒音：陸上自衛隊立川飛行場（ヘリ）、横田基地まで約5km',
    door: (m, h, o) => `ドアtoドア 約${m}分（徒歩${h}分＋${o}分を含む）`,
    officeMissing: 'このエリアから勤務先への所要時間が未取得のため、東京駅の値を使用',
    yahoo: o => `Yahoo!乗換案内で${o}までの経路を確認`,
    liveNow: (d, n, u, m, k) => `SUUMO掲載中（${d}）：90㎡以上の中古 ${n}件、うち8,000万円未満 ${u}件` + (m ? `・90〜105㎡の中央値 ${m}（${k}件）` : ''),
    liveTrend: (days, dn, du) => `直近${days}日：90㎡以上 ${dn >= 0 ? '+' : ''}${dn}件（8,000万円未満 ${du >= 0 ? '+' : ''}${du}件）`,
    newProjects: (n, names) => `販売中の新築マンション ${n}件：${names}`,
    noNewProjects: u => `販売中の新築プロジェクトなし` + (u ? `（新築未入居の再販 ${u}件）` : ''),
  },
};

/* ── Deep look (deeplook.js) ── */
I18N.en.tabDeep = 'Deep look';
I18N.ja.tabDeep = '物件ディープ分析';
I18N.en.dl = {
  title: 'Deep look — one listing, in depth',
  lead: 'Paste a SUUMO used-condo link. GitHub then analyses it in about 3 minutes: price and fees against similar flats and the MLIT repair-fund guideline, total monthly and buying costs, land rights, seismic standard, shaking, ground, flood and liquefaction at the address, the real door-to-door commute, building management, energy and windows, parking, the neighbourhood and contract terms. It ends with the questions to ask the agent and the documents to request. Every report is printable.',
  office: 'Commute to', go: 'Analyse',
  how: repo => `Opens a pre-filled issue on GitHub (${repo}) — tap <b>Create</b> while signed in as the repo owner. The issue is public but only contains the link; it closes itself when done and Telegram gets the result. Your settings from the Loan tab (rate, down payment, years) are used.`,
  issueNote: '(Created from the Deep look tab. The analysis runs automatically; this issue closes itself.)',
  done: 'Reports', none: 'No reports yet.',
  bad: 'That is not a SUUMO used-condo link (https://suumo.jp/ms/chuko/…/nc_…/). Houses and new condos come later.',
  waiting: (m, s) => `Waiting for GitHub — ${m}:${s}. Tap "Create" on the GitHub page if you have not yet.`,
  progress: 'progress', ready: 'Report ready:', slow: 'No report after 15 minutes — check the run:',
  open: 'Open report', rerun: 'Run again',
  min: (n, o) => `${n} min to ${o}`,
  risk: n => `${n} risk`, watch: n => `${n} to check`, ask: n => `${n} to ask`, good: n => `${n} good`,
  hdr: n => `<strong>${n}</strong> deep-look report${n === 1 ? '' : 's'}`,
  btn: 'Deep look',
};
I18N.ja.dl = {
  title: '物件ディープ分析',
  lead: 'SUUMOの中古マンションのURLを貼り付けると、GitHub上で約3分で分析します。内容：類似物件との㎡単価比較、管理費・修繕積立金の水準（国土交通省ガイドラインとの比較）、毎月の支払額と購入時の諸費用、敷地の権利・用途地域、耐震基準、地震発生確率・地盤・浸水・液状化（所在地点）、実際のドアツードア通勤時間、管理形態、省エネ性能・窓、駐車場、周辺環境、契約条件。最後に不動産会社への質問リストと取り寄せる書類の一覧を付けます。レポートは印刷・PDF保存できます。',
  office: '通勤先', go: '分析する',
  how: repo => `GitHub（${repo}）に入力済みのIssueが開きます。リポジトリ所有者でログインして<b>Create</b>を押してください。Issueは公開されますが、記載されるのは物件URLのみです。分析が終わるとIssueは自動で閉じ、Telegramに通知が届きます。ローンの条件（金利・頭金・返済期間）は「住宅ローン」タブの設定を使用します。`,
  issueNote: '（物件ディープ分析タブから作成。分析は自動で実行され、このIssueは自動で閉じます。）',
  done: 'レポート', none: 'まだレポートはありません。',
  bad: 'SUUMO中古マンションのURL（https://suumo.jp/ms/chuko/…/nc_…/）ではありません。戸建て・新築マンションは今後対応予定です。',
  waiting: (m, s) => `GitHubの処理待ち — ${m}:${s}。まだの場合はGitHubの画面で「Create」を押してください。`,
  progress: '進行状況', ready: 'レポート完成：', slow: '15分経ってもレポートがありません。実行状況を確認：',
  open: 'レポートを開く', rerun: '再分析',
  min: (n, o) => `${o}まで${n}分`,
  risk: n => `リスク${n}`, watch: n => `要確認${n}`, ask: n => `質問${n}`, good: n => `良い点${n}`,
  hdr: n => `物件ディープ分析レポート <strong>${n}</strong>件`,
  btn: 'ディープ分析',
};

/* ── Loan (loan.js) ── */
I18N.en.tabLoan = 'Loan';
I18N.ja.tabLoan = '住宅ローン';
I18N.en.ln = {
  title: 'Home loan', print: 'Print / save as PDF',
  lead: 'One set of loan settings for the whole site: the monthly figures on every card, the comparison and Deep look reports use what you set here. Rates are read from the lenders’ official sites on the 2nd of each month; a preset you picked follows the new rate.',
  gHome: 'The home', price: 'Price', man: '万円', priceHint: 'or tap 💴 on any listing',
  down: 'Down payment', costs: 'Buying costs', costsHint: 'used flat via an agent ≈ 6–9%, from a developer ≈ 4%', costsInLoan: 'Add buying costs to the loan (諸費用ローン)',
  gLoan: 'The loan', preset: 'Loan type', rate: 'Rate', rate2: 'Rate after the fixed period', rate2Hint: 'switches to variable with a smaller discount',
  years: 'Years', yrs: 'years', bonus: 'Repaid by bonus', bonusHint: 'share of the loan paid twice a year',
  method: 'Repayment', mAnn: 'Equal payments (元利均等)', mPrin: 'Equal principal (元金均等)',
  gMonthly: 'Monthly costs', fees: '管理費 + 修繕積立金', yenMo: '円/月', feesHint: 'filled in from the listing', feeRise: 'Fee rise by year 11', feeRiseHint: 'repair funds below the MLIT guideline usually rise',
  parking: 'Parking', taxPct: 'Property tax', pctYr: '% of price / year', taxHint: '固定資産税＋都市計画税, rough estimate (used condo ≈ 0.2–0.3%)',
  gYou: 'You', income: 'Household gross income', incomeHint: 'optional: for the borrowing estimate and income shares',
  residency: 'Residency', resVisa: 'Work visa (no permanent residency yet)', resPR: 'Permanent resident or Japanese',
  credit: 'Tax-credit tier', crBasic: 'No energy certificate (most used flats)', crEnergy: 'Energy-standard certificate', crZeh: 'ZEH level / certified long-life',
  child: 'Child household', childHint: 'a child under 19, or one of you under 40',
  hShock: 'If the rate rises', shockNote: 'Monthly loan payment (without bonus) if the variable rate goes up. Payments are recalculated on what is left, as at banks without the 5-year / 125% rules; with those rules the payment rises more slowly but the unpaid interest piles up.',
  hTypes: 'Loan types side by side', typesNote: 'Same price, down payment and years at each preset rate.',
  hBorrow: 'What can we borrow?', hBal: 'Balance over time', hRates: d => `Rates now (${d})`,
  ratesNote: 'Lowest advertised rates for new loans, read automatically on the 2nd of each month from each lender\'s official site (click a name to open it). ✱ = that site blocks automated reading, so the figure is from the last check by hand. The rates need the bank\'s conditions (salary account, fee type, share of the price borrowed, screening). The real cost is rate + fees + guarantee + insurance add-ons. Check each bank before applying.',
  manualT: d => `Checked by hand (last: ${d}); the bank's site blocks automated reading`,
  hGuide: 'Guide for first-time buyers',
  allIn: 'All-in per month', perMonth: 'loan + fees + parking + property tax',
  warnPR: 'This loan type usually needs permanent residency or Japanese nationality. With a work visa, use "Variable · without PR" or check the lenders marked in the rate table.',
  oLoan: (y, r) => `Loan payment (${y} years, ${r}%)`, oBonus: 'Bonus payment (twice a year)', oTax: p => `Property tax (${p}% of price / 12)`,
  oUp1: 'If the rate rises 1 point', oFixed: 'Rate is fixed for the whole term', oShare: 'Share of gross income',
  oLoanAmt: 'Loan amount', oLtv: 'Loan / price', oCash: 'Cash needed at purchase', oInt: 'Total interest', oTotal: 'Total repaid',
  oCredit: (y, c) => `Tax credit over ${y} years (cap ¥${(c / 100).toFixed(0)}M)`, oNet: y => `Interest in the first ${y} years minus the credit`,
  feeRiseOut: v => `Fees from year 11 in your scenario: ${v}/month.`,
  creditNote: 'The credit is 0.7% of the year-end balance and cannot exceed the income tax (plus part of the residence tax) you pay. Conditions and caps from the 2026 reform; check the National Tax Agency page before relying on them.',
  pts: ' pt', today: 'Today', tFromNow: 'Rise from the start', tFrom6: 'Rise from year 6', tIntAll: 'Total interest', tShare: 'All-in / gross',
  brkOver: v => `Your all-in cost is already above a comfortable level (≤25% of take-home pay ≈ ${v}/month, take-home ≈ 75% of gross).`,
  brk: (v, r) => `Your all-in cost reaches a comfortable limit (25% of take-home ≈ ${v}/month) if the rate goes to <b>${r}%</b>.`,
  shockFixed: 'Full-term fixed: the payment cannot change.', shockF10: 'For a fixed period, rises only apply after the fixed years end.',
  tMonthly: 'Monthly', tUp1: '+1 point', needsPR: 'needs PR', protected: 'protected', afterN: (y, v) => `from year ${y + 1}: ${v}`,
  borrowNeed: 'Enter your household gross income above to see how much banks would lend.',
  tScreen: 'Screening rate', tRatio: q => `≤${q}% of income`,
  borrowNote: y => `Banks test you at a screening rate of ~3–4% (not your actual rate) with all loan payments ≤30–40% of gross income, over ${y} years. Car loans and card instalments count too. This is the most a bank might lend, not what is comfortable.`,
  comfort: (m, v, r) => `<b>Comfortable price: about ${m}</b> — all-in ≤ ${v}/month (25% of take-home) even if the rate rises to ${r}%, with your down payment, fees and parking.`,
  comfortNone: v => `Your fees and parking alone are close to a comfortable all-in level (${v}/month).`,
  legBal: 'Balance', legInt: 'Interest paid so far', legCredit: y => `Tax-credit years (${y})`,
  tYear: 'Year', tBal: 'Balance (end of year)', tIntCum: 'Interest so far', tCredit: 'Tax credit that year',
  tLender: 'Lender', tVar: 'Variable', tF10: '10-year fixed', tFull: 'Full-term fixed', tNP: 'Without PR?', tNote: 'Note',
  np: { yes: 'Yes (valid status)', cond: 'With conditions', spouse: 'With a Japanese / PR spouse', no: 'PR needed', ask: 'Ask' },
  bn: {
    aeon: 'Has a product for residents without PR (conditions apply); rate shown is for borrowing ≤ 80% of the price', mufg: 'Same discount from the list rate for the whole loan; fee 2.2%, no guarantee fee',
    mizuho: 'Rate for the fee-type product', yokohama: 'Screening at 4.0%, ≤35% of income', shinsei: 'Japanese / PR spouse can be the joint guarantor',
    chiba: 'Main local bank for the Chiba areas', smbc: 'Residents without PR can apply with a valid status',
    no125: 'No 5-year / 125% rules: payments follow rates directly', jibun: 'Screening rate ≈ 3.83%',
    rakuten: 'Fixed fee; cancer-50% and all-illness cover included; also offers Flat 35', tokyostar: 'スター住宅ローン for non-PR residents: 1+ year in the job, income ≥ ¥4M (≥ ¥3M if ≤ 40); rate range shown is the lowest',
    flat35: 'Most common rate, 21–35 years, ≤90% of price (higher above 90%); 子育てプラス −0.25%/child for 5 years',
  },
  p: { v_np: 'Variable · without PR (SMBC)', v_low: 'Variable · lowest (megabanks, PR)', v_net: 'Variable · online banks', f10: '10-year fixed', flat35: 'Flat 35 full-term fixed', custom: 'Custom' },
  cardLine: v => `≈ ${v}/month all-in`, up1: v => `+1%: +${v}`, fixedTag: '(fixed rate)', btn: 'Loan', btnTitle: 'Open this price in the loan simulator',
  estMonthly: 'All-in / month',
  tip: c => `<div class="tip-h">All-in monthly cost</div><ul class="tip-list">
      <li><span>Loan ${c.loan} (${c.price} − ${c.down}% down), ${c.years}y @ ${c.rate}%</span><span>${c.pay}</span></li>
      ${c.bonus ? `<li><span>(incl. bonus ${c.bonus} ×2/year, averaged)</span><span></span></li>` : ''}
      ${c.fees ? `<li><span>管理費 + 修繕積立金</span><span>${c.fees}</span></li>` : ''}
      ${c.park ? `<li><span>Parking</span><span>${c.park}</span></li>` : ''}
      <li><span>Property tax (~${c.taxPct}% of price)</span><span>${c.tax}</span></li>
      <li><b>Total</b><b>${c.total}</b></li>
      ${c.up1 ? `<li><span>If the rate rises 1 point</span><span>+${c.up1}</span></li>` : ''}</ul>
      <div class="tip-note">${c.preset}. Change the down payment, years, rate and parking in the Loan tab. Excludes insurance and one-off buying costs.</div>`,
  hdr: 'Loan simulator and guide',
  sources: 'Sources: Mogecheck rate survey (Oct 2026), MUFG, JHF Flat 35, kakaku.com, MLIT 民間住宅ローンの実態に関する調査 (1,008 lenders), National Tax Agency 住宅ローン控除. Full notes: reports/Home loan research.md.',
  guide: `
<details open><summary>Your situation: work visa now, permanent residency later</summary>
<ul>
<li><b>Now (work visa):</b> most banks require permanent residency (PR) or Japanese nationality. In the MLIT survey, 621 of 1,008 lenders accept PR holders, but only 38 accept other foreign residents. Realistic options now:
  <ul><li><b>SMBC</b>: a valid residence status is enough (its variable rate is the default here).</li>
  <li><b>AEON Bank</b>: a product for residents without PR, with conditions.</li>
  <li><b>SBI Shinsei</b>: if a Japanese or PR spouse is the joint guarantor.</li>
  <li><b>Tokyo Star Bank</b> — スター住宅ローン, made for foreign residents without PR: full-time, 1+ year in the job in Japan, income ≥ ¥4M (or ≥ ¥3M and age ≤ 40). Variable rate from about 2.4% with your salary paid into the account; no guarantee fee; free prepayment; fee 2.2–3.3%. The rate can be lowered once you get PR.</li></ul>
  Expect stricter checks: years in Japan and in the job, the time left on your visa, sometimes a larger down payment (10–20%). Flat 35 is not available without PR.</li>
<li><b>After PR (expected within ~2 years):</b> almost every bank opens up, including the cheapest megabank variable rates (~1.2%) and Flat 35.</li>
<li><b>Buy now or wait?</b>
  <ul><li><b>Buy now</b> with a non-PR lender, then <b>refinance after PR</b> if the gap is worth it. Refinancing costs about 2–3% of the balance (bank fee, registration, scrivener), so it usually pays when the rate gap is ≥0.3–0.5 points and the balance is large. Check that the first loan has no early-repayment penalty.</li>
  <li><b>Wait for PR</b>: more choice and a lower rate, but rates and prices may rise meanwhile (BOJ has been raising since 2024).</li></ul></li>
<li><b>Documents for foreign residents</b> (on top of the usual ones): residence card (在留カード), passport, 住民票 showing nationality and status, 2–3 years of 源泉徴収票 and 課税証明書, sometimes proof of Japanese ability or a Japanese-speaking contact.</li>
</ul></details>
<details><summary>The steps (used condo, about 1.5–3 months)</summary>
<ol>
<li><b>Budget first</b> with this simulator. Get a <b>pre-screening (事前審査)</b> at 2–3 banks before or when you make an offer: free, 3–7 days.</li>
<li><b>Offer (買付証明書) → purchase contract (売買契約).</b> Deposit (手付金) usually 5–10% of the price. Insist on a <b>loan clause (ローン特約)</b>: if the loan is refused by a set date, the contract is cancelled and the deposit returned.</li>
<li><b>Full screening (本審査)</b>: income and tax certificates, ID, residence card and the property documents from the agent; 1–3 weeks; includes the health declaration for the loan insurance (団信).</li>
<li><b>Loan contract (金銭消費貸借契約).</b> The rate is usually the one <b>at drawdown</b>, not at application.</li>
<li><b>Settlement and handover (決済・引渡し)</b>: the loan is paid out, the seller paid, the property registered and the keys handed over on the same day. Buying costs are paid here.</li>
<li><b>First year: tax return (確定申告)</b> to start the mortgage tax credit; later years go through your employer (年末調整).</li>
</ol></details>
<details><summary>Loan types</summary>
<ul>
<li><b>Variable (変動金利)</b>: cheapest now (~1.0–2.0%). Follows the bank's list rate, which follows the BOJ. You carry the rate risk. Good if you could absorb +1–2 points or prepay.</li>
<li><b>Fixed for a period (固定期間選択型, 3/5/10 years)</b>: certainty while the children are small; afterwards it switches with a smaller discount, so read the after-period terms.</li>
<li><b>Full-term fixed (全期間固定型, Flat 35)</b>: highest rate now (~3.8–4.4%) but no risk. Flat 35 needs PR and a conformity certificate (適合証明) for a used flat.</li>
<li><b>Mix (ミックス)</b>: split the loan, e.g. half variable and half fixed. Fees may double.</li>
<li><b>Repayment</b>: equal payments (元利均等) keep the payment flat; equal principal (元金均等) starts higher and saves interest.</li>
<li><b>5-year / 125% rules</b> (most banks on variable): the payment changes at most every 5 years and by at most +25%. Interest is deferred, not forgiven; unpaid interest (未払利息) can be due at the end. Sony and PayPay have no such rules.</li>
</ul></details>
<details><summary>Two incomes</summary>
<ul>
<li><b>Pair loan (ペアローン)</b>: two loans, two insurances; both get the tax credit; double fees; if one dies only that loan is paid off.</li>
<li><b>Joint debt (連帯債務)</b>: one loan, both liable; both get the tax credit; fewer banks offer it.</li>
<li><b>Joint guarantor (連帯保証)</b>: one borrower, the other guarantees; only the borrower gets the credit and the insurance.</li>
<li>Think about parental leave, one income stopping, or separation. For non-PR couples, banks may count only the income of a PR / Japanese partner.</li>
</ul></details>
<details><summary>What banks check</summary>
<ul>
<li>Age at the end of the loan, health (loan insurance), income, years in the job (usually ≥1), the property's value and the <b>repayment ratio (返済負担率)</b>: all loan payments ≤30–40% of gross income at a <b>screening rate of ~3–4%</b>.</li>
<li>Most lend up to 100% of the price; some up to 110–150% to cover buying costs.</li>
<li>Don't take new card or car loans between pre-screening and drawdown, and avoid changing jobs before the screening.</li>
</ul></details>
<details><summary>Costs beyond the rate</summary>
<ul>
<li><b>Buying costs (諸費用)</b>, used flat via an agent ≈ 6–9% of the price: agent fee 3% + ¥60k + tax; bank fee 2.2% of the loan or a fixed ¥30–100k (then often a guarantee fee 保証料 ~2% or +0.2% on the rate); registration and scrivener ¥0.3–0.6M; fire + earthquake insurance ¥0.1–0.4M for 5 years; stamp duty; pro-rated property tax and fees.</li>
<li><b>Loan insurance (団体信用生命保険, 団信)</b>: basic cover free; cancer-50% often free; cancer-100% or 3/8-illness +0.1–0.3%; cover for both of you about +0.2%.</li>
<li><b>Running costs</b>: fees that rise over time (see Deep look §B), property tax, insurance renewal.</li>
</ul></details>
<details><summary>Mortgage tax credit (住宅ローン控除, 2026 reform)</summary>
<ul>
<li>0.7% of the year-end balance, taken off income tax (and part of residence tax), for 10 or 13 years. Income ≤ ¥20M; registered area ≥50 m²; built 1982 or later (or with a seismic certificate).</li>
<li>Used home caps: no certificate ¥20M / 10 years; energy-standard ¥20M (child household ¥30M) / 13 years; ZEH level or certified long-life ¥35M (child household ¥45M) / 13 years.</li>
<li>With variable at ~1.2–1.5%, the credit pays back about half the interest in the early years. Ask the seller for any energy certificate: it can add 3 years.</li>
</ul></details>
<details><summary>Ten realistic tips</summary>
<ol>
<li>Size the loan by what you can pay, not by what the bank offers (~7× income). A safe all-in cost is ≤25% of take-home pay, with room for +1.5–2 points.</li>
<li>If you go variable, have a plan for rises (savings to prepay, or a switch to fixed) — run the table above.</li>
<li>Keep cash after buying: 6+ months of living costs, the first year's fees, furniture and moving.</li>
<li>Pre-screen at 2–3 banks of different types (a megabank, an online bank, a local bank) with the same documents.</li>
<li>Compare the total cost over 10 years (rate + fees + guarantee + insurance), not the headline rate.</li>
<li>Never sign without a loan clause and a realistic screening deadline.</li>
<li>No new card or car loans between pre-screening and drawdown.</li>
<li>Prepay early but don't drain your cash; prepaying to shorten the term (期間短縮型) saves the most interest.</li>
<li>Review every 2–3 years; refinance if the gap is >0.3–0.5 points and the balance is large — especially once you have PR.</li>
<li>Plan for life events: parental leave, a job change (wait until after the loan), a second income later.</li>
</ol></details>`,
};
I18N.ja.ln = {
  title: '住宅ローン', print: '印刷・PDF保存',
  lead: 'サイト全体で共通のローン設定です。各物件カードの月々の金額、比較表、物件ディープ分析は、ここでの設定を使います。金利は毎月2日に各金融機関の公式サイトから更新され、選んだプリセットの金利も自動で追従します。',
  gHome: '物件', price: '物件価格', man: '万円', priceHint: '各物件の💴ボタンからも入力できます',
  down: '頭金', costs: '諸費用', costsHint: '中古・仲介で約6〜9%、売主物件で約4%', costsInLoan: '諸費用もローンに含める（諸費用ローン）',
  gLoan: 'ローン', preset: '金利タイプ', rate: '金利', rate2: '固定期間終了後の金利', rate2Hint: '終了後は変動金利（優遇幅は縮小）',
  years: '返済期間', yrs: '年', bonus: 'ボーナス返済の割合', bonusHint: '借入額のうち年2回のボーナスで返済する割合',
  method: '返済方法', mAnn: '元利均等返済', mPrin: '元金均等返済',
  gMonthly: '毎月の費用', fees: '管理費＋修繕積立金', yenMo: '円/月', feesHint: '物件から自動入力', feeRise: '11年目以降の値上げ', feeRiseHint: '国交省ガイドラインを下回る修繕積立金は値上げされるのが一般的',
  parking: '駐車場代', taxPct: '固定資産税等', pctYr: '%（価格比・年）', taxHint: '固定資産税＋都市計画税の概算（中古マンションで価格の約0.2〜0.3%）',
  gYou: 'ご自身', income: '世帯の税込年収', incomeHint: '任意：借入可能額と年収に占める割合の計算に使用',
  residency: '在留資格', resVisa: '就労ビザ（永住権なし）', resPR: '永住者または日本国籍',
  credit: '住宅ローン控除の区分', crBasic: '省エネ証明なし（中古の大半）', crEnergy: '省エネ基準適合住宅', crZeh: 'ZEH水準省エネ住宅・認定長期優良住宅',
  child: '子育て世帯・若者夫婦世帯', childHint: '19歳未満の子がいる、または夫婦のどちらかが40歳未満',
  hShock: '金利が上がったら', shockNote: '変動金利が上昇した場合の毎月のローン返済額（ボーナス返済を除く）。残高と残り期間で返済額を再計算しています（5年ルール・125%ルールのない銀行と同じ）。これらのルールがある場合、返済額の上昇は緩やかですが、払いきれない利息（未払利息）が残ることがあります。',
  hTypes: '金利タイプの比較', typesNote: '同じ価格・頭金・返済期間で、各金利タイプを比べたものです。',
  hBorrow: 'いくら借りられる？', hBal: 'ローン残高の推移', hRates: d => `現在の金利（${d}）`,
  ratesNote: '新規借入の最優遇金利です。毎月2日に各金融機関の公式サイトから自動で取得しています（名前をクリックすると公式ページが開きます）。✱ は自動取得ができないサイトのため、最後に手作業で確認した値です。適用には各行の条件（給与振込、手数料型、借入割合、審査結果など）があります。実際の負担は金利＋事務手数料＋保証料＋団信の上乗せで比べてください。申込前に各行で必ず確認を。',
  manualT: d => `手作業で確認（最終：${d}）。公式サイトが自動取得に対応していません`,
  hGuide: 'はじめての住宅購入ガイド',
  allIn: '毎月の総額', perMonth: 'ローン返済＋管理費等＋駐車場＋固定資産税等',
  warnPR: 'この金利タイプは通常、永住権または日本国籍が必要です。就労ビザの場合は「変動・永住権なし可（三井住友銀行）」を選ぶか、金利表で利用可能な金融機関を確認してください。',
  oLoan: (y, r) => `ローン返済（${y}年・${r}%）`, oBonus: 'ボーナス返済（年2回）', oTax: p => `固定資産税等（価格の${p}%÷12）`,
  oUp1: '金利が1%上がった場合', oFixed: '全期間固定のため返済額は変わりません', oShare: '税込年収に占める割合',
  oLoanAmt: '借入額', oLtv: '借入額／物件価格', oCash: '購入時に必要な現金', oInt: '総利息', oTotal: '総返済額',
  oCredit: (y, c) => `住宅ローン控除（${y}年間、限度額${c.toLocaleString()}万円）`, oNet: y => `当初${y}年間の利息から控除額を引いた額`,
  feeRiseOut: v => `11年目以降の管理費等（この設定の場合）：月${v}。`,
  creditNote: '控除額は年末残高の0.7%で、支払った所得税（と住民税の一部）が上限です。2026年度税制改正の要件・限度額に基づく概算のため、国税庁の案内で必ず確認してください。',
  pts: '%', today: '現在', tFromNow: '当初から上昇', tFrom6: '6年目から上昇', tIntAll: '総利息', tShare: '総額／年収',
  brkOver: v => `毎月の総額がすでに無理のない水準（手取りの25%≒月${v}、手取りは税込年収の約75%と仮定）を超えています。`,
  brk: (v, r) => `金利が<b>${r}%</b>まで上がると、毎月の総額が無理のない上限（手取りの25%≒月${v}）に達します。`,
  shockFixed: '全期間固定型のため、返済額は変わりません。', shockF10: '固定期間選択型では、固定期間の終了後にのみ金利上昇が反映されます。',
  tMonthly: '毎月の返済', tUp1: '+1%の場合', needsPR: '永住権が必要', protected: '変動なし', afterN: (y, v) => `${y + 1}年目から：${v}`,
  borrowNeed: '上で世帯の税込年収を入力すると、金融機関が貸してくれる目安額を表示します。',
  tScreen: '審査金利', tRatio: q => `返済負担率${q}%以内`,
  borrowNote: y => `金融機関は実際の金利ではなく、約3〜4%の審査金利で、すべての借入の年間返済額が税込年収の30〜40%以内かを見ます（返済期間${y}年で計算）。自動車ローンやカードの分割払いも含まれます。これは借りられる上限で、無理なく返せる額ではありません。`,
  comfort: (m, v, r) => `<b>無理のない物件価格：約${m}</b> — 金利が${r}%まで上がっても、毎月の総額が月${v}（手取りの25%）以内に収まる価格です（頭金・管理費等・駐車場の設定を反映）。`,
  comfortNone: v => `管理費等と駐車場代だけで、無理のない毎月の総額（月${v}）に近くなっています。`,
  legBal: '残高', legInt: '支払済みの利息', legCredit: y => `住宅ローン控除の期間（${y}年）`,
  tYear: '年目', tBal: '残高（年末）', tIntCum: '利息の累計', tCredit: 'その年の控除額',
  tLender: '金融機関', tVar: '変動', tF10: '10年固定', tFull: '全期間固定', tNP: '永住権なし', tNote: '備考',
  np: { yes: '可（在留資格があれば）', cond: '条件付きで可', spouse: '日本人・永住者の配偶者が連帯保証人なら可', no: '永住権が必要', ask: '要確認' },
  bn: {
    aeon: '永住権がなくても利用できる商品あり（条件付き）。表示は借入が物件価格の80%以内の場合', mufg: '完済まで店頭金利から同じ優遇幅、事務手数料2.2%、保証料なし',
    mizuho: '手数料型の金利', yokohama: '審査金利4.0%、返済負担率35%以内', shinsei: '日本人・永住者の配偶者を連帯保証人にできる',
    chiba: '千葉エリアの主な地方銀行', smbc: '有効な在留資格があれば永住権なしでも申込可',
    no125: '5年ルール・125%ルールなし（金利変動がそのまま返済額に反映）', jibun: '審査金利は約3.83%',
    rakuten: '定額の事務手数料、がん50%保障・全疾病保障付き、フラット35も取扱い', tokyostar: '永住権のない外国籍の方向け「スター住宅ローン」：勤続1年以上、年収400万円以上（40歳以下は300万円以上）。表示は最低金利',
    flat35: '最頻金利（21〜35年・融資率9割以下、9割超は高め）、子育てプラスで子1人につき当初5年間0.25%引下げ',
  },
  p: { v_np: '変動・永住権なし可（三井住友銀行）', v_low: '変動・最低水準（メガバンク、永住権要）', v_net: '変動・ネット銀行', f10: '10年固定', flat35: '全期間固定（フラット35）', custom: 'カスタム' },
  cardLine: v => `毎月の総額 約${v}`, up1: v => `+1%で+${v}`, fixedTag: '（固定金利）', btn: 'ローン', btnTitle: 'この価格でローンを試算',
  estMonthly: '毎月の総額',
  tip: c => `<div class="tip-h">毎月の総額の目安</div><ul class="tip-list">
      <li><span>借入${c.loan}（${c.price}−頭金${c.down}%）・${c.years}年・${c.rate}%</span><span>${c.pay}</span></li>
      ${c.bonus ? `<li><span>（ボーナス返済${c.bonus}×年2回を月割りで含む）</span><span></span></li>` : ''}
      ${c.fees ? `<li><span>管理費＋修繕積立金</span><span>${c.fees}</span></li>` : ''}
      ${c.park ? `<li><span>駐車場代</span><span>${c.park}</span></li>` : ''}
      <li><span>固定資産税等（価格の約${c.taxPct}%）</span><span>${c.tax}</span></li>
      <li><b>合計</b><b>${c.total}</b></li>
      ${c.up1 ? `<li><span>金利が1%上がった場合</span><span>+${c.up1}</span></li>` : ''}</ul>
      <div class="tip-note">${c.preset}。頭金・返済期間・金利・駐車場代は「住宅ローン」タブで変更できます。保険料と購入時の諸費用は含みません。</div>`,
  hdr: '住宅ローンの試算とガイド',
  sources: '出典：モゲチェック金利調査（2026年10月）、三菱UFJ銀行、住宅金融支援機構（フラット35）、価格.com、国土交通省「民間住宅ローンの実態に関する調査」（1,008機関）、国税庁「住宅借入金等特別控除」。詳細：reports/Home loan research.md',
  guide: `
<details open><summary>あなたの状況：今は就労ビザ、いずれ永住権</summary>
<ul>
<li><b>現在（就労ビザ）</b>：多くの金融機関は永住権または日本国籍を条件にしています。国交省の調査では、1,008機関のうち永住者に融資するのは621機関、それ以外の外国籍の方に融資するのは38機関のみです。現実的な選択肢：
  <ul><li><b>三井住友銀行</b>：有効な在留資格があれば申込可（このサイトの初期設定の金利）。</li>
  <li><b>イオン銀行</b>：永住権がなくても利用できる商品あり（条件付き）。</li>
  <li><b>SBI新生銀行</b>：日本人または永住者の配偶者が連帯保証人になる場合。</li>
  <li><b>東京スター銀行</b>：永住権のない外国籍の方向けの「スター住宅ローン」。正社員で日本での勤続1年以上、年収400万円以上（または300万円以上かつ40歳以下）。給与振込指定で変動金利は約2.4%から、保証料なし、繰上返済手数料無料、事務手数料2.2〜3.3%。永住許可後は金利優遇の可能性あり。</li></ul>
  在日年数・勤続年数・在留期間の残りなどの審査が厳しくなり、頭金（10〜20%）を求められることもあります。フラット35は永住権がないと利用できません。</li>
<li><b>永住権取得後（約2年以内の見込み）</b>：ほぼすべての金融機関が対象になり、メガバンクの低い変動金利（約1.2%）やフラット35も利用できます。</li>
<li><b>今買うか、待つか</b>
  <ul><li><b>今買う</b>：永住権なしで借りられる金融機関で借り、<b>永住権取得後に借り換え</b>を検討。借り換えには残高の約2〜3%（事務手数料・登記・司法書士報酬）がかかるため、金利差0.3〜0.5%以上かつ残高が大きい場合に有利になりやすいです。最初のローンに繰上返済の手数料がないかも確認を。</li>
  <li><b>永住権を待つ</b>：選択肢が広がり金利も下がりますが、その間に金利や価格が上がる可能性があります（日銀は2024年から利上げを継続）。</li></ul></li>
<li><b>外国籍の方の必要書類</b>（通常の書類に加えて）：在留カード、パスポート、国籍・在留資格が記載された住民票、2〜3年分の源泉徴収票・課税証明書。日本語能力の確認や日本語での連絡先を求められることもあります。</li>
</ul></details>
<details><summary>購入の流れ（中古マンション、約1.5〜3か月）</summary>
<ol>
<li><b>まず予算</b>をこの試算で決め、購入申込の前後に2〜3行で<b>事前審査</b>を受ける（無料、3〜7日程度）。</li>
<li><b>購入申込（買付証明書）→ 売買契約。</b>手付金は通常、価格の5〜10%。<b>ローン特約</b>（期日までにローンが承認されなければ契約解除・手付金返還）を必ず付ける。</li>
<li><b>本審査</b>：収入・納税証明、本人確認書類、在留カード、不動産会社からの物件資料。1〜3週間。団体信用生命保険（団信）の告知もここで行う。</li>
<li><b>金銭消費貸借契約</b>（ローン契約）。適用金利は通常、申込時ではなく<b>融資実行時</b>の金利。</li>
<li><b>決済・引渡し</b>：同じ日に融資実行、売主への支払い、登記、鍵の受け渡しを行う。諸費用もこの日に支払う。</li>
<li><b>1年目は確定申告</b>で住宅ローン控除を開始。2年目以降は勤務先の年末調整で手続き。</li>
</ol></details>
<details><summary>金利タイプ</summary>
<ul>
<li><b>変動金利</b>：現在最も低い（約1.0〜2.0%）。各行の店頭金利（日銀の政策金利に連動）に連動し、金利上昇のリスクは借り手が負う。+1〜2%に耐えられる、または繰上返済できる人向け。</li>
<li><b>固定期間選択型（3・5・10年）</b>：子どもが小さい時期に返済額が確定する安心感。終了後は優遇幅が縮小して切り替わるため、終了後の条件を必ず確認。</li>
<li><b>全期間固定型（フラット35など）</b>：現在最も高い（約3.8〜4.4%）が金利リスクなし。フラット35は永住権が必要で、中古住宅は適合証明書が必要。</li>
<li><b>ミックス</b>：例えば半分を変動、半分を固定にしてリスクを分散。事務手数料が2倍になることも。</li>
<li><b>返済方法</b>：元利均等返済は返済額が一定。元金均等返済は当初の返済額が多い代わりに総利息が少ない。</li>
<li><b>5年ルール・125%ルール</b>（変動金利の多くの銀行）：返済額の見直しは5年ごと、増加は前回の1.25倍まで。利息が免除されるわけではなく、払いきれない利息（未払利息）が最終回にまとめて残ることもある。ソニー銀行・PayPay銀行などにはこのルールがない。</li>
</ul></details>
<details><summary>夫婦の収入を合わせる</summary>
<ul>
<li><b>ペアローン</b>：2本のローン・2つの団信。2人とも住宅ローン控除の対象。事務手数料は2倍。一方が亡くなっても、返済が免除されるのはその人のローンのみ。</li>
<li><b>連帯債務</b>：1本のローンを2人で負担。2人とも控除の対象。取り扱う金融機関は少なめ。</li>
<li><b>連帯保証</b>：1人が借り、もう1人が保証人。控除と団信は借りた人のみ。</li>
<li>育休、片方の収入が止まる場合、離婚なども想定を。永住権のない夫婦では、日本人・永住者の配偶者の収入のみを審査に使う金融機関もあります。</li>
</ul></details>
<details><summary>金融機関の審査項目</summary>
<ul>
<li>完済時年齢、健康状態（団信に加入できるか）、年収、勤続年数（通常1年以上）、物件の担保評価、<b>返済負担率</b>（すべての借入の年間返済額が税込年収の30〜40%以内、<b>審査金利は約3〜4%</b>）。</li>
<li>多くは物件価格の100%まで融資。諸費用を含めて110〜150%まで融資するところもある。</li>
<li>事前審査から融資実行までは、カードローンや自動車ローンを新たに組まない。審査前の転職も避ける。</li>
</ul></details>
<details><summary>金利以外の費用</summary>
<ul>
<li><b>諸費用</b>（中古・仲介で価格の約6〜9%）：仲介手数料（3%＋6万円＋消費税）、融資事務手数料（借入額の2.2%または定額3〜10万円。定額型は保証料〔約2%または金利+0.2%〕が別途かかることが多い）、登録免許税・司法書士報酬30〜60万円、火災保険・地震保険（5年分で10〜40万円）、印紙税、固定資産税・管理費等の日割り精算。</li>
<li><b>団体信用生命保険（団信）</b>：基本保障は無料。がん50%保障は無料のことが多い。がん100%・3大／8大疾病保障は金利+0.1〜0.3%。夫婦連生団信は約+0.2%。</li>
<li><b>ランニングコスト</b>：値上がりしていく管理費・修繕積立金（物件ディープ分析の§Bを参照）、固定資産税、保険の更新。</li>
</ul></details>
<details><summary>住宅ローン控除（2026年度改正）</summary>
<ul>
<li>年末残高の0.7%を所得税（と住民税の一部）から控除。期間は10年または13年。所得2,000万円以下、登記面積50㎡以上、1982年以降の建築（または耐震基準適合証明書あり）。</li>
<li>中古住宅の借入限度額：省エネ証明なし2,000万円・10年／省エネ基準適合2,000万円（子育て世帯等3,000万円）・13年／ZEH水準・認定長期優良住宅3,500万円（子育て世帯等4,500万円）・13年。</li>
<li>変動金利1.2〜1.5%なら、当初数年は利息の約半分が控除で戻る計算。売主に省エネ性能の証明書がないか確認を（控除期間が3年延びる可能性）。</li>
</ul></details>
<details><summary>現実的なアドバイス10か条</summary>
<ol>
<li>借入額は「貸してくれる額」（年収の約7倍）ではなく「返せる額」で決める。毎月の総額は手取りの25%以内、さらに+1.5〜2%の金利上昇に耐えられる余裕を。</li>
<li>変動金利を選ぶなら、上昇時の対策（繰上返済用の貯蓄、固定への切り替え）を決めておく — 上の表で確認を。</li>
<li>購入後も現金を残す：生活費6か月分以上、1年目の管理費等、家具・引越し費用。</li>
<li>タイプの違う2〜3行（メガバンク・ネット銀行・地方銀行）で、同じ書類を使って事前審査を受ける。</li>
<li>表面金利ではなく、10年間の総負担（金利＋事務手数料＋保証料＋団信）で比べる。</li>
<li>ローン特約と、無理のない審査期限なしでは契約しない。</li>
<li>事前審査から融資実行までは、新たなカード・自動車ローンを組まない。</li>
<li>繰上返済は早めが効果的だが、手元資金を使い切らない。期間短縮型が最も利息を減らせる。</li>
<li>2〜3年ごとに見直し、金利差0.3〜0.5%以上かつ残高が大きければ借り換えを検討 — 特に永住権取得後。</li>
<li>ライフイベントに備える：育休、転職（ローン実行後に）、将来の共働き。</li>
</ol></details>`,
};

/* ── Area map: detached-house mode + schools (map-house.js, DATA_LOG items 19–20) ── */
(function () {
  const add = (o, x) => { for (const k in x) (x[k] && typeof x[k] === 'object' && o[k] && typeof o[k] === 'object') ? add(o[k], x[k]) : (o[k] = x[k]); };
  add(I18N.en.map, {
    titleH: 'Where to buy a house', subH: 'Commute to Tokyo Stn / Otemachi · kids 0–2 · detached house 100 m²+',
    mode: { label: 'Home type', condo: 'Apartments', house: 'Houses' },
    gatedTipH: 'Scores well overall but has almost no house ≥100 m² (built 2000+ or new) at a reachable price.',
    layerDescH: {
      space: 'Detached houses you could actually buy: floor ≥100 m², built 2000+ or new. 50% Price: median asking price of such houses with 100–130 m² floor (¥30M = 100 … ¥150M = 0). 50% Choice: how many are under ¥80M.',
      live: 'Live count of suitable houses (≥100 m², built 2000+ or new) under ¥80M on SUUMO, refreshed daily. Not part of the score.',
      hazard: 'House version: shallow and mid flooding and liquefaction weigh more (a house stands on its lot and floods at the ground floor); earthquake slightly less. Higher = safer.',
      commute: 'Train time to Tokyo Stn/Otemachi as for apartments, minus 1.5 pts per minute that houses typically sit beyond a 10-min walk from a station (max −15).',
    },
    kpi: { house: 'typical house' },
    hs: {
      price: (p, n, thin) => `Price ${p}: median of ${n} house${n === 1 ? '' : 's'} with 100–130 m² floor, built 2000+ or new${thin ? ' (all sizes — few 100–130 m²)' : ''}. Scale: ¥30M = 100 pts … ¥150M = 0`,
      priceNone: 'Price: no house ≥100 m² built 2000+ or new listed → 0 pts',
      choice: (u, n) => `Choice: ${u} of ${n} suitable houses under ¥80M. Scale: 0 = 0, 10 = 58, 20 = 74, 60+ = 100 pts`,
      src: d => `SUUMO 中古・新築一戸建て asking prices, crawl ${d}, de-duplicated`,
      short: (p, pp, u, cp) => `Typical house ${p} → ${pp} pts · Choice ${u} under ¥80M → ${cp} pts`,
      row: (p, u) => `${p} typical · ${u} under ¥80M`,
    },
    hr: {
      none: 'No house ≥100 m² built 2000+ or new listed',
      choiceBig: (u, n, nn) => `${u} suitable houses under ¥80M (${n} listed, ${nn} new builds)`,
      choice: (u, n, nn) => `${u} suitable houses under ¥80M (${n} listed, ${nn} new builds)`,
      choiceSmall: (u, n, nn) => `Only ${u} suitable house${u === 1 ? '' : 's'} under ¥80M (${n} listed)`,
      priceLow: p => `Affordable: a typical 100–130 m² house asks ${p}`, price: p => `Typical 100–130 m² house asks ${p}`,
      priceHigh: p => `Expensive: a typical 100–130 m² house asks ${p}`,
      land: (m, s) => `Median plot ${m} m² · ${s}% of houses on plots under 100 m²`,
      walk: (m, s, b) => `Houses typically ${m} min walk from a station · ${s}% within 15 min · ${b}% bus-only`,
      park2: (p, p3) => `${p}% of houses have parking for 2 cars (${p3}% for 3+)`,
      solar: p => `${p}% of houses have solar panels`,
      quality: (l, c) => `${l}% are 長期優良住宅 (long-life certified) · ${c}% have a 住宅性能評価書`,
      lowRise: p => `${p}% are in a low-rise residential zone (quiet, sunlight protected)`,
      storey3: p => `${p}% are 3-storey houses (small plots, more stairs)`,
      walkPen: (p, m) => `House commute −${p} pts: houses typically ${m} min from the station`,
      hazNote: 'House hazard score: ground-floor flooding (any depth) and liquefaction weigh more than for apartments',
    },
    hl: {
      title: 'Houses for sale · 100 m²+', sum: (u, n) => `${u} under ¥80M · ${n} new builds`,
      sorts: { price: 'Price ↑', size: 'Floor ↓', land: 'Plot ↓', year: 'Newest', walk: 'Walk ↑' },
      row: (b, l, lay) => `${b} m² floor · ${l ?? '?'} m² plot · ${lay}`, newBuild: 'NEW BUILD',
      none: 'No suitable house listed in this area.',
      note: d => `SUUMO used (built 2000+) and new detached houses with ≥100 m² floor, de-duplicated — ${d}. Asking prices; the badge compares with the ¥80M line.`,
    },
    pers: { budgetNoteH: 'Space “Choice” counts houses ≥100 m² (built 2000+ or new) under this price, from the last house crawl. The price half of Space is unchanged. At ¥80M the study values are used.' },
    sch: {
      title: 'Public schools', testES: 'National test, grade 6', testJHS: 'National test, grade 9',
      city: 'vs national avg, this city (2025)', pref: 'vs national avg, prefecture (city not published)',
      priv: 'Go to private junior high', privSub: t => `of public-ES graduates 2025 (Tokyo ${t}%)`,
      choiceES: 'School choice, elementary', choiceJHS: 'School choice, junior high',
      choice: { none: 'No — zoned school', adjacent: 'Adjacent zones', free: 'Free choice in the city', partial: 'Limited (some zones)', unknown: 'Not found — assume zoned' },
      count: 'Public schools', countV: (e, j) => `${e} elementary · ${j} junior high`, perES: n => `${n.toLocaleString('en')} children 0–14 per elementary`,
      near: 'Kids ≤800 m from an elementary', nearSub: n => `${n}% ≤1.2 km (straight line)`,
      hs: 'Public high school', hsChiba: (d, c) => `Chiba district ${d} (+ adjacent): ${c}`, hsWide: p => `${p}: prefecture-wide`,
      zone: 'School zone map', zoneYes: 'Published (listing pages show the assigned school)', zoneNo: 'Not in national data — nearest school shown',
      note: 'Information only, never in the score. Japan has no official ranking of public schools; the test figures are city or prefecture averages (mean of subject gaps, points of correct-answer rate). Always confirm the assigned school with the city’s 学務課.',
      srcChoice: 'Choice rules',
      esShort: 'ES', jhsShort: 'JHS', hsShort: d => `Chiba district ${d}`, hsWideShort: 'prefecture-wide',
      zoneYesShort: 'published', zoneNoShort: 'not published',
    },
    cmp: {
      hNew: n => `${n} new builds`, hLandSmall: s => `${s}% on <100 m²`, hBus: s => `${s}% bus-only`,
      sec: { schools: 'Public schools (info only)' },
      r: { hPrice: 'Typical 100–130 m² house (scored)', hPool: 'Suitable houses under ¥80M (scored)', hAll: 'Suitable houses listed',
        hLand: 'Median plot', hBldg: 'Median floor area', hWalk: 'Median walk to station', hPark2: '2-car parking', hSolar: 'Solar panels',
        hLongLife: '長期優良住宅', hPerfCert: '住宅性能評価書', hLowRise: 'Low-rise residential zone', hStorey3: '3-storey houses',
        schTest: 'National test vs avg (G6 / G9)', schPriv: 'Private junior-high share', schChoice: 'School choice', schKids: 'Children per elementary',
        schNear: 'Kids ≤800 m from an elementary', schHS: 'Public high-school district', schZone: 'School zone map' },
    },
  });
  add(I18N.ja.map, {
    titleH: '一戸建てを買うなら', subH: '東京駅・大手町へ通勤 · 0〜2歳の子 · 一戸建て100㎡以上',
    mode: { label: '住宅の種類', condo: 'マンション', house: '一戸建て' },
    gatedTipH: '総合点は高いものの、手の届く価格の一戸建て（100㎡以上・2000年以降築または新築）がほとんどありません。',
    layerDescH: {
      space: '実際に買える一戸建て：延床100㎡以上・2000年以降築または新築。50%は価格：延床100〜130㎡の物件の価格中央値（3,000万円＝100…1億5,000万円＝0）。50%は選択肢：8,000万円未満の件数。',
      live: 'SUUMOに掲載中の8,000万円未満の条件に合う一戸建て（100㎡以上・2000年以降築または新築）の件数（毎日更新）。スコアには含みません。',
      hazard: '一戸建て版：浅い・中程度の浸水と液状化の比重を高くしています（建物が地面に建ち、1階が浸水するため）。地震はやや低め。高いほど安全。',
      commute: 'マンションと同じ電車時間から、物件の駅徒歩の中央値が10分を超える1分ごとに1.5点を差し引きます（最大−15）。',
    },
    kpi: { house: '標準的な一戸建て' },
    hs: {
      price: (p, n, thin) => `価格 ${p}：延床100〜130㎡・2000年以降築または新築の${n}件の中央値${thin ? '（100〜130㎡が少ないため全サイズ）' : ''}。3,000万円＝100点…1億5,000万円＝0点`,
      priceNone: '価格：条件に合う一戸建ての掲載なし → 0点',
      choice: (u, n) => `選択肢：条件に合う${n}件のうち8,000万円未満は${u}件。0件＝0、10件＝58、20件＝74、60件以上＝100点`,
      src: d => `SUUMO 中古・新築一戸建ての売出価格（${d}集計、重複除去）`,
      short: (p, pp, u, cp) => `標準的な一戸建て ${p} → ${pp}点 · 8,000万円未満 ${u}件 → ${cp}点`,
      row: (p, u) => `標準 ${p} · 8,000万円未満 ${u}件`,
    },
    hr: {
      none: '条件に合う一戸建て（100㎡以上・2000年以降築または新築）の掲載なし',
      choiceBig: (u, n, nn) => `8,000万円未満の条件に合う一戸建て ${u}件（掲載${n}件、うち新築${nn}件）`,
      choice: (u, n, nn) => `8,000万円未満の条件に合う一戸建て ${u}件（掲載${n}件、うち新築${nn}件）`,
      choiceSmall: (u, n, nn) => `8,000万円未満の条件に合う一戸建ては${u}件のみ（掲載${n}件）`,
      priceLow: p => `手頃：延床100〜130㎡の標準的な一戸建ては${p}`, price: p => `延床100〜130㎡の標準的な一戸建ては${p}`,
      priceHigh: p => `高額：延床100〜130㎡の標準的な一戸建ては${p}`,
      land: (m, s) => `土地面積の中央値 ${m}㎡ · 土地100㎡未満の物件 ${s}%`,
      walk: (m, s, b) => `駅徒歩の中央値 ${m}分 · 15分以内 ${s}% · バス便 ${b}%`,
      park2: (p, p3) => `駐車2台以上可 ${p}%（3台以上 ${p3}%）`,
      solar: p => `太陽光発電あり ${p}%`,
      quality: (l, c) => `長期優良住宅 ${l}% · 住宅性能評価書あり ${c}%`,
      lowRise: p => `低層住居専用地域 ${p}%（静かで日当たりが守られる）`,
      storey3: p => `3階建て ${p}%（狭い敷地、階段が多い）`,
      walkPen: (p, m) => `一戸建ての通勤は−${p}点：駅徒歩の中央値が${m}分`,
      hazNote: '一戸建ての災害スコア：1階の浸水（深さを問わず）と液状化をマンションより重く評価',
    },
    hl: {
      title: '販売中の一戸建て · 100㎡以上', sum: (u, n) => `8,000万円未満 ${u}件 · 新築 ${n}件`,
      sorts: { price: '価格 ↑', size: '延床 ↓', land: '土地 ↓', year: '築年が新しい順', walk: '駅徒歩 ↑' },
      row: (b, l, lay) => `延床${b}㎡ · 土地${l ?? '?'}㎡ · ${lay}`, newBuild: '新築',
      none: 'このエリアに条件に合う一戸建ての掲載はありません。',
      note: d => `SUUMO 中古（2000年以降築）・新築一戸建て、延床100㎡以上、重複除去 — ${d}。売出価格。バッジは8,000万円ラインとの比較です。`,
    },
    pers: { budgetNoteH: '広さの「選択肢」は、直近の集計でこの価格未満の一戸建て（100㎡以上・2000年以降築または新築）の件数です。価格の半分は変わりません。8,000万円では調査時の値を使います。' },
    sch: {
      title: '公立学校', testES: '全国学力テスト 小6', testJHS: '全国学力テスト 中3',
      city: '全国平均との差・市の値（2025年度）', pref: '全国平均との差・都道府県の値（市は未公表）',
      priv: '私立中学への進学', privSub: t => `公立小卒業者（2025年3月、都全体 ${t}%）`,
      choiceES: '学校選択制（小学校）', choiceJHS: '学校選択制（中学校）',
      choice: { none: 'なし（指定校）', adjacent: '隣接校から選択', free: '区市内から自由選択', partial: '一部地域のみ', unknown: '確認できず（指定校と想定）' },
      count: '公立学校数', countV: (e, j) => `小学校${e}校 · 中学校${j}校`, perES: n => `小学校1校あたり0〜14歳 ${n.toLocaleString('ja')}人`,
      near: '小学校まで800m以内の子ども', nearSub: n => `1.2km以内 ${n}%（直線距離）`,
      hs: '公立高校', hsChiba: (d, c) => `千葉県 第${d}学区（隣接学区も可）：${c}`, hsWide: p => `${p}：県（都）内全域`,
      zone: '通学区域データ', zoneYes: 'あり（物件ページに指定校を表示）', zoneNo: '国のデータになし — 最寄り校を表示',
      note: '参考情報でスコアには含みません。公立小中学校の公式ランキングは存在せず、学力テストの値は市または都道府県の平均（教科ごとの平均正答率の差の平均、ポイント）です。指定校は必ず市区町村の学務課で確認してください。',
      srcChoice: '選択制の出典',
      esShort: '小', jhsShort: '中', hsShort: d => `千葉 第${d}学区`, hsWideShort: '全域',
      zoneYesShort: 'あり', zoneNoShort: 'なし',
    },
    cmp: {
      hNew: n => `新築${n}件`, hLandSmall: s => `100㎡未満 ${s}%`, hBus: s => `バス便 ${s}%`,
      sec: { schools: '公立学校（参考情報）' },
      r: { hPrice: '標準的な一戸建て100〜130㎡（採点）', hPool: '8,000万円未満の条件に合う一戸建て（採点）', hAll: '条件に合う一戸建ての掲載数',
        hLand: '土地面積の中央値', hBldg: '延床面積の中央値', hWalk: '駅徒歩の中央値', hPark2: '駐車2台以上', hSolar: '太陽光発電',
        hLongLife: '長期優良住宅', hPerfCert: '住宅性能評価書', hLowRise: '低層住居専用地域', hStorey3: '3階建て',
        schTest: '学力テスト 全国比（小6／中3）', schPriv: '私立中学進学率', schChoice: '学校選択制', schKids: '小学校1校あたりの子ども',
        schNear: '小学校800m以内の子ども', schHS: '公立高校の学区', schZone: '通学区域データ' },
    },
  });
})();

/* ── Listing-level assigned schools (app.js schoolTagHTML / compare, DATA_LOG item 20) ── */
Object.assign(I18N.en, {
  schTipH: 'Assigned public schools (school zone)', schTipNear: 'Nearest public schools (no zone map published)',
  schTipNA: '<div class="tip-h">Schools: not located</div>The listing address could not be placed on the map.',
  schES: 'Elementary', schJHS: 'Junior high', schAlt: n => `Zone boundary within 150 m — could also be ${n}`,
  schNote: 'From the city’s school zones (国土数値情報 A27/A32, 2023) at the listing’s 丁目 centre; distance is a straight line. Zones change — confirm with the city’s 学務課 before buying. Information only, not in the score.',
  schNoteNear: 'This city’s zone map is not in the national data, so the nearest school is shown — the assigned one can differ. Check the city’s 通学区域 page or ask the 学務課. Information only, not in the score.',
  schNearestShort: 'nearest, zone n/a', schAltShort: n => `or ${n}`,
});
Object.assign(I18N.ja, {
  schTipH: '指定の公立学校（通学区域）', schTipNear: '最寄りの公立学校（通学区域データなし）',
  schTipNA: '<div class="tip-h">学校：特定できません</div>物件の住所を地図上に特定できませんでした。',
  schES: '小学校', schJHS: '中学校', schAlt: n => `150m以内に学区の境界 — ${n}の可能性もあり`,
  schNote: '市の通学区域（国土数値情報 A27/A32、2023年）を物件の丁目の中心で判定。距離は直線です。学区は変更されることがあるため、購入前に市区町村の学務課で確認してください。参考情報でスコアには含みません。',
  schNoteNear: 'この市の通学区域は国のデータにないため最寄り校を表示しています。指定校とは異なる場合があります。市の通学区域のページか学務課で確認してください。参考情報でスコアには含みません。',
  schNearestShort: '最寄り・学区不明', schAltShort: n => `または${n}`,
});
Object.assign(I18N.en.sec, { schools: 'Public schools (info)' });
Object.assign(I18N.ja.sec, { schools: '公立学校（参考）' });
Object.assign(I18N.en.row, { schES: 'Elementary school', schJHS: 'Junior high school' });
Object.assign(I18N.ja.row, { schES: '小学校', schJHS: '中学校' });

/* ── House listing details (app.js houseFeatTagsHTML / compare, DATA_LOG item 21) ── */
Object.assign(I18N.en, {
  tagSolar: 'Solar', tagLongLife: '長期優良住宅', tagPerfCert: 'Performance cert', tagCovered: 'Carport / garage', tagFibre: 'Fibre internet',
  tagCorner: 'Corner lot', tagNarrowRoad: m => `Road ${m} m`,
  tagNarrowRoadTitle: 'The road in front is narrower than 4 m: rebuilding needs a setback (セットバック), which takes part of the plot.',
  notAdv: 'Not advertised',
  roadV: (w, f, n) => `${w} m road${f ? ` · ${f} m frontage` : ''}${n >= 2 ? ` · ${n} roads` : ''}`,
  insV: n => `Insulation grade ${n}/7`, utilV: y => `~¥${y.toLocaleString('en')}/yr energy`,
  cert: { longLife: '長期優良住宅', perfCert: 'Performance cert', groundSurvey: 'Ground survey', inspCert: 'Completion cert', defectIns: 'Defect insurance', flat35s: 'Flat 35S' },
  eco: { ecoHeater: 'Eco water heater', doubleGlaze: 'Double glazing', allElectric: 'All-electric', ecoMeasures: 'Energy-saving measures' },
});
Object.assign(I18N.ja, {
  tagSolar: '太陽光', tagLongLife: '長期優良住宅', tagPerfCert: '性能評価書', tagCovered: 'カーポート・車庫', tagFibre: '光回線',
  tagCorner: '角地', tagNarrowRoad: m => `前面道路${m}m`,
  tagNarrowRoadTitle: '前面道路が4m未満のため、建て替え時にセットバック（敷地の一部を道路として後退）が必要です。',
  notAdv: '記載なし',
  roadV: (w, f, n) => `前面道路${w}m${f ? `・接道${f}m` : ''}${n >= 2 ? `・${n}方向` : ''}`,
  insV: n => `断熱等級${n}`, utilV: y => `目安光熱費 年${y.toLocaleString('ja')}円`,
  cert: { longLife: '長期優良住宅', perfCert: '住宅性能評価書', groundSurvey: '地盤調査済', inspCert: '完了検査済証', defectIns: '瑕疵保険', flat35s: 'フラット35S' },
  eco: { ecoHeater: '省エネ給湯器', doubleGlaze: '複層ガラス', allElectric: 'オール電化', ecoMeasures: '省エネ対策' },
});
Object.assign(I18N.en.sec, { plot: 'Plot & zoning' });
Object.assign(I18N.ja.sec, { plot: '土地・法令上の制限' });
Object.assign(I18N.en.row, { road: 'Road / frontage', zoning: 'Zoning (用途地域)', bcrFar: 'Coverage / floor-area ratio', covered: 'Covered parking',
  fibre: 'Fibre internet', solar: 'Solar panels', certs: 'Certificates', energy: 'Energy' });
Object.assign(I18N.ja.row, { road: '前面道路・接道', zoning: '用途地域', bcrFar: '建ぺい率・容積率', covered: '屋根付き駐車場',
  fibre: '光回線', solar: '太陽光発電', certs: '証明書・保証', energy: '省エネ性能' });
