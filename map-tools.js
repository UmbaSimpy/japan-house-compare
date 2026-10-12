/* ═══════════════════════════════════════════════
   AREA MAP — personalisation + comparison (loaded after map.js)
   · user weights   → live re-score / re-rank / re-shortlist   (DATA_LOG item 2)
   · area compare   → 2–3 areas side by side                     (DATA_LOG item 3)
   · your office    → commute sub-score from the precomputed
                      Yahoo matrix (MAP_DATA.commute)            (DATA_LOG item 5)
   Scoring mirrors build_locations.py: total = Σ w·s / Σ w; shortlist = top N with space ≥ gate.
════════════════════════════════════════════════ */
const MP_PREF_KEY = 'mpPrefs';
const mpClamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
const mpWSum = () => MP_SUBS.reduce((s, k) => s + (MP.weights[k] || 0), 0) || 1;
const mpWPct = k => Math.round((MP.weights[k] || 0) / mpWSum() * 100);
const mpCustomW = () => MP_SUBS.some(k => MP.weights[k] !== MAP_DATA.weights[k]);
const mpOfficeInfo = id => (MAP_DATA.commute?.offices || []).find(o => o.id === id);
const mpOfficeName = o => o ? (LANG === 'ja' ? o.ja : o.en) : '';

function mpLoadPrefs() {
  MP.weights = { ...MAP_DATA.weights };
  MP.office = null; MP.walkHome = 10; MP.walkOffice = 5; MP.cmp = [];
  try {
    const p = JSON.parse(localStorage.getItem(MP_PREF_KEY) || 'null');
    if (p) {
      if (p.weights && MP_SUBS.every(k => Number.isFinite(p.weights[k]) && p.weights[k] >= 0)) MP.weights = p.weights;
      if (p.office && mpOfficeInfo(p.office)) MP.office = p.office;
      if (Number.isFinite(p.walkHome)) MP.walkHome = p.walkHome;
      if (Number.isFinite(p.walkOffice)) MP.walkOffice = p.walkOffice;
      if (Array.isArray(p.cmp)) MP.cmp = p.cmp.filter(id => mpById(id)).slice(0, 3);
    }
  } catch (e) {}
}
function mpSavePrefs() {
  try {
    localStorage.setItem(MP_PREF_KEY, JSON.stringify({ weights: MP.weights, office: MP.office,
      walkHome: MP.walkHome, walkOffice: MP.walkOffice, cmp: MP.cmp }));
  } catch (e) {}
}

/* ── office commute (matrix value = [minutes, transfers, 1-month pass ¥]) ── */
function mpOffice(a) {
  const r = MP.office && MAP_DATA.commute?.matrix?.[a.id]?.[MP.office];
  return r ? { min: r[0], xfer: r[1], pass: r[2] } : null;
}
function mpOfficeScore(a) {            // same formula as build_locations.commute_score
  const o = mpOffice(a);
  if (!o) return null;
  const eff = o.min + 5 * o.xfer;
  let adj = 0;
  const crowd = parseInt(a.commute?.crowding, 10);   // home line's peak crowding (study value)
  if (!isNaN(crowd)) adj += crowd >= 158 ? -5 : crowd >= 150 ? -2 : crowd <= 125 ? 5 : 0;
  if (o.pass > 45000) adj -= 10; else if (o.pass > 30000) adj -= 5;
  return mpClamp(mpClamp(100 * (80 - eff) / 65) + adj);
}

