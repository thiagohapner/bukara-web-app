# Schärfservice form redesign — reference material

A full redesign of the Schärfservice request form, prototyped in Claude
Design (claude.ai/design) and handed off here.

**Status: implemented.** `app/(public)/sonder-schaerfservice/page.tsx` now
runs this design as a real 6-step wizard (tool type → pickup date/time →
pickup location → package size/weight → service options → contact →
success), wired to the existing `service_inquiries` Supabase table and
`/api/send-email` route — same backend as before, extended with new fields.

- `form-prototype.html` — the exported HTML/CSS/JS prototype (uses a
  proprietary templating syntax from the design tool — read it for layout,
  copy, states, and interaction logic; the real implementation doesn't
  copy it verbatim, e.g. keyboard Enter-to-advance and Escape-to-close
  behavior was reimplemented in React, not the prototype's script).
- `screenshots/` — reference screenshots of individual steps/states from
  the prototype.

## Known gap: tool types aren't a real DB column yet

The prototype's step 1 ("Welche Werkzeuge senden Sie ein?") collects tool
type(s), which the existing `service_inquiries` table has no column for.
Rather than risk breaking submissions with an insert against a
nonexistent column, the live form currently:

- shows the tool-type selection in the UI and requires it,
- includes it as its own labeled row in the notification email
  (`buildSchaerfEmail` in `app/api/send-email/route.ts`),
- but persists it to Supabase by folding it into the free-text
  `pickup_address_deviation` column (alongside the optional "anything else"
  note from step 2) rather than a dedicated column.

**To fix properly**: add a `tool_types` (text[] or text) column to
`service_inquiries`, then update the `insert(...)` call in
`app/(public)/sonder-schaerfservice/page.tsx` to write to it directly
instead of folding it into remarks. This wasn't done as part of this
change because there was no database access available to run the
migration — someone with Supabase access needs to add the column.

## Component classes used

Pills, option cards, chips, calendar grid, dropdown panels, progress bar,
form inputs, kbd hint — all defined in `app/globals.css` and documented +
shown live at `/design-system`. See DESIGN_SYSTEM.md §8–9. Any future form
(not just Schärfservice) should reuse these same classes rather than
inventing new ad-hoc form styling.
