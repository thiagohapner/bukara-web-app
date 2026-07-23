import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeVoucherCode, type VoucherValidation } from "@/lib/vouchers";

/** One cart line reduced to what the validation RPC needs for scope/min/stacking. */
export type VoucherItem = {
  product_id: string | null;
  series: string | null;
  line_net: number;
  on_deal: boolean;
};

type CartRow = { sku_id: string | null; v2_sku_id: string | null; deal_id: string | null; quantity: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMap = Record<string, any>;

const round = (n: number) => Math.round(n * 100) / 100;

function seriesOf(v2Sku: AnyMap | undefined): string | null {
  const p = v2Sku?.product;
  const row = Array.isArray(p) ? p[0] : p;
  return row?.series ?? null;
}

/**
 * Price a single cart row identically to how the order total is computed in
 * `submitOrder` (campaign price honored, flat list price per unit; deal bundles
 * priced at 0 there). Keeping this shared guarantees the discount shown at
 * "apply" equals the discount recomputed at placement.
 */
export function priceVoucherRow(row: CartRow, v2Map: AnyMap, pubMap: AnyMap): VoucherItem {
  if (row.v2_sku_id) {
    const s = v2Map[row.v2_sku_id];
    const campaign = s?.campaign_price ?? null;
    const unit = campaign ?? s?.price_eur ?? 0;
    return { product_id: s?.product_id ?? null, series: seriesOf(s), line_net: round(unit * row.quantity), on_deal: campaign != null };
  }
  if (row.sku_id) {
    const s = pubMap[row.sku_id];
    // Mirror submitOrder: legacy public lines are priced at `price` (campaign only flags on_deal).
    const unit = s?.price ?? 0;
    return { product_id: null, series: null, line_net: round(unit * row.quantity), on_deal: (s?.campaign_price ?? null) != null };
  }
  // deal bundle line (mirrors submitOrder, which prices these at 0)
  return { product_id: null, series: null, line_net: 0, on_deal: true };
}

/** Load + price a cart's lines into VoucherItems (used by the applyVoucher action). */
export async function loadCartVoucherItems(
  admin: SupabaseClient,
  cartId: string,
): Promise<{ items: VoucherItem[]; subtotal: number }> {
  const { data: rows } = await admin
    .from("cart_items")
    .select("sku_id, v2_sku_id, deal_id, quantity")
    .eq("cart_id", cartId);
  const list = (rows ?? []) as CartRow[];

  const v2Ids = list.filter((r) => r.v2_sku_id).map((r) => r.v2_sku_id as string);
  const pubIds = list.filter((r) => r.sku_id).map((r) => r.sku_id as string);

  const [v2Res, pubRes] = await Promise.all([
    v2Ids.length
      ? admin.schema("v2").from("skus").select("id, product_id, price_eur, campaign_price, has_staffelpreis, product:products(series)").in("id", v2Ids)
      : Promise.resolve({ data: [] as AnyMap[] }),
    pubIds.length
      ? admin.from("skus").select("id, price, campaign_price").in("id", pubIds)
      : Promise.resolve({ data: [] as AnyMap[] }),
  ]);

  const v2Map = Object.fromEntries((v2Res.data ?? []).map((s: AnyMap) => [s.id, s]));
  const pubMap = Object.fromEntries((pubRes.data ?? []).map((s: AnyMap) => [s.id, s]));

  const items = list.map((row) => priceVoucherRow(row, v2Map, pubMap));
  const subtotal = round(items.reduce((s, i) => s + i.line_net, 0));
  return { items, subtotal };
}

/** Call the server-side `validate_voucher` RPC (single source of truth). */
export async function validateVoucherRpc(
  admin: SupabaseClient,
  code: string,
  email: string | null,
  items: VoucherItem[],
  bulkDiscount: number,
): Promise<VoucherValidation> {
  const { data, error } = await admin.rpc("validate_voucher", {
    p_code: normalizeVoucherCode(code),
    p_customer_email: email,
    p_items: items,
    p_bulk_discount: bulkDiscount,
  });
  if (error) return { valid: false, reason: "This code isn't valid." };
  return data as VoucherValidation;
}
