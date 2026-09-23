/* ═══════════════════════════════════════════════
   Property Compare — site logic
   Data consts (listings, history, mansions, mansionHistory) are injected into
   suumo-compare.html by inject.py / inject_mansion.py; strings live in i18n.js.
════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   HOUSE SCORING  (100 pts, computed here — mirrored in notify.py)
   VALUE 25     price per m², normalised within the visible set (cheaper wins)
   ACCESS 20    walk: ≤5=20 ≤10=16 ≤15=12 ≤20=8 ≤30=4 else 0
   CONDITION 20 age ≤5=12 ≤10=9 ≤20=6 ≤30=3 else 1 · RC 8 / Steel 6 / Wood 4 · reno +3
   SPACE 20     floor area, normalised within the visible set (larger wins)
   EXTRAS 15    parking 1 car +5 / 2+ +8 · owned land +5 · city gas +2
                liquefaction −4 high / −2 somewhat high (notify.py HOUSE_LIQ_PENALTY)
═══════════════════════════════════════════════ */
const SCORE_MAX = { value: 25, access: 20, condition: 20, space: 20, extras: 15 };
const HOUSE_LIQ_PENALTY = { high: 4, mid: 2 };

function scoreSet(data) {
  if (data.length === 0) return [];
  const ppms = data.map(d => (d.price * 10000) / d.areaM2);
  const areas = data.map(d => d.areaM2);
  const minPPM = Math.min(...ppms), maxPPM = Math.max(...ppms);
  const minA = Math.min(...areas), maxA = Math.max(...areas);

  return data.map((d, i) => {
    const value = Math.round((maxPPM === minPPM ? 1 : (maxPPM - ppms[i]) / (maxPPM - minPPM)) * SCORE_MAX.value);
    const access = accessPts(d.walk);
    const ageScore = d.age <= 5 ? 12 : d.age <= 10 ? 9 : d.age <= 20 ? 6 : d.age <= 30 ? 3 : 1;
    const strScore = d.structure === 'RC' ? 8 : d.structure === 'Steel' ? 6 : 4;
    const renoBonus = d.renovation ? 3 : 0;
    const condition = Math.min(SCORE_MAX.condition, ageScore + strScore + renoBonus);
    const space = Math.round((maxA === minA ? 1 : (d.areaM2 - minA) / (maxA - minA)) * SCORE_MAX.space);
    const parkScore = d.parking === 0 ? 0 : d.parking === 1 ? 5 : 8;
    const rightsScore = d.landRights === 'owned' ? 5 : 0;
    const gasScore = d.cityGas ? 2 : 0;
    const liqPenalty = HOUSE_LIQ_PENALTY[d.liq?.level] || 0;
    const extras = Math.max(0, Math.min(SCORE_MAX.extras, parkScore + rightsScore + gasScore) - liqPenalty);
    const total = value + access + condition + space + extras;
    const why = { ppm: ppms[i], minPPM, maxPPM, minA, maxA, n: data.length,
                  ageScore, strScore, renoBonus, parkScore, rightsScore, gasScore, liqPenalty };
    return { ...d, scores: { value, access, condition, space, extras, total }, why };
  });
}

const accessPts = w => w <= 5 ? 20 : w <= 10 ? 16 : w <= 15 ? 12 : w <= 20 ? 8 : w <= 30 ? 4 : 0;

/* ═══════════════════════════════════════════════
   CONDOS — scores pre-computed in inject_mansion.py
   Value 25 · Access 20 · Condition 20 · Fees 15 · Space 10 · Extras 10
═══════════════════════════════════════════════ */
const MS_SCORE_MAX = { value: 25, access: 20, condition: 20, running: 15, space: 10, extras: 10 };
const LOW_REPAIR_PER_M2 = 170;   // ¥/m²·month — below the MLIT guideline range
const LOAN_YEARS = 35;
const MS_PAGE = 60;

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const toTsubo = m2 => (m2 / 3.3058).toFixed(1);
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escHTML = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtYen = man => t('price', man);
const yen = v => t('yen', v);
const areaName = d => (LANG === 'ja' && d.areaJa) || d.area;
const houseKey = d => d.ncId || (d.suumoUrl.match(/nc_(\d+)/) || [])[1];

function fmtMan(v) {   // 万-based short form, used by charts
  return v >= 10000 ? (v / 10000).toFixed(1).replace(/\.0$/, '') + '億' : v.toLocaleString() + '万';
}
function signedPrice(man) {   // −¥2.3M / −230万円
  return (man < 0 ? '−' : '+') + t('priceShort', Math.abs(man));
}
const scoreGrade = n => n >= 75 ? 'grade-a' : n >= 55 ? 'grade-b' : 'grade-c';
const barColor = pct => pct >= 0.7 ? 'c-green' : pct >= 0.4 ? 'c-amber' : 'c-red';

function msMonthly(d) {
  const P = d.price * 10000, n = LOAN_YEARS * 12, r = ms.rate / 100 / 12;
  const loan = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));
  return Math.round(loan + (d.fees || 0));
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('on'), 3500);
}

const ICON = {
  pin: `<svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75c-.97 0-1.75-.78-1.75-1.75S5.03 3.25 6 3.25s1.75.78 1.75 1.75S6.97 6.75 6 6.75z" fill="currentColor"/></svg>`,
  train: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 1.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M1 8l1.5-2h7L11 8" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  out: `<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  house: `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="110" viewBox="0 0 130 110" fill="none"><polygon points="65,8 6,50 124,50" stroke="white" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="50" width="98" height="52" rx="2" stroke="white" stroke-width="2"/><rect x="52" y="72" width="26" height="30" rx="2" stroke="white" stroke-width="1.5"/><rect x="24" y="60" width="22" height="18" rx="2" stroke="white" stroke-width="1.5"/><rect x="84" y="60" width="22" height="18" rx="2" stroke="white" stroke-width="1.5"/><rect x="76" y="20" width="10" height="26" stroke="white" stroke-width="1.5"/></svg>`,
  condo: `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="120" viewBox="0 0 110 120" fill="none"><rect x="22" y="8" width="66" height="104" rx="2" stroke="white" stroke-width="2"/>${
    [22, 40, 58, 76].map(y => `<rect x="32" y="${y}" width="14" height="10" rx="1" stroke="white" stroke-width="1.4"/><rect x="64" y="${y}" width="14" height="10" rx="1" stroke="white" stroke-width="1.4"/>`).join('')
  }<rect x="47" y="94" width="16" height="18" rx="1" stroke="white" stroke-width="1.5"/></svg>`,
};

const GRAD_MS = [
  'linear-gradient(140deg,#1a3f6b 0%,#2f6fb0 100%)', 'linear-gradient(140deg,#2e6a5a 0%,#60b8a0 100%)',
  'linear-gradient(140deg,#5a1a6a 0%,#a060c0 100%)', 'linear-gradient(140deg,#8a4a1e 0%,#d09060 100%)',
  'linear-gradient(140deg,#38b8b8 0%,#a0e0e0 100%)', 'linear-gradient(140deg,#c84b31 0%,#64616e 100%)',
];

/* Apartment sub-categories (areas.json "group") — colour + name per group */
const groupOf = d => msGroups.find(g => g.key === d.group) || { key: d.areaKey, name: d.area, nameJa: d.areaJa, color: '#888888' };
const groupName = g => (LANG === 'ja' && g.nameJa) || g.name;
const areaStyle = d => `--area-c:${groupOf(d).color}`;
const areaPill = d => `<span class="area-pill" style="${areaStyle(d)}">${escHTML(groupName(groupOf(d)))}</span>`;

/* ═══════════════════════════════════════════════
   SHARED TAGS & TOOLTIPS
═══════════════════════════════════════════════ */
const LIQ_META = {
  high: { cls: 'tag-red',   color: '#ee782a', jp: '液状化の危険度が高い', rank: 3 },
  mid:  { cls: 'tag-amber', color: '#f8e925', jp: '液状化の危険度がやや高い', rank: 2 },
  low:  { cls: 'tag-green', color: '#13a392', jp: '液状化の危険度が低い', rank: 1 },
  vlow: { cls: 'tag-green', color: '#53c0d2', jp: '液状化の危険度が極めて低い', rank: 0 },
};

function liqTip(d, kind) {
  const q = d.liq;
  if (!q) return t('tipLiqNA');
  const dist = Object.entries(q.dist);
  return t(q.kind === 'landform' ? 'tipLiqLandform' : 'tipLiq', {
    forms: Object.entries(q.landforms || {}).map(([n, p]) => `<li><span>${escHTML(n)}</span><span>${p}%</span></li>`).join(''),
    level: t('liq.' + q.level), jp: LIQ_META[q.level].jp, radius: q.radius || 200,
    place: escHTML(q.matched || d.address), block: q.radius === 80,
    bar: `<div class="tip-bar">${dist.map(([lv, p]) => `<span style="width:${p}%;background:${LIQ_META[lv].color}"></span>`).join('')}</div>`,
    rows: dist.map(([lv, p]) => `<li><span>${t('liq.' + lv)}</span><span>${p}%</span></li>`).join(''),
    house: kind === 'house', penalty: (kind === 'house' ? HOUSE_LIQ_PENALTY : { high: 2, mid: 1 })[q.level] || 0,
    src: escHTML(q.src),
  });
}

function liqTagHTML(d, kind) {
  if (!d.liq) return `<span class="tag tag-muted" data-tip="${escAttr(liqTip(d, kind))}">${t('liqNA')}</span>`;
  return `<a class="tag ${LIQ_META[d.liq.level].cls}" href="${d.liq.verify}" target="_blank" rel="noopener"
    data-tip="${escAttr(liqTip(d, kind))}">${t('liqTag', d.liq.level)}</a>`;
}

function priceTip(d) {
  const hist = d.priceHistory || [];
  const rows = hist.map(([date, p], i) => {
    const diff = i ? p - hist[i - 1][1] : 0;
    return `<li><span>${date}</span><span>${fmtYen(p)}${diff ? ` <span style="color:${diff < 0 ? 'var(--green)' : 'var(--amber)'}">(${signedPrice(diff)})</span>` : ''}</span></li>`;
  }).join('');
  const pct = (d.priceChange < 0 ? '−' : '+') + Math.abs(d.priceChange / hist[0][1] * 100).toFixed(1) + '%';
  return t('tipPrice', rows, signedPrice(d.priceChange), pct, hist[0][0]);
}

function priceTagHTML(d) {
  const hist = d.priceHistory || [];
  if (hist.length < 2 || !d.priceChange) return '';
  const pct = Math.abs(d.priceChange / hist[0][1] * 100).toFixed(1);
  return d.priceChange < 0
    ? `<span class="tag tag-green" data-tip="${escAttr(priceTip(d))}">↓ ${t('priceShort', -d.priceChange)} (−${pct}%)</span>`
    : `<span class="tag tag-amber" data-tip="${escAttr(priceTip(d))}">↑ ${t('priceShort', d.priceChange)} (+${pct}%)</span>`;
}

