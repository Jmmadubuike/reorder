# 12 — Roadmap and Gates

Status: DRAFT v0.1
Owner: Founder
Depends on: [11-validation-plan-and-metrics.md](11-validation-plan-and-metrics.md)
Last updated: 2026-09-24

---

## 1. The evidence standard

This project will be tempted to treat activity as progress. Apply one rule to every gate:

> A gate is passed only by **evidence from a real, completed operation** — not by a plan, a demo, a
> green test suite or a successful compilation.

Specifically, none of the following is proof on its own: code that compiles; a UI that renders; a
model that produces a suggestion; a supplier who says "yes, we can supply"; a customer who says
"this is a great idea". Proof is a dated record of goods delivered, money settled, and a customer who
ordered again.

## 2. Phase overview

| Phase | Name | Duration guide | Code written | Exit evidence |
|---|---|---|---|---|
| P0 | Concierge pilot | 6–10 weeks | None | Delivered orders with real margins, repeat rate and pricing anchor |
| P1 | Reorder Sheet v1 | 8–12 weeks | Yes | Suggestion acceptance above gate; used at close without prompting |
| P2 | Fulfilment operations | 10–16 weeks | Yes | A run completed and reconciled by hired staff inside target cost per drop |
| P3 | Formal retail at depth | 12–20 weeks | Yes | A multi-branch account ordering weekly for 8 weeks without staff intervention |
| P4 | Informal scale, credit, owned supply | Ongoing | Yes | Cluster-level positive contribution for 12 weeks; credit losses inside policy |

## 3. Phase 0 — Concierge pilot

**Entry criteria**

- One city, one zone and one cluster named.
- At least one supplier willing to sell on agreed terms for a defined basket.
- A named person responsible for the pilot, with hours allocated.
- Experiments E1 (market-trip diary) and E2 (supplier quotes) complete.

**Work**

1. Recruit 15 businesses in one zone; 10 formal and 5 informal if both motions are being tested.
2. Build a fixed price list for a 25–50 item basket.
3. Operate a weekly order and delivery cycle using WhatsApp, a spreadsheet and a vehicle.
4. Record every data point listed in §4 of the validation plan.
5. Interview every business that does not reorder, in person, within a week.

**Exit criteria (all must hold)**

- 60% of businesses place a second order within 21 days. [ASSUMPTION]
- Every completed order has a real cost of goods, a real delivery cost and a real price charged.
- A delivery fee has been accepted by at least 8 businesses at a level that covers delivery cost.
- The reason for every non-repeat is documented.

**What must not be built in phase 0:** any app, any POS integration, any rider tool, any automation.
If code is written in phase 0, the pilot is being used to avoid the uncomfortable work of talking to
customers.

## 4. Phase 1 — Reorder Sheet v1

**Entry criteria**

- Phase 0 exit criteria met for at least one segment.
- The Nexarch POS daily sales feed confirmed as technically available, or assisted capture agreed as
  the substitute for the pilot cohort.
- Decisions D1 (model shape) and D2 (vertical order) recorded.

**Work**

1. Identity, tenancy and roles (FR-IDN-*).
2. Catalog with pack conversion and supplier offers (FR-CAT-*).
3. Demand capture: POS feed and assisted stock capture (FR-STK-*).
4. Restock suggestion engine with reasons and edit tracking (FR-RSS-*).
5. Order lifecycle with price snapshots and approvals (FR-ORD-*).
6. Notifications and the per-account metrics dashboard (FR-NOT-*).

**Exit criteria**

- Suggestion acceptance (unedited lines) above 50% in a 4-week cohort, with a falling edit rate.
- Median time from daily close to order approval under 10 minutes. [ASSUMPTION]
- An order placed and delivered end to end without any Reorder staff member touching a spreadsheet.
- Every system invariant in [06-functional-requirements.md](06-functional-requirements.md) §13 has a
  passing test.

## 5. Phase 2 — Fulfilment operations

**Entry criteria**

- Phase 1 exit criteria met.
- At least 3 suppliers onboarded with written terms, price lists and return policies.
- The P2 compliance items in [10-compliance-legal-and-risks.md](10-compliance-legal-and-risks.md)
  complete: insurance, rider engagement, receipts.