/* ── re-score everything from the current weights / office ── */
function mpRescore() {
  mpAreas().forEach(a => {
    if (!a._0) a._0 = { totalScore: a.totalScore, rank: a.rank, shortlisted: a.shortlisted, commute: a.scores.commute };
    const oc = MP.office ? mpOfficeScore(a) : null;
    a.scores.commute = oc ?? a._0.commute;
    a.officeMissing = !!MP.office && oc == null;
  });
  MP.domains = {};
  if (!mpCustomW() && !MP.office) {           // defaults → exact study values (no rounding drift)
    mpAreas().forEach(a => Object.assign(a, { totalScore: a._0.totalScore, rank: a._0.rank, shortlisted: a._0.shortlisted }));
    return;
  }
  const W = MP.weights, sum = mpWSum(), gate = MAP_DATA.spaceGate ?? 10, size = MAP_DATA.shortlistSize ?? 28;
  mpAreas().forEach(a => { a.totalScore = MP_SUBS.reduce((s, k) => s + (W[k] || 0) * (a.scores[k] ?? 0), 0) / sum; });
  let n = 0;
  mpAreas().slice().sort((x, y) => y.totalScore - x.totalScore).forEach((a, i) => {
    a.rank = i + 1;
    a.shortlisted = a.scores.space >= gate && n < size;
    if (a.shortlisted) n++;
  });
}
function mpApply(quiet = 'still') {
  mpRescore(); mpSavePrefs(); mpRestyle(); mpPanel(quiet);
  const b = document.querySelector('[data-pers]');
  if (b) b.classList.toggle('custom', mpCustomW() || !!MP.office);
  if (typeof refreshHeader === 'function') refreshHeader();
}

/* ── personalise popover (inside #mp-controls) ── */
function mpPersHTML() {
  const offs = MAP_DATA.commute?.offices || [];
  const groups = [...new Set(offs.map(o => o.district))];
  return `<div class="mp-pers"${MP.persOpen ? '' : ' hidden'}>
    <div class="mp-ps">
      <div class="mp-ph"><b>🏢 ${t('map.pers.office')}</b></div>
      <select data-office>
        <option value="">${t('map.pers.officeDefault')}</option>
        ${groups.map(g => `<optgroup label="${mpEsc(g)}">${offs.filter(o => o.district === g).map(o =>
          `<option value="${o.id}"${MP.office === o.id ? ' selected' : ''}>${mpEsc(mpOfficeName(o))}</option>`).join('')}</optgroup>`).join('')}
      </select>
      <div class="mp-walk">
        <label>${t('map.pers.walkHome')} <input type="number" min="0" max="40" step="1" value="${MP.walkHome}" data-walk="walkHome"></label>
        <label>${t('map.pers.walkOffice')} <input type="number" min="0" max="40" step="1" value="${MP.walkOffice}" data-walk="walkOffice"></label>
      </div>
      <p class="mp-pnote">${offs.length ? t('map.pers.officeNote', MAP_DATA.commute.searchDate) : t('map.pers.noMatrix')}</p>
    </div>
    <div class="mp-ps">
      <div class="mp-ph"><b>⚖ ${t('map.pers.weights')}</b>
        <button type="button" class="mp-preset" data-wreset${mpCustomW() ? '' : ' disabled'}>${t('map.pers.reset')}</button></div>
      ${MP_SUBS.map(k => `<label class="mp-wrow">
          <span>${MP_CAT_ICON[MP_SCORE_CAT[k]]} ${t('map.layers.' + k)}</span>
          <input type="range" min="0" max="50" step="5" value="${MP.weights[k]}" data-w="${k}">
          <b data-wv="${k}">${mpWPct(k)}%</b></label>`).join('')}
      <p class="mp-pnote">${t('map.pers.weightsNote')}</p>
    </div>
  </div>`;
}
function mpPersBind(ctl) {
  let raf = 0;
  const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => mpApply()); };
  ctl.addEventListener('input', e => {
    const k = e.target.dataset.w;
    if (k) {
      MP.weights = { ...MP.weights, [k]: +e.target.value };
      MP_SUBS.forEach(s => { const el = ctl.querySelector(`[data-wv="${s}"]`); if (el) el.textContent = mpWPct(s) + '%'; });
      const r = ctl.querySelector('[data-wreset]'); if (r) r.disabled = !mpCustomW();
      later();
    } else if (e.target.dataset.walk) {
      MP[e.target.dataset.walk] = Math.max(0, Math.min(40, +e.target.value || 0));
      mpSavePrefs(); mpPanel('still');
    }
  });
  ctl.addEventListener('change', e => {
    if (e.target.dataset.office !== undefined) { MP.office = e.target.value || null; mpApply(); }
  });
  ctl.addEventListener('click', e => {
    if (e.target.closest('[data-pers]')) {
      MP.persOpen = !MP.persOpen;
      ctl.querySelector('.mp-pers').hidden = !MP.persOpen;
      e.target.closest('[data-pers]').classList.toggle('active', MP.persOpen);
    } else if (e.target.closest('[data-wreset]')) {
      MP.weights = { ...MAP_DATA.weights };
      ctl.querySelectorAll('[data-w]').forEach(i => { i.value = MP.weights[i.dataset.w]; });
      MP_SUBS.forEach(s => { const el = ctl.querySelector(`[data-wv="${s}"]`); if (el) el.textContent = mpWPct(s) + '%'; });
      e.target.closest('[data-wreset]').disabled = true;
      mpApply();
    }
  });
}

