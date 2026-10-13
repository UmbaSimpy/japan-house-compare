/* ═══════════════════════════════════════════════
   AREA MAP — detached-house mode + schools (loaded after map-tools.js)
   · Apartments / Houses switch: every area carries two score sets (data/locations.json → area.house,
     build_locations.py). The active set is copied onto the area (scores, totalScore, rank, shortlisted,
     housing, highlights, dataFlags) so map.js / map-tools.js work unchanged.   (DATA_LOG item 19)
   · Personalised weights and budget are kept per mode (localStorage mpPrefs → .house).
   · House list + budget: area-house-listings.js (house_stats.py), lazy-loaded.
   · Schools card + compare rows: area.schools (schools.py + school_info.py) — info only, never scored. (item 20)
════════════════════════════════════════════════ */
const MP_MODE_KEY = 'mpMode';
const mpHasHouse = () => MAP_DATA.areas.some(a => a.house);
const mpIsHouse = () => MP.mode === 'house';

function mpModeInit() {
  if (MP.modeInit) return;
  MP.modeInit = true;
  MAP_DATA.wByMode = { condo: { ...MAP_DATA.weights }, house: { ...(MAP_DATA.houseWeights || MAP_DATA.weights) } };
  const snap = (src, x) => ({ scores: { ...x.scores }, totalScore: x.totalScore, rank: x.rank, shortlisted: x.shortlisted,
    highlights: x.highlights, dataFlags: x.dataFlags, housing: x.housing, hazardParts: x.hazardParts ?? null });
  mpAreas().forEach(a => { a._m = { condo: snap('condo', a) }; if (a.house) a._m.house = snap('house', a.house); });
  let m = 'condo';
  try { m = localStorage.getItem(MP_MODE_KEY) || 'condo'; } catch (e) {}
  MP.mode = m === 'house' && mpHasHouse() ? 'house' : 'condo';
  mpModeData();
}
function mpModeData() {
  MAP_DATA.weights = MAP_DATA.wByMode[MP.mode];
  MP_CAT_ICON.housing = MP.mode === 'house' ? '🏠' : '🏢';
  mpAreas().forEach(a => {
    const s = a._m[MP.mode] || a._m.condo;
    Object.assign(a, s, { scores: { ...s.scores } });
    delete a._0; a.budget = null;
  });
  MP.domains = {};
}
function mpSetMode(m) {
  if (m === MP.mode || (m === 'house' && !mpHasHouse())) return;
  mpSavePrefs();
  MP.mode = m;
  try { localStorage.setItem(MP_MODE_KEY, m); } catch (e) {}
  mpModeData();
  MP.weights = { ...MP.wBy[m] }; MP.budget = MP.bBy[m];
  MP.lsAll = false; MP.lsUnder = false;
  mpRescore(); mpControls(); mpRestyle(); mpPanel(true);
  if (typeof refreshHeader === 'function') refreshHeader();
}
function mpModeHTML() {
  if (!mpHasHouse()) return '';
  return `<div class="mp-mode" role="tablist" aria-label="${t('map.mode.label')}">${['condo', 'house'].map(m =>
    `<button type="button" role="tab" class="mp-mode-b${MP.mode === m ? ' active' : ''}" data-mode="${m}" aria-selected="${MP.mode === m}">${m === 'house' ? '🏠' : '🏢'} ${t('map.mode.' + m)}</button>`).join('')}</div>`;
}

/* ── house budget: Choice = suitable houses (≥100 m², 2000+/new) under the budget, from the light list ── */
function mpHouseBudgetSpace(a) {
  const rows = AREA_HOUSES.areas?.[a.id]?.rows || [];
  const n = rows.filter(r => r[1] < MP.budget).length;
  const cp = 100 * Math.min(1, Math.log1p(n) / Math.log1p(60));
  return { n, q: rows.length, cp, space: 0.5 * (a.housing.spacePricePts ?? 0) + 0.5 * cp };
}