function totalTip(s, max) {
  const rows = Object.keys(max).map(k => `<li><span>${t('catLong.' + k)}</span><span>${s[k]} / ${max[k]}</span></li>`).join('');
  return t('tipTotal', s.total, rows);
}

function houseWhy(d, key) {
  const w = d.why, s = d.scores, man = y => (y / 10000).toFixed(1) + '万';
  switch (key) {
    case 'value': return t('hValue', { s: s.value, ppm: man(w.ppm), n: w.n, min: man(w.minPPM), max: man(w.maxPPM) });
    case 'access': return t('hAccess', { s: s.access, walk: d.walk, station: escHTML(d.station), line: escHTML(d.line) });
    case 'condition': return t('hCondition', { s: s.condition, age: d.age, ageS: w.ageScore, str: t('structure', d.structure), strS: w.strScore, reno: w.renoBonus });
    case 'space': return t('hSpace', { s: s.space, m2: d.areaM2, tsubo: toTsubo(d.areaM2), n: w.n, min: w.minA, max: w.maxA });
    case 'extras': return t('hExtras', { s: s.extras, park: d.parking, parkS: w.parkScore, owned: d.landRights === 'owned', rightsS: w.rightsScore,
      gas: d.cityGas, gasS: w.gasScore, liq: d.liq ? t('liq.' + d.liq.level) : t('none'), liqP: w.liqPenalty });
  }
}

function msWhy(d, key) {
  const w = d.why, s = d.scores, T = I18N[LANG].traits || I18N.en.traits;
  switch (key) {
    case 'value': return t('msValue', {
      s: s.value, ppm: d.ppm, exp: w.expectedPpm, v: d.vsExpected, beat: w.valueBeat, n: w.n,
      traits: [escHTML(groupName(groupOf(d))), T.built(d.builtYear), T.walk(d.walk, escHTML(d.station), d.bus), (d.bldgFloors || 0) >= 20 ? T.tower : '',
               d.renovation ? T.reno : '', d.elevator ? T.elev : T.noElev].filter(Boolean).join(LANG === 'ja' ? '・' : ', '),
    });
    case 'access': return t('msAccess', { s: s.access, walk: d.walk, station: escHTML(d.station), line: escHTML(d.line), bus: d.bus });
    case 'condition': {
      const reno = d.renoCounts ? 4 : 0;
      return t('msCondition', { s: s.condition, year: d.builtYear, age: d.age, shin: d.shinTaishin, base: s.condition - reno,
        reno, note: d.renoNote ? escHTML(d.renoNote.slice(0, 40)) : '' });
    }
    case 'running':
      if (!d.fees) return t('msRunningNA', s.running);
      return t('msRunning', { s: s.running, mgmt: d.mgmtFee ? yen(d.mgmtFee) : '—', repair: d.repairFund ? yen(d.repairFund) : '—',
        perM2: d.feesPerM2, med: w.medFeesPerM2, pct: 100 - w.feesBeat, low: LOW_REPAIR_PER_M2, repairM2: d.repairPerM2 ?? '?' });
    case 'space': return t('msSpace', { s: s.space, m2: d.areaM2, tsubo: toTsubo(d.areaM2), balc: d.balconyM2, beat: w.sizeBeat });
    case 'extras': return t('msExtras', s.extras, w.extras.map(([code, param, p]) => {
      const lbl = t('ex.' + code, param);
      return `<li><span>${escHTML(lbl)}</span><span>${p > 0 ? '+' : p < 0 ? '−' : ''}${Math.abs(p)}</span></li>`;
    }).join(''));
  }
}

function monthlyTip(d) {
  const total = msMonthly(d);
  return t('tipMonthly', { price: fmtYen(d.price), years: LOAN_YEARS, rate: ms.rate, loan: yen(total - (d.fees || 0)),
    fees: d.fees ? yen(d.fees) : '—', total: yen(total) });
}

function scoreBars(d, max, why, cls = '') {
  return `<div class="score-cats ${cls}">${Object.keys(max).map(k => {
    const pct = d.scores[k] / max[k];
    return `<div class="score-cat" data-tip="${escAttr(why(d, k))}">
      <span class="score-cat-lbl">${t('cat.' + k)}</span>
      <div class="score-track"><div class="score-fill ${barColor(pct)}" style="width:${Math.round(pct * 100)}%"></div></div>
      <span class="score-cat-val">${d.scores[k]}/${max[k]}</span>
    </div>`;
  }).join('')}</div>`;
}

function stationHTML(d) {
  return `<div class="station">
    <div class="station-ico">${ICON.train}</div>
    <div class="station-info">
      <div class="station-name">${escHTML(t('stationName', d.station))}</div>
      <div class="station-line">${escHTML(d.line)}</div>
    </div>
    <div class="station-walk">${d.bus ? t('busWalkMin', d.walk) : t('walkMin', d.walk)}</div>
  </div>`;
}

function cardFoot(kind, key, url) {
  const on = cmp.kind === kind && cmp.ids.includes(key);
  return `<div class="card-foot">
    <button class="cmp-btn${on ? ' on' : ''}" type="button" data-cmp="${kind}:${escAttr(key)}">${t(on ? 'cmpAdded' : 'cmpAdd')}</button>
    <a class="suumo-btn" href="${url}" target="_blank" rel="noopener"><span class="s-mark">S</span>${t('viewSuumo')} ${ICON.out}</a>
  </div>`;
}

/* ═══════════════════════════════════════════════
   SLIDERS (min/max filters, remembered per browser)
═══════════════════════════════════════════════ */
function makeSliders(containerId, storeKey, defs, onChange) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (e) {}
  const state = {};
  const box = document.getElementById(containerId);
  box.innerHTML = defs.map(d => `<label class="slider" data-k="${d.key}">
      <span class="filter-lbl"></span><input type="range" min="${d.min}" max="${d.max}" step="${d.step}"><output></output></label>`).join('') +
    `<button class="chip slider-reset" type="button"></button>`;
  const sync = d => {
    const lab = box.querySelector(`[data-k="${d.key}"]`);
    lab.querySelector('input').value = state[d.key];
    const open = state[d.key] === d.value;
    lab.classList.toggle('open', open);
    lab.querySelector('output').textContent = open ? t('any') : t(d.fmt, state[d.key]);
  };
  const relabel = () => {
    defs.forEach(d => {
      const lab = box.querySelector(`[data-k="${d.key}"]`);
      lab.querySelector('.filter-lbl').textContent = t(d.label);
      lab.querySelector('input').setAttribute('aria-label', t(d.label));
      sync(d);
    });
    box.querySelector('.slider-reset').textContent = t('reset');
  };
  defs.forEach(d => {
    const v = +saved[d.key];
    state[d.key] = Number.isFinite(v) && v >= d.min && v <= d.max ? v : d.value;
  });
  relabel();
  const save = () => { try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (e) {} };
  box.addEventListener('input', e => {
    const lab = e.target.closest('[data-k]'); if (!lab) return;
    const d = defs.find(x => x.key === lab.dataset.k);
    state[d.key] = +e.target.value;
    sync(d); save(); onChange();
  });
  box.querySelector('.slider-reset').addEventListener('click', () => {
    defs.forEach(d => { state[d.key] = d.value; sync(d); });
    save(); onChange();
  });
  sliderSets.push(relabel);
  return state;
}
const sliderSets = [];   // relabel callbacks, re-run on language change

/* ═══════════════════════════════════════════════
   HOVER EXPLANATIONS — any element with data-tip
═══════════════════════════════════════════════ */
function initTips() {
  const tip = document.createElement('div');
  tip.className = 'tip';
  document.body.appendChild(tip);
  let timer = null, target = null;
  const hide = () => { clearTimeout(timer); tip.classList.remove('on'); target = null; };
  const show = el => {
    tip.innerHTML = el.dataset.tip;
    tip.classList.add('on');
    const r = el.getBoundingClientRect(), b = tip.getBoundingClientRect();
    let top = r.bottom + 8;
    if (top + b.height > innerHeight - 8) top = Math.max(8, r.top - b.height - 8);
    tip.style.top = top + 'px';
    tip.style.left = Math.min(Math.max(8, r.left), innerWidth - b.width - 8) + 'px';
  };
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (el === target) return;
    hide();
    if (!el) return;
    target = el;
    timer = setTimeout(() => show(el), 350);
  });
  // touch: first tap shows, second tap on a link follows it
  document.addEventListener('touchstart', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) return hide();
    if (el !== target) { target = el; show(el); if (el.tagName === 'A') e.preventDefault(); }
  }, { passive: false });
  addEventListener('scroll', hide, { passive: true });
  document.addEventListener('scroll', hide, { passive: true, capture: true });
}

/* ═══════════════════════════════════════════════
   HOUSES
═══════════════════════════════════════════════ */
let hs = null;                 // slider state (minM2, maxPrice)
const hToggles = new Set();
let activeLayout = 'all';
let activeSort = 'score-desc';
const tabCounts = { listings: 0, apartments: 0 };

function houseCardHTML(d) {
  const s = d.scores, grade = scoreGrade(s.total);
  const tags = [];
  const priceTag = priceTagHTML(d);
  if (priceTag) tags.push(priceTag);
  if (d.renovation) tags.push(`<span class="tag tag-green">${t('tagReno')}</span>`);
  if (d.parking >= 2) tags.push(`<span class="tag tag-green">${t('tagParkingN', d.parking)}</span>`);
  else if (d.parking === 1) tags.push(`<span class="tag tag-amber">${t('tagParkingN', 1)}</span>`);
  if (d.landRights === 'leased') tags.push(`<span class="tag tag-amber">${t('tagLeasehold')}</span>`);
  if (!d.cityGas) tags.push(`<span class="tag tag-muted">${t('tagNoGas')}</span>`);
  tags.push(liqTagHTML(d, 'house'));

  return `
  <div class="card">
    <div class="card-photo">
      <div class="card-photo-bg" style="background:${d.grad}">${d.imageUrl ? '' : ICON.house}</div>
      ${d.imageUrl ? `<img class="card-photo-img" src="${d.imageUrl}" alt="${t('photoAlt')}" loading="lazy" onerror="this.style.display='none'">` : ''}
      <span class="badge-layout">${d.layout}</span>
      <span class="badge-type">${t('structure', d.structure)} / ${t('storeys', d.floors)}</span>
      <div class="badge-score ${grade}" data-tip="${escAttr(totalTip(s, SCORE_MAX))}">
        <span class="badge-score-n">${s.total}</span><span class="badge-score-max">/100</span>
      </div>
    </div>
    <div class="card-body">
      <div class="card-price">${fmtYen(d.price)}</div>
      <div class="card-price-note">${t('taxNote')}</div>
      <div class="card-addr">
        <span class="addr-pin">${ICON.pin}</span>
        <div><div class="addr-area">${escHTML(areaName(d))}</div><div class="addr-street">${escHTML(d.address)}</div></div>
      </div>
      <div class="divider"></div>
      <div class="specs">
        <div class="spec"><span class="spec-lbl">${t('floorArea')}</span>
          <span class="spec-val">${d.areaM2} m² <span class="spec-sub">(${t('tsubo', toTsubo(d.areaM2))})</span></span></div>
        <div class="spec"><span class="spec-lbl">${t('landArea')}</span>
          <span class="spec-val">${d.landM2 ? `${d.landM2.toFixed(0)} m² <span class="spec-sub">(${t('tsubo', toTsubo(d.landM2))})</span>` : '—'}</span></div>
        <div class="spec"><span class="spec-lbl">${t('buildingAge')}</span>
          <span class="spec-val">${d.age === 0 ? t('newBuild') : t('yearsOld', d.age)}</span></div>
        <div class="spec"><span class="spec-lbl">${t('structureLbl')}</span>
          <span class="spec-val">${t('structure', d.structure)} / ${t('storeys', d.floors)}</span></div>
      </div>
      ${stationHTML(d)}
      <div class="score-section">
        <div class="score-top">
          <span class="score-heading">${t('scoreBreakdown')}</span>
          <div class="score-num"><span class="score-big ${grade}">${s.total}</span><span class="score-denom">&thinsp;/ 100</span></div>
        </div>
        ${scoreBars(d, SCORE_MAX, houseWhy)}
      </div>
      <div class="tags">${tags.join('')}</div>
      ${cardFoot('house', houseKey(d), d.suumoUrl)}
    </div>
  </div>`;
}

