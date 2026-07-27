# Auth Phase 1 – manuelle Konfiguration (Supabase Dashboard)

Diese Schritte lassen sich nicht im Code erledigen. Projekt: `qdycgspamxfiurajizmt`.
Klickpfade beziehen sich auf das Supabase Dashboard (Stand 2026).

## 0. Voraussetzungen im Code (bereits erledigt)

- Bestätigungs-/Reset-Links müssen auf `/auth/bestaetigen` zeigen und
  `{{ .TokenHash }}` verwenden (siehe Templates unten).
- Umgebungsvariable optional: `NEXT_PUBLIC_SITE_URL` (z. B.
  `https://www.bukara.de`). Wenn gesetzt, werden Reset-Links darauf aufgebaut,
  sonst aus den Request-Headern abgeleitet.

## 1. Custom SMTP (Gmail – wie bereits im Projekt genutzt)

Die App versendet ihre Bestell-/Anfrage-Mails bereits über Gmail-SMTP
(`app/api/send-email/route.ts`, `nodemailer`, `EMAIL_USER` / `EMAIL_PASS`).
Für die Supabase-Auth-Mails wird dasselbe Gmail-Konto als Custom SMTP
hinterlegt – kein zusätzlicher Dienstleister nötig.

1. **Project Settings → Authentication → SMTP Settings** (bzw.
   **Authentication → Emails → SMTP**).
2. „Enable Custom SMTP" aktivieren.
3. Werte eintragen:
   - Host: `smtp.gmail.com`
   - Port: `465` (SSL) oder `587` (STARTTLS)
   - Username: die Gmail-Adresse (Wert aus `EMAIL_USER`)
   - Password: ein **Google App-Passwort** (nicht das normale Kontopasswort;
     unter Google-Konto → Sicherheit → App-Passwörter erzeugen, 2FA
     vorausgesetzt) – derselbe Wert wie `EMAIL_PASS`
   - Sender email: die Gmail-Adresse (bzw. eine im Gmail-Konto verifizierte
     „Senden als"-Adresse, z. B. `no-reply@bukara.de`)
   - Sender name: `Bukara GmbH`
4. Speichern und mit einer Testregistrierung prüfen.

> Der eingebaute Supabase-Mailer ist auf wenige Mails/Stunde limitiert und nicht
> produktionstauglich – Custom SMTP ist Pflicht vor dem Go-live.
>
> Grenzen von Gmail-SMTP: ca. **500 Mails/Tag** und keine dedizierte
> Versand-Infrastruktur. Für den Start und Tests ausreichend; bei steigendem
> Volumen bzw. für bessere Zustellbarkeit später einen transaktionalen
> Mailprovider (mit verifizierter `bukara.de`-Domain, SPF/DKIM) erwägen.

## 2. E-Mail-Bestätigung verpflichtend

1. **Authentication → Sign In / Providers → Email**.
2. „Confirm email" **aktivieren** (Nutzer kann sich erst nach Bestätigung anmelden).
3. „Secure email change" aktiviert lassen (Bestätigung an alte **und** neue Adresse).

## 3. Passwort-Sicherheit

1. **Authentication → Sign In / Providers → Email → Password settings** (bzw.
   **Authentication → Policies / Password**).
2. „Leaked Password Protection" aktivieren (Abgleich gegen HaveIBeenPwned).
3. Minimum password length: **10**.
4. Optional: Passwortstärke-Anforderung („Lower, upper, digits" o. Ä.) nach Bedarf.

## 4. Captcha (in Phase 1 im Code noch nicht verdrahtet)

> Hinweis: Der Anwendungscode enthält in Phase 1 **kein** Captcha-Widget.
> Erst aktivieren, wenn das Frontend die `captchaToken`-Option mitsendet,
> sonst schlagen `signUp` / `resetPasswordForEmail` fehl.

1. Provider-Konto anlegen (Cloudflare Turnstile oder hCaptcha), Site- und
   Secret-Key erzeugen.
2. **Authentication → Attack Protection → Captcha** aktivieren, Provider wählen,
   Secret-Key eintragen.
3. Site-Key als `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (bzw. hCaptcha) hinterlegen und
   in `/registrieren` + `/passwort-vergessen` einbinden (Folge-Ticket).

## 5. Redirect / Allow URLs

**Authentication → URL Configuration**:

1. **Site URL**: Produktionsdomain, z. B. `https://www.bukara.de`.
2. **Redirect URLs** (Allow-List) hinzufügen:
   - `http://localhost:3000/**`
   - `https://www.bukara.de/**`
   - (ggf. Vercel-Preview-Domain, z. B. `https://*.vercel.app/**`)

Ohne passende Allow-List-Einträge verwirft Supabase die `redirectTo`-Ziele der
Reset-Mails.

## 6. Deutsche E-Mail-Templates

**Authentication → Emails → Templates**. Für jede Vorlage den Reiter auf
**„Source"** (HTML) stellen und den **kompletten** Inhalt der passenden Datei aus
`docs/email-templates/` in das Feld „Message body" einfügen. Die Vorlagen sind
Bukara-gebrandet (Markenfarbe `#01A497`, Wortmarke, deutsche, sachliche Texte).
Alle Links zeigen bereits auf `/auth/bestaetigen` mit `{{ .TokenHash }}`;
`{{ .SiteURL }}` wird von Supabase aus der unter Punkt 5 gesetzten Site URL
eingesetzt.

| Dashboard-Vorlage | Datei | Betreff |
|---|---|---|
| Confirm signup | `docs/email-templates/confirm-signup.html` | `Willkommen bei Bukara – bitte bestätigen Sie Ihre E-Mail-Adresse` |
| Reset Password | `docs/email-templates/reset-password.html` | `Passwort zurücksetzen – Bukara` |
| Change Email Address | `docs/email-templates/change-email.html` | `Bitte bestätigen Sie Ihre neue E-Mail-Adresse` |
| Invite user (Phase 4) | `docs/email-templates/invite.html` | `Sie wurden zu Bukara eingeladen` |

Hinweise:
- Den Betreff jeweils oben im Feld „Subject heading" eintragen (der `<title>`
  im HTML wird von Supabase nicht als Betreff verwendet).
- Nach dem Einfügen mit „Send test email" bzw. einer echten Testregistrierung
  prüfen, dass Wortmarke, Button und Link korrekt dargestellt werden.
- Die Invite-Vorlage erst aktivieren, wenn die Kontoanlage durch Bukara
  (`/admin/kunden`, Phase 4) live ist.
- Logo im Header: Die Vorlagen laden `https://www.bukara.de/email/bukara-logo.png`
  (liegt unter `public/email/` und wird mit dem Deploy automatisch unter dieser
  URL ausgeliefert – **kein** separater Storage-Upload nötig). Voraussetzung:
  der Branch ist auf die Produktionsdomain deployt. Bis dahin greift der
  `alt="Bukara"`-Text. Wird eine andere Domain verwendet, die `src`-URL in allen
  vier Dateien entsprechend anpassen.
- Sonst kein externes CSS/keine weiteren externen Bilder – die Vorlagen sind
  bewusst inline-gestylt, damit sie in Gmail, Outlook & Co. zuverlässig rendern.

---

## Testen auf der Vercel-Preview (ohne SMTP)

Für einen schnellen End-to-End-Test des angemeldeten Bereichs auf einem
Preview-Deployment ist **kein** SMTP nötig:

1. **Env-Variablen prüfen:** Das Preview-Deployment braucht dieselben Variablen
   wie Production (siehe `.env.example`) – im Vercel-Projekt unter
   Settings → Environment Variables auch für die **Preview**-Umgebung setzen.
2. **Preview-Domain freischalten:** Unter **Authentication → URL Configuration →
   Redirect URLs** die Vercel-Preview-Domain aufnehmen (z. B.
   `https://*.vercel.app/**`), sonst verwirft Supabase die Redirect-Ziele.
3. **„Confirm email" vorübergehend deaktivieren** (Authentication → Sign In /
   Providers → Email). Dann liefert `signUp` direkt eine Session und
   `/registrieren` leitet unmittelbar auf `/konto` – ohne Bestätigungsmail.
