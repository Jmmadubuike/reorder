# 13 — Open Decisions and Assumptions

Status: DRAFT v0.1
Owner: Founder
Depends on: all documents in this pack
Last updated: 2026-09-24

---

## 1. Decision log

Each decision has options, a recommendation and a "needed by" phase. Nothing downstream of a
decision should be built before the decision is recorded.

| ID | Decision | Options | Recommendation | Needed by | Status |
|---|---|---|---|---|---|
| D1 | Business model shape | A broker / B inventory reseller / C hybrid | **A now, C selectively in phase 4** | P0 | OPEN |
| D2 | Vertical order | Pharmacy first / FMCG first / both | **FMCG first; pharmacy as software + logistics (option X1) pending counsel** | P0 | OPEN |
| D3 | Pilot geography | City and zone | **One zone, one cluster, named and physically walked** | P0 | OPEN |
| D4 | Informal motion design | Scheduled cluster runs / agent-assisted on-demand | **Scheduled runs with a fixed day and a zone minimum** | P0 | OPEN |
| D5 | Delivery fee basis | Anchored to market-trip cost / cost-plus / flat per zone | **Anchored to measured trip cost, published flat per zone** | P0 | OPEN |
| D6 | Who sells to the retailer | Reorder as merchant / supplier as merchant | **Supplier as merchant by default; Reorder as merchant only where control is the product** | P0 | OPEN |
| D7 | POS integration depth in phase 1 | Read-only Nexarch feed / CSV / manual | **Read-only Nexarch feed, CSV fallback, assisted capture** | P1 | OPEN |
| D8 | Free software for informal users | Permanently free / free then subscription / free with service commitment | **Free permanently; monetised through delivery and supply** | P1 | OPEN |
| D9 | Credit introduction | Never / phase 4 on Reorder's own book / phase 4 through a licensed financial partner | **Phase 4 only, laddered, and delivered through a licensed financial partner rather than Reorder's own balance sheet** | P4 | OPEN |
| D10 | Entity and liability structure | Reorder inside Nexarch / separate trading entity | **Separate entity for goods movement; confirm with counsel** | P0 | OPEN |
| D11 | Rider engagement | Employees / independent contractors / third-party courier | **Contractors in the pilot with insurance; review at phase 3** | P2 | OPEN |
| D12 | Orders below the zone minimum | Refuse / prompt to top up / hold to the next run | **Prompt to top up, otherwise hold to the next run** | P2 | OPEN |
| D13 | Data sharing with suppliers | Masked demand / named demand with consent / full visibility | **Masked by default; named only with recorded consent** | P2 | OPEN |
| D14 | Suggestion engine approach | Transparent rules / statistical / hybrid | **Transparent rules first; revisit at phase 3 using real edit-rate data** | P1 | OPEN |
| D15 | Owned stockholding | Never / phase 4 selected SKUs / strategically owned | **Selected SKUs at phase 4 only, against the five-criteria test** | P4 | OPEN |
| D16 | Delivery fee collection when the goods are supplier-invoiced | Reorder collects the fee separately / supplier invoices it / bundled | **Reorder collects the delivery fee directly; goods are invoiced separately** | P1 | OPEN |
| D17 | Launch scope of the first build | Three-sided MVP at launch (retailer + ops + supplier) / staged single-surface launch | **Staged: Reorder Sheet first, then fulfilment ops, then the supplier portal** | P1 | OPEN — conflicts with MY_IDEA_REORDER.md §24 |
| D18 | Credit delivery mechanism | Reorder lends on its own balance sheet / a licensed financial partner lends and Reorder supplies the risk data | **Licensed partner lends; Reorder contributes order-history data as the scorecard** | P4 | OPEN |
| D19 | Long-term boundary with consumers | Never serve consumers / serve consumers in a later horizon | **Keep out of scope until phase 4, then revisit as an explicit decision** | P4 | OPEN |
| D20 | Retailer types at launch | Every retail type in the idea document / fast-moving consumables only | **Fast-moving consumables only; restaurants, electronics, beauty and building materials excluded from launch scope** | P0 | OPEN |

## 2. How to use the decision log

1. Make the decision.
2. Record the date, the decider and the reason.
3. Update every affected document in this pack so the pack does not silently contradict the decision.
4. If a later decision reverses an earlier one, mark the earlier entry `SUPERSEDED` and keep it. The
   record of reversals is itself useful when the business is reviewed.

## 3. Assumption register

Assumptions are beliefs that would change the design if they are wrong. Each has a cheap verification
method and a stated consequence.

