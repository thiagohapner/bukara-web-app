import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/auth/redirect";

// Handles email confirmation links that use the {{ .TokenHash }} template
// (signup confirmation, password recovery, email change).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      const fallback = type === "recovery" ? "/passwort-neu" : "/konto";
      const dest = safeRedirect(next, fallback);

      // On a confirmed signup / email change, attach earlier guest submissions.
      if (type !== "recovery") {
        await supabase.schema("v2").rpc("claim_submissions");
      }
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.redirect(new URL("/anmelden?fehler=bestaetigung", request.url));
}
