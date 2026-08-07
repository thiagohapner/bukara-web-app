# Beitragen zur Bukara Web App

Danke für deinen Beitrag! Kurzer Leitfaden für den Workflow. Projektkonventionen
(Stack, Design-System, Sicherheit) stehen in **`CLAUDE.md`** — bitte vorab lesen.

## Workflow (Pull-Request-basiert)
1. **Niemals direkt auf `main` pushen.** `main` ist Production und deployt
   automatisch auf Vercel.
2. Branch vom aktuellen `main` erstellen:
   `git checkout -b feat/kurze-beschreibung`
3. Änderungen umsetzen (gern mit Claude Code — `CLAUDE.md` wird automatisch geladen).
4. **Vor dem Push prüfen:**
   - `npx tsc --noEmit` (Typecheck)
   - `npm run lint`
5. Branch pushen und einen **Pull Request** gegen `main` öffnen.
6. Vercel erstellt automatisch eine **Preview-URL** an der PR — dort die
   Änderung testen (bei UI-Änderungen Screenshot in die PR).
7. Review & Merge durch den Maintainer. **Merge → Production-Deploy.**

## Lokales Setup
- `npm install`
- `.env.local` aus **`.env.example`** anlegen. Für die meiste Frontend-Arbeit
  reichen die öffentlichen Supabase-Werte; serverseitige Secrets (Service-Role,
  Brevo) sind nicht nötig — volle Tests laufen ohnehin auf der Vercel-Preview.
- `npm run dev`

## Richtlinien
- **Deutsch** in kundensichtbarer UI und Fehlermeldungen.
- **Design-System verwenden** (CTAs `btn-black btn-arrow`, `DS_INPUT` usw. — siehe `CLAUDE.md`).
- **Keine Secrets committen** (`.env*` ist ignoriert).
- **Datenbankänderungen** (Supabase-Migrationen) betreffen die **Production-DB** —
  vorher unbedingt mit dem Maintainer abstimmen.
- Kleine, fokussierte PRs mit klarer Beschreibung.
