/* ═══════════════════════════════════════════════
   LOAN — one set of loan settings for the whole site (cards, compare, Deep look) + the Loan tab
   (simulator, rate-rise table, borrowing estimate, rate snapshot, guide).
   Settings: localStorage 'loanCfg' (JSON). 'loanRate' is kept in sync for older code.
   Rates: snapshot of October 2026 from reports/Home loan research.md — refresh monthly.
════════════════════════════════════════════════ */
const LN_RATES_DATE = '2026-10';
// pr: true = these rates usually need Japanese nationality or permanent residency
const LN_PRESETS = [
  { id: 'v_np',   rate: 1.525, pr: false },              // SMBC variable — a valid residence status is enough
  { id: 'v_low',  rate: 1.2,   pr: true },               // MUFG 1.195 · Mizuho 1.275 · Resona 1.25
  { id: 'v_net',  rate: 1.7,   pr: true },               // online banks 1.58–2.0
  { id: 'f10',    rate: 3.6,   pr: true, fix: 10, rate2: 2.0 },   // 10-year fixed, then variable with a smaller discount
  { id: 'flat35', rate: 3.83,  pr: true, fix: 99 },      // full-term fixed (Flat 35, ≤90% of price)
  { id: 'custom' },
];
// np: can a resident WITHOUT permanent residency apply? yes · cond · spouse · no · ask
const LN_BANKS = [
  { en: 'AEON Bank', ja: 'イオン銀行', v: 0.99, f10: 3.73, np: 'cond', note: 'aeon' },
  { en: 'MUFG', ja: '三菱UFJ銀行', v: 1.195, f10: 3.75, full: '4.18–4.35', np: 'no', note: 'mufg' },
  { en: 'Resona', ja: 'りそな銀行', v: 1.25, f10: 4.205, np: 'ask' },
  { en: 'Mizuho', ja: 'みずほ銀行', v: 1.275, f10: 3.60, np: 'ask', note: 'mizuho' },
  { en: 'Yokohama Bank', ja: '横浜銀行', v: 1.295, np: 'ask', note: 'yokohama' },
  { en: 'SBI Shinsei', ja: 'SBI新生銀行', v: 1.34, f10: 3.38, np: 'spouse', note: 'shinsei' },
  { en: 'Chiba Bank', ja: '千葉銀行', v: 1.50, np: 'ask', note: 'chiba' },
  { en: 'SMBC', ja: '三井住友銀行', v: 1.525, f10: 4.75, np: 'yes', note: 'smbc' },
  { en: 'PayPay Bank', ja: 'PayPay銀行', v: 1.58, np: 'ask', note: 'no125' },
  { en: 'au Jibun Bank', ja: 'auじぶん銀行', v: 1.68, np: 'ask', note: 'jibun' },
  { en: 'Rakuten Bank', ja: '楽天銀行', v: 1.747, full: '3.83', np: 'ask', note: 'rakuten' },
  { en: 'Sony Bank', ja: 'ソニー銀行', v: 1.847, np: 'ask', note: 'no125' },
  { en: 'Docomo SMTB Net Bank', ja: 'ドコモSMTBネット銀行', v: 2.00, f10: 3.379, np: 'ask' },
  { en: 'Tokyo Star Bank', ja: '東京スター銀行', np: 'cond', note: 'tokyostar' },
  { en: 'Flat 35 (JHF)', ja: 'フラット35（住宅金融支援機構）', full: '3.83', np: 'no', note: 'flat35' },
];
// 住宅ローン控除 for a used home (2026 reform): cap ¥万 [normal, child household] and years
const LN_CREDIT = { basic: { cap: [2000, 2000], yrs: 10 }, energy: { cap: [2000, 3000], yrs: 13 }, zeh: { cap: [3500, 4500], yrs: 13 } };
const LN_DEFAULT = {
  price: 5000, down: 10, costs: 7, costsInLoan: false, years: 35, preset: 'v_np', rate: 1.525, rate2: 2.0,
  bonus: 0, method: 'annuity', fees: 30000, feeRise: 0, parking: 0, taxPct: 0.25,
  income: 0, residency: 'visa', credit: 'basic', child: true,
};

