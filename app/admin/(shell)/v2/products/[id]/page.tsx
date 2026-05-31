import { notFound } from "next/navigation";
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import V2ProductEditClient from "./V2ProductEditClient";
import type { V2Category } from "@/lib/v2/types";

export const dynamic = "force-dynamic";

export default async function V2ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [prodRes, catRes, appRes, matRes, skuRes, allCatRes, matTypeRes] = await Promise.all([
    supabaseAdminV2.from("products").select("*").eq("id", id).single(),
    supabaseAdminV2.from("product_categories").select("category_id").eq("product_id", id),
    supabaseAdminV2.from("product_applications").select("tag").eq("product_id", id),
    supabaseAdminV2.from("product_materials").select("*").eq("product_id", id).order("sort_order"),
    supabaseAdminV2
      .from("skus")
      .select("id, identnummer, variant_label, diameter_mm, price_eur, campaign_price, is_active, sort_order")
      .eq("product_id", id)
      .order("sort_order"),
    supabaseAdminV2.from("categories").select("id, name, slug, parent_id").order("name"),
    supabaseAdminV2.from("material_types").select("name").order("name"),
  ]);

  if (!prodRes.data) notFound();

  return (
    <V2ProductEditClient
      productId={id}
      initialData={{
        product: prodRes.data as Record<string, unknown>,
        categoryIds: ((catRes.data ?? []) as { category_id: string }[]).map((r) => r.category_id),
        applicationTags: ((appRes.data ?? []) as { tag: string }[]).map((r) => r.tag),
        materials: (matRes.data ?? []) as Array<{
          id: string; material_name: string; score: number;
          suitability: string; sort_order: number;
        }>,
        skus: (skuRes.data ?? []) as Array<{
          id: string; identnummer: string; variant_label: string | null;
          diameter_mm: number | null; price_eur: number; campaign_price: number | null;
          is_active: boolean; sort_order: number;
        }>,
        allCategories: (allCatRes.data ?? []) as V2Category[],
        materialTypeNames: ((matTypeRes.data ?? []) as { name: string }[]).map((m) => m.name),
      }}
    />
  );
}
