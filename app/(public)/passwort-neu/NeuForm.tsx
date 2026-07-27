"use client";

import { useActionState } from "react";
import { setNewPassword, type NewPwState } from "./actions";
import { DS_INPUT } from "@/lib/ds";
import CtaArrow from "@/components/CtaArrow";

const LABEL = "block text-xs font-medium text-slate-500 mb-1.5";

export default function NeuForm() {
  const [state, formAction, pending] = useActionState<NewPwState, FormData>(setNewPassword, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={LABEL}>Neues Passwort</label>
        <input type="password" name="password" required minLength={10} autoComplete="new-password"
          placeholder="Mindestens 10 Zeichen" className={DS_INPUT} />
        <p className="mt-1 text-xs text-slate-400">Mindestens 10 Zeichen.</p>
      </div>

      <div>
        <label className={LABEL}>Neues Passwort bestätigen</label>
        <input type="password" name="confirm" required minLength={10} autoComplete="new-password"
          placeholder="Passwort wiederholen" className={DS_INPUT} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending}
        className="btn-black btn-arrow w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? "Wird gespeichert…" : "Passwort speichern"}
        {!pending && <CtaArrow />}
      </button>
    </form>
  );
}
