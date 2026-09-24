# 03 — Business Model and Unit Economics

Status: DRAFT v0.1
Owner: Founder / Finance
Depends on: [02-customers-and-segments.md](02-customers-and-segments.md)
Last updated: 2026-09-24

---

## 1. The uncomfortable structural question

Nexarch is a software company: build once, sell many, gross margin near 100%, no working
capital, no warehouse, no vehicles.

Reorder is a physical distribution business: buy inventory or broker it, move goods, carry
delivery cost, handle returns and chase cash. Different cost structure, different cash cycle,
different failure modes, different regulatory exposure.

**This is not a feature. It is a second company.** It can be the right decision, but it must be
made explicitly, not adopted implicitly because orders started arriving. This is decision
**D1** in [13-open-decisions-and-assumptions.md](13-open-decisions-and-assumptions.md), and it is
the highest-leverage decision in this pack.

## 2. Three possible model shapes

| | **A — Order broker (asset-light)** | **B — Inventory reseller** | **C — Hybrid (A now, B where it pays)** |
|---|---|---|---|
| Goods flow | Supplier delivers and invoices; Reorder is recognised as the channel | Reorder buys from supplier, resells to retailer | Reorder brokers by default, stocks only high-frequency staples |
| Reorder revenue | Commission on goods + delivery fee | Goods margin + delivery fee | Commission + margin on stocked lines + delivery fee |
| Working capital | Near zero | High; buys stock before payment | Moderate and controlled per SKU |
| Gross margin | Thin on goods (2–6%) [ASSUMPTION], full delivery fee | Wider (8–18%) [ASSUMPTION] but only on moved stock | Blended |
| Control of experience | Weak — supplier's van, supplier's dates, supplier's excuses | Strong | Strong where it matters |
| Liability | Mostly supplier's | Reorder's | Per-line |
| Speed to pilot | Days | Weeks of cash and setup | Days for A, weeks per stocked line |
| Scale ceiling | Any; no assets to grow | Limited by cash and vehicles | Highest, if the stocked line is chosen well |

### Recommendation

Start with **A**, then move to **C** only for SKUs where control is the product (see §6).
Do not start with **B**.

Reasoning: the pilot's job is to answer whether the restock list changes buying behaviour. Model
B spends cash and time on logistics before that question has an answer, and it hides the most
important signal — if a supplier's own van can serve the order profitably, the demand exists and
nobody needs to own inventory.

## 3. Revenue lines

Sequence them. Do not turn on more than one at a time.

| # | Line | Who pays | When to introduce | Notes |
|---|---|---|---|---|
| R1 | **Delivery / logistics fee** | Retailer | Phase 0 (immediately) | The honest price of replacing the market trip. Primary early revenue. |
| R2 | **Goods margin or commission** | Retailer, or supplier-paid commission | Phase 0 | Whichever the supply side will accept. Never both silently. |
| R3 | **Supplier service fee / logistics-as-a-service** | Supplier | Phase 2 | The supplier pays for route density and demand visibility; this is often easier than squeezing the retailer. |
| R4 | **Subscription for Reorder software** | Formal retailer | Phase 3, optional | Only after the restock list is demonstrably used daily. Selling software before then competes with the thing you want them to do. |
| R5 | **Credit / float fee** | Retailer | Phase 4, regulated review needed | Lending is a licensed activity with real capital requirements. Treat as a separate business case. |
| R6 | **Data and insight products** | Supplier / brand | Phase 4 | Sell-through and shelf-availability insight. Requires clean consent and a real privacy position. |

### Pricing anchors

Never price from cost alone. Price from the customer's existing alternative:

- **Formal retailer:** anchor to "one market trip avoided" — transport fare plus the value of the
  staff hours spent. If a trip costs ₦12,000 in fare and half a day, a ₦3,000–₦6,000 delivery on
  the same goods is an easy comparison *provided the goods price is not worse*.
- **Informal kiosk:** anchor to the actual fare plus the day's lost selling. For many kiosks the
  trip costs under ₦2,000 in transport but a full day of sales — so the honest anchor is the lost
  sales, not the fare. That is why the fee must be *visibly* smaller than a day's trade.
- **Consistent price promise (S2):** a fixed, published price per item is itself a feature.
  The market's variable price is a pain the kiosk operator feels every trip.

## 4. Unit economics model

Define the variables first so the arithmetic is auditable and every number can be replaced with a
measured value.

Per order, per delivery run, and per account:

| Variable | Symbol | Meaning |
|---|---|---|
| Goods value | `GV` | Value of goods on the order |
| Goods margin rate | `gm` | Reorder's margin on goods (0 if commission-only from supplier) |
| Supplier commission rate | `sc` | Supplier-paid commission if applicable |
| Delivery fee charged | `df` | What the retailer pays for delivery |
| Cost of goods | `COGS` | What Reorder pays or the supplier charges |
| Delivery cost per drop | `dc` | Rider time + fuel + vehicle share allocated per stop |
| Pick/pack cost per order | `pp` | Handling before the run |
| Payment cost | `pc` | Transfer/collection fees |
| Support cost per account | `sup` | Human support, amortised monthly |
| Credit loss | `cl` | Expected default on float extended |