/* ── Yahoo deep link: area station → office (or Tokyo Stn), arrive 08:45 next weekday ── */
function mpYahooURL(a, toName) {
  const d = new Date(); do d.setDate(d.getDate() + 1); while ([0, 6].includes(d.getDay()));
  const q = new URLSearchParams({ from: a.commute.station, to: toName, y: d.getFullYear(), m: String(d.getMonth() + 1).padStart(2, '0'),
    d: String(d.getDate()).padStart(2, '0'), hh: '08', m1: '4', m2: '5', type: '4', ticket: 'ic', expkind: '1', ws: '3', s: '0' });
  return 'https://transit.yahoo.co.jp/search/result?' + q;
}

/* ── comparison (2–3 areas) ── */
function mpToggleCmp(id) {
  const i = MP.cmp.indexOf(id);
  if (i >= 0) MP.cmp.splice(i, 1);
  else { if (MP.cmp.length >= 3) MP.cmp.shift(); MP.cmp.push(id); }
  mpSavePrefs(); mpPanel(true);
}
function mpTrayHTML() {
  if (!MP.cmp.length) return '';
  return `<div class="mp-ctray">
    <span class="mp-ct-l">${t('map.cmp.tray', MP.cmp.length)}</span>
    <div class="mp-ct-items">${MP.cmp.map(id => { const a = mpById(id);
      return `<span class="mp-ct-chip">${mpEsc(mpName(a))}<button type="button" data-cmpx="${id}" aria-label="remove">×</button></span>`; }).join('')}</div>
    <button type="button" class="mp-ct-go" data-cmpgo${MP.cmp.length < 2 ? ' disabled' : ''}>${t('map.cmp.go')} →</button>
  </div>`;
}
function mpCmpBtn(a) {
  const on = MP.cmp.includes(a.id);
  return `<button type="button" class="mp-badge mp-cmpb${on ? ' on' : ''}" data-cmp="${a.id}">${on ? '✓ ' + t('map.cmp.in') : '+ ' + t('map.cmp.add')}</button>`;
}

