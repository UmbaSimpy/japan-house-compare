# Home loans in Japan: market, simulator, guide and proposals

*Research for the site's loan section. 2026-10-13. All rates are October 2026 rates for **new** loans. Banks change them monthly, so treat them as a snapshot.*

## Summary

- **Rates are rising.**
  - Bank of Japan: policy rate 1.0% in June 2026, 1.25% in September 2026.
  - Major banks raise their prime rate in November, so **new variable loans move up again from December**.
  - Long-term rates are near record highs: Flat 35 is **3.83%**, the highest since the current system began in 2017.
- **Variable is still much cheaper today:** ~1.0–2.0% variable vs ~3.4–4.8% for 10-year fixed and ~3.8–4.4% for full-term fixed. The gap (~2.5 points) is the widest on record.
  - 84% of new loans in Japan are variable.
  - The question is no longer "which rate is lowest" but **"how much rate rise can we absorb"**.
- **The banking market has flipped.** In October 2026 the megabanks (MUFG 1.195%, Mizuho 1.275%) and AEON (0.99%) are cheaper on variable than most online banks (1.6–2.0%). Online banks used to lead.
- **Advertised rates are best-case.** Each bank shows a lowest rate (最優遇金利) that needs conditions: salary paid into the bank, a fee type, the share of the price borrowed, a screening result. Some show a range and decide after screening.
  - The real cost is **rate + fees (2.2% of the loan, or a fixed ¥30–100k) + guarantee fee + insurance add-ons**.
- **How much you can borrow is not set by today's rate.** Banks test you at a **screening rate of ~3–4%** with repayments ≤35–40% of gross income. Most also require **Japanese nationality or permanent residency**, or a Japanese / PR spouse.
- **Recommendation for the site:**
  - A **payment simulator** with real presets.
  - **Running costs** and a **rate-shock view**.
  - A **"what can we borrow"** estimate.
  - A short **guide** written for a first-time buyer.
  - Link everything to the listings and the Deep look reports.

## 1. What is available now (October 2026)

### How banks advertise
| What you see | What it means |
|---|---|
| **適用金利 / 最優遇金利** (e.g. "1.195%") | The lowest rate. It needs the bank's conditions (salary account, online application, how much of the price you borrow, the fee type, sometimes bundled services such as au/Rakuten/Docomo). |
| **店頭金利 / 基準金利** (MUFG 3.375%) | The list rate. The variable rate = list rate − a **discount** (MUFG −2.18%). When the prime rate rises, the list rate rises and your rate follows; **the discount stays fixed for the life of the loan**. |
| **Rate range "x.xx%〜"** | The rate is set after screening (審査結果による). Common at online banks and for borrowers who need non-standard insurance. |
| **当初固定 (3/5/10/20 years)** | Fixed for a period, then it switches to a variable or new-fixed rate with a smaller discount (MUFG: −1.55 to −1.80% after the fixed period). |
| **全期間固定 / Flat 35** | Fixed to the end. Flat 35 comes from the government housing agency (JHF) through banks. Each lender sets its own rate within a published range; most charge the lowest. |

### Rate snapshot
| Lender | Variable | 10-year fixed | Full-term fixed (21–35 years) | Notes |
|---|---|---|---|---|
| AEON Bank | 0.99% | 3.73% | – | Has a product **without permanent residency** (conditions apply) |
| MUFG | 1.195% | 3.75% | 4.18–4.35% | List rate 3.375%; fee 2.2%, no guarantee fee; PR or Japanese nationality |
| Resona | 1.25% | 4.205% | – | |
| Mizuho | 1.275% | 3.60% | – | Rate shown is for the fee-type product |
| SBI Shinsei | 1.34% (6-month type) | 3.38% | – | Japanese / PR spouse can act as joint guarantor |
| Yokohama Bank | 1.295% | – | – | Screening at 4.0%, ≤35% of income |
| Chiba Bank | 1.50% | – | – | Main local bank for the Chiba areas |
| SMBC | 1.525% | 4.75% | – | **Non-PR residents with a valid status can apply** |
| PayPay Bank | 1.58% | – | – | No 5-year / 125% rule |
| au Jibun Bank | 1.68% | – | – | Screening rate estimated at 3.83% |
| Rakuten Bank | 1.747% | – | 3.83% (Flat 35) | Fixed fee; cancer 50% and all-illness cover included |
| Sony Bank | 1.847% | – | – | No 5-year / 125% rule; cancer-100 cover +0.1% |
| Docomo SMTB Net Bank | 2.00% | 3.379% | – | |
| **Flat 35** (most common rate) | – | – | **3.83%** (≤90% of price); 3.94% (>90%); 15–20 years 3.51%; Flat 50 4.10% | Range 3.83–5.84%. 子育てプラス: −0.25% per child for 5 years (max −1.0%) |