4. Danach testbar: Registrierung → `/konto`, Anmeldung, Abmeldung, Redirect von
   `/konto` im abgemeldeten Zustand, sowie `/konto/passwort` (falsches vs.
   korrektes aktuelles Passwort).
5. **Nach dem Test „Confirm email" wieder aktivieren** (Punkt 2 oben) – vor dem
   Go-live ist die E-Mail-Bestätigung Pflicht.

Alternativ mit echten Mails testen: Custom SMTP (Abschnitt 1) und Redirect-URLs
(Abschnitt 5) konfigurieren und „Confirm email" aktiviert lassen.

> ⚠️ **Ein Supabase-Projekt für Preview und Production.** Es gibt nur das Projekt
> `qdycgspamxfiurajizmt`; die Auth-Einstellungen sind **nicht** pro Branch/Deploy
> getrennt. Jede Umschaltung (z. B. „Confirm email" aus) betrifft damit auch die
> Live-Seite. Daher nach dem Test unbedingt zurückstellen.

---

## Verifikation nach der Konfiguration

- Testregistrierung mit echter Adresse → Bestätigungsmail kommt an → nach Klick
  ist `/konto` erreichbar.
- Nach der Registrierung existiert genau **eine** Zeile in
  `v2.customer_profiles` mit gefüllten `contact_name` / `company_name`.
- `/passwort-vergessen` → Mail kommt an → `/passwort-neu` funktioniert.
