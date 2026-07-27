"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authErrorToGerman } from "@/lib/auth/errors";
import AuthShell from "@/components/auth/AuthShell";
import { DS_INPUT } from "@/lib/ds";

type Form = {
  email: string;
  password: string;
  contact_name: string;
  company_name: string;
  phone: string;
  vat_number: string;
};

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";
const REQ = <span className="text-[#01A497]">*</span>;

export default function RegistrierenPage() {
  const [form, setForm] = useState<Form>({
    email: "", password: "", contact_name: "", company_name: "", phone: "", vat_number: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const field = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email.trim() || !form.password || !form.contact_name.trim() || !form.company_name.trim()) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    if (form.password.length < 10) {
      setError("Das Passwort muss mindestens 10 Zeichen lang sein.");
      return;
    }
    if (!acceptedTerms) {
      setError("Bitte stimmen Sie den AGB und der Datenschutzerklärung zu.");
      return;
    }
    if (!isBusiness) {
      setError("Eine Bestellung ist nur für Gewerbetreibende möglich. Bitte bestätigen Sie dies.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/konto`,
        // These keys MUST match exactly what the on_auth_user_created trigger
        // reads from raw_user_meta_data — otherwise the profile row is empty.
        data: {
          contact_name: form.contact_name.trim(),
          company_name: form.company_name.trim(),
          vat_number: form.vat_number.trim() || null,
          phone: form.phone.trim() || null,
          accepted_terms: "true",
          is_business_confirmed: "true",
          newsletter_opt_in: newsletter ? "true" : "false",
          created_by: "self",
        },
      },
    });
    if (signUpError) {
      setSubmitting(false);
      setError(authErrorToGerman(signUpError));
      return;
    }

    // Ist „Confirm email" im Supabase-Projekt deaktiviert, liefert signUp
    // direkt eine Session – der Nutzer ist bereits angemeldet und wird auf die
    // Startseite geleitet (dort kann er direkt einkaufen; praktisch v. a. für
    // Tests auf der Preview ohne SMTP). Bei aktivierter Bestätigung ist
    // session === null (auch bei der Anti-Enumeration-Antwort für bereits
    // existierende Adressen); dann bleibt der bestehende „E-Mail bestätigen"-
    // Hinweis. Harte Navigation, damit die Middleware das frisch gesetzte
    // Auth-Cookie sieht.
    if (data.session) {
      window.location.assign("/");
      return;
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell
        title="Fast geschafft"
        subtitle="Bitte bestätigen Sie Ihre E-Mail-Adresse."
      >
        <div className="rounded-sm border border-brand-100 bg-brand-25 p-5 text-sm text-slate-700 leading-relaxed">
          Wir haben eine E-Mail an <span className="font-semibold">{form.email.trim()}</span> gesendet.
          Klicken Sie auf den Bestätigungslink, um Ihr Konto zu aktivieren. Prüfen Sie
          gegebenenfalls auch Ihren Spam-Ordner.
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Bereits bestätigt?{" "}
          <Link href="/anmelden" className="font-semibold text-brand-600 hover:text-brand-700">
            Zur Anmeldung
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Konto erstellen"
      subtitle="Für Gewerbetreibende. Nach der Registrierung sehen Sie Ihre Bestellungen und Anfragen an einem Ort."
      footer={
        <>
          Sie haben bereits ein Konto?{" "}
          <Link href="/anmelden" className="font-semibold text-brand-600 hover:text-brand-700">
            Anmelden
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>E-Mail {REQ}</label>
          <input type="email" required value={form.email} onChange={field("email")}
            autoComplete="email" placeholder="name@firma.de" className={DS_INPUT} />
        </div>

        <div>
          <label className={LABEL}>Passwort {REQ}</label>
          <input type="password" required minLength={10} value={form.password} onChange={field("password")}
            autoComplete="new-password" placeholder="Mindestens 10 Zeichen" className={DS_INPUT} />
          <p className="mt-1 text-xs text-slate-400">Mindestens 10 Zeichen.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={LABEL}>Ansprechpartner {REQ}</label>
            <input type="text" required value={form.contact_name} onChange={field("contact_name")}
              autoComplete="name" placeholder="Max Mustermann" className={DS_INPUT} />
          </div>
          <div className="flex-1">
            <label className={LABEL}>Firmenname {REQ}</label>
            <input type="text" required value={form.company_name} onChange={field("company_name")}
              autoComplete="organization" placeholder="Muster GmbH" className={DS_INPUT} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={LABEL}>Telefon</label>
            <input type="tel" value={form.phone} onChange={field("phone")}
              autoComplete="tel" placeholder="+49 123 456789" className={DS_INPUT} />
          </div>
          <div className="flex-1">
            <label className={LABEL}>USt-IdNr</label>
            <input type="text" value={form.vat_number} onChange={field("vat_number")}
              placeholder="DE123456789" className={DS_INPUT} />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="accent-[#01A497] w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] text-neutral-500 leading-relaxed">
              Ich akzeptiere die{" "}
              <Link href="/agbs" className="underline hover:text-slate-900">AGB</Link> und die{" "}
              <Link href="/datenschutz" className="underline hover:text-slate-900">Datenschutzerklärung</Link>. {REQ}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={isBusiness} onChange={(e) => setIsBusiness(e.target.checked)}
              className="accent-[#01A497] w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] text-neutral-500 leading-relaxed">
              Ich bestelle als Gewerbetreibender. Die Preise auf bukara.de sind Nettopreise. {REQ}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}
              className="accent-[#01A497] w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] text-neutral-500 leading-relaxed">
              Ich möchte den Newsletter mit Angeboten und Neuigkeiten erhalten (freiwillig).
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="btn-brand py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? "Wird erstellt…" : "Konto erstellen"}
        </button>
      </form>
    </AuthShell>
  );
}
