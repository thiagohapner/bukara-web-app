@AGENTS.md

# Bukara Web App — Projektleitfaden

B2B-Onlineshop für Präzisionswerkzeuge. Next.js + Supabase, Deployment auf
Vercel. Diese Datei wird von Claude Code automatisch geladen — sie beschreibt
die Konventionen, damit Beiträge zum Projekt passen.

## Stack
- **Next.js 16** (App Router, Turbopack), React, **TypeScript**
- **Supabase**: Auth über `@supabase/ssr`, Postgres mit RLS; Kundendaten im Schema `v2`
- **Tailwind** + hauseigenes Design-System (`app/globals.css`, `design-system/`, `DESIGN_SYSTEM.md`)
- **E-Mail**: `nodemailer` (`app/api/send-email`) über Brevo/Gmail; Supabase-Auth-Mails werden im Supabase-Dashboard konfiguriert (siehe `docs/auth-setup.md`)
- **Hosting**: Vercel — `main` = Production, jede PR erhält eine Preview-URL

## Befehle
- `npm run dev` — lokaler Dev-Server
- `npm run build` — Production-Build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — Typecheck (kein eigenes npm-Script)

**Vor jedem Commit:** `npx tsc --noEmit` **und** `npm run lint` müssen sauber sein.

## Projektstruktur
- `app/(public)/` — Shop-/Kundenseiten (Katalog, `warenkorb/checkout`, `konto`, Auth-Seiten)
- `app/admin/` — Admin-Bereich (hinter `v2.is_staff()`-Gate)
- `app/api/` — Route Handler
- `app/actions/` — Server Actions (z. B. `submitOrder`)
- `components/` — UI-Komponenten (`auth/`, `konto/`, …)
- `lib/` — Supabase-Clients (`lib/supabase/*`), Auth-Helfer (`lib/auth/*`), Pricing, Konto-Logik (`lib/konto/*`)
- `docs/` — u. a. `auth-setup.md` (Dashboard-Konfiguration), `email-templates/`

## Konventionen
- **Sprache: Deutsch** in jeder kundensichtbaren UI und in Fehlermeldungen.
- **Design-System verwenden, nicht neu erfinden.** An vergleichbaren, bestehenden
  Seiten orientieren (Referenz-Layout: `app/(public)/sonder-schaerfservice`).
  - Primär-CTA: `btn-black btn-arrow` + `<CtaArrow />` (schwarz, animierter Pfeil)
  - Sekundär-Button: `btn-outline`
  - Inputs: `DS_INPUT` aus `@/lib/ds`
  - Formular-/Konto-Layout: `form-aurora-bg`, `heading-h2`, `icon-tile`
  - Markenfarbe (Teal): `var(--color-brand-500)` / `#01A497`; CTA-Schwarz: `var(--color-ink)`
- Kleine, fokussierte Commits mit klaren Nachrichten.

## Auth & Sicherheit (wichtig)
- Zugriffsentscheidungen **serverseitig** über `getClaims()` bzw. `auth.getUser()` treffen — **nie** `getSession()` vertrauen.
- Middleware schützt `/konto/*` (Login nötig) und `/admin/*` (fail-closed über `v2.is_staff()`).
- **`SUPABASE_SERVICE_ROLE_KEY` ist rein serverseitig** — niemals an den Client geben oder ins Repo committen.
- Reads/Writes im Kundenkontext strikt auf die **verifizierte Session** eingrenzen (IDOR-Schutz — siehe `lib/konto/orders.ts`).

## Env / Secrets
- Benötigte Variablen: siehe **`.env.example`**. **Keine** Secrets committen (`.env*` ist ignoriert; Ausnahme `.env.example`).
- Lokal reichen für die meiste Frontend-Arbeit die **öffentlichen** Werte (`NEXT_PUBLIC_SUPABASE_URL` + anon key). Service-Role/Brevo sind serverseitig; die **Vercel-Preview-Deployments tragen die Env-Variablen bereits**, d. h. volle Tests laufen dort ohne lokale Secrets.

## Datenbank
- **Ein gemeinsames Supabase-Projekt (= Production).** Schema-/Migrationsänderungen
  wirken **sofort produktiv** — nur mit Bedacht und nach Review.

## Deployment
- Merge nach `main` deployt automatisch Production. Jede PR erzeugt eine
  Preview-URL zum Testen — nichts wird manuell zu Vercel gepusht.
