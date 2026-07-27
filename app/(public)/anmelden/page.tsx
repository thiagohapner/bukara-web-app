"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, type LoginState } from "./actions";
import AuthShell from "@/components/auth/AuthShell";
import SocialAuth from "@/components/auth/SocialAuth";
import { DS_INPUT } from "@/lib/ds";
import CtaArrow from "@/components/CtaArrow";

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";

function AnmeldenForm() {
  const params = useSearchParams();
  // Default post-login landing is the homepage (shoppable). A `redirectTo`
  // query param (e.g. from the middleware when a guarded page sent them here,
  // or from the account icon) still takes precedence.
  const redirectTo = params.get("redirectTo") ?? "/";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  // On success, do a full-page navigation so the header (browser Supabase
  // client) picks up the new session immediately — no manual reload needed.
  useEffect(() => {
    if (state.ok) window.location.assign(state.to ?? "/");
  }, [state]);

  return (
    <AuthShell
      title="Anmelden"
      subtitle="Melden Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort an."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="font-semibold text-brand-600 hover:text-brand-700">
            Konto erstellen
          </Link>
        </>
      }
    >
      <div className="mb-4">
        <SocialAuth />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label className={LABEL}>E-Mail</label>
          <input type="email" name="email" required autoComplete="email"
            placeholder="name@firma.de" className={DS_INPUT} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={LABEL + " mb-0"}>Passwort</label>
            <Link href="/passwort-vergessen" className="text-xs text-brand-600 hover:text-brand-700">
              Passwort vergessen?
            </Link>
          </div>
          <input type="password" name="password" required autoComplete="current-password"
            placeholder="Ihr Passwort" className={DS_INPUT} />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button type="submit" disabled={pending || state.ok}
          className="btn-black btn-arrow w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {pending || state.ok ? "Anmeldung läuft…" : "Anmelden"}
          {!(pending || state.ok) && <CtaArrow />}
        </button>
      </form>
    </AuthShell>
  );
}

export default function AnmeldenPage() {
  return (
    <Suspense>
      <AnmeldenForm />
    </Suspense>
  );
}
