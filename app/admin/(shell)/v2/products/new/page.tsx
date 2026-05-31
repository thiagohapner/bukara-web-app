import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import V2ProductEditClient from "../[id]/V2ProductEditClient";
import type { V2Category } from "@/lib/v2/types";

export const dynamic = "force-dynamic";

export default async function V2ProductNewPage() {
  const [allCatRes, matTypeRes] = await Promise.all([
    supabaseAdminV2.from("categories").select("id, name, slug, parent_id").order("name"),
    supabaseAdminV2.from("material_types").select("name").order("name"),
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
      }}
    />
  );
}
