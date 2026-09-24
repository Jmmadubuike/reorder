# 06 — Functional Requirements

Status: DRAFT v0.1
Owner: Engineering / Product
Depends on: [05-user-journeys.md](05-user-journeys.md)
Last updated: 2026-09-24

---

## 1. Priority and phase notation

- **MUST** — required for the phase to be considered delivered.
- **SHOULD** — expected, may slip with a recorded reason.
- **LATER** — explicitly deferred; do not build early.

Phases (P0–P4) are defined in [04-product-scope-and-phasing.md](04-product-scope-and-phasing.md).

## 2. Identity, tenancy and access (IDN)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-IDN-001 | Every business account is a tenant; all data is scoped to the tenant | MUST | P1 | No query returns another tenant's data; enforced centrally, not per-handler |
| FR-IDN-002 | Tenant, role and permissions are derived server-side from the session | MUST | P1 | Client-supplied tenant or role values are ignored; verified by test |
| FR-IDN-003 | Roles: OWNER, MANAGER, ATTENDANT, AGENT, RIDER, PICKER, SUPPLIER_USER, OPS, ADMIN | MUST | P1 | Each role can perform only its permitted actions; matrix in doc 07 |
| FR-IDN-004 | Multi-branch membership with per-branch permissions | SHOULD | P3 | A manager of one branch cannot see another branch's data |
| FR-IDN-005 | Session revocation and device listing | SHOULD | P2 | A removed staff member loses access within one token lifetime |
| FR-IDN-006 | Account suspension freezes all ordering but preserves history | MUST | P2 | Suspended account cannot submit, amend or receive an order |

## 3. Catalog and pack conversion (CAT)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-CAT-001 | Product master with category, brand, unit, barcode(s), and status | MUST | P1 | Duplicate barcode detection on create |
| FR-CAT-002 | Pack hierarchy per product: piece, pack, carton, case, with conversion factors | MUST | P1 | Ordering in cartons and stocking in pieces reconciles exactly |
| FR-CAT-003 | Supplier-specific pack and price mapping per product | MUST | P1 | The same product from two suppliers resolves to one catalog item |
| FR-CAT-004 | Bulk import of supplier price lists with a review step | MUST | P1 | Import never silently changes live prices; changes require approval |
| FR-CAT-005 | Category attributes for regulated or sensitive goods: batch, expiry, cold chain, licences | SHOULD | P2 | Pick flows enforce the attributes for flagged products |
| FR-CAT-006 | Alias handling for informal names ("peak milk", "peak") | SHOULD | P2 | Agent can search by common local name |
| FR-CAT-007 | Catalog merge/deduplication without breaking order history | SHOULD | P2 | Historical lines still resolve after a merge |

## 4. Stock and sales capture (STK)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-STK-001 | Capture sales lines from Nexarch POS in near real time | MUST | P1 | A day's sales appear as a complete set, with a reconciliation count |
| FR-STK-002 | Assisted stock capture for businesses without reliable stock data | MUST | P1 | A full count of a top-100 catalog takes under 10 minutes |
| FR-STK-003 | Offline capture with conflict-safe sync | MUST | P1 | Two devices on the same account do not overwrite each other silently |
| FR-STK-004 | Quick-pick "finished / low" marking for informal users | MUST | P2 | Under 3 taps per item; no typing required |
| FR-STK-005 | Stock adjustment with reason codes and audit | MUST | P1 | Every adjustment records actor, time, reason, and delta |
| FR-STK-006 | Expiry and batch capture for flagged categories | SHOULD | P2 | Stock with near-expiry is visibly flagged in the Sheet |

## 5. Restock suggestion engine (RSS)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-RSS-001 | Generate a restock list at daily close | MUST | P1 | List is available without user action |
| FR-RSS-002 | Suggested quantity considers sales velocity, on-hand, lead time, pack size, and min/max | MUST | P1 | Rounding always respects pack conversion |
| FR-RSS-003 | Every suggestion shows a plain-language reason | MUST | P1 | Reason is understandable without training |
| FR-RSS-004 | Owner can edit, remove and add lines before approval | MUST | P1 | All edits are recorded with the original suggestion |
| FR-RSS-005 | Suggestion accuracy is measured per line and per SKU | MUST | P1 | Edit rate report available per account and per SKU |
| FR-RSS-006 | Expiry-aware and shelf-life-aware suggestions for flagged categories | SHOULD | P2 | Short-shelf-life items are not over-suggested |
| FR-RSS-007 | Standing orders and recurring baskets | SHOULD | P2 | A standing order can be paused and resumed |
| FR-RSS-008 | Learning from edit history | LATER | P3 | Requires FR-RSS-005 data and explainability |

## 6. Ordering and fulfilment (ORD)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-ORD-001 | Order lifecycle with explicit states and allowed transitions | MUST | P1 | Invalid transitions are rejected; see doc 07 |
| FR-ORD-002 | Price and total snapshot fixed at approval | MUST | P1 | Later price changes do not alter an approved order |
| FR-ORD-003 | Availability confirmation with partial and unavailable outcomes | MUST | P1 | Owner is asked to decide on every non-fulfilled line |
| FR-ORD-004 | Substitution requires explicit owner approval | MUST | P1 | No substitution reaches delivery without approval |
| FR-ORD-005 | Order amendment and cancellation window with reason | SHOULD | P2 | Amendment after picking requires ops approval |
| FR-ORD-006 | Order minimum enforcement per zone and segment | MUST | P2 | Below-minimum orders are blocked with a clear explanation |
| FR-ORD-007 | Delivery scheduling and window selection | MUST | P1 | Owner selects from real available windows, not a free-text field |
| FR-ORD-008 | Batch orders into runs by zone and date | MUST | P2 | A run has a manifest with sequence and totals |
| FR-ORD-009 | Order-level and line-level notes | SHOULD | P1 | Notes are visible at pick and delivery |

