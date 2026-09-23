#!/usr/bin/env python3
"""
Sends a Telegram notification after each daily scrape.
Houses:  compares against known_nc_ids.json; scores computed here
         (mirrors the JS scoreSet() function).
Condos:  compares unit keys against known_ms_units.json; scores come
         pre-computed in mansions_clean.json (inject_mansion.py).
New:     compares projects/buildings against known_new.json (new, prices
         announced, price changes, extra never-occupied units).
"""

import json, os, re, urllib.request, urllib.parse
from datetime import date
from pathlib import Path

TOKEN    = os.environ['TELEGRAM_TOKEN']
CHAT_ID  = os.environ['TELEGRAM_CHAT_ID']
STATUS   = os.environ.get('JOB_STATUS', 'success')
MS_STATUS = os.environ.get('MS_STATUS', 'success')   # outcome of the condo scrape step
SITE_URL = "https://umbasimpy.github.io/japan-house-compare/"
ACTIONS  = "https://github.com/UmbaSimpy/japan-house-compare/actions"


# ── Telegram ──────────────────────────────────────────
def send(text):
    data = urllib.parse.urlencode({
        'chat_id': CHAT_ID,
        'text':    text[:4096],   # Telegram message limit
        'disable_web_page_preview': 'false',
    }).encode()
    urllib.request.urlopen(
        f'https://api.telegram.org/bot{TOKEN}/sendMessage', data
    )
    print("Telegram: sent")


# ── Scoring (mirrors JS scoreSet) ─────────────────────
# Wooden houses on shallow foundations tilt when the ground liquefies (Mihama 2011)
HOUSE_LIQ_PENALTY = {'high': 4, 'mid': 2}

def score_listings(listings):
    if not listings:
        return []
    ppms  = [(d['price'] * 10000) / d['areaM2'] for d in listings]
    areas = [d['areaM2'] for d in listings]
    lo_ppm, hi_ppm = min(ppms), max(ppms)
    lo_a,   hi_a   = min(areas), max(areas)

    result = []
    for i, d in enumerate(listings):
        # 1. VALUE /25 — lower price/m² wins
        v_raw = 1.0 if hi_ppm == lo_ppm else (hi_ppm - ppms[i]) / (hi_ppm - lo_ppm)
        value = round(v_raw * 25)

        # 2. ACCESS /20 — station walk time
        w = d['walk']
        access = 20 if w <= 5 else 16 if w <= 10 else 12 if w <= 15 else 8 if w <= 20 else 4 if w <= 30 else 0

        # 3. CONDITION /20 — age + structure + reno
        age_sc  = 12 if d['age'] <= 5 else 9 if d['age'] <= 10 else 6 if d['age'] <= 20 else 3 if d['age'] <= 30 else 1
        str_sc  = 8  if d['structure'] == 'RC' else 6 if d['structure'] == 'Steel' else 4
        reno_sc = 3  if d['renovation'] else 0
        condition = min(20, age_sc + str_sc + reno_sc)

        # 4. SPACE /20 — larger floor area wins
        s_raw = 1.0 if hi_a == lo_a else (d['areaM2'] - lo_a) / (hi_a - lo_a)
        space = round(s_raw * 20)

        # 5. EXTRAS /15 — parking, land rights, city gas, minus liquefaction risk
        park_sc   = 0 if d['parking'] == 0 else 5 if d['parking'] == 1 else 8
        rights_sc = 5 if d['landRights'] == 'owned' else 0
        gas_sc    = 2 if d['cityGas'] else 0
        liq_pen   = HOUSE_LIQ_PENALTY.get((d.get('liq') or {}).get('level'), 0)
        extras    = max(0, min(15, park_sc + rights_sc + gas_sc) - liq_pen)

        total = value + access + condition + space + extras
        result.append({**d, 'score': total})
    return result


# ── Helpers ───────────────────────────────────────────
def nc_id(url):
    m = re.search(r'nc_(\d+)', url or '')
    return m.group(1) if m else url

def fmt_price(man):
    yen = man * 10000
    if yen >= 100_000_000:
        oku = yen // 100_000_000
        rem = (yen % 100_000_000) // 10000
        return f"{oku}億{rem:,}万" if rem else f"{oku}億"
    return f"{man:,}万"


