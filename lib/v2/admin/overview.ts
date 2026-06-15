// Server-only module: imported only by Server Components. Never import from a
// "use client" file — it carries the service-role client (lib/v2/supabaseAdmin).
import { supabaseAdminV2 } from "@/lib/v2/supabaseAdmin";
import {
  PAGE_SIZE,
  type OverviewParams,
  type OverviewResult,
  type SkuOverviewRow,
} from "./types";

const SORT_KEYS = new Set([
  "family_name",
  "bukara_article_number",
  "price_eur",
  "stock_quantity",
  "is_active",
]);

/**
 * Server-side query for the SKU-first variants overview, backed by the
 * v2.admin_sku_overview view. Handles pagination (50/page), sorting, trigram
 * search (Bukara- or Händler-number), and all list filters.
 */
export async function getSkuOverview(params: OverviewParams): Promise<OverviewResult> {
  const page = Math.max(1, params.page || 1);
  const sort = SORT_KEYS.has(params.sort) ? params.sort : "family_name";
  const ascending = params.dir !== "desc";
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Category filter: a SKU's category comes via its family (product_categories),
  // and products are only assigned to LEAF categories. So when a parent category
  // is selected we must expand to it + its children (2-level tree), otherwise a
  // parent would match zero products. Resolve product_ids first, then constrain.
  let categoryProductIds: string[] | null = null;
  if (params.categoryId) {
    const { data: kids } = await supabaseAdminV2
      .from("categories")
      .select("id")
      .eq("parent_id", params.categoryId);
    const catIds = [
      params.categoryId,
      ...((kids ?? []) as unknown as { id: string }[]).map((k) => k.id),
    ];
    const { data: pcs } = await supabaseAdminV2
      .from("product_categories")
      .select("product_id")
      .in("category_id", catIds);
    categoryProductIds = [
      ...new Set(((pcs ?? []) as unknown as { product_id: string }[]).map((r) => r.product_id)),
    ];
    if (categoryProductIds.length === 0) {
      return { rows: [], total: 0, page, pageSize: PAGE_SIZE, pageCount: 0 };
    }
  }

  let query = supabaseAdminV2
    .from("admin_sku_overview")
    .select("*", { count: "exact" });

  if (params.search && params.search.trim()) {
    const term = params.search.trim().replace(/[%,()]/g, "");
    query = query.or(
      `bukara_article_number.ilike.%${term}%,merchant_sku.ilike.%${term}%`,
    );
  }
  if (params.merchantId) query = query.eq("merchant_id", params.merchantId);
  if (categoryProductIds) query = query.in("product_id", categoryProductIds);
  if (params.status === "active") query = query.eq("is_active", true);
  if (params.status === "inactive") query = query.eq("is_active", false);
  if (params.missingPrice) query = query.is("price_eur", null);
  if (params.missingImage) query = query.is("thumbnail_url", null);
  if (params.unassigned) query = query.is("product_id", null);

  // Stable, deterministic ordering: primary sort + sku_id tiebreaker.
  query = query
    .order(sort, { ascending, nullsFirst: false })
    .order("sku_id", { ascending: true })
    .range(from, to);

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`getSkuOverview failed: ${error.message}`);
  }

  const total = count ?? 0;
  return {
    rows: (data ?? []) as unknown as SkuOverviewRow[],
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Merchant options for the scope selector (small reference table). */
export async function getMerchants(): Promise<{ id: string; name: string }[]> {
  const { data } = await supabaseAdminV2
    .from("merchants")
    .select("id, name")
    .order("name");
  return (data ?? []) as unknown as { id: string; name: string }[];
}

/**
 * Categories for the filter dropdown, ordered as a tree: each parent followed
 * by its children, with `depth` for indentation. Both parents and leaves are
 * selectable — the overview query expands a parent to its children.
 */
export async function getCategories(): Promise<
  { id: string; name: string; depth: number }[]
> {
  const { data } = await supabaseAdminV2
    .from("categories")
    .select("id, name, parent_id, sort_order")
    .order("sort_order")
    .order("name");
  const rows = (data ?? []) as unknown as {
    id: string;
    name: string;
    parent_id: string | null;
    sort_order: number;
  }[];

  const out: { id: string; name: string; depth: number }[] = [];
  const byId = new Set(rows.map((r) => r.id));
  for (const parent of rows.filter((r) => !r.parent_id || !byId.has(r.parent_id))) {
    out.push({ id: parent.id, name: parent.name, depth: 0 });
    for (const child of rows.filter((r) => r.parent_id === parent.id)) {
      out.push({ id: child.id, name: child.name, depth: 1 });
    }
  }
  return out;
}
