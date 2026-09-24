# 10 — Compliance, Legal Position and Risk Register

Status: DRAFT v0.1
Owner: Founder
Depends on: [09-supply-network-and-fulfillment.md](09-supply-network-and-fulfillment.md)
Last updated: 2026-09-24

---

## Important caveat

**This document is not legal advice and no regulatory position in it should be treated as
confirmed.** It is a structured list of the areas that must be verified with Nigerian counsel
before Reorder trades, hires riders, moves goods or handles money. Every item below is marked with
its verification status.

The purpose of writing it now is to stop development from running ahead of a decision that can
legally stop the business.

---

## 1. Why this is a gate and not a checklist

There is a structural difference between the two halves of the idea:

- **Selling software and logistics services** is a normal commercial activity.
- **Buying and reselling regulated goods — especially medicines — is a licensed activity** tied to
  registered premises and named professionals.

If Reorder takes title to medicines or operates as a wholesale pharmacy without the required
registration, the exposure is not a fine; it is the business model. That is why the vertical order
of the roadmap is itself a legal decision.

## 2. Registration and structure checklist

| # | Area | Why it matters | Verification status |
|---|---|---|---|
| C1 | Company registration, share structure, and the relationship between Nexarch Technologies and the Reorder trading entity | Determines liability, tax and who holds which licence | **TO VERIFY** |
| C2 | Whether Reorder trades as a division of Nexarch or as a separate entity | Distribution risk should not sit against the software business that customers depend on | **TO VERIFY** |
| C3 | Tax registration and treatment: VAT on goods and on the delivery/service charge, and withholding on supplier payments | Two distinct tax treatments in one invoice; a real pricing input | **TO VERIFY** |
| C4 | Pharmacy wholesale and premises registration, and the required superintendent pharmacist, if medicines are resold | Blocking requirement for the pharmacy vertical | **TO VERIFY — BLOCKING** |
| C5 | Product registration requirements applicable to the categories distributed | Product-level registration and labelling obligations | **TO VERIFY** |
| C6 | Standards and category requirements for regulated manufactured goods | Applies to certain goods, and to locally manufactured ones | **TO VERIFY** |
| C7 | Food handling, storage and hygiene requirements if consumables are stored | Premises obligations | **TO VERIFY** |
| C8 | Data protection: registration and obligations as a data controller, including delivery photos and location data | Reorder collects personal and location data at scale through riders | **TO VERIFY** |
| C9 | Rider engagement status: employee vs independent contractor, insurance, and road/vehicle compliance | A live compliance area in Nigerian last-mile logistics | **TO VERIFY** |
| C10 | Goods-in-transit and public liability insurance | A single vehicle incident can exceed the pilot's whole budget | **TO VERIFY** |
| C11 | State and local government levies, market association requirements, and haulage or route permits | Operational interruption risk if unaddressed | **TO VERIFY** |
| C12 | Consumer-facing obligations: receipts, complaint handling, return rights | Governs the returns policy in the fulfilment document | **TO VERIFY** |
| C13 | Money handling: whether collecting on behalf of suppliers triggers any payment-services obligations | The collection-on-behalf model is exactly where this risk sits | **TO VERIFY** |

## 3. Structural options for the pharmacy vertical

Three options. Each has a different risk and a different cost.

| Option | Structure | Reorder's exposure | Speed | Recommendation |
|---|---|---|---|---|
| **X1 — Software + logistics only** | The licensed pharmacy remains the buyer and seller. Reorder provides the restock list, sourcing coordination and delivery as a service, and never takes title to medicine | Lowest | Fastest | **Start here** |
| **X2 — Partner with a licensed wholesaler** | A licensed distributor is the seller of record and the merchant; Reorder is the demand and delivery layer | Low to moderate | Fast | **Use in parallel**, contingent on the partner's terms |
| **X3 — Licensed in Reorder's own name** | Reorder registers premises and engages a superintendent pharmacist to become a wholesaler | Highest, and permanent | Slow, capital and staffing | **Revisit only when volume justifies it** |

The commercial consequence of X1 is worth stating plainly: without title to the goods, Reorder's
goods margin from pharmacy may be thin or zero, and the revenue must come from the service fee and
the supply-side commission. That is still a viable business — but it is a different financial
profile from the one implied in the original idea, and it must be priced accordingly.

## 4. Compliance requirements by phase

| Phase | Compliance work required before starting |
|---|---|
| P0 — Concierge | Business registration in order; written terms for the pilot; supplier agreement covering returns and dating; basic rider agreement and insurance |
| P1 — Reorder Sheet | Data protection position in place; consent language for data sharing with suppliers; tax treatment of service fees confirmed |
| P2 — Fulfilment | Goods-in-transit and liability insurance; rider engagement model documented; receipts and complaint process live; supplier claims policy agreed in writing |
| P3 — Formal retail at depth | Contract templates for multi-branch accounts; invoice and statement format reviewed; supplier terms standardised |
| P4 — Informal scale, credit, owned supply | Credit (lending) analysis with counsel; premises requirements for any stockholding; levy compliance per zone |

