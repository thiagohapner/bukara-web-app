# Bukara Design System

Single source of truth for visual decisions on bukara-web-app. Read this
before touching any styling. Tokens live in `app/globals.css`; a live,
clickable reference lives at `/design-system` (public route, not linked
in nav, `noindex`).

**Visual reference: stripe.com (marketing site).** Stripe is the model for
Bukara's visual language — generous whitespace, light/thin display type,
restrained single-accent color use, subtle tinted shadows, precise two-track
motion. Only the palette changes (Bukara teal `#01A497`, not Stripe's blue/
teal mix); layout rhythm, type weight philosophy, and interaction feel
should read as "the same design sensibility as stripe.com." The original
Stripe-derived rules/tokens package this system was distilled from lives at
`design-system/stripe-reference/` — treat it as inspiration/reference, not
code the app imports (see the README in that folder).

This is a **style system**, not a component-behavior spec: it governs
color, type, spacing, radius, shadow, and motion. It does not mandate
rewriting component structure/markup/logic — but achieving the Stripe-level
look legitimately does require migrating individual components (starting
with type weight) over time; see §10.

---

## 1. Brand

- Primary brand color: **`#01A497`** (`--color-brand-500` / legacy alias `--color-orange-500`).
  This is the ONLY accent color for primary buttons, active links, focus rings,
  and interactive affordances. Never substitute a different teal/green hex inline.
- Primary ink: **`#022221`** (`--color-ink`, aliased as `slate-900`/`slate-800`
  utilities). Never pure black (`#000000`) for text.
- Sale/alert badge red **`#9B242A`** is a separate functional color (cart count,
  "Angebot" badges) — not part of the brand ramp, do not blend with brand teal.

## 2. Color tokens (`app/globals.css`)

| Purpose                      | Token(s)                                   |
|-------------------------------|---------------------------------------------|
| Brand ramp (25→975)            | `--color-brand-{25,50,75,100,200,300,400,500,600,700,800,900,950,975}` also usable as Tailwind `bg-brand-500`, `text-brand-600`, etc. |
| Legacy brand aliases (back-compat only, do not use in new code) | `--color-orange-*`, `--orange`, `--orange-dark`, `--color-primary*` |
| Green-tinted neutrals (borders, quiet text, icons, dividers) | `--color-neutral-{25,50,100,200,300,400,500,600,700}` / Tailwind `neutral-*` |
| Ink / body text               | `--color-ink`, `--color-body`, `--color-body-muted`, `slate-900`/`slate-800` utilities |
| Surfaces                      | `--color-canvas`, `--color-canvas-parchment`, `--color-surface-pearl`, `--color-surface-tile-*` |
| Dark sections                 | `--color-surface-dark` (deep brand teal `#041A19`), `--color-text-dark-heading` (`#fff`), `--color-text-dark-body` (`#A6CDC6`), `--color-text-dark-link` (`brand-300`), `--color-border-dark` (`brand-800`) |
| Status                        | `--color-error` (`#FF3C40`) |

**Dark sections.** For a dramatic dark band on the otherwise-light page (the
homepage promo banners today), use `--color-surface-dark` with the
`--color-text-dark-*` tokens for text/links, `--color-border-dark` for a
subtle hairline, and pair with an aurora glow (§5) — glow only reads on dark.
Body copy uses `.body-text--on-dark`, an eyebrow uses `.eyebrow--on-dark`
(the plain `.eyebrow` hardcodes dark ink and is invisible on dark), and a
checklist uses `.checklist--on-dark` (§8). Keep it monochrome brand teal;
the flat `--color-brand-500` button is
the focal CTA since it pops against the dark field.

