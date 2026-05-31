"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";

interface ProductPayload {
  slug: string;
  base_name: string;
  display_name: string;
  tagline: string;
  short_description: string;
  long_description: string;
  series: string;
  product_type: string;
  badge: string;
  gallery_bg: string;
  default_image_url: string;
  sort_order: number;
  is_active: boolean;
  has_public_page: boolean;
}

interface MaterialInput {
  id?: string;
  material_name: string;
  score: number;
  suitability: string;
  sort_order: number;
  _deleted?: boolean;
}

const SCORE_LABELS: Record<number, string> = {
  0: "Nicht geeignet",
  1: "Geeignet",
  2: "Gut geeignet",
  3: "Sehr gut geeignet",
};

export async function upsertProduct(
  productId: string | null,
  payload: ProductPayload,
  categoryIds: string[],
  applicationTags: string[],
  materials: MaterialInput[]
): Promise<{ id: string; product: Record<string, unknown> | null } | { error: string }> {
  try {
    const dbPayload = {
      slug: payload.slug,
      base_name: payload.base_name,
      display_name: payload.display_name || null,
      tagline: payload.tagline || null,
      short_description: payload.short_description || null,
      long_description: payload.long_description || null,
      series: payload.series || null,
      product_type: payload.product_type || null,
      badge: payload.badge || null,
      gallery_bg: payload.gallery_bg || null,
      default_image_url: payload.default_image_url || null,
      sort_order: payload.sort_order,
      is_active: payload.is_active,
      has_public_page: payload.has_public_page,
    };

    let pid = productId;
    if (!pid) {
      const { data, error: insertErr } = await supabaseAdminV2
        .from("products")
        .insert(dbPayload)
        .select("id")
        .single();
      if (insertErr) throw new Error(insertErr.message);
      pid = (data as { id: string }).id;
    } else {
      const { data: updated, error: updateErr } = await supabaseAdminV2
        .from("products")
        .update(dbPayload)
        .eq("id", pid)
        .select("*")
        .single();
      if (updateErr) throw new Error(updateErr.message);
      if (!updated) throw new Error("Update fehlgeschlagen – Produkt nicht gefunden");
    }

    await supabaseAdminV2.from("product_categories").delete().eq("product_id", pid);
    if (categoryIds.length > 0) {
      await supabaseAdminV2
        .from("product_categories")
        .insert(categoryIds.map((cid) => ({ product_id: pid, category_id: cid })));
    }

    await supabaseAdminV2.from("product_applications").delete().eq("product_id", pid);
    if (applicationTags.length > 0) {
      await supabaseAdminV2
        .from("product_applications")
        .insert(applicationTags.map((tag) => ({ product_id: pid!, tag })));
    }

    const toDelete = materials.filter((m) => m._deleted && m.id);
    if (toDelete.length > 0) {
      await supabaseAdminV2
        .from("product_materials")
        .delete()
        .in("id", toDelete.map((m) => m.id!));
    }
    const toUpsert = materials
      .filter((m) => !m._deleted)
      .map((m, i) => ({
        ...(m.id ? { id: m.id } : {}),
        product_id: pid,
        material_name: m.material_name,
        score: m.score,
        suitability: SCORE_LABELS[m.score] ?? m.suitability,
        sort_order: i,
      }));
    if (toUpsert.length > 0) {
      await supabaseAdminV2.from("product_materials").upsert(toUpsert);
    }

    revalidatePath("/admin/v2/products");
    if (pid) revalidatePath(`/admin/v2/products/${pid}`);

    // Re-fetch the saved product so the client can update state from DB truth
    const { data: saved } = await supabaseAdminV2
      .from("products")
      .select("*")
      .eq("id", pid!)
      .single();

    return { id: pid!, product: saved as Record<string, unknown> };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unbekannter Fehler" };
  }
}
