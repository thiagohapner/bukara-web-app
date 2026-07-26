// Supabase returns English auth errors. Map the ones we surface to German.
// Prefer the stable `error.code` (supabase-js v2) and fall back to message
// matching for older/edge cases. Unknown errors get a generic German text.

type SupabaseAuthError = {
  code?: string;
  message?: string;
  status?: number;
} | null | undefined;

const GENERIC = "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.";

export function authErrorToGerman(error: SupabaseAuthError): string {
  if (!error) return GENERIC;

  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();

  // Wrong email/password combination.
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return "E-Mail-Adresse oder Passwort ist nicht korrekt.";
  }

  // Account exists but the email has not been confirmed yet.
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach.";
  }

  // Registration with an address that already has an account.
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("user already exists")
  ) {
    return "Für diese E-Mail-Adresse besteht bereits ein Konto.";
  }

  // Password too short / too weak (incl. leaked-password protection).
  if (
    code === "weak_password" ||
    msg.includes("password should be at least") ||
    msg.includes("password is too weak") ||
    msg.includes("pwned") ||
    msg.includes("compromised")
  ) {
    return "Das Passwort ist zu schwach. Bitte verwenden Sie mindestens 10 Zeichen.";
  }

  // Rate limiting (too many emails / attempts).
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error.status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  ) {
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  }

  // Reused reset/confirmation for password change with same value.
  if (code === "same_password" || msg.includes("should be different")) {
    return "Das neue Passwort muss sich vom bisherigen unterscheiden.";
  }

  return GENERIC;
}
