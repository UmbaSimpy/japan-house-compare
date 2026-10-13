"""
Monthly home-loan rate update from the lenders' own official pages (DATA_LOG item 17).

Writes data/loan_rates.json, which loan.js reads for the Loan tab's presets and lender table and
deeplook.py reads for its default rate. Only official sources are used: each bank's own rate page or the
JSON / script file that page loads its figures from, and flat35.com (住宅金融支援機構) for Flat 35.

  python loan_rates.py              fetch, check, write data/loan_rates.json, print a summary
  python loan_rates.py --telegram   same, and send the summary to Telegram (monthly GitHub Action)
  python loan_rates.py --accept     also accept changes larger than MAX_JUMP (after checking them by hand)
  python loan_rates.py --dry        fetch and print only; write nothing

Safety rules:
- A source that fails, or a value outside 0.1–8%, keeps last month's value (status "stale").
- A change of more than MAX_JUMP points in one month keeps last month's value (status "suspect") until
  someone checks the bank's page and re-runs with --accept (workflow input "accept").
- Lenders that block automated requests (Mizuho, AEON: HTTP 403; SBI Shinsei: no answer) are "manual": their
  values are carried forward and listed in the summary to check by hand in a browser; record the new values
  in data/loan_rates.json (banks.<id>.v / f10 / asof).
- Tokyo Star's server needs legacy TLS renegotiation; that option is enabled for that host only.
"""
import html
import json
import os
import re
import ssl
import statistics
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

OUT = Path(__file__).parent / "data" / "loan_rates.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
MAX_JUMP = 0.6      # points per month; bigger moves need --accept
LO, HI = 0.1, 8.0   # plausible rate range, %

# Official sources. "page" is what a person should open to check; "data" is what the parser reads.
SRC = {
    "mufg":     {"page": "https://www.bk.mufg.jp/kariru/jutaku/yuuguu/index.html"},
    "smbc":     {"page": "https://www.smbc.co.jp/kojin/jutaku_loan/kinri/",
                 "data": "https://www.smbc.co.jp/kojin/cmn/scripts/kinri.json"},
    "resona":   {"page": "https://www.resonabank.co.jp/kojin/loan_kinri.html",
                 "data": "https://www.resonabank.co.jp/common/kinri/json/jutaku.json"},
    "chiba":    {"page": "https://www.chibabank.co.jp/kojin/services/loan/housing/housing_new"},
    "yokohama": {"page": "https://www.boy.co.jp/kojin/jutaku-loan/kariire/kinri/hendo.html",
                 "data": "https://www.boy.co.jp/master/include/rate/jyutaku/hendo_tekiyo.html"},
    "paypay":   {"page": "https://www.paypay-bank.co.jp/mortgage/",
                 "data": "https://login.paypay-bank.co.jp/wctx/MortgageRates.do"},
    "jibun":    {"page": "https://www.jibunbank.co.jp/products/homeloan/rate/"},
    "rakuten":  {"page": "https://www.rakuten-bank.co.jp/home-loan/rate/",
                 "data": "https://www.rakuten-bank.co.jp/shared/integrate/rate/home-loan.json"},
    "sony":     {"page": "https://sonybank.jp/rate/hl02.html",
                 "data": "https://sonybank.jp/data/009.json"},
    "docomo":   {"page": "https://www.netbk.co.jp/contents/lineup/home-loan/",
                 "data": "https://www.netbk.co.jp/contents/data/csv/kinri_hl_mr.js"},
    "flat35":   {"page": "https://www.flat35.com/"},
    "tokyostar": {"page": "https://www.tokyostarbank.co.jp/products/loan/homeloan/homeloan_star/",   # スター住宅ローン (no PR)
                  "data": "https://www.tokyostarbank.co.jp/common2016/xml/loan.xml"},
    # manual: these sites refuse automated requests, so a person checks them
    "aeon":      {"page": "https://www.aeonbank.co.jp/housing-loan/", "manual": True},
    "mizuho":    {"page": "https://www.mizuhobank.co.jp/retail/products/loan/housing/", "manual": True},
    "shinsei":   {"page": "https://www.sbishinseibank.co.jp/retail/housing/", "manual": True},
}
LEGACY_TLS = {"www.tokyostarbank.co.jp"}