let LN = (() => {
  let c = null;
  try { c = JSON.parse(localStorage.getItem('loanCfg') || 'null'); } catch (e) {}
  if (!c) {   // first visit: keep a rate the user typed in the old "Loan %" box (1.0 was the old default)
    c = {};
    try { const r = parseFloat(localStorage.getItem('loanRate')); if (r >= 0 && r <= 10 && r !== 1) Object.assign(c, { rate: r, preset: 'custom' }); } catch (e) {}
  }
  return Object.assign({}, LN_DEFAULT, c);
})();
const lnPreset = id => LN_PRESETS.find(p => p.id === (id || LN.preset)) || LN_PRESETS[LN_PRESETS.length - 1];
const lnFix = () => lnPreset().fix || 0;

function lnSave() {
  try { localStorage.setItem('loanCfg', JSON.stringify(LN)); localStorage.setItem('loanRate', String(LN.rate)); } catch (e) {}
}
function lnSet(patch, from) {
  Object.assign(LN, patch);
  lnSave();
  if (typeof loanChanged === 'function') loanChanged(from);   // app.js re-renders cards
  if (from !== 'tab') lnSyncInputs();
  lnRender();
}

/* ── maths ── */
const lnAnn = (P, i, n) => n <= 0 ? 0 : i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;   // payment per period
const lnPV = (pay, i, n) => i ? pay * (1 - Math.pow(1 + i, -n)) / i : pay * n;

// First payments (closed form) — cheap enough for sorting thousands of cards
function lnFirst(loan, rate, c = LN) {
  const n = c.years * 12, b = c.bonus / 100, Lm = loan * (1 - b), Lb = loan * b;
  if (c.method === 'principal') {
    const m = Lm / n + Lm * rate / 1200, bo = Lb ? Lb / (c.years * 2) + Lb * rate / 200 : 0;
    return { m, b: bo, avg: m + bo / 6 };
  }
  const m = lnAnn(Lm, rate / 1200, n), bo = lnAnn(Lb, rate / 200, c.years * 2);
  return { m, b: bo, avg: m + bo / 6 };
}

// Full schedule (simulator): fixed period → rate2; optional shock (+pts from year `from`)
function lnSchedule(loan, c = LN, shock = 0, from = 0) {
  const n = c.years * 12, b = c.bonus / 100, fix = lnFix();
  let Lm = loan * (1 - b), Lb = loan * b;
  const prinM = Lm / n, prinB = Lb / (c.years * 2);
  let r = null, payM = 0, payB = 0, interest = 0;
  const out = { bal: [loan], int: [0], payAt: [], first: null };
  for (let m = 0; m < n; m++) {
    let rr = fix && fix < 99 && m >= fix * 12 ? c.rate2 : c.rate;
    if (shock && m >= from * 12 && !(fix >= 99) && !(fix && m < fix * 12)) rr += shock;
    if (rr !== r) {   // a new rate: payments are recalculated on what is left (no 5-year / 125% rule)
      r = rr;
      payM = lnAnn(Lm, r / 1200, n - m);
      payB = lnAnn(Lb, r / 200, Math.ceil((n - m) / 6));
    }
    const im = Lm * r / 1200, pm = c.method === 'principal' ? prinM + im : payM;
    Lm = Math.max(0, Lm - (pm - im)); interest += im;
    let pb = 0;
    if (m % 6 === 5 && Lb > 0) {
      const ib = Lb * r / 200; pb = c.method === 'principal' ? prinB + ib : payB;
      Lb = Math.max(0, Lb - (pb - ib)); interest += ib;
    }
    if (m % 12 === 0) out.payAt.push(pm);
    if (!out.first) out.first = { m: pm, b: c.bonus ? (c.method === 'principal' ? prinB + loan * b * r / 200 : payB) : 0 };
    if (m % 12 === 11) { out.bal.push(Lm + Lb); out.int.push(interest); }
  }
  out.interest = interest;
  return out;
}

