"use server";

import { createClient } from "@supabase/supabase-js";
import { unitPriceForQuantity, cartTotals } from "@/lib/pricing";

export type OrderFormState = {
  firmenname: string;
  ust_idnr: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  nachricht: string;
};

export type SubmitOrderResult =
  | { error: string }
  | {
      orderId: string;
      submitted_at: string;
      totals: ReturnType<typeof cartTotals>;
      emailItems: Array<{
        name: string;
        artikel_nr: string;
        variant_label: string | null;
        qty: number;
        unit_price: number;
        line_total: number;
      }>;
    };

export async function submitOrder(
  cartId: string,
  form: OrderFormState
): Promise<SubmitOrderResult> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: rows, error: cartError } = await admin
    .from("cart_items")
    .select("id, sku_id, v2_sku_id, deal_id, quantity")
    .eq("cart_id", cartId);

  if (cartError || !rows?.length) return { error: "Warenkorb ist leer." };

  const v2Ids = rows.filter((r) => r.v2_sku_id).map((r) => r.v2_sku_id as string);
  const publicIds = rows.filter((r) => r.sku_id).map((r) => r.sku_id as string);

  const [v2Result, pubResult] = await Promise.all([
    v2Ids.length
      ? admin.schema("v2").from("skus").select("id, price_eur, campaign_price, has_staffelpreis, variant_label, bukara_article_number, product:products(base_name, display_name)").in("id", v2Ids)
      : Promise.resolve({ data: [] as Array<{ id: string; price_eur: number; campaign_price: number | null; has_staffelpreis: boolean; variant_label: string | null; bukara_article_number: string; product: { base_name: string; display_name: string | null } | null }> }),
    publicIds.length
      ? admin.from("skus").select("id, price, variant_label, artikel_nr, product:products(name)").in("id", publicIds)
      : Promise.resolve({ data: [] as Array<{ id: string; price: number; variant_label: string | null; artikel_nr: string; product: { name: string } | null }> }),
  ]);

  const v2Map = Object.fromEntries((v2Result.data ?? []).map((s) => [s.id, s]));
  const pubMap = Object.fromEntries((pubResult.data ?? []).map((s) => [s.id, s]));

  const pricedItems = rows.map((row) => {
    if (row.v2_sku_id) {
      const sku = v2Map[row.v2_sku_id];
      // Honor an active campaign price as the base when present.
      const base = sku?.campaign_price ?? sku?.price_eur ?? 0;
      const unit_price = unitPriceForQuantity(base, sku?.has_staffelpreis ?? false, row.quantity);
      return {
        unit_price,
        quantity: row.quantity,
        name: sku?.product?.display_name ?? sku?.product?.base_name ?? "Produkt",
        artikel_nr: sku?.bukara_article_number ?? "",
        variant_label: sku?.variant_label ?? null,
      };
    }
    const sku = pubMap[row.sku_id];
    return {
      unit_price: sku?.price ?? 0,
      quantity: row.quantity,
      name: sku?.product?.name ?? "Produkt",
      artikel_nr: sku?.artikel_nr ?? "",
      variant_label: sku?.variant_label ?? null,
    };
  });

  const totals = cartTotals(pricedItems);
  const orderId = crypto.randomUUID();
  const submitted_at = new Date().toISOString();

  const { error: orderError } = await admin.from("orders").insert({
    id: orderId,
    cart_id: cartId,
    firmenname: form.firmenname,
    ust_idnr: form.ust_idnr || null,
    ansprechpartner: form.ansprechpartner,
    email: form.email,
    telefon: form.telefon || null,
    nachricht: form.nachricht || null,
    total_net: totals.net,
    total_gross: totals.gross,
    status: "new",
    submitted_at,
  });

  if (orderError) return { error: "Bestellung konnte nicht gespeichert werden." };

  const emailItems = pricedItems.map((item) => ({
    name: item.name,
    artikel_nr: item.artikel_nr,
    variant_label: item.variant_label,
    qty: item.quantity,
    unit_price: item.unit_price,
    line_total: item.unit_price * item.quantity,
  }));

  return { orderId, submitted_at, totals, emailItems };
}
