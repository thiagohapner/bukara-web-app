import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign out via POST only (never a GET link, to avoid CSRF / prefetch logout).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so the browser issues a GET for the redirect target.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
