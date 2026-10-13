/* ═══════════════════════════════════════════════
   AREA MAP  — location study rendered on Leaflet
   Data: MAP_DATA from map-data.js (built by build_map.py from data/locations.json)
   Strings: I18N.*.map in i18n.js
════════════════════════════════════════════════ */
const MP = {
  layer: 'total', sel: null, shortOnly: false, showCostco: true, showBus: true, showRanks: true,
  tab: 'pros', cat: 'all', map: null, base: null, labels: null, polys: {}, edges: {}, rankLayer: null,
  costcoLayer: null, busLayer: null, domains: {},
};
const MP_LAYERS = ['total', 'space', 'commute', 'childcare', 'hazard', 'growth', 'bus', 'costco', 'crime', 'live'];
const MP_SUBS = ['space', 'commute', 'childcare', 'hazard', 'growth', 'bus', 'costco'];
const MP_CATS = ['commute', 'bus', 'childcare', 'housing', 'hazard', 'crime', 'growth', 'costco', 'data'];
const MP_CAT_ICON = { commute: '🚆', bus: '🚌', childcare: '👶', housing: '🏢', hazard: '🌊', growth: '📈', costco: '🛒', crime: '🚓', data: 'ⓘ' };
const MP_SCORE_CAT = { space: 'housing', commute: 'commute', childcare: 'childcare', hazard: 'hazard', growth: 'growth', bus: 'bus', costco: 'costco' };
const mpAreas = () => MAP_DATA.areas;
const mpById = id => MAP_DATA.areas.find(a => a.id === id);
const mpName = a => LANG === 'ja' ? a.nameJa : a.nameEn;
const mpAlt = a => LANG === 'ja' ? a.nameEn : a.nameJa;
const mpLive = a => (typeof AREA_STATS !== 'undefined' && AREA_STATS.areas?.[a.id]) || null;   // daily area-stats.js (track A)
const mpVal = (a, l) => l === 'total' ? a.totalScore : l === 'live' ? (mpLive(a)?.u80 ?? null) : l === 'crime' ? (a.crime?.safetyIndex ?? null) : a.scores[l];
const mpLight = () => document.documentElement.classList.contains('light');
const mpEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mpLL = poly => poly.map(p => p.map(r => r.map(([x, y]) => [y, x])));

function mpDomain(l) {
  if (!MP.domains[l]) {
    const v = mpAreas().map(a => mpVal(a, l)).filter(x => x != null);
    MP.domains[l] = [Math.min(...v), Math.max(...v)];
  }
  return MP.domains[l];
}
function mpColor(v, l = MP.layer) {
  if (v == null) return '#777';
  const [lo, hi] = mpDomain(l);
  const x = Math.max(0, Math.min(1, (v - lo) / ((hi - lo) || 1)));
  return `hsl(${Math.round(2 + x * 140)}, ${mpLight() ? 62 : 66}%, ${mpLight() ? 47 : 52}%)`;
}

