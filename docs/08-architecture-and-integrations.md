# 08 — Architecture and Integrations

Status: DRAFT v0.1
Owner: Engineering
Depends on: [07-domain-model-and-authz.md](07-domain-model-and-authz.md)
Last updated: 2026-09-24

---

## 1. Architectural principles

1. **Offline-first for anything touched in the field.** Restock capture, rider delivery and agent
   visits must complete without connectivity and reconcile later.
2. **Idempotent by default.** Every money- or stock-affecting operation carries a client-generated
   key. Retries must not double-post.
3. **Server-authoritative values.** Money, limits and permissions are computed server-side.
4. **Append-only financial and lifecycle records.** Corrections are new entries.
5. **Boring and explainable over clever.** A transparent restock rule the owner can understand beats
   a model nobody can debug, at least until the data set justifies otherwise.
6. **Reuse the Nexarch estate.** Identity, tenancy, catalog and POS data model are shared assets;
   Reorder must not create a second version of them.
7. **Degrade, do not fail.** If the app is unavailable, the order must still be placeable by
   WhatsApp or a phone call, and the ops team logs it.

## 2. Component map

| Layer | Component | Responsibility |
|---|---|---|
| Client | Retailer app (mobile web + Android) | Reorder Sheet, order approval, stock capture |
| Client | Rider/agent app (offline-first) | Run manifest, proof of delivery, cash capture |
| Client | Ops console | Order queue, exceptions, runs, suppliers, zones, credit |
| Client | Supplier portal | Availability, price lists, order confirmation, claims |
| Service | Identity and tenancy | Session, roles, permissions, business scope |
| Service | Catalog | Products, packs, barcodes, supplier offers |
| Service | Demand capture | POS ingestion, stock snapshots, adjustments |
| Service | Replenishment engine | Suggestions, reasons, engine versioning |
| Service | Order service | Lifecycle, snapshots, approvals, events |
| Service | Fulfilment service | Runs, drops, pick lists, delivery proof |
| Service | Money service | Ledger, payments, invoices, credit, remittances |
| Service | Notification service | WhatsApp/SMS/push dispatch with retries |
| Store | Relational store | Order, ledger and lifecycle integrity |
| Store | Document/object store | Delivery photos, price list uploads, claims evidence |
| Store | Queue/outbox | Reliable async dispatch, offline sync ingestion |

Data-store technology choices are deliberately not fixed here; they are an engineering decision to
be recorded in [13-open-decisions-and-assumptions.md](13-open-decisions-and-assumptions.md) once the
phase-1 volume is known.

## 3. POS integration tiers

Demand capture has to work before the *best* version of it works. Three tiers, cheapest first:

| Tier | Mechanism | Effort | Fidelity | When |
|---|---|---|---|---|
| T1 | Manual/assisted capture + WhatsApp restock list | None | Low | Phase 0 |
| T2 | CSV or scheduled export from any POS; daily file import | Low | Medium | Phase 1 |
| T3 | Read-only API feed from Nexarch POS | Medium | High | Phase 1 |
| T4 | Native integration for third-party POS vendors | High | High | Phase 3+, only for named accounts |

Rules:

- **Read-only first.** Never write back to a customer's POS in phase 1.
- Reconciliation is mandatory: an ingested day must be counted against the POS's own close-of-day
  total, and a mismatch must raise a visible exception rather than being silently accepted.
- Ingestion must be idempotent by (site, business day, POS transaction id) so a re-import cannot
  double-count sales.

## 4. Payments

| Flow | Mechanism | Notes |
|---|---|---|
| Retailer pays before dispatch | Virtual account tied to the order reference | Auto-matching removes reconciliation work |
| Retailer pays on delivery | Rider records method and amount; virtual-account transfer preferred | Cash is a last resort because of float and theft risk |
| Reorder collects on behalf of a supplier | Collection, then `SupplierRemittance` | Held funds must never fund operations |
| Informal top-up wallet | Prepaid balance applied to the delivery fee | Removes the "no cash on delivery day" failure |

Provider selection (Paystack, Flutterwave or equivalent) is a bought decision. Requirements to
specify when selecting: virtual account issuance, webhook signature verification over **raw request
bytes**, idempotent settlement, refund/credit-note support, and a reconciliation export.

Provider production status must be treated as unverified until a live transaction has been
completed and reconciled end to end.

## 5. Logistics tooling

- **Run sheets are hand-built in phase 2.** A sequence of drops per zone, with a manifest, is
  sufficient and cheap to change.
- **Offline rider app** with manifest cached at dispatch, local write-ahead log, and sync that
  tolerates duplicate submissions.
- **Proof of delivery** carries a timestamp, geo, photo/OTP and per-line quantity confirmation.
- **Cash reconciliation** at run close, with a mandatory reason for any variance.
- **Route optimisation** is deferred until there are enough runs to justify it; the constraint that
  matters first is *drops per run*, not shortest path.

## 6. Notifications

Bought, not built. WhatsApp Business for ordering interaction and SMS as a fallback for non-smartphone
users. Requirements: template approval, delivery-status callbacks, rate limiting, and a record of
every message linked to its order or sheet. Notification failures must surface in ops, because a
missed "restock ready" message is a missed order.

## 7. Device and connectivity strategy

| User | Reality | Response |
|---|---|---|
| Formal owner | Smartphone, decent data | Standard responsive app |
| Counter staff | Shared device | Role-scoped session, quick logout |
| Informal kiosk | Low-end Android, small data bundle, maybe shared | Text-first UI, 3-tap ordering, offline queue, SMS/WhatsApp alternative |
| Rider | Android, patchy network | Fully offline run flow with deferred sync |
| Supplier | Desktop or phone | Lightweight portal, no training required |

## 8. Observability and operational safety

- Order, payment and delivery events emit structured logs with tenant and order identifiers.
- Alerts on: POS ingestion mismatch, ledger imbalance, run closed with variance, failed payouts,
  suggestion engine failures, and notification delivery failures.
- A daily reconciliation job compares orders, deliveries, payments and ledger entries. An imbalance
  is a page, not a report.
- Feature flags for the suggestion engine, because a bad suggestion can destroy trust in a whole
  cluster at once.

## 9. Integration risks and unknowns

| Unknown | Why it matters | How to close it |
|---|---|---|
| Whether Nexarch POS can expose a clean daily sales feed | Phase 1 depends on it | Confirm the POS data model and export path before phase 1 starts |
| Whether the payment provider's virtual accounts support the required matching | Determines COD vs prepaid mix | Confirm with the provider before phase 2 |
| Whether suppliers will accept masked demand | Determines the supply model | Test in phase 0 with one supplier |
| Data cost and device capability at kiosk level | Determines the informal UI | Observe 10 real kiosks in phase 0 |
| Whether offline sync conflicts are frequent in practice | Determines complexity | Instrument from the first pilot deployment |
