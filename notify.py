#!/usr/bin/env python3
"""
Sends a Telegram notification after each daily scrape.
Compares against known_nc_ids.json to detect new listings.
Scores are computed here (mirrors the JS scoreSet() function).
"""

import json, os, re, urllib.request, urllib.parse
from datetime import date
from pathlib import Path

TOKEN    = os.environ['TELEGRAM_TOKEN']
CHAT_ID  = os.environ['TELEGRAM_CHAT_ID']
STATUS   = os.environ.get('JOB_STATUS', 'success')
SITE_URL = "https://umbasimpy.github.io/japan-house-compare/"
ACTIONS  = "https://github.com/UmbaSimpy/japan-house-compare/actions"


# ── Telegram ──────────────────────────────────────────
def send(text):
    data = urllib.parse.urlencode({
        'chat_id': CHAT_ID,
        'text':    text,
        'disable_web_page_preview': 'false',
    }).encode()
    urllib.request.urlopen(
        f'https://api.telegram.org/bot{TOKEN}/sendMessage', data
    )
    print("Telegram: sent")


# ── Scoring (mirrors JS scoreSet) ─────────────────────
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

        # 5. EXTRAS /15 — parking, land rights, city gas
        park_sc   = 0 if d['parking'] == 0 else 5 if d['parking'] == 1 else 8
        rights_sc = 5 if d['landRights'] == 'owned' else 0
        gas_sc    = 2 if d['cityGas'] else 0
        extras    = min(15, park_sc + rights_sc + gas_sc)

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
        f"Listings tracked: {len(scored)}",
    ]

    if new:
        lines.append(f"\n\U0001f195 {len(new)} new listing{'s' if len(new) > 1 else ''}:")
        for d in sorted(new, key=lambda x: -x['score']):
            lines.append(
                f"  • {d['layout']}  ¥{fmt_price(d['price'])}"
                f"  |  Score: {d['score']}/100"
                f"  |  {d['walk']} min walk"
            )
            lines.append(f"    {d['suumoUrl']}")
    else:
        lines.append("\nNo new listings since last run.")

    lines.append(f"\n{SITE_URL}")

    send('\n'.join(lines))

    # Persist current nc_ids so next run can diff
    known_file.write_text(json.dumps([nc_id(d['suumoUrl']) for d in scored], indent=2))
    print(f"Saved {len(scored)} nc_ids to {known_file}")
