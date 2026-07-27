import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/auth/redirect";

// Handles the PKCE / code-exchange callback (used if the default
// {{ .ConfirmationURL }} template or OAuth is configured).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next"), "/");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.schema("v2").rpc("claim_submissions");
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/anmelden?fehler=bestaetigung", request.url));
}
