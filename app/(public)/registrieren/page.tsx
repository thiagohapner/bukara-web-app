"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authErrorToGerman } from "@/lib/auth/errors";
import AuthShell from "@/components/auth/AuthShell";
import SocialAuth from "@/components/auth/SocialAuth";
import { DS_INPUT } from "@/lib/ds";

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";
const REQ = <span className="text-[#01A497]">*</span>;

// Minimal account creation: identity + consent only. The business data
// (Firma, USt-IdNr., Ansprechpartner, Gewerbe-Bestätigung) is collected at
// checkout and written back to the profile — see the checkout flow.
export default function RegistrierenPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Bitte geben Sie E-Mail und Passwort ein.");
      return;
    }
    if (password.length < 10) {
      setError("Das Passwort muss mindestens 10 Zeichen lang sein.");
      return;
    }
    if (!acceptedTerms) {
      setError("Bitte stimmen Sie den AGB und der Datenschutzerklärung zu.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        // Keys must match what the on_auth_user_created trigger reads. Business
        // fields are intentionally omitted here and captured at checkout.
        data: {
          accepted_terms: "true",
          created_by: "self",
        },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      setError(authErrorToGerman(signUpError));
      return;
    }

    // "Confirm email" disabled → signUp returns a session; the user is already
    // logged in and goes to the homepage (where they can shop). With
    // confirmation enabled, session === null and the "check your email" screen
    // shows. Hard navigation so the middleware sees the fresh auth cookie.
    if (data.session) {
      window.location.assign("/");
      return;
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title="Fast geschafft" subtitle="Bitte bestätigen Sie Ihre E-Mail-Adresse.">
        <div className="rounded-sm border border-brand-100 bg-brand-25 p-5 text-sm text-slate-700 leading-relaxed">
          Wir haben eine E-Mail an <span className="font-semibold">{email.trim()}</span> gesendet.
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
      subtitle="In wenigen Sekunden. Ihre Firmendaten geben Sie erst bei der Bestellung an."
      footer={
        <>
          Sie haben bereits ein Konto?{" "}
          <Link href="/anmelden" className="font-semibold text-brand-600 hover:text-brand-700">
            Anmelden
          </Link>
        </>
      }
    >
      <div className="mb-4">
        <SocialAuth />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>E-Mail {REQ}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" placeholder="name@firma.de" className={DS_INPUT} />
        </div>

        <div>
          <label className={LABEL}>Passwort {REQ}</label>
          <input type="password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password" placeholder="Mindestens 10 Zeichen" className={DS_INPUT} />
          <p className="mt-1 text-xs text-slate-400">Mindestens 10 Zeichen.</p>
        </div>

        <label className="mt-1 flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="accent-[#01A497] w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-[13px] text-neutral-500 leading-relaxed">
            Ich akzeptiere die{" "}
            <Link href="/agbs" className="underline hover:text-slate-900">AGB</Link> und die{" "}
            <Link href="/datenschutz" className="underline hover:text-slate-900">Datenschutzerklärung</Link>. {REQ}
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="btn-brand py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? "Wird erstellt…" : "Konto erstellen"}
        </button>
      </form>
    </AuthShell>
  );
}
