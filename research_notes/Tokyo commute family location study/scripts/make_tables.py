import json
d = json.load(open(r"D:\Cartella Privata\Claude\japan-house-compare\data\locations.json", encoding="utf-8"))
A = d["areas"]
def nm(a): return f"{a['nameEn']} {a['nameJa']}"
def m(y):  # yen -> 万円 string
    return "–" if y is None else f"{y/10000:,.0f}"
def f1(x): return "–" if x is None else f"{x:.1f}" if isinstance(x, float) else str(x)
out = []
out.append("### TABLE_SHORT")
out.append("| # (overall) | Municipality | Pref | Total | Commute (25) | Bus (5) | Childcare (25) | Space (30) | Growth (10) | Costco (5) |")
out.append("|---|---|---|---|---|---|---|---|---|---|")
for a in A:
    if a["shortlisted"]:
        s = a["scores"]
        out.append(f"| {a['rank']} | {nm(a)} | {a['pref']} | **{a['totalScore']}** | {s['commute']} | {s['bus']} | {s['childcare']} | {s['space']} | {s['growth']} | {s['costco']} |")
out.append("\n### TABLE_ALL")
out.append("| # | Municipality | Total | Com | Bus | Child | Space | Grow | Cost | Short |")
out.append("|---|---|---|---|---|---|---|---|---|---|")
for a in A:
    s = a["scores"]
    out.append(f"| {a['rank']} | {nm(a)} | {a['totalScore']} | {s['commute']:.0f} | {s['bus']:.0f} | {s['childcare']:.0f} | {s['space']:.0f} | {s['growth']:.0f} | {s['costco']:.0f} | {'✓' if a['shortlisted'] else ''} |")
out.append("\n### TABLE_COMMUTE")
out.append("| Municipality | Station → dest. | Min / xfer | Eff. min | 1-mo pass ¥ | Line peak crowding FY2025 | Bus (AM/PM, ride, fare) |")
out.append("|---|---|---|---|---|---|---|")
for a in A:
    c = a["commute"]; b = a["bus"]
    bt = "–"
    if b:
        bt = f"{b['morningCount'] if b['morningCount'] is not None else '?'}/{b['eveningCount'] if b['eveningCount'] is not None else '?'}, {b['rideMin'] or '?'} min, ¥{b['fare'] if b['fare'] else '?'}"
        if b["available"] is None: bt = "東名江田 stop, timetable not obtained"
    out.append(f"| {nm(a)} | {c['station']} → {c['destination']} | {c['minToTokyo']} / {c['transfers']} | {c['effectiveMin']} | {c['passMonthly']:,} | {c['crowdingLine']} | {bt} |")
out.append("\n### TABLE_CHILD")
out.append("| Municipality | 0–2 fee ¥/mo (1st child) | 待機 2025→2026 | 学童 待機 | Medical (age, copay/visit) | School lunch | Annual net ¥ (2 kids 0–2) |")
out.append("|---|---|---|---|---|---|---|")
for a in A:
    c = a["childcare"]
    fee = f"{c['daycare0to2Monthly']:,}" if c["daycare0to2Monthly"] is not None else f"n/a (imputed {c['daycare0to2MonthlyImputed']:,})"
    w = f"{c['waitlist2025']}→{c['waitlist2026'] if c['waitlist2026'] is not None else 'n/a'}"
    g = c["gakudoWaitlist"] if c["gakudoWaitlist"] is not None else "<50"
    cp = c["medicalCopay"]; cps = "n/a" if cp is None else (f"¥{cp}/day" if cp == 600 else f"¥{cp}")
    lunch = c["lunchFree"] or "n/a"
    ann = "–" if c["annualBenefitYen"] is None else f"{c['annualBenefitYen']:+,}"
    out.append(f"| {nm(a)} | {fee} | {w} | {g} | to {c['medicalAge']}, {cps} | {lunch} | {ann} |")
out.append("\n### TABLE_HOUSING")
out.append("| Municipality | Used listings | ≥90 m² share | Median 90–105 m² 万円 [n] | Median 90–110 m² built≥2000 万円 [n] | ≥90 m² under ¥80M (built≥2000) | Land ¥/m² 2026 | Land 5-yr |")
out.append("|---|---|---|---|---|---|---|---|")
for a in A:
    h = a["housing"]
    out.append(f"| {nm(a)} | {h['usedListingsTotal']:,} | {h['share90plus']}% | {m(h['median90to105'])} [{h['n90to105']}] | {m(h['median90to110new'])} [{h['nNew']}] | {h['count90under80M']} ({h['count90under80MBuilt2000']}) | {h['landPrice']:,} | {h['landChange5y']:+.1f}% |")
out.append("\n### TABLE_GROWTH")
out.append("| Municipality | Pop. 2025 | 2020→25 | IPSS 2050 vs 2020 | 0–14 share 2020 | Nearest Costco | Drive min (est.) |")
out.append("|---|---|---|---|---|---|---|")
for a in A:
    g = a["demographics"]; c = a["costco"]
    out.append(f"| {nm(a)} | {g['pop2025']:,} | {g['change2020to2025']:+.1f}% | {g['ipss2050']:+.1f}% | {g['childShare']:.1f}% | {c['nearest']} | {c['driveMin']:g} |")
out.append("\n### FLAGS (shortlist)")
for a in A:
    if a["shortlisted"] or a["rank"] <= 30:
        out.append(f"- {a['rank']} {a['nameEn']}: " + "; ".join(a["dataFlags"]))
open(r"C:\Users\dammi\AppData\Local\Temp\claude\D--Cartella-Privata-Claude\ddef8e2c-04dd-4250-a285-fe2658ee1c35\scratchpad\tables.md", "w", encoding="utf-8").write("\n".join(out))
print("done")
