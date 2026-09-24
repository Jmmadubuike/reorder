# 11 — Validation Plan and Metrics

Status: DRAFT v0.1
Owner: Founder / Product
Depends on: [03-business-model-and-economics.md](03-business-model-and-economics.md)
Last updated: 2026-09-24

---

## 1. Why validation comes before the build

The idea contains several assumptions that would each change the design if they are wrong. Writing
software first converts an uncertain assumption into an expensive commitment. The cheapest possible
test of "will a retailer pay a delivery fee for a restock order generated from their own sales" is a
WhatsApp thread, a price list and a vehicle.

Each hypothesis below is written so that it can be **falsified**. A hypothesis that cannot be
falsified is a belief.

## 2. Hypotheses and falsification criteria

| ID | Hypothesis | Test | Falsified if |
|---|---|---|---|
| H1 | A retailer will pay a delivery fee for restock it did not fetch itself | Concierge pilot with 15 businesses in one zone, 3 weeks | Fewer than 40% place a second order within 21 days |
| H2 | The delivery fee plus goods margin beats the customer's existing trip cost | Measure real trip transport, time and lost sales in 20 interviews, then price against it | No price exists that the customer accepts and that covers delivery cost |
| H3 | Daily sales data produces a restock list the owner trusts | Generate the list manually at close for 2 weeks and count edits | The owner changes more than half the lines and edits do not fall over time |
| H4 | Suppliers will sell to Reorder at a price that leaves room to serve the customer | Ask 5 suppliers for wholesale price and terms on a named basket | No supplier quotes better than the open-market price Reorder already pays |
| H5 | Informal kiosk orders can be batched into a profitable scheduled run | Build one cluster of 20+ kiosks and run scheduled deliveries | Cost per drop exceeds drop contribution for 4 consecutive runs after correction |
| H6 | Kiosk owners will adopt free software enough to self-serve orders | Offer the free app to a cluster and measure unassisted ordering | Fewer than 30% of orders are placed without an agent present after 6 weeks |
| H7 | Expiry and short-dated stock is a strong enough pharmacy pain to drive adoption | Interview 15 pharmacists on last month's expiry write-offs | Pharmacists cannot quantify expiry loss or do not rank it in their top three pains |
| H8 | Reorder can serve informal users without a per-account human cost that exceeds margin | Measure support minutes per active kiosk per week | Support cost per kiosk exceeds its monthly contribution |

## 3. Experiment sequence

| # | Experiment | Duration | Cost profile | Output |
|---|---|---|---|---|
| E1 | **Market-trip diary study.** Walk 20 businesses and record the last market trip in detail: fare, hours, items, quantities, prices paid | 1–2 weeks | Researcher time only | The price anchor and the target basket |
| E2 | **Supplier quote study.** Ask 5 wholesalers or importers to quote a fixed basket of 25 items with MOQ, lead time and terms | 1–2 weeks | Time only | The achievable cost of goods and the supply ladder entry point |
| E3 | **Concierge pilot, formal.** 15 businesses, one zone, weekly order and delivery, all recorded in a spreadsheet | 4–6 weeks | Goods float or supplier-credit arrangement, plus delivery cost | Proof or disproof of H1, H2, H4 |
| E4 | **Restock list test.** Generate the list manually from POS exports or receipts; count edits and reasons | 4 weeks, alongside E3 | Time only | Proof of H3 and the acceptance test for the suggestion engine |
| E5 | **Kiosk cluster pilot.** 20–25 kiosks in one zone, fixed run day, cash on delivery and transfer | 6–8 weeks | Delivery cost, agent cost, some working capital | Proof or disproof of H5, H6, H8 |
| E6 | **Pricing sensitivity test.** Offer three delivery fee levels across comparable zones or weeks | 3–4 weeks | Opportunity cost | The price the customer accepts and the drop it causes in order rate |
| E7 | **Pharmacy pain and legal study.** 15 pharmacist interviews plus a counsel session on the licensing position | 2–3 weeks | Counsel fees | Confirms or redirects the pharmacy vertical |

## 4. What the concierge pilot must record

Capture the data the software will later automate. If it is not recorded during the pilot, the
software has nothing to reproduce.

| Data point | Why it exists |
|---|---|
| Order date, delivery date, order value, line count | The core commercial unit |
| Cost of goods and price charged, per line | Margin truth, not an estimate |
| Delivery cost: rider time, fuel, vehicle share | The number that decides whether the model works |
| Time spent per order by Reorder staff | The hidden cost that kills "concierge forever" |
| Payment method and settlement date | Cash-cycle and fraud exposure |
| Suggestion acceptance rate and edit reasons | The product's core quality metric |
| Reason for non-repeat, in the customer's own words | The most valuable qualitative output |
| What the customer asked for that Reorder could not supply | The demand the supply network is missing |

## 5. Metric definitions

### North star

**Reorder rate** — the share of active businesses that place at least one order in a given week from
a Reorder-generated list, or in phase 0 from Reorder's restock proposal.

This is the right north star because it captures both the behavioural change (they buy through
Reorder) and the product's core value (the list is trusted). Gross merchandise value alone can be
inflated by one large account and says nothing about whether the list works.

### Input metrics

