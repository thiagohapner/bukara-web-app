# Schärfservice form redesign — reference material

A full redesign of the Schärfservice request form, prototyped in Claude
Design (claude.ai/design) and handed off here.

**Status: implemented.** `app/(public)/sonder-schaerfservice/page.tsx` now
runs this design as a real 6-step wizard (tool type → pickup date/time →
pickup location → package size/weight → service options → contact →
success), wired to the existing `service_inquiries` Supabase table and
`/api/send-email` route — same backend as before, extended with new fields
(including `tool_type`, an existing column the old form never populated).

- `form-prototype.html` — the exported HTML/CSS/JS prototype (uses a
  proprietary templating syntax from the design tool — read it for layout,
  copy, states, and interaction logic; the real implementation doesn't
  copy it verbatim, e.g. keyboard Enter-to-advance and Escape-to-close
  behavior was reimplemented in React, not the prototype's script).
- `screenshots/` — reference screenshots of individual steps/states from
  the prototype.

## Component classes used

Pills, option cards, chips, calendar grid, dropdown panels, progress bar,
form inputs, kbd hint — all defined in `app/globals.css` and documented +
shown live at `/design-system`. See DESIGN_SYSTEM.md §8–9. Any future form
(not just Schärfservice) should reuse these same classes rather than
inventing new ad-hoc form styling.
