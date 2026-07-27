"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestReset, type ResetState } from "./actions";
import AuthShell from "@/components/auth/AuthShell";
import { DS_INPUT } from "@/lib/ds";

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";

export default function PasswortVergessenPage() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(requestReset, {});

  if (state.sent) {
    return (
      <AuthShell title="Passwort zurücksetzen">
        <div className="rounded-sm border border-brand-100 bg-brand-25 p-5 text-sm text-slate-700 leading-relaxed">
          Falls ein Konto mit dieser Adresse existiert, haben wir eine E-Mail mit einem Link
          zum Zurücksetzen des Passworts gesendet.
        </div>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/anmelden" className="font-semibold text-brand-600 hover:text-brand-700">
            Zurück zur Anmeldung
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Passwort zurücksetzen"
      subtitle="Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen."
      footer={
        <Link href="/anmelden" className="font-semibold text-brand-600 hover:text-brand-700">
          Zurück zur Anmeldung
        </Link>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>E-Mail</label>
          <input type="email" name="email" required autoComplete="email"
            placeholder="name@firma.de" className={DS_INPUT} />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button type="submit" disabled={pending}
          className="btn-brand py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {pending ? "Wird gesendet…" : "Link senden"}
        </button>
      </form>
    </AuthShell>
  );
}