const HOUSE_SORTS = {
  'score-desc': (a, b) => b.scores.total - a.scores.total,
  'default':    () => 0,
  'price-asc':  (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'area-desc':  (a, b) => b.areaM2 - a.areaM2,
  'age-asc':    (a, b) => a.age - b.age,
  'walk-asc':   (a, b) => a.walk - b.walk,
  'drop-asc':   (a, b) => (a.priceChange || 0) - (b.priceChange || 0),
};

function render() {
  let data = listings.filter(d => d.areaM2 >= hs.minM2 && d.price <= hs.maxPrice);
  if (hToggles.has('liqlow')) data = data.filter(d => d.liq && !['high', 'mid'].includes(d.liq.level));
  if (hToggles.has('cut')) data = data.filter(d => d.priceChange < 0);
  if (activeLayout !== 'all') {
    data = activeLayout === '4LDK' ? data.filter(d => parseInt(d.layout) >= 4) : data.filter(d => d.layout === activeLayout);
  }
  data = scoreSet(data).sort(HOUSE_SORTS[activeSort]);   // scored on the visible set (normalisation)

  const n = data.length;
  document.getElementById('grid').innerHTML = n === 0
    ? `<div class="empty"><p>${t('emptyHouses')}</p></div>`
    : data.map(houseCardHTML).join('');
  document.getElementById('res-count').textContent = n;
  tabCounts.listings = n;
  refreshHeader();
}

function initHouses() {
  document.getElementById('h-toggle-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    btn.classList.toggle('active') ? hToggles.add(btn.dataset.v) : hToggles.delete(btn.dataset.v);
    render();
  });
  document.getElementById('layout-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    document.querySelectorAll('#layout-chips .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    activeLayout = btn.dataset.layout;
    render();
  });
  document.getElementById('sort-sel').addEventListener('change', e => { activeSort = e.target.value; render(); });

  const areas = listings.map(d => d.areaM2), prices = listings.map(d => d.price);
  const minA = Math.floor(Math.min(...areas)), maxP = Math.ceil(Math.max(...prices) / 100) * 100;
  hs = makeSliders('h-sliders', 'hSliders', [
    { key: 'minM2',    label: 'minSize',  min: minA, max: Math.ceil(Math.max(...areas)), step: 1, value: minA, fmt: 'fmtMinM2' },
    { key: 'maxPrice', label: 'maxPrice', min: Math.floor(Math.min(...prices) / 100) * 100, max: maxP, step: 100, value: maxP, fmt: 'fmtMaxPrice' },
  ], render);
}

/* ═══════════════════════════════════════════════
   APARTMENTS
═══════════════════════════════════════════════ */
const ms = {
  layout: 'all', area: 'all', cat: 'used', sl: null,   // cat: used | new · sl = slider state
  toggles: new Set(), q: '', bldg: null, sort: 'score-desc', shown: MS_PAGE, rate: 1.0,
};
try {
  const saved = parseFloat(localStorage.getItem('loanRate'));
  if (saved >= 0 && saved <= 10) ms.rate = saved;
} catch (e) {}

function msDealHTML(d) {
  const v = d.vsExpected;
  const verdict = v <= -3 ? `<span class="deal-good">${t('dealBelow', -v)}</span>`
                : v >= 3 ? `<span class="deal-bad">${t('dealAbove', v)}</span>` : t('dealFair');
  return `<div class="deal-line" data-tip="${escAttr(msWhy(d, 'value'))}">${d.ppm}万/m² · ${verdict}</div>`;
}

function msCardHTML(d) {
  const s = d.scores, grade = scoreGrade(s.total);
  const tags = [];
  const priceTag = priceTagHTML(d);
  if (priceTag) tags.push(priceTag);
  tags.push(liqTagHTML(d, 'condo'));
  if (d.renovation) tags.push(`<span class="tag tag-green" title="${escAttr(d.renoNote || '')}">${t('tagReno')}</span>`);
  if (!d.shinTaishin) tags.push(`<span class="tag tag-amber" title="${escAttr(t('tagOldSeismicTitle'))}">${t('tagOldSeismic')}</span>`);
  if (d.repairPerM2 !== null && d.repairPerM2 < LOW_REPAIR_PER_M2)
    tags.push(`<span class="tag tag-amber" title="${escAttr(t('tagLowRepairTitle', d.repairPerM2))}">${t('tagLowRepair')}</span>`);
  if (!d.elevator && (d.floor || 0) >= 3) tags.push(`<span class="tag tag-amber">${t('tagNoElev', d.floor)}</span>`);
  if (d.pet) tags.push(`<span class="tag tag-green">${t('tagPets')}</span>`);
  if (d.parking === 'onsite') tags.push(`<span class="tag tag-green" title="${escAttr(t('tagParkingTitle'))}">${t('tagParkingFrom', d.parkingFee)}</span>`);
  else if (d.parking === 'full') tags.push(`<span class="tag tag-amber" title="${escAttr(t('tagParkingFullTitle'))}">${t('tagParkingFull', d.parkingFee)}</span>`);
  else if (d.parking === 'building') tags.push(`<span class="tag tag-muted" title="${escAttr(t('tagParkingBldgTitle'))}">${t('tagParkingBldg', d.parkingFee)}</span>`);
  else if (d.parking === 'none') tags.push(`<span class="tag tag-muted">${t('tagNoParking')}</span>`);
  if (d.landRights === 'leased') tags.push(`<span class="tag tag-amber">${t('tagLeasehold')}</span>`);
  if (d.sameBldg > 0) tags.push(`<button class="tag tag-muted tag-btn" type="button" data-bldg="${escAttr(d.bldgKey)}" data-name="${escAttr(d.name)}">${t('tagInBldg', d.sameBldg)}</button>`);
  if (d.agents > 1) tags.push(`<span class="tag tag-muted">${t('tagAgents', d.agents)}</span>`);
  if (d.daysListed !== null) tags.push(`<span class="tag tag-muted">${t('tagListed', d.daysListed)}</span>`);

  const isNew = d.daysListed !== null && d.daysListed <= 3;
  const floorBadge = d.floor ? `${d.floor}F${d.bldgFloors ? ' / ' + d.bldgFloors + 'F' : ''}` : d.structure;

  return `
  <div class="card has-area" style="${areaStyle(d)}">
    <div class="card-photo">
      <div class="card-photo-bg" style="background:${GRAD_MS[d.id % GRAD_MS.length]}">${d.imageUrl ? '' : ICON.condo}</div>
      ${d.imageUrl ? `<img class="card-photo-img" src="${d.imageUrl}" alt="${t('photoAlt')}" loading="lazy" onerror="this.style.display='none'">` : ''}
      <span class="badge-layout">${d.layout}</span>
      <div class="badge-tr">
        <span class="badge-area">${escHTML(groupName(groupOf(d)))}</span>
        ${isNew ? `<span class="badge-new">${t('badgeNew')}</span>` : ''}
      </div>
      <span class="badge-type">${floorBadge}</span>
      <div class="badge-score ${grade}" data-tip="${escAttr(totalTip(s, MS_SCORE_MAX))}">
        <span class="badge-score-n">${s.total}</span><span class="badge-score-max">/100</span>
      </div>
    </div>
    <div class="card-body">
      <div class="card-price">${fmtYen(d.price)}</div>
      ${msDealHTML(d)}
      <div class="card-addr">
        <span class="addr-pin">${ICON.pin}</span>
        <div><div class="addr-area">${escHTML(d.name)}</div><div class="addr-street">${areaPill(d)} ${escHTML(d.address)}</div></div>
      </div>
      <div class="divider"></div>
      <div class="specs">
        <div class="spec"><span class="spec-lbl">${t('floorArea')}</span>
          <span class="spec-val">${d.areaM2} m² <span class="spec-sub">(${t('tsubo', toTsubo(d.areaM2))})</span></span></div>
        <div class="spec"><span class="spec-lbl">${t('built')}</span>
          <span class="spec-val">${d.builtYear ?? '?'} <span class="spec-sub">(${t('ageY', d.age ?? '?')} · ${d.shinTaishin ? '新耐震' : '旧耐震'})</span></span></div>
        <div class="spec" data-tip="${escAttr(msWhy(d, 'running'))}"><span class="spec-lbl">${t('feesMonth')}</span>
          <span class="spec-val">${d.fees ? yen(d.fees) : '—'} <span class="spec-sub">${d.feesPerM2 ? `(${t('perM2', yen(d.feesPerM2))})` : ''}</span></span></div>
        <div class="spec" data-tip="${escAttr(monthlyTip(d))}"><span class="spec-lbl">${t('estMonthly')}</span>
          <span class="spec-val">${yen(msMonthly(d))} <span class="spec-sub">(@${ms.rate}%)</span></span></div>
        <div class="spec"><span class="spec-lbl">${t('building')}</span>
          <span class="spec-val">${t('structure', d.structure)}${d.bldgFloors ? ' ' + t('bldgFloorsN', d.bldgFloors) : ''} <span class="spec-sub">${d.totalUnits ? `(${t('units', d.totalUnits)})` : ''}</span></span></div>
        <div class="spec"><span class="spec-lbl">${t('facingLbl')}</span>
          <span class="spec-val">${t('facing', d.facing)} <span class="spec-sub">${d.balconyM2 ? `(${t('balcony', d.balconyM2)})` : ''}</span></span></div>
      </div>
      ${stationHTML(d)}
      <div class="score-section">
        <div class="score-top">
          <span class="score-heading">${t('scoreBreakdown')}</span>
          <div class="score-num"><span class="score-big ${grade}">${s.total}</span><span class="score-denom">&thinsp;/ 100</span></div>
        </div>
        ${scoreBars(d, MS_SCORE_MAX, msWhy, 'six')}
      </div>
      <div class="tags">${tags.join('')}</div>
      ${cardFoot('ms', d.ncId, d.suumoUrl)}
    </div>
  </div>`;
}