/* ── pros / cons / info rules ── */
function mpPoints(a) {
  const R = (k, ...x) => t('map.r.' + k, ...x), yen = v => t('map.yen', v), yenM = v => t('map.yenM', v);
  const out = { pros: [], cons: [], info: [] };
  const add = (where, cat, text) => out[where].push({ cat, text });
  const c = a.commute || {}, ch = a.childcare || {}, h = a.housing || {}, g = a.demographics || {}, co = a.costco || {}, b = a.bus, hz = a.hazard;

  const off = typeof mpOffice === 'function' ? mpOffice(a) : null;
  if (off) {
    const e = off.min + 5 * off.xfer, on = mpOfficeName(mpOfficeInfo(MP.office));
    add(e <= 30 ? 'pros' : e >= 50 ? 'cons' : 'info', 'commute', R('commuteTime', off.min, c.station, off.xfer, on));
    add('info', 'commute', R('door', off.min + MP.walkHome + MP.walkOffice, MP.walkHome, MP.walkOffice));
    if (off.pass) add(off.pass > 30000 ? 'cons' : 'info', 'commute', R(off.pass > 30000 ? 'passHigh' : 'pass', yen(off.pass)));
  } else if (MP.office) add('info', 'commute', R('officeMissing'));
  if (c.minToTokyo != null) {
    const e = c.effectiveMin ?? c.minToTokyo;
    add(off ? 'info' : e <= 30 ? 'pros' : e >= 50 ? 'cons' : 'info', 'commute',
      R('commuteTime', c.minToTokyo, c.station, c.transfers, t('map.dest.' + (c.destination || 'Tokyo'))));
  }
  const crowd = parseInt(c.crowding, 10);
  if (!isNaN(crowd)) {
    const line = c.crowdingLine || c.crowding;
    if (crowd <= 130) add('pros', 'commute', R('crowdLow', line));
    else if (crowd >= 155) add('cons', 'commute', R('crowdHigh', line));
    else add('info', 'commute', R('crowdMid', line));
  }
  if (c.passMonthly && !off) add(c.passMonthly > 30000 ? 'cons' : 'info', 'commute', R(c.passMonthly > 30000 ? 'passHigh' : 'pass', yen(c.passMonthly)));

  if (!b) add('info', 'bus', R('busNone'));
  else if (b.available === null) add('info', 'bus', R('busUnverified', b.route));
  else if (b.morningCount == null) add('info', 'bus', b.route);
  else if (b.morningCount >= 3 && b.eveningCount >= 3) add('pros', 'bus', R('busGood', b.route, b.morningCount, b.eveningCount));
  else add('info', 'bus', R('busThin', b.route, b.morningCount, b.eveningCount));
  if (b && b.fare) add('info', 'bus', R('busFare', yen(b.fare), b.passMonthly ? yen(b.passMonthly) : null, b.rideMin ?? '?'));

  const fee = ch.daycare0to2Monthly, imp = ch.daycare0to2MonthlyImputed;
  if (fee === 0) add('pros', 'childcare', R('dayFree'));
  else if (fee != null) add(fee >= 50000 ? 'cons' : 'info', 'childcare', R('dayFee', yen(fee), false));
  else if (imp != null) add(imp >= 50000 ? 'cons' : 'info', 'childcare', R('dayFee', yen(imp), true));
  if (ch.feeNote && !/^Tokyo 0–2/.test(ch.feeNote)) add('info', 'childcare', R('feeNote', ch.feeNote));
  const w = ch.waitlist2026 ?? ch.waitlist2025;
  if (w === 0) add('pros', 'childcare', R('wait0'));
  else if (w >= 30) add('cons', 'childcare', R('waitHigh', w));
  else if (w != null) add('info', 'childcare', R('waitSome', w));
  const gk = ch.gakudoWaitlist;
  if (gk === 0) add('pros', 'childcare', R('gakudo0'));
  else if (gk >= 100) add('cons', 'childcare', R('gakudoHigh', gk));
  else if (gk != null) add('info', 'childcare', R('gakudoSome', gk));
  else if (/^<50/.test(ch.gakudoWaitlistNote || '')) add('info', 'childcare', R('gakudoSmall'));
  if (ch.medicalAge != null) {
    if (ch.medicalAge < 18) add('cons', 'childcare', R('medShort', ch.medicalAge, ch.medicalCopay));
    else if (ch.medicalCopay === 0) add('pros', 'childcare', R('medGood'));
    else if (ch.medicalCopay != null) add(ch.medicalCopay >= 500 ? 'cons' : 'info', 'childcare', R('medCopay', ch.medicalAge, ch.medicalCopay));
  }
  if (ch.lunchFree === 'Elementary + junior high free') add('pros', 'childcare', R('lunchFree'));
  else if (ch.lunchFree) add('info', 'childcare', R('lunch', ch.lunchFree));
  if (a.pref === 'Tokyo') add('pros', 'childcare', R('tokyoCash'));
  if (ch.cashExtras) {
    const extra = a.pref === 'Tokyo' ? ch.cashExtras.split('; ').slice(2).join('; ') : ch.cashExtras;
    if (extra) add('info', 'childcare', R('extras', extra));
  }
  const hl = a.health;                      // data/area_health.json (国土数値情報 P04 2020) — info only
  if (hl && hl.kidsNearDedicated1km != null) {
    const near = Math.round(hl.kidsNearDedicated1km);
    add(near >= 90 ? 'pros' : near < 50 ? 'cons' : 'info', 'childcare', R('peds', near, hl.pedsDedicated, hl.peds, hl.per10k));
  }

  // space v2 (2026-10-13): scored = listings ≥90 m² built 2000+; everything else is info
  const bg = a.budget;                      // your budget (Personalise) → today's listings; else the study snapshot
  const q = bg ? bg.q : h.modern90Count ?? 0, u = bg ? bg.n : h.modern90Under ?? 0, P = h.priceUsedForScore;
  if (!q) add('cons', 'housing', R('spNone'));
  else {
    add(u >= 20 ? 'pros' : u <= 3 ? 'cons' : 'info', 'housing', mpB(R(u >= 20 ? 'spChoiceBig' : u <= 3 ? 'spChoiceSmall' : 'spChoice', u, q)));
    if (P) add(P <= 50e6 ? 'pros' : P >= 90e6 ? 'cons' : 'info', 'housing', R(P <= 50e6 ? 'spPriceLow' : P >= 90e6 ? 'spPriceHigh' : 'spPrice', yenM(P)));
  }
  if (h.count90under80M) add('info', 'housing', R('spOld', h.count90under80M, h.count90under80MBuilt2000 ?? 0));
  else if (!h.share90plus) add('info', 'housing', R('noLarge'));
  if (h.share90plus != null) add('info', 'housing', R('shareHigh', h.share90plus));
  if (h.median90to105) add('info', 'housing', R('price', yenM(h.median90to105)));
  if (h.landPrice) add('info', 'housing', R('land', yen(h.landPrice), h.landChange5y));
  const lv = mpLive(a);
  const fe = lv?.fees;                      // watchlist only: 管理費 + 修繕積立金 from the condo detail pages (area_stats.py)
  if (fe && (fe.n || fe.nAll)) add('info', 'housing', fe.n ? R('fees', yen(fe.monthly), fe.perM2, fe.n) : R('feesAll', yen(fe.monthlyAll), fe.perM2All, fe.nAll));
  if (lv && !lv.stale) {
    add('info', 'housing', R('liveNow', lv.date, lv.n90, lv.u80, lv.median90to105 ? yenM(lv.median90to105) : null, lv.n90to105));
    if (lv.d7 && (lv.d7[0] || lv.d7[1])) add('info', 'housing', R('liveTrend', 7, lv.d7[0], lv.d7[1]));
    if (lv.d30 && (lv.d30[0] || lv.d30[1])) add('info', 'housing', R('liveTrend', 30, lv.d30[0], lv.d30[1]));
    if (lv.projects) add(lv.projects >= 3 ? 'pros' : 'info', 'housing', R('newProjects', lv.projects, lv.projectNames.slice(0, 4).join(' · ')));
    else add('info', 'housing', R('noNewProjects', lv.newUnits));
  }

  if (hz) {   // thresholds: see data/DATA_LOG.md (hazard)
    const wa = hz.waterAny, liq = Math.round(hz.liqHigh + hz.liqMid);
    add(wa <= 10 ? 'pros' : wa >= 50 ? 'cons' : 'info', 'hazard', R(wa <= 10 ? 'waterLow' : wa >= 50 ? 'waterHigh' : 'water', wa));
    if (hz.waterDeep >= 15) add('cons', 'hazard', R('waterDeep', hz.waterDeep));
    if (wa > 0) add('info', 'hazard', R('waterMix', hz.flood, hz.surge, hz.tsunami));
    add(hz.liqHigh >= 35 ? 'cons' : liq <= 10 ? 'pros' : 'info', 'hazard', R(hz.liqHigh >= 35 ? 'liqHigh' : liq <= 10 ? 'liqLow' : 'liq', hz.liqHigh >= 35 ? hz.liqHigh : liq));
    if (hz.fillUpland >= 8) add('info', 'hazard', R('fillUpland', hz.fillUpland));
    if (hz.landslideRed >= 0.5) add('cons', 'hazard', R('slideRed', hz.landslideRed));
    else if (hz.landslide >= 1) add('info', 'hazard', R('slide', hz.landslide));
    for (const f of a.noise?.flags || [])   // data/area_noise.json — hand-curated, info only (never scored)
      add(f.level === 'con' ? 'cons' : 'info', 'hazard', R('noise_' + f.kind) + (f.note ? ` — ${f.note}` : ''));
    if (hz.quake30 != null) add(hz.quake30 >= 75 ? 'cons' : hz.quake30 <= 50 ? 'pros' : 'info', 'hazard', R(hz.quake30 >= 75 ? 'quakeHigh' : hz.quake30 <= 50 ? 'quakeLow' : 'quake', hz.quake30));
  }

  const cr = a.crime;                       // data/area_crime.json (police 刑法犯認知件数 2025) — info only, never scored
  if (cr) {   // thresholds: see data/DATA_LOG.md item 11
    const bu = cr.burglaryPer10k, vi = cr.violentPer10k;
    if (bu != null) add(bu <= 0.5 ? 'pros' : bu >= 1.5 ? 'cons' : 'info', 'crime', R(bu <= 0.5 ? 'burgLow' : bu >= 1.5 ? 'burgHigh' : 'burg', bu, cr.burglary));
    if (vi != null) add(vi <= 3.5 ? 'pros' : vi >= 10 ? 'cons' : 'info', 'crime', R(vi <= 3.5 ? 'violLow' : vi >= 10 ? 'violHigh' : 'viol', vi, cr.violent));
    else if (cr.total != null) add('info', 'crime', R('violNA'));
    if (cr.totalPer1k != null) add('info', 'crime', R(cr.totalPer1k >= 10 ? 'crimeHub' : 'crimeTotal', cr.totalPer1k, cr.total));
    else add('info', 'crime', R('crimeNA'));
  }

  const pc = g.change2020to2025, ip = g.ipss2050, cs = g.childShare;
  if (pc != null) add(pc >= 4 ? 'pros' : pc <= -1.5 ? 'cons' : 'info', 'growth', R(pc >= 4 ? 'popUp' : pc <= -1.5 ? 'popDown' : 'pop', pc));
  if (ip != null) add(ip >= 5 ? 'pros' : ip <= -10 ? 'cons' : 'info', 'growth', R(ip >= 5 ? 'ipssUp' : ip <= -10 ? 'ipssDown' : 'ipss', ip));
  if (cs != null) add(cs >= 14 ? 'pros' : 'info', 'growth', R(cs >= 14 ? 'kidsHigh' : 'kids', +cs.toFixed(1)));
  for (const p of a.pipeline?.projects || [])   // data/pipeline.json register (rubric there), checked monthly
    add(p.pts > 0 ? 'pros' : 'cons', 'growth', R('pipe', LANG === 'ja' && p.nameJa ? p.nameJa : p.name, p.pts, p.status === 'open' || p.status === 'completed'));

  if (co.driveMin != null) {
    const k = co.driveMin <= 20 ? 'costcoNear' : co.driveMin >= 50 ? 'costcoFar' : 'costco';
    add(co.driveMin <= 20 ? 'pros' : co.driveMin >= 50 ? 'cons' : 'info', 'costco', R(k, co.nearest, Math.round(co.driveMin)));
  }
  (a.dataFlags || []).forEach(f => add('info', 'data', f));
  return out;
}

