import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import { normalizeVoucherCode } from "@/lib/vouchers";

async function requireSession(request: NextRequest) {
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

type VoucherInput = {
  id?: string;
  code?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  scope?: string;
  scope_target_id?: string | null;
  min_order_value?: number | null;
  max_redemptions?: number | null;
  max_redemptions_per_customer?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  stackable_with_deals?: boolean;
  active?: boolean;
};

const num = (v: unknown): number | null =>
  v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v);

export async function POST(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as VoucherInput;

  const code = normalizeVoucherCode(body.code ?? "");
  const discount_type = body.discount_type === "fixed_amount" ? "fixed_amount" : "percentage";
  const discount_value = num(body.discount_value);
  const scope =
    body.scope === "product" || body.scope === "product_series" ? body.scope : "order";
  const scope_target_id = scope === "order" ? null : (body.scope_target_id?.trim() || null);

  // Validate the bits the DB can't phrase nicely.
  if (!code) return NextResponse.json({ error: "Code ist erforderlich." }, { status: 400 });
  if (discount_value == null || discount_value <= 0) {
    return NextResponse.json({ error: "Rabattwert muss größer als 0 sein." }, { status: 400 });
  }
  if (discount_type === "percentage" && discount_value > 100) {
    return NextResponse.json({ error: "Prozentrabatt darf höchstens 100 sein." }, { status: 400 });
  }
  if (scope !== "order" && !scope_target_id) {
    return NextResponse.json({ error: "Bitte ein Ziel für den Geltungsbereich wählen." }, { status: 400 });
  }
  if (!body.valid_until) {
    return NextResponse.json({ error: "Gültig bis ist erforderlich." }, { status: 400 });
  }

  const valid_from = body.valid_from || new Date().toISOString();
  if (new Date(body.valid_until).getTime() <= new Date(valid_from).getTime()) {
    return NextResponse.json({ error: "„Gültig bis“ muss nach „Gültig ab“ liegen." }, { status: 400 });
  }

  const payload = {
    code,
    description: body.description?.trim() || null,
    discount_type,
    discount_value,
    scope,
    scope_target_id,
    min_order_value: num(body.min_order_value),
    max_redemptions: num(body.max_redemptions),
    max_redemptions_per_customer: num(body.max_redemptions_per_customer),
    valid_from,
    valid_until: body.valid_until,
    stackable_with_deals: !!body.stackable_with_deals,
    active: body.active ?? true,
  };

  if (body.id) {
    const { error } = await supabaseAdmin.from("vouchers").update(payload).eq("id", body.id);
    if (error) return NextResponse.json({ error: friendly(error.message) }, { status: 400 });
    return NextResponse.json({ ok: true, id: body.id });
  }

  const { data, error } = await supabaseAdmin.from("vouchers").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: friendly(error.message) }, { status: 400 });
  return NextResponse.json({ ok: true, id: data!.id });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await request.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id fehlt." }, { status: 400 });

  const { count } = await supabaseAdmin
    .from("voucher_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("voucher_id", id);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Dieser Gutschein wurde bereits eingelöst und kann nicht gelöscht werden. Deaktivieren Sie ihn stattdessen." },
      { status: 409 },
    );
  }

  const { error } = await supabaseAdmin.from("vouchers").delete().eq("id", id);
  if (error) {
    // Foreign-key guard (race): a redemption was recorded between check and delete.
    return NextResponse.json(
      { error: "Dieser Gutschein kann nicht gelöscht werden. Deaktivieren Sie ihn stattdessen." },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}

function friendly(msg: string): string {
  if (/vouchers_code_key|duplicate key/i.test(msg)) return "Dieser Code ist bereits vergeben.";
  if (/vouchers_valid_range/i.test(msg)) return "„Gültig bis“ muss nach „Gültig ab“ liegen.";
  if (/vouchers_pct_max/i.test(msg)) return "Prozentrabatt darf höchstens 100 sein.";
  return msg;
}