**Averages (Mogecheck index):**
- Variable: megabanks 1.33%, regional banks 1.51%, online banks 1.60%.
- 10-year fixed: megabanks 4.03%.

### What else differs between banks (often more than the rate)
- **Fees.**
  - "Rate-based" fee: 2.2% of the loan, i.e. ¥1.32M on ¥60M.
  - "Fixed" fee: ¥30k–100k, usually with a guarantee fee of ~2% upfront or +0.2% on the rate.
  - Compare total cost, not the rate.
- **Life insurance included in the loan (団信).** It is mandatory almost everywhere.
  - Basic death and disability cover is free.
  - Cancer-50% cover is often free.
  - Cancer-100% or 3/8-illness cover costs +0.1–0.3%.
  - Cover for both of you (夫婦連生) costs about +0.18–0.2%.
- **Payment-shock rules on variable loans (5-year / 125%).**
  - With them, the payment changes at most every 5 years and by at most +25%.
  - The interest is **deferred, not forgiven**: unpaid interest can pile up and be due at the end.
  - Some banks (Sony, PayPay and others) don't have these rules, so payments follow rates directly.
- **How often the variable rate is reviewed:** every 6 months at most banks, monthly at a few. Changes reach payments with a lag. Existing borrowers feel the June 2026 rise from early 2027.
- **Who can apply:**
  - Age: usually 18–70 at borrowing; paid off by 80.
  - Job: usually 1+ year at the current employer (some banks 6 months; self-employed 3 years).
  - Residency: see "Nationality" in §3.

## 2. A payment simulator for the site

The Apartments tab already shows a monthly payment per flat: the price borrowed 100%, over 35 years, at a rate the user sets, default **1.0%**. The proposed simulator is a full tool.

**Inputs (remembered in the browser like the current rate):**
- **Price:** typed in, or filled automatically from a listing, a Deep look report, or the map's budget.
- **Down payment:** ¥ or %; the screen shows the loan-to-price ratio.
- **Buying costs:** paid in cash or added to the loan (諸費用ローン). Default 7% for a used flat bought via an agent, 4% when bought from a developer.
- **Years:** 20–50; default 35.
- **Rate presets** (updated monthly from this research):
  - Variable — lowest (≈1.0–1.2%)
  - Variable — typical (≈1.5%)
  - 10-year fixed (≈3.6%)
  - Flat 35 (3.83%)
  - Custom
  - For fixed-period loans, a second rate after the period ends.
- **Bonus payments:** share of the loan repaid in twice-a-year bonus payments (0–40%).
- **Repayment method:** equal payments (元利均等, the default) or equal principal (元金均等).
- **Running costs:**
  - 管理費 + 修繕積立金, auto-filled from the listing.
  - **Repair-fund growth**: flat, or at the MLIT guideline level after year 10.
  - Parking.
  - Property tax (estimate or typed in).
- **Income (optional):** gross household income → share of income spent on the loan, and the "what can we borrow" estimate.

**Outputs:**
- Monthly payment and the bonus payment.
- **Total monthly housing cost** = loan + fees + parking + property tax / 12.
- Total interest; total paid.
- **Tax credit** (0.7% of the year-end balance, capped by the house type) shown for each year. Net cost after the credit for the first 10/13 years.
- **Rate-shock table:**
  - Payment if the variable rate rises by +0.5 / +1.0 / +2.0 points after year 3 or 5.
  - The rate at which the payment would reach your limit.
  - For banks with the 5-year / 125% rules: the deferred-interest balance.