**Order contribution:** `(GV × gm) + (GV × sc) + df − pp − pc − cl`

**Drop contribution:** `Order contribution − dc`

**Run profitability:** `Σ(drop contribution) over drops in the run`

### Worked illustration (illustrative arithmetic, not a plan)

All figures are **[ASSUMPTION]** placeholders chosen only to show which levers matter.

| | Formal (S1a) | Informal kiosk (S2a) |
|---|---|---|
| Goods value `GV` | ₦180,000 | ₦18,000 |
| Goods margin `gm` | 6% | 6% |
| Supplier commission `sc` | 0% | 0% |
| Delivery fee `df` | ₦4,000 | ₦700 |
| Pick/pack `pp` | ₦1,500 | ₦300 |
| Payment cost `pc` | ₦300 | ₦120 |
| Order contribution | ₦13,000 | ₦1,660 |
| Delivery cost per drop `dc` | ₦6,000 | ₦1,400 |
| **Drop contribution** | **₦7,000** | **₦260** |

Read the second column carefully. The kiosk drop barely clears cost, and it only does so because
the delivery cost is assumed to be a *shared route* number, not a dedicated trip. If a rider
delivers one kiosk order alone, that same order loses roughly ₦1,140.

**Conclusion carried into the design:** informal delivery must be batched into scheduled routes
with a minimum of 15–25 drops per run, and the run must be able to refuse to serve a single
isolated kiosk. Route density is not an optimisation; it is the business model.

## 5. Cash conversion cycle

The riskiest part of model B, and a manageable part of model A.

| Model | Buy goods | Collect from retailer | Cash gap |
|---|---|---|---|
| A — broker, supplier invoices retailer | Supplier | Supplier directly, or Reorder collects and remits | Reorder's gap is only the delivery cost, recoverable same day |
| A — broker, Reorder collects on behalf | Supplier | Reorder collects COD/transfer, remits after agreed term | Gap = the remittance term; a float risk, not a capital risk |
| B — reseller | 7–30 days before sale | At or after delivery | Real working capital; scales linearly with revenue |
| B + credit | Worst case | 7–30 days after delivery | Working capital plus default risk |

**Rule:** if Reorder collects money on behalf of a supplier, that money is held, not spent, and the
remittance term must be shorter than the delivery cycle. Never fund operations from supplier float.

## 6. Where inventory is actually justified (model C)

Own stock only when at least two of these are true:

1. The line is a high-frequency staple whose absence breaks the promise ("we did not have rice").
2. Supplier lead time is longer than the customer's replenishment cycle.
3. Supplier pack sizes exceed the retailer's realistic order quantity, so the line must be broken
   down.
4. Supplier quality or dating is unreliable and the customer has been burned.
5. The margin difference between wholesale and resale is wide enough to fund the capital.

Do not stock: slow movers, short shelf-life items, cold-chain items, anything requiring a licence
Reorder does not hold.

## 7. Credit ladder (phase 4, gated)

Credit is the likely unlock for informal loyalty, and the likely source of catastrophic loss.
Ladder it, and never skip a rung.

| Rung | Offer | Unlock condition | Exposure cap |
|---|---|---|---|
| 0 | Prepaid / pay before dispatch | Default | ₦0 |
| 1 | Cash on delivery | 3 successful COD orders | Delivery cost only |
| 2 | Pay within 48 hours after delivery | 8 successful orders, no failed COD | 1× average order value |
| 3 | 7-day float | 3 months of clean history + KYC | 1 week of their typical purchase value |
| 4 | 14-day float, larger limits | 6 months clean history; scorecard | Capped portfolio exposure |

Requirements before any rung above 1: identity verification, a per-account limit that is
**computed server-side only** (see [07-domain-model-and-authz.md](07-domain-model-and-authz.md)),
an ageing report, an explicit dunning process, and a written policy on when an account is frozen.

## 8. Break-even logic

State break-even per unit, not in aggregate, so it can be tested early:

- **Breakeven drops per run** = fixed run cost ÷ average drop contribution. If the run carries
  fewer drops than this, the run must not go.
- **Breakeven orders per agent per day** = agent cost ÷ drop contribution.
- **Breakeven accounts per cluster** = cluster operating cost ÷ average monthly contribution per account.

If the pilot cannot produce a cluster where these three hold simultaneously with real numbers,
the informal motion is not viable and should be redesigned or dropped — not subsidised.

## 9. Margin risks to watch

| Risk | Why it bites | Mitigation |
|---|---|---|
| Customers compare goods price to open-market price only | Market prices swing; Reorder's cost is fixed | Price transparency + delivery fee framed as the product |
| Delivery fee discounted away to win accounts | Kills the only clean revenue line | Fee is standard per zone; discount only in exchange for order minimums |
| Order values drift down | Micro-orders destroy route economics | Order minimum per delivery by zone and segment |
| Substitution and returns | Each return costs two trips | Approval-required substitution; supplier-side return policy |
| Supplier disintermediation | Supplier meets the retailer and cuts Reorder out | Reorder holds the reorder list, the credit record and the route |
| Cash handling by riders | Theft and dispute risk | Virtual-account transfers, rider float limits, daily reconciliation |
