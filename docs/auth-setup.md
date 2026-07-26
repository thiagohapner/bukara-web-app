# Auth Phase 1 – manuelle Konfiguration (Supabase Dashboard)

Diese Schritte lassen sich nicht im Code erledigen. Projekt: `qdycgspamxfiurajizmt`.
Klickpfade beziehen sich auf das Supabase Dashboard (Stand 2026).

## 0. Voraussetzungen im Code (bereits erledigt)

- Bestätigungs-/Reset-Links müssen auf `/auth/bestaetigen` zeigen und
  `{{ .TokenHash }}` verwenden (siehe Templates unten).
- Umgebungsvariable optional: `NEXT_PUBLIC_SITE_URL` (z. B.
  `https://www.bukara.de`). Wenn gesetzt, werden Reset-Links darauf aufgebaut,
  sonst aus den Request-Headern abgeleitet.

## 1. Custom SMTP (Resend)

1. **Project Settings → Authentication → SMTP Settings** (bzw.
   **Authentication → Emails → SMTP**).
2. „Enable Custom SMTP" aktivieren.
3. Werte eintragen:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) oder `587` (STARTTLS)
   - Username: `resend`
   - Password: Resend API Key (`re_…`)
   - Sender email: eine verifizierte Absenderadresse auf einer **bukara.de**-Domain,
     z. B. `no-reply@bukara.de`
   - Sender name: `Bukara GmbH`
4. Voraussetzung bei Resend: Domain `bukara.de` unter **resend.com → Domains**
   verifizieren (SPF/DKIM DNS-Einträge setzen). Ohne verifizierte Domain lehnt
   Resend den Versand ab.
5. Speichern und mit einer Testregistrierung prüfen.

> Der eingebaute Supabase-Mailer ist auf wenige Mails/Stunde limitiert und nicht
> produktionstauglich – Custom SMTP ist Pflicht vor dem Go-live.

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

**Authentication → Emails → Templates**. Alle Links müssen auf
`/auth/bestaetigen` mit `{{ .TokenHash }}` zeigen. `{{ .SiteURL }}` ist die unter
Punkt 5 gesetzte Site URL.

### Confirm signup

Betreff: `Bitte bestätigen Sie Ihre Registrierung`

```html
<p>Guten Tag,</p>
<p>bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto bei der Bukara GmbH zu aktivieren.</p>
<p><a href="{{ .SiteURL }}/auth/bestaetigen?token_hash={{ .TokenHash }}&type=signup">E-Mail-Adresse bestätigen</a></p>
<p>Falls Sie kein Konto angelegt haben, können Sie diese Nachricht ignorieren.</p>
<p>Bukara GmbH</p>
```

### Reset password

Betreff: `Passwort zurücksetzen`

```html
<p>Guten Tag,</p>
<p>Sie haben das Zurücksetzen Ihres Passworts angefordert. Über den folgenden Link vergeben Sie ein neues Passwort:</p>
<p><a href="{{ .SiteURL }}/auth/bestaetigen?token_hash={{ .TokenHash }}&type=recovery">Neues Passwort vergeben</a></p>
<p>Falls Sie dies nicht angefordert haben, können Sie diese Nachricht ignorieren. Ihr Passwort bleibt unverändert.</p>
<p>Bukara GmbH</p>
```

### Change email address

Betreff: `E-Mail-Änderung bestätigen`

```html
<p>Guten Tag,</p>
<p>bitte bestätigen Sie die Änderung Ihrer E-Mail-Adresse:</p>
<p><a href="{{ .SiteURL }}/auth/bestaetigen?token_hash={{ .TokenHash }}&type=email_change">Änderung bestätigen</a></p>
<p>Bukara GmbH</p>
```

### Invite (Phase 4 – noch nicht in Betrieb)

Template zurückstellen, bis die Kontoanlage durch Bukara (`/admin/kunden`)
umgesetzt ist.

---

## Verifikation nach der Konfiguration

- Testregistrierung mit echter Adresse → Bestätigungsmail kommt an → nach Klick
  ist `/konto` erreichbar.
- Nach der Registrierung existiert genau **eine** Zeile in
  `v2.customer_profiles` mit gefüllten `contact_name` / `company_name`.
- `/passwort-vergessen` → Mail kommt an → `/passwort-neu` funktioniert.