function mpHouseSpaceWhy(a) {
  const h = a.housing || {}, n = h.nSuit ?? 0, P = h.priceUsedForScore, ym = v => t('map.yenM', v);
  const bg = a.budget, u = bg ? bg.n : h.u80 ?? 0;
  const pp = Math.round(h.spacePricePts ?? 0), cp = Math.round(bg ? bg.cp : h.spaceChoicePts ?? 0);
  const n13 = h.n100to130 ?? 0;
  return {
    lines: [t('map.sp.head', Math.round(a.scores.space ?? 0), pp, cp),
      P ? t('map.hs.price', ym(P), n13 >= 3 ? n13 : n, n13 < 3) : t('map.hs.priceNone'),
      mpB(t('map.hs.choice', u, n)) + (bg ? ' ' + t('map.sp.budgetLive', AREA_HOUSES.generated) : ''),
      t('map.hs.src', MAP_DATA.houseGenerated || '—')],
    short: mpB(t('map.hs.short', P ? ym(P) : '—', pp, u, cp)),
    row: mpB(t('map.hs.row', P ? ym(P) : '—', u)),
  };
}

/* ── pros / cons / info for houses (called from mpPoints in house mode) ── */
function mpHousePoints(a, add) {
  const H = (k, ...x) => t('map.hr.' + k, ...x), yen = v => t('map.yen', v), yenM = v => t('map.yenM', v);
  const h = a.housing || {}, bg = a.budget, n = h.nSuit ?? 0, u = bg ? bg.n : h.u80 ?? 0, P = h.priceUsedForScore;
  if (!n) add('cons', 'housing', H('none'));
  else {
    add(u >= 60 ? 'pros' : u <= 5 ? 'cons' : 'info', 'housing', mpB(H(u >= 60 ? 'choiceBig' : u <= 5 ? 'choiceSmall' : 'choice', u, n, h.nNew ?? 0)));
    if (P) add(P <= 50e6 ? 'pros' : P >= 90e6 ? 'cons' : 'info', 'housing', H(P <= 50e6 ? 'priceLow' : P >= 90e6 ? 'priceHigh' : 'price', yenM(P)));
  }
  if (h.medianLand) add(h.medianLand >= 120 ? 'pros' : h.medianLand < 90 ? 'cons' : 'info', 'housing', H('land', Math.round(h.medianLand), h.landUnder100 ?? 0));
  if (h.medianWalk != null) add(h.medianWalk <= 10 ? 'pros' : h.medianWalk >= 15 ? 'cons' : 'info', 'housing', H('walk', h.medianWalk, h.walk15Share ?? 0, h.busShare ?? 0));
  const f = h.featureShare || {};
  if (f.park2 != null) add(f.park2 >= 50 ? 'pros' : f.park2 < 15 ? 'cons' : 'info', 'housing', H('park2', f.park2, f.park3 ?? 0));
  if (f.solar != null) add(f.solar >= 15 ? 'pros' : 'info', 'housing', H('solar', f.solar));
  if (f.longLife != null) add(f.longLife >= 30 ? 'pros' : 'info', 'housing', H('quality', f.longLife, f.perfCert ?? 0));
  if (f.lowRise != null) add(f.lowRise >= 50 ? 'pros' : 'info', 'housing', H('lowRise', f.lowRise));
  if (f.storey3 != null) add(f.storey3 >= 25 ? 'cons' : 'info', 'housing', H('storey3', f.storey3));
  const c = a._m?.condo?.housing;
  if (c?.landPrice) add('info', 'housing', t('map.r.land', yen(c.landPrice), c.landChange5y));
  if (a.house?.walkPenalty) add('info', 'commute', H('walkPen', a.house.walkPenalty, h.medianWalk));
  if (a.hazard) add('info', 'hazard', H('hazNote'));
}