function msFiltered(ignoreArea = false) {
  const q = ms.q.trim().toLowerCase(), tg = ms.toggles, sl = ms.sl;
  return mansions.filter(d => {
    const rooms = parseInt(d.layout) || 1;
    if (!ignoreArea && ms.area !== 'all' && d.group !== ms.area) return false;
    if (d.areaM2 < sl.minM2 || d.price > sl.maxPrice || d.walk > sl.maxWalk) return false;
    if ((d.builtYear || 0) < sl.minYear) return false;
    if (ms.layout !== 'all') {
      const L = +ms.layout;
      if (L === 1 ? rooms > 1 : L === 4 ? rooms < 4 : rooms !== L) return false;
    }
    if (tg.has('shin') && !d.shinTaishin) return false;
    if (tg.has('walk10') && (d.walk > 10 || d.bus)) return false;
    if (tg.has('elev') && !d.elevator) return false;
    if (tg.has('pet') && !d.pet) return false;
    if (tg.has('cut') && !(d.priceChange < 0)) return false;
    if (tg.has('liqlow') && !(d.liq && !['high', 'mid'].includes(d.liq.level))) return false;
    if (tg.has('new') && !(d.daysListed !== null && d.daysListed <= 7)) return false;
    if (ms.bldg && d.bldgKey !== ms.bldg) return false;
    if (!ms.bldg && q && !`${d.name} ${d.station} ${d.address} ${d.line} ${groupOf(d).name} ${groupOf(d).nameJa}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

const MS_SORTS = {
  'score-desc':  (a, b) => b.scores.total - a.scores.total,
  'value-asc':   (a, b) => a.vsExpected - b.vsExpected,
  'price-asc':   (a, b) => a.price - b.price,
  'price-desc':  (a, b) => b.price - a.price,
  'ppm-asc':     (a, b) => a.ppm - b.ppm,
  'monthly-asc': (a, b) => msMonthly(a) - msMonthly(b),
  'fees-asc':    (a, b) => (a.feesPerM2 ?? 1e9) - (b.feesPerM2 ?? 1e9),
  'area-desc':   (a, b) => b.areaM2 - a.areaM2,
  'age-asc':     (a, b) => (a.age ?? 99) - (b.age ?? 99),
  'walk-asc':    (a, b) => a.walk - b.walk,
  'listed-desc': (a, b) => b.firstSeen.localeCompare(a.firstSeen) || b.scores.total - a.scores.total,
  'drop-asc':    (a, b) => (a.priceChange || 0) - (b.priceChange || 0) || b.scores.total - a.scores.total,
};

function renderSubcats() {
  const box = document.getElementById('ms-subcats');
  if (msGroups.length < 2) { box.hidden = true; return; }
  const counts = {};
  (ms.cat === 'new' ? nwFiltered(true) : msFiltered(true)).forEach(d => { counts[d.group] = (counts[d.group] || 0) + 1; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const allVars = msGroups.slice(0, 4).map((g, i) => `--g${i + 1}:${g.color}`).join(';');
  box.innerHTML = `<button type="button" role="tab" class="subcat all${ms.area === 'all' ? ' active' : ''}" data-v="all" style="${allVars}">
      <span class="dot"></span>${t('allAreas')} <span class="n">${total}</span></button>` +
    msGroups.map(g => `<button type="button" role="tab" class="subcat${ms.area === g.key ? ' active' : ''}" data-v="${g.key}" style="--c:${g.color}">
      <span class="dot"></span>${escHTML(groupName(g))} <span class="n">${counts[g.key] || 0}</span></button>`).join('');
}

function msRender() {
  renderSubcats();
  const data = msFiltered().sort(MS_SORTS[ms.sort]);
  const n = data.length;
  document.getElementById('ms-grid').innerHTML = n === 0
    ? `<div class="empty"><p>${t('emptyMs')}</p></div>`
    : data.slice(0, ms.shown).map(msCardHTML).join('');
  const more = document.getElementById('ms-more');
  const rest = n - ms.shown;
  more.style.display = rest > 0 ? 'block' : 'none';
  more.textContent = t('showMore', Math.min(rest, MS_PAGE), rest);
  document.getElementById('ms-res-count').textContent = n;
  const ppms = data.map(d => d.ppm).sort((a, b) => a - b);
  const med = ppms[Math.floor(ppms.length / 2)];
  document.getElementById('ms-res-note').textContent = n ? t('medianNote', med, (med * 3.3058).toFixed(0)) : '';
  tabCounts.apartments = n;
  refreshHeader();
}

function initApartments() {
  const chipGroup = (id, key) => document.getElementById(id).addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    document.querySelectorAll(`#${id} .chip`).forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    ms[key] = btn.dataset.v;
    ms.shown = MS_PAGE;
    msRender();
  });
  // Area sub-categories (remembered per browser)
  try {
    const saved = localStorage.getItem('msArea');
    if (saved && (saved === 'all' || msGroups.some(g => g.key === saved))) ms.area = saved;
  } catch (e) {}
  document.getElementById('ms-subcats').addEventListener('click', e => {
    const btn = e.target.closest('.subcat'); if (!btn) return;
    ms.area = btn.dataset.v;
    try { localStorage.setItem('msArea', ms.area); } catch (e) {}
    ms.shown = MS_PAGE;
    renderApartments();
  });
  try { const c = localStorage.getItem('msCat'); if (c === 'used' || c === 'new') ms.cat = c; } catch (e) {}
  document.getElementById('ms-cat').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn'); if (!btn) return;
    ms.cat = btn.dataset.cat;
    try { localStorage.setItem('msCat', ms.cat); } catch (e) {}
    renderApartments();
  });
  chipGroup('ms-layout-chips', 'layout');

  const areasM2 = mansions.map(d => d.areaM2), prices = mansions.map(d => d.price);
  const years = mansions.map(d => d.builtYear).filter(Boolean), walks = mansions.map(d => d.walk);
  const minA = Math.floor(Math.min(...areasM2)), maxP = Math.ceil(Math.max(...prices) / 100) * 100;
  const minY = Math.min(...years), maxW = Math.max(...walks);
  ms.sl = makeSliders('ms-sliders', 'msSliders', [
    { key: 'minM2',    label: 'minSize',   min: minA, max: Math.ceil(Math.max(...areasM2)), step: 1, value: minA, fmt: 'fmtMinM2' },
    { key: 'maxPrice', label: 'maxPrice',  min: Math.floor(Math.min(...prices) / 100) * 100, max: maxP, step: 100, value: maxP, fmt: 'fmtMaxPrice' },
    { key: 'maxWalk',  label: 'maxWalk',   min: 1, max: maxW, step: 1, value: maxW, fmt: 'fmtMaxWalk' },
    { key: 'minYear',  label: 'builtFrom', min: minY, max: new Date().getFullYear(), step: 1, value: minY, fmt: 'fmtYearFrom' },
  ], () => { ms.shown = MS_PAGE; msRender(); });

  document.getElementById('ms-toggle-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    btn.classList.toggle('active') ? ms.toggles.add(btn.dataset.v) : ms.toggles.delete(btn.dataset.v);
    ms.shown = MS_PAGE;
    msRender();
  });
  const search = document.getElementById('ms-search');
  search.addEventListener('input', () => { ms.q = search.value; ms.bldg = null; ms.shown = MS_PAGE; msRender(); });
  const rate = document.getElementById('ms-rate');
  rate.value = ms.rate;
  rate.addEventListener('change', () => {
    const v = parseFloat(rate.value);
    if (!(v >= 0 && v <= 10)) { rate.value = ms.rate; return; }
    ms.rate = v;
    try { localStorage.setItem('loanRate', String(v)); } catch (e) {}
    msRender();
  });
  document.getElementById('ms-sort-sel').addEventListener('change', e => { ms.sort = e.target.value; ms.shown = MS_PAGE; msRender(); });
  document.getElementById('ms-more').addEventListener('click', () => { ms.shown += MS_PAGE; msRender(); });
  // "+N in building" → show every unit in that building (clear the search box to undo)
  document.getElementById('ms-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-bldg]'); if (!b) return;
    ms.bldg = b.dataset.bldg;
    search.value = ms.q = b.dataset.name;
    ms.shown = MS_PAGE;
    msRender();
    document.getElementById('panel-apartments').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════
   COMPARE — tray (bottom overlay) + side-by-side table
   Up to 3 listings of one kind; selection remembered per browser.
═══════════════════════════════════════════════ */
const cmp = { kind: null, ids: [], diffOnly: false };
try {
  const saved = JSON.parse(localStorage.getItem('compare'));
  if (saved && ['ms', 'house', 'new'].includes(saved.kind) && Array.isArray(saved.ids)) Object.assign(cmp, saved);
} catch (e) {}

const cmpSave = () => { try { localStorage.setItem('compare', JSON.stringify({ kind: cmp.kind, ids: cmp.ids })); } catch (e) {} };

// "kind:id" — ids may contain ':' themselves (building keys), so split on the first one only
const splitCmp = s => [s.slice(0, s.indexOf(':')), s.slice(s.indexOf(':') + 1)];
const cmpKey = d => cmp.kind === 'ms' ? d.ncId : cmp.kind === 'new' ? d.key : houseKey(d);

function cmpItems() {
  if (cmp.kind === 'new') return cmp.ids.map(id => newMansions.find(d => d.key === id)).filter(Boolean);
  if (cmp.kind === 'ms') return cmp.ids.map(id => mansions.find(d => d.ncId === id)).filter(Boolean);
  if (cmp.kind === 'house') {
    const scored = scoreSet(listings);      // score against all houses for a stable comparison
    return cmp.ids.map(id => scored.find(d => houseKey(d) === id)).filter(Boolean);
  }
  return [];
}

function cmpToggle(kind, id) {
  if (cmp.kind && cmp.kind !== kind && cmp.ids.length) {
    cmp.ids = [];
    toast(t('cmpSwitched', kind));
  }
  cmp.kind = kind;
  if (cmp.ids.includes(id)) cmp.ids = cmp.ids.filter(x => x !== id);
  else if (cmp.ids.length >= 3) return toast(t('cmpMax'));
  else cmp.ids.push(id);
  if (!cmp.ids.length) cmp.kind = null;
  cmpSave();
  refreshCompareButtons();
  renderTray();
}

function refreshCompareButtons() {
  document.querySelectorAll('[data-cmp]').forEach(b => {
    const [kind, id] = splitCmp(b.dataset.cmp);
    const on = cmp.kind === kind && cmp.ids.includes(id);
    b.classList.toggle('on', on);
    b.textContent = t(on ? 'cmpAdded' : 'cmpAdd');
  });
}