// Each row: [label, value fn → number|null, display fn, better: 'hi' | 'lo' | null]
function mpCmpRows() {
  const yen = v => v == null ? '—' : t('map.yen', v), yenM = v => v == null ? '—' : t('map.yenM', v), pct = v => v == null ? '—' : v + '%';
  const sec = (k, rows) => ({ sec: k, rows });
  const L = (k, ...x) => t('map.cmp.r.' + k, ...x);
  const out = [
    sec('scores', [
      [t('map.total'), a => a.totalScore, a => a.totalScore.toFixed(1), 'hi'],
      [L('rank'), a => a.rank, a => '#' + a.rank, 'lo'],
      ...MP_SUBS.map(k => [`${MP_CAT_ICON[MP_SCORE_CAT[k]]} ${t('map.layers.' + k)} <small>${mpWPct(k)}%</small>`, a => a.scores[k],
        a => `<span class="mp-cbar"><i style="width:${Math.max(2, a.scores[k])}%;background:${mpColor(a.scores[k], k)}"></i></span>${a.scores[k].toFixed(0)}`, 'hi']),
    ]),
    sec('commute', [
      ...(MP.office ? [[L('office', mpOfficeName(mpOfficeInfo(MP.office))), a => mpOffice(a)?.min ?? null,
        a => { const o = mpOffice(a); return o ? `${o.min} ${t('map.min')} · ${t('map.cmp.xfer', o.xfer)}<div class="cmp-sub">${L('door')} ≈ ${o.min + MP.walkHome + MP.walkOffice} ${t('map.min')}</div>` : '—'; }, 'lo'],
        [L('officePass'), a => mpOffice(a)?.pass ?? null, a => yen(mpOffice(a)?.pass), 'lo']] : []),
      [L('toTokyo'), a => a.commute.minToTokyo, a => `${a.commute.minToTokyo} ${t('map.min')} · ${t('map.cmp.xfer', a.commute.transfers)}<div class="cmp-sub">${mpEsc(a.commute.station)} → ${t('map.dest.' + a.commute.destination)}</div>`, 'lo'],
      [L('crowding'), a => parseInt(a.commute.crowding, 10) || null, a => mpEsc(a.commute.crowdingLine || '—'), 'lo'],
      [L('pass'), a => a.commute.passMonthly, a => yen(a.commute.passMonthly), 'lo'],
      [L('bus'), a => a.bus?.available ? (a.bus.morningCount ?? 0) : 0, a => a.bus?.available ? `${a.bus.morningCount ?? '?'} / ${a.bus.eveningCount ?? '?'}` : '—', 'hi'],
    ]),
    sec('childcare', [
      [L('daycare'), a => a.childcare.daycare0to2Monthly ?? a.childcare.daycare0to2MonthlyImputed, a => { const c = a.childcare, f = c.daycare0to2Monthly ?? c.daycare0to2MonthlyImputed;
        return f === 0 ? t('map.free') : yen(f) + (c.daycare0to2Monthly == null && f != null ? '*' : ''); }, 'lo'],
      [L('waitlist'), a => a.childcare.waitlist2026 ?? a.childcare.waitlist2025, a => String(a.childcare.waitlist2026 ?? a.childcare.waitlist2025 ?? '—'), 'lo'],
      [L('gakudo'), a => a.childcare.gakudoWaitlist, a => a.childcare.gakudoWaitlist ?? (/^<50/.test(a.childcare.gakudoWaitlistNote || '') ? '<50' : '—'), 'lo'],
      [L('pedsNear'), a => a.health?.kidsNearDedicated1km ?? null, a => a.health ? `${Math.round(a.health.kidsNearDedicated1km)}%<div class="cmp-sub">${t('map.cmp.pedsSub', a.health.pedsDedicated, a.health.peds)}</div>` : '—', 'hi'],
      [L('pedsPer10k'), a => a.health?.per10k ?? null, a => a.health?.per10k != null ? String(a.health.per10k) : '—', 'hi'],
      [L('medical'), a => a.childcare.medicalAge, a => a.childcare.medicalAge != null ? `≤${a.childcare.medicalAge} · ¥${a.childcare.medicalCopay ?? '?'}` : '—', 'hi'],
    ]),
    sec('housing', [
      [L('median'), a => a.housing.median90to105, a => `${yenM(a.housing.median90to105)}<div class="cmp-sub">n=${a.housing.n90to105 ?? '?'}</div>`, 'lo'],
      [L('modern'), a => a.housing.median90to110new, a => `${yenM(a.housing.median90to110new)}<div class="cmp-sub">n=${a.housing.nNew ?? '?'}</div>`, 'lo'],
      [L('scorePrice'), a => a.housing.priceUsedForScore, a => yenM(a.housing.priceUsedForScore), 'lo'],
      [L('pool'), a => a.housing.count90under80M, a => String(a.housing.count90under80M ?? '—'), 'hi'],
      [L('share'), a => a.housing.share90plus, a => pct(a.housing.share90plus), 'hi'],
      [L('liveN'), a => mpLive(a)?.u80 ?? null, a => { const v = mpLive(a); return v ? `${v.u80} <span class="cmp-sub">/ ${v.n90}</span><div class="cmp-sub">${v.date}</div>` : '—'; }, 'hi'],
      [L('liveMedian'), a => mpLive(a)?.median90to105 ?? null, a => { const v = mpLive(a); return v?.median90to105 ? `${t('map.yenM', v.median90to105)}<div class="cmp-sub">n=${v.n90to105}</div>` : '—'; }, 'lo'],
      [L('projects'), a => mpLive(a)?.projects ?? null, a => { const v = mpLive(a); return v ? `${v.projects}<div class="cmp-sub">${mpEsc(v.projectNames.slice(0, 3).join(' · '))}</div>` : '—'; }, null],
      [L('land'), a => a.housing.landPrice, a => `${yen(a.housing.landPrice)}/m²<div class="cmp-sub">${a.housing.landChange5y > 0 ? '+' : ''}${a.housing.landChange5y}% / 5y</div>`, null],
    ]),
    sec('hazard', [
      [L('water'), a => a.hazard?.waterAny, a => pct(a.hazard?.waterAny), 'lo'],
      [L('deep'), a => a.hazard?.waterDeep, a => pct(a.hazard?.waterDeep), 'lo'],
      [L('liq'), a => a.hazard ? +(a.hazard.liqHigh + a.hazard.liqMid).toFixed(1) : null, a => a.hazard ? pct(+(a.hazard.liqHigh + a.hazard.liqMid).toFixed(1)) : '—', 'lo'],
      [L('slide'), a => a.hazard?.landslide, a => pct(a.hazard?.landslide), 'lo'],
      [L('quake'), a => a.hazard?.quake30, a => pct(a.hazard?.quake30), 'lo'],
      [L('noise'), a => (a.noise?.flags || []).reduce((m, f) => Math.max(m, f.level === 'con' ? 2 : 1), 0),
        a => a.noise ? a.noise.flags.map(f => (f.level === 'con' ? '✈✈ ' : '✈ ') + t('map.cmp.noise_' + f.kind)).join('<br>') : t('map.cmp.noiseNone'), 'lo'],
    ]),
    sec('growth', [
      [L('pop'), a => a.demographics.change2020to2025, a => `${a.demographics.change2020to2025 > 0 ? '+' : ''}${a.demographics.change2020to2025}%`, 'hi'],
      [L('ipss'), a => a.demographics.ipss2050, a => `${a.demographics.ipss2050 > 0 ? '+' : ''}${a.demographics.ipss2050}%`, 'hi'],
      [L('kids'), a => a.demographics.childShare, a => pct(a.demographics.childShare), 'hi'],
    ]),
    sec('costco', [
      [L('costco'), a => a.costco.driveMin, a => a.costco.driveMin != null ? `${Math.round(a.costco.driveMin)} ${t('map.min')}<div class="cmp-sub">${mpEsc(a.costco.nearest)}</div>` : '—', 'lo'],
    ]),
  ];
  return out;
}
function mpCmpHTML() {
  const as = MP.cmp.map(mpById).filter(Boolean);
  const pts = as.map(mpPoints);
  const cell = (row, a) => row[2](a);
  const cls = (row, a) => {
    if (!row[3]) return '';
    const vals = as.map(x => row[1](x)).filter(v => v != null && !isNaN(v));
    const v = row[1](a);
    if (vals.length < 2 || v == null || Math.min(...vals) === Math.max(...vals)) return '';
    const best = row[3] === 'hi' ? Math.max(...vals) : Math.min(...vals), worst = row[3] === 'hi' ? Math.min(...vals) : Math.max(...vals);
    return v === best ? 'cmp-best' : v === worst ? 'cmp-worst' : '';
  };
  const list = (i, k) => `<ul class="mp-cl ${k}">${pts[i][k].map(p => `<li>${MP_CAT_ICON[p.cat]} ${mpEsc(p.text)}</li>`).join('') || `<li class="none">—</li>`}</ul>`;
  return `<div class="cmp-dialog mp-cmpd" role="dialog" aria-modal="true">
    <div class="cmp-top"><h2>${t('map.cmp.title')}</h2>
      ${mpCustomW() || MP.office ? `<span class="mp-badge warn">${t('map.cmp.custom')}</span>` : ''}
      <button type="button" class="cmp-close" data-cmpclose aria-label="close">×</button></div>
    <p class="cmp-legend"><span class="cmp-g">■</span> ${t('map.cmp.best')} · <span class="cmp-r">■</span> ${t('map.cmp.worst')}</p>
    <div class="cmp-scroll"><table class="cmp-table">
      <thead><tr><th></th>${as.map(a => `<th class="cmp-col">
        ${mpRing(a.totalScore, mpColor(a.totalScore, 'total')).replace('class="mp-ring"', 'class="mp-ring sm"')}
        <div class="cmp-name">${mpEsc(mpName(a))}</div><div class="cmp-sub">${mpEsc(mpAlt(a))} · ${t('map.prefs.' + a.pref)}</div>
        <div class="cmp-links"><button type="button" data-cmpopen="${a.id}">${t('map.cmp.open')}</button><button type="button" data-cmpx="${a.id}">${t('map.cmp.remove')}</button></div>
      </th>`).join('')}</tr></thead>
      <tbody>${mpCmpRows().map(s => `<tr class="cmp-sec"><th colspan="${as.length + 1}">${MP_CAT_ICON[s.sec] || ''} ${t('map.cmp.sec.' + s.sec)}</th></tr>` +
        s.rows.map(r => `<tr><th>${r[0]}</th>${as.map(a => `<td class="${cls(r, a)}">${cell(r, a)}</td>`).join('')}</tr>`).join('')).join('')}
        <tr class="cmp-sec"><th colspan="${as.length + 1}">${t('map.pros')} / ${t('map.cons')}</th></tr>
        <tr><th>${t('map.pros')}</th>${as.map((a, i) => `<td>${list(i, 'pros')}</td>`).join('')}</tr>
        <tr><th>${t('map.cons')}</th>${as.map((a, i) => `<td>${list(i, 'cons')}</td>`).join('')}</tr>
      </tbody></table></div></div>`;
}
function mpCmpOpen() {
  let m = document.getElementById('mp-cmp-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'mp-cmp-modal'; m.className = 'cmp-modal';
    document.body.appendChild(m);
    m.addEventListener('click', e => {
      if (e.target === m || e.target.closest('[data-cmpclose]')) return mpCmpClose();
      const x = e.target.closest('[data-cmpx]'), o = e.target.closest('[data-cmpopen]');
      if (x) { mpToggleCmp(x.dataset.cmpx); MP.cmp.length < 2 ? mpCmpClose() : (m.innerHTML = mpCmpHTML()); }
      else if (o) { mpCmpClose(); mpSelect(o.dataset.cmpopen); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) mpCmpClose(); });
  }
  m.innerHTML = mpCmpHTML(); m.hidden = false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => requestAnimationFrame(() => m.querySelectorAll('[data-to]').forEach(x => { x.style.cssText += x.dataset.to; })));
}
/* ── light listing list per area (area-listings.js, daily, lazy-loaded) ──
   Every de-duplicated 90 m²+ used condo on SUUMO for the area, all prices, flagged against ¥80M.
   Watchlist areas (areas.json) additionally have the full scored list in the Apartments tab. */
