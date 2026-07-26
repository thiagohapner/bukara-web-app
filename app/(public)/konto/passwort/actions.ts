"use server";

import { createClient } from "@/lib/supabase/server";
import { authErrorToGerman } from "@/lib/auth/errors";

export type ChangePwState = { error?: string; success?: boolean };

export async function changePassword(_prev: ChangePwState, formData: FormData): Promise<ChangePwState> {
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current) return { error: "Bitte geben Sie Ihr aktuelles Passwort ein." };
  if (password.length < 10) return { error: "Das neue Passwort muss mindestens 10 Zeichen lang sein." };
  if (password !== confirm) return { error: "Die neuen Passwörter stimmen nicht überein." };
  if (password === current) return { error: "Das neue Passwort muss sich vom aktuellen unterscheiden." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email;
  if (!email) return { error: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an." };

  // Verify the current password server-side before changing it.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current });
  if (verifyError) return { error: "Das aktuelle Passwort ist nicht korrekt." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorToGerman(error) };

  return { success: true };
}
