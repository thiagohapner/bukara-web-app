import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

async function getSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { toDelete, toUpsert } = await request.json() as {
    toDelete: string[];
    toUpsert: Record<string, unknown>[];
  };

  if (toDelete?.length) {
    const { error } = await supabaseAdmin.from("offer_items").delete().in("id", toDelete);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (toUpsert?.length) {
    const { error } = await supabaseAdmin
      .from("offer_items")
      .upsert(toUpsert, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
