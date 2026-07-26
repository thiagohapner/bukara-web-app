"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, type LoginState } from "./actions";
import AuthShell from "@/components/auth/AuthShell";
import { DS_INPUT } from "@/lib/ds";

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";

function AnmeldenForm() {
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/konto";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

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

        <button type="submit" disabled={pending}
          className="btn-brand py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {pending ? "Anmeldung läuft…" : "Anmelden"}
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