/* ── per listing (cards, compare, tooltips) ── */
function lnLoanFor(priceMan) {
  const P = priceMan * 10000;
  return Math.max(0, P * (1 - LN.down / 100) + (LN.costsInLoan ? P * LN.costs / 100 : 0));
}
function lnAllIn(priceMan, fees = 0) {
  const loan = lnLoanFor(priceMan), f = lnFirst(loan, LN.rate);
  const tax = priceMan * 10000 * LN.taxPct / 100 / 12, park = LN.parking || 0;
  const total = f.avg + (fees || 0) + park + tax;
  const fixed = lnFix();
  const up1 = fixed ? null : lnFirst(loan, LN.rate + 1).avg - f.avg;
  return { loan, pay: f.m, bonus: f.b, avg: f.avg, fees: fees || 0, park, tax, total, up1, fixed };
}
const lnYen = v => t('yen', v);
const lnPresetName = id => t('ln.p.' + id);
function lnTip(priceMan, fees) {
  const a = lnAllIn(priceMan, fees);
  return t('ln.tip', {
    price: t('price', priceMan), down: LN.down, loan: lnYen(a.loan), years: LN.years, rate: LN.rate, preset: lnPresetName(LN.preset),
    pay: lnYen(a.avg), bonus: a.bonus ? lnYen(a.bonus) : '', fees: a.fees ? lnYen(a.fees) : '', park: a.park ? lnYen(a.park) : '',
    tax: lnYen(a.tax), taxPct: LN.taxPct, total: lnYen(a.total), up1: a.up1 != null ? lnYen(a.up1) : '', fixed: a.fixed,
  });
}
// "≈ ¥X/month all-in · +1%: +¥Y" line for house / new-condo cards
function lnCardLine(priceMan, fees) {
  if (!priceMan) return '';
  const a = lnAllIn(priceMan, fees);
  return `<div class="ln-line" data-tip="${String(lnTip(priceMan, fees)).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${t('ln.cardLine', lnYen(a.total))}${
    a.up1 != null ? ` <span class="ln-up">${t('ln.up1', lnYen(a.up1))}</span>` : ` <span class="ln-up">${t('ln.fixedTag')}</span>`}</div>`;
}
const lnSub = a => a.up1 != null ? t('ln.up1', lnYen(a.up1)) : t('ln.fixedTag');

/* ── the Loan tab ── */
const lnEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lnPct = v => (Math.round(v * 10) / 10).toLocaleString() + '%';
const lnMan = v => !v ? '0' : LANG === 'ja' ? (v >= 10000 ? `${Math.floor(v / 10000)}億${v % 10000 ? (Math.round(v % 10000)).toLocaleString() + '万' : ''}円` : `${Math.round(v).toLocaleString()}万円`)
                                 : `¥${(v / 100).toFixed(v >= 1000 ? 0 : 1)}M`;

function lnField(k, type, opts = {}) {
  const v = LN[k];
  if (type === 'select') return `<select data-k="${k}">${opts.list.map(([val, lbl]) =>
    `<option value="${val}"${String(val) === String(v) ? ' selected' : ''}>${lnEsc(lbl)}</option>`).join('')}</select>`;
  if (type === 'check') return `<input type="checkbox" data-k="${k}"${v ? ' checked' : ''}>`;
  return `<input type="number" inputmode="decimal" data-k="${k}" value="${v}" min="${opts.min ?? 0}" max="${opts.max ?? ''}" step="${opts.step ?? 1}">`;
}
const lnRow = (label, field, unit = '', hint = '') =>
  `<label class="ln-f"><span class="ln-l">${label}${hint ? `<small>${hint}</small>` : ''}</span><span class="ln-v">${field}${unit ? `<em>${unit}</em>` : ''}</span></label>`;

