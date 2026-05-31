"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

interface SkuPayload {
  product_id: string | null;
  merchant_sku: string | null;
  variant_label: string | null;
  diameter_mm: number | null;
  nl_mm: number | null;
  gl_mm: number | null;
  shank_mm: number | null;
  teeth: number | null;
  spin_direction: string | null;
  coating_or_type: string | null;
  price_eur: number;
  campaign_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  sort_order: number;
}

interface SpecInput {
  id?: string;
  spec_key: string;
  spec_value: string;
  spec_section: string;
  sort_order: number;
  _deleted?: boolean;
}

export async function updateSku(
  skuId: string,
  payload: SkuPayload,
  specs: SpecInput[]
): Promise<{ error?: string }> {
  try {
    const { error: skuErr } = await supabaseAdminV2
      .from("skus")
      .update(payload)
      .eq("id", skuId);
    if (skuErr) throw new Error(skuErr.message);

    const toDelete = specs.filter((s) => s._deleted && s.id && !s.id.startsWith("new-"));
    if (toDelete.length > 0) {
      await supabaseAdminV2
        .from("sku_specs")
        .delete()
        .in("id", toDelete.map((s) => s.id!));
    }

    const toUpsert = specs
      .filter((s) => !s._deleted)
      .map((s, i) => ({
        ...(s.id && !s.id.startsWith("new-") ? { id: s.id } : {}),
        sku_id: skuId,
        spec_key: s.spec_key,
        spec_value: s.spec_value,
        spec_section: s.spec_section,
        sort_order: i,
      }));
    if (toUpsert.length > 0) {
      await supabaseAdminV2.from("sku_specs").upsert(toUpsert);
    }

    revalidatePath(`/admin/v2/skus/${skuId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unbekannter Fehler" };
  }
}