function itemTitle(d) {
  if (cmp.kind === 'new') return d.name;
  return cmp.kind === 'ms' ? `${d.name}${d.floor ? ' ' + t('floorN', d.floor) : ''}` : `${d.layout} · ${d.address}`;
}

function renderTray() {
  const tray = document.getElementById('cmp-tray');
  const items = cmpItems();
  if (items.length !== cmp.ids.length) {               // listing sold / withdrawn since selected
    cmp.ids = items.map(d => cmpKey(d));
    if (!cmp.ids.length) cmp.kind = null;
    cmpSave();
  }
  document.body.classList.toggle('has-tray', items.length > 0);
  if (!items.length) { tray.hidden = true; return; }
  tray.hidden = false;
  tray.innerHTML = `
    <div class="cmp-tray-inner">
      <div class="cmp-tray-count">${t('cmpTray', items.length)}</div>
      <div class="cmp-tray-items">${items.map(d => `
        <div class="cmp-chip${cmp.kind !== 'house' ? ' has-area' : ''}" style="${cmp.kind !== 'house' ? areaStyle(d) : ''}">
          ${d.imageUrl ? `<img src="${d.imageUrl}" alt="">` : `<span class="cmp-chip-ph"></span>`}
          <div class="cmp-chip-txt"><b>${escHTML(itemTitle(d))}</b><span>${cmp.kind !== 'house' ? escHTML(groupName(groupOf(d))) + ' · ' : ''}${d.price ? fmtYen(d.price) : t('nwPriceTBD')}</span></div>
          <button type="button" class="cmp-x" data-cmp-x="${escAttr(cmpKey(d))}" aria-label="${t('cmpRemove')}">×</button>
        </div>`).join('')}
      </div>
      <div class="cmp-tray-actions">
        <button type="button" class="chip" id="cmp-clear">${t('cmpClear')}</button>
        <button type="button" class="cmp-go" id="cmp-go" ${items.length < 2 ? 'disabled' : ''} title="${items.length < 2 ? escAttr(t('cmpNeedTwo')) : ''}">${t('cmpNow')}</button>
      </div>
    </div>`;
}

/* Row definitions. better: 'low' | 'high' | 'yes' (true wins) | null (no colour).
   val → comparable number/bool (null = unknown), show → display HTML. */
function cmpRows(kind) {
  const R = (key, val, show, better = null) => ({ key, val, show, better });
  const bool = v => v == null ? '—' : t(v ? 'yes' : 'no');
  const liqVal = d => d.liq ? LIQ_META[d.liq.level].rank : null;
  const liqShow = d => d.liq ? `<span class="tag ${LIQ_META[d.liq.level].cls}">${t('liq.' + d.liq.level)}</span>` : '—';
  const change = d => d.priceChange ? signedPrice(d.priceChange) : t('none');
  const listedShow = d => d.daysListed == null ? t('notTracked') : d.daysListed;

  if (kind === 'new') return [
    ['district', [R('district', d => d.group, d => areaPill(d))]],
    ['price', [
      R('nwPriceFrom', d => d.priceMin, d => d.priceMin ? fmtYen(d.priceMin) : t('nwPriceTBD'), 'low'),
      R('nwPriceTo', d => d.priceMax, d => d.priceMax ? fmtYen(d.priceMax) : t('nwPriceTBD')),
      R('nwBandRow', d => d.priceBand, d => d.priceBand ? escHTML(d.priceBand) : '—'),
      R('ppm', d => d.ppm, d => d.ppm ? `${d.ppmApprox ? '~' : ''}${d.ppm}万/m²` : '—', 'low'),
      R('nwPremiumRow', d => d.premium, d => d.premium == null ? '—' : t('nwPremium', d.premium), 'low'),
      R('nwStatus', d => ({ set: 2, partial: 1, tbd: 0 })[d.priceStatus], d => t('nwStatus.' + d.priceStatus), 'high'),
    ]],
    ['timing', [
      R('nwMoveIn', d => d.monthsToMove, d => moveText(d), 'low'),
      R('nwCompletion', d => d.completion?.[0], d => d.completed ? t('nwCompleted', d.completion?.[0]) : d.completion?.[0] ? `${d.completion[0]}/${d.completion[1] ?? '?'}` : '—'),
      R('nwScheduleRow', d => d.schedule, d => d.schedule ? `<div class="cmp-sub">${escHTML(d.schedule.slice(0, 90))}</div>` : '—'),
    ]],
    ['demand', [
      R('nwPhase', d => d.phase, d => d.phase ? escHTML(d.phase) : '—'),
      R('nwPhaseChange', d => d.phaseChange, d => d.phaseChange == null ? '—' : `${d.phaseChange > 0 ? '+' : ''}${d.phaseChange}% vs ${escHTML(d.phasePrev)}`),
      R('nwStock', d => d.stockNow, d => d.stockNow ?? '—'),
      R('nwSoldWeek', d => d.soldWeek, d => d.soldWeek ?? '—', 'high'),
      R('nwPace', d => d.pacePerWeek, d => d.pacePerWeek ?? '—', 'high'),
    ]],
    ['size', [
      R('area', d => d.maxM2, d => `${d.areaRange[0] ?? '?'}–${d.areaRange[1] ?? '?'} m²`, 'high'),
      R('layout', d => d.layoutRange, d => escHTML(d.layoutRange || '—')),
      R('nwTypesRow', d => d.types.length, d => d.types.length),
    ]],
    ['costs', [
      R('mgmt', d => d.mgmtFee?.[0], d => yenRange(d.mgmtFee), 'low'),
      R('repair', d => d.repairFund?.[0], d => yenRange(d.repairFund)),
      R('nwEffRow', d => d.feesPerM2Eff, d => d.feesPerM2Eff ? t('perM2', yen(d.feesPerM2Eff)) : t('nwTBD'), 'low'),
      R('nwUpfront', d => d.kind === 'unsold' ? 0 : d.upfront, d => d.upfront ? yen(d.upfront) : t(d.kind === 'unsold' ? 'nwNone' : 'nwTBD'), 'low'),
      R('parkingFee', d => d.parkingFee?.[0], d => yenRange(d.parkingFee), 'low'),
    ]],
    ['building', [
      R('nwKindRow', d => d.kind, d => t('nwKind.' + nwKindClass(d))),
      R('units', d => d.totalUnits, d => d.totalUnits ?? '—'),
      R('nwUnits', d => d.unitsOnSale, d => d.unitsOnSale ?? '—'),
      R('bldgFloors', d => d.bldgFloors, d => d.bldgFloors ? t('bldgFloorsN', d.bldgFloors) : '—'),
      R('nwParkingRatio', d => d.parkingRatio, d => d.parkingRatio != null ? Math.round(d.parkingRatio * 100) + '%' : '—', 'high'),
      R('nwDev', d => d.major.length, d => escHTML(d.developers.join(', ') || '—'), 'high'),
      R('nwIso', d => d.seismicIso, d => t(d.seismicIso ? 'yes' : 'no'), 'yes'),
      R('rights', d => d.landRights === 'owned', d => t(d.landRights === 'owned' ? 'rightsOwned' : 'rightsLeased'), 'yes'),
    ]],
    ['access', [
      R('station', d => d.station, d => `${escHTML(t('stationName', d.station))}<div class="cmp-sub">${escHTML(d.line)}</div>`),
      R('walk', d => d.walk, d => t('minShort', d.walk), 'low'),
      R('address', d => d.address, d => escHTML(d.address)),
    ]],
    ['risk', [R('liq', liqVal, liqShow, 'low')]],
    ['scores', [
      R('total', d => d.scores.total, d => `<b>${d.scores.total}</b> / 100`, 'high'),
      ...Object.keys(NW_SCORE_MAX).map(k => R('cat.' + k, d => d.scores[k], d => `${d.scores[k]} / ${NW_SCORE_MAX[k]}`, 'high')),
    ]],
  ];

  if (kind === 'ms') return [
    ['district', [
      R('district', d => d.group, d => areaPill(d)),
    ]],
    ['price', [
      R('price', d => d.price, d => fmtYen(d.price), 'low'),
      R('ppm', d => d.ppm, d => `${d.ppm}万/m²`, 'low'),
      R('vsSimilar', d => d.vsExpected, d => Math.abs(d.vsExpected) < 3 ? t('dealFair') : d.vsExpected < 0 ? t('dealBelow', -d.vsExpected) : t('dealAbove', d.vsExpected), 'low'),
      R('monthly', d => msMonthly(d), d => yen(msMonthly(d)), 'low'),
      R('priceChange', d => d.priceChange || 0, change, 'low'),
    ]],
    ['size', [
      R('area', d => d.areaM2, d => `${d.areaM2} m² (${t('tsubo', toTsubo(d.areaM2))})`, 'high'),
      R('balcony', d => d.balconyM2, d => d.balconyM2 ? `${d.balconyM2} m²` : '—', 'high'),
      R('layout', d => parseInt(d.layout) || null, d => d.layout, 'high'),
    ]],
    ['building', [
      R('built', d => d.builtYear, d => `${d.builtYear ?? '?'} (${t('ageY', d.age ?? '?')})`, 'high'),
      R('seismic', d => d.shinTaishin, d => t(d.shinTaishin ? 'seismicNew' : 'seismicOld'), 'yes'),
      R('reno', d => d.renovation, d => d.renovation ? `${t('yes')}${d.renoNote ? `<div class="cmp-sub">${escHTML(d.renoNote)}</div>` : ''}` : t('no'), 'yes'),
      R('structure', d => d.structure, d => t('structure', d.structure)),
      R('floor', d => d.floor, d => d.floor ? t('floorN', d.floor) : '—', 'high'),
      R('bldgFloors', d => d.bldgFloors, d => d.bldgFloors ? t('bldgFloorsN', d.bldgFloors) : '—'),
      R('units', d => d.totalUnits, d => d.totalUnits ?? '—'),
      R('facing', d => d.facing ? d.facing.includes('南') : null, d => t('facing', d.facing), 'yes'),
    ]],
    ['costs', [
      R('fees', d => d.fees, d => d.fees ? yen(d.fees) : '—', 'low'),
      R('mgmt', d => d.mgmtFee, d => d.mgmtFee ? yen(d.mgmtFee) : '—', 'low'),
      R('repair', d => d.repairFund, d => d.repairFund ? yen(d.repairFund) : '—'),
      R('feesM2', d => d.feesPerM2, d => d.feesPerM2 ? t('perM2', yen(d.feesPerM2)) : '—', 'low'),
      R('repairM2', d => d.repairPerM2, d => d.repairPerM2 ? t('perM2', yen(d.repairPerM2)) + (d.repairPerM2 < LOW_REPAIR_PER_M2 ? ` <span class="tag tag-amber">${t('tagLowRepair')}</span>` : '') : '—'),
    ]],
    ['access', [
      R('station', d => d.station, d => `${escHTML(t('stationName', d.station))}<div class="cmp-sub">${escHTML(d.line)}</div>`),
      R('walk', d => d.walk, d => t('minShort', d.walk), 'low'),
      R('bus', d => !d.bus, d => bool(d.bus), 'yes'),
      R('address', d => d.address, d => escHTML(d.address)),
    ]],
    ['risk', [
      R('liq', liqVal, liqShow, 'low'),
    ]],
    ['features', [
      R('elev', d => d.elevator, d => bool(d.elevator), 'yes'),
      R('pet', d => d.pet, d => bool(d.pet), 'yes'),
      R('parking', d => ({ onsite: 3, building: 2, full: 2, nearby: 2, other: 1, none: 0 })[d.parking] ?? null, d => t('parkingKind.' + d.parking), 'high'),
      R('parkingFee', d => d.parking === 'onsite' ? d.parkingFee : null, d => d.parking === 'onsite' && d.parkingFee ? yen(d.parkingFee) : '—', 'low'),
      R('rights', d => d.landRights === 'owned', d => t(d.landRights === 'owned' ? 'rightsOwned' : 'rightsLeased'), 'yes'),
    ]],
    ['listing', [
      R('listed', d => d.daysListed, listedShow),
      R('agents', d => d.agents, d => d.agents),
      R('sameBldg', d => d.sameBldg, d => d.sameBldg),
    ]],
    ['scores', [
      R('total', d => d.scores.total, d => `<b>${d.scores.total}</b> / 100`, 'high'),
      ...Object.keys(MS_SCORE_MAX).map(k => R('cat.' + k, d => d.scores[k], d => `${d.scores[k]} / ${MS_SCORE_MAX[k]}`, 'high')),
    ]],
  ];

  return [
    ['price', [
      R('price', d => d.price, d => fmtYen(d.price), 'low'),
      R('ppm', d => d.price / d.areaM2, d => `${(d.price / d.areaM2).toFixed(1)}万/m²`, 'low'),
      R('priceChange', d => d.priceChange || 0, change, 'low'),
    ]],
    ['size', [
      R('area', d => d.areaM2, d => `${d.areaM2} m² (${t('tsubo', toTsubo(d.areaM2))})`, 'high'),
      R('land', d => d.landM2, d => d.landM2 ? `${d.landM2} m² (${t('tsubo', toTsubo(d.landM2))})` : '—', 'high'),
      R('layout', d => parseInt(d.layout) || null, d => d.layout, 'high'),
    ]],
    ['building', [
      R('age', d => d.age, d => d.age === 0 ? t('newBuild') : t('yearsOld', d.age), 'low'),
      R('structure', d => ({ RC: 3, Steel: 2, Wood: 1 })[d.structure] ?? null, d => `${t('structure', d.structure)} / ${t('storeys', d.floors)}`, 'high'),
      R('reno', d => d.renovation, d => bool(d.renovation), 'yes'),
    ]],
    ['access', [
      R('station', d => d.station, d => `${escHTML(t('stationName', d.station))}<div class="cmp-sub">${escHTML(d.line)}</div>`),
      R('walk', d => d.walk, d => t('minShort', d.walk), 'low'),
      R('address', d => d.address, d => escHTML(d.address)),
    ]],
    ['risk', [
      R('liq', liqVal, liqShow, 'low'),
    ]],
    ['features', [
      R('parking', d => d.parking, d => t('parkingCars', d.parking), 'high'),
      R('rights', d => d.landRights === 'owned', d => t(d.landRights === 'owned' ? 'rightsOwned' : 'rightsLeased'), 'yes'),
      R('gas', d => d.cityGas, d => bool(d.cityGas), 'yes'),
    ]],
    ['scores', [
      R('total', d => d.scores.total, d => `<b>${d.scores.total}</b> / 100`, 'high'),
      ...Object.keys(SCORE_MAX).map(k => R('cat.' + k, d => d.scores[k], d => `${d.scores[k]} / ${SCORE_MAX[k]}`, 'high')),
    ]],
  ];
}