**Rule: neutrals are always green-tinted.** Never use Tailwind's default
`slate-*`/`gray-*`/`zinc-*` palette for borders, dividers, muted text, or
icon fills — those are blue-grey and read as off-brand. Use `neutral-*`
instead. (`slate-900`/`slate-800` are the one exception: hijacked in
`@theme` to resolve to brand ink, so they're safe.)

**Rule: no inline hex.** If a color isn't a token yet, add it to
`app/globals.css` first, then reference the token. Do not paste `#01A597`,
`#0F172A`, `#2E4A47`, etc. directly into components — see §6 for why this
matters.

## 3. Typography

Font family stays **Geist** (variable font, already loaded — no licensed
Söhne files available). Type tokens in `app/globals.css`:

| Token | Value | Use |
|---|---|---|
| `--fw-light` | 300 | **Display/heading type and body text** (matches the Stripe reference) |
| `--fw-regular` | 400 | Nav links, eyebrows, form controls |
| `--fw-medium` | 500 | Light emphasis (labels) |
| `--fw-bold` | 600 | Strong emphasis — used sparingly, not for headings |
| `--fs-display-xxl` … `--fs-xs` | 3.5rem → 0.875rem | See scale below |

Headings and body are weight **300 (light)**, per the Stripe reference —
hierarchy comes from size, letter-spacing, and color, with a light,
airy feel rather than heavy type. (This was briefly set to 400 and then
reverted back to 300.)

Reference scale:

```
Display XXL   56px / 300 / lh 1.03  / ls -0.025em   — stat/hero numbers
Display XL    48px / 300 / lh 1.03  / ls -0.02em    — reserved, not currently used on any live page
Display L     44px / 300 / lh 1.05  / ls -0.02em    — big promo banner headlines (§4). Bukara-specific
                                                        rung, doesn't exist in the Stripe reference —
                                                        sits between Display XL and H1/H2.
H1            40px / 300 / lh 1.2   / ls -0.02em    — rare; a page's single top-level title
H2            32px / 300 / lh 1.1   / ls -0.02em    — reserved for larger/hero-adjacent headings, used sparingly
H3            26px / 300 / lh 1.12  / ls -0.01em    — DEFAULT for section headers, PDP product names, page titles
H4            22px / 300 / lh 1.1   / ls -0.01em
Body          16px / 300 / lh 1.4
Nav links     14px / 400
Eyebrow       14px / 400, no uppercase, no letter-spacing
```

**Rule: default section/page heading size is H3, unless stated otherwise.**
"Regular section headers, product names on the PDP, and similar" — homepage
section headers (`SectionHeader`), PDP/deal/category/service page titles,
etc. — use `.heading-h3`. Reach for H2/H1/Display sizes only for headings
that are explicitly called out as larger (hero sections, big promo banners).

**Use the utility classes, don't hand-roll the combo.** `app/globals.css`
defines `.heading-xxl`, `.heading-xl`, `.heading-l`, `.heading-h1`, `.heading-h2`,
`.heading-h3`, `.eyebrow`, `.body-text` / `.body-text--subdued` — each sets
size + weight + line-height + letter-spacing + color together, mirroring
the Stripe reference's own class names (except `.heading-l`, a Bukara
addition — see above). Apply the class instead of
composing `text-*`/`font-*`/`tracking-*` Tailwind utilities by hand; that's
exactly how heading weight/letter-spacing drift happens (see §10).

**Rule: headings and body are light (300), never heavy.** `font-bold`/
`font-extrabold`/`font-black` on an `<h1>`–`<h3>` (or on body/emphasis text)
is off-system. Weight carries hierarchy through size and color, not
boldness. This is a real gap today — see §10.

## 4. Spacing & Radius

Spacing uses Tailwind's default rem scale plus one semantic token,
`--space-section: 96px`, for vertical rhythm between major page sections.

Radius (`app/globals.css`, single source of truth):

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 2px | dropdown rows, calendar cells |
| `--radius-sm` | 4px | buttons, inputs |
| `--radius-md` | 8px | cards |
| `--radius-lg` | 12px | panels, containers, galleries |
| `--radius-xl` | 24px | hero frames, large feature panels |
| `--radius-pill` | 9999px | chips, badges, pills, avatars |

**Rule: don't reach for Tailwind's raw `rounded-xl`/`rounded-2xl`/arbitrary
`rounded-[Npx]`** unless it maps to one of the above. Today the app mixes
`rounded-lg`, `rounded-xl`, `rounded-2xl`, and one arbitrary `rounded-[28px]`
somewhat interchangeably for what should be the same "card" radius — pick one.

**Big promo banners** (`components/BannerSonderwerkzeuge.tsx`, the homepage
carousel banners): outer container corner radius is `md` (`rounded-md`,
8px) — not `rounded-2xl`. Headline size differs by slide: the two
`darkHero` slides (Sonderlösungen, Schärfservice) use `.heading-l`
(Display L); the X99 slide keeps `.heading-xl` (Display XL) and its own
distinct look (dark gradient bg, image panel, drop shadow) — no `bgPattern`,
it's intentionally not part of this restyle.

