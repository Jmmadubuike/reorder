# 01 — Opportunity and Vision

Status: DRAFT v0.1
Owner: Founder
Depends on: [../README.md](../README.md), [00-vision-and-positioning.md](00-vision-and-positioning.md)
Last updated: 2026-09-24

---

## 1. Problem statement

A retail business in Nigeria — a community pharmacy, a neighbourhood supermarket, a mall
store, a kiosk — runs on a simple loop: sell stock, notice something is finishing, close the
shop, travel to the market, buy replacement stock, carry it back, price it, shelve it. That
loop is repeated hundreds of times a year and it is the least valuable half of the owner's day.

The loop has three failures, and they compound:

| Failure | What it costs the retailer |
|---|---|
| **Stockouts** | Lost sales on the exact items that sell fastest. The owner usually notices too late to fix it that day. |
| **The market trip** | Pure transport cost plus half a working day of the owner's time, every trip. For a kiosk operator this can be a full day of forgone sales. |
| **Working capital drag** | Because trips are expensive, owners buy big and infrequently, which ties cash in slow-moving stock and creates expiry and dead-stock losses. |

On the other side, importers, wholesalers and manufacturers have the mirror-image problem:
they carry inventory, employ sales reps and run vans to reach a long tail of small retailers
they cannot see into. They do not know what a shop actually sold today, so they push stock
rather than replenish demand, and they pay for that with returns, credit losses and idle
field capacity.

## 2. Why the loop is still manual

Not because nobody wants to fix it. Because the two sides cannot see each other:

- Small retailers cannot produce a trustworthy restock list. They know it in their head.
- Suppliers have no visibility into a shop's sell-through, only its purchase history.
- Nobody has an incentive to pay for the connective tissue, because the retailer's own
  alternative — the market — is cheap for small quantities and financed by informal credit.

The retailer's baseline is therefore stronger than it looks. Any replacement must beat
**market price + transport cost + the value of the owner's time**, and match the informal
credit they already get from a wholesaler they have known for years.

## 3. The insight

Nexarch already owns the moment of truth: **the close of the day's sales**. At that moment the
POS knows every item sold, at what quantity, on which day, at what price. Nothing else in the
market knows that. A supplier's van rep, a wholesaler, an aggregator — none of them can
generate a restock list as accurately as the system that recorded the sales.

So the product is not "POS plus a delivery app". The product is:

> Turn daily sales into a trustworthy, ready-to-order restock list, and make fulfilling that
> list effortless and reliable.

This reframing matters commercially. The restock list is a data asset that improves with every
day of usage — it learns velocity, seasonality, pack sizes, lead times and shelf life. The
delivery van is not an asset, it is a cost line. Whoever holds the list holds the demand.

## 4. The three-layer model

| Layer | What it is | Who owns it today | Reorder's role |
|---|---|---|---|
| **Demand capture** | Sales, stock and catalog data at the retailer | Partially: Nexarch POS for some, paper or memory for most | Own it, for free where necessary |
| **Replenishment intelligence** | Convert sales + stock + supplier lead time + pack size into a suggested order | Nobody | Own it, and make it the differentiated product |
| **Physical fulfilment** | Source, pick, deliver, confirm, settle | The owner walking to the market | Start asset-light, add control only where quality demands it |

## 5. Vision

> Every small retailer in Africa closes the day's sales and finds the restock order already
> written — correctly sized, correctly priced, delivered before opening.

## 6. Mission (first 24 months)

Prove, in one city and one product category, that a retailer will pay a delivery fee for a
restock order generated automatically from their own sales data, and that the order can be
fulfilled profitably with a supply chain Reorder does not have to own.

That is deliberately narrow. Everything else in this pack is downstream of proving it.

## 7. Value proposition by segment

State the promise in the customer's own unit of value, not in features.

### Formal retail (pharmacy, supermarket, mall store)

| They buy today | Reorder's promise | How it is measured |
|---|---|---|
| Transport + half a day, 2–4 times a month | "Your restock order is written before you close. You approve it on your phone. It arrives tomorrow." | Market trips avoided per month; stockout days on top-50 SKUs |
| Cash tied up in slow stock | "Order smaller, more often, on the items that actually move." | Inventory days; dead stock value |
| Expiry and short-dated stock losses (pharmacy) | "We will not send you stock with less than the agreed remaining shelf life." | Expiry write-off value per quarter |

### Informal retail (kiosk, table-top, provisions)

| They buy today | Reorder's promise | How it is measured |
|---|---|---|
| A market trip costing transport, a whole day and exposure to "market price of the day" | "Log your sales in the free app. Order what finished. We bring it to your shop." | Trips avoided; cost per delivery vs cost per trip |
| No records at all | "You will finally know what you sold last week." | Weekly retention on the app |
| Credit from a familiar wholesaler | "Pay cash on delivery, or build a record and unlock a float." | Credit default rate; repeat order rate |

### Suppliers (importer, wholesaler, manufacturer)

| They have today | Reorder offers | How it is measured |
|---|---|---|
| Idle van and rep capacity chasing long-tail shops | Predictable, batched, pre-paid or pre-authorised demand | Drop size; drops per run; cost per drop |
| Returns and short-dated stock pushed to retailers | Clean orders, honest sell-through data, agreed return rules | Return rate; fill rate |

## 8. Non-goals (what Reorder is not)

Writing these down prevents scope drift later.

- **Not** a consumer marketplace. The buyer is a business or a micro-business, not a household.
- **Not** a cash-and-carry warehouse business. Owning warehouse shelf space is a phase-4 decision,
  not a v1 assumption (see [03-business-model-and-economics.md](03-business-model-and-economics.md)).
- **Not** an on-demand courier. Reorder schedules fulfilment; it does not promise 30-minute delivery.
- **Not** a credit company in year one. Credit is a later layer unlocked by order history.
- **Not** a full ERP. Reorder does not promise accounting, payroll or tax filing.
- **Not** a pharmacy wholesaler until the licensing position is resolved
  (see [10-compliance-legal-and-risks.md](10-compliance-legal-and-risks.md)).

## 9. Market framing

This pack deliberately contains **no market size numbers**. [ASSUMPTION] Any figure produced
before a bottom-up count would be invented, and an invented TAM is worse than none because it
gets quoted to investors as if it were measured.

Instead, size the market bottom-up in the pilot city using this method, and record the results
in [11-validation-plan-and-metrics.md](11-validation-plan-and-metrics.md):

1. Count retail outlets of each target type within the pilot delivery radius (field walk, not
   desktop research).
2. Estimate average monthly restock spend per outlet by category, from 20 structured interviews.
3. Multiply by Reorder's realistic capture rate, then by gross margin plus delivery fee per order.
4. Sanity-check against the number of deliveries one van and one agent can physically complete
   per day. **The logistics ceiling usually binds before the market ceiling does.**

## 10. Why now

- **POS penetration is rising** in formal retail, so the demand signal increasingly exists in
  digital form; Nexarch already supplies part of it.
- **Payment rails are commodity.** Virtual accounts, transfers and instant settlement make
  cash-on-delivery reconciliation far easier than it was five years ago.
- **Delivery behaviour is normalised** for households and increasingly for businesses.
- **Supply side is under pressure.** Importers and manufacturers with idle van capacity have a
  reason to hand last-mile delivery to someone with better route density.

None of these are proofs. They are reasons the cost of a pilot is now low enough to be worth
running before any platform build.