- **Repayment (amortisation) chart**: balance over time; the effect of prepayment (shorter term vs lower payments).
- **"What can we borrow"**: income × 35% (or 30–40%) at a 3.0 / 3.5 / 4.0% screening rate. For example, with ¥10M income at 3.5%, a 35-year limit is ≈¥70M.
- **Side by side:** compare up to 3 scenarios, e.g. variable vs 10-year fixed vs Flat 35.

**Reference numbers (¥60M, 35 years, equal payments):**

| Rate | Monthly | Total interest |
|---|---|---|
| 1.2% | ¥175,000 | ¥13.5M |
| 1.6% | ¥186,700 | |
| 2.0% | ¥198,800 | ¥23.5M |
| 2.5% | ¥214,500 | |
| 3.0% | ¥230,900 | |
| 3.83% (Flat 35) | ¥259,600 | ¥49.0M |

At 1.2%, a +1-point rise adds ≈¥24k/month.

## 3. The guide: what a first-time buyer should know

### The flow (used condo, roughly 1.5–3 months)
1. **Set the budget first** (simulator). Get a pre-screening (事前審査) at **2–3 banks** before or as you make an offer. It takes 3–7 days and is free; online banks take longer for the full screening.
2. **Offer (買付証明書) → purchase contract.**
   - The deposit (手付金) is usually 5–10% of the price.
   - Make sure the contract has a **loan clause (ローン特約)**: if the loan is refused by a set date, the contract is cancelled and the deposit returned.
3. **Full screening (本審査)** with the documents: income certificates, tax certificates, ID, residence card, and property documents from the agent. Takes 1–3 weeks; it includes the health declaration for the insurance.
4. **Loan contract (金銭消費貸借契約).** Choose the rate type now; the rate is usually the one **at drawdown**, not at application.
5. **Settlement and handover (決済・引渡し).** On the same day the loan is paid out, the seller is paid, the property is registered and the keys are handed over. Buying costs are paid here.
6. **Year 1: file a tax return (確定申告)** to start the mortgage tax credit. From year 2 your employer handles it (年末調整).

### Loan types
- **Variable (変動):**
  - Cheapest now.
  - The rate follows the bank's list rate, which follows the BOJ prime rate. You carry the rate risk.
  - Good if you have a cushion and could repay early or absorb +1–2 points.
- **Fixed for a period (固定期間選択, 3/5/10 years):**
  - Certainty for the early years, when children are small and income may dip.
  - After the period it switches to variable or a new fixed rate, with a **smaller discount**, so read the after-period terms.
- **Full-term fixed (Flat 35, bank full-term):**
  - Highest rate now (≈3.8–4.4%), but no risk.
  - Flat 35 is mostly not judged on job type. For a used flat it needs a **conformity certificate (適合証明)**.
  - It also requires Japanese nationality or permanent residency.
- **Mixed (ミックス):** split the loan, e.g. half variable and half fixed, to spread the risk. The fees may double.

### Two incomes
| Option | How it works | Note |
|---|---|---|
| **Pair loan (ペアローン)** | Two loans, two insurances | Both get the tax credit; double fees; if one dies, only that loan is paid off |
| **Joint debt (連帯債務)** | One loan, both liable | Tax credit for both; fewer banks offer it |
| **Joint guarantor (連帯保証)** | One borrower, the other guarantees | Only the borrower gets the tax credit and insurance |

Think about what happens if one of you stops working (parental leave) or you separate.

### What banks check (MLIT survey of 1,008 lenders, published 2025)
- **Checked by over 90% of lenders:** age at payoff (98%), health / insurance acceptance (95%), age at borrowing (96%), income (93%), years in the job (93%), **repayment ratio (90%)**, property value (91%).
- **Repayment ratio limit:** most lenders use **≤35–40%** of gross income, counting all loans (car loans, card instalments). The test uses a **screening rate of ~3–4%**, not your actual rate.
- **Share of the price they lend:** most allow up to 100% of the price. Some allow 110–150%, covering the buying costs.
- **Time in the job:** most want ≥1 year.
- **Nationality:**
  - 638 lenders accept Japanese nationals; 621 accept permanent residents; only 112 accept the **spouse of a Japanese national**; 38 accept others.
  - Without permanent residency the realistic options are:
    - SMBC (a valid residence status is enough)
    - AEON's non-PR product
    - SBI Shinsei, with a Japanese / PR spouse as joint guarantor
    - Tokyo Star Bank (conditions, Japanese reading and writing)
  - Expect a higher rate or a larger down payment. Your exact situation (visa, spouse, years in Japan) decides which banks to try.

