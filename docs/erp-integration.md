# ERP Integration Plan — net7 (ToPM)

Status: **design / pre-implementation** (blocked on net7 Web API credentials from ToPM).
Owner: Bukara. Last updated: 2026-06.

## Goal

Connect the custom Next.js storefront to Bukara's net7 ERP so the shop runs on real
ERP data: article master, **prices incl. Staffelpreise**, **live-ish stock**,
per-customer **order/invoice history**, and **order write-back** into net7.

The existing ToPM B2B shop (`b2b.bukara.de`) is net7's built-in server-rendered
`inhouse.top` app (HTML + session `ssid`); it exposes **no reusable JSON API**, so we
integrate via net7's documented **Web API** (one of net7's standard interfaces:
EDI / VDA / XML / OLE DB / Web API / CSV).

## Architecture (decided)

- **Read path = periodic sync, not real-time.** A scheduled job pulls article master,
  prices (incl. Staffelpreise) and stock from the net7 Web API and **upserts into
  Supabase**. The shop keeps reading from Supabase (fast, already built). No per-request
  ERP calls for catalog browsing.
- **Join key = `Identnummer` / Bukara Artikelnummer**, already shared between systems
  (confirmed present in the B2B shop markup). Maps to `v2.skus.identnummer` /
  `v2.skus.bukara_article_number`.
- **Account linking.** Auth stays Supabase Auth. Each user is mapped to their net7
  **Kundennummer**; logged-in features (order history, customer pricing) key off that.
- **Order write-back.** On checkout, push the order to net7 via the Web API; store the
  returned ERP order number + status.

## Cost guardrails (baked in from day one)

These exist so the integration does **not** re-create the Vercel **ISR Writes** problem
(the catalog is statically cached with `revalidate = 86400` + on-demand `revalidateTag("catalog")`)
and stays inside free/low tiers regardless of sync frequency.

1. **Revalidate-on-change only.** The sync diffs incoming ERP data against what's already
   in Supabase (per-SKU: `price_eur`, `campaign_price`, stock, `has_staffelpreis`). It
   upserts only changed rows and calls `revalidateTag("catalog")` **once per run, and only
   if ≥1 row actually changed**. Unchanged runs = no ISR writes. This keeps ISR writes
   proportional to real change frequency, not to how often the cron fires.
2. **Cron runs on GitHub Actions, not Vercel Cron.** A scheduled GitHub Actions workflow
   hits a protected endpoint (`POST /api/sync/erp`, guarded by a `CRON_SECRET` bearer
   header). Avoids Vercel Hobby cron-frequency limits and keeps the job off Vercel's meter.
3. **Sane interval.** Every 15–60 min is plenty at current scale (~1.5k SKUs). Not per-minute.
4. **Volatile stock can be read dynamically (optional).** If near-real-time stock is wanted
   without ISR writes, the PDP/cards read stock from a tiny route (`GET /api/stock?ids=…`)
   that queries Supabase directly — a few cheap function calls per visit, negligible at low
   traffic — instead of baking stock into the ISR-cached page.

Expected impact at current scale: negligible Supabase usage (≈1.5k upserts/run, tiny data;
also keeps the free project from auto-pausing), negligible Vercel compute, and near-zero
ISR writes thanks to guardrail #1.

## What we need from ToPM (net7 Web API)

Tracked separately in the ToPM request email. Minimum to start coding: **(1)** Web API base
URL (sandbox+prod), **(2)** auth scheme + sandbox credentials, **(4)** docs/examples, **(5)**
endpoints for articles / prices incl. Staffelpreise / stock / customers / order history /
order create. Plus reachability (public TLS vs VPN/IP-allowlist — affects whether the sync can
run from GitHub Actions/Vercel or needs a static-IP gateway), rate limits, sandbox test
customer with order history, DSGVO/AVV, licensing + technical contact.

## Build phases

- **Phase 0 — account linking (can start now, no ToPM dependency).**
  Supabase table mapping `auth.users` → net7 Kundennummer, e.g.
  `erp_customer_links (user_id uuid pk, kundennummer text, verified_at timestamptz, created_at)`,
  RLS so a user sees only their own row; capture + verify Kundennummer at registration.
  **Open decision:** verification method — manual approval by Bukara, or self-verify via
  Kundennummer + an existing order/invoice number.
- **Phase 1 — read sync.** net7 Web API client (server-only) + `POST /api/sync/erp` +
  GitHub Actions schedule. Upsert articles, prices (incl. Staffelpreise → existing
  `has_staffelpreis` / pricing in `lib/pricing.ts`), and stock into the `v2` tables, keyed on
  `Identnummer`. Apply guardrail #1 (diff + revalidate-on-change). Replaces manual price/stock
  upkeep (e.g. the hand-set X99 campaign prices).
- **Phase 2 — customer account area.** "Meine Bestellungen": fetch order/invoice history per
  Kundennummer via the Web API; optional document (invoice/delivery note) links.
- **Phase 3 — order write-back.** Push checkout orders into net7; persist ERP order number;
  reflect status back to the customer.

## Key code touch-points (existing)

- `lib/katalog/data.ts` — catalog cache (`unstable_cache`, tag `catalog`, `revalidate 86400`);
  the sync's revalidation must reuse this tag.
- `lib/pricing.ts` — `unitPriceForQuantity` (Staffelpreis tiers), `formatEur`.
- `v2.skus` — `identnummer`, `bukara_article_number`, `price_eur`, `campaign_price`,
  `has_staffelpreis`, `stock_quantity`.
- Admin save actions already `revalidateTag("catalog")` — same mechanism the sync will use.

## Open decisions

1. Kundennummer verification method at signup (manual vs self-verify).
2. Is net7's Web API publicly reachable (TLS) or behind VPN/IP-allowlist? (Determines whether
   a static-IP middleware is needed.)
3. Should stock be periodic-only or use the dynamic `/api/stock` read (guardrail #4)?
