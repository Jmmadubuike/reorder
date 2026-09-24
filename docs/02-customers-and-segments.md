# 02 — Customers and Segments

Status: DRAFT v0.1
Owner: Product
Depends on: [01-opportunity-and-vision.md](01-opportunity-and-vision.md)
Last updated: 2026-09-24

---

## 1. Why the split matters

"Pharmacy, supermarket and mall" and "kiosk" are, commercially, two different companies wearing
one name. Treating them as one segment is the single most likely early mistake, because the
informal side is appealing (huge, untapped) and toxic to unit economics if served the same way
as formal retail.

| Dimension | Formal retail (S1) | Informal retail (S2) |
|---|---|---|
| Typical order value | ₦150,000 – ₦1,500,000 [ASSUMPTION] | ₦5,000 – ₦40,000 [ASSUMPTION] |
| Order frequency | 2–8 per month | 1–4 per month, plus daily top-ups |
| Records | POS exists, partial stock accuracy | None; memory and notebook |
| Payment | Transfer, some POS, some supplier credit | Cash on delivery, informal wholesaler credit |
| Buyer | Owner, sometimes a store manager | The owner is also the shopkeeper |
| Delivery tolerance | Scheduled, next-day acceptable | Same-day or next-morning, at the shop |
| Support cost per account | Low once onboarded | High; needs human help to start |
| Tech | Android/Windows POS, phone | Low-end Android, maybe no device |
| Key pain | Stockouts, expiry, staff time at market | Lost selling time, transport cost, price uncertainty |
| Sales motion | Direct, relationship, POS-led | Cluster, community, agent-led, free software |

**Design rule:** S2 must be profitable at the *route* level, never at the *order* level. A single
kiosk order cannot carry a delivery; twenty kiosk orders on one scheduled run can.

## 2. Segment definitions

### S1 — Formal retail

Businesses that already keep records and can name a product they cannot sell because it is out
of stock.

- **S1a Community pharmacy.** 1–3 branches. Regulated. High SKU count, expiry sensitivity,
  genuine willingness to pay for reliability. See the licensing gate in
  [10-compliance-legal-and-risks.md](10-compliance-legal-and-risks.md).
- **S1b Neighbourhood supermarket / mini-mart.** 1–5 branches. Fast-moving FMCG, high basket
  counts, low tolerance for gaps on staples.
- **S1c Mall / organised chain.** Multi-branch, procurement process, central buying. Attractive
  contract value, slow sales cycle, demanding integrations. Phase 3 at the earliest.

### S2 — Informal retail

Businesses where the owner is the operator and there is no record of sales.

- **S2a Kiosk / table-top.** Very small basket, single owner, sells from the front of a home or a
  roadside stand.
- **S2b Provisions / "supermarket" shop.** Small shop with 200–800 SKUs, daily footfall, buys at
  the market weekly.
- **S2c Neighbourhood group / buying cluster.** Not a customer type but the **unit of delivery**:
  15–30 kiosks inside one walkable zone, served on one scheduled day. Reorder's informal
  economics live or die on this construct.

### S3 — Supply side (not a customer, a partner)

Importers, wholesalers (open-market and consolidated), and manufacturers. They are a
distribution partner and a potential data customer later. Requirements and onboarding in
[09-supply-network-and-fulfillment.md](09-supply-network-and-fulfillment.md).

### S4 — Internal operators

Reorder agent (signs up and services a cluster), picker (prepares the run), rider/driver
(delivers), and ops/credit reviewer. These users need working software too, and their tooling is
often the difference between a proof and a failed pilot.

## 3. Personas

Personas are used to pressure-test journeys in [05-user-journeys.md](05-user-journeys.md) and
requirements in [06-functional-requirements.md](06-functional-requirements.md).

### P1 — Ada, community pharmacy owner (S1a)

- 38, one branch plus a second planned. Two counter staff. Uses Nexarch POS daily.
- Closes sales at 8pm, then sits with a notebook to decide what to buy.
- Loses sleep over expiry and over short-dated stock pushed by wholesalers.
- Goes to market herself roughly twice a month; sends a staff member otherwise.
- **Wants:** never run out of the top sellers; stop buying stock that expires; stop losing a
  counter staff member for a day.
- **Will pay:** a delivery fee if the restock list is right and the goods arrive sealed and
  correctly dated.
- **Will not accept:** wrong pack sizes, short-dated items, undocumented medicines, or a
  substitute without approval.

### P2 — Emeka, supermarket owner (S1b)