def drop_today(hist, today):
    """(old, new) if the price went down on today's run, else None."""
    if len(hist) >= 2 and hist[-1][0] == today and hist[-1][1] < hist[-2][1]:
        return hist[-2][1], hist[-1][1]
    return None


def fmt_drop(old, new):
    return f"¥{fmt_price(old)} → ¥{fmt_price(new)} (−{fmt_price(old - new)}, −{(old - new) / old * 100:.1f}%)"


def price_drop_section(houses, condos, today):
    lines = []
    for d in sorted(houses, key=lambda x: -x['score']):
        dr = drop_today(d.get('priceHistory', []), today)
        if dr:
            lines.append(f"  🏠 {d['layout']} {d['areaM2']:.0f}m²  {fmt_drop(*dr)}  |  Score: {d['score']}/100")
            lines.append(f"    {d['suumoUrl']}")
    condo_drops = [(d, drop_today(d.get('priceHistory', []), today)) for d in condos]
    condo_drops = sorted([x for x in condo_drops if x[1]], key=lambda x: -x[0]['scores']['total'])
    for d, dr in condo_drops[:MS_TOP_N]:
        lines.append(f"  🏢 {d['layout']} {d['areaM2']:.0f}m²  {fmt_drop(*dr)}  |  Score: {d['scores']['total']}/100")
        lines.append(f"    [{AREA_LABEL.get(d.get('group'), d['area'])}] {d['name']} {d['floor'] or '?'}F")
        lines.append(f"    {d['suumoUrl']}")
    if len(condo_drops) > MS_TOP_N:
        lines.append(f"  …+{len(condo_drops) - MS_TOP_N} more condo price cuts on the site")
    if not lines:
        return ["\n📉 PRICE DROPS — none today"]
    return ["\n📉 PRICE DROPS"] + lines


# ── Condos ────────────────────────────────────────────
MS_TOP_N = 10
AREA_LABEL = {a.get('group', a['key']): a.get('groupName', a['name'])
              for a in json.loads(Path('areas.json').read_text(encoding='utf-8'))}

def unit_key(d):
    """Same flat relisted by another agent keeps its identity (SUUMO id changes)."""
    return f"{d['bldgKey']}|{d['floor']}|{d['areaM2']}"