/* ── house list (area-house-listings.js, lazy) ── row = [path, price万, bldg m², land m², year (0 = new), station, walk, bus, layout] */
function mpHsLoad() {
  if (typeof AREA_HOUSES !== 'undefined' || MP.hsLoading) return;
  MP.hsLoading = true;
  const s = document.createElement('script');
  s.src = 'area-house-listings.js?v=' + (MAP_DATA.houseGenerated || Date.now());
  s.onload = () => { MP.hsLoading = false; if (mpBudgetCustom() && mpIsHouse()) { mpApply('still'); return; }
    const el = document.getElementById('mp-ls'); if (el && MP.sel && mpIsHouse()) el.innerHTML = mpHsHTML(mpById(MP.sel)); };
  s.onerror = () => { MP.hsLoading = false; MP.hsFailed = true; const el = document.getElementById('mp-ls'); if (el && mpIsHouse()) el.innerHTML = mpHsHTML(mpById(MP.sel)); };
  document.head.appendChild(s);
}
function mpHsHTML(a) {
  const head = n => `<div class="mp-ls-h"><h3>🏠 ${t('map.hl.title')}${n != null ? ` <span>${n}</span>` : ''}</h3>`;
  if (typeof AREA_HOUSES === 'undefined') {
    if (!MP.hsFailed) mpHsLoad();
    return `${head()}</div><p class="mp-ls-note">${t(MP.hsFailed ? 'map.ls.failed' : 'map.ls.loading')}</p>`;
  }
  const d = AREA_HOUSES.areas?.[a.id], under = MP.budget;
  if (!d || !d.rows.length) return `${head(0)}</div><p class="mp-ls-note">${t('map.hl.none')}</p>`;
  let rows = d.rows.slice();
  const nUnder = rows.filter(r => r[1] < under).length, nNew = rows.filter(r => r[4] === 0).length;
  if (MP.lsUnder) rows = rows.filter(r => r[1] < under);
  const sorts = { price: (x, y) => x[1] - y[1], size: (x, y) => y[2] - x[2], land: (x, y) => (y[3] || 0) - (x[3] || 0),
                  year: (x, y) => (y[4] || 9999) - (x[4] || 9999), walk: (x, y) => (x[7] ? 99 : x[6] ?? 99) - (y[7] ? 99 : y[6] ?? 99) };
  rows.sort(sorts[MP.hsSort] || sorts.price);
  const shown = MP.lsAll ? rows : rows.slice(0, 12);
  const yenM = man => t('map.yenM', man * 1e4);
  return `${head(d.rows.length)}<div class="mp-ls-sum">${mpB(t('map.hl.sum', nUnder, nNew))}</div></div>
    <div class="mp-ls-ctl">
      <button type="button" class="mp-chip${MP.lsUnder ? '' : ' on'}" data-lsu="0">${t('map.ls.all')}</button>
      <button type="button" class="mp-chip${MP.lsUnder ? ' on' : ''}" data-lsu="1">${mpB(t('map.ls.under'))}</button>
      <select data-hss aria-label="${t('map.ls.sort')}">${Object.keys(sorts).map(k => `<option value="${k}"${(MP.hsSort || 'price') === k ? ' selected' : ''}>${t('map.hl.sorts.' + k)}</option>`).join('')}</select>
    </div>
    ${shown.length ? `<ul class="mp-ls">${shown.map(r => `<li><a href="${mpEsc('https://suumo.jp' + r[0])}" target="_blank" rel="noopener">
      <span class="mp-lp ${r[1] < under ? 'ok' : 'over'}" title="${mpB(t(r[1] < under ? 'map.ls.okTip' : 'map.ls.overTip'))}">${yenM(r[1])}</span>
      <span class="mp-ln"><b>${mpEsc(r[5] || '—')} ${r[7] ? t('map.ls.bus') : r[6] != null ? t('map.ls.walk', r[6]) : ''}</b>
        <small>${t('map.hl.row', Math.round(r[2]), r[3] != null ? Math.round(r[3]) : null, mpEsc(r[8] || '?'))}</small></span>
      <span class="mp-lb">${r[4] === 0 ? `<i class="new">${t('map.hl.newBuild')}</i>` : `<i class="yr">${r[4]}</i>`}</span>
      </a></li>`).join('')}</ul>` : `<p class="mp-ls-note">${mpB(t('map.ls.noneUnder'))}</p>`}
    ${rows.length > 12 ? `<button type="button" class="mp-ls-more" data-lsall>${MP.lsAll ? t('map.ls.less') : t('map.ls.more', rows.length)}</button>` : ''}
    <p class="mp-ls-note">${mpB(t('map.hl.note', AREA_HOUSES.generated))}</p>`;
}