/* ── map ── */
function mpTiles() {   // GSI pale map; dark theme = CSS-inverted tiles (see .mp-dark)
  document.getElementById('mp-map').classList.toggle('mp-dark', !mpLight());
}

function mpStyle(a) {
  const sel = MP.sel, isSel = sel === a.id, hidden = MP.shortOnly && !a.shortlisted;
  return {
    fillColor: mpColor(mpVal(a, MP.layer)),
    fillOpacity: hidden ? 0.04 : sel && !isSel ? 0.18 : a.shortlisted ? 0.58 : 0.36,
    // casing: the visible border line is drawn on top by mpEdgeStyle (own pane), so boundaries read without hover
    color: isSel ? (mpLight() ? '#111' : '#fff') : mpLight() ? 'rgba(255,255,255,.95)' : 'rgba(10,10,18,.9)',
    weight: isSel ? 4.5 : 3,
  };
}

function mpEdgeStyle(a) {
  return {
    pane: 'mpEdges', interactive: false, fill: false,
    color: mpLight() ? 'rgba(25,25,35,.78)' : 'rgba(235,235,245,.7)',
    weight: a.shortlisted ? 1.3 : 1, dashArray: a.shortlisted ? null : '5 3',
    opacity: MP.shortOnly && !a.shortlisted ? .35 : 1,
  };
}

