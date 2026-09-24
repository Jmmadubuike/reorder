# 09 — Supply Network and Fulfilment

Status: DRAFT v0.1
Owner: Founder / Ops
Depends on: [03-business-model-and-economics.md](03-business-model-and-economics.md)
Last updated: 2026-09-24

---

## 1. The supply ladder

The brief says "we get those items from importers or manufacturers". That is the destination, not
the starting point. Suppliers have minimum order quantities, credit terms and route expectations
that a new business cannot satisfy. Climb one rung at a time, and only when the rung below is
working.

| Rung | Source | Order size | Price | Credit | Realistic in |
|---|---|---|---|---|---|
| 1 | **Open-market wholesaler** (same market the customer uses) | Any | Market price | Sometimes informal | Week 1 |
| 2 | **Consolidated wholesaler / distributor** | Moderate, per category | Better than market | 7–30 days | Month 1–3 |
| 3 | **Importer / national distributor** | Higher, by carton | Better | Terms negotiable | Month 3–9 |
| 4 | **Manufacturer direct** | MOQ by pallet/container | Best | Terms, sometimes rebates | Year 2+ |

Strategic point: **starting at rung 1 is not a failure, it is the honest way to test demand.** In
phase 0, buying at the same market the customer buys from and delivering is a legitimate test of
whether the customer values delivery — even if the goods margin is thin or zero. What must be
measured is whether the *delivery fee and service* clear their cost.

Once volume exists, the move up the ladder is the margin story, and it is also the story the
investor will want to hear: as Reorder aggregates demand, it buys at better prices and passes some
of that on while keeping the rest.

## 2. Category strategy

Do not launch with everything. Choose categories by these criteria:

| Criterion | Weight | Why |
|---|---|---|
| Consumable, fast-moving | High | Repeats create order frequency |
| Non-perishable or long shelf life (unless cold chain is solved) | High | Expiry and spoilage destroy margin |
| Standard pack sizes with clear barcodes | High | Catalog normalisation is the hardest technical problem |
| Legal to distribute without a special licence for a technology company | Critical | See the pharmacy gate below |
| Available from more than one supplier | Medium | Reduces single-supplier dependency |
| Fragile or bulky | Medium | High delivery cost; only if the customer's trip cost is even higher |

### Recommended phase-1 category shortlist

**[ASSUMPTION — to be confirmed against the client base]** Non-regulated fast-moving consumer goods:
beverages and sachet drinks, cereals and staples, cooking oil, detergent and cleaning items,
packaged snacks, personal care, baby care, and general provisions.

### The pharmacy gate

Medicines are the category where the pain is sharpest (expiry, stockouts, capital) **and** the
category with a hard legal gate. Distributing medicines in Nigeria is not a software activity; it
involves premises registration and a superintendent pharmacist under the Pharmacy Council of
Nigeria, plus NAFDAC requirements for the products themselves. See
[10-compliance-legal-and-risks.md](10-compliance-legal-and-risks.md) for the structural options.

Until that is resolved, the pharmacy conversation should be framed as **software + logistics
service to a licensed pharmacy**, where the pharmacy remains the buyer and seller, and Reorder does
not take title to medicine. That framing must be confirmed legally before any medicine moves.

## 3. Supplier onboarding requirements

No supplier goes live without all of the following recorded:

| Item | Why |
|---|---|
| Verified price list with pack definitions and MOQs | Pack errors are the number-one trust killer |
| Lead time per line or per category | Feeds the restock suggestion engine |
| Fill-rate expectation and substitution policy | Determines what the Sheet can promise |
| Minimum remaining shelf life for dated goods | Prevents short-dated stock reaching customers |
| Return and claim policy in writing | Determines whether Reorder can honour its own promise |
| Payment terms and settlement account | Cash-cycle planning and remittance tracking |
| Delivery capability: own van, Reorder pickup, or both | Determines the fulfilment mode |
| Substitution approval rules | Default is no substitution without customer approval |
| Quality and authenticity documentation for the category | Counterfeit risk is real and reputational |

## 4. Catalog normalisation and pricing governance

This is the least glamorous and most important operational work in the business.

1. Every supplier price list is ingested as a **new immutable version**; live prices only change
   through an approval step.
2. Each supplier line is mapped to one catalog product. Unmapped lines go to a queue, not to the
   customer.
3. Conversions are recorded per supplier (carton of 12 vs carton of 24 is a common trap).
4. Customer-facing price is set by rule (best available supplier offer plus a defined margin band),
   not by ad-hoc quoting.
5. Every price change is attributed to a supplier offer version, so a customer dispute can be
   traced to a cause.
6. A product can never be ordered if its pack conversion or price is unresolved.

## 5. Fulfilment models

| Model | Description | Best for | Main risk |
|---|---|---|---|
| **M1 — Supplier-direct delivery** | Supplier delivers to the retailer on Reorder's order | Formal retail, single-category orders, supplier has idle vans | Supplier meets the retailer and cuts Reorder out |
| **M2 — Reorder pickup and delivery** | Reorder collects from one or more suppliers and delivers consolidated | Formal retail with many suppliers; the "one trip" promise | Handling cost and consolidation time |
| **M3 — Market-buy concierge** | Reorder buys at the market on the customer's behalf and delivers | Phase 0, any category, immediate start | Zero goods margin; entirely dependent on the service fee |
| **M4 — Scheduled cluster runs** | One route, 15–25 drops, fixed day per cluster | Informal retail | Requires density; weak zones are unprofitable |
| **M5 — Micro-hub stocking** | Reorder holds a narrow staple list locally | Phase 4, high-frequency lines with unreliable supply | Working capital and expiry |

Start with M3, add M2 and M4 in phase 2, use M1 where the supplier volunteers it, and treat M5 as a
phase-4 decision per SKU using the criteria in
[03-business-model-and-economics.md](03-business-model-and-economics.md) §6.

## 6. Route and run design

The informal motion is a logistics business with an app, so design the run before the software.

1. **Define the zone** by a walkable/drivable boundary, not by postcode.
2. **Set a minimum order value per zone** so a drop always covers its share of the run cost.
3. **Fix the run day per cluster** and publish it at signup. The promise is a schedule, not speed.
4. **Cap drops per run** based on measured drops-per-hour; a run that cannot finish is worse than a
   run that refuses orders.
5. **Sequence drops** by geography first, then by confirmed availability of the customer.
6. **Require confirmation before dispatch** — an unconfirmed drop is likely a refused drop.
7. **Measure** drops per hour, cost per drop, order value per drop, and confirmation rate. If the
   first three do not converge, change the zone, the minimum, or the run day — not the pricing.

## 7. Availability, substitution and quality

| Rule | Rationale |
|---|---|
| Partial fulfilment must be decided by the customer | Protects trust; never silently short-ship |
| No substitution without explicit approval | Medicine, brand loyalty and price sensitivity all make silent substitution unacceptable |
| Minimum remaining shelf life per category, agreed in writing | Directly addresses the biggest pharmacy and shop complaint |
| Sealed, undamaged, correctly labelled goods only | Counterfeit and tampering risk; reputational protection |
| Photo evidence on every claim | Settles supplier disputes with evidence, not argument |
| Batch/expiry captured at pick for flagged categories | Enables traceability and expiry management |

## 8. Cold chain and other exclusions

Explicitly excluded until deliberately designed and funded: cold-chain goods, flammable items,
controlled substances, and any product requiring a licence Reorder does not hold. Write the
exclusion into the customer onboarding script so the promise is never over-stated.