- 45, three branches, 14 staff, mall store opening next year.
- Already buys from 6–10 suppliers; keeps a price list on WhatsApp.
- His pain is not the single order, it is comparing prices, chasing deliveries and reconciling
  who supplied what.
- **Wants:** one order, one invoice, one delivery window, prices he can see.
- **Will pay:** for consolidation and reliability; negotiates hard on goods price.
- **Will not accept:** a supplier who undercuts him later using Reorder's price data.

### P3 — Musa, kiosk operator (S2a)

- 26, single kiosk in front of a compound, sells drinks, sachets, biscuits, airtime.
- Buys at the market in person. Transport plus a full day gone; occasionally can't go and simply
  stays out of stock until the next trip.
- Keeps no records. Trusts his memory, which is better than expected for fast movers.
- **Wants:** stock delivered to the kiosk so he does not close the shop to go to market; the same
  price every time, not the market price of the day.
- **Will pay:** a small fee per delivery, if it is clearly less than the cost of the trip.
- **Will not accept:** paying before the goods arrive (initially), an app that needs him to enter
  a full catalog, or a delivery that costs more than transport.

### P4 — Ngozi, provisions shop owner (S2b)

- 34, small shop next to a school, 400+ SKUs, husband helps at weekends.
- Buys at a large market weekly; already knows she is overpaying on some items but has no
  comparison.
- **Wants:** someone to bring the heavy items (rice, oil, detergent) so she only goes to market
  for the light ones.
- **Will pay:** a fee that is below her transport share, especially for heavy goods.
- **Will not accept:** a delivery that arrives when she has no cash.

### P5 — Tunde, Reorder agent (S4)

- 29, works a cluster of 25 kiosks for Reorder, paid base plus commission.
- Needs a phone tool that works offline, shows him who ordered what, and lets him log a sale or a
  refusal in seconds.
- **Wants:** commission visibility.
- **Will not accept:** rekeying information twice, or chasing order errors caused by the system.

### P6 — Chidi, importer / wholesaler (S3)

- 50, imports fast-moving FMCG and consumer health items, runs three vans.
- Wants volume, predictable routes and fewer small stop-offs.
- **Will not accept:** losing direct customer relationships to Reorder, or being asked to extend
  credit he cannot control.

## 4. Jobs to be done

| ID | Job | Segment | Statement |
|---|---|---|---|
| JTBD-1 | Never lose a sale to a stockout on a fast mover | S1, S2 | "When I am about to close, I want to know exactly what will finish tomorrow, so I can restock without thinking." |
| JTBD-2 | Avoid the market trip | S1, S2 | "When I need stock, I want it brought to me, so I can keep the shop open." |
| JTBD-3 | Stop losing money to expiry and dead stock | S1a, S2b | "When I order, I want quantities based on what I actually sold, so I stop buying what sits." |
| JTBD-4 | Know my prices and totals | S2 | "When I order, I want to see what I am paying, so I am not at the mercy of market price of the day." |
| JTBD-5 | Reconcile what I received | S1b | "When the delivery comes, I want one invoice and no surprises, so my records stay clean." |
| JTBD-6 | Sell more without more reps | S3 | "When I look at my route, I want bigger, predictable orders instead of cold calls." |

## 5. Willingness to pay: what they pay today

Establish the baseline before pricing anything. Every Reorder price must be compared to a real
number the customer already lives with.

| Cost the customer bears today | How to measure it in the pilot |
|---|---|
| Transport to and from market | Ask for the exact fare paid last trip; confirm with 10 interviews |
| Value of own time lost | Count the hours; multiply by their own estimate of a day's margin |
| Lost sales during the trip (kiosks close to travel) | Compare sales on the trip day to the average day |
| Price paid at market vs available wholesale price | Collect 20 line items from their last purchase and price them at 2 wholesalers |
| Informal credit received | Ask "if you needed ₦50,000 of stock today, who would give it and on what terms?" |

## 6. Poor-fit customers (anti-personas)

Explicitly exclude these from the pilot. Each one will consume agent time and produce no learning.

- Businesses whose entire stock is one category with a single supplier that already delivers
  (for example a pure beverage depot). There is no trip to replace.
- Businesses with a mandatory central procurement policy that cannot buy from a new supplier.
- Kiosks in areas with no viable route density, where a rider cannot reach 10 drops in a day.
- High-value-low-frequency specialist shops (jewellery, electronics) — the model is built for
  fast-moving consumables.
- Any pharmacy until its regulatory position is settled.