**Work**

1. Order queue, exceptions and batching.
2. Runs, drops, pick lists and manifests.
3. Offline rider delivery app with proof of delivery.
4. Cash and transfer reconciliation with variance control.
5. Discrepancies, returns and supplier claims.
6. Supplier portal with availability, price confirmation and masking.
7. Zone, cluster and run administration.

**Exit criteria**

- A run of 15+ drops executed, delivered and reconciled by hired staff, not founders.
- Cost per drop inside the modelled target, with measured drops per hour recorded.
- The ledger balances against orders and payments with zero unexplained variance for 14 consecutive days.
- Zero deliveries closed without proof of delivery.

## 6. Phase 3 — Formal retail at depth

**Entry criteria**

- Phase 2 exit criteria met.
- A second and third supplier available per major category.
- Consolidated ordering demonstrated manually for at least one multi-branch account.

**Work**

- Multi-branch roles and approvals.
- Consolidated ordering across suppliers and price comparison.
- Purchase order and invoice matching.
- Batch and expiry capture.
- Supplier performance scoring and reporting.
- Contract templates and statement formats.

**Exit criteria**

- A 3+ branch account orders weekly for 8 consecutive weeks with no Reorder staff intervention.
- Invoice and statement reconciliation done by the customer's own bookkeeper without support.

## 7. Phase 4 — Informal scale, credit and owned supply

**Entry criteria**

- Phase 2 complete and at least one cluster with measured positive contribution.
- Credit policy, capital allocation and the legal position on lending reviewed.
- Micro-hub SKU list selected using the five-criteria test in document 03.

**Work**

- Free lightweight seller app tuned for 3-tap ordering and low data.
- Agent and cluster tooling with commission visibility.
- Scheduled route engine; only now is optimisation worth building.
- Prepaid wallet, cash-on-delivery settlement and reconciliation.
- Credit ladder with server-computed limits, ageing, dunning and freeze policy.
- Micro-hub stock for the selected staple lines only.

**Exit criteria**

- 25+ kiosks ordering weekly for 12 weeks with run-level and cluster-level positive contribution.
- Credit losses inside the policy cap for two consecutive quarters.
- Support cost per active kiosk falling quarter over quarter.

## 8. Sequencing rules

These exist to stop the most likely form of self-sabotage: building phase-2 software to delay facing
phase-0 questions.

1. No code in phase 0. Spreadsheets and WhatsApp are the phase-0 product.
2. No credit before phase 4, and no credit above rung 1 even then without a written policy.
3. No owned inventory before phase 4, and then only by SKU against the five-criteria test.
4. No third-party POS integration before phase 3, and then only for a named account that justifies it.
5. No medicine movement before the licensing position is settled in writing.
6. No scale-up of the informal motion while contribution per drop is negative.

## 9. Resourcing assumptions

| Phase | Roles required | Notes |
|---|---|---|
| P0 | Founder (sponsor), one pilot operator, one part-time driver | The pilot operator must not also be the developer |
| P1 | One product/eng pair, one pilot operator, founder for customers | Reuse Nexarch identity, tenancy and catalog foundations |
| P2 | Add ops lead, rider(s), picker, part-time support | The ops lead is the hiring decision that determines whether phase 2 succeeds |
| P3 | Add account management and support, plus engineering depth for integrations | Multi-branch accounts need a named human owner |
| P4 | Add credit/collections capability, cluster agents, data/analytics | Only with a written credit policy and capital allocated |

## 10. Common failure modes to watch for

1. **Building for the informal segment first because it feels bigger.** It has the hardest unit
   economics and the highest support cost.
2. **Treating the concierge phase as throwaway.** It is the only phase that produces the numbers
   everything else is built on.
3. **Hiring a rider before establishing route density.** The cost arrives before the revenue.
4. **Letting the product promise outrun the supply network.** A Sheet that suggests items nobody can
   supply is worse than no Sheet.
5. **Accepting medicine movement informally "just for one customer".** This is the fastest way to
   convert a legal gate into a legal problem.
6. **Using supplier float to fund operations.** It works until it does not, and then it is fraud.