# Discounts that the banks publish only in JavaScript-built pages (checked by hand, DATA_LOG item 17).
# Used as: applied rate = the bank's published standard rate − discount.
MANUAL_DISCOUNT = {"yokohama": 2.08}

# First-run seed = the October 2026 snapshot from reports/Home loan research.md
SEED = {
    "aeon": {"v": 1.04, "f10": 3.73}, "mufg": {"v": 1.195, "f10": 3.75, "full": "4.18–4.35"},
    "resona": {"v": 1.25, "f10": 4.205}, "mizuho": {"v": 1.275, "f10": 3.60}, "yokohama": {"v": 1.295},
    "shinsei": {"v": 1.34, "f10": 3.40}, "chiba": {"v": 1.50}, "smbc": {"v": 1.525, "f10": 4.75},
    "paypay": {"v": 1.58}, "jibun": {"v": 1.68}, "rakuten": {"v": 1.747}, "sony": {"v": 1.847},
    "docomo": {"v": 2.00, "f10": 3.379}, "tokyostar": {"v": 2.40}, "flat35": {"full": "3.83"},
}


def get(url, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ja,en;q=0.8"})
    ctx = None
    if urllib.parse.urlparse(url).hostname in LEGACY_TLS:
        ctx = ssl.create_default_context()
        ctx.options |= getattr(ssl, "OP_LEGACY_SERVER_CONNECT", 0x4)
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        b = r.read()
    for enc in ("utf-8-sig", "cp932", "euc-jp"):
        try:
            return b.decode(enc)
        except UnicodeDecodeError:
            pass
    return b.decode("utf-8", "ignore")


def text(url):
    """Page as plain text (scripts, styles and tags removed, whitespace collapsed)."""
    t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", get(url))
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))


def num(rx, t, what):
    m = re.search(rx, t)
    if not m:
        raise ValueError(f"not found: {what}")
    return float(m.group(1))


# ── parsers: each returns {"v": variable, "f10": 10-year fixed, "full": "full-term fixed"} (any subset) ──
def p_mufg():
    t = text(SRC["mufg"]["page"])
    full = [float(x) for x in re.findall(r"全期間固定(?:21～25|26～30|31～35)年 年 (\d\.\d+) %", t)]
    r = {"v": num(r"適用金利 変動金利 年 (\d\.\d+) %", t, "variable"),
         "f10": num(r"固定10年 年 (\d\.\d+) %", t, "10-year fixed")}
    if full:
        r["full"] = f"{min(full):g}–{max(full):g}" if min(full) != max(full) else f"{full[0]:g}"
    return r


def p_smbc():
    d = json.loads(get(SRC["smbc"]["data"]))[0]
    disc = num(r"店頭金利より最大▲年(\d\.\d+)％", text(SRC["smbc"]["page"]), "discount")   # 最後までずーっと引き下げプラン
    if not 1.0 <= disc <= 2.6:
        raise ValueError(f"odd discount {disc}")
    return {"v": round(float(d["hendo"]) - disc, 3), "f10": round(float(d["kotei10"]) - disc, 3),
            "asof": f"{d['yyyy']}-{int(d['mm']):02d}"}


def p_resona():
    d = json.loads(get(SRC["resona"]["data"]))[0]
    n = d["new1"]   # 新規① = the standard new-loan plan
    return {"v": float(n["floatingRate"]["apply"]), "f10": float(n["fixed10Rate"]["apply"]),
            "asof": f"{d['date']['year']}-{int(d['date']['month']):02d}"}


def p_chiba():
    t = text(SRC["chiba"]["page"])
    return {"v": num(r"変動金利 割引後金利 (\d\.\d+) %", t, "variable"),
            "f10": num(r"10年固定金利 割引後金利 (\d\.\d+) %", t, "10-year fixed")}