Both `darkHero` slides share the same **layout** rendered behind
`BannerAurora` (a left-clustered aurora glow + a breathing background line
pattern). No photo is used anymore (`/service2_banner.png` is unreferenced).
They share one layout: big headline + body + a `.btn-arrow` CTA and an
on-surface right panel indented ~right.

**Per-slide background (`bgPattern`):** each service gets its own motif:
- **Sonderwerkzeuge** → `grid`: the technical-drawing / graph-paper grid via
  `BannerAurora` (glow + `.banner-grid`) — the "made-to-drawing" story. Has
  dark (light lines) and `--light` (dark teal lines) variants.
- **Schärfservice** → `petals`: an animated **mesh gradient**
  (`components/HeroWaveAnimation.tsx`), à la meshgradient.com / Stripe's hero,
  recolored to the Bukara teal ramp. A WebGL fragment shader blends 4 teal
  tones (deep → brand → mint → pale) across a domain-warped fbm noise field
  that flows over time — a full, smooth, edge-to-edge color field. Driven on
  the GSAP ticker, reduced-motion-safe (static frame). Clustered right,
  masked to fade left (`.banner-petals`); a right-weighted scrim
  (`.banner-petals-scrim`) keeps the 1-2-3 stepper legible over it.
- **X99 product teaser** → no pattern: a plain deep diagonal brand-teal
  gradient surface with the full-bleed product image on the right. (No mesh —
  the animated mesh is reserved for Schärfservice only.)

They differ in the **right panel** (`RightPanel` kind):
- **Sonderlösungen** → `features`: the `.checklist` (6 benefit items with
  check badges).
- **Schärfservice** → `stepper`: a numbered 1-2-3 `.banner-stepper` (outline
  circles joined by a vertical connector, each with a title + subline)
  describing the 3-step process — Formular ausfüllen · Abholung · Fertig in
  1–2 Wochen.

### Hero colour theme (`heroMode`)

The aurora-hero layout ships in two swappable palettes, set per slide via
`heroMode` (default `"dark"`). Same layout + atmosphere, different surface:

- **`dark`** (Schärfservice): deep brand-teal gradient (brand-800 →
  brand-950), white headline, `.body-text--on-dark`, white `.btn-white` CTA,
  `.checklist--on-dark`, `.banner-grid` (light lines on dark), border
  `--color-border-dark`, no shadow.
- **`light`** (Sonderlösungen): pale brand-teal gradient (`brand-25 →
  brand-50 → brand-100`), ink headline (`--color-ink`), `.body-text--subdued`,
  brand-filled `.btn-brand` CTA (white chevron→arrow), `.banner-stepper--light`
  / plain `.checklist`, `.banner-grid--light` (dark teal lines on light — like
  real graph paper), border `--color-brand-100`. No shadow (banners are flat).

`BannerAurora` takes a `light` prop that switches the glow blobs to soft
teal washes and the grid to its light tint. Both banners render live on the
homepage (dark Schärfservice + light Sonderlösungen) and on `/design-system`.

## 5. Shadows

