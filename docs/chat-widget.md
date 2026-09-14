# Werkzeug-Lotse (Chat-Widget)

Status: **live**, geführter Chat (kein Freitext, kein LLM). Kosten: 0 € — reine
Datenbank-Filterung.

## Was es ist

Ein Chat-Widget (`components/ChatWidget.tsx`) auf allen `(public)`-Seiten, das Kund:innen
per Klick-Fragen (Material → Anwendung → Durchmesser) zum passenden Artikel führt. Es ruft
den bestehenden Filter-Endpoint `app/api/v2/recommend/route.ts` auf — keine neue
Such-/Empfehlungslogik, kein KI-Modell, kein Training. Auf Mobile (<640px) öffnet es als
Bottom-Sheet statt als Karte; der Launcher sitzt bei `bottom-24` (96px), damit er nicht mit
`BackToTop.tsx` (`bottom-6 right-6`) kollidiert.

## Warum das "besser" wird, ohne dass ein Modell trainiert wird

Der Bot lernt nicht selbst — er schlägt nur in `v2.product_materials` /
`v2.product_applications` nach. "Präziser über die Zeit" heißt hier: **Datenpflege**, nicht
Training. Dafür protokolliert jede abgeschlossene Anfrage einen Eintrag in
`v2.chat_queries` (Material, Anwendung, Durchmesser, Trefferanzahl) —
`app/api/v2/chat/log/route.ts`, best-effort, bricht den Chat nie ab, wenn das Insert
fehlschlägt.

`/admin/v2/chat` (`app/admin/(shell)/v2/chat/page.tsx`) liest das zurück und zeigt die
Material-/Anwendungs-Kombinationen mit den meisten **Null-Treffern** — das ist die
konkrete To-do-Liste, um `product_materials`/`product_applications` nachzupflegen (z. B.
fehlendes Synonym, fehlender Tag). Kein Cronjob, keine Automatik — ein Mensch sieht sich die
Liste an und ergänzt die Stammdaten.

## Datenbank

`v2.chat_queries` (Migration `create_chat_queries`, angelegt 2026-08-31):

| Spalte | Typ | |
|---|---|---|
| `session_id` | text | pro Browser-Session (sessionStorage), nicht an Login gebunden |
| `material`, `application` | text | die gewählten Chips |
| `min_diameter`, `max_diameter` | numeric | gewählter Durchmesser-Bereich |
| `result_count` | integer | wie viele Artikel `/api/v2/recommend` zurückgab |

RLS aktiv, **keine Policies** — nur der Service-Role-Key (`supabaseAdminV2`, wie jede andere
v2-API-Route) kann lesen/schreiben, analog zu `v2.staff_users`/`v2.collet_systems`.

## Bewusst nicht gebaut

Freitext-Eingabe mit einem Sprachmodell — das würde laufende API-Kosten verursachen und war
in der Abstimmung explizit ausgeschlossen ("nur das was kostenlos ist"). Falls das später
gewünscht ist: eigener Endpoint, der einen Freitext-Satz in dieselben Filterparameter
übersetzt, bevor er an `/api/v2/recommend` geht — siehe Diskussion im PR.
