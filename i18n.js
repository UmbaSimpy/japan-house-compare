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