Brand-teal-tinted (not grey, not Stripe's blue) double-layer shadows:

```
--shadow-xs  0px 2px 10px 0px rgba(4,72,67,.06),  0px 1px 4px 0px rgba(4,72,67,.04)
--shadow-sm  0px 5px 14px 0px rgba(4,72,67,.08),  0px 2px 8px 0px rgba(4,72,67,.05)
--shadow-md  0px 6px 22px 0px rgba(4,72,67,.10),  0px 4px 8px 0px rgba(4,72,67,.03)
--shadow-lg  0px 15px 40px -2px rgba(4,72,67,.10),0px 5px 20px -2px rgba(4,72,67,.04)
--shadow-xl  0px 20px 80px -16px rgba(4,72,67,.14),0px 10px 60px -16px rgba(4,72,67,.06)
--shadow-focus  0 0 0 4px rgba(1,164,151,.35)
```

Use `shadow-[var(--shadow-md)]` (or the equivalent literal) instead of
Tailwind's default `shadow-md`/`shadow-lg`, which are neutral-grey and
don't carry the brand tint.

## 6. Motion — two tracks, never mixed

```
NAV / UI (links, hovers, icon buttons):  240ms  cubic-bezier(0.45, 0.05, 0.55, 0.95)
BUTTONS (CTA background/border changes): 300ms  cubic-bezier(0.25, 1.00, 0.50, 1.00)
```

Tokens: `--ease-standard`, `--ease-emphasis`, `--dur-fast` (240ms),
`--dur-slow` (300ms), plus prebuilt `--transition-nav` / `--transition-button`
custom properties. Don't use Tailwind's bare `transition`/`transition-colors`
(150ms default, generic ease) for anything user-facing — it's neither track.

## 7. Buttons

Defined once as CSS classes in `app/globals.css` — **reuse these, don't
hand-roll new button styles per page**:

- `.btn-brand` — primary CTA, brand-filled, white text (named `.btn-brand`,
  not `.btn-orange` — that was legacy naming from when the placeholder
  brand color was literally orange; renamed everywhere in this migration)
- `.btn-black` — secondary CTA, ink-filled, white text
- `.btn-outline` — tertiary/ghost, bordered, ink text, brand border on hover
- `.btn-white` — for dark surfaces (the dark-hero banners): white fill,
  brand-ink text, faint teal tint on hover

**Link CTAs get an arrow.** Add `.btn-arrow` to any button that *navigates
somewhere* and drop `<CtaArrow />` (`components/CtaArrow.tsx`) as its last
child. A lucide `ChevronRight` shows by default and cross-fades into a lucide
`ArrowRight` on hover (Stripe-style) — both from the same icon set so they
share stroke weight/proportions and rendered size, and the button width
never changes. Do **not** use it on submit/step buttons (form "Absenden",
wizard Weiter/Zurück) — only on links. Prefer this over a hand-placed
trailing `<ArrowRight>` icon.

If a page needs a button style these don't cover, extend the shared
classes — don't inline another pattern with arbitrary Tailwind utilities
(see §10, this already happened several times).

## 8. Icon tiles & checklist

- `.icon-tile` (+ `--sm` / `--lg` modifiers) — square, rounded, brand-tinted
  container for a line icon (trust badges, contact links, feature callouts).
  40×40px default, `radius-md`, `brand-100` border, `brand-25` fill,
  `brand-500` icon color.
- `.checklist` / `.checklist-item` / `.checklist-badge` — benefit/feature
  list with a filled circular brand checkmark per item (sidebars, promo
  panels, service pages). Add `.checklist--on-dark` on the container when
  it sits on a dark surface — flips item text to white and adds a soft
  glow ring around each badge.

Both are shown live at `/design-system`.

## 9. Form elements

Extracted from the Schärfservice form redesign prototype
(`design-system/schaerfservice-reference/`) and now live in
`app/(public)/sonder-schaerfservice/page.tsx` as a real 6-step wizard —
**this is the canonical form pattern going forward**; any future form
should reuse these classes rather than inventing new ad-hoc styling.

- `.form-label`, `.form-input`, `.form-textarea` — labeled text inputs,
  48px height, brand focus ring
- `.form-pill` / `.form-pill--selected` — multi-select pill toggle
- `.form-option-card` / `.form-option-card--selected` +
  `.form-option-badge` / `.form-option-badge--selected` — single-select
  radio-style card with a circular selection indicator
- `.form-chip` / `.form-chip--active` — dropdown trigger (date/time pickers)
- `.form-dropdown` / `.form-dropdown-item` (+ `--selected`) — the panel
  that opens off a `.form-chip` (time lists, etc.)
- `.form-calendar-nav-btn`, `.form-calendar-weekday`, `.form-calendar-day`
  (+ `--today` / `--selected` / `--outside`) — the calendar grid inside a
  `.form-dropdown`
- `.form-step-label`, `.form-progress-track`, `.form-progress-fill` —
  horizontal multi-step progress bar ("Schritt 2 von 6"). Superseded on the
  request-form pages by the vertical phase nav below, but kept for reuse.
- `.kbd` — small keyboard-shortcut hint chip (e.g. "Enter ↵")

**Request-form page chrome (canonical).** The two request wizards
(`sonder-schaerfservice`, `sonder-werkzeug`) use a Stripe-onboarding layout:
the static `.form-aurora-bg` page background (near-white with soft teal corner
glows, `background-attachment: fixed`), **no** side-panel box and **no** white
form card — content sits directly on the background. The left column is a plain
sticky column with `components/FormStepNav.tsx` (a vertical done/active/upcoming
**phase** stepper — the many wizard steps collapse into ~4 named phases) plus a
plain contact block; the form fields sit card-less in the right column.

## 10. Known inconsistencies (migration backlog)

Audited via grep across `app/` and `components/` on 2026-07-01. Ranked by
impact. None of this needs fixing before the design-system docs/page are
useful, but it's why a single header restyle "looked like nothing changed" —
the rest of the app still routes around the token layer entirely.

1. **62 inline occurrences of `#00A597`** (the *old* brand hex, one digit off
   from the real brand `#01A497`) hardcoded directly in `.tsx` files instead
   of the `brand-500`/`text-brand-500` token. Same component sometimes uses
   the token-driven class *and* the raw hex a few lines apart. Any future
   brand color change requires a find-and-replace across 15+ files instead
   of editing one token.
2. **`#9B242A` (sale/badge red) hardcoded 47 times** — should be a token
   (`--color-badge` or similar) so it can be adjusted/reused/audited in
   one place, same reasoning as #1.
3. **Brand-dark color drift**: `#007A70`, `#2E4A47`, `#044749`, `#2d4a47`
   are four distinct near-brand dark hexes used in different files for what
   is conceptually the same "brand hover/pressed" or "dark ink" role. Should
   collapse to `brand-600`/`brand-700`/`--color-ink`.
4. ✅ **RESOLVED — navy `#0F172A` retired.** Was Tailwind's default near-black
   navy (a pre-rebrand leftover), used for `.btn-black`, the X99 banner
   controls, and checkbox accents. Collapsed into brand ink `#022221`
   (`.btn-black` fill → `--color-ink`, hover → `brand-900`); the `--navy` /
   `--navy-mid` tokens were removed. There is now one dark.
5. **Heading weights are heavy, not light.** 111 `font-semibold` + 58
   `font-bold` + 37 `font-extrabold` + 7 `font-black` instances across
   headings/emphasis text, vs. 18 `font-normal`. The DS calls for weight-300
   headings (§3) — today's headings are far heavier than that. This
   is the single biggest visual gap between "tokens updated"
   and "site looks redesigned," and it's a real design decision (not a
   find-and-replace) since it changes visual hierarchy — needs a deliberate
   per-template pass, not a blanket rule change.