| Metric | Definition | Target shape |
|---|---|---|
| Suggestion acceptance rate | Lines accepted without edit divided by lines suggested | Rising week over week |
| Edit rate per SKU | Edits divided by suggestions, per product | Falling for the top 100 SKUs |
| Order frequency | Orders per active business per month | Rising |
| Average order value | Goods value divided by orders | Stable or rising in real terms |
| Repeat rate | Businesses ordering again within 21 days | Above 60% [ASSUMPTION] |
| Drops per run | Delivered drops divided by runs | Rising toward the run cap |
| Cost per drop | Run cost divided by drops | Falling toward the modelled target |
| Fill rate | Lines delivered divided by lines ordered | Above 90% [ASSUMPTION] |
| Discrepancy rate | Disputed lines divided by delivered lines | Below 5% [ASSUMPTION] |
| Payment punctuality | On-time payments divided by payments due | Rising |

### Guardrail metrics

These must not degrade while the input metrics improve. They exist to catch growth that is bought
rather than earned.

| Guardrail | Why |
|---|---|
| Contribution per drop | Protects against volume growth with negative unit economics |
| Cash variance per run | Protects the ledger and the rider relationship |
| Return and write-off value | Protects margin and signals a supply or picking problem |
| Support minutes per account | Protects against a concierge cost structure disguised as software |
| Supplier fill rate | Protects the customer promise |
| Expiry write-off at the customer | Protects the core pharmacy and shop value claim |

### Business and investor scorecard

Adopted from [../MY_IDEA_REORDER.md](../MY_IDEA_REORDER.md) §27 so the pack and the narrative use one
metric set. These are the board and investor-facing view; the north star and input metrics above
remain the operating view.

| Metric | Group | Definition | Reporting note |
|---|---|---|---|
| Active retailers | Growth | Businesses with at least one order in the period | Always state the activity window; never quote a raw account count |
| Monthly active retailers | Growth | Distinct businesses ordering in a calendar month | The denominator for retention and for orders per retailer |
| Orders per retailer | Growth | Orders divided by active retailers | The behavioural-change metric the whole model rests on |
| Average order value | Growth | Goods value divided by orders | Watch deflation; pair with the zone minimum order value |
| Monthly procurement value | Growth | Goods value transacted per month | The GMV equivalent for a restocking business |
| Retailer retention | Growth | Businesses ordering in month N that also order in month N+1 | Report by cohort, never blended |
| Gross merchandise value | Growth | Total goods value transacted | Only ever quoted alongside contribution margin |
| Supplier fill rate | Supply | Lines supplied divided by lines ordered | Already a guardrail |
| Product availability | Supply | SKUs available on the day divided by SKUs listed | The promise behind the Sheet |
| Average procurement cost | Supply | Weighted cost per line, against the customer's previous price | The input to procurement savings |
| Average procurement savings | Supply | Customer's prior price minus Reorder price, per line | Requires the baseline from experiment E1; it cannot be computed without a before-price |
| Average supplier lead time | Supply | Order placed to available, per supplier | A first-class input to the suggestion engine |
| Delivery success rate | Logistics | Drops delivered divided by drops attempted | Report first-attempt and final-attempt separately |
| Average delivery cost | Logistics | Run cost divided by drops | The same figure as cost per drop |
| Average delivery time | Logistics | Dispatch to proof of delivery | The customer-visible promise behind the run schedule |
| Stockout rate | Retail outcome | Days a tracked SKU is unavailable at the retailer, divided by tracked SKU-days | The outcome the product exists to reduce; restrict to the top SKUs or it is unmeasurable |
| Order cancellation rate | Retail outcome | Cancelled orders divided by submitted orders | Split supply-caused cancellations from customer-caused; the first is a network failure |
| Customer acquisition cost | Business | Fully loaded cost per activated retailer | Include agent time and onboarding cost, not only media spend |
| Lifetime value | Business | Contribution per retailer over the retention horizon | Compute on contribution, never on revenue |
| Contribution margin | Business | Per order and per drop | The only margin that decides viability; see doc 03 |
| Revenue | Business | Service fees plus goods margin plus commissions | Always reported disaggregated by revenue line |

**Reporting rules.** Every growth metric is quoted with a contribution metric beside it, or it is not
quoted. Customer acquisition cost is compared against contribution, not against revenue. Stockout
rate and procurement savings require a baseline captured before the order, so both depend on the
concierge pilot recording the data listed in §4.

## 6. Kill criteria and pivot triggers

Agree these in advance, while the founders are still objective about them.

| Condition | Trigger |
|---|---|
| H1 falsified after two pilot cohorts | Stop building the software. The customer does not value delivery enough to pay for it. |
| H5 falsified after four corrected runs | Stop the informal motion, or restrict it to zones where density already exists. |
| No supplier will quote competitive wholesale prices | Pivot to a software and routing service sold to suppliers, not a goods intermediary. |
| Pharmacy licensing position blocks supply with no viable partner | Drop the pharmacy vertical from the roadmap and record the decision. |
| Contribution per drop negative for 8 consecutive weeks after correction | Stop scale-up and redesign fulfilment before onboarding another account. |
| Support cost per account rising rather than falling | The product is not reducing work. Fix the product before adding accounts. |

## 7. Decision rule

Do not begin phase 1 development until experiments E3 and E4 have produced real numbers, and do not
begin phase 2 until at least one run has been completed and reconciled by hired staff.