def p_yokohama():
    t = text(SRC["yokohama"]["data"])
    std = num(r"以降にお借り入れの場合 (\d\.\d+)％", t, "standard variable rate")
    return {"v": round(std - MANUAL_DISCOUNT["yokohama"], 3)}


def p_paypay():
    d = json.loads(get(SRC["paypay"]["data"]))
    pick = lambda name: next(float(x["params"]["kinri3"]) for x in d if x["target"] == "financing" and x["name"] == name)
    return {"v": pick("変動金利"), "f10": pick("10年固定金利")}


def p_jibun():
    t = text(SRC["jibun"]["page"])
    return {"v": num(r"全期間引下げプラン.*?80％以下 (\d\.\d+) % -\d", t, "variable"),
            "f10": num(r"当初期間引下げプラン.*?固定10年 (\d\.\d+)%", t, "10-year fixed")}


def p_rakuten():
    d = json.loads(get(SRC["rakuten"]["data"]))
    r = {"v": float(d["select_cutrange_thisMon"]["float"]), "f10": float(d["select_cutrange_thisMon"]["static10"])}
    m = re.match(r"(\d{4})年(\d{1,2})月", d["date"].get("reset_date_yyyymm", ""))
    if m:
        r["asof"] = f"{m.group(1)}-{int(m.group(2)):02d}"
    return r


def p_sony():
    d = json.loads(get(SRC["sony"]["data"]))[0]
    base = next(x for x in d["data"] if re.fullmatch(r"LN23001(0+)", x["code"]))   # 住宅ローン基準金利
    std = float(base["hendo"][0]["kinri"]["cRate"])
    disc = num(r"変動金利 適用期間中 -(\d\.\d+)%", text(SRC["sony"]["page"]), "変動セレクト discount")
    r = {"v": round(std - disc, 3)}
    m = re.match(r"(\d{4})年(\d{1,2})月", d.get("TekiMonth", ""))
    if m:
        r["asof"] = f"{m.group(1)}-{int(m.group(2)):02d}"
    return r


def p_docomo():
    s = re.search(r"\((\{.*\})\)", get(SRC["docomo"]["data"]), re.S).group(1)   # JSONP with JS sparse arrays
    s = s.replace("[,", "[null,")
    while ",," in s:
        s = s.replace(",,", ",null,")
    j = json.loads(re.sub(r",\s*\]", "]", s))
    return {"v": round(j["full"]["float"][0] * 100, 3), "f10": round(j["first"]["fixed10"][0] * 100, 3)}   # 通期引下げ / 当初引下げ


def p_flat35():
    t = text(SRC["flat35"]["page"])
    m = re.search(r"(\d{4})年(\d{1,2})月の最頻金利.*?6年目以降 年 \d\.\d+ % 年 (\d\.\d+) %", t)
    if not m:
        raise ValueError("最頻金利 not found")
    return {"full": f"{float(m.group(3)):g}", "asof": f"{m.group(1)}-{int(m.group(2)):02d}"}   # 21–35 years, ≤90% of price


def p_tokyostar():
    x = get(SRC["tokyostar"]["data"])
    tag = lambda k: re.search(rf"<tsb-r--loan-sml-{k}><!\[CDATA\[([^\]]*)\]\]>", x).group(1)
    r = {"v": float(tag("borr-floating-ratelower").rstrip("%"))}   # lowest variable rate of スター住宅ローン
    m = re.match(r"(\d{4})年(\d{1,2})月", tag("base-ref-date"))
    if m:
        r["asof"] = f"{m.group(1)}-{int(m.group(2)):02d}"
    return r


PARSERS = {k[2:]: f for k, f in globals().items() if k.startswith("p_")}


def presets(B):
    v = lambda ids: [B[i]["v"] for i in ids if B.get(i, {}).get("v")]
    f10 = [b["f10"] for b in B.values() if b.get("f10")]
    out = {"v_np": B["smbc"].get("v"),                                             # no PR needed
           "v_low": min(v(["mufg", "mizuho", "resona"]), default=None),           # megabanks, lowest
           "v_net": statistics.median(v(["paypay", "jibun", "rakuten", "sony", "docomo"])),   # online banks, typical
           "f10": statistics.median(f10) if f10 else None,
           "flat35": float(B["flat35"]["full"]) if B.get("flat35", {}).get("full") else None}
    return {k: round(x, 3) for k, x in out.items() if x}