### Costs beyond the rate
- **Buying costs:** 6–9% of the price for a used flat via an agent.
  - Agent fee 3% + ¥60k + tax.
  - Bank fee 2.2% or a fixed fee.
  - Registration and scrivener ~¥0.3–0.6M.
  - Fire and earthquake insurance ¥0.1–0.4M for 5 years.
  - Stamp duty, pro-rated taxes and fees.
- **Running costs:** fees that rise over time (see Deep look §B), property tax, insurance renewal.
- **Insurance choices:** cancer cover is worth considering for a 35-year loan, but compare it with the life and medical insurance you already have.

### Mortgage tax credit (住宅ローン控除, 2026 reform, until 2030)
- **Amount:** 0.7% of the year-end balance, deducted from income tax (and part of residence tax), for 10 or 13 years.
- **Conditions:** income ≤ ¥20M; registered area ≥50 m² (40 m² in some cases, not for the child-household top-up); built 1982+ or with a seismic certificate.
- **Caps for used homes:**
  - Ordinary: ¥20M, 10 years.
  - Energy-standard compliant: ¥20M (child households ¥30M), **13 years**.
  - ZEH-level or certified long-life homes: ¥35M (child households ¥45M), 13 years.
  - Child household = a child under 19, or either spouse under 40.
  - These figures come from tax commentaries; check them on the National Tax Agency (NTA) page before relying on them.
- **Why it matters:** with variable at ~1.2%, the 0.7% credit pays back more than half the interest in the early years. Ask for the energy certificate; it can add 3 years of credit.

### Realistic advice
1. **Size the loan by what you can pay, not what the bank offers.** A bank will lend ~7× income. A safer total housing cost is ≤25% of take-home pay, with room for **+1.5–2 points** of rate rise.
2. **If you choose variable, have a plan for rises:** savings to prepay, or a switch to fixed. Run the rate-shock table now and accept the result in writing to yourself.
3. **Keep cash after the purchase:** 6+ months of living costs plus the first year's fees, plus money for furniture and moving.
4. **Pre-screen at 2–3 banks with different styles:** a megabank, an online bank and a local bank. Apply with the same documents so you can compare the real offers.
5. **Compare total cost** (rate + fees + guarantee + insurance) over 10 years, not the headline rate.
6. **Never sign without a loan clause** (ローン特約) and a realistic deadline for the screening.
7. **Don't take new card or car loans** between the pre-screening and drawdown.
8. **Prepay early, but not by draining your cash.** Prepayment that shortens the term saves the most interest; the tax credit also slightly favours keeping the balance during the credit years.
9. **Review every 2–3 years.** Refinancing makes sense if the gap is >0.3–0.5 points and the balance is large. Watch the fees.
10. **Life events:** parental leave, a job change before the screening (wait until after), adding a second income later.

## 4. Proposals for the site (in order of value)

1. **Loan tab: simulator + guide** (sections 2 and 3). Use presets for the screening rate; save scenarios in the browser; print-friendly layout.
2. **Real monthly cost everywhere:**
   - Each listing card and Deep look report shows "≈ ¥X/month all-in".
   - Use the simulator's settings (down payment, years, rate preset) instead of the fixed 100% / 35 years / 1.0% used today.
   - Update the default 1.0% to ~1.2–1.5% now that the cheapest variable rate is 1.195%.
3. **Rate-shock on cards:** a small "+1%: ¥Y" next to the monthly figure, so variable risk is always visible.
4. **"What can we borrow" in the map:**
   - Turn income + down payment + screening rate into a **budget**.
   - Feed it to the map's budget slider and to the Apartments filters, so the shortlist reflects a loan you could actually get.
