import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

const VALID_STATUSES = ["new", "confirmed", "invoiced", "shipped"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

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

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, status } = await request.json() as { orderId: string; status: OrderStatus };

  if (!orderId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
