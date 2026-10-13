/* ═══════════════════════════════════════════════
   DEEP LOOK — paste a SUUMO used-condo link → GitHub runs deeplook.py → printable report
   Trigger: a pre-filled GitHub issue (workflow .github/workflows/deep-look.yml runs on "issue opened"
   by the repo owner, commits deeplook/<id>.html, comments + closes the issue, sends Telegram).
   The page polls deeplook/index.json until the new report appears.
════════════════════════════════════════════════ */
const DL_REPO = 'UmbaSimpy/japan-house-compare';
const DL_URL_RE = /https:\/\/suumo\.jp\/ms\/chuko\/[a-z0-9_]+\/sc_[a-z0-9_]+\/nc_(\d+)\/?/;
const DL = { items: [], wait: null, timer: null };

const dlEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dlMan = v => v == null ? '–' : (LANG === 'ja' ? `${v.toLocaleString()}万円` : `¥${(v / 100).toFixed(1)}M`);

function dlOffices() { return (typeof MAP_DATA !== 'undefined' && MAP_DATA.commute?.offices) || [{ id: 'tokyo', en: 'Tokyo Stn', ja: '東京' }]; }
function dlDefaultOffice() {
  try { const p = JSON.parse(localStorage.getItem('mpPrefs') || 'null'); if (p?.office) return p.office; } catch (e) {}
  return 'tokyo';
}
function dlLoan() {   // the Loan tab's settings (loan.js), sent to the GitHub run in the issue body
  const c = typeof LN !== 'undefined' ? LN : { rate: 1.525, down: 10, years: 35, taxPct: 0.25 };
  return `rate: ${c.rate}\ndown: ${c.down}\nyears: ${c.years}\ntax: ${c.taxPct}`;
}

function dlShell() {
  const root = document.getElementById('dl-root');
  if (!root || root.dataset.built) return;
  root.dataset.built = '1';
  const off = dlDefaultOffice();
  root.innerHTML = `
    <h2 class="dl-h">${t('dl.title')}</h2>
    <p class="dl-lead">${t('dl.lead')}</p>
    <div class="dl-form">
      <input id="dl-url" type="url" inputmode="url" autocomplete="off" placeholder="https://suumo.jp/ms/chuko/…/nc_12345678/">
      <label class="dl-off"><span>${t('dl.office')}</span><select id="dl-office">${dlOffices().map(o =>
        `<option value="${dlEsc(o.id)}"${o.id === off ? ' selected' : ''}>${dlEsc(LANG === 'ja' ? o.ja : o.en)}</option>`).join('')}</select></label>
      <button id="dl-go" type="button" class="dl-go">${t('dl.go')}</button>
    </div>
    <p class="dl-how">${t('dl.how', DL_REPO)}</p>
    <div id="dl-status" class="dl-status" hidden></div>
    <h3 class="dl-sub">${t('dl.done')}</h3>
    <div id="dl-list" class="dl-list"></div>`;
  document.getElementById('dl-go').addEventListener('click', dlGo);
  document.getElementById('dl-url').addEventListener('keydown', e => { if (e.key === 'Enter') dlGo(); });
}

async function dlLoad() {
  try {
    const r = await fetch('deeplook/index.json?t=' + Date.now(), { cache: 'no-store' });
    DL.items = r.ok ? (await r.json()).items || [] : [];
  } catch (e) { DL.items = []; }
  dlRenderList();
  if (typeof refreshHeader === 'function' && document.querySelector('.tab-btn.active')?.dataset.tab === 'deeplook') refreshHeader();
}

