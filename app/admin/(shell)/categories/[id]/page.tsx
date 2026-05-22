import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";
import CategoryEditClient from "./CategoryEditClient";

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: category }, { data: topLevel }] = await Promise.all([
    supabaseAdmin.from("categories").select("*").eq("id", id).single(),
    supabaseAdmin.from("categories").select("id, name").is("parent_id", null).eq("is_active", true).order("sort_order"),
  ]);

  return (
    <CategoryEditClient
      categoryId={id}
      initialData={category}
      topLevelCategories={(topLevel ?? []) as { id: string; name: string }[]}
    />
  );
}