/* ── compare rows: housing (house mode) ── */
function mpHouseCmpRows(L) {
  const yenM = v => v == null ? '—' : t('map.yenM', v), pct = v => v == null ? '—' : v + '%';
  const f = (a, k) => a.housing?.featureShare?.[k] ?? null;
  return [
    [L('hPrice'), a => a.housing.priceUsedForScore, a => `${yenM(a.housing.priceUsedForScore)}<div class="cmp-sub">n=${(a.housing.n100to130 ?? 0) >= 3 ? a.housing.n100to130 : a.housing.nSuit ?? 0} · ${Math.round(a.housing.spacePricePts ?? 0)} pts</div>`, 'lo'],
    [mpB(L('hPool')), a => a.budget ? a.budget.n : a.housing.u80, a => `${a.budget ? a.budget.n : a.housing.u80 ?? '—'}<div class="cmp-sub">${Math.round(a.budget ? a.budget.cp : a.housing.spaceChoicePts ?? 0)} pts${a.budget ? ' · ' + AREA_HOUSES.generated : ''}</div>`, 'hi'],
    [L('hAll'), a => a.housing.nSuit, a => `${a.housing.nSuit ?? '—'}<div class="cmp-sub">${t('map.cmp.hNew', a.housing.nNew ?? 0)}</div>`, 'hi'],
    [L('hLand'), a => a.housing.medianLand, a => a.housing.medianLand ? `${Math.round(a.housing.medianLand)} m²<div class="cmp-sub">${t('map.cmp.hLandSmall', a.housing.landUnder100 ?? 0)}</div>` : '—', 'hi'],
    [L('hBldg'), a => a.housing.medianBldg, a => a.housing.medianBldg ? `${Math.round(a.housing.medianBldg)} m²` : '—', 'hi'],
    [L('hWalk'), a => a.housing.medianWalk, a => a.housing.medianWalk != null ? `${a.housing.medianWalk} ${t('map.min')}<div class="cmp-sub">${t('map.cmp.hBus', a.housing.busShare ?? 0)}</div>` : '—', 'lo'],
    [L('hPark2'), a => f(a, 'park2'), a => pct(f(a, 'park2')), 'hi'],
    [L('hSolar'), a => f(a, 'solar'), a => pct(f(a, 'solar')), 'hi'],
    [L('hLongLife'), a => f(a, 'longLife'), a => pct(f(a, 'longLife')), 'hi'],
    [L('hPerfCert'), a => f(a, 'perfCert'), a => pct(f(a, 'perfCert')), 'hi'],
    [L('hLowRise'), a => f(a, 'lowRise'), a => pct(f(a, 'lowRise')), 'hi'],
    [L('hStorey3'), a => f(a, 'storey3'), a => pct(f(a, 'storey3')), 'lo'],
    [L('land'), a => a._m?.condo?.housing?.landPrice ?? null, a => { const c = a._m?.condo?.housing; return c?.landPrice ? `${t('map.yen', c.landPrice)}/m²<div class="cmp-sub">${c.landChange5y > 0 ? '+' : ''}${c.landChange5y}% / 5y</div>` : '—'; }, null],
  ];
}

