"use server";

import { createClient } from "@supabase/supabase-js";
import { BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_PERCENT } from "@/lib/pricing";
import { loadCartVoucherItems, validateVoucherRpc } from "@/lib/server/voucher";

export type ApplyVoucherResult =
  | { ok: true; code: string; discount: number }
  | { ok: false; reason: string };

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Validate a voucher against the current cart (server-side, via the RPC) and
 * return the EUR discount to display. Re-checked authoritatively at placement.
 */
export async function applyVoucher(
  cartId: string,
  code: string,
  email?: string,
): Promise<ApplyVoucherResult> {
  if (!code.trim()) return { ok: false, reason: "This code isn't valid." };

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { items, subtotal } = await loadCartVoucherItems(admin, cartId);
  if (subtotal <= 0) return { ok: false, reason: "This code doesn't apply to the items in your cart." };

  const bulkDiscount = subtotal >= BULK_DISCOUNT_THRESHOLD ? round(subtotal * BULK_DISCOUNT_PERCENT) : 0;
  const res = await validateVoucherRpc(admin, code, email?.trim() ? email : null, items, bulkDiscount);

  if (!res.valid) return { ok: false, reason: res.reason ?? "This code isn't valid." };
  return { ok: true, code: res.code ?? code.trim().toUpperCase(), discount: res.discount ?? 0 };
}
