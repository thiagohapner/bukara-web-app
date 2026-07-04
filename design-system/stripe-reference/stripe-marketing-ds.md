# Stripe Marketing Design System — claude.md
Version 3.0 | All values empirically measured from stripe.com

---

## FILES IN THIS PACKAGE
- tokens.css        — CSS custom properties, import first
- tailwind.config.js — Tailwind v3 theme extension
- components.css    — Component classes, requires tokens.css
- tokens.json       — Style Dictionary / Tokens Studio / Figma Variables
- claude.md         — This file. AI context for Claude, Cursor, Copilot

---

## FONT
Primary:   sohne-var (Söhne Variable, Klim Type Foundry — commercial license)
           Axis: weight 1–1000 (variable font)
           File: Sohne.cb178166.woff2
           Fallback: "SF Pro Display", system-ui, sans-serif
           OSS substitute: Inter Variable (rsms.me/inter)

Monospace: SourceCodePro-Medium.f5ba3e6a.woff2
           Fallback: "SFMono-Regular", "Menlo", monospace
           OSS: Source Code Pro (Google Fonts)

---

## CRITICAL RULES

1. ALL display headings are weight 300 (light) with negative letter-spacing.
   --fw-bold in this system = 400. Never use 700 on marketing pages.

2. Primary action color is #197970 (brand-600) for ALL buttons, links, focus rings.
   Never substitute #208e83 or any blue-derived value on the marketing site.

3. Primary ink is #00201d (neutral-990). Never pure black (#000000).

4. Neutrals are always green-tinted. Never warm greys or blue-grey.

5. Dark section background is exactly rgb(1, 32, 28). Class: hds-mode--dark.
   Dark body text: rgb(100, 170, 160). Dark secondary links: rgb(17, 172, 158).

6. ALL shadows use double-layer blue-tinted values. Never grey shadows.

7. Two motion tracks — never mix:
   NAV/UI:    240ms cubic-bezier(0.45, 0.05, 0.55, 0.95)
   BUTTONS:   300ms cubic-bezier(0.25, 1.00, 0.50, 1.00)

8. Icons are inline SVG, 16x16 viewBox, fill: currentColor. No icon fonts.

9. Buttons use display:flex; align-items:center; gap:8px (for text + chevron icon).

10. Gradients are atmosphere only. One aurora cluster OR one spectrum slash per
    viewport. Never both. Flat #197970 does all functional work.

---

## BREAKPOINTS (empirically measured)
max-width: 939px  — mobile / hamburger nav
min-width: 940px  — desktop nav appears
min-width: 1054px — full desktop layout
min-width: 1264px — content max-width reached

---

## COLOR QUICK REFERENCE
Brand primary:     #197970
Brand hover:       #1b6059
Brand pressed:     #164641
Primary ink:       #00201d
Subdued text:      #567c76
Soft text:         #416963
Surface:           #ffffff
Surface subdued:   #f7fbfa  (footer, subdued sections)
Border:            #e2efed
Dark surface:      rgb(1, 32, 28)
Success:           #00b261
Error:             #d8351e
Warning:           #f9b900

---

## TYPE QUICK REFERENCE
Stats hero:    56px / 300 / lh 1.03 / ls -0.025em
Display XL:    48px / 300 / lh 1.03 / ls -0.02em
Hero H1:       clamp(34px, 4vw+8px, 48px) / 300 / lh 1.1
Section H2:    32px / 300 / lh 1.1  / ls -0.02em
Sub H3:        26px / 300 / lh 1.12 / ls -0.01em
Body:          16px / 300 / lh 1.4
Nav links:     14px / 400
Eyebrow:       14px / 400 / no uppercase / no tracking

---

## SECTION STRUCTURE
Every marketing section:
  <section class="section section--white">
    <div class="section-container">
      <hr class="section-divider">
      <p class="eyebrow">Label</p>
      <h2 class="heading-h2">Heading</h2>
      <p class="body-text body-text--subdued">Description</p>
    </div>
  </section>

Dark sections: section--dark instead of section--white.
All child colors update automatically via CSS cascade.

---

## FOOTER
Background: #f7fbfa
7 columns: Products and pricing / Solutions / Developers /
           Integrations and custom solutions / Resources / Company / Support
Col heading: 16px / weight 400 / #00201d
Col links:   16px / weight 300 / #416963 → hover #197970
Bottom bar:  Globe + "Country (Language)" in #197970 (left)
             Social icons (center/right)
             © 2026 Stripe, LLC. in #00201d

---

## SHADOW REFERENCE
xs:      0px 2px 10px 0px #0037700f, 0px 1px 4px 0px #003b890a
sm:      0px 5px 14px 0px #00377014, 0px 2px 8px 0px #003b890d
md:      0px 6px 22px 0px #0037701a, 0px 4px 8px 0px #003b8905
lg:      0px 15px 40px -2px #0037701a, 0px 5px 20px -2px #003b890a
xl:      0px 20px 80px -16px #00377024, 0px 10px 60px -16px #003b890f
mockup:  0px 15.931px 31.863px 0px rgba(50,50,93,.12)
popover: 0px 16px 32px rgba(50,50,93,.12)

---

## GRADIENT REFERENCE
Aurora teal:     radial-gradient(50% 50%, rgba(25,121,112,.8) 62.5%, rgba(25,121,112,0) 100%)
Aurora magenta:  radial-gradient(50% 50%, rgba(243,99,243,.8) 53.85%, rgba(243,99,243,0) 100%)
Aurora lemon:    radial-gradient(50% 50%, rgb(255,207,94) 41.35%, rgba(255,207,94,0) 100%)
Spectrum slash:  linear-gradient(270deg, #0073e6 4.91%, #16cbe1 21.6%, #48a4ed 40.82%, #208e83 60.04%, #9966ff 80.27%, #d187ff 96.97%)
Brand line:      linear-gradient(90deg, #1b6059 3.13%, #fb76fa 50%, #ffcf5e 100%)
Dark stat 1:     linear-gradient(68deg, rgba(25,121,112,.08) 0.78%, rgba(255,140,108,.8) 30.61%, rgba(218,75,254,.8) 79.02%)
Dark stat 2:     linear-gradient(73.3deg, rgba(218,75,254,.8) 9.85%, rgba(13,144,138,.48) 61.94%)