function lnShell() {
  const root = document.getElementById('ln-root');
  if (!root) return;
  const P = k => t('ln.' + k);
  root.innerHTML = `
  <div class="ln-top"><h2 class="ln-h">${P('title')}</h2><button type="button" class="ln-print" id="ln-print">${P('print')}</button></div>
  <p class="ln-lead">${P('lead')}</p>
  <div class="ln-grid">
    <form class="ln-in" onsubmit="return false">
      <fieldset><legend>${P('gHome')}</legend>
        ${lnRow(P('price'), lnField('price', 'num', { step: 10, max: 100000 }), P('man'), P('priceHint'))}
        ${lnRow(P('down'), lnField('down', 'num', { max: 100, step: 1 }), '%', '<span id="ln-down-y"></span>')}
        ${lnRow(P('costs'), lnField('costs', 'num', { max: 15, step: 0.5 }), '%', P('costsHint'))}
        ${lnRow(P('costsInLoan'), lnField('costsInLoan', 'check'))}
      </fieldset>
      <fieldset><legend>${P('gLoan')}</legend>
        ${lnRow(P('preset'), lnField('preset', 'select', { list: LN_PRESETS.map(p => [p.id, lnPresetName(p.id) + (p.rate ? ` — ${p.rate}%` : '')]) }))}
        ${lnRow(P('rate'), lnField('rate', 'num', { max: 10, step: 0.005 }), '%')}
        <div id="ln-rate2-row">${lnRow(P('rate2'), lnField('rate2', 'num', { max: 10, step: 0.05 }), '%', P('rate2Hint'))}</div>
        ${lnRow(P('years'), lnField('years', 'num', { min: 5, max: 50 }), P('yrs'))}
        ${lnRow(P('bonus'), lnField('bonus', 'num', { max: 50, step: 5 }), '%', P('bonusHint'))}
        ${lnRow(P('method'), lnField('method', 'select', { list: [['annuity', P('mAnn')], ['principal', P('mPrin')]] }))}
      </fieldset>
      <fieldset><legend>${P('gMonthly')}</legend>
        ${lnRow(P('fees'), lnField('fees', 'num', { step: 1000, max: 500000 }), P('yenMo'), P('feesHint'))}
        ${lnRow(P('feeRise'), lnField('feeRise', 'num', { max: 200, step: 10 }), '%', P('feeRiseHint'))}
        ${lnRow(P('parking'), lnField('parking', 'num', { step: 1000, max: 100000 }), P('yenMo'))}
        ${lnRow(P('taxPct'), lnField('taxPct', 'num', { max: 2, step: 0.05 }), P('pctYr'), P('taxHint'))}
      </fieldset>
      <fieldset><legend>${P('gYou')}</legend>
        ${lnRow(P('income'), lnField('income', 'num', { step: 50, max: 10000 }), P('man'), P('incomeHint'))}
        ${lnRow(P('residency'), lnField('residency', 'select', { list: [['visa', P('resVisa')], ['pr', P('resPR')]] }))}
        ${lnRow(P('credit'), lnField('credit', 'select', { list: [['basic', P('crBasic')], ['energy', P('crEnergy')], ['zeh', P('crZeh')]] }))}
        ${lnRow(P('child'), lnField('child', 'check'), '', P('childHint'))}
      </fieldset>
    </form>
    <div class="ln-out" id="ln-out"></div>
  </div>
  <section class="ln-sec"><h3>${P('hShock')}</h3><p class="ln-note">${P('shockNote')}</p><div id="ln-shock"></div></section>
  <section class="ln-sec"><h3>${P('hTypes')}</h3><p class="ln-note">${P('typesNote')}</p><div id="ln-types"></div></section>
  <section class="ln-sec"><h3>${P('hBorrow')}</h3><div id="ln-borrow"></div></section>
  <section class="ln-sec"><h3>${P('hBal')}</h3><div id="ln-bal"></div></section>
  <section class="ln-sec ln-break"><h3>${P('hRates', LN_RATES_DATE)}</h3><p class="ln-note">${P('ratesNote')}</p><div id="ln-rates"></div></section>
  <section class="ln-sec ln-guide"><h3>${P('hGuide')}</h3>${P('guide')}</section>
  <p class="ln-src">${P('sources')}</p>`;

  root.querySelector('.ln-in').addEventListener('input', e => {
    const el = e.target.closest('[data-k]'); if (!el) return;
    const k = el.dataset.k;
    let v = el.type === 'checkbox' ? el.checked : el.tagName === 'SELECT' ? el.value : parseFloat(el.value);
    if (typeof v === 'number' && !isFinite(v)) return;
    const patch = { [k]: v };
    if (k === 'preset' && v !== 'custom') { const p = lnPreset(v); patch.rate = p.rate; if (p.rate2) patch.rate2 = p.rate2; }
    if (k === 'rate') { const p = LN_PRESETS.find(x => x.rate === v); patch.preset = p ? p.id : 'custom'; }
    if (k === 'years') patch.years = Math.max(5, Math.min(50, Math.round(v)));
    lnSet(patch, 'tab');
    if (k === 'preset' || k === 'rate') lnSyncInputs(['rate', 'preset', 'rate2']);
  });
  document.getElementById('ln-print').addEventListener('click', () => {
    document.documentElement.classList.add('print-loan');
    root.querySelectorAll('details').forEach(d => { d.dataset.wasOpen = d.open ? '1' : ''; d.open = true; });
    window.print();
  });
  window.addEventListener('afterprint', () => {
    document.documentElement.classList.remove('print-loan');
    root.querySelectorAll('details').forEach(d => { d.open = !!d.dataset.wasOpen; });
  });
  lnRender();
}