6. **Radius is inconsistent**: `rounded-lg` (82×), `rounded-xl` (32×), one
   `rounded-2xl`, one arbitrary `rounded-[28px]` — likely 2-3 of these are
   meant to be the same "card" radius token and drifted over time.
7. **No shared Button component.** `.btn-orange`/`.btn-black`/`.btn-outline`
   exist in `globals.css` and are used in 47 places — good — but the header's
   "Sonderlösung gestalten" CTA (and others) hand-roll an equivalent style
   with raw Tailwind utilities instead of reusing `.btn-outline`, so a shadow/
   radius/motion tweak to the shared button classes won't reach every button
   on the site.
8. **Shadows never use the token scale** — every `shadow-sm`/`shadow-md`/
   `shadow-lg`/`shadow-xl`/`shadow-2xl` usage found is Tailwind's default
   neutral-grey shadow, plus two bespoke arbitrary purple-tinted shadows.
   None reference `--shadow-*`. The brand-tinted shadow tokens added in §5
   currently have zero consumers.
9. **Motion tokens have zero consumers** outside the header restyle just
   done — everything else still uses bare `transition`/`transition-colors`
   with Tailwind's default 150ms.

**Practical implication**: token updates alone (what we did to the header)
will keep looking like "nothing changed" until inline hex/heavy weights/
default-Tailwind shadows are migrated to reference these tokens, file by
file. Recommended order: (1) sale-badge red → token, (2) collapse the
brand-dark drift, (3) extract a shared `Button` component so CTA button
styling has one source of truth, (4) do a deliberate, reviewed pass on
heading weights per template (homepage hero first, highest visibility).

### Migration log

