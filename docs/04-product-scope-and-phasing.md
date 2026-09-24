# 04 — Product Scope and Phasing

Status: DRAFT v0.1
Owner: Product
Depends on: [03-business-model-and-economics.md](03-business-model-and-economics.md)
Last updated: 2026-09-24

---

## 1. Product definition

Reorder is three surfaces sharing one domain:

| Surface | User | Core job |
|---|---|---|
| **Reorder Sheet** | Retailer (formal and informal) | See what to buy, adjust it, send it |
| **Reorder Ops** | Reorder agent, picker, rider, ops staff | Turn approved orders into delivered, settled drops |
| **Reorder Supply** | Supplier / importer | See demand, confirm availability, fulfil or hand off |

The Sheet is the product. Ops and Supply exist to make the Sheet's promise true. If a phase
improves Ops but not the Sheet, it is not the priority.

## 2. The MVP ladder

Each rung has one question to answer. Build nothing above the rung you are on.

### Phase 0 — Concierge (no product, days not weeks)

**Question:** will a business pay a delivery fee for restock it did not have to go and fetch?

- Scope: 10–20 businesses in **one** neighbourhood. Owner sends the restock list by WhatsApp
  (photo of notebook, voice note, or a typed list). Reorder prices it from a fixed supplier list,
  confirms by message, buys or brokers from one named supplier, delivers on a stated day, collects
  payment, records every line in a spreadsheet.
- Not in scope: any app, any POS integration, any rider app, any automation.
- Exit gate: **at least 60% of pilot businesses place a second order within 21 days**, and per-order
  contribution is positive using real numbers. [ASSUMPTION]
- Evidence required: order log with dates, goods cost, goods price charged, delivery cost, payment
  method, time spent per order, and the reason given by anyone who did not reorder.

### Phase 1 — Reorder Sheet v1 (manual stock, assisted capture)

**Question:** does software generate a restock list people actually trust and use?

- Scope: catalog with pack conversion, stock/sales capture (scan, quick-pick, or a stocktake-lite
  flow), a restock suggestion engine with editable quantities, order submission, order status,
  invoice summary, delivery confirmation with proof of delivery.
- POS integration: none for third parties. For Nexarch POS customers, a read-only daily sales
  feed (see [08-architecture-and-integrations.md](08-architecture-and-integrations.md)).
- Not in scope: credit, multi-branch consolidation, supplier self-service, route optimisation.
- Exit gate: **the suggested quantity is accepted, unedited, on at least 50% of lines** across a
  4-week cohort, and the average edit rate falls week over week. [ASSUMPTION]
- Evidence required: suggestion vs accepted quantity per line, edit frequency per SKU,
  time-to-approve an order, weekly active retailers.

### Phase 2 — Fulfilment operations

**Question:** can order fulfilment be done profitably, repeatably, by people who are not the founder?

- Scope: order queue and batching, run/route sheet with a manifest and drop sequence, pick list,
  rider tool with offline proof of delivery, cash/transfer reconciliation, supplier handoff,
  substitutions, returns and discrepancy handling, supplier portal (availability and price).
- Not in scope: warehousing at scale, automated route optimisation, dynamic pricing.
- Exit gate: **a run of 15+ drops is completed and reconciled by hired staff with drops-per-hour and
  cost-per-drop inside the modelled target**, and the discrepancy rate is below the agreed
  threshold. [ASSUMPTION]
- Evidence required: run sheets, actual vs planned drop times, cost per drop, reconciliation
  reports, discrepancy log, rider and picker error rates.

### Phase 3 — Formal retail at depth

**Question:** can Reorder serve a multi-branch, multi-supplier, invoice-driven business?

- Scope: multi-branch and multi-user roles, approval workflow, consolidated ordering across
  suppliers, price list management and comparison, purchase order and invoice matching, expiry and
  batch capture, supplier performance scoring, reporting.
- Not in scope: full accounting, payroll, tax filing.
- Exit gate: **an account with 3+ branches orders through Reorder weekly for 8 consecutive weeks**
  with no manual intervention by Reorder staff. [ASSUMPTION]

### Phase 4 — Informal cluster scale, credit and owned supply

**Question:** does the informal motion have positive unit economics at cluster scale, and does
credit improve retention without destroying the book?

- Scope: free lightweight seller app for informal users, cluster/agent tooling, scheduled route
  engine, prepaid wallet and cash-on-delivery settlement, credit ladder with server-computed
  limits, portfolio monitoring, owned micro-hub stock for a narrow staple list.
- Not in scope: consumer delivery, on-demand courier behaviour, national expansion.
- Exit gate: **a cluster of 25+ kiosks sustains weekly ordering for 12 weeks with run-level and
  cluster-level positive contribution**, and credit loss stays inside the policy cap.

## 3. In scope for v1 everywhere

- Server-side identity, tenancy and authorisation for every business account
  (see [07-domain-model-and-authz.md](07-domain-model-and-authz.md)).
- Pack/unit conversion (piece, pack, carton, case) with per-supplier mappings.
- Catalog normalisation from supplier price lists.
- Editable restock suggestions with a visible reason ("sold 40 in 7 days, 6 left, 3-day lead time").
- Order lifecycle with clear states and a cancellation/amendment window.
- Delivery confirmation and discrepancy capture, offline-capable.
- Audit log of price, quantity, credit and approval changes.
- Low-end Android performance; offline-first capture; graceful degradation to SMS/WhatsApp.

## 4. Out of scope for v1

Record these so they stop being re-litigated in every planning session:

- Warehouse ownership, cold chain, and any licensed category (see the compliance gate).
- Consumer-facing storefront or household delivery.
- Credit above rung 1 of the credit ladder.
- Third-party POS integrations beyond a read-only daily sales feed.
- Route optimisation with live traffic; a hand-built run sheet is enough until run 100.
- Machine-learning demand forecasting. A transparent moving-average with lead time and pack
  rounding will outperform an unexplainable model in year one, and can be explained to the owner.

## 5. Non-functional requirements

| Area | Requirement | Why |
|---|---|---|
| Connectivity | Retailer and rider capture flows must work offline and sync | Networks fail; a restock that cannot be entered is a lost order |
| Devices | Functional on low-end Android (2GB RAM) and usable on a phone browser | Informal and rider users |
| Data cost | Text-first UI; no heavy media in core flows | Pay-as-you-go data is a real cost to the user |
| Latency | Restock list renders under 2 seconds on a mid-range device on 3G | It is used at closing time, when the owner is tired |
| Money | All prices, currency, credit limits and totals computed server-side | Client values are selectors, never authoritative |
| Auditability | Every order line traces to a source (suggestion, manual add, standing order) | Needed to prove the restock list is doing the work |
| Reversibility | Order amendments and cancellations are recorded, never silently overwritten | Disputes are common in goods trade |

## 6. Build vs reuse

| Capability | Decision | Rationale |
|---|---|---|
| Identity, tenancy, RBAC | Reuse Nexarch foundations | Do not build a second auth system |
| Catalog and pack conversion | Build once, share with POS | Core to both products |
| POS sales feed | Reuse Nexarch POS data model | The whole insight depends on this |
| Payments | Buy (Paystack/Flutterwave-class) | Commodity, regulated |
| Messaging | Buy (WhatsApp Business / SMS) | Commodity, high delivery quality |
| Maps and routing | Buy later, hand-build first | Hand-built run sheets are sufficient and cheaper to change |
| Delivery suite / rider app | Build thin | Existing courier tools do not model cluster runs or COD reconciliation |
| Warehousing | Do not build | Not in scope until phase 4 and only for selected lines |
