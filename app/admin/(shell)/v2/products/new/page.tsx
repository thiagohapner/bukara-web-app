import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import V2ProductEditClient from "../[id]/V2ProductEditClient";
import type { V2Category } from "@/lib/v2/types";

export const dynamic = "force-dynamic";

export default async function V2ProductNewPage() {
  const [allCatRes, matTypeRes, allProductsRes] = await Promise.all([
    supabaseAdminV2.from("categories").select("id, name, slug, parent_id").order("name"),
    supabaseAdminV2.from("material_types").select("name").order("name"),
    supabaseAdminV2.from("products").select("id, base_name, display_name").eq("is_active", true).order("base_name"),
  ]);

  return (
    <V2ProductEditClient
      productId={null}
      initialData={{
        product: null,
        categoryIds: [],
        applicationTags: [],
        materials: [],
        skus: [],
        allCategories: (allCatRes.data ?? []) as V2Category[],
        materialTypeNames: ((matTypeRes.data ?? []) as { name: string }[]).map((m) => m.name),
        accessories: [],
        allProducts: ((allProductsRes.data ?? []) as Array<{ id: string; base_name: string | null; display_name: string | null }>).map((p) => ({
          id: p.id,
          name: p.display_name ?? p.base_name ?? p.id,
        })),
      }}
    />
  );
}
