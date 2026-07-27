"use client";

import { useActionState } from "react";
import Link from "next/link";
import { changePassword, type ChangePwState } from "./actions";
import { DS_INPUT } from "@/lib/ds";

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";

export default function PasswortForm() {
  const [state, formAction, pending] = useActionState<ChangePwState, FormData>(changePassword, {});

  if (state.success) {
    return (
      <div>
        <div className="rounded-sm border border-brand-100 bg-brand-25 p-5 text-sm text-slate-700 leading-relaxed">
          Ihr Passwort wurde geändert.
        </div>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/konto" className="font-semibold text-brand-600 hover:text-brand-700">
            Zurück zur Übersicht
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <div>
        <label className={LABEL}>Aktuelles Passwort</label>
        <input type="password" name="current" required autoComplete="current-password"
          className={DS_INPUT} />
      </div>
      <div>
        <label className={LABEL}>Neues Passwort</label>
        <input type="password" name="password" required minLength={10} autoComplete="new-password"
          placeholder="Mindestens 10 Zeichen" className={DS_INPUT} />
        <p className="mt-1 text-xs text-slate-400">Mindestens 10 Zeichen.</p>
      </div>
      <div>
        <label className={LABEL}>Neues Passwort bestätigen</label>
        <input type="password" name="confirm" required minLength={10} autoComplete="new-password"
          className={DS_INPUT} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending}
        className="btn-brand py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? "Wird gespeichert…" : "Passwort ändern"}
      </button>
    </form>
  );
}