- 🐛 **Bug, not a design choice**: `.icon-tile`, `.checklist`/`.checklist-item`,
  `.form-pill`, `.form-option-card`, `.form-chip`, `.form-dropdown-item`,
  `.form-calendar-nav-btn`, and `.kbd` referenced `var(--sp-1-5|2|3|4|5)`
  and `var(--color-border|surface)` — names copied from the Stripe
  reference material's convention — that were never actually defined in
  this app's `:root`. Confirmed in the *compiled* output, not just source
  (`grep` the built CSS chunk, don't trust that a rule "looks right" in
  the source file). Effect: `gap`/`padding`/`border`/`background`
  declarations using an undefined `var()` with no fallback are invalid at
  computed-value time and silently reset to their initial value — the
  checklist checkmark sat flush against the label text, pills/option
  cards/chips lost their border and fill. Fixed by actually defining
  `--sp-1` through `--sp-8` and aliasing `--color-border` →
  `--color-neutral-50`, `--color-surface` → `#ffffff`. **Rule going
  forward**: after adding any CSS class that references a token, grep the
  *built* CSS (`.next/static/chunks/*.css` after `next build`) for that
  token's definition before considering the work done — don't just trust
  that the variable name looks plausible.
- ✅ `--color-ink`/`--color-body` were dead tokens set to a third near-black
  (`#131514`), different from the ink actually in use (`#022221`). Fixed to
  match — one more source of hex drift removed.
- ✅ `components/SectionHeader.tsx` (used on the homepage by `BestSellers`,
  `LatestProducts`, `NewsArticles`) migrated from
  `text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight` to
  `.heading-h3` (originally moved to `.heading-h2`, corrected to `.heading-h3`
  once the H3-default rule was set — see below). `.view-all` (the paired
  "View All" link) moved off Tailwind's default `#64748B` blue-grey onto
  `--color-neutral-500` and dropped its `font-medium` override to match the
  14px/400 nav-link rule. This is item #5 above, template 1 of many —
  first real visible proof that heading weight changes read as
  "redesigned," not just recolored.
- ✅ Heading/body weight: briefly set to 400, then reverted to **300
  (light)** to match the Stripe reference — the airy, light-type look.
  `.heading-*` and `.body-text` use `--fw-light`; nav/eyebrow/controls
  stay 400.
- ✅ H3 established as the default section/page-heading size (§3). The exact
  class combo `text-2xl sm:text-3xl font-extrabold text-slate-900
  leading-tight` had drifted into 12 near-identical copies across
  `ProduktPageContent`, `KatalogProductContent`, `DealPageContent`,
  `sortiment/[slug]`, `sonder-schaerfservice`, `danke`, `checkout`,
  `loesungen/[slug]` (×2), `DealCard`, and `ServiceCard` (×2) — all
  swept to `.heading-h3` in one pass, since it was already exactly one
  pattern pretending to be independent.
- ✅ `.btn-orange` renamed to `.btn-brand` everywhere (26 files) — the old
  name was a leftover from when the placeholder brand color was literally
  orange; the class always themed off `--orange`/`brand-500`, never
  Tailwind's orange palette, so the name was actively misleading.
- ✅ `components/BannerSonderwerkzeuge.tsx` (the big homepage promo
  carousel): headline moved from
  `text-2xl sm:text-3xl md:text-4xl font-extrabold` to `.heading-xl`
  (Display XL); container radius moved from `rounded-2xl` (32px) to
  `rounded-md` (8px, our `--radius-md` token).
- ✅ Added `.icon-tile`, `.checklist`/`.checklist-item`/`.checklist-badge`,
  and a `.form-*` component set (`.form-input`, `.form-pill`,
  `.form-option-card`, `.form-chip`, `.form-progress-*`, `.kbd`) — see §8–9.
  The `--input-*` tokens these rely on were referenced by the original
  Stripe reference material but had never actually been ported into this
  app's `:root`; added them now.
- ✅ `app/(public)/sonder-schaerfservice/page.tsx` rebuilt as the real
  6-step wizard from `design-system/schaerfservice-reference/` (tool type
  → pickup date/time → location → package size/weight → service options →
  contact → success), replacing the old single-page form. Same backend
  (`service_inquiries` insert + `/api/send-email`), extended with the new
  fields the redesign collects — including `tool_type`, a column that
  already existed on `service_inquiries` but the old form never wrote to.
  `.form-dropdown`/`.form-calendar-*` classes added to support the
  calendar + time-picker pattern.
