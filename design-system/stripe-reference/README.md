# Stripe reference material

These five files are the original, unmodified design-system package the
Bukara design direction is based on (Stripe's public marketing site,
reverse-engineered into tokens/components/docs). They are **reference
material, not code the app imports** — this project runs Tailwind v4 with
CSS-based `@theme` config, not the v3 JS config format these files use,
and every color in here is Stripe's palette, not Bukara's.

Do not import or `@import` these files into the app. If a rule or value
here should apply to Bukara, port it into the real source of truth:

- `app/globals.css` — actual tokens (`@theme` + `:root`) and utility classes
- `/DESIGN_SYSTEM.md` (repo root) — the adapted, Bukara-branded rules doc

Files:
- `stripe-marketing-ds.md` — the original rules/critical-constraints doc
- `tokens.css` — original CSS custom properties (Stripe palette)
- `tokens.json` — same tokens as Style Dictionary / Figma Variables JSON
- `tailwind.config.js` — original Tailwind v3 theme extension
- `components.css` — original component classes (`.heading-h2`, `.btn`, `.card`, etc.)

When updating `DESIGN_SYSTEM.md` or `app/globals.css`, diff against these
to check whether a Bukara token has drifted from the Stripe original in a
way that wasn't intentional.