/* Colour each cell: best → green, worst → red (middle of three stays neutral). */
function cmpClasses(vals, better) {
  const none = vals.map(() => '');
  if (!better) return none;
  const nums = vals.map(v => v == null ? null : typeof v === 'boolean' ? +v : v);
  const known = nums.filter(v => v != null);
  if (known.length < 2 || known.every(v => v === known[0])) return none;
  const hi = better === 'low' ? Math.min(...known) : Math.max(...known);
  const lo = better === 'low' ? Math.max(...known) : Math.min(...known);
  return nums.map(v => v == null ? '' : v === hi ? 'cmp-best' : v === lo ? 'cmp-worst' : '');
}

function renderCompare() {
  const items = cmpItems();
  const modal = document.getElementById('cmp-modal');
  if (items.length < 2) { modal.hidden = true; return; }
  const wins = items.map(() => 0);
  const sections = cmpRows(cmp.kind).map(([sec, rows]) => {
    const body = rows.map(r => {
      const vals = items.map(r.val), shows = items.map(r.show);
      const cls = cmpClasses(vals, r.better);
      cls.forEach((c, i) => { if (c === 'cmp-best') wins[i]++; });
      const same = shows.every(s => s === shows[0]);
      if (cmp.diffOnly && same) return '';
      const label = r.key.startsWith('cat.') ? t('catLong.' + r.key.slice(4)) : r.key === 'total' ? t('catLong.total') : t('row.' + r.key);
      return `<tr><th scope="row">${label}</th>${shows.map((s, i) => `<td class="${cls[i]}">${s}</td>`).join('')}</tr>`;
    }).join('');
    return body ? `<tbody><tr class="cmp-sec"><th colspan="${items.length + 1}">${t('sec.' + sec)}</th></tr>${body}</tbody>` : '';
  }).join('');

  const head = items.map((d, i) => `
    <th class="cmp-col${cmp.kind !== 'house' ? ' has-area' : ''}" style="${cmp.kind !== 'house' ? areaStyle(d) : ''}">
      <div class="cmp-photo" style="background:${cmp.kind === 'house' ? d.grad : GRAD_MS[(d.id || 0) % GRAD_MS.length]}">
        ${d.imageUrl ? `<img src="${d.imageUrl}" alt="" onerror="this.style.display='none'">` : ''}
        <span class="badge-score ${scoreGrade(d.scores.total)}"><span class="badge-score-n">${d.scores.total}</span><span class="badge-score-max">/100</span></span>
      </div>
      <div class="cmp-name">${cmp.kind !== 'house' ? areaPill(d) + '<br>' : ''}${escHTML(itemTitle(d))}</div>
      <div class="cmp-price">${d.price ? fmtYen(d.price) + (d.priceMax && d.priceMax !== d.price ? ' –' : '') : t('nwPriceTBD')}</div>
      <div class="cmp-wins">${t('cmpWins', wins[i])}</div>
      <div class="cmp-links">
        <a href="${d.suumoUrl}" target="_blank" rel="noopener">SUUMO ${ICON.out}</a>
        <button type="button" data-cmp-x="${escAttr(cmpKey(d))}">${t('cmpRemove')}</button>
      </div>
    </th>`).join('');

  modal.hidden = false;
  modal.innerHTML = `
    <div class="cmp-dialog" role="dialog" aria-modal="true" aria-label="${t('cmpTitle')}">
      <div class="cmp-top">
        <h2>${t('cmpTitle')}</h2>
        <label class="cmp-diff"><input type="checkbox" id="cmp-diff" ${cmp.diffOnly ? 'checked' : ''}> ${t('cmpDiffOnly')}</label>
        <button type="button" class="cmp-close" id="cmp-close" aria-label="${t('cmpClose')}">×</button>
      </div>
      <p class="cmp-legend">${t('cmpLegend')}${cmp.kind === 'house' ? ' ' + t('cmpHouseScoreNote') : ''}</p>
      <div class="cmp-scroll">
        <table class="cmp-table cols-${items.length}">
          <thead><tr><th></th>${head}</tr></thead>
          ${sections}
        </table>
      </div>
    </div>`;
  document.body.classList.add('modal-open');
}

function closeCompare() {
  document.getElementById('cmp-modal').hidden = true;
  document.body.classList.remove('modal-open');
}

function initCompare() {
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-cmp]');
    if (add) {
      const [kind, id] = splitCmp(add.dataset.cmp);
      return cmpToggle(kind, id);
    }
    const x = e.target.closest('[data-cmp-x]');
    if (x) {
      cmpToggle(cmp.kind, x.dataset.cmpX);
      if (!document.getElementById('cmp-modal').hidden) cmp.ids.length >= 2 ? renderCompare() : closeCompare();
      return;
    }
    if (e.target.closest('#cmp-clear')) { cmp.ids = []; cmp.kind = null; cmpSave(); refreshCompareButtons(); renderTray(); return; }
    if (e.target.closest('#cmp-go')) return renderCompare();
    if (e.target.closest('#cmp-close') || e.target.id === 'cmp-modal') return closeCompare();
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'cmp-diff') { cmp.diffOnly = e.target.checked; renderCompare(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCompare(); });
  renderTray();
}

/* ═══════════════════════════════════════════════
   TREND CHARTS  (Chart.js)
═══════════════════════════════════════════════ */
let chartsReady = false;
const CHART_IDS = ['chart-price', 'chart-count', 'chart-ms-ppm', 'chart-ms-count'];

function resetCharts() {
  if (!chartsReady) return;
  chartsReady = false;
  CHART_IDS.forEach(id => {
    const wrap = document.getElementById(id)?.parentElement || document.querySelector(`[data-chart="${id}"]`);
    if (wrap) wrap.innerHTML = `<canvas id="${id}"></canvas>`;
  });
  document.querySelectorAll('.chart-stat-row').forEach(el => { el.innerHTML = ''; });
  if (document.getElementById('panel-trends').classList.contains('active')) initCharts();
}