- ✅ `components/BannerSonderwerkzeuge.tsx`: the "Sonderlösungen" and
  "Schärfservice" homepage promo slides (2nd/3rd in the carousel)
  restyled to match the Schärfservice form's sidebar panel — brand-25
  background, `neutral-100` border, ink heading with no lime highlight
  underline, `.checklist` feature list directly on the panel (no more
  floating white card with per-item Lucide icons), `.btn-brand` CTA
  instead of the bespoke dark/light button styles. Added a
  `sidebarStyle?: boolean` flag to the slide data so this could be
  scoped to just those two slides. The X99 slide (1st) is explicitly
  unchanged — still black bg, image panel, white CTA button, and its
  drop shadow.
- ✅ Dropped the drop shadow on the two `sidebarStyle` banner slides
  (kept on X99) and added `components/BannerAurora.tsx` — slow-drifting
  blurred brand-teal gradient blobs behind the content, GSAP-driven, in
  the spirit of stripe.com's aurora backgrounds (`.banner-aurora`,
  `.banner-aurora__blob`, `--grad-aura-brand-{1,2,3}` in
  `app/globals.css`). Respects `prefers-reduced-motion` via
  `gsap.matchMedia()` — animation is skipped entirely rather than just
  slowed down. Atmosphere only, one cluster, monochrome brand color, per
  the Stripe reference's gradient rule (§1 of the original package).
- ✅ Added a new type-scale rung, **Display L** (`--fs-display-l: 2.75rem`
  / 44px, `.heading-l`) — a Bukara addition that doesn't exist in the
  Stripe reference, sitting between Display XL (48px) and H1/H2. Used for
  the two `sidebarStyle` banner headlines instead of Display XL, which is
  now reserved/unused elsewhere. The 44px value matches `--hero-fs-md`
  from the original Stripe token package, so it's not an arbitrary
  in-between number.
- ✅ **Banner reconceived as a dark aurora hero** (supersedes the light
  "sidebar panel" look from the entries above). The two promo slides now
  use a deep brand-teal surface with a glowing aurora, eyebrow (light-teal
  `.eyebrow.eyebrow--on-dark`) → white `.heading-l` → `.body-text--on-dark`
  → a single flat `.btn-brand` CTA, and `.checklist--on-dark`. The
  `sidebarStyle` flag was renamed `darkHero` to match. Added dark-section
  tokens
  (`--color-surface-dark`, `--color-text-dark-{heading,body,link}`,
  `--color-border-dark`) — these existed in the original Stripe reference
  but had never been ported in — plus `--grad-aura-brand-core` (a brighter
  aurora core that reads on dark), `.body-text--on-dark`, and
  `.checklist--on-dark`. `components/BannerAurora.tsx` retuned from three
  scattered blobs to one coherent top-right glow cluster. X99 slide still
  untouched.
- ✅ Schärfservice banner given an optional full-bleed background photo
  (`bgImage` → `/service2_banner.png`) blended into the dark surface via a
  left→right gradient; replaces that slide's aurora (the checklist still
  renders over the photo, and the gradient stays ~0.6 dark on the right to
  keep it readable).
- ✅ **Remaining homepage components migrated** to the DS (`SelectedProducts`
  carousel, `CategoryShowcase` carousel, `HomeAboutSections`, `FeatureBar`,
  `Footer`): section headings → `.heading-h3`/`.heading-h2`; the about-section
  eyebrow → `.eyebrow.eyebrow--brand` (added that modifier, same cascade
  reasoning as `--on-dark`); default blue-grey `slate-{300..700}` → green
  `neutral-*` (or the dark-body token on dark surfaces); inline `#00A597`
  → `brand-500`; brand-dark drift `#044749` → `brand-800` and footer
  `#022221` → `--color-surface-dark`; grey `shadow-md` on carousel arrows →
  `--shadow-md`; heavy `font-semibold`/`font-extrabold` headings → 400/500
  per §3; color transitions → the 240ms standard motion track. The
  category card's arrow badge and the feature-bar hover moved onto brand
  teal.
