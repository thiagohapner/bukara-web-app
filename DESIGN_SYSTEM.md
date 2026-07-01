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
with type weight) over time; see §8.

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
| Status                        | `--color-error` (`#FF3C40`) |

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
| `--fw-regular` | 400 | **Default weight for everything** — headings, body text, nav links, buttons |
| `--fw-medium` | 500 | Light emphasis (labels, eyebrows) |
| `--fw-bold` | 600 | Strong emphasis — used sparingly, not for headings |
| `--fs-display-xxl` … `--fs-xs` | 3.5rem → 0.875rem | See scale below |

Deviation from the Stripe reference: Stripe sets display/heading type at
weight 300 (light). Bukara intentionally uses weight 400 (regular) as the
default everywhere instead — hierarchy comes from size, letter-spacing, and
color, not from going lighter-than-body-text on headings. The Stripe
reference package under `design-system/stripe-reference/` still documents
300; that's expected, ignore it for weight, keep it for size/spacing/motion/
shadow guidance.

Reference scale:

```
Display XXL   56px / 400 / lh 1.03 / ls -0.025em   — stat/hero numbers
Display XL    48px / 400 / lh 1.03 / ls -0.02em    — page hero
H1            40px / 400 / lh 1.2  / ls -0.02em
H2            32px / 400 / lh 1.1  / ls -0.02em    — section headings
H3            26px / 400 / lh 1.12 / ls -0.01em
H4            22px / 400 / lh 1.1  / ls -0.01em
Body          16px / 400 / lh 1.4
Nav links     14px / 400
Eyebrow       14px / 400, no uppercase, no letter-spacing
```

**Use the utility classes, don't hand-roll the combo.** `app/globals.css`
defines `.heading-xxl`, `.heading-xl`, `.heading-h1`, `.heading-h2`,
`.heading-h3`, `.eyebrow`, `.body-text` / `.body-text--subdued` — each sets
size + weight + line-height + letter-spacing + color together, mirroring
the Stripe reference's own class names. Apply the class instead of
composing `text-*`/`font-*`/`tracking-*` Tailwind utilities by hand; that's
exactly how heading weight/letter-spacing drift happens (see §8).

**Rule: default weight is regular (400), never heavy.** `font-bold`/
`font-extrabold`/`font-black` on an `<h1>`–`<h3>` (or on body/emphasis text)
is off-system. Weight carries hierarchy through size and color, not
boldness. This is a real gap today — see §8.

## 4. Spacing & Radius

Spacing uses Tailwind's default rem scale plus one semantic token,
`--space-section: 96px`, for vertical rhythm between major page sections.

Radius (`app/globals.css`, single source of truth):

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | buttons, inputs |
| `--radius-md` | 8px | cards |
| `--radius-lg` | 12px | panels, containers, galleries |
| `--radius-xl` | 24px | hero frames, large feature panels |
| `--radius-pill` | 9999px | chips, badges, pills, avatars |

**Rule: don't reach for Tailwind's raw `rounded-xl`/`rounded-2xl`/arbitrary
`rounded-[Npx]`** unless it maps to one of the above. Today the app mixes
`rounded-lg`, `rounded-xl`, `rounded-2xl`, and one arbitrary `rounded-[28px]`
somewhat interchangeably for what should be the same "card" radius — pick one.

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

Three variants, defined once as CSS classes in `app/globals.css` — **reuse
these, don't hand-roll new button styles per page**:

- `.btn-orange` — primary CTA, brand-filled, white text
- `.btn-black` — secondary CTA, ink-filled, white text
- `.btn-outline` — tertiary/ghost, bordered, ink text, brand border on hover

If a page needs a button style these three don't cover, extend the shared
classes — don't inline a fourth pattern with arbitrary Tailwind utilities
(see §8, this already happened several times).

## 8. Known inconsistencies (migration backlog)

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
4. **`#0F172A` (Tailwind's default near-black navy) used 33 times** as a
   button/text color — this is not brand ink (`#022221`) and is a leftover
   from a pre-rebrand palette (see `--navy` legacy alias in `globals.css`).
5. **Heading weights are heavy, not regular.** 111 `font-semibold` + 58
   `font-bold` + 37 `font-extrabold` + 7 `font-black` instances across
   headings/emphasis text, vs. 18 `font-normal`. The DS calls for weight-400
   headings (§3) — today's headings are 2-5 steps heavier than that. This
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

- ✅ `--color-ink`/`--color-body` were dead tokens set to a third near-black
  (`#131514`), different from the ink actually in use (`#022221`). Fixed to
  match — one more source of hex drift removed.
- ✅ `components/SectionHeader.tsx` (used on the homepage by `BestSellers`,
  `LatestProducts`, `NewsArticles`) migrated from
  `text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight` to
  `.heading-h2`. `.view-all` (the paired "View All" link) moved off
  Tailwind's default `#64748B` blue-grey onto `--color-neutral-500` and
  dropped its `font-medium` override to match the 14px/400 nav-link rule.
  This is item #5 above, template 1 of many — first real visible proof
  that heading weight changes read as "redesigned," not just recolored.

## 9. Where to look

- Tokens: `app/globals.css` (`@theme` block + `:root`)
- Stripe reference package (inspiration only, not imported by the app): `design-system/stripe-reference/`
- Visual reference: `/design-system` route
- Shared button classes: `app/globals.css` (`.btn-orange`, `.btn-black`, `.btn-outline`)
- This file: update it whenever a token is added/changed/deprecated.