function mpRestyle() {
  mpAreas().forEach(a => { MP.polys[a.id].setStyle(mpStyle(a)); MP.edges[a.id]?.setStyle(mpEdgeStyle(a)); });
  mpRanks();
  mpLegend();
}

// Rank of every area on one layer, among all areas (ties share a rank). 'total' = the official (or personalised) rank.
function mpLRank(l = MP.layer) {
  if (l === 'total') return Object.fromEntries(mpAreas().map(a => [a.id, a.rank]));
  const vs = mpAreas().map(a => [a.id, mpVal(a, l)]).filter(x => x[1] != null).sort((x, y) => y[1] - x[1]);
  const out = {};
  vs.forEach(([id, v], i) => { out[id] = i && v === vs[i - 1][1] ? out[vs[i - 1][0]] : i + 1; });
  return out;
}

function mpRanks() {
  if (MP.rankLayer) MP.rankLayer.remove();
  MP.rankLayer = L.layerGroup();
  // total: shortlisted areas only (official rank); a single layer: every visible area, ranked on that layer alone
  const rk = mpLRank(), byLayer = MP.layer !== 'total';
  if (MP.showRanks) mpAreas().filter(a => byLayer ? !(MP.shortOnly && !a.shortlisted) : a.shortlisted).forEach(a => {
    const sel = MP.sel === a.id, r = rk[a.id];
    if (r == null) return;
    L.marker([a.lat, a.lng], {
      interactive: false, keyboard: false, zIndexOffset: sel ? 1000 : 100 - r,
      icon: L.divIcon({ className: 'mp-rk' + (sel ? ' sel' : '') + (byLayer && r <= 3 ? ' top' : '') + (byLayer && r > 10 ? ' far' : ''),
        iconSize: [22, 22], html: `<span style="--c:${mpColor(mpVal(a, MP.layer))}">${r}</span>` }),
    }).addTo(MP.rankLayer);
  });
  MP.rankLayer.addTo(MP.map);
}

function mpCurve(from, to, bend = 0.18, n = 28) {
  const [y1, x1] = from, [y2, x2] = to, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const cx = mx - (y2 - y1) * bend, cy = my + (x2 - x1) * bend;
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n, u = 1 - s;
    return [u * u * y1 + 2 * u * s * cy + s * s * y2, u * u * x1 + 2 * u * s * cx + s * s * x2];
  });
}

function mpOverlays() {
  const ts = MAP_DATA.tokyoStation;
  if (MP.costcoLayer) MP.costcoLayer.remove();
  if (MP.busLayer) MP.busLayer.remove();
  MP.costcoLayer = L.layerGroup(MAP_DATA.costco.map(c => L.marker([c.lat, c.lng], {
    icon: L.divIcon({ className: 'mp-costco', iconSize: [24, 24], html: '<span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e31837" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6"/></svg></span>' }),
  }).bindTooltip(t('map.costcoTip', LANG === 'ja' ? c.name : c.nameEn, c.opened), { direction: 'top', offset: [0, -10] })));
  MP.busLayer = L.layerGroup(MAP_DATA.busOrigins.map(o => {
    const a = mpById(o.area), strong = a?.bus?.morningCount >= 3;
    return L.layerGroup([
      L.polyline(mpCurve([o.lat, o.lng], [ts.lat, ts.lng]), {
        className: 'mp-busline' + (strong ? ' strong' : ''), weight: strong ? 3 : 1.6, interactive: false,
      }),
      L.circleMarker([o.lat, o.lng], { radius: strong ? 5 : 3.5, className: 'mp-busstop' })
        .bindTooltip(t('map.busTip', o.name), { direction: 'top' }),
    ]);
  }));
  if (MP.showCostco) MP.costcoLayer.addTo(MP.map);
  if (MP.showBus) MP.busLayer.addTo(MP.map);
  if (!MP.tsMarker) MP.tsMarker = L.marker([ts.lat, ts.lng], {
    zIndexOffset: 1000, icon: L.divIcon({ className: 'mp-ts', iconSize: [30, 30], html: '<span>★</span>' }),
  }).addTo(MP.map);
  MP.tsMarker.unbindTooltip().bindTooltip(t('map.tokyoStation'), { direction: 'right', permanent: false });
}

function mpLegend() {
  const el = document.getElementById('mp-legend');
  if (!el) return;
  const [lo, hi] = mpDomain(MP.layer);
  const stops = [0, .25, .5, .75, 1].map(x => mpColor(lo + x * (hi - lo))).join(',');
  el.innerHTML = `<div class="mp-lg-t">${t('map.layers.' + MP.layer)}</div>
    <div class="mp-lg-bar" style="background:linear-gradient(90deg,${stops})"></div>
    <div class="mp-lg-n"><span>${lo.toFixed(0)} · ${t('map.legendLow')}</span><span>${t('map.legendHigh')} · ${hi.toFixed(0)}</span></div>
    <div class="mp-lg-k"><i class="sw solid"></i>${t('map.shortlisted')}<i class="sw dash"></i>${t('map.belowGate')}<i class="sw none"></i>${t('map.notAnalysed')}</div>`;
}