function initCharts() {
  if (chartsReady) return;
  chartsReady = true;
  const light = document.documentElement.classList.contains('light');
  const C = {
    grid: light ? 'rgba(180,175,200,.3)' : 'rgba(37,35,48,.8)',
    text: light ? '#5a566e' : '#908ca0',
    accent: light ? '#d44e2e' : '#e05a3a',
    green: light ? '#00955a' : '#00c46a',
    font: "'DM Sans', system-ui, sans-serif",
  };
  const noData = `<div class="chart-no-data"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M3 17l5-5 4 4 9-9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${t('collecting')}</span></div>`;

  const series = [
    { id: 'chart-price',    hist: history,        key: 'avgPrice',  color: C.accent, fill: true, stat: 'stat-price',    lbl: 'latestAvg',
      fmt: v => t('priceShort', v), tick: v => fmtMan(v) },
    { id: 'chart-count',    hist: history,        key: 'count',     color: C.green,  fill: true, stat: 'stat-count',    lbl: 'latestCount',
      fmt: v => `${v} ${t('listingsUnit')}`, tick: v => v },
    { id: 'chart-ms-ppm',   hist: mansionHistory, key: 'medianPpm', color: C.accent, stat: 'stat-ms-ppm',   lbl: 'latestMedian',
      fmt: v => `${v} 万/m²`, tick: v => v, byArea: 'legend-ms-ppm' },
    { id: 'chart-ms-count', hist: mansionHistory, key: 'count',     color: C.green,  stat: 'stat-ms-count', lbl: 'latestCount',
      fmt: v => `${v} ${t('listingsUnit')}`, tick: v => v, byArea: 'legend-ms-count' },
  ];
  // One line per apartment area (history entries carry an "areas" breakdown)
  const areaDatasets = s => msGroups.map(g => ({
    label: groupName(g), data: s.hist.map(h => h.areas?.[g.key]?.[s.key] ?? null),
    borderColor: g.color, backgroundColor: 'transparent', pointBackgroundColor: g.color, borderWidth: 2,
    pointRadius: s.hist.length === 1 ? 5 : 3, pointHoverRadius: 6, tension: .35, spanGaps: true,
  })).filter(ds => ds.data.some(v => v != null));
  series.forEach(s => {
    const canvas = document.getElementById(s.id);
    if (!canvas) return;
    canvas.parentElement.dataset.chart = s.id;
    if (!s.hist.length) { canvas.parentElement.innerHTML = noData; return; }
    const ctx = canvas.getContext('2d');
    let bg = 'transparent';
    if (s.fill) {
      bg = ctx.createLinearGradient(0, 0, 0, 260);
      bg.addColorStop(0, s.color + '44');
      bg.addColorStop(1, s.color + '00');
    }
    new Chart(ctx, {
      type: 'line',
      data: { labels: s.hist.map(h => h.date), datasets: s.byArea ? areaDatasets(s) : [{
        data: s.hist.map(h => h[s.key]), borderColor: s.color, backgroundColor: bg, borderWidth: 2,
        pointRadius: s.hist.length === 1 ? 5 : 3, pointHoverRadius: 6, pointBackgroundColor: s.color, fill: !!s.fill, tension: .35,
      }]},
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: '#1e1e2a', borderColor: '#252330', borderWidth: 1, titleColor: '#eeeaf4', bodyColor: '#908ca0', padding: 10,
          callbacks: { label: c => ' ' + (s.byArea ? c.dataset.label + ': ' : '') + s.fmt(c.parsed.y) } } },
        scales: {
          x: { ticks: { color: C.text, font: { family: C.font, size: 11 }, maxRotation: 30 }, grid: { color: C.grid } },
          y: { ticks: { color: C.text, font: { family: C.font, size: 11 }, callback: s.tick }, grid: { color: C.grid } },
        },
      },
    });
    if (s.byArea) {
      document.getElementById(s.byArea).innerHTML = msGroups.map(g =>
        `<span><i style="background:${g.color}"></i>${escHTML(groupName(g))}</span>`).join('');
    }
    const last = s.hist[s.hist.length - 1][s.key];
    const prev = s.hist.length > 1 ? s.hist[s.hist.length - 2][s.key] : null;
    const d = prev == null ? null : +(last - prev).toFixed(1);
    document.getElementById(s.stat).innerHTML = `<div class="chart-stat">
      <span class="chart-stat-val">${s.fmt(last)}</span><span class="chart-stat-lbl">${t(s.lbl)}</span>
      ${d === null ? '' : `<span class="chart-stat-delta ${d > 0 ? 'up' : d < 0 ? 'down' : 'flat'}">${d > 0 ? '+' : ''}${d} ${t('vsPrev')}</span>`}
    </div>`;
  });
}

/* ═══════════════════════════════════════════════
   NEW CONDOS (新築マンション) — scores pre-computed in inject_newms.py
   Value 25 · Access 20 · Certainty 15 · Fees 15 · Space 10 · Project 15
   Items are developer projects (price ranges, often 予定/未定) or buildings of
   never-occupied units (新築未入居, one price per unit).
═══════════════════════════════════════════════ */
const NW_SCORE_MAX = { value: 25, access: 20, certainty: 15, running: 15, space: 10, project: 15 };
const nw = { toggles: new Set(), sort: 'score-desc', sl: null };

const nwKindClass = d => d.kind === 'unsold' ? 'unsold' : d.priceStatus === 'tbd' ? 'presale' : 'onsale';
const nwPriceHTML = d => {
  if (!d.priceMin) return `<div class="nw-price tbd">${t('nwPriceTBD')}</div>`;
  return `<div class="nw-price">${d.priceMax && d.priceMax !== d.priceMin
    ? `${t('priceShort', d.priceMin)} – ${t('priceShort', d.priceMax)}` : fmtYen(d.priceMin)}</div>`;
};
const yenRange = r => !r || r[0] == null ? t('nwTBD') : r[0] === r[1] ? yen(r[0]) : `${yen(r[0])}–${yen(r[1])}`;
const moveText = d => d.monthsToMove === 0 ? t('nwMoveNow')
  : d.delivery?.[0] ? t('nwMoveAt', d.delivery[0], d.delivery[1], d.monthsToMove) : t('nwTBD');

function nwWhy(d, key) {
  const s = d.scores, w = d.why;
  switch (key) {
    case 'value': return t('nwValueTip', { s: s.value, ppm: d.ppm, approx: d.ppmApprox, bench: d.bench, prem: d.premium,
      station: escHTML(d.station), area: escHTML(groupName(groupOf(d))) });
    case 'access': return t('msAccess', { s: s.access, walk: d.walk, station: escHTML(d.station), line: escHTML(d.line), bus: d.bus });
    case 'certainty': return t('nwCertaintyTip', { s: s.certainty, status: d.priceStatus, fees: d.feesKnown, move: w.move, when: moveText(d) });
    case 'running': return t('nwRunningTip', { s: s.running, mgmt: yenRange(d.mgmtFee), repair: yenRange(d.repairFund),
      eff: d.feesPerM2Eff, repairM2: d.repairPerM2, upfront: d.upfront ? yen(d.upfront) : t('nwTBD') });
    case 'space': return t('nwSpaceTip', { s: s.space, max: d.maxM2, range: d.areaRange });
    case 'project': return t('nwProjectTip', s.project, w.extras.map(([code, param, p]) =>
      `<li><span>${escHTML(t('nwEx.' + code, param))}</span><span>${p > 0 ? '+' : '−'}${Math.abs(p)}</span></li>`).join(''));
  }
}

function nwTypesHTML(d) {
  if (!d.types.length) return '';
  const rows = d.types.map(ty => {
    const price = ty.priceMin ? (ty.priceMax && ty.priceMax !== ty.priceMin ? `${t('priceShort', ty.priceMin)}–${t('priceShort', ty.priceMax)}` : t('priceShort', ty.priceMin)) : null;
    const ppm = ty.priceMin && ty.m2 ? ((ty.priceMin + (ty.priceMax || ty.priceMin)) / 2 / ty.m2).toFixed(1) : null;
    const floors = ty.rooms.map(r => r.floor).filter(Boolean);
    const where = d.kind === 'unsold' ? `<a href="${ty.url}" target="_blank" rel="noopener">SUUMO ${ICON.out}</a>`
      : floors.length ? floors.map(f => t('floorN', f)).join(', ') + (ty.roomCount > floors.length ? ` +${ty.roomCount - floors.length}` : '') : '';
    return `<tr><td>${escHTML(ty.name)}${ty.corner ? ' ◢' : ''}</td><td>${escHTML((ty.layout || '').replace(/\(.*?\)/g, '').slice(0, 14))}</td>
      <td>${ty.m2 ?? '—'}m²</td><td class="${price ? '' : 'tbd'}">${price || escHTML(ty.priceText || t('nwTBD'))}</td>
      <td>${ppm ? ppm + '万' : ''}</td><td>${where}</td></tr>`;
  }).join('');
  return `<details class="nw-types"${d.types.length <= 4 ? ' open' : ''}><summary>${t('nwTypes', d.types.length, d.kind)}</summary>
    <table><tr><th>${t(d.kind === 'unsold' ? 'nwColFloor' : 'nwColType')}</th><th>${t('layout')}</th><th>m²</th><th>${t('row.price')}</th><th>万/m²</th><th></th></tr>${rows}</table></details>`;
}

function nwPriceTagHTML(d) {
  if (d.priceAnnounced) return `<span class="tag tag-green">${t('nwAnnounced')}</span>`;
  if (!d.priceChange) return '';
  const first = d.history.find(h => h[1])?.[1];
  const tip = `<div class="tip-h">${t('nwPriceHist')}</div><ul class="tip-list">${d.history.map(h =>
    `<li><span>${h[0]}</span><span>${h[1] ? t('priceShort', h[1]) + (h[2] && h[2] !== h[1] ? '–' + t('priceShort', h[2]) : '') : t('nwTBD')}</span></li>`).join('')}</ul>`;
  const pct = Math.abs(d.priceChange / first * 100).toFixed(1);
  return d.priceChange < 0
    ? `<span class="tag tag-green" data-tip="${escAttr(tip)}">↓ ${t('priceShort', -d.priceChange)} (−${pct}%)</span>`
    : `<span class="tag tag-amber" data-tip="${escAttr(tip)}">↑ ${t('priceShort', d.priceChange)} (+${pct}%)</span>`;
}

function nwSalesHTML(d) {
  const lines = [];
  if (d.phase) lines.push(t('nwPhaseLine', d.phase, d.phasePrev, d.phaseChange));
  lines.push(t('nwStockLine', { stock: d.stockNow, types: d.typesListed, sold: d.sold, since: d.trackSince,
                                pace: d.pacePerWeek, sellOut: d.sellOutWeeks }));
  return `<div class="nw-sched" data-tip="${escAttr(t('nwSalesTip'))}"><b>${t('nwSales')}</b><br>${lines.join('<br>')}</div>`;
}