function lnSyncInputs(keys) {
  document.querySelectorAll('#ln-root [data-k]').forEach(el => {
    const k = el.dataset.k;
    if (keys && !keys.includes(k)) return;
    if (el.type === 'checkbox') el.checked = !!LN[k]; else if (document.activeElement !== el || keys) el.value = LN[k];
  });
}

function lnRender() {
  const out = document.getElementById('ln-out');
  if (!out) return;
  const P = (k, ...a) => t('ln.' + k, ...a);
  const price = LN.price || 0, Pyen = price * 10000;
  const loan = lnLoanFor(price), s = lnSchedule(loan);
  const a = lnAllIn(price, LN.fees);
  const pre = lnPreset(), fix = lnFix();
  const cash = Pyen * LN.down / 100 + (LN.costsInLoan ? 0 : Pyen * LN.costs / 100);
  const gross = (LN.income || 0) * 10000, grossM = gross / 12;
  document.getElementById('ln-rate2-row').hidden = !(fix && fix < 99);
  const dy = document.getElementById('ln-down-y'); if (dy) dy.textContent = lnYen(Pyen * LN.down / 100);

  // tax credit
  const cr = LN_CREDIT[LN.credit] || LN_CREDIT.basic, cap = cr.cap[LN.child ? 1 : 0] * 10000;
  const credits = s.bal.slice(1, cr.yrs + 1).map(b => Math.min(b, cap) * 0.007);
  const creditSum = credits.reduce((x, y) => x + y, 0);
  const int10 = s.int[Math.min(cr.yrs, s.int.length - 1)];
  const warnPR = LN.residency === 'visa' && pre.pr;

  out.innerHTML = `
    <div class="ln-big"><small>${P('allIn')}</small><b>${lnYen(a.total)}</b><span>${P('perMonth')}</span></div>
    ${warnPR ? `<p class="ln-warn">${P('warnPR')}</p>` : ''}
    <ul class="ln-brk">
      <li><span>${P('oLoan', LN.years, LN.rate)}</span><b>${lnYen(s.first.m)}</b></li>
      ${LN.bonus ? `<li><span>${P('oBonus')}</span><b>${lnYen(s.first.b)}</b></li>` : ''}
      <li><span>${P('fees')}</span><b>${lnYen(LN.fees || 0)}</b></li>
      ${LN.parking ? `<li><span>${P('parking')}</span><b>${lnYen(LN.parking)}</b></li>` : ''}
      <li><span>${P('oTax', LN.taxPct)}</span><b>${lnYen(a.tax)}</b></li>
      <li class="tot"><span>${P('allIn')}</span><b>${lnYen(a.total)}</b></li>
      ${a.up1 != null ? `<li class="up"><span>${P('oUp1')}</span><b>+${lnYen(a.up1)}</b></li>` : `<li class="up"><span>${P('oFixed')}</span><b>—</b></li>`}
      ${grossM ? `<li><span>${P('oShare')}</span><b>${lnPct(a.total / grossM * 100)}</b></li>` : ''}
    </ul>
    <ul class="ln-brk ln-k">
      <li><span>${P('oLoanAmt')}</span><b>${lnYen(loan)}</b></li>
      <li><span>${P('oLtv')}</span><b>${lnPct(Pyen ? loan / Pyen * 100 : 0)}</b></li>
      <li><span>${P('oCash')}</span><b>${lnYen(cash)}</b></li>
      <li><span>${P('oInt')}</span><b>${lnYen(s.interest)}</b></li>
      <li><span>${P('oTotal')}</span><b>${lnYen(loan + s.interest)}</b></li>
      <li><span>${P('oCredit', cr.yrs, cap / 10000)}</span><b>${lnYen(creditSum)}</b></li>
      <li><span>${P('oNet', cr.yrs)}</span><b>${lnYen(int10 - creditSum)}</b></li>
    </ul>
    ${LN.feeRise ? `<p class="ln-note">${P('feeRiseOut', lnYen((LN.fees || 0) * (1 + LN.feeRise / 100)))}</p>` : ''}
    <p class="ln-note">${P('creditNote')}</p>`;

  // rate-rise table
  const take = grossM * 0.75, comfort = take * 0.25;
  const fixedNow = fix >= 99;
  const rows = [0.5, 1, 2].map(d => {
    const s0 = lnSchedule(loan, LN, d, 0), s5 = lnSchedule(loan, LN, d, 5);
    const p0 = s0.payAt[0] - s.payAt[0], p5 = (s5.payAt[5] ?? 0) - (s.payAt[5] ?? 0);
    return `<tr><th>+${d}${P('pts')}</th><td>${fixedNow ? '—' : `${lnYen(s0.payAt[0])} <small>(+${lnYen(p0)})</small>`}</td>
      <td>${fixedNow ? '—' : `${lnYen(s5.payAt[5] ?? 0)} <small>(+${lnYen(p5)})</small>`}</td><td>${fixedNow ? '—' : lnYen(s0.interest)}</td>
      ${grossM ? `<td>${fixedNow ? '—' : lnPct((a.total + p0) / grossM * 100)}</td>` : ''}</tr>`;
  }).join('');
  let brk = '';
  if (grossM && !fixedNow) {
    const other = a.total - a.avg;
    if (a.total > comfort) brk = P('brkOver', lnYen(comfort));
    else {
      let lo = LN.rate, hi = LN.rate + 15;
      for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; (lnFirst(loan, mid).avg + other > comfort) ? hi = mid : lo = mid; }
      brk = P('brk', lnYen(comfort), lo.toFixed(2));
    }
  }
  document.getElementById('ln-shock').innerHTML = (fixedNow ? `<p class="ln-note">${P('shockFixed')}</p>` : '') + `
    <div class="ln-tw"><table class="ln-t"><thead><tr><th></th><th>${P('tFromNow')}</th><th>${P('tFrom6')}</th><th>${P('tIntAll')}</th>${grossM ? `<th>${P('tShare')}</th>` : ''}</tr></thead>
    <tbody><tr class="now"><th>${P('today')} ${LN.rate}%</th><td>${lnYen(s.payAt[0])}</td><td>${lnYen(s.payAt[5] ?? 0)}</td><td>${lnYen(s.interest)}</td>${grossM ? `<td>${lnPct(a.total / grossM * 100)}</td>` : ''}</tr>${rows}</tbody></table></div>
    ${brk ? `<p class="ln-note">${brk}</p>` : ''}${fix && fix < 99 ? `<p class="ln-note">${P('shockF10')}</p>` : ''}`;

  // loan types side by side
  document.getElementById('ln-types').innerHTML = `<div class="ln-tw"><table class="ln-t"><thead><tr><th></th><th>${P('rate')}</th><th>${P('tMonthly')}</th><th>${P('tIntAll')}</th><th>${P('tUp1')}</th></tr></thead><tbody>${
    LN_PRESETS.filter(p => p.rate).map(p => {
      const c = Object.assign({}, LN, { preset: p.id, rate: p.rate, rate2: p.rate2 || LN.rate2 });
      const save = LN; LN = c; const ss = lnSchedule(loan, c), s1 = lnSchedule(loan, c, 1, 0); LN = save;
      const f = p.fix || 0;
      return `<tr${p.id === LN.preset ? ' class="now"' : ''}><th>${lnEsc(lnPresetName(p.id))}${LN.residency === 'visa' && p.pr ? ` <span class="ln-pr">${P('needsPR')}</span>` : ''}</th>
        <td>${p.rate}%${f && f < 99 ? ` → ${c.rate2}%` : ''}</td><td>${lnYen(ss.payAt[0])}</td><td>${lnYen(ss.interest)}</td>
        <td>${f >= 99 ? P('protected') : f ? P('afterN', f, '+' + lnYen((s1.payAt[f] ?? 0) - (ss.payAt[f] ?? 0))) : '+' + lnYen(s1.payAt[0] - ss.payAt[0])}</td></tr>`;
    }).join('')}</tbody></table></div>`;

  // what can we borrow
  const bEl = document.getElementById('ln-borrow');
  if (!gross) bEl.innerHTML = `<p class="ln-note">${P('borrowNeed')}</p>`;
  else {
    const n = LN.years * 12;
    const cells = [3.0, 3.5, 4.0].map(sr => [30, 35].map(q => lnPV(gross * q / 100 / 12, sr / 1200, n)));
    const otherNoTax = (LN.fees || 0) + (LN.parking || 0);
    const comfortPay = comfort - otherNoTax;
    // comfortable: price where all-in (incl. tax) ≤ comfort with +1.5 pts headroom on the rate
    let lo = 0, hi = 100000;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2, l = mid * 10000 * (1 - LN.down / 100) + (LN.costsInLoan ? mid * 10000 * LN.costs / 100 : 0);
      (lnFirst(l, LN.rate + 1.5).avg + otherNoTax + mid * 10000 * LN.taxPct / 1200 > comfort) ? hi = mid : lo = mid;
    }
    bEl.innerHTML = `<div class="ln-tw"><table class="ln-t"><thead><tr><th>${P('tScreen')}</th><th>${P('tRatio', 30)}</th><th>${P('tRatio', 35)}</th></tr></thead><tbody>${
      [3.0, 3.5, 4.0].map((sr, i) => `<tr><th>${sr.toFixed(1)}%</th><td>${lnMan(cells[i][0] / 10000)}</td><td>${lnMan(cells[i][1] / 10000)}</td></tr>`).join('')}</tbody></table></div>
      <p class="ln-note">${P('borrowNote', LN.years)}</p>
      <div class="ln-comfort">${comfortPay > 0 ? P('comfort', lnMan(Math.floor(lo / 10) * 10), lnYen(comfort), (LN.rate + 1.5).toFixed(2)) : P('comfortNone', lnYen(comfort))}</div>`;
  }

  // balance chart + milestones
  const W = 640, H = 200, padL = 44, padB = 22, N = s.bal.length - 1, maxB = Math.max(loan, 1);
  const x = y => padL + (W - padL - 8) * y / N, yv = v => 8 + (H - padB - 8) * (1 - v / maxB);
  const path = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${yv(Math.min(v, maxB)).toFixed(1)}`).join('');
  const ticks = [0, 0.5, 1].map(f => `<text x="${padL - 6}" y="${yv(maxB * f) + 4}" text-anchor="end">${lnMan(maxB * f / 10000)}</text><line x1="${padL}" x2="${W - 8}" y1="${yv(maxB * f)}" y2="${yv(maxB * f)}"/>`).join('');
  const xt = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].filter(v => v <= N).map(v => `<text x="${x(v)}" y="${H - 6}" text-anchor="middle">${v}</text>`).join('');
  const crX = x(Math.min(cr.yrs, N));
  const ms = [1, 5, 10, cr.yrs, 15, 20, 25, 30, 35, 40, 50].filter((v, i, arr) => v <= N && arr.indexOf(v) === i).sort((p, q) => p - q);
  document.getElementById('ln-bal').innerHTML = `
    <svg class="ln-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${lnEsc(P('hBal'))}">
      <g class="ax">${ticks}${xt}</g>
      <rect x="${padL}" y="8" width="${crX - padL}" height="${H - padB - 8}" class="cr"/>
      <path d="${path(s.int)}" class="li"/><path d="${path(s.bal)}" class="lb"/>
    </svg>
    <div class="ln-leg"><span class="lb">${P('legBal')}</span><span class="li">${P('legInt')}</span><span class="cr">${P('legCredit', cr.yrs)}</span></div>
    <div class="ln-tw"><table class="ln-t"><thead><tr><th>${P('tYear')}</th><th>${P('tBal')}</th><th>${P('tIntCum')}</th><th>${P('tCredit')}</th></tr></thead><tbody>${
      ms.map(y => `<tr><th>${y}</th><td>${lnYen(s.bal[y])}</td><td>${lnYen(s.int[y])}</td><td>${y <= cr.yrs ? lnYen(credits[y - 1] || 0) : '—'}</td></tr>`).join('')}</tbody></table></div>`;

  // rate snapshot
  const np = LN.residency === 'visa';
  document.getElementById('ln-rates').innerHTML = `<div class="ln-tw"><table class="ln-t ln-rt"><thead><tr><th>${P('tLender')}</th><th>${P('tVar')}</th><th>${P('tF10')}</th><th>${P('tFull')}</th><th>${P('tNP')}</th><th>${P('tNote')}</th></tr></thead><tbody>${
    LN_BANKS.map(b => `<tr class="${np && b.np === 'no' ? 'dim' : ''}${np && (b.np === 'yes' || b.np === 'cond' || b.np === 'spouse') ? ' hi' : ''}">
      <th>${lnEsc(LANG === 'ja' ? b.ja : b.en)}</th><td>${b.v ? b.v + '%' : '–'}</td><td>${b.f10 ? b.f10 + '%' : '–'}</td><td>${b.full ? b.full + '%' : '–'}</td>
      <td class="np-${b.np}">${P('np.' + b.np)}</td><td>${b.note ? P('bn.' + b.note) : ''}</td></tr>`).join('')}</tbody></table></div>`;
}

function lnOpenTab(priceMan, fees) {
  if (priceMan) lnSet({ price: Math.round(priceMan), fees: fees != null ? Math.round(fees) : LN.fees });
  const b = document.querySelector('.tab-btn[data-tab="loan"]');
  if (b && !b.classList.contains('active')) b.click();
  try { window.history.replaceState(null, '', '#loan'); } catch (e) {}
  document.getElementById('panel-loan')?.scrollIntoView({ behavior: 'smooth' });
}
function lnSetLang() { lnShell(); }
function initLoan() {
  lnShell();
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ln]'); if (!b) return;
    e.preventDefault();
    const [p, f] = b.dataset.ln.split('|');
    lnOpenTab(parseFloat(p), f === '' || f == null ? null : parseFloat(f));
  });
  if (location.hash === '#loan') lnOpenTab();
}