| ID | Assumption | If wrong | How to verify | By |
|---|---|---|---|---|
| A1 | Retailers can quantify what a market trip costs them | The pricing anchor disappears and willingness to pay becomes guesswork | Diary study E1 with 20 businesses | P0 |
| A2 | Retailers will pay a delivery fee on top of the goods cost | The revenue model collapses to goods margin alone | Concierge pilot E3 with real invoices | P0 |
| A3 | At least one supplier will sell at a price that leaves room for a service fee | No margin to fund delivery; the broker model fails | Quote study E2 with 5 suppliers | P0 |
| A4 | Nexarch POS can expose a reliable daily sales feed | Phase 1 needs assisted capture, which is costlier and less accurate | Technical confirmation before phase 1 planning completes | P1 |
| A5 | Daily sales are a good enough predictor of next-cycle demand | Suggestions are wrong and trust never forms | Restock list test E4, measured by edit rate | P0–P1 |
| A6 | Pack conversion can be resolved for the chosen categories | Ordering becomes error-prone and disputes follow | Catalog normalisation exercise on 100 real SKUs | P1 |
| A7 | Kiosk owners will use free software enough to self-serve | Agent cost stays permanently attached to every order | Cluster pilot E5, unassisted order share | P4 |
| A8 | 15–25 drops fit one scheduled run in the target zone | Delivery cost per drop exceeds contribution | Time and motion study during E5 | P2 |
| A9 | Cash on delivery and transfer are both workable at kiosk level | Only prepaid works, which reduces adoption | Payment mix recorded during E5 | P4 |
| A10 | Pharmacy expiry loss is a genuine, quantified pain | The pharmacy vertical loses its differentiation | Pharmacist interviews E7 with real write-off figures | P0 |
| A11 | A licensed partner will allow Reorder to operate as software plus logistics | Pharmacy must be dropped, or Reorder must become licensed | Counsel session plus one partner discussion | P0 |
| A12 | Supplier lead times are short enough for a weekly cycle | The replenishment cycle must lengthen, changing the product promise | Lead time recorded per supplier in the quote study | P1 |
| A13 | Riders can be recruited and retained at the modelled cost | Cost per drop rises above the model and the informal motion fails | Recruit and run for 4 weeks during E5 | P2 |
| A14 | The open-market price is not consistently below Reorder's cost | Reorder cannot compete on price at all, only on service | Price comparison of 50 items across 2 wholesalers | P0 |
| A15 | Customers will not defect back to the market after the pilot ends | Retention problem appears only at scale | Track repeat rate for 8 weeks after the pilot ends | P1 |
| A16 | A fixed published price is itself a valued feature for informal buyers | Pricing power is weaker than assumed and the fee is squeezed | Pricing sensitivity test E6 | P0 |
| A17 | Aggregated purchasing produces better supplier prices at pilot scale | Aggregation is a phase-3 payoff, not an early lever; no pricing promise may depend on it | Ask 3 suppliers what volume would change their price, during the quote study E2 | P0 |
| A18 | Suppliers will accept masked demand and will not insist on retailer contact details | The supply model depends on direct retailer access and Reorder is disintermediated | Test the masking position with 2 suppliers during E2 | P0 |
| A19 | Restaurants, beauty stores, electronics shops and building-material sellers share the replenishment behaviour of the core segment | Launch scope is broader than the unit economics support; support cost rises before margin does | Observe 5 such businesses alongside the pilot cohort before adding them to scope | P1 |

## 4. Conflicts between this pack and MY_IDEA_REORDER.md

The founder's idea document and this pack agree on the core thesis. These are the specific points
where they diverge, and each is a decision to be made rather than a discrepancy to be quietly
resolved by whichever document is read last.

| # | Point of divergence | Idea document | This pack | Decision |
|---|---|---|---|---|
| X1 | Who buys the goods from the supplier | §9.1 — Reorder purchases at wholesale and resells at a markup, with a worked ₦600 margin on ₦8,000 | Doc 03 §2 — broker by default; Reorder takes title only where control is the product | D1 |
| X2 | Scope of the first build | §24 — 13 capabilities across retailer, ops and supplier surfaces at launch | Doc 04 §2 — code-free phase 0, then the Sheet, then ops, then the supplier portal | D17 |
| X3 | Pilot scale | §26 — 50–100 retailers and 10–20 suppliers in the first deployment | Doc 12 — 15 businesses in phase 0, because no software exists yet | D3, D20 |
| X4 | Delivery model at the start | §13 — third-party logistics partners in phase 1, then dedicated partners | Doc 09 §5 — market-buy concierge and scheduled cluster runs before logistics partners | D4 |
| X5 | Retailer types in scope | §5.1 and §14 — restaurants, beauty stores, electronics, building materials, hospitality and office supplies | Doc 02 — fast-moving consumables only | D20 |
| X6 | Consumers in the long-term chain | §28 — manufacturers down to consumers | Doc 01 §8 — explicitly not a consumer marketplace | D19 |
| X7 | Credit | §28 — working-capital products through financial partners | Doc 03 §7 — a credit ladder, which reads as Reorder lending | D18 |
| X8 | Supplier-paid services | §9.5 — demand analytics, product placement and promotional campaigns | Doc 07 §5 and risk R6 — masking by default, because these services trade against retailer trust | D13 |

**Reading the table.** Every row is a case where the idea document is directionally right and the
pack is deliberately narrower because the narrower version is what can be tested first. The
disagreements are about sequence, not about the destination.

## 5. Open questions for the founder

These need an answer from the founder, not from research. They are listed here so they are not lost.

1. **Ambition and horizon.** Is Reorder intended to become the distribution layer for Nigerian retail,
   or a service attached to the POS business? The answer changes funding strategy, hiring, and the
   acceptable level of risk.
2. **Capital available for goods.** How much working capital exists, if any, for buying stock or
   floating supplier terms? Zero capital is workable under model A and impossible under model B.
3. **Founder time allocation.** Who runs the physical operation in phases 0 and 2? Concierge logistics
   is a full-time job and shares time poorly with building software.
4. **Existing customer base.** How many live Nexarch POS customers exist, in which city and which
   category? That list is the cheapest possible pilot cohort, and its composition should determine the
   pilot zone.
5. **Vehicle access.** Is there a vehicle, a driver, or a courier relationship available for phase 0?
6. **Risk appetite on money handling.** Is the founder willing to collect cash on behalf of suppliers
   in phase 0, or should payments default to transfer-only?
7. **The informal decision.** Is the informal motion being pursued because it is strategically
   important, or because it looks like volume? It is the harder of the two motions and should only be
   pursued deliberately.
8. **Exit and control.** Would Reorder accept a relationship where a licensed partner owns the
   customer and the goods, with Reorder as the technology and logistics layer?
9. **Definition of success.** What specific result at the end of 12 months would make this a success,
   and what would make the founders stop? Writing this down now prevents the goalposts from moving.
