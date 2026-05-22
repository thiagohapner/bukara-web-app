# Project Specs — BuKaRa GmbH Website

## What the App Does & Who Uses It
B2B inquiry shop for **BuKaRa GmbH**, exclusive ITA Tools partner. Customers (woodworking / CNC shops) browse industrial cutting tools, configure quantity and variants, add items to an anonymous cart, and submit a cart-based inquiry at checkout. No payment processing — the "order" is a structured inquiry that triggers an email to the team.

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.4, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | GSAP + ScrollTrigger |
| Backend | Supabase (anon key, RLS on all tables) |
| Email | Gmail SMTP via Supabase Edge Functions (nodemailer) |
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
| `/warenkorb/checkout` | `app/warenkorb/checkout/page.tsx` | Live |
| `/danke` | `app/danke/page.tsx` | Live |
| `/kontakt` | `app/kontakt/page.tsx` | Live |
| `/loesungen` | `app/loesungen/page.tsx` | Live |
| `/loesungen/[slug]` | `app/loesungen/[slug]/page.tsx` | Live |
| `/ueber-uns` | `app/ueber-uns/page.tsx` | Live |

---

## Design System

### Colors
| Token | Hex | Role |
|---|---|---|
| Brand teal | `#00A597` | Primary accent, buttons, badges, links |
| Brand teal dark | `#007A70` | Hover state for primary |
| Brand red | `#9B242A` | Price text, badge backgrounds, required field indicators |
| Text dark | `slate-900` (#0F172A) | Headings, primary body |
| Text secondary | `slate-500` (#64748B) | Supporting text — used sparingly for hierarchy |
| Border | `slate-100` / `slate-200` | Card borders, dividers |
| Surface | `white` / `slate-50` | Card backgrounds |

**Two-color rule:** Only `slate-900` and `slate-500` for text. No additional grays outside of interactive elements and badges.

### Typography
Hierarchy through **weight and size only**:
- No italic, no `tracking-widest` uppercase labels except in established patterns (breadcrumbs, table/section headers)
- No one-off color treatments

### Badges
Always show actual discount as **"-30%"** format (minus + number + percent). Never descriptive labels. If no discount applies, badge is hidden entirely.

### Buttons
- `.btn-orange` — teal filled, white text, pill shape (primary CTA)
- `.btn-outline` — transparent, slate border, dark text (secondary)

---

## Supabase Schema

### Existing tables
| Table | Key columns | RLS |
|---|---|---|
| `products` | `id uuid PK`, `slug`, `name`, `is_active` | anon read |
| `product_variants` | `sku`, `variant_name`, `original_price`, `campaign_price`, `sort_order`, `is_active` | anon read |
| `offers` | `id uuid PK`, `slug`, `title`, `is_active` | anon read |
| `offer_items` | `offer_id`, `product_id`, `is_variant_selector` | anon read |
| `inquiries` | contact fields, `offer_id`, price fields, `status`, `service_type`, `sonder_details jsonb` | anon insert |
| `service_inquiries` | `service_type`, `company_name`, contact fields, scheduling fields, `sonder_details jsonb`, `spec_file_url` | anon insert |

### New tables (e-commerce iteration)
| Table | Key columns | RLS |
|---|---|---|
| `skus` | `id uuid PK`, `product_id FK→products`, `artikel_nr UNIQUE`, `variant_label`, `price`, `campaign_price`, `stock_quantity DEFAULT 999`, `is_active`, `sort_order` | anon read |
| `product_specs` | `id uuid PK`, `product_id FK→products`, `spec_key`, `spec_value`, `sort_order` | anon read |
| `product_materials` | `id uuid PK`, `product_id FK→products`, `material_name`, `suitability CHECK(sehr gut geeignet/gut geeignet/geeignet/nicht geeignet)`, `sort_order` | anon read |
| `product_cutting_data` | `id uuid PK`, `product_id FK→products`, `diameter`, `feed_rate`, `rpm_range`, `sort_order` | anon read |
| `carts` | `id uuid PK`, `created_at`, `updated_at`, `expires_at (+7d)` | anon CRUD |
| `cart_items` | `id uuid PK`, `cart_id FK→carts (CASCADE)`, `sku_id FK→skus (nullable)`, `deal_id FK→offers (nullable)`, `selected_sku_id FK→skus (nullable)`, `quantity`, `unit_price`, `discount_pct` | anon CRUD |
| `deal_skus` | `(deal_id, sku_id) PK`, `quantity`, `is_variable` — `is_variable=true` means customer picks variant | anon read |
| `orders` | `id uuid PK`, `cart_id FK→carts`, `firmenname`, `ust_idnr`, `ansprechpartner`, `email`, `telefon`, `nachricht`, `total_net`, `total_gross`, `status CHECK(new/confirmed/invoiced/shipped)`, `submitted_at` | anon insert |

| `categories` | `id uuid PK`, `name`, `slug UNIQUE`, `parent_id FK→categories (self-ref)`, `sort_order`, `is_active` | anon read |
| `product_categories` | `id uuid PK`, `product_id FK→products (CASCADE)`, `category_id FK→categories (CASCADE)`, UNIQUE(product_id,category_id) | anon read |

### cart_items FK disambiguation
Two FKs from `cart_items` to `skus` require explicit PostgREST hint syntax in queries:
- `sku:skus!cart_items_sku_id_fkey(...)` — the product SKU
- `selected_sku:skus!cart_items_selected_sku_id_fkey(...)` — the variable SKU selected for a deal

---

## Static Data (`lib/data.ts`)

- **`BUKARA_PRODUCTS`** — 3 products (X99 Fräser, Thermo-Schrumpffutter, TurboNesting Komplett Set) with `name`, `slug`, `tagline`, `description`, `images`, `badge`
- **`DEALS`** — 3 deals with `fixedItems` arrays for price calculation on deal detail page; `slug`, `title`, `subtitle`, `badge`, `images`, `includedProducts`
- **`PRODUCT_IDS`** — maps product slug → Supabase `products.id` UUID
- **`DEAL_IDS`** — maps deal slug → Supabase `offers.id` UUID
- **TypeScript interfaces:** `BukaraSku`, `ProductSpec`, `ProductMaterial`, `ProductCuttingData`

`PRODUCT_IDS`:
```ts
"x99-fraeser":                        "9de70823-6ae4-4a96-b071-94336b31318b"
"thermo-schrumpffutter":              "4b4cffb6-b2a1-4e82-bb53-6c44b1c66600"
"turbonesting-turbinen-komplett-set": "b9d5cbc3-7e3f-401c-b7d2-46339a901175"
```

`DEAL_IDS`:
```ts
"x99-only":             "a10d2266-76a7-45bc-b7e7-44f81b952b0d"
"x99-thermo-bundle":    "a095cb06-baf9-43fb-bc3f-2026a3eedee8"
"x99-turbonesting-set": "a60cb177-4118-4eb1-a15b-fea3e519002a"
```

---

## Cart & Pricing Logic

### `lib/cart.ts`
Anonymous cart backed by Supabase. Cart ID stored in `localStorage` as `bukara_cart_id`.

Key functions:
- `getOrCreateCart()` — reads localStorage, creates Supabase row if missing
- `getCartItems(cartId)` — fetches items with nested SKU, product name, deal, selected_sku joins
- `addToCart(cartId, skuId, qty, unitPrice)` — upserts cart_item (increments qty if same sku already in cart)
- `addDealToCart(cartId, dealId, selectedSkuId, qty, unitPrice)` — adds deal item
- `updateQuantity(itemId, qty)` — patches quantity
- `removeItem(itemId)` — deletes cart_item row
- `clearCart(cartId)` — deletes all cart_items for the cart

### `lib/pricing.ts` — `cartTotals(items)`
```
subtotal  = sum(unit_price × quantity)
bulkDiscount = subtotal ≥ 500 ? subtotal × 0.10 : 0
net       = subtotal − bulkDiscount
vat       = net × 0.19
shipping  = net < 500 ? 9.50 : 0  (computed on pre-discount subtotal threshold)
gross     = net + vat + shipping
```

---

## Components

| Component | File | Notes |
|---|---|---|
| Navbar | `components/Navbar.tsx` | Sticky; cart icon with count badge; ITA partner badge |
| Footer | `components/Footer.tsx` | — |
| CartContext | `components/CartContext.tsx` | React context — cart state + drawer open/close |
| CartDrawer | `components/CartDrawer.tsx` | Fixed right panel; items, totals, checkout CTA |
| DealCard | `components/DealCard.tsx` | Full-width alternating card — **do not change** |
| ProductCard | `components/ProductCard.tsx` | Entire card is clickable link |
| ProductGallery | `components/ProductGallery.tsx` | Thumbnail strip + main image; placeholder fallback |
| BestSellers | `components/BestSellers.tsx` | Uses ProductCard |
| LatestProducts | `components/LatestProducts.tsx` | Uses ProductCard |
| DealsPromo | `components/DealsPromo.tsx` | Green gradient banner linking to /angebote |

### CartContext API
```ts
cartId: string | null
items: CartItem[]
cartCount: number           // total quantity across all items
isDrawerOpen: boolean
openDrawer() / closeDrawer()
addItem(skuId, qty, unitPrice)
addDeal(dealId, selectedSkuId, qty, unitPrice)
updateItem(itemId, qty)
removeCartItem(itemId)
clearAll(cartId)
```

---

## Cart Flow (End-to-End)

1. Customer lands on `/produkte/[slug]` or `/angebote/[slug]`
2. Selects variant (if applicable) + quantity → clicks "In den Warenkorb"
3. Cart icon badge updates; CartDrawer slides in from right
4. Drawer shows items, totals, "Zur Anfrage" CTA
5. Customer clicks "Zur Anfrage" → navigates to `/warenkorb/checkout`
6. Checkout page: order summary left, contact form right
7. Submit → inserts `orders` row → calls `send-order-email` Edge Function → `clearAll()` → redirect `/danke`

---

## Supabase Edge Functions

| Function | Trigger | Description |
|---|---|---|
| `send-inquiry-email` | Supabase DB webhook on `inquiries` insert | Sends product inquiry email |
| `send-service-inquiry-email` | HTTP POST from `/loesungen/[slug]` forms | Schärfservice + Sonderwerkzeug emails |
| `send-contact-email` | HTTP POST from `/kontakt` form | General contact emails |
| `send-order-email` | HTTP POST from `/warenkorb/checkout` | Order confirmation email with itemized table + totals |

All functions use Gmail SMTP (nodemailer), `GMAIL_APP_PASSWORD` env secret, `verify_jwt: false`.

`send-order-email` POST body:
```ts
{
  order: { id, submitted_at, firmenname, ust_idnr, ansprechpartner, email, telefon, nachricht },
  items: Array<{ name, artikel_nr, variant_label, qty, unit_price, line_total }>,
  totals: CartTotals
}
```

---

## Product Detail Page (PDP) — Flexible Sections

`app/produkte/[slug]/page.tsx` fetches four data sets in parallel on mount using `PRODUCT_IDS[slug]`:

| Section | Renders when |
|---|---|
| Variant selector | `skus.length > 1` |
| Artikel-Nr. | SKU loaded |
| Stock warning (amber) | `stock_quantity < 10 && > 0` |
| "Derzeit nicht verfügbar" | `stock_quantity === 0` |
| "Auf einen Blick" card | `product_specs.length > 0` |
| Materialien grid | `product_materials.length > 0` |
| Schnittdaten table | `product_cutting_data.length > 0` |

Material suitability dot system: `●●● sehr gut geeignet`, `●●○ gut geeignet`, `●○○ geeignet`, `○○○ nicht geeignet`.

---

## Deal Detail Page

`app/angebote/[slug]/page.tsx` fetches variable SKUs via `deal_skus` table (`is_variable = true` rows). Customer selects X99 variant; deal price = selected variant campaign_price + fixed items campaign prices. Calls `addDeal()` to cart.

---

## "Done" Criteria (E-Commerce Iteration)
- `npm run build` passes with 0 TypeScript errors ✓
- Cart badge updates after adding item
- Cart persists on page refresh (localStorage + Supabase)
- Checkout: `orders` row created in Supabase → email arrives at bukaragmbh@gmail.com → cart clears → redirect to `/danke`
- PDP extended sections: only render when Supabase has rows for that product
- Stock < 10 → amber warning; stock = 0 → button disabled

---

## Admin Panel (`/admin`)

Password-protected CMS for BuKaRa staff to manage products, deals, and orders without a code deploy.

### Route Structure

| Route | File | Purpose |
|---|---|---|
| `/admin/login` | `app/(admin)/login/page.tsx` | Email/password sign-in |
| `/admin/dashboard` | `app/(admin)/dashboard/page.tsx` | Overview: product count, deal count, new orders |
| `/admin/products` | `app/(admin)/products/page.tsx` | Product list |
| `/admin/products/new` | `app/(admin)/products/new/page.tsx` | Create product |
| `/admin/products/[id]` | `app/(admin)/products/[id]/page.tsx` | Edit product (4 tabs) |
| `/admin/deals` | `app/(admin)/deals/page.tsx` | Deal list |
| `/admin/deals/new` | `app/(admin)/deals/new/page.tsx` | Create deal |
| `/admin/deals/[id]` | `app/(admin)/deals/[id]/page.tsx` | Edit deal (3 tabs) |
| `/admin/orders` | `app/(admin)/orders/page.tsx` | Orders inbox with status filter |
| `/admin/orders/[id]` | `app/(admin)/orders/[id]/page.tsx` | Order detail |

### Auth

- Supabase Auth (email/password) — single admin account
- Session checked server-side in `app/(admin)/layout.tsx` using `@supabase/ssr`
- Redirects to `/admin/login` if no valid session
- All `/api/admin/*` routes reject with 401 if no session

### Image Pipeline

- `POST /api/admin/upload-image` — auth check → Sharp WebP (max 1400px, quality 82, strip EXIF) → Supabase Storage `images` bucket → DB insert → returns `{id, image_url, sort_order}`
- `DELETE /api/admin/delete-image` — removes Storage object + DB row
- `PATCH /api/admin/reorder-images` — updates sort_order values
- Upload uses XMLHttpRequest (not fetch) for progress events
- Max 4 images per product or deal

### Product Edit Page (4 tabs)

| Tab | Fields |
|---|---|
| Details | name, slug, badge, gallery_bg, gallery_label, description, is_active, has_public_page |
| SKUs | artikel_nr, variant_label, price, campaign_price, stock_quantity, sort_order |
| Produktdaten | specs (key/value), materials (name + suitability), cutting data (diameter, feed_rate, rpm_range) |
| Bilder | ImageUploadManager (drag-to-reorder, progress bar, max 4) |

### Deal Edit Page (3 tabs)

| Tab | Fields |
|---|---|
| Details | title, slug, subtitle, badge, gallery_bg, gallery_label, is_active |
| Produkte | offer_items — product selector, is_anchor toggle (exactly one anchor required), sort_order |
| Bilder | ImageUploadManager (drag-to-reorder, progress bar, max 4) |

### Security Constraints

- Service role key only in server-side API routes — never in client components or shared files client components can import
- Do NOT add RLS write policies on: `carts`, `cart_items`, `orders`, `contact_inquiries`, `service_inquiries`, `inquiries`, `product_variants`, `deal_skus`
- All `/api/admin/*` routes must verify admin session as the first operation, reject with 401 if none
- Use `@supabase/ssr` server client for session checks (not the browser anon client)

### New Dependencies

- `sharp` + `@types/sharp` — server-side image processing in API routes
- `@supabase/ssr` — SSR-safe Supabase client for auth in server components and API routes
