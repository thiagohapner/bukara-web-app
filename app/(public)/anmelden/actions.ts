"use server";

import { createClient } from "@/lib/supabase/server";
import { authErrorToGerman } from "@/lib/auth/errors";
import { safeRedirect } from "@/lib/auth/redirect";

export type LoginState = { error?: string; ok?: boolean; to?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  // Fall back to the homepage when no explicit return path was provided.
  const redirectTo = safeRedirect(String(formData.get("redirectTo") ?? ""), "/");

  if (!email || !password) {
    return { error: "Bitte geben Sie E-Mail und Passwort ein." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: authErrorToGerman(error) };
  }

  // Attach any earlier guest orders/inquiries made with this (now confirmed)
  // email to the account. The function reads the confirmed email itself and
  // no-ops if the address is unconfirmed, so this is safe to always call.
  await supabase.schema("v2").rpc("claim_submissions");

  // Return the target instead of redirect(): the client then performs a
  // full-page navigation so the browser Supabase client re-initialises from the
  // freshly set auth cookie and the header shows the logged-in state at once. A
  // server-side (soft) redirect would leave the client session stale — the user
  // would still see "Anmelden" in the header until a manual reload.
  return { ok: true, to: redirectTo };
}
