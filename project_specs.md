# Project Specs — BuKaRa GmbH Website

## What the App Does & Who Uses It
B2B inquiry shop for **BuKaRa GmbH**, exclusive ITA Tools partner. Customers (woodworking / CNC shops) browse industrial cutting tools, configure quantity and variants, and submit inquiries. No cart or checkout — all orders go through the inquiry form flow.

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.4, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | GSAP + ScrollTrigger |
| Backend | Supabase (anon key, RLS on all tables) |
| Deployment | Vercel |

---

## Pages

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Live |
| `/produkte` | `app/produkte/page.tsx` | Live |
| `/produkte/[slug]` | `app/produkte/[slug]/page.tsx` | Live |
| `/angebote` | `app/angebote/page.tsx` | Live |
| `/angebote/[slug]` | `app/angebote/[slug]/page.tsx` | Live |
| `/danke` | `app/danke/page.tsx` | Live |

---

## Design System

### Colors
| Token | Hex | Role |
|---|---|---|
| Brand teal | `#00A597` | Primary accent, buttons, badges, links |
| Brand teal dark | `#007A70` | Hover state for primary |
| Text dark | `slate-900` (#0F172A) | Headings, primary body |
| Text secondary | `slate-500` (#64748B) | Supporting text only — used sparingly for hierarchy |
| Border | `slate-100` / `slate-200` | Card borders, dividers |
| Surface | `white` / `slate-50` | Card backgrounds |

**Two-color rule:** Only `slate-900` and `slate-500` for text. No additional grays (`slate-400`, `slate-600`, `slate-700`, etc.), no accent-colored text outside of interactive elements and badges.

### Typography
Hierarchy through **weight and size only**:
- No italic, no `tracking-widest` uppercase labels except in existing established patterns (breadcrumbs, table headers)
- No one-off color treatments

### Badges
Always show actual discount as **"-30%"** format (minus + number + percent). Never descriptive labels like "30% Kampagnenrabatt", "Bundle", "Komplett-Set". If no discount applies, badge is hidden entirely.

### Buttons
- `.btn-orange` — teal filled, white text, pill shape (primary CTA)
- `.btn-outline` — transparent, slate border, dark text (secondary)

### Banner (Deals Promo)
The canonical green deals banner lives in `app/produkte/page.tsx`:
- Background: `linear-gradient(135deg, #00A597 0%, #007A70 100%)`
- Layout: tag icon pill (left) + eyebrow + bold copy (center) + white pill CTA (right)
- Hover: `group-hover:bg-orange-50` on the CTA pill
- This exact treatment is reused wherever a deals promo banner appears (homepage, catalog)

---

## Supabase Schema

| Table | Key columns | RLS |
|---|---|---|
| `products` | `slug`, `name`, `is_active` | anon read |
| `product_variants` | `sku`, `variant_name`, `original_price`, `campaign_price`, `sort_order`, `is_active` | anon read |
| `offers` | `slug`, `title`, `is_active` | anon read |
| `offer_items` | `offer_id`, `product_id`, `is_variant_selector` | anon read |
| `inquiries` | `offer_id`, `selected_x99_variant_id`, `quantity`, contact fields, price fields, `status` | anon insert |

---

## Static Data (`lib/data.ts`)

- **`BUKARA_PRODUCTS`** — 3 products (X99 Fräser, Thermo-Schrumpffutter, TurboNesting Komplett Set)
- **`X99_VARIANTS`** — 8 variants (D6–D16) with original + campaign prices
- **`DEALS`** — 3 deals with `fixedItems` arrays for price calculation
- Supabase is the live source for `product_variants` and `offers`; static arrays are fallback

---

## Pricing Logic (`lib/pricing.ts`)

1. `campaignTotal` = (variant.campaign_price + fixed_items.campaign_price) × qty
2. `bulkDiscountApplied` = `campaignTotal >= 500`
3. `bulkDiscountAmount` = if bulk: `campaignTotal × 0.10`, else `0`
4. `finalTotal` = `campaignTotal − bulkDiscountAmount`
5. Free shipping = `bulkDiscountApplied`

---

## Components

| Component | File | Notes |
|---|---|---|
| Navbar | `components/Navbar.tsx` | Sticky, flat links, ITA partner badge |
| Footer | `components/Footer.tsx` | — |
| DealCard | `components/DealCard.tsx` | Full-width alternating card — **do not change** |
| ProductCard | `components/ProductCard.tsx` | See §Planned Changes |
| BestSellers | `components/BestSellers.tsx` | Uses ProductCard |
| LatestProducts | `components/LatestProducts.tsx` | Uses ProductCard |
| ProductSpotlight | `components/ProductSpotlight.tsx` | Full-width banner — to be replaced (see §Planned Changes) |

---

## Inquiry Form (Deal & Product Detail Pages)

Fields collected: `company_name`*, `vat_number`, `contact_name`*, `email`*, `phone`, `message`  
On submit → insert into `public.inquiries` → redirect to `/danke`  
Validation: required fields client-side; Supabase error shown inline if insert fails

---

## Planned Changes (Iteration 2)

### Order of execution
1. Typography cleanup (§Typo)
2. Unified ProductCard (§Card)
3. Homepage banner swap (§Banner)
4. Product detail page rebuild + image gallery + label/badge changes (§Detail)

---

### §Typo — Typography Cleanup
- Audit all pages for one-off text colors. Consolidate to `slate-900` (dark) and `slate-500` (secondary) only.
- Remove any `slate-400`, `slate-600`, `slate-700` used as standalone text colors in non-interactive contexts.
- Preserve existing `tracking-widest uppercase text-xs` pattern on table headers and breadcrumbs (already part of the established system).

---

### §Card — Unified ProductCard
**Source of truth:** current `components/ProductCard.tsx` visual style (image area, badge, name, price layout).

Changes:
- Remove the `+` quick-add button entirely (no cart in this app).
- Remove any long description text below the card (not present in current ProductCard, ensure it stays out).
- Remove "Details ansehen" text link — the entire card is the link.
- Wrap the entire card in `<Link href={...}>` — href targets the relevant product detail page.
- The `Product` type in `lib/data.ts` uses `id` and `image` (Unsplash URLs) — these are placeholder cards for the homepage sections (BestSellers, LatestProducts). For BuKaRa products, use the `BukaraProduct` type's slug-based routing.
- Keep `size` prop.
- Keep badge display logic.
- Use on: homepage BestSellers, homepage LatestProducts, and any future product listing surfaces.
- **Do not change DealCard.**

---

### §Banner — Homepage Deals Banner Swap
Replace `<ProductSpotlight />` in `app/page.tsx` with a scaled-down version of the green deals banner from `app/produkte/page.tsx`.

Spec:
- Same gradient background, same icon pill, same copy structure, same white CTA pill with hover.
- Scaled down: reduce padding, font sizes, and overall height to fit comfortably between BrandStrip and Testimonials.
- German copy: **"Wir feiern 30 Jahre mit einem ganzen Jahr voller Angebote"** — use as-is (confirmed length acceptable at smaller scale; confirm with user if it still feels too long after seeing rendered output).
- Eyebrow line: **"Aktuelle Kampagne · 3 Angebote"**
- CTA label: **"Angebote ansehen →"**
- Entire banner is a `<Link href="/angebote">`.
- Extract as `components/DealsPromo.tsx` so it's reusable in both `/produkte` and homepage.
- Update `app/produkte/page.tsx` to use the new `<DealsPromo />` component instead of the inline banner.

---

### §Detail — Product Detail Page Rebuild

#### 2A. Inquiry form on product detail pages
- Mirror the deal detail page exactly: variant selector (if `hasVariants`), quantity selector, price summary, inquiry form.
- For single-SKU products (no variants): treat the fixed `campaignPrice` as the selected price, no variant dropdown.
- Submit to `public.inquiries` with `offer_id: null` (no associated deal), `selected_x99_variant_id` from selected variant.
- Same validation, same success redirect to `/danke`, same error state.

#### 2B. Image gallery (product AND deal detail pages)
Layout — desktop:
```
[ thumb 1 ]  [                    ]
[ thumb 2 ]  [    main image      ]  title, price, variants, form...
[ thumb 3 ]  [                    ]
```
- Thumbnails stacked vertically to the left of the main image.
- Main image: large, vertical orientation (~credit-card proportions, roughly 2:3 or 3:4).
- Clicking a thumbnail swaps it into the main slot (client state).
- Up to 4 images total (1 main + 3 thumbs). Show only what's available. Minimum 1 image required.
- Currently no real images exist — use teal-tinted placeholder blocks that maintain the correct aspect ratio. Images can be swapped in later via `lib/data.ts` or Supabase without layout changes.

Layout — mobile:
- Main image full width at top.
- Thumbnails in a horizontal row below the main image (scrollable if needed).
- Everything else (title, form, etc.) stacks below.

#### 2C. Variant label copy
- Replace any occurrence of "Variante wählbar" with **"Verfügbar in X Ausführungen"** (X = actual variant count).
- Only show this label when variant count > 1.
- Applies site-wide: product tiles in catalog, product detail pages, any card or listing surface.

#### 2D. Discount badge format
- Format: **"-30%"** — always. No words.
- Compute from `originalPrice` and `campaignPrice` when available.
- If no discount: badge hidden entirely (no empty badge element rendered).

---

## Open Questions (must confirm before coding §Banner, §Detail)

| # | Question | Options |
|---|---|---|
| Q1 | Is `ProductSpotlight` the component being called "30 Jahre Jubiläum"? | Yes / No — if not, identify which component |
| Q2 | German copy for homepage banner — confirm **"Wir feiern 30 Jahre mit einem ganzen Jahr voller Angebote"** as-is, or approve a shorter variant | Confirm / Shorten to: … |
| Q3 | Mobile gallery (§2B): thumbnails horizontal-row below main image? | Yes (confirmed above) / Different layout |
| Q4 | No-discount products (§2D): badge hidden entirely? | Yes, hide / Show neutral badge |

---

## "Done" Criteria (Iteration 2)
- TypeScript: `tsc --noEmit` passes with 0 errors
- Dev server runs cleanly at `http://localhost:3001`
- All routes return 200; `/produkte/nonexistent` returns 404
- ProductCard has no `+` button; entire card is clickable
- Homepage has no ProductSpotlight; mini deals banner in its place
- Product detail pages have gallery + inquiry form matching deal detail page structure
- Badges everywhere show "-30%" format, no descriptive labels
- Only two text colors used site-wide (slate-900, slate-500)