function dlRenderList() {
  const el = document.getElementById('dl-list');
  if (!el) return;
  if (!DL.items.length) { el.innerHTML = `<p class="dl-empty">${t('dl.none')}</p>`; return; }
  const offName = id => { const o = dlOffices().find(x => x.id === id); return o ? (LANG === 'ja' ? o.ja : o.en) : id; };
  el.innerHTML = DL.items.map(i => {
    const c = i.counts || {};
    return `<div class="dl-card">
      <a class="dl-name" href="deeplook/${dlEsc(i.id)}.html">${dlEsc(i.name)}</a>
      <div class="dl-meta">${dlEsc((LANG === 'ja' ? i.areaJa : i.area) || i.area || '')} · ${dlMan(i.price)} · ${i.m2 ?? '–'}${LANG === 'ja' ? '㎡' : ' m²'} · ${i.year ?? '–'}${LANG === 'ja' ? '年築' : ''}${i.commute ? ` · ${t('dl.min', i.commute, offName(i.office))}` : ''}</div>
      <div class="dl-cnt">${c.risk ? `<span class="r">${t('dl.risk', c.risk)}</span>` : ''}${c.watch ? `<span class="w">${t('dl.watch', c.watch)}</span>` : ''}${c.ask ? `<span class="a">${t('dl.ask', c.ask)}</span>` : ''}${c.good ? `<span class="g">${t('dl.good', c.good)}</span>` : ''}</div>
      <div class="dl-foot"><span>${dlEsc(i.date)}</span>
        <a href="deeplook/${dlEsc(i.id)}.html">${t('dl.open')}</a>
        <a href="${dlEsc(i.url)}" target="_blank" rel="noopener">SUUMO</a>
        <button type="button" data-dlre="${dlEsc(i.url)}">${t('dl.rerun')}</button></div>
    </div>`;
  }).join('');
  el.querySelectorAll('[data-dlre]').forEach(b => b.addEventListener('click', () => {
    document.getElementById('dl-url').value = b.dataset.dlre;
    document.getElementById('dl-url').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}

function dlStatus(html) {
  const s = document.getElementById('dl-status');
  s.hidden = !html; s.innerHTML = html || '';
}

function dlGo() {
  const raw = document.getElementById('dl-url').value.trim();
  const m = raw.match(DL_URL_RE);
  if (!m) { dlStatus(`<b class="err">${t('dl.bad')}</b>`); return; }
  const url = m[0].endsWith('/') ? m[0] : m[0] + '/';
  const office = document.getElementById('dl-office').value;
  const body = `${url}\n\noffice: ${office}\n${dlLoan()}\n\n${t('dl.issueNote')}`;
  const link = `https://github.com/${DL_REPO}/issues/new?title=${encodeURIComponent('Deep look ' + m[1])}&body=${encodeURIComponent(body)}`;
  window.open(link, '_blank', 'noopener');
  DL.wait = { id: m[1], since: new Date().toISOString(), t0: Date.now() };
  clearInterval(DL.timer);
  DL.timer = setInterval(dlPoll, 20000);
  dlPoll();
}

async function dlPoll() {
  if (!DL.wait) return;
  const secs = Math.round((Date.now() - DL.wait.t0) / 1000);
  const actions = `https://github.com/${DL_REPO}/actions/workflows/deep-look.yml`;
  await dlLoad();
  const hit = DL.items.find(i => i.id === DL.wait.id && (i.ts || '') > DL.wait.since);
  if (hit) {
    clearInterval(DL.timer); DL.wait = null;
    dlStatus(`<b class="ok">${t('dl.ready')}</b> <a href="deeplook/${dlEsc(hit.id)}.html">${dlEsc(hit.name)} →</a>`);
    return;
  }
  if (secs > 15 * 60) {
    clearInterval(DL.timer); DL.wait = null;
    dlStatus(`<b class="err">${t('dl.slow')}</b> <a href="${actions}" target="_blank" rel="noopener">GitHub Actions</a>`);
    return;
  }
  dlStatus(`<span class="dl-spin"></span>${t('dl.waiting', Math.floor(secs / 60), String(secs % 60).padStart(2, '0'))}
    · <a href="${actions}" target="_blank" rel="noopener">${t('dl.progress')}</a>`);
}

function dlHeader() { return t('dl.hdr', DL.items.length); }

function dlOpenTab(url) {
  dlShell();
  if (url) document.getElementById('dl-url').value = url;
  document.querySelector('.tab-btn[data-tab="deeplook"]')?.click();
  window.scrollTo({ top: 0 });
}

function dlSetLang() {
  const root = document.getElementById('dl-root');
  if (!root) return;
  const url = document.getElementById('dl-url')?.value || '';
  delete root.dataset.built;
  dlShell();
  document.getElementById('dl-url').value = url;
  dlRenderList();
}

function initDeepLook() {
  dlShell();
  dlLoad();
  // "Deep look" buttons on condo cards
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dl]');
    if (!b) return;
    e.preventDefault();
    dlOpenTab(b.dataset.dl);
  });
  if (location.hash.startsWith('#deeplook')) dlOpenTab();
}