/* ── schools (info only) ── */
const mpPlus = v => v == null ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(1);
function mpSchoolTest(s) {
  const x = s?.test;
  if (!x) return null;
  return { es: x.es, jhs: x.jhs, city: x.level === 'city', avg: +((x.es + x.jhs) / 2).toFixed(1) };
}
function mpChoiceTxt(s, k) { return t('map.sch.choice.' + (s?.choice?.[k] || 'unknown')); }
function mpSchoolHTML(a) {
  const s = a.schools;
  if (!s) return '';
  const tst = mpSchoolTest(s), col = v => mpHue(Math.max(0, Math.min(1, (v + 4) / 8)));
  const bar = (lab, v, sub) => `<div class="mp-crow"><span>${lab}</span>
      <span class="mp-bt"><i style="width:${Math.max(3, Math.min(100, (v + 6) / 12 * 100))}%;background:${col(v)}"></i></span>
      <b>${mpPlus(v)}<small> pt</small></b><small class="mp-brk">${sub}</small></div>`;
  const row = (lab, val, sub = '') => `<div class="mp-crow txt"><span>${lab}</span><em class="mp-sv">${val}${sub ? `<small class="mp-brk">${sub}</small>` : ''}</em></div>`;
  const hs = s.hsDistrict ? t('map.sch.hsChiba', s.hsDistrict, MAP_DATA.schoolInfo?.chibaHS?.[s.hsDistrict] || '') : t('map.sch.hsWide', t('map.prefs.' + a.pref));
  return `<section class="mp-crime mp-school">
    <div class="mp-chead"><span>🏫 ${t('map.sch.title')}</span><span class="mp-badge">${t('map.crime.notScored')}</span></div>
    ${tst ? bar(t('map.sch.testES'), tst.es, t(tst.city ? 'map.sch.city' : 'map.sch.pref')) + bar(t('map.sch.testJHS'), tst.jhs, t(tst.city ? 'map.sch.city' : 'map.sch.pref')) : ''}
    ${s.privateJHS != null ? row(t('map.sch.priv'), s.privateJHS + '%', t('map.sch.privSub', MAP_DATA.schoolInfo?.tokyoPrivateJHS)) : ''}
    ${row(t('map.sch.choiceES'), mpChoiceTxt(s, 'e'))}
    ${row(t('map.sch.choiceJHS'), mpChoiceTxt(s, 'j'), s.choice?.note ? mpEsc(s.choice.note) : '')}
    ${s.es != null ? row(t('map.sch.count'), t('map.sch.countV', s.es, s.jhs), s.kidsPerES != null ? t('map.sch.perES', s.kidsPerES) : '') : ''}
    ${s.kidsNearES800 != null ? row(t('map.sch.near'), Math.round(s.kidsNearES800) + '%', t('map.sch.nearSub', Math.round(s.kidsNearES1200))) : ''}
    ${row(t('map.sch.hs'), hs)}
    ${row(t('map.sch.zone'), s.zoneData ? t('map.sch.zoneYes') : t('map.sch.zoneNo'))}
    <p class="mp-cnote">${t('map.sch.note')}${s.choice?.src ? ` <a target="_blank" rel="noopener" href="${mpEsc(s.choice.src)}">${t('map.sch.srcChoice')} ↗</a>` : ''}</p>
  </section>`;
}
function mpSchoolCmpRows(L) {
  const tst = a => mpSchoolTest(a.schools);
  return [
    [L('schTest'), a => tst(a)?.avg ?? null, a => { const x = tst(a); return x ? `${mpPlus(x.es)} / ${mpPlus(x.jhs)}<div class="cmp-sub">${t(x.city ? 'map.sch.city' : 'map.sch.pref')}</div>` : '—'; }, 'hi'],
    [L('schPriv'), a => a.schools?.privateJHS ?? null, a => a.schools?.privateJHS != null ? a.schools.privateJHS + '%' : '—', null],
    [L('schChoice'), a => null, a => a.schools ? `${t('map.sch.esShort')}: ${mpChoiceTxt(a.schools, 'e')}<br>${t('map.sch.jhsShort')}: ${mpChoiceTxt(a.schools, 'j')}` : '—', null],
    [L('schKids'), a => a.schools?.kidsPerES ?? null, a => a.schools?.kidsPerES != null ? String(a.schools.kidsPerES) : '—', null],
    [L('schNear'), a => a.schools?.kidsNearES800 ?? null, a => a.schools?.kidsNearES800 != null ? Math.round(a.schools.kidsNearES800) + '%' : '—', 'hi'],
    [L('schHS'), a => null, a => a.schools?.hsDistrict ? t('map.sch.hsShort', a.schools.hsDistrict) : t('map.sch.hsWideShort'), null],
    [L('schZone'), a => null, a => a.schools ? (a.schools.zoneData ? t('map.sch.zoneYesShort') : t('map.sch.zoneNoShort')) : '—', null],
  ];
}