// Plain-language breakdown of one area's Space score (tooltip, detail bar, list). Mirrors build_locations.space_points.
function mpSpaceWhy(a) {
  const h = a.housing || {}, n = h.modern90Count ?? 0, P = h.priceUsedForScore, ym = v => t('map.yenM', v);
  const bg = a.budget, u = bg ? bg.n : h.modern90Under ?? 0;
  const pp = Math.round(h.spacePricePts ?? 0), cp = Math.round(bg ? bg.cp : h.spaceChoicePts ?? 0);
  return {
    lines: [t('map.sp.head', Math.round(a.scores.space ?? 0), pp, cp),
      P ? t('map.sp.price', ym(P), n, n < 3) : t('map.sp.priceNone'),
      mpB(t('map.sp.choice', u)) + (bg ? ' ' + t('map.sp.budgetLive', AREA_LISTINGS.generated) : ''),
      ...(h.count90under80M != null ? [t('map.sp.old', h.count90under80M, h.count90under80MBuilt2000 ?? 0)] : []),
      t('map.sp.src')],
    short: mpB(t('map.sp.short', P ? ym(P) : '—', pp, u, cp)),
    row: mpB(t('map.sp.row', P ? ym(P) : '—', u)),
  };
}

function mpLayerDesc(l) {
  if (l === 'total') return t('map.layerDesc.total', MP_SUBS.map(k => `${t('map.layers.' + k)} ${mpWPct(k)}`).join(' · '), mpCustomW());
  if (l === 'commute' && MP.office) return t('map.layerDesc.commuteOffice', mpOfficeName(mpOfficeInfo(MP.office)));
  return t('map.layerDesc.' + l);
}

function mpControls() {
  const el = document.getElementById('mp-controls');
  el.innerHTML = `<div class="mp-layers" role="tablist">${MP_LAYERS.map(l =>
      `<button type="button" class="mp-chip${MP.layer === l ? ' active' : ''}" data-layer="${l}" title="${mpEsc(mpLayerDesc(l))}">${t('map.layers.' + l)}</button>`).join('')}</div>
    <div class="mp-toggles">
      <button type="button" class="mp-chip mp-persb${MP.persOpen ? ' active' : ''}${mpCustom() ? ' custom' : ''}" data-pers>⚙ ${t('map.pers.button')}</button>
      ${['shortOnly', 'showRanks', 'showCostco', 'showBus'].map(k =>
        `<label class="mp-tg"><input type="checkbox" data-tg="${k}"${MP[k] ? ' checked' : ''}><span>${t('map.' + k)}</span></label>`).join('')}
    </div>
    ${mpPersHTML()}`;
}

