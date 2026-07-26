"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { authErrorToGerman } from "@/lib/auth/errors";

export type NewPwState = { error?: string };

export async function setNewPassword(_prev: NewPwState, formData: FormData): Promise<NewPwState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 10) {
    return { error: "Das Passwort muss mindestens 10 Zeichen lang sein." };
  }
  if (password !== confirm) {
    return { error: "Die Passwörter stimmen nicht überein." };
  }

  const supabase = await createClient();

  // The recovery link must have established a session (via /auth/bestaetigen).
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { error: "Die Sitzung ist abgelaufen. Bitte fordern Sie den Link erneut an." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: authErrorToGerman(error) };
  }

  redirect("/konto");
}