function nwCardHTML(d) {
  const s = d.scores, grade = scoreGrade(s.total), kc = nwKindClass(d);
  const tags = [];
  const pt = nwPriceTagHTML(d);
  if (pt) tags.push(pt);
  tags.push(liqTagHTML(d, 'condo'));
  if (d.major.length) tags.push(`<span class="tag tag-green" title="${escAttr(d.major.join(', '))}">${t('nwMajorTag')}</span>`);
  if (d.repairPerM2 != null && d.repairPerM2 < LOW_REPAIR_PER_M2)
    tags.push(`<span class="tag tag-amber" data-tip="${escAttr(t('nwLowRepairTip', d.repairPerM2))}">${t('nwLowRepair')}</span>`);
  if (d.seismicIso) tags.push(`<span class="tag tag-green">${t('nwIso')}</span>`);
  if (d.zeh) tags.push(`<span class="tag tag-green">ZEH</span>`);
  if (d.landRights === 'leased') tags.push(`<span class="tag tag-amber">${t('tagLeasehold')}</span>`);
  if (d.daysListed !== null) tags.push(`<span class="tag tag-muted">${t('tagListed', d.daysListed)}</span>`);
  const dealLine = d.premium == null ? `<div class="deal-line" data-tip="${escAttr(nwWhy(d, 'value'))}">${t('nwNoPremium')}</div>`
    : `<div class="deal-line" data-tip="${escAttr(nwWhy(d, 'value'))}">${d.ppmApprox ? '~' : ''}${d.ppm}万/m² · <span class="${d.premium <= 10 ? 'deal-good' : d.premium >= 25 ? 'deal-bad' : ''}">${t('nwPremium', d.premium)}</span></div>`;

  return `
  <div class="card has-area" style="${areaStyle(d)}">
    <div class="card-photo">
      <div class="card-photo-bg" style="background:${GRAD_MS[d.name.length % GRAD_MS.length]}">${d.image ? '' : ICON.condo}</div>
      ${d.image ? `<img class="card-photo-img" src="${d.image}" alt="${t('photoAlt')}" loading="lazy" onerror="this.style.display='none'">` : ''}
      <span class="badge-layout badge-kind ${kc}">${t('nwKind.' + kc)}</span>
      <div class="badge-tr"><span class="badge-area">${escHTML(groupName(groupOf(d)))}</span></div>
      <span class="badge-type">${d.bldgFloors ? t('bldgFloorsN', d.bldgFloors) : ''}</span>
      <div class="badge-score ${grade}" data-tip="${escAttr(totalTip(s, NW_SCORE_MAX))}">
        <span class="badge-score-n">${s.total}</span><span class="badge-score-max">/100</span>
      </div>
    </div>
    <div class="card-body">
      ${nwPriceHTML(d)}
      ${d.priceBand ? `<div class="nw-band">${t('nwBand', escHTML(d.priceBand))}</div>` : ''}
      ${dealLine}
      <div class="card-addr">
        <span class="addr-pin">${ICON.pin}</span>
        <div><div class="addr-area">${escHTML(d.name)}</div><div class="addr-street">${areaPill(d)} ${escHTML(d.address)}</div></div>
      </div>
      <div class="divider"></div>
      <div class="specs">
        <div class="spec" data-tip="${escAttr(nwWhy(d, 'certainty'))}"><span class="spec-lbl">${t('nwMoveIn')}</span>
          <span class="spec-val">${moveText(d)}</span></div>
        <div class="spec"><span class="spec-lbl">${t('nwUnits')}</span>
          <span class="spec-val">${d.unitsOnSale ?? '—'} <span class="spec-sub">/ ${d.totalUnits ?? '?'} ${t('nwTotal')}</span></span></div>
        <div class="spec"><span class="spec-lbl">${t('floorArea')}</span>
          <span class="spec-val">${d.areaRange[0] ?? '?'}${d.areaRange[1] !== d.areaRange[0] ? '–' + d.areaRange[1] : ''} m²</span></div>
        <div class="spec" data-tip="${escAttr(nwWhy(d, 'running'))}"><span class="spec-lbl">${t('feesMonth')}</span>
          <span class="spec-val">${d.fees ? '~' + yen(d.fees) : t('nwTBD')}</span></div>
        <div class="spec" data-tip="${escAttr(t('nwUpfrontTip'))}"><span class="spec-lbl">${t('nwUpfront')}</span>
          <span class="spec-val">${d.upfront ? '~' + yen(d.upfront) : d.kind === 'unsold' ? t('nwNone') : t('nwTBD')}</span></div>
        <div class="spec"><span class="spec-lbl">${t('row.parking')}</span>
          <span class="spec-val">${d.parkingSpaces ? `${d.parkingSpaces}${t('nwSpaces')}` : '—'} <span class="spec-sub">${d.parkingFee?.[0] ? yenRange(d.parkingFee) : ''}</span></span></div>
      </div>
      ${stationHTML(d)}
      ${nwSalesHTML(d)}
      ${d.developers.length ? `<div class="nw-sched"><b>${t('nwDev')}</b> ${escHTML(d.developers.join(' · '))}</div>` : ''}
      ${d.schedule ? `<div class="nw-sched" title="${escAttr(d.schedule)}"><b>${t('nwSchedule')}</b> ${escHTML(d.schedule.slice(0, 70))}${d.schedule.length > 70 ? '…' : ''}</div>` : ''}
      ${nwTypesHTML(d)}
      <div class="score-section">
        <div class="score-top">
          <span class="score-heading">${t('scoreBreakdown')}</span>
          <div class="score-num"><span class="score-big ${grade}">${s.total}</span><span class="score-denom">&thinsp;/ 100</span></div>
        </div>
        ${scoreBars(d, NW_SCORE_MAX, nwWhy, 'six nw')}
      </div>
      <div class="tags">${tags.join('')}</div>
      ${cardFoot('new', d.key, d.url)}
    </div>
  </div>`;
}

function nwFiltered(ignoreArea = false) {
  const tg = nw.toggles, sl = nw.sl;
  return newMansions.filter(d => {
    if (!ignoreArea && ms.area !== 'all' && d.group !== ms.area) return false;
    if (d.priceMin && d.priceMin > sl.maxPrice) return false;
    if (d.maxM2 < sl.minM2) return false;
    if (d.monthsToMove != null && d.monthsToMove > sl.maxMove) return false;
    if (tg.has('priced') && !d.priceMin) return false;
    if (tg.has('ready') && d.monthsToMove !== 0) return false;
    if (tg.has('project') && d.kind !== 'project') return false;
    if (tg.has('unsold') && d.kind !== 'unsold') return false;
    if (tg.has('major') && !d.major.length) return false;
    if (tg.has('liqlow') && !(d.liq && !['high', 'mid'].includes(d.liq.level))) return false;
    return true;
  });
}

const NW_SORTS = {
  'score-desc':  (a, b) => b.scores.total - a.scores.total,
  'price-asc':   (a, b) => (a.priceMin ?? 1e9) - (b.priceMin ?? 1e9),
  'ppm-asc':     (a, b) => (a.ppm ?? 1e9) - (b.ppm ?? 1e9),
  'premium-asc': (a, b) => (a.premium ?? 1e9) - (b.premium ?? 1e9),
  'move-asc':    (a, b) => (a.monthsToMove ?? 999) - (b.monthsToMove ?? 999),
  'area-desc':   (a, b) => b.maxM2 - a.maxM2,
  'pace-desc':   (a, b) => (b.pacePerWeek ?? -1) - (a.pacePerWeek ?? -1) || (b.soldWeek ?? -1) - (a.soldWeek ?? -1),
};

function nwRender() {
  const data = nwFiltered().sort(NW_SORTS[nw.sort]);
  document.getElementById('nw-grid').innerHTML = data.length
    ? data.map(nwCardHTML).join('')
    : `<div class="empty"><p>${t(newMansions.some(d => ms.area === 'all' || d.group === ms.area) ? 'emptyMs' : 'nwNoneInArea')}</p></div>`;
  document.getElementById('nw-res-count').textContent = data.length;
  tabCounts.apartments = data.length;
  refreshHeader();
}

function initNew() {
  const prices = newMansions.map(d => d.priceMax || d.priceMin).filter(Boolean);
  const maxP = prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 10000;
  const minP = newMansions.map(d => d.priceMin).filter(Boolean);
  const moves = newMansions.map(d => d.monthsToMove).filter(v => v != null);
  const maxMove = Math.max(12, ...moves);
  nw.sl = makeSliders('nw-sliders', 'nwSliders', [
    { key: 'maxPrice', label: 'maxPrice', min: minP.length ? Math.floor(Math.min(...minP) / 100) * 100 : 0, max: maxP, step: 100, value: maxP, fmt: 'fmtMaxPrice' },
    { key: 'minM2',    label: 'minSize',  min: 30, max: 120, step: 1, value: 30, fmt: 'fmtMinM2' },
    { key: 'maxMove',  label: 'nwMoveBy', min: 0, max: maxMove, step: 1, value: maxMove, fmt: 'nwFmtMove' },
  ], () => { renderSubcats(); nwRender(); });
  document.getElementById('nw-toggle-chips').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    btn.classList.toggle('active') ? nw.toggles.add(btn.dataset.v) : nw.toggles.delete(btn.dataset.v);
    renderSubcats(); nwRender();
  });
  document.getElementById('nw-sort-sel').addEventListener('change', e => { nw.sort = e.target.value; nwRender(); });
}

/* Used | New switch (per area) */
function renderCat() {
  const inArea = list => list.filter(d => ms.area === 'all' || d.group === ms.area).length;
  document.getElementById('ms-cat').innerHTML = ['used', 'new'].map(c =>
    `<button type="button" role="tab" class="cat-btn${ms.cat === c ? ' active' : ''}" data-cat="${c}">${t('cat_' + c)}
      <span class="n">${inArea(c === 'new' ? newMansions : mansions)}</span></button>`).join('');
  document.getElementById('ms-cat-note').textContent = ms.cat === 'new' ? t('nwCatNote') : '';
  document.getElementById('ms-used').hidden = ms.cat !== 'used';
  document.getElementById('ms-new').hidden = ms.cat !== 'new';
}

function renderApartments() {
  renderSubcats();
  renderCat();
  ms.cat === 'new' ? nwRender() : msRender();
}

/* ═══════════════════════════════════════════════
   HEADER · TABS · THEME · LANGUAGE
═══════════════════════════════════════════════ */
function refreshHeader() {
  const tab = document.querySelector('.tab-btn.active').dataset.tab;
  document.getElementById('hdr-count').innerHTML = tab === 'apartments'
    ? t('hdrCount', tabCounts.apartments, 'ms') : t('hdrCount', tabCounts.listings, 'house');
}

function applyStaticText() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-area]').forEach(el => {
    const d = mansions.find(x => x.areaKey === el.dataset.area);
    if (d) el.textContent = areaName(d);
  });
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === LANG));
}

function setLang(lang) {
  LANG = lang;
  try { localStorage.setItem('lang', lang); } catch (e) {}
  applyStaticText();
  sliderSets.forEach(relabel => relabel());
  render();
  renderApartments();
  renderTray();
  if (!document.getElementById('cmp-modal').hidden) renderCompare();
  resetCharts();
}

function initChrome() {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'trends') initCharts();
    refreshHeader();
  }));

  const html = document.documentElement;
  try { if (localStorage.getItem('theme') === 'light') html.classList.add('light'); } catch (e) {}
  document.getElementById('theme-btn').addEventListener('click', () => {
    const isLight = html.classList.toggle('light');
    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) {}
    resetCharts();
  });

  document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.lang !== LANG) setLang(b.dataset.lang);
  }));
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
newMansions.forEach((d, i) => Object.assign(d, { id: i, price: d.priceMin, imageUrl: d.image, suumoUrl: d.url }));
applyStaticText();
initTips();
initChrome();
initHouses();
initApartments();
initNew();
initCompare();
render();
renderApartments();