function initMap() {
  if (typeof L === 'undefined' || typeof MAP_DATA === 'undefined') return;
  const map = MP.map = L.map('mp-map', { zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 8, maxZoom: 15, attributionControl: true });
  MP.base = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a> · 国土数値情報（行政区域）',
    maxZoom: 18,
  }).addTo(map);
  mpTiles();

  const edgePane = map.createPane('mpEdges');   // area borders above the fills, never catch the mouse
  edgePane.style.zIndex = 450; edgePane.style.pointerEvents = 'none';
  MAP_DATA.context.forEach(c => L.polygon(mpLL(c.poly), {
    className: 'mp-ctx', weight: 1, fill: true, fillOpacity: 0, interactive: true,
  }).bindTooltip(`${c.name} · ${t('map.notAnalysed')}`, { sticky: true, className: 'mp-tip ctx' }).addTo(map));

  mpLoadPrefs(); mpRescore();
  const all = L.featureGroup();
  mpAreas().forEach(a => {
    const p = L.polygon(mpLL(a.poly), mpStyle(a));
    p.on('mouseover', () => { if (MP.sel !== a.id) p.setStyle({ weight: 5, fillOpacity: .85 }); p.bringToFront(); mpHoverRow(a.id, true); });
    p.on('mouseout', () => { p.setStyle(mpStyle(a)); if (MP.sel) MP.polys[MP.sel].bringToFront(); mpHoverRow(a.id, false); });
    p.on('click', () => mpSelect(a.id));
    p.bindTooltip(() => `<b>${mpEsc(mpName(a))}</b> <span class="mp-tip-alt">${mpEsc(mpAlt(a))}</span><br>
      ${t('map.layers.' + MP.layer)} <b>${mpVal(a, MP.layer)?.toFixed(1) ?? '—'}</b> · ${MP.layer === 'total' ? '#' + a.rank
        : `<b>${t('map.layerRank', mpLRank()[a.id] ?? '—', t('map.layers.' + MP.layer))}</b> · ${t('map.overallRank', a.rank)}`}${a.shortlisted ? '' : ` · <i>${t('map.belowGate')}</i>`}${MP.layer === 'space' ? `<br><span class="mp-tip-alt">${mpEsc(mpSpaceWhy(a).short)}</span>` : ''}`,
      { sticky: true, className: 'mp-tip' });
    MP.polys[a.id] = p.addTo(all);
    MP.edges[a.id] = L.polygon(mpLL(a.poly), mpEdgeStyle(a)).addTo(map);
  });
  all.addTo(map);
  MP.bounds = all.getBounds();
  map.fitBounds(MP.bounds, { padding: [10, 10] });
  setTimeout(() => { map.invalidateSize(); if (!MP.sel) map.fitBounds(MP.bounds, { padding: [10, 10] }); }, 120);

  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = () => { const d = L.DomUtil.create('div', 'mp-legend'); d.id = 'mp-legend'; return d; };
  legend.addTo(map);

  mpOverlays(); mpRanks(); mpLegend(); mpControls(); mpPanel();

  const ctl = document.getElementById('mp-controls');
  L.DomEvent.disableClickPropagation(ctl); L.DomEvent.disableScrollPropagation(ctl);
  mpPersBind(ctl);
  ctl.addEventListener('click', e => {
    const b = e.target.closest('[data-layer]');
    if (!b) return;
    MP.layer = b.dataset.layer; mpControls(); mpRestyle(); mpPanel(true);
  });
  ctl.addEventListener('change', e => {
    const k = e.target.dataset.tg; if (!k) return;
    MP[k] = e.target.checked;
    if (k === 'showCostco') MP.showCostco ? MP.costcoLayer.addTo(map) : MP.costcoLayer.remove();
    else if (k === 'showBus') MP.showBus ? MP.busLayer.addTo(map) : MP.busLayer.remove();
    else { mpRestyle(); if (k === 'shortOnly') mpPanel(true); }
  });

  document.getElementById('mp-panel').addEventListener('click', mpPanelClick);
  document.getElementById('mp-panel').addEventListener('change', e => {     // light listing sort
    if (e.target.matches('[data-lss]')) { MP.lsSort = e.target.value; const box = document.getElementById('mp-ls'); if (box) box.innerHTML = mpLsHTML(mpById(MP.sel)); }
  });
  document.getElementById('mp-panel').addEventListener('mouseover', e => {
    const r = e.target.closest('[data-pick]'); if (r && MP.polys[r.dataset.pick]) MP.polys[r.dataset.pick].fire('mouseover');
  });
  document.getElementById('mp-panel').addEventListener('mouseout', e => {
    const r = e.target.closest('[data-pick]'); if (r && MP.polys[r.dataset.pick]) MP.polys[r.dataset.pick].fire('mouseout');
  });
  new MutationObserver(() => { MP.domains = {}; mpTiles(); mpRestyle(); mpPanel(true); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const m = location.hash.match(/area=([\w-]+)/);
  if (m && mpById(m[1])) setTimeout(() => mpSelect(m[1]), 300);
}

function mpHoverRow(id, on) {
  document.querySelectorAll(`#mp-panel [data-pick="${id}"]`).forEach(r => r.classList.toggle('hover', on));
}

function mpSelect(id, opts = {}) {
  MP.sel = id; MP.tab = 'pros'; MP.cat = 'all';
  mpRestyle();
  if (id) {
    const p = MP.polys[id];
    p.bringToFront();
    MP.map.flyToBounds(p.getBounds(), { padding: [60, 60], maxZoom: 12, duration: .9 });
    window.history.replaceState(null, '', '#area=' + id);
  } else {
    if (!opts.keepView) MP.map.flyToBounds(MP.bounds, { padding: [10, 10], duration: .8 });
    window.history.replaceState(null, '', location.pathname + location.search);
  }
  mpPanel();
  if (id && window.matchMedia('(max-width: 900px)').matches)
    document.getElementById('mp-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mpPanelClick(e) {
  const el = e.target.closest('[data-cmp],[data-cmpx],[data-cmpgo],[data-pick],[data-back],[data-mtab],[data-mcat],[data-open],[data-lsu],[data-lsall]');
  if (!el) return;
  if (el.dataset.lsu !== undefined || el.dataset.lsall !== undefined) {   // light listing controls: re-render that section only
    if (el.dataset.lsu !== undefined) MP.lsUnder = el.dataset.lsu === '1'; else MP.lsAll = !MP.lsAll;
    const box = document.getElementById('mp-ls'); if (box) box.innerHTML = mpLsHTML(mpById(MP.sel));
    return;
  }
  if (el.dataset.cmp) mpToggleCmp(el.dataset.cmp);
  else if (el.dataset.cmpx) mpToggleCmp(el.dataset.cmpx);
  else if (el.dataset.cmpgo !== undefined) mpCmpOpen();
  else if (el.dataset.pick) mpSelect(el.dataset.pick);
  else if (el.dataset.back !== undefined) mpSelect(null);
  else if (el.dataset.mtab) { MP.tab = el.dataset.mtab; MP.cat = 'all'; mpPanel(true); }
  else if (el.dataset.mcat) { MP.cat = el.dataset.mcat; mpPanel(true); }
  else if (el.dataset.open) mpOpenListings(el.dataset.open);
}

function mpOpenListings(group) {
  ms.area = group; ms.cat = 'used';
  try { localStorage.setItem('msArea', group); localStorage.setItem('msCat', 'used'); } catch (e) {}
  document.querySelector('.tab-btn[data-tab="apartments"]').click();
  renderApartments();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── side panel ── */
function mpPanel(quiet) {
  const el = document.getElementById('mp-panel');
  el.classList.toggle('quiet', !!quiet);
  el.classList.toggle('still', quiet === 'still');   // live re-score: no row re-animation
  el.innerHTML = MP.sel ? mpDetailHTML(mpById(MP.sel)) : mpListHTML();
  if (MP.sel) requestAnimationFrame(() => requestAnimationFrame(() => {
    el.querySelectorAll('[data-to]').forEach(x => { x.style.cssText += x.dataset.to; });
  }));
}

function mpListHTML() {
  const list = mpAreas().filter(a => !MP.shortOnly || a.shortlisted)
    .slice().sort((x, y) => (mpVal(y, MP.layer) ?? -1) - (mpVal(x, MP.layer) ?? -1));
  const short = mpAreas().filter(a => a.shortlisted).length;
  const rk = mpLRank(), byLayer = MP.layer !== 'total';
  return `<div class="mp-head">
      <h2 class="mp-title">${t('map.title')}</h2>
      <p class="mp-sub">${t('map.sub')}</p>
      <p class="mp-count">${t('map.analysed', mpAreas().length, short)}</p>
    </div>
    <div class="mp-desc"><b>${t('map.layers.' + MP.layer)}</b> — ${mpLayerDesc(MP.layer)}</div>
    <ol class="mp-rank">${list.map((a, i) => {
      const v = mpVal(a, MP.layer);
      return `<li class="mp-row${a.shortlisted ? '' : ' gated'}" data-pick="${a.id}" style="animation-delay:${Math.min(i, 30) * 14}ms"${MP.layer === 'space' ? ` title="${mpEsc(mpSpaceWhy(a).lines.join('\n'))}"` : ''}>
        <span class="mp-rnum">${rk[a.id] ?? '—'}</span>
        <span class="mp-rname">${MP.cmp.includes(a.id) ? '<i class="mp-incmp" title="compare">⇄</i>' : ''}${mpEsc(mpName(a))}<small>${t('map.prefs.' + a.pref)}${byLayer ? ` · ${t('map.overallRank', a.rank)}` : ''}${MP.layer === 'space' ? ` · ${mpEsc(mpSpaceWhy(a).row)}` : ''}${a.shortlisted ? '' : ` · ${t('map.belowGate')}`}</small></span>
        <span class="mp-rbar"><i style="width:${Math.max(3, MP.layer === 'live' ? (v ?? 0) / (mpDomain('live')[1] || 1) * 100 : v ?? 0)}%;background:${mpColor(v)}"></i></span>
        <b class="mp-rval">${v?.toFixed(0) ?? '—'}</b>
      </li>`;
    }).join('')}</ol>
    <p class="mp-foot">${t('map.foot')}</p>
    ${mpTrayHTML()}`;
}

function mpRing(score, color) {
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return `<svg class="mp-ring" viewBox="0 0 84 84" aria-hidden="true">
    <circle cx="42" cy="42" r="${r}" class="trk"/>
    <circle cx="42" cy="42" r="${r}" class="val" stroke="${color}" stroke-dasharray="${c.toFixed(1)}"
      stroke-dashoffset="${c.toFixed(1)}" data-to="stroke-dashoffset:${off.toFixed(1)}"/>
    <text x="42" y="47" text-anchor="middle">${score.toFixed(0)}</text></svg>`;
}

function mpKpis(a) {
  const c = a.commute || {}, ch = a.childcare || {}, h = a.housing || {}, co = a.costco || {};
  const fee = ch.daycare0to2Monthly ?? ch.daycare0to2MonthlyImputed;
  const k = [
    MP.office ? ['office', mpOffice(a) ? `${mpOffice(a).min}<small>${t('map.min')}</small>` : t('map.unknown'), mpOfficeName(mpOfficeInfo(MP.office))]
      : ['commute', c.minToTokyo != null ? `${c.minToTokyo}<small>${t('map.min')}</small>` : t('map.unknown')],
    ['large', h.priceUsedForScore ? t('map.yenM', h.priceUsedForScore) : t('map.unknown')],
    ['daycare', fee === 0 ? t('map.free') : fee != null ? `${t('map.yen', fee)}<small>${t('map.perMonth')}${ch.daycare0to2Monthly == null ? '*' : ''}</small>` : t('map.unknown')],
    ['costco', co.driveMin != null ? `${Math.round(co.driveMin)}<small>${t('map.min')}</small>` : t('map.unknown')],
  ];
  return `<div class="mp-kpis">${k.map(([key, v, x]) => `<div class="mp-kpi"><b>${v}</b><span>${t('map.kpi.' + key, x)}</span></div>`).join('')}</div>`;
}

// 重ねるハザードマップ centred on the area with the flood (洪水) layer set on — URL captured from the portal UI 2026-10-12
const mpHazardURL = a => `https://disaportal.gsi.go.jp/maps/?ll=${a.lat},${a.lng}&z=13&base=pale&ls=seamless%7Cflood_l2_kaokutoukai_kagan%2C0.8%7Cflood_l2_kaokutoukai_hanran%2C0.8%7Cflood_l2_keizoku%2C0.8%7Cflood_list%2C0.8%7Cflood_l1%2C0.8%7Ctameike_raster%2C0.8%7Cnaisui_raster%2C0.8%7Cflood_list_l2%2C0.75%7Cdisaster1&disp=0000001110&vs=c1j0l0u0t0h0z0`;

function mpDetailHTML(a) {
  const pts = mpPoints(a), items = pts[MP.tab];
  const cats = MP_CATS.filter(c => items.some(i => i.cat === c));
  const shown = MP.cat === 'all' ? items : items.filter(i => i.cat === MP.cat);
  const color = mpColor(a.totalScore, 'total');
  return `<button type="button" class="mp-back" data-back>← ${t('map.back')}</button>
    <div class="mp-dhead">
      ${mpRing(a.totalScore, color)}
      <div class="mp-dtitle">
        <h2>${mpEsc(mpName(a))}</h2>
        <div class="mp-dalt">${mpEsc(mpAlt(a))} · ${t('map.prefs.' + a.pref)} · ${t('map.types.' + a.type)}</div>
        <div class="mp-badges">
          <span class="mp-badge">${t('map.rankOf', a.rank, mpAreas().length)}</span>
          ${MP.layer !== 'total' ? `<span class="mp-badge lr" style="--c:${mpColor(mpVal(a, MP.layer))}">${MP_CAT_ICON[MP_SCORE_CAT[MP.layer] || MP.layer] || ''} ${t('map.layerRank', mpLRank()[a.id] ?? '—', t('map.layers.' + MP.layer))}</span>` : ''}
          ${a.shortlisted ? `<span class="mp-badge ok">✓ ${t('map.shortlisted')}</span>`
            : `<span class="mp-badge warn" title="${mpEsc(t('map.gatedTip'))}">${t('map.gated')}</span>`}
          ${mpCmpBtn(a)}
        </div>
      </div>
    </div>
    ${mpKpis(a)}
    <div class="mp-bars">${MP_SUBS.map(s => {
      const v = a.scores[s] ?? 0, r = mpLRank(s)[a.id];
      const tip = s === 'space' ? mpSpaceWhy(a).lines : [t('map.layers.' + s), mpLayerDesc(s)];
      return `<div class="mp-bar${MP.layer === s ? ' on' : ''}${s === 'space' ? ' wide' : ''}" tabindex="0">
        <span class="mp-btip" role="tooltip">${tip.map((x, i) => i ? `<span>${mpEsc(x)}</span>` : `<b>${mpEsc(x)}</b>`).join('')}</span>
        <span class="mp-bl">${MP_CAT_ICON[MP_SCORE_CAT[s]]} ${t('map.layers.' + s)} <small>${t('map.weight', mpWPct(s) + '%')}</small></span>
        <span class="mp-bt"><i style="width:0;background:${mpColor(v, s)}" data-to="width:${Math.max(2, v)}%"></i></span>
        <b>${v.toFixed(0)}</b><small class="mp-brk" title="${mpEsc(t('map.layerRank', r ?? '—', t('map.layers.' + s)))}">#${r ?? '—'}</small></div>`;
    }).join('')}</div>
    <div class="mp-tabs" role="tablist">${['pros', 'cons', 'info'].map(k =>
      `<button type="button" role="tab" class="mp-tab ${k}${MP.tab === k ? ' active' : ''}" data-mtab="${k}">
        ${t('map.' + k)} <span>${pts[k].length}</span></button>`).join('')}</div>
    <div class="mp-cats">${['all', ...cats].map(c =>
      `<button type="button" class="mp-cat${MP.cat === c ? ' active' : ''}" data-mcat="${c}">${c === 'all' ? '' : MP_CAT_ICON[c] + ' '}${t('map.cats.' + c)}</button>`).join('')}</div>
    <ul class="mp-items ${MP.tab}">${shown.length ? shown.map((i, n) =>
      `<li style="animation-delay:${n * 35}ms"><span class="mp-ic c-${i.cat}" title="${t('map.cats.' + i.cat)}">${MP_CAT_ICON[i.cat]}</span><span>${mpEsc(i.text)}</span></li>`).join('')
      : `<li class="empty">${t('map.nothing')}</li>`}</ul>
    ${MP.cat === 'all' || MP.cat === 'housing' ? `<section class="mp-lsw" id="mp-ls">${mpLsHTML(a)}</section>` : ''}
    ${a.tracked ? `<button type="button" class="mp-open" data-open="${a.tracked}">🏢 ${t('map.openListings')} →</button>` : ''}
    ${a.hazard && (MP.cat === 'all' || MP.cat === 'hazard') ? `<a class="mp-open" target="_blank" rel="noopener" href="${mpHazardURL(a)}">🌊 ${t('map.r.hazardMap')} ↗</a>` : ''}
    ${a.noise && (MP.cat === 'all' || MP.cat === 'hazard') ? [...new Set(a.noise.flags.map(f => f.url))].map(u => `<a class="mp-open" target="_blank" rel="noopener" href="${mpEsc(u)}">✈ ${t('map.r.noiseSrc')} ↗</a>`).join('') : ''}
    ${a.crime && (MP.cat === 'all' || MP.cat === 'crime') ? `<a class="mp-open" target="_blank" rel="noopener" href="${mpEsc(a.crime.src)}">🚓 ${t('map.r.crimeSrc')} ↗</a>` : ''}
    ${MP.cat === 'all' || MP.cat === 'commute' ? `<a class="mp-open" target="_blank" rel="noopener" href="${mpYahooURL(a, MP.office ? mpOfficeInfo(MP.office).query : '東京')}">🚆 ${t('map.r.yahoo', MP.office ? mpOfficeName(mpOfficeInfo(MP.office)) : t('map.dest.Tokyo'))} ↗</a>` : ''}
    <details class="mp-src"><summary>${t('map.sources')} (${a.sources.length})</summary>
      <ul>${a.sources.map(u => { let host = u; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {}
        return `<li><a href="${mpEsc(u)}" target="_blank" rel="noopener">${mpEsc(host)}</a></li>`; }).join('')}</ul>
    </details>
    ${mpTrayHTML()}`;
}

function mapSetLang() {
  if (!MP.map) return;
  mpControls(); mpLegend(); mpOverlays(); mpPanel(true);
}
function mapShown() {
  if (MP.map) setTimeout(() => MP.map.invalidateSize(), 50);
}
