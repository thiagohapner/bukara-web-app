"use server";

import { createClient } from "@supabase/supabase-js";
import {
  cartTotals,
  BULK_DISCOUNT_THRESHOLD,
  BULK_DISCOUNT_PERCENT,
} from "@/lib/pricing";
import { validateVoucherRpc, type VoucherItem } from "@/lib/server/voucher";
import { normalizeVoucherCode } from "@/lib/vouchers";

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
      voucher: { code: string; discount: number } | null;
      emailItems: Array<{
        name: string;
        artikel_nr: string;
        variant_label: string | null;
        qty: number;
        unit_price: number;
        line_total: number;
      }>;
    };

const round = (n: number) => Math.round(n * 100) / 100;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function seriesOf(v2Sku: any): string | null {
  const p = v2Sku?.product;
  const row = Array.isArray(p) ? p[0] : p;
  return row?.series ?? null;
}

export async function submitOrder(
  cartId: string,
  form: OrderFormState,
  voucherCode?: string,
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
      ? admin.schema("v2").from("skus").select("id, price_eur, campaign_price, has_staffelpreis, variant_label, bukara_article_number, product_id, product:products(base_name, display_name, series)").in("id", v2Ids)
      : Promise.resolve({ data: [] as Array<{ id: string; price_eur: number; campaign_price: number | null; has_staffelpreis: boolean; variant_label: string | null; bukara_article_number: string; product_id: string | null; product: { base_name: string; display_name: string | null; series: string | null } | null }> }),
    publicIds.length
      ? admin.from("skus").select("id, price, campaign_price, variant_label, artikel_nr, product:products(name)").in("id", publicIds)
      : Promise.resolve({ data: [] as Array<{ id: string; price: number; campaign_price: number | null; variant_label: string | null; artikel_nr: string; product: { name: string } | null }> }),
  ]);

  const v2Map = Object.fromEntries((v2Result.data ?? []).map((s) => [s.id, s]));
  const pubMap = Object.fromEntries((pubResult.data ?? []).map((s) => [s.id, s]));

  const pricedItems = rows.map((row) => {
    if (row.v2_sku_id) {
      const sku = v2Map[row.v2_sku_id];
      // Honor an active campaign price as the base when present. Flat list price
      // per unit — per-quantity Staffelpreis tiers are not applied at charge time
      // (see lib/pricing/staffel.ts; tiered charging is a separate follow-up).
      const unit_price = sku?.campaign_price ?? sku?.price_eur ?? 0;
      return {
        unit_price,
        quantity: row.quantity,
        name: sku?.product?.display_name ?? sku?.product?.base_name ?? "Produkt",
        artikel_nr: sku?.bukara_article_number ?? "",
        variant_label: sku?.variant_label ?? null,
        product_id: sku?.product_id ?? null,
        series: seriesOf(sku),
        on_deal: sku?.campaign_price != null,
      };
    }
    const sku = pubMap[row.sku_id];
    return {
      unit_price: sku?.price ?? 0,
      quantity: row.quantity,
      name: sku?.product?.name ?? "Produkt",
      artikel_nr: sku?.artikel_nr ?? "",
      variant_label: sku?.variant_label ?? null,
      product_id: null as string | null,
      series: null as string | null,
      on_deal: row.deal_id != null || sku?.campaign_price != null,
    };
  });

  // Voucher: re-validate authoritatively against server-recomputed lines.
  const subtotal = round(pricedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0));
  const bulkDiscount = subtotal >= BULK_DISCOUNT_THRESHOLD ? round(subtotal * BULK_DISCOUNT_PERCENT) : 0;
  let voucherDiscount = 0;
  let voucherId: string | null = null;
  let voucherCodeNorm: string | null = null;

  if (voucherCode?.trim()) {
    const voucherItems: VoucherItem[] = pricedItems.map((p) => ({
      product_id: p.product_id,
      series: p.series,
      line_net: round(p.unit_price * p.quantity),
      on_deal: p.on_deal,
    }));
    const res = await validateVoucherRpc(admin, voucherCode, form.email, voucherItems, bulkDiscount);
    if (!res.valid) return { error: res.reason ?? "Der Gutscheincode ist ungültig." };
    voucherDiscount = res.discount ?? 0;
    voucherId = res.voucher_id ?? null;
    voucherCodeNorm = res.code ?? normalizeVoucherCode(voucherCode);
  }

  const totals = cartTotals(pricedItems, voucherDiscount);
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
    voucher_id: voucherId,
    voucher_code: voucherCodeNorm,
    voucher_discount: voucherDiscount > 0 ? voucherDiscount : null,
    status: "new",
    submitted_at,
  });

  if (orderError) return { error: "Bestellung konnte nicht gespeichert werden." };

  // Record the redemption (order already saved; a failure here is logged, not fatal).
  if (voucherId && voucherDiscount > 0) {
    const { error: redErr } = await admin.from("voucher_redemptions").insert({
      voucher_id: voucherId,
      order_id: orderId,
      customer_email: form.email.trim().toLowerCase(),
      discount_applied: voucherDiscount,
    });
    if (redErr) console.error("[voucher] redemption insert:", redErr.message);
  }

  const emailItems = pricedItems.map((item) => ({
    name: item.name,
    artikel_nr: item.artikel_nr,
    variant_label: item.variant_label,
    qty: item.quantity,
    unit_price: item.unit_price,
    line_total: item.unit_price * item.quantity,
  }));

  return {
    orderId,
    submitted_at,
    totals,
    voucher: voucherCodeNorm ? { code: voucherCodeNorm, discount: voucherDiscount } : null,
    emailItems,
  };
}
