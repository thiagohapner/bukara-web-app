import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import CategoryEditClient from "../[id]/CategoryEditClient";

export default async function NewCategoryPage() {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <CategoryEditClient
      categoryId={null}
      initialData={null}
      topLevelCategories={(data ?? []) as { id: string; name: string }[]}
    />
  );
}
