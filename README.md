# Reorder — Pre-Development Documentation Pack

Product: **Reorder** — intelligent restocking infrastructure for retail businesses
Company: **Nexarch Technologies**
Scope: idea refinement and decision-making before any development work starts
Status: DRAFT v0.1 — awaiting founder decisions
Last updated: 2026-09-24

---

## 1. The idea in one paragraph

Nexarch Technologies builds POS software for pharmacies, supermarkets and malls. Reorder
extends that POS into a **replenishment service**: when a business closes its daily sales,
the system knows what sold and what is nearly finished, and turns that into a ready-to-send
restock order. Reorder then sources those items from importers, wholesalers and
manufacturers and delivers them to the business, removing the trip to the open market.
For the informal sector (kiosks, table-top shops, provisions stores) a lightweight version
of the software is given away free; in return those sellers place their restock orders
through Reorder, which delivers for a fee.

## 2. What "improved" means in this pack

The pack does not restate the idea. It changes it in six specific ways:

| # | Change | Why it matters |
|---|---|---|
| 1 | Reframe from "POS + delivery" to **automated replenishment** | The restock list derived from real sales is the defensible asset. Delivery is a commodity that anyone with a van can copy. |
| 2 | Split **formal** and **informal** into two separate motions with separate economics | Order value, payment method, support cost and margin are completely different. One playbook cannot serve both. |
| 3 | Run informal delivery as **scheduled cluster runs**, not on-demand | Micro-orders only work when 15–30 drops share one route on one day. On-demand last mile for a ₦8,000 order loses money. |
| 4 | Replace "importers and manufacturers" with a **supply ladder** | Manufacturers have MOQs and credit terms a startup cannot meet in year one. Start at the tier that will actually sell to you. |
| 5 | Put a **regulatory gate in front of pharmacy** | Distributing medicines in Nigeria is licensed and premises-based. This is a legal blocker, not a feature. |
| 6 | Start with a **concierge pilot**, earn the software | The first 30 orders need no code. They need a price list, a source, a van and a WhatsApp thread. |

## 3. Document map

Read in order. Each document stands alone, but they reference each other by filename.

| File | Purpose | Primary reader |
|---|---|---|
| [docs/00-vision-and-positioning.md](docs/00-vision-and-positioning.md) | Positioning, tagline, flywheel, moat, and the narrative layer | Founder, investor |
| [docs/01-opportunity-and-vision.md](docs/01-opportunity-and-vision.md) | Problem, insight, vision, non-goals, market framing | Founder, investor |
| [docs/02-customers-and-segments.md](docs/02-customers-and-segments.md) | Segments, personas, jobs to be done, willingness to pay | Product, growth |
| [docs/03-business-model-and-economics.md](docs/03-business-model-and-economics.md) | Revenue lines, asset-light vs inventory, unit economics, credit | Founder, finance |
| [docs/04-product-scope-and-phasing.md](docs/04-product-scope-and-phasing.md) | What the product is, MVP ladder 0→4, in/out of scope | Product, engineering |
| [docs/05-user-journeys.md](docs/05-user-journeys.md) | End-to-end journeys for every actor, with failure points | Product, design, ops |
| [docs/06-functional-requirements.md](docs/06-functional-requirements.md) | Numbered requirements with priority and acceptance criteria | Engineering, QA |
| [docs/07-domain-model-and-authz.md](docs/07-domain-model-and-authz.md) | Entities, pack conversion, order lifecycle, tenancy and roles | Engineering |
| [docs/08-architecture-and-integrations.md](docs/08-architecture-and-integrations.md) | Architecture principles, POS/payment/logistics integration tiers | Engineering |
| [docs/09-supply-network-and-fulfillment.md](docs/09-supply-network-and-fulfillment.md) | Supply ladder, category strategy, fulfilment models, route math | Ops, founder |
| [docs/10-compliance-legal-and-risks.md](docs/10-compliance-legal-and-risks.md) | Nigerian regulatory position per category, risk register | Founder, legal |
| [docs/11-validation-plan-and-metrics.md](docs/11-validation-plan-and-metrics.md) | Hypotheses, experiments, metric definitions, kill criteria | Founder, product |
| [docs/12-roadmap-and-gates.md](docs/12-roadmap-and-gates.md) | Phases, entry/exit gates, evidence standard | Everyone |
| [docs/13-open-decisions-and-assumptions.md](docs/13-open-decisions-and-assumptions.md) | Decision log and assumption register with verification methods | Founder |
| [docs/14-glossary.md](docs/14-glossary.md) | Domain vocabulary used consistently across the pack | Everyone |
| [docs/15-brand-and-identity.md](docs/15-brand-and-identity.md) | Palette, accessibility ratios, typography, logo and usage rules | Founder, design |

The narrative source for this pack is [MY_IDEA_REORDER.md](MY_IDEA_REORDER.md), the founder's
33-section idea document. It is the vision and positioning layer; the documents above are the
specification and decision layer. Where the two disagree, the disagreement is recorded in
[docs/13-open-decisions-and-assumptions.md](docs/13-open-decisions-and-assumptions.md) §4, and the
specification governs the build until the decision is made the other way.

## 4. Status convention

Every document carries a header with `Status`. The values are:

- `DRAFT` — written, not yet agreed by the founder.
- `AGREED` — a founder decision has been recorded and the document updated to match.
- `SUPERSEDED` — replaced by a later version or a different decision.

Numbers marked **[ASSUMPTION]** are placeholders used to make the reasoning testable. They are
not verified facts and must not be quoted externally until they are replaced with measured
values from the validation plan in [docs/11-validation-plan-and-metrics.md](docs/11-validation-plan-and-metrics.md).

## 5. Honest current state

- No code exists in this repository. No POS integration, payment rail, supplier relationship
  or delivery capability has been verified in this workspace.
- The business model below is a **design**, not a validated model. Nothing here should be
  presented to a customer or investor as proven.
- The two highest-risk unknowns are (a) whether the goods margin plus delivery fee can beat the
  business owner's existing "go to market" cost, and (b) whether Reorder can legally and
  profitably sell into the pharmacy vertical as a technology company. Both have dedicated
  experiments and a legal gate.

## 6. Decisions needed next

See [docs/13-open-decisions-and-assumptions.md](docs/13-open-decisions-and-assumptions.md) for the
full list. The six that block everything else:

1. **D1 — Business model shape:** order broker (asset-light) vs inventory reseller vs hybrid.
2. **D2 — Vertical order:** pharmacy-first or FMCG-first, given the licensing gate.
3. **D3 — Geography:** one city and one market cluster, named.
4. **D4 — Informal motion:** scheduled cluster runs vs agent-assisted on-demand.
5. **D5 — Delivery fee anchor:** priced against the customer's market-trip cost, or cost-plus.
6. **D17 — Launch scope:** a three-sided MVP at launch, or a staged start with the Reorder Sheet
   alone. This is the one place where the idea document and this pack disagree about what gets
   built first; see §4 of the decision log.
