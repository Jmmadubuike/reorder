# 14 — Glossary

Status: DRAFT v0.1
Owner: Founder
Depends on: all documents in this pack
Last updated: 2026-09-24

---

One vocabulary across documents, code and conversations. Where a local trade term exists, it is the
term of art and should not be replaced with a software word.

| Term | Meaning in this pack |
|---|---|
| **Agent** | A Reorder field operator who signs up, services and supports a cluster of retail sites |
| **Base unit** | The smallest unit in which stock is tracked for a product, usually the piece. All quantities are stored in base units |
| **Batch / lot** | A specific production or import batch of a product, relevant for expiry tracking and recalls |
| **Carton / case** | A purchasing unit containing a fixed number of base units. The conversion factor can differ between suppliers |
| **Cluster** | A group of informal retail sites inside one zone, served on one scheduled run by one agent |
| **COD** | Cash on delivery. The default informal payment method, and a known fraud and float risk |
| **Concierge pilot** | The phase-0 operating method: manual ordering through messaging, manual sourcing, manual delivery, no software |
| **Cost per drop** | The allocated cost of delivering one order within a run, including rider time, fuel and vehicle share |
| **Credit ladder** | The staged progression from prepaid to cash on delivery to short float to longer float, with server-computed limits |
| **Demand capture** | Recording what actually sold, whether through POS, assisted count, or agent observation |
| **Discrepancy** | Any difference between the approved order and what was delivered, classified by type |
| **Drop** | One order's delivery stop within a run |
| **Fill rate** | Delivered lines divided by ordered lines, per supplier and per run |
| **Formal retail (S1)** | Retailers with records, staff and usually a POS: pharmacy, supermarket, mall store |
| **Informal retail (S2)** | Owner-operated micro-retail with no sales records: kiosk, table-top, provisions shop |
| **Lead time** | The time between placing an order and it being available for delivery, per supplier and per line |
| **Market run** | The trip a retailer currently makes to the open market to restock. The behaviour Reorder is replacing |
| **Minimum remaining shelf life** | The shortest remaining shelf life Reorder will accept from a supplier, agreed per category |
| **MOQ** | Minimum order quantity imposed by a supplier |
| **Model A / B / C** | Broker (asset-light) / inventory reseller / hybrid, described in document 03 |
| **North star metric** | Reorder rate: the share of active businesses ordering weekly from a Reorder-generated list |
| **Pack conversion** | The rule that converts a purchasing unit such as a carton into base units, and back |
| **Pick list** | The internal instruction listing what to collect for a run, per order and per line |
| **Proof of delivery (PoD)** | The evidence recorded at the doorstep: recipient, time, location, quantity confirmation, and photo or OTP |
| **Provisions shop** | A small neighbourhood shop with a broad grocery assortment; an informal retail type, not a supermarket |
| **Reorder rate** | See north star metric |
| **Reorder Sheet** | The customer-facing list of suggested restock lines that the owner reviews, edits and approves |
| **Remittance** | Funds collected on behalf of a supplier that must be held separately and paid over |
| **Restock list** | The plain-language name for the Reorder Sheet, used with customers |
| **Route density** | The number of deliverable drops within a zone on a given run day. The determinant of informal unit economics |
| **Run** | A scheduled delivery trip served by one rider or vehicle, containing multiple drops |
| **Site / branch** | A physical location belonging to a business, with its own stock, delivery window and zone |
| **Suggestion** | A single generated restock line with a quantity, a reason and a confidence indication |
| **Zone** | A delivery geography with a fixed run day, a minimum order value and a published delivery fee |