## 7. Delivery and proof (DLV)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-DLV-001 | Offline-capable rider delivery confirmation | MUST | P2 | Confirmation recorded without network, synced later |
| FR-DLV-002 | Proof of delivery: recipient, time, location, OTP or signature, quantity check | MUST | P2 | A delivery cannot be closed without proof |
| FR-DLV-003 | Refusal handling with reason codes | MUST | P2 | Refused goods return to inventory with a reason |
| FR-DLV-004 | Cash reconciliation per run with variance reason | MUST | P2 | Run cannot close with unexplained variance |
| FR-DLV-005 | Rider float limits and deposit tracking | SHOULD | P2 | A rider cannot exceed the assigned float ceiling |
| FR-DLV-006 | Delivery notification before arrival | SHOULD | P2 | Owner receives a message ahead of the drop |

## 8. Returns, discrepancies and claims (RTN)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-RTN-001 | Discrepancy capture at the doorstep with photo and quantity | MUST | P2 | No claim without photo and quantity |
| FR-RTN-002 | Classification: shortage, damage, wrong item, dating, price | MUST | P2 | Category drives the resolution path |
| FR-RTN-003 | Credit note posted to the account ledger | MUST | P2 | Ledger balance reflects the note immediately |
| FR-RTN-004 | Supplier claim raised and tracked | SHOULD | P2 | Supplier sees claim status; Reorder sees ageing |
| FR-RTN-005 | Return-to-stock or write-off with approval | SHOULD | P2 | Write-offs require an ops role and a reason |

## 9. Payments, ledger and credit (PAY)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-PAY-001 | Accept transfer and cash on delivery; record method per order | MUST | P1 | Every payment links to a specific order |
| FR-PAY-002 | Virtual account or reference per order for transfers | SHOULD | P2 | Payment auto-matches to the order |
| FR-PAY-003 | Immutable account ledger for charges, payments and credit notes | MUST | P2 | Ledger entries are append-only and reconcilable |
| FR-PAY-004 | Credit limit computed server-side and enforced at order approval | LATER | P4 | Client cannot influence the limit |
| FR-PAY-005 | Ageing report and dunning trail | LATER | P4 | Every dunning action is logged |
| FR-PAY-006 | Supplier remittance tracking for collected funds | MUST | P2 | Held funds are identifiable and never mixed with operating cash |

## 10. Supplier and ops surfaces (SUP)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-SUP-001 | Supplier sees demand lines without retailer contact details by default | MUST | P2 | Retailer identity is masked unless consent is recorded |
| FR-SUP-002 | Supplier updates availability, price and lead time | MUST | P2 | Changes are versioned; past orders unaffected |
| FR-SUP-003 | Supplier confirms or rejects with a reason | MUST | P2 | Rejection reasons are reportable |
| FR-SUP-004 | Ops queue for orders needing human intervention | MUST | P2 | Every exception has an owner and an age |
| FR-SUP-005 | Supplier performance metrics: fill rate, on-time, discrepancy rate | SHOULD | P3 | Visible to ops, optionally to the supplier |
| FR-SUP-006 | Zone, cluster and run management console | MUST | P2 | Clusters are editable without a deployment |

## 11. Notifications and reporting (NOT)

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-NOT-001 | Order status notifications over WhatsApp/SMS with a low-data fallback | MUST | P1 | Owner can approve or query by reply |
| FR-NOT-002 | Daily restock-ready notification at close | MUST | P1 | Respects the account's preferred time |
| FR-NOT-003 | Nightly ops and finance summary | SHOULD | P2 | Includes drops, revenue, cost per drop, variance |
| FR-NOT-004 | Per-account dashboards: reorder rate, edit rate, order frequency | MUST | P1 | Metrics defined in doc 11 |
| FR-NOT-005 | Data export for finance and reconciliation | SHOULD | P2 | CSV export of orders, payments and ledger |

## 12. Billing and audit

| ID | Requirement | Priority | Phase | Acceptance criteria |
|---|---|---|---|---|
| FR-PAY-007 | All charges (goods, delivery, fees) itemised on one statement | MUST | P2 | Owner can see why they paid what they paid |
| FR-AUD-001 | Audit log of price, quantity, permission and credit changes | MUST | P1 | Actor, time, before, after |
| FR-AUD-002 | No hard deletion of financial or order records | MUST | P1 | Records are voided or superseded, never removed |
| FR-AUD-003 | Configurable retention aligned to tax and regulatory needs | SHOULD | P3 | Retention policy documented and enforced |

## 13. System invariants (must never be violated)

These are stated separately because each one is a security or trust boundary, and each must have
a test that fails loudly if it is broken.

1. Business identity, role and permissions come from the server session — never from the client.
2. Prices, currency, delivery fee, totals and credit limits are computed server-side.
3. An approved order's price snapshot is immutable; changes require a new approval event.
4. No substitution, added line, or quantity increase may reach delivery without the owner's
   explicit approval.
5. Money collected on behalf of a supplier is held and tracked separately from operating funds.
6. Every financial record is append-only; corrections are new entries, not edits.
7. A delivery cannot be closed without proof, and a run cannot be closed with unexplained cash.
8. Tenant isolation is enforced centrally; a per-handler filter is not sufficient.
