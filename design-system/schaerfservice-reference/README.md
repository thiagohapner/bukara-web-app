# Schärfservice form redesign — reference material

A full redesign of the Schärfservice request form, prototyped in Claude
Design (claude.ai/design) and handed off here for future implementation.
**Not yet built into the live app** — `app/(public)/sonder-schaerfservice/`
still runs the current/old form. This is reference material for that
future rebuild.

- `form-prototype.html` — the exported HTML/CSS/JS prototype (uses a
  proprietary templating syntax from the design tool — read it for layout,
  copy, states, and interaction logic, don't copy it verbatim). Multi-step
  flow: tool type (multi-select pills) → pickup date/time (calendar +
  time dropdowns) → pickup location (option cards) → package size/weight
  (option cards + range slider) → service options (option cards) → contact
  details (inputs) → success state.
- `screenshots/` — reference screenshots of individual steps/states from
  the prototype.

The component classes this prototype needed (pills, option cards, chips,
progress bar, form inputs, kbd hint) have already been extracted into
`app/globals.css` and are documented + shown live at `/design-system` —
see DESIGN_SYSTEM.md §7. Building the real form means wiring React state
and Supabase submission around those existing classes, not re-deriving
the visual style from scratch.