- ✅ **Sonderwerkzeug form rebuilt as a wizard** at
  `app/(public)/sonder-werkzeug/page.tsx`, mirroring the Schärfservice
  wizard exactly (brand-25 sidebar + checklist/contact tiles; one question
  per step across 11 steps using `.form-pill`/`.form-option-card`/
  `.form-input`, progress bar, Enter/Escape keyboard nav, in-place success
  screen). The DB insert (`service_inquiries` + identical 18-key
  `sonder_details`), Storage upload, and `type:"sonderwerkzeug"`
  confirmation email are unchanged — only the UI. Primary CTAs repointed
  from `/loesungen/sonderwerkzeug` to `/sonder-werkzeug` (homepage banner,
  navbar desktop+mobile "Sonderlösung gestalten", search special-case);
  the old `/loesungen/[slug]` page is left as-is.
- ✅ **Commerce pages migrated to the DS** (go-live pass): product cards +
  shared blocks (`ProductCard`, `ServiceCard`, `DealCard`, `PromoTiles`,
  `DealsPromo`, `OrderBenefits`, `SortimentTiles`, `Testimonials`,
  `ProductGallery`, `ProductAccessories`), product detail (`produkte/[slug]`,
  `katalog/[slug]`), catalog + filter sidebars, deal page, cart drawer +
  checkout. Non-hijacked `slate/gray/zinc-{50..700}` → `neutral-*`; heavy
  weights lightened (`font-black`→semibold, price/total `extrabold`→bold, card
  titles `semibold`→medium); presentational only. `slate-900/800` (hijacked
  ink) preserved.
- ✅ **Token cleanup (backlog §10 items 1–4)**: (1) sale-red → new
  **`--color-sale`** token (`@theme`, `#9B242A`) — use `text-sale`/`bg-sale`/
  `border-sale` or `var(--color-sale)`; all 38 inline usages replaced. (2)
  Wrong brand hex **`#00A597` → `#01A497`** everywhere (email template +
  favicon + pages) — repo-wide count now 0. (3) Brand-dark drift collapsed:
  `#007A70`→brand-600, `#044749`→brand-800, `#2E4A47`/`#2d4a47`→neutral-700. (4)
  Navy `#0F172A` **retired** — collapsed into brand ink `#022221` everywhere
  (`.btn-black` fill → `--color-ink`, hover → `brand-900`; X99 banner controls,
  checkbox accents incl. admin); the `--navy`/`--navy-mid` tokens were removed.
  Repo-wide `#0F172A`/`--navy` count now 0. One dark from here on.
- ✅ **All service links repointed to the new form wizards**: every
  `/loesungen/schaerfservice` → `/sonder-schaerfservice` and
  `/loesungen/sonderwerkzeug` → `/sonder-werkzeug` across the site
  (AnnouncementBar, Navbar category + search special-case, Footer, PromoTiles,
  Hero, über-uns, and `ServiceCard` via a `SERVICE_FORM_HREF` slug map used by
  the `/loesungen` overview). The old combined `/loesungen/[slug]` forms are
  **redirect-retired** — `next.config.ts` permanently redirects both slugs to
  the new forms, so old links/bookmarks still work and the old `SchaerfContent`/
  `SonderContent` are no longer reachable. Both new wizards keep the existing
  backend (same `service_inquiries` insert shape + Storage upload + POST to
  `/api/send-email`); the notification recipient now falls back to
  `bukaragmbh@gmail.com` when `EMAIL_TO` is unset.
- ⬜️ **Still deferred** before/around go-live: legal/content pages
  (`ueber-uns`, `kontakt`, `impressum`, `datenschutz`, `agbs`, `b2b-portal`,
  `danke`); admin UI; and a deliberate heading-weight pass on any remaining
  `font-semibold` headings.

## 11. Where to look

- Tokens: `app/globals.css` (`@theme` block + `:root`)
- Stripe reference package (inspiration only, not imported by the app): `design-system/stripe-reference/`
- Schärfservice form redesign (reference only, not built yet): `design-system/schaerfservice-reference/`
- Visual reference: `/design-system` route
- Shared button classes: `app/globals.css` (`.btn-brand`, `.btn-black`, `.btn-outline`)
- This file: update it whenever a token is added/changed/deprecated.
