# Project Specs — HiTech E-Commerce Website

## What the App Does & Who Uses It
A premium single-page tech e-commerce marketing website called **HiTech**. Visitors browse featured products, categories, articles, and testimonials. Static marketing site — no checkout or auth in this phase.

## Tech Stack
- **Framework:** Next.js (latest, App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** GSAP (GreenSock) with ScrollTrigger
- **Deployment:** Vercel
- **No database / auth** — static content only

## Pages & Sections (Home Page)
| Section | Description |
|---------|-------------|
| Announcement bar | Scrolling price match guarantee text |
| Navbar | Logo, nav links, search, user, cart icons |
| Hero | Headline, CTA, product imagery, social proof |
| Category rail | 7 icon + label category pills |
| Best Selling Products | 4 product cards + View All |
| Promo tiles | 3 coloured promotional banners |
| Latest Products | 8 product cards + View All |
| Brand strip | Scrolling logo marquee |
| News & Articles | 3 article cards + View All |
| Product spotlight | Full-width CTA banner |
| Testimonials | 2 customer review cards |
| Feature bar | 5 service icons (tracking, shipping, payment, delivery, support) |
| Footer | Multi-column links, newsletter, social icons |

## Data Models
All data is static (hardcoded in the page/component files).

## Third-Party Services
- **GSAP** (npm) — scroll-triggered and entrance animations

## What "Done" Looks Like
- Full home page renders pixel-close to the screenshot
- GSAP animations on hero, product cards, sections (fade-up, stagger, parallax)
- Fully responsive (mobile, tablet, desktop)
- `npm run build` passes with 0 TypeScript errors
- Dev server runs cleanly at `http://localhost:3000`
