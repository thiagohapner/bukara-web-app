"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authErrorToGerman } from "@/lib/auth/errors";
import { safeRedirect } from "@/lib/auth/redirect";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirect(String(formData.get("redirectTo") ?? ""));

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

  redirect(redirectTo);
}
