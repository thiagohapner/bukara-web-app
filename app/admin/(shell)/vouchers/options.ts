import { supabaseAdmin } from "@/lib/admin/supabaseAdmin";

export type ProductOption = { id: string; name: string };

/** v2 catalog products + distinct series, for the scope-target pickers. */
export async function loadVoucherOptions(): Promise<{ products: ProductOption[]; seriesList: string[] }> {
  const { data } = await supabaseAdmin
    .schema("v2")
    .from("products")
    .select("id, base_name, display_name, series")
    .order("base_name");

  const rows = data ?? [];
  const products = rows.map((p) => ({ id: p.id as string, name: (p.display_name as string) || (p.base_name as string) }));
  const seriesList = [...new Set(rows.map((p) => p.series as string | null).filter((s): s is string => !!s))].sort();
  return { products, seriesList };
}
