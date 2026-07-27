import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

// Customer-facing order history.
//
// Orders are linked to a customer ONLY by e-mail (guest checkout writes the
// address the buyer typed; there is no user_id FK). We therefore scope every
// read to the e-mail of the *verified* session (auth.getUser(), which validates
// the JWT) — never to anything the client can influence. Reads use the
// service-role client because the `orders`/`cart_items` tables have no
// customer-facing RLS SELECT policy; the e-mail scoping below is the guard.

export type OrderStatus = "new" | "confirmed" | "invoiced" | "shipped";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Eingegangen",
  confirmed: "Bestätigt",
  invoiced: "Fakturiert",
  shipped: "Versendet",
};

export const ORDER_STATUS_CLASSES: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  invoiced: "bg-brand-25 text-brand-700",
  shipped: "bg-green-50 text-green-700",
};

export type OrderListItem = {
  id: string;
  submitted_at: string;
  status: string;
  total_gross: number;
};

export type OrderLineItem = {
  id: string;
  name: string;
  artikel_nr: string;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderDetail = {
  id: string;
  submitted_at: string;
  status: string;
  total_net: number | null;
  total_gross: number;
  voucher_code: string | null;
  voucher_discount: number | null;
  firmenname: string | null;
  ust_idnr: string | null;
  ansprechpartner: string | null;
  email: string | null;
  telefon: string | null;
  nachricht: string | null;
  items: OrderLineItem[];
};

async function sessionEmail(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

// Case-insensitive exact match on e-mail. `ilike` treats `%` and `_` as
// wildcards, and `_` is legal in an e-mail local part, so metacharacters are
// escaped to force a literal, case-insensitive equality (never a wildcard).
function ilikeLiteral(value: string): string {
  return value.replace(/([\\%_])/g, "\\$1");
}

export async function getMyOrders(): Promise<OrderListItem[]> {
  const email = await sessionEmail();
  if (!email) return [];

  const { data } = await supabaseAdmin
    .from("orders")
    .select("id, submitted_at, status, total_gross")
    .ilike("email", ilikeLiteral(email))
    .order("submitted_at", { ascending: false });

  return (data ?? []) as OrderListItem[];
}

export async function getMyOrder(id: string): Promise<OrderDetail | null> {
  const email = await sessionEmail();
  if (!email) return null;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select(
      "id, submitted_at, status, total_net, total_gross, voucher_code, voucher_discount, firmenname, ust_idnr, ansprechpartner, email, telefon, nachricht, cart_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) return null;
  // IDOR guard: the order must belong to the signed-in customer.
  if ((order.email ?? "").toLowerCase() !== email.toLowerCase()) return null;

  const items = await reconstructItems(order.cart_id as string | null);

  return {
    id: order.id,
    submitted_at: order.submitted_at,
    status: order.status,
    total_net: order.total_net,
    total_gross: order.total_gross,
    voucher_code: order.voucher_code,
    voucher_discount: order.voucher_discount,
    firmenname: order.firmenname,
    ust_idnr: order.ust_idnr,
    ansprechpartner: order.ansprechpartner,
    email: order.email,
    telefon: order.telefon,
    nachricht: order.nachricht,
    items,
  };
}

// Line items persist in cart_items (kept after checkout, keyed by cart_id) with
// the unit_price snapshotted at add-to-cart time. Items may reference a public
// sku, a v2 sku or a deal — mirror the split used at order time.
async function reconstructItems(cartId: string | null): Promise<OrderLineItem[]> {
  if (!cartId) return [];

  const { data: rows } = await supabaseAdmin
    .from("cart_items")
    .select(
      `id, quantity, unit_price, v2_sku_id,
       sku:skus!cart_items_sku_id_fkey(artikel_nr, variant_label, product:products(name)),
       selected_sku:skus!cart_items_selected_sku_id_fkey(artikel_nr, variant_label)`
    )
    .eq("cart_id", cartId)
    .order("added_at");

  if (!rows?.length) return [];

  const v2Ids = rows.map((r) => r.v2_sku_id).filter(Boolean) as string[];
  type V2Info = { variant_label: string | null; bukara_article_number: string | null; product: { base_name: string | null; display_name: string | null } | null };
  let v2Map: Record<string, V2Info> = {};

  if (v2Ids.length) {
    const { data: v2Rows } = await supabaseAdminV2
      .from("skus")
      .select("id, variant_label, bukara_article_number, product:products(base_name, display_name)")
      .in("id", v2Ids);
    v2Map = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v2Rows ?? []).map((s: any) => [
        s.id,
        {
          variant_label: s.variant_label ?? null,
          bukara_article_number: s.bukara_article_number ?? null,
          product: Array.isArray(s.product) ? (s.product[0] ?? null) : (s.product ?? null),
        } satisfies V2Info,
      ])
    );
  }

  return rows.map((r) => {
    const unit = r.unit_price ?? 0;
    if (r.v2_sku_id) {
      const v = v2Map[r.v2_sku_id];
      return {
        id: r.id,
        name: v?.product?.display_name ?? v?.product?.base_name ?? "Produkt",
        artikel_nr: v?.bukara_article_number ?? "",
        variant_label: v?.variant_label ?? null,
        quantity: r.quantity,
        unit_price: unit,
        line_total: unit * r.quantity,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sku = r.sku as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sel = r.selected_sku as any;
    return {
      id: r.id,
      name: sku?.product?.name ?? "Produkt",
      artikel_nr: sku?.artikel_nr ?? "",
      variant_label: sel?.variant_label ?? sku?.variant_label ?? null,
      quantity: r.quantity,
      unit_price: unit,
      line_total: unit * r.quantity,
    };
  });
}

// Short human-facing reference derived from the order UUID.
export function orderRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
