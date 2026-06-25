# Mobile UX Audit & Plan

Audit of the storefront's mobile experience (code-level review across navbar/chrome,
catalog/PDP, checkout/home/secondary pages). Tiers reflect priority.

## Dismissed (checked, not real)
- CartDrawer `max-w-md` "overflow on small phones" — it's `w-full max-w-md`, so full-width
  on phones; the cap only applies on tablets. Fine.
- Sticky filter bar `md:top-[108px]` "unverified" — correct by construction (tablet header =
  36px strip + 72px bar; nav row is `lg`-only). Matches the 158px measured at `lg`.
- "Inverted" heading breakpoints — `text-4xl sm:text-5xl` grows with screen; just large on
  mobile (folded into Tier 3 type-scale).

## Tier 1 — real bugs — DONE
- **iOS input zoom**: form fields <16px caused Safari auto-zoom on focus. Global rule in
  `app/globals.css` forces `input/select/textarea` to 16px ≤640px.
- **Body scroll-lock**: `components/CartDrawer.tsx` now locks `body` overflow while open.
- **Mobile menu height**: `components/Navbar.tsx` menu capped to `max-h-[calc(100dvh-72px)]`
  + inner `overflow-y-auto` (was a fixed `max-h-[680px]` that truncated on short phones).
- **PDP wide table**: the 3-col Schnittdaten table is wrapped in `overflow-x-auto`
  (`KatalogProductContent.tsx`). (2-col Staffelpreis/Abmessungen tables fit; left as-is.)
- **Home carousel height**: `CategoryShowcaseCarousel.tsx` cards were a fixed `min-h-[600px]`
  → `min-h-[380px] sm:[480px] lg:[600px]`, with the image offset made responsive too.

## Tier 2 — touch targets — DONE (most)
- Cart qty buttons `w-7`→`w-9`, drawer close `w-8`→`w-9` (`CartDrawer.tsx`).
- Range-slider thumbs `16px`→`22px` + `:active` scale (`globals.css`).
- Mobile "Filtern & Sortieren" button + catalog pagination buttons → `min-h-[44px]`
  (`KatalogCatalog.tsx`).
- **Remaining:** filter-panel "Apply" buttons (`KatalogMaterialPanel`/`KatalogMultiSelectPanel`)
  to `min-h-[44px]`.

## Tier 3 — readability & layout polish — TODO
- Mobile type scale: avoid 10–11px for meaningful text; price block `text-xl sm:text-2xl`;
  tone down oversized mobile headings.
- Checkout (`warenkorb/checkout/page.tsx`): stack voucher input/button on mobile; make order
  summary reachable (sticky from `md`, or above the form on mobile); wrap long cart line items.
- Home: padding/sizing on `PromoTiles`, `BannerSonderwerkzeuge` feature box, `FeatureBar`;
  clearer carousel scroll affordance.
- Kontakt (`kontakt/page.tsx`): show the form before the sidebar/image on mobile.

## Tier 4 — discoverability nice-to-haves — TODO
- Gallery position dots (`ProductGallery.tsx`); scroll cues on long filter panels; wider
  variant dropdown on mobile (`CustomSelect.tsx`).

## Verification note
Tier 1+2 changes are build-verified (`tsc` clean; only the pre-existing `StaffelpreisTable`
lint error remains, unrelated). The visual ones (menu height, carousel) are standard
responsive CSS; they can be pixel-verified in the mobile Chromium harness on request.