5. **Monthly rate table:**
   - A small `data/loan_rates.json` (lender, variable, 10-year fixed, full-term fixed, fee type, notes, PR condition, source, date).
   - I would update it during the monthly sweep (the same scheduled task as the pipeline). Banks publish at the start of each month.
   - Shown as a sortable table with "Use in simulator" buttons.
6. **Loan options for your situation:** a filter by residency (Japanese / PR / spouse of a Japanese or PR / neither) and by income type (single, pair, joint). It shows which lenders accept you and what to bring.
7. **Tax credit by flat:** Deep look already tells the tier. The simulator could show the credit per year and the net cost, and note when an energy certificate adds 3 years.
8. **Checklist and timeline:** the purchase flow as a checklist with dates (offer → pre-screening → contract → full screening → settlement → tax return) and the documents for each step.
9. **Refinance check later:** after buying, enter your loan and get a monthly Telegram note if the market rate is far enough below yours.

## 5. Status (2026-10-13)

Built:
- **1. Loan tab:** simulator, rate-rise table, loan types side by side, borrowing estimate, balance chart, rate snapshot with a "without PR" column, and a guide covering both residency situations (work visa now, PR expected within ~2 years).
- **2. All-in monthly cost** on every card, in the comparison and in Deep look.
- **3. "+1%" rate-rise figure** on cards and in Deep look.
- **Default rate:** 1.525% (SMBC variable, no PR needed), with 10% down and 35 years.

See DATA_LOG item 16 and PARAMETERS.md "Loan". Still open: proposals 4–9.

## Sources
- Mogecheck, [住宅ローン金利2026年10月の最新動向](https://mogecheck.jp/articles/show/51rzNy7XEJ5o4mQ6ZkVv) (bank rates, indices, BOJ timeline, prime-rate change)
- [MUFG 住宅ローン金利 (October 2026)](https://www.bk.mufg.jp/kariru/jutaku/yuuguu/index.html) (rates, list rate, discount, conditions, fee)
- [Flat 35 金利情報 (JHF)](https://www.simulation.jhf.go.jp/flat35/kinri/index.php/rates/top) and [Kumamoto Nichinichi: Flat 35 at a record 3.83%](https://kumanichi.com/articles/2041676)
- [価格.com 住宅ローン金利比較](https://kakaku.com/housing-loan/rate/)
- MLIT, [民間住宅ローンの実態に関する調査 (FY2024 report)](https://www.mlit.go.jp/report/press/content/001880178.pdf) and [press page](https://www.mlit.go.jp/report/press/house02_hh_000216.html)
- Diamond 不動産研究所, [外国人は住宅ローンを借りられる？ 19銀行の比較 (updated 2025-09)](https://diamond-fudosan.jp/articles/-/1111689); [AEON Bank: loan without permanent residency](https://www.aeonbank.co.jp/content/dam/abk/products_list/pdf/without_permanent_residency.pdf)
- Screening rates: [0systems 審査基準](https://0systems.com/lawn-examination-criteria/), [Mogecheck](https://www.mogecheck.jp/articles/show/a1ZbO5YpEWpB2LwWJxeN)
- Fees and insurance: [MUFG コラム 事務手数料](https://www.bk.mufg.jp/kariru/jutaku/column/022/index.html), [Sony Bank 団信](https://sonybank.jp/products/hl/05.html), [Diamond 手数料比較](https://diamond-fudosan.jp/articles/-/1110697)
- 5-year / 125% rules: [現代ビジネス](https://gendai.media/articles/-/125244), [SBI新生銀行 コラム](https://www.sbishinseibank.co.jp/retail/housing/column/vol72.html)
- Tax credit 2026: [Money Forward (2026-07)](https://biz.moneyforward.com/establish/basic/81693/), [税研 令和8年度改正](https://www.zeiken.co.jp/zeikenpress/column/0014zp20260701/), [MOF](https://www.mof.go.jp/tax_information/images/image29.pdf) (check against the NTA page)
- Flat 35 子育てプラス: [野村の仲介 コラム (2026-06)](https://www.nomu.com/loan/column/hashimoto/20260603.html), [NHK 2026-09-15](https://news.web.nhk/newsweb/na/nd-20260915de50254)