const MP_LS_NEW_DAYS = 7;
function mpLsLoad() {
  if (typeof AREA_LISTINGS !== 'undefined' || MP.lsLoading) return;
  MP.lsLoading = true;
  const s = document.createElement('script');
  s.src = 'area-listings.js?v=' + ((typeof AREA_STATS !== 'undefined' && AREA_STATS.generated) || Date.now());
  s.onload = () => { MP.lsLoading = false; const el = document.getElementById('mp-ls'); if (el && MP.sel) el.innerHTML = mpLsHTML(mpById(MP.sel)); };
  s.onerror = () => { MP.lsLoading = false; MP.lsFailed = true; const el = document.getElementById('mp-ls'); if (el) el.innerHTML = mpLsHTML(mpById(MP.sel)); };
  document.head.appendChild(s);
}
function mpLsHTML(a) {
  if (typeof AREA_LISTINGS === 'undefined') {
    if (!MP.lsFailed) mpLsLoad();
    return `<div class="mp-ls-h"><h3>🏢 ${t('map.ls.title')}</h3></div><p class="mp-ls-note">${t(MP.lsFailed ? 'map.ls.failed' : 'map.ls.loading')}</p>`;
  }
  const d = AREA_LISTINGS.areas?.[a.id], under = AREA_LISTINGS.under || 8000;
  if (!d) return `<div class="mp-ls-h"><h3>🏢 ${t('map.ls.title')}</h3></div><p class="mp-ls-note">${t('map.ls.none')}</p>`;
  const today = new Date(AREA_LISTINGS.generated);
  const isNew = r => r[9] && (today - new Date(r[9])) / 864e5 < MP_LS_NEW_DAYS;
  let rows = d.rows.slice();
  const nUnder = rows.filter(r => r[2] < under).length, nNew = rows.filter(isNew).length, nCut = rows.filter(r => r[10]).length;
  if (MP.lsUnder) rows = rows.filter(r => r[2] < under);
  const sorts = { price: (x, y) => x[2] - y[2], size: (x, y) => y[3] - x[3], ppm: (x, y) => x[2] / x[3] - y[2] / y[3],
                  year: (x, y) => (y[5] || 0) - (x[5] || 0), new: (x, y) => (y[9] || '').localeCompare(x[9] || '') || (y[10] ? 1 : 0) - (x[10] ? 1 : 0) };
  rows.sort(sorts[MP.lsSort] || sorts.price);
  const shown = MP.lsAll ? rows : rows.slice(0, 12);
  const href = r => 'https://suumo.jp' + (String(r[0]).includes('/') ? r[0].replace(/(\d+)$/, 'nc_$1/') : d.base + 'nc_' + r[0] + '/');
  const yenM = man => t('map.yenM', man * 1e4);
  return `<div class="mp-ls-h"><h3>🏢 ${t('map.ls.title')} <span>${d.rows.length}</span></h3>
      <div class="mp-ls-sum">${t('map.ls.sum', nUnder, nNew, nCut)}</div></div>
    <div class="mp-ls-ctl">
      <button type="button" class="mp-chip${MP.lsUnder ? '' : ' on'}" data-lsu="0">${t('map.ls.all')}</button>
      <button type="button" class="mp-chip${MP.lsUnder ? ' on' : ''}" data-lsu="1">${t('map.ls.under')}</button>
      <select data-lss aria-label="${t('map.ls.sort')}">${Object.keys(sorts).map(k => `<option value="${k}"${(MP.lsSort || 'price') === k ? ' selected' : ''}>${t('map.ls.sorts.' + k)}</option>`).join('')}</select>
    </div>
    ${shown.length ? `<ul class="mp-ls">${shown.map(r => `<li><a href="${mpEsc(href(r))}" target="_blank" rel="noopener">
      <span class="mp-lp ${r[2] < under ? 'ok' : 'over'}" title="${t(r[2] < under ? 'map.ls.okTip' : 'map.ls.overTip')}">${yenM(r[2])}</span>
      <span class="mp-ln"><b>${mpEsc(r[1] || '—')}</b>
        <small>${r[3]} m² · ${mpEsc(r[4] || '?')} · ${r[5] || '?'} · ${mpEsc(r[6] || '?')} ${r[8] ? t('map.ls.bus') : r[7] != null ? t('map.ls.walk', r[7]) : ''} · ¥${Math.round(r[2] / r[3] * 1e4 / 1e3).toLocaleString()}k/m²</small></span>
      <span class="mp-lb">${isNew(r) ? `<i class="new">${t('map.ls.new')}</i>` : ''}${r[10] ? `<i class="cut" title="${t('map.ls.wasTip', yenM(r[10]))}">↓ ${yenM(r[10])}</i>` : ''}</span>
      </a></li>`).join('')}</ul>` : `<p class="mp-ls-note">${t('map.ls.noneUnder')}</p>`}
    ${rows.length > 12 ? `<button type="button" class="mp-ls-more" data-lsall>${MP.lsAll ? t('map.ls.less') : t('map.ls.more', rows.length)}</button>` : ''}
    <p class="mp-ls-note">${t('map.ls.note', AREA_LISTINGS.generated)}${a.tracked ? ' ' + t('map.ls.watch') : ''}</p>`;
}

function mpCmpClose() {
  const m = document.getElementById('mp-cmp-modal');
  if (m) m.hidden = true;
  document.body.classList.remove('modal-open');
}
