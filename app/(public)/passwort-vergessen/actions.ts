"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/auth/origin";

export type ResetState = { sent?: boolean; error?: string };

export async function requestReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Bitte geben Sie Ihre E-Mail-Adresse ein." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // Always respond neutrally regardless of whether the address exists — do not
  // leak account existence. We intentionally ignore the result.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/passwort-neu`,
  });

  return { sent: true };
}
