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
    loanTitle: 'Used for the estimated monthly cost: 35-year loan, no down payment',
    searchPh: 'Building, station, address…', reset: 'Reset', any: 'Any',
    minSize: 'Min size', maxPrice: 'Max price', maxWalk: 'Max walk', builtFrom: 'Built from',
    fmtMinM2: v => `${v} m²+`, fmtMaxPrice: v => `≤ ¥${v / 100}M`, fmtMaxWalk: v => `≤ ${v} min`, fmtYearFrom: v => `${v}+`,
    tShin: '新耐震 1982+', tShinTitle: 'Built 1982 or later: new seismic code, qualifies for the mortgage tax deduction',
    tWalk10: 'Walk ≤10 min', tElev: 'Elevator', tPet: 'Pets OK',
    tLiqLow: 'Low liquefaction', tLiqLowTitle: 'Hide listings whose area is rated high or somewhat-high liquefaction risk',
    tCut: 'Price dropped', tNew: 'New this week', tNewTitle: 'First seen in the last 7 days',
    sScore: 'Score: Best First', sDefault: 'Default', sValue: 'Best deal vs similar',
    sPriceAsc: 'Price: Low → High', sPriceDesc: 'Price: High → Low', sPpm: '¥/m²: Low → High',
    sMonthly: 'Est. monthly: Low → High', sFees: 'Fees/m²: Low → High', sArea: 'Area: Largest First',
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
      price: 'Price', ppm: '¥ per m²', vsSimilar: 'vs similar condos', monthly: 'Est. monthly (loan + fees)', priceChange: 'Price change',
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
    loanTitle: '月々の目安の計算に使用（35年ローン・頭金なし）',
    searchPh: '建物名・駅・住所…', reset: 'リセット', any: '指定なし',
    minSize: '最低面積', maxPrice: '上限価格', maxWalk: '駅徒歩', builtFrom: '築年',
    fmtMinM2: v => `${v}m²以上`, fmtMaxPrice: v => `${I18N.ja.priceMan(v)}以下`, fmtMaxWalk: v => `${v}分以内`, fmtYearFrom: v => `${v}年以降`,
    tShin: '新耐震（1982年以降）', tShinTitle: '1982年以降の建築：新耐震基準で、住宅ローン控除の対象',
    tWalk10: '駅徒歩10分以内', tElev: 'エレベーター', tPet: 'ペット可',
    tLiqLow: '液状化リスク低', tLiqLowTitle: '液状化の危険度が「高い」「やや高い」エリアの物件を除外',
    tCut: '値下げあり', tNew: '今週の新着', tNewTitle: '過去7日以内に初掲載',
    sScore: 'スコアが高い順', sDefault: '標準', sValue: '相場より割安な順',
    sPriceAsc: '価格が安い順', sPriceDesc: '価格が高い順', sPpm: '㎡単価が安い順',
    sMonthly: '月々の目安が安い順', sFees: '㎡あたり管理費等が安い順', sArea: '面積が広い順',
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
      price: '価格', ppm: '㎡単価', vsSimilar: '似た物件との比較', monthly: '月々の目安（ローン＋管理費等）', priceChange: '価格変更',
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
    space: 'Large modern condos you could actually buy. 50% Price: what a 100 m² flat built 2000+ costs (median ¥/m² of listings ≥90 m², built 2000+). 50% Choice: how many of those listings are under ¥80M. Older buildings are shown but not scored.',
    growth: 'Population change 2020→25, IPSS 2050 projection, land-price trend, child share, pipeline projects.',
    costco: 'Estimated drive time to the nearest Costco warehouse (≤15 min = 100, ≥75 min = 0).',
    bus: 'Weekday highway buses to Tokyo Station usable for commuting (morning in, evening out).',
  },
  shortOnly: 'Shortlist only', showCostco: 'Costco', showBus: 'Bus routes', showRanks: 'Ranks',
  legendLow: 'weaker', legendHigh: 'stronger', notAnalysed: 'not analysed', belowGate: 'below space gate',
  back: 'All areas', rankOf: (r, n) => `#${r} of ${n}`, layerRank: (r, l) => `#${r} in ${l}`, overallRank: r => `overall #${r}`, shortlisted: 'Shortlisted', gated: 'Below space gate',
  gatedTip: 'Scores well overall but has almost no 90 m²+ condo stock at a reachable price.',
  total: 'Total', weight: w => `weight ${w}`, sortedBy: l => `Ranked by ${l}`,
  pros: 'Pros', cons: 'Cons', info: 'Info', nothing: 'Nothing in this category.',
  cats: { all: 'All', commute: 'Commute', bus: 'Bus', childcare: 'Childcare', housing: 'Housing', growth: 'Growth', costco: 'Costco', hazard: 'Hazards', crime: 'Crime', data: 'Data notes' },
  sp: {
    head: (v, pp, cp) => `Space ${v} = ½ × Price ${pp} + ½ × Choice ${cp}`,
    price: (p, n, thin) => `Price ${p} for 100 m²: median ¥/m² of ${n} listing${n === 1 ? '' : 's'} ≥90 m² built 2000+, × 100${thin ? ' (thin sample)' : ''}. Scale: ¥30M = 100 pts … ¥150M = 0`,
    priceNone: 'Price: no listing ≥90 m² built 2000+ → 0 pts',
    choice: u => `Choice: ${u} of those listings under ¥80M. Scale: 0 = 0, 10 = 58, 20 = 74, 60+ = 100 pts`,
    old: (n, m) => `Not scored: ${n} listings ≥90 m² under ¥80M of any age (${m} built 2000+)`,
    src: 'SUUMO asking prices, crawl 2026-10-12, de-duplicated',
    short: (p, pp, u, cp) => `Price ${p}/100 m² → ${pp} pts · Choice ${u} under ¥80M → ${cp} pts`,
    row: (p, u) => `${p}/100 m² · ${u} under ¥80M`,
    budgetLive: d => `(your budget, SUUMO listings ${d})`,
  },
  kpi: { commute: 'to Tokyo', office: o => `to ${o}`, large: 'modern 100 m²', daycare: '0–2 daycare', costco: 'to Costco' },
  pers: {
    button: 'Personalise', office: 'Your office', officeDefault: 'Tokyo Stn / Otemachi (study default)',
    walkHome: 'Walk home → station (min)', walkOffice: 'Walk station → office (min)',
    officeNote: d => `Train times from each area's main station, Yahoo!乗換案内 arrive-by 08:45 on ${d}. Walking minutes only change the door-to-door estimate, not the score.`,
    noMatrix: 'Office matrix not built yet — run commute_matrix.py.',
    weights: 'Weights', reset: 'Reset', weightsNote: 'Totals, ranks and the shortlist update live. Saved in this browser only.',
    budget: 'Budget', budgetLbl: 'Max price',
    budgetNote: 'Space “Choice” counts modern (2000+) listings ≥90 m² under this price, from today’s SUUMO list. The price half of Space is unchanged. At ¥80M the study snapshot is used.',
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
    spNone: 'No condo ≥90 m² built 2000+ listed (Oct 2026): large flats here are older buildings',
    spChoiceBig: (u, q) => `Plenty of choice: ${u} modern (2000+) listings ≥90 m² under ¥80M (${q} at any price)`,
    spChoiceSmall: (u, q) => `Little choice: only ${u} modern (2000+) listing${u === 1 ? '' : 's'} ≥90 m² under ¥80M (${q} at any price)`,
    spChoice: (u, q) => `${u} modern (2000+) listings ≥90 m² under ¥80M (${q} at any price)`,
    spPriceLow: p => `Modern large flats are affordable: ~${p} for 100 m² (built 2000+)`,
    spPriceHigh: p => `Modern large flats are expensive: ~${p} for 100 m² (built 2000+)`,
    spPrice: p => `Modern 100 m² flat ~${p} (built 2000+)`,
    spOld: (n, m) => `All ages: ${n} listings ≥90 m² under ¥80M, ${n - m} of them built before 2000 (not scored)`,
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
    space: '実際に買える広い築浅マンション。50％ 価格：2000年以降築・100㎡の価格（90㎡以上・2000年以降築の掲載の㎡単価中央値×100）。50％ 選択肢：そのうち8,000万円未満の件数。古い物件は表示のみで採点しない。',
    growth: '人口増減（2020→25）、社人研2050年推計、地価の推移、年少人口割合、開発計画。',
    costco: '最寄りのコストコまでの推定車移動時間（15分以内＝100、75分以上＝0）。',
    bus: '通勤に使える平日の東京駅行き高速バス（朝の上り・夕方の下り）。',
  },
  shortOnly: '候補のみ', showCostco: 'コストコ', showBus: 'バス路線', showRanks: '順位',
  legendLow: '弱い', legendHigh: '強い', notAnalysed: '分析対象外', belowGate: '広さ基準未満',
  back: '全エリア', rankOf: (r, n) => `${n}エリア中 ${r}位`, layerRank: (r, l) => `${l} ${r}位`, overallRank: r => `総合 ${r}位`, shortlisted: '候補', gated: '広さ基準未満',
  gatedTip: '総合点は高いが、手の届く価格の90㎡以上のマンションがほぼない。',
  total: '総合', weight: w => `配点 ${w}`, sortedBy: l => `${l}順`,
  pros: '長所', cons: '短所', info: '情報', nothing: 'このカテゴリーには項目がありません。',
  cats: { all: 'すべて', commute: '通勤', bus: 'バス', childcare: '子育て', housing: '住宅', growth: '成長性', costco: 'コストコ', hazard: '災害リスク', crime: '治安', data: 'データ注記' },
  sp: {
    head: (v, pp, cp) => `広さ ${v} ＝ ½×価格 ${pp} ＋ ½×選択肢 ${cp}`,
    price: (p, n, thin) => `価格：100㎡で ${p}（90㎡以上・2000年以降築の掲載${n}件の㎡単価中央値×100）${thin ? '・件数少' : ''}。3,000万円＝100点〜1.5億円＝0点`,
    priceNone: '価格：90㎡以上・2000年以降築の掲載なし → 0点',
    choice: u => `選択肢：そのうち8,000万円未満が${u}件。0件＝0・10件＝58・20件＝74・60件以上＝100点`,
    old: (n, m) => `採点外：築年を問わない8,000万円未満の90㎡以上 ${n}件（うち2000年以降築 ${m}件）`,
    src: 'SUUMO売出価格、2026-10-12取得、重複除去',
    short: (p, pp, u, cp) => `価格 ${p}/100㎡ → ${pp}点・選択肢 ${u}件 → ${cp}点`,
    row: (p, u) => `${p}/100㎡・8,000万円未満 ${u}件`,
    budgetLive: d => `（あなたの予算、SUUMO掲載 ${d}）`,
  },
  kpi: { commute: '東京まで', office: o => `${o}まで`, large: '築浅100㎡', daycare: '0〜2歳 保育料', costco: 'コストコまで' },
  pers: {
    button: 'カスタマイズ', office: '勤務先', officeDefault: '東京駅／大手町（調査の既定）',
    walkHome: '自宅→駅 徒歩（分）', walkOffice: '駅→勤務先 徒歩（分）',
    officeNote: d => `各エリアの代表駅からの乗車時間（Yahoo!乗換案内、${d} 8:45着）。徒歩分数はドアtoドアの目安のみに反映し、スコアには影響しません。`,
    noMatrix: '勤務先マトリクス未作成（commute_matrix.py を実行）。',
    weights: '配点', reset: 'リセット', weightsNote: '総合点・順位・候補がすぐに更新されます。設定はこのブラウザにのみ保存。',
    budget: '予算', budgetLbl: '上限価格',
    budgetNote: '広さの「選択肢」は、この価格未満の2000年以降築・90㎡以上の物件数（本日のSUUMO掲載）で再計算。広さの価格部分は変わりません。8,000万円では調査時点の値を使用。',
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
    spNone: '90㎡以上・2000年以降築の掲載なし（2026年10月）：広い物件は古い建物のみ',
    spChoiceBig: (u, q) => `選択肢が多い：2000年以降築・90㎡以上で8,000万円未満が${u}件（価格問わず${q}件）`,
    spChoiceSmall: (u, q) => `選択肢が少ない：2000年以降築・90㎡以上で8,000万円未満は${u}件のみ（価格問わず${q}件）`,
    spChoice: (u, q) => `2000年以降築・90㎡以上で8,000万円未満が${u}件（価格問わず${q}件）`,
    spPriceLow: p => `築浅の広い物件が手頃：100㎡で約${p}（2000年以降築）`,
    spPriceHigh: p => `築浅の広い物件が高い：100㎡で約${p}（2000年以降築）`,
    spPrice: p => `築浅100㎡で約${p}（2000年以降築）`,
    spOld: (n, m) => `築年問わず：8,000万円未満の90㎡以上 ${n}件、うち2000年より前の築 ${n - m}件（採点外）`,
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