def run(accept=False):
    today = date.today()
    month = today.strftime("%Y-%m")
    prev = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"banks": {k: dict(v, asof="2026-10") for k, v in SEED.items()}}
    banks, notes = {}, []
    for k, s in SRC.items():
        old = prev["banks"].get(k, {})
        b = {f: old[f] for f in ("v", "f10", "full", "asof", "checked") if old.get(f)}
        b.update(src=s["page"], mode="manual" if s.get("manual") else "auto")
        if s.get("manual"):
            b["status"] = "manual"
            banks[k] = b
            continue
        try:
            got = PARSERS[k]()
        except Exception as e:   # network error, page changed, …
            b["status"], b["msg"] = "stale", str(e)[:120]
            notes.append(f"{k}: source failed ({b['msg']}) — kept {old.get('asof', '?')} values")
            banks[k] = b
            continue
        b["status"] = "ok"
        for f in ("v", "f10", "full"):
            if f not in got:
                continue
            new = got[f]
            x = float(str(new).split("–")[0])
            if not LO <= x <= HI:
                b["status"] = "stale"; notes.append(f"{k} {f}: {new} out of range — kept {old.get(f)}")
                continue
            ox = float(str(old[f]).split("–")[0]) if old.get(f) else None
            if ox is not None and abs(x - ox) > MAX_JUMP and not accept:
                b["status"] = "suspect"; b.setdefault("got", {})[f] = new
                notes.append(f"{k} {f}: {old[f]} → {new} (> {MAX_JUMP} pt) — kept old; check {s['page']} and re-run with accept")
                continue
            b[f] = new
        if b["status"] == "ok":
            b["asof"] = got.get("asof", month)
        banks[k] = b
    data = {"month": month, "checked": today.isoformat(), "presets": presets(banks), "banks": banks,
            "rules": f"official sources only; keep old value if a source fails, is out of {LO}–{HI}%, or moves > {MAX_JUMP} pt"}
    return prev, data, notes


def summary(prev, data, notes):
    pb, lines = prev.get("banks", {}), [f"💴 Loan rates {data['checked']} (official sources)"]
    pp = prev.get("presets", {})
    lines.append("Presets: " + " · ".join(f"{k} {v}%" + (f" ({'+' if v > pp[k] else ''}{v - pp[k]:.3f})" if pp.get(k) and v != pp[k] else "")
                                         for k, v in data["presets"].items()))
    for k, b in data["banks"].items():
        ch = [f"{f} {pb.get(k, {}).get(f)}→{b[f]}" for f in ("v", "f10", "full") if b.get(f) and str(pb.get(k, {}).get(f)) != str(b[f])]
        if ch:
            lines.append(f"• {k}: " + ", ".join(ch))
    if notes:
        lines.append("⚠ " + "\n⚠ ".join(notes))
    man = [k for k, b in data["banks"].items() if b["mode"] == "manual"]
    lines.append("Check by hand (sites block automated requests): " + ", ".join(f"{k} (last {data['banks'][k].get('checked') or data['banks'][k].get('asof', '?')})" for k in man))
    return "\n".join(lines)


def telegram(msg):
    tok, chat = os.environ.get("TELEGRAM_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not (tok and chat):
        print("(no TELEGRAM_TOKEN / TELEGRAM_CHAT_ID — printed only)"); return
    data = urllib.parse.urlencode({"chat_id": chat, "text": msg, "disable_web_page_preview": "true"}).encode()
    with urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage", data, timeout=30) as r:
        print("sent", r.status)


def main():
    prev, data, notes = run(accept="--accept" in sys.argv or os.environ.get("ACCEPT") == "true")
    msg = summary(prev, data, notes)
    print(msg)
    if "--dry" in sys.argv:
        print(json.dumps(data, ensure_ascii=False, indent=1)); return
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if "--telegram" in sys.argv:
        telegram(msg)


if __name__ == "__main__":
    main()