def condo_section(today):
    """Return (lines, persist) for the apartments part of the message."""
    clean = Path('mansions_clean.json')
    if MS_STATUS != 'success' or not clean.exists():
        return [f"\n🏢 APARTMENTS — ⚠️ scrape failed, site shows the previous data\n{ACTIONS}"], None

    condos = json.loads(clean.read_text(encoding='utf-8'))
    known_file = Path('known_ms_units.json')
    per_area = {}
    for d in condos:
        label = AREA_LABEL.get(d.get('group'), d['area'])
        per_area[label] = per_area.get(label, 0) + 1
    lines = [f"\n🏢 APARTMENTS — {len(condos)} tracked ({' · '.join(f'{k} {v}' for k, v in per_area.items())})"]

    if not known_file.exists():
        lines.append("Tracking started today — new listings will be reported from tomorrow.")
    else:
        known = set(json.loads(known_file.read_text(encoding='utf-8')))
        new = sorted((d for d in condos if unit_key(d) not in known),
                     key=lambda d: -d['scores']['total'])
        if not new:
            lines.append("No new apartments since last run.")
        else:
            lines.append(f"🆕 {len(new)} new listing{'s' if len(new) > 1 else ''}"
                         + (f" (top {MS_TOP_N} by score)" if len(new) > MS_TOP_N else "") + ":")
            for d in new[:MS_TOP_N]:
                vs = d['vsExpected']
                deal = f"{vs:+}% vs similar" if abs(vs) >= 3 else "fair price"
                fees = f"  |  fees ¥{d['fees']:,}/mo" if d['fees'] else ""
                seismic = "" if d['shinTaishin'] else "  |  旧耐震"
                lines.append(
                    f"  • {d['layout']} {d['areaM2']:.0f}m²  ¥{fmt_price(d['price'])}"
                    f"  ({d['ppm']}万/m², {deal})"
                    f"  |  Score: {d['scores']['total']}/100"
                    f"  |  {d['walk']} min{' bus' if d['bus'] else ''}{fees}{seismic}"
                )
                lines.append(f"    [{AREA_LABEL.get(d.get('group'), d['area'])}] {d['name']} {d['floor'] or '?'}F")
                lines.append(f"    {d['suumoUrl']}")
            if len(new) > MS_TOP_N:
                lines.append(f"  …+{len(new) - MS_TOP_N} more on the site (Apartments → Recently listed)")

    def persist():
        known_file.write_text(json.dumps(sorted({unit_key(d) for d in condos}), ensure_ascii=False, indent=1),
                              encoding='utf-8')
        hist_file = Path('mansion_history.json')
        hist = json.loads(hist_file.read_text(encoding='utf-8')) if hist_file.exists() else []
        if not hist or hist[-1]['date'] != today:
            def stats(ds):
                ppms = sorted(d['ppm'] for d in ds)
                return {'count': len(ds), 'avgPrice': round(sum(d['price'] for d in ds) / len(ds)),
                        'medianPpm': ppms[len(ppms) // 2]}
            by_group = {}
            for d in condos:
                by_group.setdefault(d.get('group') or d['areaKey'], []).append(d)
            hist.append({'date': today, **stats(condos),
                         'areas': {g: stats(ds) for g, ds in by_group.items()}})
            hist_file.write_text(json.dumps(hist, indent=2), encoding='utf-8')
        print(f"Condos: saved {len(condos)} unit keys, history {len(hist)} points")
    return lines, persist


# ── New condos ────────────────────────────────────────
NEW_STATUS = os.environ.get('NEW_STATUS', 'success')   # outcome of the new-condo scrape step


def fmt_range(lo, hi):
    if not lo:
        return "price TBD"
    return f"¥{fmt_price(lo)}" + (f"–{fmt_price(hi)}" if hi and hi != lo else "")


def new_condo_section(today):
    """New projects / buildings, prices announced, price changes, extra never-occupied units."""
    clean = Path('newms_clean.json')
    if NEW_STATUS != 'success' or not clean.exists():
        return [f"\n🏗 NEW CONDOS — ⚠️ scrape failed, site shows the previous data\n{ACTIONS}"], None
    items = json.loads(clean.read_text(encoding='utf-8'))
    known_file = Path('known_new.json')
    per_area = {}
    for d in items:
        label = AREA_LABEL.get(d.get('group'), d['area'])
        per_area[label] = per_area.get(label, 0) + 1
    lines = [f"\n🏗 NEW CONDOS — {len(items)} listed ({' · '.join(f'{k} {v}' for k, v in per_area.items())})"]
    tag = lambda d: f"[{AREA_LABEL.get(d.get('group'), d['area'])}] {d['name']}"
    move = lambda d: "move in now" if d['monthsToMove'] == 0 else \
        f"move-in {d['delivery'][0]}/{d['delivery'][1]}" if d['delivery'] and d['delivery'][0] else "move-in TBD"

    if not known_file.exists():
        lines.append("Tracking started today — changes will be reported from tomorrow.")
    else:
        known = json.loads(known_file.read_text(encoding='utf-8'))
        events = []
        for d in items:
            k = known.get(d['key'])
            if k is None:
                events.append(f"  🆕 {tag(d)}\n    {fmt_range(d['priceMin'], d['priceMax'])}  |  {move(d)}"
                              f"  |  Score: {d['scores']['total']}/100\n    {d['url']}")
            elif not k['priceMin'] and d['priceMin']:
                events.append(f"  💴 Prices announced: {tag(d)}\n    {fmt_range(d['priceMin'], d['priceMax'])}"
                              f"  |  Score: {d['scores']['total']}/100\n    {d['url']}")
            elif k['priceMin'] and d['priceMin'] and (k['priceMin'], k['priceMax']) != (d['priceMin'], d['priceMax']):
                arrow = "📉" if d['priceMin'] < k['priceMin'] else "📈"
                events.append(f"  {arrow} {tag(d)}: {fmt_range(k['priceMin'], k['priceMax'])} → "
                              f"{fmt_range(d['priceMin'], d['priceMax'])}\n    {d['url']}")
            elif d['kind'] == 'unsold' and (d['unitsOnSale'] or 0) > (k.get('units') or 0):
                events.append(f"  ➕ {d['unitsOnSale'] - (k.get('units') or 0)} more never-occupied unit(s): {tag(d)}"
                              f"\n    {fmt_range(d['priceMin'], d['priceMax'])}\n    {d['url']}")
            if k is None:
                continue
            # demand signals — reported alongside any price event above
            if d.get('phase') and k.get('phase') and d['phase'] != k['phase']:
                ch = d.get('phaseChange')
                events.append(f"  🔔 New sales phase: {tag(d)} — {k['phase']} → {d['phase']}"
                              + (f" (prices {ch:+}% vs {d.get('phasePrev')})" if ch is not None else "")
                              + f"\n    {d['url']}")
            if d.get('stockNow') is not None and k.get('stock') is not None and d['stockNow'] < k['stock']:
                pace = f", ~{d['pacePerWeek']}/week" if d.get('pacePerWeek') else ""
                events.append(f"  🔥 {tag(d)}: {k['stock'] - d['stockNow']} sold since last run "
                              f"({d['stockNow']} left{pace})")
        lines += events or ["No changes since last run."]

    def persist():
        known_file.write_text(json.dumps({d['key']: {'priceMin': d['priceMin'], 'priceMax': d['priceMax'],
                                                     'units': d['unitsOnSale'], 'phase': d.get('phase'),
                                                     'stock': d.get('stockNow')} for d in items},
                                         ensure_ascii=False, indent=1), encoding='utf-8')
        print(f"New condos: saved {len(items)} keys")
    return lines, persist


# ── Main ──────────────────────────────────────────────
if __name__ == '__main__':
    today = date.today().isoformat()

    if STATUS != 'success':
        send(f"❌ SUUMO scrape FAILED — {today}\n\n{ACTIONS}")
        raise SystemExit(0)

    # Load and score current listings
    listings = json.loads(Path('listings_clean.json').read_text(encoding='utf-8'))
    scored   = score_listings(listings)

    # Load known nc_ids from previous run
    known_file = Path('known_nc_ids.json')
    known = set(json.loads(known_file.read_text()) if known_file.exists() else [])

    # Detect new listings
    new = [d for d in scored if nc_id(d['suumoUrl']) not in known]

    # Build message
    lines = [
        f"✅ SUUMO daily run — {today}",
        f"\n🏠 HOUSES — {len(scored)} tracked",
    ]

    if new:
        lines.append(f"🆕 {len(new)} new listing{'s' if len(new) > 1 else ''}:")
        for d in sorted(new, key=lambda x: -x['score']):
            lines.append(
                f"  • {d['layout']}  ¥{fmt_price(d['price'])}"
                f"  |  Score: {d['score']}/100"
                f"  |  {d['walk']} min walk"
            )
            lines.append(f"    {d['suumoUrl']}")
    else:
        lines.append("No new houses since last run.")

    ms_lines, ms_persist = condo_section(today)
    lines += ms_lines
    nw_lines, nw_persist = new_condo_section(today)
    lines += nw_lines
    clean = Path('mansions_clean.json')
    condos = json.loads(clean.read_text(encoding='utf-8')) if MS_STATUS == 'success' and clean.exists() else []
    lines += price_drop_section(scored, condos, today)
    lines.append(f"\n{SITE_URL}")

    send('\n'.join(lines))

    # Persist current nc_ids so next run can diff
    known_file.write_text(json.dumps([nc_id(d['suumoUrl']) for d in scored], indent=2))
    print(f"Saved {len(scored)} nc_ids to {known_file}")

    # Append data point to history (skip if same date already recorded)
    history_file = Path('history.json')
    history = json.loads(history_file.read_text(encoding='utf-8')) if history_file.exists() else []
    if not history or history[-1]['date'] != today:
        avg_price = round(sum(d['price'] for d in scored) / len(scored)) if scored else 0
        history.append({'date': today, 'count': len(scored), 'avgPrice': avg_price})
        history_file.write_text(json.dumps(history, indent=2))
        print(f"History: {len(history)} data points")

    if ms_persist:
        ms_persist()
    if nw_persist:
        nw_persist()
