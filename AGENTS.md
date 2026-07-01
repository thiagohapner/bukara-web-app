<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design System

Before styling, redesigning, or adding any UI, read `DESIGN_SYSTEM.md` at
the repo root. It's the single source of truth for color, type, spacing,
radius, shadow, and motion — all backed by tokens in `app/globals.css`.
A live visual reference of the tokens and real components is at the
`/design-system` route. Do not introduce new hardcoded hex colors,
one-off button/card styles, or default Tailwind `slate-*`/`gray-*`
neutrals — use the documented tokens and shared classes instead.