## 5. Risk register

Likelihood and impact are rated High / Medium / Low. Rating the risks honestly now is cheaper than
discovering them in a failed run.

| ID | Risk | Category | Likelihood | Impact | Mitigation | Phase |
|---|---|---|---|---|---|---|
| R1 | Reorder takes title to medicines or regulated goods without the required licence | Legal | Medium | Critical | Adopt option X1 until counsel confirms the position; block the category in the product and in writing | P1 |
| R2 | Goods margin plus delivery fee does not beat the customer's market-trip cost | Commercial | High | Critical | Anchor pricing to measured trip cost in phase 0; test willingness to pay before building | P0 |
| R3 | Informal route economics fail because zone density is too low | Operational | High | Critical | Zone minimum order value, cluster-first onboarding, refuse isolated drops, measure cost per drop weekly | P2 |
| R4 | Restock suggestions are wrong and destroy trust | Product | Medium | High | Show reasoning per line, keep suggestions conservative, track edit rate, feature-flag the engine | P1 |
| R5 | Pack conversion errors (carton vs piece) cause financial damage | Product / Ops | Medium | High | Pack validation at entry and pick; no ordering without resolved conversions; audit trail | P1 |
| R6 | Supplier disintermediates Reorder after the first orders | Commercial | High | Medium | Mask contact details by default, hold the restock list and the route, agree non-solicit terms | P2 |
| R7 | Cash-on-delivery loss through rider default or dispute | Fraud | Medium | High | Transfer-first payment, rider float limits, deposits, daily reconciliation, no run closure with variance | P2 |
| R8 | Counterfeit or short-dated stock enters the network | Quality / Reputational | Medium | High | Authenticated suppliers only, minimum remaining shelf life, batch and date capture at pick | P2 |
| R9 | Customer never reorders after the novelty of the first delivery | Commercial | High | High | Activation gate of a second order inside 21 days; interview every non-repeater in person | P0 |
| R10 | Order values drift down, breaking run economics | Commercial | Medium | High | Order minimums per zone, top-up prompt instead of refusal | P2 |
| R11 | Reorder collects supplier funds and spends them on operations | Financial | Medium | Critical | Dedicated ledger accounts, remittance tracking, no operational use of held funds, daily reconciliation | P2 |
| R12 | Supplier lead times are longer than the replenishment cycle | Operational | Medium | Medium | Record lead time per line; treat it as a first-class input to the suggestion engine | P1 |
| R13 | Driver and agent attrition during the pilot | Operational | Medium | Medium | Simple commission visibility, small clusters, predictable run days | P2 |
| R14 | Informal users cannot be onboarded without heavy human cost | Operational | High | Medium | Agent-assisted onboarding, cluster rollout, default basket per cluster, 60-second ordering flow | P4 |
| R15 | Data protection breach involving identity, location or delivery photos | Legal / Reputational | Low | Critical | Minimise capture, role-based access, retention limits, purge policy, counsel-reviewed privacy notice | P1 |
| R16 | Credit default wipes out margin | Financial | Medium | High | Laddered credit, server-computed limits, capped portfolio exposure, freeze policy | P4 |
| R17 | Price list churn makes the Sheet's prices stale | Product | High | Medium | Versioned price lists, approval step, staleness warning at order time, auto-expiry of offers | P1 |
| R18 | A bad run damages a whole cluster's trust | Reputational | Medium | High | Publish the run schedule, confirm before dispatch, handle the first failure in person | P2 |
| R19 | Founder attention split between the POS business and a physical distribution business | Strategic | High | High | Make decision D1 explicitly; appoint an ops lead before phase 2 | P2 |
| R20 | Working capital shock if the model shifts to inventory without planning | Financial | Medium | High | Model C only per SKU against the five-criteria test; monthly cash cycle review | P3 |

## 6. Fraud and abuse controls

| Abuse | Control |
|---|---|
| Fake orders to an unverified address | Verified location and owner at onboarding; delivery proof required |
| Rider under-reporting cash | Manifest, expected vs counted cash, variance reason, spot audits |
| Collusion between rider and customer to write off goods | Photo evidence, sequenced audit sampling, rotating rider assignment per zone |
| Account sharing to farm credit | Server-computed limits tied to verified identity; device and behaviour monitoring |
| Supplier invoice inflation through price-list manipulation | Versioned price lists with approval; price attribution per order line |
| Retailer disputing accepted deliveries | Proof of delivery captured at the doorstep with quantity confirmation |
